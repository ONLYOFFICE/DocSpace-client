# Spec Delta

## MODIFIED Requirements

### Requirement: Per-file content key
The system SHALL encrypt every file in a private room with its own random 32-byte AES-256 key (DEK), a file re-imported from a container downloaded without decryption included. There SHALL be no room-level key.

#### Scenario: Two files in one room
- **WHEN** two files are uploaded to the same private room
- **THEN** each is encrypted with a different DEK

#### Scenario: Re-imported copy
- **WHEN** a container downloaded without decryption is uploaded back while the file it came from is still in the room
- **THEN** the new file is encrypted with a DEK different from that of the file it came from
