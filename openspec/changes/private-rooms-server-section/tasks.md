# Tasks

Every client task waits for the server commit of 1.1 and the read of 1.2 (design decision 1). One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`); server behaviour is read in `../server` through CodeGraph and never guessed.

## 1. Server section

- [ ] 1.1 Backend (backend team, announced 2026-11-06): a root section for private rooms on the Forms model (design.md, Context): a folder type and tenant root, a search area whose room match reads the private setting, the root in `GET files/@root` and a section route, `GetRoomsSectionIdAsync` mapping the area, new-items routing to the root, the security and link rules, and the move of the existing private rooms under the root; verify with server tests on the model of the Forms section tests (`FormFillingRoomSectionTests`)
- [ ] 1.2 Client: once 1.1 has merged, read it in `../server` through CodeGraph (`FolderType`, `SearchArea` and `MatchesRoomType`, `GlobalFolderHelper`, `FoldersController.GetRootFoldersIdsAsync`, `VirtualRoomsController.GetRoomsSectionIdAsync`, `FileMarker`, `FileSecurity.FilterEntryAsync`, `PathProvider`, `RoomGroupArea`) and record in design.md: the folder type value, the search area name, the root route and its position in the root listing, how the existing rooms were moved, where archived private rooms live, the room links, the new-items routing, the listing while the E2E rooms app is off, and whether groups came; then correct the `server-contract` delta of this change and proposal decisions 3 to 5. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-section --strict`

## 2. Mocks

- [ ] 2.1 After 1.2: make `packages/shared/__mocks__/handlers/files/privateRoomList.ts` and `roomList.ts` answer the section's search area from a Private root, with the root in the root folders handler, each handler's doc comment naming the controller action, and contract cases for the section list, its archive, the Rooms list without private rooms and the root listing; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`

## 3. Listing and navigation

- [ ] 3.1 After 2.1 and proposal decision 5: replace the privacy filter with the section's search area in `packages/shared/utils/rooms.tsx`, `packages/shared/api/rooms/filter.ts`, `packages/client/src/pages/Home/Hooks/useFiles.ts`, `packages/client/src/helpers/articleNavigation.ts` and `packages/client/src/store/filesActionsStore/navigation.helpers.ts`, drop the exclusion filter of the Rooms requests, and apply decision 5 to the listing while the app is off, as the `sidebar-section` delta "Section lists only private rooms", "Rooms section excludes private rooms while the section is available" and "Scope holds on every request of a list" describe; verify with `rooms.privacyScope.test.ts` rewritten to the delta scenarios and `cd packages/client && pnpm exec vitest run src/store src/helpers`
- [ ] 3.2 After 3.1: decide the section of a folder from its root folder type instead of its room's private setting in the address decision of `navigation.helpers.ts` and `articleNavigation.ts` ("Section addresses are decided before the folder is shown"), keeping the private setting for encryption (design decision 3); verify with the navigation unit tests' cases "Folder under the Private root" and "Folder under the Rooms root"
- [ ] 3.3 After 3.1: split live updates by the root of the event's room in `packages/client/src/store/filesStore/socket.helpers.ts`, as the delta "Live updates respect the split" describes; verify with the socket helper unit tests' cases "Invited to a private room" and "Ordinary room created in another tab"
- [ ] 3.4 After 3.1: check `packages/shared/services/private-room/rooms-with-own-access.ts` and every other reader of the privacy filter (`grep -rn privacyFilter packages --include=*.ts*`) and switch or remove each; verify with the shared unit suite

## 4. New-items counter

- [ ] 4.1 After 3.1: show the Private root's new-items count on the Private item in `packages/client/src/components/ClientArticleSidebar`, open its new-items panel and mark all as read as the Rooms item does, and let the Rooms counter follow the server (delta "New-items counter on the section item" and "Rooms counter leaves private rooms out"); verify with `ClientArticleSidebar.test.tsx` cases "Counter shown" and "Mark all as read" and the E2E case "New-items counter" in `packages/client/__tests__/private-rooms-section.spec.ts` under Docker

## 5. Decisions carried into the section

- [ ] 5.1 After proposal decision 1: offer or keep withholding the Private section as a default start page, with the delta requirement written for the decision; verify with the file-management settings unit test
- [ ] 5.2 After proposal decision 2: offer or keep withholding room groups in the section, with the delta requirement written for the decision and the mock of the group area read from the server; verify with the `EditRoomGroupsDialog` unit tests and `cd packages/shared && pnpm exec vitest run __mocks__/handlers`

## 6. SDK

- [ ] 6.1 After 1.2: check how the SDK private pages (`packages/sdk/src/app/(private)`) list private rooms and switch them to the section's search area where they use the privacy filter; verify with the SDK unit tests and `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`

## 7. Integration

- [ ] 7.1 Full client E2E private-room suite under Docker with the sidebar screenshots regenerated (`tests-dev`, `--update-snapshots=changed`), the pre-push gate and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify with green runs

## Workflow follow-up

- Archive once both sides are on `release/v4.1.0`. The archive merges the `sidebar-section` and `server-contract` deltas and drops the "in this version" limitations of the main specs.
