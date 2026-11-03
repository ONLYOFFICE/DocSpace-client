# Tasks

One task is one commit with its code, tests, locales, mocks and the tick (the "Commits" paragraph of `openspec/config.yaml`). Each fix is checked fail-first: the new test fails against the code before the fix.

## 1. Live updates

- [x] 1.1 Read the room of a create-folder event and the folder of `refreshFolderImpl` in `packages/client/src/store/filesStore/socket.helpers.ts` with `skipRedirect`, and drop the event when the read is refused or fails (design decision 1). Verify: cases "Administrator outside a new private room" and "Private room updated" in the socket helper tests, asserting no forbidden handler call and an unchanged list; `cd packages/client && pnpm exec vitest run src/store/filesStore`.

## 2. Key cache

- [x] 2.1 Make `SecretStorage.getCached` return copies of the key material, so a lock wipes only the slot (design decision 2). Verify: cases "Lock now during an upload" and "Idle expiry during a re-wrap" in the secret-storage tests: a pair obtained before `lock()` keeps its bytes, and a wrap made with it after the lock is opened by the recipient; `cd packages/shared && pnpm exec vitest run services/encryption`.
- [x] 2.2 Make `wrapDEK` and `unwrapDEK` (`packages/shared/services/encryption/hpke.ts`) refuse a private key whose bytes are all zero (design decision 3). Verify: case "All-zero private key" in the HPKE tests, and the orchestrator test that a refused wrap writes no access entry.

## 3. Invitations

- [x] 3.1 Add a shared helper in `packages/shared/services/private-room/room-member-flows.ts` that sends private-room invitations one invitee per `setRoomSecurity` request in sequence and returns the accepted and the refused invitees with their status (design decision 4). Verify: cases "One invitee has never registered a key" and "Every invitee refused" in the helper tests.
- [ ] 3.2 Use the helper in the client `InvitePanel` for private rooms: re-wrap the accepted invitees, and list the refused ones in the invite result with Common:EncryptedInviteNoKey for a 403 and Common:EncryptedInviteFailed otherwise. Add both keys to every language in the same commit, with their `.meta` comments, since the locale tests refuse a key no code uses. Verify: cases "Invitee without a key named" and "Other refusal named" in the InvitePanel tests, the client private-room invite E2E with a mocked 403 for one invitee, and `cd common/tests && npx vitest run test/locales.test.js`.
- [ ] 3.3 Use the helper in the SDK invite flow (`packages/sdk/src/app/(private)/_hooks/usePrivateInviteFlow.ts` and the `(rooms)` invite panel). Verify: case "One invitee has never registered a key" in `index.private.test.tsx`, and `cd packages/sdk && pnpm exec vitest run`.

## 4. SDK

- [ ] 4.1 In `PrivateCreateRoomDialog`, treat an unknown key list as one that may hold a key for the key gate and the dialog, and show Common:EncryptionKeysLoadFailed when the save-time load fails (design decision 5). Verify: cases "Key list still loading", "Key list failed to load" and "Key list known to be empty" in `PrivateCreateRoomDialog.test.tsx`.
- [ ] 4.2 Take each file's cancel signal when an encrypted batch starts in `packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts` (design decision 6). Verify: case "File cancelled while waiting" in the hook tests, asserting no chunk and no file creation for the cancelled file.

## 5. Keys page

- [ ] 5.1 Find why "Import a key from the keyboard" (`packages/client/__tests__/keys-management.spec.ts`) fails: bisect between the last run where it passed and `946556ad744`, and check the keyboard path in a real browser (design decision 7). Fix the cause, in the page if real users are affected, else in the spec. Verify: the spec passes five times in a row alone (`--repeat-each=5`) and in the full client E2E run under Docker, then record `private-rooms-pre-pr-review-fixes` 6.2.

## 6. Integration

- [ ] 6.1 Run the pre-push gate, the client private-room and keys E2E under Docker (`tests-dev`), the SDK private E2E after `pnpm run test:build`, and `npx -y @fission-ai/openspec@latest validate --all --strict`. Verify: all green, except the failures the release branch has on its own.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-pre-pr-review-2-fixes` after `private-rooms-pre-pr-review-fixes`, whose sdk-surface and file-operations deltas these deltas sit next to; this change then ticks `private-rooms-beta-release` 0.3.
