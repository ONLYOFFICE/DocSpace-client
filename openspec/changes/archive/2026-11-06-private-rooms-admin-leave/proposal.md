# Proposal

## Why

On the release stand on 2026-11-06 the portal owner handed a private room
over to another member with "Leave the room" ticked; the toast said "You
have left the room", but the room's row stayed in the Private list until
the page was reloaded, while the server already answered 403 for the room.
The leave helper keeps the row for a portal administrator because an
administrator keeps reading an ordinary room after leaving it; a private
room is the exception, since the server refuses it to an administrator
outside it (`private-rooms/server-contract`, "Private rooms of others are
not listed to administrators"; `private-rooms-server-hardening`, decision
7). The list must follow the server.

## What Changes

- When a portal administrator (or the portal owner) leaves a private room,
  the client treats them as any other member: the room leaves the open
  list, or, when they leave from inside the room, they land on the Private
  list without it. That covers the room's own "Leave the room" action and
  the leave ticked in the owner change.
- Ordinary rooms keep their behaviour: an administrator who leaves one
  still sees it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: a new requirement, "Leaving a private
  room ends its listing", for every user including administrators.

## Impact

- **Client:** `packages/client/src/store/filesActionsStore/rooms.helpers.ts`
  (`onLeaveRoomImpl`, reached by the room's leave action and by
  `changeRoomOwnerImpl` with the leave ticked), its unit tests in
  `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.leaveRoom.test.ts`,
  and the E2E spec `packages/client/__tests__/private-room-members.spec.ts`.
- **SDK:** the SDK's leave dialog is checked for the same branch (task
  1.3); the SDK has no administrator bypass of its own to keep.
- **Server:** none; the behaviour follows what the server already does.

## Out of scope

- The bare room address without `/filter` (`/private/{id}`), which the
  client rewrites to `/private/undefined/filter`: `/rooms/shared/{id}` does
  the same, so it is the client's handling of bare room addresses in every
  section, not a private-rooms matter.
- Anything the server sends on a leave (the revocation and its audit are
  on the branch).

## Decisions needed

None.
