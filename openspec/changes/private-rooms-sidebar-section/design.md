# Design

## Context

See proposal.md for the motivation. This is the state on the branch that shapes the approach.

**Forms precedent (client).** Forms was built in two passes:
- First as a client-only split: `972667a8531`, `646e90cdb92`, `34298641ef1`. Those commits added the `CategoryType.Forms` route, the sidebar item, and a request-only room-type scope applied to a clone of the filter in `fetchRooms`.
- Then moved onto a server split: `89604bae459`, client side, with server `47f1364e27` / `99c9ea065c` "Feature/forms root".

What Forms looks like today:
- `/forms` addresses are classified by `getCategoryType` (`packages/shared/utils/common.tsx:1594`).
- Form rooms still report `rootFolderType = 14`. Folder type 36 appears only on the bare section root (`packages/client/src/helpers/utils.js:145-180`).
- Section differences therefore key off the route almost everywhere. About 70 client files carry a Forms condition.

**Server.** Every server statement here was found with CodeGraph and read in `../server` on branch `hotfix/v4.0.1`. Paths are relative to `../server/products/ASC.Files`.

How the rooms list handles privacy:
- `GET api/2.0/files/rooms` is `VirtualRoomsCommonController.GetRoomsFolder` (`Server/Api/VirtualRoomsController.cs:1343-1372`). Its `current` folder comes from `GetRoomsSectionIdAsync` (`:1394-1404`): `Active` → VirtualRooms root, `Archive` → Archive root, `Forms` → Forms root.
- `privacyFilter` is a query parameter of `RoomContentRequestDto` (`Server/ApiModels/RequestDto/RoomContentRequestDto.cs:129-130`), with enum `RoomPrivacyFilter` None 0 / Private 1 / NotPrivate 2 (`Core/Core/RoomPrivacyFilter.cs:39-49`).
- It is applied in `FolderDao.BuildRoomsQuery` (`Core/Core/Dao/TeamlabDao/FolderDao.cs:2479-2484`), independently of `searchArea`. No validation rejects it with any other filter (`VirtualRoomsController.cs:1344-1371`).
- With `Private`, third-party rooms are skipped (`Core/Core/Security/FileSecurity.cs:2916`). The administrator's all-rooms view hides private rooms from non-members, for the Archive as well (`FileSecurity.cs:2907-2911`).
- `GET rooms` always lists with `withSubfolders=false` (`VirtualRoomsController.cs:1458-1459`). A rooms search therefore matches room titles only, and the client forces `searchInContent` and `withSubfolders` off for room lists (`packages/shared/api/rooms/filter.ts:236-237`).

What the server does not offer private rooms:
- The Rooms/Forms split is by folder type only (`Core/Core/VirtualRooms/SearchArea.cs:84-92`, `MatchesRoomType(FolderType)`), so it cannot split on the private setting.
- `GET @root` yields VirtualRooms, Forms, Archive and AI agents roots, with no private root (`Server/Api/FoldersController.cs:1102-1140`).
- The folder listing behind Recent, Favorites and Trash can be scoped only by `folderType` (`Server/ApiModels/RequestDto/GetFolderRequestDto.cs:86-87`). Private content does not reach those lists anyway:
  - encrypted files are never marked recent (`Core/Utils/EntryManager.cs:2117-2121`);
  - favorites skip encrypted files (`Core/Core/FileStorageService.cs:4076`);
  - the client withholds favorites and deletes permanently (`private-rooms/file-operations`).

Where private rooms live:
- Every room, private or not, is created under the VirtualRooms root (`Core/Core/FileStorageService.cs:669`). The private setting is stored at creation (`:1164-1166`, `:1185`).
- Archive and unarchive move a room between the shared Archive root and VirtualRooms (`Server/Api/VirtualRoomsController.cs:650`, `:687`).
- Server-built links are `rooms/shared/{id}/filter?folder={id}` for VirtualRooms and `rooms/archived/filter?folder={id}` for Archive (`Core/Helpers/PathProvider.cs:78-90`).

New items, sockets and room groups:
- New-items marking walks the whole parent chain, Rooms root included, with no privacy check:
  - marking: `Core/Utils/FileMarker.cs:112`, `:216-233`, `:330-345`;
  - the root count: `:745-757`;
  - the news listings: `Server/Api/FoldersController.cs:614`, `Server/Api/VirtualRoomsController.cs:1280`, `:1796`.
