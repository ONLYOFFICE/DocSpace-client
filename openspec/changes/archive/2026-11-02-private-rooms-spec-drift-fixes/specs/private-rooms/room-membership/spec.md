## MODIFIED Requirements

### Requirement: New owner must hold a verified key
The system SHALL validate the chosen new owner of a private room before transferring ownership, whether the owner is changed from the owner panel or from the room's edit dialog, and SHALL refuse with Common:EncryptedChangeOwnerNoKeys or Common:EncryptedChangeOwnerKeyMismatch when the candidate has no key or a refused key change.

#### Scenario: Candidate without key
- **WHEN** the owner selects a candidate who has no encryption key
- **THEN** ownership is not transferred and Common:EncryptedChangeOwnerNoKeys names the candidate

#### Scenario: Owner changed in the room's edit dialog
- **WHEN** the owner picks a candidate with a refused key change in the edit dialog of a private room and saves
- **THEN** ownership MUST NOT be transferred and Common:EncryptedChangeOwnerKeyMismatch names the candidate, as in the owner panel

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

#### Scenario: Room listed over several pages
- **WHEN** a folder of the room holds subfolders and more files than one page of the server's listing returns
- **THEN** the sweep reaches every encrypted file of that folder, not only those on the first page
