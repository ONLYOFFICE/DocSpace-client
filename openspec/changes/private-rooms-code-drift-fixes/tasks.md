# Tasks

## 1. Delete confirmation

- [x] 1.1 Add the `FilesActionStore` getter `isDeleteConfirmationForced` (`confirmDelete || treeFoldersStore.isPrivacyFolder`, design decision 1) and make the Delete key (`HOCs/withHotkeys.js`), the selection menu (`contextOptionsStore/groupContextOptions.helpers.ts`), the header menu (`FilesHeaderOptionStore.ts`), the open folder's menu (`contextOptionsStore/actions.helpers.tsx`) and `deleteItemActionImpl` test it, with the spec pointer at the getter. Verify: a case "Confirmation disabled in settings" per entry point (the dialog flag set and `deleteAction` not called inside a private room with `confirmDelete` false; unchanged outside one), in `FilesActionsStore.deleteDownload.test.ts`, the `ContextOptionsStore.actions*.test.ts` file that covers the folder menu, and new cases for the hotkey and the header menu next to their existing tests; `cd packages/client && pnpm exec vitest run src/store src/HOCs`

## 2. Paste in a private room

- [x] 2.1 In `HotkeyStore.moveFilesFromClipboard`, compute the private plan before the rights guard. Refusals show their toasts in any folder, and a `same-room` plan needs MoveTo only (design decision 2). Verify: cases "Paste within the same private room" (subfolder without CopyTo, the server move requested), "Paste with hotkey" and "Paste into another private room" in a subfolder (toast shown), and an ordinary folder without CopyTo still ignoring the paste, in `store/__tests__/HotkeyStore.clipboard.test.ts`; `cd packages/client && pnpm exec vitest run src/store/__tests__/HotkeyStore.clipboard.test.ts`

## 3. Warning before a move out without the picker

- [x] 3.1 Add the `confirmDecryption` option to `runPrivateTransferPlan` and the `dialogsStore` field `encryptedTransferConfirm`, pass the option from drag and drop (`moveDragItemsImpl`) and paste (`HotkeyStore.moveFilesFromClipboard`, which clears the clipboard only on confirm), and add `components/dialogs/EncryptedTransferConfirmDialog` (license header, SCSS module if it needs styles, rendered by `FilesPanels`) with Common:EncryptedTransferBannerTitle, Common:EncryptedTransferBannerDescription, Common:Move and Common:CancelButton (design decision 9). Verify: cases "Move out by drag and drop or paste" (no `copyEncryptedFilesToFolder` call before confirming, the plan run after it) and "Warning declined" (nothing run, the clipboard kept) in `FilesActionsStore.copyDelete.test.ts` (where the drag-out cases live) and `HotkeyStore.clipboard.test.ts`, a dialog test for both buttons, and the picker path unchanged (no dialog); `cd packages/client && pnpm exec vitest run src/store src/components/dialogs`
- [x] 3.2 E2E: the existing case "Cut and paste out of a private room" of `packages/client/__tests__/encrypted-file-ui.spec.ts` confirms the new warning before its assertions, and a new case "Warning declined" there cancels it and finds the source in place and nothing uploaded; the cut and paste of `private-room-cross-room-copy.spec.ts` (a move into another private room, refused before any plan runs) stays as it is. Verify: both specs under Docker `tests-dev`

## 4. Key and list fixes

- [x] 4.1 Auto-lock: drop the 24-hour clamp from `getAutoLockTimeoutSeconds` so the preset check decides (design decision 3). Verify: a case "Tampered auto-lock value" writing "999999" straight to storage, reading 0, in `packages/shared/services/encryption/__tests__/auto-lock-preference.test.ts`; `cd packages/shared && pnpm exec vitest run services/encryption`
- [x] 4.2 Sort: re-sort by the resolved titles, folders first, when a private room's list is sorted by name and no query is set (design decision 4). Verify: cases "Sort by name" without a query (decrypted order) and outside a private room (server order kept) in `filesStore/__tests__/FilesStore.clientSearch.test.ts`; `cd packages/client && pnpm exec vitest run src/store/filesStore`
- [x] 4.3 Form from a file: return from the Alt+Shift+O hotkey in a private room (design decision 5). Verify: a case "Form from a file" (no picker opened in a private room, opened elsewhere) next to `HOCs/__tests__/withHotkeys.upload.test.tsx`; `cd packages/client && pnpm exec vitest run src/HOCs`

## 5. Editor and SDK

- [x] 5.1 Doceditor: require an unencrypted file in `aiAllowed` of `useEditorEvents.ts`, dropping the inner encrypted test (design decision 6). Verify: a case "Encrypted file opened" (`createConnector` not called, no `editorDocumentReady` posted, no message listener added) and a plain file still getting the connector, in `packages/doceditor/src/hooks/__tests__/useEditorEvents.test.tsx`; `cd packages/doceditor && pnpm exec vitest run src/hooks`
- [x] 5.2 SDK link: build the keys-management address without `privateRooms` and update its doc comment (design decision 7). Verify: the case "Forgot passphrase" asserting no query parameter in `(private)/_utils/keys-management-link.test.ts`; `cd packages/sdk && pnpm exec vitest run "src/app/(private)/_utils"`
- [ ] 5.3 SDK members: request `filterType: 16` in `PrivateMembersView.tsx`, skip guests in `classifyMembers`, and teach `roomMembersHandlers` the users-only filter with a contract case "Users only" naming `SecurityDao.GetPureSharesQuery` (design decision 8). Verify: "Members listed" with a group and a guest in the answer (neither shown) in `PrivateMembersView.utils.test.ts`, the contract case in `packages/shared/__mocks__/handlers/rooms/__tests__/room-members-contract.test.ts`, and `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private` after `pnpm run test:build`. Type-check login and management too, since the mock reaches them (`Array.from`, no `Set` spread)

## 6. Integration

- [ ] 6.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages), the client private-room E2E specs under Docker (`tests-dev`) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`). Verify: green runs recorded here

## Workflow follow-up

- Outside this change: the same delete paths skip the confirmation for third-party items, rooms and permanent deletion from Trash, which the delete dialog treats as always asking. Raise with the owner as a fix of its own.
- Archive with `/opsx:archive private-rooms-code-drift-fixes` after review.
