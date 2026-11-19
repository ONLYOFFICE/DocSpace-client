# Proposal

## Why

The release-readiness review of 2026-11-19 (code reading and a local stand
with Document Server 10.0.3.58) checked the lock of the encryption key
against the promise of the key-management spec: a locked or removed key is
locked everywhere the key can be, and every page says so. This change
writes that promise down where the main spec leaves it implicit, for every
place that holds the key or shows its state:

- what this device keeps of a key, after the key is deleted or all keys are
  reset;
- every open page of the user in this browser (files, editor, SDK pages),
  after a lock, a key change or a logout in one of them, and after a new
  auto-lock preset;
- the key state shown on the page, whatever removed the key from memory;
- the requests that wait for the unlock dialog, the activity that counts
  against the idle time, and three details of Keys management and key
  setup.

## What Changes

- Deleting the key or resetting all keys removes this device's remembered
  record and passkey record of that key. A record whose key is not in the
  user's known key list, and a remembered record past its maximum age, are
  removed when a page loads.
- Lock now, Forget device, a key deletion, a reset, a passphrase change and
  a logout lock the identity in every open page of the same user in this
  browser, the editor and the SDK pages included, without a reload. Locks
  by idle time, a hidden tab or the in-memory expiry stay with their page.
  An unlock is never shared. The SDK's lock channel becomes the shared one.
- After a key deletion, a reset or a passphrase change in one page, the
  other pages read the key list again before they unlock.
- An auto-lock preset picked in one page applies at once in the others.
- The key state shown in the room header, in Keys management and by the
  locked-key block follows the key in memory, whatever removed it.
- A reset deletes every key the server lists at the moment it is
  confirmed.
- Several operations waiting for the locked key share one unlock dialog
  and all receive its outcome.
- Scrolling a list or a panel counts as activity for the idle time.
- Keys management shows the "remembered until" line right after an unlock
  with the remember option, and shows no "No key" state while the key list
  is not known.
- Key setup cannot be closed while the new key is being registered, so the
  outcome is reported once.

No new user-facing text, so no locale change.

Out of scope:

- The lifetime of the passkey record beyond a key deletion and a reset: it
  has no maximum age, and Lock now keeps it, as the main spec describes.
- What a passphrase change does to the remembered record and the passkey
  record: they hold the same key pair, which a passphrase change keeps
  ("A passphrase change keeps the key pair").
- Records of other accounts that once used this browser.
- Pages embedded by a third-party host: a browser that partitions storage
  by the top-level site keeps those frames on a channel of their own (see
  design.md, Risks).

Dependencies:

- No work on `../server` or the Document Server. The change uses the
  key-list read and the key deletion the page already calls, and states
  nothing new about them.
- No ui-kit change.

Order: task groups 1 and 2 come first and can be released on their own;
groups 3 to 5 build on them.

## Decisions

Taken by the owner on 2026-11-19:

1. The explicit locks reach the other pages: Lock now, Forget device, a key
   deletion, a reset, a passphrase change and a logout. Idle time, a hidden
   tab and the in-memory expiry stay with their page, since each page
   counts its own activity and a hidden-tab lock would otherwise lock the
   page the user has just switched to. The SDK pages follow the same rule
   as the other pages (design decision 3).
2. A failed read of the key list at the moment of a reset refuses the
   reset: Common:ResetEncryptionKeysFailed, nothing deleted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: seven requirements added; "Remember this
  device", "Lock now", "Auto-lock timeout presets", "A newly picked
  auto-lock preset applies at once" and "Reset all keys with a typed token"
  modified.
- `private-rooms/encryption-core`: "Remembered device keeps the key in
  IndexedDB" modified (a key deletion and a reset end the record).
- `private-rooms/sdk-surface`: "Shell side effects" modified (which locks
  of another page the SDK pages follow).

## Impact

- `packages/shared/services/encryption/`: `secret-storage.ts`,
  `device-unlock-store.ts`, `passkey-unlock.ts`, `auto-lock-preference.ts`
  and a lock channel module moved here from the SDK.
- `packages/shared/context/encryption/EncryptionContext.tsx`.
- `packages/shared/store/AuthStore.ts` (logout).
- `packages/shared/dialogs/key-generation/` (key setup while registering).
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/**`
  (flows, `KeysManagement.tsx`, `KeysList.tsx`) and
  `packages/client/src/components/EncryptionProviderWrapper.jsx`.
- `packages/doceditor/src/components/EncryptionProviderWrapper.tsx`.
- `packages/sdk/src/app/(private)/`: `_store/EncryptionShell.tsx`,
  `_store/EncryptionIdentityStore.tsx`; `BroadcastLockSync.tsx` and
  `_utils/broadcast-lock.ts` give way to the shared module.
- Unit tests next to each, and a new E2E spec
  `packages/client/__tests__/keys-management-cross-tab.spec.ts`.
