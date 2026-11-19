# Proposal

## Why

The release-readiness review of 2026-11-19 (code reading on
`release/v4.1.0` plus a local stand with Document Server 10.0.3.58) found a
set of robustness gaps around inviting people into a private room and around
encrypted uploads. None of them puts clear text on the server or hands out a
key; each one either makes an action behave as for an ordinary room, reports
success for work that was not done, or lets the upload queue act on the
wrong row.

Invitations and membership:

- Opened from inside a room, the invite panel reads the room first, and it
  has no state for a room it does not know yet: what it offers and what it
  sends has to wait for that read, and a failed read has to be said.
- The key check of the invitees puts every invitee id into one query string.
  With the 8 KB header buffers of the nginx in front of the portal, an
  invitation of roughly 180 people or more fails as a whole. The marks of
  the people list already ask in batches of 40.
- A group or an e-mail item in a private invitation is dropped or sent
  without a word, and the panel still reports success. No way of adding such
  an item to a private invitation was found; the change adds a guard.
- The backfill sweep on room entry only runs when the opened folder is the
  room itself, so a manager who opens or reloads a subfolder gets no sweep
  until the room root is visited.
- The owner picker of a private room reads only the first 100 members and
  100 administrators and offers everybody when that read fails; a non-member
  chosen then is refused with the text about missing keys.

Section:

- An embedding frame opened at a Rooms address of a private room decides the
  section before its configuration has arrived, so the room stays under
  Rooms although the host opted in.
- A Rooms address with another search area than the Rooms ones asks the
  server without a privacy filter, so private rooms are listed under Rooms.
- A private room created in another tab bumps the room count of the open
  Rooms list although it is not inserted there.
- Switching the E2E rooms app does not read the folder tree again, while the
  server lists the Private root only while the app is on, so the Private item
  has no counter until a reload.

Uploads:

- A late encrypted upload result looks its row up by the index it had when
  it started. After "cancel all" during the wrap stage and a new drop, it
  marks a row of the new batch as uploaded with another file's id, and that
  file is never sent.
- A row cancelled while its unlock prompt was open frees its upload slot a
  second time when the prompt is dismissed.
- The checks made before an upload (unlock of the batch, name comparison,
  auto-lock pause) and the gate that decides how a file is sent read
  different "already encrypted" flags; after a failed send a retried file is
  counted as plain by the first and encrypted by the second.
- The name comparison is skipped while the key list is not known, although
  the gate reads the list again later and sends the file; the SDK batch goes
  on without the comparison when the folder listing fails, while the client
  stops; a re-imported container is compared under its opaque name and
  stored under its original one.
- Re-importing a file downloaded without decryption stores a second file
  under the same file key and nonce, which the encryption-core requirement
  "Per-file content key" does not allow for.

## What Changes

- The invite panel shows neither links nor the invitation form, and sends
  nothing, until it has read the room it invites to. When that read fails it
  says so (Common:InviteRoomLoadFailed) and offers nothing.
- The key check of a private invitation asks for at most 40 invitees per
  request, as the marks do.
- A private invitation sends portal users only. Any other item is not sent,
  is named with Common:EncryptedInviteFailed, and is not reported as invited.
- The backfill sweep starts from any folder of a private room, with the
  room's own rights deciding whether the user may run it.
- The owner picker of a private room reads every member and administrator,
  offers no candidate when it cannot (Common:OwnerCandidatesLoadFailed), and
  refuses a candidate who is not a member with
  Common:EncryptedChangeOwnerNotMember.
- The section of an address in an embedding frame is decided once the frame
  knows its opt-in; a Rooms address with any other search area is requested
  without private rooms; a live room that is not inserted does not change
  the count of the open list; the folder tree is read again when the E2E
  rooms app is switched.
- A late encrypted upload result reaches only its own row, found by its id,
  and a cancelled row frees its slot once.
- An upload into a private room is sent only as a container produced in that
  upload or as a re-imported container whose header was parsed and whose
  file key was recovered; every check before the upload counts the file the
  same way.
- The name comparison reads an unknown key list again before it classifies
  the files, stops the files of a folder whose listing fails in the client
  and the SDK alike (Common:EncryptedNameCheckFailed), and compares a
  re-imported container under its original name.
- A re-imported container is decrypted with the recovered
  key and encrypted again under a new file key, like any other upload.

Out of scope:

- The Share tab of a folder inside a private room (finding 6 of the review).
  The server already reports such a folder as not shareable: its rights
  check refuses `EditAccess` on a folder that is not the room inside a
  private room (`products/ASC.Files/Core/Core/Security/FileSecurity.cs`,
  the `room is {SettingsPrivate: true} && folder is {IsRoom: false}` rule),
  so `FileSharingHelper.CanSetAccessAsync`
  (`products/ASC.Files/Core/Utils/FileSharing.cs`) and the `canShare` of
  `FileEntryDto` are false, and the client's existing `canShare` condition
  hides the tab. No client rule is needed. The requirement "Share tab hidden
  for private items" is also rewritten by `private-rooms-external-links`.
- Inviting a person who has no key, groups and guests as members: the main
  spec keeps them out ("Groups and guests are not members of a private
  room").
- Any change to the server's own checks.

Dependencies:

- No work on `../server` or the Document Server. Every server fact used here
  was read in `../server` through CodeGraph (design.md lists them).
- `private-rooms-server-hardening` carries a MODIFIED copy of "Backfill
  re-wraps every member" identical to the main spec. This change adds a
  separate requirement instead of modifying that one, so the two archive in
  any order.
- `private-rooms-dse3-header-authentication` says that a re-import uploads a
  container unchanged, version included. With decision 1 a re-import writes
  the current container version instead; that proposal was revised on
  2026-11-19.
- `private-rooms-release-gate` modifies "Section availability follows the
  E2E rooms app"; this change adds a separate requirement for the folder
  tree and leaves that one alone.

## Decisions

1. Taken by the owner on 2026-11-19: a re-import gets a file key of its
   own. The re-import decrypts the container with the recovered key, which
   verifies every chunk, and encrypts it again under a new key with a new
   nonce, like any other upload. Both specs then agree without an exception,
   the "keep both" answer of a name clash can give the re-import a suffixed
   name, and the container is verified in full. Cost: the file is decrypted
   and encrypted once more in memory, which uploads already do for any
   file.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: the invite panel and its room, batched
  key checks, people-only invitations, the backfill from a subfolder, owner
  candidates.
- `private-rooms/file-operations`: late upload results, verified containers,
  name clashes, re-import.
- `private-rooms/sidebar-section`: frame addresses, the search area of Rooms
  addresses, live counts, the folder tree on an app switch.
- `private-rooms/encryption-core`: the per-file key of a re-imported file.

## Impact

- `packages/client/src/components/panels/InvitePanel` (room read, guard),
  `packages/client/src/components/panels/ChangeRoomOwnerPanel`.
- `packages/shared/services/private-room/room-member-flows.ts`,
  `packages/shared/hooks/usePrivateRoomOwnerExclusions.ts`,
  `packages/shared/services/private-room/encrypted-upload.ts`,
  `encrypted-upload-orchestrator.ts`, `encrypted-name-clash.ts`.
- `packages/client/src/store/uploadDataStore` (chunk upload, start and
  selector helpers).
- `packages/client/src/store/filesStore` (fetch and socket helpers),
  `packages/client/src/store/AppsStore.ts`, `packages/shared/utils/rooms.tsx`.
- `public/locales`: four new Common keys in every language.
- The SDK receives the shared upload and invitation changes; no SDK page
  changes.
