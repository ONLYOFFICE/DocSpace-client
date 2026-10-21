# Design

## Context

See proposal.md for the motivation. All client paths below are under `packages/client/src` unless stated otherwise, and were read on `feature/private-rooms-specs` at `0b182c046e3`.

**The signal.**
- `TreeFoldersStore.isPrivacyFolder` (`store/TreeFoldersStore.ts:403-413`) returns false unless `selectedFolderStore.rootFolderType === FolderType.Rooms`. Only then does it look at the open folder's own `private` flag or at a `private` entry of `navigationPath`.
- An archived room reports `rootFolderType = Archive` (20), for the room and for every folder inside it, so the getter is false there.
- `isArchiveFolder` is true only on the bare Archive list (`:475-480`). `isArchiveFolderRoot` is true anywhere under it (`:497-499`).
- `navigationPath` carries the room's `private` flag on its room entry, read from the room's own data whatever the root (`store/filesStore/fetch.helpers.ts:320-336`, `:365`).
- History of the condition. It came in with `0ab7ae9663b` ("Restored PrivateRoom options for MainButton"), which replaced the legacy comparison with the old Privacy root folder by `private === true && rootFolderType === Rooms`. `d2411c7cf46` added the `navigationPath` check. Before that, the empty view keyed on `selectedFolder.private` alone and showed the private empty state at the root of an archived private room too. No commit message records a decision to exclude Archive. The stashed design documents mention archived private rooms in two places:
  - the SDK archive page: `docs/private-rooms-audit/02-gap-analysis.md` in the stash "feature/e2e-rooms: test" lists its archived-file menu as partial;
  - the room badge rule `isRoom && isPrivateRoom && !isArchive` (`docs/private-rooms/01-interaction-schema.md`, stash "bugfix/private-room: bugfix docs"), which still matches `components/ItemIcon.tsx:108`.

  None of them excludes archived rooms from the client's private-room rules. The condition is a leftover of the mechanical translation, not a rule.

**What breaks today in an archived private room.** The consumers of the getter that matter there:

| Consumer | Today in an archived private room |
|---|---|
| Copy dialog: `components/FilesSelector/index.tsx:875`, `:717-720` | `sourceInPrivateRoom` is false, so the transfer plan is `generic` (`store/filesActionsStore/copyMove.helpers.ts:235-236`) and a server copy is requested. |
| Copy dialog warning: `FilesSelector/index.tsx:295-296`, `:711` | Reads the open folder's own `private` flag, which only the room carries (see Server). At the room root the warning "will be saved in decrypted form" is shown, although the server copy that follows decrypts nothing. In a subfolder it is not shown, in active rooms too. |
| Drag and drop: `copyMove.helpers.ts:610` | Same `generic` plan. Drag is enabled inside archived rooms, because `dragIsDisabled` covers only the Archive list (`HOCs/withFileActions.js:542-550`). |
| Ctrl+C: `store/HotkeyStore.ts:753-770` | Has no private-room check of its own. It relies on the server's copy right (`:757-760`), which the server grants in an archived private room (see Server). Items go on the clipboard with `inPrivateRoom: false` (`:765`). |
| Search: `pages/Home/Section/Filter/index.js:432-437`, `:467-469`, `:515-522`, `:658` | The query goes into `filter.search`, the address and the server request, with sub-folders and content search possibly on. The server matches opaque names. |
| Open location: `store/filesActionsStore/navigation.helpers.ts:306-318`, `store/filesStore/fetch.helpers.ts:525-536` | The pending client search is keyed on `item.encrypted` and still applies. The search box, though, shows nothing (`Filter/index.js:658`), and clearing it does not clear the client search (`:467-469`). |
| AI chat: `Shell.jsx:760-771` | Offered. |
| Folder menu: `store/filesStore/contextOptions.helpers.ts:1105-1127` | Keyed on `isPrivacyFolder \|\| item.private`. A subfolder row reports `private: false` (see Server), so download (a server zip of ciphertext), copy-to, duplicate and the sharing entries stay. |
| Plugins and AI entries: `contextOptions.helpers.ts:121-125`, `:271-276` | Folder rows get plugin entries. |
| Header bulk menu: `store/filesActionsStore/menu.helpers.ts:453` | The generic folder menu (`:403-426`) instead of the private-room menu (`:239-254`). |

