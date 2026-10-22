# Spec Delta

## MODIFIED Requirements

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
- **THEN** the dialog names the member by display name, as the skipped-member toast does, never by user id

### Requirement: Delete a key
The system SHALL delete a registered key only after a warning (Common:DeleteKeyWarning) that lists the private rooms in which the user holds file access entries, all of which become unreadable without the user's only key, followed by passphrase confirmation, confirming with Common:EncryptionKeyDeleted.

#### Scenario: Delete
- **WHEN** the user confirms the warning and enters the key's passphrase
- **THEN** the key is removed from the server and from the list

#### Scenario: Affected rooms listed
- **WHEN** the delete-key warning opens for a user who holds access entries in three private rooms
- **THEN** the warning names those three rooms (Common:DeleteKeyAffectedRooms) before the user can confirm

#### Scenario: No affected rooms
- **WHEN** the user holds no access entry in any private room
- **THEN** the warning states that no room is affected (Common:DeleteKeyNoAffectedRooms)

### Requirement: Key dialogs are accessible and adapt to narrow screens
The system SHALL present the passphrase, recovery-phrase, key-change, passphrase-change and reset dialogs as centred modals on wide screens and as aside panels on narrow screens; each dialog SHALL expose a dialog role, an accessible name and labelled inputs so screen readers announce it.

#### Scenario: Mobile viewport
- **WHEN** a key dialog opens on a narrow screen
- **THEN** it renders as an aside panel with the same content and actions

#### Scenario: Screen reader
- **WHEN** a key dialog opens
- **THEN** it is announced with its title, and every input and action has an accessible label

## RENAMED Requirements

- FROM: `### Requirement: All key dialogs are modal`
- TO: `### Requirement: Key dialogs are accessible and adapt to narrow screens`
