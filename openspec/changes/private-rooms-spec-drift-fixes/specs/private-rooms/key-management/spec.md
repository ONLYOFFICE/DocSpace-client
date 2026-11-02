## MODIFIED Requirements

### Requirement: Passphrase strength gate
The system SHALL require a new passphrase of at least 12 characters, show a strength meter with suggestions, and SHALL refuse passphrases that match a common pattern (keyboard rows, sequences, brand names), at key creation and at a passphrase change alike.

#### Scenario: Too short
- **WHEN** the user enters an 11-character passphrase
- **THEN** the confirm button stays disabled

#### Scenario: Common pattern
- **WHEN** the user enters a passphrase built from a keyboard row or the product name
- **THEN** it is rejected as weak even if it is long enough

#### Scenario: Passphrase change
- **WHEN** the user enters a new passphrase built from a common pattern in the passphrase change dialog
- **THEN** the strength meter shows it as weak, and the change MUST NOT be submitted
