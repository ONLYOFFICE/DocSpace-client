# Design

## Context

See proposal.md. Server state on `hotfix/v4.0.1` (`../server`):

- Owner change: `products/ASC.Files/Core/Core/FileStorageService.cs:5279-5351`
  (`ChangeOwnerAsync`) only calls `ThrowIfKeysAreNotSetAsync` (line 5314);
  no access-entry check or transfer.
- Room creation: `FileStorageService.cs:1164-1167` requires keys only; no
  edition rule anywhere (no `PrivacyRoom` hit under `common/ASC.Core.Common`
  billing or quota code).
- Room update (`UpdateRoomAsync`) branches on watermark / indexing /
  lifetime `*Changed` flags with no `SettingsPrivate` guard.
- File keys: `products/ASC.Files/Core/Core/EF/DbFileKeys.cs:78,126` keys the
  entity by (TenantId, FileId, UserId); `FileDao.SetFileKey` deletes by user
  ids then inserts, so a second device key for the same user replaces the
  first (BL-8, stashed `SECURITY.md` §9 and `AUDIT_BACKEND.md` P2).
- Audit: `PrivacyRoomController.cs` writes events for key create/update/delete
  only (`DocumentsActionMapper.cs:314-324`); no event for
  `SetEncryptionInfoAsync` or revocations.
- E-mails: `products/ASC.Files/Core/Utils/FileSharing.cs:443` passes
  `room.Title` to the invitation notifier.
- Upload abort: `products/ASC.Files/Server/Api/UploadController.cs:169`
  (`HttpDelete("{folderId}/session/{sessionId}")`) exists; the client has no
  caller for it.
- No recovery, SCIM or access-history controllers exist.

The stashed `AUDIT_BACKEND.md` (2026-06-03) already lists the owner-change,
billing, metadata-guard, title-validation, e-mail and PK items; the
`SetEncryptionInfoAsync` authorisation it called release-blocking has since
been fixed (`FileStorageService.cs:5242-5277`) and is already in the main
spec. `V1_RELEASE_PROGRESS.md` set admin recovery (#55), audit log (#56) and
SCIM (#57) as P0 for B2B and explicitly allowed an individuals/SMB launch
without them.

## Goals / Non-Goals

**Goals:**
- A single contract the backend team can implement item by item, each with
  its MSW mirror and contract test on the client side.
- No plaintext metadata leaks that the client cannot prevent (e-mail title,
  human-readable encrypted titles).
- Multi-device keys stop collapsing.

**Non-Goals:**
- Server-side re-encryption or room keys (accepted v1 limitation).
- The audit log viewer UI (separate change in the management app).
- Document Server work.

## Decisions

1. **Owner change reports missing entries instead of transferring them.**
   The server cannot create wraps (it has no private keys); it can only tell
   the client which files lack an entry for the new owner. The client runs
   the existing backfill (`room-encryption.ts` backfill path) and retries.
   Alternative: block owner change until the client pre-backfills; rejected
   because the client cannot know the server's view of the entries.

2. **Edition rule as an explicit server setting, default allow.** Keeps the
   current behaviour (all editions) while giving product a switch. Alternative:
   hard-code Enterprise-only; rejected until product decides (open decision in
   the proposal).

3. **Composite key (file, user, public key id).** Matches the stashed
   `SECURITY.md` recommendation. Migration copies the current `public_key_id`
   column into the key; rows with an empty id get the user's first envelope
   id. The client already sends `publicKeyId` in every entry, so no wire
   change. Alternative: keep (file, user) and store a JSON array of wraps;
   rejected because it breaks the replace semantics and the contract tests.

4. **E-mails link instead of naming.** The notifier gets the room link and a
   generic subject for private rooms. Alternative: send the encrypted name;
   rejected because e-mail clients cannot decrypt it.

5. **Recovery by recovery-administrator wrap.** The user's private key is
   wrapped (HPKE auth) for a recovery administrator's public key at enrolment,
   matching the stashed #55 design (Tresorit / Bitwarden model). Alternative:
   server-side escrow of the private key; rejected because it breaks the
   end-to-end claim. Enrolment is opt-in per organisation policy; quorum
   (2-of-N administrators) is an open question.

6. **Client calls the abort route.** Encrypted uploads already run through a
   session; cancelling currently leaves the session to expire. Calling abort
   removes the partial ciphertext immediately.

## Risks / Trade-offs

- [Backend schedule] → every server task is independent; the client lands
  mocks and contract tests first so the backend work can be verified against
  them.
- [Migration of `files_file_keys` on large portals] → run as an online
  migration adding the column to the key; rows are small.
- [Edition rule misconfigured on upgrade] → default allow preserves current
  behaviour.
- [Owner-change loop when backfill keeps failing] → the client shows the
  unreadable files and lets the owner cancel.

## Migration Plan

1. Land MSW handlers and contract tests for every new or changed route.
2. Backend lands items in any order; each flips its contract test from
   "expected failure" to passing.
3. Client reads the new fields behind presence checks (missing field = old
   server), so old and new servers both work during rollout.
4. Rollback: server items are individually revertible; the PK migration has a
   down migration that keeps the first entry per user.

## Open Questions

- Quorum or break-glass for a recovery administrator who loses their own
  key. Owner: product and security. Does not change the client specs.
- SCIM availability on the platform (the stashed doc could not confirm it).
  Owner: platform team. Affects only whether the offboarding trigger is SCIM
  or manual deactivation.
