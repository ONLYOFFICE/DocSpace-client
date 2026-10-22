# Spec Delta

## MODIFIED Requirements

### Requirement: Invite requires an unlocked identity
The system SHALL require the encryption identity of the inviter to be unlocked before any invitation into a private room is sent, and SHALL abort with Common:EncryptionLockedAddMembers when unlocking is declined.

#### Scenario: Unlock declined
- **WHEN** the inviter submits invitations and dismisses the passphrase prompt
- **THEN** no invitation is sent and Common:EncryptionLockedAddMembers is shown

#### Scenario: Invite opened from the list
- **WHEN** the inviter opens Invite people from the menu of a private room in the Private or Rooms list and submits invitations while locked
- **THEN** the passphrase prompt is raised as from inside the room, and no invitation is sent if it is dismissed

### Requirement: Member removal confirmation for encrypted rooms
The system SHALL always ask for confirmation before removing a member from a private room, using Common:RemoveUserFromEncryptedRoomWarning as the confirmation text.

#### Scenario: Remove member
- **WHEN** the owner or manager chooses to remove a member of a private room
- **THEN** a confirmation dialog with Common:RemoveUserFromEncryptedRoomWarning is shown before anything changes

#### Scenario: Remove member of a room selected in a list
- **WHEN** the owner or manager selects a private room in the Private or Rooms list and removes a member from its Members tab
- **THEN** the same confirmation is shown before anything changes

### Requirement: Removed member loses file access entries
The system SHALL, after the role update that removes a member, run a revocation over every encrypted file in the room, reporting Common:EncryptedRevokeCompleted, Common:EncryptedRevokePartialFailure or Common:EncryptedRevokeFailed. The server keeps the member's access entries, as an access-list write never removes a user it does not name; access ends only through the lost read access. Existing ciphertext and file keys SHALL NOT be regenerated.

#### Scenario: Revocation succeeds
- **WHEN** the removal is confirmed and the revocation run finishes without errors
- **THEN** Common:EncryptedRevokeCompleted is shown, while the member's access entries remain stored on the server

#### Scenario: Removed member retains an old copy
- **WHEN** a removed member had already downloaded and decrypted a file
- **THEN** that local copy remains readable; only server-side access is withdrawn

#### Scenario: Removal from a room selected in a list
- **WHEN** a member is removed from the Members tab of a private room selected in the Private or Rooms list
- **THEN** the revocation run starts as for a removal from inside the room, and MUST NOT be skipped

### Requirement: No public sharing for private rooms
The system SHALL NOT offer external links, member links or embedding settings for a private room, its folders or its files.

#### Scenario: Room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** it contains no external-link, link-for-room-members or embedding-settings entry

#### Scenario: Members view
- **WHEN** the Members tab of a private room is shown
- **THEN** the public-room link controls are not rendered

#### Scenario: Members view of a room selected in a list
- **WHEN** a private room is selected in the Private or Rooms list with the info panel open on its Members tab
- **THEN** no "Shared links" block and no "Create new link" control are rendered

### Requirement: Share tab hidden for private items
The system SHALL NOT show the Share tab of the info panel for a private room, a folder inside it, or an encrypted file.

#### Scenario: Encrypted file selected
- **WHEN** an encrypted file is selected and the info panel opens
- **THEN** the tabs do not include Share

#### Scenario: Private room selected in a list
- **WHEN** a private room is selected in the Private or Rooms list and the info panel opens
- **THEN** the tabs do not include Share
