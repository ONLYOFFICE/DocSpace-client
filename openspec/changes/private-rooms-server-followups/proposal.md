# Proposal

## Why

The review of 2026-11-10 and the work of 2026-11-11 found server behaviour
that the client can only describe or hide: a member without keys cannot
leave a private room or be removed from it, the refusal carries no reason a
client can read, the per-file key listing misses the room owner, the rooms
of a deleted user pass to someone who cannot open them, and the server
reports rights on files whose content it never sees. None of it is the
client's to fix, and none of it has a task yet.

## What Changes

This change is the hand-over to the backend team: one task per behaviour,
each naming the server symbol, what should change and how to accept it. The
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
- A question to the backend, with no behaviour asked yet: which routes the
  switched-off E2E rooms app closes, and what happens to the keys of a user
  turned into a guest.
- Client tasks that follow each merge: the mocks, their contract cases and
  the refusal message.

Observations that belong to tasks of other changes are recorded there, in
the same commit as this proposal: the reopening of a saved document, the
crypto library build and the unstable spreadsheet opening in
`private-rooms-editor-contract`; the AI tab of the editor and the untranslated
labels in `private-rooms-server-hardening`.

Out of scope:

- Any change in `../server`, and any client code, mock or contract test for
  behaviour that has not merged.
- The refusal of the private flag on a public or form-filling room, which
  is `private-rooms-server-hardening` 12.8 already.
- File keys of permanently deleted files. The review asked for their
  removal; the server already removes them (design.md, "Not confirmed").

Decisions that need a human:

1. Backend team: the answers of tasks 2.4 and 1.5.
2. Owner: whether the comment and review rights stay granted on an
   encrypted file. This proposal leaves them granted, since commenting and
   reviewing happen inside the encrypted document.

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
