# Proposal

## Why

Copying encrypted files from one private room into another is reachable from the Copy dialog today, but the client gets it wrong in both shapes:
- **From an archived private room into an active one, the copy is uploaded as plaintext.** Since `private-rooms-archived-room-rules` an archived room counts as private, so the picker offers other private rooms. The copy then compares root folder ids (Archive against Rooms), decides the destination is not private and sends the decrypted file into the private room unencrypted. The server stores the upload as sent.
- **Between two active private rooms, the copy is encrypted for the wrong people.** The root ids match, so the file is encrypted, but its key is wrapped for the members of the room the user has open (the source), not for the destination room. Members of the destination who are not in the source cannot read it.

Users want to copy files between private rooms they belong to, so instead of only refusing the case, the copy is made a proper re-encryption for the destination room.

## What Changes

- Copying encrypted files from a private room, active or archived, into **another** private room decrypts each file on the client and uploads it encrypted for the destination room. Its key is wrapped for the user and the destination room's members, with the same key checks and skipped-member report as an upload into that room. The source stays in place.
- The copy is offered only when the user has access to the destination room: the picker offers private rooms, and folders in them, where the user may create files. The server answers a room's member keys only to readers of the room.
- The destination room is resolved from the destination folder's own path before anything is decrypted. If it cannot be resolved, nothing is copied. "Same room" is decided by room id, never by root folder id.
- No copy into a private room is ever uploaded without encryption, and its key is never wrapped for the source room instead of the destination.
- **Moving** files into another private room stays refused, now on the client with a new `Common:CannotMoveToAnotherPrivateRoom` message instead of a server error after paste. This covers Ctrl+X / Ctrl+V and any path that plans a move. The Move dialog already offers only the source room.
- Folders still cannot be copied or moved out of a private room, into another private room included (`Common:CannotTransferFolderFromPrivateRoom`).
- The spec wording that tied Ctrl+C to the server's copy denial is corrected: the client withholds Ctrl+C in every private room (a drift left by `private-rooms-archived-room-rules`).

Out of scope:
- Moving files between private rooms with re-encryption (copy, then delete the source). This can follow if users ask for it.
- Folder trees: a recursive decrypt and re-encrypt shares its work with the decrypted folder download in `private-rooms-ux-gaps`.
- The SDK copy path (`private-rooms-sdk-gating-and-parity` task 4.2 withholds cross-room folder transfers there).
- The original-name leak of the upload conflict check (`POST files/{folderId}/upload/check`). It affects every upload into a private room and is fixed in the upload hardening change that follows this one.

Decisions that need a human: none open. The user chose re-encryption over refusal on 2026-10-22, with access to the destination room as the condition.

Server dependency: none. The client relies on behaviour `../server` already has: room member keys for readers of the room, encrypted upload sessions, and the refusal of server-side transfers between private rooms.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`:
  - new requirement: a copy into another private room is re-encrypted for the destination room;
  - new requirement: a move into another private room is refused;
  - "Files leaving a private room are decrypted" and "Files copied out of an archived private room are decrypted" are limited to destinations outside private rooms;
  - "Folders cannot leave a private room" gains the case of another private room;
  - "Clipboard hotkeys follow the private-room transfer rules" covers paste into another private room and drops the server rationale for Ctrl+C.
- `private-rooms/server-contract`: "Server-side copy out of a private room is refused" gains the scenario of a move between two private rooms, which the server refuses as well.

## Impact

- Client:
  - transfer planning and the encrypted copy in `packages/client/src/store/filesActionsStore/copyMove.helpers.ts`;
  - the destination picker in `packages/client/src/components/FilesSelector/{index.tsx,utils.ts}`;
  - paste in `packages/client/src/store/HotkeyStore.ts`;
  - the upload target in `packages/client/src/store/uploadDataStore/target.helpers.ts`, whose path lookup is reused.
- Locales: one new key, `Common:CannotMoveToAnotherPrivateRoom`, in all languages with its `.meta`.
- Tests:
  - unit tests next to the copy, plan and picker helpers;
  - E2E cases in `packages/client/__tests__/private-room-archived.spec.ts` and a cross-room case in the private-room E2E suite, with the MSW handlers serving two private rooms.
- No server, SDK or doceditor change.
