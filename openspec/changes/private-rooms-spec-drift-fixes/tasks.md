# Tasks

Order: groups 1 to 3 are the P0 fixes, 4 to 6 the P1 fixes, 7 the P2
fixes, 8 the suspicions. One task is one commit with its tick (the
"Commits" paragraph of `openspec/config.yaml`).

## 1. Pins (P0)

- [ ] 1.1 Make `checkKey` in `packages/shared/services/encryption/tofu-store.ts` match only the most recent key of the record, so an accepted earlier key becomes the pin again only through `acceptKey` (design decision 1); replace the test "acceptKey appends; previously trusted keys stay trusted" with "Peer returns to an earlier key" and verify with `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/tofu-store.test.ts services/encryption/__tests__/room-file-access-tofu.test.ts`
- [ ] 1.2 Make the store tell a failed read from a missing record: `checkKey` answers a distinct result for a failed read and `acceptKey` writes nothing then; handle that result as a refused key change in `room-file-access.ts` (no decryption) and `packages/shared/services/private-room/member-key-verification.ts` (member skipped) (design decision 2); replace the test that expects `getRecord` to resolve `null` on a read error with "Pin cannot be read", and add the case to `room-file-access-tofu.test.ts` and a new `packages/shared/services/private-room/__tests__/member-key-verification.test.ts`; verify with `cd packages/shared && pnpm exec vitest run services/encryption services/private-room`

## 2. Duplicate outside the room (P0)

- [ ] 2.1 Reproduce on the stand whether an encrypted file listed in Recent offers Duplicate, and record the result (date, build) in design.md Context; the fix of 2.2 lands either way
- [ ] 2.2 Make `duplicateEncryptedFileImpl` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts`) pass the file's own section to the copy target instead of the open folder's (design decision 3); verify with a case "Duplicate started outside the room" in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.encryption.test.ts` asserting a private, encrypted target for a file of a private room opened from Recent, and `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`

## 3. SDK drops (P0)

- [ ] 3.1 In `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx`, let the drag context of a private page upload only through the page's override and only into a folder the user can create in, ignoring the drop otherwise (design decision 4); verify with cases "File dropped on a row of an archived room" and "File dropped without the create right" in `docs-layout/index.test.tsx` asserting that neither the generic upload nor the override runs, and `cd packages/sdk && pnpm exec vitest run docs-layout`

## 4. Owner change from the edit dialog (P1)

- [ ] 4.1 In `packages/client/src/components/panels/ChangeRoomOwnerPanel/index.js` run `getNewOwnerKeyRefusal` for a private room before handing the candidate back to the edit dialog, and confirm in the test that the panel opened from `EditRoomDialog` gets the edited room's id (design decision 5); verify with a case "Owner changed in the room's edit dialog" in `ChangeRoomOwnerPanel/__tests__/ChangeRoomOwnerPanel.privateRoom.test.tsx` and `cd packages/client && pnpm exec vitest run src/components/panels/ChangeRoomOwnerPanel`

## 5. Failed fan-out (P1)

- [ ] 5.1 Make the room fan-out of `wrapDekForSelfAndRoom` (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts`) report a failure with the recipients whose keys it read, mark those recipients as pending access for the file in `pendingAccessStore`, and flag the upload result, an abort still throwing (design decision 6); verify with a case "Sharing with the members fails" in `__tests__/encrypted-upload-orchestrator.test.ts` and `cd packages/shared && pnpm exec vitest run services/private-room`
- [ ] 5.2 Show Common:EncryptedUploadShareFailed with the file names from the flagged results in the client upload store (`packages/client/src/store/uploadDataStore/encryption.helpers.ts`) and the SDK (`packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts`); add the key to `public/locales/en/Common.json` in the same commit, run `/translate-comments` and `/translate-locales`; verify with cases in `UploadDataStore.encryption.test.ts` and `useEncryptedUpload.test.tsx`, `cd common/tests && npx vitest run test/locales.test.js`, `pnpm test:client` and `pnpm test:sdk`

## 6. Room file listing (P1)

- [ ] 6.1 Make `getEncryptedFilesInRoom` (`packages/shared/services/private-room/room-encryption.ts`) page on until it has read the folder's `total` entries (design decision 7); verify with a case "Room listed over several pages" in `__tests__/room-encryption.test.ts` (a folder with subfolders and 150 files) and `cd packages/shared && pnpm exec vitest run services/private-room`

## 7. Smaller fixes (P2)

- [ ] 7.1 Move the strength meter of `PassphraseModal` into a component both dialogs render and gate `KeyRotationDialog` on `isPassphraseAcceptable` (design decision 8); verify with a case "Passphrase change" in `keys-management/modals/__tests__/KeyRotationDialog.test.tsx`, the existing `PassphraseModal` tests, and `pnpm test` and `pnpm test:client`
- [ ] 7.2 Clear the name cache in the lock and expiry paths of `packages/shared/services/encryption/secret-storage.ts` (design decision 9); verify with a case "Unlocked session expires" in `__tests__/secret-storage.test.ts` and `cd packages/shared && pnpm exec vitest run services/encryption`
- [ ] 7.3 Show Common:EncryptionDownloadFailed when a single encrypted download finds no file keys or no own entry (`packages/client/src/store/filesActionsStore/download.helpers.ts`, design decision 10); verify with a case "No own access entry" in `__tests__/FilesActionsStore.deleteDownload.test.ts` and `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`

## 8. Suspicions

- [ ] 8.1 Check whether Copy to of an encrypted file opened from Recent is planned as a plain server copy (`packages/client/src/components/FilesSelector/index.tsx`, `packages/shared/services/private-room/private-transfer.ts`); if it is, plan it from the file's own room as 2.2 does, with a case "Copy started outside the room" in `FilesActionsStore.encryption.test.ts`; record the finding in design.md either way
- [ ] 8.2 Check whether the idle auto-lock starts after a key recovery from Keys management (`packages/shared/dialogs/key-recovery/useRecoverKeyFlow.tsx`, `packages/shared/context/encryption/EncryptionContext.tsx`); if it does not, mark the identity unlocked after recovery, with a case "Idle lock after recovery" next to the existing recovery flow tests; record the finding in design.md either way

## 9. Integration

- [ ] 9.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`, `pnpm run test:doceditor`), the client private-room E2E specs and the SDK private E2E folder, and `npx -y @fission-ai/openspec@latest validate private-rooms-spec-drift-fixes --strict`; all green

## Workflow follow-up

- Add this change to the gate criteria of `private-rooms-release-gate` with `/opsx:update private-rooms-release-gate`.
- Archive with `/opsx:archive private-rooms-spec-drift-fixes` after review.
