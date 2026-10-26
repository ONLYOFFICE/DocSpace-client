# Tasks

## 1. Bulk download of folders in a private room

- [x] 1.1 Extract the decrypting zip core shared by `downloadEncryptedFilesAsZipImpl` and `downloadEncryptedFolderImpl` in `packages/client/src/store/filesActionsStore/download.helpers.ts` (design D1) and let `downloadEncryptedFilesAsZip` take the selected folders, each listed under its own name; verify with the case "Files and folders selected" in `src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts` (an encrypted file at the root and a folder "Reports" with a file: one `Files.zip` whose entries are the file's decrypted name and `Reports/<name>`, `downloadFiles` not called) and the existing cases "Folder download", "A file cannot be decrypted" and "Several encrypted files selected" staying green, run with `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`
- [x] 1.2 Route the folders of a private room in `downloadActionImpl` (`private` flag or `treeFoldersStore.isPrivacyFolder`, design D1) into the decrypted zip, a single such folder into `downloadEncryptedFolder`; verify with the case "Folder selected in the header menu" in `FilesActionsStore.deleteDownload.test.ts` (`downloadAction` with a selection of one private folder saves `Reports.zip` and calls no `downloadFiles`) and a case of the same name in `src/store/filesActionsStore/__tests__/FilesActionsStore.headerMenu.test.ts` (clicking `menu-download` with a folder selected in the Private section requests no server archive), run with `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`
- [x] 1.3 Add the E2E cases "Folder selected in the header menu" and "Files and folders selected" to `packages/client/__tests__/private-room-cross-user-download.spec.ts`: a root-level encrypted file next to the existing folder, rows selected through their checkboxes, `menu-download` clicked, the saved zip unzipped and its entries asserted (`Reports.zip` with the folder's files; `Files.zip` with the root file and `Reports/...`), and no request to the server archive endpoint; verify with the spec in Docker (`tests-dev`)

## 2. New-files panel

- [ ] 2.1 Move the name recovery to `packages/client/src/components/NewFilesBadge/sub-components/NewFilesPanelFileList.tsx` for the rows on screen (design D3) and reduce `NewFilesPanelItemFile.tsx` to the cache read, dropping its `userId` prop and `userStore` injection; verify with a new `src/components/NewFilesBadge/__tests__/NewFilesPanelFileList.test.tsx` carrying the cases "New files panel" (two encrypted rows yield one `recoverEncryptedFilenames` call with both candidates, and a revealed fifth row a second call with that row only) and "Identity locked" (no call, no unlock prompt), and `NewFilesPanelItemFile.test.tsx` keeping a case that a cached name is shown; run with `cd packages/client && pnpm exec vitest run NewFilesBadge`

## 3. Header-menu error

- [ ] 3.1 Map the error of `downloadEncryptedHandle` in `packages/client/src/store/FilesHeaderOptionStore.ts` through `getEncryptedOperationErrorMessage` (design D4); verify with the case "Download without decryption fails" in `FilesActionsStore.headerMenu.test.ts` (clicking `menu-download-encrypted` while `downloadFiles` rejects with an error without a message toasts `Common:EncryptedOperationFailed`, never the error object), run with `cd packages/client && pnpm exec vitest run src/store/filesActionsStore/__tests__/FilesActionsStore.headerMenu.test.ts`

## 4. Spec wording and test names

- [ ] 4.1 Rename the passphrase case of `packages/shared/dialogs/__tests__/key-dialogs.a11y.test.tsx` to "Passphrase field" and assert both placeholders, `Common:Passphrase` and `Common:ConfirmPassphrase`, on the create variant of the dialog (design D2; the spec wording itself lands with the archive); verify with `cd packages/shared && pnpm exec vitest run dialogs`
- [ ] 4.2 Rename the dedupe cases to the scenario name "Decrypted names clash" (design D5): `src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts` line 271, and the two `deduplicateFileNames` cases of `packages/shared/services/private-room/__tests__/encrypted-download.test.ts` lines 169 and 185 with their qualifiers after the prefix; verify with `cd packages/client && pnpm exec vitest run FilesActionsStore.deleteDownload` and `cd packages/shared && pnpm exec vitest run encrypted-download`

## 5. Integration

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`), the private-room E2E specs in Docker and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-ux-gaps-followups` after review; the archive applies the four MODIFIED requirements to `file-operations` and `key-management`.
- In `docspace-ui-kit-react`: `PasswordInput` forwards `aria-label`, `aria-labelledby` and `aria-describedby` to its input (design D2); a later client change then labels the passphrase fields and tightens the scenario "Passphrase field".
