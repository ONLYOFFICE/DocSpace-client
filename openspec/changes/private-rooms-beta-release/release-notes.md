# Private rooms (beta): release notes

Draft for the documentation team, written on 2026-11-03 from the main specs
and the open changes. Release: `release/v4.1.0`.

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
  - existing private rooms stay usable and are listed in Rooms with their
    private badge;
  - users who already hold a key keep the Keys management tab.
- **Embedding:** an embedded client frame and the SDK private pages show
  private rooms only when the host sets `privateRooms` in the frame
  configuration.

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

## Editors

- **Document Server build:** not named yet (beta gate item 0.1, left open by
  proposal decision 6). On a Document Server build without the crypto add-on,
  encrypted files do not open in the editor.
- **Spreadsheets and presentations** (gate item 0.2, `private-rooms-editor-contract`
  4.7). On build 10.0.2.5 (run of 2026-10-30):
  - DS-17: a second session joining a held session with pending changes can
    still fail to open;
  - DS-19: a presentation reopened while its session is held can show that
    session's changes twice.

## Open at release time

Server (`private-rooms-server-hardening`), backend items not merged as of
2026-11-05 (the archived-room guards, room events, the invitee keys route,
the sign-in link fix, the link and template refusals and the room metadata
guards merged on 2026-11-04; the owner-change check, the missing-keys
route, the partial key write, the audit of key writes and the neutral room
name in letters on 2026-11-05):

- the private-room availability rule (3.1b);
- validation of encrypted upload titles (4.1);
- the translations of the "Private room" label of letters and pushes, which
  every language prints in English for now (4.5);
- the revocation of a removed member's file keys and its audit (6.0, 6.1b);
- the folder check of the upload-session abort (7.2);
- recovery and offboarding for organisations (8);
- the key-set, room-type and third-party checks of room creation (12.3).

Client follow-ups of the merged server items, not in the beta: the owner
change prepared through the missing-keys route (2.2), the skipped
recipients of a key write (12.6) and the exact backfill (14.2).

Document Server and editor (`private-rooms-editor-contract`):

- written sign-off of the editor contract by the Document Server team (1.6);
- the client side of the encrypted-editing capability check (2.2 to 2.4;
  the server reports `docServiceEncryptionSupported` since 2026-11-05);
- DS-17 and DS-19 above (4.7);
- the stable document key and base while a session exists (6.2); the public
  document address and the refused saves without the encrypted flag landed
  on 2026-11-05;
- the key-pair list in the signed editor configuration (10.6);
- opening encrypted files from the SDK (7.1).
