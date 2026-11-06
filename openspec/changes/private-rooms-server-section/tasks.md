# Tasks

The server landed the section in `c866c055e1` (1.1), and its shape is recorded in design.md, "Landed on 2026-11-06" (1.2). One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Server behaviour is read in `../server` through CodeGraph and never guessed.

## 1. Server section

- [x] 1.1 Backend (backend team, announced 2026-11-06): a root section for private rooms on the Forms model (design.md, Context): a folder type and tenant root, a search area whose room match reads the private setting, the root in `GET files/@root` and a section route, `GetRoomsSectionIdAsync` mapping the area, new-items routing to the root, the security and link rules, and the move of the existing private rooms under the root; verify with server tests on the model of the Forms section tests (`FormFillingRoomSectionTests`). Landed on 2026-11-06 in `c866c055e1` ("add the Private section, built the way Forms is", `PrivateRoomSectionTests`), with a backend note of the same day on working with private rooms through the API. The shape differs from the Forms model in one point that matters: the root holds no rooms, private rooms stay under the Rooms root, and the section is selected by their private setting, so nothing was moved (design.md, "Landed on 2026-11-06")
- [x] 1.2 Client: once 1.1 has merged, read it in `../server` through CodeGraph (`FolderType`, `SearchArea` and `MatchesRoomType`, `GlobalFolderHelper`, `FoldersController.GetRootFoldersIdsAsync`, `VirtualRoomsController.GetRoomsSectionIdAsync`, `FileMarker`, `FileSecurity.FilterEntryAsync`, `PathProvider`, `RoomGroupArea`) and record in design.md: the folder type value, the search area name, the root route and its position in the root listing, how the existing rooms were moved, where archived private rooms live, the room links, the new-items routing, the listing while the E2E rooms app is off, and whether groups came; then correct the `server-contract` delta of this change and proposal decisions 3 to 5. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-section --strict`. Done 2026-11-06: recorded in design.md, "Landed on 2026-11-06". The `server-contract` delta now carries "Private root" (no rooms under it, the root only while the app is on, 404 on `@private` otherwise, 400 for Recent), "Rooms list privacy filter" (the Rooms area without private rooms, the private filter on it meaning the section, the filter kept on the Archive) and "Room groups belong to one section", replacing "Room groups ignore privacy". The `sidebar-section` delta lists the archive through the Archive area with the private filter, keeps the non-private filter on Rooms → Archive, and leaves "Live updates respect the split" as it is. Decisions 3 and 4 are answered; decision 5 is answered by the server and left to the owner for the client side. Design decision 3 now keeps the private setting as the signal, so the former tasks 3.2 and 3.3 are dropped

- [ ] 1.3 ui-kit: add `FolderType.PrivateRooms = 42` to the kit's enums in `docspace-ui-kit-react` on `release/v4.1.0` (design decision 5), and take the kit build that carries it here (`pnpm run update-ui-kit` until it is published, see `.claude/rules/pnpm.md`); add `RoomSearchArea.PrivateRooms = "PrivateRooms"` to `packages/shared/enums`. Verify: the kit's own checks in its repository, and here `pnpm exec tsc` in shared and client

## 2. Mocks

- [ ] 2.1 After 1.3: mirror the section in the mocks, each handler's doc comment naming the server action:
  - the root folders handler lists the Private root (`rootFolderType` 42, title "Private") while the E2E rooms app is on (`FoldersController.GetRootFoldersIdsAsync`);
  - `GET files/@private` answers the private rooms, or 404 with the app off (`FoldersController.GetPrivateRoomsFolder`);
  - `privateRoomList.ts` and `roomList.ts` answer `searchArea=PrivateRooms` with the private rooms, `Active` without private rooms whatever the filter except `Private`, which means the section, and `Archive` with the filter as given (`VirtualRoomsCommonController.GetRoomsFolder`, `FileSecurity` around `:2983`);
  - Recent with `searchArea=PrivateRooms` answers 400 (`EntryManager`).

  Add contract cases for the section list, its archive, the Rooms list without private rooms, the private filter on Rooms, the root listing with the app on and off, and Recent. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`; type-check login and management too (`Array.from` in the mocks)

