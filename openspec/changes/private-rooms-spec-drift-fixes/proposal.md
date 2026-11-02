# Proposal

## Why

The audit of 2026-11-02 compared the main private-rooms specs with the code
on the branch and found nine places where the code does less than the spec
says. Three of them can break the feature's promises: a peer can return to
an earlier key without the key-change dialog, a pin that cannot be read is
silently replaced, and an encrypted Duplicate started outside the room can
target the room as plaintext. The rest leave members without access, skip
files or keep data longer than specified. All of them must close before the
feature leaves its flag.

## What Changes

- Accepting a changed key replaces the pin: an earlier key of the peer is a
  key change again, and a pin that cannot be read is treated as a refused
  key change instead of a first sight.
- An encrypted Duplicate takes its target from the file's own room, so a
  Duplicate started from Recent or another list outside the room is
  encrypted for the room like one started inside it.
- In the SDK, a file dropped on a row of a private room the user cannot
  create in (an archived room included) starts no upload and sends no file
  name; today it falls through to the plain uploader.
- Changing the owner from the room's edit dialog runs the same key check as
  the owner panel.
- When sharing a new upload with the room members fails, the user is told,
  and the members with a known key are marked as pending access, instead of
  the upload reporting success with nobody else able to open the file.
- Listing the encrypted files of a room follows the server's total, so
  backfill, invitation and revocation reach files after the first page.
- The passphrase change dialog applies the strength gate of key creation.
- Every lock of the identity, an expired unlocked session included, empties
  the decrypted-name cache.
- Downloading one encrypted file the user holds no access entry for shows
  Common:EncryptionDownloadFailed instead of doing nothing.
- Three suspicions are checked and fixed if they hold: Copy to from Recent
  asking the server to copy ciphertext out of a private room, the idle
  auto-lock not starting after a key recovery, and an SDK drop without the
  create right starting the key prompt.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: "Peer public keys are pinned on first
  use" (an earlier key and an unreadable pin), "Decrypted filenames are
  session-scoped" (an expired session).
- `private-rooms/file-operations`: "Uploads into a private room are
  encrypted on the client" (sharing with the members fails), "Copy within
  the same private room" (Duplicate started outside the room), "Download
  decrypts on the client" (no own access entry).
- `private-rooms/room-membership`: "New owner must hold a verified key"
  (the edit dialog), "Backfill re-wraps every member" (more than one page).
- `private-rooms/key-management`: "Passphrase strength gate" (passphrase
  change).
- `private-rooms/sdk-surface`: "No upload or creation without the create
  right" (drops on a row).

## Impact

- Shared: `packages/shared/services/encryption/tofu-store.ts` and its
  callers' refusal path, `secret-storage.ts` with `filename-cache.ts`,
  `packages/shared/services/private-room/encrypted-upload-orchestrator.ts`
  (fan-out result), `room-encryption.ts` (room file listing),
  `upload-target.ts` callers.
- Client: `packages/client/src/store/filesActionsStore/copyMove.helpers.ts`
  (Duplicate target), `download.helpers.ts`,
  `packages/client/src/components/panels/ChangeRoomOwnerPanel`,
  `keys-management/modals/KeyRotationDialog.tsx`, the upload store's report
  of a failed fan-out.
- SDK: `packages/sdk/src/app/(personal-files)/_components/docs-layout`
  (drop handling on rows) and the SDK upload report.
- Locale: one Common key for a failed fan-out, with `/translate-comments`
  and `/translate-locales`.
- No server change: the server's folder listing already returns the total
  the client needs (`EntryManager.GetEntriesAsync`,
  `products/ASC.Files/Core/Utils/EntryManager.cs:622-705`). No Document
  Server dependency.

## Out of scope

- The text of Common:EncryptedRevokeCompleted after a member removal: the
  revocation pass removes nothing on the server, and how entries are removed
  is the open revocation decision of `private-rooms-server-hardening`.
- Server-side refusal of plaintext in a private room
  (`private-rooms-server-hardening`, proposal decision 5).

## Decisions needed

None for the planned fixes. If the Copy to suspicion holds, the fix follows
the existing requirement "Files leaving a private room are decrypted" and
needs no new decision.
