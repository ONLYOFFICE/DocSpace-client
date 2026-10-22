# Design

## Context

See proposal.md. Server state on `hotfix/v4.0.1` (`../server`):

- Owner change: `products/ASC.Files/Core/Core/FileStorageService.cs`
  (`ChangeOwnerAsync`, from line 5279; the room loop runs to line 5357) only
  calls `ThrowIfKeysAreNotSetAsync` for a private room (line 5314); no
  access-entry check or transfer.
- Room creation: `FileStorageService.cs:1164-1167` requires keys only; no
  edition rule anywhere (no `PrivacyRoom` hit under `common/ASC.Core.Common`
  billing or quota code).
- Room update (`UpdateRoomAsync`) branches on watermark / indexing /
  lifetime `*Changed` flags with no `SettingsPrivate` guard.
- File keys: `products/ASC.Files/Core/Core/EF/DbFileKeys.cs:78,126` keys the
  entity by (TenantId, FileId, UserId); `FileDao.SetFileKey` deletes by user
  ids then inserts (`FileDao.cs:2393-2406`), so a second device key for the
  same user written by a later request replaces the first (BL-8, stashed
  `SECURITY.md` §9 and `AUDIT_BACKEND.md` P2). A single request that lists
  the same user twice does not collapse: it fails on the (tenant, file, user)
  key. BL-8 is withdrawn: the client operates with one key per user
  (`private-rooms-single-key`), so one entry per (file, user) is all it needs.
- Access-entry removal: no server path removes a user's entries. The only
  delete (`DeleteFileKeysAsync`,
  `products/ASC.Files/Core/Core/EF/Queries/AbstractQueries.cs:116`) is called
  only from `FileDao.SetFileKey`, which replaces the rows of the users named
  in the request; omitting a user leaves their entry in place, and removing a
  member from the room does not touch the file-key table.
- Audit: `PrivacyRoomController.cs` writes events for key create/update/delete
  only (`DocumentsActionMapper.cs:314-324`); no event for
  `SetEncryptionInfoAsync`. There is no revocation operation to audit (see
  the previous item).
- E-mails: `products/ASC.Files/Core/Utils/FileSharing.cs` passes the plaintext
  title to both invitation notifiers: `entry.Title` to the e-mail invite of a
  new address (lines 429-431) and `room.Title` to the notice for an existing
  user (line 443).
- Plaintext into a private room: the upload paths have no private-room check
  (`products/ASC.Files/Core/Utils/FileUploader.cs:61-125, 253-294`), and
  `POST files/file/{fileId}/copyas` inserts converted output into any folder
  the caller may create in (`products/ASC.Files/Server/Helpers/FilesControllerHelper.cs:263-280`).
- Upload abort: `products/ASC.Files/Server/Api/UploadController.cs:169`
  (`HttpDelete("{folderId}/session/{sessionId}")`) exists; the client has no
  caller for it.
- No recovery, SCIM or access-history controllers exist.
- Archived private rooms: the Archive branch of `FileSecurity.FilterEntryAsync`
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:1929-1989`) has no
  private-room guard. Recorded by `private-rooms-archived-room-rules` and
  `private-rooms-sidebar-section` (their design.md, "Server findings outside
  this change"):
  - a file in an archived private room reports the copy right, which an
    active one denies (`:1894-1922`);
  - its administrator bypass (`:1949-1983`) has no `inPrivateRoom` exclusion,
    unlike the VirtualRooms branch (`:1650-1652`). A portal administrator who
    is not a member gets read, copy and download on the room's entries by id
    (the content stays ciphertext), and move, delete and index export on the
    room itself (`:1979`), so they can delete or unarchive it.
- Folder copy out of an archived private room: the folder-level private rule
  of the copy check reads the folder's own private setting
  (`products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:467`),
  which only a room carries, and the Archive branch grants Copy on
  subfolders. How the copy operation then treats the files inside was not
  traced.
- Room events: `SocketManager.WhoCanRead`
  (`products/ASC.Files/Core/Utils/SocketManager.cs:411-419`) adds every
  administrator to the recipients for VirtualRooms and Archive entries, and
  the folder payload carries the room title, so administrators who are not
  members receive the titles of private rooms.

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

3. **No composite file-key.** The stashed `SECURITY.md` recommended keying
   entries by (file, user, public key id) so a user could hold one entry per
   device key. Withdrawn: the client operates with one key per user
   (`private-rooms-single-key`), so the (file, user) key stays and nothing
   migrates.

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

7. **Archive gets the VirtualRooms guards.** The Archive branch applies the
   same private-room copy denial for files and subfolders and skips the
   administrator bypass inside private rooms, as the VirtualRooms branch does.
   The client already withholds Ctrl+C and decrypts copy-out in archived
   private rooms (`private-rooms-archived-room-rules`), so the server rule is
   the second line, not a client prerequisite. Alternative: deny every right
   to non-members in Archive; rejected because a member administrator must
   keep the rights of their share.

8. **Private-room events go to members only.** `WhoCanRead` adds the
   administrators only for rooms without the private setting. Alternative:
   strip the title from the event payload; rejected because a member's client
   needs it to refresh the list.

9. **Files of archived private rooms get their public keys (found on a local portal, 2026-10-22).** `SecurityController.GetEncryptionAccess` -> `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:212-218`) treats a file as private only when `file.RootFolderType == FolderType.VirtualRooms` and throws `NotSupportedException` (415) otherwise, while `GetKeyPairForRoomAsync` in the same file (`:260`) accepts `VirtualRooms or Archive`. A copy out of an archived private room on the local portal received 415 from `files/file/{fileId}/publickeys` and still decrypted, because the client also looks the sender up in the room roster. The fallback the file-operations requirement "Sender keys of files leaving a private room" relies on, the file's own public keys where the source room is not known, therefore fails in Archive today. The fix applies the room check's `VirtualRooms or Archive` condition to the file check.

## Risks / Trade-offs

- [Backend schedule] → every server task is independent; the client lands
  mocks and contract tests first so the backend work can be verified against
  them.
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
4. Rollback: server items are individually revertible.

## Open Questions

- Quorum or break-glass for a recovery administrator who loses their own
  key. Owner: product and security. Does not change the client specs.
- SCIM availability on the platform (the stashed doc could not confirm it).
  Owner: platform team. Affects only whether the offboarding trigger is SCIM
  or manual deactivation.
- Revocation primitive. The server has no operation that removes a user's
  access entries, so "member revocation" cannot be audited or used by
  offboarding until one exists. Options: the server deletes a user's entries
  for every file of a private room when that user is removed from it (or
  deprovisioned), or a new route lets a room manager delete named users'
  entries. Owner: backend team with product. Blocks the revocation part of
  task 6.1 and task 8.1.
- Server refusal of plaintext written into a private room (unencrypted
  upload sessions and uploads, `copyas` conversion output). No requirement in
  this change covers it yet, although `private-rooms-upload-fail-closed`
  defers its server-side guard here. Owner: backend team with product.
- Folder copy out of an archived private room (see Context): whether a batch
  copy of a subfolder creates the folder outside the room, and what happens
  to the encrypted files in it. The client never requests one
  (file-operations, "Folders cannot leave an archived private room"). Owner:
  backend team; task 9.2 traces it and decides whether a requirement is
  needed.
