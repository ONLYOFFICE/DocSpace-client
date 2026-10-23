# Spec Delta

## MODIFIED Requirements

### Requirement: Upload target is fixed when the user starts the upload
The system SHALL fix, for every uploaded file, its target folder, whether that folder takes uploads, and whether it lies inside a private room, with that room's type and identity, at the moment the user drops, pastes or picks the files. Every later step SHALL use only this fixed target. Opening another folder, leaving the files section or the open folder being cleared SHALL NOT change where a file is sent, whether it is sent, or whether it is encrypted.

#### Scenario: Room left while files are queued
- **WHEN** a user uploads more files into a private room than are sent at once, and opens the Rooms list before the last of them has started
- **THEN** every file is sent encrypted under an opaque name into the private room, and no file is sent in plaintext

#### Scenario: Files section left while files are queued
- **WHEN** a user uploads files into a private room and opens a page outside the files section before the queue has finished
- **THEN** the remaining files are still sent encrypted into the private room

#### Scenario: Pasted files after navigation
- **WHEN** a user pastes files from the computer with Ctrl+V while a private room is open, and opens another folder before they have started
- **THEN** they are sent encrypted into the private room

#### Scenario: Private room opened while a plain upload is queued
- **WHEN** files queued for a folder outside any private room are still waiting and the user opens a private room
- **THEN** those files are sent unencrypted into the folder they were queued for, and nothing is sent into the private room

#### Scenario: Folder without the upload right opened during the directory read
- **WHEN** a folder tree is dropped on the list of a folder the user may upload into, and the user opens a folder without that right before the browser has finished reading the dropped directories
- **THEN** the files are uploaded into the folder they were dropped on; a drop on a folder without the right sends nothing, even if a folder with the right is opened meanwhile

### Requirement: Queued private uploads are sent only as ciphertext
The system SHALL send a file whose fixed target lies inside a private room only after encrypting it for that room, whatever folder is open when its turn comes. If the file cannot be encrypted then, the system SHALL mark it failed and SHALL NOT send any of its bytes:
- Common:EncryptionKeysRequiredForUpload without a usable key;
- Common:EncryptionLockedUpload when the unlock is declined;
- Common:EncryptionPrepareFailed when encryption yields no ciphertext.

#### Scenario: No key when the queued file starts
- **WHEN** a file queued for a private room reaches its turn while the user has no usable encryption key and another folder is open
- **THEN** no bytes are sent and the item fails with Common:EncryptionKeysRequiredForUpload

#### Scenario: Unlock declined for a queued batch
- **WHEN** the user declines the unlock prompt for a batch queued for a private room
- **THEN** none of its files that would be encrypted is sent, and each of them fails with Common:EncryptionLockedUpload

#### Scenario: Encryption yields no ciphertext
- **WHEN** the encryption step returns a file queued for a private room unencrypted
- **THEN** no upload session is started and the item fails with Common:EncryptionPrepareFailed

#### Scenario: Private target with another room type
- **WHEN** a file's fixed target lies in a private room but names a room type other than the custom room type
- **THEN** the file is refused and no bytes are sent, rather than being sent unencrypted

#### Scenario: Copy into a private room with another room type
- **WHEN** the path of the destination folder of a copy into a private room names a room type other than the custom room type
- **THEN** the copy is refused with Common:EncryptionPrepareFailed and no bytes are sent, as for an upload with such a target

### Requirement: Copy within the same private room
The system SHALL allow copying an encrypted file to the root of the same private room and SHALL give the copy the first copy suffix that no file of the destination carries, without asking.

#### Scenario: Same-room copy
- **WHEN** an encrypted file is copied to the root of its own room
- **THEN** a second encrypted file with a suffixed name appears

#### Scenario: Copy of a name that already has a copy
- **WHEN** the room root holds "Report.docx" and "Report (1).docx", and "Report.docx" is copied to the root
- **THEN** the copy is stored as "Report (2).docx" and no conflict dialog is shown
