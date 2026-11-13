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
- **WHEN** the context menu of an encrypted file is opened in English
- **THEN** the entry reads "Download encrypted copy"
