# Proposal

## Why

Three small defects around a locked key, each found against the specs on
2026-11-11 and 2026-11-12:

- "Forget device" removes the remembered record but leaves the key in
  memory, so the files keep opening without the passphrase until the
  auto-lock or a page reload, although "Remember this device" promises a
  prompt at the next operation. A user who forgets a device they are about
  to leave is not protected. Next to it "Lock now" already locks and
  forgets the device, so a fixed "Forget device" would be a second link
  for the same action.
- A newly picked auto-lock preset is followed by the hidden-tab rule at
  once, but by the idle timer only when the timer is next restarted, so a
  user who shortens the timeout can stay unlocked for the old one.
- The unlock dialog is raised on entering every folder of a private room.
  A user who cancelled it once is asked again at each folder, although
  the locked-key bar with its unlock action is there since
  `private-rooms-locked-state`.

## What Changes

- "Forget device" and "Lock now" are offered one at a time: while the
  identity is unlocked only "Lock now", which locks and forgets the
  device; while it is locked on a remembered device only "Forget device".
  The "remembered until" line stays in both states. "Forget device" is
  then never pressed with a key in memory, so its code does not change.
- Picking an auto-lock preset restarts the idle timer of an unlocked
  identity with the new length.
- The unlock dialog on entry is raised once per private room; inside the
  room the locked-key bar is shown instead. Another private room asks
  again.

No new user-facing text, no locale change, no server or Document Server
work: all three are client behaviour.

Out of scope:

- The passphrase composition rules, which the owner kept as they are on
  2026-11-12 (`private-rooms-threat-model-spec`, decision 3).
- The SDK private pages: they have no entry prompt of their own and no
  Keys management page.

## Decisions needed

1. Taken, owner, 2026-11-12: "Forget device" while unlocked and the
   auto-lock preset picked while unlocked are fixed with code.
2. Taken, owner, 2026-11-12: two links that do the same are not kept.
   One is offered at a time, "Lock now" while unlocked and "Forget device"
   while locked on a remembered device. No hint is added to say that
   "Lock now" forgets the device: it would be a new text in every
   language.
3. Taken, owner, 2026-11-12: the entry dialog is raised once per private
   room, not once per stay in the Private section.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: three requirements added; the scenario
  "Device section" of "Keys management controls are reachable with Tab"
  reworded and one added.

## Impact

- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysManagement.tsx`
  (which of the two links is shown).
- `packages/shared/services/encryption/auto-lock-preference.ts` and
  `packages/shared/context/encryption/EncryptionContext.tsx` (preset
  change reaches the idle timer).
- `packages/client/src/components/EncryptionProviderWrapper.jsx`,
  `packages/client/src/helpers/roomUnlockRequest.ts` and
  `packages/client/src/pages/Home/Section/Body/PrivateRoomLockedBar.tsx`
  (entry dialog per room).
- Unit tests next to each, a case in
  `packages/client/__tests__/private-room-access.spec.ts`, and the case of
  `packages/client/__tests__/keys-management-advanced.spec.ts` that looks
  for the forget link while unlocked.
