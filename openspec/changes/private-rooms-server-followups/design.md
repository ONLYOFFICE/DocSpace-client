# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Server source: `../server` at `a7d94e4b81`, read through CodeGraph on
2026-11-11. Stand: `tests.onlyoffice.io`, DocSpace 4.1.0.12351 with
Document Server 10.0.3.19 on 2026-11-10, DocSpace 4.1.0.12366 on
2026-11-11. Paths below are under `products/ASC.Files` unless they start
with `common/`.

### Key check on every change of a user's share

- Code: `FileSharingAceHelper.SetAceObjectAsync` (`Core/Utils/FileSharing.cs`,
  lines 270-276) calls `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs`,
  line 97) for the user of the entry whenever the room is private, the
  entry is not a link and the existing share, if any, is a user's. The
  condition does not look at the access being set, so a removal and a leave
  are checked too.
- Reported by the review of 2026-11-10 and not re-read here: a group added
  to a private room is refused by this same check rather than by a rule
  about groups, and the check reaches the previous owner at an owner
  change, so an owner with an empty key set gets 403 even when the new
  owner holds keys.
- Stand, 2026-11-10 and 2026-11-11: a leave, a removal and a role change of
  a member without keys answered 403 "The user does not have an encryption
  key"; the same request answered 200 once the member had created a key.
- `DELETE files/share` (`FileStorageService.RemoveAceAsync`,
  `Core/Core/FileStorageService.cs`, line 4695, and
  `FileSharingAceHelper.RemoveAceAsync`, `Core/Utils/FileSharing.cs`, line
  603) runs no key check. For a caller who may set access it clears the
  share of every member, so it is not a way out for a leave.

### Refusal without a reason

- Code: `ResponseWrapper` (`common/ASC.Api.Core/Middleware/ResponseWrapper.cs`,
  lines 86-88) answers an `InvalidOperationException` with 403 and its
  message. The key refusal and a refusal by rights are both 403; they
  differ in the message and in the exception type the answer names.
- Stand, 2026-11-10: the Russian interface showed the English sentence of
  the server.
- The client shows one translated message for any 403 of a leave, a
  removal or a role change in a private room, a key refusal or not
  (`private-rooms-membership-refusals`, archived 2026-11-11).

### Per-file key listing

- Code: `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)`
  (`Core/Core/Entries/EncryptionKeyPairDto.cs`, line 194) builds the answer
  from `FileSharing.GetSharedInfoAsync` of the file: the users holding a
  share record of their own, and the file's creator as the owner entry.
  The room owner holds no share record on the room, and a creator stays
  the owner entry after leaving.
- Stand, 2026-11-10: for a file uploaded by a member the answer held the
  member only, without the room owner, who has keys; in the room "Probe
  2026-11-06" it held only the file's creator, who was no longer a member.
- The route is proposed for the desktop bridge in
  `private-rooms-remove-dead-api-calls` 2.0.

### Rooms of a deleted user

- Code: `FileStorageService.ReassignRoomsAsync`
  (`Core/Core/FileStorageService.cs`, line 4144) calls
  `FolderDao.ReassignRoomsAsync` (`Core/Core/Dao/TeamlabDao/FolderDao.cs`,
  line 1802), one update of the creator of every room of the old owner
  (`FolderQueries.ReassignRoomsAsync`, `Core/Core/EF/Queries/FolderQueries.cs`,
  line 837). It does not go through the owner change of a single room, so
  neither the key check nor the missing-entries check applies.
- Not run on the stand.

### Forms area

- Code: `SearchAreaExtensions.MatchesRoom`
  (`Core/Core/VirtualRooms/SearchArea.cs`, line 90) admits every
  form-filling room to the Forms and form-template areas, private or not,
  while the Rooms area leaves private rooms out.
- A private form-filling room can still be created
  (`private-rooms-server-hardening` 12.8). Not run on the stand.

### Rights reported on content the server cannot read

- Code: `FileSecurity.FilterEntryAsync` (`Core/Core/Security/FileSecurity.cs`,
  line 1234). The owner of the room is granted every action not refused
  before `HasFullAccessAsync` (line 2063). For a file of a private room the
  refusals are Copy, Duplicate, IndexExport, UseChat, Vectorization and
  StartFilling (line 1712) and Convert, AskAi, Embed, EditAccess and Copy
  (line 2033). Rename, ReadHistory, EditHistory, Lock, CopyLink, Comment,
  Review and CustomFilter are therefore granted, and SubmitToFormGallery
  for a document, a spreadsheet, a presentation and a PDF form (line 1468).
  `CanUseAi` on a room is refused only outside a room (line 1364), so a
  private room reports it as granted.
