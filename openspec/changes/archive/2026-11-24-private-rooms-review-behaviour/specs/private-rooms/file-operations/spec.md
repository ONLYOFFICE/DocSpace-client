# Spec Delta

## MODIFIED Requirements

### Requirement: Multiple encrypted files download as a decrypted zip
The system SHALL decrypt each selected encrypted file and deliver them together as Files.zip, entries named and kept apart as "Archive directories come from the folder tree" describes. A selected folder that lies in a private room SHALL be included as its decrypted subtree under the folder's name, and no server archive SHALL be requested for it. Non-encrypted files and folders outside private rooms of the same selection download through the standard path.

#### Scenario: Several encrypted files selected
- **WHEN** the user downloads a selection of encrypted files
- **THEN** a single Files.zip containing the decrypted files is saved

#### Scenario: Decrypted names clash
- **WHEN** two selected files decrypt to the same name and a third already carries that name with the suffix (1)
- **THEN** the zip holds all three, the clashing one under the suffix (2)

#### Scenario: Names that differ only in case
- **WHEN** two selected files decrypt to "Budget.xlsx" and "budget.xlsx"
- **THEN** the zip holds "Budget.xlsx" and "budget (1).xlsx"

#### Scenario: Files and folders selected
- **WHEN** an encrypted file and a folder of the same private room are selected and "Download" is picked in the header menu
- **THEN** one Files.zip is saved with the file under its decrypted name at the root and the folder's files under their decrypted names inside a directory named after the folder, and no server archive is requested

#### Scenario: No file can be decrypted
- **WHEN** none of the files can be decrypted and at least one of them fails for another reason than a key the user no longer holds
- **THEN** no zip is saved and Files:DecryptAllFailed is shown

#### Scenario: Every file is wrapped for a key the user no longer holds
- **WHEN** every file is wrapped for a key the user no longer holds
- **THEN** no zip is saved and Common:PrivateRoomReplacedKeyBarText is shown with the number of those files, not Files:DecryptAllFailed

### Requirement: Decrypted folder download
The system SHALL offer "Download" for a folder inside a private room and for the room itself, from its context menu or with the folder selected alone in the header menu; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, each under its path inside the folder, named and kept apart as "Archive directories come from the folder tree" describes, with the same progress and error reporting as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: Names that differ only in case inside a folder
- **WHEN** the user picks "Download" on a folder holding two files that decrypt to "Budget.xlsx" and "budget.xlsx"
- **THEN** the zip holds "Budget.xlsx" and "budget (1).xlsx" in that folder's directory

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

#### Scenario: Folder selected in the header menu
- **WHEN** a folder of a private room is the only selected item and "Download" is picked in the header menu
- **THEN** the same zip is saved as from the folder's context menu, named after the folder, and no server archive of its ciphertext is requested

#### Scenario: No file can be decrypted
- **WHEN** none of the files can be decrypted and at least one of them fails for another reason than a key the user no longer holds
- **THEN** no zip is saved and Files:DecryptAllFailed is shown

#### Scenario: Every file is wrapped for a key the user no longer holds
- **WHEN** every file is wrapped for a key the user no longer holds
- **THEN** no zip is saved and Common:PrivateRoomReplacedKeyBarText is shown with the number of those files, not Files:DecryptAllFailed
