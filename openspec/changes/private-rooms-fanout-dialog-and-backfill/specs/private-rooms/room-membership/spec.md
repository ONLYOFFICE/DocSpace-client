# Spec Delta

## MODIFIED Requirements

### Requirement: Invited members receive re-wrapped file keys
The system SHALL, after the room security update succeeds, wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, and SHALL then run the backfill sweep for the room's current members. The system SHALL NOT verify the written access list against the server's read of it, because that read returns only the caller's own entries.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** every encrypted file in the room gains an access entry for each invitee and Common:UsersInvited is shown when the re-encryption completes

#### Scenario: Order of operations
- **WHEN** the room security update succeeds
- **THEN** the re-encryption starts only afterwards, and the panel closes while the progress bar reports the re-encryption

#### Scenario: Written list is not read back
- **WHEN** the re-encryption of a file completes
- **THEN** no drift warning is raised from comparing the written entries with the caller-only read

## ADDED Requirements

### Requirement: Backfill re-wraps every member
The system SHALL let a room manager run a best-effort backfill sweep that re-wraps every encrypted file in a private room for every current member with a verified key other than the manager, once per room and page session and after each invitation. The sweep SHALL NOT try to detect members lacking an entry, because the server shows a caller only their own entries.

#### Scenario: Late-registered member
- **WHEN** a member who was invited without a key has since registered one and a room manager opens the room
- **THEN** every encrypted file in the room gains an entry for that member and the member can open the files

#### Scenario: Existing wraps are replaced
- **WHEN** the sweep runs for a member who already holds an entry on a file
- **THEN** the entry is replaced by a wrap from the manager, and the member still unwraps the file because the manager's public key is among the file's public keys and the room roster

#### Scenario: Member with a refused key change
- **WHEN** the sweep meets a member whose key differs from its pin
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Non-manager opens the room
- **WHEN** a member without room-edit rights opens the room
- **THEN** no sweep runs