- Room socket events carry a folder payload of id, parent, title, room type and creator, with no private setting (`Core/Utils/SocketManager.cs:395-406`). Archive and unarchive emit `delete-folder` then `create-folder` (`FileMoveCopyOperation.cs:528-547`, `:185`).
- Room groups take no privacy filter (`ApiModels/RequestDto/RoomGroupIdRequestDto.cs:61-76`, `Server/Api/GroupsController.cs:313-321`). A Rooms-area group counts and lists readable private rooms (`Server/ApiModels/ResponseDto/RoomGroupDto.cs:174-186`).

**Client today.**
- Private rooms are listed in Rooms with a badge.
- The `e2e-rooms` app (`packages/client/src/pages/E2eRooms/index.tsx`) frames `/sdk/private`. It has no item in the sidebar that is actually rendered: `ClientArticleSidebar` is the only sidebar in use, and `components/NewArticle` is not imported anywhere.
- The Private card is offered by `getCreateRoomTypes` (`packages/shared/utils/rooms.tsx:86-89`).
- `TreeFoldersStore.isPrivacyFolder` requires `rootFolderType === Rooms` (`packages/client/src/store/TreeFoldersStore.ts:403-411`), so it is false on both list roots and inside archived private rooms.
- `EncryptionProviderWrapper` is mounted globally and keys unlock, name recovery and hints off folder data, not the route. The same goes for the backfill sweep (`store/filesStore/fetch.helpers.ts:210-224`).
- The MSW rooms-list handler (`packages/shared/__mocks__/handlers/files/roomList.ts`) ignores `privacyFilter`.

No stashed design document covers a private-rooms section. The decisions below follow the Forms commits listed above and the five-part review of this change (Forms parity, entry points, encryption coupling, list UI, server facts).

## Goals / Non-Goals

**Goals:**
- Every private room is listed in exactly one place, decided by one predicate ("section available").
- Rooms-list behaviour comes for free: the section list *is* a rooms list (`isRoomsFolder` / `isArchiveFolder` are true there), so only the documented differences are coded.
- The section is decided before a folder is shown, so no entry point flashes Rooms first or bounces.
- Encryption keeps keying off folder and item data; the route only adds restrictions.
- No new server dependency.

**Non-Goals:**
- No server-backed root (see Follow-up).
- No change to `isPrivacyFolder` semantics. Archived private rooms get their own change, `private-rooms-archived-room-rules`.
- No change to the upload pipeline. Drops onto a private room row and the upload context of queued items get their own change, `private-rooms-upload-target-context`.
- No change to SDK pages beyond the title of the private rooms list, and no change to room pickers.
- Not deleting the dead `components/NewArticle` beyond its one label. That is a separate clean-up.

## Decisions

**D1. Split by `privacyFilter`, with the search area derived from the address, applied to the request only.**
- A pure helper in `packages/shared/utils/rooms.tsx` returns the request scope from the route category and the availability predicate:
  - `Private` with the Active or Archive area on the `/private` categories;
  - `NotPrivate` on Rooms and Rooms → Archive while the section is available;
  - nothing otherwise.
- It is applied to a clone of the filter immediately before every `api.rooms.getRooms` call that lists the Rooms or the section:
  - `fetchRooms` (`store/filesStore/fetch.helpers.ts:749`);
  - `fetchMoreFiles` (`:1094`);
  - the refill after rooms leave a list (`store/filesStore/mutations.helpers.ts:165-172`);
  - the Rooms refetch in `store/contacts/UsersStore.ts:297-307`.
- It overrides any `privacyFilter` and `searchArea` the address carries. It is never written back to `roomsFilter`, so the URL, the filter chips and `isFiltered` stay clean. This is the pattern of the first Forms pass (`972667a8531`).
- Forcing the search area also fixes "Restore" in Private → Archive, which calls `moveToRoomsPage` and would otherwise land on an archive address with `searchArea=Active` (`filesActionsStore/navigation.helpers.ts:117-119`, `rooms.helpers.ts:380`).
- Templates, Forms and AI agents searches are not scoped. Private rooms cannot be saved as templates, and the client never sets the private flag on a form-filling or AI room (`room-membership`, "Private room is a flagged Custom room").
- Room-group dialogs opened in Rooms (`EditRoomGroupsDialog`, `AddRoomToGroupDialog`) filter `private` rooms out of their room lists while the section is available. The server cannot do this (see Context), so a group's room count still includes them. That is accepted.
- Alternative rejected: carrying `privacyFilter` in the URL. Old bookmarks and links from other sections would bypass it, and the user would see a filter they cannot clear.
- Alternative rejected: a server root like Forms. It needs backend work and would hide private rooms from Rooms even without the opt-in. The user chose the client-only approach.

