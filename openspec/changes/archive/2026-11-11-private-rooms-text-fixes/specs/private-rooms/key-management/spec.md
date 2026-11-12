# Spec Delta

## ADDED Requirements

### Requirement: Key-change dialog speaks the interface language
The system SHALL show the dates and the duration of the key-change dialog in the interface language: the duration as a number with a unit word of that language, never with fixed Latin suffixes.

#### Scenario: Duration in the interface language
- **WHEN** the key-change dialog reports how long the known key was active
- **THEN** Common:KeyChangedActiveFor carries a duration formatted in the interface language, such as "5 days" in English

### Requirement: Key texts do not tie the key to a device
The system SHALL describe the encryption key as the key of the user's account in the texts that prompt for the passphrase or the recovery phrase, report a missing key, or explain a changed key, and SHALL NOT say that the key is stored or configured per device.

#### Scenario: Passphrase prompt
- **WHEN** the unlock dialog shows Common:PassphraseHint
- **THEN** the text asks for the passphrase of the key without naming a device

#### Scenario: Reasons of a key change
- **WHEN** the key-change dialog lists the legitimate reasons of a change
- **THEN** it names a replaced key (Common:KeyChangedReasonReplaced), a recovery and a reset, and no reason that keys are stored per device

## MODIFIED Requirements

### Requirement: Export a key
The system SHALL export a registered key as a JSON file named after the key fingerprint after the user confirms the passphrase, confirming with Common:EncryptionKeyExported. The export contains the sealed envelope, never the raw private key. The file name SHALL NOT carry a product or brand name.

#### Scenario: Export
- **WHEN** the user chooses export and enters the correct passphrase
- **THEN** an `encryption-key-<fingerprint>.json` file is downloaded
