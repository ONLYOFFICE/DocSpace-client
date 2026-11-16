# Design

## Context

See proposal.md for the motivation. What shapes the approach:

- **The server (read 2026-11-11 at `a7d94e4b81`).** A share request on a
  private room can be answered with 403 and the server's own English
  message. A permission refusal of the same request is a 403 too; the two
  differ only by the message text, and the answer carries no reason code.
  The server side of this is tracked outside the repository.
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
  `withoutKeys`) already answers such a request with the server's 403, so
  it needs no change.

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
   text. Rejected by the owner
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
4. **The SDK uses the same helper and the same key.** Its leave dialog
   closes after the refusal; its private members view shows the message.
5. **The shell's handler is left alone.** It defers to an error toast the
   caller shows, so the message replaces `Common:AccessDenied` without a
   second toast.
6. **One short message for the three actions.** The owner decided on
   2026-11-11 that the text is a single short sentence naming the cause,
   because a toast is gone before a longer one is read. Alternative: two
   messages, one for the user's own leave and one for another member, each
   saying what ends the refusal. Rejected by the owner: too long to read in a
   toast.

## Risks / Trade-offs

- [A 403 for another reason, such as rights lost a moment ago, gets a
  message that names missing keys] → Accepted for a short text; the
  server-side reason code, once there, lets a later change narrow it.
- [A resolved leave action no longer means the user left] → The action is
  awaited by the dialog and the owner-change flow only, and neither does
  anything after it that assumes the leave; the tests of both pin that.
- [The message does not say how to end the refusal] → Accepted for the
  beta: the message names the cause in the user's language.
