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

The client side follows the same server in places too (added 2026-11-10):

- `GET files/file/{id}/publickeys` returns the keys of the users holding a
  share record of their own on the file or a folder above it up to the room,
  plus the file's creator; the main spec says "plus the owner", and the E2E
  mock returns every member. The room owner is not returned unless they
  created the file.
- The client types make `privateKeyEnc` required on every key, while the
  server leaves it out of another member's key; make `userKeys` required,
  while the server leaves it out for a user without keys; and type the key
  deletion as returning a key list, while the server answers 204 without a
  body.
- The E2E mocks answer "You don't have enough permission ..." where the
  server answers 403 "Access denied", and the key mock refuses neither a guest
  (403) nor a key set too large to store (400). Neither rule is in the main
  spec.

## What Changes

- `server-contract`: the file update, room creation and copy refusal
  requirements take the server's current behaviour; the recovery requirement
  is renamed to "No recovery or offboarding endpoints" and drops the key
  history; two requirements are added, "File keys cannot be written in an
  archived private room" and "The E2E rooms app gates only the private section
  listing".
- `server-contract` (added 2026-11-10): "File public keys" names the file's
  creator instead of the owner; two requirements are added, "Guests cannot
  hold encryption keys" and "Oversized key set is refused".
- Client types: a separate type for another member's key with an optional
  private half, an optional `userKeys`, and a key deletion without a body.
- E2E mocks and their contract tests: the 403 texts, the publickeys set, the
  guest and the size refusals of the key mock.
- `private-rooms-server-hardening`, which modifies two of these requirements
  and removes the third, is aligned so that its archive does not undo them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: as listed above.

## Impact

- Specs, client types (`packages/shared/api/privacy`, `packages/shared/api/files`), the E2E mocks under `packages/shared/__mocks__/handlers` and their contract tests. No application behaviour changes.
- Other changes: `private-rooms-server-hardening` (the creation, copy and
  file public keys blocks, the header of its removed requirement).
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
