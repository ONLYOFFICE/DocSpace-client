# Design

## Context

See proposal.md for motivation. Observed state on the branch (2026-10-26):

- `downloadActionImpl` (`packages/client/src/store/filesActionsStore/download.helpers.ts:237`) splits the selection: a single plain file opens its view URL, a single encrypted file goes to `downloadEncryptedFile`; otherwise encrypted files go to `downloadEncryptedFilesAsZipImpl` (`:427`, flat `Files.zip`, member keys cached per room) and every folder goes with the plain files to `downloadFiles`, the server archive. `downloadEncryptedFolderImpl` (`:654`) walks the folder with `listFolderTree`, decrypts with the same `downloadAndDecryptFileToBuffer`, deduplicates per directory with `toZipEntries` and saves `<title>.zip`. The two loops differ only in where their entries come from and in the zip name.
- `ContextOptionsStore.onClickDownload` (`packages/client/src/store/ContextOptionsStore.tsx:488`) routes a folder to `downloadEncryptedFolder` when `treeFoldersStore.isPrivacyFolder || item.private`. `FilesHeaderOptionStore.downloadHandle` (`packages/client/src/store/FilesHeaderOptionStore.ts:89`) calls `downloadAction(label)` with no item, so the header "Download" always takes the selection path; `downloadEncryptedHandle` (`:97`) catches with `toastr.error(err)`. List folders carry `private` (`TActionItem`, `FilesActionsStore.ts:248`).
- `downloadFilesImpl` (`download.helpers.ts:70`) catches a failed bulk-download request itself and toasts the error as it is, so it never rejects for one. The `.catch` of `downloadEncryptedHandle` and of `onClickDownloadEncrypted` (`ContextOptionsStore.tsx:508`) therefore never sees a request error, and both entries show "Network Error" or the like. Found by the manual check of 2026-10-26 on a local portal, after the first version of D4 had mapped only the `.catch`.
- `NewFilesPanelFileList` (`packages/client/src/components/NewFilesBadge/sub-components/NewFilesPanelFileList.tsx`) renders the first four rows until "show more"; each `NewFilesPanelItemFile` calls `useResolvedFileTitle(item, { userId, roomId })`, which runs `useEncryptedFilenameRecovery` for that one file, so each row calls `recoverEncryptedFilenames`, and each call loads the member keys (`loadRoomMemberKeysSafe`, `packages/shared/services/private-room/room-member-keys.ts:94`, no cache). History (`ItemList.tsx:126`) and the picker (`usePickerFileTitles.ts:58`) hand the hook their whole list.
- `PassphraseModal.tsx:277,395` name the passphrase fields by placeholder; `key-dialogs.a11y.test.tsx:116` asserts that placeholder. The archived `private-rooms-ux-gaps` design D5 records why: the kit's `PasswordInput` hands `InputBlock` an explicit prop list and forwards no aria attribute.
- The stashed `AUDIT_FRONTEND.md` item BL-12 (dialog accessibility) is the only design document behind these points; it stays partly open until the kit forwards a label. No server fact is relied on beyond those cited in the archived changes: the folder listing and the per-file access read that `listFolderTree` and the folder download already use (ux-gaps D4 and D6).

## Goals / Non-Goals

**Goals:**
- "Download" gives the same result for a folder of a private room whatever menu it comes from, and a bulk download yields one archive.
- The main specs describe the branch, including the passphrase-field limitation.
- The New-files panel costs one member-keys request per room per list, like the other feeds.

**Non-Goals:**
- Streaming or size caps for the client-side zip (accepted bound of ux-gaps D4).
- Any change to ui-kit in this repository.

## Decisions

