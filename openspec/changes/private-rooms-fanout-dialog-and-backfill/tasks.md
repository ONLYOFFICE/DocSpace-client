# Tasks

Every task below is committed on its own (see "Commits" in `openspec/config.yaml`).

## 1. Key-change requests queue

- [x] 1.1 Replace the single resolver ref in `packages/shared/context/encryption/EncryptionContext.tsx` with an ordered queue: show the first request, resolve the shown request and every waiting request with the same user id and new key on accept or refuse, then show the next distinct request; a new request never resolves a pending one; verify with new cases in `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` ("Second mismatch while a dialog is open", "Same key asked twice", "No automatic refusal") via `cd packages/shared && pnpm exec vitest run context/encryption`
- [x] 1.2 Add a case to `packages/shared/services/private-room/__tests__/room-encryption.test.ts` (`verifyMemberKeys`) proving that a request still waiting when another arrives is not recorded in the refusal set and gets the wrap once the user accepts; verify with `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/room-encryption.test.ts`

## 2. Client fan-out runs one at a time

- [x] 2.1 Chain the member fan-out of `wrapForSelfThenRoomImpl` (`packages/client/src/store/uploadDataStore/encryption.helpers.ts`) on a store-level promise in `packages/client/src/store/UploadDataStore.tsx`, keeping the uploader's self-wrap immediate; verify with new cases in `packages/client/src/store/uploadDataStore/__tests__/encryption.helpers.test.ts` where two fan-outs start concurrently with the same changed key and the resolver is called once, both files get the wrap on accept, and nothing is added to `memberKeyRefusals` ("Batch meets one changed key", "Unanswered request is not a refusal")
- [ ] 2.2 Confirm `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts` still passes with the chained fan-out and extend the batch cancel case if the chain changes its order; verify with `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`

## 3. Caller-only access reads

- [ ] 3.1 In `packages/shared/services/private-room/room-encryption.ts` drop the "already has an entry" filters of `addMembersToEncryptedRoom` and `backfillEncryptedFilesForRoomMembers` in favour of the explicit skip of the caller, and remove the post-write drift verification; in `encrypted-upload-orchestrator.ts` and `packages/client/src/store/uploadDataStore/encryption.helpers.ts` reduce the same filter to the caller skip; verify with `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/room-encryption.integration.test.ts` printing no `encryption-acl-drift` line and with the unit tests of 3.2
- [ ] 3.2 Rewrite the access-read fixtures in `packages/shared/services/private-room/__tests__/room-encryption.test.ts` to the caller's entries only and replace the cases that needed other users' entries with "re-wraps a member who already had a wrap from another sender", "backfill wraps every listed member except the caller" and "a member with several keys gets one wrap"; keep the revoke cases' behaviour on caller-only fixtures; verify with `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/room-encryption.test.ts`
- [ ] 3.3 Add an MSW integration case to `room-encryption.integration.test.ts`: a second manager's sweep replaces a member's wrap and the member still unwraps the file through the file's public keys ("Existing wraps are replaced"); verify with `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/room-encryption.integration.test.ts`

## 4. Integration check

- [ ] 4.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and the private-room Playwright specs in Docker (`cd packages/client && docker compose run --rm -T -e WORKERS=2 tests-dev pnpm exec playwright test __tests__/private-room-tofu.spec.ts __tests__/private-room-invite.spec.ts __tests__/private-room-cross-user-download.spec.ts`); verify all green
- [ ] 4.2 `npx -y @fission-ai/openspec@latest validate private-rooms-fanout-dialog-and-backfill --strict` passes and the four deltas match the implemented behaviour

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-fanout-dialog-and-backfill` after review; the archive merges the deltas into key-management, encryption-core, room-membership and sdk-surface.
- Record the "members lacking an entry" server query as a candidate task in `private-rooms-server-hardening`.
