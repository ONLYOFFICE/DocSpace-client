# Tasks

## 0. Coordination

- [x] 0.1 Revise `private-rooms-sdk-gating-and-parity` with `/opsx:update`:
  - drop the client-iframe parts (the iframe-address half of its task 1.3, and the scenarios "Client passes its flag" and "Client iframe");
  - keep the SDK-side opt-in.

  Verify with `npx -y @fission-ai/openspec@latest validate --all --strict` (with `OPENSPEC_TELEMETRY=0`), and commit as `OpenSpec: private-rooms-sdk-gating-and-parity: drop the client iframe replaced by the Private section`.
- [ ] 0.2 Confirm that `private-rooms-upload-target-context` is archived before starting group 2, and that `private-rooms-archived-room-rules` is archived before task 2.1 ships the archive routes. Verify with `npx -y @fission-ai/openspec@latest list`: both changes are gone from the active list and present under `openspec/changes/archive/`.

## 1. Availability, request scope and mocks

- [ ] 1.1 Add the routing primitives:
  - `CategoryType.PrivateRooms`, `PrivateRoom` and `PrivateArchive`;
  - a `/private` branch at the top of `getCategoryType` (`packages/shared/utils/common.tsx`) and an `isPrivateRoomsRoute` helper;
  - `getCategoryUrl` cases for the three categories (`packages/client/src/helpers/utils.js`), with archived rooms as `/private/archived/filter?folder={id}`.

  Verify with a new `packages/client/src/helpers/__tests__/privateRoomsSectionNavigation.test.ts`. It must cover every section address, and show that `/rooms/archived` and `/forms` keep their categories (`cd packages/client && pnpm exec vitest run src/helpers/__tests__`).
- [ ] 1.2 Add `AppsStore.isPrivateRoomsSectionAvailable` (design D2). It reads the opt-in captured at construction, and the `e2e-rooms` state without re-reading the flag.

  Verify with new cases in `packages/client/src/store/__tests__/AppsStore.installed.test.ts`:
  - opt-in absent;
  - opt-in set after construction;
  - SaaS;
  - standalone with the app off;
  - before the apps list loads.
- [ ] 1.3 Add the request-scope helper to `packages/shared/utils/rooms.tsx`: privacy filter plus a search area derived from the category (design D1). Apply it to a filter clone in:
  - `fetchRooms` and `fetchMoreFiles` (`packages/client/src/store/filesStore/fetch.helpers.ts`);
  - the refill in `packages/client/src/store/filesStore/mutations.helpers.ts`;
  - the Rooms refetch in `packages/client/src/store/contacts/UsersStore.ts`.

  Add the refetch reaction on availability flips. Verify with a new `packages/shared/utils/rooms.privacyScope.test.ts` and new cases in `packages/client/src/store/filesStore/__tests__/FilesStore.fetchRooms.test.ts`:
  - `Private` on `/private`;
  - `NotPrivate` on Rooms and Rooms → Archive while available;
  - none while not available;
  - a URL `privacyFilter` and `searchArea` are overridden;
  - the next page and the refill keep the scope;
  - `roomsFilter` is not mutated.
- [ ] 1.4 Make the MSW rooms-list handler (`packages/shared/__mocks__/handlers/files/roomList.ts`) honour `privacyFilter` as `VirtualRoomsCommonController.GetRoomsFolder` / `FolderDao.BuildRoomsQuery` do, including the third-party skip for `Private`. Its doc comment names the controller action. Make `privateRoomListHandler` answer `privacyFilter=Private`.

  Verify with new cases in a rooms-list contract test under `packages/shared/__mocks__/handlers/files/__tests__` (`cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`).

## 2. Routes, sidebar and navigation

