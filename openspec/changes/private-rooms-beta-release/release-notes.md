# Private rooms (beta): release notes

Draft for the documentation team, written on 2026-11-03 from the main specs
and the open changes, revised on 2026-11-06 after the backend commits of
2026-11-04 and 2026-11-05 and the backend team's reply of 2026-11-05, and
on 2026-11-16 after a read of the server at `6fb6dfb17a` and a check of
the release stand. Release: `release/v4.1.0`.

Handover to the documentation team: not yet recorded.

## What ships

- Private rooms: end-to-end encrypted rooms. Files are encrypted in the
  browser before upload, and only invited members who hold an encryption key
  can read them.
- A Private section in the left sidebar and a Keys management tab in the
  user profile, both marked Beta. The Beta tooltip links to the forum and the
  support address for bug reports.

## Who sees it

- **SaaS:** every user. There is no switch during the beta.
- **Standalone:** every user while the Private app is on. An administrator
  switches the feature off and on with the Private app in the apps settings.
  While it is off:
  - the Private section, the Private app and the Private room type are gone;
  - existing private rooms are not listed anywhere; nothing is deleted,
    and they are back when the app is switched on again;
  - users who already hold a key keep the Keys management tab.
- **Embedding:** an embedded client frame (the host library's Manager
  mode) shows private rooms only when the host sets `privateRooms` in the
  frame configuration; host library 2.2.0 passes the property to the frame,
  although its types do not declare it yet. The SDK's own private pages
  under `/sdk/private` open only from pages of the portal's own origin in
  this version.

## Before users start

- **A lost key and recovery phrase mean lost files.** Nobody can decrypt the
  files without the user's key, including administrators and support. Users
  must keep the recovery phrase shown when the key is created.
- **External sign-in links.** On a server build before commit `3b9c527a6e`
  of 2026-11-04, saving an encryption key could remove the account's link
  to Google, SSO or another external sign-in provider
  (`private-rooms-server-hardening` 12.1). The server release that carries
  that commit keeps the links; a link lost before the fix is not restored.
  Users on an older server build should set a password before they create
  a key.
- **Backup and restore.** A portal backup does not include the file keys
  of private rooms or the users' key records
  (`private-rooms-server-hardening`, decision 9, found by the backend team
  on 2026-11-05). A portal restored from a backup keeps the encrypted
  files, but nobody can open them any more. A key exported before the
  backup does not bring that access back. Decided on 2026-11-06: the
  loss is accepted for now. The backup, automatic backup and restore
  settings show the warning while private rooms are available on the
  portal, and the restore confirmation repeats it
  (`private-rooms-server-hardening` 15.2, on the branch since 2026-11-06);
  keeping the keys in the backup is a later option.

## Known limitations of this version

From the SHALL NOT requirements of `private-rooms/encryption-core`:

- Removing a member does not re-encrypt the files. After removal, access ends
  because the server refuses it; content the member already downloaded or
  decrypted cannot be revoked.
- File names are encrypted, file extensions are not.
- Unlocked keys and passphrases are not synchronised between devices. On a
  new device the user enters the passphrase or the recovery phrase.
- Once a member's key is trusted on a device, that trust is not withdrawn.
  Each device keeps its own trust list; there is no key-transparency log.
- Each user has exactly one key.
- Cryptography runs in the page itself, not in a separate worker.
- The flags and the name length in the header of an encrypted file are not
  authenticated in this version. The file content cannot be changed without
  detection.

Outside the crypto core: room and folder names are not encrypted. The
server stores and indexes them in the clear and shows them to the room's
members; letters, pushes and the audit trail name a private room "Private
room" to everyone else.

What a private room and its files do not offer in this version, from
`private-rooms/file-operations` and `private-rooms/room-membership`:

- An encrypted file cannot be renamed. Its name is inside the encrypted
  file, so a new name means writing the file again; decided on 2026-11-16
  to leave it out of the beta.
- No version history, no favourites, no conversion and no "download as"
  for an encrypted file; a file that opens only after a conversion does not
  open. The download is offered twice: decrypted, and as stored.
- No links of any kind: no shared or public link to a private room, a
  folder or a file of one, and no sending by e-mail.
- Forms are not filled in a private room, and a private room is not a
  public room or a form-filling room.
- Groups and guests cannot be members. An invited person needs an
  encryption key first.
- A folder cannot be uploaded as a tree, and a folder cannot be moved or
  copied out of a private room. A file that leaves a private room is
  decrypted.
- No private room on third-party storage.

