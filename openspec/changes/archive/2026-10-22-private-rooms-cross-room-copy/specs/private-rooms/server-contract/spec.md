# Spec Delta

## MODIFIED Requirements

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

#### Scenario: Move into another private room
- **WHEN** a member of two private rooms requests a batch move of an encrypted file from one into the other
- **THEN** the server refuses the file with "You don't have enough permission to move the file" and moves nothing
