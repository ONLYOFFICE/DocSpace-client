# Design

## Context

See proposal.md. The section today (`private-rooms-sidebar-section`,
archived; its design decision D1): the client derives the search area from
the address and adds `privacyFilter=Private` to the section's rooms
requests and `privacyFilter=NotPrivate` to the Rooms requests while the
section is available; the socket helpers read the private setting of a
room that arrives through a live update, because the event carries none;
the Private item has no counter, since `FileMarker` walks the parent chain
up to the Rooms root with no privacy check and counts private news there.

The Forms root, as the server built it in `99c9ea065c` and as read on
2026-11-06 through CodeGraph on `release/v4.1.0` (`b562fc3fb1`):

- a folder type for the root, `FolderType.Forms = 36`
  (`products/ASC.Files/Core/Core/Entries/Folder.cs:130-131`), and a tenant
  root cached by `GlobalFolder.GetFolderFormsAsync`
  (`products/ASC.Files/Core/Helpers/Global.cs:564-575`, through
  `FolderDao.GetFolderIDFormsAsync`);
- a search area, `SearchArea.Forms`, serialized by name, and
  `MatchesRoomType`, which puts `FillingFormsRoom` rooms in the Forms
  section and every other room in Rooms from the folder type alone
  (`products/ASC.Files/Core/Core/VirtualRooms/SearchArea.cs:41-95`); a
  private area needs the private setting as well, since a private room
  keeps its room type;
- `GetRoomsSectionIdAsync` mapping the area to its root
  (`products/ASC.Files/Server/Api/VirtualRoomsController.cs:1425-1436`),
  with `Archive` mapped to the shared Archive root for every area;
- the root listing `GET files/@root` yielding the Forms root after Rooms
  and before Archive
  (`products/ASC.Files/Server/Api/FoldersController.cs:1122-1160`), and a
  section route reading the root's content (`:1119`);
- new items counted per root (`FileMarker.GetRootFoldersIdMarkedAsNewAsync`,
  `products/ASC.Files/Core/Utils/FileMarker.cs:767-787`, and
  `GetRootGroupedNewItemsAsync`, `:790`), so a root of its own gives the
  section a counter and a panel;
- room groups tied to a section through `RoomGroupArea`
  (`products/ASC.Files/Core/Core/Entries/RoomGroup.cs:56-74`) and validated
  in `GroupsController.ValidateSearchArea`
  (`products/ASC.Files/Server/Api/GroupsController.cs:313-321`), which
  accepts Active and Forms only.

The client handles the Forms root in `ClientArticleSidebar`,
`articleNavigation.ts`, `useFiles.ts`, the section filter,
`navigation.helpers.ts`, `socket.helpers.ts`, `contextOptions.helpers.ts`,
`FilesHeaderOptionStore.ts`, `EmptyViewContainer.hooks.ts` and
`EditRoomGroupsDialog` (`RoomSearchArea.Forms`, `FolderType.FormRooms`);
the Private section takes the same paths.

The server work landed on 2026-11-06 and is read below. Until then the
`server-contract` delta described the target on the Forms model. It was
corrected at the read (task 1.2), before any mock followed it. No stashed
design document covers a server section. The archived sidebar change
recorded the follow-up with the user on 2026-10-22.

### Landed on 2026-11-06 (read in `c866c055e1`)

Read through CodeGraph and in the source on `release/v4.1.0`. The backend
team's note of the same day ("Private rooms: how to work through the API")
describes the same commit; where the note and the code differ, the code is
recorded.

- **Root.** `FolderType.PrivateRooms = 42`
  (`products/ASC.Files/Core/Core/Entries/Folder.cs:152`), a tenant root
  `privaterooms` created on first read
  (`FolderDao.GetFolderIDPrivateRoomsAsync`, `FolderDao.cs:2283`, cached by
  `GlobalFolder.GetFolderPrivateRoomsAsync` in `Global.cs`), titled
  "Private" (`FilesMappingAction.cs`, `FilesUCResource.PrivateRooms`).
  **The root holds no rooms.** Private rooms stay under the Rooms root, keep
  `VirtualRooms` as their root folder type and the Rooms root as their
  parent, and the section is chosen by the room's private setting, not by a
  room type. No room was moved.
- **Root listing and route.** The root is listed by `GET files/@root` and
  `GET files/@private` reads it (`FoldersController.cs:1146`), both only
  while the `e2e-rooms` app is on (`IsPrivateRoomsAppEnabledAsync`,
  `:1149`, `:1198`). With the app off, `@private` answers 404 and the root
  is not listed. The section's content is built from the Rooms tree, as for
  Forms (`FileStorageService`, `parent.FolderType is Forms or PrivateRooms`).
