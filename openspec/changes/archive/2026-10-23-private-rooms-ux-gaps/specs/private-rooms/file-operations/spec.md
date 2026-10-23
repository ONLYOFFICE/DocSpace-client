# Spec Delta

## MODIFIED Requirements

### Requirement: Create new file in a private room
The system SHALL allow creating only docx, xlsx, pptx and pdf files inside a private room, each produced and encrypted on the client, and SHALL hide the create entries when the user has no encryption key. Creation errors SHALL be reported through localized messages.

#### Scenario: Create document with keys
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** an encrypted empty document is created and listed

#### Scenario: Unsupported extension requested
- **WHEN** a create request for any other extension reaches the private-room creation path
- **THEN** the request is rejected and Common:PrivateRoomCreateNotSupported is shown with the extension

#### Scenario: No keys
- **WHEN** the user has no encryption key
- **THEN** the "+ New" menu, the empty-view tiles, the quick-action tiles and the create hotkeys offer no file creation, only folder creation and upload

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
The system SHALL offer "Download" for a folder inside a private room and for the room itself; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, each under its path inside the folder, a name that clashes inside its folder taking the lowest numbered suffix no other entry has, using the same progress and error reporting as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

### Requirement: Multiple encrypted files download as a decrypted zip
The system SHALL decrypt each selected encrypted file and deliver them together as Files.zip, a decrypted name that clashes with another taking the lowest numbered suffix no other entry has, downloading non-encrypted items of the same selection through the standard path.

#### Scenario: Several encrypted files selected
- **WHEN** the user downloads a selection of encrypted files
- **THEN** a single Files.zip containing the decrypted files is saved

#### Scenario: Decrypted names clash
- **WHEN** two selected files decrypt to the same name and a third already carries that name with the suffix (1)
- **THEN** the zip holds all three, the clashing one under the suffix (2)

### Requirement: Context-menu entries withheld for folders in private rooms
The system SHALL NOT show sharing-settings, copy-shared-link, manage-links, link-for-room-members, create-room, favorites, edit-index, copy-to or duplicate for a folder inside a private room, and SHALL add download-encrypted when the folder is downloadable; the standard download decrypts the folder on the client (Decrypted folder download).

#### Scenario: Folder menu in a private room
- **WHEN** the context menu of a folder inside a private room is built
- **THEN** none of the listed entries is present

### Requirement: Decrypted folder download in an archived private room
The system SHALL offer the standard "Download" for a folder inside an archived private room and decrypt it on the client as in an active private room, so no server archive of its ciphertext is offered as a plain download. It SHALL offer download-encrypted for the folder when it is downloadable, and SHALL withhold the other folder entries withheld in an active private room.

#### Scenario: Folder menu in an archived private room
- **WHEN** the context menu of a folder inside an archived private room is built
- **THEN** download and download-encrypted are present, and sharing-settings, copy-shared-link, manage-links, link-for-room-members, mark-as-favorite, copy-to and duplicate are absent

## ADDED Requirements

### Requirement: Pickers show resolved names
The system SHALL show the decrypted display name of encrypted files in the file and destination pickers, recovering it from the file header when it is not cached and the identity is unlocked. While locked or before recovery completes the opaque name is shown, and the picker itself SHALL NOT raise an unlock prompt.

#### Scenario: Destination picker in a private room
- **WHEN** the Copy or Move dialog lists the encrypted files of a private room with the identity unlocked
- **THEN** each file is listed by its decrypted name, not by its opaque server title

#### Scenario: Picker while locked
- **WHEN** a picker lists encrypted files while the identity is locked
- **THEN** the opaque names are shown and no unlock prompt is raised by the picker

### Requirement: No decryption warning in a Move that stays in the room
The destination picker SHALL NOT show the Common:EncryptedTransferBannerTitle warning for a Move from a private room, because the Move is pinned to that room and nothing can leave it decrypted.

#### Scenario: Move dialog of a private room
- **WHEN** the Move dialog is opened for encrypted files of a private room
- **THEN** no decryption warning is shown

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

- FROM: `### Requirement: No decrypted folder download in an archived private room`
- TO: `### Requirement: Decrypted folder download in an archived private room`
