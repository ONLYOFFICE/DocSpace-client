# Proposal

## Why

Several texts of private rooms say things the product does not do (review
card C10):

- five texts describe the encryption key as belonging to a device, while a
  user has one key for the account;
- the empty room promises that every symbol is encrypted, while room and
  folder names and file extensions are not;
- the removal warning advises rotating the room's content, an action that
  does not exist;
- a re-encryption notice advises sharing files manually, which is switched
  off in private rooms;
- two skipped-member notices send the user to the Members panel, while a
  skipped invitee never became a member;
- one text advises a key holder who simply has no wrap for a file to set
  up keys;
- the invite panel of a private room promises invitations by email and
  the Guests list, and the Editor role promises form filling;
- two strings bypass i18n: the duration in the key-change dialog and the
  brand in the name of the exported key file.

## What Changes

### Reworded texts (English; for the owner's approval before translation)

| Key | Now | Proposed |
|-----|-----|----------|
| `PassphraseHint` | Enter your passphrase for this device to decrypt your private key. | Enter your passphrase to decrypt your private key. |
| `RecoveryPhraseInputHint` | Enter your 24-word recovery phrase to restore access on this device. You will then be prompted to set a new passphrase for this device. | Enter your 24-word recovery phrase to restore access to your key. You will then be asked to set a new passphrase. |
| `EncryptionDeviceSetupHint` | You don't have encryption keys on this device. <0>Set up encryption</0> to access encrypted files. | You don't have an encryption key yet. <0>Set up encryption</0> to access encrypted files. |
| `EncryptionKeysNotConfigured` | Encryption keys are not configured on this device. Set up your keys in Profile settings to work with encrypted files. | You don't have an encryption key yet. Set it up in your profile to work with encrypted files. |
| `KeyChangedReasonDevice`, renamed `KeyChangedReasonReplaced` | The user generated a new key on a new device (this app stores keys per-device). | The user replaced their encryption key with a new one. |
| `PrivateRoomEmptyTitle` | Welcome to private room where every symbol you type is encrypted | Welcome to the private room, where file contents and file names are encrypted |
| `RemoveUserFromEncryptedRoomWarning` | Remove this user from the encrypted room? Their wrapped key will be removed from every existing file, so they can no longer download new copies. However, anything they already decrypted on their device may still be accessible to them. For full revocation you must rotate the room's content. | Remove this user from the encrypted room? Their wrapped key will be removed from every existing file, so they can no longer download new copies. However, anything they already decrypted on their device may still be accessible to them. |
| `EncryptedReencryptPartialFailure` | {{count}} encrypted file(s) could not be shared with new members. Try again later or share them manually. | {{count}} encrypted file(s) could not be made available to the new members. Try again later. |
| `EncryptedSkippedNoKeys` | Could not share encrypted files with {{users}}: they have not set up encryption keys yet. Ask them to generate keys in their profile and retry from the Members panel. | Encrypted files were not made available to {{users}}: they have not set up an encryption key yet. Ask them to create a key in their profile and try again. |
| `EncryptedSkippedKeyMismatch` | Skipped {{users}}: their encryption key has changed and was not trusted. Re-verify the key and retry from the Members panel. | Skipped {{users}}: their encryption key has changed and was not trusted. Verify the new key with them and try again. |
| `NoAccessToEncryptedFile` | Encrypted — set up your encryption keys in Profile to access this file | Encrypted. Set up your encryption key in your profile to access this file |

### Changes in code, no new text

- A file the user has a key for but no wrap of (`NoAccessError`) is
  reported with Common:EncryptedFileNoAccessYet ("You do not have access to
  this encrypted file yet."), not with Common:NoAccessToEncryptedFile. The
  latter stays the title of the lock badge, which only a user without a
  key sees.
- The invite panel of a private room shows
  Common:InviteToRoomManuallyInfoMembers ("Add existing members to the
  room.") and the placeholder Common:InviteToRoomAddPlaceholder ("Add
  people by name or email"), and no invitation-language choice, whatever
  the portal's guest setting: a private room takes neither invitations by
  email nor guests.
- The Editor role of a private room is described with
  Common:EditorDescription ("Operations with existing files: viewing,
  editing, reviewing, commenting."), without form filling.
- The duration in the key-change dialog ("This key was active for
  {{duration}}.") is formatted by `Intl.NumberFormat` with a unit in the
  interface language ("5 days"), not by the suffixes `s`, `m`, `h`, `d`,
  `mo`, `y`. The dates of that dialog already follow the interface
  language and stay.
- The exported key file is named `encryption-key-<fingerprint>.json`, not
  `docspace-key-<fingerprint>.json`: no brand in the name. Import reads the
  file's content, not its name, so earlier exports keep working.

Out of scope:

- Texts added by the changes of 2026-11-11 (locked-key bar, editor page).
- The security wording of the disclosure and of the beta notice.
- Review of the translations by native speakers.

Decisions that need a human:

1. The eleven texts of the table.
2. The rename of `KeyChangedReasonDevice` to `KeyChangedReasonReplaced`.
   Proposed: rename, so the key does not keep the claim its text loses.
   The alternative keeps the key name and changes the text only.
3. The file name `encryption-key-<fingerprint>.json`. The alternative
   takes the product name from `getBrandName()`, which puts a
   white-label name into the file name.

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Export a key" names the new file name;
  the key-change dialog formats its duration in the interface language.
- `private-rooms/room-membership`: "Invite panel offers people only"
  covers the texts of the panel; a new requirement for the Editor role
  description.
- `private-rooms/file-operations`: a new requirement for the message of a
  file without a wrap for the user.

## Impact

- `public/locales/*/Common.json` and `.meta`: eleven texts in 32
  languages, one key renamed.
- `packages/shared/services/encryption/error-i18n.ts`,
  `packages/shared/dialogs/key-change-dialog/KeyChangeDialog.tsx`,
  `packages/shared/utils/getAccessOptions.tsx`,
  `packages/client/src/components/panels/InvitePanel/sub-components/InviteInput.js`,
  `keys-management/flows/useExportKeyFlow.tsx`, the SDK's invite input if
  it shows the same texts, with their tests.
- E2E specs and mocks that assert on the old English texts.
- No API or dependency change.
