# Proposal

## Why

The client decides "this folder lies inside a private room" only while the room sits under the Rooms section. Once a private room is archived (root folder type Archive), that signal is false in the room and in every folder inside it, so the private-room rules that still apply to a read-only room silently stop:
- copying files out asks the server for a copy instead of decrypting on the client, and the server refuses it;
- the destination picker shows the "saved in decrypted form" warning at the room root although nothing is decrypted;
- search sends the typed query to the server, which matches opaque names;
- the AI chat is offered;
- folder menus offer a server download of ciphertext, copy and duplicate.

The `private-rooms-sidebar-section` change makes Private → Archive the home of archived private rooms, so this has to be fixed before that view ships.

## What Changes

- The "inside a private room" signal comes from the room's private setting alone: the open folder, or any folder on its path, belongs to a private room. The section the room sits in (Rooms or Archive) no longer matters. Every rule keyed on that signal therefore holds in archived private rooms exactly as in active ones.
- Read and copy-out rules that now hold in an archived private room:
  - **Copy out decrypts on the client.** This covers the Copy dialog and drag-and-drop. The destination picker shows the `Common:EncryptedTransferBannerTitle` / `Common:EncryptedTransferBannerDescription` warning. No server copy request is sent for an encrypted file, and folders are refused with `Common:CannotTransferFolderFromPrivateRoom`.
  - **Ctrl+C puts nothing on the clipboard.** In an active room this follows from the server denying the copy right. In an archived room the server grants that right, so the client withholds Ctrl+C itself.
  - **Search runs on the client** over the decrypted names. The query reaches neither the server nor the address, and the search box shows and clears the client search that Open location starts.
  - **Folder menus follow the private-room rules:** no decrypted folder download (only "Download without decryption"), and no copy-to, duplicate, sharing, favorites or plugin entries.
  - **The AI chat is not offered** in a private room, active or archived. This applies under `/rooms/archived` too, which the Private section's route rule does not cover.
- Rules already correct in archive, because they key off per-item flags, are listed in design.md and left unchanged: single-file and multi-file download decrypt, the encrypted-file menu, name recovery, the media viewer, the file being found after Open location, and the hidden Share tab.
- Server facts the client relies on are written into the server contract:
  - the server grants the copy right inside an archived private room, but not inside an active one;
  - it refuses a server-side copy or move of a file out of a private room, active or archived.
- Nothing changes for an ordinary (non-private) archived room.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: new requirements:
  - the private-room signal is decided by the room, whatever its section;
  - files copied out of an archived private room are decrypted;
  - folders cannot leave an archived private room;
  - no decrypted folder download in an archived private room;
  - Ctrl+C is withheld in an archived private room;
  - client-side search in an archived private room.
- `private-rooms/room-membership`: new requirements:
  - no AI chat in private rooms, active or archived;
  - AI and plugin actions withheld in archived private rooms.
- `private-rooms/server-contract`: new requirements:
  - the copy right inside archived private rooms;
  - a server-side copy out of a private room is refused.

## Impact

- Client:
  - the private-room getter in `packages/client/src/store/TreeFoldersStore.ts`;
  - the clipboard in `packages/client/src/store/HotkeyStore.ts`;
  - the warning banner in the destination picker, `packages/client/src/components/FilesSelector/index.tsx`.

  The other consumers of the getter pick up the change without edits, among them:
  - `pages/Home/Section/Filter/index.js` (search);
  - `Shell.jsx` (AI chat);
  - `store/filesStore/contextOptions.helpers.ts` and `store/filesActionsStore/{menu,copyMove}.helpers.ts`.

  design.md lists every consumer and how it behaves in an archived room.
- Mocks: `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` gains an archived-room variant that mirrors the server's archive rights, with contract cases in `encrypted-files-contract.test.ts`.
- Tests:
  - a new unit test for the getter;
  - new cases in `HotkeyStore.clipboard.test.ts`, `FilesActionsStore.copyDelete.test.ts`, the context-options and plugin context-options tests, and `FilesSelector/__tests__/utils.test.ts`;
  - a new Playwright spec, `packages/client/__tests__/private-room-archived.spec.ts`.
- Locales: none. Every message used already exists in `Common.json`.
- Server (`../server`): **no work required**. The server already refuses a server-side copy of an encrypted file out of a private room in either section, so no ciphertext copy lands today; the user gets a misleading "You don't have enough permission to move the file" instead of a decrypted copy. design.md cites the source.
- Document Server, SDK, buildtools: none.

## Out of scope

- The Private section and its Archive view: `private-rooms-sidebar-section`, which depends on this change.
- The SDK archive page (`packages/sdk/src/app/(private)`, `private-rooms-sdk-gating-and-parity`).
- Changes to the archive's read-only rules. Creating, uploading, editing, renaming, moving and deleting inside an archived room stay denied by the server for every role. The create and upload consumers of the signal become stricter in archive, but stay unreachable there.
- The badge rule ("Encrypted items carry a badge … outside Archive"). An archived private room keeps no badge in the Archive list, and encrypted files keep theirs.
- Two server gaps that remain and are noted for `private-rooms-server-hardening` (design.md, "Server findings outside this change"):
  - the Archive branch of the server's rights grants the copy right in private rooms, and lets a non-member administrator read and copy an archived private room's files;
  - whether a subfolder of an archived private room can be copied out by the server as an empty folder was not confirmed.
- Two existing behaviours of active rooms that this change does not alter:
  - a pick of another private room as a copy destination is planned as a same-room transfer and refused by the server;
  - the bulk header menu of a private room offers no Copy, so copy-out of a selection goes through its context menu.

## Decisions needed

Already decided with the user:
- private-room rules apply in archived private rooms exactly as in active ones for every read and copy-out operation;
- the signal is derived from the room's private setting, whatever section the room is in;
- Ctrl+C stays withheld in archived private rooms. Copy-out goes through the Copy dialog or drag-and-drop, where files are decrypted.

Nothing is left open.