- [ ] 2.1 Register the six `/private` routes in `packages/client/src/routes/client.js` on the Home view, behind a guard that waits for the apps list and redirects to the Rooms counterpart while the section is not available. Let the Rooms room and archive routes through their Rooms-app guard while the section is available (design D3). Teach `useFiles` the three categories.

  Verify with:
  - fallback-mapping cases in `privateRoomsSectionNavigation.test.ts`;
  - the scenarios "Link opened without the opt-in" and "Rooms app switched off" in a new `packages/client/__tests__/private-rooms-section.spec.ts` (`cd packages/client && pnpm exec playwright test private-rooms-section.spec.ts`).
- [ ] 2.2 Add the Private sidebar item and its Archive child to `packages/client/src/components/ClientArticleSidebar/index.tsx` (design D7), the `/private` matchers to `getClientActiveId` (`packages/client/src/helpers/articleNavigation.ts`), and `/private` to `SECTION_PREFIXES` (`contexts/SectionNavigationContext.tsx`).

  Add the `Common:Private` key ("Private"). Its `.meta` comment must say it names the sidebar section of end-to-end encrypted rooms, so translators pick the plural/section form. Then run the `translate-comments` and `translate-locales` skills and `cd common/tests && npx vitest run test/locales.test.js`.

  Verify with active-id cases in `privateRoomsSectionNavigation.test.ts`, and with the E2E scenarios "Section available", "Section not available", "Item clicked", "Archive address" and "Section expanded".
- [ ] 2.3 Implement the section decision (design D5):
  - the private signal in `getCategoryTypeByFolderTypeInSection`, before its early return, plus the Archive branch;
  - the item passed by its callers;
  - the section-aware category in `fetchRooms`;
  - the decide-before-commit step in `fetchFiles`: a pure decision function; a replace that keeps `location.state` and is marked against re-deciding; skipped in frames, while unavailable, and for stale navigations.

  Verify with:
  - unit cases for the decision function in the section test file;
  - a `FilesStore.fetchFiles` case asserting that no state is committed before a replace;
  - the E2E scenarios "Room clicked in the section", "Row link opened in a new tab", "Rooms address of a private room", "Archived room link", "Open location from a feed", "Back from the editor", "Cold link to a private room", "Hand-edited address", "Go to the destination after copying out" and "Archived room address".
