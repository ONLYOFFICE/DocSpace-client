# Tasks

## 1. Shared verification helper

- [x] 1.1 Add `verifyMemberKeys(recipients, { resolver })` to `packages/shared/services/private-room/room-member-keys.ts` (or next to `room-encryption.ts`) that pins first-seen keys, checks the rest against the TOFU pin, resolves mismatches through the given or registered resolver, and returns verified plus skipped recipients; verify with unit tests in `packages/shared/services/private-room/__tests__/room-encryption.test.ts` covering first-seen, match, mismatch-accepted, mismatch-refused and no-resolver.
- [x] 1.2 Switch the invite and backfill paths in `room-encryption.ts` to the helper without behaviour change; verify the existing `room-encryption.test.ts` and `tofu-mismatch.integration.test.ts` stay green.

## 2. Orchestrator fan-out checks pins

- [x] 2.1 Call the helper in `wrapDekForSelfAndRoom` (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts`) before wrapping and return the skipped members in the orchestrator result; verify with new cases in `__tests__/encrypted-upload-orchestrator.test.ts` asserting no wrap is written for a refused key and that a first-seen key is pinned.
- [x] 2.2 Add an MSW integration case next to `__tests__/tofu-mismatch.integration.test.ts` where the server swaps a member key between two uploads and the second upload omits that member; verify it passes.

## 3. Client upload pipeline checks pins

- [x] 3.1 Call the helper in `encryptKeysForRoomMembersImpl` (`packages/client/src/store/uploadDataStore/encryption.helpers.ts`), awaiting the resolver, and propagate the skipped list to the upload item; verify with new cases in `packages/client/src/store/uploadDataStore/__tests__/encryption.helpers.test.ts` and `UploadDataStore.encryption.test.ts`.
- [x] 3.2 Remember a refusal per (userId, key) for the session so a batch does not prompt per file; verify with a unit test that two files in one batch trigger one resolver call.
- [x] 3.3 When a file's member fan-out finishes with skipped members, show a warning toast Common:EncryptedUploadNotSharedWith naming them (display names resolved through the people API, since the room key list carries user ids only) and mark the file's row in the upload panel with the same message; the fan-out runs after the upload-finish toast and may wait for the key-change dialog, so the finish toast stays as it is. Add the key to `public/locales/en/Common.json`, run `/translate-comments` and `/translate-key`, and verify with a unit test for the warning and `cd common/tests && npx vitest run test/locales.test.js`

## 4. Integration check

- [ ] 4.1 Add an E2E case to `packages/client/__tests__/private-room-cross-user-download.spec.ts` (or a new `private-room-tofu.spec.ts`) where the mocked server changes a member key before an upload and the key-change dialog appears; verify with `cd packages/client && pnpm exec playwright test`.
- [ ] 4.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`) and confirm `npx -y @fission-ai/openspec@latest validate private-rooms-tofu-on-upload --strict` passes.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-tofu-on-upload` after review; the archive merges the delta into `private-rooms/encryption-core`.
