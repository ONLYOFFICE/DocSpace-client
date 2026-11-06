# Proposal

## Why

The Private section of the sidebar is built on the client alone
(`private-rooms-sidebar-section`, archived 2026-10-22): it lists the Rooms
root with the privacy filter, so it has no new-items counter, is not a
start page option, and private news stay in the Rooms counter. The backend
developer announced on 2026-11-06 that the server will get a root section
for private rooms, as it got one for form-filling rooms on 2026-07-03
(`99c9ea065c`). This change plans the client side of that section and
records the contract the client expects; its tasks wait for the server
commit.

## What Changes

- The server provides private rooms with a root of their own: a folder type
  and a tenant root, a search area, an entry in the root listing, new-items
  routing on that root, and the matching security and link rules. The
  expected shape is the Forms root as the server built it; the actual shape
  is read in `../server` when it lands (task 1.2), and the server-contract
  delta is corrected before any mock follows it.
- The Private section lists that root through its search area instead of
  filtering the Rooms root, and the Rooms section stops sending the
  exclusion filter.
- The Private sidebar item gets a new-items counter, a new-items panel and
  mark-all-as-read, and the Rooms counter stops counting private rooms.
- Section addresses and live updates are decided by the root a room belongs
  to, not by a private setting read from the room.
- The MSW mocks of the rooms listing and of the root folders mirror the
  server shape once read.
- Decisions 1 to 5 below settle the start page option, room groups, the
  archive of the section, the move of the existing rooms and the listing
  while the section is not available; the requirements that depend on them
  are added to the deltas once decided.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`: "Section lists only private rooms",
  "Rooms section excludes private rooms while the section is available",
  "Scope holds on every request of a list" and "Live updates respect the
  split" change from the privacy filter to the section root; "No new-items
  counter on the section item" and "Rooms counter keeps counting private
  rooms" are removed and replaced by a counter on the Private item; "Section
  is not a start page option" and "No room groups in the section" follow
  decisions 1 and 2.
- `private-rooms/server-contract`: "Private rooms have no section of their
  own on the server" is replaced by the Private root, and "New-items counts
  include private rooms" changes to counts on that root; "Rooms list privacy
  filter", "Room groups ignore privacy" and "Server-built room links" are
  re-read with the server commit and modified if it changes them.

## Impact

- **Server (`../server`), backend team:** the files `99c9ea065c` touched
  for the Forms root, repeated for private rooms: `Folder.cs`
  (`FolderType`), `SearchArea.cs`, `Global.cs` and `FolderDao.cs` (the
  tenant root), `FoldersController.cs` (the root listing and a section
  route), `VirtualRoomsController.cs` (`GetRoomsSectionIdAsync`),
  `FileMarker.cs`, `FileSecurity.cs`, `FileDeleteOperation.cs`,
  `PathProvider.cs`, and `RoomGroup.cs` with `GroupsController.cs` if groups
  come, plus the move of the existing private rooms under the new root.
- **Client:** `packages/client/src/components/ClientArticleSidebar`,
  `packages/client/src/routes/client.js`,
  `packages/client/src/store/filesStore` (fetch and socket helpers),
  `packages/client/src/store/filesActionsStore/navigation.helpers.ts`,
  `packages/client/src/pages/Home/Hooks/useFiles.ts` and
  `packages/client/src/pages/Home/Section/Filter`,
  `packages/client/src/helpers/{articleNavigation.ts,utils.js}`,
  `packages/client/src/components/EmptyContainer`, the new-items panel and
  `packages/client/src/store/FilesHeaderOptionStore.ts`.
- **Shared:** `packages/shared/utils/rooms.tsx` (with
  `rooms.privacyScope.test.ts`), `packages/shared/api/rooms/filter.ts`,
  `packages/shared/services/private-room/rooms-with-own-access.ts`, the
  enums (`RoomSearchArea`, `FolderType`), and the mocks
  `packages/shared/__mocks__/handlers/files/{privateRoomList.ts,roomList.ts}`
  with the root folders handler.
- **SDK:** the private pages of `packages/sdk/src/app/(private)` list
  private rooms through the shared helpers; checked at the read (task 6.1).
- **E2E:** `packages/client/__tests__/private-rooms-section.spec.ts` and
  the sidebar screenshots.

## Out of scope

- Encryption, keys and the member flows: the section is navigation only
  (`private-rooms/sidebar-section`, "Encryption does not depend on the
  section").
- The server work itself, which the backend team does; this change holds
  its client side and the mirror.
- Section availability (`private-rooms/feature-gating`), unchanged.

## Decisions needed

1. Start page: whether the Private section is offered as a default start
   page once it has a root ("Section is not a start page option" withholds
   it "in this version"). Owner: feature owner.
2. Room groups: whether the server's group area gains a Private value and
   the section offers groups ("No room groups in the section"), or groups
   stay withheld. Owner: feature owner with the backend team.
3. Archive: whether archived private rooms stay in the shared Archive root,
   listed under Private → Archive through the section's archive search area
   as archived form rooms are, or get an archive of their own. Expected: the
   shared Archive, as for Forms. Owner: backend team.
4. Existing rooms: how private rooms created under the Rooms root move
   under the new root (a migration or a move on read). Owner: backend team;
   the client reads the root folder type from the folder data either way.
5. Listing while the section is not available: `private-rooms/feature-gating`
   lists private rooms in Rooms while the E2E rooms app is off. With a root
   of their own, either the client requests the Private root as well and
   merges it into Rooms, or the server lists them under the Rooms root while
   the app is off. Owner: backend team with the feature owner.
