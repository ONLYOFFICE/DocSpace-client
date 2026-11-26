# Design

## Context

See proposal.md for the motivation. No stashed design document covers
external links; the feature was ruled out in version 1.

Reference for the approach, not for the interface or the roles: Proton
Drive and Proton Docs, as their own pages describe them (read on
2026-11-16). The key of a share is encrypted with a password tied to the
address of the link, made by the client or chosen by the user; the server
stores the encrypted key and the address and never gets the password; a
link can carry an end date and a password and is opened without an
account.

Client, as the main specs describe it:

- The key of a file is wrapped once for each member with authenticated
  HPKE under the sender's identity key; the wrap binds the sender id, the
  recipient id and the file id (`private-rooms/encryption-core`).
- A member who lacks a wrap gets it from another member by the backfill
  (`private-rooms/room-membership`).
- No link of any kind is offered for a private room, a folder or a file of
  one, and the Share tab is hidden for them.

Server, `../server` at `6fb6dfb17a`, read on 2026-11-16:

- `FileSharingAceHelper.SetAceObjectAsync`
  (`products/ASC.Files/Core/Utils/FileSharing.cs`, lines 107-113) refuses
  every link with an access in a private room, with the comment that
  somebody who enters through a link holds no key.
- An external link is a share record of a link subject with
  `FileShareOptions` (`products/ASC.Files/Core/Core/Security/FileShareOptions.cs`):
  a title, an end date, a password, a download ban, an internal flag and a
  use limit. `ExternalShare`
  (`products/ASC.Files/Core/Core/Security/ExternalShare.cs`) validates a
  link and its password and keeps the session of a visitor without an
  account.
- The accesses a link can carry are `FileShare.Editing`, `FillForms`,
  `Review`, `Comment`, `Read` and `None` (`FileSecurity.DefaultFileAccess`,
  `products/ASC.Files/Core/Core/Security/FileSecurity.cs`, line 80), for
  the primary and for an additional link alike.
- The number of links is limited by tables of the same file: a room of the
  Custom type holds one primary and five additional links (line 115), a
  file or a folder up to six (line 144). The Editing and the virtual data
  room types have no entry for links of the room itself, so only their
  files and folders can be linked.
- The storage service lets a caller through who is signed in or holds a
  link (`FileStorageService.DemandAuthenticatedOrLinkAsync`,
  `products/ASC.Files/Core/Core/FileStorageService.cs`, line 207).
- The removal of a member's share removes the member's wrapped file keys
  (`FileSharingAceHelper.RevokeFileKeysAsync`).
### Server read for task 0.2

`../server` at `0396e6910f`, read on 2026-11-16. Since that pull the
server carries OpenSpec specs of its own (`../server/openspec/specs`),
among them `shared-links` and `private-rooms`; they are the backend
team's statement of the behaviour and were read next to the code.

