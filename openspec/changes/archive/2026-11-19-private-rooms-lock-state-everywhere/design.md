# Design

## Context

Read in the client code on 2026-11-19 at `54bed4b404d`. No stashed design
document covers these behaviours, and nothing here concerns `../server`:
the change calls the key-list read and the key deletion the page already
uses and states nothing new about them. See proposal.md for the why; the
delta specs own the behaviour.

Where the pieces live:

- The in-memory key is a single slot in `services/encryption/secret-storage.ts`,
  bound to the user id, with a 30-minute limit since its last use
  (`SESSION_CACHE_DURATION_MS`).
- The remembered record is in `services/encryption/device-unlock-store.ts`
  (IndexedDB `docspace-device-unlock`), the passkey record in
  `services/encryption/passkey-unlock.ts` (IndexedDB
  `docspace-passkey-unlock`); both are keyed by user id and carry the public
  key they were written for. The maximum age of 30 days belongs to the
  remembered record only.
- `context/encryption/EncryptionContext.tsx` holds the shown state
  (`isUnlocked`), the unlock dialog, the idle timer, the hidden-tab rule and
  `lock()` (Lock now: slot, names, remembered record). The client, the
  editor and the SDK each mount it through a wrapper that loads the key
  list: `packages/client/src/components/EncryptionProviderWrapper.jsx`,
  `packages/doceditor/src/components/EncryptionProviderWrapper.tsx`,
  `packages/sdk/src/app/(private)/_store/EncryptionShell.tsx` with
  `EncryptionIdentityStore.tsx`.
- The key flows of Keys management (`keys-management/flows/*`) delete,
  reset and re-seal through the API and then refresh the list.
- The SDK private layout has a lock channel: `BroadcastLockSync.tsx` over a
  `BroadcastChannel` named per user (`_utils/broadcast-lock.ts`, prefix
  `docspace-encryption-lock`, a random id per tab to skip its own
  messages). It is the mechanism this change reuses.
- `auto-lock-preference.ts` keeps the preset in localStorage under a key
  scoped by user id and announces a change to subscribers of the same page
  (`subscribeAutoLockChange`, from `private-rooms-key-lock-fixes`).

## Goals / Non-Goals

Goals: the behaviour of the three deltas, each scenario with a unit test
named after it, and one E2E spec with two pages for the behaviour across
tabs.

Non-goals: new texts; a change to the passkey record's own lifetime; a new
storage format; the server.

## Decisions

1. **One function removes both records of a key; the context calls it.**
   A new `forgetKeyOnDevice(userId, publicKey?)` in `services/encryption`
   deletes the remembered record and the passkey record (both, or the ones
   bound to `publicKey`). The context gets one entry point for a removed
   key, `lockAfterKeyRemoval()`: it wipes the slot and the names, calls
   `forgetKeyOnDevice`, sets the state, and (decision 3) tells the other
   pages. The delete and reset flows call it, so the page's own state
   follows at once. Rejected: deleting the records
   inside the flows, which would leave the context and the channel out.
2. **Records are pruned where the key list becomes known.** A shared hook
   `useDeviceRecordPruning(userId, keys)` runs in the three wrappers. With
   a user id it removes an expired remembered record; with a key list that
   was read (`keys` an array, never after a failed read) it removes the
   records whose public key the list does not hold. Rejected: pruning
   inside the provider, which never sees a user without a key
   (`userKeys` is null then) and cannot tell a failed read from an empty
   list.
3. **The SDK channel moves to shared and carries explicit locks only.**
   `_utils/broadcast-lock.ts` becomes `services/encryption/lock-broadcast.ts`
   with the same channel name, so pages of the old and the new build of one
   portal still hear each other; `BroadcastLockSync.tsx` is removed and the
   provider itself subscribes, so the client, the editor and the SDK share
   it with no component to mount. Messages: `{ type: "lock", sessionId,
   keysChanged }`. The sender is the place that performs an explicit lock:
   the context's `lock()` (Lock now), `lockAfterKeyRemoval()`
   (`keysChanged`), a passphrase-change entry point `lockAfterReseal()`
   (`keysChanged`), Forget device in Keys management, and the logout in
   `AuthStore.ts` through a plain `broadcastLock(userId)` (no React there).
   Idle, hidden-tab and expiry locks send nothing (proposal, decision 1).
   A receiving page wipes its slot and names and sets the state; it never
   deletes a record (IndexedDB is shared by the pages of the origin, and
   the sender has done it) and never sends on. Rejected: a `storage` event
   on a localStorage flag, which would put a lock marker in storage and
   need a cleanup; sending from an effect on `isUnlocked` as the SDK did,
   which cannot tell an explicit lock from an idle one.
