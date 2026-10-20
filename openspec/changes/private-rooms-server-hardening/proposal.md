# Proposal

## Why

The client half of private rooms is finished, but several server behaviours it
depends on are missing or leak metadata: owner changes do not touch the file
access entries, invitation e-mails carry the plaintext room title, encrypted
file titles are not validated, watermark/indexing/lifetime settings can be
applied to a private room, the file-key table keys entries by (file, user) so a
user's second device collapses the first one's entry (BL-8), audit events cover
key envelopes only, and there is no administrative recovery, SCIM offboarding
or file-key history. The stashed `AUDIT_BACKEND.md` (June 2026) listed these as
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
- The file-key table is keyed by (file, user, public key id) so one user can
  hold one entry per device key (BL-8); the client stops collapsing entries.
- Audit events are written for file access-entry writes and member
  revocations, and a per-file access history is exposed.
- Administrative (organisational) recovery and SCIM-driven offboarding are
  specified as P1 for the B2B launch; the client exposes enrolment and
  recovery flows once the endpoints exist.
- The existing upload-session abort route is documented and used by the
  client when an encrypted upload is cancelled.

**BREAKING** (server): the file-key uniqueness constraint changes; existing
rows migrate with their current public key id.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: owner change, edition gate, invitation
  e-mail, access-entry uniqueness, audit scope, recovery/offboarding
  endpoints change; new requirements for metadata guards, title validation,
  upload-session abort and access history.
- `private-rooms/encryption-core`: "One access-list entry per user" becomes
  one entry per user key once the server migration lands.

## Impact

- Server (`../server`): `FileStorageService.cs` (`ChangeOwnerAsync`,
  `CreateRoomAsync`, `UpdateRoomAsync`, `SetEncryptionInfoAsync`),
  `FileSharing.cs` / `StudioNotifyService` (invite e-mails), `DbFileKeys.cs`
  and a migration for `files_file_keys`, `FileDao.cs` (`SetFileKey`),
  `DocumentsActionMapper.cs` and the audit pipeline, `VirtualRoomsController.cs`,
  new recovery and SCIM controllers.
- Client: `packages/shared/api/privacy`, `packages/shared/api/files`,
  `packages/shared/services/private-room/room-encryption.ts` (owner hand-over
  backfill, multi-key wraps), `packages/client/src/components/panels/ChangeRoomOwnerPanel`,
  keys-management enrolment UI, MSW handlers and contract tests under
  `packages/shared/__mocks__/handlers/{privacyroom,files}`.
- No Document Server dependency.

## Out of scope

- The Document Server contract (`private-rooms-editor-contract`).
- Client-side TOFU and fail-closed fixes (separate changes).
- The audit log viewer UI in the management app (follows once events exist).

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
