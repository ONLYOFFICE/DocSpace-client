# Spec Delta

## ADDED Requirements

### Requirement: Trusting a changed key wraps what the member missed
The system SHALL, when the user accepts a member's changed key, wrap the file keys that were skipped for that member while the key was refused, in the rooms the user can manage, without waiting for the next backfill sweep.

#### Scenario: Key trusted after a refusal
- **WHEN** files were uploaded into a private room while a member's changed key was refused, and the user later accepts that key
- **THEN** the member gets access entries for those files right away, and can open them without the uploader re-entering the room in a new session

## MODIFIED Requirements

### Requirement: Invited members receive re-wrapped file keys
The system SHALL wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, so that every granted invitee either holds an access entry for every encrypted file or is shown as pending access. The backfill sweep for the room's current members SHALL run afterwards. The system SHALL NOT verify the written access list against the server's read of it, because that read returns only the caller's own entries.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** each invitee is granted access, every encrypted file in the room gains an access entry for each of them, and Common:UsersInvited is shown

#### Scenario: Order of operations
- **WHEN** an invitation to a private room completes, whichever of the security update and the re-encryption ran first
- **THEN** each granted invitee holds an access entry for every encrypted file in the room or is shown as pending access

#### Scenario: Written list is not read back
- **WHEN** the re-encryption of a file completes
- **THEN** no drift warning is raised from comparing the written entries with the caller-only read

#### Scenario: Re-encryption aborted
- **WHEN** the inviter closes the panel or the unlock is cancelled during re-encryption
- **THEN** no invitee is left as a room member without either an access entry for every encrypted file or the pending-access marker, and the access entries already written stay in place

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
