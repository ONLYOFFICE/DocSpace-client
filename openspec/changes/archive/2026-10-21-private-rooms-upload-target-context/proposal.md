# Proposal

## Why

The client decides whether to encrypt an upload by looking at the folder that is open when each file is sent, not at the folder the file goes to. Two paths therefore put plaintext into a private room:
- files dropped from the computer onto a private room's row or tile in a rooms list;
- files that are queued or retried after the user has left the room.

The server stores both as they come (design.md, Context). This has to be closed before group 2 of `private-rooms-sidebar-section`. That group adds the Private list, where every row is a private room, and new redirects out of a room.

## What Changes

- Files dropped from the computer are refused when they land on a private room, or on a folder inside one, while the open folder is outside that room. In that case:
  - nothing is created or sent, and conversion is not offered;
  - a toast (new key `Common:OpenPrivateRoomToUpload`) tells the user to open the room to upload.

  This holds for rows and tiles in every list: Rooms, Rooms → Archive, the coming Private section, and any other list that shows a private room or one of its folders. If the client cannot tell whether the target lies in a private room, it refuses the drop the same way.
- The client fixes an upload's target, and whether that target lies in a private room, when the user drops, pastes or picks the files. Every queued file carries this fixed context: the folder, the private flag, the room type, and the room whose members get key wraps. Every later step uses only the fixed context and never falls back to the open folder:
  - the session start and the folder the session is opened in;
  - the batch unlock prompt and the encryption;
  - conversion and the folder-tree refusal;
  - retry.
- A file fixed for a private room leaves the browser only as ciphertext. It fails closed with the existing messages if it cannot be encrypted when its turn comes: no key, unlock declined, or encryption that returns no ciphertext.
- Retry from the upload panel and retry after a quota failure apply these rules again to the item's fixed target. That includes the unlock prompt before any byte is sent, which today is skipped on retry.
- "Folder upload disabled in private rooms" is reworded to cover drops into an open private room and onto its folders. The new rule refuses drops from outside the room as a whole.
- **BREAKING** (wherever private rooms are listed, with or without the opt-in): dropping files onto a private room's row or tile no longer uploads anything.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`:
  - ADDED "Drops onto a private room from outside it are refused", "Upload target is fixed when the user starts the upload", "Queued private uploads are sent only as ciphertext" and "Retry keeps the fixed target";
  - MODIFIED "Folder upload disabled in private rooms": it covers drops into an open private room and onto its folders, and is decided from the drop's target.

## Impact

- Client:
  - the drop handlers: `packages/client/src/HOCs/withFileActions.js` (rows and tiles of the table, row and tile views) and the section drop in `packages/client/src/pages/Home/index.js`;
  - the other entry points, which capture the target at the user action:
    - the Ctrl+V file paste (`store/HotkeyStore.ts`);
    - the file inputs (`components/UploadInputs`, `pages/Home/Section/Header/index.js`);
    - the AI-knowledge device upload (`components/EmptyContainer/sub-components/EmptyViewContainer/EmptyViewContainer.hooks.ts`);
    - the encrypted copy (`store/filesActionsStore/copyMove.helpers.ts`);
  - `store/filesActionsStore/selection.helpers.ts` (`createFoldersTree`);
  - the upload pipeline: `store/uploadDataStore/{start,chunkUpload,encryption,selectors,helpers}` and `store/UploadDataStore.tsx`;
  - the shared upload gate in `packages/shared/services/private-room/encrypted-upload.ts`.
- Locales: a new key `Common:OpenPrivateRoomToUpload` in `public/locales/en/Common.json`, with its `.meta`, translated to every supported language.
- Tests:
  - unit tests in `packages/shared/services/private-room/__tests__/upload-encryption-gate.test.ts`, `packages/client/src/store/uploadDataStore/__tests__`, `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.createFoldersTree.test.ts` and `packages/client/src/store/__tests__/HotkeyStore.clipboard.test.ts`;
  - a new Playwright spec, `packages/client/__tests__/private-room-upload-target.spec.ts`.
- Server (`../server`): **no work required.** The server stores the `encrypted` flag of an upload session as the client sends it and never compares it with the room's private setting (design.md, Context). The client is therefore the only guard today. Whether the server should refuse plaintext written into a private room is still open in `private-rooms-server-hardening` (its "Decisions needed", item 5), and it stays there.
- Document Server: none. Buildtools: none.
- Coordination:
  - this change is a prerequisite of `private-rooms-sidebar-section` group 2. That change's task 0.2 waits for this one to be archived;
  - `private-rooms-archived-room-rules` (its design D1) widens `isPrivacyFolder` to archived private rooms, and it lists upload lines that this change rewrites (`start.helpers.ts:307`, `encryption.helpers.ts:339`, `UploadDataStore.tsx:396`, `selection.helpers.ts:219`). After this change, the open folder's privacy is read in one place only, `resolveOpenFolderTarget`, through that same getter, so the widening carries over. Whichever change is applied second rebases onto the first; their requirements do not overlap.

## Out of scope

- Server-side refusal of plaintext in private rooms (`private-rooms-server-hardening`).
- Encrypting files dropped onto a private room's row. The user chose refusal; see design.md D3.
- Upload paths of the SDK private surface `/sdk/private*` (`private-rooms-sdk-gating-and-parity`).
- Archived private rooms (`private-rooms-archived-room-rules`).
- Moves and copies of existing items between folders, which "Transfer into a private room is refused" already covers.
- The short interval between the browser's drop event and the moment the ui-kit drop zone hands the files to the client (design.md, Risks).

## Decisions needed

Already decided with the user:
- drops onto a private room from outside it are refused and nothing is sent; a toast asks the user to open the room;
- the refusal applies to every list that shows a private room's row or tile;
- queued and retried items keep the context fixed at queue time and never fall back to the open folder;
- a file fixed for a private room is never sent unencrypted, and fails closed under the existing rules when it cannot be encrypted.

Default taken in this proposal, open to review: Retry stays on offer for `Common:EncryptionKeysRequiredForUpload` and `Common:EncryptionLockedUpload`, and runs the rules again (design.md D6). Withdrawing Retry for those errors instead would change the scenarios of "Retry keeps the fixed target".
