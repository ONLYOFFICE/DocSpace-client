# Spec Delta

## ADDED Requirements

### Requirement: Unused keys on the server can be deleted
The system SHALL show in Keys management how many of the user's envelopes on the server are not the selected key (Common:UnusedEncryptionKeysNotice) and SHALL offer to delete them (Common:DeleteUnusedEncryptionKeys) after a warning and passphrase confirmation of the selected key; the selected key is never deleted by this action.

#### Scenario: Leftover keys
- **WHEN** the server lists three envelopes for the user
- **THEN** the notice reports two unused keys and the action deletes those two, keeping the selected one

#### Scenario: Single key
- **WHEN** the server lists one envelope for the user
- **THEN** neither the notice nor the action is shown

## MODIFIED Requirements

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

### Requirement: Reset all keys with a typed token
The system SHALL offer Common:ResetEncryptionKeysCta to a user who lost both passphrase and recovery phrase; it SHALL require typing the localized token (Common:ResetEncryptionKeysConfirmationToken, compared trimmed and case-insensitively), then delete every envelope the server lists for the user, unused ones included, lock the identity and refresh the list.

#### Scenario: Token mismatch
- **WHEN** the typed text does not match the token
- **THEN** the confirm button stays disabled

#### Scenario: Partial failure
- **WHEN** some key deletions fail
- **THEN** Common:ResetEncryptionKeysPartialFailure reports the count and the identity is still locked

### Requirement: Ghost-state notification
The system SHALL show, once per session, a toast (Common:GhostStateDetected) linking to Keys management when a download, copy or filename recovery fails because the user's key cannot unwrap the file.

#### Scenario: Unreadable file
- **WHEN** an encrypted operation finds no usable wrap for the current user
- **THEN** the ghost-state toast appears once, later failures in the session stay silent

## REMOVED Requirements

### Requirement: Switch the active key with room migration
**Reason**: A user has one key on the client; there is no other key to switch to.
**Migration**: Remove "Use on this device" and the switch flow; a different key is reached by delete or reset.

### Requirement: Interrupted migration can be resumed
**Reason**: Key migration no longer exists.
**Migration**: Remove the resume banner and its checkpoints; stored checkpoints are ignored.

### Requirement: This device marker
**Reason**: The key list shows the user's one key; there is no other key to tell apart.
**Migration**: The single key card shows the lock state of this device instead of a per-key marker.
