# Proposal

## Why

A review of the private-rooms specs on 2026-11-24 found four places where the
product does something the specs leave open or state wrongly, and where the
owner chose the behaviour rather than a rewording:

- The specs do not say whether a passphrase change ends the remembering of
  the device it is made on.
- The specs do not say which envelope the page works with when the key list
  cannot be read again after a passphrase change.
- A decrypted archive in which no file can be decrypted ends in the general
  Files:DecryptAllFailed, also when the one cause is known.
- The key-change dialog offers a recovery with the recovery phrase as a
  reason of a changed key, although a recovery keeps the key.

## What Changes

- Changing the passphrase removes the remembered record of the device the
  change is made on. Other devices keep theirs.
- After a passphrase change the page that made it holds the new envelope
  whether or not the key list can be read again.
- A decrypted download of several files or of a folder, all of which are
  wrapped for a key the user no longer holds, shows
  Common:PrivateRoomReplacedKeyBarText with their number. Any other case in
  which nothing decrypts keeps Files:DecryptAllFailed.
- The key-change dialog no longer lists a recovery among the reasons;
  Common:KeyChangedReasonRecovery is removed from every language.

Out of scope:

- The passkey record: it is a credential the user enrolled on purpose and a
  passphrase change does not touch it.
- Ending the remembering on other devices after a passphrase change.
- The wording defects of the same review that change no behaviour; they get a
  change of their own.

Decisions that need a human: none open. Decided by the owner on 2026-11-24:
the remembered record is removed on the device that changes the passphrase
only; the archive names the cause when it is the one cause; the recovery
reason is removed from the dialog.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: a passphrase change ends the remembering on
  its device and leaves the page with the new envelope; the key-change dialog
  names two reasons.
- `private-rooms/file-operations`: the decrypted archives say what they show
  when no file can be decrypted.

## Impact

- Shared: `context/encryption/EncryptionContext.tsx` (the lock after a
  re-seal), `dialogs/key-change-dialog`.
- Client: `keys-management/flows/useRotatePassphraseFlow.tsx`,
  `KeysManagement.tsx`, `store/filesActionsStore/download.helpers.ts`.
- Locales: `KeyChangedReasonRecovery` removed from
  `public/locales/*/Common.json` with its `.meta` file.
- No API or dependency change.
