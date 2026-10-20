# Tasks

## 1. Shared service returns per-invitee wrap results

- [ ] 1.1 Make `addMembersToEncryptedRoom` in `packages/shared/services/private-room/room-encryption.ts` return, per invitee, the set of file ids that could not be wrapped in addition to the skipped list; verify with new cases in `packages/shared/services/private-room/__tests__/room-encryption.test.ts`.
- [ ] 1.2 Add a `rewrapMissingFilesForMember(roomId, userId, fileIds)` helper that re-runs the wrap for a given file subset; verify with a unit test in the same file and an MSW integration case in `room-encryption.integration.test.ts`.

## 2. Invite panel wraps before granting

- [ ] 2.1 In `packages/client/src/components/panels/InvitePanel/index.js` run the re-encryption for the verified invitees first and send the room security update only for invitees whose wraps were written; verify with a unit test on the send handler asserting call order and the filtered invitee list.
- [ ] 2.2 Replace the close-on-send with a result view (granted / pending / skipped with Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch) for private rooms, keeping the current close for other rooms; verify with a component test and the E2E `packages/client/__tests__/private-room-invite.spec.ts`.
- [ ] 2.3 Add the Common keys `EncryptedAccessPending`, `EncryptedAccessRestored`, `EncryptedInviteResultTitle` (and any button labels) to `public/locales/en/Common.json`, run `/translate-comments` and `/translate-locales`, and verify `cd common/tests && npx vitest run test/locales.test.js` passes.

## 3. Pending-access state and retry in the Members panel

- [ ] 3.1 Record `{ roomId, userId, missingFileIds }` in the Members store after a partial failure and clear it on success; verify with a store unit test.
- [ ] 3.2 Render Common:EncryptedAccessPending on the member row and add a retry context item (edit rights only) that calls the helper from 1.2 and verifies the result against the server access lists; verify with a component test in `packages/client/src/pages/Home/InfoPanel/Body/views/Members/` and an E2E case in `private-room-members.spec.ts`.

## 4. Upload guard covers subfolders

- [ ] 4.1 Capture the room id for every queued upload item at start (reuse the existing `encryptionRoomId` capture) and make `countActiveUploadsForRoom` in `packages/shared/utils/uploadErrors.ts` match on it; verify with new cases in `packages/shared/utils/uploadErrors.test.ts` for root and subfolder uploads.
- [ ] 4.2 Confirm the Members removal guard uses the new counter; verify with the existing `User.tsx` test and an E2E case uploading into a subfolder then attempting removal.

## 5. Integration check

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`) and the private-room E2E specs; verify green.
- [ ] 5.2 Confirm `npx -y @fission-ai/openspec@latest validate private-rooms-invite-atomic-rewrap --strict` passes.

## Workflow follow-up

- If the transactional server endpoint is chosen later, open a follow-up change against `private-rooms/server-contract` instead of extending this one.
- Archive with `/opsx:archive private-rooms-invite-atomic-rewrap` after review.
