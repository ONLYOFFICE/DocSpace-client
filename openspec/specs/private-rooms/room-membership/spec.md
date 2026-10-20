# Private Room Membership Specification

## Purpose

Covers how a private (end-to-end encrypted) room is created and edited, who can be invited into it, how members are removed, how a member leaves, how ownership changes hands, and which sharing features are withheld because the server never holds a usable key. Everything here is the behaviour on the branch today; the cryptographic key handling it relies on is described by the encryption-core capability, and the file-level consequences by the file-operations capability. Implementation: packages/client/src/components/dialogs/CreateEditRoomDialog, packages/client/src/store/CreateEditRoomStore.ts, packages/client/src/components/panels/InvitePanel, packages/client/src/pages/Home/InfoPanel/Body/views/Members, packages/client/src/components/panels/ChangeRoomOwnerPanel, packages/client/src/components/dialogs/RemoveUserConfirmationDialog, packages/client/src/store/filesActionsStore/rooms.helpers.ts, packages/client/src/store/filesStore/contextOptions.helpers.ts, packages/client/src/helpers/info-panel/tabs.ts, packages/shared/services/private-room/room-encryption.ts.

## Requirements

### Requirement: Private room is a flagged Custom room
The system SHALL present "Private room" as its own room type in the create-room chooser while sending the server a Custom room with the private flag set. Only a Custom room SHALL be encryptable; no other room type SHALL carry the private flag.

#### Scenario: Private card chosen
- **WHEN** the user picks the Private room card and confirms creation
- **THEN** the create request carries room type Custom and the private flag set to true

#### Scenario: Other room type
- **WHEN** a Public, Form filling, Virtual data or Collaboration room is created
- **THEN** the private flag is not sent and the room is not encrypted

### Requirement: Private room creation requires an encryption key
The system SHALL refuse to create a private room for a user who has no registered encryption key, after re-fetching the keys from the server, and SHALL show Common:EncryptionKeysRequiredForPrivateRoom.

#### Scenario: Keys absent after refetch
- **WHEN** the user confirms creation of a private room and the server reports no encryption keys for the user
- **THEN** no room is created and the error toast Common:EncryptionKeysRequiredForPrivateRoom is shown

#### Scenario: Keys present
- **WHEN** the user confirms creation and at least one encryption key is registered
- **THEN** the room is created with the private flag

### Requirement: Choosing the Private card without a key starts key generation
The system SHALL, when a user with no encryption key selects the Private room card, offer to generate a key first; the Private type SHALL be applied only after generation succeeds, and cancelling SHALL close the private-room creation.

#### Scenario: User accepts key generation
- **WHEN** a key-less user selects the Private card and confirms the key-generation prompt
- **THEN** the key-generation flow runs and, on success, the Private type is applied to the dialog

#### Scenario: User cancels key generation
- **WHEN** a key-less user selects the Private card and cancels the prompt
- **THEN** the Private type is not applied and, if the dialog was opened for a private room, the dialog closes

### Requirement: Private rooms need a secure context
The system SHALL refuse to select or auto-prompt the Private room type when the browser does not expose WebCrypto, showing Common:EncryptionRequiresHttps.

#### Scenario: Plain HTTP origin
- **WHEN** the user selects the Private card on an origin without WebCrypto
- **THEN** the selection is rejected and Common:EncryptionRequiresHttps is shown

### Requirement: Navigation into the new private room
The system SHALL navigate into a newly created private room immediately after creation, the same way it does for other rooms.

#### Scenario: Creation succeeds
- **WHEN** a private room is created successfully
- **THEN** the current view becomes the root folder of the new room

### Requirement: Room type and privacy are immutable
The system SHALL NOT allow the room type or the private flag to be changed after creation; the edit dialog SHALL show the type selector disabled and SHALL NOT send the private flag on update.

#### Scenario: Editing a private room
- **WHEN** the owner opens the edit dialog of a private room
- **THEN** the room type selector is disabled and saving changes neither the type nor the private flag

### Requirement: Private badge in permanent settings
The system SHALL show a permanent "private room" setting block with Common:PrivateRoomTitle and Common:PrivateRoomDescription in the create and edit dialogs of a private room.

#### Scenario: Edit dialog of a private room
- **WHEN** the edit dialog of a private room is open
- **THEN** the permanent settings area shows the private room icon, title and description

### Requirement: Invite panel hides external links for private rooms
The system SHALL NOT render the shared-links block in the invite panel of a private room.

#### Scenario: Invite panel opened
- **WHEN** the invite panel is opened for a private room
- **THEN** no external link, link settings or copy-link control is shown

### Requirement: Invite panel offers people only
The system SHALL hide the Guests tab, exclude groups and limit search to portal users when inviting into a private room.

#### Scenario: Searching invitees
- **WHEN** the user types in the invite input of a private room
- **THEN** only portal users are suggested; groups and guests do not appear and the Guests tab is absent

### Requirement: Invite requires an unlocked identity
The system SHALL require the encryption identity of the inviter to be unlocked before any invitation into a private room is sent, and SHALL abort with Common:EncryptionLockedAddMembers when unlocking is declined.

#### Scenario: Unlock declined
- **WHEN** the inviter submits invitations and dismisses the passphrase prompt
- **THEN** no invitation is sent and Common:EncryptionLockedAddMembers is shown

### Requirement: Invited members receive re-wrapped file keys
The system SHALL, after the room security update succeeds, wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, and SHALL then run a best-effort backfill for earlier members whose keys were registered late.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** every encrypted file in the room gains an access entry for each invitee and Common:UsersInvited is shown when the re-encryption completes

