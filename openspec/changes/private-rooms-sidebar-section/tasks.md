# Tasks

## 0. Coordination

- [ ] 0.1 Revise `private-rooms-sdk-gating-and-parity` with `/opsx:update`:
  - drop the client-iframe parts (the iframe-address half of its task 1.3, and the scenarios "Client passes its flag" and "Client iframe");
  - keep the SDK-side opt-in.

  Verify with `npx -y @fission-ai/openspec@latest validate --all --strict` (with `OPENSPEC_TELEMETRY=0`), and commit as `OpenSpec: private-rooms-sdk-gating-and-parity: drop the client iframe replaced by the Private rooms section`.

## 1. Availability, request scope and mocks

- [ ] 1.1 Add the routing primitives:
  - `CategoryType.PrivateRooms`, `PrivateRoom`, `PrivateArchive` and `PrivateArchivedRoom`;
  - a `/private` branch at the top of `getCategoryType` (`packages/shared/utils/common.tsx`) and an `isPrivateRoomsRoute` helper;
  - `getCategoryUrl` cases for the four categories (`packages/client/src/helpers/utils.js`).

  Verify with a new `packages/client/src/helpers/__tests__/privateRoomsSectionNavigation.test.ts`. It must cover every section address, including `/private/archived/{id}`, and show that `/rooms/archived` and `/forms` keep their categories (`cd packages/client && pnpm exec vitest run src/helpers/__tests__`).
- [ ] 1.2 Add `AppsStore.isPrivateRoomsSectionAvailable` (design D2). It reads the opt-in captured at construction, and the `e2e-rooms` state without re-reading the flag.

  Verify with new cases in `packages/client/src/store/__tests__/AppsStore.installed.test.ts`:
  - opt-in absent;
  - opt-in set after construction;
  - SaaS;
  - standalone with the app off;
  - before the apps list loads.
- [ ] 1.3 Add the privacy scope helper to `packages/shared/utils/rooms.tsx` (design D1). Apply it to a filter clone in `fetchRooms` and `fetchMoreFiles` (`packages/client/src/store/filesStore/fetch.helpers.ts`) and in the Rooms refetch in `packages/client/src/store/contacts/UsersStore.ts`. Add the refetch reaction on availability flips.

  Verify with a new `packages/shared/utils/rooms.privacyScope.test.ts` and new cases in `packages/client/src/store/filesStore/__tests__/FilesStore.fetchRooms.test.ts`:
  - `Private` on `/private`;
  - `NotPrivate` on Rooms and Rooms → Archive while available;
  - none while not available;
  - a URL `privacyFilter` is overridden;
  - the next page keeps the scope;
  - `roomsFilter` is not mutated.
- [ ] 1.4 Make the MSW rooms-list handler (`packages/shared/__mocks__/handlers/files/roomList.ts`) honour `privacyFilter` as `VirtualRoomsCommonController.GetRoomsFolder` / `FolderDao.BuildRoomsQuery` do, including the third-party skip for `Private`. Its doc comment names the controller action. Make `privateRoomListHandler` answer `privacyFilter=Private`.

  Verify with new cases in `packages/shared/__mocks__/handlers/files/__tests__/encrypted-files-contract.test.ts`, or a sibling rooms-list contract test (`cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`).

## 2. Routes, sidebar and navigation

- [ ] 2.1 Register the eight `/private` routes in `packages/client/src/routes/client.js` on the Home view, behind a guard that waits for the apps list. While the section is not available, the guard redirects to the Rooms counterpart. Teach `useFiles` the four categories, including default filters with `searchArea` Active/Archive.

  Verify with fallback-mapping cases in `privateRoomsSectionNavigation.test.ts`, and with the scenario "Link opened without the opt-in" in a new `packages/client/__tests__/private-rooms-section.spec.ts` (`cd packages/client && pnpm exec playwright test private-rooms-section.spec.ts`).
- [ ] 2.2 Add the Private rooms sidebar item and its Archive child to `packages/client/src/components/ClientArticleSidebar/index.tsx` (design D7), and the `/private` matchers to `getClientActiveId` (`packages/client/src/helpers/articleNavigation.ts`). Add the `Common:PrivateRooms` key, then run the `translate-comments` and `translate-locales` skills and `cd common/tests && npx vitest run test/locales.test.js`.

  Verify with active-id cases in `privateRoomsSectionNavigation.test.ts`, and with the E2E scenarios "Section available", "Section not available", "Item clicked", "Archive address" and "Section expanded".
- [ ] 2.3 Add the private signal to `getCategoryTypeByFolderTypeInSection`. Add the post-load address correction in both directions (design D5) as a pure decision function wired into `useFiles`.

  Verify with:
  - unit cases next to `packages/client/src/helpers/__tests__/formsSectionNavigation.test.ts`, in the new section test file;
  - the E2E scenarios "Room clicked in the section", "Rooms address of a private room", "Hand-edited address" and "Archived private room".
