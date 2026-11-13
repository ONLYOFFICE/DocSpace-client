# Spec Delta

## MODIFIED Requirements

### Requirement: Download without decryption
The system SHALL offer "Download without decryption" for encrypted files and for folders in a private room, in the item context menu and in the bulk header menu of a private room; for a file it SHALL save the ciphertext container, for a folder it SHALL request a server archive of the ciphertext. The entry SHALL be labelled Common:DownloadWithoutDecryption, which names what is saved ("Download encrypted copy"); the specs keep calling the action download without decryption.

#### Scenario: Encrypted file
- **WHEN** the user picks download-encrypted on a file
- **THEN** the raw container is saved under its opaque name

#### Scenario: Folder in a private room
- **WHEN** the user picks download-encrypted on a folder
- **THEN** a server-side archive of the ciphertext files is produced and downloaded

#### Scenario: Bulk header menu
- **WHEN** several encrypted files are selected in a private room and the header menu is opened
- **THEN** "Download without decryption" is offered next to "Download"

#### Scenario: Label of the entry
- **WHEN** several encrypted files are selected in a private room and the header menu is opened in English
- **THEN** the entry reads "Download encrypted copy"

## ADDED Requirements

### Requirement: Download submenu names both results
The system SHALL label the two entries of the Download submenu of the client's context menu by what each saves when the submenu holds the download without decryption: Common:DownloadDecryptedCopy for the decrypting download and Common:DownloadEncryptedCopy for the ciphertext one. A Download submenu without that entry SHALL keep Common:OriginalFormat.

#### Scenario: Encrypted file
- **WHEN** the Download submenu of an encrypted file, of a folder in a private room or of a private room is opened
- **THEN** it offers Common:DownloadDecryptedCopy and Common:DownloadEncryptedCopy, and neither Common:OriginalFormat nor a second "Download"

#### Scenario: File outside private rooms
- **WHEN** the Download submenu of a file outside private rooms is opened
- **THEN** its plain download reads Common:OriginalFormat as before
