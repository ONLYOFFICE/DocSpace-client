# Design

## Context

See proposal.md. Server state on `hotfix/v4.0.1` (`../server`). Re-checked on
`release/v4.1.0` at `e9cfda8d43` on 2026-11-02: none of the backend tasks
has landed, and the line numbers below are those of that commit.

Re-checked on 2026-11-05 at `bd89a24dcd` (`release/v4.1.0`): two commits by
the backend team on 2026-11-04, `3b9c527a6e` ("protect archived rooms, keep
login links, add invitee keys route") and `bd89a24dcd` ("enforce stricter
content boundaries and validate room settings"), landed the items listed
under "Landed on 2026-11-04" at the end of this section. The items below
describe the state before them and keep the line numbers of `e9cfda8d43`;
the list names each one the two commits closed.

- Owner change: `products/ASC.Files/Core/Core/FileStorageService.cs`
  (`ChangeOwnerAsync`, from line 5348; the room loop runs to line 5427) only
  calls `ThrowIfKeysAreNotSetAsync` for a private room (line 5383); no
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
  user (line 443). `FileStorageService.ResendEmailInvitationsAsync` (`:5538`)
  passes `room.Title` as well (`:5574`, `:5609`). The notify actions put the
  title into the `Message` tag (`web/ASC.Web.Core/Notify/StudioNotifyService.cs:161-192`,
  `Actions.cs:1306-1320, 1366-1379`); the existing-user template
  `pattern_saas_room_invite_existing_user` prints it in every locale
  (`WebstudioNotifyPatternResource*.resx`, line 1792), the new-address
  template does not. `NotifyClient.cs` has no private-room check either: for
  example `SendRoomRemovedAsync` passes `folder.Title` (`:352`).
- Plaintext into a private room: the upload paths have no private-room check
  (`products/ASC.Files/Core/Utils/FileUploader.cs:61-125, 264-310`), and
  `POST files/file/{fileId}/copyas` inserts converted output into any folder
  the caller may create in (`products/ASC.Files/Server/Helpers/FilesControllerHelper.cs:263-280`).
  A chunked upload is marked encrypted from the flag the client set on the
  session (`FileDao.cs:2108`, `:2119`).
- Upload abort: `products/ASC.Files/Server/Api/UploadController.cs:170`
  (`HttpDelete("{folderId}/session/{sessionId}")`) exists, and the client
  calls it since task 7.1. It refuses a caller who did not open the session and
  discards the chunks (`FileUploader.cs:421-436`); it does not match the
  folder segment against the session, and its documentation remark
  (`UploadController.cs:153-162`) still says the account is not checked.
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
  subfolders. Traced on 2026-10-28 (task 9.2): the general check passes on
  the folder's copy right (`:241`); the folder-level private rule never
  applies to a subfolder, because settings rows exist for room folder types
  only (`FolderDao.cs:755-761`, `:811-817`); and a copy returns before the
  subtree file check (`:564-569`). `FileMoveCopyOperation.MoveOrCopyFoldersAsync`
  (`:246-381`) then creates the folder outside the room through
  `FolderDao.CopyFolderAsync` (`:306`), with its title, tags and metadata but
  without the private setting (`FolderDao.cs:1406-1449`), and recurses
  (`FolderDao.cs:1739-1752`); `CompliesPrivateRoomRulesAsync` refuses each
  encrypted file (`CopyPermissionsCheck.cs:823-845`). An empty copy of the
  folder tree, titles included, lands outside the room, for members and,
  through the bypass, for administrators who are not members. Once task 9.1
  denies Copy on subfolders in Archive, the copy right check at `:241`
  refuses the request, as it does in an active private room, so no separate
  requirement is needed. Closed on 2026-11-04 by the Archive Copy denial
  and by the folder rule of decision 16.
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
  The encryption record survives in that case, so `AddLinkAsync` refuses the
  new record as already in use (`:92-95`): the key save fails after the other
  link is gone (re-checked 2026-11-02).
- Room-level denials: for the room itself the private-room denials are
  Convert, AskAi and Embed only (`FileSecurity.cs:1906-1913`); EditAccess and
  Copy are denied on its files and subfolders (`:1894-1904`, `:1916-1922`).
  The external-link code has no private check
  (`FileStorageService.cs:4784-4816`, `:6421-6490`), and link shares skip the
  invitee key check (`FileSharing.cs:260`). Duplicating a room runs
  `FolderDao.CopyFolderAsync`, which copies colour, indexing, lifetime, quota,
  watermark, deny-download and logo but not the private setting
  (`FolderDao.cs:1429-1435`), so a duplicate is an ordinary room carrying the
  private room's title. Template creation is gated by
  `CheckCanCreateRoomTemplateAsync` (`FileStorageService.cs:803-836`, called
  from `RoomTemplatesController.cs:93`), which checks the edit-room right only
  (`:828`) and so admits a private room; the template keeps the room's private
  setting (`:948`). `CreateRoomFrom` is granted only on entries in My
  documents (`FileSecurity.cs:1369-1372`), never on a room (re-checked
  2026-11-02).
- Room creation: `ThrowIfKeysAreNotSetAsync` checks for a null record only
  (`EncryptionLoginProvider.cs:97-103`), so an empty key set passes room
  creation, invitation and owner change; the private setting is stored for
  any folder type (`FileStorageService.cs:1164-1167`, `:1185`);
  `CreateThirdPartyRoomAsync` passes `false` for `privacy` to
  `InternalCreateFolderAsync` (`:766`, signature `:1101-1105`) while it
  stores `Private = privacy` for the provider (`:780`), so a third-party
  private room skips the key check. The private flag also reaches room
  creation through `CreateAiAgentAsync` (`:698`, an AI room),
  `CreateRoomTemplateAsync` (`:948`) and `CreateRoomFromTemplateAsync`
  (`:1005`, the template's setting by default), none of which restricts the
  room type (re-checked 2026-11-02).
- Access-entry read: `GET files/{fileId}/access`
  (`FilesController.GetEncryptionInfoAsync`,
  `products/ASC.Files/Server/Api/FilesController.cs:1247-1269`) reads
  `FileDao.GetFileKeys(fileId, caller)`, which filters on the caller
  (`FileDao.cs:2434-2446`); nothing else reads the file keys table, so no
  route tells which members lack an entry.
- Access-entry write: `SetEncryptionInfoAsync` refuses the whole request
  before storing when one listed user cannot read the file
  (`FileStorageService.cs:5337-5343`), so an upload that still names a member
  removed meanwhile on another device stores no entry for that file.

The stashed `AUDIT_BACKEND.md` (2026-06-03) already lists the owner-change,
billing, metadata-guard, title-validation, e-mail and PK items; the
`SetEncryptionInfoAsync` authorisation it called release-blocking has since
been fixed (`FileStorageService.cs:5311-5346`) and is already in the main
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

### Landed on 2026-11-04 (read in `3b9c527a6e` and `bd89a24dcd`)

- Key save (task 12.1, decision 11): `EncryptionLoginProvider.SetKeysAsync`
  passes `ProviderConstants.Encryption` to `RemoveProviderAsync`
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:69`).
  `KeysAndLoginLinksTests`: a planted Google link survives a key save, a key
  replacement and a key deletion. Links already lost are not restored.
- Private-room denials in every section (tasks 9.1 and 12.2, decisions 7
  and 12): `FileSecurity.FilterEntryAsync` computes `inPrivateRoom` before
  the section switch and denies Copy, Duplicate, IndexExport, UseChat and
  Vectorization inside a private room, on the room and on its entries, in
  Rooms and in Archive alike
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:1706-1718`); the
  Archive branch skips the administrator bypass while `inPrivateRoom`
  (`:2086`). `ArchivedPrivateRoomSecurityTests`: an administrator who is not
  a member, and the portal owner, get 403 on the archived room, a subfolder
  and a file by id and cannot delete or unarchive the room; the creator
  keeps Read and Delete and loses Copy on the room, the subfolder and the
  file; a member administrator keeps Read without Copy; a member's batch
  copy of a file into another room stores nothing; an ordinary archived
  room keeps the bypass. `PrivateRoomContentBoundaryTests`: the room's
  security reports Duplicate, Copy and IndexExport false, and a duplicate
  request creates no room.
- Room events (task 9.3, decision 8): `SocketManager.WhoCanRead` adds the
  administrators only when the entry is neither a private room nor inside
  one (`products/ASC.Files/Core/Utils/SocketManager.cs:415-418`).
- File public keys in Archive (task 9.5, decision 9):
  `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)` accepts
  `VirtualRooms or Archive`
  (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:212`);
  `PrivateRoomContentBoundaryTests.ArchivedRoom_FileAccessKeys_AreReadable`.
- Invitee keys (task 11.1, decision 10):
  `GET api/2.0/privacyroom/{roomId}/access/candidates?userIds=…&userIds=…`
  (`PrivacyRoomControllerCommon.GetRoomCandidateKeys`,
  `GetRoomCandidateKeysRequestDto` with `roomId` from the route and
  `userIds` from the query,
  `EncryptionKeyPairDtoHelper.GetKeyPairForRoomCandidatesAsync`). Checks in
  order: 404 for an unknown room (`FileNotFoundException`); 403 when the
  caller cannot read the room; 400 when the entry is not a room or not
  private (`ErrorMessage_PrivateRoomOnly`, which makes a subfolder of a
  private room and an ordinary room 400); 403 when
  `FileSharingHelper.CanSetAccessAsync` refuses, which covers a member
  without the right, a non-member, an administrator who is not a member and
  every caller on an archived private room. Users who do not exist on the
  portal, are terminated or are guests are skipped, as are users without a
  key record or without a public key; ids are de-duplicated; every entry
  has `privateKeyEnc` null, the caller's own included; no ids answer an
  empty list; a malformed id is 400 from model binding; an anonymous
  caller gets 401. `RoomCandidateKeysTests` covers each case. The OpenAPI
  documents and the C# SDK were regenerated with the route.
- Metadata guards (the guards half of task 3.1): `CreateRoomAsync` refuses
  with 400 (`ErrorMessage_BadRequest`) a private room created with
  `indexing == true`, or with a `lifetime` or a `watermark` whose `enabled`
  is not false (`products/ASC.Files/Core/Core/FileStorageService.cs:1204-1209`);
  `RoomDataLifetimeDto.Enabled` and `WatermarkRequestDto.Enabled` are
  `bool?`, so an object without the flag counts as enabled.
  `UpdateRoomAsync` refuses the same for a private room when indexing is
  turned on (`updateData.Indexing == true && !folder.SettingsIndexing`) or
  a lifetime or watermark is sent enabled (`:1527-1532`); turning them off
  passes. `PrivateRoomSettingsTests`. The availability rule and its error
  code did not land.
- Links (task 12.2, decision 12): `FileSharingAceHelper.SetAceObjectAsync`
  throws `SecurityException` (403) when a requested entry is a link with an
  access other than None and the entry is a private room or lies in one
  (`products/ASC.Files/Core/Utils/FileSharing.cs:106-112`); a revocation
  (access None) passes. Every link route runs through it;
  `PrivateRoomContentBoundaryTests.SetRoomLink_IsRefused` covers External
  and Invitation.
- Templates (task 12.2, decision 12): `CheckCanCreateRoomTemplateAsync`
  refuses a private room with `SecurityException` (403), next to the AI
  rooms (`FileStorageService.cs:839`);
  `PrivateRoomContentBoundaryTests.CreateTemplateFromTheRoom_IsRefused`.
- Copy-as (decision 15, not in the plan): `FilesControllerHelper.CopyFileAsAsync`
  throws `SecurityException` (403) when the source file is marked
  encrypted, lies in a private room, or the destination folder lies in a
  private room
  (`products/ASC.Files/Server/Helpers/FilesControllerHelper.cs:267-274`);
  `PrivateRoomContentBoundaryTests.CopyAs_*`. It is
  `private-rooms-editor-contract` task 10.2.
- Folder moves and copies (decision 16, not in the plan): the folder-level
  private-room rule of the copy check applies to every folder that is not a
  room
  (`products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:484`).
  `CompliesPrivateRoomRulesAsync` passes a folder only when neither it nor
  the destination lies in a private room, or both lie in the same private
  room and the operation is a move. A subfolder cannot leave its private
  room, an open folder cannot enter one, and a copy of a subfolder, within
  the room or out of an archived room, is refused with
  `ErrorMessage_SecurityException_MoveFolder`.
  `PrivateRoomContentBoundaryTests`: `MoveSubfolderOut_LeavesItInTheRoom`,
  `MoveOpenFolderIn_LeavesItOutside`, `MoveSubfolderWithinTheRoom_IsAllowed`,
  `ArchivedRoom_SubfolderCopyLeavesNoEmptyTreeOutside`. This closes the
  empty-folder-tree finding of task 9.2.
- Documentation: the Swagger responses of room creation and update (400 for
  the private settings), `PUT files/rooms/{id}/links` (403 for a private
  room), room template creation (403) and `copyas` (403) were updated.

Still open on the server after the two commits: the owner change (2.1), the
availability rule and its error code (3.1b), title validation (4.1), e-mail
titles (4.2), audit and history (6), the folder segment of the abort route
(7.2), recovery and offboarding (8), the key-set, room-type and third-party
checks of room creation (12.3), and decisions 6.0 and 12.5.

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
   keep the rights of their share. Landed 2026-11-04 (`3b9c527a6e`;
   `bd89a24dcd` then moved the Copy denial into the section-independent
   block described in Context).

8. **Private-room events go to members only.** `WhoCanRead` adds the
   administrators only for rooms without the private setting. Alternative:
   strip the title from the event payload; rejected because a member's client
   needs it to refresh the list. Landed 2026-11-04 (`bd89a24dcd`).

9. **Files of archived private rooms get their public keys (found on a local portal, 2026-10-22).** `SecurityController.GetEncryptionAccess` -> `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:212-218`) treats a file as private only when `file.RootFolderType == FolderType.VirtualRooms` and throws `NotSupportedException` (415) otherwise, while `GetKeyPairForRoomAsync` in the same file (`:260`) accepts `VirtualRooms or Archive`. A copy out of an archived private room on the local portal received 415 from `files/file/{fileId}/publickeys` and still decrypted, because the client also looks the sender up in the room roster. The fallback the file-operations requirement "Sender keys of files leaving a private room" relies on, the file's own public keys where the source room is not known, therefore fails in Archive today. The fix applies the room check's `VirtualRooms or Archive` condition to the file check. Landed 2026-11-04 (`bd89a24dcd`).

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
    about to share with. Landed 2026-11-04 (`3b9c527a6e`) as
    `GET api/2.0/privacyroom/{roomId}/access/candidates`, with the checks
    and exclusions listed in Context: an archived private room is refused
    with 403, a folder inside a room with 400, and guests, terminated users
    and users of another portal are left out as users without keys are.

11. **A key save replaces the encryption link only (found 2026-10-28).**
    `EncryptionLoginProvider.SetKeysAsync` passes the provider to
    `RemoveProviderAsync` (`ProviderConstants.Encryption`), so no other
    sign-in link of the user is matched and the save no longer fails on the
    surviving encryption record. No alternative: the current call is a bug.
    Landed 2026-11-04 (`3b9c527a6e`).

12. **Private rooms refuse links and room-level copies (found 2026-10-28).**
    The link routes refuse an external or invitation link on a private room,
    the room-level private denials of `FileSecurity.FilterEntryAsync` gain
    Duplicate and IndexExport next to Convert, AskAi and Embed, and
    `CheckCanCreateRoomTemplateAsync` refuses a private room. `CreateRoomFrom`
    needs no change: it is never granted on a room. Alternative: rely on the client, which already withholds these
    actions; rejected because any API caller reaches them. Landed 2026-11-04
    (`bd89a24dcd`): the link refusal sits in the share pipeline, so it
    covers every link route and lets a revocation through; the denials
    cover Copy, UseChat and Vectorization as well and apply in Archive too.

13. **Key checks look at the key set, not the record (found 2026-10-28).**
    `ThrowIfKeysAreNotSetAsync` treats an empty key set as no keys, which
    covers room creation, invitation and owner change at once, and the
    invitee keys route of decision 10 leaves such users out. Room creation
    accepts the private flag with the Custom room type only, on every path
    that creates a room (rooms, AI agents, templates, rooms from templates), and
    `CreateThirdPartyRoomAsync` passes the private flag on, so a third-party
    private room is key-checked. Alternative for third-party rooms: refuse the
    private flag on them (proposal decision 6).

14. **The opaque title form is the one the client sends (found 2026-10-28).**
    The client names every encrypted upload `makeOpaqueUploadName`: a
    lowercase UUID plus the original extension lower-cased, and a bare UUID
    for a file without one (`ENCRYPTED_UPLOAD_NAME_RE` in
    `packages/shared/services/private-room/encrypted-upload.ts`). The server
    has no extension check on upload today (`FileUploader.VerifyFileUploadAsync`,
    `InitiateUploadAsync`), so such a file is accepted. The title check of
    task 4.1 accepts exactly that form, an extension optional. Alternative:
    require an extension; rejected because a file without one could no longer
    be uploaded into a private room.

15. **Copy-as is refused around private rooms (landed 2026-11-04, not
    planned here).** `POST files/file/{fileId}/copyas` answers 403 when the
    source file is marked encrypted or lies in a private room, or when the
    destination lies in one, so neither ciphertext nor a plaintext copy
    crosses the room border through conversion. It closes the copy-as half
    of the open question on plaintext written into a private room and
    `private-rooms-editor-contract` task 10.2. The client needs no change:
    the client creates files in a private room through the encrypted
    creation and never sends copy-as there; the doceditor's create page
    still can, which `private-rooms-editor-contract` 9.4 decides.

16. **The folder rule of the copy check judges every folder by its rooms
    (landed 2026-11-04, not planned here).** Only a room carries the
    private flag, so the rule reads the rooms above the folder and above
    the destination: a subfolder stays inside its private room, an open
    folder does not enter one, and only a move within the same private
    room passes. The client already refuses a folder copy out of a private
    room and withholds copy-to and duplicate (`private-rooms/file-operations`);
    the batch move mock mirrors the rule (task 13.3).

## Risks / Trade-offs

- [Backend schedule] → every server task is independent, and each client
  task waits only for the server task it names. Its mock follows the merged
  server code, never a planned shape (main spec "E2E mocks mirror the server
  contract"), so the client side of an item lands after the backend one.
- [Edition rule misconfigured on upgrade] → default allow preserves current
  behaviour.
- [Owner-change loop when backfill keeps failing] → the client shows the
  unreadable files and lets the owner cancel.

## Migration Plan

1. Backend lands items in any order.
2. Once an item has merged, the client mirrors it in the MSW handlers with a
   contract test read from the merged source, then lands the client code
   that uses it.
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
- Server refusal of plaintext written into a private room. Closed on
  2026-11-04 for `copyas` conversion output (decision 15) and for a
  plaintext folder moved or copied into a private room (decision 16); still
  open for unencrypted upload sessions and uploads, which
  `private-rooms-upload-fail-closed` defers here, and not re-checked for a
  plain file moved or copied into a private room. Owner: backend team with
  product.
- Member removal racing an upload on another device (proposal decision 7):
  the access write refuses the whole request when one listed user can no
  longer read the file (see Context). Options: store the entries of the users
  who can read and report the others, or block a member's removal while
  uploads naming them are open. Owner: backend team with product.
- Third-party private rooms (proposal decision 6): key-check them like every
  private room (decision 13, what the spec assumes) or refuse the private
  flag on third-party storage. Owner: product.
