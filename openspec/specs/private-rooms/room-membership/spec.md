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
The system SHALL offer to generate a key first when a user with no encryption key starts creating a private room from the Private section. The dialog SHALL open on the Private type only after generation succeeds. Cancelling SHALL close the private-room creation, and no dialog SHALL be left open. A user whose key list is not known, because it has not loaded or failed to load, SHALL NOT be treated as a user with no key.

#### Scenario: User accepts key generation
- **WHEN** a key-less user presses create in the Private section and confirms the key-generation prompt
- **THEN** the key-generation flow runs and, on success, the create-room dialog opens on the Private type

#### Scenario: User cancels key generation
- **WHEN** a key-less user presses create in the Private section and cancels the prompt
- **THEN** no create-room dialog is left open and no room is created

#### Scenario: User cancels inside key generation
- **WHEN** a key-less user confirms the key-generation prompt and then cancels or discards the passphrase dialog or the recovery-phrase dialog
- **THEN** no create-room dialog is left open, no room is created and no key is registered

#### Scenario: Key list could not be loaded
- **WHEN** a user presses create in the Private section while their key list has not loaded, and fetching it again fails
- **THEN** Common:EncryptionKeysLoadFailed is shown, no key-generation prompt is offered and no create-room dialog is left open

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
The system SHALL hide the Guests tab, exclude groups and limit search to portal users when inviting into a private room. The panel SHALL describe the invitation as adding existing members (Common:InviteToRoomManuallyInfoMembers, placeholder Common:InviteToRoomAddPlaceholder) and SHALL NOT offer an invitation language, whatever the portal's guest setting.

#### Scenario: Searching invitees
- **WHEN** the user types in the invite input of a private room
- **THEN** only portal users are suggested; groups and guests do not appear and the Guests tab is absent

#### Scenario: Portal allows inviting guests
- **WHEN** the invite panel of a private room opens on a portal that allows inviting guests
- **THEN** its description and placeholder are those of adding existing members, with no mention of an invitation by email or of the Guests list, and no invitation-language choice is shown

### Requirement: Invite requires an unlocked identity
The system SHALL require the encryption identity of the inviter to be unlocked before any invitation into a private room is sent, and SHALL abort with Common:EncryptionLockedAddMembers when unlocking is declined.

#### Scenario: Unlock declined
- **WHEN** the inviter submits invitations and dismisses the passphrase prompt
- **THEN** no invitation is sent and Common:EncryptionLockedAddMembers is shown

#### Scenario: Invite opened from the list
- **WHEN** the inviter opens Invite people from the menu of a private room in the Private or Rooms list and submits invitations while locked
- **THEN** the passphrase prompt is raised as from inside the room, and no invitation is sent if it is dismissed

### Requirement: Invited members receive re-wrapped file keys
The system SHALL wrap the key of every encrypted file in the room for each newly invited member whose encryption key passes verification, showing re-encryption progress, so that every granted invitee either holds an access entry for every encrypted file or is shown as pending access. The backfill sweep for the room's current members SHALL run afterwards. The system SHALL NOT verify the written access list against the server's read of it, because that read returns only the caller's own entries.

#### Scenario: All invitees have verified keys
- **WHEN** invitations are sent to members with registered, verified keys
- **THEN** each invitee is granted access, every encrypted file in the room gains an access entry for each of them, and Common:UsersInvited is shown

#### Scenario: Order of operations
- **WHEN** an invitation to a private room is sent
- **THEN** room access is granted to the verified invitees before their file keys are wrapped, and each granted invitee ends up holding an access entry for every encrypted file in the room or shown as pending access

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
The system SHALL report Common:EncryptedReencryptPartialFailure with the failure count when some files could not be re-wrapped, and Common:EncryptedReencryptFailed when the whole re-encryption fails. A member for whom some or all files could not be re-wrapped SHALL be shown in the Members panel as pending access (Common:EncryptedAccessPending) with a retry action that re-wraps the missing files, or every encrypted file of the room when the re-encryption failed as a whole.

#### Scenario: Some files fail
- **WHEN** re-wrapping fails for a subset of files after an invitation
- **THEN** Common:EncryptedReencryptPartialFailure is shown with the number of failed files and the member row shows Common:EncryptedAccessPending

#### Scenario: Re-encryption fails as a whole
- **WHEN** the re-wrap after an invitation fails as a whole
- **THEN** Common:EncryptedReencryptFailed is shown, every invitee's member row shows Common:EncryptedAccessPending, and their retry re-wraps every encrypted file in the room

