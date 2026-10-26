# Design

## Context

See proposal.md for motivation. Observed state on the branch:

- The SDK has no reference to the client flag: `grep isPrivateRoomsEnabled packages/sdk/src` is empty; `packages/sdk/src/app/(private)/layout.tsx` mounts the private pages unconditionally. The client frames them from `packages/client/src/pages/E2eRooms/index.tsx:75` (`/sdk/private`, `/sdk/private/archive`) and that client page is itself gated. `private-rooms-sidebar-section` removes that page and its iframe: the client lists private rooms in its own Private section.
- Create menu inside a private room is filtered to `new-folder`, `separator-1`, `upload-files` in `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx:291-297`; the client creates documents through `packages/shared/services/private-room/encrypted-file-creation.ts`, which the SDK does not call.
- `packages/sdk/src/utils/translationLoaders.ts:43-51` builds the namespace map from `Common` only; the private surface renders `People:RemoveUser` and `UploadPanel:QuotaExceededTooltip` as raw keys.
- Forgot-passphrase and device-setup open `/profile/keys-management` with `window.open` (`packages/sdk/src/app/(private)/_store/EncryptionShell.tsx:67-70`, `_components/private-shell/DeviceSetupHintEffect.tsx:78`); that client route is built only when the client flag is set (`packages/client/src/routes/general.js:46`).
- `DeviceSetupHintEffect.tsx:54-87` keys on `hasConfiguredKey` alone; the context has no "keys loaded" signal, so the first render before the key list arrives can show the hint.
- Folder copy/move use the generic server operation (`packages/sdk/src/app/(docspace)/_hooks/useFileOperations.ts:403-432`), while file moves out of a room are decrypt-and-copy (`useEncryptedCopyMove.ts:253-284`). The server's copy/move operation applies its own private-room rule (`../server/products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:804-826`, called for folders at line 467 and for files at line 642): a transfer passes only when source and destination are inside the same private room and the operation is a move (`return entryParentRoom.Id.Equals(toFolderParentRoom.Id) && !copy;`), so every transfer into or out of a private room and every copy within one is refused. `FileSecurity.cs:1916-1922` also denies `Copy` and `CopyTo` for folders inside a private room. Only a folder move within the same private room runs on the server.
- `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts:41-60` explains why eight tests are `fixme`: a seeded session cookie (B), the crypto fixture in a real page (A/D), a multi-tab context (C) and the postMessage bridge (E). The crypto fixture already exists (`fixtures/crypto.ts`).
- The stashed checkpoint `docs/private-rooms/04-implementation-status.md` (2026-06-09) names two blockers for the remaining parity items: no render-test infrastructure in the SDK package and no bundling of non-Common namespaces. The first has since been resolved (unit tests exist under `(private)/_hooks/*.test.ts` and `_components/members/*.test.ts`); the second is still open.

## Goals / Non-Goals

**Goals:**
- One opt-in for both apps until release, controlled by the host.
- Feature parity for creation, archive, translations and folder safety.
- Turn the fixme tests into running tests so the surface is protected.

**Non-Goals:**
- Opening encrypted files in the editor from the SDK (`private-rooms-editor-contract`).
- A full key-generation flow inside the SDK; the link-out stays.
- The frame postMessage bridge for unlock events (P2 in the stashed SDK plan).

## Decisions

