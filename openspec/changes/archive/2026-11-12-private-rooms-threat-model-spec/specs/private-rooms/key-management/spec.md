# Spec Delta

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
