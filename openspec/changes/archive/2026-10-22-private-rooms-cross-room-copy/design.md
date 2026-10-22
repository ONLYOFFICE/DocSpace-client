# Design

## Context

How a copy out of a private room runs today:
- **Planning.** `planPrivateTransfer` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts`) decides "same room" by comparing the root folder ids of source and destination. The Copy dialog (`components/FilesSelector/index.tsx`, `onAccept`) passes no source root id at all, so for a private source every private destination plans as `same-room`.
- **Picker.** For a private source, `isRoomDisabled` is `undefined`, so private rooms stay selectable. `getIsDisabled` (`components/FilesSelector/utils.ts`) enables Copy inside a private room when the folder grants `Create`.
- **Copy.** `getSelectorTransfer` sends a `same-room` copy of encrypted files to `copyEncryptedFilesToFolderImpl`. That function:
  - decides `sameRoomRoot` by comparing root ids again;
  - builds the upload target from `resolveOpenFolderTarget()`, the source room the user has open, overriding only `roomType` and `isPrivate`;
  - therefore keeps the source room as `encryptionRoomId`, which is the room whose members get key wraps (`chunkUpload.helpers.ts`, `wrapForSelfThenRoom(..., roomIdForWrap)`).

The two outcomes follow from that:
- **Archived source.** Its root is Archive and the destination's root is Rooms, so `isPrivate` comes out false and the decrypted file goes into the private room as plaintext.
- **Active source and destination.** Both roots are Rooms, so the file is encrypted, but its key is wrapped for the members of the source room.

What the server does, read in `../server` (hotfix/v4.0.1):
- **Room member keys.** `PrivacyRoomController.GetUserKeysForRoom` → `EncryptionKeyPairDtoHelper.GetKeyPairForRoomAsync` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`). It requires `fileSecurity.CanReadAsync(room)` and a private room under VirtualRooms or Archive, so a user who can read the destination room gets its members' keys.
- **Encrypted upload flag.** `FileUploader.InitiateUploadAsync` (`products/ASC.Files/Core/Utils/FileUploader.cs:253-288`) stores the `encrypted` flag of an upload session as the client sends it, with no private-room check. A plaintext upload into a private room is therefore accepted.
- **Transfers between private rooms.** `CopyPermissionsCheck.CompliesPrivateRoomRulesAsync` (`products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:816-838`) lets an entry of a private room go only to the same private room, and only as a move. A file that fails the check gets `ErrorMessage_SecurityException_MoveFile` (`:654-657`), and a folder gets `ErrorMessage_SecurityException_MoveFolder` (`:479`). A server copy or move between two private rooms is refused either way.

No stashed design document covers copies between private rooms. The decision comes from the user (2026-10-22): re-encrypt, provided the copier has access to the destination room.

## Goals / Non-Goals

**Goals:**
- A copy into another private room arrives encrypted for that room's members, from an active or an archived source.
- No path can upload into a private room without encryption, or wrap a file key for a room other than the destination.
- "Same room" is decided by room id everywhere a private transfer is planned.
- A move into another private room is refused on the client with its own message.

**Non-Goals:**
- Moving with re-encryption.
- Folder copies.
- The SDK.
- Fixing the original-name leak of the upload conflict check, which belongs to the upload hardening change.

## Decisions

**D1. Plan by room id, never by root folder id.** `TPrivateTransferParams` drops `sourceRootFolderId` and gains `sourceRoomId`, and the destination carries `roomId`: the private room that contains it.
- Same room means both ids are known and equal. Callers supply both:
  - **Copy dialog:** `privateRoomId` for the source, and the room crumb of the picker's breadcrumbs for the destination (`isRoom`), with no request. The copy resolves the room again from the destination's path before it uploads (D3), so a missing crumb only makes the plan treat the room as another one.
  - **Ctrl+X / Ctrl+V:** the room id captured with the clipboard source (it already holds `roomId`), and the open folder's room from `navigationPath` for the destination.
  - **Drag-and-drop:** the open room for the source. For the destination, a room row's own id, and the open room for a folder row or breadcrumb of the current view.
- A private destination whose room id is unknown is treated as another room: a copy is refused (D3), and so is a move (D2).
- Alternative: keep root ids and add room ids only in the picker. Rejected, because root ids cannot tell two rooms apart, which is the defect.

