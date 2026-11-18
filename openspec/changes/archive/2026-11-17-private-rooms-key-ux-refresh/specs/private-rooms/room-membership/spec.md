# Spec Delta

## ADDED Requirements

### Requirement: People without a key are marked before the invitation is sent
The system SHALL mark, in the people list of the invite panel of a private room, each listed person who has no registered encryption key with Common:NoKey and an explanation (Common:NoEncryptionKeyMarkHint) that the person cannot be invited until they create a key. A person who holds a key SHALL carry no mark. The mark SHALL be a text, not colour alone. A marked person SHALL stay selectable, and what follows the sending is unchanged.

#### Scenario: Person without a key
- **WHEN** the people list of a private room's invite panel shows a person who has no registered key
- **THEN** the row carries Common:NoKey

#### Scenario: Person with a key
- **WHEN** the list shows a person who holds a key
- **THEN** the row carries no mark

#### Scenario: Explanation
- **WHEN** the mark is hovered or takes the keyboard focus
- **THEN** Common:NoEncryptionKeyMarkHint is shown and is read as the description of the mark

#### Scenario: Marked person selected and sent
- **WHEN** the inviter selects a marked person and sends the invitation
- **THEN** the person is left out and named with Common:EncryptedInviteNoKey, as before this change

#### Scenario: Room that is not private
- **WHEN** the invite panel opens for a room that is not private
- **THEN** no mark is shown and no key is read

### Requirement: The mark of a missing key follows the server's answer
The system SHALL decide the mark from the route of the keys of invitation candidates, which answers with the public keys of the listed users who hold one and leaves out the users who do not. The system SHALL ask it for every loaded page of the people list and SHALL NOT mark a person before the answer for their page has arrived. When the request fails the system SHALL show no mark for that page and the invitation SHALL work as without marks.

#### Scenario: Answer not yet arrived
- **WHEN** a page of people is shown and the answer about their keys is on its way
- **THEN** no row of that page carries the mark

#### Scenario: Next page
- **WHEN** the inviter scrolls and another page of people loads
- **THEN** the keys of the people of that page are asked for and their rows are marked when the answer arrives

#### Scenario: Search
- **WHEN** the inviter types in the search field and the list is replaced
- **THEN** the marks are decided for the people of the new list

#### Scenario: Request fails
- **WHEN** the request for the keys of a page fails
- **THEN** no row of that page is marked, no error is shown, and an invitation can still be sent

### Requirement: Starting private room creation without a key opens key setup
The system SHALL open key setup when a user with no encryption key starts creating a private room from the Private section, on its explanation step and without a prompt before it. The create-room dialog SHALL open on the Private type only after generation succeeds. Leaving key setup SHALL close the private-room creation, and no dialog SHALL be left open. A user whose key list is not known, because it has not loaded or failed to load, SHALL NOT be treated as a user with no key.

#### Scenario: User completes key setup
- **WHEN** a key-less user presses create in the Private section and completes key setup
- **THEN** the create-room dialog opens on the Private type

#### Scenario: User cancels on the explanation
- **WHEN** a key-less user presses create in the Private section and cancels key setup on its explanation step
- **THEN** no create-room dialog is left open and no room is created

#### Scenario: User cancels inside key setup
- **WHEN** a key-less user cancels or discards key setup on the passphrase step or on the recovery phrase step
- **THEN** no create-room dialog is left open, no room is created and no key is registered

#### Scenario: Key list could not be loaded
- **WHEN** a user presses create in the Private section while their key list has not loaded, and fetching it again fails
- **THEN** Common:EncryptionKeysLoadFailed is shown, key setup is not opened and no create-room dialog is left open

#### Scenario: No dialog under key setup
- **WHEN** a key-less user presses create in the Private section and key setup is shown
- **THEN** the create-room dialog is not shown behind it

#### Scenario: Key list still loading
- **WHEN** a user who holds a key presses create in the Private section before their key list has loaded
- **THEN** the create-room dialog opens on the Private type once the list is known to hold a key, and key setup is not opened

#### Scenario: No prompt before key setup
- **WHEN** a key-less user presses create in the Private section
- **THEN** key setup opens at once and no question about creating a key is asked before it

## REMOVED Requirements

### Requirement: Starting private room creation without a key starts key generation
**Reason**: The prompt that asked whether to create a key is dropped; key setup opens directly on its explanation step.
**Migration**: "Starting private room creation without a key opens key setup" keeps the rest: the create-room dialog opens only after generation succeeds, leaving key setup closes the creation, and an unknown key list is not treated as no key.
