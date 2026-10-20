# Tasks

Every task below is committed on its own (see "Commits" in `openspec/config.yaml`).

## 1. Key selection

- [x] 1.1 Add `selectUserKey(envelopes)` to `packages/shared/services/encryption` (newest parsed `date`, ties and unparsable dates to the last listed, `null` for none); verify with a unit test covering one key, two keys with different dates, equal dates, a legacy `0001-01-01` envelope and an empty list.
- [x] 1.2 Make `loadRoomMemberKeys` (`packages/shared/services/private-room/room-member-keys.ts`) return one key per user chosen by `selectUserKey`, and drop the all-keys views that have no remaining caller; verify with `room-member-keys` tests for a member listed with two keys.

## 2. One wrap per member

- [x] 2.1 Build the recipient list per user in `encryptKeysForRoomMembersImpl` (`packages/client/src/store/uploadDataStore/encryption.helpers.ts`), de-duplicating existing entries by user id; verify with a new case in `UploadDataStore.encryption.test.ts` where a member has two keys and the write names each user once.
- [x] 2.2 Same for `wrapDekForSelfAndRoom` in `packages/shared/services/private-room/encrypted-upload-orchestrator.ts` (SDK upload, encrypted file creation); verify with `encrypted-upload-orchestrator.test.ts`.
- [x] 2.3 Route `addMembersToEncryptedRoom` (`resolveMemberKey`), `backfillEncryptedFilesForRoomMembers` and `validateMembersForEncryption` in `room-encryption.ts` through the one-key-per-user map; verify the existing `room-encryption.test.ts` cases still pass and add one for a member listed with two keys.

## 3. Own key everywhere

- [x] 3.1 Replace `selectActiveKey`/`getActiveKeyId` with `selectUserKey` in the client `EncryptionProviderWrapper.jsx`, `uploadDataStore/selectors.helpers.ts` (`getUserEncryptionKeysImpl`), the doceditor `EncryptionProviderWrapper.tsx` and `utils/initDesktop.ts`, and the SDK `EncryptionIdentityStore.tsx` and `useEncryptedUpload.ts`; remove the "choose a key" hint branch (`Common:EncryptionChooseKeyHint`) and its SDK copy; verify with `selectors.helpers.test.ts` (two keys now resolve to the newer one) and the wrapper tests.
- [x] 3.2 Remove `active-key-preference.ts` and `rotation-state.ts` with their tests, the `activate` flag of `applyNewIdentity`, and the `currentPublicKeyId` ordering in `unwrapDekForCurrentUser` with its multi-key tests; keep the sender-candidate tests; verify with `pnpm test` (shared).

## 4. Key management with one key

- [x] 4.1 Hide "Generate new key" and "Import key" while the user has a key (`KeysManagement.tsx`), and drop `hasExistingKeys` from `useGenerateKeyFlow` and `useImportKeyFlow`; verify with flow tests (generation and import refused or not offered with a key) and the page test.
- [x] 4.2 Remove "Use on this device", the key switch (`useSwitchKeyFlow`), the room migration (`useRotateIdentityForRooms`, `rotation-runner.ts`, `rotateOwnIdentityForRoom`), the resume banner and the progress block, and render one key card in `KeysList.tsx`; delete their tests and `rotate-identity.integration.test.ts`; verify with `pnpm test:client` and `pnpm test`.
- [x] 4.3 Simplify `useDeleteKeyFlow`, `useResetKeysFlow` (delete every listed envelope), `useRotatePassphraseFlow` (always lock after re-sealing) and `useRecoverKeyFlow` (target the selected key, no preference write); verify with their flow tests.
- [ ] 4.4 Add the unused-key notice and the "delete unused keys" action (warning plus passphrase of the selected key, deletes every other envelope); verify with a page test for three envelopes and for one.

## 5. Locales

- [ ] 5.1 Add `Common:UnusedEncryptionKeysNotice` and `Common:DeleteUnusedEncryptionKeys`; remove the keys used only by the multi-key UI from every language (`UseOnThisDevice`, `EncryptionKeyActivated`, `SwitchKeyPassphraseTitle`, `SwitchKeyPassphraseHint`, `ResumeReEncryptionHint`, `ResumeReEncryptionCta`, `RotatingIdentitySuccess`, `RotatingIdentityPartialFailure`, `RotatingIdentityFailed`, `EncryptionChooseKeyHint`, after confirming each has no remaining caller) with their `.meta`; run `/translate-comments` and `/translate-locales` for the new keys; verify `cd common/tests && npx vitest run test/locales.test.js`.

## 6. E2E and integration

- [ ] 6.1 Update `packages/client/__tests__/keys-management*.spec.ts` and `key-flow-edge-cases.spec.ts` for the removed controls and the hidden generate/import; verify with the keys-management E2E specs in Docker.
- [ ] 6.2 Run the pre-push gate commands and the private-room E2E specs; verify all green.
- [ ] 6.3 `npx -y @fission-ai/openspec@latest validate private-rooms-single-key --strict` passes; at archive, update the encryption-core and key-management Purpose texts (drop rotation-state, active-key-preference, "replacing" keys).

## Workflow follow-up

- Archive `private-rooms-upload-fail-closed` before this change (same file-operations requirement).
- The server bug in design.md (account link removed on key save) goes to the server team.