**D2. One availability predicate.**
- An `AppsStore` getter, `isPrivateRoomsSectionAvailable`, combines two inputs:
  - the opt-in, captured once when the store is constructed;
  - the `e2e-rooms` app state, read the way `isInstalled` reads it (optimistic until the apps list arrives, always on in SaaS) but without re-reading the flag.
- The sidebar, the scope helper, the route guard, the address decision (D5), the create entry points and the socket predicate all read this one getter. The opt-in is captured once so that a flag flipped from the console cannot produce a half state, in which Rooms already excludes private rooms but no section shows them.
- A MobX reaction on the getter refetches the open Rooms or section list when availability flips. That covers the optimistic apps load turning out "off" on standalone, and an administrator switching the app.

**D3. Routes and categories follow the existing Rooms forms.**

New routes in `packages/client/src/routes/client.js`, next to `forms`, on the same Home view component:
- `private`, `private/filter`;
- `private/:room`, `private/:room/filter`;
- `private/archived`, `private/archived/filter`.

An archived room opens as `private/archived/filter?folder={id}`, mirroring Rooms. `getCategoryUrl(Archive, id)` drops the id (`helpers/utils.js:219`), and the server builds `rooms/archived/filter?folder={id}`.

Three new categories in `CategoryType`: `PrivateRooms`, `PrivateRoom` and `PrivateArchive`, the last covering the list and the rooms inside it, as `Archive` does.

What each existing helper does with them:
- `getCategoryType` checks `/private` first. The branch handles `archived` itself, because the `/rooms` branch would match "archive" too.
- `getCategoryUrl` maps the three categories.
- `useFiles` treats them like Shared/Archive (a RoomsFilter from the URL, or a default with the derived search area).

Two guards:
- A guard element on the `/private` routes waits for the apps list (as `ProtectedAppRoute` does). When the section is not available, it renders `<Navigate replace>` to the Rooms counterpart, keeping the query string.
- The Rooms routes `rooms/shared/:room` and `rooms/archived/*` sit behind `ProtectedAppRoute` for the Rooms app (`routes/client.js:280-298`, `:400-438`). Their guard also admits the address while the Private section is available, so the D5 decision can run before the dashboard redirect. This is how e-mail links and the editor's back link reach a private room on a standalone portal with the Rooms app off.

Every place that switches on `CategoryType.Shared/SharedRoom/Archive/ArchivedRoom` is reviewed for the new categories (task 2.6). Known consequences of missing one:
- the sort key falls back to My documents (`store/filesStore/filter.helpers.ts:70-80`), so sorting inside a private room overwrites the My documents sort;
- the archive sort is read only for `Archive` (`helpers/createFolderNavigation.js:96-100`, `filesActionsStore/navigation.helpers.ts:241-245`);
- the header's `insideTheRoom` (`pages/Home/Section/Header/index.js:900-904`) drops the room title row in folders;
- `onClickBackImpl` (`navigation.helpers.ts:395-430`) leaves Backspace inert.

`fetchRooms` sets `FilesStore.categoryType` through the section-aware helper (`fetch.helpers.ts:772-777`). The list's row links (`filesStore/itemUrl.helpers.ts:65-68`), the media viewer's first URL (`MediaViewerDataStore.ts:257`) and the room sort key then read the private category.

Alternative rejected: reusing the Rooms categories with a pathname check. `getCategoryUrl` would keep sending every "back to list" path to `/rooms`.

**D4. Section identity is the route; one helper names it; every exit is listed.**
- The section list's `current` folder is the VirtualRooms root, so `isRoomsFolder` is true there. Likewise `isArchiveFolder` is true on the private archive.
- Section-only differences ask a shared helper, `isPrivateRoomsRoute(pathname)` / `getCategoryType`. Scattered `startsWith("/private")` literals are not used.

