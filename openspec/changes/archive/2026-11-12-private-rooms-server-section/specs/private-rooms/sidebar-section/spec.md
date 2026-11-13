# Spec Delta

## ADDED Requirements

### Requirement: New-items counter on the section item
The system SHALL show on the Private item the new-items count of the Private root, open that root's new-items panel from it and offer mark-all-as-read there, as the Rooms item does for the Rooms root. An item opened from that panel SHALL open under the Private section.

#### Scenario: New file in a private room
- **WHEN** another member uploads a file into a private room the user belongs to
- **THEN** the Private item's counter grows, and opening that entry from its new-items panel shows the file under `/private`

#### Scenario: Mark all as read
- **WHEN** the user marks all as read on the Private item
- **THEN** the Private item's counter is cleared and the badges of its rooms are gone

### Requirement: Rooms counter leaves private rooms out
The system SHALL show on the Rooms item the new-items count of the Rooms root only. A new item of a private room SHALL NOT grow that counter or appear in the Rooms item's new-items panel.

#### Scenario: New file in a private room
- **WHEN** another member uploads a file into a private room while the section is available
- **THEN** the Rooms item's counter does not change and its new-items panel does not list the file

### Requirement: Section is a start page option while available
The system SHALL offer the Private section as a default start page in the file-management settings while the section is available, and SHALL open it at start when chosen. While the section is not available, the option SHALL NOT be offered, and a start page set to Private SHALL open Rooms.

#### Scenario: Default page setting
- **WHEN** the user opens the default start page setting while the section is available
- **THEN** Private is among the options, and choosing it opens the Private list at the next start

#### Scenario: Section not available
- **WHEN** the start page is set to Private and the section is not available
- **THEN** Rooms opens, and Private is not among the options

### Requirement: Room groups in the section
The system SHALL offer room grouping in the Private section as in Rooms: the grouping toggle, group chips, pinned groups and the create-group and add-to-group actions, with groups of the section's own area that hold private rooms only. A group of Rooms SHALL NOT offer or list a private room.

#### Scenario: Context menu of a private room in the section
- **WHEN** the user opens the context menu of a private room in the Private list
- **THEN** create-group and add-to-group are offered, and add-to-group lists the groups of the Private section only

#### Scenario: Group opened in the section
- **WHEN** the user opens a room group in the Private section
- **THEN** only private rooms are listed in it

## MODIFIED Requirements

### Requirement: Section lists only private rooms
The system SHALL request the section list with the section's search area (`PrivateRooms`), and its Archive as the shared Archive with the private filter. Both SHALL come from the address category, whatever search area or privacy filter the address query carries. A room without the private setting MUST NOT appear in either list.

#### Scenario: List opened
- **WHEN** the user opens the Private list
- **THEN** the rooms request names the section's search area and no privacy filter

#### Scenario: Address carries another privacy value
- **WHEN** the section list is opened with `searchArea=Active` or `privacyFilter=NotPrivate` in its address
- **THEN** the request still names the section's search area and no non-private room is listed

#### Scenario: Archive address carries the active search area
- **WHEN** `/private/archived/filter?searchArea=Active` is opened
- **THEN** the request names the Archive area with the private filter, and only archived private rooms are listed

#### Scenario: Connected third-party room
- **WHEN** the user has a room on connected third-party storage
- **THEN** that room is never listed in the Private section

### Requirement: Rooms section never lists private rooms
The system SHALL request the Rooms list without a privacy filter, the server leaving private rooms out of the Rooms area, and Rooms → Archive with the non-private filter, since the shared Archive holds both, whether the Private section is available or not. While the section is not available, private rooms SHALL NOT be listed anywhere in the client.

#### Scenario: Section available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is available
- **THEN** the Rooms request carries no privacy filter, the Rooms → Archive request carries the non-private filter, and no private room is listed

#### Scenario: Section not available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is not available
- **THEN** no private room is listed, and the requests carry the same filters as while the section is available

#### Scenario: Address asks Rooms for private rooms
- **WHEN** a Rooms address carrying `privacyFilter=Private` is opened while the section is available
- **THEN** the request carries no privacy filter and lists the Rooms root only

#### Scenario: Room group opened in Rooms
- **WHEN** a room group of the Rooms area is opened while the section is available
- **THEN** no private room is listed in it

#### Scenario: Room group editor in Rooms
- **WHEN** the user edits the room groups of the Rooms section while the Private section is available
- **THEN** private rooms are not offered for grouping

### Requirement: Scope holds on every request of a list
The system SHALL apply the section's search area to every rooms-list request of the Private list and its Archive, and the Rooms area to every request of the Rooms lists. That covers:
- the first page and further pages loaded on scroll;
- search, sorting and filter changes;
- refreshes after live updates;
- the refill requests made after rooms leave a list by archiving, restoring, deleting or leaving.

#### Scenario: Next page
- **WHEN** the user scrolls the Private list to load the next page
- **THEN** the next-page request names the section's search area

#### Scenario: Search in Rooms
- **WHEN** the user searches the Rooms list while the section is available
- **THEN** the search request names the Rooms area and no privacy filter

#### Scenario: Refill after archiving
- **WHEN** the user archives a room in a Private list that has more rooms than one page
- **THEN** the refill request names the section's search area and only private rooms move up into the list

#### Scenario: Restore from the archive
- **WHEN** the user restores a private room from Private → Archive
- **THEN** the user stays in Private → Archive, whose refreshed list names the section's archive and no longer contains the room

### Requirement: Section filter
The system SHALL NOT offer the room-type group or the third-party storage group in the filter of the Private section list and its Archive. Search, owner, tags, quota and sorting SHALL work as in Rooms. The room-group controls SHALL be offered in the Private list as in Rooms, and SHALL NOT be offered in its Archive.

#### Scenario: Filter opened in the section
- **WHEN** the user opens the filter panel in the Private list
- **THEN** no room-type or storage options are offered, and owner and tags filters are available

#### Scenario: Room-group controls in the section
- **WHEN** the user opens the Private list while room grouping is on
- **THEN** the group chips of the section and the group management control are shown, with the groups of the Private section only

#### Scenario: Room-group controls in the archive
- **WHEN** the user opens Private → Archive
- **THEN** no room-group controls are shown

## RENAMED Requirements

- FROM: `### Requirement: Rooms section excludes private rooms while the section is available`
- TO: `### Requirement: Rooms section never lists private rooms`

## REMOVED Requirements

### Requirement: No new-items counter on the section item
**Reason**: The section has a root of its own to count against; replaced by "New-items counter on the section item".
**Migration**: The Private item reads the Private root's count once the server provides the root.

### Requirement: Rooms counter keeps counting private rooms
**Reason**: The server routes private news to the Private root; replaced by "Rooms counter leaves private rooms out".
**Migration**: None on the client; the Rooms counter follows the server.

### Requirement: Section is not a start page option
**Reason**: The owner decided on 2026-11-06 to offer the section as a start page, which the server accepts since `c866c055e1`; replaced by "Section is a start page option while available".
**Migration**: None; users who never choose it keep their start page.

### Requirement: No room groups in the section
**Reason**: The owner decided on 2026-11-06 to offer room groups in the section, which the server supports since `c866c055e1` with the `PrivateRooms` group area; replaced by "Room groups in the section".
**Migration**: A private room linked to a Rooms group leaves that group (the server keeps the link but no longer lists it there) and can be grouped again in the section.
