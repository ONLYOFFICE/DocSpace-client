# Proposal

## Why

Inviting members to a private room today grants room access first and re-wraps the file keys afterwards. When the re-wrap is skipped (no key, refused key change) or fails for some files, the invitee is already a room member who can list the room but cannot read any file, and the only signal is a warning toast that disappears. There is no retry and no visible state. Independently, the guard that blocks removing a member while uploads are in flight only counts uploads into the room root, so an upload into a subfolder can still finish after the revoke and leave the removed member with a wrap. Both gaps are undocumented in the recovered design documents and both must close before the feature leaves its flag.

## What Changes

- Every granted invitee either holds an access entry for every encrypted file in the room or is visibly marked as pending access. The room security update runs first and the wraps follow (decided 2026-10-26, design decision 1): wrapping first is refused by today's server, which takes no access entries for users who cannot yet read the file, and the pending-access state with its retry, backed by the backfill sweep, makes the gap between the two visible. Invitees whose keys were skipped are not granted access and are left out of the security update.
- When the re-wrap fails for a subset of files after access was granted, the member is shown in the Members panel in a "pending access" state with a retry action that re-runs the wrap for the missing files.
- The invite panel reports skipped invitees inline (name and reason), in addition to the toast, and offers to re-run the invitation once they have a key.
- The member-removal upload guard counts uploads into any folder inside the room, not only the room root.
- Backfill after invite stays best-effort but its outcome is surfaced in the same pending-access state.
- The SDK follows the same rules: its private invite panel shows the same result view, its private members list shows the pending-access state with the retry, and its member-removal guard counts uploads into subfolders. Both apps run the shared invite orchestration that `private-rooms-sdk-client-parity` task 5.1 moves into `packages/shared`.

- Found on a local portal on 2026-10-22: after a refused key change, files uploaded meanwhile stay without the member's wraps until the next backfill sweep, which runs once per room and page session; accepting the key now wraps them right away.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/room-membership`: "Invited members receive re-wrapped file keys" (no granted invitee is left silently without entries; access is granted before the wraps), "Invitees without usable keys are skipped with a warning" (skipped invitees are not granted access and are listed inline), "Partial re-encryption failure is reported" (pending-access state with retry), "Member removal is blocked during active uploads" (subfolder uploads count).
- `private-rooms/sdk-surface`: "Invite panel offers people only and closes before re-encryption", renamed "Invite panel offers people only and reports the invitation result" (the panel stays open with the result), "Member removal is blocked during active uploads" (subfolder uploads count); new "Pending access in the SDK members list". These requirements come from `private-rooms-sdk-client-parity`.

## Impact

- Client: invite panel (`packages/client/src/components/panels/InvitePanel/index.js`), Members view and its user row (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/**`), shared membership service (`packages/shared/services/private-room/room-encryption.ts`), upload counter helper (`packages/shared/utils/uploadErrors.ts`). After `private-rooms-sdk-client-parity` 5.1 the invite orchestration lives in `packages/shared/services/private-room`.
- SDK: private invite panel and flow (`packages/sdk/src/app/(private)/_components/invite-panel`, `_hooks/usePrivateInviteFlow.ts`), private members list (`_components/members/PrivateMemberUser.tsx`), upload items and the counter adapter (`(docspace)/_store/UploadStore.tsx`, `(private)/_store/PrivateEncryptedUploadStore.tsx`).
- Server contract: unchanged. A transactional endpoint that grants access and stores the wraps in one request would close the gap between the two; it is recorded as a later target in `private-rooms-server-hardening` and is not a release prerequisite.
- Locale: new Common keys for the pending state, the retry action and the inline skipped list.
- Tests: unit tests for the invite ordering and the counter; E2E `packages/client/__tests__/private-room-invite.spec.ts` and `private-room-members.spec.ts`; SDK unit tests and the SDK private E2E spec `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`.

## Out of scope

- An SDK requirement for the key-trust re-wrap: the re-wrap runs in the shared service both apps call.
- Rotating file keys when a member is removed (an accepted v1 limitation in `private-rooms/encryption-core`).
- Cross-device races on removal (needs server-side locking; see `private-rooms-server-hardening`).

## Decisions needed

None. Decided on 2026-10-26: access is granted first and the wraps follow, with the pending-access state and retry; the backfill sweep re-wraps for every member when a room manager opens the room. A transactional grant-and-keys endpoint is the later target (`private-rooms-server-hardening`); wrap-first after a change to the server's access-entry authorization was not taken.

Decided on 2026-10-27, with `private-rooms-sdk-client-parity`: the SDK is in scope. This change is implemented after that change's tasks 5.1 (the shared invite orchestration) and 5.3 (the SDK invite panel), and archived after it, because its sdk-surface delta modifies and renames requirements that change adds.
