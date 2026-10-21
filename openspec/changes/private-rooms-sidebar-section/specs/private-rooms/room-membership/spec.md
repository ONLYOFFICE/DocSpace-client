# Spec Delta

## MODIFIED Requirements

### Requirement: Private room is a flagged Custom room
The system SHALL present "Private room" as its own room type in the create-room dialog opened from the Private rooms section, while sending the server a Custom room with the private flag set. Only a Custom room SHALL be encryptable; no other room type SHALL carry the private flag. This rule is enforced by the client only: the server accepts the private flag with any room type.

#### Scenario: Private card chosen
- **WHEN** the user creates a room from the Private rooms section, where the dialog shows the Private room type, and confirms creation
- **THEN** the create request carries room type Custom and the private flag set to true

#### Scenario: Other room type
- **WHEN** a Public, Form filling, Virtual data or Collaboration room is created
- **THEN** the private flag is not sent and the room is not encrypted

#### Scenario: Private flag sent with another room type
- **WHEN** a create request that bypasses the client sets the private flag on a room type other than Custom
- **THEN** the server creates a private room of the requested type

### Requirement: Starting private room creation without a key starts key generation
The system SHALL offer to generate a key first when a user with no encryption key starts creating a private room from the Private rooms section. The dialog SHALL open on the Private type only after generation succeeds. Cancelling SHALL close the private-room creation, and no dialog SHALL be left open.

#### Scenario: User accepts key generation
- **WHEN** a key-less user presses create in the Private rooms section and confirms the key-generation prompt
- **THEN** the key-generation flow runs and, on success, the create-room dialog opens on the Private type

#### Scenario: User cancels key generation
- **WHEN** a key-less user presses create in the Private rooms section and cancels the prompt
- **THEN** no create-room dialog is left open and no room is created

### Requirement: Private rooms need a secure context
The system SHALL refuse to start private room creation, or to auto-prompt for a key, when the browser does not expose WebCrypto, and SHALL show Common:EncryptionRequiresHttps.

#### Scenario: Plain HTTP origin
- **WHEN** the user presses create in the Private rooms section on an origin without WebCrypto
- **THEN** no create-room dialog is opened and Common:EncryptionRequiresHttps is shown

### Requirement: Navigation into the new private room
The system SHALL navigate into a newly created private room immediately after creation, the same way it does for other rooms, and SHALL open it under the Private rooms section.

#### Scenario: Creation succeeds
- **WHEN** a private room is created successfully
- **THEN** the current view becomes the root folder of the new room at `/private/{roomId}/filter`, with the Private rooms item highlighted

### Requirement: Standard room management stays available
The system SHALL keep archiving, quota, tags, logo and cover for a private room on the standard room flows. An archived private room SHALL be listed in the Archive of the Private rooms section while that section is available.

#### Scenario: Archive a private room
- **WHEN** the owner archives a private room while the Private rooms section is available
- **THEN** the standard archive flow runs, the room leaves the Private rooms list and appears in Private rooms → Archive, not in Rooms → Archive

#### Scenario: Restore a private room
- **WHEN** the owner restores a private room from Private rooms → Archive
- **THEN** the room returns to the Private rooms list

## RENAMED Requirements

- FROM: `### Requirement: Choosing the Private card without a key starts key generation`
- TO: `### Requirement: Starting private room creation without a key starts key generation`
