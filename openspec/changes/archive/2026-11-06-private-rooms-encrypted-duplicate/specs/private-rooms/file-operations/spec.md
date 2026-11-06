## ADDED Requirements

### Requirement: Duplicate of an encrypted file follows the move right
The system SHALL offer Duplicate in the context menu of an encrypted file of an active private room when the server grants the Move right on the file, although the server reports no Duplicate right for any entry of a private room. It SHALL NOT offer it without the Move right or in an archived private room. Duplicate SHALL copy the file as the same-room copy does and MUST NOT ask the server to duplicate it.

#### Scenario: Duplicate offered for an encrypted file
- **WHEN** a room manager, or a content creator on a file they created, opens the context menu of an encrypted file in an active private room
- **THEN** Duplicate is offered although the server reports no Duplicate right, and choosing it stores a second encrypted file with a suffixed name in the same folder
- **AND** no server duplicate request is sent and the content MUST NOT be sent as plaintext

#### Scenario: Duplicate withheld without the move right
- **WHEN** an editor, a viewer, or a content creator on a file someone else created opens the context menu of an encrypted file in an active private room
- **THEN** no Duplicate entry is shown

#### Scenario: Duplicate withheld in an archived private room
- **WHEN** the user opens the context menu of an encrypted file in an archived private room
- **THEN** no Duplicate entry is shown
