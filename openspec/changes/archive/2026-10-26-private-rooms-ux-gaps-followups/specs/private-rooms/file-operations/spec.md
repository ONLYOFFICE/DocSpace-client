# Spec Delta

## MODIFIED Requirements

### Requirement: Multiple encrypted files download as a decrypted zip
The system SHALL decrypt each selected encrypted file and deliver them together as Files.zip, a decrypted name that clashes with another taking the lowest numbered suffix no other entry has. A selected folder that lies in a private room SHALL be included as its decrypted subtree under the folder's name, and no server archive SHALL be requested for it. Non-encrypted files and folders outside private rooms of the same selection download through the standard path.

#### Scenario: Several encrypted files selected
- **WHEN** the user downloads a selection of encrypted files
- **THEN** a single Files.zip containing the decrypted files is saved

#### Scenario: Decrypted names clash
- **WHEN** two selected files decrypt to the same name and a third already carries that name with the suffix (1)
- **THEN** the zip holds all three, the clashing one under the suffix (2)

#### Scenario: Files and folders selected
- **WHEN** an encrypted file and a folder of the same private room are selected and "Download" is picked in the header menu
- **THEN** one Files.zip is saved with the file under its decrypted name at the root and the folder's files under their decrypted names inside a directory named after the folder, and no server archive is requested

### Requirement: Decrypted folder download
The system SHALL offer "Download" for a folder inside a private room and for the room itself, from its context menu or with the folder selected alone in the header menu; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, each under its path inside the folder, a name that clashes inside its folder taking the lowest numbered suffix no other entry has, with the same progress and error reporting as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

#### Scenario: Folder selected in the header menu
- **WHEN** a folder of a private room is the only selected item and "Download" is picked in the header menu
- **THEN** the same zip is saved as from the folder's context menu, named after the folder, and no server archive of its ciphertext is requested

### Requirement: Errors on encrypted paths are localized
The system SHALL take every message of an encrypted copy, download or open from the locale files, with no English fallback text in code; an error without a specific message SHALL show Common:EncryptedOperationFailed.

#### Scenario: Error text is localized
- **WHEN** an encrypted copy, download or open fails with an error that has no specific message
- **THEN** the toast shows Common:EncryptedOperationFailed in the user's language, never the raw error object

#### Scenario: Download without decryption fails
- **WHEN** "Download without decryption" is picked in the header menu of a private room or in the context menu of a folder in one, and the server archive request fails without a specific message
- **THEN** the toast shows Common:EncryptedOperationFailed, never the raw error object
