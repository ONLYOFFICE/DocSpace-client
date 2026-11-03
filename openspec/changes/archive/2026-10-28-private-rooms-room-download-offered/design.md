# Design

## Context

See proposal.md - Why. The client's room menu (`packages/client/src/store/filesStore/contextOptions.helpers.ts`, room options) keeps `download` and `download-encrypted` for a private room. It drops `download` when the room's `security.Download` is false. It drops `download-encrypted` only for a room that is not private.

The two entries do what `private-rooms/file-operations` describes for a folder of the room:
- `ContextOptionsStore.onClickDownload` sends a private room, a folder item in the list, to `downloadEncryptedFolder`, the client-side decrypted zip of "Decrypted folder download".
- `onClickDownloadEncrypted` sends a room to `downloadFiles([], [roomId])`, the server archive of its ciphertext ("Download without decryption").

The unit case "Room context menu" in `packages/client/src/store/filesStore/__tests__/FilesStore.contextOptions.branches.test.ts` pins both entries for a private room that grants Download.

Stashed design documents: none covers the room download; the decision is the user's of 2026-10-28.

## Goals / Non-Goals

**Goals:**
- The main specs stop contradicting each other on the download of a private room, and describe what the client does.

**Non-Goals:**
- Changing the client or the SDK.
- Specifying the menu of a private room that does not grant the download right.

## Decisions

1. **Two requirements instead of one.** The MODIFIED "Room-level operations withheld for private rooms" only drops the room download from its list and keeps its scenario name. The menu entries the room offers get their own ADDED requirement, "Room download offered for private rooms", so each requirement states one behaviour. Alternative: widen the MODIFIED text to cover both. Rejected because it mixes a withheld set with an offered one.
2. **The case without the download right stays unspecified.** The client keeps `download-encrypted` for a private room whose `security.Download` is false, and requests a server archive when it is picked. Whether the server serves that archive without the Download right has not been read in `../server`. Pinning that entry as a requirement would turn an unverified path into a contract, so the ADDED requirement covers only a room that grants the download right. A later change can settle it after reading the server's archive check.
3. **The SDK stays as it is.** `private-rooms/sdk-surface` "Room menu of a private room" withholds the room download as a light-client limit. The two apps keep diverging on purpose, as the archived `private-rooms-sdk-client-parity` recorded.

## Risks / Trade-offs

- [The unspecified case hides a client quirk] → Decision 2 names it here, so a later change can find it.

## Migration Plan

No migration: specs only. The archive merges the delta into `openspec/specs/private-rooms/room-membership/spec.md`.
