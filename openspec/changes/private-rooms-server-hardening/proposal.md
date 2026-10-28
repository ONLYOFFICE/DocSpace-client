# Proposal

## Why

The client half of private rooms is finished, but several server behaviours it
depends on are missing or leak metadata: owner changes do not touch the file
access entries, invitation e-mails carry the plaintext room title, encrypted
file titles are not validated, watermark/indexing/lifetime settings can be
applied to a private room, audit events cover
key envelopes only, no operation removes a user's file access entries (a
removed member keeps them), and there is no administrative recovery, SCIM
offboarding or file-key history. Archived private rooms lose the server's
private-room guards: their files report the copy right, and a portal
administrator who is not a member can read, copy, delete or unarchive them by
id. Room events also carry private-room titles to every administrator. The stashed `AUDIT_BACKEND.md` (June 2026) listed these as
P1/P2; the stashed `V1_RELEASE_PROGRESS.md` made admin recovery, audit log
viewer and SCIM the P0 set for a B2B launch and decided that without them the
feature ships to individuals and SMB owners only. None of it has landed on the
server branch.

This change tracks that backend work from the client's side: the server
contract the client will code against, the MSW mocks and contract tests, and
the client code that reads the new fields. The server tasks are listed with
the file to change so the backend team can pick them up; nothing here is
"done" until both sides merge.

## What Changes

- Owner change of a private room verifies the new owner's file access entries
  and reports which files the new owner cannot read, so the client can run a
  backfill before the hand-over.
- Private-room availability becomes an explicit server decision (edition or
  tariff rule, default allow) with a distinct error code the client shows.
