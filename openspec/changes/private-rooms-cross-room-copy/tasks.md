# Tasks

## 1. Destination room and planning

- [x] 1.1 Extract the folder path lookup of `resolveDropTarget` case (d) into `resolveFolderTarget(folderId)` in `packages/client/src/store/uploadDataStore/target.helpers.ts` and call it from `resolveDropTarget` (no behaviour change); verify with `cd packages/client && pnpm exec vitest run src/store/uploadDataStore/__tests__/target.helpers.test.ts` extended with direct cases for `resolveFolderTarget` (room path, plain folder, failed lookup rejects)
- [x] 1.2 Plan private transfers by room id (design D1, D2): replace `sourceRootFolderId` with `sourceRoomId` and `dest.roomId` in `planPrivateTransfer`, add the kinds `reencrypt-into` and `refuse-move-into`, treat a private destination with an unknown room as another room, and handle both kinds in `runPrivateTransferPlanImpl` (`copyMove.helpers.ts`); update the callers in `moveDragItemsImpl` and `HotkeyStore.ts` paste to pass room ids; verify with plan cases named after the scenarios "Paste into another private room", "Paste within the same private room" and "Folder copied to another private room" in `src/store/filesActionsStore/__tests__` and `src/store/__tests__/HotkeyStore.clipboard.test.ts`
- [ ] 1.3 Add `Common:CannotMoveToAnotherPrivateRoom` to `public/locales/en/Common.json`, run `/translate-comments` and `/translate-locales` for it; verify with `cd common/tests && npx vitest run test/locales.test.js`

## 2. Re-encrypting copy

- [ ] 2.1 Make `copyEncryptedFilesToFolderImpl` take the destination target resolved by `resolveFolderTarget` before unlock and decryption (design D3): encrypted for the destination room (`encryptionRoomId`), copy suffix only for a same-room copy at the room root, `Common:EncryptedCopyFailed` and nothing decrypted or uploaded when the lookup fails, and no `startUpload` for a private target without a room id; verify with cases named "Copy to another private room", "Copy from an archived private room", "Key wrapped for the destination room", "Destination room cannot be resolved" and "Identity locked" in `src/store/filesActionsStore/__tests__/FilesActionsStore.copyDelete.test.ts`
- [ ] 2.2 Wire the Copy dialog (`packages/client/src/components/FilesSelector/index.tsx` `onAccept`, `utils.ts` `getSelectorTransfer`): pass `privateRoomId` as the source room, resolve the destination room before planning, route `reencrypt-into` to the re-encrypting copy and `refuse-move-into` to its refusal; keep `pinnedRootId` for moves and the Create check of `getIsDisabled`; verify with cases named "Room without create right" and "Subfolder of another private room" in `src/components/FilesSelector/__tests__/utils.test.ts`

## 3. End-to-end

- [ ] 3.1 Let the private-room MSW handlers serve a second private room with different members, and its path through `files/folder/{id}/path`, mirroring the server DTOs already used by `privateRoomList.ts`; verify with the mock contract tests `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`
- [ ] 3.2 E2E: copy an encrypted file from an archived private room into an active private room in `packages/client/__tests__/private-room-archived.spec.ts`, and from one active private room into another in the private-room suite, asserting an encrypted upload session, DSE3 chunks only, and access entries written for the destination room's members only; verify with `cd packages/client && pnpm exec playwright test private-room-archived.spec.ts` and the new case in Docker
- [ ] 3.3 E2E: Ctrl+X in one private room and Ctrl+V in another shows `Common:CannotMoveToAnotherPrivateRoom` and sends no operation request, and the Move dialog of a private room offers only that room; verify with the Playwright cases named "Paste into another private room" and "Move dialog"

## 4. Integration

- [ ] 4.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-cross-room-copy` after review; the archive merges the MODIFIED clipboard requirement, which also retires the "server denies copying" rationale for Ctrl+C.
- The upload hardening change fixes the original-name leak of the upload conflict check for every private target, the cross-room copy included.
