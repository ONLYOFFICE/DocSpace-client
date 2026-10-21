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
- `GET api/2.0/files/rooms` is `VirtualRoomsCommonController.GetRoomsFolder` (`Server/Api/VirtualRoomsController.cs:1343-1372`).
- Its `current` folder comes from `GetRoomsSectionIdAsync` (`:1394-1404`): `Active` → VirtualRooms root, `Archive` → Archive root, `Forms` → Forms root.
- `privacyFilter` is a query parameter of `RoomContentRequestDto` (`Server/ApiModels/RequestDto/RoomContentRequestDto.cs:129-130`), with enum `RoomPrivacyFilter` None 0 / Private 1 / NotPrivate 2 (`Core/Core/RoomPrivacyFilter.cs:39-49`).
- It is applied in `FolderDao.BuildRoomsQuery` (`Core/Core/Dao/TeamlabDao/FolderDao.cs:2479-2484`). It is independent of `searchArea`.
- With `Private`, third-party rooms are skipped (`Core/Core/Security/FileSecurity.cs:2916`).
- The administrator's all-rooms view still hides private rooms from non-members (`FileSecurity.cs:2907-2911`).

What the server does not offer private rooms:
- The Rooms/Forms split is by folder type only (`Core/Core/VirtualRooms/SearchArea.cs:84-92`, `MatchesRoomType(FolderType)`), so it cannot split on the private setting.
- `GET @root` yields VirtualRooms, Forms, Archive and AI agents roots, with no private root (`Server/Api/FoldersController.cs:1102-1140`).
- The folder listing behind Recent, Favorites and Trash can be scoped only by `folderType` (`Server/ApiModels/RequestDto/GetFolderRequestDto.cs:86-87`). It has no privacy parameter.

Where private rooms live:
- Every room, private or not, is created under the VirtualRooms root (`Core/Core/FileStorageService.cs:669`). The private setting is stored at creation (`:1164-1166`, `:1185`).
- Archive and unarchive move a room between the shared Archive root and VirtualRooms (`Server/Api/VirtualRoomsController.cs:650`, `:687`).

**Client today.**
- Private rooms are listed in Rooms with a badge.
- The `e2e-rooms` app (`packages/client/src/pages/E2eRooms/index.tsx`) frames `/sdk/private`. It has no item in the sidebar that is actually rendered: `ClientArticleSidebar` is the only sidebar in use, and `components/NewArticle` is not imported anywhere.
- The Private card is offered by `getCreateRoomTypes` (`packages/shared/utils/rooms.tsx:86-89`).
- `TreeFoldersStore.isPrivacyFolder` requires `rootFolderType === Rooms` (`packages/client/src/store/TreeFoldersStore.ts:403-411`).
- The MSW rooms-list handler (`packages/shared/__mocks__/handlers/files/roomList.ts`) ignores `privacyFilter`.

No stashed design document covers a private-rooms section. The decisions below follow the Forms commits listed above.

## Goals / Non-Goals

**Goals:**
- Every private room is listed in exactly one place, decided by one predicate ("section available").
- Rooms-list behaviour comes for free: the section list *is* a rooms list (`isRoomsFolder` / `isArchiveFolder` are true there), so only the documented differences are coded.
- No new server dependency.

**Non-Goals:**
- No server-backed root (see Follow-up).
- No change to `isPrivacyFolder` semantics.
- No change to SDK pages beyond the title of the private rooms list, and no change to room pickers.
- Not deleting the dead `components/NewArticle` (it still mentions `e2e-rooms`). That is a separate clean-up.

## Decisions

**D1. Split by `privacyFilter`, applied to the request only.**
- A pure helper in `packages/shared/utils/rooms.tsx` returns the privacy scope for a rooms-list request from the route category and the availability predicate:
  - `Private` on the four `/private` categories;
  - `NotPrivate` on Rooms and Rooms → Archive while the section is available;
  - `null` otherwise.