#### Scenario: Retry succeeds
- **WHEN** an inviter with edit rights triggers the retry on a pending member and every missing file is re-wrapped
- **THEN** the pending marker disappears and Common:EncryptedAccessRestored is shown

#### Scenario: Retry still fails
- **WHEN** the retry cannot re-wrap some files
- **THEN** the pending marker stays and Common:EncryptedReencryptPartialFailure is shown again with the remaining count

### Requirement: Member removal confirmation for encrypted rooms
The system SHALL always ask for confirmation before removing a member from a private room, using Common:RemoveUserFromEncryptedRoomWarning as the confirmation text.

#### Scenario: Remove member
- **WHEN** the owner or manager chooses to remove a member of a private room
- **THEN** a confirmation dialog with Common:RemoveUserFromEncryptedRoomWarning is shown before anything changes

#### Scenario: Remove member of a room selected in a list
- **WHEN** the owner or manager selects a private room in the Private or Rooms list and removes a member from its Members tab
- **THEN** the same confirmation is shown before anything changes

### Requirement: Member removal is blocked during active uploads
The system SHALL refuse to start removing a member while uploads into the room or any folder inside it are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count.

#### Scenario: Uploads in flight
- **WHEN** a removal is requested while files are still uploading into the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads is shown

#### Scenario: Uploads into a subfolder
- **WHEN** a removal is requested while files are still uploading into a subfolder of the room
- **THEN** no confirmation dialog opens and Common:CannotRemoveMemberWhileUploads counts those uploads

### Requirement: Removed member loses file access entries
The system SHALL remove a member of a private room through the role update alone, relying on the server to remove the member's wrapped keys from every encrypted file of the room when the share goes, and SHALL NOT rewrite the access entries of the room's files itself; the notice after the removal SHALL report the role update only. Existing ciphertext and file keys SHALL NOT be regenerated.

#### Scenario: Revocation succeeds
- **WHEN** the removal is confirmed and the role update succeeds
- **THEN** the member's keys are gone from the server and the client has written no access entry

#### Scenario: Removed member retains an old copy
- **WHEN** a removed member had already downloaded and decrypted a file
- **THEN** that local copy remains readable; only server-side access is withdrawn

#### Scenario: Removal from a room selected in a list
- **WHEN** a member is removed from the Members tab of a private room selected in the Private or Rooms list
- **THEN** the same role update runs as for a removal from inside the room, and nothing more

### Requirement: Leaving a room drops the role without a client revocation
The system SHALL drop the leaver's role without a revocation of its own when a member leaves a private room; the server removes the leaver's wrapped keys with the role, the room's current owner excepted.

#### Scenario: Leave succeeds
- **WHEN** a member confirms leaving a private room
- **THEN** the role is dropped and the leaver's keys are gone from every encrypted file of the room

#### Scenario: Cleanup fails
- **WHEN** the role update fails before the server has written the role
- **THEN** the member stays in the room with their keys and the failure is shown

#### Scenario: Key removal fails on the server
- **WHEN** the server has dropped the role and then fails to remove the leaver's keys
- **THEN** the failure is shown, the member is no longer in the room, and their wrapped keys stay on the files

### Requirement: New owner must hold a verified key
The system SHALL validate the chosen new owner of a private room before transferring ownership, whether the owner is changed from the owner panel or from the room's edit dialog, and SHALL refuse with Common:EncryptedChangeOwnerNoKeys or Common:EncryptedChangeOwnerKeyMismatch when the candidate has no key or a refused key change.

#### Scenario: Candidate without key
- **WHEN** the owner selects a candidate who has no encryption key
- **THEN** ownership is not transferred and Common:EncryptedChangeOwnerNoKeys names the candidate

#### Scenario: Owner changed in the room's edit dialog
- **WHEN** the owner picks a candidate with a refused key change in the edit dialog of a private room and saves
- **THEN** ownership MUST NOT be transferred and Common:EncryptedChangeOwnerKeyMismatch names the candidate, as in the owner panel

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
The system SHALL NOT offer index editing, index export, save as template or duplicate in the context menu of a private room.

#### Scenario: Private room context menu
- **WHEN** the context menu of a private room is opened
- **THEN** edit-index, export-room-index, save-as-template and duplicate-room are absent

