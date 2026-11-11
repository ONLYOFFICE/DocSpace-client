# Proposal

## Why

The auto-lock setting of the keys page offers "Off" and "1 hour", and
`key-management` promises that "Off" never locks. Neither is true: the
unlocked key lives in memory for 30 minutes without use at most
(`encryption-core`, "Unlocked identity lives in memory with idle expiry"),
whatever the setting says. The owner decided on 2026-11-10 that the
30-minute limit stays and the setting stops offering more than it keeps.

## What Changes

- The setting offers 5, 15 and 30 minutes. "Off" and "1 hour" are removed,
  and 30 minutes is the default.
- A value stored by an earlier version, off or one hour, is read as 30
  minutes. No migration is written: such a value is no longer an offered
  preset, and a stored value outside the offered set already falls back to
  the default.
- The hint under the setting is reworded, and the labels "Off" and "1 hour"
  are removed from every language.
- **One behaviour the owner has to choose** (decision 1 below). Today a
  timed preset also locks the key as soon as the tab is hidden, and "Off",
  the default, does not. With 30 minutes as the default, keeping that rule
  for every preset would lock the key of every user at every switch to
  another tab, with a passphrase prompt on return unless the device is
  remembered. This proposal therefore keeps the tab-hidden lock for 5 and
  15 minutes only: 30 minutes, the session limit itself, behaves as "Off"
  did, minus the promise.

Proposed wording of the hint `Common:AutoLockHint`, for the owner to
approve before it is translated: "The 5 and 15 minute options also lock
keys when the tab is hidden."

Out of scope:

- The 30-minute limit of the in-memory key, which stays as it is.
- The remembered-device record and its own maximum age.
- The prompt for the passphrase and the locked state of a room, which are
  separate work.

Decisions that need a human:

1. Whether the 30-minute preset also locks when the tab is hidden.
   Proposed: no (5 and 15 minutes only). The alternative, every preset
   locks on a hidden tab, is simpler to explain and stricter, and changes
   the default experience for every user.
2. The wording of `Common:AutoLockHint`.

Decided by the owner on 2026-11-10: the 30-minute limit stays; the presets
"Off" and "1 hour" are removed. Decided by the owner on 2026-11-11:
decision 1 as proposed, the 30-minute preset does not lock on a hidden
tab; decision 2, the hint reads as proposed above.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Auto-lock timeout presets" offers 5, 15
  and 30 minutes and no longer promises a preset that never locks.

## Impact

- `packages/shared/services/encryption/auto-lock-preference.ts` and its
  tests; `packages/shared/context/encryption/EncryptionContext.tsx` for the
  tab-hidden rule.
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/AutoLockSetting.tsx`
  and its test.
- `public/locales/*/Common.json`: `AutoLockOff` and `AutoLock1h` removed
  with their `.meta` files, `AutoLockHint` reworded and translated again.
- No API or dependency change.
