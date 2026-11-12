# Proposal

## Why

The review of 2026-11-10 found that none of the nine main specs says whom
the encryption of private rooms protects against. By the code the server
names the recipients of every file key and a key seen for the first time is
pinned without a question, so the protection holds against a leak of the
stored data and a server that only relays, not against a server that alters
its answers. The specs also name the file extension as the only thing the
server sees, state fewer passphrase rules than the code enforces, and are
silent on the limits of search, sorting and downloads. Criterion
1.21 of `private-rooms-release-gate` asks for all of this in the main specs.

## What Changes

No behaviour changes and no code. The specs gain the statements below, each
read in the client code on 2026-11-12 (design.md, Context).

- `encryption-core`, four new requirements: what the encryption protects
  against (a storage leak and a passive server); that it does not protect
  against an active server, which names the recipients and whose first key
  for a member is pinned unasked; that there is no out-of-band verification
  of a peer key; and which metadata the server sees (room and folder
  titles, file size, name length, chunk count, the PDF form flag, the
  sender of each wrap, members and roles, times).
- `key-management`: a new requirement for the composition rules of a
  passphrase (a Latin capital letter, a digit, an ASCII punctuation
  character); a new requirement that a passphrase change or a recovery
  keeps the key pair, so it does not cure a leaked passphrase or export.
- `file-operations`, four new requirements: client search covers the open
  folder only and at most 10,000 items; a name sort orders only the loaded
  items; a decrypted zip is assembled in memory; an interrupted encrypted
  download starts over.

Out of scope:

- Fixing any of these limits. Each is recorded as the branch has it.
- "Forget device" while the identity is unlocked, which leaves the key in
  memory although the main spec promises a prompt, and a newly picked
  auto-lock preset, which the idle timer follows only when it is next
  restarted. Both are defects to be fixed with code in a change of their
  own (decisions 2 and 4), so the main spec keeps its present text.
- Mobile applications and the desktop editor: the specs have no requirement
  for either, and this change adds none.
- Key rotation as a feature (a new key pair for a user who keeps access).
- Server behaviour. No statement of this change is about `../server`
  beyond what the main `server-contract` already says; nothing depends on
  server or Document Server work.

## Decisions needed

1. Taken, owner, 2026-11-10 (review decision H6): the threat model is
   worded as protection against a storage leak and a passive server, and no
   protection against an active server.
2. Taken, owner, 2026-11-12: "Forget device" while the identity is
   unlocked is fixed with code in a change of its own, so that it locks the
   identity as well. This change does not record the present behaviour.
3. Taken, owner, 2026-11-12: the passphrase composition rules stay as they
   are and are recorded, including that a long passphrase in another
   script alone is refused for want of a Latin capital letter.
4. Taken, owner, 2026-11-12: the auto-lock preset picked while unlocked is
   fixed with code in the same separate change as decision 2 and is not
   recorded here.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: four requirements added.
- `private-rooms/key-management`: two requirements added.
- `private-rooms/file-operations`: four requirements added.

## Impact

- `openspec/specs/private-rooms`: three spec files, on archive.
- `openspec/changes/private-rooms-release-gate/tasks.md`: criterion 1.21 is
  met once this change is archived.
- No code, mock, test or locale change.
