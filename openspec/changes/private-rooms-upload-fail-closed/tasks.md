# Tasks

## 1. Shared upload gate fails closed

- [x] 1.1 Extend the shared upload gate helper in `packages/shared/services/private-room/encrypted-upload.ts` with a `refuse` outcome carrying a reason (`no-key`, `locked`) for private custom rooms, keeping `encrypt` and `plain` for the other cases; verify with new cases in `packages/shared/services/private-room/__tests__/upload-encryption-gate.test.ts`.
- [x] 1.2 Invert the existing "does NOT encrypt when encryption keys are missing" case in `upload-encryption-gate.test.ts` to assert refusal, with a comment pointing at this change; verify `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/upload-encryption-gate.test.ts` passes.

## 2. Client upload pipeline refuses key-less and locked uploads

- [x] 2.1 In `packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts` and `selectors.helpers.ts`, replace the `publicKey && userId` short-circuit with the gate outcome: on `refuse`, mark the item failed with the localized reason and skip `startUploadSession`; verify with new cases in `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts` asserting no session is opened.
- [x] 2.2 Trigger the device-setup hint when an upload is refused for `no-key`; verify with a unit test on the hint effect in `packages/client/src/components/EncryptionProviderWrapper.jsx` or its hook test.
- [x] 2.3 Add `Common:EncryptionKeysRequiredForUpload` and `Common:EncryptionLockedUpload` to `public/locales/en/Common.json`, run `/translate-comments` then `/translate-locales`, and verify `cd common/tests && npx vitest run test/locales.test.js` passes.
- [x] 2.4 Add an E2E case to `packages/client/__tests__/private-room-access.spec.ts` where a key-less user drops a file into a private room and the upload panel shows the refusal; verify with `cd packages/client && pnpm exec playwright test __tests__/private-room-access.spec.ts`.

## 3. Dropped folder trees are refused

- [x] 3.1 In the Home page drop handler (`packages/client/src/pages/Home/index.js`, `createFoldersTree` call) refuse folder entries when the target is a private room and upload the file entries normally; verify with a unit test on the drop handling helper.
- [x] 3.2 Add `Common:FolderUploadNotSupportedInPrivateRoom` to the locales, translate it, and verify the locale tests pass.

## 4. One transfer resolver for drag, dialog and clipboard

- [x] 4.1 Extract the private-room transfer guard from `moveDragItemsImpl` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts`) into a helper that takes source items, destination folder info and the operation kind and returns `refuse-into`, `refuse-folder-out`, `decrypt-out`, `same-room` or `generic`; verify with unit tests in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.copyDelete.test.ts` covering every outcome.
- [x] 4.2 Route `pasteFromClipboard` in `packages/client/src/store/HotkeyStore.ts` through the resolver before `itemOperationToFolder`, showing the same toasts as the drag path; verify with new cases in `packages/client/src/store/__tests__/` for paste into, out of, and within a private room, plus a regression case for non-private folders.
- [x] 4.3 Make the destination picker (`packages/client/src/components/FilesSelector/index.tsx`) use the same resolver; verify the existing FilesSelector tests still pass and add a case for the `refuse-folder-out` outcome.

## 5. Move out of a private room deletes the source on success

- [x] 5.1 Extend `copyEncryptedFilesToFolder` with a `deleteSourceOnSuccess` option that permanently deletes each source file after its decrypted copy is finalized, collecting failures; verify with unit tests asserting deletion order and that a failed copy leaves its source.
- [x] 5.2 Pass the option from the move paths (drag, dialog, clipboard cut) and keep copy paths unchanged; verify with the resolver tests from 4.1 and a store test for the move path.
- [x] 5.3 Add `Common:EncryptedMovePartialFailure` with the failed names, translate it, and verify the locale tests pass.
- [ ] 5.4 Add an E2E case to `packages/client/__tests__/encrypted-file-ui.spec.ts` moving a file out of a private room and asserting the source disappears; verify with Playwright. Blocked on `private-rooms-mock-fidelity`: the case is written as `test.fixme` and is enabled once the mocks answer like the server.

## 6. Integration check

- [x] 6.1 Run the pre-push gate commands (`pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`) and the private-room E2E specs; verify all green.
- [ ] 6.2 Confirm `npx -y @fission-ai/openspec@latest validate private-rooms-upload-fail-closed --strict` passes and the delta still matches the implemented behaviour.

## Workflow follow-up

- Archive the change with `/opsx:archive private-rooms-upload-fail-closed` after review; the archive merges the delta into `private-rooms/file-operations`.
