# Spec Delta

## ADDED Requirements

### Requirement: A file without a wrap for the user is reported as no access
The system SHALL report a file whose access entries hold no wrap for a user who has a key with Common:EncryptedFileNoAccessYet, and SHALL NOT advise that user to set up encryption keys.

#### Scenario: Key holder without a wrap
- **WHEN** a user who holds a key downloads, copies or opens an encrypted file that is not wrapped for them
- **THEN** the message is Common:EncryptedFileNoAccessYet, not Common:NoAccessToEncryptedFile

#### Scenario: User without a key
- **WHEN** a user whose key list is known to hold no key lists a private room
- **THEN** the lock badge keeps the title Common:NoAccessToEncryptedFile
