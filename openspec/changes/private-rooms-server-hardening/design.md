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

Re-checked again on 2026-11-05 at `1259577f63` ("check file keys, refuse
unencrypted saves, hide room titles in letters", the same author): it landed
the owner-change check, a route for the missing file keys of a room, the
partial access write with a skipped list, the audit event of a key write,
the neutral room name in letters, and the editor items of
`private-rooms-editor-contract`; see "Landed on 2026-11-05".

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

### Landed on 2026-11-05 (read in `1259577f63`)

- Owner change (task 2.1, decision 1 revised): `SecurityController.ChangeFileOwner`
  (`POST files/owner`) calls `FileStorageService.ChangeOwnerAsync` with
  `demandFileKeys: true`; for a private room whose new owner is not its
  creator it reads the encrypted files of the room, subfolders included,
  that hold no key for the new owner (`DocSpaceHelper.GetEncryptedFilesWithoutKeyAsync`,
  `FileDao.GetFileIdsWithKeyAsync`) and throws
  `CustomHttpException(HttpStatusCode.Conflict, "The new owner holds no key
  for some encrypted files of the room")`, 409, leaving the owner as it was
  (`FileStorageService.cs:5499-5506`). The reassignment of a deleted user's
  rooms leaves `demandFileKeys` off, so it is never stopped by a missing key.
  The key check of the new owner (`ThrowIfKeysAreNotSetAsync`, 403) stays
  before it. `PrivateRoomFileKeysTests`: `ChangeOwner_*`,
  `ReassignOfADeletedUser_IsNotStoppedByAMissingFileKey`.
- Missing file keys (decision 18, not in the plan):
  `GET api/2.0/privacyroom/{roomId}/access/missing?userIds=…`
  (`PrivacyRoomControllerCommon.GetRoomMissingFileKeys`,
  `GetRoomMissingFileKeysRequestDto`, `EncryptionKeyPairDtoHelper.GetMissingFileKeysAsync`)
  answers `RoomMissingFileKeysDto[]`: one entry per user who lacks a key,
  `userId` and the `fileIds` of the encrypted files of the room, subfolders
  included, that hold no key for them; a user with every key is absent, so
  an empty list means nothing is missing; a file stored in the clear is never
  reported. Without `userIds` it checks the room's direct user shares plus
  the creator; with them, the named users, members or not; an id that names
  nobody on the portal is ignored. The access checks are those of the
  candidates route (`DemandRoomAccessManagerAsync`, shared by both): 404
  unknown room, 403 no read access, 400 not a room or not private, 403 when
  `CanSetAccessAsync` refuses (members without the right, non-members,
  administrators who are not members, an archived private room); a
  malformed id is 400; anonymous 401. `PrivateRoomFileKeysTests.Missing_*`.
- Access write (task 12.5 decided, decision 17): `FileStorageService.SetEncryptionInfoAsync`
  (`PUT files/{fileId}/access`) keeps the caller checks (read, private
  parent room, create right: 403 and nothing stored) and then checks each
  listed recipient on a fresh read of the file (`fileDao.GetFileAsync` per
  recipient, because a security check caches the share record it found on
  the entry and reused it for the next user, which let a non-member pass
  right after a member); the recipients who can read get their entries
  stored in one `SetFileKey`, the others are returned, and the action
  answers `FileKeysWrittenDto { skippedUserIds }` (`FileStorageService.cs:5405-5460`,
  `FilesController.cs:1287-1297`). A write where every recipient is skipped
  stores nothing and records nothing. `PrivateRoomFileKeysTests.WriteKeys_*`.
- Audit (task 6.1, the write half; decision 19): every stored write records
  `MessageAction.FileKeysSet` (5164) through `filesMessageService` with the
  file and the accepted recipients' ids (`AuditReportResource.FileKeysSet`,
  "File keys issued for "{0}" to: {1}"); `PrivacyRoomActionMapper` lists it
  under Create. `HistoryService.TrackedActions` and `AuditInterpreter`
  (`FileUploadedInterpreter`) also list it, so the file history
  (`GET files/file/{fileId}/log`) and the folder history show a "file keys
  issued" entry with the actor and the time but without the recipients.
  No revocation event: no server operation removes entries (6.0 still open).
