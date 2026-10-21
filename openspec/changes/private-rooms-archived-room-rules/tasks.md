# Tasks

## 1. The private-room signal

- [x] 1.1 Drop the root-type condition from `TreeFoldersStore.isPrivacyFolder` (`packages/client/src/store/TreeFoldersStore.ts`), as design D1 and D2 describe. The open folder's own `private` flag or any `private` entry of `navigationPath` decides, whatever the root folder type.

  Verify with a new `packages/client/src/store/__tests__/TreeFoldersStore.privacy.test.ts`, which names its cases after the scenarios of "Private-room rules follow the room into Archive":
  - an active private room, at the root and in a subfolder;
  - an archived private room, at the root and in a subfolder (`rootFolderType` 20);
  - an ordinary archived room;
  - My documents.

  Run `cd packages/client && pnpm exec vitest run src/store/__tests__/TreeFoldersStore.privacy.test.ts`. Then run `pnpm exec vitest run src/store` to show that the existing consumer tests stay green unchanged.
- [x] 1.2 Pin the archive outcome of the consumers that read the signal, without changing their code. Add cases to:
  - `packages/client/src/store/filesStore/__tests__/FilesStore.contextOptions.branches.test.ts`. A folder whose root is Archive, inside a private room, offers no download, copy-to, duplicate, sharing-settings, copy-shared-link, manage-links, link-for-room-members or mark-as-favorite, and does offer download-encrypted (scenario "Folder menu in an archived private room").
  - `FilesStore.contextOptions.plugins.test.ts`. A folder inside an archived private room gets no plugin entries and no ask-ai (scenario "Folder context menu with a folder plugin installed").
  - `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.copyDelete.test.ts`:
    - a drag of encrypted files from an archived private room to My documents is planned as `decrypt-out` and requests no server copy;
    - a drag of a folder is refused with `Common:CannotTransferFolderFromPrivateRoom` (scenario "Folder dragged out").

  Run `cd packages/client && pnpm exec vitest run src/store/filesStore src/store/filesActionsStore`, and update no snapshot.

## 2. Clipboard and destination picker

- [x] 2.1 Withhold Ctrl+C inside a private room in `HotkeyStore.copyToClipboard` (`packages/client/src/store/HotkeyStore.ts`), as design D3 describes. A copy, not a cut, returns while the signal is true, whatever the items' copy right. Leave the pointer `Spec: file-operations, "Copy hotkey withheld in an archived private room"`.

  Verify with new cases in `packages/client/src/store/__tests__/HotkeyStore.clipboard.test.ts`, on encrypted files that report `security.Copy: true` in an archived private room:
  - "Ctrl+C on encrypted files": the clipboard stays empty and no toast is shown;
  - "Paste after Ctrl+C": Ctrl+V in My documents transfers nothing and requests no server copy.

  The existing case "Copy hotkey inside a private room" must still pass. Run `cd packages/client && pnpm exec vitest run src/store/__tests__/HotkeyStore.clipboard.test.ts`.
- [x] 2.2 Make the destination picker's encrypted-transfer warning follow the signal, as design D4 describes. Move the predicate behind `showEncryptedTransferBanner` (`packages/client/src/components/FilesSelector/index.tsx`) into a pure helper in `components/FilesSelector/utils.ts`. The helper reads `sourceInPrivateRoom` instead of the open folder's own `private` flag.

  Verify with new cases in `packages/client/src/components/FilesSelector/__tests__/utils.test.ts`:
  - copy or move of encrypted files from inside a private room shows the warning at the root and in a subfolder whose own flag is false (scenario "Warning in the destination picker");
  - a non-private source shows no warning;
  - a selection without encrypted files shows none.

  Run `cd packages/client && pnpm exec vitest run src/components/FilesSelector`.

## 3. Mocks and end-to-end coverage

- [x] 3.1 Add an `archived` option to `encryptedFilesHandlers` (`packages/shared/__mocks__/handlers/files/encryptedFiles.ts`), as design D6 describes:
  - the room and its files report `rootFolderType: 20` and the Archive section id as `rootFolderId`;
  - the files follow the Archive branch of `FileSecurity.FilterEntryAsync` for the room owner: Read, Download, ReadHistory and Copy true; Edit, Rename, Move, Delete and Duplicate false;
  - the room denies Create, CopyTo and MoveTo.

  The doc comment names `FileSecurity.FilterEntryAsync` and its Archive branch. Add no `fileops/copy` handler.

  Verify with new cases in `packages/shared/__mocks__/handlers/files/__tests__/encrypted-files-contract.test.ts`, mirroring the server-contract scenarios "File in an active private room" and "File in an archived private room". Run `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`.
- [x] 3.2 Add `packages/client/__tests__/private-room-archived.spec.ts` on the archived mock. Use `aiConfigHandler` with AI services on, as `ai-chat-header-button.spec.ts` does, and record every request to assert what is not sent. Walk these scenarios:
  - from file-operations:
    - "Archived private room opened", "Folder inside an archived private room", "Ordinary archived room" and "Download in an archived private room";
    - "Copy to My documents", "No server copy", "Warning in the destination picker" and "Identity locked";
    - "Folder context menu";
    - "Ctrl+C on encrypted files" and "Paste after Ctrl+C";
    - "Search by decrypted name", "Query stays on the client", "Search cleared" and "Open location of an encrypted file";
  - from room-membership: "Archived private room under Rooms" and "Ordinary archived room" (AI chat), and "Encrypted file in an archived private room".

  Rebuild the image first, because the mocks changed (`pnpm test:e2e:docker:build`), or use `pnpm test:e2e:docker:dev`. Then verify with `cd packages/client && pnpm test:e2e:docker:start __tests__/private-room-archived.spec.ts`.
- [x] 3.3 Run the existing private-room E2E specs to show that the active-room behaviour is unchanged: `cd packages/client && pnpm test:e2e:docker:start __tests__/private-room-access.spec.ts __tests__/private-room-cross-user-download.spec.ts __tests__/private-room-invite.spec.ts __tests__/private-room-members.spec.ts __tests__/private-room-tofu.spec.ts __tests__/encrypted-file-ui.spec.ts`. Verify that all are green in Docker.

## 4. Integration

- [ ] 4.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict` (with `OPENSPEC_TELEMETRY=0`). Verify that everything is green.

## Workflow follow-up

- Archive with `/opsx:archive` before `private-rooms-sidebar-section` ships its Private → Archive routes (its task 0.2 checks this). Archiving adds the requirements to `file-operations`, `room-membership` and `server-contract`.
- Hand the two findings in design.md ("Server findings outside this change") to `private-rooms-server-hardening` with `/opsx:update`:
  - the Archive branch has no private-room guard;
  - folder copies out of an archived private room were not confirmed.
- After archiving, the `private-rooms-sidebar-section` design no longer needs its risk line "`isPrivacyFolder` is false inside archived private rooms". Drop it with `/opsx:update` when that change is next revised.
