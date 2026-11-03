# Spec Delta

## MODIFIED Requirements

### Requirement: Starting private room creation without a key starts key generation
The system SHALL offer to generate a key first when a user with no encryption key starts creating a private room from the Private section. The dialog SHALL open on the Private type only after generation succeeds. Cancelling SHALL close the private-room creation, and no dialog SHALL be left open. A user whose key list is not known, because it has not loaded or failed to load, SHALL NOT be treated as a user with no key.

#### Scenario: User accepts key generation
- **WHEN** a key-less user presses create in the Private section and confirms the key-generation prompt
- **THEN** the key-generation flow runs and, on success, the create-room dialog opens on the Private type

#### Scenario: User cancels key generation
- **WHEN** a key-less user presses create in the Private section and cancels the prompt
- **THEN** no create-room dialog is left open and no room is created

#### Scenario: User cancels inside key generation
- **WHEN** a key-less user confirms the key-generation prompt and then cancels or discards the passphrase dialog or the recovery-phrase dialog
- **THEN** no create-room dialog is left open, no room is created and no key is registered

#### Scenario: Key list could not be loaded
- **WHEN** a user presses create in the Private section while their key list has not loaded, and fetching it again fails
- **THEN** Common:EncryptionKeysLoadFailed is shown, no key-generation prompt is offered and no create-room dialog is left open
