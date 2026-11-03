# Design

## Context

Read on 2026-11-03, branch `feature/private-rooms-specs` after the merge of
`release/v4.1.0` (`678271710d0`), server `release/v4.1.0` at `d64d3396f5`
through CodeGraph.

- **Live updates.** `socket.helpers.ts` reads a room created in the open
  folder with `api.files.getFolderInfo(folder.id)` (create-folder event) and a
  refreshed folder with `getFolderInfo(id)` (`refreshFolderImpl`), both
  without `skipRedirect`. The axios client calls the forbidden handler on 403
  under `/rooms/shared`, `/rooms/archived` and `/private`, which shows
  Common:AccessDenied and refreshes the rights (`Shell.jsx`). On the server,
  `SocketManager.WhoCanRead` adds every administrator to the recipients of an
  entry in Rooms, Archive or AI rooms, while `FileSecurity` skips the
  administrator bypass for a private room, so `GetFolderAsync` throws a
  `SecurityException` (403) for an administrator who is not a member.
- **Key cache.** `SecretStorage.getCached` returns `{ publicKey, privateKey }`
  that are the slot's own `Uint8Array`s; `clearState` zeroes them with
  `zeroBuffer`. `wrapDEK` uses the sender's private key (HPKE auth mode), so a
  zeroed key still produces a wrap, which no recipient can open. A script
  against the real modules showed it: the wrap succeeds, the uploader's unwrap
  fails with `AuthenticationError`.
- **Invitations.** The client `InvitePanel` and the SDK invite panel send all
  invitees in one `setRoomSecurity`. `FileSharing.SetAceObjectAsync` walks the
  invitees and saves each share inside the loop; for a private room it calls
  `ThrowIfKeysAreNotSetAsync` on each invitee, which throws
  `InvalidOperationException` ("The user does not have an encryption key"),
  mapped to 403 by `UnhandledExceptionMiddleware`. Role refusals are the same
  exception, so status alone does not tell them apart; the client already
  offers only the roles an invitee may hold. No route returns the public key
  of a user who is not yet a member (`privacyroom/{roomId}/access` lists
  members only).
- **SDK key gate.** `EncryptionIdentityStore.keys` is `null` until loaded and
  stays `null` after a failed first load; `hasKeys` is then false.
  `PrivateCreateRoomDialog` passes `hasExistingKeys: hasKeys` to the key gate
  and `hasEncryptionKeys={hasKeys}` to the dialog, whose Create button then
  starts key setup.
- **SDK upload cancel.** `useEncryptedUpload` passes
  `fileSignal: (id) => uploadStore.items.find(...)?.abortController.signal`;
  the orchestrator calls it when its loop reaches the file
  (`encrypted-upload-orchestrator.ts`, the `eitherSignal` per entry), while
  `UploadStore.cancelItem` aborts the controller and removes the row at once.

## Goals / Non-Goals

**Goals:**
- No user-visible error, and no rights refresh, from events about rooms the
  user cannot read.
- No wrap is ever made with erased key material.
- Every invitee the server accepts gets the file keys; every refused invitee
  is named.

**Non-Goals:**
- A server-side pre-check of invitee keys.
- Changing what a lock means for the next operation: it still asks for the
  unlock.

## Decisions

1. **Live-update reads go through `skipRedirect` and a catch.** A refused or
   failed read drops the event. The create-folder handler already returns
   when the folder info is missing, so it returns on a catch as well.
   - *Alternative:* filter private rooms out of the events.
   - *Why not:* the event does not carry the private setting ("Live updates respect the split"), so the client has to read the room anyway.

2. **The cache hands out copies.** `getCached` returns new arrays; the slot
   alone is zeroed on lock. A copy lives only as long as the operation that
   holds it, the same lifetime the shared buffer had.
   - *Alternative:* abort every operation on lock, as the SDK does with `AbortOnLockEffect`.
   - *Why not:* after a file is stored its wrap must be written (`private-rooms-pre-pr-review-fixes`, "Cancelling an encrypted upload"), so an abort at that point would leave a file nobody can open.

3. **`wrapDEK` and `unwrapDEK` refuse an all-zero private key** with an
   encryption error. It is a second line in case a caller keeps a reference to
   the slot by other means.

4. **One `setRoomSecurity` per invitee, in a shared helper.** The helper in
   `room-member-flows.ts` sends the requests in sequence, returns the accepted
   and the refused invitees with their status, and both panels re-wrap the
   accepted ones with `rewrapForInvitedMembers`. A 403 is shown as
   Common:EncryptedInviteNoKey; other failures as Common:EncryptedInviteFailed.
   Sequential requests keep the server load and the notification order as
   they were.
   - *Alternative:* send one request, and on 403 read the members to find who was added.
   - *Why not:* it still cannot tell which invitee was refused, and it races with other changes to the room.

5. **The SDK dialog treats an unknown key list as "may hold a key".** The key
   gate gets `hasExistingKeys: !keysKnown || hasKeys` and the dialog
   `hasEncryptionKeys={!keysKnown || hasKeys}`. The save path already loads the
   keys through `resolveEncryptionKeys`; it shows
   Common:EncryptionKeysLoadFailed when that load fails, instead of
   Common:EncryptionKeysRequiredForPrivateRoom.

6. **The SDK takes each file's signal when the batch starts.** `send()` builds
   a map from upload id to the item's `AbortSignal` before calling the
   orchestrator, and `fileSignal` reads the map.

7. **The keyboard import test is investigated before it is fixed.** It fails
   at `946556ad744` and after the merge, while an instrumented copy passed at
   `946556ad744`: Enter on the Import key link clicks the hidden file input,
   yet no file chooser opens, where a mouse click opens one. The first step is
   to find the commit that made it fail (it passed in the full run before the
   merge) and whether real browsers are affected; the fix follows the cause.

## Risks / Trade-offs

- **Copies of the private key outlive a lock** until the operation that holds
  them ends. → Accepted: the same buffers were reachable before; the slot is
  still wiped, so no new operation can use the key.
- **N requests for N invitees.** → Private-room invitations are short lists of
  people; the requests run in sequence.
- **A 403 for a reason other than a missing key** is labelled as one. → The
  client offers only roles the invitee may hold, so the server's other 403 of
  this route is not expected; the text tells the inviter what to check.

## Migration Plan

Client-only. Land task by task on the feature branch, then run the pre-push
gate, the client private-room E2E and the SDK private E2E. Rollback: revert
the commits.

## Open Questions

None.
