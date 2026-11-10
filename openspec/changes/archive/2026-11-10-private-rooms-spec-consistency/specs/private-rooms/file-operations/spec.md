## MODIFIED Requirements

### Requirement: Feeds show resolved names
The system SHALL show the decrypted display name of encrypted files in the History and New-files feeds and in notifications that name a file, recovering the name from the file header when it is not cached and the identity is unlocked; while locked or before recovery completes the opaque name is shown. Recent is not one of these feeds: the server never records an encrypted file as recent.

#### Scenario: History tab
- **WHEN** the History tab of a private room is opened with the identity unlocked
- **THEN** encrypted files are listed by their decrypted names, even if the file list has not been visited in this session

#### Scenario: New files panel
- **WHEN** the New-files panel lists encrypted files of a private room and the identity is unlocked
- **THEN** each entry shows the decrypted name

#### Scenario: Identity locked
- **WHEN** a feed lists encrypted files while the identity is locked
- **THEN** the opaque names are shown and no unlock prompt is raised by the feed itself

#### Scenario: Recent after opening an encrypted file
- **WHEN** the user opens an encrypted file and then opens Recent
- **THEN** the encrypted file is not listed there

### Requirement: Copy within the same private room
The system SHALL allow copying an encrypted file to the root of the same private room, wherever the copy is started, and SHALL give the copy the first copy suffix that no file of the destination carries, without asking.

#### Scenario: Same-room copy
- **WHEN** an encrypted file is copied to the root of its own room
- **THEN** a second encrypted file with a suffixed name appears

#### Scenario: Copy of a name that already has a copy
- **WHEN** the room root holds "Report.docx" and "Report (1).docx", and "Report.docx" is copied to the root
- **THEN** the copy is stored as "Report (2).docx" and no conflict dialog is shown

#### Scenario: Duplicate started outside the room
- **WHEN** an encrypted file is duplicated while the open folder is not its private room
- **THEN** the copy is encrypted for the file's room as a Duplicate inside the room would be, and its content MUST NOT be sent as plaintext
