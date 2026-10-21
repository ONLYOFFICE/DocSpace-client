# Design

## Context

See proposal.md for the motivation. Client lines refer to the current branch. Server statements were found with CodeGraph in `../server` on branch `hotfix/v4.0.1` (`codegraph explore "UploadControllerHelper CreateUploadSessionAsync InitiateUploadAsync"`) and read in the source. Server paths are relative to `../server/products/ASC.Files`.

**How the client decides privacy today.**

At queue time, `startUploadImpl` (`packages/client/src/store/uploadDataStore/start.helpers.ts:289-397`) reads the open folder:
- `encryptionRoomId` comes from the open folder's navigation path (`:303-305`).
- `isPrivateUpload = treeFoldersStore.isPrivacyFolder` (`:307`) is used only to decide conversion (`:333`).
- Each item stores its `toFolderId` and `encryptionRoomId` (`:335-348`). The privacy decision itself is not stored.

At send time, the open folder is read again:
- `startSessionFuncImpl` (`chunkUpload.helpers.ts:593-`) calls `resolveUploadGate({ uploadContext: file.uploadContext, ... }, self.getUploadFolderContext())` (`:639-648`).
- `getUploadFolderContext` reads the open folder (`UploadDataStore.tsx:395-398`). `resolveItemRoomContext` falls back to it whenever a file carries no `uploadContext` (`packages/shared/services/private-room/encrypted-upload.ts:102-115`).
- Only the copy and move paths set the per-file override `ItemUploadContext` (`encrypted-upload.ts:96-100`, set in `filesActionsStore/copyMove.helpers.ts:311-346`).
- The encryption step reads the open folder a second time (`prepareFileForEncryptedUploadImpl`, `uploadDataStore/encryption.helpers.ts:332-356`). When it returns `encrypted: false`, the session goes ahead with the plaintext file (`chunkUpload.helpers.ts:721-732`), even though the gate said "encrypt".
- The session folder is derived from the open folder again, as `isAIRoom ? knowledgeId : toFolderId` (`:599-600`, `:634`).

The batch and the queue:
- `startUploadFilesImpl` asks for the unlock once per batch (`chunkUpload.helpers.ts:501-504`). `willEncryptItemImpl` picks the items that need it, using the open folder (`selectors.helpers.ts:139-154`).
- At most `maxUploadFilesCount` files (5, `FilesSettingsStore.ts:126`) start together (`chunkUpload.helpers.ts:80-105`). Each later file starts when a slot frees up (`:156-160`, `:571-573`, `:897-901`), possibly long after the user has moved on.
- Leaving the files page clears the selected folder (`pages/Home/index.js:528-532`), and `isPrivacyFolder` then reads false (`TreeFoldersStore.ts:403-413`).

Retry:
- `retryUploadFilesImpl` (`start.helpers.ts:399-455`) and `retryQuotaFailedFilesImpl` (`:457-510`) go straight to `parallelUploading`. Neither prompts for the unlock or fixes the context.
- The upload panel offers Retry for every error except a password prompt (`components/PanelComponents/ErrorFile.js:57-77`, wired in `components/panels/UploadPanel/FileRow.js:110-114`). That includes `Common:EncryptionKeysRequiredForUpload` and `Common:EncryptionLockedUpload`.
- A retried private item is encrypted without an unlock. The prompt appears only at wrap time, after the ciphertext has been uploaded (`encryption.helpers.ts:121-126`). If the user declines, the room keeps a file nobody can read, and the item shows `Common:EncryptionUploadWrapFailed`.

**Drop on a row or tile.**
- Every row and tile of the table, row and tile views is wrapped in the ui-kit `DragAndDrop`:
  - `TableView/TableRow.js:271`;
  - `RowsView/SimpleFilesRow.js:231`;
  - `TilesView/FileTile.js:316-327`, where room tiles render inside the wrapper (`:243-245`).