- It is applied to a clone of the filter immediately before every `api.rooms.getRooms` call that lists the Rooms or the section. Those calls are `fetchRooms` (`store/filesStore/fetch.helpers.ts:749`), `fetchMoreFiles` (`:1094`) and the Rooms refetch in `store/contacts/UsersStore.ts:297-307`.
- It overrides any `privacyFilter` the address carries. It is never written back to `roomsFilter`, so the URL, the filter chips and `isFiltered` stay clean. This is the pattern of the first Forms pass (`972667a8531`).
- Templates, Forms and AI agents searches are not scoped. Private rooms cannot be saved as templates, and the client never sets the private flag on a form-filling or AI room (`room-membership`, "Private room is a flagged Custom room").
- Alternative rejected: carrying `privacyFilter` in the URL. Old bookmarks and links from other sections would bypass it, and the user would see a filter they cannot clear.
- Alternative rejected: a server root like Forms. It needs backend work and would hide private rooms from Rooms even without the opt-in. The user chose the client-only approach.

**D2. One availability predicate.**
- An `AppsStore` getter, `isPrivateRoomsSectionAvailable`, combines two inputs:
  - the opt-in, captured once when the store is constructed;
  - the `e2e-rooms` app state, read the way `isInstalled` reads it (optimistic until the apps list arrives, always on in SaaS) but without re-reading the flag.
- The sidebar, the scope helper, the route guard, the create entry points and the socket predicate all read this one getter. The opt-in is captured once so that a flag flipped from the console cannot produce a half state, in which Rooms already excludes private rooms but no section shows them.
- A MobX reaction on the getter refetches the open Rooms or section list when availability flips. That covers the optimistic apps load turning out "off" on standalone, and an administrator switching the app.
- Alternative rejected: reading the flag on every render, as `getCreateRoomTypes` does. That gives the half state described above.

**D3. Routes and categories, with the archive kept as its own category pair.**

New routes in `packages/client/src/routes/client.js`, next to `forms`, on the same Home view component:
- `private`, `private/filter`;
- `private/:room`, `private/:room/filter`;
- `private/archived`, `private/archived/filter`;
- `private/archived/:room`, `private/archived/:room/filter`.

New categories in `CategoryType`: `PrivateRooms`, `PrivateRoom`, `PrivateArchive`, `PrivateArchivedRoom`.

What each existing helper does with them:
- `getCategoryType` checks `/private` first. The branch handles `archived` itself, because the `/rooms` branch would match "archive" too.
- `getCategoryUrl` maps the four categories.
- `useFiles` treats them like Shared/Archive (a RoomsFilter from the URL, or a default with `searchArea` Active/Archive).
- `moveToRoomsPageImpl` maps room→list within the pair.

A guard element on the `/private` routes waits for the apps list (as `ProtectedAppRoute` does). When the section is not available, it renders `<Navigate replace>` to the Rooms counterpart, keeping the query string.

Alternative rejected: reusing `Shared`/`SharedRoom`/`Archive`/`ArchivedRoom` with a pathname check. `getCategoryUrl` would keep sending every "back to list" path to `/rooms`. About 49 call sites switch on those four values, and each would need a private branch anyway.

**D4. Section identity is the route; one helper names it.**
- The section list's `current` folder is the VirtualRooms root, so `isRoomsFolder` is true there. Likewise `isArchiveFolder` is true on the private archive.
- Section-only differences ask a shared helper, `isPrivateRoomsRoute(pathname)` / `getCategoryType`. Scattered `startsWith("/private")` literals are not used.

The known route checks that must learn `/private`:
- `InfoPanelStore.getIsRooms` (`store/InfoPanelStore.ts:424`), which matches "rooms" in the pathname and would hide the info panel. This repeats the Forms bug fixed in `7c60ea1e065`.
- The 403 redirect in `packages/shared/utils/axiosClient.ts:571-581`.
- The Rooms refetch in `UsersStore.ts:297`.
- The trash-origin detection in `EmptyViewContainer.hooks.ts:263`.
- The crumb title in `fetch.helpers.ts:309`.
- The header "back" scope (`pages/Home/Section/Header/index.js:250`).
- The socket "removed from room" redirect (`socket.helpers.ts:542-556`).

The full list comes from `grep -nE "(indexOf|includes|startsWith)\(\"/?(rooms|forms)"` over `packages/client/src` and `packages/shared` (24 + Forms sites). Each hit is reviewed in task 3.4.