- Watermark, indexing and lifetime settings are refused on private rooms.
- Encrypted file titles are validated to the opaque UUID-plus-extension form.
- Invitation e-mails for private rooms stop carrying the plaintext room title.
- Audit events are written for file access-entry writes and member
  revocations, and a per-file access history is exposed. The server has no
  revocation (removal of a user's access entries) today; the operation that
  will remove them is an open decision (see below), and the revocation audit
  and offboarding depend on it.
- Administrative (organisational) recovery and SCIM-driven offboarding are
  specified as P1 for the B2B launch; the client exposes enrolment and
  recovery flows once the endpoints exist.
- The existing upload-session abort route is documented and used by the
  client when an encrypted upload is cancelled.
- Archived private rooms keep the private-room guards of active ones: no copy
  right on their files and subfolders, and no administrator bypass for
  administrators who are not members. A subfolder copied out of an
  archived private room lands outside as an empty folder tree today; the
  copy denial closes it (design.md, Context).
- Socket events of a private room reach its members only, not every
  administrator.
- Found on a local portal on 2026-10-22: the public keys of a file in an archived private room are answered 415, because the file check knows only the VirtualRooms section; the server applies the room check's VirtualRooms-or-Archive condition (design decision 9).
- A caller who may change the access of a private room can read the public keys of named users who are not members yet, so the client verifies invitees' keys before granting access (`private-rooms-invite-atomic-rewrap`, decided 2026-10-28; design decision 10). Today the room access keys cover members only.
- Found when the server was re-checked on 2026-10-28 (`e618acc6c0`): saving a user's keys can delete another sign-in link of that user, such as Google or SSO; a private room accepts external and invitation links and can be duplicated, saved as a template or index-exported, each guarded by the client only; an empty key set passes every key check; the private flag is accepted with any room type; and a third-party room created as private is not key-checked. The server refuses or fixes each of these (design decisions 11-13).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: owner change, edition gate, invitation
  e-mail, audit scope, recovery/offboarding
  endpoints, the copy right in archived private rooms and the public keys
  of files in archived private rooms, and private room creation (empty key
  sets, room type, third-party rooms) change; new
  requirements for metadata guards, title validation, upload-session abort,
  access history, the administrator bypass in archived private rooms,
  private-room event recipients, the public keys of prospective members,
  sign-in links kept on a key save, no links on a private room and refused
  room-level copies.

## Impact

- Server (`../server`): `FileStorageService.cs` (`ChangeOwnerAsync`,
  `CreateRoomAsync`, `UpdateRoomAsync`, `SetEncryptionInfoAsync`),
  `FileSharing.cs` / `StudioNotifyService` (invite e-mails),
  `DocumentsActionMapper.cs` and the audit pipeline, `VirtualRoomsController.cs`,
  new recovery and SCIM controllers, the Archive branch of
  `FileSecurity.FilterEntryAsync`, `CopyPermissionsCheck.cs` (traced only),
  `SocketManager.cs`, and `PrivacyRoomController.cs` with
  `EncryptionKeyPairDto.cs` (invitee keys); `EncryptionLoginProvider.cs`
  (key save, empty key sets), `CreateThirdPartyRoomAsync` and the room-level
  private denials of `FileSecurity.cs`, the room link routes
  (`VirtualRoomsController.cs`), and the other notifiers that carry a room
  title (`ResendEmailInvitationsAsync`, `NotifyClient.cs`).
- Client: `packages/shared/api/privacy`, `packages/shared/api/files`,
  `packages/shared/services/private-room/room-encryption.ts` (owner hand-over
  backfill), `packages/client/src/components/panels/ChangeRoomOwnerPanel`,
  keys-management enrolment UI, MSW handlers and contract tests under
  `packages/shared/__mocks__/handlers/{privacyroom,files}` (the archived
  variant of `encryptedFilesHandlers` follows the copy right once the server
  changes), and the invitee keys request in `packages/shared/api/privacy`
  with its mock.
- No Document Server dependency.

## Out of scope

- The Document Server contract (`private-rooms-editor-contract`).
- A transactional endpoint that grants private-room access to invitees and
  stores their file-key wraps in one request: the later target for
  `private-rooms-invite-atomic-rewrap`, which ships grant-first (decided
  2026-10-26). Not a release prerequisite.
- Client-side TOFU and fail-closed fixes (separate changes).
- The audit log viewer UI in the management app (follows once events exist).
- A route that tells a room manager which members lack an access entry on
  which files. It would make the backfill exact
  (`private-rooms-fanout-dialog-and-backfill`, archived) and let the
  pending-access marker of `private-rooms-invite-atomic-rewrap` survive a
  reload and reach other devices; today the server reads back the caller's
  own entries only. A later target, not a release prerequisite.
- A server-side Private section with its own root, search area and new-items
  routing (`private-rooms-sidebar-section`, archived): a later target.

## Decisions needed

1. Edition rule for private rooms: available in all editions (recommended,
   matches today) or Enterprise only. Product decides; the spec assumes an
   explicit server rule that defaults to allow.
2. Launch scope: individuals/SMB without admin recovery and SCIM (stashed
   decision), or B2B with them. The spec marks recovery and offboarding as
   required for the B2B launch only.
3. Recovery model for admin recovery: recovery-admin public key wrapping the
   user's private key (stashed design) versus key escrow. The spec assumes
   the former.
4. Revocation primitive (open): the server removes a user's access entries
   itself when the user leaves a private room or is deprovisioned, or a new
   route lets a room manager remove named users' entries. No such operation
   exists today; the "member revoked" audit and the offboarding requirement
   cannot be implemented until this is decided.
5. Server-side refusal of plaintext written into a private room (open):
   unencrypted uploads and `copyas` conversion output currently land in a
   private room unchecked. Whether this change adds a requirement for it is
   undecided; `private-rooms-upload-fail-closed` defers its server guard here.
6. Third-party private rooms (open): key-check them like every private room
   (the spec assumes this, design decision 13) or refuse the private flag on
   third-party storage.
7. Member removal racing an upload on another device (open): the access
   write refuses the whole request when one listed user can no longer read
   the file, so such an upload stores no entry for anyone. Options: the write
   stores the entries of the users who can read and reports the others, or
   the server blocks a member's removal while uploads naming them are open.
   `private-rooms-invite-atomic-rewrap` leaves this race to this change.
