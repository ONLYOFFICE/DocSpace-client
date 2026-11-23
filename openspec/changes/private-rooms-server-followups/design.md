# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Server source: `../server`, read through CodeGraph on 2026-11-11 at
`a7d94e4b81` and on 2026-11-16 at `6fb6dfb17a`. Stand:
the release stand, DocSpace 4.1.0.12351 with Document Server 10.0.3.19
on 2026-11-10, DocSpace 4.1.0.12366 on 2026-11-11.

### Section root title

- Stand, 2026-11-10: the root of the private section came titled "Private"
  for a user whose culture is Russian.
- Code: the root is found or created by
  `FolderDao.GetFolderIDPrivateRoomsAsync`
  (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FolderDao.cs`, line 2283).
  Where its title is resolved for the answer was not traced.

### Not confirmed

- File keys of permanently deleted files. `FileDao.DeleteFilesAsync`
  (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs`, line 1154)
  removes them with `DeleteFileKeysByFileIdsAsync` in the same transaction
  as the file rows; the single-file delete goes through it. Nothing is
  asked.

### Hand-over to the backend team

The owner handed the open Backend tasks of this change to the backend team
on 2026-11-16, as one document with the open server tasks of
`private-rooms-server-hardening` and the portal setting of
`private-rooms-release-gate`: tasks 1.1 to 1.4, 1.6, 2.1 to 2.3 and 2.5,
each with what is asked, what is expected and how it is accepted. Tasks 1.7 and 2.6 and an addition to 1.6 were added to
the document later that day. Task 1.8 and the server refusal of a
guest in a project (`ai-projects`, tasks.md section 7) were added to it
the same day, and the owner handed the updated document to the backend
team that day. No reply is recorded yet.

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
- The server's register lists the backup without keys (PR4) and the
  neutral title in the default culture only (PR6, hardening 4.5).
- Two requirements of the server's `private-rooms` spec, on the
  reassignment of a deleted user's rooms and on the room types that can be
  private, are to be compared with task 1.4 here and
  `private-rooms-server-hardening` 12.8 and raised with the backend team
  against its spec.

### Read at `426776b640` (2026-11-19)

The pull of 2026-11-19 brought 11 commits after `5636dd4a79`: the
registration of the HTTP clients in the worker hosts, a retry of a document
service request that times out, identity tests, and the fix of bug 83853.
None of the open Backend tasks of this change has landed; each was checked
in the source at this commit, as were `private-rooms-editor-contract` 6.2,
10.6 and `private-rooms-server-hardening` 8.1 and 16.1.

One commit changes private rooms, `dceb038a04` (bug 83853), in
`products/ASC.Files/Core/Utils/FileMarker.cs`:

- When the new-items marks of an entry are cleared for a user
  (`RemoveMarkAsNewAsync`) and the entry lies in a private room, the server
  now sends the new-items event of the Private root as well
  (`SendSectionNoticeAsync`), with the count of that root for the user, the
  sum over the user's private rooms without the rooms whose notifications
  the user switched off (`GetSectionNewCountAsync`). The same is done for
  the Forms root and a form-filling room. The Private root has no tag of
  its own, and the event of the Rooms root that used to refresh its count
  can be gone while a room still has marks.
- The event is the one every root gets: `SocketManager.ExecMarkAsNewFoldersAsync`
  posts `mark-as-new-folder`, and the socket service
  (`common/ASC.Socket.IO/app/hubs/files.js`) emits `s:markasnew-folder`
  with `{ folderId, count }` to the room of that folder and user.
- A failure while the notice is built is logged and does not fail the
  clearing of the marks.
- The server test of the commit (`SocketSectionNewItemsTests`) covers the
  Forms root; the Private root has no server test.

The client needs no change for it. `TreeFoldersStore.listenTreeFolders`
subscribes to `DIR-<id>` of every root of the tree but Recent, the Private
root included; the handler of `SocketEvents.MarkAsNewFolder` in
`packages/client/src/store/FilesStore.ts` reads the folder tree again when
the event names a root of the tree; and the Private item takes its counter
from the `newItems` of that root (`ClientArticleSidebar`). Read in the
code, not run on a stand. No unit test covers that handler; task 3.9 adds
one.

### Read at `39f71456b0` (2026-11-23)

The backend team answered the hand-over on 2026-11-21 with its own change
`private-rooms-server-followups`, on the branch
`feature/private-rooms-external-links` of `../server`, which is not merged
into `release/v4.1.0`. This repository works on the branch of the same
name, so the Client tasks below are done against that branch. Three
commits carry the answer: `a77956ac1c`, `bbd22092b3` and `39f71456b0`.
Read in the source; its tests are in
`products/ASC.Files/Tests/Tests/08_Private`. Nothing was run on a stand.

