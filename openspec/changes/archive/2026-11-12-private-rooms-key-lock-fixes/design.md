# Design

## Context

Read in the client code on 2026-11-12 at `91b5c2d0a89`. No stashed design
document covers these three behaviours, and nothing here concerns the
server.

- Forget device: `handleForgetDevice` in `KeysManagement.tsx` calls
  `forgetDeviceUnlock` and shows the toast; the lock of the encryption
  context is not called. "Lock now" on the same page locks through the
  context and forgets the device.
- Auto-lock: the idle timer effect of `EncryptionContext.tsx` reads
  `getAutoLockTimeoutSeconds()` when it starts and depends on the unlocked
  state and the suspend count only; the hidden-tab handler calls
  `locksWhenTabHidden()` at each event. `setAutoLockPreset` writes
  localStorage and notifies nobody.
- Entry dialog: `RoomUnlockEffect` in `EncryptionProviderWrapper.jsx`
  remembers the id of the folder it asked for and asks again for any other
  folder id; `roomUnlockRequest` keeps the id of the folder whose request
  was answered, and `PrivateRoomLockedBar` shows only when that id is the
  open folder.

## Goals / Non-Goals

Goals: the three behaviours of the delta, each with a unit test named
after its scenario and one E2E case for the entry dialog.

Non-goals: new texts; any change to "Lock now", to the lifetime of the
remembered record or to the presets themselves.

## Decisions

1. **One link at a time instead of a second lock.** The forget link is
   rendered only while the identity is locked; the "remembered until"
   line keeps its place in both states, and "Lock now" stays as it is.
   Making "Forget device" lock as well was the first proposal; the owner
   rejected two links with one effect on 2026-11-12. "Lock now" keeping
   the record was rejected too: on a remembered device the key would come
   back silently at the next operation. The line gets a test id, since the
   E2E case that waited for the forget link while unlocked now waits for
   the line.
2. **The preference module announces a preset change, the context
   restarts its timer.** `auto-lock-preference` gets a small subscribe
   function called by `setAutoLockTimeoutSeconds`; the context keeps a
   counter in state, bumped by the subscription, among the dependencies of
   the idle timer effect. Rejected: reading the preference inside the
   timer callback, which cannot shorten a timer already armed for longer.
   A change made in another tab is out of scope: the storage event is not
   listened to today either.
3. **The entry request is keyed by the room, not the folder.**
   `RoomUnlockEffect` and `roomUnlockRequest` use the id of the room the
   open folder belongs to (the root room id of the selected folder, the
   folder id itself at the root of the room); the bar compares the same
   id. The reset on leaving private rooms stays, so a second visit to the
   same room asks again.

4. **"Inside a private room" is read from the room, not from the open
   folder (found by task 1.4, 2026-11-12).** The entry request and the
   locked-key bar read the `private` flag of the selected folder. A folder
   inside a private room does not carry it: the mock, which mirrors
   `FolderDtoHelper.GetAsync`, answers `private: false` for it, the flag
   being the room's own setting. So in a subfolder the request was reset
   and the bar was never shown, although "A locked key is shown in a
   private room" names "a folder inside one". Both now read the tree
   store's check that the open folder or a part of its path is private,
   the one the client search already uses. The first run of the new E2E
   case failed on exactly this.

## Risks / Trade-offs

- A user who cancelled the dialog and does not notice the bar sees opaque
  names in every folder. Accepted: the bar is at the top of each folder
  and says why.
- The root room id must be set for a folder inside a private room at the
  time the effect runs; task 1.3 checks it on navigation by link straight
  into a subfolder.