4. **A key change makes the receiver read its list again.** The provider
   gets an optional `onKeysChanged` prop; on a `keysChanged` message it
   locks and calls it. Each wrapper sets its list to unknown (`null`)
   first, which empties `userKeys`, and then reads it again, so the
   envelope read before the change is never offered to the unlock dialog. A failed read leaves the
   list unknown, with the load-failed handling each page already has.
5. **A preset from another page arrives by the `storage` event.**
   `auto-lock-preference.ts` listens to `storage` for the key of the
   current scope and calls its subscribers, which re-arm the idle timer as
   for a local pick; the hidden-tab rule is read at each event already.
   Rejected: the lock channel, since the value is in localStorage anyway
   and the browser announces its change.
6. **The slot announces when it is cleared, and expires on time.**
   `secret-storage.ts` gets `subscribeSlotCleared(listener)`, called on
   every clearing of the slot (lock, user switch, expiry); the expiry is
   armed as a timer when the slot is filled and moved on use, one timer
   re-armed for the remainder when it fires early, not one per read. The
   context subscribes and sets `isUnlocked` to false, so a clearing by any
   module, the file-list helpers that read the slot directly included, is
   shown. With that, a passphrase change or a reset whose list refresh
   fails still shows the lock. An expiry on a remembered device behaves as
   an auto-lock: the record stays, the next operation restores it.
7. **Reset reads the list at confirmation.** The reset flow calls
   `getEncryptionKeys()` when the user confirms and deletes what it
   returns; a failed read shows `ResetEncryptionKeysFailed` and deletes
   nothing (proposal, decision 2).
8. **Waiting requests form a list.** `requireIdentity` keeps an array of
   resolvers; the first request opens the dialog, later ones join. Unlock,
   cancel and a reset of the context (no key) settle all of them and empty
   the list.
9. **Activity is heard in the capture phase.** The idle listeners are
   added to `document` with `capture: true`, so a scroll of an inner list
   or panel, which does not bubble, restarts the idle time.
10. **The unlock waits for the remembered record.** `unlock()` awaits
    `persistDeviceUnlock` before it sets the state, so the effect of Keys
    management that reads the record date runs after the write. A failed
    write does not fail the unlock.
11. **An unknown list is passed as unknown.** `KeysManagement.tsx` passes
    `null` while the list is not known and `KeysList.tsx` shows a loader
    for `null` and the no-key badge only for an empty array; the
    load-failed block stays where it is.
12. **Key setup ignores a close while busy.** `KeySetupDialog.tsx` passes
    the pending state to its close guard, which ignores the cross and
    Escape while it is set, and disables the cancel action; the flow
    settles once from the registration.

## Risks / Trade-offs

- [A browser that partitions storage by top-level site puts an SDK frame
  embedded by a third-party host on its own channel] → Accepted and out of
  scope: the frame still locks by its own idle and hidden-tab rules, and
  an explicit lock inside it reaches the frames under the same host.
- [Pages of an older build in another tab send every kind of lock] → Only
  during a deployment; they lock this page more often, never less.
- [A tab that is frozen or discarded by the browser misses a message] →
  A frozen tab runs the message when it resumes; a discarded one reloads
  without a key in memory.
- [The expiry timer runs while the page is in the background] → Browsers
  delay timers of hidden pages; the slot is also checked on each read, so
  a late timer never lets an expired key be used.
- [Reading the key list again in every tab after a key change] → One
  request per open page and change; accepted.

## Migration Plan

None: no stored format changes. The channel keeps its name, so an SDK page
of the previous build and a page of this build interoperate.
