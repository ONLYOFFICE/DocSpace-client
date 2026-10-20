# Private Rooms Key Management Specification

## Purpose
Describes the identity lifecycle as the user experiences it: creating encryption keys, unlocking them on a device, keeping a device unlocked, locking, recovering a lost passphrase, moving keys between devices, resetting all keys or deleting unused ones, and the prompts that guide a user who enters a private room without a usable key. The Keys management tab in the profile is the home of these flows; the unlock dialog appears wherever an encrypted operation needs the identity. Implementation: `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/**`, `packages/shared/dialogs/{passphrase-modal,key-generation,key-recovery,key-change-dialog}`, `packages/shared/context/encryption/EncryptionContext.tsx`, `packages/client/src/components/EncryptionProviderWrapper.jsx`.

## Requirements

### Requirement: Keys management tab exists only behind the feature flag
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile and serve its routes only while private rooms are enabled by the tester opt-in flag.

#### Scenario: Flag off
- **WHEN** a user opens the profile without the flag
- **THEN** no Keys management tab or route exists

### Requirement: Generate a new key
The system SHALL let a user with no key generate one from the Keys management tab (Common:GenerateNewKey) or when choosing the Private room type: the user sets a passphrase, receives a recovery phrase, and the sealed envelope plus public key are registered on the server. Success is confirmed with Common:EncryptionKeyGenerated. The action SHALL NOT be offered while the user has a key.

#### Scenario: First key
- **WHEN** a user without keys completes passphrase creation and acknowledges the recovery phrase
- **THEN** a key pair is registered and the identity is unlocked on this device

#### Scenario: Generation fails
- **WHEN** registration on the server fails
- **THEN** an error toast is shown and no key is left half-registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no way to generate another one

### Requirement: Passphrase strength gate
The system SHALL require a new passphrase of at least 12 characters, show a strength meter with suggestions, and SHALL refuse passphrases that match a common pattern (keyboard rows, sequences, brand names).

#### Scenario: Too short
- **WHEN** the user enters an 11-character passphrase
- **THEN** the confirm button stays disabled

#### Scenario: Common pattern
- **WHEN** the user enters a passphrase built from a keyboard row or the product name
- **THEN** it is rejected as weak even if it is long enough

### Requirement: Recovery phrase is shown once and must be acknowledged
The system SHALL display the 24-word recovery phrase after key generation with print, download (HTML recovery kit) and copy actions, and SHALL require the user to tick the acknowledgement (Common:RecoveryPhraseAcknowledge) before the dialog can be closed.

#### Scenario: Acknowledge before close
- **WHEN** the recovery phrase dialog is open and the checkbox is not ticked
- **THEN** the confirm action is unavailable

#### Scenario: Copy to clipboard
- **WHEN** the user clicks copy
- **THEN** the phrase is copied and Common:Copied is shown

### Requirement: Unlock with the passphrase
The system SHALL prompt for the passphrase (Common:EnterPassphrase) whenever an encrypted operation needs the locked identity, SHALL accept Enter as confirmation, and SHALL report a wrong passphrase with Common:InvalidPassphrase without closing the dialog.

#### Scenario: Enter confirms
- **WHEN** the user types the passphrase and presses Enter
- **THEN** the identity is unlocked and the pending operation continues

#### Scenario: Wrong passphrase
- **WHEN** the entered passphrase does not open the envelope
- **THEN** Common:InvalidPassphrase is shown and the user can retry

#### Scenario: Cancel
- **WHEN** the user closes the dialog
- **THEN** the pending operation is aborted and nothing is decrypted

### Requirement: Forgot passphrase link
The system SHALL offer a Common:ForgotPassphrase link in the unlock dialog once an unlock attempt has failed, leading to the recovery-phrase flow.

#### Scenario: Link after failure
- **WHEN** an unlock attempt failed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL be served without a prompt until the user locks or forgets the device.

#### Scenario: Remembered
- **WHEN** the user unlocks with the option ticked and reloads the page
- **THEN** the next encrypted operation runs without a passphrase prompt

#### Scenario: Forget device
- **WHEN** the user clicks Common:ForgetDeviceButton in Keys management
- **THEN** the stored unlock is removed, Common:DeviceUnlockForgotten is shown, and the next operation prompts again

### Requirement: Passkey unlock
The system SHALL offer a passkey toggle (Common:PasskeyUnlockLabel) when the platform supports it or a passkey is already enrolled. Enrolling requires an unlocked identity; once enrolled, the unlock dialog SHALL try the passkey automatically on open before asking for the passphrase.

#### Scenario: Enrol
- **WHEN** an unlocked user enables the toggle and completes the authenticator prompt
- **THEN** Common:PasskeyEnabled is shown and the toggle stays on

#### Scenario: Enrol fails
- **WHEN** the authenticator does not support the required extension
- **THEN** Common:PasskeyEnrollFailed is shown and the toggle stays off

#### Scenario: Auto-try on unlock
- **WHEN** an enrolled user triggers an unlock dialog
- **THEN** the passkey prompt is attempted once before the passphrase field is used

#### Scenario: Remove
- **WHEN** the user disables the toggle
- **THEN** the passkey record is deleted and Common:PasskeyDisabled is shown

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout from off, 5, 15, 30 or 60 minutes. With a non-zero timeout the identity SHALL lock after that much inactivity (mouse, keyboard, scroll, touch) and also as soon as the tab becomes hidden.

#### Scenario: Idle lock
- **WHEN** the preset is 5 minutes and the user is inactive for 5 minutes
- **THEN** the identity locks and the filename cache is cleared

