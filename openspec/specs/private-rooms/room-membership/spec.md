# Private Room Membership Specification

## Purpose

Covers how a private (end-to-end encrypted) room is created and edited, who can be invited into it, how members are removed, how a member leaves, how ownership changes hands, and which sharing features are withheld because the server never holds a usable key. Everything here is the behaviour on the branch today; the cryptographic key handling it relies on is described by the encryption-core capability, and the file-level consequences by the file-operations capability. Implementation: packages/client/src/components/dialogs/CreateEditRoomDialog, packages/client/src/store/CreateEditRoomStore.ts, packages/client/src/components/panels/InvitePanel, packages/client/src/pages/Home/InfoPanel/Body/views/Members, packages/client/src/components/panels/ChangeRoomOwnerPanel, packages/client/src/components/dialogs/RemoveUserConfirmationDialog, packages/client/src/store/filesActionsStore/rooms.helpers.ts, packages/client/src/store/filesStore/contextOptions.helpers.ts, packages/client/src/helpers/info-panel/tabs.ts, packages/shared/services/private-room/room-encryption.ts.

## Requirements

### Requirement: Private room is a flagged Custom room
The system SHALL present "Private room" as its own room type in the create-room dialog opened from the Private section, while sending the server a Custom room with the private flag set. Only a Custom room SHALL be encryptable; no other room type SHALL carry the private flag. This rule is enforced by the client only: the server accepts the private flag with any room type.

#### Scenario: Private card chosen
- **WHEN** the user creates a room from the Private section, where the dialog shows the Private room type, and confirms creation
- **THEN** the create request carries room type Custom and the private flag set to true

#### Scenario: Other room type
- **WHEN** a Public, Form filling, Virtual data or Collaboration room is created
- **THEN** the private flag is not sent and the room is not encrypted

#### Scenario: Private flag sent with another room type
- **WHEN** a create request that bypasses the client sets the private flag on a room type other than Custom
- **THEN** the server creates a private room of the requested type

### Requirement: Private room creation requires an encryption key
The system SHALL refuse to create a private room for a user who has no registered encryption key, after re-fetching the keys from the server, and SHALL show Common:EncryptionKeysRequiredForPrivateRoom.

#### Scenario: Keys absent after refetch
- **WHEN** the user confirms creation of a private room and the server reports no encryption keys for the user
- **THEN** no room is created and the error toast Common:EncryptionKeysRequiredForPrivateRoom is shown

#### Scenario: Keys present
- **WHEN** the user confirms creation and at least one encryption key is registered
- **THEN** the room is created with the private flag

### Requirement: Starting private room creation without a key starts key generation
The system SHALL offer to generate a key first when a user with no encryption key starts creating a private room from the Private section. The dialog SHALL open on the Private type only after generation succeeds. Cancelling SHALL close the private-room creation, and no dialog SHALL be left open.

#### Scenario: User accepts key generation
- **WHEN** a key-less user presses create in the Private section and confirms the key-generation prompt
- **THEN** the key-generation flow runs and, on success, the create-room dialog opens on the Private type

#### Scenario: User cancels key generation
- **WHEN** a key-less user presses create in the Private section and cancels the prompt
- **THEN** no create-room dialog is left open and no room is created

### Requirement: Private rooms need a secure context
The system SHALL refuse to start private room creation, or to auto-prompt for a key, when the browser does not expose WebCrypto, and SHALL show Common:EncryptionRequiresHttps.

#### Scenario: Plain HTTP origin
- **WHEN** the user presses create in the Private section on an origin without WebCrypto
- **THEN** no create-room dialog is opened and Common:EncryptionRequiresHttps is shown

### Requirement: Navigation into the new private room
The system SHALL navigate into a newly created private room immediately after creation, the same way it does for other rooms, and SHALL open it under the Private section.

#### Scenario: Creation succeeds
- **WHEN** a private room is created successfully
- **THEN** the current view becomes the root folder of the new room at `/private/{roomId}/filter`, with the Private item highlighted

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

#### Scenario: Invite opened from the list
- **WHEN** the inviter opens Invite people from the menu of a private room in the Private or Rooms list and submits invitations while locked
- **THEN** the passphrase prompt is raised as from inside the room, and no invitation is sent if it is dismissed

### Requirement: Invited members receive re-wrapped file keys
The system SHALL, after the room security update succeeds, wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, and SHALL then run the backfill sweep for the room's current members. The system SHALL NOT verify the written access list against the server's read of it, because that read returns only the caller's own entries.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** every encrypted file in the room gains an access entry for each invitee and Common:UsersInvited is shown when the re-encryption completes

#### Scenario: Order of operations
- **WHEN** the room security update succeeds
- **THEN** the re-encryption starts only afterwards, and the panel closes while the progress bar reports the re-encryption

#### Scenario: Written list is not read back
- **WHEN** the re-encryption of a file completes
- **THEN** no drift warning is raised from comparing the written entries with the caller-only read