#### Scenario: Order of operations
- **WHEN** the room security update succeeds
- **THEN** the re-encryption starts only afterwards, and the panel closes while the progress bar reports the re-encryption

### Requirement: Invitees without usable keys are skipped with a warning
The system SHALL skip re-encryption for an invitee who has no encryption key or whose key changed and was refused, SHALL still leave them as a room member, and SHALL name them in Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch.

#### Scenario: Invitee has no key
- **WHEN** an invitee has no registered encryption key
- **THEN** the invitee becomes a room member, no file access entry is created for them, and Common:EncryptedSkippedNoKeys lists their name

#### Scenario: Invitee key mismatch refused
- **WHEN** the current public key of an invitee differs from the pinned one and the inviter refuses it
- **THEN** no file access entry is created for them and Common:EncryptedSkippedKeyMismatch lists their name

### Requirement: Partial re-encryption failure is reported
The system SHALL report Common:EncryptedReencryptPartialFailure with the failure count when some files could not be re-wrapped, and Common:EncryptedReencryptFailed when the whole re-encryption fails.

#### Scenario: Some files fail
- **WHEN** re-wrapping fails for a subset of files after an invitation
- **THEN** Common:EncryptedReencryptPartialFailure is shown with the number of failed files

### Requirement: Member removal confirmation for encrypted rooms
The system SHALL always ask for confirmation before removing a member from a private room, using Common:RemoveUserFromEncryptedRoomWarning as the confirmation text.

#### Scenario: Remove member
- **WHEN** the owner or manager chooses to remove a member of a private room
- **THEN** a confirmation dialog with Common:RemoveUserFromEncryptedRoomWarning is shown before anything changes

### Requirement: Member removal is blocked during active uploads
The system SHALL refuse to start removing a member while uploads into the room root are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count.

#### Scenario: Uploads in flight
- **WHEN** a removal is requested while files are still uploading into the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads is shown

### Requirement: Removed member loses file access entries
The system SHALL, after the role update that removes a member, delete the access entry of that member from every encrypted file in the room, reporting Common:EncryptedRevokeCompleted, Common:EncryptedRevokePartialFailure or Common:EncryptedRevokeFailed. Existing ciphertext and file keys SHALL NOT be regenerated.

#### Scenario: Revocation succeeds
- **WHEN** the removal is confirmed and the access list of every file is rewritten without the member
- **THEN** Common:EncryptedRevokeCompleted is shown

#### Scenario: Removed member retains an old copy
- **WHEN** a removed member had already downloaded and decrypted a file
- **THEN** that local copy remains readable; only server-side access is withdrawn

### Requirement: Removing a group revokes each member
The system SHALL expand a removed group into its current members and revoke file access for each of them.

#### Scenario: Group removed
- **WHEN** a group is removed from a private room
- **THEN** every user in that group loses their access entry on every encrypted file

### Requirement: Leaving a room revokes own access first
The system SHALL, when a member leaves a private room, remove the own access entry of the leaver from every encrypted file before dropping the role, on a best-effort basis that never blocks leaving.

#### Scenario: Leave succeeds
- **WHEN** a member confirms leaving a private room
- **THEN** their file access entries are removed and then the role is dropped

#### Scenario: Cleanup fails
- **WHEN** removing the access entries fails for some files
- **THEN** the member still leaves the room and the failure is only logged

### Requirement: New owner must hold a verified key
The system SHALL validate the chosen new owner of a private room before transferring ownership and SHALL refuse with Common:EncryptedChangeOwnerNoKeys or Common:EncryptedChangeOwnerKeyMismatch when the candidate has no key or a refused key change.

#### Scenario: Candidate without key
- **WHEN** the owner selects a candidate who has no encryption key
- **THEN** ownership is not transferred and Common:EncryptedChangeOwnerNoKeys names the candidate

### Requirement: Owner candidates are current members
The system SHALL offer only current members of the private room, excluding the current owner, as ownership candidates; administrators who are not members SHALL be excluded.

#### Scenario: Owner selector opened
- **WHEN** the change-owner panel opens for a private room
- **THEN** the list contains room members only, without the current owner and without non-member administrators

### Requirement: No public sharing for private rooms
The system SHALL NOT offer external links, member links or embedding settings for a private room, its folders or its files.

#### Scenario: Room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** it contains no external-link, link-for-room-members or embedding-settings entry

#### Scenario: Members view
- **WHEN** the Members tab of a private room is shown
- **THEN** the public-room link controls are not rendered

### Requirement: Share tab hidden for private items
The system SHALL NOT show the Share tab of the info panel for a private room, a folder inside it, or an encrypted file.

#### Scenario: Encrypted file selected
- **WHEN** an encrypted file is selected and the info panel opens
- **THEN** the tabs do not include Share

### Requirement: Room-level operations withheld for private rooms
The system SHALL NOT offer index editing, index export, save as template, duplicate or room download in the context menu of a private room.

#### Scenario: Private room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** edit-index, export-room-index, save-as-template, duplicate-room and download are absent

### Requirement: Standard room management stays available
The system SHALL keep archiving, quota, tags, logo and cover for a private room on the standard room flows.

#### Scenario: Archive a private room
- **WHEN** the owner archives a private room
- **THEN** the standard archive flow runs and the room appears in Archive with its private badge

### Requirement: AI and plugin actions withheld
The system SHALL NOT offer AI actions or plugin actions for a private room, its folders or its files.

#### Scenario: Context menu in a private room
- **WHEN** any item inside a private room is right-clicked
- **THEN** ask-ai and plugin entries are absent
