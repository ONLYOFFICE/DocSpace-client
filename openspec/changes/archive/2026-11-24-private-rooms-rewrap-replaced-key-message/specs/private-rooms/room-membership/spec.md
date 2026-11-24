# Spec Delta

## ADDED Requirements

### Requirement: A re-wrap names a key the inviter no longer holds
When every file that could not be re-wrapped for a member is wrapped for a key the inviter no longer holds, the system SHALL show Common:PrivateRoomReplacedKeyBarText with the number of those files in place of Common:EncryptedReencryptPartialFailure: in the message after the invitation, in the invitation result and after a retry. The member SHALL stay pending, since another member who can open the files can still re-wrap them.

#### Scenario: Invitation by a user who replaced their key
- **WHEN** a user who replaced their key invites a member into a private room whose four files are wrapped for the previous key
- **THEN** the invitation result names the member under Common:EncryptedAccessPending with Common:PrivateRoomReplacedKeyBarText and the number four, not Common:EncryptedReencryptPartialFailure

#### Scenario: Retry by the same user
- **WHEN** that user triggers the retry on the pending member
- **THEN** Common:PrivateRoomReplacedKeyBarText is shown again and the pending marker stays

#### Scenario: Mixed causes
- **WHEN** one file is wrapped for a key the inviter no longer holds and another could not be re-wrapped for a different reason
- **THEN** Common:EncryptedReencryptPartialFailure is shown with the number two

## MODIFIED Requirements

### Requirement: Partial re-encryption failure is reported
The system SHALL report Common:EncryptedReencryptPartialFailure with the failure count when some files could not be re-wrapped, and Common:EncryptedReencryptFailed when the whole re-encryption fails. A member for whom some or all files could not be re-wrapped SHALL be shown in the Members panel as pending access (Common:EncryptedAccessPending) with a retry action that re-wraps the missing files, or every encrypted file of the room when the re-encryption failed as a whole.

#### Scenario: Some files fail
- **WHEN** re-wrapping fails for a subset of files after an invitation, for a reason other than a key the inviter no longer holds
- **THEN** Common:EncryptedReencryptPartialFailure is shown with the number of failed files and the member row shows Common:EncryptedAccessPending

#### Scenario: Re-encryption fails as a whole
- **WHEN** the re-wrap after an invitation fails as a whole
- **THEN** Common:EncryptedReencryptFailed is shown, every invitee's member row shows Common:EncryptedAccessPending, and their retry re-wraps every encrypted file in the room

#### Scenario: Retry succeeds
- **WHEN** an inviter with edit rights triggers the retry on a pending member and every missing file is re-wrapped
- **THEN** the pending marker disappears and Common:EncryptedAccessRestored is shown

#### Scenario: Retry still fails
- **WHEN** the retry cannot re-wrap some files, for a reason other than a key the inviter no longer holds
- **THEN** the pending marker stays and Common:EncryptedReencryptPartialFailure is shown again with the remaining count
