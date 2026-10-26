# Tasks

## 1. Opt-in plumbing

- [x] 1.1 Confirm with the user the opt-in source (decided 2026-10-22: the `privateRooms` property of the frame configuration, no query fallback, design D1); verified by the decision recorded in design.md
- [x] 1.2 Add an injectable opt-in source to `packages/shared/utils/privateRooms.ts` (localStorage in the client, the frame configuration's `privateRooms` in the SDK: the URL parameter the SDK JS writes from it, read from the request in `packages/sdk/src/app/(private)/layout.tsx` and in each private server page, and `setConfig` on the client side), carry it over in the private pages' internal navigation (design D1), and render the not-available view (Common:UnderDevelopment, with a console message naming the property) without it; verify with new cases in `packages/shared/utils/privateRooms.test.ts` and an SDK unit test for the layout gate (`cd packages/sdk && pnpm exec vitest run "src/app/(private)"`)
- [x] 1.3 Make the client bootstrap honour `?privateRooms=1` for the keys-management deep link (design D2, not an SDK fallback); verify with a case in `packages/client/__tests__/private-rooms-hidden.spec.ts` that opens `/profile/keys-management?privateRooms=1` without the stored flag and sees the page render
- [x] 1.4 Make the client in a manager frame take `privateRooms: true` from the frame configuration as its opt-in (design D8): `AppsStore.isPrivateRoomsSectionAvailable` reads the frame property once the configuration has arrived, and the first framed list request waits for it; verify with `AppsStore` unit cases named "Host enables private rooms in a frame" and "Frame without the property", and a `useSDK`/fetch case asserting that no rooms request is sent before `setConfig`
- [ ] 1.5 Ask the sdk-js maintainers for a `private` mode that builds `/sdk/private` and `/sdk/private/archive` URLs carrying `privateRooms`, and record the agreed URL shape and the sdk-js version with its date in design.md; verified by that record (external, does not block 1.2-1.4)

## 2. Keys management reachability and hint gating

- [x] 2.1 Expose `keysLoaded` from `packages/shared/context/encryption/EncryptionContext.tsx` and gate `DeviceSetupHintEffect.tsx` and the create-key auto-prompt on it; verify with `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` and the SDK private-shell unit tests
- [x] 2.2 Point the forgot-passphrase and device-setup links at the deep link from 1.3 and show `Common:EncryptionKeysManagedInProfile` when the client origin is unknown; verify with SDK unit tests on `EncryptionShell.tsx` and `DeviceSetupHintEffect.tsx`

## 3. Document creation in SDK private rooms

- [x] 3.1 Offer document, spreadsheet and presentation in `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx` for private rooms when keys exist, calling `packages/shared/services/private-room/encrypted-file-creation.ts`; verify with a unit test on the private menu model and `cd packages/sdk && pnpm exec vitest run docs-layout`
- [x] 3.2 Enable the SDK E2E case for creating a document in a private room in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`; verify with `cd packages/sdk && pnpm exec playwright test e2e/private`

## 4. Archive page and folder transfers

- [x] 4.1 Apply the private-room rules to `packages/sdk/src/app/(private)/private/archive/**` (no Share tab, encrypted download path, key check, the archive empty view with its action leading back to the private rooms list); verify with SDK unit tests for the archive page and an E2E case in `private-rooms.spec.ts`
- [x] 4.2 Withhold cross-room folder copy/move in `packages/sdk/src/app/(docspace)/_hooks/useFileOperations.ts` with `Common:CannotTransferFolderFromPrivateRoom`, keeping same-room moves server-side; verify with `cd packages/sdk && pnpm exec vitest run useFileOperations useEncryptedCopyMove`
- [x] 4.3 Decide how the SDK handles a folder copy within the same private room, which the server refuses today (design.md Open Questions: withhold with a localized message, client-side re-encrypting copy, or a backend change); record the decision in design.md and, if it adds behaviour, add the scenario to the sdk-surface delta before implementing it (decided 2026-10-26: not offered, design D9; verify with the case "Folder copied within a private room" in `packages/sdk/src/app/(private)/_hooks/usePrivateRoomContextMenu.test.ts`)

## 5. Translations

- [x] 5.1 Move the `People`, `UploadPanel` and `Files` keys the private surface renders into Common, update the client and SDK call sites, run `translate-stale` and `translate-locales`, then `cd common/tests && npx vitest run test/locales.test.js`; verify green for all 31 languages and no raw key in the SDK private pages (unit test asserting translated text)

## 6. End-to-end coverage

- [x] 6.1 Seed the session cookie and the crypto fixture identity in `packages/sdk/__tests__/e2e/private/fixtures.ts` and remove `test.fixme` from unlock, upload, download, preview, duplicate, copy/move cross-room, copy-out and invite tests, leaving editor-open as `fixme` with a reference to `private-rooms-editor-contract`. The copy and move tests need the transfer rules of design D10: offer copy for encrypted files and refuse a move into another private room (`useItemContextMenu.ts`, `useContextMenuModel.ts`, `useFileOperations.ts`), and the SDK list must stop showing the last row an action removed (`(files)/_components/list/index.tsx`); verify with unit cases "Copy offered for an encrypted file" and "Move into another private room", a list case for the removed last row, and `cd packages/sdk && pnpm exec playwright test e2e/private`
- [x] 6.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, locale tests, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive the change after review; archiving applies the RENAMED operations to `sdk-surface` and `feature-gating`.
- `private-rooms-release-gate` removes the opt-in introduced here together with the client flag.
- Once `private-rooms-sidebar-section` is archived, add a MODIFIED "Section availability" of `private-rooms/sidebar-section` to this change, so the main spec names the frame opt-in of task 1.4 next to the browser-local flag.