## 3. Listing

- [ ] 3.1 After 2.1 and proposal decision 5: make the section list ask for `searchArea=PrivateRooms` and its Archive for `searchArea=Archive&privacyFilter=Private`, send no privacy filter with the Rooms list and keep `privacyFilter=NotPrivate` on Rooms → Archive (design decision 2). Touch `packages/shared/utils/rooms.tsx`, `packages/shared/api/rooms/filter.ts`, `packages/client/src/pages/Home/Hooks/useFiles.ts`, `packages/client/src/helpers/articleNavigation.ts` and the section filter. Apply decision 5 to the listing while the section is not available, as the `sidebar-section` delta "Section lists only private rooms", "Rooms section excludes private rooms while the section is available" and "Scope holds on every request of a list" describe. Verify: `rooms.privacyScope.test.ts` rewritten to the delta scenarios, and `cd packages/client && pnpm exec vitest run src/store src/helpers`
- [ ] 3.4 After 3.1: check `packages/shared/services/private-room/rooms-with-own-access.ts` and every other reader of the privacy filter (`grep -rn privacyFilter packages --include=*.ts*`). Switch each to the section's area, or keep the filter where the Archive area needs it. Verify: the shared unit suite

## 4. New-items counter

- [ ] 4.1 After 1.3 and 3.1: give the Private root the count of its own `new` in `getFoldersTree` (`packages/shared/api/files`), as Forms has. Then show it on the Private item in `packages/client/src/components/ClientArticleSidebar`, open its new-items panel, and offer mark-all-as-read as the Rooms item does (delta "New-items counter on the section item" and "Rooms counter leaves private rooms out"). Verify: `ClientArticleSidebar.test.tsx` cases "Counter shown" and "Mark all as read", and the E2E case "New-items counter" in `packages/client/__tests__/private-rooms-section.spec.ts` under Docker

## 5. Decisions carried into the section

- [ ] 5.1 After proposal decision 1 (the server accepts the root as a start folder since `c866c055e1`): offer or keep withholding the Private section as a default start page, with the delta requirement written for the decision. Verify: the file-management settings unit test
- [ ] 5.2 After proposal decision 2 (the server has the `PrivateRooms` group area since `c866c055e1`): offer or keep withholding room groups in the section, with the delta requirement written for the decision and the group area mocked as read in the server. Verify: the `EditRoomGroupsDialog` unit tests and `cd packages/shared && pnpm exec vitest run __mocks__/handlers`

## 6. SDK

- [ ] 6.1 After 2.1: check how the SDK private pages (`packages/sdk/src/app/(private)`) list private rooms, and switch them to the section's search area where they use the privacy filter. Verify: the SDK unit tests and `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`

## 7. Integration

- [ ] 7.1 Full client E2E private-room suite under Docker with the sidebar screenshots regenerated (`tests-dev`, `--update-snapshots=changed`), the pre-push gate, `npx -y @fission-ai/openspec@latest validate --all --strict`, and a check on a stand with `c866c055e1`: the root list, the sidebar, the move and copy picker, and the Private item's counter. Verify: green runs and the stand check recorded in design.md

## Workflow follow-up

- Former tasks 3.2 (section addresses by the root folder type) and 3.3 (live updates by the root) were dropped on 2026-11-06: a private room keeps the Rooms root, so the private setting stays the signal (design decision 3).
- The server commit leaves Trash and Favorites for subfolders of private rooms as they were. Raise them with the backend team if the client's withholding of those actions is not enough.
- Archive once both sides are on `release/v4.1.0`. The archive merges the `sidebar-section` and `server-contract` deltas and drops the "in this version" limitations of the main specs.
