# Spec Delta

## MODIFIED Requirements

### Requirement: Uploads into a private room are encrypted on the client
The system SHALL encrypt each file on the client before it is uploaded into a private room, wrap the file key for the uploader and for each room member the server lists a key for, using that member's selected key so every member gets exactly one wrap, and mark the uploaded file as encrypted. The system SHALL NOT send a file into a private room in any other form.

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