**Already correct, through per-item checks.** Nothing changes for these:
- Downloading one or several encrypted files decrypts on the client, keyed on `file.encrypted` (`store/filesActionsStore/download.helpers.ts:264-292`).
- The encrypted-file menu keeps copy-to (`contextOptions.helpers.ts:435`) and withholds its list (`:511-545`).
- Name recovery runs without a root check (`components/EncryptionProviderWrapper.jsx:63-75`).
- The unlock prompt keys off the open folder's own `private` (`:76`), so it fires at the room root, as in active rooms.
- The missing-key warning and the backfill sweep key off `data.current.private` (`fetch.helpers.ts:210-224`), at the room root, as in active rooms.
- The media viewer has no root-type check (`packages/shared/components/media-viewer`).
- The Share tab is hidden by the item's `private`/`encrypted` (`helpers/info-panel/tabs.ts:131-143`).
- The encrypted-file badge comes from `encrypted` (`components/ItemIcon.tsx:110-113`), and the room badge stays hidden in Archive (`:108`, `!isArchive`), as file-operations "Encrypted items carry a badge" requires.

**Unreachable in archive.** These consumers become true but cannot act there:
- create entries, all gated by the folder's create right:
  - `components/Article/MainButton/index.js:768`, `:807`;
  - the create hotkeys (`HOCs/withHotkeys.js:152`, `:161`);
  - quick actions (`helpers/quickActions.ts:124`, `pages/Home/Hooks/useQuickActions.tsx:418`);
  - the "+ New" model (`store/contextOptionsStore/folderModel.helpers.ts`);
  - the create event (`components/GlobalEvents/CreateEvent.js:179`, `:335`);
  - the empty-view options (`components/EmptyContainer/EmptyPrivateRoomView.tsx:107`);
- uploads: `store/uploadDataStore/start.helpers.ts:307`, `store/uploadDataStore/encryption.helpers.ts:339`, `store/UploadDataStore.tsx:396`, `store/filesActionsStore/selection.helpers.ts:219`;
- deletion: `store/filesActionsStore/delete.helpers.ts:125`, `:506-511`, `components/dialogs/DeleteDialog`. Deleting the room itself takes the room branch first (`DeleteDialog.helper.js` checks `isRoomDelete` before `isPrivacyFolder`, and so does `index.js:203-210`).
- paste into the room: `HotkeyStore.ts:800` returns without CopyTo/MoveTo;
- folder duplicate: `copyMove.helpers.ts:78`.

The getter is also passed on without a private-room branch by `HOCs/withContent.js:197`, `HOCs/withFileActions.js:580` (to `SimpleFilesRow.js:256`, which hands it to the ui-kit row, where it is unused) and `HOCs/withBadges.js:276` (the shared Badges component has no such prop). Changing it there changes nothing. `fetch.helpers.ts:270-271` is a local variable for the legacy Privacy root and is unrelated.

**Server.** Every statement here was found with CodeGraph and read in `../server` on branch `hotfix/v4.0.1`. Paths are relative to `../server/products/ASC.Files/Core`.

Rights inside rooms: `FileSecurity.FilterEntryAsync` (`Core/Security/FileSecurity.cs:1168`) switches on the root folder type. The room it checks is the first room among the parent folders (`:1200`).
- Active rooms (`:1642-1644`, the VirtualRooms branch):
  - the administrator bypass is skipped in a private room (`:1650-1652`);
  - a file in a private room loses Copy, among other rights (`:1894-1904`);
  - a subfolder loses Copy and CopyTo (`:1916-1922`).

  Both happen before the full-access check (`:1924`), so even the owner cannot copy.
- Archived rooms (`:1929-1989`):
  - only Read, Delete, ReadHistory, Copy, Move, Download, ReadLinks and IndexExport pass (`:1930-1941`), and Delete and Move only for the room itself (`:1943-1947`);
  - there is no private-room guard;
  - Copy follows the generic rule (`:2394-2424`): true for any access other than Read or None, and for Read only while the room allows downloads.

So in an archived private room, encrypted files report `security.Copy = true`, and creation, editing, moving and deleting are denied for every role.

Copying out, today:
- `PUT files/fileops/copy` (`../server/products/ASC.Files/Server/Api/OperationController.cs:111-114`) publishes through `FileOperationsManager` (`Services/WCFService/FileOperations/FileOperationsManager.cs:553-559`). That awaits the permission check before it queues anything.
- The check calls `CheckCopyDataAsync` with `check = true` (`Services/WCFService/FileOperations/CopyPermissionsCheck.cs:77-87`, `:112-135`), so a refusal throws.
- In an active room, the copy right check refuses first (`:282-290`, "You don't have enough permission to copy the file", `Resources/FilesCommonResource.resx:352`).
- In an archived room the copy right passes, and `CompliesPrivateRoomRulesAsync` refuses (`:642-650`, `:804-826`, "You don't have enough permission to move the file", `.resx:388`). The rule finds the private room among the parents by `SettingsPrivate && IsRoom` and allows only a move within the same room.
- `IsRoom` depends on the folder type, not the root (`Core/Entries/Folder.cs:343`). Room settings load by room id whatever the root (`Core/EF/Queries/FolderQueries.cs:545`). So the rule holds in Archive.
- Had a copy gone through, it would keep the encrypted flag and the stored ciphertext (`Core/Dao/TeamlabDao/FileDao.cs:1722-1729`).

