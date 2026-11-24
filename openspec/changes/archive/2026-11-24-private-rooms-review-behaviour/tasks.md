# Tasks

## 1. Passphrase change

- [x] 1.1 Make `lockAfterReseal` in `packages/shared/context/encryption/EncryptionContext.tsx` remove the remembered record of the device (design.md, decision 1); verify with new cases "Passphrase changed on a remembered device" (record removed, the next `requireIdentity` raises the dialog) in `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` via `cd packages/shared && pnpm exec vitest run context/encryption`
- [x] 1.2 Put the new envelope into the key list the page holds right after the server accepted it, in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/flows/useRotatePassphraseFlow.tsx` with a callback from `KeysManagement.tsx` (design.md, decision 2); verify with a case "Key list not read again after the change" in the flow's unit test (the list holds the new `privateKeyEnc` although the read rejected) via `cd packages/client && pnpm exec vitest run src/pages/Profile/Section/Body/sub-components/keys-management`

## 2. Decrypted archives

- [x] 2.1 Count the files left out for a replaced key in both archives of `packages/client/src/store/filesActionsStore/download.helpers.ts` and show Common:PrivateRoomReplacedKeyBarText with the count when it is the one cause and nothing was decrypted (design.md, decision 3); verify with cases "Every file is wrapped for a key the user no longer holds" and "No file can be decrypted" for the selection and for the folder in `FilesActionsStore.deleteDownload.test.ts` via `pnpm test:store`

## 3. Key-change dialog

- [x] 3.1 Remove the recovery reason from `packages/shared/dialogs/key-change-dialog/KeyChangeDialog.tsx` and `KeyChangedReasonRecovery` from every `public/locales/*/Common.json` with its `.meta` file (bulk edit by script, per `.claude/rules/bulk-locale-edits.md`); update the dialog's unit test to expect two reasons; verify with `cd packages/shared && pnpm exec vitest run dialogs/key-change-dialog`, `cd common/tests && npx vitest run test/locales.test.js` and a search that finds no `KeyChangedReasonRecovery` outside `openspec/changes/archive`

## 4. Integration

- [x] 4.1 Run `pnpm nx run-many -t tsc lint test --parallel=3`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; run `keys-management.spec.ts` and `keys-management-advanced.spec.ts` in Docker and check that no case other than the two known screenshot differences (passphrase-create.png, passphrase-rules-tooltip.png) fails
