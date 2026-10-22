# Proposal

## Why

The review of `private-rooms-upload-target-context` (2026-10-22) and a check on a local portal the same day found gaps in the upload path of private rooms that the fixed upload target did not close:
- **Original names reach the server.** Before an upload, the conflict check sends the names of the files to `POST files/{folderId}/upload/check`, private targets included. That breaks "Opaque upload name with visible extension" (the server never sees the original name). The check is also useless there: the server compares against opaque titles. On the portal a copy into a private room produced two files named "New document" next to each other.
- **A retry can be sent before the unlock is answered.** Retry clears the error and `inAction` of the item, then waits for the batch unlock. A running queue can pick the item up in that window. A declined unlock then leaves an unreadable file in the room, and an accepted one uploads the file twice.
- **A row drop can read the wrong folder.** A drop on a folder row takes the privacy of the open folder at `onDrop`, which runs only after the browser has read the dropped directories. If the user opens another room in between, the target takes that room's privacy.
- **The upload gate fails open on an inconsistent target.** `resolveUploadGate` answers `plain` for a private target whose room type is not the custom room type; no builder produces one today.
- Smaller items: an unused sidebar drop handler (`components/Article/Body/Items.js`) builds targets in the fail-open shape; two upload steps still read the open folder (the AI-room check of the conflict check, the quota check of folder creation); wiring tests are missing for the folder lookup of a row drop and for the section drop; some comments restate requirements.

## What Changes

- The server conflict check is skipped for every upload whose target lies in a private room, so no original name leaves the browser. Whether the client detects name clashes itself, against the decrypted names of the destination, is a decision for a human (see below).
- Retry runs the batch unlock before it resets the item, and a session never starts twice for the same item.
- A drop on a folder row takes its privacy from the row and its folder path, never from the open folder after the directory read.
- The upload gate refuses a private target whose room type is not the custom room type.
- The unused `Items.js` is deleted; the conflict and quota checks read the fixed target; the missing wiring tests are added; restating comments become `Spec:` pointers.

Out of scope:
- server-side validation of encrypted titles (`private-rooms-server-hardening` 4.1);
- the upload abort route (`private-rooms-server-hardening` 7.1).

Decided with the user on 2026-10-22 (task 3.0): name clashes in a private target are checked on the client against decrypted names, offering only "keep both" with a copy suffix (design.md D2).

Server dependency: none. The facts relied on are in design.md, cited from `../server`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: "Opaque upload name with visible extension" gains the conflict-check scenario.
- `private-rooms/file-operations`:
  - "Retry keeps the fixed target" gains retry during a running queue;
  - "Drops onto a private room from outside it are refused" gains navigation during the directory read;
  - "Queued private uploads are sent only as ciphertext" gains the inconsistent target;
  - new requirement: name clashes in a private room are checked on the client.

## Impact

- Client:
  - `packages/client/src/store/uploadDataStore/{start.helpers.ts,chunkUpload.helpers.ts,target.helpers.ts}`;
  - `packages/shared/services/private-room/encrypted-upload.ts`;
  - `packages/client/src/HOCs/withFileActions.js`, `packages/client/src/pages/Home/index.js`;
  - deletion of `packages/client/src/components/Article/Body/Items.js`.
- Tests: unit tests next to the upload helpers and the drop wiring; E2E cases in `packages/client/__tests__/private-room-upload-target.spec.ts`.
- Locales: none unless 3.0 chooses a client-side conflict dialog text.