### Requirement: Invitees without usable keys are skipped with a warning
The system SHALL skip re-encryption for an invitee whose key set is empty or whose key changed and was refused, SHALL still leave them as a room member, and SHALL name them in Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch. The server refuses an invitation request that names a user who never registered a key; that user never becomes a member, while invitees processed earlier in the request may already be added.

#### Scenario: Invitee has no key
- **WHEN** an invitee registered encryption keys earlier and has since deleted all of them
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

#### Scenario: Remove member of a room selected in a list
- **WHEN** the owner or manager selects a private room in the Private or Rooms list and removes a member from its Members tab
- **THEN** the same confirmation is shown before anything changes

### Requirement: Member removal is blocked during active uploads
The system SHALL refuse to start removing a member while uploads into the room root are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count.

#### Scenario: Uploads in flight
- **WHEN** a removal is requested while files are still uploading into the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads is shown

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

### Requirement: Removing a group revokes each member
The system SHALL expand a removed group into its current members and run the revocation for each of them; as for a single member, the server keeps their access entries.

#### Scenario: Group removed
- **WHEN** a group is removed from a private room
- **THEN** a revocation runs for every user in that group, and their access entries remain stored on the server

### Requirement: Leaving a room revokes own access first
The system SHALL, when a member leaves a private room, run a revocation of the leaver's own access entries before dropping the role, on a best-effort basis that never blocks leaving. The server keeps those entries, as an access-list write never removes a user it does not name; access ends when the role is dropped.

#### Scenario: Leave succeeds
- **WHEN** a member confirms leaving a private room
- **THEN** the revocation runs, then the role is dropped, and the leaver's access entries remain stored on the server

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

### Requirement: Room-level operations withheld for private rooms
The system SHALL NOT offer index editing, index export, save as template, duplicate or room download in the context menu of a private room.

#### Scenario: Private room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** edit-index, export-room-index, save-as-template, duplicate-room and download are absent

### Requirement: Standard room management stays available
The system SHALL keep archiving, quota, tags, logo and cover for a private room on the standard room flows. An archived private room SHALL be listed in the Archive of the Private section while that section is available.

#### Scenario: Archive a private room
- **WHEN** the owner archives a private room while the Private section is available
- **THEN** the standard archive flow runs, the room leaves the Private section list and appears in Private → Archive, not in Rooms → Archive

#### Scenario: Restore a private room
- **WHEN** the owner restores a private room from Private → Archive
- **THEN** the room returns to the Private section list

### Requirement: AI and plugin actions withheld
The system SHALL NOT offer AI actions or plugin actions for a private room, its folders or its files.

#### Scenario: Context menu in a private room
- **WHEN** any item inside a private room is right-clicked
- **THEN** ask-ai and plugin entries are absent

### Requirement: Backfill re-wraps every member
The system SHALL let a room manager run a best-effort backfill sweep that re-wraps every encrypted file in a private room for every current member with a verified key other than the manager, once per room and page session and after each invitation. The sweep SHALL NOT try to detect members lacking an entry, because the server shows a caller only their own entries.

#### Scenario: Late-registered member
- **WHEN** a member who was invited without a key has since registered one and a room manager opens the room
- **THEN** every encrypted file in the room gains an entry for that member and the member can open the files

#### Scenario: Existing wraps are replaced
- **WHEN** the sweep runs for a member who already holds an entry on a file
- **THEN** the entry is replaced by a wrap from the manager, and the member still unwraps the file because the manager's public key is among the file's public keys and the room roster

#### Scenario: Member with a refused key change
- **WHEN** the sweep meets a member whose key differs from its pin
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Non-manager opens the room
- **WHEN** a member without room-edit rights opens the room
- **THEN** no sweep runs

### Requirement: No AI chat in private rooms
The system SHALL NOT offer the AI chat while a private room, or a folder inside it, is open, whether the room is active or archived and whatever address it was opened under. The chat runs on the server, which holds the files of a private room only as ciphertext.

#### Scenario: Active private room
- **WHEN** a member opens a private room while AI services are enabled
- **THEN** no AI chat button is shown

#### Scenario: Archived private room under Rooms
- **WHEN** a member opens an archived private room, or a folder inside it, at `/rooms/archived/filter?folder={id}` while AI services are enabled
- **THEN** no AI chat button is shown

#### Scenario: Ordinary archived room
- **WHEN** a user opens an archived room without the private setting while AI services are enabled
- **THEN** the AI chat is offered as in any other archived room

### Requirement: AI and plugin actions withheld in archived private rooms
The system SHALL NOT offer AI actions or plugin actions for the folders and files of an archived private room, exactly as for an active private room. Plugins receive only an item id and fetch the content themselves, so they could neither decrypt it nor be trusted with it.

#### Scenario: Folder context menu with a folder plugin installed
- **WHEN** a plugin that adds a folder context-menu entry is enabled and the user right-clicks a folder inside an archived private room
- **THEN** the plugin entry and ask-ai are absent

#### Scenario: Encrypted file in an archived private room
- **WHEN** the context menu of an encrypted file in an archived private room is opened
- **THEN** ask-ai and plugin entries are absent