**D1. One decrypting zip core for files and folders.** The per-entry loop of `downloadEncryptedFilesAsZipImpl` and `downloadEncryptedFolderImpl` becomes one core that takes entries `{ file, dir, roomId }` and a zip name: progress per entry, the own-entry check, the member-keys cache per room, `toZipEntries` for per-directory suffixes, `Files:DecryptAllFailed` when nothing decrypts and the partial warning otherwise. `downloadEncryptedFilesAsZip(files, folders)` builds its entries from the selected files at the root, each with `resolveRoomIdForFile(file)`, and from each selected folder's tree under `<folder title>/` with the folder's room, and saves `Files.zip`; `downloadEncryptedFolder(folder)` is the same core with the tree at the root and `<title>.zip`. In `downloadActionImpl`, a folder with `private`, or any folder while `treeFoldersStore.isPrivacyFolder` is set, joins the encrypted group instead of `folderIds`; a private folder that is the whole selection goes to `downloadEncryptedFolder`, so the header menu and the context menu produce the same file. Alternatives: one zip per selected folder, rejected because a bulk download produces one archive in every other case; keep the server archive for selected folders and write it as a SHALL NOT, rejected because "Download without decryption" in the header would then duplicate "Download" for folders, and a result named "Download" would hold ciphertext.

**D2. The spec says "named", the passphrase fields keep their placeholder.** The requirement asks for an accessible name on every input and states, as a limitation, that the passphrase fields get no label of their own; the scenario "Passphrase field" pins the two placeholders. Follow-up in `docspace-ui-kit-react`: `PasswordInput` forwards `aria-label`, `aria-labelledby` and `aria-describedby` to its `<input>`; a later client change then renders a label for the fields and tightens the scenario. Alternative: wrap the field in a `<label>` on the client side, rejected because the kit renders the input inside its own block, so a label around it names the block, and ux-gaps D5 already decided against a client workaround. The a11y test takes the scenario name.

**D3. The list recovers the names of the rows on screen.** `NewFilesPanelFileList` takes `userId` from `userStore` through `inject` and calls `useEncryptedFilenameRecovery` with the rows it renders, the first four until "show more", so one batch loads the member keys once; a reveal re-runs the hook for the new rows only, through its attempted set. The row keeps `useResolvedFileTitle(item)` as a cache read and drops `userId` and the recovery context from its props and injection. Alternatives: hand the hook every item of the list, rejected because hidden rows would cost header reads nobody sees yet; cache the member keys inside `loadRoomMemberKeysSafe`, rejected because membership changes would need an invalidation rule, while the per-list batch is what History and the picker already do.

**D4. "Download without decryption" maps its error where the download toasts it.** `downloadFilesImpl` takes an optional `errorMessage` mapper with its translations and, for a failed request that is not a server message string, toasts the mapper's text instead of the error; a string, which is the server's own message for the operation, is shown as before. `downloadEncryptedHandle` and `onClickDownloadEncrypted` pass `getEncryptedOperationErrorMessage` with their `t`, so both "Download without decryption" entries show `Common:EncryptedOperationFailed` or the server's message. Every other caller passes no mapper and keeps its toast. `downloadHandle` stays as it is: the standard header "Download" is shared by every room type and `Common:EncryptedOperationFailed` would be wrong outside a private room. Alternatives: map in the callers' `.catch`, the first version of this decision, rejected because `downloadFilesImpl` never rejects for a request error; let `downloadFilesImpl` rethrow and leave the toast to every caller, rejected because it changes the download of every room type.

**D5. Test names carry the scenario.** The client case "names files whose decrypted names clash apart in the zip" becomes "Decrypted names clash"; the two `deduplicateFileNames` cases keep their qualifier after that prefix, so each of the three names the scenario.

## Risks / Trade-offs

- [A mixed selection with a large folder tree is zipped in memory] → the bound is the one ux-gaps D4 accepted for a folder download; the partial-result warning and the ciphertext archive as the fallback stay.
- [A folder without the `private` flag in a private room would still take the server path] → the open folder's `isPrivacyFolder` is the second signal, the same pair the context menu uses; the unit cases cover both.
- [Moving the recovery out of the row changes the New-files panel wiring] → the scenario cases move with the hook under their names; the row keeps a case for a cached name.

## Migration Plan

Client-only, behind the `privateRooms` flag. Rollback is a revert.
