# Design

## Context

Found in the review of `private-rooms-upload-target-context` and on a local portal, 2026-10-22:
- **Conflict check.** `handleUploadConflictsImpl` (`packages/client/src/store/uploadDataStore/start.helpers.ts:229-250`) sends `uploadData.files.map(f => f.file.name)`, the original names, to `checkIsFileExist`, which is `POST files/{folderId}/upload/check`, for every target. On the server, `UploadController.CheckUploadAsync` (`products/ASC.Files/Server/Api/UploadController.cs:421-463`) looks each title up with `fileDao.GetFileAsync(folderId, title)` and reports it only when the file found is not encrypted (`file is { Encrypted: false }`, `:454-460`). In a private room every file is encrypted and stored under an opaque name, so the check can never report a clash there; it only discloses the names. The same function reads `selectedFolderStore.isAIRoom` (the open folder) to skip the check for AI rooms.
- **Retry.** `retryUploadFilesImpl` (`start.helpers.ts:416-450`) sets `action = "upload"`, `error = ""` and `inAction = false` on the item before `sendRetriedFiles` awaits `ensureEncryptionUnlockedForBatch()` (`:397-405`). The queue picks its next file with `findIndex(f => !f.inAction)` (`chunkUpload.helpers.ts:156, 571, 900`), and `startSessionFuncImpl` has no guard against starting an item twice.
- **Row drop.** `resolveDropTarget` case (b) (`target.helpers.ts:127`) returns `{ ...open, folderId: row.id }` whenever the open snapshot has a room. The snapshot is taken in the handlers of `withFileActions.js:89` and `pages/Home/index.js:397`, which ui-kit `DragAndDrop` calls from `onDrop` after react-dropzone has read the dropped directories.
- **Gate.** `resolveUploadGate` (`packages/shared/services/private-room/encrypted-upload.ts:144`) answers `plain` when `isPrivate` is true but the room type is null or not `RoomsType.CustomRoom`.
- **Leftovers.**
  - `components/Article/Body/Items.js:110` builds `{ ...open, folderId: uploadToFolder }`; nothing imports the file.
  - `createFoldersTreeImpl` reads the quota of the open folder.
  - The folder lookup of a row drop (`withFileActions` case (d): toast, failed lookup) and the section drop of Home have no wiring tests.
  - The scenario "Shift+U pressed" has no test carrying its name, and it names the wrong hotkey: Shift+U uploads files, folder upload is Shift+I (the hotkeys panel, `HOCs/withHotkeys.js`), and the private-room refusal sits on that one (`HotkeyStore.uploadFile` with `isFolder`). The delta names Shift+I in the requirement, keeps "Shift+U pressed" with what that hotkey does (the file picker, never the folder picker; a modified requirement must keep its scenarios) and adds "Shift+I pressed".

No stashed design document covers these points.

## Goals / Non-Goals

**Goals:**
- No original name of a file bound for a private room leaves the browser.
- A retried private file is never sent before its unlock is answered, and never twice.
- Every upload step reads the fixed target, nothing reads the open folder after queueing.

**Non-Goals:**
- Server-side title validation and the abort route (`private-rooms-server-hardening`).

## Decisions

**D1. Skip the server conflict check for private targets.** `handleUploadConflictsImpl` takes the conflict decision from each item's fixed target. A private target never calls `checkIsFileExist`, and the AI-room skip reads the target too. Alternative: send opaque names. Rejected: the server would still report nothing (encrypted files are never reported) and the request would serve no purpose.

**D2. Name clashes in a private target: checked on the client, "keep both" only (decided with the user on 2026-10-22, option (a)).** With the server check gone, nothing tells the user that a file of the same decrypted name exists. On the portal a copy produced two "New document" files side by side. Options:
- (a) a client-side check against the decrypted names of the destination folder, from the filename cache plus recovery for names not cached, offering only "keep both" with a copy suffix (versions are withheld for encrypted files). Recommended.
- (b) no check: duplicates of a decrypted name are allowed, written down as a SHALL NOT limitation.
- (c) a server route that compares encrypted name headers. Rejected: the server cannot read them.

Option (a) was chosen. Before an upload or copy into a private room the client compares the decrypted names of the files with the decrypted names of the destination folder, recovering names that are not cached while the identity is unlocked. A clash offers "keep both", which gives the new file a copy suffix, or cancel; overwriting and new versions are not offered.

**D3. Retry unlocks first, then resets.** `retryUploadFilesImpl` awaits the batch unlock for retried private items before it clears their error and `inAction`. On decline it sets `Common:EncryptionLockedUpload` on them directly. `startSessionFuncImpl` returns early for an item already in action, so a duplicate start cannot happen whichever path triggers it.

**D4. A row drop trusts the row, not the late snapshot.** Case (b) applies only when `row.parentId` equals the snapshot's folder; otherwise the row goes through the path lookup (d) (`resolveFolderTarget`). The snapshot is also taken on the native `drop` event, before the directory read starts.

**D5. The gate fails closed.** `resolveUploadGate` refuses a private target whose room type is not `RoomsType.CustomRoom`, a missing type included, with `Common:EncryptionPrepareFailed`.

**D6. Leftovers.** Delete `Items.js`; read the quota from the target folder; add the wiring tests; turn restating comments into `Spec:` pointers (`start.helpers.ts:397`, `helpers.ts:45`, `target.helpers.ts:81`, `encrypted-upload.ts:88`).

## Risks / Trade-offs

- [Skipping the check changes the dialog flow for private uploads] → Until 3.0 lands a client check, a private upload never shows the conflict dialog. That is no worse than today, where the server check cannot find a clash there.
- [Taking the snapshot on the native drop event touches the shared drag-and-drop path] → The snapshot is a read of the open folder, with no behaviour change for ordinary folders; covered by the section and row wiring tests.

## Migration Plan

Client-only, behind the `privateRooms` flag. Rollback is a revert.

## Open Questions

None.
