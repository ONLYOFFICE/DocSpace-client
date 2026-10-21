# Spec Delta

## ADDED Requirements

### Requirement: Rooms list privacy filter
The server SHALL accept the `privacyFilter` query parameter on the rooms list and apply it with any search area:
- `Private` (1) returns only rooms with the private setting;
- `NotPrivate` (2) returns only rooms without it;
- an absent value or `None` (0) applies no privacy filter.

#### Scenario: Private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=Private`
- **THEN** only active rooms with the private setting are returned

#### Scenario: Archived private rooms
- **WHEN** the rooms list is requested with `searchArea=Archive&privacyFilter=Private`
- **THEN** only archived rooms with the private setting are returned

#### Scenario: Non-private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=NotPrivate`
- **THEN** no room with the private setting is returned

### Requirement: Private filter drops third-party rooms
The server SHALL NOT return rooms on connected third-party storage when the rooms list is requested with `privacyFilter=Private`.

#### Scenario: User with a third-party room
- **WHEN** a user with a room on connected third-party storage requests the rooms list with `privacyFilter=Private`
- **THEN** the third-party room is not returned

### Requirement: Private rooms of others are not listed to administrators
The server SHALL NOT list a private room to a user who neither created it nor is a member of it, even in the administrator's view that otherwise lists every room in the portal.

#### Scenario: Administrator not invited
- **WHEN** a DocSpace admin who was never invited requests the rooms list
- **THEN** private rooms created by other users are not returned, and other users' non-private rooms are

### Requirement: Private rooms have no section of their own on the server
The server SHALL NOT provide private rooms with a root folder, search area or root-list entry of their own. A private room SHALL be created under the Rooms root, reporting that root's folder type as its root folder type. It SHALL be archived to and restored from the Archive root shared with every other room.

#### Scenario: Root folders list
- **WHEN** the client requests the root folders
- **THEN** the response contains no folder dedicated to private rooms

#### Scenario: Private room folder data
- **WHEN** the client reads a private room
- **THEN** its root folder type is the Rooms root type and its parent is the Rooms root

#### Scenario: Archived private room
- **WHEN** a private room is archived
- **THEN** it moves to the same Archive root as every other archived room
