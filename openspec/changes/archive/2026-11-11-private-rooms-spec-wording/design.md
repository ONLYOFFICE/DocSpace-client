# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Server source: `../server` at `a7d94e4b81`, read through CodeGraph on
2026-11-11. Paths are under `products/ASC.Files` unless they start with
`common/`.

- **The key check of a share change.** The share request of a private room
  checks the encryption keys of the user an entry names. The server side of
  this is tracked outside the repository.
- **The check runs before an e-mail address is resolved.** The user of the
  entry is read from its id; the block that finds or creates the account
  behind an e-mail address comes later, after the key check. An entry that
  carries an address and no id is therefore checked as a user who does not
  exist, who has no keys.
- **Who keeps the keys.** The users who lose a private room have their file
  keys removed, every removed user but the one named by `room.CreateBy`.
- **Creator means current owner.** `FileStorageService.ChangeOwnerAsync`
  (`Core/Core/FileStorageService.cs`, line 5509) writes the new owner into
  `CreateBy` of the room, so the user the revocation leaves out is whoever
  owns the room now.
- **Owner change and the previous owner.** Before it rewrites the owner,
  `ChangeOwnerAsync` calls `SetAceObjectAsync` with two entries: none for
  the new owner and the given role for the previous one. The previous
  owner has no share record, so that entry is a new share and passes the
  key check above; an owner without keys is refused there.

Artifacts:

- `private-rooms-server-hardening` holds, as MODIFIED or ADDED blocks, full
  copies of "File keys follow the share", "Owner change requires the new
  owner's keys", "Invitation e-mails carry the room title", "Leaving a room
  revokes own access first", "Member removal warning" and "Leaving a
  private room revokes own access first", byte-identical to the main spec
  today.

## Goals / Non-Goals

**Goals:**

- Each reworded statement can be traced to a line above.
- The open change that copies these requirements does not undo the
  rewording at its archive.

**Non-Goals:**

- New requirements, or statements the source was not read for.

## Decisions

1. **A change with deltas, not a hand edit of the main specs.** The rules
   of the feature keep the main specs for what a change has landed, and
   the rewording touches eight requirements at once. Precedent:
   `private-rooms-spec-consistency`, archived 2026-11-10.
2. **The copies in `private-rooms-server-hardening` are edited in the same
   change.** Its MODIFIED blocks replace whole requirements at archive;
   left alone they would restore the old text and the old names.
   Alternative: wait for that archive. Rejected: it has twelve open backend
   tasks and no date.
3. **Renames keep the meaning and drop the contradiction.** "Leaving a room
   revokes own access first" becomes "Leaving a room drops the role without
   a client revocation", and the SDK one "Leaving a private room drops the
   role without a revocation of its own". The code comments that cite the
   old names are updated with them.
4. **Unconfirmed statements stay out.** The review listed two more
   inexact statements about guests; the source read here does not settle
   them, so the scenario they touch is left as it is and the question goes
   to the backend.

## Risks / Trade-offs

- [A requirement text grows past the 500 characters the strict validation
  allows in the main spec] → Each reworded description is kept at or below
  the length it replaces; `openspec validate --all --strict` is the check.
- [The server changes the behaviour described here] → That is the request
  of `private-rooms-server-followups`; its delta already modifies the same
  requirements and is rebased on this text when it lands.
