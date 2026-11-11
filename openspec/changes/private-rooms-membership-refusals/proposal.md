# Proposal

## Why

The server refuses, with 403, a leave, a removal and a role change in a private
room when the member concerned has no encryption key: its key check runs on
every change of a user's share, not only when the share is granted. A check on
the release stand on 2026-11-10 showed all three refused, and the client
answering with the server's English sentence ("The user does not have an
encryption key") in a Russian interface. The leave dialog, since
`private-rooms-server-hardening` 6.7, shows that sentence too and stays open
for a retry that cannot succeed.

The refusal itself is the server's to change. Until it does, the client has
to say what happened in the user's language.

## What Changes

- A refused leave, removal or role change in a private room, answered with
  403, is reported with a translated message in place of the server's text.
  The message names the cause and the way out, which a check on the release
  stand on 2026-11-11 confirmed: once the member has keys again, the same
  request passes (design.md, Context). Proposed English wording, for the
  owner to approve before it is translated:
  - `Common:EncryptedLeaveRefused`, for the user's own leave: "Could not
    leave the private room. This happens when you have no encryption keys:
    generate keys in your profile, then try again."
  - `Common:EncryptedMemberAccessRefused`, for a removal or a role change:
    "Could not change this member's access to the private room. This happens
    when they have no encryption keys: ask them to generate keys in their
    profile, then try again."
- The leave dialog closes after such a refusal, since trying again changes
  nothing. Any other failure of a leave (a network error, a server error) is
  shown as it is today and leaves the dialog open.
- The same message covers the leave that follows an owner change with the
  leave option.
- The SDK does the same in its leave dialog and its private members view.
- The record of `private-rooms-server-hardening` 6.7 is corrected: before it
  the client did show a toast for the refused leave, the generic
  `Common:AccessDenied` of the shell's 403 handler; what was missing was the
  dialog's recovery.

Decided by the owner on 2026-11-11:

1. The dialog closes on a 403 in a private room and stays open on other
   failures.
2. The translated text is shown for any 403 of these three actions in a
   private room, with no comparison of server strings, until the server
   reports the reason in a stable way.

Decisions that need a human:

- The English wording of the two messages above, and their split by action
  (proposed: a leave speaks to the user about their own keys, a removal and
  a role change about another member's; which applies follows from the
  action, not from the server's answer).
- Whether the SDK part ships with this change (proposed: yes, the flows are
  the same and share the messages).

Out of scope:

- The refusal itself. Asking the server to run the key check only when a
  user first gets access, and to report the reason with a stable code, goes
  to the backend as tasks of a server follow-up change; this change adds no
  mock and no client code for behaviour the server does not have yet.
- Leaving through the route that clears one's own share
  (`DELETE files/share`), which has no key check. For a caller who may
  manage access it clears every member's share, so it is not a way around
  the refusal.
- Telling a key refusal from another 403. Once the server reports the
  reason, a later change narrows the message to it.
- The wording of other private-room texts.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: adds how the client reports a refused
  leave, removal or role change in a private room, and what the leave dialog
  does after it.
- `private-rooms/sdk-surface`: adds the same report for the SDK's leave
  dialog and private members view.

## Impact

- **Server (`../server`):** none. Read on 2026-11-11 at `a7d94e4b81`: the
  key check of `FileSharingAceHelper.SetAceObjectAsync`, the exception of
  `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` and its mapping in
  `ResponseWrapper` (design.md, Context).
- **Client:** the leave action of the files actions store
  (`packages/client/src/store/filesActionsStore/rooms.helpers.ts`), the
  members view of the info panel
  (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/sub-components/User.tsx`).
- **SDK:** `packages/sdk/src/app/(rooms)/_components/leave-room-dialog`,
  `packages/sdk/src/app/(private)/_components/members/PrivateMemberUser.tsx`.
- **Shared:** a helper next to the private-room services that recognises
  the refusal; two new keys in `public/locales/*/Common.json`, translated
  with the translation skills.
- **E2E:** a case in `packages/client/__tests__/private-room-members.spec.ts`
  on the existing room members mock, which already refuses every entry of a
  member without keys as the server does.
- **OpenSpec:** the record of `private-rooms-server-hardening` 6.7.