- [ ] 2.4 Keep every exit in the section (design D4):
  - the crumb title, `moveToRoomsPageImpl` and `onClickBackImpl`;
  - the header back scope;
  - leaving a room (`filesActionsStore/rooms.helpers.ts`);
  - both branches of the socket "removed from room" redirect;
  - the 403 redirect in `packages/shared/utils/axiosClient.ts`;
  - the no-access view (`components/EmptyContainer/NoAccessContainer.tsx`), with `sectionName` = `Common:Private`.

  Verify with:
  - new cases in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.navigation.test.ts` and `FilesActionsStore.leaveRoom.test.ts`;
  - a `/private` case in `packages/shared/utils/axiosClient.test.ts`;
  - the E2E scenarios "Back from a private room", "Leave a private room", "Access to the open private room lost", "Removed from an archived private room" and "No-access view".
- [ ] 2.5 Review every remaining pathname route check found by `grep -rnE "(indexOf|includes|startsWith)\(\"/?(rooms|forms)" packages/client/src packages/shared`, and every navigate call with a `rooms/` template literal (design D4). Make `InfoPanelStore.getIsRooms` recognise `/private`.

  Verify with an `InfoPanelStore` unit case, the E2E scenarios "Nothing selected on the list" and "Private room selected", and the reviewed list recorded in the commit body.
- [ ] 2.6 Review every `CategoryType.(Shared|SharedRoom|Archive|ArchivedRoom)` check for the new categories (design D3). Cover at least:
  - the sort keys in `filesStore/filter.helpers.ts`, `helpers/createFolderNavigation.js` and `filesActionsStore/navigation.helpers.ts`;
  - `insideTheRoom` in the header;
  - `MediaViewerDataStore.getFirstUrl`.

  Verify with:
  - unit cases showing that sorting inside a private room does not change the saved My documents sort;
  - the E2E scenario "Folder inside a private room";
  - the reviewed list recorded in the commit body.

## 3. Section UI: header, filter, groups, AI, tour, empty states

- [ ] 3.1 Set the section header title to `Common:Private`, and the Location column root label (`pages/Home/Section/Body/TableView/sub-components/LocationCell.tsx`). Verify with the E2E scenarios "Section list header" and "Location column in a search".
- [ ] 3.2 Section filter in `pages/Home/Section/Filter/index.js`:
  - list base path `private` / `private/archived`;
  - no room-type, third-party storage or room-group controls.

  Verify with the E2E scenario "Filter opened in the section".
- [ ] 3.3 Room groups:
  - withhold the create-group and add-to-group actions on the private route, in `store/filesActionsStore/menu.helpers.ts`, `store/filesStore/contextOptions.helpers.ts` and `store/contextOptionsStore/groupContextOptions.helpers.ts`;
  - filter private rooms out of the Rooms room-group dialogs (`components/dialogs/EditRoomGroupsDialog`, `AddRoomToGroupDialog`) while the section is available.

  Verify with:
  - new cases in the headerMenu and contextOptions tests (`cd packages/client && pnpm exec vitest run src/store/filesActionsStore src/store/filesStore src/store/contextOptionsStore`), updating only the snapshots of the touched helpers;
  - the E2E scenarios "Context menu of a private room in the section" and "Room group editor in Rooms".
- [ ] 3.4 Hide the AI chat on the private categories (`Shell.jsx`) and keep the Rooms tour off them (`components/RoomsTour/index.tsx`) (design D14). Verify with the E2E scenarios "Private list" (no AI chat) and "Pending Rooms tour".
- [ ] 3.5 Add the Private empty states, with a route discriminator in `components/EmptyContainer/sub-components/EmptyViewContainer` and the keys `EmptyView:EmptyRootPrivateRoomsTitle`, `EmptyRootPrivateRoomsDescription` and `EmptyRootPrivateRoomsUserDescription`:
  - the list offers only a create button;
  - the private Archive's back option opens `/private/filter`.

  Then run `translate-comments`, `translate-locales` and the locale tests. Verify with the E2E scenarios "Room admin without private rooms", "User without private rooms" and "Empty Private archive", and with `cd common/tests && npx vitest run test/locales.test.js`.

## 4. Creation from the section

- [ ] 4.1 Make `getCreateRoomTypes` drop `RoomsTypePrivate` in every state. Verify by updating `packages/shared/utils/privateRooms.test.ts`: the chooser hides the private type with and without the flag, and keeps every other type. Run `cd packages/shared && pnpm exec vitest run utils/privateRooms.test.ts`.
- [ ] 4.2 Add the private branch to `ContextOptionsStore.onCreateRoom`: WebCrypto check, then `Events.ROOM_CREATE` with `startRoomType = RoomsTypePrivate`. Point `CreateButtonMobile` and the Shift+R hotkey (`HOCs/withHotkeys.js`) at it (design D6). Hide every entry point from users without the room-creation right.

  Verify with:
  - unit cases for the branch (no WebCrypto: toast `Common:EncryptionRequiresHttps`, nothing dispatched);
  - the `ContextOptionsStore.models` snapshot, updated for the touched helper only;
  - the E2E scenarios "Room admin creates from the section", "Hotkey in the section" and "User without the room-creation right".
- [ ] 4.3 Add the `"private"` quick-actions section (`helpers/quickActions.ts`) and its single Private room tile (`pages/Home/Hooks/useQuickActions.tsx`). Verify with cases in the quick-actions unit tests (`cd packages/client && pnpm exec vitest run quickActions`) and the E2E scenario "Banner on a non-empty Private list".
- [ ] 4.4 Widen the key auto-prompt in `components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js` to the private start type, and make the new room open at `/private/{roomId}/filter`. Verify with the E2E scenarios "User accepts key generation", "User cancels key generation" and "Creation succeeds", and with `private-room-access.spec.ts` still passing.
- [ ] 4.5 Assert the encryption-independence rule (design D13): unit cases showing that the upload and transfer helpers decide the same way for a private room under `/rooms/shared` and under `/private`. Add the E2E scenario "Private room opened under Rooms": with the section unavailable, the upload body is DSE3 under an opaque name.

## 5. Live updates

- [ ] 5.1 Guard room insertion in `store/filesStore/socket.helpers.ts` (create, restore, shared-with-me paths) with the scope of the open list, reading `private` from `getFolderInfo`. Verify with new cases "Invited to a private room" and "Ordinary room created in another tab" in `packages/client/src/store/filesStore/__tests__/FilesStore.socketCreate.test.ts`.

## 6. Replace the E2E rooms app

- [ ] 6.1 Replace the E2E rooms app with the section:
  - turn `/e2e-rooms` into a redirect to `/private/filter` or `/private/archived/filter`, kept behind `ProtectedAppRoute`;
  - delete `packages/client/src/pages/E2eRooms`;
  - point `useModuleLauncher` at `/private/filter`;
  - update the gated-surfaces comment in `packages/shared/utils/privateRooms.ts`;
  - drop `packages/client/src/pages/E2eRooms/**` from the paths of `.claude/rules/private-rooms.md`.

  Verify by updating `packages/client/__tests__/private-rooms-hidden.spec.ts` (section absent without the flag, `/e2e-rooms` goes to the dashboard) and with the E2E scenarios "Old bookmark" and "Archive bookmark".
- [ ] 6.2 Adjust the existing private-room E2E specs that open private rooms under `/rooms/shared/{id}` or assert the Rooms list. Verify with `cd packages/client && pnpm exec playwright test private-room encrypted-file-ui keys-management` in Docker.
- [ ] 6.3 Rename "Rooms E2E" to "Private" (design D12):
  - title the apps catalog entry (`packages/client/src/helpers/apps-catalog.tsx`), the SDK private list header (`packages/sdk/src/app/(private)/private/page.client.tsx`) and the label in `packages/client/src/components/NewArticle/index.tsx` with `Common:Private`;
  - delete `DashboardE2eRoomsTitle` from every `public/locales/*/Common.json` and `public/locales/.meta/Common/DashboardE2eRoomsTitle.json`, using a dry-run script that checks each file loses exactly that key (`.claude/rules/bulk-locale-edits.md`).

  Verify with:
  - `cd common/tests && npx vitest run test/locales.test.js`, including NotFoundKeysTest and UselessTranslationKeysTest;
  - `pnpm run test:sdk`;
  - the E2E scenario "Catalog with the flag" in `private-rooms-hidden.spec.ts`;
  - the scenario "List header" in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`.

