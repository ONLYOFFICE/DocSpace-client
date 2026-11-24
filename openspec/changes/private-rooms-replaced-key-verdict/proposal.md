# Proposal

## Why

The archived change `private-rooms-replaced-key-files` (2026-11-23) decides
that a file is wrapped for a key the user no longer holds from the key id in
the file's access entry alone. A key id does not identify a key pair: importing
a key from its export stores the same pair under a new id. A user who deleted
their key and imported the same one again therefore has files whose wraps name
an id outside the key list, although the key opens them, and those files are
reported as lost and refused. Before that change they opened.

## What Changes

- A file counts as wrapped for a key the user no longer holds only when its
  access entry names a key outside the user's key list **and** the user's key
  does not open the entry. The key id alone decides nothing.
- The report of such a file comes after the key is unlocked and the wrap was
  tried, no longer before the passphrase prompt.
- A file whose entry names another id but which the key opens downloads,
  copies, moves and opens as any other, and is not counted by the room notice.

Out of scope:

- What importing a key does to the ids in existing access entries.
- The texts of the message and of the notice.

Decisions that need a human: none. The alternative, keeping the early report
and accepting that an imported key loses its files, is not offered.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: the rule that tells a file wrapped for a
  key the user no longer holds, and when it is reported.
- `private-rooms/editor-integration`: the key flow ends in the state of its
  own after the unlock, not before it.

## Impact

- Shared: `services/encryption/room-file-access.ts`,
  `services/private-room/` (encrypted-copy, encrypted-download,
  encrypted-filename-recovery), `components/media-viewer/MediaViewer.tsx`.
- Client: `store/filesActionsStore/` (download.helpers, copyMove.helpers).
- Doceditor: `hooks/useFileEncryptionKeys.ts`.
- E2E: the case of the cross-user download spec.
- No API, locale or dependency change.
