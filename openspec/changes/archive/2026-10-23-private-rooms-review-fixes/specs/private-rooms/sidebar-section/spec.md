# Spec Delta

## MODIFIED Requirements

### Requirement: Private rooms open inside the section
The system SHALL open a private room, and every folder inside it, under the section addresses while the section is available, whatever entry point led there. A Rooms address (`/rooms/shared/{id}/filter`, `/rooms/shared/filter?folder={id}` or `/rooms/archived/filter?folder={id}`) that turns out to hold a private room or one of its folders SHALL be replaced with its `/private` counterpart. This SHALL hold even while the Rooms app is switched off.

#### Scenario: Room clicked in the section
- **WHEN** the user opens a room from the Private list
- **THEN** the address becomes `/private/{roomId}/filter`

#### Scenario: Row link opened in a new tab
- **WHEN** the user opens a private room's row link in a new tab
- **THEN** the new tab opens `/private/{roomId}/filter` directly

#### Scenario: Rooms address of a private room
- **WHEN** `/rooms/shared/{roomId}/filter` is opened for a private room while the section is available
- **THEN** the address is replaced with `/private/{roomId}/filter` and the Private item is highlighted

#### Scenario: Archived room link
- **WHEN** `/rooms/archived/filter?folder={roomId}` is opened for an archived private room while the section is available
- **THEN** the address is replaced with `/private/archived/filter?folder={roomId}`

#### Scenario: Row link of the Rooms list
- **WHEN** `/rooms/shared/filter?folder={roomId}`, the row link form of the Rooms list, is opened for a private room while the section is available
- **THEN** the address is replaced with `/private/{roomId}/filter?folder={roomId}`, keeping the query, and the header shows the room's title, not the section name

#### Scenario: Open location from a feed
- **WHEN** the user picks "Open location" on a file that lies in a folder of a private room
- **THEN** the folder opens under `/private/{folderId}/filter` with the Private item highlighted and the file highlighted

#### Scenario: Back from the editor
- **WHEN** the user closes the editor of a file in a private room through its back link
- **THEN** the file's folder opens under `/private`

#### Scenario: Rooms app switched off
- **WHEN** an e-mail link to a private room under `/rooms/shared` is opened on a standalone portal where the Rooms app is off and the section is available
- **THEN** the room opens under `/private` instead of the dashboard

#### Scenario: Rooms list with the Rooms app off
- **WHEN** a Rooms address that names no folder, such as `/rooms/shared/filter` or `/rooms/shared/{id}/filter` without `folder`, is opened on a standalone portal where the Rooms app is off and the section is available
- **THEN** the dashboard opens, as it does without the section, and the Rooms list is not shown

### Requirement: Section addresses are decided before the folder is shown
The system SHALL decide whether an address belongs to the Rooms or the Private section before showing the folder. A corrected address therefore:
- shows no Rooms state first;
- raises its notices, such as the missing-key warning, once;
- keeps the highlight that the entry point asked for;
- never alternates between the two sections.

Addresses inside an embedded frame SHALL be decided the same way.

#### Scenario: Cold link to a private room
- **WHEN** a member opens `/rooms/shared/{roomId}/filter` for a private room without keys on this device
- **THEN** the room appears under `/private` without first showing Rooms, and the missing-key warning is shown once

#### Scenario: Section not available
- **WHEN** a Rooms address of a private room is opened while the section is not available
- **THEN** the room opens under Rooms and the address is not changed again

#### Scenario: Embedded frame
- **WHEN** a Rooms address of a private room is opened in the client inside an embedded frame while the section is available
- **THEN** the address is replaced with its `/private` counterpart and the room opens there, as outside a frame

#### Scenario: Superseded load
- **WHEN** the user navigates again before the folder behind a Rooms or Private address has been checked
- **THEN** the superseded load commits nothing, neither folder state nor loading state nor a highlighted file, and only the newer load ends the loading
