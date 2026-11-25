# Design

## Context

See proposal.md for the motivation. The stashed SECURITY.md (s6, "Operational
notes") asks to keep the lock on a hidden tab to bound the time the key spends
in memory. It predates the remembered-device record; the archived change
`private-rooms-device-unlock-policy` already recorded that on a remembered
device an auto-lock is restored from the record without a prompt. The code
still matches the stashed document for the 5 and 15 minute presets only.

Today, on the branch:

- `EncryptionContext.tsx` registers a `visibilitychange` handler while no
  operation suspends auto-lock; when the document is hidden and
  `locksWhenTabHidden()` is true it empties the key slot and the filename
  cache and sets the locked state. Nothing restores the key when the tab is
  shown again.
- `auto-lock-preference.ts` carries `locksWhenTabHidden` on each preset
  (true for 5 and 15 minutes) and exports the reader of that name.
- Seen on a local stand with the 5-minute preset and a remembered device:
  after the tab was hidden and shown again the header read Common:KeyLocked
  and the locked-key block was shown, while the remembered record was still
  stored.

No server behaviour is involved.

## Goals / Non-Goals

**Goals:**

- One auto-lock rule per preset: the idle time.
- Less code: the handler, the flag and the reader go.

**Non-Goals:**

- A setting that brings the hidden-tab lock back.

## Decisions

1. **Delete the rule instead of restoring the key on return.** The handler in
   `EncryptionContext.tsx`, the `locksWhenTabHidden` field of the presets and
   the exported reader are removed. Alternative: keep the lock and restore the
   key from the remembered record when the tab is shown. Rejected by the
   owner: the lock then protects nothing on a remembered device and still
   prompts after every opened document on one that is not.
2. **The idle timer is untouched.** It keeps running in a hidden tab, so a tab
   left hidden longer than the preset still locks. Browsers delay timers of a
   background tab; the lock may come later than the preset, never earlier.
   The 30-minute expiry of the in-memory key remains the upper bound.
3. **`suspendAutoLock` keeps its meaning.** It now guards the idle timer only;
   its callers do not change.
4. **The hint is removed, not reworded** (proposal decision 1): the label of
   the setting already says what the list does, and a new text would need
   translating into every language for no new information.

## Risks / Trade-offs

- [A user who picked 5 or 15 minutes to have the key wiped on a tab switch
  loses that] → the idle timeout and Common:LockNow remain; the release notes
  name the change.
- [The key stays in memory of a hidden tab for up to the preset] → accepted by
  the owner; bounded by the idle time and by the 30-minute expiry.
