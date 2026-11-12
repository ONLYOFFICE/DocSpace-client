# Proposal

## Why

Three small defects around a locked key, each found against the specs on
2026-11-11 and 2026-11-12:

- "Forget device" removes the remembered record but leaves the key in
  memory, so the files keep opening without the passphrase until the
  auto-lock or a page reload, although "Remember this device" promises a
  prompt at the next operation. A user who forgets a device they are about
  to leave is not protected.
- A newly picked auto-lock preset is followed by the hidden-tab rule at
  once, but by the idle timer only when the timer is next restarted, so a
  user who shortens the timeout can stay unlocked for the old one.
- The unlock dialog is raised on entering every folder of a private room.
  A user who cancelled it once is asked again at each folder, although
  the locked-key bar with its unlock action is there since
  `private-rooms-locked-state`.

## What Changes

- "Forget device" locks the identity as well: the in-memory key and the
  filename cache are wiped with the remembered record.
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
- Merging "Forget device" and "Lock now" (decision 2 below).
- The SDK private pages: they have no entry prompt of their own and no
  Keys management page.

## Decisions needed

1. Taken, owner, 2026-11-12: "Forget device" while unlocked and the
   auto-lock preset picked while unlocked are fixed with code.
2. Open. After this change "Forget device" and "Lock now" do the same
   thing while the identity is unlocked on a remembered device: both lock
   and both remove the record ("Lock now" already forgets the device by
   its requirement). Proposed: keep both links, since each is shown in its
   own state (remembered, unlocked) and the user looks for either word.
   The alternative, "Lock now" keeping the remembered record, would turn
   it into a no-op on a remembered device.
3. Open. "Once per private room" for the entry dialog (proposed), or once
   until the user leaves the Private section altogether. Per room keeps
   the question tied to the place whose files need the key.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: three requirements added.

## Impact

- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysManagement.tsx`
  (forget device).
- `packages/shared/services/encryption/auto-lock-preference.ts` and
  `packages/shared/context/encryption/EncryptionContext.tsx` (preset
  change reaches the idle timer).
- `packages/client/src/components/EncryptionProviderWrapper.jsx`,
  `packages/client/src/helpers/roomUnlockRequest.ts` and
  `packages/client/src/pages/Home/Section/Body/PrivateRoomLockedBar.tsx`
  (entry dialog per room).
- Unit tests next to each, and a case in
  `packages/client/__tests__/private-room-access.spec.ts`.
