# Tasks

## 1. Remove dead requests

- [ ] 1.1 Delete `getIsEncryptionSupport` and the per-file privacy access function from `packages/shared/api/files/index.ts`, and `getPrivacySettings` / `updatePrivacySettings` with their types from `packages/shared/api/privacy`; verify with `pnpm run tsc` (no remaining references)
- [ ] 1.2 Delete `SettingsStore.getIsEncryptionSupport` and the legacy `isEncryptionSupport` wiring in `packages/client/src/Client.jsx` and `packages/client/src/store/FilesStore.ts`, updating `packages/client/src/store/filesStore/__tests__/FilesStore.remaining.test.ts`; verify with `cd packages/client && pnpm exec vitest run src/store/filesStore`
- [ ] 1.3 Remove any MSW handler for the deleted routes and verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers`

## 2. Desktop bridge

- [ ] 2.1 Resolve the room id from the file's parent chain in `packages/doceditor/src/utils/initDesktop.ts` and `packages/shared/utils/desktop.ts`, and call the room access request instead of the per-file one; verify with a doceditor unit test that asserts the room route is requested for a file in a subfolder
- [ ] 2.2 Smoke-test the desktop editor against a private room (manual, desktop build) and record the result in this change's README.md

## 3. Specs and gate

- [ ] 3.1 Confirm the server-contract and editor-integration delta specs still match the implemented behaviour; verify with `openspec validate private-rooms-remove-dead-api-calls --strict`
- [ ] 3.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, shared and client unit tests)
