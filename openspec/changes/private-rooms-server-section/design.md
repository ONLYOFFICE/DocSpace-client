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

## Goals / Non-Goals

**Goals:**
- The Private section becomes a server section: counter, panel,
  mark-all-as-read, and listings that depend on no client-side filter.
- The addresses, the availability rule and every withheld action of the
  section stay as they are.
- The mocks mirror the server once read, never a planned shape.

**Non-Goals:**
- Changing how private rooms are opened, left, created or encrypted.
- The start page option and room groups, unless decided (proposal decisions
  1 and 2).
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
     (no AI chat, no groups unless decided, no onboarding tour, no Recent or
     Favorites).
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

## Risks / Trade-offs

- [Private rooms invisible while the section is not available] → The server
  already behaves this way. Proposal decision 5 picks between accepting it
  in the spec and listing them through the `PrivateRooms` area. Task 3.1
  waits for it.
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

- Proposal decisions 1, 2 and 5.