- [ ] 2.4 Keep upward navigation in the section:
  - the crumb title in `fetch.helpers.ts`;
  - `moveToRoomsPageImpl` in `filesActionsStore/navigation.helpers.ts`;
  - the header back scope in `pages/Home/Section/Header/index.js`;
  - the socket "removed from room" redirect in `filesStore/socket.helpers.ts`;
  - the 403 redirect in `packages/shared/utils/axiosClient.ts`.

  Verify with:
  - new cases in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.navigation.test.ts`;
  - a `/private` case in `packages/shared/utils/axiosClient.test.ts`;
  - the E2E scenarios "Back from a private room" and "Access to the open private room lost".
- [ ] 2.5 Review every remaining pathname route check found by `grep -rnE "(indexOf|includes|startsWith)\(\"/?(rooms|forms)" packages/client/src packages/shared` (design D4). Make `InfoPanelStore.getIsRooms` recognise `/private`.

  Verify with an `InfoPanelStore` unit case, with the E2E scenarios "Nothing selected on the list" and "Private room selected", and by recording the reviewed list in the commit body.

## 3. Section UI: header, filter, groups, empty state

- [ ] 3.1 Set the section header title to `Common:PrivateRooms`, and the Location column root label (`pages/Home/Section/Body/TableView/sub-components/LocationCell.tsx`). Verify with the E2E scenarios "Section list header" and "Location column in a search".
- [ ] 3.2 Section filter in `pages/Home/Section/Filter/index.js`:
  - list base path `private` / `private/archived`;
  - no room-type, third-party storage or room-group controls.

  Verify with the E2E scenario "Filter opened in the section".
- [ ] 3.3 Withhold the create-group and add-to-group actions on the private route, in `store/filesActionsStore/menu.helpers.ts`, `store/filesStore/contextOptions.helpers.ts` and `store/contextOptionsStore/groupContextOptions.helpers.ts`. Verify with new cases in the headerMenu and contextOptions tests (`cd packages/client && pnpm exec vitest run src/store/filesActionsStore src/store/filesStore src/store/contextOptionsStore`), updating only the snapshots of the touched helpers, and with the E2E scenario "Context menu of a private room in the section".
- [ ] 3.4 Add the Private rooms empty state, with a route discriminator in `components/EmptyContainer/sub-components/EmptyViewContainer` and the keys `EmptyView:EmptyRootPrivateRoomsTitle`, `EmptyRootPrivateRoomsDescription` and `EmptyRootPrivateRoomsUserDescription`. Then run `translate-comments`, `translate-locales` and the locale tests.

  Verify with the E2E scenarios "Room admin without private rooms" and "User without private rooms", and with `cd common/tests && npx vitest run test/locales.test.js`.

## 4. Creation from the section

- [ ] 4.1 Make `getCreateRoomTypes` drop `RoomsTypePrivate` in every state. Verify by updating `packages/shared/utils/privateRooms.test.ts`: the chooser hides the private type with and without the flag, and keeps every other type. Run `cd packages/shared && pnpm exec vitest run utils/privateRooms.test.ts`.
- [ ] 4.2 Add one section create helper: WebCrypto check, then `Events.ROOM_CREATE` with `startRoomType = RoomsTypePrivate`. Wire it into:
  - `helpers/getSectionCreateButton.ts`;
  - `components/Article/MainButton/index.js`;
  - `components/CreateButtonMobile/index.tsx`;
  - the empty view;
  - the `ContextOptionsStore` "+ New".

  Hide it from users without the room-creation right. Verify with:
  - unit cases for the helper (no WebCrypto: toast `Common:EncryptionRequiresHttps`, nothing dispatched);
  - the `ContextOptionsStore.models` snapshot, updated for the touched helper only;
  - the E2E scenarios "Room admin creates from the section" and "User without the room-creation right".
- [ ] 4.3 Widen the key auto-prompt in `components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js` to the private start type, and make the new room open at `/private/{roomId}/filter`. Verify with the E2E scenarios "User accepts key generation", "User cancels key generation" and "Creation succeeds", and with `private-room-access.spec.ts` still passing.

## 5. Live updates

- [ ] 5.1 Guard room insertion in `store/filesStore/socket.helpers.ts` (create, restore, shared-with-me paths) with the privacy scope of the open list. Verify with new cases "Invited to a private room" and "Ordinary room created in another tab" in `packages/client/src/store/filesStore/__tests__/FilesStore.socketCreate.test.ts`.

## 6. Replace the E2E rooms app

- [ ] 6.1 Replace the E2E rooms app with the section:
  - turn `/e2e-rooms` into a redirect to `/private/filter` or `/private/archived/filter`, kept behind `ProtectedAppRoute`;
  - delete `packages/client/src/pages/E2eRooms`;
  - point `useModuleLauncher` at `/private/filter`;
  - update the gated-surfaces comment in `packages/shared/utils/privateRooms.ts`;
  - drop `packages/client/src/pages/E2eRooms/**` from the paths of `.claude/rules/private-rooms.md`.

  Verify by updating `packages/client/__tests__/private-rooms-hidden.spec.ts` (section absent without the flag, `/e2e-rooms` goes to the dashboard) and with the E2E scenarios "Old bookmark" and "Archive bookmark".
- [ ] 6.2 Adjust the existing private-room E2E specs that open private rooms under `/rooms/shared/{id}` or assert the Rooms list. Verify with `cd packages/client && pnpm exec playwright test private-room encrypted-file-ui keys-management` in Docker.

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
- Decide with the backend team whether to open the server-backed follow-up (design.md, "Follow-up: server-backed section").
