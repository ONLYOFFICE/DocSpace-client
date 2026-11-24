# Design

## Context

See proposal.md. On the branch today:

- `room-encryption.ts`: `addMembersToEncryptedRoom` and
  `rewrapMissingFilesForMember` unwrap each file with
  `unwrapDekForCurrentUser` without the caller's key list, and record a failed
  unwrap as `{ fileId, success: false, error }`.
- `unwrapDekForCurrentUser` throws `KeyReplacedError` when no sender key opens
  the wrap and the entry names a key id outside the `userKeys` it was given
  (archived change `private-rooms-replaced-key-verdict`).
- `room-member-flows.ts` builds the message after an invitation from the
  number of failed files and the message after a retry from the member's
  missing file ids. The invitation result (`InviteResult` in the client and
  in the SDK) builds its own from `outcome.pending`.

No server behaviour is involved.

## Goals / Non-Goals

**Goals:**

- The cause reaches the three places that word the failure.

**Non-Goals:**

- A new message; changing what the retry does.

## Decisions

1. **The file result carries the cause.** `FileEncryptionOpResult` gets
   `keyReplaced?: true`; both unwrap sites pass `userKeys` of the access
   answer and set the flag on `KeyReplacedError`.
2. **One function words the failure.** `reencryptFailureText(t, fileIds,
   keyReplacedFileIds)` in `room-member-flows.ts` returns
   Common:PrivateRoomReplacedKeyBarText (`_one` or `_other`, as the room
   notice picks them) when every listed file is among the replaced ones, and
   Common:EncryptedReencryptPartialFailure otherwise. The flows and both
   invite panels call it.
3. **The invite outcome lists the files.** `TInviteOutcome` gets
   `keyReplacedFileIds`, filled from the file results, so the panels need no
   second read.

## Risks / Trade-offs

- [The notice text says "here"] → the panel and the toast are shown in the
  room the files are in.
