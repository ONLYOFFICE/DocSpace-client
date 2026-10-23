# Tasks

## 1. Copy dialog destination room

- [x] 1.1 Pick the room crumb by room type in `getPickedRoomId` (`packages/client/src/components/FilesSelector/utils.ts`, design D1), rebuild the case "Subfolder of another private room" in `src/components/FilesSelector/__tests__/utils.test.ts` with crumbs as ui-kit builds them (`isRoom` on the section root, `roomType` on the room, neither on folders) and add a case "Subfolder of the same private room" planning `same-room`; verify with `cd packages/client && pnpm exec vitest run src/components/FilesSelector`
- [x] 1.2 Give the second private room of the MSW handlers a subfolder and its path (`packages/shared/__mocks__/handlers/files/privateRoomList.ts`, `encryptedFiles.ts`, mirroring the DTOs the handlers already serve) and add the E2E case "Subfolder of another private room" to `packages/client/__tests__/private-room-cross-room-copy.spec.ts`, asserting one encrypted session into the subfolder with the file keys wrapped for the destination room's members only; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files` and the spec in Docker (`tests-dev`)
- [x] 1.3 Pass the destination's room type through in `copyEncryptedFilesToFolderImpl` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts`, design D5); verify with the case "Copy into a private room with another room type" in `src/store/filesActionsStore/__tests__/FilesActionsStore.encryptedMove.test.ts` asserting the target handed to the upload carries that type and the existing upload-side case "Private target with another room type" in `src/store/uploadDataStore/__tests__` still refuses it
- [x] 1.4 Add the case "Destination member without a key" to `src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts` (design D6): a copy-tagged file for a room whose roster has a member without stored keys yields one encrypted session, wraps for the members with keys only and, as an upload does, names no skipped member; verify with `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`

## 2. Same-room copy suffix

- [x] 2.1 Name same-room copies with the first free suffix of the destination in `copyEncryptedFilesToFolderImpl` (design D4); verify with the case "Copy of a name that already has a copy" in `FilesActionsStore.encryptedMove.test.ts` (destination holds "Report.docx" and "Report (1).docx", the copy is "Report (2).docx", no clash prompt) and an E2E case of that name in `private-room-cross-room-copy.spec.ts` in Docker

## 3. Section drop right

- [x] 3.1 Capture `canUpload` in `onDropCapture` together with the target in `packages/client/src/pages/Home/Hooks/useSectionDrop.ts` (design D3); verify with the case "Folder without the upload right opened during the directory read" in `src/pages/Home/Hooks/__tests__/useSectionDrop.test.tsx`, covering both directions of the scenario

## 4. Superseded folder load

- [x] 4.1 Leave the loading state to the newer fetch when `checkSectionAddress` reports a superseded fetch, and when a cancelled fetch has a successor, in `packages/client/src/store/filesStore/fetch.helpers.ts` (design D2); verify with the case "Superseded load" in `src/store/filesStore/__tests__/FilesStore.fetchFiles.test.ts` asserting that `setIsLoadedFetchFiles`, the section loading setters and `setHighlightFile` are not called, and a case "Cancelled without a successor" asserting the loading still ends

## 5. Tests owed by the specs, comments and the cached-name check

- [x] 5.1 Add the case "Room clicked in the section" to `src/store/filesActionsStore/__tests__/FilesActionsStore.open.test.ts` with a private room built by `buildFilesListItems` from `src/store/filesStore/__tests__/listItem.fixture.ts` (design D6), asserting navigation to `/private/{id}/filter`; verify with `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`
- [x] 5.2 Test "Frame showing the menu" where the frame decision is made (design D6): a component test of `packages/client/src/Client.jsx` with `isFrame` and `frameConfig.showMenu` true asserts the article with the Private item renders, and with `showMenu` false asserts it does not; drop the `isFrame` and `showMenu` props from the sidebar case in `src/components/ClientArticleSidebar/__tests__/ClientArticleSidebar.test.tsx` and rename it to "Private item rendered"; verify with `cd packages/client && pnpm exec vitest run Client ClientArticleSidebar`
- [x] 5.3 Turn the restating comments of design D9 into one-line `Spec:` pointers (`src/components/FilesSelector/index.tsx`, `src/store/filesActionsStore/copyMove.helpers.ts` twice, `src/store/filesStore/fetch.helpers.ts`) and give the pointer in `src/store/uploadDataStore/start.helpers.ts` the `private-rooms/encryption-core` form; verify with `pnpm run lint` and `grep -rn "Spec: encryption-core" packages/client/src` printing nothing
- [x] 5.4 Pass only files without a cached name to `recoverEncryptedFilenames` in `listDecryptedFileNames` (`packages/shared/services/private-room/encrypted-name-clash.ts`, design D8); verify with a case in `packages/shared/services/private-room/__tests__/encrypted-name-clash.test.ts` asserting no member-keys load when every name is cached, run with `cd packages/shared && pnpm exec vitest run services/private-room`

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`), the private-room E2E specs in Docker and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-review-fixes` after review; the archive applies the six MODIFIED requirements to `file-operations` and `sidebar-section`.
