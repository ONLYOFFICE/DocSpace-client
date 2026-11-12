# Spec Delta

## ADDED Requirements

### Requirement: Destination picker lists private rooms under a Private entry
The system SHALL list the private rooms a copy may go to under a Private entry at the root of the Copy dialog, since the Rooms list of the picker holds no private room. The entry SHALL be offered only for a copy whose source lies in a private room and only while the Private section is available. A Move SHALL NOT get it, and neither SHALL a source outside private rooms.

#### Scenario: Destination picker in a private room
- **WHEN** the user opens the Copy dialog on a file of a private room and goes to the root of the picker
- **THEN** the root lists a Private entry beside Rooms, the entry lists the user's private rooms, and no private room is listed under Rooms

#### Scenario: Copy to another private room
- **WHEN** the user picks another private room under the Private entry and confirms
- **THEN** the file is copied there re-encrypted for that room

#### Scenario: Path of the open room
- **WHEN** the Copy dialog opens inside a private room
- **THEN** its path names Private above the room, and one level up lists the private rooms

#### Scenario: Move dialog
- **WHEN** the user opens the Move dialog on a file of a private room
- **THEN** the picker stays pinned to that room and offers no Private entry

#### Scenario: Source outside private rooms
- **WHEN** the user copies a file that is not in a private room
- **THEN** the picker offers no Private entry and no private room can be picked

#### Scenario: Section not available
- **WHEN** the Private section is not available
- **THEN** the picker offers no Private entry
