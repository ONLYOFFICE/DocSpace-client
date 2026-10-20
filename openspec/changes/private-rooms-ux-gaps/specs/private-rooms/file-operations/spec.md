# Spec Delta

## MODIFIED Requirements

### Requirement: Create new file in a private room
The system SHALL allow creating only docx, xlsx and pptx files inside a private room, each produced and encrypted on the client, and SHALL hide the create entries when the user has no encryption key. Creation errors SHALL be reported through localized messages.

#### Scenario: Create document with keys
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** an encrypted empty document is created and listed

#### Scenario: Unsupported extension requested
- **WHEN** a create request for any other extension reaches the private-room creation path
- **THEN** the request is rejected and Common:PrivateRoomCreateNotSupported is shown with the extension

#### Scenario: No keys
- **WHEN** the user has no encryption key
- **THEN** the "+ New" menu, the empty-view tiles, the quick-action tiles and the create hotkeys offer no file creation, only folder creation and upload

#### Scenario: Create menu opened
- **WHEN** a user with keys opens the "+ New" menu in a private room
- **THEN** the entries are document, spreadsheet, presentation, folder and upload files, and no PDF form entry is present

### Requirement: Download without decryption
The system SHALL offer "Download without decryption" for encrypted files and for folders in a private room, in the item context menu and in the bulk header menu of a private room; for a file it SHALL save the ciphertext container, for a folder it SHALL request a server archive of the ciphertext.

#### Scenario: Encrypted file
- **WHEN** the user picks download-encrypted on a file
- **THEN** the raw container is saved under its opaque name

#### Scenario: Folder in a private room
- **WHEN** the user picks download-encrypted on a folder
- **THEN** a server-side archive of the ciphertext files is produced and downloaded

#### Scenario: Bulk header menu
- **WHEN** several encrypted files are selected in a private room and the header menu is opened
- **THEN** "Download without decryption" is offered next to "Download"

### Requirement: Feeds show resolved names
The system SHALL show the decrypted display name of encrypted files in Recent, History and New-files feeds and in notifications that name a file, recovering the name from the file header when it is not cached and the identity is unlocked; while locked or before recovery completes the opaque name is shown.

#### Scenario: History tab
- **WHEN** the History tab of a private room is opened with the identity unlocked
- **THEN** encrypted files are listed by their decrypted names, even if the file list has not been visited in this session

#### Scenario: New files panel
- **WHEN** the New-files panel lists encrypted files of a private room and the identity is unlocked
- **THEN** each entry shows the decrypted name

#### Scenario: Identity locked
- **WHEN** a feed lists encrypted files while the identity is locked
- **THEN** the opaque names are shown and no unlock prompt is raised by the feed itself

### Requirement: Decrypted folder download
The system SHALL offer "Download" for a folder inside a private room and for the room itself; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, using the same progress and error reporting as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

## ADDED Requirements

### Requirement: Errors on encrypted paths are localized
The system SHALL take every message of an encrypted copy, download or open from the locale files, with no English fallback text in code; an error without a specific message SHALL show Common:EncryptedOperationFailed.

#### Scenario: Error text is localized
- **WHEN** an encrypted copy, download or open fails with an error that has no specific message
- **THEN** the toast shows Common:EncryptedOperationFailed in the user's language, never the raw error object

## RENAMED Requirements

- FROM: `### Requirement: Feeds show opaque names`
- TO: `### Requirement: Feeds show resolved names`

- FROM: `### Requirement: No decrypted folder download`
- TO: `### Requirement: Decrypted folder download`

## REMOVED Requirements

### Requirement: New PDF form entry present in private rooms
**Reason**: PDF forms cannot be filled, started or submitted inside a private room, so offering their creation produces files that can only be downloaded.
**Migration**: The create menu, empty-view tiles, quick actions and hotkeys drop the PDF form entry in private rooms; existing PDF files stay listed and downloadable.

### Requirement: PDF creation on mobile
**Reason**: The mobile PDF tile exists only for the PDF form entry, which is removed in private rooms.
**Migration**: None; the toast Common:MobileEditPdfNotAvailableInfo is no longer reachable from a private room.