- That component (`@onlyoffice/apps-ui-kit` 4.0.2, `dist/esm/components/drag-and-drop/DragAndDrop/index.js`) calls `useDropzone` without `disabled`. It calls `onDrop` for every non-empty drop and keeps the event from reaching the section drop zone.
- `withFileActions.onDrop` (`HOCs/withFileActions.js:90-108`) stops early only in Trash and Recent, or when `isDisabledDropItem` is set. That flag means `item.security.Create === false` or a result storage (`:498-499`), so a private room the user can write to passes. A folder or room target then goes to `createFoldersTree(t, files, item.id)` and `startUpload(f, item.id)` (`:73-88`).
- In a rooms list the open folder is the Rooms root, so `isPrivacyFolder` is false. As a result:
  - the folder-tree refusal is skipped (`filesActionsStore/selection.helpers.ts:218-228`), and dropped folders are created in the room;
  - conversion is offered (`start.helpers.ts:333`);
  - the gate sends plaintext.
- The row highlight (`withFileActions.js:343-347`) is shared with drag-to-move, so it cannot serve as the gate.

**The server stores what it is sent.**
- The client opens upload sessions with `POST files/{folderId}/session` (`packages/shared/api/files/index.ts:772-797`). On the server that is `UploadController.CreateUploadSessionInFolder` (`Server/Api/UploadController.cs:146-150`). It runs through `UploadControllerHelper.CreateUploadSessionAsync` (`Server/Helpers/UploadControllerHelper.cs:73-84`).
- `FileUploader.VerifyChunkedUploadAsync` (`Core/Utils/FileUploader.cs:205-217`) and `GetFolderIdAsync` (`:153-198`) check only three things:
  - the folder exists;
  - it is not a rooms section root;
  - the caller may create in it (`:163`).
- `InitiateUploadAsync` (`:253-294`) adds a check for knowledge folders only (`:267`). It stores the session's `Encrypted` exactly as requested (`:288`).
- Neither `UploadChunkAsync` (`:296-369`) nor `FinalizeUploadSessionAsync` (`:371-386`) compares the content or the flag with the room's private setting.

A plaintext upload into a private room is therefore accepted.

**Upload entry points reviewed for this change.**

| Entry point | Target | Exposure today |
|---|---|---|
| Row or tile drop (`HOCs/withFileActions.js:73-108`) | the row's folder or room | drop on a private room row, and the queue |
| Section drop (`pages/Home/index.js:386-408`, the ui-kit section body drop zone) | the open folder | the queue only |
| Ctrl+V of files from the computer (`store/HotkeyStore.ts:898-924`) | the open folder | the queue only |
| Hidden inputs behind "Upload files" / "Upload folder" in "+ New" and the empty views (`components/UploadInputs/index.tsx:64-77`) | the open folder | the queue only |
| Header file input (`pages/Home/Section/Header/index.js:281-293`) | the open folder | the queue only |
| AI-knowledge device upload (`components/EmptyContainer/sub-components/EmptyViewContainer/EmptyViewContainer.hooks.ts:505-520`) | the open agent's knowledge folder | the queue only; the session folder is also derived again |
| Copy or move out of, or within, a private room (`filesActionsStore/copyMove.helpers.ts:311-368`) | explicit destination, per-file `uploadContext` | privacy already target-based; `encryptionRoomId` is still taken from the open folder |

These paths have no exposure:
- **Sidebar.** `ClientArticleSidebar`, the only sidebar rendered (`Client.jsx:77`), has no drop handler. `components/Article/Body/Items.js` has one, but nothing imports it.
- **Breadcrumbs and the tree.** They have no drop zone for files from the computer: in ui-kit only `DragAndDrop` and the section body accept files. Dragging items there is a move, which "Transfer into a private room is refused" covers.
- **Item context menus.** Folder and room rows have no "Upload" entry. Upload entries belong to the "+ New" model of the open folder (`contextOptionsStore/folderModel.helpers.ts:310-321`, `:367-380`).
- **`components/Article/MainButton`.** It uploads into the open folder (`:363-365`), but it is only imported, never rendered (`Client.jsx:53`).

Where can a folder of a room be listed outside that room? No current list was found that does it:
- rooms lists show rooms only: a rooms search matches titles, and `withSubfolders` is forced off (`packages/shared/api/rooms/filter.ts:236-237`);
- a search inside a room stays inside that room;
- Recent refuses drops (`withFileActions.js:101`);
- favorites are withheld for folders in private rooms (main spec, "Favorites, conversion and download-as withheld").

The server side of this was not established, so the rule covers such rows with a lookup (D1) instead of assuming they never appear.

