# Design

## Context

See proposal.md, Why. The server read behind this change, at `../server`
`4162789259` (`release/v4.1.0`, 2026-11-06), through CodeGraph
(`FileSecurity.FilterEntryAsync`) and the source of
`products/ASC.Files/Core/Core/Security/FileSecurity.cs`:

- `:1705-1718`: `inPrivateRoom` is computed before the section switch. Inside
  a private room, the room and every entry in it are refused Copy,
  Duplicate, IndexExport, UseChat, Vectorization and StartFilling, in Rooms
  and in Archive alike. This is the block `bd89a24dcd` added
  (`private-rooms-server-hardening` design, Context, "Private-room denials in
  every section").
- `:2566-2582`, the role rule for Duplicate, which the refusal above now
  overrides in a private room. It is granted to a room manager, to a content
  creator on an entry they created, and to an administrator on a room only.
  The room owner gets every right earlier, through `HasFullAccessAsync` in the
  VirtualRooms branch (`:2060`).
- `:2603-2628`, the role rule for Move. It is granted to a room manager, and
  to a content creator on an entry they created, on any entry that is not a
  room. The owner gets it through the same `HasFullAccessAsync`. No
  private-room refusal touches Move.
- `:2065-2083`, the Archive branch. It admits Read, Delete, ReadHistory,
  Copy, Move, Download, ReadLinks and IndexExport only, and then refuses
  Delete and Move on anything that is not a room. In an archived room, Move
  and Duplicate are both refused for files.

So for a file in a private room, Move answers what the Duplicate rule
answered before `bd89a24dcd`: the same roles in an active room, false in the
archive. The administrator clause of the Duplicate rule applies to rooms, not
to files, and the administrator bypass is skipped inside private rooms
anyway.

The apps never send the server operation for an encrypted file. The client's
`duplicateActionImpl` sends it to `duplicateEncryptedFile`, which copies the
file into its own folder through the encrypted copy (decrypt, re-encrypt,
upload with a suffix). The SDK's `requestDuplicate` calls
`encryptedActions.duplicateFile`. Both gate the entry on
`security.Duplicate`: the client in `buildContextOptions`
(`packages/client/src/store/filesStore/contextOptions.helpers.ts`, the
`duplicate` removal), and the SDK in `useItemContextMenu.ts`. For Copy, both
already make an exception for encrypted files (`!canCopy && !isEncrypted`;
`file.security.Copy || file.encrypted`).

The mocks already mirror the server. `encryptedFilesHandlers` reports
Duplicate and Copy false and Move true for a file of a private room, and
Move false in the archived variant. The mock has no roles.

No stashed design document covers the Duplicate entry.

## Goals / Non-Goals

**Goals:**
- The Duplicate entry of an encrypted file appears for exactly the users the
  server would have let duplicate it before the refusal.
- One rule, worded the same in both apps.

**Non-Goals:**
- Any server change, or a mock change.
- Changing how the copy is made.

## Decisions

1. **Gate the entry on Move for an encrypted file.** The entry shows when
   the server grants Duplicate, or when the file is encrypted and the server
   grants Move. For a file of a private room, Move has the same truth table
   as the Duplicate rule had (see Context), and the server already refuses it
   in the archive, so no archive check is needed on the client.
   Alternatives:
   - (a) `file.encrypted` alone, as Copy does. Rejected: Copy takes the user
     to a dialog that only lists folders they can create in, but Duplicate
     writes straight into the file's folder, so an editor or viewer would get
     an entry that fails on the upload.
   - (b) Ask the backend to answer Duplicate by role again for encrypted
     files and refuse only the duplicate operation itself. That is cleaner in
     meaning but needs a server change for a right the client can already
     derive. Proposal decision 1 keeps it open.
   - (c) The create right of the file's folder. Rejected: it is not at hand
     outside the folder (Recent, Favorites), and it ignores the own-file
     limit of a content creator.
2. **A one-line pointer at both call sites**, `Spec: private-rooms/file-operations,
   "Duplicate of an encrypted file follows the move right"`, since gating
   Duplicate on Move looks wrong on its own.
3. **E2E without mock changes.** The SDK cases "Same-room copy" and "Copy of
   a name that already has a copy" already drive the entry, and turn green
   as they are. The client gets one case in
   `packages/client/__tests__/private-room-cross-room-copy.spec.ts` that
   duplicates an encrypted file from its row and checks the stored copy.
   The withheld cases are unit tests, since the mock has no roles.

## Risks / Trade-offs

- [The server changes the Move rule independently of the old Duplicate rule]
  → The entry follows Move. A divergence shows as an upload refusal, not as
  plaintext. The scenarios name the roles, so a later server read catches
  it.
- [Decision 1(b) is taken later] → The rule widens to the server's own
  Duplicate answer, which is already the first operand, so nothing else
  changes.

## Migration Plan

Client-only and reversible by reverting the commits. No data migration.
