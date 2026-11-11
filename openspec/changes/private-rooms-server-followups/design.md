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

### Not confirmed

- File keys of permanently deleted files. `FileDao.DeleteFilesAsync`
  (`Core/Core/Dao/TeamlabDao/FileDao.cs`, line 1154) removes them with
  `DeleteFileKeysByFileIdsAsync` in the same transaction as the file rows;
  the single-file delete goes through it. Nothing is asked.

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
3. **Comment and review stay granted on an encrypted file.** They are
   editor permissions for work inside the encrypted document, which the
   server does not need to read. The other granted rights name operations
   the client withholds.
4. **Questions are tasks too.** The routes behind the app switch and the
   keys of a user turned into a guest need an answer before a behaviour can
   be asked; the task is done when the answer is recorded here with its
   date.
5. **A client task follows each server task that changes an answer.** It
   mirrors the merged behaviour in the mocks with contract cases and
   removes what the client no longer needs, on the pattern of
   `private-rooms-server-hardening` 16.1 and 16.2.

## Risks / Trade-offs

- [The server denies Rename or Lock on an encrypted file and a client path
  that reads the right for another purpose changes] → Task 3.2 runs the
  private-room specs on the mirrored mock before anything is removed.
- [The reason of a refusal lands under another name than the client
  expects] → Task 3.1 reads the merged server before it touches the client.
- [The tasks age while the server moves] → Each Backend task names its
  symbol, not a line; the lines above are a snapshot of `a7d94e4b81`.

## Open Questions

- Keys of a user turned into a guest: the review of 2026-11-11 reported
  that nothing removes the stored key pair when a user becomes a guest, so
  such a guest would pass the key check. Not re-read here; task 1.5 asks.
