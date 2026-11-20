# Spec Delta

## ADDED Requirements

### Requirement: The media viewer reports a file that is not shared yet as no access
The system SHALL show Common:EncryptedFileNoAccessYet in the media viewer when the opened encrypted file holds no wrap for a user who has a key, and SHALL keep Common:EncryptionDecryptPartialFailed for a file that is wrapped for the user and still does not decrypt.

#### Scenario: Image not shared with the user yet
- **WHEN** a user who holds a key opens in the media viewer an encrypted image that is not wrapped for them
- **THEN** the viewer shows Common:EncryptedFileNoAccessYet

#### Scenario: File wrapped but damaged
- **WHEN** the file is wrapped for the user and its decryption fails
- **THEN** the viewer shows Common:EncryptionDecryptPartialFailed with the name of the file

#### Scenario: Next file in the viewer
- **WHEN** the user moves from a file that is not shared yet to one that is
- **THEN** the second file is shown and the message of the first is gone
