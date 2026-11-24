# Proposal

## Why

A user who replaced their key and then invites a member into a private room
cannot re-wrap the files that are wrapped for their previous key. The
invitation result and the retry say Common:EncryptedReencryptPartialFailure,
"N encrypted file(s) could not be made available to the new members. Try again
later." Trying again cannot help: the inviter's key does not open those files.
Seen on the local stand on 2026-11-24.

## What Changes

- When every file that could not be re-wrapped is wrapped for a key the
  inviter no longer holds, the message after the invitation, the invitation
  result and the retry show Common:PrivateRoomReplacedKeyBarText with their
  number, in the client and in the SDK invite panel.
- Any other or mixed cause keeps Common:EncryptedReencryptPartialFailure.
- The member stays pending and the retry stays offered.

Out of scope:

- The ownership transfer, which reports the same partial failure
  (`private-rooms-server-hardening` carries that requirement).
- Hiding the retry for such a member: another member who can open the files
  can still complete it.
- A text of its own for this place. The notice text is reused, so no locale
  key is added.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: a re-wrap that fails only because of a key
  the inviter no longer holds names that cause.

## Impact

- Shared: `services/private-room/room-encryption.ts`,
  `services/private-room/room-member-flows.ts`.
- Client: `components/panels/InvitePanel/sub-components/InviteResult.js`.
- SDK: `app/(rooms)/_components/invite-panel/sub-components/InviteResult.tsx`.
- No API, locale or dependency change.