Net effect today: no ciphertext copy lands in My documents. The user asked for a copy and gets a "move" permission error instead of the decrypted file. The query and the AI chat are the real exposure.

The private flag sits on the room only:
- room settings, the private setting among them, are written only for a folder whose type is a room (`Core/Dao/TeamlabDao/FolderDao.cs:755-761`, `:811-817`) and loaded by the room's own id (`Core/EF/Queries/FolderQueries.cs:545`);
- `FolderDto.Private` is that setting (`ApiModels/ResponseDto/FolderDto.cs:595`), so a subfolder of a private room reports `private: false`. The archived change `private-rooms-upload-fail-closed` (design item 6) recorded the same.

Where private rooms can be:
- every room is created under the VirtualRooms root (`Core/Core/FileStorageService.cs:668`);
- archiving and restoring move a room between the Archive and VirtualRooms roots (`../server/products/ASC.Files/Server/Api/VirtualRoomsController.cs:650`, `:687`).

## Goals / Non-Goals

**Goals:**
- One signal for "inside a private room", which decides every private-room rule in both sections.
- The read and copy-out rules hold in an archived private room exactly as in an active one: decrypted copy-out, no clipboard copy, client-side search, folder menu, no AI chat, no plugins.
- Fail closed. Any consumer that newly sees true becomes stricter, never looser.

**Non-Goals:**
- No change to what the archive allows. The server denies creation, editing, moving and deleting there, and the client keeps following the server's rights.
- No new UI and no locale keys.
- No change to the SDK archive page (`private-rooms-sdk-gating-and-parity`).
- No change to the Private section routing (`private-rooms-sidebar-section`). That change only adds route-based restrictions on top of this signal (its design D13 and D14).

## Decisions

**D1. Widen `isPrivacyFolder` instead of adding a getter.**
- The getter drops its root-type condition and becomes: the open folder has `private === true`, or some `navigationPath` entry has `private === true`.
- Every consumer picks the change up without edits, as the Context tables list.
- Alternative rejected: a new getter (for example `isInsidePrivateRoom`) used only by the read and copy-out consumers.
  - Two near-identical signals would leave each future consumer to choose, and the one keyed to Rooms would fail open.
  - The upload decision (`start.helpers.ts:307`, `encryption.helpers.ts:339`) would keep a Rooms-only answer. That is harmless while the archive denies uploads, but it would turn into plaintext uploads the day it does not.
- Alternative rejected: renaming the getter to match its meaning. It touches about thirty files and the test fakes (`store/__tests__/sharedFakes.ts`, the filesActionsStore and uploadDataStore harnesses) for no behaviour. Left for a clean-up.

**D2. No root-type allow-list.**
- The condition is dropped entirely, not widened to "Rooms or Archive". Private rooms only ever live under those two roots (see Context, Server).
- The flag is the room setting and only rooms carry it (see Context, Server). `navigationPath` copies it from the room entry, so it can only be true inside a private room.
- An allow-list would be one more place to forget when a section is added. The `private-rooms-sidebar-section` follow-up plans a server-backed root for private rooms.
- Alternative rejected: keeping `rootFolderType ∈ {Rooms, Archive}`. It is safe today, but brittle for the reason above.

**D3. Ctrl+C is withheld by the client inside any private room.**
- `HotkeyStore.copyToClipboard` returns for a copy, not a cut, while the signal is true. The one-line pointer is `Spec: file-operations, "Copy hotkey withheld in an archived private room"`.
- In an active room this changes nothing, because the server's copy right was already false. In an archived room the server grants it (see Context), so a client check is the only thing that keeps the clipboard empty.
- A cut needs the move right, which the archive denies for anything but the room (`FileSecurity.cs:1943-1947`).
- Alternative rejected: letting Ctrl+C record `inPrivateRoom: true` so that Ctrl+V decrypts. It would be a working copy-out, but it breaks parity with active rooms. The user decided that the clipboard stays empty and that copy-out goes through the Copy dialog or drag-and-drop.

**D4. The picker warning reads the same signal.**
- `showEncryptedTransferBanner` (`FilesSelector/index.tsx:295-296`) uses `sourceInPrivateRoom`, not the open folder's own `private` flag (`:711`), and moves into a pure helper in `components/FilesSelector/utils.ts`. The warning then appears exactly when the plan decrypts, at the room root and in subfolders.
- This also fixes subfolders of active rooms. A subfolder reports `private: false` (see Context, Server), so today the warning is missing there, although file-operations "Files leaving a private room are decrypted" requires it.