- Letters (task 4.2, decision 4 revised): `NotifyConstants.GetRoomTitle`
  returns `FilesPatternResource.PrivateRoomTitle` ("Private room") for a
  room with the private setting, and every room notify action of Files uses
  it (invited to room, access updated, documents uploaded and created,
  folder created, room archived and removed, the form notices); the file
  notices of `NotifyClient` print it for a file inside a private room; the
  invitation e-mails (`FileSharing.cs:447`, `:459`, the resends in
  `FileStorageService.cs:5697`, `:5732`) pass no title for a private room
  and `SaasRoomInvite*NotifyAction` print
  `WebstudioNotifyPatternResource.PrivateRoomTitle` instead. Both strings
  exist in the default culture only, so every other language prints
  "Private room" in English until the resx files are translated.
  `PrivateRoomTitleInLettersTests`, `SaasRoomInviteExistingUserPrivateRoomLetterTests`.
- Metadata guards: a room created from a template of an indexed room with
  the private flag fails without making a room
  (`PrivateRoomSettingsTests.CreateFromTemplate_TemplateWithIndexing_FailsWithoutMakingARoom`).
- The editor items (the capability flag `docServiceEncryptionSupported`,
  the refused saves and submits, the dropped sessions of removed members,
  the public document address, the refused restore by address and
  reference data, the start-filling denial) are recorded in
  `private-rooms-editor-contract` (tasks 2.1, 5.4, 6.3, 6.4, 10.4, 10.5,
  10.7).

Still open on the server after the three commits: the availability rule
and its error code (3.1b), title validation (4.1), the revocation audit
(6.1b) and the revocation operation it waits for (6.0), the folder segment
of the abort route (7.2), recovery and offboarding (8), the key-set,
room-type and third-party checks of room creation (12.3), and the
translations of the letter label (4.5).

### Landed on 2026-11-05, later (read in `cc60512acd` and `20262fdcb5`)

- Plaintext never enters a private room (decision 21): `FileUploader`
  refuses an upload session into a private room, its subfolders included,
  with 403 (`ErrorMessage_SecurityException_Create`) when the session is
  not marked encrypted and with 400 (`ErrorMessage_BadRequest`) when the
  file name fails `EncryptedFileNameRegex`,
  `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$`,
  so an uppercase UUID or extension and a second dot count as readable;
  the file write path refuses a file that is not marked encrypted inside a
  private room with 403 (`FileDao.DemandEncryptedInPrivateRoomAsync` on
  `SaveFileAsync` and `ReplaceFileVersionAsync`, the provider, SharePoint
  and third-party DAOs alike), which covers `POST files/{folderId}/file`
  and any new write (`PrivateRoomContentRulesTests`). The client already
  sends such names: `makeOpaqueUploadName` asserts the same pattern and
  `getFileExtension` lowercases the extension.