The client takes a folder's privacy from the room in its path, never from the folder's own `private` flag. `isPrivacyFolder` reads the path (`TreeFoldersStore.ts:403-413`), and the folder loader reads the room's `private` from `getFolderInfo` for path entry 1 (`filesStore/fetch.helpers.ts:321-336`). The archived change `private-rooms-upload-fail-closed` (design D6) recorded that only the room carries the setting.

No stashed design document covers the upload target. This change generalises the per-file override already used by the copy and move paths, `ItemUploadContext`. The code still matches that precedent.

## Goals / Non-Goals

**Goals:**
- One fixed context per queued file, taken at the user action. No upload step reads the open folder.
- One resolver that answers where a drop, paste or pick goes and whether that target is private, shared by every entry point.
- Fail closed: when the resolver cannot establish the target's privacy, nothing is sent.
- Uploads outside private rooms behave as today.

**Non-Goals:**
- No change to `shouldEncryptCurrentUpload`, the create-menu check, which by design is about the open folder.
- No change to the drop highlight of rows and tiles.
- No ui-kit change (see Risks).

## Decisions

**D1. The upload target is a value captured at the user action.**
- A new type `TUploadTarget = { folderId, isPrivate, roomType, encryptionRoomId }` lives in `uploadDataStore/helpers.ts`, next to `TUploadFile`.
- A new `uploadDataStore/target.helpers.ts` holds two resolvers.
- `resolveOpenFolderTarget` takes a synchronous snapshot of the open folder:
  - `isPrivacyFolder`;
  - the room type, `CustomRoom` when private, as `resolveItemRoomContext` does today;
  - the room id from the navigation path (`start.helpers.ts:303-305`);
  - the knowledge folder as `folderId` inside an AI agent (`:339`).
- `resolveDropTarget(openSnapshot, row)` resolves a row:
  - (a) no row, or a file row: the open folder's target;
  - (b) the open folder lies in a room: the row belongs to that room, so it gets the open context with `folderId = row.id`;
  - (c) a room row: the room's own `private`, room type and id;
  - (d) a folder of the rooms or archive tree while the open folder is outside every room: asynchronous. It loads the folder's path and the room at its root the way the folder loader does (`fetch.helpers.ts:321-336`), and rejects on any error;
  - (e) any other folder row, such as one in My documents: not private.
- Every entry point resolves first, before any `await` (reading the dropped entries, creating folders, the conflict check). It then passes the result through `createFoldersTree` to `startUpload`.
- Alternative rejected: resolving inside `startUpload`. Reading the dropped entries, creating folders and the quota check all run before `startUpload`, and the open folder can change meanwhile. Today, a drop into a private room followed by a quick click elsewhere sends the files unencrypted into the newly opened folder.
- Alternative rejected: blocking navigation while uploads are queued. Navigation is not the only thing that changes the open folder: the Home page clears it on unmount, and the 403 and "removed from room" redirects move it too. Blocking would also be worse for the user.

**D2. Every queued file carries its context, and the gate no longer takes a folder.**

`startUpload` requires a `TUploadTarget` and stores it on every item.

For files of the copy and move paths, their per-file `uploadContext` still wins for `isPrivate`, `roomType` and `moveSource`, because those paths know the destination. The target supplies the rest.

In `encrypted-upload.ts`:
- `resolveUploadGate` and `willEncryptUploadItem` take the item's context as a required argument instead of `UploadFolderContext`;
- `resolveItemRoomContext` loses its folder fallback;
- `shouldEncryptCurrentUpload` builds a context from the open folder and calls the same gate.

These steps switch to the item's context:
- the session gate and `prepareFileForEncryptedUploadImpl`;
- `willEncryptItemImpl`, the batch unlock and the batch cancel;
- the wrap room id, which already comes from the item;
- the session folder: `toFolderId` as stored, with no `isAIRoom ? knowledgeId : ...` at session start;
- conversion: `needConvert` from the target.

`getUploadFolderContext` and `getUploadEncryptionContext` are removed. The item context is a required field of the type, so a later step cannot read the folder again without the compiler noticing.

Alternative rejected: freezing only `isPrivate` and keeping the rest live. The session folder and the room type would still follow navigation. Today, an AI agent opened after queuing already redirects the queued files to its knowledge folder.

**D3. Drops onto a private room from outside are refused, not encrypted.**
- `withFileActions.onDrop` resolves the target first. If `target.isPrivate` and `target.encryptionRoomId` is not the room of the open folder, it:
  - shows `Common:OpenPrivateRoomToUpload` as a warning toast;
  - resets the dragging state;
  - returns before `createFoldersTree`.
