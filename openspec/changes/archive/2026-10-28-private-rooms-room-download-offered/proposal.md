# Proposal

## Why

Two main specs disagree on the download of a private room. `private-rooms/room-membership` "Room-level operations withheld for private rooms" lists the room download as absent from the room's context menu. `private-rooms/file-operations` "Decrypted folder download" requires "Download" for a folder inside a private room and for the room itself. The client follows file-operations: a private room's menu offers "Download", a decrypted zip of the room, and "Download without decryption", a server archive of its ciphertext. A client unit test pins both entries. The decision of 2026-10-28, recorded in the archived `private-rooms-sdk-client-parity` ("Decisions needed"), is that the client spec follows the client code.

## What Changes

- The room-membership requirement stops listing the room download among the operations withheld for a private room. Index editing, index export, save as template and duplicate stay withheld.
- A new requirement states what the menu offers instead: "Download" and "Download without decryption" for a private room that grants the download right, as `private-rooms/file-operations` describes them.
- No code changes: the client already behaves this way. The SDK keeps withholding the room download as a light-client limit (`private-rooms/sdk-surface`, "Room menu of a private room"), which this change leaves unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/room-membership`: "Room-level operations withheld for private rooms" no longer lists the room download; new "Room download offered for private rooms" offers download and download without decryption for a private room that grants the download right.

## Impact

- Specs only: `openspec/specs/private-rooms/room-membership/spec.md` after archiving.
- Code: none. The behaviour is already in `packages/client/src/store/filesStore/contextOptions.helpers.ts` (room options) and `packages/client/src/store/ContextOptionsStore.tsx` (`onClickDownloadEncrypted`). It is pinned by the unit case "Room context menu" in `packages/client/src/store/filesStore/__tests__/FilesStore.contextOptions.branches.test.ts`.
- Server and Document Server: no dependency. The menu entry follows the room's Download right, which the client already reads.

## Out of scope

- The SDK: its private room menu keeps withholding the room download (`private-rooms/sdk-surface`, "Room menu of a private room"), a deliberate light-client limit.
- Any change to the download behaviour itself: the decrypted zip and the ciphertext archive stay as `private-rooms/file-operations` describes them.

## Decisions needed

None. Decided on 2026-10-28: the client spec follows the client code.