- **Search area.** `SearchArea.PrivateRooms`, serialized by name.
  `SearchArea.MatchesRoom` (`SearchArea.cs:90-96`) replaces
  `MatchesRoomType`: `Active` and `Templates` take rooms that are neither
  form rooms nor private, and `PrivateRooms` takes private rooms of any
  type. `GetRoomsSectionIdAsync` maps the area to the new root
  (`VirtualRoomsController.cs:1433`).
- **Privacy filter on the rooms list.** `FileSecurity` (`:2983-2995`) reads
  `searchArea=Active&privacyFilter=Private` as the `PrivateRooms` area,
  which is how today's client builds its section. It then forces the filter
  by area: `PrivateRooms` means private, and `Active` means not private
  whatever the request says. **So `Active` without a filter no longer
  returns private rooms.** On every other area the filter applies as before,
  so archived private rooms are `searchArea=Archive&privacyFilter=Private`
  in the shared Archive.
- **Recent.** `searchArea=PrivateRooms` there answers 400
  (`EntryManager.cs:439`): Recent picks files by the type of their room.
- **New items.** The section has a count, but no news listing of its own.
  - **The count.** `FileMarker.SetTagsNewAsync` (`FileMarker.cs:1104-1213`)
    reads the marks of the Rooms root when the parent is the Private root,
    keeps those of private rooms, and writes the sum to the root's own
    `new` (`Current.New`), because the anchor holds no children. The Rooms
    root keeps the rest and saves the corrected count on its first read. The
    count therefore reaches the client in the `current.new` of the Private
    root in `GET files/@root` and of `GET files/@private`, the same way as
    for Forms. `getFoldersTree` takes `current.new` only for Forms today.
    The top-level `new` of an anchor stays 0
    (`PrivateRoomSectionTests.NewItems_CountInTheSectionAndNotInRooms`
    checks `Current.New` only).
  - **The news listing.** The section has none. `GET files/{folderId}/news`
    on the Private root reads the marks of that folder's own tree
    (`FileMarker.GetMarkedEntriesAsync`, `:903-925`, with no redirect to
    the Rooms root), so for an anchor it finds none. `GET files/rooms/news`
    (`VirtualRoomsController.GetRoomsNewItems`, `:1829`) lists the news of
    every room under the Rooms root, private and form rooms included, as
    before.
  - **How the Forms panel works around this.** The Forms item already takes
    this route: `NewFilesPanel` asks for `rooms/news` and splits the groups
    by room type on the client (`filterRoomGroups`). Its mark-all-as-read
    marks each room by id, since marking the anchor does nothing:
    `RemoveMarkAsNewAsync` (`:583-599`) returns when the folder has no marks
    of its own.
  - **Today's Rooms panel.** It still lists the news of private rooms while
    the Rooms count no longer includes them.
- **Room groups.** `RoomGroupArea` and `GroupsController.ValidateSearchArea`
  accept `PrivateRooms` (`RoomGroup.cs:67`, `:80`; `GroupsController.cs:319`).
  A group takes rooms of its own section only. A private room linked to a
  Rooms group is no longer shown or counted there, and the link is kept
  (`PrivateRoomSectionTests.Group_TakesRoomsOfItsOwnSectionOnly`).
- **Start page.** `SettingsController` accepts the root as a default start
  folder (`web/ASC.Web.Api/Api/Settings/SettingsController.cs:1099`).
- **Room links unchanged.** `PathProvider` builds links by the root folder
  type. A private room's is `VirtualRooms`, so its link stays
  `rooms/shared/{id}/filter?folder={id}`. The new `private/{id}/filter` arm
  serves only the root itself.
- **Used space** stays in the Rooms counter. The root has no counter of its
  own (`FolderDao.cs:2283`).
- **Tests:** `PrivateRoomSectionTests` covers the Rooms area without private
  rooms, both ways of asking for the section, the `@private` route and the
  root by id, the root listing, the app turned off, an administrator outside
  the room, a member, the archive, new items, Recent and groups.
- **Not addressed by the commit, as it says itself:** a subfolder of a
  private room still goes to Trash, and a private room or its subfolder can
  still be added to Favorites.
- **The note against the code:** the note says that a public room and a
  form-filling room "are refused" as private. `CreateRoomAsync`
  (`FileStorageService.cs:666-690`) and `InternalCreateFolderAsync`
  (`:1220-1230`) refuse no room type with the private flag: only AI hub
  types, keys, the Document Server, indexing, lifetime and watermark. The
  room is created, and its link fails later
  (`private-rooms-server-hardening` 12.8, still open).
