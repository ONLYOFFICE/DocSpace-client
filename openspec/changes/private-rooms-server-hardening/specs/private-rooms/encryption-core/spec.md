# Spec Delta

## MODIFIED Requirements

### Requirement: One access-list entry per user
The system SHALL write one wrap per user key pair into a file's access list, because the server keys the list by file, user and public key id. A user with several key pairs SHALL be served by the entry that matches the key active on the current device.

#### Scenario: Multi-key user at upload
- **WHEN** a file is wrapped for a user who holds two key pairs
- **THEN** the access list holds two entries for that user, one per public key id

#### Scenario: Unwrap on a second device
- **WHEN** a user opens a file on a device whose active key differs from the one used on the first device
- **THEN** the entry for the device's active key is used and the file decrypts without re-sharing