### Requirement: Standard room management stays available
The system SHALL keep archiving, quota, tags, logo and cover for a private room on the standard room flows. An archived private room SHALL be listed in the Archive of the Private section while that section is available.

#### Scenario: Archive a private room
- **WHEN** the owner archives a private room while the Private section is available
- **THEN** the standard archive flow runs, the room leaves the Private section list and appears in Private → Archive, not in Rooms → Archive

#### Scenario: Restore a private room
- **WHEN** the owner restores a private room from Private → Archive
- **THEN** the room returns to the Private section list

### Requirement: AI and plugin actions withheld
The system SHALL NOT offer AI actions or plugin actions for a private room, its folders or its files, neither in the context menu nor as plugin tabs of the info panel.

#### Scenario: Context menu in a private room
- **WHEN** any item inside a private room is right-clicked
- **THEN** ask-ai and plugin entries are absent

#### Scenario: Info panel of a private item
- **WHEN** a plugin that adds an info-panel tab is enabled and the info panel shows a private room, a folder inside one or an encrypted file
- **THEN** the plugin tab MUST NOT be shown

#### Scenario: Info panel of an item outside private rooms
- **WHEN** the same plugin is enabled and the info panel shows a room, folder or file outside private rooms that meets the plugin's own conditions
- **THEN** the plugin tab is shown

### Requirement: Backfill re-wraps every member
The system SHALL let a room manager run a backfill sweep, once per room and page session and after each invitation, that reads from the server which current members lack an entry on which encrypted files of the room and wraps exactly those files for those members, with a verified key and other than the manager. When that read fails the sweep SHALL fall back to re-wrapping every encrypted file for every such member.

#### Scenario: Late-registered member
- **WHEN** a member who was invited without a key has since registered one and a room manager opens the room
- **THEN** every encrypted file the server lists as lacking the member's entry gains one, and the member can open the files

#### Scenario: Existing entries are kept
- **WHEN** the sweep runs for a member who already holds an entry on a file
- **THEN** the server does not list the file for them and the entry stays as it was, wrapped by its original sender

#### Scenario: Nothing missing
- **WHEN** the server lists no missing entry for the room
- **THEN** the sweep reads no file and writes nothing

#### Scenario: Existing wraps are replaced
- **WHEN** the missing-keys read fails and the fallback sweep runs for a member who already holds an entry on a file
- **THEN** the entry is replaced by a wrap from the manager, and the member still unwraps the file because the manager's public key is among the file's public keys and the room roster

#### Scenario: Member with a refused key change
- **WHEN** the sweep meets a member whose key differs from its pin
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Non-manager opens the room
- **WHEN** a member without room-edit rights opens the room
- **THEN** no sweep runs

#### Scenario: Room listed over several pages
- **WHEN** the fallback sweep lists the room and a folder of it holds subfolders and more files than one page of the server's listing returns
- **THEN** the sweep reaches every encrypted file of that folder, not only those on the first page

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

### Requirement: Room download offered for private rooms
The system SHALL offer "Download" and "Download without decryption" in the context menu of a private room that grants the download right. "Download" saves the room as one zip of its decrypted files and "Download without decryption" requests a server archive of the room's ciphertext, as `private-rooms/file-operations` describes them for a folder of the room.

#### Scenario: Private room with the download right
- **WHEN** the context menu of a private room that grants the download right is opened
- **THEN** download and download-encrypted are present

#### Scenario: Room downloaded
- **WHEN** the user picks "Download" on a private room holding encrypted files
- **THEN** a zip with the decrypted files under their original names is saved, and no server archive of the room's ciphertext is requested

#### Scenario: Room downloaded without decryption
- **WHEN** the user picks "Download without decryption" on a private room
- **THEN** the server archive of the room's ciphertext files is downloaded, and nothing is decrypted

### Requirement: Private-room invitations are sent one invitee per request
The system SHALL send the invitations of a private room one invitee per room security request, in the client and the SDK. An invitee whose request is refused SHALL NOT stop the others, and every invitee whose request succeeded SHALL be re-wrapped as "Invited members receive re-wrapped file keys" describes. Rooms that are not private keep one request for all invitees.

#### Scenario: One invitee has never registered a key
- **WHEN** the inviter invites A, who holds a key, and B, who never registered one, into a private room
- **THEN** A becomes a member and receives the file keys, and B does not become a member

