# Spec Delta

## ADDED Requirements

### Requirement: No AI chat in private rooms
The system SHALL NOT offer the AI chat while a private room, or a folder inside it, is open, whether the room is active or archived and whatever address it was opened under. The chat runs on the server, which holds the files of a private room only as ciphertext.

#### Scenario: Active private room
- **WHEN** a member opens a private room while AI services are enabled
- **THEN** no AI chat button is shown

#### Scenario: Archived private room under Rooms
- **WHEN** a member opens an archived private room, or a folder inside it, at `/rooms/archived/filter?folder={id}` while AI services are enabled
- **THEN** no AI chat button is shown

#### Scenario: Ordinary archived room
- **WHEN** a user opens an archived room without the private setting while AI services are enabled
- **THEN** the AI chat is offered as in any other archived room

### Requirement: AI and plugin actions withheld in archived private rooms
The system SHALL NOT offer AI actions or plugin actions for the folders and files of an archived private room, exactly as for an active private room. Plugins receive only an item id and fetch the content themselves, so they could neither decrypt it nor be trusted with it.

#### Scenario: Folder context menu with a folder plugin installed
- **WHEN** a plugin that adds a folder context-menu entry is enabled and the user right-clicks a folder inside an archived private room
- **THEN** the plugin entry and ask-ai are absent

#### Scenario: Encrypted file in an archived private room
- **WHEN** the context menu of an encrypted file in an archived private room is opened
- **THEN** ask-ai and plugin entries are absent
