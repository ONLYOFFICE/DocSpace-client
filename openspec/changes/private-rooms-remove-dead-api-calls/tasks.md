# Tasks

## 1. Remove dead requests

- [x] 1.1 Delete `getIsEncryptionSupport` from `packages/shared/api/files/index.ts`, and `getPrivacySettings` / `updatePrivacySettings` with their types from `packages/shared/api/privacy`; verify with `pnpm run tsc` (no remaining references). The per-file privacy access function goes with the desktop bridge in 2.1.
- [x] 1.2 Delete `SettingsStore.getIsEncryptionSupport` and the legacy `isEncryptionSupport` wiring in `packages/client/src/Client.jsx` and `packages/client/src/store/FilesStore.ts`, updating `packages/client/src/store/filesStore/__tests__/FilesStore.remaining.test.ts`; verify with `cd packages/client && pnpm exec vitest run src/store/filesStore`
- [x] 1.3 Remove any MSW handler for the deleted routes and verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers`

## 2. Desktop bridge

- [x] 2.0 Decide the desktop bridge route (design.md decision 2): decided 2026-10-20 to drop the bridge, recorded in design.md
- [ ] 2.1 Remove the desktop encryption bridge: the encryption branch, the key parameters and the `cloudCryptoCommand` handler of `regDesktop` (`packages/shared/utils/desktop.ts`), the key arguments at its callers (`packages/doceditor/src/utils/initDesktop.ts`, `packages/client/src/Client.jsx`), the legacy key plumbing in `packages/shared/store/SettingsStore.ts` (`legacyEncryptionKeys`, `setLegacyEncryptionKeys`, `updateLegacyEncryptionKeys`, `getLegacyEncryptionKeys`) with its load in `packages/client/src/store/filesStore/actions.helpers.ts`, and `setEncryptionKeys` / `getEncryptionKeys` / `getEncryptionAccess` in `packages/shared/api/files/index.ts`; keep the portal login, the API-key provisioning and the system messages; verify with a `regDesktop` unit test (login data without encryption keys, no crypto command handler installed) and `pnpm run tsc`
- [ ] 2.2 Smoke-test the desktop application against a portal with a private room (manual, desktop build): the portal login works and an ordinary document opens in the editor; record the result in this change's README.md

## 3. Specs and gate

- [x] 3.1 Confirm the server-contract and editor-integration delta specs still match the implemented behaviour; verify with `openspec validate private-rooms-remove-dead-api-calls --strict`
- [x] 3.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, shared and client unit tests)
