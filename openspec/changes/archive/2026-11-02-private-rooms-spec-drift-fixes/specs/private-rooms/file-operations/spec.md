## MODIFIED Requirements

### Requirement: Uploads into a private room are encrypted on the client
The system SHALL encrypt each file on the client before it is uploaded into a private room, wrap the file key for the uploader and for each room member the server lists a key for, using that member's selected key so every member gets exactly one wrap, and mark the uploaded file as encrypted. The system SHALL NOT send a file into a private room in any other form. A failure to write the members' wraps SHALL be reported, never passed over.

#### Scenario: Member uploads a file
- **WHEN** a user with an encryption key drops a file into a private room
- **THEN** the bytes sent to the server are ciphertext under an opaque name and the resulting file is flagged encrypted with an access entry per room member

#### Scenario: Uploader without a key
- **WHEN** a user with no registered encryption key uploads into a private room
- **THEN** no bytes are sent, the item is marked failed in the upload panel with Common:EncryptionKeysRequiredForUpload, and the device-setup hint is shown

#### Scenario: Uploader declines to unlock
- **WHEN** the uploader has a key but cancels the unlock prompt when the upload starts
- **THEN** no bytes are sent and the item is marked failed with Common:EncryptionLockedUpload

#### Scenario: Member with two keys on the server
- **WHEN** the room access list holds two keys for one member
- **THEN** that member gets one access entry, for the selected key, and every other member still gets theirs

#### Scenario: Sharing with the members fails
- **WHEN** the file is stored with the uploader's entry but writing the other members' wraps fails
- **THEN** Common:EncryptedUploadShareFailed names the file, the members whose keys were read are marked as pending access for it, and the upload MUST NOT be reported as shared with them

### Requirement: Copy within the same private room
The system SHALL allow copying an encrypted file to the root of the same private room, wherever the copy is started, and SHALL give the copy the first copy suffix that no file of the destination carries, without asking.

#### Scenario: Same-room copy
- **WHEN** an encrypted file is copied to the root of its own room
- **THEN** a second encrypted file with a suffixed name appears

#### Scenario: Copy of a name that already has a copy
- **WHEN** the room root holds "Report.docx" and "Report (1).docx", and "Report.docx" is copied to the root
- **THEN** the copy is stored as "Report (2).docx" and no conflict dialog is shown

#### Scenario: Duplicate started outside the room
- **WHEN** an encrypted file is duplicated from a list outside its room, such as Recent
- **THEN** the copy is encrypted for the file's room as a Duplicate inside the room would be, and its content MUST NOT be sent as plaintext

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

#### Scenario: No own access entry
- **WHEN** the user downloads one encrypted file for which they hold no access entry
- **THEN** nothing is downloaded and Common:EncryptionDownloadFailed is shown
