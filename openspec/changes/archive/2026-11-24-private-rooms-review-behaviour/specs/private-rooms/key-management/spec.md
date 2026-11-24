# Spec Delta

## MODIFIED Requirements

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL need no prompt until the user locks or forgets the device, deletes or resets the key, or the remembered record exceeds its maximum age (30 days by default). The option SHALL explain that it outlasts auto-lock and expires. It SHALL sit directly under the passphrase field, before the dialog's other links, and SHALL NOT be ticked by default.

#### Scenario: Remembered
- **WHEN** the user unlocks with the option ticked and reloads the page
- **THEN** the next encrypted operation runs without a passphrase prompt

#### Scenario: Forget device
- **WHEN** the user clicks Common:ForgetDeviceButton in Keys management
- **THEN** the stored unlock is removed, Common:DeviceUnlockForgotten is shown, and the next operation prompts again

#### Scenario: Passphrase changed on a remembered device
- **WHEN** the user changes the passphrase of the key on a device that is remembered
- **THEN** the remembered record is removed from this device, and the next encrypted operation asks for the new passphrase or a passkey

#### Scenario: Passphrase changed on another device
- **WHEN** the user changes the passphrase on one device while another device is remembered
- **THEN** the other device keeps its remembered record until it is locked, forgotten or past its maximum age

#### Scenario: Remembered record expired
- **WHEN** a remembered device needs the identity more than 30 days after the record was written
- **THEN** the record is discarded and the user is prompted for the passphrase (or passkey) as if the device had never been remembered

#### Scenario: Option explains the trade-off
- **WHEN** the unlock dialog shows the remember option
- **THEN** its hint (Common:RememberDeviceHint) states that the key stays on this device across auto-lock and expires after 30 days

#### Scenario: Option placed with the passphrase field
- **WHEN** the unlock dialog opens with the remember option
- **THEN** the option follows the passphrase field, comes before the forgot-passphrase and passkey links in the reading and the Tab order, and is not ticked

#### Scenario: Remembered until right after the unlock
- **WHEN** the user unlocks with the option ticked from Common:UnlockKey in Keys management
- **THEN** Common:DeviceUnlockRememberedUntil is shown on the page as soon as the key is unlocked, without a reload or leaving the page

### Requirement: Change passphrase
The system SHALL let the user re-seal their key under a new passphrase after proving the current one, replacing the envelope in place, locking the identity and removing the remembered record of this device, confirming with Common:PassphraseUpdated. The recovery phrase SHALL keep working.

#### Scenario: Rotate passphrase
- **WHEN** the user enters the current passphrase and a new acceptable one
- **THEN** the envelope on the server is replaced and the old passphrase no longer unlocks it

#### Scenario: Key list not read again after the change
- **WHEN** the passphrase is changed and the following read of the key list fails
- **THEN** the page that made the change unlocks with the new passphrase and refuses the old one, without a reload

### Requirement: Key texts do not tie the key to a device
The system SHALL describe the encryption key as the key of the user's account in the texts that prompt for the passphrase or the recovery phrase, report a missing key, or explain a changed key, and SHALL NOT say that the key is stored or configured per device.

#### Scenario: Passphrase prompt
- **WHEN** the unlock dialog shows Common:PassphraseHint
- **THEN** the text asks for the passphrase of the key without naming a device

#### Scenario: Reasons of a key change
- **WHEN** the key-change dialog lists the legitimate reasons of a change
- **THEN** it names a replaced key (Common:KeyChangedReasonReplaced) and a reset, which are the two actions that change a key; it names neither a recovery with the recovery phrase, which keeps the key, nor a reason that keys are stored per device
