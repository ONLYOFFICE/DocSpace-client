# Spec Delta

## ADDED Requirements

### Requirement: Private root
The server SHALL provide a root folder for the private rooms section, of folder type `PrivateRooms` (42), listed by the root folders request and read through `GET files/@private` while the E2E rooms app is on. The root SHALL hold no rooms: a private room stays under the Rooms root with its root folder type, and the section lists rooms by their private setting.

#### Scenario: Root folders list
- **WHEN** the client requests the root folders while the E2E rooms app is on
- **THEN** the response contains the Private root, of folder type `PrivateRooms`

#### Scenario: App turned off
- **WHEN** the E2E rooms app is off
- **THEN** the root folders list has no Private root and `GET files/@private` answers 404

#### Scenario: Private room folder data
- **WHEN** the client reads a private room
- **THEN** its root folder type is the Rooms root type and its parent is the Rooms root

#### Scenario: Section listing
- **WHEN** the rooms list is requested with `searchArea=PrivateRooms`, or `GET files/@private` is read
- **THEN** only the active private rooms the caller is a member of are returned, and an administrator outside a private room does not see it

#### Scenario: Recent with the section's area
- **WHEN** Recent is requested with `searchArea=PrivateRooms`
- **THEN** the server answers 400

### Requirement: Room groups belong to one section
The server SHALL accept `PrivateRooms` as the area of a room group, and SHALL take into a group only rooms of its own section, answering 400 otherwise. A private room linked to a group of the Rooms area SHALL NOT be listed or counted there, and the link SHALL be kept. The server SHALL NOT accept a privacy filter on the room-group endpoints.

#### Scenario: Private room added to a Rooms group
- **WHEN** a private room is added to a group of the Rooms area
- **THEN** the server answers 400

#### Scenario: Group of the private section
- **WHEN** a group is created with the `PrivateRooms` area and private rooms are added to it
- **THEN** the group lists and counts those rooms

#### Scenario: Older link to a Rooms group
- **WHEN** a Rooms-area group still holds a link to a private room
- **THEN** the group's room count and listing leave that room out

## MODIFIED Requirements

### Requirement: Rooms list privacy filter
The server SHALL split the rooms list by the private setting:
- `searchArea=Active` returns no private room, whether the privacy filter is absent, `None` (0) or `NotPrivate` (2);
- `searchArea=Active` with `privacyFilter=Private` (1) is read as `searchArea=PrivateRooms` and returns the section;
- on every other search area the filter applies as given: `Private` only private rooms, `NotPrivate` none, absent or `None` no filter.

#### Scenario: Active rooms without a filter
- **WHEN** the rooms list is requested with `searchArea=Active` and no privacy filter
- **THEN** no room with the private setting is returned

#### Scenario: Private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=Private`
- **THEN** only active rooms with the private setting are returned, as with `searchArea=PrivateRooms`

#### Scenario: Archived private rooms
- **WHEN** the rooms list is requested with `searchArea=Archive&privacyFilter=Private`
- **THEN** only archived rooms with the private setting are returned from the shared Archive

#### Scenario: Non-private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=NotPrivate`
- **THEN** no room with the private setting is returned

### Requirement: New-items counts include private rooms
The server SHALL count new items of private rooms under the Private root: that root's new-items count, its news listing and mark-as-read on it. The Rooms root's count, news listing and mark-as-read SHALL NOT cover private rooms.

#### Scenario: New file in a private room
- **WHEN** a member uploads a file into a private room
- **THEN** the Private root's new-items count of the other members grows, the Rooms root's does not, and the Private root's news listing includes the file

## REMOVED Requirements

### Requirement: Private rooms have no section of their own on the server
**Reason**: The server provides a Private root ("Private root" above), as a view of the Rooms tree selected by the private setting.
**Migration**: None on the server: no room moves, and a private room keeps the Rooms root as its parent and root folder type. The client lists the section through the `PrivateRooms` area instead of the privacy filter.

### Requirement: Room groups ignore privacy
**Reason**: A room group belongs to one section now, the private rooms section included ("Room groups belong to one section" above).
**Migration**: A private room linked to a Rooms-area group keeps the link but leaves that group's listing and count; it can be grouped again in a group of the `PrivateRooms` area.