- Code: `FileStorageService.UpdateCommentAsync`
  (`Core/Core/FileStorageService.cs`, line 2517) stores the version comment
  when `CanEditHistoryAsync` passes, with no look at the encrypted flag.
- Stand, 2026-11-10, as the room owner: Rename, ReadHistory, EditHistory,
  Lock and CopyLink true on an encrypted file, `CanUseAi` true on a private
  room. Other roles were not tried.
- The client withholds these actions by the encrypted flag: the menus, the
  version badge, and since 2026-11-11 the version comment of the info panel
  (`private-rooms-encrypted-file-rights`, archived).

### Section root title

- Stand, 2026-11-10: the root of the private section came titled "Private"
  for a user whose culture is Russian.
- Code: the root is found or created by
  `FolderDao.GetFolderIDPrivateRoomsAsync`
  (`Core/Core/Dao/TeamlabDao/FolderDao.cs`, line 2283). Where its title is
  resolved for the answer was not traced.

### E2E rooms app switched off

- Code: `FoldersControllerCommon.IsPrivateRoomsAppEnabledAsync`
  (`Server/Api/FoldersController.cs`, line 1162) is called by two actions
  only, the private section listing (`GetPrivateRoomsFolder`) and the root
  list (`GetRootFoldersIdsAsync`). The rooms list with the private area or
  the private filter, the key routes and the creation of a private room do
  not ask it.
- The owner decided on 2026-11-06 that private rooms are hidden while the
  app is off. The client sends the not-private filter on every rooms
  listing then (`private-rooms-beta-release` 4.5), but an address that
  carries the private filter itself is passed on and answered with private
  rooms.
- Read again at `6fb6dfb17a` on 2026-11-16, which answers task 2.4: the
  guard (now at line 1126) has the same two callers, lines 1116 and 1165,
  and no other code asks the app. A private room, its folders and its
  files are served by id with the app off, as the main spec requirement
  "The E2E rooms app gates only the private section listing" records.

### User turned into a guest

Read at `6fb6dfb17a` on 2026-11-16, which answers task 1.5.

- Code: the type change runs in `UpdateUserTypeProgressItem`
  (`common/ASC.Data.Reassigns/UpdateUserTypeProgressItem.cs`). For a user
  who becomes a guest it passes the user's rooms to another user
  (`FileStorageService.ChangeRoomsOwnerAsync`, line 112), lowers the room
  manager role to content creator (`DowngradeRoomManagerRoleAsync`, line
  119), lowers the shares in AI rooms to read (line 123 and below) and moves
  the user to the guest group. No step names the encryption keys, the file
  keys or the membership of a private room.
- Code: the stored key pair is removed in one place only,
  `EncryptionLoginProvider.SetKeysAsync`, before it writes the new value
  (`AccountLinker.RemoveProviderAsync`). A guest cannot reach it: the
  creation, the replacement and the deletion of a key demand a caller who
  is not a guest (`EncryptionKeyPairDtoHelper.DemandKeyOwnerAsync`,
  `Core/Core/Entries/EncryptionKeyPairDto.cs`, line 118). So the pair of a
  user turned into a guest stays as it was and can no longer be changed.
- Code: the guest reads that pair. `GET privacyroom/keys`
  (`PrivacyRoomController.GetUserKeys`) asks only for a signed-in caller,
  and its description says a guest gets an empty answer "unless they had
  keys before". The shares and the wrapped file keys are untouched, so the
  guest goes on opening the files of the private rooms the user was in.
- Code: the key check of a share change,
  `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`, looks at the stored
  keys and not at the user type, so a share request that names such a guest
  passes it. The prospective-members answer leaves a guest out
  (`GetKeyPairForRoomCandidatesAsync`, line 313), so the invite panel gets
  no public key for the guest and cannot wrap the file keys; the request
  sent without the panel is not stopped.
- Code, corrected on 2026-11-16 by a second read: the private rooms the
  user owns do not pass to anybody. `ChangeRoomsOwnerAsync`
  (`Core/Core/FileStorageService.cs`, line 3804) collects the rooms with
  `GetFolderItemsAsync` under the rooms root, whose search area is the
  default, the Rooms area, and that area lists rooms that are not private
  and not form-filling (`FileSecurity.cs`, lines 2988-2993,
  `SearchArea.Active => RoomPrivacyFilter.NotPrivate`; the split of
  `SearchAreaExtensions.MatchesRoom`). So a user turned into a guest stays
  the owner of the user's private rooms, and of the form-filling ones. The
  first read of this section assumed they pass through `ChangeOwnerAsync`
  and leave the old owner a content creator share; that holds for the rooms
  the listing returns only. For those, `ChangeOwnerAsync` (line 5510)
  demands the new owner's keys when a room is private and is called without
  the check of the new owner's file keys (`demandFileKeys` left false).
