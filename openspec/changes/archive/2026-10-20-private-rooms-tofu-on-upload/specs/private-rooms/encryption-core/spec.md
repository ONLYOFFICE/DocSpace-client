# Spec Delta

## MODIFIED Requirements

### Requirement: File access list holds one wrap per member
The system SHALL store the per-member wraps in the file's access list on the server, one entry per user id. Each entry carries the user id, the public key id it was wrapped for, and the wrap blob. A wrap SHALL only be produced for a member key that passed the pin check.

#### Scenario: Upload fan-out
- **WHEN** a member uploads a file into a private room
- **THEN** the file's access list is written with a wrap for the uploader and one per room member, for that member's selected key, when the key matches its pin or was pinned on first sight; at most one entry per user

#### Scenario: Member key mismatch on upload
- **WHEN** a listed member key differs from its pin and the uploader refuses it or no resolver is registered
- **THEN** no wrap is written for that member, the file is still uploaded, and Common:EncryptedUploadNotSharedWith names the member

#### Scenario: Member key change accepted on upload
- **WHEN** a listed member key differs from its pin and the uploader accepts it in the key-change dialog
- **THEN** the new key is pinned and the wrap is written for it

### Requirement: Member keys are verified against pins when granting access
The system SHALL check each member's public key against its pin before wrapping a file key for them during invitation, backfill and upload fan-out, and SHALL skip members whose key mismatches and was not accepted.

#### Scenario: Invited member with changed key
- **WHEN** a member being granted access has a key that mismatches its pin and the user refuses it
- **THEN** no wrap is produced for that member and the invitation reports the skipped member

#### Scenario: Unpinned member at upload
- **WHEN** the server lists a member whose key has never been seen on this device
- **THEN** the key is pinned and the wrap is produced
