# Spec Delta

## ADDED Requirements

### Requirement: Copy right inside archived private rooms
The server SHALL deny the copy right on a file inside an active private room, and on a subfolder of one, to every user, room owner included. It SHALL NOT apply that denial inside an archived private room. There the copy right follows the rules of every archived room: it is granted unless the access is restricted or downloads are denied, and a read-only member gets it only while the room allows downloads.

#### Scenario: File in an active private room
- **WHEN** the owner of an active private room lists its encrypted files
- **THEN** each file reports the copy right as false

#### Scenario: File in an archived private room
- **WHEN** the owner, a room manager, a content creator or an editor lists the encrypted files of an archived private room
- **THEN** each file reports the copy right as true, while editing, renaming, moving and deleting are false

### Requirement: Server-side copy out of a private room is refused
The server SHALL refuse a batch copy of a file from inside a private room to a folder outside that room, whether the room is active or archived, before the operation is queued, so no copy is created. Only a move within the same private room SHALL pass the private-room check.

#### Scenario: Copy out of an archived private room
- **WHEN** a member requests a batch copy of an encrypted file from an archived private room to My documents
- **THEN** the server refuses the request with "You don't have enough permission to move the file", queues no operation and creates no file

#### Scenario: Copy out of an active private room
- **WHEN** a member requests a batch copy of an encrypted file from an active private room to My documents
- **THEN** the server refuses the request with "You don't have enough permission to copy the file" and creates no file

#### Scenario: Copy within the same private room
- **WHEN** a member requests a batch copy of an encrypted file into a subfolder of the same private room
- **THEN** the server refuses the request and creates no file