- The removal of a share already removes the wrapped file keys of the user
  (`FileSharingAceHelper.RevokeFileKeysAsync`, `Core/Utils/FileSharing.cs`,
  line 670; `private-rooms-server-hardening`, design decision 22), so task
  1.6 needs no new revocation.
- Not run on the stand.

### Read on 2026-11-16 (`6fb6dfb17a`): three behaviours without a task

The first two got tasks 1.7 and 2.6 the same day (decision 8); the third
waits for a run on a stand.

- **An invitation of several people stops at the first without a key.**
  `FileSharingAceHelper.SetAceObjectAsync` (`Core/Utils/FileSharing.cs`)
  goes through the entries one by one, groups first (line 131). The key
  check throws at line 275 and the share of an entry is written at line
  413, inside the same loop, so the entries before the one without a key
  are already stored when the request answers 403, and the ones after it
  are not looked at. No transaction was found in the helper, nor in its
  caller (`FileStorageService.SetAceObjectAsync`, line 4560), which calls
  it for each entry of the request in turn. The
  invite panel leaves out an invitee without a key before it sends
  (`private-rooms/room-membership`), so the panel does not reach this; a
  request sent without it does.
- **A private room and its folders can be marked as favourites.**
  `FileStorageService.AddToFavoritesAsync` (line 4254) leaves encrypted
  files out (`!file.Encrypted`) and takes every folder the caller may read,
  a private room and a folder of one included. The Favourites section
  lists the folders that carry the mark and that the caller may read
  (`Core/Utils/EntryManager.cs`, lines 507-509), so a private room shows
  there, outside the Private section.
