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
- Not read: how a file is served to a visitor of a link, and how the
  editor configuration is built for one. Task 0.2 reads both before the
  delta of `server-contract` is handed over.

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

Decisions 1 to 4 of proposal.md are recorded as taken, with their date, by
task 0.1 before any other task starts. The technical decisions below hold
for the assumed answers.

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

## Risks / Trade-offs

- [The address leaks: a forwarded message, a browser history, a
  screenshot] → Stated as a requirement and in the interface where the
  link is made; the password and the end date are offered there, and the
  audit trail shows every opening.
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

No stored file changes. The portal setting ships on, or off, as proposal
decision 2 says; a portal that never makes a link is unchanged. Switching the setting
off stops the links without deleting them.

## Open Questions

- Whether the proof of the secret is a plain derived value or a
  password-authenticated exchange as Proton uses. It changes the route and
  not the behaviour stated in the delta.
