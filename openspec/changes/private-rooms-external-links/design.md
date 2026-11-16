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
  cookie for the session afterwards. The link keeps its password as a
  signature made with a server key (`CreatePasswordKeyAsync`, line 170),
  which the server reads back (`GetPasswordAsync`, line 177). The server
  therefore knows the password of an ordinary link.
- **Serving a file.** The file handler checks the key of the request
  (`FileHandler.CheckLinkAsync`,
  `products/ASC.Files/Core/HttpHandlers/FileHandler.ashx.cs`, line 730)
  and the right to download of the file, and serves the stored file.
- **Editor.** `openedit` is open to a visitor who is not signed in
  (`EditorController`, `[AllowAnonymous]`). The configuration takes the
  visitor's link from the share record of the file and puts a share key
  into the callback address, with the link's password in it
  (`Configuration.cs`, lines 308-317).
- **File keys.** A wrapped file key is a row of user id, public key id,
  file id and the wrap (`products/ASC.Files/Core/Core/EF/DbFileKeys.cs`).
  A link id is a Guid as a user id is.

What follows for this change:

- A private Virtual Data Room gives links to DocSpace users only, and a
  private Collaboration room or Virtual Data Room no link to the room
  itself. The delta of `room-membership` says so.
- The password of a link of a private item must not take the path of an
  ordinary link's password, which the server can read back. It stays in
  the browser, mixed into the sealing key and the proof (decision 2); the
  server gets a flag that a password is needed and nothing else.
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
