# Proposal

## Why

The Private section of the sidebar is built on the client alone
(`private-rooms-sidebar-section`, archived 2026-10-22). It lists the Rooms
root with the privacy filter, so:
- it has no new-items counter;
- it is not a start page option;
- private news stay in the Rooms counter.

The server landed a section for private rooms on 2026-11-06 (`c866c055e1`),
built the way the Forms section was on 2026-07-03 (`99c9ea065c`). This
change holds the client side of that section and keeps the specs in line
with what the server does.

## What Changes

- **On the server (landed, `c866c055e1`):** the section gets a root of its
  own:
  - folder type `PrivateRooms` (42);
  - a search area;
  - `GET files/@private`;
  - an entry in the root listing while the E2E rooms app is on;
  - new items counted on that root;
  - room groups of the section;
  - the root as a possible start page.

  The root holds no rooms. Private rooms stay under the Rooms root with its
  root folder type, and the section is a view chosen by the room's private
  setting. The Rooms area no longer lists private rooms, whatever the
  filter.
- The Private section lists its rooms through the section's search area.
  Its Archive is the shared Archive with the private filter. The Rooms list
  sends no privacy filter, and Rooms → Archive keeps the non-private filter.
- The Private sidebar item gets a new-items counter, a new-items panel and
  mark-all-as-read. The Rooms counter already leaves private rooms out on
  the server.
- Section addresses and live updates keep deciding by the room's private
  setting, the only signal the server gives. A private room reports the
  Rooms root as its root.
- The MSW mocks of the rooms listing, the root folders and the section route
  mirror the server.
- The new root type reaches the client through the kit's `FolderType`
  (`PrivateRooms = 42`), a change in `docspace-ui-kit-react`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`:
  - "Section lists only private rooms", "Rooms section excludes private rooms
    while the section is available" and "Scope holds on every request of a
    list" move from the privacy filter to the section's search area.
  - "No new-items counter on the section item" and "Rooms counter keeps
    counting private rooms" are removed and replaced by a counter on the
    Private item.
  - "Section is not a start page option" and "No room groups in the section"
    follow decisions 1 and 2.
  - "Live updates respect the split" is unchanged.
- `private-rooms/server-contract`:
  - "Private rooms have no section of their own on the server" is replaced by
    "Private root".
  - "Rooms list privacy filter" says that the Rooms area leaves private rooms
    out and that the private filter on it means the section.
  - "Room groups ignore privacy" is replaced by "Room groups belong to one
    section".
  - "New-items counts include private rooms" counts on the Private root.
  - "Server-built room links" is unchanged.

## Impact

- **Server (`../server`):** done in `c866c055e1` (design.md, "Landed on
  2026-11-06"). Not addressed there, as the commit says itself: a subfolder
  of a private room still goes to Trash, and a private room or its subfolder
  can still be added to Favorites.
- **ui-kit (`docspace-ui-kit-react`, `release/v4.1.0`):** `FolderType.PrivateRooms = 42`.
- **Client:**
  - `packages/client/src/components/ClientArticleSidebar`
  - `packages/client/src/pages/Home/Hooks/useFiles.ts` and
    `packages/client/src/pages/Home/Section/Filter`
  - `packages/client/src/helpers/articleNavigation.ts`
  - `packages/client/src/store/TreeFoldersStore.ts`
  - the new-items panel and `packages/client/src/store/FilesHeaderOptionStore.ts`
- **Shared:**
  - `packages/shared/utils/rooms.tsx` (with `rooms.privacyScope.test.ts`)
  - `packages/shared/api/rooms/filter.ts`
  - `getFoldersTree` in `packages/shared/api/files`
  - `packages/shared/services/private-room/rooms-with-own-access.ts`
  - `RoomSearchArea` in the enums
  - the mocks `packages/shared/__mocks__/handlers/files/{privateRoomList.ts,roomList.ts}`
    with the root folders handler
- **SDK:** the private pages of `packages/sdk/src/app/(private)` (task 6.1).
- **E2E:** `packages/client/__tests__/private-rooms-section.spec.ts` and the
  sidebar screenshots.

## Out of scope

- Encryption, keys and the member flows: the section is navigation only
  (`private-rooms/sidebar-section`, "Encryption does not depend on the
  section").
- Trash and Favorites for subfolders of private rooms, which the server
  commit leaves open. The client already withholds Favorites for private
  items.
- Section availability (`private-rooms/feature-gating`), unchanged.

## Decisions needed

1. **Start page:** whether the client offers the Private section as a default
   start page. The server accepts the root as a start folder since
   `c866c055e1`, while "Section is not a start page option" withholds it "in
   this version". Owner: feature owner.
2. **Room groups:** whether the section offers room groups. The server has
   the `PrivateRooms` group area since `c866c055e1`, while "No room groups in
   the section" withholds them. Owner: feature owner.
3. **Archive:** answered by the server: archived private rooms stay in the
   shared Archive, listed with the private filter.
4. **Existing rooms:** answered by the server: nothing moves, private rooms
   stay under the Rooms root.
5. **Listing while the section is not available.** The server's answer:
   `searchArea=Active` without a filter no longer lists private rooms, so on a
   standalone portal with the E2E rooms app off, or in a frame without the
   opt-in, the client shows them nowhere. The main spec still says the Rooms
   list shows them with their badge then. Either:
   - (a) accept that, and say in the spec that private rooms are not listed
     while the section is not available; or
   - (b) keep them in Rooms by asking the server with the `PrivateRooms`
     area, which the rooms list answers whatever the app, and merging the
     two lists.

   Owner: feature owner.