- **The client today.** The client does not know the new root type: the kit's
  `FolderType` ends at `AiHub = 41`. `getFoldersTree` takes it into the
  tree folders with the server's title, where it only gets a socket
  subscription and no sidebar item, so nothing new is shown. Today's
  section requests (`Active` with `Private`, `Archive` with `Private`) and
  Rooms requests (`Active` with `NotPrivate`) keep working. With the section
  not available, a Rooms request carries no filter and now lists no private
  room (proposal decision 5).

### Destination picker, stand check of 2026-11-11

Checked on `tests.onlyoffice.io` (DocSpace 4.1.0.12366, Document Server
10.0.3.19) as an owner of two private rooms, after the rooms list mocks were
made to mirror the server and six cases of
`packages/client/__tests__/private-room-cross-room-copy.spec.ts` failed on
them. Nothing was copied.

- **No private room can be picked.** The Copy dialog opened on a file of a
  private room shows the path "Apps → Rooms → the room". Its Rooms level
  finds the other private room neither in the list nor by search, and the
  root level lists rooms only, with no Private entry.
- **The request.** The selector sent
  `GET files/rooms?type=2&type=5&type=6&type=8&count=100&startIndex=0&filterValue=`,
  with no search area and no privacy filter. The server reads a missing area
  as `Active` (`VirtualRoomsController.cs:1494`) and forces the non-private
  filter on it (`FileSecurity.GetVirtualRoomsAsync`, `FileSecurity.cs:2981-2993`),
  so the answer held 95 rooms and no private one. The source room is not in
  it either.
- **The server side is there.** On the same portal `searchArea=PrivateRooms`
  and `searchArea=Active&privacyFilter=1` both answer the two private rooms,
  and `GET files/@root` lists the Private root (`rootFolderType` 42) with
  them.
- **Where the request is built.** In the kit: `useRoomsHelper`
  (`selectors/utils/hooks/useRoomsHelper.tsx`) passes room types and a search
  area only for the Forms and AI rooms sections, and `useRootHelper`
  (`selectors/Files/hooks/useRootHelper.tsx`) builds the root list from the
  root folder types it knows, adding Forms as an entry off the Rooms root.
- **Also seen.** The root of the path is labelled "Apps" in the Russian
  interface, and a search typed at the root level sends no request.

So a copy into another private room, which the main spec `file-operations`
offers ("Copy into another private room needs access to it"), has had no
reachable destination on a real portal since `c866c055e1`. The former mocks
listed private rooms in the Rooms area and hid it.

### The section list under its own root (found on 2026-11-12)

Decision 2 says that only the data source changes. That missed one thing:
`searchArea=PrivateRooms` answers the list under the Private root (`current`
with root folder type 42, `parentId` 0), not under the Rooms root, while every
room in it still reports the Rooms root as its root and its parent. The first
E2E run on such a list failed 11 cases of `private-rooms-section.spec.ts`: the
row links, the filter block, the empty states, the creation entry points, the
hotkey and the key prompt.

The owner decided on 2026-11-12 to keep the area and teach the client the
root, since the section is now a root category of its own, and asked for
every place that leaned on the earlier shape to be accounted for. The
alternative, to keep `searchArea=Active&privacyFilter=Private` for the
section, stays rejected.

An inventory of the client, the shared package and the SDK (every use of the
Private route check, the Private categories, the privacy filter, the Rooms
root type and the Rooms root id) gave two groups.

**Decided by the address, not touched by the root.** Most of the section:
the route guards, the article item and its active state, the section filter
and sort, the empty-view texts, the header title, the create dialog and the
key prompt, navigation between the section, its archive and a room, the
no-access view, the info panel, the context and header menus. They read the
pathname or the category of the address and keep working.

**Decided by the root of the open list.** These needed the Private root:

| Place | What it decided by | Change |
| --- | --- | --- |
| `getCategoryTypeByFolderType` (`helpers/utils.js`), which sets the list category after every fetch | the root folder type of `current`; an unknown type fell to Personal, and the row links, the filter, creation and the hotkeys followed it | type 42 gives the Private list category |
| `TreeFoldersStore.isRoomsFolder` and `isRoomsFolderRoot` (over a hundred readers) | the id and the type of the Rooms root | true for the Private root as well: it is a rooms list, and the address tells the two apart |
| `sortInDisplayOrder` (`shared/utils/common.tsx`), which builds the tree | a fixed list of root types; the Private root was dropped | the root is kept, after Forms |
| `TreeFoldersStore.fetchTreeFolders` | the root's server title | titled Common:Private |
| `FilesStore.canCreate` | the root folder type | the Private root creates as Rooms does |
| the section header (`pages/Home/Section/Header`) | `rootFolderType === Rooms` | the Private root counts as the rooms root |
| the empty view (`EmptyViewContainer`) | matchers on the Rooms root type | the Private root is read as the rooms root there |
| live updates (`filesStore/socket.helpers.ts`) | a new room is counted and inserted when its parent is the open folder | a room's parent is the Rooms root, so the open Private list takes a room by that parent; its private setting then decides, as before |
| the frame's custom actions (`shared/utils/frameCustomActions.ts`) | the host's section, read from the root of the open list | the Private root maps to the host's `rooms` section, which the list had under the Rooms root; the frame contract names no section of its own for it |

Left as they are, on purpose: the AI suggestions map by root
(`helpers/aiSuggestions.ts`), since the section offers no AI chat, and the
catalog icon by root type, since the sidebar item of the section brings its
own icon and a tree-built menu skips a root without one.

Rooms and everything inside them keep the Rooms root type, so the checks made
on an item or on a folder inside a room (sharing, links, quota, upload
targets, the archive and restore destinations) are not affected.

### Integration runs of 2026-11-12 (task 7.1)

- Client, Docker `tests-dev`: the private-room specs, the keys pages and
  `encrypted-file-ui.spec.ts` pass, 163 of 163.
- Client, the whole suite: 907 passed, 330 failed. None of the failures comes
  from this change. 329 are screenshot comparisons that fail on wording changed
  outside it: the sidebar item "AI rooms" is "AI Workspace" since
  `d81d6fb6564`, and the Dashboard, AI settings and integration texts moved
  too; the Private item itself matches in every screenshot. One is
  `unpaid-portal-requests.spec.ts`, which meets three AI price requests that
  are not on its allowlist. The screenshots were not regenerated here: the
  baselines belong to those changes.
- SDK, a local production build: `__tests__/e2e/private` passes, 36 of 50, the
  other 14 are fixme: eleven of `private-security.spec.ts` and three of
  `private-rooms.spec.ts`.
- The pre-push gate and `openspec validate --all --strict` (19 of 19) are
  green.
- Not done: the check on a stand with `c866c055e1`.

Repeated the same day on `36ac056fc52`, after the release branch with a new
ui-kit build was merged in, with the test images rebuilt:

- The pre-push gate is green.
- Client, the whole suite: again 907 passed and 330 failed, the same 329
  screenshots and the same allowlist case; the merge added no failure. The
  owner asked for the screenshots, so the 506 baselines of the 53 specs are
  regenerated (`0847831ba8d`) and those specs pass, 680 of 680.
  `unpaid-portal-requests.spec.ts` still fails.
- SDK `__tests__/e2e/private`: 36 passed, 14 fixme.
- Doceditor, Docker: `private-room-editor.spec.ts` passes. One case of
  `form-field-changes.spec.ts`, which came with the merge, fails unsteadily
  ("Report failed, then the editor closed"): on desktop and tablet in one
  run, on desktop only in the next.

### Stand check of 2026-11-12 (task 7.1)

On the owner's local stand, through the browser, with the client of this
branch:

- `files/@root` lists the Private root (type 42) after Forms and
  `files/@private` answers it. The Private list opens with
  `searchArea=PrivateRooms` and is answered under that root, while its rooms
  keep the Rooms root and parent. The Rooms list holds no private room.
- The sidebar shows Private after Forms, with its Archive, which opens with
  `searchArea=Archive`.
- The move picker of a folder in a private room starts at the room and has
  no root. The copy picker of a file starts at Private, its root lists
  Files, Rooms, Forms and Private, Rooms lists the ordinary room only, and a
  copy into another private room is stored there encrypted under a new
  opaque name, readable in that room, with the source left in place.
- Room groups: a group is created from the Private list out of private
  rooms only, belongs to the `PrivateRooms` area, is not listed in Rooms,
  filters the list by its chip, and add-to-group from a room's menu lists it
  and adds the room.
- Not checked: the count of new items on the Private item, which needs a
  second user on the stand. Unit and E2E tests cover it.

## Goals / Non-Goals

**Goals:**
- The Private section becomes a server section: counter, panel,
  mark-all-as-read, and listings that depend on no client-side filter.
- The addresses and the availability rule stay as they are. Every withheld
  action of the section stays too, except room groups.
- The section can be the start page and has room groups (proposal decisions
  1 and 2).
- The mocks mirror the server once read, never a planned shape.

**Non-Goals:**
- Changing how private rooms are opened, left, created or encrypted.
- Section availability.