**D2. Two new plan kinds.**
- `reencrypt-into` is a copy into another private room. Its encrypted files go to the client copy, and its folders are refused with `Common:CannotTransferFolderFromPrivateRoom` exactly as `decrypt-out` refuses them.
- `refuse-move-into` is a move into another private room. It shows `Common:CannotMoveToAnotherPrivateRoom` and sends nothing.
- `same-room` keeps today's behaviour: a server move inside the room, and the client copy with a copy suffix at the room root.
- The server would refuse a cross-room move anyway, but only after the paste, with the generic "move the file" error. The client knows enough to refuse first with a clear message.

**D3. The copy's upload target comes from the destination folder, resolved before decryption.**
- The path lookup of `resolveDropTarget` case (d) (`getFolderPath`, the first entry with a room type) is extracted into `resolveFolderTarget(folderId)` in `uploadDataStore/target.helpers.ts` and reused here.
- `copyEncryptedFilesToFolderImpl` takes the resolved destination target, `{ folderId, isPrivate, roomType: CustomRoom, encryptionRoomId: destination room }`, instead of overriding the open-folder snapshot.
- The lookup runs before `requireUnlock` and before any file is decrypted. If it fails, or a private destination yields no room id, the function reports `Common:EncryptedCopyFailed` with the file names and returns without decrypting or uploading anything.
- As a last guard, a target with `isPrivate` true and a null `encryptionRoomId` is never handed to `startUpload`.

**D4. Key wraps, checks and decryption are the existing ones.**
- The upload pipeline already wraps the new file key for the uploader and then for the room in `encryptionRoomId`, applying the member key checks and recording skipped members. Pointing that id at the destination is all re-encryption needs.
- Decryption keeps its sender-key lookup in the source room (`item.originRoomId ?? sourceRoomId ?? resolveRoomIdForFile`), which works for archived rooms too.
- A cross-room copy keeps the original name. A same-room copy keeps its copy suffix, as today. A copy into the open folder (a paste, a duplicate) takes the open-folder target without a lookup, since that target already comes from the room on the open path.

**D5. Access to the destination is the folder's `Create` right.**
- The picker keeps private rooms navigable for a private source, and `getIsDisabled` keeps Copy disabled where the chosen folder lacks `Create`. That matches "may create files there".
- Archive offers no `Create`, so archived rooms are never copy destinations.
- The Move dialog keeps `pinnedRootId` on the source room, so a cross-room move is not offered there at all.
- The warning banner stays as it is. It appears before a destination is chosen and is true for every destination outside private rooms.

**D6. One new locale key.** `Common:CannotMoveToAnotherPrivateRoom` ("Files can't be moved to another private room. Copy them instead."), added to the en Common.json, then commented with `translate-comments` and translated with `translate-locales`.

**D7. Tests.**
- **Unit, planning:** `planPrivateTransfer` for every combination of source and destination rooms and copy or move.
- **Unit, copy:** `copyEncryptedFilesToFolderImpl` for each of:
  - the encrypted target and `encryptionRoomId` of a cross-room copy;
  - an archived source;
  - a failed lookup (no unlock, no upload);
  - the null-room guard.
- **Unit, picker:** `getSelectorTransfer` for `reencrypt-into`, and the paste refusal in `HotkeyStore`.
- **E2E:** the MSW handlers serve a second private room, and the E2E suite checks for each copy that the upload session is encrypted and that the wraps go to the destination room's members:
  - archived → active, in `private-room-archived.spec.ts`;
  - active → active, in the private-room suite.

## Risks / Trade-offs

- [A large copy decrypts the whole file in memory before re-encrypting it] → The same holds for today's copy out of a room. A streaming copy is a follow-up if it becomes a problem.
- [Path lookup adds one request per copy] → It replaces a wrong guess, and the Copy dialog is not a hot path.
- [Dropping `sourceRootFolderId` touches the three callers and their tests] → All three are listed in D1 and covered by unit tests in the same task.
- [The upload conflict check still sends original names for private targets, so a cross-room copy adds one more place where that leak shows] → Fixed in the upload hardening change that follows. Until then the copy behaves like any upload into a private room.

## Migration Plan

Client-only change behind the `privateRooms` flag. Rollback is a revert. After a revert, the archived-source copy uploads plaintext again, so it must not be reverted on its own while `private-rooms-archived-room-rules` stays.
