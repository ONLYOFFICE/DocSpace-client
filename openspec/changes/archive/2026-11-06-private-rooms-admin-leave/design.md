# Design

## Context

See proposal.md. `onLeaveRoomImpl`
(`packages/client/src/store/filesActionsStore/rooms.helpers.ts:564-620`)
sends the role update with access None and then branches on
`user.isOwner || user.isAdmin`: a member who is not an administrator gets
the room removed from the list at the root (`filesStore.removeFiles`) or is
sent to the list from inside the room (`/private/filter` when the address
is a private one, else `rooms/shared/filter`); an administrator keeps the
room, marked as not joined (`filesStore.setInRoomFolder(roomId, false)` at
the root, `selectedFolderStore.setInRoom(false)` and a refresh of the
current folder inside), because an ordinary room stays readable to them.
`changeRoomOwnerImpl` (`:633-695`) calls `self.onLeaveRoom(t)` after a
successful transfer when the leave is ticked, so the owner change takes the
same branch. The helper reads the room from the selection, the buffer
selection or the selected-folder snapshot; the selection items carry the
private setting (`room.private`, read at `:652` for the owner change), and
the private address is known through `isPrivateRoomsRoute`.

On the server a portal administrator outside a private room is refused the
room and its entries in Rooms and in Archive (`FileSecurity.FilterEntryAsync`,
the `inPrivateRoom` exclusion of the administrator bypass, landed 2026-11-04
in `3b9c527a6e`; main spec "Private rooms of others are not listed to
administrators"), which the stand confirmed: 403 on the room and its file
right after the leave.

## Goals / Non-Goals

**Goals:**
- The list reflects the server after a leave, for administrators too.

**Non-Goals:**
- Changing the leave of ordinary rooms or the server's side of a leave.

## Decisions

1. **The private setting of the room decides the branch, not the address.**
   `onLeaveRoomImpl` takes the non-administrator path when the room carries
   the private setting, whatever the user's type; the address only chooses
   where to land from inside the room, as today. Alternative: branch on
   the private address; rejected, the rule of `private-rooms/sidebar-section`
   ("Encryption does not depend on the section") puts behaviour on the
   room's setting, and a private room can be left from an address that is
   not under `/private` while the section is off.

2. **No extra request.** The room's private setting is on the item the
   helper already holds (the selection or the selected-folder snapshot), so
   no read is added; where the snapshot lacks the setting, the helper reads
   it from the folder data the store keeps for the open room.

## Risks / Trade-offs

- [The selected-folder snapshot inside a room may not carry the private
  setting] → the task verifies the field on the snapshot and falls back to
  the store's room data; the unit test covers the inside-the-room case.

## Migration Plan

None: a client-only fix, released with the client.
