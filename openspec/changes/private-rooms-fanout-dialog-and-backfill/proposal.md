# Proposal

## Why

Two defects surfaced in the review of the 2026-10-20 private-rooms work. First, the upload fan-out added by `private-rooms-tofu-on-upload` assumed one member fan-out at a time, but the client uploads up to five files in parallel and never awaits the fan-out; when two fan-outs meet the same changed member key, the second key-change request silently answers the first one with "refuse", and that synthetic refusal is remembered for the whole session, so files lose a member's wrap without the user ever deciding. Second, the mock correction of `private-rooms-mock-fidelity` established that the server returns only the caller's own entries from a file's access list, yet the invite, backfill and both upload fan-outs still filter members by "already has an entry" and the invite path verifies the written list against that read; the filter is a no-op, the verification always reports drift, and the unit fixtures still feed the shape the server never returns. Both must be fixed before the feature leaves its flag, because they decide who gets access to encrypted files.

## What Changes

- Concurrent key-change requests queue instead of pre-empting each other: one dialog at a time, requests for the same user and key share the user's decision, and no request is ever answered on the user's behalf.
- The client upload store runs member fan-outs one at a time, so a batch meets a changed key once and the session refusal memory records only decisions the user made.
- Backfill is specified as what it is against today's server: a best-effort sweep by a room manager that re-wraps every encrypted file for every current member with a verified key, once per room and page session and after each invitation, because the client cannot tell which members lack an entry.
- The "already has an entry" filters in invite, backfill and both upload fan-outs are reduced to the explicit skip of the caller they amount to, and the post-write verification that compares the written list with the caller-only read is removed.
- The shared unit fixtures for the access-list read carry the caller's entries only; the cases that depended on seeing other users' entries are rewritten to the behaviour that exists.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/key-management`: "Key-change dialog" (concurrent requests queue and share decisions; none is answered automatically).
- `private-rooms/encryption-core`: "File access list holds one wrap per member" (a batch asks once per changed key; a refusal is only ever the user's or the absence of a dialog).
- `private-rooms/room-membership`: "Invited members receive re-wrapped file keys" (the backfill re-wraps every member with a verified key, bounded per room and session; the server shows the caller only their own entries).
- `private-rooms/sdk-surface`: "Shell side effects" (the SDK backfill is the same sweep, not a search for missing wraps).

## Impact

- Shared: `packages/shared/context/encryption/EncryptionContext.tsx` (key-change request queue), `packages/shared/services/private-room/room-encryption.ts` (invite, backfill), `packages/shared/services/private-room/encrypted-upload-orchestrator.ts` (fan-out filter), their unit tests and `room-encryption.integration.test.ts`.
- Client: `packages/client/src/store/UploadDataStore.tsx` and `uploadDataStore/encryption.helpers.ts` (serialized fan-out), `uploadDataStore/__tests__/*`.
- Specs: the four deltas above; no locale change.
- Server: none. The facts relied on are the access-list read returning the caller's entries only and the write replacing only the listed users; both are cited in design.md.

## Out of scope

- A server query for "members lacking an entry on a file", which would make backfill exact; recorded for `private-rooms-server-hardening`.
- The pending-access state and retry of `private-rooms-invite-atomic-rewrap`, which supersedes the blind post-invite sweep once it lands.
- Revocation semantics: `private-rooms/room-membership` already states that the server keeps a removed member's entries; only the unit fixtures that pretend otherwise are touched here.
- Concurrency of the unwrap paths (download, preview, filename recovery) beyond what the dialog queue fixes for them as well.

## Decisions needed

- Whether backfill keeps re-wrapping every member on a manager's first visit per session (recommended, the only path today that gives a late-registered member access) or is reduced to the post-invite run only. The artifacts assume the former.