Exits from a room that must learn the section:
- the crumb title (`fetch.helpers.ts:309`) and the header back scope (`pages/Home/Section/Header/index.js:250`, `:415-470`);
- `moveToRoomsPageImpl` and `onClickBackImpl` (`filesActionsStore/navigation.helpers.ts:84-140`, `:395-430`);
- leaving a room, which hard-codes `rooms/shared/filter` (`filesActionsStore/rooms.helpers.ts:676-681`, `:762`);
- both branches of the socket "removed from room" redirect: Archive (`filesStore/socket.helpers.ts:524-537`) and Rooms (`:542-556`);
- the 403 redirect (`packages/shared/utils/axiosClient.ts:571-581`);
- the no-access view (`components/EmptyContainer/NoAccessContainer.tsx:84-127`). Its button and 5-second redirect go to Rooms, and its note takes `sectionName`, which gets `Common:Private`.

Route checks that must learn `/private`:
- `InfoPanelStore.getIsRooms` (`store/InfoPanelStore.ts:424`), which matches "rooms" in the pathname and would hide the info panel. This repeats the Forms bug fixed in `7c60ea1e065`.
- The Rooms refetch in `UsersStore.ts:297`.
- The trash-origin detection in `EmptyViewContainer.hooks.ts:263`.
- `SECTION_PREFIXES` in `contexts/SectionNavigationContext.tsx:41-52`.

The full list comes from `grep -nE "(indexOf|includes|startsWith)\(\"/?(rooms|forms)"` and a grep for navigate calls with a `rooms/` template literal over `packages/client/src` and `packages/shared`. Each hit is reviewed in task 2.5.

**D5. Decide the section before the folder is shown.**
- `getCategoryTypeByFolderTypeInSection` (`helpers/utils.js:170`) gains the private signal before its `SharedRoom` early return, and an explicit Archive branch. It picks the private categories when either holds:
  - the item is a room with `private === true`;
  - the target lies inside the private room that is open now (its room id is the root of the current `navigationPath`).

  The bare "route is under `/private`" signal is not used: links from the section to ordinary folders, such as the toast after copying out, would otherwise detour through `/private`. The callers pass the item: `createFolderNavigation.js:81`, `openLocationActionImpl` (`navigation.helpers.ts:229`), `navigateToNewFolderLocationImpl` (`uploadDataStore/operations.helpers.ts:405`), `fetch.helpers.ts:262`, `socket.helpers.ts:583` and the breadcrumbs (`Header/index.js:441-443`).
