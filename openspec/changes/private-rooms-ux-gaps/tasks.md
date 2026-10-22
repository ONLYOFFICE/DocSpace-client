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
