# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
cases. On the branch today:

- `EncryptionContext.tsx`: `lockAfterReseal` empties the key slot and the
  filename cache and broadcasts a lock with `keysChanged`; unlike `lock` it
  does not call `forgetDeviceUnlock`. `requireIdentity` restores the key from
  the remembered record before it raises any dialog.
- `useRotatePassphraseFlow.tsx`: after `updateEncryptionKeys` it calls
  `lockAfterReseal()` and `refreshKeysFromServer()`. That refresh, in
  `KeysManagement.tsx`, logs a failed read and leaves the list in the user
  store as it was, so `unlock` goes on reading the old `privateKeyEnc`.
- `download.helpers.ts`: both decrypted archives collect the names of the
  files they could not decrypt; when nothing was decrypted they show
  Files:DecryptAllFailed and save nothing. A file wrapped for a key the user
  no longer holds joins the same list as any other failure.
- `KeyChangeDialog.tsx` lists three reasons: reset, recovery, replaced.
  `useRecoverKeyFlow.tsx` re-seals the same key pair under the same key id.

No server behaviour is involved.

## Goals / Non-Goals

**Goals:**

- The smallest change at each of the four places.

**Non-Goals:**

- A record format that lets other devices notice a passphrase change.

## Decisions

1. **`lockAfterReseal` forgets the remembered record.** It gains the
   `forgetDeviceUnlock(userId)` call that `lock` already makes. It has one
   caller, the passphrase change. Alternative: store the envelope's date in
   the record and discard the record on any device when the date differs.
   Not taken (owner, 2026-11-24): more code and a new record field, and a
   device that stays offline keeps its record either way.
2. **The flow puts the new envelope into the key list itself.** After
   `updateEncryptionKeys` succeeds, the flow replaces the `privateKeyEnc` of
   the changed key in the list the page holds, through a callback from
   `KeysManagement.tsx`, and then reads the list again as before. A failed
   read leaves the list with the new envelope. Alternative: retry the read.
   Rejected: the page already has the value it would read.
3. **The archives count the files wrapped for a replaced key apart.** Next to
   the list of failed names each archive keeps a count of the files it left
   out for that cause. When nothing was decrypted and the count equals the
   number of failures, it shows Common:PrivateRoomReplacedKeyBarText (`_one`
   or `_other`, as the room notice picks them) with the count; otherwise
   Files:DecryptAllFailed as today. The text of the notice is reused, so no
   locale key is added.
4. **The recovery reason is deleted.** The list item goes from
   `KeyChangeDialog.tsx` and `KeyChangedReasonRecovery` from every language
   and from `.meta`.

## Risks / Trade-offs

- [A user who changes the passphrase on a remembered device is asked for it
  at the next operation] → intended; the option can be ticked again in that
  dialog.
- [The reused notice text says "here"] → it reads naturally for a folder and
  for a selection made in the open folder.
