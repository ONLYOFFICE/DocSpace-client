# Spec Delta

## MODIFIED Requirements

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
