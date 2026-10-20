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
The server SHALL accept a file marked encrypted only when its title is an opaque identifier followed by an extension, so that no plaintext file name is stored for an encrypted file.

#### Scenario: Plaintext title on an encrypted upload
- **WHEN** an upload session with the encrypted flag carries a human-readable title
- **THEN** the server refuses the session

#### Scenario: Opaque title
- **WHEN** the title is a UUID followed by an extension
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

## MODIFIED Requirements

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse an ownership change of a private room when the new owner has no encryption keys, and SHALL report which encrypted files in the room have no access entry for the new owner so the client can backfill them before completing the change.

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

### Requirement: One access entry per user and file
The server SHALL keep at most one access entry per (file, user, public key id) triple, so a user with several device keys holds one entry per key on the same file; a second entry for the same triple SHALL NOT be stored.

#### Scenario: Two entries for one user
- **WHEN** a write lists the same user twice with different public key ids for one file
- **THEN** both entries are stored

#### Scenario: Duplicate triple
- **WHEN** a write lists the same user and public key id twice for one file
- **THEN** the write fails on the uniqueness constraint

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

## REMOVED Requirements

### Requirement: No recovery, offboarding or file-key audit endpoints
**Reason**: Replaced by the administrative recovery, offboarding and per-file access history requirements above.
**Migration**: Implement the endpoints on the server; the client enrolment and recovery flows follow in the keys-management tab.
