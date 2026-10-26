# Proposal

## Why

The embeddable SDK carries its own private-rooms surface (`/sdk/private*`, also framed by the client's "E2E rooms" app until `private-rooms-sidebar-section` replaces it with a native Private section) that was built to parity with the client in June 2026 and then stopped at a checkpoint (stashed `docs/private-rooms/04-implementation-status.md`). It ignores the client's opt-in flag, so the hidden feature is reachable in production through the SDK; it cannot create documents, cannot reach key management, loses translations outside Common, and runs folder operations without re-encryption awareness. Eight of its end-to-end tests are `test.fixme`. Releasing the client half without closing these gaps would ship two different products under one name.

## What Changes

- The SDK private surface honours an opt-in until release: the host sets `privateRooms: true` in its frame configuration and the SDK reads it; without it the private routes render the "not available" view. There is no separate query fallback, because its only consumer, the client's iframe, is gone with `private-rooms-sidebar-section`.
- The client running in an SDK manager frame takes the same `privateRooms` property as its opt-in, so one host-side switch enables private rooms in both kinds of frame.
- Create menu inside an SDK private room offers document, spreadsheet and presentation through the shared encrypted file creation (same rules as the client).
- The archive page is verified against the private-room rules: Share tab hidden, encrypted download path, key check, empty view.
- Key management becomes reachable from the SDK: the forgot-passphrase and device-setup links open the client keys-management page through a route that works while the client is flag-gated (the link carries the opt-in), and the SDK shows an in-place explanation when the client is not reachable from the host.
- The locale namespaces the private surface needs are available in the SDK, by moving the handful of `People`, `UploadPanel`, `Files` keys it uses into Common (preferred) or bundling those namespaces.
- Folder copy and move inside the SDK private surface go through re-encryption-aware logic for cross-room moves, or are withheld with a toast; same-room moves stay server-side. Same-room folder copy is refused by the server today (it allows only a move inside one private room); how the SDK handles it is an open decision recorded in design.md.
- Encrypted files follow the client's transfer rules: copy is offered although the server withholds the Copy right inside a private room, and a move into another private room is refused (design D10).
- The device-setup hint waits for the key list to load before deciding the user has no keys.
- The `test.fixme` SDK E2E tests that only lacked a logged-in session and the crypto fixture are enabled (unlock, upload, download, preview, duplicate, copy/move, copy-out blocked, invite); the editor-open test stays `fixme` until `private-rooms-editor-contract` lands.

Out of scope: opening encrypted files in the editor from the SDK (editor contract change), a full in-SDK key-generation flow (deferred; the link-out is kept), the frame postMessage bridge for unlock events. Decided with the user on 2026-10-22: the host passes the opt-in as the `privateRooms` property of the frame configuration, with no query fallback (design D1), and the client in a manager frame honours the same property (design D8).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/sdk-surface`: "No feature-flag gating in the SDK" → "SDK private surface honours the opt-in"; "Create menu inside a private room" (documents offered); "Folder operations use the server path" (cross-room moves re-encrypt or are withheld); "Copy and move destination resolved fail-closed" (copy offered for encrypted files, move into another private room refused); "Only the Common namespace is bundled" → "Translations needed by the private surface are bundled"; "Forgot passphrase and device setup link out to the client" (links work while gated); "Shell side effects" (hint waits for keys to load); new "Archive page follows private-room rules".
- `private-rooms/feature-gating`: "SDK private routes are not gated by the flag" → "SDK private routes honour the host opt-in"; new "Client in an embedded frame takes the host opt-in".

## Impact

- SDK: `packages/sdk/src/app/(private)/**` (layout, pages, private-shell effects, create-room and members components), `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx` (create menu), `packages/sdk/src/app/(docspace)/_hooks/useEncryptedCopyMove.ts` and file-operations hooks, `packages/sdk/src/utils/translationLoaders.ts`, `packages/sdk/src/proxy.ts` if the opt-in is read server-side.
- Client: `packages/client/src/routes/general.js` (keys-management deep link while gated); `AppsStore` and the frame configuration handling (`pages/Home/Hooks/useSDK.js`, `SettingsStore.setFrameConfig`) for the frame opt-in.
- Shared: `packages/shared/utils/privateRooms.ts` (a host-provided source for the flag), `packages/shared/services/private-room/encrypted-file-creation.ts` reused by the SDK.
- Locales: keys moved into Common and translated.
- Tests: SDK unit tests under `(private)`, `packages/sdk/__tests__/e2e/private/*.spec.ts`, client `private-rooms-hidden.spec.ts`.
- No server or Document Server dependency.
- External dependency: the separate sdk-js repository needs a `private` mode that builds `/sdk/private` and `/sdk/private/archive` URLs carrying `privateRooms`. The bundled `public/scripts/sdk/2.2.0/api.js` has none, so a host cannot open the private pages through the SDK JS today.
