# Design

## Context

See proposal.md for motivation. Facts the design rests on:

Server (looked up with CodeGraph in `../server`, read in the source, paths under `../server/products/ASC.Files/`):

- `GET files/{fileId}/access` (`Server/Api/FilesController.cs` `GetEncryptionInfoAsync`, lines 1223-1251) answers with `encryptionKeyPairDtoHelper.GetKeyPairAsync()` and `fileDao.GetFileKeys(fileId, authContext.CurrentAccount.ID)`; `Core/Core/Dao/TeamlabDao/FileDao.cs` `GetFileKeys` (line 2412) filters `DbFileKeys` by tenant, file and that one user. The caller never sees another user's entry.
- `PUT files/{fileId}/access` (`FilesController.cs` `SetEncryptionInfoAsync`, then `Core/Core/FileStorageService.cs` `SetEncryptionInfoAsync`, line 5242) checks read access, a private parent room, create rights and read access of every listed user, then `FileDao.SetFileKey` (line 2378) deletes the rows of the listed users and inserts the new ones in one transaction. Unlisted users keep their rows.
- `Core/ApiModels/ResponseDto/EncryptionKeyDto.cs` line 65: `Date` defaults to `DateTime.Now`, so a passphrase change re-stamps the key's date; the date does not tell when a user first registered a key.

Client, as found on 2026-10-20:

- `packages/shared/context/encryption/EncryptionContext.tsx` lines 365-383: `resolveKeyMismatch` keeps one resolver in a ref; a second request resolves the pending one with `"refuse"` and takes its place. `packages/shared/services/private-room/member-key-verification.ts` lines 99-101 record every non-`accept` decision in the caller's refusal set.
- `packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts` line 181 starts `wrapForSelfThenRoom` without awaiting it, and `packages/client/src/store/FilesSettingsStore.ts` line 126 allows five parallel uploads, so several member fan-outs run at once. The design of `private-rooms-tofu-on-upload` (D2) assumed one file at a time; its unit test for "asks once per batch" runs the fan-outs sequentially and so could not see the pre-emption.
- Backfill callers: `packages/client/src/store/filesStore/encryption.helpers.ts` `maybeBackfillEncryptedRoomImpl` (room managers with `EditRoom` only, once per room per page load, silent refusal of key changes), `packages/sdk/src/app/(private)/_store/PrivateRoomFilesStore.tsx` `maybeBackfillEncryptedRoom` (same), and `packages/client/src/components/panels/InvitePanel/index.js` after a successful invitation.
- `packages/shared/services/private-room/room-encryption.ts`: `addMembersToEncryptedRoom` (lines 202-209) and `backfillEncryptedFilesForRoomMembers` (lines 392-417) skip members found in the access read, and the invite path re-reads the list after the write and logs `encryption-acl-drift` when a written entry is missing (lines 253-274). Against the real read the skip set is always the caller and the drift warning always fires; running `room-encryption.integration.test.ts` against the corrected mocks prints it twice in four tests. `encrypted-upload-orchestrator.ts` (lines 273-284) and `packages/client/src/store/uploadDataStore/encryption.helpers.ts` (lines 180-191) carry the same filter at upload time, where it also reduces to the caller.
- `room-encryption.test.ts` mocks the access read with `fileKeys: aliceAndBobWraps` in seven places, the shape the server never returns.

Stashed design documents: SECURITY.md documents the unwrap-time pin check only and says nothing about concurrent dialogs or backfill; AUDIT_FRONTEND.md item BL-4 asked for the post-write verification that this change removes, because the read it relied on does not exist.

## Goals / Non-Goals

**Goals:**
- A key-change request is answered only by the user or by the absence of a dialog, never by another request.
- One upload batch meets a changed key once, whatever the upload parallelism.
- Invite, backfill and fan-out code says what it does against the real access read; no filter or check that needs other users' entries.
- Specs state the backfill as a bounded sweep, with its trade-off.

**Non-Goals:**
- Exact backfill (needs a server query; `private-rooms-server-hardening`).
- Changing the revocation paths or the server contract.
- Changing the key-change dialog's content.

## Decisions

1. **Queue key-change requests in the encryption context and coalesce identical ones.** The provider keeps an ordered list of pending requests; the first is shown; a decision resolves the shown request and every waiting request with the same user id and new key, then the next distinct request is shown. A new request never touches a pending one. Alternative: a third decision value (`superseded`) that callers ignore. Rejected: every resolver consumer would need to learn it, and the pre-emption itself is the defect, since the user never saw the superseded request. Alternative: fix only the upload store. Rejected: the unwrap paths (download, preview, filename recovery) run in parallel too and would keep pre-empting each other.
2. **Serialize member fan-outs in the client upload store.** `wrapForSelfThenRoom` writes the uploader's own wrap immediately and then chains the member part on a store-level promise, so fan-outs run one after another in completion order. With decision 1 alone the batch would still be correct through coalescing; the chain restores the premise the tofu-on-upload design stated, keeps one `getRoomEncryptionKeys` and one access write in flight, and makes the refusal set deterministic. The uploads themselves are not slowed: the fan-out runs after the file is stored.
3. **Refusals stay recorded only on an explicit `refuse`.** With decision 1 the handler returns `refuse` only from the user's click or when no dialog is registered, so `verifyMemberKey` needs no new branch; a test pins that an unanswered request is not recorded.
4. **Backfill re-wraps everyone, by design, and says so.** Alternatives: (a) heuristic "key date newer than file date". Rejected: the server re-stamps the date on passphrase change, so it does not mean "registered late". (b) Post-invite run only, for invitees the inviter saw skipped. Rejected: drops the late-registered member who was invited key-less in an earlier session, the one case only a sweep covers today. (c) Server query. Right long-term, out of scope. The existing bounds stay: room managers only, once per room per page session, silent refusal of key changes, plus the post-invite run.
5. **Remove the filters and the drift check.** Invite, backfill and both fan-outs skip the caller explicitly and nothing else; the post-write re-read in the invite path goes. Alternative: verify only the caller's own entry. Rejected as worthless, the write carries it unchanged.
6. **Fixtures carry the caller's entries only.** The mocked access read in `room-encryption.test.ts` returns the acting user's entries; the cases "does not re-wrap for a member already present", "no-op when every user has an envelope" and "does not add a second wrap for a member who already has one" become "re-wraps a member who already had a wrap from another sender", "wraps every listed member except the caller" and "a member with several keys gets one wrap". The revoke cases keep their behaviour but read caller-only too, consistent with `private-rooms/room-membership`.

## Risks / Trade-offs

- [A sweep replaces a member's wrap with one whose sender is the sweeping manager] -> unwrap resolves the sender through the file's public keys, the room roster and the device's TOFU history; the next manager sweep re-wraps again. Stated in the spec scenario "Existing wraps are replaced".
- [A manager who refused a member's key change keeps that member without wraps] -> same as today; the sweep refuses silently and the next session asks again on an explicit path.
- [Queued dialogs could pile up during a long batch] -> coalescing collapses every request for the same key; distinct keys are rare and each needs a decision anyway.
- [Serializing the fan-out delays the "not shared with" information for late files of a batch] -> the file row already shows as uploaded; the panel marker and warning arrive when its fan-out runs.

## Migration Plan

Client-only change behind the `privateRooms` flag; no data migration. Rollback is a revert.

## Open Questions

- Whether very large rooms need a throttle on the sweep (files times members HPKE operations and one access write per file). Does not change the specs or tasks; a cap would be its own change.
