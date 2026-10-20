# Spec Delta

## MODIFIED Requirements

### Requirement: Invited members receive re-wrapped file keys
The system SHALL, before sending the room security update, wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, and SHALL send the security update only for invitees whose wraps were written. A best-effort backfill for earlier members whose keys were registered late SHALL run afterwards.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** every encrypted file in the room gains an access entry for each invitee, then the security update grants them access, and Common:UsersInvited is shown

#### Scenario: Order of operations
- **WHEN** the re-encryption for an invitee has not completed
- **THEN** the room security update for that invitee has not been sent yet

#### Scenario: Re-encryption aborted
- **WHEN** the inviter closes the panel or the unlock is cancelled during re-encryption
- **THEN** no security update is sent for invitees whose wraps were not written, and the access entries already written stay in place

### Requirement: Invitees without usable keys are skipped with a warning
The system SHALL skip an invitee who has no encryption key or whose key changed and was refused, SHALL NOT grant them room access, and SHALL list them inline in the invite panel with the reason (Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch) and an option to invite them again later.

#### Scenario: Invitee has no key
- **WHEN** an invitee has no registered encryption key
- **THEN** the invitee does not become a room member, no file access entry is created for them, and the panel lists their name under Common:EncryptedSkippedNoKeys

#### Scenario: Invitee key mismatch refused
- **WHEN** the current public key of an invitee differs from the pinned one and the inviter refuses it
- **THEN** the invitee does not become a room member, no file access entry is created, and the panel lists their name under Common:EncryptedSkippedKeyMismatch

#### Scenario: Mixed invitation
- **WHEN** some invitees have verified keys and others are skipped
- **THEN** only the verified invitees are granted access and the skipped ones are listed inline without closing the panel

### Requirement: Partial re-encryption failure is reported
The system SHALL report Common:EncryptedReencryptPartialFailure with the failure count when some files could not be re-wrapped, and Common:EncryptedReencryptFailed when the whole re-encryption fails. A member for whom some files could not be re-wrapped SHALL be shown in the Members panel as pending access (Common:EncryptedAccessPending) with a retry action that re-wraps the missing files.

#### Scenario: Some files fail
- **WHEN** re-wrapping fails for a subset of files after an invitation
- **THEN** Common:EncryptedReencryptPartialFailure is shown with the number of failed files and the member row shows Common:EncryptedAccessPending

#### Scenario: Retry succeeds
- **WHEN** an inviter with edit rights triggers the retry on a pending member and every missing file is re-wrapped
- **THEN** the pending marker disappears and Common:EncryptedAccessRestored is shown

#### Scenario: Retry still fails
- **WHEN** the retry cannot re-wrap some files
- **THEN** the pending marker stays and Common:EncryptedReencryptPartialFailure is shown again with the remaining count

### Requirement: Member removal is blocked during active uploads
The system SHALL refuse to start removing a member while uploads into the room or any folder inside it are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count.

#### Scenario: Uploads in flight
- **WHEN** a removal is requested while files are still uploading into the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads is shown

#### Scenario: Uploads into a subfolder
- **WHEN** a removal is requested while files are still uploading into a subfolder of the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads counts those uploads
