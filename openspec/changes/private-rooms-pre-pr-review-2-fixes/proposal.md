# Proposal

## Why

The second pre-PR review of 2026-11-03 re-checked the branch for a beta shown
to every user (`private-rooms-beta-release`). Five defects were verified in
the code, two of them against the server through CodeGraph. One reaches every
portal administrator as soon as anyone creates a private room. One leaves
uploaded files unreadable. The others leave invitees without file access or
give a user a second key. They must be fixed before the beta is merged
(`private-rooms-beta-release` 0.3). A keys-page E2E test also fails, before
and after the merge with the release branch, and blocks the record of
`private-rooms-pre-pr-review-fixes` 6.2.

## What Changes

- **Live room updates for rooms the user cannot read.** The server sends the
  creation and update events of every room in Rooms to all portal
  administrators, including private rooms they are not members of
  (`SocketManager.WhoCanRead`). The client reads such a room with
  `getFolderInfo` without `skipRedirect`, gets 403, and shows Access denied.
  The client drops these events silently instead.
- **A lock no longer erases keys that are in use.** `SecretStorage.getCached`
  hands out the slot's own buffers, and a lock (Lock now, key deletion, idle
  expiry) zeroes them. An upload or re-wrap that is still running then wraps
  file keys with an all-zero private key and reports success, so nobody can
  open the file. The cache hands out copies, and the wrap and unwrap
  primitives refuse an all-zero key.
- **Invitations into a private room are sent one invitee per request.** The
  server saves invitees one by one and stops with 403 at the first one without
  an encryption key (`FileSharing.SetAceObjectAsync`), so the invitees before
  it become members while the client reports a failure and wraps no file keys
  for them. Sending each invitation alone lets the client re-wrap for those
  added and name those refused, in the client and in the SDK.
- **The SDK private-room dialog waits for a known key list.** While the key
  list is not loaded, or failed to load, the Create button offers key
  generation and the flow registers a second key for a user who holds one.
  An unknown list now counts as "may hold a key": nothing is offered until the
  list is known, and a failed load is reported.
- **Cancelling a queued encrypted upload in the SDK stops it.** The cancel
  removes the row before the batch reaches the file, so the per-file signal is
  not found and the file is uploaded anyway. Each file's signal is taken when
  the batch starts.
- **Creating a private room from the store reports a key list that failed
  to load.** `CreateEditRoomStore.onCreateRoom` showed "keys required" after
  a transient fetch error, the case the first fixes change settled for the
  dialogs (found by the PR review).
- **The keyboard import test of the keys page passes reliably.** Its cause is
  found first; the fix goes where the cause is.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`: live room events the user cannot read are
  dropped without an error.
- `private-rooms/encryption-core`: a lock wipes only the cache slot; key
  material handed out earlier stays intact, and an all-zero key is refused.
- `private-rooms/room-membership`: private-room invitations are sent one
  invitee per request, and refused invitees are named.
- `private-rooms/sdk-surface`: the private-room dialog waits for a known key
  list, and the SDK invite follows the per-invitee rule.
- `private-rooms/file-operations`: cancelling a queued encrypted upload in the
  SDK stops it.

## Impact

- **Client:** `packages/client/src/store/filesStore/socket.helpers.ts`,
  `packages/client/src/components/panels/InvitePanel/index.js`, and the keys
  page or its E2E spec for the keyboard import.
- **Shared:** `packages/shared/services/encryption/secret-storage.ts`, the HPKE
  wrap and unwrap (`packages/shared/services/encryption/hpke.ts`),
  `packages/shared/services/private-room/room-member-flows.ts` (a shared
  per-invitee invite), and `public/locales` (a refusal text for an invitee
  without a key).
- **SDK:** `packages/sdk/src/app/(private)/_components/create-room/PrivateCreateRoomDialog.tsx`,
  the SDK private invite flow, and `packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts`.
- **Server (`../server`):** none. The client works with the server as it is
  on `release/v4.1.0` (`d64d3396f5`). Read through CodeGraph:
  - `SocketManager.WhoCanRead` adds every administrator for rooms in Rooms;
  - `FileStorageService.GetFolderAsync` refuses a folder the user cannot read;
  - `FileSharing.SetAceObjectAsync` calls `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` per invitee of a private room, inside the loop that saves each share;
  - `UnhandledExceptionMiddleware` maps that `InvalidOperationException` to 403;
  - no route returns the public key of a user who is not yet a member.
- **Document Server:** none.

## Out of scope

- Findings of the second review that were not verified in the code: guests
  in the Private section, the Document Server capability check, security
  claims in the texts, the accessibility of the invite result and the Beta
  badge, and the client store's row index after an await. They are verified
  before any change is proposed for them.
- The Beta badge title, which `private-rooms-beta-release` 2.4 fixes.
- The account-link loss of `private-rooms-server-hardening` 12.1, accepted by
  the owner for the beta.

## Decisions needed

None. The per-invitee invite is the only way the client can attribute a
refusal without a server change; a server-side pre-check would be a
`private-rooms-server-hardening` item.
