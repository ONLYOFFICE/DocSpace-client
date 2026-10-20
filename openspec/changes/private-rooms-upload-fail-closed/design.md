# Design

## Context

See proposal.md for motivation. Four transfer paths exist in the client and only two of them carry the private-room guards:

- Drag-and-drop and the copy/move dialog go through `moveDragItemsImpl` / the destination picker, which refuse transfers into a private room, refuse folders leaving one, and decrypt files leaving one (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts:503-523`, `packages/client/src/components/FilesSelector/index.tsx:338-373`).
- The chunk upload pipeline decides per item whether to encrypt with `shouldEncrypt = shouldEncryptUpload(...) && !!publicKey && !!userId` (`packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts:567-571`); a false result falls through to the plain upload. The shared helper `willEncryptUploadItem` (`packages/shared/services/private-room/encrypted-upload.ts:112`) encodes the same rule and `upload-encryption-gate.test.ts:98` pins it as intended ("does NOT encrypt when encryption keys are missing"). The shared orchestrator refuses a key-less upload, but the client store does not use the orchestrator for its main path.
- The clipboard hotkeys (`packages/client/src/store/HotkeyStore.ts:733-840`) call `uploadDataStore.itemOperationToFolder` directly after a `security.CopyTo / MoveTo` check and a public-room check; no private-room check exists there or in `operations.helpers.ts`.
- Folder-tree drops on the Home page go to `filesActionsStore.createFoldersTree` (`packages/client/src/pages/Home/index.js:401`) with no private guard, while the toolbar button and Shift+U are disabled in private rooms.
- The SDK already implements the target behaviour for move: `packages/sdk/src/app/(private)/_hooks/useEncryptedCopyMove.ts:284-287` deletes the source after a successful plaintext copy, and `_utils/encrypted-copy-dest.ts` resolves the destination fail-closed.

None of the recovered design documents (SECURITY.md, AUDIT_FRONTEND.md, SDK_PRIVATE_PLAN.md) describe the plaintext fallback or the clipboard path; the "plaintext copy-out" decision in the SDK parity checkpoint (04-implementation-status.md, 2026-06-09) covers only the deliberate decrypt-on-copy-out, which this change keeps.

## Goals / Non-Goals

**Goals:**
- One decision point for "may this item be transferred this way" shared by drag, dialog, clipboard and drop paths.
- Fail closed: any path that cannot prove the item will be encrypted refuses before the first byte is sent.
- Move semantics that match what the user asked for, without ever deleting a source before its decrypted copy is confirmed.

**Non-Goals:**
- Server-side enforcement (tracked in `private-rooms-server-hardening`).
- Folder transfers out of private rooms, decrypted folder download.
- Changing the SDK; its behaviour is the reference.

## Decisions

1. **Refuse, do not degrade, when the uploader has no key.** The gate helper gains a third outcome (`refuse` with a reason: `no-key` or `locked`) and the chunk pipeline marks the item failed before `startUploadSession`. Alternative considered: prompting the user to generate a key mid-upload. Rejected because key generation needs the recovery-phrase flow, which cannot be completed inside an upload queue; the device-setup hint already links to it.
2. **Guard the clipboard path by reusing the drag path.** `pasteFromClipboard` builds the same operation data as a drag drop, so it calls the shared transfer resolver (`moveDragItemsImpl`-style guard extracted into a helper that takes source items, destination folder info and an operation kind) before falling through to `itemOperationToFolder`. Alternative: duplicate the three checks inside `HotkeyStore`. Rejected to keep one source of truth; the checks already drifted once.
3. **Move deletes the source after all copies succeed, per file.** Mirrors the SDK. Deletion uses the existing permanent delete (private rooms bypass the recycle bin) and runs only for files whose decrypted upload finished and was finalized. Alternative: withhold "Move" out of a private room entirely. Rejected because the dialog and context menu already offer it and users expect it; withholding would also diverge from the SDK. The decision is flagged in the proposal for confirmation.
4. **Dropped folder trees are refused, not flattened.** Flattening a tree into file uploads would silently change structure; refusing matches the disabled button. Files in the same drop still upload.
5. **Localized reasons, no raw error strings.** New Common keys: `EncryptionKeysRequiredForUpload`, `EncryptionLockedUpload`, `FolderUploadNotSupportedInPrivateRoom`, `EncryptedMovePartialFailure`. The upload panel renders the reason through the existing error-row tooltip.
6. **Callers that know the destination's privacy say so; the root-folder comparison is only a fallback.** The server sets `rootFolderId` of every entry in a room, and of the room itself, to the Rooms section id, not the room id (server `products/ASC.Files/Core/ApiModels/ResponseDto/FileEntryDto.cs` `RootFolderId = entry.RootId`; `RootId` is the top ancestor, `Core/Core/EF/Queries/FolderQueries.cs` and `FileQueries.cs`), so comparing it tells sections apart, never rooms. A subfolder of a private room reports `private: false`; only the room row carries the setting (`Core/Core/Dao/TeamlabDao/FolderDao.cs` writes it for rooms only). The resolver therefore takes an explicit `insidePrivateRoom` from the clipboard (`isPrivacyFolder` of the current folder) and the picker (`isInsidePrivateRoom`, which the picker reads from the parent room); drag keeps the old fallback, whose only rooms-section targets in practice are folders of the open room.
7. **The server decides which transfers exist; the client does not add new ones.** For a file in a private room, and for a non-room folder inside one, the server denies `Copy` (and `CopyTo` for such folders), and a copy between folders of the same room is refused while a move is allowed (server `Core/Core/Security/FileSecurity.cs`, private-room action denials; `Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs`, same-room check `&& !copy`). Consequences: Ctrl+C never fills the clipboard inside a private room; Ctrl+X checks only the Move right (it used to require Copy as well, which left the clipboard unusable in private rooms; decided with the user during apply); a same-room transfer can only be a server-side move, and copying out of a private room is only reachable through the paths that decrypt on the client. The Move dialog is pinned to the open private room (`pinnedRootId`), so a move out of the room happens through drag or Ctrl+X; the dialog still resolves the plan, so lifting the pin needs no further change.

## Risks / Trade-offs

- [Inverting the gate test changes a documented expectation] → the test file gets a comment pointing at this change and at the spec requirement; the orchestrator tests already assert refusal.
- [Deleting sources on move after partial failures could leave a half-moved set] → per-file deletion only after that file's copy succeeded; the summary toast names the files left behind.
- [Clipboard guard may block a paste that used to work in non-private rooms] → the resolver returns "generic" for non-private source and destination and the existing path is untouched; covered by a regression test.
- [Users without keys lose the ability to contribute to a private room] → intended; the device-setup hint explains how to get a key.

## Migration Plan

No data migration. Ships behind the existing `privateRooms` flag. Rollback is a revert of the client change; no server or format impact.

## Open Questions

- Should a key-less member see the upload drop zone at all inside a private room, or only the refusal? Can be decided after the fail-closed behaviour lands; it does not change the spec.
