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

The server work is announced, not on the branch. Nothing here is the
server's shape until it is read: the `server-contract` delta of this change
describes the agreed target on the Forms model and is corrected at the read
(task 1.2) before any mock follows it, the way
`private-rooms-server-hardening` handled its backend items. No stashed
design document covers a server section; the archived sidebar change
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
- **New items.** `FileMarker` counts the marks of private rooms under the
  Private root and leaves them out of the Rooms root (`:1179` and the
  `PrivateRooms` arms around it). The anchor holds no children, so the
  root's count is surfaced directly, as for Forms, and the Rooms badge now
  shows the corrected count on its first read.
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

1. **The client waits for the server; no mock runs ahead.** The main spec
   `private-rooms/server-contract` ("E2E mocks mirror the server contract")
   forbids a handler for a shape the server does not have, so every client
   task of this change is blocked on task 1.2. Alternative: build the
   client against the Forms model now and adjust at the read; rejected, the
   archived sidebar change already took the client-only route and a second
   rewrite before the read would make it three.

2. **The section keeps its addresses and its rules; only the data source
   changes.** `/private` and `/private/archived` stay, the availability
   rule of `private-rooms/feature-gating` stays, and so do the withheld
   actions (no AI chat, no groups unless decided, no onboarding tour, no
   Recent or Favorites). The listing requests carry the section's search
   area instead of the privacy filter; the Rooms requests carry no privacy
   filter any more, because private rooms no longer live under the Rooms
   root. Alternative: keep sending the privacy filter as belt and braces;
   rejected, it would hide a private room the move of proposal decision 4
   left under Rooms instead of showing the defect.

3. **Section addresses and live updates decide by the root, not by the
   private setting.** Today the client decides the section of a folder from
   the private setting of its room ("Section addresses are decided before
   the folder is shown") and reads the room on a live event because the
   event carries no private flag. With a root of its own the folder data
   carries the root folder type and the parent id, so the address decision
   and the socket split read those; the private setting keeps deciding
   encryption and nothing else ("Encryption does not depend on the
   section"). Alternative: keep both signals; rejected, they disagree
   while the existing rooms are moved.

4. **The counter is the root's counter.** The Private item shows
   `FileMarker`'s count for the Private root, as the Rooms and Forms items
   do for theirs, with the same panel and mark-all-as-read; the Rooms
   counter stops counting private rooms because the server's routing
   changes, not because the client subtracts. Alternative: a count derived
   from the listing on the client; rejected, it is what the archived change
   could not do correctly.

## Risks / Trade-offs

- [The server shape differs from the Forms model] → the delta and the tasks
  are corrected at the read before anything is built; no code is written
  against the model.
- [Existing private rooms left under the Rooms root during the move] →
  proposal decision 4; the client shows what the server lists and filters
  nothing.
- [Private rooms invisible while the app is off] → proposal decision 5
  before task 3.1; the feature-gating requirement that lists them in Rooms
  stays.
- [The sidebar screenshots move] → regenerated under Docker with the full
  E2E run (task 7.1) and announced to the teams that merge into the release
  branch.
- [The SDK private pages list through the shared helpers] → task 6.1 checks
  them at the read.

## Migration Plan

1. The backend team lands the section; task 1.2 reads it and corrects the
   delta and the proposal decisions.
2. Mocks follow (group 2), then the listing and navigation (group 3), then
   the counter (group 4).
3. Rollback: the client work is reverted as a whole; the server keeps
   answering the Rooms listing with the privacy filter, which the main spec
   still requires until this change is archived.

## Open Questions

- Proposal decisions 1 to 5. Decisions 1 and 2 add requirements to the
  deltas (group 5); decisions 3 to 5 are settled by the server commit and
  recorded at the read (task 1.2) before group 3.
