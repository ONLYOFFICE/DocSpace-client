# Spec Delta

## ADDED Requirements

### Requirement: Key check only when access is first granted
The server SHALL demand encryption keys of a user only when the user first gets access to a private room. It SHALL NOT refuse, for want of keys, a leave, a removal or a role change of a member who already has access, nor an owner change because the previous owner has no keys. It SHALL refuse a group as a member of a private room with a reason of its own.

#### Scenario: Member without keys leaves
- **WHEN** a member of a private room whose key set is empty leaves the room
- **THEN** the leave succeeds and the server MUST NOT answer 403

#### Scenario: Member without keys removed or given another role
- **WHEN** the owner removes a member whose key set is empty, or changes that member's role
- **THEN** the change succeeds

#### Scenario: User without keys invited
- **WHEN** a user without keys is given access to a private room for the first time
- **THEN** the server refuses with 403

#### Scenario: Group added
- **WHEN** a group is added to a private room
- **THEN** the server refuses, and the reason is not the missing-keys reason

### Requirement: Key refusals carry a stable reason
The server SHALL mark a refusal caused by missing encryption keys with a reason a client can read without comparing message text, distinct from a refusal by access rights.

#### Scenario: Refusal for want of keys
- **WHEN** a request is refused because a user has no encryption keys
- **THEN** the answer carries the stable reason, whatever the language of its message

#### Scenario: Refusal by access rights
- **WHEN** the same request is refused because the caller may not change the access
- **THEN** the answer does not carry the missing-keys reason

### Requirement: Private rooms are not listed in the Forms area
The server SHALL NOT list a private room in the Forms area or the form-template area of the rooms listing.

#### Scenario: Forms area
- **WHEN** the rooms of the Forms area are requested on a portal that holds a private form-filling room
- **THEN** the private room is not in the answer

### Requirement: Private section root is titled in the user's language
The server SHALL answer the title of the private section root in the culture of the calling user.

#### Scenario: User with another culture
- **WHEN** a user whose culture is not the default one requests the root folders
- **THEN** the private section root carries the title in that user's language

### Requirement: Version comment refused for an encrypted file
The server SHALL refuse to store a version comment for an encrypted file, since it would hold user text in the clear.

#### Scenario: Comment sent for an encrypted file
- **WHEN** a version comment is sent for a file of a private room
- **THEN** the server refuses and stores nothing

## MODIFIED Requirements

### Requirement: File public keys
The server SHALL return, for one file in a private room, active or archived, the keys of every user holding a share record of their own (not a group or a link) on the file or on any folder above it up to the room, plus the room's owner; it SHALL NOT return a user who no longer has access to the room, the file's creator included. It SHALL skip users without stored keys or a public key, keep the private half only on the caller's entries, and answer 415 outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

#### Scenario: File in an archived private room
- **WHEN** a reader requests the public keys of a file in an archived private room
- **THEN** the keys are returned as for a file in an active private room, and the server MUST NOT answer 415

#### Scenario: Room owner who did not create the file
- **WHEN** the public keys of a file that another member created are requested, and the room owner has stored keys
- **THEN** the room owner's keys are in the answer

#### Scenario: Creator who left the room
- **WHEN** the public keys of a file are requested after its creator left the room
- **THEN** the creator's keys MUST NOT be in the answer

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse with 403 an ownership change of a private room when the new owner has no encryption keys or an empty key set, and SHALL refuse with 409, leaving the owner as it is, when the new owner, unless they created the room, holds no access entry on some encrypted file of the room, subfolders included; the missing files are read through the missing-file-keys request. The reassignment of a deleted user's rooms SHALL NOT leave a private room with an owner who has no encryption keys.

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
- **THEN** the change succeeds, since keys are demanded only of a user who first gets access

#### Scenario: Rooms of a deleted user
- **WHEN** the rooms of a user being deleted are reassigned to a user with keys who lacks entries
- **THEN** the reassignment completes

#### Scenario: Rooms of a deleted user reassigned to a user without keys
- **WHEN** the rooms of a user being deleted are reassigned to a user without encryption keys
- **THEN** no private room ends up owned by that user

### Requirement: File rights reported to the owner of a private room
The server SHALL report on a file of an active private room, to the room's owner, the comment and review rights as granted, and SHALL deny the rights of operations that do not work on encrypted content: rename, the history rights, lock, copy-link, custom-filter, form-gallery, form filling, AI, conversion, embedding and vectorization. It SHALL deny the AI right on a private room. In an archived private room it SHALL deny all of these but read-history.

#### Scenario: Spreadsheet in an active private room
- **WHEN** the owner of an active private room lists an encrypted spreadsheet in it
- **THEN** the file reports Comment and Review as true, and Rename, ReadHistory, EditHistory, Lock, CopyLink, CustomFilter, SubmitToFormGallery, FillForms, StartFilling, FillingStatus, ResetFilling, StopFilling, OpenForm, AskAi, Convert, Embed and Vectorization as false

#### Scenario: PDF in an active private room
- **WHEN** the owner of an active private room of the custom type lists an encrypted PDF in it
- **THEN** the file reports OpenForm as true, and FillForms and SubmitToFormGallery as false

#### Scenario: Image in an active private room
- **WHEN** the owner of an active private room lists an encrypted image in it
- **THEN** the file reports SubmitToFormGallery and OpenForm as false

#### Scenario: File in an archived private room
- **WHEN** the owner of an archived private room lists an encrypted file in it
- **THEN** the file reports Comment, Review, CustomFilter, EditHistory, SubmitToFormGallery and OpenForm as false

#### Scenario: AI right on a private room
- **WHEN** the owner lists a private room
- **THEN** the room reports CanUseAi as false