Members and keys (`products/ASC.Files/Core/Utils/FileSharing.cs`):

- `FileSharingAceHelper.ValidatePrivateRoomMembersAsync` runs over the
  whole request before its first write. A key is asked
  (`EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`) only of a user who
  has no share record of the room yet; the owner is never asked, nor is a
  disabled or deleted user, whom the write loop skips. An invitation by an
  e-mail address that names no account is refused the same way. The role
  checks of the write loop are made in this pass too, before the keys.
- The refusal for want of a key is
  `EncryptionKeyNotSetException` (namespace `ASC.Web.Studio.Core`, a
  subclass of `InvalidOperationException`), answered with 403. The answer
  of every error carries `error.type`, the full name of the exception
  (`CommonApiResponse`), so the client reads
  `ASC.Web.Studio.Core.EncryptionKeyNotSetException` there. A refusal by
  rights is a `SecurityException` and carries that type.
- A group with an access other than none is refused with
  `InvalidOperationException` and the message of
  `ErrorMessage_GroupInPrivateRoom`, 403; its `error.type` is
  `System.InvalidOperationException`, which other refusals share. A group
  that a room still holds can be removed.
- The members the request takes out are returned by the same pass, and
  their file keys are deleted (`RevokeFileKeysAsync`) before any share is
  written; a leave (`RemoveAceAsync`) and `removeSecurityInfo` do the same.
  The backend team has no test that makes the deletion fail, and says so.
- `EncryptionKeyPairDtoHelper.GetPrivateRoomRecipientsAsync` adds the
  room's owner to the key listing of a file and drops the file's creator
  when the creator holds no share of the room.

Rooms of a user who goes (`FileStorageService.ReassignPrivateRoomsAsync`):

- At a removal of a user's data and at a reassignment, a private room goes
  to the recipient when the recipient holds an encryption key, whatever
  file keys they hold; else to the portal owner when the portal owner
  holds one; else it stays with the user. The ids of the rooms that stayed
  are `keptPrivateRoomIds` of `TaskProgressResponseDto`, which the
  progress of the removal and of the reassignment answers: an empty list
  when every room moved, null before the rooms are handed over and for a
  job that hands none over.
- `FileSecurity` grants `ChangeOwner` on a private room of the Rooms root
  to a DocSpace admin who holds a share of the room, in any role; an
  administrator outside the room is still refused. The owner change
  itself keeps its checks of the new owner's keys.

A user turned into a guest (`UserController`,
`common/ASC.Data.Reassigns/UpdateUserTypeProgressItem.cs`,
`PrivateRoomAccountHelper`):

- `POST people/type` checks first that the recipient can take every
  private room the user owns: an encryption key, and a key of every
  encrypted file of each room. Otherwise it answers 403 with `error.type`
  `ASC.Files.Core.Helpers.PrivateRoomOwnershipException` and changes
  nothing; the job repeats the check.
- The job then gives those rooms to the recipient, deletes the user's file
  keys, removes the user's share of every private room, sends the user the
  folder-deleted event of each room, and deletes the user's key pair.

A deactivated user (`UserController`, `PrivateRoomAccountHelper`):

- `updateMember` with `disable`, `updateUserStatus` and `deleteProfile`
  answer 403 with `error.type`
  `ASC.Files.Core.Helpers.PrivateRoomOwnershipException` when an account
  to disable owns a private room, before anything is saved; in a status
  change of several users nobody is disabled then. The message names the
  account and the number of its private rooms, not the rooms.
- After the disabling the file keys of the account are deleted, with the
  audit event of a revocation for each room. The key pair and the shares
  stay. A disabling of any origin also publishes
  `UserDisabledIntegrationEvent`, on which the Files worker deletes the
  keys again.

Listing and rights:

- `FileSecurity` denies, on a file whose `Encrypted` flag is set, Rename,
  ReadHistory, EditHistory, Lock, CopyLink, CustomFilter and
  SubmitToFormGallery, before the full access of the owner is looked at
  and whether the room is archived or not; `CanUseAi` joined the rights
  denied inside a private room. `FileStorageService.UpdateCommentAsync`
  refuses an encrypted file.
- `SearchAreaExtensions.MatchesRoom` leaves a form-filling room with the
  private setting out of the Forms and form-template areas.
- `AddToFavoritesAsync` skips a private room and a folder of one, and the
  Favourites listing (`EntryManager`) leaves out one marked before. The
  marks themselves stay in the data.
