# Design

## Context

See proposal.md for motivation. The invite panel (`packages/client/src/components/panels/InvitePanel/index.js`) awaits `api.rooms.setRoomSecurity` at line 480, closes the panel at line 502, and only then calls `addMembersToEncryptedRoom` (line 521); skipped members and partial failures are reported with toasts at lines 558-574 and the backfill at line 585 is fire-and-forget. The shared service (`packages/shared/services/private-room/room-encryption.ts`) already verifies each member's key against the TOFU pin (lines 129-156) and returns per-member and per-file results, so the client has everything it needs to decide the order. The member-removal guard counts uploads whose `toFolderId` equals the room id (`packages/shared/utils/uploadErrors.ts:121-128`, used from `Members/sub-components/User.tsx:202`).

The stashed `V1_RELEASE_PROGRESS.md` (edge case #65) documents the root-only upload guard as a deliberate "FE-only mitigation" and says deep hierarchies are rare; it does not document the grant-before-wrap order at all. `AUDIT_BACKEND.md` lists "BH-1 / P0 invite" as closed on the server side (the security split), which is why the client-side order is the remaining gap.

Server constraints that bound the ordering (`../server` on `hotfix/v4.0.1`):

- Writing access entries (`PUT files/{fileId}/access`, `FileStorageService.SetEncryptionInfoAsync`, `products/ASC.Files/Core/Core/FileStorageService.cs:5268-5276`) checks read access of every *subject* user named in the body (`fileSecurity.CanReadAsync(file, k.UserId)`) and throws before storing anything if one fails. An invitee who is not yet a room member cannot read the room's files, so a wrap for them is refused, and the refusal rejects the whole request, including the entries for other users in it.
- No server path removes a user's access entries: the only delete (`DeleteFileKeysAsync`, `products/ASC.Files/Core/Core/EF/Queries/AbstractQueries.cs:116`) is called only from `FileDao.SetFileKey` (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs:2404`), which replaces the rows of the users listed in the request. Removing a member leaves their entries in place.
- Granting a private room to an invitee who never registered a key is refused by the server (`products/ASC.Files/Core/Utils/FileSharing.cs:263-266`, `ThrowIfKeysAreNotSetAsync` on the invitee from line 129). A user who registered keys and later deleted all of them still has a (now empty) key record and passes the check. The check throws inside the per-invitee loop, and each earlier invitee's share is stored in its own iteration (`fileSecurity.ShareAsync`, line 395), so the request fails at that invitee while invitees processed before it may already be members.

## Goals / Non-Goals

**Goals:**
- A newly granted member can always read every file that existed at grant time, or is visibly flagged as pending.
- Skipped invitees never become members silently.
- The upload guard reflects every upload the device is making into the room.

**Non-Goals:**
- Implementing server-side changes in this change (any server option from decision 1 is tracked in `private-rooms-server-hardening`).
- Re-keying on removal, cross-device races, SDK invite parity.

## Decisions

1. **Grant first, then wrap (decided 2026-10-26).** The client sends the room security update for the verified invitees only and then wraps every encrypted file for those it granted; if the security update fails, no wrap is written. A partial wrap result shows as the pending-access state with a retry (decision 2), and the backfill sweep re-wraps for every member when a room manager opens the room. The originally proposed client-side reorder (wrap first, then grant) cannot work against today's server: the access-entry write refuses entries for users who cannot read the file, and an invitee cannot read it until the security update has granted them the room (see Context). Alternatives: (b) wrap-first after a server change that accepts entries for invitees named in a pending grant, not taken because it needs a new authorization concept on the server; (c) a server endpoint that accepts `{ invitees, fileKeys[] }` and writes the grant and the entries in one transaction, the later target, recorded in `private-rooms-server-hardening` and not a release prerequisite.
2. **Pending-access state lives on the client, keyed by member and room.** The panel records `{ roomId, userId, missingFileIds }` in the Members store after a partial failure; the Members view renders Common:EncryptedAccessPending and a retry item that re-runs the wrap for `missingFileIds`. Alternative: derive the state on every Members load by diffing file access lists against the member list. Rejected as O(files) per open; it is kept as the retry's verification step only.
3. **Skipped invitees stay in the panel.** Instead of closing on send, the panel shows the result list (granted / pending / skipped with reason) and closes on an explicit button; this is what the SDK parity plan called "F-6 invite re-encrypt progress terminal". Alternative: keep the toasts. Rejected because the toasts are the current, insufficient behaviour.
4. **Upload guard uses the room membership of the target folder.** `countActiveUploadsForRoom` receives the room id of each queued item (captured at upload start, the same way `encryptionRoomId` already is) and counts matches regardless of folder depth. Alternative: walk the navigation path per item. Rejected: the id is already captured at start.

## Risks / Trade-offs

- [Grant first leaves a window in which a granted member has no entries] → the pending-access marker and retry make it visible, and the backfill sweep closes it on a room manager's next visit; the transactional endpoint (c) would close it on the server.
- [An invitee who never registered a key makes the server fail the security update at that invitee, after earlier invitees may already have been added] → the client must leave skipped invitees out of the request in every option.
- [Pending state is per device] → the retry verifies against the server's access lists, so another device sees the real state on open; the client marker is a hint, not the source of truth.
- [Changing the panel close behaviour affects the non-private invite flow] → the result view is rendered only for private rooms; the non-private branch keeps the current close.

## Migration Plan

No data migration. Behind the `privateRooms` flag. Rollback by revert.

## Open Questions

- Whether the backfill should also mark members as pending when it fails (it runs for earlier members, not the invitees). Can be decided during implementation without changing the specs.
