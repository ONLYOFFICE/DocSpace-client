# Server Contract Specification

## Purpose
Lists the server behaviour the private-rooms client relies on: the key-envelope endpoints, the per-file access entries, the encrypted upload session, room creation rules and the editor and conversion guards. Requirements are written on "the server" so a backend change that breaks one is visible as a spec violation; the MSW handlers used by the client E2E suite mirror these rules and have contract tests against the C# code. Behaviour that exists today but is incomplete from a security standpoint is stated neutrally. Every requirement describes what the ../server implementation actually does, looked up with CodeGraph and read in the source; nothing here is inferred from client code or guessed. Implementation: client packages/shared/api/privacy/index.ts and packages/shared/api/files/index.ts; server products/ASC.Files/Server/Api/{PrivacyRoomController,FilesController,SecurityController,UploadController,VirtualRoomsController,EditorController}.cs, Core/Core/FileStorageService.cs, Core/Core/Entries/EncryptionKeyPairDto.cs, Core/Core/Dao/TeamlabDao/FileDao.cs, Core/Core/Security/FileSecurity.cs, Core/Core/EF/DbFileKeys.cs; mocks packages/shared/__mocks__/handlers/{privacyroom,files}.

## Requirements

### Requirement: Key envelope creation
The server SHALL store a new encryption key envelope for the calling user on a create request and answer 201 with the caller's full key set; it SHALL answer 409 and store nothing when the id is already in the caller's set, and 400 when either key half is missing or blank.

#### Scenario: First key created
- **WHEN** a user with no keys posts an envelope
- **THEN** the envelope is stored, an audit event for key creation is written and the full key list is returned

#### Scenario: Duplicate id
- **WHEN** a user posts an envelope whose id is already in their set
- **THEN** the server answers 409 and nothing is stored

### Requirement: Key envelope replacement
The server SHALL replace an existing envelope of the calling user on an update request and SHALL answer 404 when the id is not in the caller's set; an update SHALL NOT insert a new envelope.

#### Scenario: Known id
- **WHEN** a user puts an envelope with an id they own
- **THEN** the stored envelope is replaced and an audit event for key update is written

#### Scenario: Unknown id
- **WHEN** a user puts an envelope with an id they do not own
- **THEN** the server answers 404 and stores nothing

### Requirement: Key envelope listing and deletion
The server SHALL return all envelopes of the calling user on a list request (no response value at all when the user never stored a key), and SHALL delete one envelope by id with 204, answering 404 for an id the caller does not own.

#### Scenario: Delete own key
- **WHEN** a user deletes an envelope by its id
- **THEN** the envelope is removed, an audit event for key deletion is written and the response is empty

#### Scenario: Delete foreign key
- **WHEN** a user deletes an id that belongs to another user
- **THEN** the server answers 404

### Requirement: Room member public keys
The server SHALL return, on the room access request, one entry per key of each room member shared directly as a user who has stored keys, with the private half only on the caller's own entries; it SHALL answer 404 for an unknown room, 400 for a room that is not private, and 403 when the caller cannot read the room or holds no key there.

#### Scenario: Member keys listed
- **WHEN** a room member requests the room's access keys
- **THEN** the response lists the public keys of members with stored keys, with their ids; members reached only through a group and members without keys are absent

### Requirement: File public keys
The server SHALL return, for one file in a private room, the keys of every user with a direct user share on the file, its parent folders or its room, plus the owner, skipping groups and users without stored keys, with the private half only on the caller's own entries; it SHALL answer 415 for a file outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

### Requirement: File access entries read
The server SHALL return, for one file the caller can read, the calling user's own key pairs and the wrapped file keys stored for the caller, and SHALL NOT return wraps that belong to other users; it answers 403, not 404, for a missing or unreadable file.

#### Scenario: Caller reads access
- **WHEN** a user with read access requests the access entries of an encrypted file
- **THEN** the response holds the caller's key pairs and the caller's wrapped file keys only

### Requirement: File access entries write
The server SHALL replace the stored entries of the listed users only, keeping every other user's entry, when the caller can read the file, the file's parent room is private, the caller can create content in it and every listed user can read the file; otherwise it SHALL answer 403 and store nothing. Leaving a user out never revokes their entry.

#### Scenario: Authorised replace
- **WHEN** a room member with create rights submits entries for users who can all read the file
- **THEN** the previous entries for those users are replaced by the submitted ones

#### Scenario: Non-private parent room
- **WHEN** the file's parent room is not private
- **THEN** the write is refused

#### Scenario: Listed user cannot read the file
- **WHEN** one submitted entry names a user without read access to the file
- **THEN** the whole write is refused

#### Scenario: User left out of the write
- **WHEN** a write does not list a user who already holds an entry on the file
- **THEN** that user's entry stays as it was

### Requirement: One access entry per user and file
The server SHALL keep at most one access entry per (file, user) pair; a second entry for the same user on the same file SHALL NOT be stored.

#### Scenario: Two entries for one user
- **WHEN** a write lists the same user twice for one file
- **THEN** the whole write is refused and the stored entries stay unchanged

