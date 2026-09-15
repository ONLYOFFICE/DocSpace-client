---
paths:
  - "packages/client/index.html"
  - "packages/shared/utils/link-preview.ts"
  - "packages/shared/components/link-preview-meta/**"
  - "packages/login/src/app/link-preview/**"
---

# Link previews in messengers (Open Graph / Twitter Card)

When a portal link is pasted into Telegram, Slack, WhatsApp, Discord or
LinkedIn, the messenger sends an **anonymous, JavaScript-free** crawler and
renders a card out of the `<head>` markup it gets back. Two consequences drive
the whole design:

- Nothing set by React at runtime is ever seen. Only markup returned by the
  server counts — the SSR apps (`login`, `doceditor`) or nginx.
- The crawler has no cookies and no token. The preview endpoint is the one
  place in the product that cannot check permissions.

## Where the tags come from

| Surface | How |
|---------|-----|
| `login`, `doceditor` | `<LinkPreviewMeta>` in the root layout, values from `getLinkPreview()` |
| `client` (the Vite SPA shell) | nginx routes preview crawlers to `/login` — see below |
| `management` | no preview |

`management` has no card and cannot get one by adding `<LinkPreviewMeta>` to its
layout: that layout redirects to `/error/403` when there is no user, and a
crawler is always anonymous, so it never reaches the head. It also sits behind
its own `location /management`, which the crawler rewrite in `location /` does
not cover. Giving it a preview means an anonymous branch in the layout — a
deliberate decision, not a one-liner.

`packages/client/index.html` must **not** carry OG tags. It is a static file
processed by `config/plugins/html-transform.ts` at build time, so anything put
there is frozen ONLYOFFICE branding and would be wrong for every rebranded
portal. Its `<title>ONLYOFFICE</title>` stays only because the browser needs
something before hydration.

## Whitelabel correctness is structural

Every value on the card comes from the portal itself, so there is no
"is this portal rebranded?" check anywhere and none is needed:

- **title** — `logoText` from the anonymous `/api/2.0/settings` response,
  falling back to `getBrandName("OrganizationName")`.
- **description** — `Common:LinkPreviewDescription`, localized, with the same
  `logoText` fed in as `{{organizationName}}`.
- **image** — `/login/link-preview` rasterizes the portal's own
  `logo.ashx?logotype=2` (`WhiteLabelLogoType.LoginPage`) with sharp onto a
  white 1200x630 canvas.

Do not add `og:site_name` or `og:url`. Telegram shows `og:site_name` instead of
the host, which duplicates `og:title`.

The description is read out of the translations map, but it **must still be
called through a `t("Common:…", { … })` literal** — `common/tests`'
`UselessTranslationKeysTest` finds keys only through a fixed set of regexes, so
a key that is merely indexed into the map counts as unused and fails the
pre-push gate. That is what `createTranslator` in
`packages/shared/utils/link-preview.ts` exists for.

Fall back per key, not per locale: a locale file that exists but lacks the key
must still produce an English description.

## The image URL carries the logo version

`og:image` is emitted as `/login/link-preview?v=<hash>`, where the hash comes
from the login-page entry of the anonymous `/settings/whitelabel/logos`
response (`getLinkPreviewImageVersion`). The backend puts it there itself: for
an uploaded logo it is the file's ETag (`BaseStorage.GetUrlWithHashAsync`), for
the default logo the product version — so it changes exactly when the picture
does.

The route ignores `v`; it exists for the messengers. Telegram binds an image to
a page at the first crawl and does **not** re-download it on a later refresh
(including a forced one through @WebpageBot) while its URL is unchanged. With a
fixed URL a portal that was crawled before rebranding kept showing the default
logo forever, with no way to fix it. Keep the parameter, and never replace the
hash with anything that does not change on upload. The `$cache_control` regex
in nginx matches the path with the query string, so caching is unaffected.

## The nginx side (`../buildtools`)

`config/nginx/onlyoffice.conf` has a `map $http_user_agent $link_preview_bot`
listing the crawler UAs, and `location /` rewrites those requests to `/login`
so they reach the SSR head. Regular users are untouched.

Two things must stay true in that file:

- The crawler regex matches crawler tokens only. A substring shared with a
  messenger's in-app browser (`Viber` matches `ViberUrlDownloader` *and* the
  Viber webview) sends real users to the login page on every portal link.
- The image path keeps its own `$cache_control` entry. `location /login` does
  `proxy_hide_header Cache-Control` and re-adds the value from
  `map $request_uri`, so the header the route sets is discarded; without the
  entry every crawler hit re-fetches the logo and re-runs sharp on an endpoint
  that is anonymous and unthrottled.

## Security

The image route's **internal** fetch must never take its origin from
`getBaseUrl()`. That helper builds the URL out of `x-forwarded-proto` and
`x-forwarded-host`, and nginx passes a client-supplied `X-Forwarded-Host`
straight through (`map $http_x_forwarded_host $proxy_x_forwarded_host`), so the
route would fetch whatever host the caller names and hand the body to sharp —
an SSRF primitive on an endpoint that needs no session. The origin comes from
`API_HOST`, which every real deployment sets (`install/docker/.env`); without
it the route returns 404 in production and only falls back to `getBaseUrl()` in
development. `getBaseUrl()` stays in use for the public `og:image` URL, where
the value is just an address handed to the crawler.

The forwarded headers are still **sent on** that request, and must be: the
backend resolves the tenant from `x-forwarded-host`, so a fetch without them
returns the default portal's logo on a multi-tenant deployment and can fail a
tenant's IP restriction. The distinction is what the header is allowed to
decide — which tenant the backend answers for (fine, the login logo is public
either way) versus which host the login server connects to (not fine). Every
other SSR call does the same: `createRequest` forwards the incoming headers
wholesale and `proxy.ts` forwards these two explicitly.

The same forwarded-host trust exists across `login`/`doceditor`
(`getAPIUrl`, `createRequest`) and is tracked separately; fixing it belongs in
nginx (`proxy_set_header X-Forwarded-Host $this_host;`), not here.

Never derive preview text from a resource addressed by a guessable id.
`fileId` and `folderId` are sequential, so a title taken from them would leak
document names to anyone who can paste a URL. Content-derived previews are
acceptable only for URLs whose key is itself the secret — `/s/<key>`,
`/rooms/share?key=…`, `/share/preview/:id?share=…`.
