# Spec Delta

## MODIFIED Requirements

### Requirement: Revocation removes access-list entries only
The system SHALL NOT generate a new DEK or re-encrypt file content when a member is removed from a private room. The server deletes the removed member's wrapped keys from the files of the room itself when their share of the room is removed, the room's current owner excepted; the ciphertext stays as it is, so what the member saved or decrypted before stays readable to them.

#### Scenario: Member removed
- **WHEN** a member is removed from a private room
- **THEN** the ciphertext is unchanged, the member's entries are gone from each file's access list, and the server no longer lets the member read the files