**D5. Consumers that newly see true and stay as they are.**
- The empty view of an archived private room becomes the private empty state (`components/EmptyContainer/sub-components/EmptyViewContainer/EmptyViewContainer.tsx:73-75`). It shows its title and benefit list, with no options because the create right is false. This is the behaviour from before `d2411c7cf46`, and it is accepted.
- The header shows the encrypted-room icon and tooltip in subfolders too (`pages/Home/Section/Header/index.js:563`, `:635`), as in active rooms.
- The bulk header menu becomes the private-room menu (`menu.helpers.ts:239-254`): download, move, delete and info, with move and delete disabled by the server's rights. Bulk copy-out therefore goes through the selection's context menu, whose copy-to stays for encrypted files (`store/contextOptionsStore/groupContextOptions.helpers.ts:234`). That matches active rooms.
- The delete dialog's permanent-deletion wording (`DeleteDialog.helper.js:163`) is unreachable, because no item inside an archived room can be deleted.

**D6. Mocks mirror the archive rights.**
- `encryptedFilesHandlers` (`packages/shared/__mocks__/handlers/files/encryptedFiles.ts`) gains an `archived` option. With it set:
  - the room and its files report `rootFolderType: 20` and the Archive section id as `rootFolderId`;
  - file rights follow the Archive branch of `FileSecurity.FilterEntryAsync` for the room owner: Read, Download, ReadHistory and Copy are true; Edit, Rename, Move, Delete and Duplicate are false;
  - the room's own rights deny Create, CopyTo and MoveTo.

  Its doc comment names `FileSecurity.FilterEntryAsync` (Archive branch, `FileSecurity.cs:1929-1989`).
- No mock is added for `fileops/copy`. The E2E spec records requests and asserts that none is sent, which is the requirement.

**D7. Tests.**
- A new `store/__tests__/TreeFoldersStore.privacy.test.ts` pins the signal for:
  - an active room root and subfolder;
  - an archived room root and subfolder;
  - an ordinary archived room;
  - My documents.
- The consumer unit tests already fake the getter. The new cases there assert the archive-specific behaviour at their level:
  - Ctrl+C with `Copy: true` files;
  - the banner helper;
  - the folder menu of a folder whose root is Archive.
- One Playwright spec, `packages/client/__tests__/private-room-archived.spec.ts`, walks the delta scenarios end to end on the archived mock.

## Risks / Trade-offs

- [A consumer newly true in archive does something unexpected.] → Every consumer is listed in Context with its archive outcome. The getter test pins the signal, and the E2E spec opens the archived room's root, a subfolder, the empty state and the menus.
- [The empty view changes for archived private rooms.] → Accepted (D5). It is informational only, with no options.
- [The bulk header Copy disappears in archived private rooms.] → Accepted for parity (D5). Copy stays on the item and selection context menus.
- [Ctrl+C now depends on a client check, not only on the server's right.] → The check is stricter than the server, so it can only withhold. The active-room test "Copy hotkey inside a private room" keeps passing, and a new case covers `Copy: true`.
- [The server's archive rights keep granting Copy in private rooms.] → The client no longer relies on the server to block it. The server refusal of the copy (`CopyPermissionsCheck.cs:642-650`) stays as the backstop. The rights gap is handed to `private-rooms-server-hardening`.

## Migration Plan

- Client-only, behind the existing `privateRooms` opt-in. No data migration.
- `private-rooms-sidebar-section` waits for this change before its Private → Archive view ships (its task 0.2).
- Rollback is a revert. Archived private rooms then fall back to the server-copy, server-search and AI chat behaviour described in Context.

## Server findings outside this change

These do not block the change. They belong to `private-rooms-server-hardening`:
- **The Archive branch has no private-room guard.** A file in an archived private room reports the copy right, which an active one denies (`FileSecurity.cs:1894-1922` vs `:1929-1989`). The administrator bypass of the Archive branch (`:1949-1983`) has no `inPrivateRoom` exclusion, unlike the VirtualRooms branch (`:1650-1652`). It grants a portal administrator who is not a member read, copy and download rights on an archived private room's entries by id. The content stays ciphertext. This complements the Move and Delete finding already recorded in `private-rooms-sidebar-section` (design.md, "Server findings outside this change").
- **Folder copies out of an archived private room** were not confirmed. The folder-level private rule needs the folder's own private setting (`CopyPermissionsCheck.cs:467`), which is false for every subfolder (see Context, Server), and the Archive branch grants Copy on subfolders. How the copy operation then treats the files inside was not traced; it might create the folder and refuse each file in it. The client never requests one (file-operations, "Folders cannot leave an archived private room").