## Decisions

1. **The client followed the server, and no mock ran ahead.** The main spec
   `private-rooms/server-contract` ("E2E mocks mirror the server contract")
   forbids a handler for a shape the server does not have. So every client
   task waited for the read of 1.2, which corrected the planned Forms model
   in one point: private rooms are not moved under the new root.

2. **The section keeps its addresses and its rules; only the data source
   changes.**
   - `/private` and `/private/archived` stay, the availability rule of
     `private-rooms/feature-gating` stays, and so do the withheld actions
     (no AI chat, no onboarding tour, no Recent or Favorites). Room groups
     come to the section (proposal decision 2).
   - The section list asks for `searchArea=PrivateRooms`, and its Archive
     for `searchArea=Archive&privacyFilter=Private`, since the server has no
     archive area per section and keeps the filter there.
   - The Rooms list asks for `searchArea=Active` with no filter: the server
     leaves private rooms out of that area whatever the filter. A private
     filter sent there would turn the request into the section.
   - Rooms → Archive keeps `privacyFilter=NotPrivate`, because the shared
     Archive holds both kinds.

   Alternative: keep `searchArea=Active&privacyFilter=Private` for the
   section, which the server still reads as the section. Rejected: it relies
   on a compatibility path the server keeps for today's client, and naming
   the area says what is meant.

3. **Addresses and live updates keep deciding by the private setting.** A
   private room reports the Rooms root as its root and the Rooms root as its
   parent. The setting on the room is therefore the only signal the client
   gets, both for the address decision ("Section addresses are decided
   before the folder is shown") and for the socket split ("Live updates
   respect the split"), which stay as they are. The planned switch to the
   root folder type (former tasks 3.2 and 3.3) is dropped. Alternative: ask
   the server to report the Private root as the root folder type of a
   private room. Not asked: it would change every room link and every check
   the server keys on `VirtualRooms`.

4. **The counter is the root's counter.** The Private item shows the count
   the root listing gives for the Private root. As with Forms, that is the
   folder's own `new`, because the anchor holds no children (`getFoldersTree`
   already special-cases Forms). The Private item gets the same panel and
   mark-all-as-read as Rooms. The Rooms counter already leaves private rooms
   out on the server. Alternative: a count derived from the listing on the
   client. Rejected: it is what the archived change could not do correctly.

5. **The root type comes from the kit.** `FolderType` is the kit's enum and
   ends at `AiHub = 41`. `PrivateRooms = 42` is added in
   `docspace-ui-kit-react` on `release/v4.1.0`, which ships with the release.
   `RoomSearchArea.PrivateRooms` is added in this repository's enums.
   Alternative: a local constant in shared. Rejected: the enum is shared by
   every app.
6. **The destination picker lists private rooms under a Private entry, built
   in the kit.** The files selector is the kit's, and it already shows a
   section that lives off the Rooms root as an entry of its own: Forms. The
   Private section takes the same shape, behind an opt-in of the host, and
   lists through `searchArea=PrivateRooms` ("Destination picker, stand check
   of 2026-11-11"). The client opts in for a Copy from a private room only:
   a transfer into a private room from outside is refused, and a Move stays
   in its room. Alternative: send `privacyFilter=Private` with the selector's
   Rooms request for a private source. Rejected: it would show private rooms
   under Rooms, where no other list of the client shows them.

## Risks / Trade-offs

- [Private rooms invisible while the section is not available] → Decided so
  (proposal decision 5). A member still reaches a room by its address,
  through the fallback of the section addresses.
- [Today's client between the server commit and this change] → The section
  requests (`Active` with `Private`, `Archive` with `Private`) and the Rooms
  requests (`Active` with `NotPrivate`) keep working. The Private item has no
  counter yet, and the Rooms counter no longer counts private news. The new
  root sits unnamed among the tree folders. Check the root list, the sidebar
  and the move and copy picker on a stand with the build.
- [The sidebar screenshots move] → Regenerated under Docker with the full
  E2E run (task 7.1) and announced to the teams that merge into the release
  branch.
- [The SDK private pages list through the shared helpers] → Task 6.1.

## Migration Plan

1. Done: the backend team landed the section, and task 1.2 read it and
   corrected the deltas and the proposal decisions.
2. Then: the kit's `FolderType` (1.3), the mocks (group 2), the listing
   (group 3) and the counter (group 4).
3. Rollback: revert the client work as a whole. The server keeps answering
   today's client (the section through `Active` with `Private`).

## Open Questions

None. Proposal decisions 1, 2 and 5 were taken on 2026-11-06.
