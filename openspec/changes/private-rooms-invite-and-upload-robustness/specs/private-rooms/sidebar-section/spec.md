# Spec Delta

## ADDED Requirements

### Requirement: The folder tree follows a switch of the E2E rooms app
The system SHALL read the folder tree again when the E2E rooms app is switched on or off while the page is open, because the server lists the Private root among the root folders only while the app is on. The Private item SHALL then show the new-items count of the Private root without a reload.

#### Scenario: App switched on
- **WHEN** an administrator switches the E2E rooms app on while a user has the page open and a private room of that user holds a new file
- **THEN** the folder tree is read again and the Private item shows its new-items count without a reload

#### Scenario: App switched off
- **WHEN** an administrator switches the E2E rooms app off while a user has the page open
- **THEN** the folder tree is read again and holds no Private root

## MODIFIED Requirements

### Requirement: Section addresses are decided before the folder is shown
The system SHALL decide whether an address belongs to the Rooms or the Private section before showing the folder. A corrected address therefore:
- shows no Rooms state first;
- raises its notices, such as the missing-key warning, once;
- keeps the highlight that the entry point asked for;
- never alternates between the two sections.

Addresses inside an embedded frame SHALL be decided the same way, once the frame knows whether its host opted in.

#### Scenario: Cold link to a private room
- **WHEN** a member opens `/rooms/shared/{roomId}/filter` for a private room without keys on this device
- **THEN** the room appears under `/private` without first showing Rooms, and the missing-key warning is shown once

#### Scenario: Section not available
- **WHEN** a Rooms address of a private room is opened while the section is not available
- **THEN** the room opens under Rooms and the address is not changed again

#### Scenario: Embedded frame
- **WHEN** a Rooms address of a private room is opened in the client inside an embedded frame while the section is available
- **THEN** the address is replaced with its `/private` counterpart and the room opens there, as outside a frame

#### Scenario: Frame configuration arrives after the address
- **WHEN** an embedded frame whose host opted in is opened at a Rooms address of a private room and its configuration arrives after the folder was read
- **THEN** the address is replaced with its `/private` counterpart and the room opens there, without being shown under Rooms first

#### Scenario: Superseded load
- **WHEN** the user navigates again before the folder behind a Rooms or Private address has been checked
- **THEN** the superseded load commits nothing, neither folder state nor loading state nor a highlighted file, and only the newer load ends the loading

### Requirement: Rooms section never lists private rooms
The system SHALL request the Rooms list without a privacy filter, the server leaving private rooms out of the Rooms area, and Rooms → Archive with the non-private filter, since the shared Archive holds both, whether the Private section is available or not. A Rooms address that names any other search area SHALL be requested with the non-private filter as well. While the section is not available, private rooms SHALL NOT be listed anywhere in the client.

#### Scenario: Section available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is available
- **THEN** the Rooms request carries no privacy filter, the Rooms → Archive request carries the non-private filter, and no private room is listed

#### Scenario: Section not available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is not available
- **THEN** no private room is listed, and the requests carry the same filters as while the section is available

#### Scenario: Address asks Rooms for private rooms
- **WHEN** a Rooms address carrying `privacyFilter=Private` is opened while the section is available
- **THEN** the request carries no privacy filter and lists the Rooms root only

#### Scenario: Address with another search area
- **WHEN** a Rooms address carrying `searchArea=Any` is opened by a member of a private room
- **THEN** the request carries the non-private filter and no private room is listed

#### Scenario: Room group opened in Rooms
- **WHEN** a room group of the Rooms area is opened while the section is available
- **THEN** no private room is listed in it

#### Scenario: Room group editor in Rooms
- **WHEN** the user edits the room groups of the Rooms section while the Private section is available
- **THEN** private rooms are not offered for grouping

### Requirement: Live updates respect the split
The system SHALL insert a room that arrives through a live update only into the open list whose privacy scope it matches. That covers a room created, restored or shared with the user. The client SHALL read the room's private setting from the room itself, because the live event does not carry it. A room that is not inserted SHALL NOT change the count of rooms of the open list.

#### Scenario: Invited to a private room
- **WHEN** another user adds the current user to a private room while the Rooms list is open and the section is available
- **THEN** the room is not inserted into the Rooms list, and it is listed in Private once that list is opened

#### Scenario: Ordinary room created in another tab
- **WHEN** the user creates a non-private room in another tab while the Private list is open
- **THEN** the room is not inserted into the Private list

#### Scenario: Count of the open list
- **WHEN** the user creates a private room in another tab while the Rooms list is open and the section is available
- **THEN** the count of rooms of the Rooms list does not change
