# Spec Delta

## MODIFIED Requirements

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL be served without a prompt until the user locks or forgets the device or the remembered record exceeds its maximum age (30 days by default). The option SHALL explain that it survives auto-lock and expires. The option SHALL sit directly under the passphrase field, before the other links of the dialog, and SHALL NOT be ticked by default.

#### Scenario: Remembered
- **WHEN** the user unlocks with the option ticked and reloads the page
- **THEN** the next encrypted operation runs without a passphrase prompt

#### Scenario: Forget device
- **WHEN** the user clicks Common:ForgetDeviceButton in Keys management while the identity is locked
- **THEN** the stored unlock is removed, Common:DeviceUnlockForgotten is shown, and the next operation prompts again

#### Scenario: Forget device while unlocked
- **WHEN** the user clicks Common:ForgetDeviceButton while the identity is unlocked in memory
- **THEN** the stored unlock is removed and Common:DeviceUnlockForgotten is shown, the identity stays unlocked until it locks by Lock now, auto-lock or a page reload, and only then does an operation prompt again

#### Scenario: Remembered record expired
- **WHEN** a remembered device needs the identity more than 30 days after the record was written
- **THEN** the record is discarded and the user is prompted for the passphrase (or passkey) as if the device had never been remembered

#### Scenario: Option explains the trade-off
- **WHEN** the unlock dialog shows the remember option
- **THEN** its hint (Common:RememberDeviceHint) states that the key stays on this device across auto-lock and expires after 30 days

#### Scenario: Option placed with the passphrase field
- **WHEN** the unlock dialog opens with the remember option
- **THEN** the option follows the passphrase field, comes before the forgot-passphrase and passkey links in the reading and the Tab order, and is not ticked

## ADDED Requirements

### Requirement: Passphrase composition rules
The system SHALL accept a new passphrase, at key creation and at a passphrase change, only when it holds at least one Latin capital letter, one digit and one ASCII punctuation character, on top of the length and the common-pattern rules. The system SHALL NOT count a capital letter of another script as the capital letter.

#### Scenario: No capital letter
- **WHEN** the user enters a 16-character passphrase of lowercase letters, digits and punctuation
- **THEN** the confirm button stays disabled

#### Scenario: Capital letter of another script
- **WHEN** the user enters a long passphrase whose only capital letters are Cyrillic
- **THEN** the confirm button stays disabled

#### Scenario: All rules met
- **WHEN** the user enters a passphrase of 12 characters with a Latin capital letter, a digit and a punctuation character that matches no common pattern, and repeats it
- **THEN** the confirm button is enabled

### Requirement: A passphrase change keeps the key pair
The system SHALL NOT generate a new key pair when the passphrase is changed or the key is recovered with the recovery phrase: only the envelope is sealed again. A copy of the key exported earlier, with the passphrase it was exported under, SHALL keep opening the user's files, so a leaked passphrase or export is not cured by a passphrase change. No action replaces the key pair of a user who keeps access to their files.

#### Scenario: Old export after a passphrase change
- **WHEN** the user exports the key, changes the passphrase, and the old export is later imported on another device with the old passphrase
- **THEN** that device opens the user's encrypted files

#### Scenario: Public key unchanged
- **WHEN** the user changes the passphrase
- **THEN** the public key registered on the server and the Key ID shown in Keys management are the same as before
