# Spec Delta

## MODIFIED Requirements

### Requirement: File keys follow the share
The server SHALL remove a user's file keys from every encrypted file of a private room, subfolders included, when the user loses access to it (their share removed or set to none, a leave, a clearing), and from every file on the portal when their personal data is deleted, keeping the keys of the room's current owner and of a share removed before a change of owner; each room revocation SHALL be audited with the room and the users and SHALL NOT appear in the file or folder history.

#### Scenario: Member removed
- **WHEN** a room manager removes a member from a private room
- **THEN** the member's keys are gone from every encrypted file of the room and the other members keep theirs

#### Scenario: Member leaves
- **WHEN** a member leaves a private room
- **THEN** the leaver's keys are gone from every encrypted file of the room

#### Scenario: Member without keys
- **WHEN** a member whose key set is empty leaves a private room, or the owner removes that member or changes their role, through the share request of the room
- **THEN** the server answers 403 with the message "The user does not have an encryption key", the member's share stays as it was and no key is removed

#### Scenario: Key removal fails after the share is written
- **WHEN** a member's share of a private room is removed and the removal of their file keys then fails
- **THEN** the member no longer has access to the room, and their keys stay on the files

#### Scenario: Owner keeps the keys
- **WHEN** the owner clears the room's access, sets their own share to none or has it removed by a manager
- **THEN** the owner keeps their keys and stays the owner

#### Scenario: Personal data deleted
- **WHEN** a user's personal data is deleted
- **THEN** every file key held for that user on the portal is removed

#### Scenario: Owner changed
- **WHEN** ownership of a private room is transferred
- **THEN** the new owner's share removed by the transfer costs them no key, and from then on the new owner is the one whose keys a removal keeps

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse with 403 an ownership change of a private room when the new owner has no encryption keys or an empty key set, and SHALL refuse with 409, leaving the owner as it is, when the new owner, unless they created the room, holds no access entry on some encrypted file of the room, subfolders included; the missing files are read through the missing-file-keys request. The reassignment of a deleted user's rooms SHALL apply neither check.

#### Scenario: New owner without keys
- **WHEN** ownership of a private room is given to a user without keys
- **THEN** the change is refused with 403

#### Scenario: New owner with keys
- **WHEN** ownership is given to a user with keys who holds an access entry on every encrypted file
- **THEN** the room owner changes

#### Scenario: New owner missing entries
- **WHEN** ownership is given to a user with keys who lacks an access entry on an encrypted file, in the room or in a subfolder
- **THEN** the server answers 409 and the owner stays, until the entry is written and the change is asked again

#### Scenario: Room without encrypted files
- **WHEN** ownership of a private room holding plain files only is given to a user with keys
- **THEN** the room owner changes

#### Scenario: Previous owner without keys
- **WHEN** an owner whose own key set is empty gives the room to a user with keys
- **THEN** the change is refused with 403, since the share the previous owner gets in exchange passes the same key check as any new share

#### Scenario: Rooms of a deleted user
- **WHEN** the rooms of a user being deleted are reassigned to a user who lacks entries or has no keys at all
- **THEN** the reassignment completes, and the private rooms are owned by that user

### Requirement: Invitation e-mails carry the room title
The server SHALL NOT include the plaintext title of a private room or of its folders in invitation e-mails or in the letters and pushes about the room and its content; it SHALL name the room with a neutral label ("Private room") and a folder of it with another ("Private folder"), next to the link that resolves the title in the portal.

#### Scenario: Invite to a private room
- **WHEN** an invitation e-mail to a private room is sent or resent
- **THEN** the e-mail contains a link to the room and the neutral label, and not the room title

#### Scenario: Address invited without a user id
- **WHEN** the share request of a private room names an e-mail address and no user id
- **THEN** the server answers 403, since the key check runs before the address is resolved; no account is created and no letter is sent

#### Scenario: Room notices
- **WHEN** a file or folder is created or uploaded in a private room, a member's access or role changes, or the room is archived or removed
- **THEN** the letter or push names the room with the neutral label and not its title, and a folder it names with the folder label and not the folder's title

#### Scenario: What's-new letter
- **WHEN** the what's-new letter lists events of a private room
- **THEN** it names the room and its folders with the neutral label

#### Scenario: Ordinary room
- **WHEN** the same letters are sent for a room without the private setting
- **THEN** they carry its title

### Requirement: Guests cannot hold encryption keys
The server SHALL refuse with 403 a guest who creates, replaces or deletes an encryption key envelope, and SHALL store nothing.

#### Scenario: Guest creates a key
- **WHEN** a guest posts an encryption key envelope
- **THEN** the server answers 403 and stores nothing

#### Scenario: Guest deletes a key
- **WHEN** a guest deletes an envelope by id
- **THEN** the server answers 403

### Requirement: Clearing the access of a private room
The server SHALL refuse with 403 a portal administrator who is not a member clearing the access of a private room or of an entry inside one, while the clearing of an ordinary room by an administrator stays as it was; whoever loses access to a private room through a clearing SHALL lose their wrapped file keys, the room's current owner excepted.

#### Scenario: Access cleared by an administrator outside the room
- **WHEN** a portal administrator who is not a member clears the access of a private room
- **THEN** the server answers 403 and nothing changes

#### Scenario: Members cleared by the owner
- **WHEN** the owner clears the access of a private room
- **THEN** the members lose their keys on every encrypted file of the room and the owner keeps theirs