### Requirement: Encrypted flag on file update
The server SHALL accept an encrypted flag on the file-content update request, require edit rights, and store the uploaded bytes as a new version carrying that flag; an update without the flag clears the encrypted mark.

#### Scenario: Encrypted update
- **WHEN** a client updates a file's content with the encrypted flag set
- **THEN** the new version is stored and marked encrypted

### Requirement: Encrypted upload session
The server SHALL accept an encrypted flag when an upload session is created, SHALL accept sequential chunk posts on the session, and SHALL finalise the file on the finalize request or on the last chunk.

#### Scenario: Encrypted session
- **WHEN** a client creates an upload session with the encrypted flag and posts the chunks in order
- **THEN** the resulting file is marked encrypted; its title is the submitted name after invalid-character replacement and truncation, renamed only on a title clash

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no stored key record, and SHALL otherwise store the room with the requested room type and the private setting. A caller who deleted all keys still has a record and is not refused; a third-party room created as private is not key-checked.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created with the private setting and the requested room type

### Requirement: No edition or licence gate on private rooms
The server SHALL NOT apply an edition, licence or tariff check specific to private rooms; creating one is subject to the general room-creation rules (room-creation right, tariff room limit, quota) plus the caller's keys.

#### Scenario: Community edition
- **WHEN** a user with keys creates a private room on any edition
- **THEN** the room is created

### Requirement: Private setting is not editable
The server SHALL NOT change the private setting of a room after creation and SHALL reject with 400 a room update body that carries it; a folder inside a private room is treated as private through its parent room, while the folder's own private field reads false.

#### Scenario: Update request
- **WHEN** a room update request for a private room carries the private field
- **THEN** the server answers 400 and the private setting stays as it was

#### Scenario: Subfolder created
- **WHEN** a folder is created inside a private room
- **THEN** the server applies the room's private-room rules to it, while the folder's own private field reads false

### Requirement: Conversion forbidden for private rooms
The server SHALL refuse a conversion started through the conversion check, the document converter or a document-builder script when the source file, or the folder the result is saved to, lies in a private room, and SHALL never convert an encrypted file; the copy-as-with-conversion request applies no private-room check to its destination.

#### Scenario: Conversion into a private room
- **WHEN** a document-converter or document-builder result would be written into a private room
- **THEN** the operation is refused

#### Scenario: Copy-as into a private room
- **WHEN** a non-private file is copied with conversion into a private room
- **THEN** the converted plaintext copy is stored in the room

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
The server SHALL serve an encrypted file's stored bytes to the editor without the anonymous Document Server signature check that non-encrypted files require; an anonymous stream request still needs a valid stream key.

#### Scenario: Editor fetches ciphertext
- **WHEN** the Document Server requests an encrypted file
- **THEN** the stored ciphertext is returned unchanged

### Requirement: Range requests on the file view address
The server SHALL honour a single bytes=start-end Range request on a file's view address with a 206 partial response, so the client can read the encrypted file header without downloading the whole file; storage with pre-signed addresses answers with a redirect, and a range starting at 0 records a file-read audit event.

#### Scenario: Header read
- **WHEN** the client requests the first 4 KiB of an encrypted file
- **THEN** the server returns exactly that byte range

### Requirement: Audit log scope for private rooms
The server SHALL write audit events for key envelope creation, update and deletion and for removing a member from a private room, and SHALL NOT write an audit event when a client replaces a file's access entries; no server operation revokes a member's access entries.

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
The server SHALL refuse with 403 an ownership change of a private room when the new owner has no encryption keys, and SHALL NOT transfer or verify the new owner's file access entries as part of the change.

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
The client SHALL NOT depend on the privacy availability request, the per-file privacy access request used by the desktop path, or the privacy settings read and write; none of these route templates exists on the server and the calls remain in the client API module without a caller or with the desktop-only caller.

#### Scenario: Privacy availability call
- **WHEN** the privacy availability request is sent
- **THEN** the server answers 404

#### Scenario: Desktop per-file access call
- **WHEN** the desktop path requests per-file privacy access
- **THEN** the server answers 404

### Requirement: E2E mocks mirror the server contract
The client E2E mocks for private-room endpoints SHALL answer with the routes, status codes, response envelope and DTO fields of the server implementation, and every mock handler SHALL name the server action it mirrors. A shape that cannot be traced to the server source SHALL NOT be added to a mock.

#### Scenario: Duplicate key id
- **WHEN** an E2E spec posts a key envelope whose id is already stored
- **THEN** the mock answers 409 and stores nothing, as the server does

#### Scenario: Access entries read
- **WHEN** an E2E spec reads a file's access entries as one user
- **THEN** the mock returns only that user's wrapped keys

#### Scenario: Entry inside a room
- **WHEN** a mock returns a file or folder that lives inside a room
- **THEN** its root folder id is the Rooms section id, not the room id

### Requirement: Copy right inside archived private rooms
The server SHALL deny the copy right on a file inside an active private room, and on a subfolder of one, to every user, room owner included. It SHALL NOT apply that denial inside an archived private room. There the copy right follows the rules of every archived room: it is granted unless the access is restricted or downloads are denied, and a read-only member gets it only while the room allows downloads.

