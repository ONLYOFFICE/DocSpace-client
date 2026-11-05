# Spec Delta

## MODIFIED Requirements

### Requirement: Generate a new key
The system SHALL let a user with no key generate one from the Keys management tab (Common:GenerateNewKey) or when choosing the Private room type: the user sets a passphrase, receives a recovery phrase, and the sealed envelope plus public key are registered on the server. Success is confirmed with Common:EncryptionKeyGenerated. The action SHALL NOT be offered while the user has a key, nor while the user's key list is not known because it has not loaded or failed to load.

#### Scenario: First key
- **WHEN** a user without keys completes passphrase creation and acknowledges the recovery phrase
- **THEN** a key pair is registered and the identity is unlocked on this device

#### Scenario: Generation fails
- **WHEN** registration on the server fails
- **THEN** an error toast is shown and no key is left half-registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no way to generate another one

#### Scenario: Key list could not be loaded
- **WHEN** the user opens Keys management and the request for their key list fails
- **THEN** Common:EncryptionKeysLoadFailed is shown with Common:TryAgain, no generate or import action is offered, and no key is registered until a reload of the list answers with an empty list

### Requirement: Import a key
The system SHALL import a key from a previously exported JSON file (Common:ImportKey) for a user who has no key: the user picks the file, enters its passphrase, and the key is registered for this account and unlocked, confirming with Common:EncryptionKeyImported. Over HTTP the import SHALL be refused with Common:EncryptionRequiresHttps. The action SHALL NOT be offered while the user has a key, nor while the user's key list is not known.

#### Scenario: Import
- **WHEN** a user without a key selects a valid export file and enters the right passphrase
- **THEN** the key becomes the user's key and is unlocked

#### Scenario: Wrong passphrase on import
- **WHEN** the passphrase does not open the imported envelope
- **THEN** Common:InvalidPassphrase is shown and nothing is registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no import

#### Scenario: Key list not known
- **WHEN** the user's key list has not loaded or failed to load
- **THEN** Keys management offers no import

### Requirement: Key-change dialog
The system SHALL show a dialog when a peer's public key differs from its pin, naming the peer by display name, stating how long the previous key was active, listing possible causes and an out-of-band verification tip, with accept and refuse actions. Concurrent mismatches SHALL wait for the open dialog and be shown one after another; requests for the same user and key SHALL share the user's one decision. The system SHALL NOT answer a request on the user's behalf.

#### Scenario: Refuse
- **WHEN** the user refuses the changed key
- **THEN** the operation that needed the peer's key fails and the pin is unchanged

#### Scenario: Second mismatch while a dialog is open
- **WHEN** another operation detects a mismatch for a different user or key while a key-change dialog is open
- **THEN** the open dialog stays unanswered until the user decides, and the second request is shown afterwards

#### Scenario: Same key asked twice
- **WHEN** several operations detect the same changed key of the same user while its dialog is open
- **THEN** one dialog is shown and the user's decision answers every waiting request for that key, with no second dialog

#### Scenario: No automatic refusal
- **WHEN** a new mismatch request arrives while a dialog is open
- **THEN** the pending request MUST NOT be resolved as refused by the arrival alone

#### Scenario: Peer named in the dialog
- **WHEN** the key-change dialog opens for a room member whose key changed
- **THEN** the dialog names the member by display name, as the skipped-member toast does; the user id stands in only when the name cannot be loaded

#### Scenario: Peer name not readable
- **WHEN** the server refuses the current user the profile of the peer whose key changed
- **THEN** the dialog names the peer by user id, and no access-denied message, rights refresh or selection reset follows from the refused lookup

#### Scenario: Next request after an answer
- **WHEN** the user answers a key-change dialog while another request for a different user or key is waiting
- **THEN** the waiting request opens as a new dialog with its own peer and fingerprints, and MUST NOT be answered by the same click, key press or key repeat that answered the previous one

### Requirement: Key dialogs take the focus when they open
The system SHALL move the keyboard focus into a key dialog as it opens: to its first text field when it has one, otherwise to the dialog itself, in both the modal and the aside presentation, so the next Tab moves within the dialog and not in the page behind it.

#### Scenario: Prompt opened
- **WHEN** the passphrase prompt opens
- **THEN** the passphrase field has the focus

#### Scenario: Key-change dialog opened
- **WHEN** the key-change dialog opens
- **THEN** the dialog itself has the focus and none of its actions is pre-selected

#### Scenario: Opened as an aside panel
- **WHEN** a key dialog opens on a narrow screen
- **THEN** the focus moves into the panel the same way

#### Scenario: Queued key-change dialog opened
- **WHEN** a waiting key-change request opens right after the user answered the previous one
- **THEN** the new dialog itself has the focus and none of its actions is pre-selected, as for the first dialog
