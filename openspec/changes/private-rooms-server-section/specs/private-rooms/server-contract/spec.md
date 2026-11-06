# Spec Delta

## ADDED Requirements

### Requirement: Private root
The server SHALL provide a root folder for private rooms with a folder type of its own, listed by the root folders request next to the Rooms root, and a search area that lists the rooms of that root, with an archive search area for its archived rooms. A private room SHALL be created under that root and report its folder type as its root folder type. A rooms listing of the Rooms area SHALL NOT return private rooms.

#### Scenario: Root folders list
- **WHEN** the client requests the root folders
- **THEN** the response contains the Private root

#### Scenario: Private room folder data
- **WHEN** the client reads a private room
- **THEN** its root folder type is the Private root's type and its parent is the Private root

#### Scenario: Section listing
- **WHEN** the rooms list is requested with the section's search area
- **THEN** only the active rooms of the Private root are returned, and the archived ones through the section's archive search area

#### Scenario: Rooms root
- **WHEN** the rooms list is requested with `searchArea=Active` and no privacy filter
- **THEN** no private room is returned

## MODIFIED Requirements

### Requirement: New-items counts include private rooms
The server SHALL count new items of private rooms under the Private root: that root's new-items count, its news listing and mark-as-read on it. The Rooms root's count, news listing and mark-as-read SHALL NOT cover private rooms.

#### Scenario: New file in a private room
- **WHEN** a member uploads a file into a private room
- **THEN** the Private root's new-items count of the other members grows, the Rooms root's does not, and the Private root's news listing includes the file

## REMOVED Requirements

### Requirement: Private rooms have no section of their own on the server
**Reason**: The server provides private rooms with a root of their own ("Private root" above).
**Migration**: The existing private rooms move under the new root (proposal decision 4); the client lists the root through its search area instead of the privacy filter.