#### Scenario: File in an active private room
- **WHEN** the owner of an active private room lists its encrypted files
- **THEN** each file reports the copy right as false

#### Scenario: File in an archived private room
- **WHEN** the owner, a room manager, a content creator or an editor lists the encrypted files of an archived private room
- **THEN** each file reports the copy right as true, while editing, renaming, moving and deleting are false

### Requirement: Server-side copy out of a private room is refused
The server SHALL refuse a batch copy of a file from inside a private room to a folder outside that room, whether the room is active or archived, before the operation is queued, so no copy is created. Only a move within the same private room SHALL pass the private-room check.

#### Scenario: Copy out of an archived private room
- **WHEN** a member requests a batch copy of an encrypted file from an archived private room to My documents
- **THEN** the server refuses the request with "You don't have enough permission to move the file", queues no operation and creates no file

#### Scenario: Copy out of an active private room
- **WHEN** a member requests a batch copy of an encrypted file from an active private room to My documents
- **THEN** the server refuses the request with "You don't have enough permission to copy the file" and creates no file

#### Scenario: Copy within the same private room
- **WHEN** a member requests a batch copy of an encrypted file into a subfolder of the same private room
- **THEN** the server refuses the request and creates no file

#### Scenario: Move into another private room
- **WHEN** a member of two private rooms requests a batch move of an encrypted file from one into the other
- **THEN** the server refuses the file with "You don't have enough permission to move the file" and moves nothing

### Requirement: Rooms list privacy filter
The server SHALL accept the `privacyFilter` query parameter on the rooms list and apply it with any search area:
- `Private` (1) returns only rooms with the private setting;
- `NotPrivate` (2) returns only rooms without it;
- an absent value or `None` (0) applies no privacy filter.

#### Scenario: Private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=Private`
- **THEN** only active rooms with the private setting are returned

#### Scenario: Archived private rooms
- **WHEN** the rooms list is requested with `searchArea=Archive&privacyFilter=Private`
- **THEN** only archived rooms with the private setting are returned

#### Scenario: Non-private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=NotPrivate`
- **THEN** no room with the private setting is returned

### Requirement: Private filter drops third-party rooms
The server SHALL NOT return rooms on connected third-party storage when the rooms list is requested with `privacyFilter=Private`.

#### Scenario: User with a third-party room
- **WHEN** a user with a room on connected third-party storage requests the rooms list with `privacyFilter=Private`
- **THEN** the third-party room is not returned

### Requirement: Private rooms of others are not listed to administrators
The server SHALL NOT list a private room to a user who neither created it nor is a member of it, even in the administrator's view that otherwise lists every room in the portal.

#### Scenario: Administrator not invited
- **WHEN** a DocSpace admin who was never invited requests the rooms list
- **THEN** private rooms created by other users are not returned, and other users' non-private rooms are

### Requirement: Private rooms have no section of their own on the server
The server SHALL NOT provide private rooms with a root folder, search area or root-list entry of their own. A private room SHALL be created under the Rooms root, reporting that root's folder type as its root folder type. It SHALL be archived to and restored from the Archive root shared with every other room.

#### Scenario: Root folders list
- **WHEN** the client requests the root folders
- **THEN** the response contains no folder dedicated to private rooms

#### Scenario: Private room folder data
- **WHEN** the client reads a private room
- **THEN** its root folder type is the Rooms root type and its parent is the Rooms root

#### Scenario: Archived private room
- **WHEN** a private room is archived
- **THEN** it moves to the same Archive root as every other archived room

### Requirement: New-items counts include private rooms
The server SHALL count new items of private rooms the same way as new items of every other room. That covers the Rooms root's new-items count, the news listings of the Rooms root and of rooms, and mark-as-read on the Rooms root. None of them applies a privacy distinction.

#### Scenario: New file in a private room
- **WHEN** a member uploads a file into a private room
- **THEN** the Rooms root's new-items count of the other members grows, and the Rooms news listing includes the file

### Requirement: Room socket events carry no private flag
The server SHALL send room socket events (create, update and delete of a folder) with the room's id, parent, title, room type and creator only. The private setting is not part of the payload. Archiving or restoring a room SHALL be sent as a delete from the source followed by a create in the destination.

#### Scenario: User invited into a private room
- **WHEN** a user is added to a private room
- **THEN** that user receives a create-folder event whose payload does not say the room is private

### Requirement: Room groups ignore privacy
The server SHALL NOT accept a privacy filter on the room-group endpoints. A group of the Rooms area SHALL list and count every readable, non-archived room of that area, private rooms included.

#### Scenario: Group with a private room
- **WHEN** a Rooms-area group holds a private room the user can read
- **THEN** the group's room count and listing include that room

### Requirement: Server-built room links
The server SHALL build links to an active room or a folder inside one as `rooms/shared/{id}/filter?folder={id}`. Links to an archived room or a folder inside one SHALL be built as `rooms/archived/filter?folder={id}`. Private rooms SHALL get the same forms.

#### Scenario: Link to an archived private room
- **WHEN** the server builds a link to an archived private room
- **THEN** the link is `rooms/archived/filter?folder={id}`