#### Scenario: Tab hidden
- **WHEN** the preset is non-zero and the tab is hidden
- **THEN** the identity locks immediately

#### Scenario: Preset off
- **WHEN** the preset is off
- **THEN** neither inactivity nor a hidden tab locks the identity

### Requirement: Lock now
The system SHALL offer Common:LockNow while the identity is unlocked; it SHALL wipe the in-memory key, forget the remembered device and confirm with Common:EncryptionLocked.

#### Scenario: Manual lock
- **WHEN** the user clicks Lock now
- **THEN** the identity is locked, the device is forgotten and the next operation prompts for the passphrase

### Requirement: Export a key
The system SHALL export a registered key as a JSON file named after the key fingerprint after the user confirms the passphrase, confirming with Common:EncryptionKeyExported. The export contains the sealed envelope, never the raw private key.

#### Scenario: Export
- **WHEN** the user chooses export and enters the correct passphrase
- **THEN** a `docspace-key-<fingerprint>.json` file is downloaded

### Requirement: Import a key
The system SHALL import a key from a previously exported JSON file (Common:ImportKey) for a user who has no key: the user picks the file, enters its passphrase, and the key is registered for this account and unlocked, confirming with Common:EncryptionKeyImported. Over HTTP the import SHALL be refused with Common:EncryptionRequiresHttps. The action SHALL NOT be offered while the user has a key.

#### Scenario: Import
- **WHEN** a user without a key selects a valid export file and enters the right passphrase
- **THEN** the key becomes the user's key and is unlocked

#### Scenario: Wrong passphrase on import
- **WHEN** the passphrase does not open the imported envelope
- **THEN** Common:InvalidPassphrase is shown and nothing is registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no import

### Requirement: Change passphrase
The system SHALL let the user re-seal their key under a new passphrase after proving the current one, replacing the envelope in place and locking the identity, confirming with Common:PassphraseUpdated. The recovery phrase SHALL keep working.

#### Scenario: Rotate passphrase
- **WHEN** the user enters the current passphrase and a new acceptable one
- **THEN** the envelope on the server is replaced and the old passphrase no longer unlocks it

### Requirement: Recover with the recovery phrase
The system SHALL let the user restore access on this device by entering the 24-word phrase (Common:UseRecoveryPhrase) and then set a new passphrase; success is confirmed with Common:RecoveryPhraseRestored. A wrong phrase SHALL report Common:InvalidRecoveryPhrase.

#### Scenario: Recovery
- **WHEN** the user enters the correct phrase and a new passphrase
- **THEN** the identity is unlocked and sealed under the new passphrase

### Requirement: Delete a key
The system SHALL delete a registered key only after a warning (Common:DeleteKeyWarning) and passphrase confirmation, confirming with Common:EncryptionKeyDeleted.

#### Scenario: Delete
- **WHEN** the user confirms the warning and enters the key's passphrase
- **THEN** the key is removed from the server and from the list

### Requirement: Reset all keys with a typed token
The system SHALL offer Common:ResetEncryptionKeysCta to a user who lost both passphrase and recovery phrase; it SHALL require typing the localized token (Common:ResetEncryptionKeysConfirmationToken, compared trimmed and case-insensitively), then delete every envelope the server lists for the user, unused ones included, lock the identity and refresh the list.

#### Scenario: Token mismatch
- **WHEN** the typed text does not match the token
- **THEN** the confirm button stays disabled

#### Scenario: Partial failure
- **WHEN** some key deletions fail
- **THEN** Common:ResetEncryptionKeysPartialFailure reports the count and the identity is still locked

### Requirement: Device setup hint on entering a private room without keys
The system SHALL show, once per browser session, an info toast (Common:EncryptionDeviceSetupHint) with a link to Keys management when the user enters a private room on a device with no configured key.

#### Scenario: First private room this session
- **WHEN** a user without keys on this device opens a private room
- **THEN** the hint toast appears with the link

#### Scenario: Second room same session
- **WHEN** the same user opens another private room
- **THEN** the hint is not repeated

### Requirement: Ghost-state notification
The system SHALL show, once per session, a toast (Common:GhostStateDetected) linking to Keys management when a download, copy or filename recovery fails because the user's key cannot unwrap the file.

#### Scenario: Unreadable file
- **WHEN** an encrypted operation finds no usable wrap for the current user
- **THEN** the ghost-state toast appears once, later failures in the session stay silent

### Requirement: Key-change dialog
The system SHALL show a dialog when a peer's public key differs from its pin, stating how long the previous key was active, listing possible causes and an out-of-band verification tip, with accept and refuse actions.

#### Scenario: Refuse
- **WHEN** the user refuses the changed key
- **THEN** the operation that needed the peer's key fails and the pin is unchanged

### Requirement: All key dialogs are modal
The system SHALL present the passphrase, recovery-phrase, key-change, key-rotation and reset dialogs as centred modals; no aside or full-screen variant exists.

#### Scenario: Mobile viewport
- **WHEN** a key dialog opens on a narrow screen
- **THEN** it renders as a modal dialog

### Requirement: Unused keys on the server can be deleted
The system SHALL show in Keys management how many of the user's envelopes on the server are not the selected key (Common:UnusedEncryptionKeysNotice) and SHALL offer to delete them (Common:DeleteUnusedEncryptionKeys) after a warning and passphrase confirmation of the selected key; the selected key is never deleted by this action.

#### Scenario: Leftover keys
- **WHEN** the server lists three envelopes for the user
- **THEN** the notice reports two unused keys and the action deletes those two, keeping the selected one

#### Scenario: Single key
- **WHEN** the server lists one envelope for the user
- **THEN** neither the notice nor the action is shown