- A rejected lookup refuses too. The request's error is shown the way other failed requests are, since the room may well not be private.
- This was decided with the user.
- Alternative rejected: encrypting into the row's room. That needs the room's roster and key prompts for a room that is not open, plus the folder rules of that room, and the list shows nothing of the result. A refusal that points the user to the room is simpler and fails closed.
- Alternative rejected: marking the row as not droppable. The ui-kit drop zone accepts every drop anyway, and the highlight is shared with moves, so the handler must refuse regardless. A silent no-op would also hide why nothing happened.

**D4. The folder-tree refusal follows the target.**
- `createFoldersTreeImpl` receives the target. It refuses folder entries when `target.isPrivate` (`selection.helpers.ts:218-228`) instead of reading `isPrivacyFolder`, and uses `target.folderId` as its `toFolderId` (`:266`).
- For every accepted drop the two answers agree. The change removes the last read of the open folder before queuing, and it covers a drop onto a folder row of the open room explicitly.

**D5. A private item that is not ciphertext is not sent.**
- In `startSessionFuncImpl`, if the gate says "encrypt" and preparation returns `encrypted: false`, the item fails with `Common:EncryptionPrepareFailed` before `startUploadSession`. Today it falls through (`chunkUpload.helpers.ts:721-732`).
- After D2 both decisions read the same context, so this is defence in depth against a future divergence.

**D6. Retry runs the rules again on the fixed target.**
- `retryUploadFilesImpl` and `retryQuotaFailedFilesImpl` already reuse the item, so they keep its target.
- Before `parallelUploading`, they run the batch unlock over the retried items that will be encrypted. If the user declines, the existing cancel path fails those items with `Common:EncryptionLockedUpload`. No byte is sent and no unreadable file is left behind.
- A retry without a key is refused by the gate, exactly like the first attempt.
- Retry stays on offer for the encryption errors, because setting up or unlocking a key and retrying is the natural recovery.
- Alternative: withholding Retry for those errors. Not taken by default; see the proposal's "Decisions needed".

**D7. Wiring the entry points.**
- The section drop, the Ctrl+V paste, the hidden inputs, the header input and the AI-knowledge upload call `resolveOpenFolderTarget` synchronously at the start of their handlers.
- The copy and move paths build their target when the copy starts, before decrypting, and their per-file `uploadContext` stays. A same-room copy still takes the open room as `encryptionRoomId`, as it does today. It now captures that room before the decryption loop, so a user who leaves the room during the loop no longer changes whose wraps the re-encrypted copies get.
- The row and tile drop uses `resolveDropTarget`.
- `components/Article/Body/Items.js` (unused) and `components/Article/MainButton` (not rendered) get only the change that `startUpload`'s new signature forces on them.

**D8. No feature-flag check.** The rules apply wherever a private room is listed, as the existing upload rules do (`private-rooms/feature-gating`, "Gating hides, it does not disable the feature").

## Risks / Trade-offs

- [The ui-kit drop zone reads dropped directories before it calls the client's handler, so the open folder can change between the browser's drop event and the capture.] → Row and tile drops are not affected, because the row is the target. For a section drop the window is the directory traversal, and that is a flat file list in a private room, which refuses folder trees. Closing the window completely would need a ui-kit change; none is planned.
- [The lookup in D1 (d) adds a request for drops onto room folders listed outside their room.] → Only such rows reach it, and none were found in the current lists. A failed lookup refuses the drop.
- [The shared gate's signature changes.] → Only the client upload store and the gate's own tests use it (`chunkUpload.helpers.ts`, `selectors.helpers.ts`, `UploadDataStore.tsx`, `upload-encryption-gate.test.ts`). The SDK does not.
- [Many upload unit tests build items without a target.] → The test harness (`uploadDataStore/__tests__/testHarness.ts`) gets a default non-private target. Tests that mean "the open folder decides" are rewritten to the scenario names of the new requirements.
- [Users lose the drop onto a private room row.] → Intended. The toast tells them to open the room, where dropping works as before.

## Migration Plan

- Client-only change, with no data migration. The upload queue lives in memory, so no queued item survives a reload in the old shape.
- Rollback is a revert of the client commits.
