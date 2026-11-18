# Design

## Context

See proposal.md for the motivation; decision H7 of the review of
2026-11-10 fixes the direction. No stashed design document covers this.
Nothing here depends on server behaviour.

Client, as read on 2026-11-11:

- `RoomUnlockEffect` in
  `packages/client/src/components/EncryptionProviderWrapper.jsx` calls
  `requireIdentity()` once per folder id when the open folder is private,
  the user has a configured key and the identity is locked. A cancelled
  prompt resolves to `null` and nothing follows.
- `requireIdentity` in
  `packages/shared/context/encryption/EncryptionContext.tsx` answers from
  the in-memory cache, then from a remembered device
  (`restoreDeviceUnlock`), and only then opens the passphrase dialog. The
  context exposes `isUnlocked`, `hasConfiguredKey` and `keysLoaded`.
- `FilenameRecoveryEffect` recovers the file names when `isUnlocked` turns
  true.
- `KnowledgeVectorizationBar` in `pages/Home/Section/Body` is the
  precedent for a bar at the top of a room: the kit's `PublicRoomBar` with
  a title, a body and an action link, rendered above the list and above
  the empty view.
- `PassphraseModal` renders, under the field: the forgot-passphrase link
  (after a failed attempt), the remember option with its hint, the passkey
  link. The option is shown where `showRememberDevice` is set, which the
  client's and the SDK's unlock dialogs do.

## Goals / Non-Goals

**Goals:**

- A user in a private room with a locked key sees why the names are opaque
  and can unlock without leaving the room.
- The remember option is met before the secondary links.

**Non-Goals:**

- A bar outside private rooms, or in the SDK.
- Any change to when the entry prompt is raised.

## Decisions

1. **The bar is the kit's `PublicRoomBar`, placed where the knowledge bar
   is.** Same component, same two render sites in the section body (list
   and empty view), info icon. Alternative: a toast. Rejected: it leaves,
   and the state it explains does not.
2. **Shown while: private folder, key list known, key configured, identity
   locked, and no unlock request of the room pending.** The wrapper keeps
   whether its entry request is in flight; the bar reads it and stays
   hidden until that request settles. So the bar never shows under the
   entry dialog and never flashes on a remembered device. A lock that
   happens later (idle timeout, Lock now in another tab) shows the bar at
   once, since no request is pending.
3. **The action calls `requireIdentity()` and, on success, the same
   `syncEncryptedRoom` the entry does.** While its own request is open the
   bar stays as it is, under the dialog. A cancel leaves the bar.
4. **The pending flag is local to the client wrapper**, shared with the
   bar through a small observable next to the wrapper, not added to the
   shared encryption context: only this bar needs it, and the SDK has no
   bar. Alternative: an `isIdentityRequestPending` field on the context.
   Rejected for now: a wider contract for one reader.
5. **The remember option moves up in `PassphraseModal`; nothing else in
   the dialog changes.** Order under the field: remember option with its
   hint, forgot-passphrase link, passkey link. The label takes the weight
   of the field labels (600). It is unticked whenever the dialog opens, as
   today.
6. **Texts go through approval first.** The three keys are added in
   English with translator comments, then translated; no existing key is
   reworded.

## Risks / Trade-offs

- [The bar pushes the list down for every user who cancels on purpose] →
  It is one line with an action, and it is the only place that names the
  state; it leaves with the unlock.
- [Moving the option changes the tab order of the dialog] → The option
  comes before the links for keyboard users as well; the dialog tests that
  pin the order are updated with it.
- [The SDK dialog changes its layout without an SDK task] → It is the same
  shared dialog; the SDK unit suite and the dialog's own tests run in the
  gate.
