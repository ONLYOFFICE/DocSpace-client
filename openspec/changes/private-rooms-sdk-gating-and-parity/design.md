# Design

## Context

See proposal.md for motivation. Observed state on the branch:

- The SDK has no reference to the client flag: `grep isPrivateRoomsEnabled packages/sdk/src` is empty; `packages/sdk/src/app/(private)/layout.tsx` mounts the private pages unconditionally. The client frames them from `packages/client/src/pages/E2eRooms/index.tsx:75` (`/sdk/private`, `/sdk/private/archive`) and that client page is itself gated.
- Create menu inside a private room is filtered to `new-folder`, `separator-1`, `upload-files` in `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx:291-297`; the client creates documents through `packages/shared/services/private-room/encrypted-file-creation.ts`, which the SDK does not call.
- `packages/sdk/src/utils/translationLoaders.ts:43-51` builds the namespace map from `Common` only; the private surface renders `People:RemoveUser` and `UploadPanel:QuotaExceededTooltip` as raw keys.
- Forgot-passphrase and device-setup open `/profile/keys-management` with `window.open` (`packages/sdk/src/app/(private)/_store/EncryptionShell.tsx:67-70`, `_components/private-shell/DeviceSetupHintEffect.tsx:78`); that client route is built only when the client flag is set (`packages/client/src/routes/general.js:46`).
- `DeviceSetupHintEffect.tsx:54-87` keys on `hasConfiguredKey` alone; the context has no "keys loaded" signal, so the first render before the key list arrives can show the hint.
- Folder copy/move use the generic server operation (`packages/sdk/src/app/(docspace)/_hooks/useFileOperations.ts:403-432`), while file moves out of a room are decrypt-and-copy (`useEncryptedCopyMove.ts:253-284`).
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

**D1. Opt-in source: frame configuration property, query fallback (needs user confirmation).** The SDK reads `frameConfig.privateRooms === true` (host embedding) or `?privateRooms=1` (client iframe, which appends it when the client flag is set). Both feed `isPrivateRoomsEnabled()` through an injectable source so the shared utility stays the single truth. Alternative: read the same localStorage key in the SDK origin. Rejected: the SDK may run on a different origin than the host, and localStorage is not shared across origins. At release both the client flag and this opt-in are deleted together (`private-rooms-release-gate`).

**D2. Keys-management deep link carries the opt-in.** The client route table is built once per load from the flag; the link `/profile/keys-management?privateRooms=1` makes the client set the flag before building routes (one-line change in the client bootstrap), so the page renders even on a browser without the flag. When `window.open` is blocked or the client origin is unknown (`frameConfig` without a portal URL), the hint shows `Common:EncryptionKeysManagedInProfile` instead.

**D3. Document creation reuses the shared encrypted-creation service.** The SDK create menu calls the same empty-template encryption path the client uses, so the DSE3 output and the file naming are identical; PDF forms stay excluded (same decision as `private-rooms-ux-gaps`). Alternative: port the client store helper into the SDK store. Rejected: two implementations of the same crypto path.

**D4. Translations: move the few keys into Common.** The private surface uses under ten keys from `People`, `UploadPanel` and `Files`. Moving them (with `translate-stale` to confirm the other languages follow) is cheaper and safer than bundling three namespaces into the SDK, which would grow every host page. If more keys are needed later, bundle the namespace then.

**D5. Folder transfers across rooms are withheld, not re-encrypted.** Re-encrypting a folder tree client-side is the same work as the decrypted folder download plus upload, and the client itself withholds folder moves out of a private room. Same-room moves stay server-side (wraps are per file, unaffected by the path). Alternative: implement tree re-encryption. Deferred until a user asks for it.

**D6. Hint gating uses a loaded signal from the encryption context.** The context exposes `keysLoaded` (true once the envelope list request settled, success or failure); the hint and the create-key auto-prompt key on `keysLoaded && !hasConfiguredKey`. This also fixes the stashed checkpoint's F-3 item (empty list on a network error) without a separate state machine.

**D7. E2E: seed the session and reuse the crypto fixture.** The SDK Playwright base fixture gains a seeded `asc_auth_key` cookie and the pre-serialised identity from `fixtures/crypto.ts`; seven of the eight fixme tests then run (unlock, upload, download, preview, duplicate, copy/move cross-room, copy-out blocked, invite). The editor-open test stays `fixme` with a reference to `private-rooms-editor-contract`.

## Risks / Trade-offs

- [A host forgets to pass the opt-in and reports the feature as missing] → the not-available view names the configuration property; the client iframe always passes it.
- [Moving locale keys breaks client call sites] → `translate-stale` and the locale tests run in the same task group; call sites are updated by the same change.
- [Seeded cookie in SDK E2E drifts from the real login flow] → the cookie only unblocks the private tests; login itself is covered by the login package tests.

## Migration Plan

Ships behind the opt-in; no data migration. Removing the opt-in later is part of `private-rooms-release-gate`.

## Open Questions

- Whether the host should also be able to pass a pre-unlocked identity (postMessage bridge). Does not change this design; tracked in the stashed SDK plan as P2.
