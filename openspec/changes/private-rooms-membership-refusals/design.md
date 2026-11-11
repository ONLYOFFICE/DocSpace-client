# Design

## Context

See proposal.md for the motivation. What shapes the approach:

- **The server (read 2026-11-11 at `a7d94e4b81`).**
  `FileSharingAceHelper.SetAceObjectAsync`
  (`products/ASC.Files/Core/Utils/FileSharing.cs:270-276`) calls
  `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` for every entry of a
  share request on a private room whose subject is a user, whatever access
  the entry asks for, so a removal and a self-leave pass through it too.
  The check throws `InvalidOperationException("The user does not have an
  encryption key")` for a missing or empty key set
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:97-105`),
  and `ResponseWrapper` answers that exception type with 403 and its own
  message (`common/ASC.Api.Core/Middleware/ResponseWrapper.cs:86-88`). A
  permission refusal of the same request is a `SecurityException`, answered
  with 403 "Access denied" (`:71-76`). The two differ only by the message
  text; the answer carries no reason code.
- **The stand (2026-11-10, DocSpace 4.1.0.12351).** A member whose keys were
  reset could not leave, and the room owner could neither remove that member
  nor change the role: each request answered 403.
- **The stand again (2026-11-11, DocSpace 4.1.0.12366).** As the room's
  owner, a share request that names that member with the role they already
  hold answered 403 "The user does not have an encryption key" while the
  member had no key, and 200 after the member generated a key in the
  profile; the roles did not change either time. So the refusal lasts only
  while the key set is empty, and the member can end it. The member's own
  leave after generating a key was not run; it passes the same check on the
  same account. The 403 answer also carried the exception's type name,
  which differs from that of a permission refusal; the client does not read
  it (decision 1).
- **The client today.**
  - Leave: the dialog
    (`packages/client/src/components/dialogs/LeaveRoomDialog/index.js`) awaits
    the leave action of the files actions store
    (`onLeaveRoomImpl`, `packages/client/src/store/filesActionsStore/rooms.helpers.ts`),
    which rejects on any failure. Since `private-rooms-server-hardening` 6.7
    the dialog catches the rejection, shows the error as the server worded it
    and stays open. The owner-change flow of the same file awaits the same
    action and shows the error from its own catch.
  - Removal and role change: the members view
    (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/sub-components/User.tsx`,
    `updateRole`) shows the server's error as it is.
  - The shell (`packages/client/src/Shell.jsx`) answers a 403 on a rooms
    address with `Common:AccessDenied` after a short delay, unless the caller
    showed an error toast of its own in the meantime. That is the toast the
    stand showed for the leave before 6.7; a caller that reports the refusal
    itself keeps it away.
- **The SDK today.** Its leave dialog
  (`packages/sdk/src/app/(rooms)/_components/leave-room-dialog/index.tsx`)
  and its private members view
  (`packages/sdk/src/app/(private)/_components/members/PrivateMemberUser.tsx`)
  show the server's message the same way.
- **The mocks.** The room members mock
  (`packages/shared/__mocks__/handlers/rooms/roomMembers.ts`, option
  `withoutKeys`) already refuses every entry that names a member without
  keys with the server's 403, a removal or a role change included, so it
  needs no change.

No stashed design document covers this.

## Goals / Non-Goals

**Goals:**

- One place decides what counts as the refusal, so the client and the SDK
  cannot drift.
- The leave dialog and the owner-change flow each end with one message.

**Non-Goals:**

- Recognising the reason of a 403. The message is shown for every 403 of
  these actions in a private room (proposal, decision 2).
- A new dialog or banner. The message is a toast, like the errors it
  replaces.

## Decisions

1. **The refusal is a 403 on a private room, read from the status.** A small
   helper next to the private-room services answers whether an error of a
   share request is the refusal. Callers pass the error and already know
   whether the room is private. Alternative: compare the server's message
   with "The user does not have an encryption key". Rejected by the owner
   (proposal, decision 2): the text is not a contract, and a renamed
   sentence would silently bring the English text back.
2. **The leave action reports the refusal and settles.** The store's leave
   action catches the refusal of a private room, shows the message and
   resolves; every other failure still rejects. The dialog then closes
   through its ordinary path, the owner-change flow shows nothing more, and
   the dialog's handling of other failures (toast, buttons enabled, open)
   stays as 6.7 left it. Alternative: let the dialog tell the refusal from
   other failures. Rejected: the dialog does not know the room, and the
   owner-change flow would need the same branch a second time.
3. **The members view maps the refusal where it shows the error.** `updateRole`
   serves both the removal and the role change, so one branch in its catch
   covers both. The member list is not touched on a failure today and stays
   so.
4. **The SDK uses the same helper and the same keys.** Its leave dialog
   closes after the refusal; its private members view shows the message.
5. **The shell's handler is left alone.** It defers to an error toast the
   caller shows, so the message replaces `Common:AccessDenied` without a
   second toast.
6. **Two messages, chosen by the action.** A leave is always the user's
   own, so `Common:EncryptedLeaveRefused` speaks about the user's keys; a
   removal and a role change always concern another member, so
   `Common:EncryptedMemberAccessRefused` speaks about theirs. Both say what
   ends the refusal, as the stand check of 2026-11-11 showed. Alternative:
   one neutral message for all three. Rejected: it cannot say whose keys
   are missing, which is the one thing the user can act on.

## Risks / Trade-offs

- [A 403 for another reason, such as rights lost a moment ago, gets a
  message about keys] → The wording says when the refusal happens rather
  than that keys are missing; the server-side reason code, once there, lets
  a later change narrow it.
- [A resolved leave action no longer means the user left] → The action is
  awaited by the dialog and the owner-change flow only, and neither does
  anything after it that assumes the leave; the tests of both pin that.
- [A manager cannot end the refusal alone: only the member can generate the
  keys] → Accepted for the beta: the server's check is the defect, and the
  message tells the manager whom to ask.
