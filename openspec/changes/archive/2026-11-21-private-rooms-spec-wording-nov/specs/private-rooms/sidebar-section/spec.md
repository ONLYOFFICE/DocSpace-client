# Spec Delta

## MODIFIED Requirements

### Requirement: Section addresses
The system SHALL serve these section addresses:
- the list at `/private/filter`;
- a private room or a folder inside one at `/private/{id}/filter`, with or without `?folder={id}`;
- the archive at `/private/archived/filter`;
- an archived private room or a folder inside one at `/private/archived/filter?folder={id}`, the same form Rooms → Archive uses.

The sidebar SHALL highlight Private on the list and room addresses, and its Archive sub-item on the archive addresses.

#### Scenario: Archive address
- **WHEN** the user opens `/private/archived/filter`
- **THEN** the archived private rooms are listed and the Archive sub-item under Private is highlighted

#### Scenario: Room address
- **WHEN** the user opens `/private/{roomId}/filter` for a private room they belong to
- **THEN** the room contents are shown and the Private item is highlighted

#### Scenario: Room address without the folder parameter
- **WHEN** the user opens `/private/{roomId}/filter` with no query for a private room they belong to
- **THEN** the address becomes `/private/{roomId}/filter?folder={roomId}`, the room contents are shown, and no address names an undefined room

#### Scenario: Archived room address
- **WHEN** the user opens `/private/archived/filter?folder={roomId}` for an archived private room they belong to
- **THEN** the room contents are shown and the Archive sub-item under Private is highlighted

### Requirement: Private section in an embedded frame
The system SHALL offer the Private section to the client running inside an embedded frame under the same availability as outside a frame. A frame opened at a `/private` address SHALL show the Private list or the private room it names, and a frame that shows the menu SHALL show the Private item in it.

#### Scenario: Frame opened in the Private section
- **WHEN** a host embeds the client with the root path `/private/` while the section is available
- **THEN** the frame shows the Private list and its requests name the section's search area (`searchArea=PrivateRooms`) and carry no privacy filter

#### Scenario: Frame showing the menu
- **WHEN** a host embeds the client with the menu shown while the section is available
- **THEN** the frame's menu contains the Private item
