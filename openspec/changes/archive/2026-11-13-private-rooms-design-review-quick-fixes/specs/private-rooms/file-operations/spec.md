# Spec Delta

## ADDED Requirements

### Requirement: Empty folder inside a private room shows a folder empty view
The system SHALL show, for an empty folder below the root of a private room, an empty folder view with the title and illustration of an empty folder and the create and upload entries the room allows, and SHALL NOT show there the welcome of the room with its list of encryption properties. The welcome SHALL stay at the room root. The entries SHALL follow "Create new file in a private room" and "Folder upload disabled in private rooms".

#### Scenario: Empty folder with keys
- **WHEN** a user with keys and the create right opens an empty folder inside a private room
- **THEN** the view shows the empty folder title and the same create and upload entries as the empty room root shows that user, described with Common:PrivateRoomFolderEmptyDescription, and no list of encryption properties

#### Scenario: Empty folder without keys
- **WHEN** a user who has no encryption key opens an empty folder inside a private room
- **THEN** the view offers no file creation, only folder creation and upload

#### Scenario: Empty folder without the create right
- **WHEN** a user who may not create in the room opens an empty folder inside it
- **THEN** the view shows the empty folder title and no create or upload entry

#### Scenario: Room root
- **WHEN** a user opens an empty private room at its root
- **THEN** the welcome of the room with its list of encryption properties is shown

#### Scenario: Folder of an archived private room
- **WHEN** a member opens an empty folder inside an archived private room
- **THEN** the empty folder view is shown without create or upload entries
