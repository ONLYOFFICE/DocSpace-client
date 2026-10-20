# Design

## Context

See proposal.md for motivation. The invite panel (`packages/client/src/components/panels/InvitePanel/index.js`) awaits `api.rooms.setRoomSecurity` at line 480, closes the panel at line 502, and only then calls `addMembersToEncryptedRoom` (line 521); skipped members and partial failures are reported with toasts at lines 558-574 and the backfill at line 585 is fire-and-forget. The shared service (`packages/shared/services/private-room/room-encryption.ts`) already verifies each member's key against the TOFU pin (lines 129-156) and returns per-member and per-file results, so the client has everything it needs to decide the order. The member-removal guard counts uploads whose `toFolderId` equals the room id (`packages/shared/utils/uploadErrors.ts:121-128`, used from `Members/sub-components/User.tsx:202`).

The stashed `V1_RELEASE_PROGRESS.md` (edge case #65) documents the root-only upload guard as a deliberate "FE-only mitigation" and says deep hierarchies are rare; it does not document the grant-before-wrap order at all. `AUDIT_BACKEND.md` lists "BH-1 / P0 invite" as closed on the server side (the security split), which is why the client-side order is the remaining gap.

## Goals / Non-Goals

**Goals:**
- A newly granted member can always read every file that existed at grant time, or is visibly flagged as pending.
- Skipped invitees never become members silently.
- The upload guard reflects every upload the device is making into the room.

**Non-Goals:**
- Server-side transactionality (listed as the alternative).
- Re-keying on removal, cross-device races, SDK invite parity.

## Decisions

1. **Client-side reorder: wrap first, then grant.** `onClickSend` runs `addMembersToEncryptedRoom` for the verified subset first, then calls `setRoomSecurity` with the invitees whose wraps succeeded (fully or partially). Alternative: a server endpoint that accepts `{ invitees, fileKeys[] }` and writes both in one transaction. Rejected for this change because it needs backend work with no owner yet; it stays listed in `private-rooms-server-hardening` as the long-term fix, and the client order is correct with either server.
   - Trade-off: wraps written for a user who is then not granted (e.g. the security call fails) are harmless, because the server authorizes file-access entries by read permission on the file and the user cannot read the room anyway; the next backfill or removal cleans them.
2. **Pending-access state lives on the client, keyed by member and room.** The panel records `{ roomId, userId, missingFileIds }` in the Members store after a partial failure; the Members view renders Common:EncryptedAccessPending and a retry item that re-runs the wrap for `missingFileIds`. Alternative: derive the state on every Members load by diffing file access lists against the member list. Rejected as O(files) per open; it is kept as the retry's verification step only.
3. **Skipped invitees stay in the panel.** Instead of closing on send, the panel shows the result list (granted / pending / skipped with reason) and closes on an explicit button; this is what the SDK parity plan called "F-6 invite re-encrypt progress terminal". Alternative: keep the toasts. Rejected because the toasts are the current, insufficient behaviour.
4. **Upload guard uses the room membership of the target folder.** `countActiveUploadsForRoom` receives the room id of each queued item (captured at upload start, the same way `encryptionRoomId` already is) and counts matches regardless of folder depth. Alternative: walk the navigation path per item. Rejected: the id is already captured at start.

## Risks / Trade-offs

- [Wrap-first takes longer before the invitee sees the room] → progress is already shown; the security update follows immediately after the wraps.
- [Pending state is per device] → the retry verifies against the server's access lists, so another device sees the real state on open; the client marker is a hint, not the source of truth.
- [Changing the panel close behaviour affects the non-private invite flow] → the result view is rendered only for private rooms; the non-private branch keeps the current close.

## Migration Plan

No data migration. Behind the `privateRooms` flag. Rollback by revert.

## Open Questions

- Whether the backfill should also mark members as pending when it fails (it runs for earlier members, not the invitees). Can be decided during implementation without changing the specs.
