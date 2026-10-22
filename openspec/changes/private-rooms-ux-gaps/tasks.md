# Tasks

## 1. Localized errors on encrypted paths

- [ ] 1.1 Replace the English `Error` throws in `packages/client/src/helpers/encryptedFileCreation.ts` with a coded error and map it in `packages/client/src/components/GlobalEvents/CreateEvent.js` to `Common:PrivateRoomCreateNotSupported`; verify with `cd packages/client && pnpm exec vitest run src/helpers/__tests__/encryptedFileCreation.test.ts`
- [ ] 1.2 Route the `toastr.error(err as string)` catches on encrypted download/open in `packages/client/src/store/ContextOptionsStore.tsx` and `packages/client/src/store/filesActionsStore/navigation.helpers.ts` through the encryption error mapper with `Common:EncryptedOperationFailed` as fallback; verify with `pnpm exec vitest run src/store/contextOptionsStore src/store/filesActionsStore/__tests__/FilesActionsStore.encryption.test.ts`
- [ ] 1.3 Remove the `defaultValue` fallbacks in `packages/client/src/store/filesActionsStore/copyMove.helpers.ts` and `packages/client/src/components/FilesSelector/index.tsx`; verify with `pnpm run lint` and the client i18n Biome plugin reporting no missing key
- [ ] 1.4 Add the new Common keys, run `translate-comments` and `translate-locales`, then `cd common/tests && npx vitest run test/locales.test.js`; verify green for all languages

## 2. Resolved names in feeds

- [ ] 2.1 Use the shared resolved-title hook in `packages/client/src/components/NewFilesBadge/sub-components/NewFilesPanelItem.tsx` and in `packages/client/src/pages/Home/InfoPanel/Body/views/History/HistoryBlockContent/ItemList.tsx` so recovery is scheduled when unlocked and no prompt is raised when locked; verify with new unit tests for both components (`cd packages/client && pnpm exec vitest run NewFilesBadge History`)
- [ ] 2.2 Resolve the name in socket-driven new-file notifications for private rooms; verify with a case in `packages/client/src/store/filesStore/__tests__/FilesStore.encryption.test.ts`
- [ ] 2.3 External, in `docspace-ui-kit-react`: give `FilesSelector` a way for the app to supply the displayed title of an item (for example `resolveItemTitle?: (item) => string`) and to re-render when the app's name cache changes; record the ui-kit release that ships it in design.md; verified by that record (blocks 2.4)
- [ ] 2.4 BLOCKED on 2.3. Pass the filename cache to the picker in `packages/client/src/components/FilesSelector/index.tsx` (`resolveDisplayTitle`, recovery scheduled when unlocked, no prompt when locked, design D7); verify with cases named "Destination picker in a private room" and "Picker while locked" in `src/components/FilesSelector/__tests__` and an E2E case in `private-room-cross-room-copy.spec.ts`
- [ ] 2.5 Hide the decryption warning of the picker for a Move from a private room (`getShowEncryptedTransferBanner` in `packages/client/src/components/FilesSelector/utils.ts`, design D8); verify with the case "Move dialog of a private room" in `src/components/FilesSelector/__tests__/utils.test.ts`

## 3. Remove the PDF form dead end

- [ ] 3.1 Drop the PDF form entry for private rooms in `packages/client/src/store/contextOptionsStore/folderModel.helpers.ts`, `packages/client/src/components/EmptyContainer/EmptyPrivateRoomView.tsx`, `packages/client/src/helpers/quickActions.ts` and the create hotkeys; verify with the contextOptionsStore snapshot tests and `cd packages/client && pnpm exec vitest run quickActions folderModel`
- [ ] 3.2 Update `packages/client/__tests__/encrypted-file-ui.spec.ts` for the new create menu; verify with `cd packages/client && pnpm exec playwright test encrypted-file-ui.spec.ts`

## 4. Decrypted folder download and bulk menu

- [ ] 4.1 Implement decrypted folder download in `packages/client/src/store/filesActionsStore/download.helpers.ts` (recursive listing, per-file decrypt, relative paths in the zip, skipped files reported with `Common:EncryptedDownloadPartial`); verify with new cases in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts`
- [ ] 4.2 Offer "Download" for folders and the room in `packages/client/src/store/filesStore/contextOptions.helpers.ts` and `packages/client/src/store/ContextOptionsStore.tsx`, and "Download without decryption" in the private-room header menu in `packages/client/src/store/filesActionsStore/menu.helpers.ts`; verify with the headerMenu and contextOptions snapshot tests
- [ ] 4.3 Add an E2E case for folder download with the decrypted zip to `packages/client/__tests__/private-room-cross-user-download.spec.ts`; verify with Playwright

## 5. Keys management dialogs

- [ ] 5.0 Decide how the affected-rooms list is computed (design.md D6 and Open Questions): per-file `GET files/{fileId}/access` reads with early exit per room, a capped scan, or a new server query; the server has no per-room read of file access entries. Verified by the decision recorded in design.md
- [ ] 5.1 BLOCKED on 5.0. List affected rooms in the delete-key confirmation (`useDeleteKeyFlow.tsx`) using the method chosen in 5.0, with `Common:DeleteKeyAffectedRooms` / `Common:DeleteKeyNoAffectedRooms`; verify with `cd packages/client && pnpm exec vitest run useDeleteKeyFlow`
- [ ] 5.2 Add dialog roles, accessible names and labelled inputs, and the aside display on narrow screens, to `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`, `packages/shared/dialogs/key-generation/*`, `packages/shared/dialogs/key-recovery/*`, `packages/shared/dialogs/key-change-dialog/KeyChangeDialog.tsx` and the keys-management modals; verify with jest-dom role queries in the shared dialog tests (`cd packages/shared && pnpm exec vitest run dialogs`)
- [ ] 5.3 Refresh the keys-management Playwright screenshots and run `cd packages/client && pnpm exec playwright test keys-management.spec.ts keys-management-advanced.spec.ts`; verify they pass on desktop and the mobile project
- [ ] 5.4 Translate the new keys from groups 4 and 5 (`translate-comments`, `translate-locales`) and rerun `cd common/tests && npx vitest run test/locales.test.js`

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive the change after review; archiving applies the RENAMED and REMOVED operations to the main specs.