AI is not available in private rooms or on encrypted files: no AI chat in
the room or the section, no vectorization and no AI agents. The server has
no clear text to work with, and every AI path of the portal would carry it
through the portal. Kept by
decision of 2026-11-06; the options for a later integration are recorded
in `private-rooms-ai-integration`.

## Editors

- **Blocker found on the release stand (2026-11-06, Document Server
  10.0.3.19):** a document created in a private room opens and saves, but
  cannot be reopened after that save while the Document Server still holds
  its editing session (the editor reports error -82). Known as
  `private-rooms-editor-contract` 6.2, fixed together with the Document
  Server team; the beta must not ship with it. Seen again on 2026-11-16
  with Document Server 10.0.3.40: a text document saved and closed did not
  open for editing a minute later and opened for viewing; a document saved
  on 2026-11-10 opened for editing that day.
- **Crypto library on the stand:** the Document Server of the stand
  (10.0.3.40 on 2026-11-16) still serves the library of build 2.0.0, while
  the editor contract asks for 2.1.0 or newer. With it a PDF form loses its
  form flag when it is saved in the editor and opens for commenting.
- **Document Server build:** on SaaS the release stand ran `10.0.3.19` on
  2026-11-06 and `10.0.3.40` on 2026-11-16, both with the crypto add-on
  (beta gate item 0.1); the build of the standalone package is not named
  yet. On a Document Server build without the crypto add-on,
  private rooms cannot be created (the server answers 403 since `b562fc3fb1`)
  and encrypted files do not open in the editor (415). The backend team's
  check of 2026-11-05: among the images on its machine only the
  developer-edition `4testing-documentserver-de` 10.0.0.158 and 10.0.0.168
  carry the add-on; the Community images 10.0.0-2 and 10.0.0-169 and the
  published 9.x images do not. Which editions will ship it is an open
  question to the Document Server team.
- **Spreadsheets and presentations** (gate item 0.2, `private-rooms-editor-contract`
  4.7). On build 10.0.2.5 (run of 2026-10-30):
  - DS-17: a second session joining a held session with pending changes can
    still fail to open;
  - DS-19: a presentation reopened while its session is held can show that
    session's changes twice.

## Open at release time

Server (`private-rooms-server-hardening`), after the backend commits of
2026-11-04 to 2026-11-06 (`3b9c527a6e`, `bd89a24dcd`, `1259577f63`,
`cc60512acd`, `20262fdcb5`, `b562fc3fb1`, `4162789259`) and the backend
team's reply of 2026-11-05. Merged by then: the archived-room guards, room events, the
invitee keys and missing-keys routes, the sign-in link fix, the link,
template and copy refusals, the room metadata guards, the owner-change
check, the partial key write, the audit of key writes and revocations, the
neutral room name in letters (the role-change letter included since
`4162789259`) and the audit trail, the neutral folder name in letters,
the plaintext refusals
and the title validation of uploads, the revocation of a leaving member's
keys, the third-party refusal and the Document Server gate. Nothing more
had landed by `6fb6dfb17a` (read on 2026-11-16). Still open:

- tasks 8.1, 12.3, 12.8 and 16.1, each stated by the behaviour it asks in
  the change's tasks.md;
- the translations of the "Private room" and "Private folder" labels of
  letters, pushes and the audit trail, which every language prints in
  English for now (4.5);
- recovery of a lost key by an organisation, which is a change of its own
  (`private-rooms-admin-recovery`) and waits for decisions; in the beta a
  lost passphrase and recovery phrase cannot be made good by anybody;
- the availability rule, withdrawn until product decides whether private
  rooms are limited by edition (decision 1);
- backup and restore: the keys stay out of the backup (group 15, the
  warning of 15.2 is on the branch), see "Before users start".

Server (`private-rooms-server-followups`), handed to the backend team on
2026-11-16 with the open items above:

- tasks 1.1 to 1.4, 1.6, 1.7, 2.1, 2.2, 2.5 and 2.6, each stated by the
  behaviour it asks in the change's tasks.md;
- the Private section is titled in English for every language (2.3).

Client follow-ups of the merged server items: none open; the owner change
prepared through the missing-keys route (2.2), the skipped recipients of a
key write (12.6) and the exact backfill (14.2) shipped on 2026-11-05.

Document Server and editor (`private-rooms-editor-contract`):

- written sign-off of the editor contract by the Document Server team (1.6);
- the content of the editor configuration's encryption entry (1.2, 10.6);
- DS-17 and DS-19 above (4.7);
- the stable document key and base while a session exists (6.2), fixed
  together with the Document Server; the public document address and the
  refused saves without the encrypted flag landed on 2026-11-05;
- which editions ship the crypto add-on (see "Editors").
