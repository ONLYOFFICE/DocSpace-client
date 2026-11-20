# Proposal

## Why

The release-readiness review of 2026-11-19 found places where a main spec
of private rooms contradicts itself or the code on `release/v4.1.0`, which
is right in each case. A spec that says something else than the product
misleads the next change and the tests named after it. One of the places is
not wording: a room address of the section without its `folder` parameter
lands on an address that names no room, which the spec promises to serve.

## What Changes

- sidebar-section, "Private section in an embedded frame": the frame's list
  requests name the section's search area, as "Section lists only private
  rooms" says, not a privacy filter.
- room-membership, "Private room is a flagged Custom room": every other
  room type is created with the private flag set to false; the flag is not
  left out.
- sidebar-section, "Section addresses": a room address opened without
  `?folder=` shows the room. This is a small code fix in the client with a
  unit case.

Not changed, with the reason in design.md:

- sdk-surface, "SDK private surface honours the opt-in": its sentence that
  ties the opt-in to a client flag removed at release contradicts
  feature-gating, but the open change
  `private-rooms-sdk-embedding-and-parity` modifies this requirement and
  drops that sentence.
- editor-integration: two code comments point at requirements that live in
  the open change `private-rooms-editor-contract`; they resolve when that
  change is archived.
- editor-integration, "Legacy desktop path uses editor-provided keys": the
  open change `private-rooms-remove-dead-api-calls` modifies and renames
  this requirement; its wording is left to that change.

Out of scope:

- Requirements that other new changes modify: the "no access entry" text of
  file-operations (`private-rooms-withheld-actions-gaps`), "Key mismatch on
  unwrap" (`private-rooms-peer-key-pin-store`), "Per-file content key"
  (`private-rooms-invite-and-upload-robustness`).

Decisions:

- Taken by the owner on 2026-11-19: task 2.1 applies the address fix to the
  Rooms room address (`/rooms/shared/{id}/filter`) too, since the code path
  is shared. Rooms is not a private-rooms capability, so the delta specs
  describe the private address only and the Rooms address is covered by the
  tests of tasks 2.1 and 2.2.

Depends on: nothing in `../server` or the Document Server. The statement
about the create request rests on the server source cited in design.md.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`: "Section addresses" (a room address
  without the folder parameter) and "Private section in an embedded frame"
  (the request scope of the frame).
- `private-rooms/room-membership`: "Private room is a flagged Custom room"
  (the flag of other room types).

## Impact

- `packages/client/src/pages/Home/Hooks/useFiles.ts` and a new unit test
  under `packages/client/src/pages/Home/Hooks/__tests__/`
- A unit case in `packages/client/src/store/__tests__/CreateEditRoomStore.privateRoom.test.ts`
- The two main specs, through the archive
