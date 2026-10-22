# Proposal

## Why

Inviting members to a private room today grants room access first and re-wraps the file keys afterwards. When the re-wrap is skipped (no key, refused key change) or fails for some files, the invitee is already a room member who can list the room but cannot read any file, and the only signal is a warning toast that disappears. There is no retry and no visible state. Independently, the guard that blocks removing a member while uploads are in flight only counts uploads into the room root, so an upload into a subfolder can still finish after the revoke and leave the removed member with a wrap. Both gaps are undocumented in the recovered design documents and both must close before the feature leaves its flag.

## What Changes

- Every granted invitee either holds an access entry for every encrypted file in the room or is visibly marked as pending access. The originally proposed order (wrap **before** the room security update) is not possible against today's server, which refuses access entries for users who cannot yet read the file; the order is an open decision (see below). Invitees whose keys were skipped are not granted access and are left out of the security update.
- When the re-wrap fails for a subset of files after access was granted, the member is shown in the Members panel in a "pending access" state with a retry action that re-runs the wrap for the missing files.
- The invite panel reports skipped invitees inline (name and reason), in addition to the toast, and offers to re-run the invitation once they have a key.
- The member-removal upload guard counts uploads into any folder inside the room, not only the room root.
- Backfill after invite stays best-effort but its outcome is surfaced in the same pending-access state.

- Found on a local portal on 2026-10-22: after a refused key change, files uploaded meanwhile stay without the member's wraps until the next backfill sweep, which runs once per room and page session; accepting the key now wraps them right away.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/room-membership`: "Invited members receive re-wrapped file keys" (no granted invitee is left silently without entries; the order of operations is an open decision), "Invitees without usable keys are skipped with a warning" (skipped invitees are not granted access and are listed inline), "Partial re-encryption failure is reported" (pending-access state with retry), "Member removal is blocked during active uploads" (subfolder uploads count).

## Impact

- Client: invite panel (`packages/client/src/components/panels/InvitePanel/index.js`), Members view and its user row (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/**`), shared membership service (`packages/shared/services/private-room/room-encryption.ts`), upload counter helper (`packages/shared/utils/uploadErrors.ts`).
- Server contract: unchanged if grant-first is kept. Wrap-first needs a server change, because the access-entry write (`PUT files/{fileId}/access`) refuses entries for users without read access to the file and rejects the whole request when one entry fails; the server options (relaxed authorization for pending invitees, or a transactional grant-and-keys endpoint) are recorded in design.md and, if chosen, in `private-rooms-server-hardening`.
- Locale: new Common keys for the pending state, the retry action and the inline skipped list.
- Tests: unit tests for the invite ordering and the counter; E2E `packages/client/__tests__/private-room-invite.spec.ts` and `private-room-members.spec.ts`.

## Out of scope

- The SDK invite flow (parity tracked in `private-rooms-sdk-gating-and-parity`).
- Rotating file keys when a member is removed (an accepted v1 limitation in `private-rooms/encryption-core`).
- Cross-device races on removal (needs server-side locking; see `private-rooms-server-hardening`).

## Decisions needed

- Order of grant and wrap (open). Client-side wrap-first, previously recommended, is infeasible against today's server (it refuses access entries for invitees who cannot read the file yet). Options: keep grant-first and rely on the pending-access state (no server change), wrap-first after a server change to the access-entry authorization, or a server endpoint that grants access and stores the wraps in one transaction. Design.md lists all three; the specs are written to hold under any of them.
