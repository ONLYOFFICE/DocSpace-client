# Tasks

## 1. A fixed context in the upload pipeline

- [x] 1.1 Add `TUploadTarget` (`{ folderId, isPrivate, roomType, encryptionRoomId }`) to `packages/client/src/store/uploadDataStore/helpers.ts`, and store it on every `TUploadFile` that `startUploadImpl` (`start.helpers.ts`) creates (design D1, D2):
  - `startUpload` accepts a target. Until task 2.2 makes it required, a caller that passes none gets the open folder's target, taken when it calls;
  - a per-file `uploadContext` (copy and move) wins for `isPrivate`, `roomType` and `moveSource`;
  - `needConvert` is decided from the target;
  - `__tests__/testHarness.ts` gets a default non-private target.

  Nothing reads the stored target yet.

  Verify with new cases in `packages/client/src/store/uploadDataStore/__tests__/start.helpers.test.ts`:
  - every item carries the target it was queued with;
  - changing or clearing the selected folder after queuing leaves the items unchanged;
  - no conversion is offered for a private target;
  - `uploadContext` precedence.

  Run `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`.
- [x] 1.2 Decide privacy from the item's context only (design D2):
  - `resolveUploadGate` and `willEncryptUploadItem` in `packages/shared/services/private-room/encrypted-upload.ts` take a required item context (`isPrivate`, `roomType`) instead of `UploadFolderContext`;
  - `resolveItemRoomContext` loses its folder fallback;
  - the client readers pass the item's fixed context:
    - the gate and `prepareFileForEncryptedUploadImpl` in `startSessionFuncImpl` (`chunkUpload.helpers.ts`);
    - `willEncryptItemImpl`;
    - `ensureEncryptionUnlockedForBatchImpl` and `cancelEncryptedBatchUploadImpl` (`encryption.helpers.ts`);
  - `shouldEncryptCurrentUploadImpl` (`selectors.helpers.ts`) builds its context from the open folder, so the create menus keep their behaviour;
  - `getUploadFolderContext` and `getUploadEncryptionContext` are removed from `packages/client/src/store/UploadDataStore.tsx`.

  Verify with:
  - `packages/shared/services/private-room/__tests__/upload-encryption-gate.test.ts`, rewritten for the new signature:
    - a fixed private context encrypts, and refuses without a key;
    - a fixed non-private context never encrypts;
    - an already encrypted item passes unchanged.

    Run `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/upload-encryption-gate.test.ts`;
  - new cases in `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts`, named after the scenarios "Room left while files are queued", "Files section left while files are queued", "Private room opened while a plain upload is queued", "No key when the queued file starts" and "Unlock declined for a queued batch". Each case changes or clears the selected folder between queuing and session start, then asserts the session's `encrypted` flag and the opaque name;
  - `cd packages/client && pnpm exec vitest run src/store/uploadDataStore` and `pnpm run tsc`.
- [ ] 1.3 Make the session folder and the ciphertext check follow the item (design D2, D5):
  - `startSessionFuncImpl` opens the session in `toFolderId` as stored, with no `isAIRoom ? knowledgeId : ...`;
  - when the gate says "encrypt" and preparation returns no ciphertext, the item fails with `Common:EncryptionPrepareFailed` before the session starts.

  Verify with:
  - the case "Encryption yields no ciphertext" in `UploadDataStore.encryption.test.ts`;
  - a case in `UploadDataStore.chunks.test.ts`: opening an AI agent after queuing does not move the session folder;
  - a new Playwright spec, `packages/client/__tests__/private-room-upload-target.spec.ts`, with the scenario "Room left while files are queued":
    - it sends more than five files (`FilesSettingsStore.maxUploadFilesCount`) through `#customFileInput` into a private room, with the session route delayed;
    - it then opens `/rooms/shared/filter`;
    - every `/files/{roomId}/session` request must carry `encrypted: true` and a UUID name, and no chunk body may be plaintext.

  Run `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`, and the E2E spec in Docker with `cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room-upload-target.spec.ts`.
- [ ] 1.4 Make retry run the rules again (design D6). `retryUploadFilesImpl` and `retryQuotaFailedFilesImpl` (`start.helpers.ts`) keep the item's target. Before `parallelUploading`, they run the batch unlock over the retried items that will be encrypted. If the user declines, the existing cancel path fails those items with `Common:EncryptionLockedUpload`.

  Verify with:
  - new cases in `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.retry.test.ts`:
    - "Retry from another folder";
    - "Retry still without a key";
    - "Retry while locked": no session and no wrap;
    - "Retry after a quota failure";
  - the E2E scenario "Retry from another folder" in `private-room-upload-target.spec.ts`. The first session request fails, the user opens the Rooms list and clicks Retry in the upload panel, and the retried session is encrypted with a DSE3 body.

  Run the same commands as in 1.3.

