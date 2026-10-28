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
  ids then inserts (`FileDao.cs:2400-2432`), so a second device key for the
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
  only (`common/services/ASC.AuditTrail/Mappers/DocumentsActionMapper.cs:314-324`); no event for
  `SetEncryptionInfoAsync`. There is no revocation operation to audit (see
  the previous item).
- E-mails: `products/ASC.Files/Core/Utils/FileSharing.cs` passes the plaintext
  title to both invitation notifiers: `entry.Title` to the e-mail invite of a
  new address (lines 429-431) and `room.Title` to the notice for an existing
  user (line 443). `FileStorageService.ResendEmailInvitationsAsync` (`:5468`)
  passes `room.Title` as well (`:5504`, `:5539`). The notify actions put the
  title into the `Message` tag (`web/ASC.Web.Core/Notify/StudioNotifyService.cs:161-192`,
  `Actions.cs:1306-1320, 1366-1379`); the existing-user template
  `pattern_saas_room_invite_existing_user` prints it in every locale
  (`WebstudioNotifyPatternResource*.resx`, line 1792), the new-address
  template does not. `NotifyClient.cs` has no private-room check either: for
  example `SendRoomRemovedAsync` passes `folder.Title` (`:352`).
- Plaintext into a private room: the upload paths have no private-room check
  (`products/ASC.Files/Core/Utils/FileUploader.cs:61-125, 258-299`), and
  `POST files/file/{fileId}/copyas` inserts converted output into any folder
  the caller may create in (`products/ASC.Files/Server/Helpers/FilesControllerHelper.cs:263-280`).
  A chunked upload is marked encrypted from the flag the client set on the
  session (`FileDao.cs:2108`, `:2119`).
- Upload abort: `products/ASC.Files/Server/Api/UploadController.cs:169`
  (`HttpDelete("{folderId}/session/{sessionId}")`) exists; the client has no
  caller for it. It refuses a caller who did not open the session and
  discards the chunks (`FileUploader.cs:403-418`); it does not match the
  folder segment against the session, and its documentation remark
  (`UploadController.cs:152-161`) still says the account is not checked.
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
  (`products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:479`),
  which only a room carries, and the Archive branch grants Copy on
  subfolders. How the copy operation then treats the files inside was not
  traced.
- Room events: `SocketManager.WhoCanRead`
  (`products/ASC.Files/Core/Utils/SocketManager.cs:411-419`) adds every
  administrator to the recipients for VirtualRooms and Archive entries, and
  the folder payload carries the room title, so administrators who are not
  members receive the titles of private rooms.

Re-checked on `e618acc6c0` (2026-10-28) through CodeGraph and in the source.
Every item above still holds, and the re-check found:

- Key save: `EncryptionLoginProvider.SetKeysAsync` calls
  `accountLinker.RemoveProviderAsync(userId)` without a provider
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:69`).
  With no provider the query matches any link of the user
  (`common/ASC.FederatedLogin/AccountLinker.cs:167-173`) and the first one
  found is deleted (`:103-118`), which may be a Google or SSO sign-in.
- Room-level denials: for the room itself the private-room denials are
  Convert, AskAi and Embed only (`FileSecurity.cs:1906-1913`); EditAccess and
  Copy are denied on its files and subfolders (`:1894-1904`, `:1916-1922`).
  The external-link code has no private check
  (`FileStorageService.cs:4715-4747`, `:6351-6420`), and link shares skip the
  invitee key check (`FileSharing.cs:260`). Duplicating a room runs
  `FolderDao.CopyFolderAsync`, which copies colour, indexing, lifetime, quota,
  watermark, deny-download and logo but not the private setting
  (`FolderDao.cs:1429-1435`), so a duplicate is an ordinary room carrying the
  private room's title. Template creation was not traced.
- Room creation: `ThrowIfKeysAreNotSetAsync` checks for a null record only
  (`EncryptionLoginProvider.cs:97-103`), so an empty key set passes room
  creation, invitation and owner change; the private setting is stored for
  any folder type (`FileStorageService.cs:1164-1167`, `:1185`);
  `CreateThirdPartyRoomAsync` passes `false` for `privacy` to
  `InternalCreateFolderAsync` (`:766`, signature `:1101-1105`) while it
  stores `Private = privacy` for the provider (`:780`), so a third-party
  private room skips the key check.
- Access-entry read: `GET files/{fileId}/access`
  (`FilesController.GetEncryptionInfoAsync`,
  `products/ASC.Files/Server/Api/FilesController.cs:1229-1251`) reads
  `FileDao.GetFileKeys(fileId, caller)`, which filters on the caller
  (`FileDao.cs:2434-2446`); nothing else reads the file keys table, so no
  route tells which members lack an entry.
- Access-entry write: `SetEncryptionInfoAsync` refuses the whole request
  before storing when one listed user cannot read the file
  (`FileStorageService.cs:5268-5274`), so an upload that still names a member
  removed meanwhile on another device stores no entry for that file.

The stashed `AUDIT_BACKEND.md` (2026-06-03) already lists the owner-change,
billing, metadata-guard, title-validation, e-mail and PK items; the
`SetEncryptionInfoAsync` authorisation it called release-blocking has since
been fixed (`FileStorageService.cs:5242-5277`) and is already in the main
spec. `V1_RELEASE_PROGRESS.md` set admin recovery (#55), audit log (#56) and
SCIM (#57) as P0 for B2B and explicitly allowed an individuals/SMB launch
without them.

Invitee keys (read through CodeGraph and in the source, 2026-10-28). The room
access keys (`PrivacyRoomController.GetUserKeysForRoom`, `HttpGet
"{roomId:int}/access"` -> `EncryptionKeyPairDtoHelper.GetKeyPairForRoomAsync`,
`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:245-296`) are
collected for the users with a share on the room (`fileSharing.GetSharedInfoAsync`),
each read with `encryptionLoginProvider.GetKeysAsync(share.Id)`, and
`SanitizeAccessKeys` (`:303`) strips another user's private half. No route
returns the public key of a user who is not yet a member: the others are the
caller's own keys (`privacyroom/keys`) and the users with access to a file
(`files/file/{fileId}/publickeys`). The room security update
(`FileSharing.SetAceObjectAsync`, `products/ASC.Files/Core/Utils/FileSharing.cs:64`)
admits a caller who passes `FileSharingHelper.CanSetAccessAsync` (`:101`,
defined at `:624`). `private-rooms-invite-atomic-rewrap` verifies invitees'
keys before that update and needs those keys first.

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

10. **Invitee keys through a dedicated route (decided 2026-10-28).** A
    read-only route on `PrivacyRoomController`, for example `GET
    api/2.0/privacyroom/{roomId}/access/candidates?userIds=…` (the backend team
    settles the name), returns the public keys of the named users for a
    private room. It admits the callers the room security update admits
    (`FileSharingHelper.CanSetAccessAsync` on the room), so whoever may invite
    may read, reads each user's keys with
    `encryptionLoginProvider.GetKeysAsync(userId)`, and answers
    `EncryptionKeyDto` entries without `privateKeyEnc`, as `SanitizeAccessKeys`
    does; a user without stored keys is absent. Alternatives: a `userIds`
    parameter on `privacyroom/{roomId}/access`, rejected because that roster
    of members is what unwrapping and sender lookup rely on; a portal-wide
    route for any user's keys, rejected because it would tell anyone whether
    a user has keys, where the room scope limits it to people the caller is
    about to share with.

11. **A key save replaces the encryption link only (found 2026-10-28).**
    `EncryptionLoginProvider.SetKeysAsync` passes the provider to
    `RemoveProviderAsync` (`ProviderConstants.Encryption`), so no other
    sign-in link of the user is matched. No alternative: the current call is
    a bug.

12. **Private rooms refuse links and room-level copies (found 2026-10-28).**
    The link routes refuse an external or invitation link on a private room,
    and the room-level private denials of `FileSecurity.FilterEntryAsync`
    gain Duplicate, CreateRoomFrom and IndexExport next to Convert, AskAi and
    Embed. Alternative: rely on the client, which already withholds these
    actions; rejected because any API caller reaches them.

13. **Key checks look at the key set, not the record (found 2026-10-28).**
    `ThrowIfKeysAreNotSetAsync` treats an empty key set as no keys, which
    covers room creation, invitation and owner change at once, and the
    invitee keys route of decision 10 leaves such users out. Room creation
    accepts the private flag with the Custom room type only, and
    `CreateThirdPartyRoomAsync` passes the private flag on, so a third-party
    private room is key-checked. Alternative for third-party rooms: refuse the
    private flag on them (proposal decision 6).

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
  upload sessions and uploads, `copyas` conversion output, a plaintext folder
  copied or moved into a private room). No requirement in
  this change covers it yet, although `private-rooms-upload-fail-closed`
  defers its server-side guard here. Owner: backend team with product.
- Member removal racing an upload on another device (proposal decision 7):
  the access write refuses the whole request when one listed user can no
  longer read the file (see Context). Options: store the entries of the users
  who can read and report the others, or block a member's removal while
  uploads naming them are open. Owner: backend team with product.
- Third-party private rooms (proposal decision 6): key-check them like every
  private room (decision 13, what the spec assumes) or refuse the private
  flag on third-party storage. Owner: product.
- Folder copy out of an archived private room (see Context): whether a batch
  copy of a subfolder creates the folder outside the room, and what happens
  to the encrypted files in it. The client never requests one
  (file-operations, "Folders cannot leave an archived private room"). Owner:
  backend team; task 9.2 traces it and decides whether a requirement is
  needed.
