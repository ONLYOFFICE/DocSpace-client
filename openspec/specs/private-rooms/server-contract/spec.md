# Server Contract Specification

## Purpose
Lists the server behaviour the private-rooms client relies on: the key-envelope endpoints, the per-file access entries, the encrypted upload session, room creation rules and the editor and conversion guards. Requirements are written on "the server" so a backend change that breaks one is visible as a spec violation; the MSW handlers used by the client E2E suite mirror these rules and have contract tests against the C# code. Behaviour that exists today but is incomplete from a security standpoint is stated neutrally. Implementation: client packages/shared/api/privacy/index.ts and packages/shared/api/files/index.ts; server products/ASC.Files/Server/Api/{PrivacyRoomController,FilesController,SecurityController,UploadController,VirtualRoomsController,EditorController}.cs, Core/Core/FileStorageService.cs, Core/Core/EF/DbFileKeys.cs; mocks packages/shared/__mocks__/handlers/{privacyroom,files}.

## Requirements

### Requirement: Key envelope creation
The server SHALL store a new encryption key envelope for the calling user on a create request, SHALL answer with the caller's full key set, and SHALL treat a create request whose id already exists as a no-op.

#### Scenario: First key created
- **WHEN** a user with no keys posts an envelope
- **THEN** the envelope is stored, an audit event for key creation is written and the full key list is returned

#### Scenario: Duplicate id
- **WHEN** a user posts an envelope whose id is already in their set
- **THEN** nothing is stored and the unchanged key list is returned

### Requirement: Key envelope replacement
The server SHALL replace an existing envelope of the calling user on an update request and SHALL answer 404 when the id is not in the caller's set; an update SHALL NOT insert a new envelope.

#### Scenario: Known id
- **WHEN** a user puts an envelope with an id they own
- **THEN** the stored envelope is replaced and an audit event for key update is written

#### Scenario: Unknown id
- **WHEN** a user puts an envelope with an id they do not own
- **THEN** the server answers 404 and stores nothing

### Requirement: Key envelope listing and deletion
The server SHALL return all envelopes of the calling user on a list request, and SHALL delete one envelope by id, answering 404 for an id the caller does not own.

#### Scenario: Delete own key
- **WHEN** a user deletes an envelope by its id
- **THEN** the envelope is removed, an audit event for key deletion is written and the response is empty

#### Scenario: Delete foreign key
- **WHEN** a user deletes an id that belongs to another user
- **THEN** the server answers 404

### Requirement: Room member public keys
The server SHALL return the public keys of every member of a private room on the room access request, and SHALL answer 404 for a room that does not exist.

#### Scenario: Member keys listed
- **WHEN** a room member requests the room's access keys
- **THEN** the response lists each member's public keys with their ids

### Requirement: File public keys
The server SHALL return, for one file, the public keys of the users that already hold an access entry on that file.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** only users with an existing access entry for that file are returned

### Requirement: File access entries read
The server SHALL return, for one encrypted file, the calling user's own key pairs and the wrapped file keys stored for the caller, and SHALL NOT return wraps that belong to other users.

#### Scenario: Caller reads access
- **WHEN** a user with read access requests the access entries of an encrypted file
- **THEN** the response holds the caller's key pairs and the caller's wrapped file keys only

### Requirement: File access entries write
The server SHALL replace the access entries of a file with the submitted list when the caller can read the file, the file's parent room is private, the caller can create content in that room, and every listed user can read the file; otherwise it SHALL refuse the write.

#### Scenario: Authorised replace
- **WHEN** a room member with create rights submits entries for users who can all read the file
- **THEN** the previous entries for those users are replaced by the submitted ones

#### Scenario: Non-private parent room
- **WHEN** the file's parent room is not private
- **THEN** the write is refused

#### Scenario: Listed user cannot read the file
- **WHEN** one submitted entry names a user without read access to the file
- **THEN** the whole write is refused

### Requirement: One access entry per user and file
The server SHALL keep at most one access entry per (file, user) pair; a second entry for the same user on the same file SHALL NOT be stored.

#### Scenario: Two entries for one user
- **WHEN** a write lists the same user twice for one file
- **THEN** the write fails on the uniqueness constraint

### Requirement: Encrypted flag on file update
The server SHALL accept an encrypted flag on the file-content update request and SHALL store the uploaded bytes as the new version with that flag.

#### Scenario: Encrypted update
- **WHEN** a client updates a file's content with the encrypted flag set
- **THEN** the new version is stored and marked encrypted

