# Spec Delta

## MODIFIED Requirements

### Requirement: Room-level operations withheld for private rooms
The system SHALL NOT offer index editing, index export, save as template or duplicate in the context menu of a private room.

#### Scenario: Private room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** edit-index, export-room-index, save-as-template and duplicate-room are absent

## ADDED Requirements

### Requirement: Room download offered for private rooms
The system SHALL offer "Download" and "Download without decryption" in the context menu of a private room that grants the download right. "Download" saves the room as one zip of its decrypted files and "Download without decryption" requests a server archive of the room's ciphertext, as `private-rooms/file-operations` describes them for a folder of the room.

#### Scenario: Private room with the download right
- **WHEN** the context menu of a private room that grants the download right is opened
- **THEN** download and download-encrypted are present

#### Scenario: Room downloaded
- **WHEN** the user picks "Download" on a private room holding encrypted files
- **THEN** a zip with the decrypted files under their original names is saved, and no server archive of the room's ciphertext is requested

#### Scenario: Room downloaded without decryption
- **WHEN** the user picks "Download without decryption" on a private room
- **THEN** the server archive of the room's ciphertext files is downloaded, and nothing is decrypted
