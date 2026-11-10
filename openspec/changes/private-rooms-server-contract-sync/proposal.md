# Proposal

## Why

The main `server-contract` spec still describes the server of early November
on several points, and two server rules that clients run into are not
written down at all. Read through CodeGraph on `../server` at `a7d94e4b81`
(2026-11-10):

- "Encrypted flag on file update" says an update without the flag clears the
  encrypted mark. The server refuses such an update with 403 for an encrypted
  file and for any file in a private room.
- "Private room creation requires keys" says a caller who deleted all keys is
  not refused and a third-party room is not checked. The server refuses an
  empty key set with 403 and the private flag on third-party storage and on
  the AI hub room types with 400.
- "Server-side copy out of a private room is refused" names the refusal texts
  "You don't have enough permission to move/copy the file". The refusal comes
  before the operation is queued, as a `SecurityException`, which every client
  receives as 403 "Access denied".
- "No recovery, offboarding or file-key audit endpoints" says there is no
  per-file key history. The file history has carried key writes since
  2026-11-05.
- Not written down: a file key write in an archived private room is refused,
  so a member who missed keys before the archiving gets them only after a
  restore; and the E2E rooms app gates only the listing of the private
  section, not the other private-room routes.

The other rows of the same comparison are already settled: the server rules on
uploads, the audit of key writes, the invitation e-mails, copy-as and the owner
change reached the main spec with the server hardening sync of 2026-11-10, and
the private section on the server (its root, the rooms list privacy filter, the
room groups and the new-items counts) is written by
`private-rooms-server-section`.

## What Changes

- `server-contract`: the file update, room creation and copy refusal
  requirements take the server's current behaviour; the recovery requirement
  is renamed to "No recovery or offboarding endpoints" and drops the key
  history; two requirements are added, "File keys cannot be written in an
  archived private room" and "The E2E rooms app gates only the private section
  listing".
- `private-rooms-server-hardening`, which modifies two of these requirements
  and removes the third, is aligned so that its archive does not undo them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: as listed above.

## Impact

- Specs only; no application code.
- Other changes: `private-rooms-server-hardening` (the creation and copy
  blocks, the header of its removed requirement).
- Mocks and their contract tests are not touched here: the contract test that
  still expects "You don't have enough permission to move the file" and the
  other mock and type corrections are planned as a later update of this change.
- Server (`../server`): no work. Every statement comes from its source at
  `a7d94e4b81` (design.md).

## Out of scope

- The private section on the server (root, privacy filter, room groups,
  new-items counts): `private-rooms-server-section`.
- Refusing the private flag on public and form-filling rooms: an open backend
  task of `private-rooms-server-hardening`; this change records only what the
  server does today.
- Client behaviour around these server rules.

## Decisions needed

None.