#### Scenario: Every invitee refused
- **WHEN** every invitee of a private-room invitation is refused
- **THEN** no re-wrap runs

### Requirement: Refused invitees are named in the invite result
The system SHALL name each refused invitee of a private-room invitation in the invite result: with Common:EncryptedInviteNoKey when the server refused with 403, which it does for a user who never registered a key, and with Common:EncryptedInviteFailed otherwise.

#### Scenario: Invitee without a key named
- **WHEN** the server refuses an invitee of a private room with 403
- **THEN** the invite result names that invitee with Common:EncryptedInviteNoKey

#### Scenario: Other refusal named
- **WHEN** the request of an invitee fails with another error
- **THEN** the invite result names that invitee with Common:EncryptedInviteFailed

### Requirement: Leaving a private room ends its listing
The system SHALL treat a portal administrator or the portal owner who leaves a private room as any other member: the room SHALL leave the open list at once, and a user who leaves from inside the room SHALL be taken to the Private list without it. This covers the room's own leave action and the leave ticked in an ownership transfer. An ordinary room an administrator leaves SHALL stay listed, as before.

#### Scenario: Administrator leaves from the list
- **WHEN** a portal administrator leaves a private room from the Private list
- **THEN** the room's row is removed without a reload, and a later reload does not show it

#### Scenario: Administrator leaves through the owner change
- **WHEN** a portal administrator hands a private room over with the leave option ticked
- **THEN** the room's row is removed from the Private list once the transfer succeeds

#### Scenario: Administrator leaves from inside the room
- **WHEN** a portal administrator leaves a private room while it is open
- **THEN** they land on the Private list, which does not show the room

#### Scenario: Administrator leaves an ordinary room
- **WHEN** a portal administrator leaves a room without the private setting from the Rooms list
- **THEN** the room stays listed, as the server still lets them read it

### Requirement: Trusting a changed key wraps what the member missed
The system SHALL, when the user accepts a member's changed key, wrap the file keys that were skipped for that member while the key was refused, in every room where the open page recorded those files as left out for that member, without waiting for the next backfill sweep.

#### Scenario: Key trusted after a refusal
- **WHEN** files were uploaded into a private room while a member's changed key was refused, and the user later accepts that key
- **THEN** the member gets access entries for those files right away, and can open them without the uploader re-entering the room in a new session

### Requirement: Private room creation needs a Document Server that encrypts
The system SHALL refuse to create a private room, before any request and, in the Private section, before the creation dialog opens, when the files settings report that the connected Document Server cannot work with encrypted files, and SHALL show Common:PrivateRoomDocServiceNotSupported, as it SHALL when the server refuses the creation for that reason.

#### Scenario: Document Server without encryption
- **WHEN** the user confirms the creation of a private room and the files settings report no encrypted-editing support
- **THEN** no room is created and Common:PrivateRoomDocServiceNotSupported is shown

#### Scenario: Creation started in the Private section
- **WHEN** the user starts creating a room in the Private section and the files settings report no encrypted-editing support
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown and no dialog opens

#### Scenario: Creation refused by the server
- **WHEN** the server refuses the creation of a private room because the Document Server cannot encrypt
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown instead of the server's message

### Requirement: Ownership transfer wraps the candidate's missing files
The system SHALL, before it asks the server to transfer a private room to a verified candidate, read from the server which encrypted files of the room lack the candidate's entry, wrap those for the candidate with the current user's unlocked identity, and ask for the transfer only when no such file remains. Otherwise, and when the server refuses the transfer for a missing entry, the owner SHALL stay and Common:EncryptedReencryptPartialFailure SHALL count the files.

#### Scenario: Missing entries wrapped before the transfer
- **WHEN** the owner transfers a private room to a member who lacks an entry on some of its encrypted files
- **THEN** those files gain the member's entry before the transfer is asked, and the member becomes the owner

#### Scenario: Entries still missing
- **WHEN** some of those files cannot be wrapped for the candidate, because their key was refused, a write failed or the server did not store the entry
- **THEN** the transfer is not asked, the owner stays and Common:EncryptedReencryptPartialFailure counts the files

#### Scenario: Transfer refused by the server
- **WHEN** the server refuses the transfer because the candidate still lacks an entry on an encrypted file, for example one uploaded meanwhile
- **THEN** the owner stays and Common:EncryptedReencryptPartialFailure counts the files the server lists as missing

