# private-rooms-upload-fail-closed

Refuse plaintext uploads, clipboard transfers and move-as-copy in private rooms.

## Handoff (2026-10-20, apply in progress, WIP committed on feature/private-rooms-specs)

Resume with `/opsx:apply private-rooms-upload-fail-closed`. `tasks.md` is the
source of truth for what is ticked; this section records the state of the
half-done tasks so nothing is redone or lost.

### Done and verified (ticked in tasks.md)

- 1.1 / 1.2 `resolveUploadGate` + `UPLOAD_REFUSAL_I18N_KEYS` in
  `packages/shared/services/private-room/encrypted-upload.ts`; gate test inverted
  (`upload-encryption-gate.test.ts`, 24 passing).
- 2.1 `chunkUpload.helpers.ts` uses the gate; refusal goes through the new
  `failUploadItem` helper (extracted from the prepare-failure catch);
  `cancelEncryptedBatchUploadImpl` now fails pending items with
  `Common:EncryptionLockedUpload` instead of cancelling them;
  `selectors.helpers.ts` `shouldEncryptCurrentUploadImpl` uses the gate.
  Tests: `UploadDataStore.encryption.test.ts` (21 passing).
- 2.2 New `packages/shared/services/encryption/device-setup-hint-notifier.ts`
  (register/clear/request, no session gate); `EncryptionProviderWrapper.jsx`
  registers the toast via `showDeviceSetupHint`; pipeline calls
  `requestDeviceSetupHint()` on a `no-key` refusal. Verified by the notifier
  unit test and the store test (not by a render test of the wrapper).
- 3.1 `createFoldersTreeImpl` (`selection.helpers.ts`) drops folder entries in a
  private room with `Common:FolderUploadNotSupportedInPrivateRoom`; test
  `FilesActionsStore.createFoldersTree.test.ts` (3 passing).

### In flight (NOT ticked)

- Locale keys added to `public/locales/en/Common.json` only:
  `EncryptionKeysRequiredForUpload`, `EncryptionLockedUpload`,
  `FolderUploadNotSupportedInPrivateRoom`, `EncryptedMovePartialFailure`.
  Still to do for 2.3 / 3.2 / 5.3: `/translate-comments`, `/translate-locales`,
  then `cd common/tests && npx vitest run test/locales.test.js`.
- 4.1 `planPrivateTransfer` (pure) and `runPrivateTransferPlanImpl` live in
  `copyMove.helpers.ts`, exported through `FilesActionsStore.planPrivateTransfer`
  / `runPrivateTransferPlan`; `moveDragItemsImpl` already uses them
  (`move` = every dragged item has `security.Move`). Missing: unit tests in
  `FilesActionsStore.copyDelete.test.ts` for every plan kind.
- 4.2 `HotkeyStore.copyToClipboard` records `hotkeysClipboardSource`
  (`inPrivateRoom`, `rootFolderId`). Missing: in `moveFilesFromClipboard`,
  before the `isPublic` check, build the plan with
  `filesActionsStore.planPrivateTransfer({ items: selections, sourceInPrivateRoom:
  hotkeysClipboardSource?.inPrivateRoom, sourceRootFolderId:
  hotkeysClipboardSource?.rootFolderId, dest: getSelectedFolder() })`, run it with
  `{ move: !isCopy }`, and on `true` clear the clipboard and return. No
  HotkeyStore test exists yet; create one with cast fakes (see unit-tests rule).
- 4.3 `FilesSelector/index.tsx` `onAccept`: the encrypted branch runs only for
  `isCopy`; a dialog "Move" of encrypted files currently falls through to the
  generic server move (worse than move-as-copy: ciphertext leaves the room).
  Replace both branches' private checks with the plan (`move: isMove`), dest from
  `selectedTreeNode` (+ `isInsidePrivateRoom`), keep the regular-file path.
- 5.1 `copyEncryptedFilesToFolderImpl` accepts `deleteSourceOnSuccess`, tags the
  decrypted file with `uploadContext.moveSource = { fileId, title }`
  (`MoveSourceRef` in shared `encrypted-upload.ts`) and uses the
  `EncryptedMovePartialFailure` toast in move mode. Missing: the consumer. Plan:
  `deleteMovedEncryptedSourceImpl(self, moveSource)` in
  `uploadDataStore/encryption.helpers.ts` calling `api.files.removeFiles([], [fileId],
  false, true)`, waiting with `self.loopFilesOperations(data, { operation:
  OPERATIONS_NAME.trash, operationId })`, then `self.filesStore.removeFiles([fileId])`;
  wire it in `UploadDataStore.tsx`; call it from `checkChunkUpload` in
  `chunkUpload.helpers.ts` inside `if (uploaded)` after the dataLayer push when
  `currentFileData.file?.uploadContext?.moveSource` is set; on failure toast
  `EncryptedMovePartialFailure` with the title. Also extend `UploadDestContext` in
  shared `encrypted-copy.ts` with `moveSource?: MoveSourceRef` (not done yet;
  `tagFileForCopy` currently receives the extra field through a structural type).
- 5.2 Drag path already passes `move`; dialog (4.3) and clipboard cut (4.2) still
  need to pass it.
- 2.4 / 5.4 E2E cases not written. Docker is available locally.
- 6.1 / 6.2 not run.

### Decisions taken during apply

- "Move" out of a private room deletes the source after its decrypted copy was
  uploaded (design.md decision 3), mirroring the SDK.
- Comment policy: specs own the what/why; code keeps at most a one-line
  `Spec: <capability>, "<requirement>"` pointer; test names carry scenario names
  (recorded in `openspec/config.yaml` and `.claude/rules/private-rooms.md`).
