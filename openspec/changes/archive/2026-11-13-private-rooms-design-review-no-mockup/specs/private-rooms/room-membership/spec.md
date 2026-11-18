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

#### Scenario: No dialog under the prompts
- **WHEN** a key-less user presses create in the Private section and the key-generation prompt, the passphrase dialog or the recovery-phrase dialog is shown
- **THEN** the create-room dialog is not shown behind it

#### Scenario: Key list still loading
- **WHEN** a user who holds a key presses create in the Private section before their key list has loaded
- **THEN** the create-room dialog opens on the Private type once the list is known to hold a key, and no key-generation prompt is offered

### Requirement: Private badge in permanent settings
The system SHALL show one "private room" block with Common:PrivateRoomTitle and Common:PrivateRoomDescription in the create and edit dialogs of a private room, in the place of the room type, and SHALL NOT show the Custom room block or a second private-room block there.

#### Scenario: Edit dialog of a private room
- **WHEN** the edit dialog of a private room is open
- **THEN** the room type block shows the private room icon, Common:PrivateRoomTitle and Common:PrivateRoomDescription, and neither Common:CustomRoomTitle nor a second private-room block is shown

#### Scenario: Create dialog of a private room
- **WHEN** the create dialog is open on the Private type
- **THEN** the same block is shown, with the same icon, title and description as in the edit dialog

#### Scenario: Edit dialog of an ordinary Custom room
- **WHEN** the edit dialog of a Custom room without the private setting is open
- **THEN** the room type block shows Common:CustomRoomTitle as before
