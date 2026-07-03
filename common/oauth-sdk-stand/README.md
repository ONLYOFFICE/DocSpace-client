# DocSpace SDK OAuth stand

Self-configuring test bench for the [DocSpace JS SDK](https://github.com/ONLYOFFICE/docspace-sdk-js)
OAuth flow against a locally running portal. Zero npm dependencies — plain
Node, plain HTML.

It exists to prove that a third-party integrator's app can authenticate
entirely via OAuth Bearer tokens — no portal cookie, no special access — the
same way any external SDK consumer would. Unlike the old manual stand, this
one talks to the portal itself: it checks availability, creates (or reuses)
an OAuth2 client, registers its own redirect URI / origins / CSP entry, runs
the authorization-code flow, and then demonstrates every SDK mode using the
Bearer token alone.

## Requirements

- Node.js >= 24
- The portal running locally via `pnpm start` (the `sdk` app is required for
  personal / forms / selectors and is not part of `start:lite`)
- Portal and stand both reachable on the `localhost` host (see step 4 below —
  this is what lets the stand wipe the portal's cookies after login)
- A portal admin/owner account without SMS/TFA enabled

## Run

```bash
cd common/oauth-sdk-stand   # from the repo root
node server.mjs             # or: npm start / pnpm start
```

Then open `http://localhost:8888` and follow the wizard.

All configuration is optional — copy `.env-example` to `.env` to override:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORTAL_URL` | `http://localhost:8092` | portal to test against |
| `PORT` | `8888` | stand's own port |
| `DEFAULT_LOGIN` | *(empty)* | email prefilled on the sign-in form |
| `EXTRA_CSP_ORIGINS` | `http://localhost:5001` | comma-separated origins registered in the portal CSP list besides the stand itself; the default is the Vite dev server the client SPA loads its scripts from — without it a CSP-enforcing portal blocks the `manager` mode in dev |

## What the wizard does

1. **Availability** — portal API (`/api/2.0/settings`), OAuth discovery
   (`/.well-known/openid-configuration`) and the SDK bundle
   (`/static/scripts/sdk/<version>/api.js`, proxied to the page as `/api.js`,
   so the demo always runs the build the portal actually serves).
2. **Portal sign-in** — `POST /api/2.0/authentication`, then a short-lived
   `x-signature` JWT (`GET /api/2.0/security/oauth2/token`) for the identity
   API. Credentials never leave the stand backend. On an admin account the
   stand immediately registers its CSP origins (the stand itself plus
   `EXTRA_CSP_ORIGINS`) in the portal SDK CSP list; accounts with SMS/TFA
   are not supported.
3. **OAuth client** — the portal returns the client secret exactly once (at
   creation), so pre-existing clients are unusable for the confidential flow
   and the stand always works with its own: it creates a fully
   auto-configured client — redirect URI
   `http://localhost:<port>/auth/callback`, allowed origins, scopes of your
   choice, logo/URL stubs, plus the stand origin is added to the portal SDK
   CSP list (admin only). Stand-created clients (and their secrets) are
   remembered in `state.json`, survive restarts, can be reused (**Use**) and
   **deleted** from the stand (the CSP entry is removed with the last one).
   Clients created by anything else are never listed or touched.
4. **Authorize** — classic confidential authorization-code flow with a strict
   `state` check. You sign in on the portal and pass the consent screen; the
   backend exchanges the code (`client_secret_post`) and keeps the
   access/refresh tokens server-side (refresh with rotation). **Right after
   the exchange the stand wipes the portal cookies for `localhost`**
   (`asc_auth_key`, `x-signature`, consent helpers) — this is why both apps
   must share the `localhost` host: cookies ignore ports, so the stand can
   delete the portal's host-only cookies, proving that everything below runs
   on the OAuth token, no Incognito needed. `Probe` / `Introspect` show the
   token claims.
5. **SDK demo** — all 11 init modes (manager, personal, selectors, editor,
   viewer, uploader, forms, chat, public-room, system), the full event log
   (including `onAuthError` / `onTokenExpired`), and instance methods
   (getUserInfo, getFiles/getFolders/getList, getRooms, createFile/Folder/Room,
   setListView, …). The SDK gets tokens via `getToken() -> /api/token`; the
   client secret and refresh token never reach the browser.

## Files

| Path | Purpose |
|------|---------|
| `server.mjs` | HTTP server: static, stand API, OAuth callback + cookie wipe |
| `lib/portal.mjs` | Portal REST client: health, sign-in, identity API, CSP |
| `lib/oauth.mjs` | Authorize URL, code exchange, refresh/rotate, revoke, introspect |
| `lib/state.mjs` | `state.json`: stand-created clients (+ secrets), CSP flag |
| `public/` | Wizard UI (`index.html`, `app.js`, `styles.css`) |

`state.json` stores client secrets in plain text — acceptable for a local dev
tool, which is why it is gitignored together with `.env`.

## Notes

- The identity `x-signature` JWT lives 5 minutes; the stand refreshes it
  automatically before management calls.
- Scopes are always fetched from the portal (`GET /api/2.0/oauth2/scopes`) —
  never hardcoded, since portals differ (`accounts:*` vs `contacts:*`).
- The token endpoint only supports `client_secret_post`; PKCE is optional
  per-client and not used by this confidential stand.
- If the frame is blocked by CSP and you cannot add the origin (not an
  admin), untick `checkCSP` and add the origin later via
  DevTools → JavaScript SDK.
