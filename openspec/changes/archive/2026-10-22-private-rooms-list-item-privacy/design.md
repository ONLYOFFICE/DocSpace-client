# Design

## Context

- `buildFilesListItems` (`packages/client/src/store/filesStore/filesList.helpers.ts`) destructures the server item with `private: isPrivateRoom` (line 112) and returns `isPrivateRoom: !!isPrivateRoom` (line 314) together with `...rest`. `private` is therefore absent from every list item. It came with the refactor `567ae3492de` (2026-07-08, "extract getFilesListItems into buildFilesListItems").
- Consumers that read `private` from a room selected in a list (the info panel selection, built from `filesStore.selection` or `bufferSelection`):
  - `pages/Home/InfoPanel/Body/views/Members/index.tsx:499` (`infoPanelRoomSelection?.private`) hides the public-link block;
  - `Members/sub-components/User.tsx:200` (`room.private`, with `room = infoPanelSelection`) guards member removal with the active-upload check, the encrypted-room confirmation and `revokeEncryptedAccess()`;
  - `InfoPanel/Body/views/Details/index.tsx:205` and `InfoPanel/Body/sub-components/ItemTitle/RoomsItemTitle.tsx:148` (`"private" in selection`) colour the room badge.
- Readers of `private` that a list item does not reach:
  - `helpers/info-panel/tabs.ts:132` reads it only on the Share branch, which requires `!isRoomUtil(selection)`; a room takes the rooms view and gets Members instead, so no room is offered Share whatever its flag.
  - `components/panels/InvitePanel/index.js:280, 457, 876` reads it from `selectRoom`, which takes the room from `filesStore.folders` when it is in the open list and from `getFolderInfo` otherwise. Both are server room DTOs: `folders` is set from the response as fetched (`setFolders(data.folders)` in `filesStore/fetch.helpers.ts`; a room created over the socket is prepended as fetched); only `filesList`, `selection` and `bufferSelection` hold list items.
- `ChangeRoomOwnerPanel` already reads `room?.isPrivateRoom ?? room?.private`, which is how the two shapes coexisted unnoticed.
- Seen on the local portal: selecting "Shared target" in the Private list rendered `info_panel_members_links_block` ("Shared links", "Create new link"); inside the room it did not. An invite from the list menu of "Pirate room" showed the ordinary "Users invited" toast; the keys were wrapped for the invitee afterwards, by requests that match the backfill sweep. That is what the private path does: it wraps the file keys for the new member, shows "Users invited" and then runs the backfill sweep.

No stashed design document covers this.

## Goals / Non-Goals

**Goals:**
- A room taken from a list carries `private` exactly as the room loaded with `getFolderInfo`.
- Every affected consumer listed above behaves the same for a room selected in a list and for the room opened.

**Non-Goals:**
- Changing what the private-room rules are.
- Renaming `isPrivateRoom` away: list rows, sorting and filters read it.

## Decisions

**D1. Fix the item, not the consumers.** `buildFilesListItems` returns `private: !!isPrivateRoom` next to `isPrivateRoom`. One line makes all `.private` readers right, including ones not listed here. Alternative: make each consumer read `isPrivateRoom ?? private`, as `ChangeRoomOwnerPanel` does. Rejected: it has to be repeated at every reader and a new reader would miss it again.

**D2. Tests start from a list item.** The Members tab, member removal and info panel tabs had no tests. Their cases build the room through `buildFilesListItems` from a server DTO (a fixture next to the files store tests), so a regression of the item shape fails the Members tab and member removal cases and the E2E case. The tabs case cannot catch it, since `tabs.ts` withholds Share from every room; it keeps the scenario covered.

**D3. The invite path gets a test, not a fix.** The panel never read a list item, so D1 does not change it. A unit case on its send handler, with the room as the open list holds it in `filesStore.folders`, asserts that the private invite path (unlock, re-wrap) is taken, and an ordinary room from the same list sends without unlocking.

## Risks / Trade-offs

- [Something read `private === undefined` on a list item as "not private" on purpose] → No such reader was found (`grep "\.private\b"` over `packages/client/src`); the list rows read `isPrivateRoom`.
- [Snapshot tests of list items change] → Only the added key moves; the snapshot update is reviewed for that key alone.

## Migration Plan

Client-only, behind the `privateRooms` flag. Rollback is a revert.