- File keys follow the share (decision 22): `FileSharingAceHelper
  .SetAceObjectAsync` collects the users whose share on a private room is
  removed (not links, not groups, not the share removed before an owner
  change, not the room's creator) and `RevokeFileKeysAsync` deletes their
  keys on every file of the room, subfolders included, in one batched
  delete (`FileDao.DeleteFileKeysAsync(fileIds, userIds)`,
  `AbstractQueries.DeleteFileKeysOfUsersAsync`); the self-removal path of
  `FileSharing.cs` does the same for a member who leaves, the creator
  excepted; `FileStorageService.RemoveSharedInfoAsync` (`DELETE
  files/share`) refuses a portal administrator outside a private room with
  403 and revokes the keys of the subjects other than the caller; and
  `DeletePersonalDataAsync` drops every key of the user
  (`DeleteAllFileKeysOfUserAsync`). Each room revocation is audited as
  `MessageAction.RoomFileKeysRevoked` (5165, "File keys in the room
  "{0}" removed for: {1}") in the Delete group of
  `DocumentsActionMapper`; it is not in `HistoryService.TrackedActions`,
  so the file and folder history do not list it (`PrivateRoomLeaveTests`,
  `PrivateRoomFileKeysTests`).
- Empty key set: `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`
  treats a stored `[]` as no keys, which deleting the last key leaves
  behind (`PrivateRoomContentRulesTests.EmptyKeySet_CountsAsNoKeys`).
- Abort bound to the folder (decision 23): `FileUploader
  .AbortUploadAsync(uploadId, folderId)` throws `ItemNotFoundException`,
  404, when the session was opened against another folder and keeps the
  session; `UploadController` passes the folder of the route.
- Webhooks (decision 24): `WebhookManager` and `FileEntryWebhookDtoHelper`
  set the entry's share record to null before each subscriber's access
  check, since `FileSecurity` keeps the record it found and answered the
  next subscriber with it; a folder event of a private room no longer
  reaches a subscription outside the room, and the room quota and the
  origin of a trashed file are judged per subscriber
  (`WebhookPrivateRoomAccessTests`, `WebhookEntryContextTests`,
  `WebhookFileOperationPayloadTests`).
- Documentation: the Swagger responses of the upload session routes (400,
  403, 404) and of `DELETE files/share` were updated, the OpenAPI documents
  and the C# SDK regenerated. The commit message calls the upload rules
  breaking for clients; this client already follows them.

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
   because the client cannot know the server's view of the entries. Landed
   2026-11-05 (`1259577f63`) in the second form: the owner change answers
   409 without a list, and the client reads the list from the missing-keys
   route (decision 18) before it asks, which gives it the server's view
   after all. Implemented 2026-11-05 (task 2.2) in the store helper that
   both the owner panel and the edit dialog reach: it unlocks the current
   user's identity, wraps the listed files for the candidate with
   `rewrapMissingFilesForMember`, refusing a changed key silently, and asks
   for the transfer only when nothing is left; files still missing, or a
   409 from a file added meanwhile, are counted with
   Common:EncryptedReencryptPartialFailure and the owner stays.

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
   rejected because e-mail clients cannot decrypt it. Landed 2026-11-05
   (`1259577f63`) as a neutral label, "Private room", in place of the title
   in every letter and push of Files, with the link kept; the label is in
   the default culture only (task 4.5).

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

17. **A key write stores what it can and names the rest (landed 2026-11-05,
    decides proposal decision 7 and task 12.5).** The access write stores the
    entries of the recipients who can read the file and answers the ids it
    skipped, instead of refusing the whole request; each recipient is checked
    on a fresh read of the file. The client reads the skipped list and treats
    those users as not written (task 12.6). Alternative, blocking a member's
    removal while uploads naming them are open, was not taken by the server.

18. **The missing file keys of a room come from the server (landed
    2026-11-05, not planned here).** `GET privacyroom/{roomId}/access/missing`
    reads the file keys table for the room's members or for named users and
    answers, per user, the encrypted files that hold no key for them. It is
    the route this change had put out of scope as a later target: it makes
    the backfill exact (task 14.2), lets the owner change be prepared
    (task 2.2), and lets the pending-access marker of
    `private-rooms-invite-atomic-rewrap` be rebuilt on another device, which
    that change decides.

19. **A key write is audited with its recipients and listed in the file
    history without them (landed 2026-11-05).** `FileKeysSet` goes to the
    audit trail with the recipients' ids and to the file and folder history
    as a plain entry. The per-file access history this change asked for is
    therefore the file history, not a dedicated route; the client decides
    how its History tab shows the new action (task 6.2). Decided
    2026-11-05 with task 6.2: the tab leaves the entry out, as it does any
    action it does not know (`getFeedInfo` finds nothing and
    `HistoryBlockContent` renders nothing), recorded in the
    `file-operations` delta. One entry per file per write, without the
    recipients, would only be noise next to the audit trail, which keeps
    the write with its recipients. Alternative: name it with a Common key;
    kept open, it needs the key and its translations only.

20. **The backfill sweep wraps the missing entries only (task 14.2).** With
    the missing-keys route the sweep reads once which members lack an entry
    on which files and wraps exactly those, keeping the entries other
    senders wrote; the blind sweep that re-wrapped every file for every
    member stays as the fallback when the read fails. This supersedes
    decision 4 of `private-rooms-fanout-dialog-and-backfill` (archived,
    confirmed by the user on 2026-10-20), whose alternative (c), a server
    query, is what landed; the `room-membership` delta of this change
    modifies "Backfill re-wraps every member" accordingly, and its scenario
    "Existing wraps are replaced" holds on the fallback only. Alternative:
    keep re-wrapping everything and use the route only to find late
    members; rejected because every room open by a manager rewrote every
    entry of every file for nothing.

21. **Plaintext is refused by the server at the session and at the write
    (landed 2026-11-05, proposal decision 5 decided).** The server refuses
    a session into a private room without the encrypted flag and a file
    name it could read, and the file write path refuses any file in the
    clear, so a new way of writing a file cannot walk around the check.
    The client mirrors both in its mocks (tasks 4.4 and 4.6) and keeps its
    own fail-closed gate, which refuses earlier and with a message. The
    deferral of `private-rooms-upload-fail-closed` is met. Alternative:
    the server guard at the end of the upload only; rejected by the server
    as it would still store the chunks and the name.

22. **The server revokes file keys with the share (landed 2026-11-05,
    proposal decision 4 decided).** A user who leaves a private room or is
    removed from it, has their access cleared, or has their personal data
    deleted loses their wrapped keys on every file of the room in one
    batched delete, audited as `RoomFileKeysRevoked` (5165); the creator
    keeps theirs, and so does a share removed before an owner change. The
    "member revoked" audit this change asked for is that event. The client
    stops running its own revocation (task 6.3): it could never remove
    another user's entries, since the access write never removes a user it
    does not name, and the server now does it whether or not a client is
    online. A member who comes back holds no key until an invitation or
    the backfill sweep (decision 20) wraps the files again. No manager
    route to revoke named users was added; offboarding (task 8.1) still
    needs the owner part. A group's removal revokes nothing yet:
    `SetAceObjectAsync` leaves group subjects out of the users it collects
    (`!w.SubjectGroup`, `FileSharing.cs:444`), so a user who loses the
    room with the group's share keeps their keys; task 6.4 asks the
    server to revoke them, and the client runs no revocation for a group
    either, since its run could not remove them. Alternative: keep the client run as a belt and
    braces; rejected, it only re-writes entries the server deletes anyway
    and shows a notice about work it did not do.

23. **An abort through another folder is 404, not 403 (landed
    2026-11-05).** The server treats a session named through a folder other
    than its own as not found there, keeps the session, and says so in the
    route's responses; task 7.3 mirrors 404. Alternative: 403; the server
    chose 404 to tell nothing about a session the caller did not reach
    through its folder.

24. **Webhook payloads are judged per subscriber (landed 2026-11-05, not
    planned here).** The share record `FileSecurity` leaves on an entry is
    reset before each subscriber's check, so a private room's folder title
    no longer reaches a subscription outside the room; the cause in
    `FileSecurity` stays, being a hot path that also writes the entry's
    access. Server only; the `server-contract` delta records the scenario
    under "Private-room events reach members only".

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
- Revocation primitive: decided by the server on 2026-11-05, decision 22:
  the server deletes a user's keys for every file of a private room when
  the user leaves it, is removed from it, has their access cleared or
  their personal data deleted, audited as `RoomFileKeysRevoked`. No
  manager route. Task 6.3 adapts the client; task 8.1 keeps the owner part
  of offboarding; task 6.4 covers the users who lose the room with a
  group's removal, which the server does not revoke yet.
- Server refusal of plaintext written into a private room: closed on
  2026-11-05, decision 21, at the upload session and on the file write
  path, after `copyas` output (decision 15) and folders (decision 16) on
  2026-11-04. A plain file moved or copied into a private room goes
  through the same write path and is refused there.
- Member removal racing an upload on another device (proposal decision 7):
  decided by the server on 2026-11-05, decision 17: the write stores the
  entries of the users who can read and reports the others.
- Third-party private rooms (proposal decision 6): key-check them like every
  private room (decision 13, what the spec assumes) or refuse the private
  flag on third-party storage. Owner: product.