## 2. The target captured at every entry point

- [ ] 2.1 Add `packages/client/src/store/uploadDataStore/target.helpers.ts` with `resolveOpenFolderTarget`, `resolveDropTarget` and the refusal predicate (design D1, cases (a) to (e), and D3):
  - case (d) loads the folder's path and its room the way `filesStore/fetch.helpers.ts` does, and rejects on any error;
  - the predicate refuses a private target whose room is not the open folder's room, and it refuses a rejected lookup.

  Verify with a new `packages/client/src/store/uploadDataStore/__tests__/target.helpers.test.ts`. It covers every case and the decisions behind:
  - "Files dropped on a private room row";
  - "Ordinary room row";
  - "Folder row inside the open private room";
  - "Folder of a private room listed outside it";
  - "Target room cannot be determined".

  Run `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`.
- [ ] 2.2 Capture the target at every entry point that uploads into the open folder, and make `startUpload`'s target argument required (design D4, D7). The entry points:
  - the section drop in `pages/Home/index.js`;
  - `HotkeyStore.uploadClipboardFiles`;
  - `components/UploadInputs/index.tsx`;
  - the header file input in `pages/Home/Section/Header/index.js`;
  - the AI-knowledge upload in `EmptyViewContainer.hooks.ts`;
  - the encrypted copy in `filesActionsStore/copyMove.helpers.ts`, which builds its target before the decryption loop.

  Also:
  - `createFoldersTreeImpl` (`filesActionsStore/selection.helpers.ts`) receives the target, decides the folder-tree refusal from it, and uses its `folderId`;
  - `components/Article/Body/Items.js` and `components/Article/MainButton/index.js` change only as far as the new signature requires;
  - the `.meta` comment of `Common:FolderUploadNotSupportedInPrivateRoom` is refreshed with the `translate-comments` skill: the toast covers drops into an open private room or onto its folders.

  Verify with:
  - new cases in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.createFoldersTree.test.ts`: "Folders dropped on the view", "Files and folders dropped together" and "Folders dropped on a folder of the open room", each with a target that disagrees with `isPrivacyFolder`;
  - a case "Pasted files after navigation" in `packages/client/src/store/__tests__/HotkeyStore.clipboard.test.ts`;
  - `UploadDataStore.moveSource.test.ts` and the copy-out cases of `packages/client/__tests__/encrypted-file-ui.spec.ts`, unchanged and green;
  - `pnpm run tsc` and `cd common/tests && npx vitest run test/locales.test.js`.
- [ ] 2.3 Refuse drops onto a private room from outside it (design D3). In `packages/client/src/HOCs/withFileActions.js`, `onDrop` resolves the row's target before `createFoldersTree`:
  - a refused drop shows `toastr.warning(t("Common:OpenPrivateRoomToUpload"))`, resets the dragging state and sends nothing;
  - a failed lookup shows the request's error, as other failed requests do.

  Add `Common:OpenPrivateRoomToUpload` to `public/locales/en/Common.json`, with the text "Files were not uploaded. Open the private room to upload files to it." Then:
  - run the `translate-comments` skill. The comment must say that the toast appears when files from the computer are dropped onto a private room's row or tile in a list, and that nothing was uploaded;
  - run the `translate-locales` skill;
  - run `cd common/tests && npx vitest run test/locales.test.js`.

  Verify with:
  - the decision cases of 2.1;
  - the E2E scenarios "Files dropped on a private room row", "Files dropped on a private room tile", "Folder tree dropped on a private room row", "Convertible file dropped on a private room row" and "Ordinary room row" in `private-room-upload-target.spec.ts`:
    - the drop is simulated by dispatching `dragenter`, `dragover` and `drop` with a `DataTransfer` built in the page;
    - no `/session` or folder-creation request may reach the private room, and the ordinary room must get its upload;
  - the locale tests above.

## 3. Integration

- [ ] 3.1 Run the private-room E2E suites in Docker with `cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room __tests__/encrypted-file-ui.spec.ts __tests__/keys-management`. Verify that the `--reporter=line` summary is green, including the "Uploader without a key" case in `private-room-access.spec.ts`.
- [ ] 3.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict` (with `OPENSPEC_TELEMETRY=0`). Verify that everything is green.

## Workflow follow-up

- Before archiving, add `packages/client/src/HOCs/withFileActions.js` to the implementation list in the Purpose of `openspec/specs/private-rooms/file-operations/spec.md`.
- Archive with `/opsx:archive`. This merges the four ADDED requirements and the MODIFIED "Folder upload disabled in private rooms" into the file-operations spec.
- After the archive, task 0.2 of `private-rooms-sidebar-section` can confirm this prerequisite.
- When `private-rooms-server-hardening` decides its item 5 (a server refusal of plaintext in private rooms), point it at this change. The client then refuses every path found here, and the server is still missing as a second line of defence.
