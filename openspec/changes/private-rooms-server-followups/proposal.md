# Proposal

## Why

The review of 2026-11-10 and the work of 2026-11-11 produced a list of
behaviour to ask of the server: how the key check, the refusals, the key
listing, the room listings and the reported rights of a private room shall
work. None of it is the client's to change, and none of it had a task.

## What Changes

This change is the hand-over to the backend team: one task per behaviour,
each stating the behaviour asked and how to accept it. The
delta of `server-contract` states the behaviour asked for; the main spec
keeps describing the server as it is until the work lands.

- The key check of a share change runs only when a user first gets access
  to a private room; a leave, a removal and a role change of a member
  without keys go through; a group gets a refusal of its own.
- A refusal caused by missing keys carries a stable reason.
- The per-file key listing follows the room: the owner is in it, a creator
  who is no longer a member is not.
- The reassignment of a deleted user's rooms does not leave a private room
  with an owner who cannot open its files.
- Private rooms are not listed in the Forms area.
- The rights of an encrypted file and of a private room say false for what
  does not work there: rename, the history rights, lock, copy link, custom
  filter and form gallery on the file, AI on the room; the version comment
  of an encrypted file is refused with them.
- The private section root is titled in the user's language.
- A user turned into a guest loses the membership of every private room,
  the file keys of those rooms and the stored key pair.
- The switched-off E2E rooms app closes private rooms on the server:
  they are in no rooms listing, cannot be created and cannot be reached by
  id; only the routes of a user's own key pair stay open.
- An invitation of several people to a private room is applied whole or
  not at all.
- A private room and its folders cannot be marked as favourites.
- Client tasks that follow each merge: the mocks, their contract cases and
  the refusal message.

Observations that belong to tasks of other changes are recorded there, in
the same commit as this proposal: the reopening of a saved document, the
crypto library build and the unstable spreadsheet opening in
`private-rooms-editor-contract`; the untranslated labels in
`private-rooms-server-hardening`.

Out of scope:

- Any change in `../server`, and any client code, mock or contract test for
  behaviour that has not merged.
- The refusal of the private flag on a public or form-filling room, which
  is `private-rooms-server-hardening` 12.8 already.
- File keys of permanently deleted files. The review asked for their
  removal; the server already removes them (design.md, "Not confirmed").

Decisions that need a human:

None open.

Decided by the owner on 2026-11-16: a user turned into a guest has the
private-room access revoked and the keys deleted (task 1.6), and the
switched-off E2E rooms app closes private rooms on the server, the direct
access to an existing room included (task 2.5). The questions of tasks 1.5
and 2.4 were answered by reading the server that day.

Decided by the owner on 2026-11-11: the comment and review rights stay
granted on an encrypted file, since commenting and reviewing happen inside
the encrypted document.

Depends on: `../server` for every Backend task. The Document Server
questions stay in `private-rooms-editor-contract` 1.2 and 1.6; no answer to
the package of 2026-10-30 is recorded in the artifacts.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: the behaviour asked of the server, as
  modified and added requirements.

## Impact

- `../server`, by the backend team, on its own branch.
- Later, in this repository: `packages/shared/__mocks__/handlers` with
  their contract tests, and the refusal message of the membership views.
