## ADDED Requirements

### Requirement: Saved names are plain file names
The system SHALL make every name a decrypted download hands to the file system, the suggested name of a saved file, each archive entry and the archive's own name, a plain file name: NFC, no control or text-direction characters, each of `/ \ : * ? " < > |` replaced by `_`, no leading or trailing spaces, no trailing dots, a reserved device name prefixed with `_`, at most 255 bytes in UTF-8 with the extension kept. When nothing is left, the next known name is used, ending with the file's id.

#### Scenario: Ordinary name
- **WHEN** an encrypted file whose decrypted name is "Report 2026.docx" is downloaded
- **THEN** the browser is asked to save it as "Report 2026.docx"

#### Scenario: Name with separators
- **WHEN** a decrypted name holds "/" or "\" between its parts, at its start or at its end
- **THEN** each separator is saved as "_" and the name stays one segment, with no directory created

#### Scenario: Name with a parent reference
- **WHEN** a decrypted name is made of ".." followed by a separator and a further name
- **THEN** it is saved as one segment that starts with ".._", and no entry or save name refers to a directory above it

#### Scenario: Name with a drive prefix
- **WHEN** a decrypted name starts with a drive letter and a colon
- **THEN** the colon is saved as "_" and the name names no drive

#### Scenario: Name with characters file systems reject
- **WHEN** a decrypted name holds any of `: * ? " < > |`
- **THEN** each of them is saved as "_"

#### Scenario: Name with control characters
- **WHEN** a decrypted name holds control characters or text-direction characters
- **THEN** they are left out of the saved name and the other characters keep their order

#### Scenario: Name with trailing dots or spaces
- **WHEN** a decrypted name ends with dots or spaces, or starts with spaces
- **THEN** those spaces and the trailing dots are left out of the saved name

#### Scenario: Reserved device name
- **WHEN** the part of a decrypted name before its first dot is CON, PRN, AUX, NUL, COM1 to COM9 or LPT1 to LPT9 in any letter case
- **THEN** the saved name is the same name with "_" in front of it

#### Scenario: Overlong name
- **WHEN** a decrypted name takes more than 255 bytes in UTF-8
- **THEN** the saved name is shortened before its extension to at most 255 bytes, without splitting a character, and keeps the extension

#### Scenario: Nothing left of the name
- **WHEN** a decrypted name is empty, or is made only of dots, spaces or characters that are left out
- **THEN** the file is saved under the title the server stores for it, made plain by the same rule, and under its id when nothing is left of that either

#### Scenario: Name shown in the list
- **WHEN** a file whose saved name differs from its decrypted name is shown in the list, a picker or a feed
- **THEN** the list keeps showing the decrypted name

### Requirement: Archive directories come from the folder tree
The system SHALL build the directories of a decrypted archive only from the folders it walked, one directory per folder named by the rule of "Saved names are plain file names" with the folder's id when nothing is left; a file name SHALL NOT add a directory. Inside one directory, files and folders SHALL share one set of names compared without regard to letter case; a later clash takes the lowest free numbered suffix.

#### Scenario: File name with a separator inside a folder archive
- **WHEN** a folder of a private room is downloaded and one of its files has a decrypted name with separators
- **THEN** that file is one entry directly in the directory of its folder, and the archive holds no other directory than those of the walked folders

#### Scenario: Folder title with a separator
- **WHEN** a folder whose title holds a separator is downloaded inside its parent folder
- **THEN** its files are in one directory whose name is the title with the separator saved as "_"

#### Scenario: Sibling folders that differ only in case
- **WHEN** a folder holds two subfolders titled "Plans" and "plans"
- **THEN** the archive holds the directories "Plans" and "plans (1)", each with the files of its own folder

#### Scenario: File and folder of the same name
- **WHEN** a folder holds a subfolder titled "Notes" and a file whose decrypted name is "notes"
- **THEN** the subfolder and the file are saved under different names in that directory

#### Scenario: Archive named after a folder
- **WHEN** a folder whose title holds a separator is downloaded as an archive of its own
- **THEN** the archive is saved under the title made plain by the same rule, followed by ".zip"

## MODIFIED Requirements

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name made plain as "Saved names are plain file names" describes, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name, made plain by the rule of "Saved names are plain file names"

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

#### Scenario: No own access entry
- **WHEN** the user downloads one encrypted file for which they hold no access entry
- **THEN** nothing is downloaded and Common:EncryptionDownloadFailed is shown

#### Scenario: Download from the media viewer
- **WHEN** the user downloads an encrypted file from the media viewer with its download button or Ctrl+S, and the identity is unlocked
- **THEN** the browser saves the plaintext file under its original name, made plain by the same rule, and the ciphertext MUST NOT be handed to the browser as the download

#### Scenario: Download from the media viewer of a file that cannot be found
- **WHEN** the user downloads an encrypted file from the media viewer, and the file is neither in the current folder list nor the file the viewer was opened for
- **THEN** Common:EncryptionDownloadFailed is shown, nothing is downloaded, and the ciphertext MUST NOT be handed to the browser as the download

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
