# Spec Delta

## MODIFIED Requirements

### Requirement: Backfill re-wraps every member
The system SHALL let a room manager run a backfill sweep, once per room and page session and after each invitation, that reads from the server which current members lack an entry on which encrypted files of the room and wraps exactly those files for those members, with a verified key and other than the manager. When that read fails the sweep SHALL fall back to re-wrapping every encrypted file for every such member.

#### Scenario: Late-registered member
- **WHEN** a member who was invited without a key has since registered one and a room manager opens the room
- **THEN** every encrypted file the server lists as lacking the member's entry gains one, and the member can open the files

#### Scenario: Existing entries are kept
- **WHEN** the sweep runs for a member who already holds an entry on a file
- **THEN** the server does not list the file for them and the entry stays as it was, wrapped by its original sender

#### Scenario: Nothing missing
- **WHEN** the server lists no missing entry for the room
- **THEN** the sweep reads no file and writes nothing

#### Scenario: Existing wraps are replaced
- **WHEN** the missing-keys read fails and the fallback sweep runs for a member who already holds an entry on a file
- **THEN** the entry is replaced by a wrap from the manager, and the member still unwraps the file because the manager's public key is among the file's public keys and the room roster

#### Scenario: Member with a refused key change
- **WHEN** the sweep meets a member whose key differs from its pin
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Non-manager opens the room
- **WHEN** a member without room-edit rights opens the room
- **THEN** no sweep runs

#### Scenario: Room listed over several pages
- **WHEN** the fallback sweep lists the room and a folder of it holds subfolders and more files than one page of the server's listing returns
- **THEN** the sweep reaches every encrypted file of that folder, not only those on the first page
