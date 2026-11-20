# Tasks

## 1. Private rooms on the media viewer page

- [x] 1.1 Server page: a numeric folder id goes through the private-room check before the file settings or any file is read; a private target renders the not-available view, a missing path reports `onNotFound`, an unreadable one `onNoAccess`, and an alias such as `@my` skips the check (scenario "Media viewer aimed at a private folder"). Verify: `cd packages/sdk && pnpm exec vitest run src/app/media-viewer/page.test.tsx`.
- [x] 1.2 OAuth page: the same check in the client loader, with the same events. Verify: `cd packages/sdk && pnpm exec vitest run src/app/media-viewer/page.oauth.client.test.tsx`.
- [x] 1.3 Proxy: an invalid or expired link on `/media-viewer` keeps the page and names the event in a request header the client cannot set, instead of rewriting to the public room error pages (scenario "Invalid or expired link"). Verify: `cd packages/sdk && pnpm exec vitest run src/proxy.test.ts`; on the stand a bogus key gives `onAppReady` and `onNotFound`.

## 2. Visitors of an external link

- [x] 2.1 Server page: when the folder path is refused for want of an account (401) and the address carries a key, resolve the key with `GET files/share/{key}`; for a link that opens a whole room read that room with the key and render the not-available view when it is private; let the gallery open for a room without the private setting or a link to a folder or file inside a room; report `onNoAccess` when there is no key or the room cannot be read (design D1-D3). Replace the current pass-through for a 401 with a key. Verify: tests in `src/app/media-viewer/page.test.tsx` named after the scenarios of "Media viewer judges a link visitor by the room the link opens", run with `cd packages/sdk && pnpm exec vitest run src/app/media-viewer`; on the stand an anonymous visitor with the link of a public room still sees the images and one without a key gets `onNoAccess`.
- [ ] 2.2 Keep the pre-push gate green for the SDK package: `pnpm test:sdk`, plus tsc and Biome through the gate (`nx run-many -t tsc lint test`), and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`.

## Workflow follow-up

- `private-rooms-external-links` revisits design D2 before the SDK serves visitors of links into private rooms.
- Archive the change once task 2 is on the branch, after checking that the main spec describes the media viewer as it behaves.