## 7. Integration

- [ ] 7.1 Regenerate the screenshots touched by the new sidebar item:

  ```bash
  docker-compose run --rm -T -e WORKERS=3 tests-local pnpm exec playwright test --update-snapshots=changed
  ```

  Review the list of rewritten frames: only sidebar frames and lists that showed a private room may change. Verify that a full Docker E2E run is green.
- [ ] 7.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`. Verify that everything is green.

## Workflow follow-up

- Before archiving, update the Purpose of `openspec/specs/private-rooms/sdk-surface/spec.md` (it still describes the client's iframe app and lists `packages/client/src/pages/E2eRooms/index.tsx`) and the implementation list in the feature-gating Purpose.
- Archive with `/opsx:archive`. This applies the RENAMED, MODIFIED and REMOVED operations and creates `openspec/specs/private-rooms/sidebar-section/spec.md`.
- When `private-rooms-release-gate` is picked up, revise its feature-gating delta. It removes "Private room card is gated in the create-room chooser" and "E2E rooms app is gated as an unreleased app" by name, and its scenarios still speak of the E2E rooms app.
- Done in `e9c875edf90`: the two server findings in design.md ("Server findings outside this change") were handed to `private-rooms-server-hardening` (its tasks 9.1 and 9.3).
- Ask the backend team for server-side sections (design.md, "Follow-up: server-backed section"). Once they land, open a follow-up change that moves the client from `privacyFilter` onto them and adds the counter.
