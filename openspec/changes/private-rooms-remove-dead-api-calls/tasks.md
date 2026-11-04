# Tasks

## 1. Remove dead requests

- [x] 1.1 Delete `getIsEncryptionSupport` from `packages/shared/api/files/index.ts`, and `getPrivacySettings` / `updatePrivacySettings` with their types from `packages/shared/api/privacy`; verify with `pnpm run tsc` (no remaining references). The per-file privacy access function stays for the desktop bridge and is redirected in 2.1.
- [x] 1.2 Delete `SettingsStore.getIsEncryptionSupport` and the legacy `isEncryptionSupport` wiring in `packages/client/src/Client.jsx` and `packages/client/src/store/FilesStore.ts`, updating `packages/client/src/store/filesStore/__tests__/FilesStore.remaining.test.ts`; verify with `cd packages/client && pnpm exec vitest run src/store/filesStore`
- [x] 1.3 Remove any MSW handler for the deleted routes and verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers`

## 2. Desktop bridge

- [ ] 2.0 Agree the bridge contract for the desktop's new crypto engine (`{DC522726-5E0E-43E5-AA02-8EA156BECBC5}`) with the desktop developer and record it with its date in design.md: which route answers `getsharingkeys` and in which shape (recommended: `files/file/{fileId}/publickeys`; alternative: `privacyroom/{roomId}/access` with the room id from the file's parent chain), and whether the engine still writes keys through `encryptionKeys` / `updateEncryptionKeys` (today `PUT privacyroom/keys` without a key id, which replaces only a key pair stored without an id)
- [ ] 2.1 BLOCKED on 2.0. Point the bridge's sharing-keys request (`getEncryptionAccess` in `packages/shared/api/files/index.ts`, called from `packages/doceditor/src/utils/initDesktop.ts`) at the agreed route and answer shape, and align the key write with the agreed contract; verify with a unit test in `packages/shared/utils/desktop.test.ts` that the crypto command handler answers `getsharingkeys` through the access callback, and `pnpm run tsc`
- [ ] 2.2 Smoke-test the desktop editor with the new engine against a private room (manual, a desktop build that carries the engine): an encrypted file opens and its sharing keys resolve; record the result in this change's README.md

## 3. Specs and gate

- [ ] 3.1 Confirm the server-contract and editor-integration delta specs still match the implemented behaviour; verify with `openspec validate private-rooms-remove-dead-api-calls --strict`
- [ ] 3.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, shared, client and sdk unit tests)