#### Scenario: Unlock declined
- **WHEN** the owner declines to unlock their identity for the transfer
- **THEN** nothing is read or written, the owner stays and Common:EncryptionUnlockRequired is shown

#### Scenario: Ordinary room
- **WHEN** the owner transfers a room that is not private
- **THEN** no unlock is asked, no file is read and the transfer is asked at once

### Requirement: Groups and guests are not members of a private room
The system SHALL NOT make a group or a guest a member of a private room in this version. The server refuses a group's share with 403, because its key check finds no encryption key for a group, and it refuses a guest the same way, because a guest cannot store an encryption key. The invite panels offer neither.

#### Scenario: Group shared with a private room
- **WHEN** a group is sent in the share request of a private room
- **THEN** the server answers 403 and the group gets no access

#### Scenario: Guest shared with a private room
- **WHEN** a guest is sent in the share request of a private room
- **THEN** the server answers 403, since the guest holds no key, and the guest gets no access

#### Scenario: Guest tries to store a key
- **WHEN** a guest submits an encryption key pair
- **THEN** the server refuses it with 403 and stores nothing

### Requirement: Refused access change in a private room is explained
The system SHALL show Common:EncryptedAccessChangeRefused when the server refuses with 403 a member's leave, a member's removal or a member's role change in a private room, and MUST NOT show the server's own message text for it. A refusal in a room that is not private, and a failure that is not a 403, SHALL be shown as before.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown once, the member stays in the room, and no text of the server appears

#### Scenario: Removal refused
- **WHEN** a manager removes a member of a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member stays listed, and no text of the server appears

#### Scenario: Role change refused
- **WHEN** a manager changes the role of a member of a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member keeps the former role, and no text of the server appears

#### Scenario: Leave after an owner change refused
- **WHEN** the owner hands a private room over with the leave option and the server answers 403 to the leave
- **THEN** Common:EncryptedAccessChangeRefused is shown once and no second error follows it

#### Scenario: Refusal in an ordinary room
- **WHEN** the server answers 403 to a role change in a room that is not private
- **THEN** the failure is shown as it is for any room, and Common:EncryptedAccessChangeRefused is not shown

### Requirement: Leave dialog closes after a refused leave of a private room
The system SHALL close the leave dialog when the server refuses with 403 the leave of a private room, since confirming again cannot succeed. After any other failure of a leave the dialog SHALL stay open, with its buttons enabled, so the user can try again.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room and the server answers 403
- **THEN** the dialog closes

#### Scenario: Leave fails for another reason
- **WHEN** a member confirms leaving a room and the request fails without a 403
- **THEN** the failure is shown and the dialog stays open with its buttons enabled

### Requirement: Pending access is read from the server
The system SHALL read the room's missing file keys from the server whenever the members list of a private room loads for a user who may change its access, and SHALL show the listed members as pending access (Common:EncryptedAccessPending) for the listed files and no other member of the room, so the state survives a reload and reaches other devices. What this device records between two loads SHALL hold until the next one.

#### Scenario: Marker after a reload
- **WHEN** a member of a private room lacks the key of some encrypted file and a user who may change the room's access reloads the page and opens the members list
- **THEN** the member's row shows Common:EncryptedAccessPending, and its retry re-wraps the files the server listed

#### Scenario: Another room manager
- **WHEN** another user who may change the room's access opens the members list on another device
- **THEN** the same member is shown as pending access

#### Scenario: Member who misses nothing any more
- **WHEN** the members list loads and the server lists no missing key for a member this device had recorded as pending
- **THEN** the marker is gone from that member's row

#### Scenario: User who may not change the access
- **WHEN** a member who may not change the room's access opens the members list
- **THEN** the missing keys are not requested and no marker changes

#### Scenario: Record written while the list is loading
- **WHEN** an invitation or an upload records a member as pending while the server's list is on its way
- **THEN** that record is kept until the next load

### Requirement: Editor role of a private room does not promise form filling
The system SHALL describe the Editor role in the role list of a private room with Common:EditorDescription, which names viewing, editing, reviewing and commenting, and SHALL NOT use the description that adds form filling.

#### Scenario: Role list of a private room
- **WHEN** a room manager opens the role list for a member of a private room
- **THEN** the Editor role is described by Common:EditorDescription

#### Scenario: Role list of another room
- **WHEN** the role list is opened in a room that is not private
- **THEN** the Editor role keeps Common:RoleEditorDescription
