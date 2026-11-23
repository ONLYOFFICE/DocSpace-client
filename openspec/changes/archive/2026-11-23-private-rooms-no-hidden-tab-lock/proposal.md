# Proposal

## Why

With the 5 or 15 minute auto-lock preset the key is wiped from memory as soon
as the tab is hidden. Opening a document of a private room opens the editor in
another tab, so the file list locks every time a document is opened: the user
comes back to Common:KeyLocked and the locked-key block, on a remembered
device as well, where it reads as "remember this device" not working. The rule
buys little in return: an unattended computer is covered by the idle timeout,
and on a remembered device the next operation restores the key without a
prompt anyway.

Decided by the owner on 2026-11-23: the hidden-tab lock is removed for every
preset. This replaces decision 1 of the archived change
`private-rooms-auto-lock-cap` (2026-11-11), which kept it for 5 and 15
minutes.

## What Changes

- No preset locks the identity because the tab is hidden. The three presets
  differ only in the length of the idle time.
- The idle timeout, the 30-minute limit of the in-memory key, Common:LockNow
  and the locks that reach every tab stay as they are.
- The hint under the auto-lock setting (Common:AutoLockHint), which only
  describes the removed rule, is removed with its translations.

Out of scope:

- Restoring the key from the remembered record without an operation asking
  for it (after an idle lock the page still shows Common:KeyLocked until the
  next encrypted operation or Common:UnlockKey).
- The idle timeout presets and their lengths.
- The remembered record and its maximum age.

Decisions that need a human:

1. Whether Common:AutoLockHint is removed (proposed) or reworded to describe
   the idle timeout. A reworded hint has to be translated into every language.

Decided by the owner on 2026-11-23: decision 1 as proposed, the hint is
removed.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the auto-lock presets no longer lock on a
  hidden tab; the requirements that mention that lock (remembered device in
  Keys management, a newly picked preset, locks that stay in their tab) lose
  the mention.
- `private-rooms/encryption-core`: the filename cache scenario no longer
  names a lock on a hidden tab.
- `private-rooms/sdk-surface`: the scenario about a lock of another SDK page
  no longer names a hidden page.

## Impact

- Shared: `context/encryption/EncryptionContext.tsx` (the visibility
  handler), `services/encryption/auto-lock-preference.ts` (the preset flag and
  its reader), their unit tests.
- Client: `components/AutoLockSetting` and its test; two E2E specs that
  exercise the hidden-tab lock (`key-flow-edge-cases.spec.ts`,
  `keys-management-advanced.spec.ts`).
- SDK: a test mock of the removed reader.
- Locales: `AutoLockHint` removed from `public/locales/*/Common.json` with
  its `.meta` files.
- No API or dependency change.
