# Tasks

## 1. Shared service returns per-invitee wrap results

- [ ] 1.1 Make `addMembersToEncryptedRoom` in `packages/shared/services/private-room/room-encryption.ts` return, per invitee, the set of file ids that could not be wrapped in addition to the skipped list; verify with new cases in `packages/shared/services/private-room/__tests__/room-encryption.test.ts`.
- [ ] 1.2 Add a `rewrapMissingFilesForMember(roomId, userId, fileIds)` helper that re-runs the wrap for a given file subset; verify with a unit test in the same file and an MSW integration case in `room-encryption.integration.test.ts`.

## 2. Invite panel order and result view

- [x] 2.0 Decide the order of grant and wrap: decided 2026-10-26, grant first with the pending-access state and retry (design.md decision 1); the transactional grant-and-keys endpoint is recorded as a later target in `private-rooms-server-hardening`.
- [ ] 2.1 In the shared invite orchestration that `private-rooms-sdk-client-parity` 5.1 moves out of `packages/client/src/components/panels/InvitePanel/index.js`, used by the client invite panel and the SDK private invite panel, send the security update for the verified invitees only and wrap afterwards for those it granted, leaving skipped invitees out (the server fails the update at an invitee who never registered a key, after earlier invitees may already have been added); verify with a unit test of the shared orchestration asserting that the security update precedes the wraps and carries the filtered invitee list, and that no wrap runs when the security update fails.
- [ ] 2.2 Replace the close-on-send with a result view (granted / pending / skipped with Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch) for private rooms, keeping the current close for other rooms; verify with a component test and the E2E `packages/client/__tests__/private-room-invite.spec.ts`.
- [ ] 2.3 Add the Common keys `EncryptedAccessPending`, `EncryptedAccessRestored`, `EncryptedInviteResultTitle` (and any button labels) to `public/locales/en/Common.json`, run `/translate-comments` and `/translate-locales`, and verify `cd common/tests && npx vitest run test/locales.test.js` passes.
- [ ] 2.4 Give the SDK private invite panel the same result view, staying open after sending instead of closing after the security update; verify with SDK unit cases "Order of operations" and "Mixed invitation" in `cd packages/sdk && pnpm exec vitest run usePrivateInviteFlow invite-panel`, and the SDK E2E case "All invitees have verified keys" in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` updated for the result view.

## 3. Pending-access state and retry in the Members panel

- [ ] 3.1 Record `{ roomId, userId, missingFileIds }` in the Members store after a partial failure and clear it on success; verify with a store unit test.
- [ ] 3.2 Render Common:EncryptedAccessPending on the member row and add a retry context item (edit rights only) that calls the helper from 1.2 and verifies the result against the server access lists; verify with a component test in `packages/client/src/pages/Home/InfoPanel/Body/views/Members/` and an E2E case in `private-room-members.spec.ts`.

- [ ] 3.3 After "Trust new key", re-run the wraps for that member over the files skipped for them in this session (reuse the helper from 1.2 with the skipped file ids), seen on the local portal on 2026-10-22: files uploaded while the key was refused stayed unreadable for the member until the next session's backfill; verify with a case named "Key trusted after a refusal" in `room-encryption.integration.test.ts` and in the upload store tests
- [ ] 3.4 Show the pending-access state and the retry in the SDK private members list (`packages/sdk/src/app/(private)/_components/members/PrivateMemberUser.tsx`), through the helper from 1.2; verify with an SDK unit case "Retry from the SDK members list" in `cd packages/sdk && pnpm exec vitest run PrivateMemberUser`.

## 4. Upload guard covers subfolders

- [ ] 4.1 Capture the room id for every queued upload item at start (reuse the existing `encryptionRoomId` capture), for the client queue and for the SDK upload items (`packages/sdk/src/app/(docspace)/_store/UploadStore.tsx`, passed on by the SDK counter adapter), and make `countActiveUploadsForRoom` in `packages/shared/utils/uploadErrors.ts` match on it; verify with new cases in `packages/shared/utils/uploadErrors.test.ts` for root and subfolder uploads, and an SDK case "Uploads into a subfolder" in `cd packages/sdk && pnpm exec vitest run usePrivateRemoveMemberFlow PrivateMemberUser`.
- [ ] 4.2 Confirm the Members removal guard uses the new counter; verify with the existing `User.tsx` test and an E2E case uploading into a subfolder then attempting removal.

## 5. Integration check

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`), the client private-room E2E specs and the SDK private E2E folder (`cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`); verify green.
- [ ] 5.2 Confirm `openspec validate private-rooms-invite-atomic-rewrap --strict` passes.

## Workflow follow-up

- The transactional grant-and-keys endpoint is tracked in `private-rooms-server-hardening` as a later target; it does not block archiving this change.
- Implement after `private-rooms-sdk-client-parity` 5.1 and 5.3. Archive after that change: the sdk-surface delta here modifies and renames requirements it adds, and archiving refuses the delta before they reach the main spec.
- Archive with `/opsx:archive private-rooms-invite-atomic-rewrap` after review.
