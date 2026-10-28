# Spec Delta

## ADDED Requirements

### Requirement: Room metadata features withheld for private rooms
The server SHALL refuse watermark, content indexing and data lifetime settings on a private room, both at creation and on update, because each of them requires the server to read or transform the document content.

#### Scenario: Watermark on a private room
- **WHEN** a room update sets a watermark on a private room
- **THEN** the server refuses the update with a validation error and the room is unchanged

#### Scenario: Indexing at creation
- **WHEN** a private room is created with indexing enabled
- **THEN** the server refuses the request

### Requirement: Encrypted file titles are validated
The server SHALL accept a file marked encrypted only when its title is an opaque identifier, a lowercase UUID optionally followed by a dot and a lowercase alphanumeric extension, so that no plaintext file name is stored for an encrypted file.

#### Scenario: Plaintext title on an encrypted upload
- **WHEN** an upload session with the encrypted flag carries a human-readable title
- **THEN** the server refuses the session

#### Scenario: Opaque title
- **WHEN** the title is a UUID followed by an extension
- **THEN** the upload is accepted

#### Scenario: Opaque title without an extension
- **WHEN** a file without an extension is uploaded encrypted under a bare UUID
- **THEN** the upload is accepted

### Requirement: Upload session abort
The server SHALL abort an open upload session on request, discarding the chunks received so far, and SHALL answer 404 for a session that does not exist, was finalised or expired. The client SHALL call it when an encrypted upload is cancelled.

#### Scenario: Cancelled encrypted upload
- **WHEN** the user cancels an encrypted upload after the first chunk was sent
- **THEN** the client aborts the session and no partial file remains in the room

### Requirement: Per-file access history
The server SHALL expose, to room managers, the history of access-entry writes and revocations for a file: who wrote which user's entry and when, without the wrap content.

#### Scenario: History read
- **WHEN** a room manager requests the access history of an encrypted file
- **THEN** the response lists each write and revocation with actor, subject user and timestamp

### Requirement: Administrative recovery of a user's identity
For the B2B launch the server SHALL support organisational recovery: a user MAY enrol by wrapping their private key for a recovery administrator's public key, and a recovery administrator SHALL be able to retrieve that wrap for a user who lost every passphrase and recovery phrase, with every retrieval audited.

#### Scenario: Enrolment
- **WHEN** a user enrols in organisational recovery
- **THEN** the server stores the wrap for the recovery administrator and never the raw private key

#### Scenario: Recovery
- **WHEN** a recovery administrator retrieves a user's wrap
- **THEN** an audit event records the administrator, the user and the time

### Requirement: Offboarding revokes private-room access
For the B2B launch the server SHALL, when a user is deprovisioned (SCIM or manual deactivation), remove that user's access entries from every encrypted file and, if the user owned private rooms, require an explicit new owner before the deactivation completes.

#### Scenario: Deprovisioned member
- **WHEN** a member of private rooms is deprovisioned
- **THEN** the user's access entries are removed from every encrypted file in those rooms

#### Scenario: Deprovisioned owner
- **WHEN** the owner of a private room is deprovisioned without a new owner
- **THEN** the deactivation is refused until a new owner with keys is named

### Requirement: Administrator bypass excludes archived private rooms
The server SHALL NOT grant a portal administrator who is not a member of an archived private room any right by role alone: no read, copy or download on its files and folders, and no move, delete or index export on the room. This SHALL match an active private room. An administrator who is a member SHALL keep the rights of their own share.

#### Scenario: Non-member administrator reads an archived private room's file
- **WHEN** a portal administrator who is not a member requests a file of an archived private room by id
- **THEN** the server answers as for an entry the caller cannot read and reports no right on it

#### Scenario: Non-member administrator deletes or restores an archived private room
- **WHEN** a portal administrator who is not a member asks to delete an archived private room, or to move it back to Rooms, by id
- **THEN** the server refuses the request and the room stays where it is

#### Scenario: Member administrator
- **WHEN** a portal administrator who was invited to a private room opens it after it was archived
- **THEN** they keep the rights of their share in the room

### Requirement: Private-room events reach members only
The server SHALL send the socket events of a private room, active or archived, and of its entries only to users who can read the room. It SHALL NOT add portal administrators who are not members to the recipients, so the room title reaches no one outside the room.

#### Scenario: Private room renamed
- **WHEN** a private room is renamed or a file is added to it
- **THEN** members receive the event and a portal administrator who is not a member receives none

### Requirement: Public keys of prospective members
The server SHALL return, to a caller who may change the access of a private room, the public keys of named portal users whether or not they are members of the room, without the private half, so the client can verify an invitee's key before granting access. A named user without stored keys, or with an empty key set, SHALL be absent from the answer. It SHALL answer 404 for an unknown room, 400 for a room that is not private, and 403 for a caller who may not change the room's access.

#### Scenario: Invitee with a key
- **WHEN** a caller who may change the access of a private room asks for the keys of a portal user who is not a member and has stored keys
- **THEN** the user's public keys are returned with their ids, without the encrypted private half

#### Scenario: Invitee without a key
- **WHEN** a named user has never stored a key
- **THEN** the user is absent from the answer and the request still succeeds

#### Scenario: Caller who may not invite
- **WHEN** a caller who may not change the room's access asks for keys
- **THEN** the request is refused with 403 and no key is returned

### Requirement: Saving keys keeps the user's other sign-in links
The server SHALL replace only the user's encryption key record when the user's keys are saved, and SHALL NOT remove any other account link of the user, such as a Google or SSO sign-in.