- The title of the Private root: the resource `PrivateRooms` of
  `FilesUCResource` exists in the default culture only, so every user
  reads "Private". No code changes; translators add the other cultures.

The E2E rooms app (`products/ASC.Files/Core/Helpers/PrivateRoomsGate.cs`):

- The gate reads the enabled state of the app `e2e-rooms` for the portal
  (`AppSettingsService.GetAppAsync`): the portal's own value, else the
  default of the installation's configuration, and off when the
  configuration does not list the app. Nothing in it asks whether the
  installation is standalone.
- While it is off: `FileSecurity` answers false for every right on an
  entry of a private room; a private room, a folder or a file of one
  requested by id, and a file opened in the editors, answer 404
  (`ThrowIfHiddenAsync`); the creation of a private room answers 403
  (`DemandEnabledAsync`); no rooms listing holds a private room or
  anything that lies in one. The section listing and the root folders
  answer as before.
- The client reads the state of an app only on a standalone portal
  (`AppsStore.canManageApps`), and treats every app as on elsewhere. A
  portal that is not standalone and has the app off would show the
  section and get 404 for it; task 3.6 covers it.

Creation (`FileStorageService`, `VirtualRoomsController`):

- The private flag on a room of the public, the form-filling or the AI
  agent type is refused with 400 before anything is saved, and so is a
  room made from a template with the flag
  (`CheckCanCreateRoomFromTemplateAsync`).

The editor (`CustomizationConfig.GetAIConfigAsync`): the configuration of
an encrypted file carries `customization.ai.disabled: true`.

Open with the backend team: its ten questions of 2026-11-21, which the
owner answers; they change no task here.

### Stand check of 2026-11-23

A local stand of the owner: `../server` at `39f71456b0`, a standalone portal, the E2E rooms app on, the Document
Server reported as encrypting. The requests were sent to the API as the
portal owner, who holds a key, and as test accounts made for the check;
their keys were random values, which the server stores without looking
into them. No file was uploaded, so nothing here covers an encrypted file,
its rights or the editor.

- A user without a key invited to a private room: 403, `error.type`
  `ASC.Web.Studio.Core.EncryptionKeyNotSetException`. The same for an
  e-mail address that names no account.
- A group invited: 403, "A group cannot be invited to a private room: file
  keys are issued to each user", `error.type`
  `System.InvalidOperationException`.
- A member who deleted the own key got another role and was removed, both
  with 200.
- The owner of a private room disabled, alone and in a list with another
  account: 403, `error.type`
  `ASC.Files.Core.Helpers.PrivateRoomOwnershipException`, nobody disabled.
  The message names the account and the number of its private rooms.
- That owner turned into a guest with a room administrator without a key
  as the recipient: 403 with the same `error.type`, the type unchanged.
  With a user who is not an administrator as the recipient the answer is
  the ordinary 400 of the type change. With the portal owner as the
  recipient the job completed: the room belongs to the portal owner, the
  former owner is not among its members, holds no key, and a new
  invitation of that guest is refused for want of a key.
- The progress of the type change carries no `keptPrivateRoomIds` field at
  all: a null value is left out of the answer, so the client reads an
  absent field as null.
- A private room created with the public and with the form-filling type:
  400, "A Public room, a Form filling room or an AI agent cannot be
  private", and no room among the private ones afterwards.
- A private room sent to the favourites: the request answers 200 and the
  Favourites listing does not hold the room.
- The owner of a private room reads `CanUseAi` as false on it.
- The app switched off through `PUT apps/e2e-rooms/enabled`: the section
  listing, the room and its folder information answer 404; the members,
  the keys of the room and its links answer 403; a rooms listing holds no
  private room; the root folders have no Private root; a private room
  creation answers 403, "Private rooms are turned off on this portal"; the
  caller's own keys answer 200. Switched on again, every request answers
  as before.

What the check adds to the read above: the removal and the reassignment of
a user's data both ask for a disabled account
(`RemoveUserDataController`, `ReassignController`), and the owner of a
private room can no longer be disabled through the API. A private room is
therefore kept, and named in `keptPrivateRoomIds`, only for an account
that was disabled before this change or by a directory synchronization.
Task 3.10 stays, for those accounts.

Added the same day, after the owner uploaded a text document into a
private room through the client:

- The file is stored under an opaque name with the encrypted flag. Its
  owner reads Rename, ReadHistory, EditHistory, Lock, CopyLink,
  CustomFilter and SubmitToFormGallery as false, and Comment, Review,
  Edit, Download, Move and Delete as true.
