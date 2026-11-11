# Proposal

## Why

The review of 2026-11-11 read the main specs against the server and found
statements that are inexact about behaviour already on the branch: the
specs say a member's file keys go when the member leaves, but not that a
member without keys cannot leave at all; they call the user who keeps the
keys "the room's creator" where the server means the current owner; a
scenario promises that a failed leave keeps the member's keys, which holds
only when the failure comes before the role is written. A spec that is
wrong in such details misleads the next change written on top of it.

## What Changes

No behaviour changes. The wording of eight requirements is brought in line
with the server as read at `a7d94e4b81` and with the client on the branch.

- `server-contract`, "File keys follow the share": the user who keeps the
  keys is the room's current owner; a member whose key set is empty is
  refused a leave, a removal and a role change with 403; a key removal that
  fails after the share is written leaves the share removed and the keys
  in place.
- `server-contract`, "Owner change requires the new owner's keys": an owner
  whose own key set is empty cannot hand the room over, since the share the
  owner gets instead passes the same key check; the reassignment of a
  deleted user's rooms applies neither the key check nor the
  missing-entries check.
- `server-contract`, "Invitation e-mails carry the room title": a share
  request that names an e-mail address without a user id is refused with
  403 in a private room, before an account is created or a letter sent.
- `server-contract`, "Guests cannot hold encryption keys": the conclusion
  "a guest therefore never holds a key" is dropped; the requirement states
  only the refusal the server implements.
- `room-membership` and `sdk-surface`, the two leave requirements: their
  names said "revokes own access first" while their text says the opposite;
  they are renamed, say "current owner", and the scenario "Cleanup fails"
  is narrowed to the failure before the role is written and joined by one
  for the failure after it.
- `sdk-surface`, "Member removal warning": the scenario "Remove a group"
  says that the server lets no group join a private room in this version.
  It is kept, since the SDK code path it describes exists and a delta
  cannot drop a scenario from a requirement it modifies.
- `encryption-core`, "Revocation removes access-list entries only":
  "current owner".
- `private-rooms-server-hardening` carries full copies of six of these
  requirements in its own delta; they get the same text, or its archive
  would bring the old wording back. Two code comments that point at the
  renamed requirements follow the new names.

Out of scope:

- "Server API is not gated by the flag" in `feature-gating`: the delta of
  `private-rooms-beta-release` already removes it.
- "Editor fails closed without the crypto library": the client half is on
  the branch, the Document Server half is an open obligation of
  `private-rooms-editor-contract`; the requirement stays in that delta.
- "Private rooms have no section of their own on the server", which the
  rooms list filter contradicts: its replacement is in the delta of
  `private-rooms-server-section`.
- Two statements the review reported and this change could not confirm in
  the server source: that a guest who was a user before keeps a stored key
  pair, and that the share request of a room administrator may drop a
  guest silently with 200. The first is a question to the backend
  (`private-rooms-server-followups` 1.5); the scenario "Guest shared with a
  private room" of `room-membership` stays as it is until one of them is
  read.
- The behaviour itself. What the server should do instead is asked in
  `private-rooms-server-followups`.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: four requirements reworded.
- `private-rooms/room-membership`: the leave requirement renamed and
  reworded.
- `private-rooms/sdk-surface`: the leave requirement renamed and reworded,
  a scenario of the removal warning reworded.
- `private-rooms/encryption-core`: one requirement reworded.

## Impact

- `openspec/specs/private-rooms`: four spec files.
- `openspec/changes/private-rooms-server-hardening/specs`: three delta
  files, the same text.
- Two comments: `packages/client/src/components/dialogs/LeaveRoomDialog/index.js`
  and `packages/sdk/src/app/(private)/_hooks/usePrivateOwnerChangeFlow.ts`.
- No code, mock, test or locale change.
