# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.
Nothing here depends on server behaviour: the change is about how the
client reads the failure of its own request.

Client, as read on 2026-11-11:

- `UserStore.encryptionKeys` (`packages/shared/store/UserStore.ts`) is
  `null` until `getEncryptionKeys` succeeds; a failed read leaves it
  `null`. `AuthStore.init` and the files section's `initFiles`
  (`filesStore/actions.helpers.ts`) call it and swallow the error.
- `EncryptionProvider` (`packages/shared/context/encryption/EncryptionContext.tsx`)
  takes `keysLoaded`, default `true`. The SDK passes
  `identityStore.keys !== null`; the client's `EncryptionProviderWrapper`
  passes nothing.
- Places that read `null` as an empty list:
  - `ItemIcon.tsx`: `hasEncryptionKeys` is false, so the no-access lock
    shows;
  - `filesStore/contextOptions.helpers.ts`: `hasKeys` is false, so open
    and download entries are withheld;
  - `filesStore/fetch.helpers.ts`: Common:EncryptionKeysNotConfigured on
    entering a private room;
  - `DeviceSetupHintEffect` in the wrapper: the hint follows
    `hasConfiguredKey` alone;
  - `filesActionsStore/download.helpers.ts` (single file, zip) and
    `copyMove.helpers.ts`: Common:EncryptionKeysNotConfigured;
  - `uploadDataStore/selectors.helpers.ts`, read by the upload gate and by
    `GlobalEvents/CreateEvent.js`: no public key, so the upload is refused
    with Common:EncryptionKeysRequiredForUpload and the creation with
    Common:EncryptionKeysNotConfigured.
- `resolvePrivateRoomKeys`
  (`packages/shared/services/private-room/create-room-gate.ts`) already
  reads an unknown list again for room creation and reports
  `fetchFailed`.

## Goals / Non-Goals

**Goals:**

- A failed key-list request is shown as a failed request, with a way to
  retry, and never as "no key".
- A user who holds a key gets their room back after a successful retry
  without reloading the page.

**Non-Goals:**

- Automatic retries with a timer.
- Changing what a user with a known empty list sees.

## Decisions

1. **The state lives where it already does: `encryptionKeys === null`
   means unknown.** No new flag in the store. Alternative: a separate
   load-status field. Rejected: every writer of the list would have to
   keep two fields in step, and `null` already has this meaning for Keys
   management and room creation.
2. **One action reads an unknown list: `UserStore.ensureEncryptionKeys`.**
   It returns the known list at once, otherwise starts
   `getEncryptionKeys` or joins the read in flight, and resolves to the
   list or to `null` when the read failed. Every call site below uses it,
   so a room entry and an action started at the same moment share one
   request.
3. **Views do not guess.** While the list is unknown the icon shows no
   no-access lock and the menu withholds nothing on account of keys; the
   action behind an entry settles the question when it is used
   (decision 5). Alternative: show the lock until the list is known.
   Rejected: it is the defect being fixed, and it blinks on every slow
   start.
4. **Room entry reads the list and owns the error toast.** On entering a
   private room with an unknown list, the fetch helper awaits
   `ensureEncryptionKeys`. A failure shows
   Common:EncryptionKeysLoadFailed as an error toast that stays until
   closed, with a Common:TryAgain link built like the link of the
   ghost-state toast. The link calls `ensureEncryptionKeys` again; on
   failure the toast is shown again. On success nothing else is needed:
   the wrapper's `userKeys` and `keysLoaded` change, `RoomUnlockEffect`
   raises the unlock prompt and `FilenameRecoveryEffect` recovers the
   names after it. The toast is shown once per room entry, not per
   sub-folder fetch while it is still open.
5. **Actions read before they refuse.** Download, zip and folder
   download, copy and move, the upload gate and file creation call
   `ensureEncryptionKeys` when the list is unknown. A failed read ends the
   action with Common:EncryptionKeysLoadFailed (an upload row is marked
   failed with that text) and without the device-setup hint; an empty
   list keeps today's refusals.
6. **The hint waits for `keysLoaded`**, as the SDK's
   `DeviceSetupHintEffect` does.

## Risks / Trade-offs

- [A user without a key sees open and download entries for the moment the
  list is unknown] → The action reads the list first and refuses as today
  once it is known to be empty.
- [The retry link is the only way back besides re-entering the room] →
  Re-entering the room and starting any action read the list as well.
- [Two toasts when the room entry and an action fail together] → The
  shared in-flight read makes the action's failure coincide with the
  entry's; the action does not add a second toast while the entry toast is
  open.