**D1. Opt-in source: the `privateRooms` property of the frame configuration, with no separate fallback (decided 2026-10-22).**
- The host sets `privateRooms: true` in its frame configuration. That property is the only opt-in of the SDK private surface.
- The hand-typed `?privateRooms=1` fallback is dropped. Its only consumer was the client iframe of `/e2e-rooms`, which `private-rooms-sidebar-section` removed.
- How the property reaches the SDK:
  - The private pages load rooms on the server (`packages/sdk/src/app/(private)/private/page.tsx` calls `getRooms`), while `setConfig` reaches `SDKConfigProvider` only after the first render.
  - So the SDK JS has to write the property into the frame URL, as its builders already do for the other properties of each mode.
  - The private layout reads it from the request (`FILTER_HEADER`, as the forms and AI agents layouts read `showMenu`), and the client side also sees it in `setConfig`.
  - The URL parameter is therefore the transport of the frame property, not a second contract.
  - Navigation inside the SDK keeps it (decided 2026-10-26): the private pages build their internal URLs (`router.push` to a room, back to the list, the frame bridge's `router.replace`) through one helper that carries `privateRooms` over from the current URL, because each server page reads the opt-in from its own request. A session cookie set by the proxy was rejected: it would leak the opt-in to another host embedding the portal in the same browser session, and third-party cookies in frames may be blocked.
  - The check runs in the private layout and in every private server page before any request: Next.js renders a layout and its page in parallel, so a gate in the layout alone does not keep the page from loading rooms or keys.
- Both apps feed `isPrivateRoomsEnabled()` through an injectable source, so the shared utility stays the single truth.
- Dependency: the bundled `public/scripts/sdk/2.2.0/api.js` has no mode that builds a `/sdk/private` URL. The manager builder makes `{rootPath}{id}/filter`, and the other modes have fixed paths, so a host cannot open the private pages through the SDK JS yet. A `private` mode that writes `privateRooms` is needed in the separate sdk-js repository (task 1.5).
- Alternative: read the same localStorage key in the SDK origin. Rejected: the SDK may run on a different origin than the host, and localStorage is not shared across origins.
- At release both the client flag and this opt-in are deleted together (`private-rooms-release-gate`).

**D2. Keys-management deep link carries the opt-in.** This link is a different consumer from D1 and stays: the SDK opens a client page in a new top-level tab, where the browser-local flag may be missing. The client route table is built once per load from the flag; the link `/profile/keys-management?privateRooms=1` makes the client set the flag before building routes (one-line change in the client bootstrap), so the page renders even on a browser without the flag. When `window.open` is blocked or the client origin is unknown (`frameConfig` without a portal URL), the hint shows `Common:EncryptionKeysManagedInProfile` instead.

**D3. Document creation reuses the shared encrypted-creation service.** The SDK create menu calls the same empty-template encryption path the client uses, so the DSE3 output and the file naming are identical; PDF forms stay excluded (same decision as `private-rooms-ux-gaps`). Alternative: port the client store helper into the SDK store. Rejected: two implementations of the same crypto path.

**D4. Translations: move the few keys into Common.** The private surface uses under ten keys from `People`, `UploadPanel` and `Files`. Moving them (with `translate-stale` to confirm the other languages follow) is cheaper and safer than bundling three namespaces into the SDK, which would grow every host page. If more keys are needed later, bundle the namespace then.

**D5. Folder transfers across rooms are withheld, not re-encrypted.** Re-encrypting a folder tree client-side is the same work as the decrypted folder download plus upload, and the client itself withholds folder moves out of a private room. Same-room moves stay server-side (wraps are per file, unaffected by the path: the server keys access entries by tenant, file and user, with no folder). Same-room folder copy is refused by the server today (see Context), so the SDK cannot keep it "server-side"; how the SDK presents it is open (see Open Questions). Alternative: implement tree re-encryption. Deferred until a user asks for it.

**D6. Hint gating uses a loaded signal from the encryption context.** The context exposes `keysLoaded` (true once the envelope list request settled, success or failure); the hint and the create-key auto-prompt key on `keysLoaded && !hasConfiguredKey`. This also fixes the stashed checkpoint's F-3 item (empty list on a network error) without a separate state machine.

**D8. The client in a manager frame takes the same host opt-in.**
- `private-rooms-sidebar-section` (D15 there) makes the Private section work inside an embedded frame under the browser-local flag. A frame on another site gets partitioned storage in Chromium, so that flag rarely reaches it.
- The client therefore also accepts `privateRooms: true` from the frame configuration as the opt-in while it runs in a frame. One host-side switch then serves both the manager frame and the SDK private pages.
- The configuration arrives through `setConfig` after the page loads (`pages/Home/Hooks/useSDK.js:98-101` → `SettingsStore.setFrameConfig`). The opt-in captured when `AppsStore` is constructed cannot see it. The availability predicate therefore takes the frame property as a second input, read once when the configuration arrives. Task 1.4 checks that the first list request in a frame waits for it, so a framed Rooms list never loads unscoped and then flips.
- The manager mode's routes need no change; the host opens the section with the root path `/private/`.

**D7. E2E: seed the session and reuse the crypto fixture.** The SDK Playwright base fixture gains a seeded `asc_auth_key` cookie and the pre-serialised identity from `fixtures/crypto.ts`; seven of the eight fixme tests then run (unlock, upload, download, preview, duplicate, copy/move cross-room, copy-out blocked, invite). The editor-open test stays `fixme` with a reference to `private-rooms-editor-contract`.

## Risks / Trade-offs

- [A host forgets to pass the opt-in and reports the feature as missing] → the not-available view shows Common:UnderDevelopment, and the SDK names the `privateRooms` configuration property in a console message for the host developer; no new locale key (decided 2026-10-26).
- [Moving locale keys breaks client call sites] → `translate-stale` and the locale tests run in the same task group; call sites are updated by the same change.
- [Seeded cookie in SDK E2E drifts from the real login flow] → the cookie only unblocks the private tests; login itself is covered by the login package tests.

## Migration Plan

Ships behind the opt-in; no data migration. Removing the opt-in later is part of `private-rooms-release-gate`.

## Open Questions

- Folder copy within the same private room: the server refuses it (copy is never allowed with a private-room source). Options: withhold the action in the SDK with a localized message, implement a client-side re-encrypting copy, or ask the backend to allow same-room copy (the copied files would carry no access entries, since the server cannot create wraps). Owner: product owner. The delta spec covers same-room move and cross-room transfers only until this is decided.
- Whether the host should also be able to pass a pre-unlocked identity (postMessage bridge). Does not change this design; tracked in the stashed SDK plan as P2.