- **Where a link is allowed** (`shared-links`, "Entities that accept a
  shared link" and "Link count limits"). A Custom room takes one primary
  and up to five additional links to the room, and up to six additional
  links to a folder or a file. A Collaboration room and a Virtual Data
  Room take no link to the room itself, and up to six to a folder or a
  file. A private room is of one of these three types (`private-rooms`,
  "Room types that can be private").
- **Settings by room type** ("Link settings by room type"). A Custom and a
  Collaboration room offer the access, the "who has access" choice, a
  password, the download ban and a lifetime. In a Virtual Data Room the
  audience is fixed to DocSpace users only, whatever the request asks.
- **Who manages links** ("Roles that manage links"). The room owner and
  the room managers only, for the room and for the files and folders in
  it.
- **A folder link and a file link are separate** ("Room links and item
  links are independent"). A folder link opens the folder and every file
  in it with the folder link's right; a file link opens that file only.
- **Today's rule for private rooms** (`private-rooms`, "No links to a
  private room"): `setRoomLink` answers 403 for an external and for an
  invitation link, and revoking stays possible.
- **Address and key.** `ExternalShare.GetLinkDataAsync`
  (`products/ASC.Files/Core/Core/Security/ExternalShare.cs`, line 53)
  builds `rooms/share?key=<key>` for a room or a folder and a preview or
  download address with `share=<key>` for a file. The key is the link id
  signed by the server (`CreateShareKeyAsync`, line 333). A request
  carries it in a header or in the `share` query (`GetKey`, line 182).
- **Validation.** `GET files/share/{key}`
  (`SecurityController.GetExternalShareData`, anonymous) and
  `ExternalLinkHelper.ValidateAsync` answer the status of the link, Ok,
  Invalid, Expired, RequiredPassword, InvalidPassword or
  ExternalAccessDenied, with its access and the entry; an internal link
  answers ExternalAccessDenied to a visitor who is not signed in
  (`ExternalShare.ValidateRecordAsync`, line 98).
- **Password.** `POST files/share/{key}/password` checks it and counts
  wrong attempts per link and address (`BruteForceLoginManager`), with a
  cookie for the session afterwards.
- **Serving a file.** The file handler checks the key of the request
  (`FileHandler.CheckLinkAsync`,
  `products/ASC.Files/Core/HttpHandlers/FileHandler.ashx.cs`, line 730)
  and the right to download of the file, and serves the stored file.
- **Editor.** `openedit` is open to a visitor who is not signed in
  (`EditorController`, `[AllowAnonymous]`). The configuration takes the
  visitor's link from the share record of the file and puts a share key
  into the callback address (`Configuration.cs`, lines 308-317).
- **File keys.** A wrapped file key is a row of user id, public key id,
  file id and the wrap (`products/ASC.Files/Core/Core/EF/DbFileKeys.cs`).
  A link id is a Guid as a user id is.

What follows for this change:

- A private Virtual Data Room gives links to DocSpace users only, and a
  private Collaboration room or Virtual Data Room no link to the room
  itself. The delta of `room-membership` says so.
- The password of a link of a private item stays in the browser, mixed
  into the sealing key and the proof (decision 2); the server gets a flag
  that a password is needed and nothing else.
- The proof of decision 4 can ride on what exists: the share key names
  the link, the proof goes where the password goes today, and the counter
  of wrong attempts is the same.
- A wrap for a link fits the row of a file key with the link id in the
  place of the user id; the backend team says whether it reuses the row.
- A private Virtual Data Room whose room-wide restriction on downloading
  is on: a visitor has to fetch the ciphertext to see anything, and
  `shared-links` ("Deny-download on links combines with the VDR room
  setting") refuses the download through a link there. Settled by decision
  17: no link while the restriction is on.
- The hand-over goes to the backend team as a change of its own specs,
  `private-rooms` ("No links to a private room") and `shared-links`,
  since its repository now routes behaviour changes through them.
  Handed over by the owner on 2026-11-16 as the draft under
  `server-change/` of this change; no reply is recorded yet.

### Server read at `39f71456b0` (2026-11-23)

The backend team took the draft of `server-change/` into a change of its
own specs, `private-rooms-external-links` in `../server`, on the branch
`feature/private-rooms-external-links`, which this repository follows on a
branch of the same name. Its first iteration is the access to view only;
commenting, reviewing and editing are left to a later change of its
specs. Three commits carry code: `7931999802`, `d252914f9f` and
`d2ade494d7`, with a part of the serving in `a77956ac1c`. Read in the
source; its tests are in
`products/ASC.Files/Tests/Tests/08_Private/ExternalLinks`.

What the server does at this commit:

- **Fields.** `setRoomLink`, `setFileExternalLink`,
  `setFolderPrimaryExternalLink`, `createFilePrimaryExternalLink` and
  `createFolderPrimaryExternalLink` take `linkPublicKey`,
  `linkPrivateKeyEnc`, `linkProofHash` and `passwordRequired`
  (`RoomLinkRequestDto`, `FileLinkRequestDto`, `FolderLinkRequestDto`). A
  link answers `passwordRequired` and `linkPublicKey` inside `sharedLink`
  (`FileShareDto`); the sealed key and the proof hash are never answered.
  The names are the ones this change proposed.
- **Sizes** (`LinkKeyMaterial.Validate`). `linkPublicKey` and
  `linkProofHash` are base64 of exactly 32 bytes in the canonical form,
  with padding, and nothing else; `linkPrivateKeyEnc` is not empty and at
  most 4096 characters. Anything else answers 400. A request that carries
  none of the three is a link without key material.
- **Checks before the first write**
  (`FileSharingAceHelper.ValidatePrivateLinksAsync`). 403: a caller who may
  not change the access of the room; a subject that is not an external
  link; a new link without key material; an access other than reading;
  `denyDownload`; a link without a password that is not a link to one
  file with an end date. 400: a malformed field; `password`; another
  `linkPublicKey` for a link that has one; a new link whose id is held by
  a user, a group, a share record or another link's key material.
  `passwordRequired` left out counts as true for a new link and keeps the
  stored value of an existing one.
- **Who manages** (`FileSharingHelper.CanSetLinkAsync`,
  `FileSharing.CanSeeSharesAsync`). A request of external links only on a
  file or a folder of a private room is checked against the room, so the
  owner and the room managers set, read and revoke the links of its items;
  a member with a lower role reads an empty list. A member share on such
  an item is still refused.
- **Limits** (`FileSecurity.GetLinksSettings`). An entry of a private room
  reports no link settings to a listing, so no count of links comes with
  an entry; only the link-setting path asks for the limit of a room of
  the same type.
- **How many, and where** (read again on 2026-11-23 for task 3.2,
  `FileSecurity.GetLinksSettings` and its two tables). To the room itself:
  a Custom room takes one primary and five additional links; a
  Collaboration room and a Virtual Data Room have no entry in the table,
  so a link to such a room is refused. To a folder or a file of a Custom,
  a Collaboration or a Virtual Data room: six additional links, and the
  same six for a primary one, since the table names none and the
  additional limit stands in. The count is checked only when a link is
  made. Over the limit the request answers 403 with "The maximum number of
  links may not exceed N": `SetAceObjectAsync` skips the link with a
  warning and `SetAceLinkAsync` turns the warning into an
  `InvalidOperationException`.
- **Audience** (`FileSharingAceHelper.SetAceObjectAsync`). In a Virtual
  Data Room the internal flag of a link is set to true whatever the
  request sends; elsewhere it is taken as sent.
- **Storage.** Two tables, the key material of a link and the wraps of a
  link's secret per user, both left out of a backup. The key material is
  written before the share record and put back when the record fails;
  every write of a private link holds a lock of the link.
- **Revocation and deletion.** A revocation deletes the key material
  before the share record. A file, a folder with its subtree and a
  private room deleted for good lose the key material and the secret
  wraps of their links in the same transaction; in the Trash they keep
  them.
- **Serving** (`ExternalShare.ValidateRecordAsync`). A link that stores
  `passwordRequired`, which only a link of a private item does, answers
  RequiredPassword, also with `passwordRequired: false`. No proof is
  accepted yet, so no such link opens anything.
- **Address** (`ExternalShare.GetLinkDataAsync`). Unchanged: a link of a
  private item gets the address of an ordinary one, by the kind of the
  item. Decision 23 asks for one route.

Not on the server yet, by its tasks: the proof in
`applyExternalSharePassword` and the private flag of
`getExternalShareData`, the read-only link session and the view mode of
the editor for it, links as recipients of file keys, the wraps of a
link's secret, a new password, the portal setting and the gates, the
audit of an opening, the address without a fragment and the restricted
Content-Security-Policy. The names `proof`, `linkSecretWraps` and `isLink`
are its proposals; no code carries them.

What follows for this change:

- This change ends at viewing as well (decision 24).
- The existing pages of a link (`PublicRoom`, `PublicPreview`, the SDK
  validation middleware and the root page of the doceditor) answer
  RequiredPassword with the form of an ordinary link, which sends
  `password`. For a link of a private item they send the visitor to the
  page of decision 23 instead (task 4.3).
- Code that reads the keys of a room counts every entry as a member
  (`packages/shared/services/private-room`, the desktop bridge). It skips
  the entries of links from the commit that mirrors them (task 3.1).
- The mark of active links (decision 12) has no source in a listing. A
  count of the working links of an entry is asked of the backend team
  with the reply to its change.

### Stand check of 2026-11-23

The stand and the accounts of `private-rooms-server-followups`, design.md
"Stand check of 2026-11-23". The links were set through the API on a
private Custom room without files and on a folder of it, with random
values of the right sizes as key material.

- A room link without key material, with the access to edit, with the
  download ban, and one that asks for no password: 403. With a password,
  and with a public key of 31 bytes: 400, the message naming the field.
- A room link with key material and no `passwordRequired`: stored, and
  answered with `passwordRequired: true`, `linkPublicKey`, and neither the
  sealed key nor the proof hash. A folder link the same; a folder link
  that asks for no password, with an end date: 403.
- `shareLink` of both is the short address, `<portal>/s/<code>`. It
  redirects to `rooms/share?key=<key>`, and a fragment added to the short
  address is not sent to the server. The client therefore appends the
  secret to the short address it is given; decision 23 changes where the
  redirect lands.
- The room and the folder that hold a link report `shared` and
  `sharedExternal` as true in their own entry. That is a source for the
  mark of decision 12 without a count; the count is still asked.
- `GET files/share/{key}` without signing in answers the status
  RequiredPassword (3) for the link, and `POST files/share/{key}/password`
  with an ordinary password answers the same status. After the link was
  revoked the status is Invalid (1) and the room lists no link.

Added the same day, on a text document the owner uploaded into a private
room through the client:

- A link of the file that asks for no password: 403 without an end date,
  stored with one, with `passwordRequired: false`. Removing the end date
  from it and raising its access to editing each answer 403.
- Its short address redirects to the editor page,
  `/doceditor?fileid=<id>&share=<key>`, which answers its ordinary page.
  Decision 23 moves it to `share/private`.
- Without a proof the status of the link is RequiredPassword, and the
  download of the file by the key of the link answers 403.
- The file reports `shared` and `sharedExternal` as true while it holds
  the link, and false before; after the revocation the file lists no link
  and the status is Invalid.

Not checked: the pages a visitor sees.

### Stand check of 2026-11-24

A local stand of the owner after the release was merged into both
branches: `../server` at `b708cf9799`, a standalone portal with a new
database, Document Server 10.0.3.58. A room admin with a key owns a private
Custom room with two files and a folder; the portal owner is a member with
the Content creator role.

What the server answers for the entries, which task 3.2 builds on:

- A file and a folder of the room carry `canShare: false` and no
  `shareSettings` for the owner of the room as for any member, and the
  folder reports `security.EditAccess: false`. Nothing with the entry says
  who manages its links; the room's `security.EditAccess` does (true for the
  owner, false for the Content creator).
- `availableShareRights` of the file is Read and None for the owner and
  Read for the member; the folder lists every access (Editing, Review,
  Comment, Read, None), though only reading is accepted.
- A link answers `canEditInternal` and `canEditExpirationDate` true, and
  `canRevoke`, `canEditAccess` and `isOwner` false, also to the owner of
  the room who made it. `canEditDenyDownload` is true, though the download
  ban is refused.
- A primary link is made by the same request as an additional one, with
  `primary: true`; the request that makes the primary link of an ordinary
  item on first read is not used. A link to the file without a password
  and without an end date, and an end date cleared on such a link: 403.
- After a link is made the file reports `shared: true` and
  `sharedExternal: true`.

In the interface, as the room admin: the Share tab of a file lists its
links with the access shown as viewing; a new link is made at once with
seven days and its address copied; a revocation asks first and removes the
link. The Share tab of a folder opens the link settings for a new link,
with the password asked and no download ban, and the link is made with it.

The Members tab of the room, as the room admin: the block of links with
a control to create one; the link settings ask for the password, and the
link is made, listed with its lock and copied; the revocation asks first
and the room lists no link after it (`GET files/rooms/{id}/links`). The
room reports no `shareSettings` either.

The lists, as the room admin: a room with a link reports `shared: true`,
as a file and a folder do; `GET files/rooms/{id}/link`, the request an
ordinary room answers with its primary link, answers 403 for a private
room.

The archive. With the room archived its `security.EditAccess` is false for
its owner as well, and a new link is refused with 403. The links of the
room itself are still listed (`GET files/rooms/{id}/links`), with
`isExpired: false`; the links of a file read as an empty list, though the
file reports `shared: true`. After the room is restored the links of the
room and of the file are listed again. So the links of a room could be
shown as not working while it is archived, and those of its files and
folders cannot: the client is not given them.

To ask of the backend team: a right with the entry that says the caller
manages its links, and the link settings (the limits) of an entry of a
private room; the folder's `availableShareRights` narrowed to reading;
`canEditDenyDownload` false for a link of a private item; the links of
the files and folders of an archived room listed to who managed them, if
they are to be shown as not working.

### Server read at `92c9b60f23` (2026-11-26)

Two commits of the paired branch since the read at `39f71456b0`:
`0b45c6d101` (2026-11-24) and `92c9b60f23` (2026-11-25). The backend
team's summary of them for the client was read first, then every point
of it in the source, through CodeGraph and the diff of the two commits.
Its tests were not read one by one.

What the server does at this commit:

- **Address** (`ExternalShare.GetLinkDataAsync`). A link of a private
  item gets `share/private?key=<key>`, with `&folder=<id>` for a folder
  that is not a room, as decision 23 asked. A short address whose code is
  unknown redirects to `<portal>/#` (`UrlShortRewriter`), so that a
  fragment is not carried to a page of the portal.
- **Status of a link** (`ExternalLinkHelper.ValidateAsync`,
  `ExternalShare.ValidateRecordAsync`). The answer of `GET
  files/share/{key}` carries `isPrivate: true` and `passwordRequired`
  for a link of a private item, whatever its status. Without a proof and
  without a session the status is RequiredPassword, also for a link
  that asks for no password.
- **Proof** (`ApplyExternalSharePassword`,
  `ExternalShare.ValidatePrivateLinkAsync`, `LinkKeyMaterial.ProofMatches`).
  `POST files/share/{key}/password` takes `proof`, the ordinary base64 of
  32 bytes, and compares its SHA-256 with the stored hash in constant
  time; a value that does not decode to 32 bytes does not match.
  `password` is not looked at for such a link. A match sets the session
  cookie of the link and answers Ok; a mismatch clears the cookie and
  answers InvalidPassword, counted by the limiter of wrong passwords per
  link and address.
- **The sealed key comes with the proof only.** `linkPrivateKeyEnc` is in
  the answer of the request whose proof matched, and in no other: a
  request of the open session answers Ok without it. The audit event
  `PrivateLinkOpened` is written with that answer, once per opening and
  not per read.
- **Gates** (`ExternalShare.IsPrivateLinkOpenAsync`,
  `IsPrivateLinkAllowedIn`, `FileSharingAceHelper.ValidatePrivateLinksAsync`).
  A link is closed while the portal setting is off, the `e2e-rooms` app
  is off, the room is archived, or the room is a Virtual Data Room with
  the room-wide restriction on downloading. A closed link answers
  Invalid to a visitor and is not deleted; setting or changing a link
  answers 403. The check of the gates in `ValidatePrivateLinksAsync`
  covers only requests with an access, so it does not refuse a
  revocation; the summary states 403 for a revocation in an archived
  room and with the app off, which was not traced in the source.
- **Portal setting** (`SettingsController.PrivateRoomLinks`,
  `FilesSettingsHelper.ChangePrivateRoomLinksSettingsAsync`). `PUT
  files/settings/external/private` with `{ "set": bool }` answers the
  stored value, for a DocSpace admin only. `GET files/settings` answers
  `privateRoomLinks`. A change emits `s:change-private-room-links-settings`
  with `{ enabled }` to the quota room of the portal, the room of the
  event of the external sharing setting.
- **Key fields of a request** (`ValidatePrivateLinksAsync`,
  `SetPrivateLinkAsync`). As before, and: a change of `passwordRequired`
  on an existing link without the three key fields answers 400; a change
  that meets a revocation of the same link answers 404; `linkSecretWraps`
  may be sent alone for an existing link.
- **Wraps of the secret** (`LinkSecretWrapRequest`, `LinkSecretWrapDto`,
  `FileSharing`, `FileSharingHelper.GetLinkManagersAsync`). A request
  carries `linkSecretWraps`, one `{ userId, publicKeyId, wrap }` per
  user, the wrap at most 4096 characters; a wrap for a user who is not
  the owner or a room manager answers 400. A link answers, inside
  `sharedTo`, `linkSecretWrap` (`{ publicKeyId, wrap }` made for the
  caller, or null) and `managersWithoutLinkSecretWrap`, the ids of the
  owner and the managers without one, in ascending order. The wraps of a
  user are deleted when the user leaves the room, is removed, gets a
  role below room manager, or stops being the owner with a lower role.
- **Links among the keys of a room**
  (`EncryptionKeyPairDtoHelper`, `EncryptionKeyMapper.ToLinkKey`). `GET
  privacyroom/{roomId}/access` adds one entry per working link of the
  room or of an item in it: `isLink: true`, `id` and `userId` the id of
  the link, `publicKey` its public key, no `privateKeyEnc`. The entry
  does not name the item the link is set on. Revoked and expired links
  are left out; a link closed by a gate is not.
- **Wrap of a file key for a link**
  (`FileStorageService.GetCoveringLinksAsync`). `PUT files/{fileId}/access`
  stores a wrap for a working link that covers the file, set on the
  file, on a folder above it or on the room; any other link id comes
  back in `skippedUserIds`.
- **Missing wraps.** `GET privacyroom/{roomId}/access/missing` without
  `userIds` checks the owner, the members and every working link; an
  entry of a link carries `isLink: true` and lists only the encrypted
  files the link covers.
- **Keys of a file for a visitor**
  (`EncryptionKeyPairDtoHelper.GetKeyPairAsync`,
  `GetLinkSessionKeysAsync`). `GET files/file/{fileId}/publickeys` is
  open without signing in. A caller who is not signed in and names no
  link is refused with 403 before the file is looked up. A visitor of a
  link who is not a member of the room, signed in or not, gets the
  public keys of the members without `privateKeyEnc`, and one entry of
  the link with `isLink: true` and `fileKeyEnc`, the wrap made for the
  link or null when no member has made one. A file the link does not
  cover answers 403. A member of the room who comes with a link gets
  the answer of a member.
- **Count of links** (`FileEntryDtoHelper.GetPrivateLinksCountAsync`).
  A room, a folder and a file answer `externalLinksCount`: the working
  links set on the entry itself, for the owner and the room managers of
  a private room and null for anybody else and outside private rooms. A
  link closed by a gate is counted, and the entries of an archived
  private room carry the count.
- **Restricted policy** (`CspSettingsHelper.CreateHeaderAsync`, `CspDto`).
  `GET` and `POST security/csp` answer `privateLinkHeader`: the portal,
  its storage and the Document Server, without the allowed domains of
  the portal and without the integrations. The value is kept in the
  cache beside the full one, under the key of the host with `:private`
  appended.
- **Guests** (`UserController.UpdateMember`,
  `PrivateRoomAccountHelper.DemandNoPrivateRoomOwnedAsync`,
  `LeavePrivateRoomsAsync`). `PUT people/{userId}` with `isUser: true`
  answers 403 with `PrivateRoomOwnershipException` for an owner of a
  private room and saves nothing; any other user who becomes a guest
  leaves every private room and loses the wraps of file keys and the key
  pair, and a repeat of the call for a guest finishes an interrupted
  exit. This is not about links and belongs to
  `private-rooms-server-followups`.

Not on the server: the regenerated OpenAPI documents and SDK; the
restricted policy sent by the proxy, which is task 4.4 here; the editor
for a visitor, which waits for the Document Server team (task 0.3).

What follows for this change:

- The asks of 2026-11-23 and 2026-11-24 are answered: the address
  (decision 23), the count of links (decision 12) and the public key of
  the member who made a wrap (decision 26, as the members' keys served
  with the wrap). `externalLinksCount` is not null only for who manages
  the links, so it also tells that with the entry itself.
- The page of a visitor sends the proof at every load, since only that
  answer carries the sealed key; a link with a password asks for the
  password again after a reload (task 4.2).
- The requirement of the `server-contract` delta "A link is served only
  against a proof of its secret" has the sealed key, the wraps and the
  content given to a request that carries the proof. The server gives
  the sealed key to that request and the wraps and the content to the
  session it opens. To revise with task 4.1.
- The client reads the keys of a room and the missing wraps with every
  entry taken for a member (`room-member-keys.ts`, `room-member-flows.ts`,
  `room-encryption.ts`, the upload orchestrator, the desktop bridge),
  and the server now lists links there. The second part of task 3.1
  comes first.
- An uploader cannot tell from the keys of a room which links cover the
  file, and wraps for every link of the room; the server skips the
  others. To ask of the backend team: the item of the link in its entry.
- The switch of the portal setting for an administrator had no
  requirement and no task here. Decided by the owner on 2026-11-26: this
  change holds it, next to the setting of external links (task 3.6, the
  `room-membership` delta). The same day: the item of a link in its
  entry is asked of the backend team and not waited for, and the page of
  a visitor is started on the components of the public room without
  waiting for the screens of task 0.4.

## Goals / Non-Goals

**Goals:**

- A visitor reads, and with the access to do so comments on, reviews or
  edits, an
  encrypted document, and the server holds no key that opens it.
- The work reuses the wrap of a file key for a recipient, the backfill and
  the revocation that exist.

**Non-Goals:**

- Protecting a document from a person who holds its link.
- Choosing the storage and the route names for the backend team.

## Decisions

The decisions the owner took on 2026-11-16 are recorded in proposal.md;
none is open. The technical decisions below follow from them.

1. **A link is a recipient with a key pair of its own.** The browser of
   the creator makes an X25519 key pair for the link and wraps the file
   keys for its public key as it does for a member, with the id of the
   link in the place of the recipient id. Alternative: the key of the file
   in the address. Rejected: it cannot be revoked without re-encrypting
   the file, and it does not cover a folder or a room, where files are
   added later.
2. **The address carries a random secret after `#`, and the server stores
   the private key of the link sealed under it.** The secret is 256 random
   bits. Two values are derived from it under separate labels: one seals
   the private key of the link in an envelope of the kind the identity key
   uses, the other is shown to the server as the proof of step 4. With a
   password, the password goes through the key derivation of a passphrase
   and is mixed into both. Alternative: the private key itself in the
   address. Rejected: a password could not be added or changed without a
   new address, and the proof would need a second secret anyway.
3. **Every uploader wraps for the links that cover the file.** The public
   keys of the links of a room come with the public keys of its members,
   and the backfill covers a file a link lacks. A file uploaded by a
   member who never saw a link is therefore not readable through it until
   another member's browser has wrapped it, as for a late member.
4. **The server serves a link only to a visitor who proves the secret.**
   The visitor sends the proof value derived in step 2; the server keeps
   its hash and compares. It never gets the value that opens the envelope.
   Without the proof it answers with nothing of the link, so a known link
   id gives no ciphertext to try a password on. Alternative: serve the
   ciphertext to anybody who names the link. Rejected: with a password as
   the only unknown the stored envelope could be tried offline.
5. **Viewing first, the other accesses second.** With the access to view
   a visitor gets the decrypted file in the page: a preview where the
   browser can show it, a download otherwise, and the editor in view mode
   for a document. Commenting, reviewing and editing all happen inside the
   encrypted document in the editor, so they come together; a save writes
   the file under the same file key, and no wrap changes. They start only
   after `private-rooms-editor-contract` 6.2 and the Document Server
   team's answer on a visitor's session.
6. **A download ban is not offered.** The visitor's browser holds the
   decrypted file whatever the interface hides, so the option of ordinary
   links would promise what encryption cannot keep.
7. **The link model is the portal's own (decided by the owner on
   2026-11-16).** A link of a private item is the share record of an
   ordinary link with three more fields, the public key, the sealed
   private key and the proof hash, and it keeps the primary and additional
   kinds, their limits, the title, the end date, the password, the limit
   of uses and the internal flag. The access to fill forms is left out,
   since forms are not filled in private rooms. A visitor of an internal
   link is signed in and may hold a key of their own; the file is still
   read with the key of the link, and the visitor does not become a
   member. Alternative: two roles of its own, as Proton Docs has.
   Rejected: the interface and the server already carry the richer model,
   and a second one would have to be explained next to it.
8. **A portal setting switches external links of private rooms.** It is
   read with the settings and applied on the server; the interface hides
   the control when it is off, and existing links stop being served.
9. **The behaviour asked of the server is a delta of `server-contract`.**
   The main spec keeps describing the server as it is until the work
   lands, as in `private-rooms-server-followups` (decision 2).

10. **The password rule is enforced on the server and shown in the
    interface.** The server refuses a link without a password unless it is
    a link to one file with the access to view and an end date; the
    interface asks for the password, or for the end date, before it sends.
    The end date of such a link is preset to seven days from its creation
    (decided by the owner on 2026-11-16); the member can set another date
    and cannot leave it empty.
11. **The secret stays in the address, as at Proton (decided by the owner
    on 2026-11-16).** The page of a visitor reads the part after `#` and
    leaves it there, so a reload or a bookmark opens the item again. It
    writes the secret to no log, storage or statistics and loads no script
    from an origin other than the portal and its Document Server, whose
    editor a document opens in. Alternative, written first and dropped:
    take the secret out of the address bar and keep it in memory, so that
    it does not stay in the history of the browser. Rejected by the owner:
    a visitor who reloads the page would have to find the address again,
    and the services people already use keep it in the address.
12. **A private item shows its active links.** A room, a folder or a file
    with a link that still works carries a mark with the number of links,
    for the members who may see the room's access. A user who sees the
    mark knows the item can be read from outside before reading the
    promise anywhere.
13. **The texts follow the promise of proposal.md.** They go through the
    translations as Common keys, with the name of the service passed as a
    variable. No text says "only members", "nobody else" or
    "zero-knowledge" about an item that can carry a link.

14. **The secret of a link is wrapped for those who manage links (decided
    by the owner on 2026-11-16).** The server cannot show an address
    again, since it never has the part after `#`. The creator's browser
    wraps the secret for the public key of the room's owner and of each
    room manager, as it wraps a file key; any of them unwraps it to copy
    the address. A manager named later gets the wrap from the browser of
    another one, by the same backfill that covers a late member, and the
    wraps of a member who stops managing are deleted. Alternatives: the
    creator only, or the address shown once. Rejected by the owner: an
    ordinary link can be copied by every manager, and a link nobody else
    can hand out again would be made anew each time.
15. **A member who knew the addresses leaves: the links stay and the
    interface warns (decided by the owner on 2026-11-16).** Removing the
    member, or taking the manager role away, shows the links that member
    could copy and offers to revoke them in the same step. With decision
    14 these are all the links of the room. Alternative: revoke them
    without asking. Rejected by the owner: the recipients would lose
    access for a change they have nothing to do with.
16. **A password is replaced, never read (decided by the owner on
    2026-11-16).** A new password seals the private key of the link again
    and makes a new proof from the same secret, so the address does not
    change and the old password stops working. A forgotten password is
    replaced the same way by anybody who manages links.
17. **No link in a private Virtual Data Room that restricts downloading
    (decided by the owner on 2026-11-16).** While the room-wide
    restriction is on, a link cannot be created there and the existing
    ones are not served; they work again when it is turned off.
18. **The proof is a value derived from the secret.** It is not a
    password-authenticated exchange: the secret has 256 random bits, so
    the proof cannot be guessed, and a plain comparison of its hash is
    enough.

19. **A link to many files is not handed out half made.** Wrapping for a
    link costs what inviting a member costs: one unwrap and one wrap for
    each file it covers. The address of a link to a folder or a room is
    offered only when every file has its wrap, and an interrupted run is
    continued by any manager, with the backfill that exists. A link to
    one file is ready at once.
20. **The secret is 43 characters of URL-safe base64 without padding, and
    the page checks it before it asks the server.** A message or a mail
    client that cuts an address, or reads an underscore as markup, would
    otherwise end in a failed decryption that looks like a wrong
    password. The whole address stays near 200 characters, and near 70 in
    its shortened form, to which the client appends the secret: the
    server's short address redirects, and a browser keeps the part after
    `#` across a redirect.
21. **In an archived private room links are not served**, as for an
    ordinary archived room, where the server answers a link as invalid.
    They work again after a restore.
22. **The SDK offers no links of private items in this change.** Its Share
    tab and menus stay as the main `sdk-surface` has them; the page of a
    visitor is the portal's own.
23. **Every link of a private item opens one page, `share/private`
    (decided by the owner on 2026-11-23).** The address the server builds
    is `share/private?key=<key>`, with `&folder=<id>` for a folder, for a
    room, a folder and a file alike; the client appends the secret after
    `#`. The server builds the address of an ordinary link by the kind of
    the item (`ExternalShare.GetLinkDataAsync`: `rooms/share`, the editor,
    `share/preview/<id>` or the download address of the file handler), and
    two of those cannot serve a private item: the download address hands
    out the stored file with no page to decrypt it, and the pages ordinary
    links use cannot take a Content-Security-Policy of their own. One
    route that no ordinary link uses lets the proxy send the restricted
    policy of the server's decision 11 by the path alone. Alternative:
    `private/share`. Rejected: `private/:room` of the client's routes
    takes it for a room, and the server builds the addresses of the
    Private section under the same prefix. The `location` of the route in
    `../buildtools` is added by the client team, on a branch of that
    repository.

24. **This change ends at the access to view (2026-11-23).** The backend
    team scoped its change to viewing, and the server refuses any other
    access of a link of a private item. Commenting, reviewing and editing
    through a link, which decision 5 placed second, move to a later
    change of both repositories; the deltas and the tasks here no longer
    hold them. A visitor still opens a document in the editor, in view
    mode, once the Document Server opens an encrypted document for a
    visitor without an account (task 0.3).
25. **How the two values are derived, and what the envelope is
    (2026-11-23, with task 2.1).** The input is the 32 bytes of the
    secret, followed, when the link has a password, by the password
    stretched with Argon2id under the parameters of a passphrase and a
    salt derived from the secret. HKDF-SHA256 over that input gives the
    sealing key under one label and the proof under another; the server
    stores SHA-256 of the proof. The private key of the link is sealed in
    the envelope of an identity key, opened by the sealing key in the
    place of a passphrase, with the smallest parameters its key derivation
    takes: the sealing key is uniform already, and the password has been
    stretched before it. Alternative: a format of its own for the sealed
    key. Rejected: the identity envelope already binds the public key and
    is parsed and tested; a second format would repeat it. The envelope is
    168 characters, well under the 4096 the server takes. The parameters
    of the password are fixed and not stored, so a change of them needs
    new labels. The proof is sent as base64 of its 32 bytes; the server
    names no encoding yet. A secret has one spelling: 43 characters hold
    two bits more than the secret, so the last character is one of the
    sixteen that leave them zero, and the check of decision 20 refuses the
    other three spellings of the same bytes as an address copied wrongly.
26. **A wrap for a link is the wrap of a member, unchanged (2026-11-23,
    with task 2.2).** `wrapDEK` and `unwrapDEK` take any X25519 public
    key and any id of 16 bytes as the recipient, and a link id is one, so
    wrapping for a link needs no code of its own: the link's public key
    and the link id stand where a member's stand. The wrap is bound to the
    sender, the recipient id and the file, so one made for a member, for
    another link, or under another link id does not open with the key of
    a link. What follows for the visitor: opening a wrap needs the public
    key and the id of the member who made it, and a visitor has no account
    to read them through. The server gives both with the wrap it serves
    to a link session (its task 3.4); the id is in the wrap itself. A
    visitor cannot check that key against anything, which is the limit
    the main spec already states for an active server.
27. **The restricted policy of the visitor's page has two lines, and both
    stay (decided by the owner on 2026-11-23).** The header comes from the
    proxy, with the value the server builds (the backend team's design
    decision 11; tasks 1.3 and 4.4). The page adds a policy of its own
    (task 4.5), so that the rule of decision 11 here, no script from
    another origin, holds on a portal whose proxy does not send the header
    and against a mistake in the page. Dropping the header and relying on
    the page not asking for such scripts was weighed and not taken: both
    specs ask for the header, and the page would then be its own only
    guard. How the page's policy reaches one route of a single-page client
    is open and is the first step of task 4.5.

28. **The key of a link is used as the server lists it (2026-11-26, with
    task 3.3).** A member's key is checked against the one seen before,
    and a change is put to the user. A link has no person to ask about and
    its public key does not change, since the server refuses another one
    for a link that has one; so the upload and the backfill wrap for the
    key the room lists, as they do for a member seen for the first time.
    Alternative: keep the key of every link in the store of seen keys.
    Rejected: a mismatch would open the dialog of a changed member key
    for something that is not a member.

29. **The wrap of a link's secret carries the private key of the link as
    well (2026-11-26, with task 3.4).** Decision 16 lets anybody who
    manages links set a new password, also when the old one is forgotten.
    A new password seals the same key pair again, and the server gives
    the sealed key only against the proof of the old password, so a
    manager has to hold the private key itself. The wrap a manager gets
    is therefore two wraps joined by a dot, the secret and the private
    key, each made as a file key is wrapped, under a label of its own and
    bound to the maker, the user and the id of the link in the place of a
    file id; the server stores the value as it comes. A manager is a
    member of the room and reads every file the link covers, so the
    private key gives them nothing they do not have. The id of the link
    is the server's, so the wrap is stored by a second request after the
    link is made. Alternative: wrap the secret alone and ask for the old
    password. Rejected: a forgotten password would end the address.

## Risks / Trade-offs

- [The address leaks: a forwarded message, a browser history, a
  screenshot] → The password rule of decision 10 bounds a link without a
  password to one file for a limited time, and the mark of decision 12
  and the audit trail show the links and every opening. The address stays
  in the history of the visitor's browser (decision 11); the end date and
  the revocation are what ends it.
- [A revoked link is taken for a recalled document] → The interface says
  at the revocation that what was opened stays with whoever opened it;
  the same limit holds for a removed member.
- [The server delivers the page that reads the secret] → The same trust as
  for a member, whose passphrase the page also reads; recorded in
  `private-rooms/encryption-core`.
- [The Document Server does not open an encrypted session for a visitor
  without an account] → Commenting, reviewing and editing do not ship;
  viewing does not depend on it for files the browser shows by itself.
- [An organisation cannot inspect what leaves through a link] → The portal
  setting of decision 8, the internal flag, which keeps a link to signed-in
  users of the portal, and the audit events of creation, opening and
  revocation.
- [Links of a room multiply the wraps of every upload] → The limits of
  decision 7 bound them: six links at most cover one file through the room
  and six more through the file itself and each folder above it.

## Migration Plan

No stored file changes. The portal setting ships on; a portal that never makes a link is unchanged. Switching the setting
off stops the links without deleting them.

## Open Questions

None that changes the specs. Field names, sizes and status codes are the
backend team's to set (`server-change/`).