- For entry points that cannot know privacy beforehand (typed and e-mail links, Open location from feeds, the editor's back link, the `?folder=` forms of list links), `fetchFiles` decides before it commits any state. If the loaded folder or a `navigationPath` entry is private and the address belongs to Rooms, or the other way round, it stops without committing and replaces the address with its counterpart.
- The replace keeps `location.state`, so Open location's highlight survives. It carries a marker so the follow-up load does not decide again.
- The decision runs only while the section is available, never inside an embedded frame (`ClientConfig.isFrame`), and only if the navigation that started it is still current.
- Because nothing is committed before the decision, the missing-key warning (`fetch.helpers.ts:210-214`), the backfill sweep and the sidebar highlight run once, on the final address.
- Alternative rejected: correcting in `useFiles` after the folder loads. It caused a full second `fetchFiles`, double notices and a visible flip from Rooms to Private, and it could loop with the `/private` guard.

**D6. Creation: one branch in the store, reused by every entry point.**
- `ContextOptionsStore.onCreateRoom` (`ContextOptionsStore.tsx:972-997`) gets a private branch next to its existing `/forms` branch:
  - without WebCrypto, it shows `Common:EncryptionRequiresHttps` and dispatches nothing;
  - otherwise it dispatches `Events.ROOM_CREATE` with `payload.startRoomType = RoomsTypePrivate`.
- The header buttons (`helpers/getSectionCreateButton.ts`, `Header/index.js:499-507`), the context menu of empty space (`Home/index.js:458-463`) and "+ New" already call `onCreateRoom`.
- Two entry points dispatch on their own and are pointed at the same branch:
  - `CreateButtonMobile`;
  - the Shift+R hotkey (`HOCs/withHotkeys.js:194-205`, `:411`).
- `Article/MainButton` is not an entry point: `Client.jsx` imports `ArticleMainButtonContent` but its `ClientArticle` renders only `ClientArticleSidebar`, which has no create button.
- Quick actions get a `"private"` list section in `getQuickActionsSection` (`helpers/quickActions.ts:118-121`), checked before `isRoomsFolder`. `useQuickActions` renders a single Private room tile for it, through the same branch, and nothing for users who cannot create rooms.
- `CreateRoomDialog` already locks the type for a `startRoomType`. Its key auto-prompt effect (`CreateRoomDialog.js:182-193`) is widened from template items to "private start type without keys". Cancel or error closes the dialog through the existing `onCloseRef`.
- `getCreateRoomTypes` drops `RoomsTypePrivate` in every state.

**D7. Sidebar.** `ClientArticleSidebar` gets the item described in `private-rooms/sidebar-section`:
- id `private-rooms`, icon `catalog.private.react.svg` (already in the repo, used by the apps catalog);
- placed after the Forms block and before AI Agents;
- one child, `private-rooms-archive`, built with `searchAreaUrl("/private/archived/filter", RoomSearchArea.Archive)`;
- no `sectionBadge`, because there is no folder to count against.

`getClientActiveId` checks `/private/archived` and then `/private` before the generic matchers. The Rooms item keeps its badge, which includes private news (see Context).

**D8. Section UI deltas, each mirroring a Forms condition.**
- Filter (`pages/Home/Section/Filter/index.js`): `getRoomsListBasePath` returns `private` / `private/archived`; type options and the third-party group are dropped as for Forms (`:1117`, `:1417`); `withRoomGroups` is false.
- Header title: `Common:Private` on `PrivateRooms`.
- Crumb and Location root label: `cd2be2ca2ba` pattern.
- Group-context and menu helpers drop create-group/add-to-group on the private route.
- Empty view: the matchers in `EmptyViewContainer.{utils,helpers}.tsx` key by folder type, and the private list root reports Rooms. They get a route-derived discriminator, as `isFormsSectionScope` does, with:
  - three new `EmptyView` keys;
  - a create button as the only option on the list;
  - on the private Archive, the "Go to my rooms" option (`EmptyViewContainer.helpers.tsx:639-646`, `hooks.ts:306-325`) pointed at `/private/filter`.
- The Type column shows the same value on every row and stays, as it did for Forms. Column sets, widths and the room sort keys are shared with Rooms through `isRoomsFolder` / `isArchiveFolder` (`TableStore.ts:963-972`), as for Forms.

**D9. Live updates.**
- The socket create-folder path (`store/filesStore/socket.helpers.ts:208-223`) decides insertion from `isInSelectedFolder`, which is true for both lists because both have the VirtualRooms root selected.
- The socket payload has no private flag (see Context), so after `getFolderInfo` a room is inserted only if `folderInfo.private` matches the open list's scope (the D1 helper).
- The same predicate guards the restore and "shared with me" insert paths in that file. Archive and unarchive arrive as delete plus create, so they go through the same check.

**D10. `/e2e-rooms`.**
- The route keeps `ProtectedAppRoute appId="e2e-rooms"`, which sends users to the dashboard while the app is unavailable. Its element becomes `<Navigate replace>` to `/private/filter`, or to `/private/archived/filter` when `section=archive`.
- `pages/E2eRooms` is deleted. `useModuleLauncher` navigates to `/private/filter`.

**D11. Mocks and tests.**
- The MSW rooms-list handler learns `privacyFilter`, mirroring `FolderDao.BuildRoomsQuery` (`FolderDao.cs:2479-2484`) and the third-party skip (`FileSecurity.cs:2916`). Its doc comment names `VirtualRoomsCommonController.GetRoomsFolder`.
- `privateRoomListHandler` keeps serving the private room for `privacyFilter=Private`.
- Unit tests cover: the scope helper, the route helpers, the section decision (a pure function of address + folder data + availability), the create branch and the socket predicate.
- A new `private-rooms-section.spec.ts` walks the spec scenarios.

**D12. One name: "Private".**
- The apps catalog entry (`helpers/apps-catalog.tsx:147`) and the SDK list header (`packages/sdk/src/app/(private)/private/page.client.tsx:126-128`) switch from `Common:DashboardE2eRoomsTitle` to `Common:Private`, the key the sidebar and the section header use. Forms does the same with `Common:Forms`.
- The unused `components/NewArticle/index.tsx:512` gets the same key, so nothing references the old one.
- `DashboardE2eRoomsTitle` is then deleted from every `Common.json` and from `public/locales/.meta/Common`. `UselessTranslationKeysTest` (`common/tests/test/locales.test.js:665`) fails on a key that no code uses. The deletion follows `.claude/rules/bulk-locale-edits.md`: a dry run first, then a check that every file lost exactly that one key.
- `DashboardE2eRoomsDescription` stays as the catalog description.
- Alternative rejected: changing the English value of `DashboardE2eRoomsTitle` to "Private". That leaves two keys with the same text and makes every existing translation stale.

**D13. Encryption stays on folder data; the route only withholds.**
- Upload, create, transfer and menu decisions keep reading `isPrivacyFolder`, `item.private` and `navigationPath[].private`. No encryption decision may read `isPrivateRoomsRoute` or the private categories. They may only be used to withhold more:
  - AI chat;
  - the tour;
  - groups;
  - generic room creation.
- A unit test asserts that the upload and transfer helpers give the same answer for a private room under `/rooms/shared` and under `/private`.

**D14. AI chat and the Rooms tour are hidden on Private addresses.**
- `Shell.jsx:760-771` hides the chat while `isPrivacyFolder` is true. It also hides it on the private categories, which covers both list roots and archived private rooms. `aiSuggestions.ts` is not consulted there.
- `RoomsTour` (`components/RoomsTour/index.tsx:227-238`, `:383`) starts on `isRoomsFolderRoot`. It also requires a non-private category, so its stand-in rooms are never swapped into the Private list.

## Risks / Trade-offs

- [The base E2E fixture enables the opt-in and the apps mock reports `e2e-rooms` on, so every frame that shows the sidebar gains an item. The suite has 734 PNG baselines.] → Regenerate in Docker with `--update-snapshots=changed` in one task. Review the list of rewritten frames: only sidebar frames and lists that showed a private room may change.
- [Optimistic apps load. On standalone with the app off, Rooms first requests `NotPrivate` and private rooms are missing until the apps list arrives.] → The D2 reaction refetches. The route guard and the D5 decision wait for the list.
- [Deciding inside `fetchFiles` touches the most central loading path of the client.] → The decision is a pure function with its own unit tests. The fetch change is limited to "decide, then commit or replace". The existing `FilesStore.fetchFiles` tests run unchanged.
- [The Rooms counter and its panel still include private news, and a Rooms group's room count includes private rooms.] → Accepted v1 limitations, written as requirements. Both are removed only by the server-backed follow-up.
- [`isPrivacyFolder` is false inside archived private rooms.] → Handled by `private-rooms-archived-room-rules`, which must land before the private Archive ships.
- [A drop onto a private room row, and a queued or retried upload after leaving the room, are sent in plaintext today.] → Handled by `private-rooms-upload-target-context`, which must land before group 2 of this change. Group 2 adds the exits that make the second case more likely.
- [Two archives (Rooms → Archive and Private → Archive) may confuse users who archived a private room before the section existed.] → Each room shows up in exactly one of them.
- [Coordination with `private-rooms-sdk-gating-and-parity` (its iframe task and scenarios) and with `private-rooms-release-gate` (it removes requirements this change modifies).] → Task 0.1 reconciles the SDK change before either is applied. The release-gate revision is noted in its proposal when it is picked up.

## Migration Plan

- This is a client-only change, shipped behind the opt-in. No data migration: rooms do not move on the server.
- Rollback is a revert. With the change reverted, private rooms are listed in Rooms again and `/e2e-rooms` frames the SDK as before.

## Server findings outside this change

The review found two server behaviours that do not block this change. They belong to `private-rooms-server-hardening`:
- **Archived private rooms are open to administrators.** The Archive branch of the administrator bypass grants Move and Delete on any room, with no private guard (`Core/Core/Security/FileSecurity.cs:1949-1981`). The VirtualRooms branch has one (`:1650-1652`). An administrator who is not a member can delete or unarchive an archived private room by id.
- **Room socket events reach every administrator.** For VirtualRooms and Archive, `WhoCanRead` adds every administrator to the recipients (`Core/Utils/SocketManager.cs:415-419`). Administrators who are not members therefore receive the titles of private rooms.

## Follow-up: server-backed section

Decided with the user: the backend team will be asked for server-side sections after this change. A full Forms-like section needs the server to repeat `99c9ea065c` for private rooms:
- a new `FolderType` and a tenant root (`FolderDao` bunch key, `GlobalFolder` cache);
- a `SearchArea` value, with `MatchesRoomType` able to see the private setting (today it takes only a folder type, `SearchArea.cs:84-92`);
- a case in `GetRoomsSectionIdAsync`;
- an entry in `GetRootFoldersIdsAsync`;
- new-items routing in `FileMarker`, so private news leave the Rooms counter;
- a room-group area for private rooms.

The client would then swap `privacyFilter` for that search area and add the counter. That is a separate change, opened once the server work lands.