**D5. Opening private rooms: get the route right first, then correct the address after load.**
- `getCategoryTypeByFolderTypeInSection` (`helpers/utils.js:170`) gains the private signal. It picks the private categories when the item is a room with `private === true`, or when the current route is already under `/private`. This mirrors how Forms uses `roomType` plus the route.
- For entry points that cannot know privacy beforehand (a typed or shared `/rooms/shared/{id}` link, Open location, Recent, Favorites), `useFiles` corrects the address after the folder loads:
  - if the loaded folder or any of its `navigationPath` entries is private and the route is a Rooms one, it `navigate(replace)`s to the `/private` counterpart with the same query;
  - in the opposite case it goes back to Rooms.
- The check reads `navigationPath[].private`, not `isPrivacyFolder`, because that getter is false for archived rooms (rootFolderType Archive).
- Cost: one extra listing request on a corrected entry.
- Alternative rejected: resolving privacy before navigation at every entry point. Links and folder ids from feeds carry no privacy, so it would cost a request per click everywhere.

**D6. Creation: reuse the Forms `startRoomType` path and the dialog's key flow.**
- The section's create entry points are the header button (`helpers/getSectionCreateButton.ts`), `Article/MainButton`, `CreateButtonMobile`, the empty view and the `ContextOptionsStore` "+ New". All of them go through one helper, which does the following:
  - without WebCrypto, it shows `Common:EncryptionRequiresHttps` and dispatches nothing;
  - otherwise it dispatches `Events.ROOM_CREATE` with `payload.startRoomType = RoomsTypePrivate`, the mechanism Forms uses for `RoomsType.FormRoom`.
- `CreateRoomDialog` already locks the type for a `startRoomType`. Its key auto-prompt effect (`CreateRoomDialog.js:182-193`) currently runs for template items only; it is widened to "private start type without keys". Generation success keeps the dialog on the Private type. Cancel or error closes it through the existing `onCloseRef`.
- `getCreateRoomTypes` drops `RoomsTypePrivate` in every state. The chooser list and both dropdowns use it.
- Alternative rejected: a separate private-room dialog. It would duplicate title, tags, logo and quota handling.

**D7. Sidebar.** `ClientArticleSidebar` gets the item described in `private-rooms/sidebar-section`:
- id `private-rooms`, icon `catalog.private.react.svg` (already in the repo, used by the apps catalog);
- placed after the Forms block and before AI Agents;
- one child, `private-rooms-archive`, built with `searchAreaUrl("/private/archived/filter", RoomSearchArea.Archive)`;
- no `sectionBadge`, because there is no folder to count against.

`getClientActiveId` checks `/private/archived` and then `/private` before the generic matchers.

**D8. Section UI deltas, each mirroring a Forms condition.**
- Filter (`pages/Home/Section/Filter/index.js`): `getRoomsListBasePath` returns `private` / `private/archived`; type options and the third-party group are dropped as for Forms (`:1117`, `:1417`); `withRoomGroups` is false.
- Header title: `Common:Private` on `PrivateRooms`.
- Crumb and Location root label: `cd2be2ca2ba` pattern.
- Group-context and menu helpers drop create-group/add-to-group on the private route.
- Empty view: the matchers in `EmptyViewContainer.{utils,helpers}.tsx` key by folder type, and the private list root reports Rooms. They get a route-derived discriminator, as `isFormsSectionScope` does, and three new `EmptyView` keys.

**D9. Live updates.** The socket create-folder path (`store/filesStore/socket.helpers.ts:208-223`) decides insertion from `isInSelectedFolder`, which is true for both lists because both have the VirtualRooms root selected. After `getFolderInfo`, a room is inserted only if `folderInfo.private` matches the open list's scope (the D1 helper). The same predicate guards the restore/unarchive and "shared with me" insert paths found in the same file.

**D10. `/e2e-rooms`.**
- The route keeps `ProtectedAppRoute appId="e2e-rooms"`, which sends users to the dashboard while the app is unavailable. Its element becomes `<Navigate replace>` to `/private/filter`, or to `/private/archived/filter` when `section=archive`.
- `pages/E2eRooms` is deleted. `useModuleLauncher` navigates to `/private/filter`.