- **Trash.** An encrypted file of a room is deleted for good
  (`FileDao.UseTrashForRemove`, `Core/Core/Dao/TeamlabDao/FileDao.cs`,
  line 1971). A folder is not moved to Trash when it carries the private
  setting (`FolderDao.UseTrashForRemoveAsync`, line 1723), and a folder
  created in a private room is given the setting of its parent
  (`InternalCreateFolderAsync`, line 1249). Whether a folder below the room
  root holds the setting when it is read back was not traced, so the
  observation of 2026-11-06 in `private-rooms-server-hardening` ("a
  subfolder of a private room still goes to Trash") is neither confirmed
  nor withdrawn; it needs a run on a stand.

### Not confirmed

- File keys of permanently deleted files. `FileDao.DeleteFilesAsync`
  (`Core/Core/Dao/TeamlabDao/FileDao.cs`, line 1154) removes them with
  `DeleteFileKeysByFileIdsAsync` in the same transaction as the file rows;
  the single-file delete goes through it. Nothing is asked.

### Hand-over to the backend team

The owner handed the open Backend tasks of this change to the backend team
on 2026-11-16, as one document with the open server tasks of
`private-rooms-server-hardening` and the portal setting of
`private-rooms-release-gate`: tasks 1.1 to 1.4, 1.6, 2.1 to 2.3 and 2.5,
each with what the server does today, what is asked, what is expected and
how it is accepted. `../server` was at `6fb6dfb17a` that day and held none
of them. No reply is recorded yet. Tasks 1.7 and 2.6 and the correction of
1.6 were added to the document later that day.

### Read at `0396e6910f` (2026-11-16)

The pull of 2026-11-16 brought 37 commits after `6fb6dfb17a`. No code of
private rooms changed; none of the tasks of this change has landed.

- The server now carries OpenSpec specs of its own, 30 capabilities under
  `../server/openspec/specs` with a register of known deviations
  (`openspec/deviations.md`), and routes behaviour changes through them.
  `private-rooms` holds 55 requirements.
- Four test files of `Tests/08_Private` are new or longer: who may read
  the encryption information of a file, the metadata filter of the private
  section, the revocation of a link on a private room, and an
  administrator outside a room who sees it in no area.
- The server's register lists as open what this change and
  `private-rooms-server-hardening` ask or note: a subfolder of a private
  room that goes to Trash (PR1), a private room or its folder among the
  favourites (PR2, task 2.6 here), the backup without keys (PR4) and the
  neutral title in the default culture only (PR6, hardening 4.5).
- Two statements of the server's `private-rooms` spec differ from what is
  asked here. "Reassigning a deleted user's rooms ignores file keys" says
  the reassignment must not be stopped by a missing file key, since nobody
  is left to issue it; task 1.4 asks that no private room ends with an
  owner who cannot open its files. "Room types that can be private" says a
  public and a form-filling room are refused with 403, which is what the
  server answers, and does not say that the room stays stored
  (`private-rooms-server-hardening` 12.8). Both are to be raised with the
  backend team against its spec.

## Goals / Non-Goals

**Goals:**

- Every server behaviour found has one task with a symbol, a change and an
  acceptance check, or a record that it needs none.

**Non-Goals:**

- Choosing the implementation for the backend team.
- Client work before the server merges.

## Decisions

1. **One change for all new server tasks.** They share an owner and a
   reader. Tasks that already exist elsewhere keep their place and only
   gain the observation.
2. **The delta states the behaviour asked, as MODIFIED requirements where
   the main spec describes today's behaviour.** The main spec is the record
   of the server as it is; the two meet when the work lands and this change
   is archived. Alternative: editing the main spec now. Rejected: it would
   describe a server that does not exist.
3. **Comment and review stay granted on an encrypted file (decided by the
   owner on 2026-11-11).** They are
   editor permissions for work inside the encrypted document, which the
   server does not need to read. The other granted rights name operations
   the client withholds.
4. **Questions are tasks too.** A behaviour is asked only after the
   server has been read or the backend team has answered; the task is done
   when the answer is recorded here with its date. The keys of a user
   turned into a guest and the routes behind the app switch were such
   questions until 2026-11-16 (decisions 6 and 7).
5. **A client task follows each server task that changes an answer.** It
   mirrors the merged behaviour in the mocks with contract cases and
   removes what the client no longer needs, on the pattern of
   `private-rooms-server-hardening` 16.1 and 16.2.

6. **A user turned into a guest loses the private rooms and the keys
   (decided by the owner on 2026-11-16).** The type change removes the
   user's share in every private room, which removes the wrapped file keys,
   and then deletes the stored key pair. What is expected afterwards: the
   guest is in no private room and opens no encrypted file; the guest holds
   no key, so the key check refuses an invitation with no rule about guests;
   the rooms the user owned belong to the new owner, without the old owner
   among the members; and a guest made a user again starts with no key,
   creates one and is invited again. Alternative: keep the keys and refuse
   a guest by a rule of its own. Rejected: the main spec already says a
   guest holds no encryption key, and a kept pair that its holder can read
   but never change or delete is a state no other path produces.

7. **The switched-off E2E rooms app closes private rooms on the server
   (decided by the owner on 2026-11-16).** Hidden means not reachable: no
   rooms listing holds a private room, none can be created, and an existing
   one, its folders and its files are refused by id, with their download,
   their opening in the editors, their members and their keys. The routes
   of a user's own key pair stay open, because the Keys management tab
   stays for a key holder (main `key-management`, "Keys management tab
   follows the Private section"). Nothing is deleted, so switching the app
   on brings everything back. Alternative: close the listings and the
   creation only and leave the direct access. Rejected by the owner: a
   switch that leaves the rooms open at their addresses does not switch
   the feature off.

8. **A share change is whole or nothing, and private rooms are not
   favourites (decided by the owner on 2026-11-16).** A request that names
   a user without a key gives access to nobody, since a half-applied
   invitation leaves members the sender was told were refused. A private
   room and its folders stay out of the favourites as an encrypted file
   does: the Favourites section is outside the Private section and does
   not follow the E2E rooms app, so a mark would show a private room where
   the switch says there is none. Alternative for the invitation: add the
   users who hold keys and report the others. Rejected: the answer of a
   share change has no place for a list of refused users, and the invite
   panel already leaves them out before it sends.

## Risks / Trade-offs

- [The server denies Rename or Lock on an encrypted file and a client path
  that reads the right for another purpose changes] → Task 3.2 runs the
  private-room specs on the mirrored mock before anything is removed.
- [The reason of a refusal lands under another name than the client
  expects] → Task 3.1 reads the merged server before it touches the client.
- [A user is turned into a guest by mistake and loses the keys for good] →
  Accepted with decision 6: the files stay readable to the other members,
  and the user is invited again after a new key. The server cannot keep the
  pair aside, since only its holder can open it.
- [An administrator switches the app off while members work in a private
  room] → Accepted with decision 7: their requests are refused from then
  on, and nothing stored is lost. What happens to an editing session that
  is open at that moment is not asked here and is for the backend team to
  state when it takes 2.5.
- [The tasks age while the server moves] → Each Backend task names its
  symbol, not a line; the lines above are a snapshot of `a7d94e4b81`.

## Open Questions

- Guests who were users before task 1.6 lands keep the key pair, the file
  keys and the private rooms they had. Whether the server clears them once,
  with the change or by a migration, is for the backend team to say when it
  takes 1.6.