- A rename, a lock, the version history and a version comment of it each
  answer 403; the title, the lock state and the comment are unchanged.
- `openedit` answers `customization.ai.disabled: true`. Its
  `encryptionKeys` entry still carries the whole key record;
  `private-rooms-editor-contract` 10.6 has not landed.
- The key listing of the file holds the owner's key.

Not checked: the AI tab as the editor shows it, a session of the editor
open while the app is switched off, the client's own pages, and a portal
that is not standalone.

### Check on a portal that is not standalone, 2026-11-23

The test portal of the owner, DocSpace 4.1.0.12505 with Document Server
10.0.3.60, `standalone: false`. It runs the server of `release/v4.1.0`,
without the changes of the paired branch, so it shows the release as it
is and the client on a portal that is not standalone.

- `GET api/2.0/apps` lists `e2e-rooms`, enabled. Whether the production
  configuration lists it is not known from here.
- `PUT api/2.0/apps/e2e-rooms/enabled` is accepted on such a portal, from
  the portal owner. With the app off, the server of the release answers
  404 for the section listing and leaves the Private root out of the root
  folders, and still serves a private room by id, its members, its keys
  and the rooms listing with private rooms in it.
- The client with the app off: the page requests `GET api/2.0/apps` and
  does not use the answer. The Private item stays in the sidebar with its
  Beta badge, and the section opens and lists the rooms, since the list
  comes from the rooms listing (`files/rooms?searchArea=PrivateRooms`),
  which the release does not gate. Once
  `private-rooms-server-followups` 2.5 is on such a portal, that listing
  is empty and a room answers 404 while the item is still offered: what
  task 3.6 changes.
- The release as the baseline of tasks 3.2 and
  `private-rooms-server-hardening` 16.2: the owner reads Rename,
  ReadHistory, EditHistory, Lock, CopyLink, CustomFilter and
  SubmitToFormGallery as true on an encrypted file and `CanUseAi` as true
  on a private room, and `openedit` answers
  `customization.ai.disabled: false`.

The app was switched on again and the section answered as before.

## Goals / Non-Goals

**Goals:**

- Every server behaviour asked has one task with the behaviour and an
  acceptance check, or a record that it needs none.

**Non-Goals:**

- Choosing the implementation for the backend team.
- Client work before the server merges.

## Decisions

1. **One change for all new server tasks.** They share an owner and a
   reader. Tasks that already exist elsewhere keep their place and only
   gain the observation.
2. **The delta states the behaviour asked, as MODIFIED requirements where
   the main spec already has a requirement on the subject.** The two meet
   when the work lands and this change is archived. Alternative: editing
   the main spec now. Rejected: it would describe a server that does not
   exist.
3. **Comment and review stay granted on an encrypted file (decided by the
   owner on 2026-11-11).** They are
   editor permissions for work inside the encrypted document, which the
   server does not need to read. The rights of the operations that do not
   work on encrypted content are reported as false.
4. **Questions are tasks too.** A behaviour is asked only after the
   server has been read or the backend team has answered. The access and
   the keys of a user turned into a guest and the routes behind the app
   switch were such questions until 2026-11-16 (decisions 6 and 7).
5. **A client task follows each server task that changes an answer.** It
   mirrors the merged behaviour in the mocks with contract cases and
   removes what the client no longer needs, on the pattern of
   `private-rooms-server-hardening` 16.1 and 16.2.

6. **A user turned into a guest loses the private rooms and the keys
   (decided by the owner on 2026-11-16).** The type change passes the
   private rooms the user owns to the new owner, removes the user's share
   in every private room, which removes the wrapped file keys, and then
   deletes the stored key pair. What is expected afterwards: the
   guest is in no private room and opens no encrypted file; the guest holds
   no key, so the key check refuses an invitation with no rule about guests;
   the rooms the user owned belong to the new owner, without the old owner
   among the members; and a guest made a user again starts with no key,
   creates one and is invited again. Alternative: keep the keys and refuse
   a guest by a rule of its own. Rejected: the main spec already says a
   guest holds no encryption key.

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
   a user without a key gives access to nobody, so the answer of the
   request and the members of the room always agree. A private
   room and its folders stay out of the favourites as an encrypted file
   does, so a private room is listed in the Private section only.
   Alternative for the invitation: add the
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
- [The tasks age while the server moves] → Each Backend task states the
  behaviour asked and its acceptance, which do not depend on the server's
  code.

## Open Questions

- Whether the server applies task 1.6 once to the guests who were users
  before it lands, with the change or by a migration, is for the backend
  team to say when it takes 1.6.