**D11. Mocks and tests.**
- The MSW rooms-list handler learns `privacyFilter`, mirroring `FolderDao.BuildRoomsQuery` (`FolderDao.cs:2479-2484`) and the third-party skip (`FileSecurity.cs:2916`). Its doc comment names `VirtualRoomsCommonController.GetRoomsFolder`.
- `privateRoomListHandler` keeps serving the private room for `privacyFilter=Private`.
- Unit tests cover: the scope helper, `getCategoryType` / `getCategoryUrl` / `getClientActiveId`, the address-correction decision (a pure function of route + folder data), and the socket predicate.
- A new `private-rooms-section.spec.ts` walks the spec scenarios.

**D12. One name: "Private".**
- The apps catalog entry (`helpers/apps-catalog.tsx:147`) and the SDK list header (`packages/sdk/src/app/(private)/private/page.client.tsx:126-128`) switch from `Common:DashboardE2eRoomsTitle` to `Common:Private`, the key the sidebar and the section header use. Forms does the same with `Common:Forms`.
- The unused `components/NewArticle/index.tsx:512` gets the same key, so nothing references the old one.
- `DashboardE2eRoomsTitle` is then deleted from every `Common.json` and from `public/locales/.meta/Common`. `UselessTranslationKeysTest` (`common/tests/test/locales.test.js:665`) fails on a key that no code uses. The deletion follows `.claude/rules/bulk-locale-edits.md`: a dry run first, then a check that every file lost exactly that one key.
- `DashboardE2eRoomsDescription` stays as the catalog description.
- Alternative rejected: changing the English value of `DashboardE2eRoomsTitle` to "Private". That leaves two keys with the same text and makes every existing translation stale.

## Risks / Trade-offs

- [The base E2E fixture enables the opt-in and the apps mock reports `e2e-rooms` on, so every frame that shows the sidebar gains an item. The suite has 734 PNG baselines.] → Regenerate in Docker with `--update-snapshots=changed` in one task. Review the list of rewritten frames: only sidebar frames and lists that showed a private room may change.
- [Optimistic apps load. On standalone with the app off, Rooms first requests `NotPrivate` and private rooms are missing until the apps list arrives.] → The D2 reaction refetches. The route guard waits for the list before redirecting.
- [Corrected addresses cost one extra request and a visible address change.] → It only happens on cold links and feed entry points. The common path is right first time (D5).
- [Rooms → Recent/Favorites/Trash still mix in private content, and the section has no counter.] → Accepted v1 limitations, written as SHALL NOT requirements. They are removed by the server-backed follow-up.
- [`isPrivacyFolder` is false inside archived private rooms, because their rootFolderType is Archive.] → Already the case in Rooms → Archive today and out of scope here. The section only moves where those rooms are listed.
- [Two archives (Rooms → Archive and Private → Archive) may confuse users who archived a private room before the section existed.] → Each room shows up in exactly one of them. The empty state of Rooms → Archive is unchanged.
- [Coordination with `private-rooms-sdk-gating-and-parity` (its iframe task and scenarios) and with `private-rooms-release-gate` (it removes requirements this change modifies).] → Task 0.1 reconciles the SDK change before either is applied. The release-gate revision is noted in its proposal when it is picked up.

## Migration Plan

- This is a client-only change, shipped behind the opt-in. No data migration: rooms do not move on the server.
- Rollback is a revert. With the change reverted, private rooms are listed in Rooms again and `/e2e-rooms` frames the SDK as before.

## Follow-up: server-backed section

Decided with the user: the backend team will be asked for server-side sections after this change. A full Forms-like section needs the server to repeat `99c9ea065c` for private rooms:
- a new `FolderType` and a tenant root (`FolderDao` bunch key, `GlobalFolder` cache);
- a `SearchArea` value, with `MatchesRoomType` able to see the private setting (today it takes only a folder type, `SearchArea.cs:84-92`);
- a case in `GetRoomsSectionIdAsync`;
- an entry in `GetRootFoldersIdsAsync`;
- new-items routing in `FileMarker`;
- a way to scope Recent/Favorites/Trash by privacy.

The client would then swap `privacyFilter` for that search area and add the counter and the sub-items. That is a separate change, opened once the server work lands.