### Requirement: Encrypted upload session
The server SHALL accept an encrypted flag when an upload session is created, SHALL accept sequential chunk posts on the session, and SHALL finalise the file on the finalize request or on the last chunk.

#### Scenario: Encrypted session
- **WHEN** a client creates an upload session with the encrypted flag and posts the chunks in order
- **THEN** the resulting file is marked encrypted and keeps the submitted opaque name

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no encryption keys, and SHALL store the room as a custom room with the private setting otherwise.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created with the private setting and the custom room type

### Requirement: No edition or licence gate on private rooms
The server SHALL NOT check the portal edition, licence or tariff before creating a private room; the only precondition is the caller's keys.

#### Scenario: Community edition
- **WHEN** a user with keys creates a private room on any edition
- **THEN** the room is created

### Requirement: Private setting is not editable
The server SHALL NOT change the private setting of a room on a room update request; the setting is fixed at creation and inherited by subfolders.

#### Scenario: Update request
- **WHEN** a room update request is sent for a private room
- **THEN** the private setting stays as it was

#### Scenario: Subfolder created
- **WHEN** a folder is created inside a private room
- **THEN** the folder carries the private setting of its parent

### Requirement: Conversion forbidden for private rooms
The server SHALL refuse conversion and document-builder operations whose source or target is located in a private room.

#### Scenario: Conversion into a private room
- **WHEN** a conversion result would be written into a private room
- **THEN** the operation is refused

### Requirement: PDF form detection from the encrypted header
The server SHALL decide whether an encrypted PDF is a form from the form bit in the unencrypted file header, without reading the document body.

#### Scenario: Encrypted PDF form
- **WHEN** an encrypted PDF's header has the form bit set
- **THEN** the file is reported as a form

### Requirement: Editor configuration carries the caller's key pairs
The server SHALL add the calling user's key pairs to the editor configuration of a file located in a private room, and SHALL omit them for other files.

#### Scenario: Private-room file
- **WHEN** the editor configuration of a private-room file is requested
- **THEN** the caller's key pairs are included

### Requirement: Encrypted content served without signature check
The server SHALL serve an encrypted file's stored bytes to the editor without the anonymous Document Server signature check that non-encrypted files require.

#### Scenario: Editor fetches ciphertext
- **WHEN** the Document Server requests an encrypted file
- **THEN** the stored ciphertext is returned unchanged

### Requirement: Range requests on the file view address
The server SHALL honour HTTP Range requests on a file's view address so the client can read the encrypted file header without downloading the whole file.

#### Scenario: Header read
- **WHEN** the client requests the first 4 KiB of an encrypted file
- **THEN** the server returns exactly that byte range

### Requirement: Audit log scope for private rooms
The server SHALL write audit events for key envelope creation, update and deletion, and SHALL NOT write audit events for file access-entry writes or member revocations.

#### Scenario: Key events logged
- **WHEN** a user creates, replaces or deletes a key envelope
- **THEN** a matching audit event is recorded

#### Scenario: Access entries written
- **WHEN** a client replaces a file's access entries
- **THEN** no audit event is recorded

### Requirement: Invitation e-mails carry the room title
The server SHALL include the plaintext room title in invitation e-mails for private rooms, the same way as for other rooms.

#### Scenario: Invite to a private room
- **WHEN** a user is invited to a private room by e-mail
- **THEN** the e-mail contains the room title

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse an ownership change of a private room when the new owner has no encryption keys, and SHALL NOT transfer or verify the new owner's file access entries as part of the change.

#### Scenario: New owner without keys
- **WHEN** ownership of a private room is given to a user without keys
- **THEN** the change is refused

#### Scenario: New owner with keys
- **WHEN** ownership is given to a user with keys
- **THEN** the room owner changes and the file access entries are left as they were

### Requirement: No recovery, offboarding or file-key audit endpoints
The server SHALL NOT expose endpoints for administrative key recovery, SCIM-driven offboarding from private rooms, or per-file access-entry audit history.

#### Scenario: Recovery requested
- **WHEN** a client calls an administrative recovery endpoint
- **THEN** the server answers 404 because no such route exists

### Requirement: Client calls without a server route
The client SHALL NOT depend on the privacy availability request, the per-file privacy access request used by the desktop path, or the privacy settings read and write; these three routes do not exist on the server and the calls remain in the client API module without a caller or with the desktop-only caller.

#### Scenario: Privacy availability call
- **WHEN** the privacy availability request is sent
- **THEN** the server answers 404

#### Scenario: Desktop per-file access call
- **WHEN** the desktop path requests per-file privacy access
- **THEN** the server answers 404
