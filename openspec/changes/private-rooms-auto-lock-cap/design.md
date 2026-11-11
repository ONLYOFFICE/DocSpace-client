# Design

## Context

See proposal.md for the motivation. No stashed design document covers the
presets; the code is the source.

- `packages/shared/services/encryption/auto-lock-preference.ts` holds the
  presets (off, 5m, 15m, 30m, 1h), the default (off, 0 seconds) and the
  read of the stored value, which returns the default for anything that is
  not the seconds of an offered preset.
- `packages/shared/context/encryption/EncryptionContext.tsx` runs two
  effects on the stored value: with a non-zero timeout it locks after that
  much inactivity (mouse, keyboard, scroll, touch), and locks at once when
  the tab becomes hidden; with zero it does neither. Both are suspended
  while an upload or another long operation holds the auto-lock.
- `packages/shared/services/encryption/secret-storage.ts` discards the
  in-memory key after `SESSION_CACHE_DURATION_MS`, 30 minutes without use,
  independently of the setting. This is why "Off" and "1 hour" never did
  what they said.
- `AutoLockSetting.tsx` lists the five options with their labels and the
  hint `Common:AutoLockHint`: "Timed options also lock keys when the tab is
  hidden. Keys always lock after 30 minutes without use."
- Two E2E specs set the stored value to 300 seconds to get the tab-hidden
  lock (`keys-management-advanced.spec.ts`, `key-flow-edge-cases.spec.ts`);
  none selects "Off" or "1 hour".

## Goals / Non-Goals

**Goals:**

- The setting offers only what the session limit lets it keep.
- A user who never touched the setting sees no new prompt because of this
  change.

**Non-Goals:**

- Changing the session limit or the remembered-device rules.

## Decisions

1. **Three presets, 30 minutes the default.** The whitelist of the read
   does the migration: stored 0 and 3600 are no longer offered, so they
   read as the default. Alternative: rewrite the stored value on read.
   Rejected: nothing needs the stored value to change.
2. **The tab-hidden lock applies to presets shorter than the session
   limit (proposed, proposal decision 1).** The rule is stated on the
   preset, not on a magic number in the context: a preset carries whether
   it locks on a hidden tab. With the default at 30 minutes this keeps
   today's default experience, where a switch to another tab does not
   lock. Alternative: every preset locks on a hidden tab. Not proposed: it
   turns the default into a prompt at every return to the tab, the
   complaint the owner raised about prompts on every page load.
3. **The inactivity timer runs for every preset.** At 30 minutes it
   duplicates the session limit closely (inactivity of the user against
   use of the key) and costs nothing; leaving it out would make one preset
   a special case in the timer too.
4. **Unused labels leave every language.** `Common:AutoLockOff` and
   `Common:AutoLock1h` are removed from all locale files with their `.meta`
   files, as the unused-key check of the locale tests requires.
5. **The hint is reworded, so its translations are redone.** Only the
   wording changes, which no test catches; the key is translated again
   with the `translate-key` skill in the same task.

## Risks / Trade-offs

- [A user who chose "1 hour" finds 30 minutes selected] → It was 30 minutes
  in effect already; the setting now says so.
- [A user who chose "Off" to avoid the tab-hidden lock keeps it avoided
  only under decision 2 as proposed] → Under the alternative their key
  starts locking on a hidden tab; the owner decides knowing this.
- [The hint in 31 languages is machine-translated] → As for every key of
  the feature so far; noted in the task.