#### Scenario: User with a linked sign-in provider saves keys
- **WHEN** a user whose account is linked to a sign-in provider creates or replaces their encryption keys
- **THEN** the provider link stays, the user can still sign in through it, and the user holds one encryption key record

### Requirement: No external or invitation links on a private room
The server SHALL refuse to create or update an external link or an invitation link on a private room, active or archived, so that a private room is reached through membership only.

#### Scenario: External link requested
- **WHEN** a room manager requests an external link for a private room
- **THEN** the server refuses the request and the room has no external link

#### Scenario: Invitation link requested
- **WHEN** a room manager requests an invitation link for a private room
- **THEN** the server refuses the request and no link is created

### Requirement: Room-level copies of a private room are refused
The server SHALL refuse to duplicate a private room, to save it as a room template and to export its index, because each of them carries the room's structure or titles outside the room.

#### Scenario: Duplicate requested
- **WHEN** a room manager requests a duplicate of a private room
- **THEN** the server refuses the request and creates no room

#### Scenario: Template requested
- **WHEN** a room manager asks to save a private room as a template
- **THEN** the server refuses the request and creates no template

#### Scenario: Index export requested
- **WHEN** a caller requests the index export of a private room
- **THEN** the server refuses the request and produces no export

## MODIFIED Requirements

### Requirement: File public keys
The server SHALL return, for one file in a private room, active or archived, the keys of every user with a direct user share on the file, its parent folders or its room, plus the owner, skipping groups and users without stored keys, with the private half only on the caller's own entries; it SHALL answer 415 for a file outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

#### Scenario: File in an archived private room
- **WHEN** a reader requests the public keys of a file in an archived private room
- **THEN** the keys are returned as for a file in an active private room, and the server MUST NOT answer 415

### Requirement: Copy right inside archived private rooms
The server SHALL deny the copy right on a file inside a private room, and on a subfolder of one, to every user, room owner included, whether the room is active or archived. In an archived private room the other rights follow the rules of every archived room.

#### Scenario: File in an active private room
- **WHEN** the owner of an active private room lists its encrypted files
- **THEN** each file reports the copy right as false

#### Scenario: File in an archived private room
- **WHEN** the owner, a room manager, a content creator or an editor lists the encrypted files of an archived private room
- **THEN** each file reports the copy right as false, as it does editing, renaming, moving and deleting

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse an ownership change of a private room when the new owner has no encryption keys or an empty key set, and SHALL report which encrypted files in the room have no access entry for the new owner so the client can backfill them before completing the change.

#### Scenario: New owner without keys
- **WHEN** ownership of a private room is given to a user without keys
- **THEN** the change is refused

#### Scenario: New owner with keys
- **WHEN** ownership is given to a user with keys who holds an access entry on every encrypted file
- **THEN** the room owner changes

#### Scenario: New owner missing entries
- **WHEN** ownership is given to a user with keys who lacks access entries on some encrypted files
- **THEN** the server answers with the list of those files and does not change the owner until the entries exist

### Requirement: No edition or licence gate on private rooms
The server SHALL evaluate an explicit private-room availability rule before creating a private room. The default rule SHALL allow every edition; when the rule denies, the server SHALL answer 403 with a distinct error code that the client maps to a localized message.

#### Scenario: Community edition
- **WHEN** a user with keys creates a private room on any edition and the rule allows
- **THEN** the room is created

#### Scenario: Rule denies
- **WHEN** the availability rule denies private rooms for the portal
- **THEN** the server answers 403 with the private-rooms-unavailable error code

### Requirement: Audit log scope for private rooms
The server SHALL write audit events for key envelope creation, update and deletion, for every file access-entry write (actor, file, subject users) and for every member revocation from a private room.

#### Scenario: Key events logged
- **WHEN** a user creates, replaces or deletes a key envelope
- **THEN** a matching audit event is recorded

#### Scenario: Access entries written
- **WHEN** a client replaces a file's access entries
- **THEN** an audit event records the actor, the file and the subject users

#### Scenario: Member revoked
- **WHEN** a member's access entries are removed from a room's files
- **THEN** an audit event records the actor, the room and the revoked user

### Requirement: Invitation e-mails carry the room title
The server SHALL NOT include the plaintext room title of a private room in invitation or notification e-mails; the e-mail SHALL name the room only through a link that resolves the title in the portal.

#### Scenario: Invite to a private room
- **WHEN** a user is invited to a private room by e-mail
- **THEN** the e-mail contains a link to the room and no room title

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no stored key record or an empty key set, a third-party room created as private included, and SHALL refuse with 400 the private flag on a room type other than Custom. It SHALL otherwise store the room as a Custom room with the private setting.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller who deleted all keys
- **WHEN** a user whose key set is empty creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created as a Custom room with the private setting

#### Scenario: Third-party room created as private
- **WHEN** a user without encryption keys connects third-party storage as a private room
- **THEN** the server answers 403 and creates no room

#### Scenario: Private flag on another room type
- **WHEN** a room creation request sets the private flag with a room type other than Custom
- **THEN** the server answers 400 and creates no room

## REMOVED Requirements

### Requirement: No recovery, offboarding or file-key audit endpoints
**Reason**: Replaced by the administrative recovery, offboarding and per-file access history requirements above.
**Migration**: Implement the endpoints on the server; the client enrolment and recovery flows follow in the keys-management tab.
