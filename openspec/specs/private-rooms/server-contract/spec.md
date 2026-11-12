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
The server SHALL return, for one file in a private room, active or archived, the keys of every user holding a share record of their own (not a group or a link) on the file or on any folder above it up to the room, plus the file's creator even without a record; it SHALL skip users without stored keys or a public key, keep the private half only on the caller's entries, and answer 415 outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

#### Scenario: File in an archived private room
- **WHEN** a reader requests the public keys of a file in an archived private room
- **THEN** the keys are returned as for a file in an active private room, and the server MUST NOT answer 415

#### Scenario: Room owner who did not create the file
- **WHEN** the public keys of a file that another member created are requested, and the room owner holds no share record of their own
- **THEN** the room owner's keys are not in the answer

#### Scenario: Creator who left the room
- **WHEN** the public keys of a file are requested after its creator left the room
- **THEN** the creator's keys are still in the answer

### Requirement: File access entries read
The server SHALL return, for one file the caller can read, the calling user's own key pairs and the wrapped file keys stored for the caller, and SHALL NOT return wraps that belong to other users; it answers 403, not 404, for a missing or unreadable file.

#### Scenario: Caller reads access
- **WHEN** a user with read access requests the access entries of an encrypted file
- **THEN** the response holds the caller's key pairs and the caller's wrapped file keys only

### Requirement: File access entries write
The server SHALL store the submitted entries of the listed users who can read the file, replacing their previous entries and keeping every other user's entry, and SHALL answer the ids of the users it skipped because they cannot read the file. It SHALL do so only when the caller can read the file and create content in its parent room, which is private; otherwise it SHALL answer 403 and store nothing. Each listed user SHALL be checked on a fresh read of the file.

#### Scenario: Authorised replace
- **WHEN** a room member with create rights submits entries for users who can all read the file
- **THEN** the previous entries for those users are replaced by the submitted ones and no id is reported as skipped

#### Scenario: Non-private parent room
- **WHEN** the file's parent room is not private
- **THEN** the write is refused with 403

#### Scenario: Listed user cannot read the file
- **WHEN** one submitted entry names a user without read access to the file, listed before or after a member
- **THEN** the entries of the other users are stored, that user is reported as skipped, and no entry is stored for them

#### Scenario: Every listed user skipped
- **WHEN** no submitted entry names a user who can read the file
- **THEN** nothing is stored, every id is reported as skipped and no audit event is recorded

#### Scenario: User left out of the write
- **WHEN** a write does not list a user who already holds an entry on the file
- **THEN** that user's entry stays as it was

### Requirement: One access entry per user and file
The server SHALL keep at most one access entry per (file, user) pair; a second entry for the same user on the same file SHALL NOT be stored.

#### Scenario: Two entries for one user
- **WHEN** a write lists the same user twice for one file
- **THEN** the whole write is refused and the stored entries stay unchanged

### Requirement: Encrypted flag on file update
The server SHALL accept an encrypted flag on the file-content update request, require edit rights, and store the uploaded bytes as a new version carrying that flag. An update without the flag of an encrypted file, or of a file in a private room, SHALL be refused with 403 and store nothing, so encrypted content never becomes an open file.

#### Scenario: Encrypted update
- **WHEN** a client updates a file's content with the encrypted flag set
- **THEN** the new version is stored and marked encrypted

#### Scenario: Update without the flag
- **WHEN** a client updates the content of an encrypted file, or of a file in a private room, without the encrypted flag
- **THEN** the server answers 403 and no version is stored

### Requirement: Encrypted upload session
The server SHALL accept an encrypted flag when an upload session is created, SHALL accept sequential chunk posts on the session, and SHALL finalise the file on the finalize request or on the last chunk.

#### Scenario: Encrypted session
- **WHEN** a client creates an upload session with the encrypted flag and posts the chunks in order
- **THEN** the resulting file is marked encrypted; its title is the submitted name after invalid-character replacement and truncation, renamed only on a title clash

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no stored key record or an empty key set, and SHALL refuse with 400 the private flag on a room created on third-party storage, with or without keys, and on the AI hub room types (Knowledge, Instructions and AI project rooms). It SHALL otherwise store the room with the requested room type and the private setting.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller who deleted all keys
- **WHEN** a user whose key set is empty creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created with the requested room type and the private setting

#### Scenario: Third-party room created as private
- **WHEN** a user, with or without encryption keys, creates a room on a connected third-party storage as private
- **THEN** the server answers 400, creates no room, and the connection can still back an ordinary room

#### Scenario: AI hub room created as private
- **WHEN** a Knowledge, Instructions or AI project room creation request sets the private flag
- **THEN** the server answers 400 and creates no room

#### Scenario: AI agent created as private
- **WHEN** a user with encryption keys creates an AI agent with the private flag while the Document Server encrypts
- **THEN** the agent is created with the private setting

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
The server SHALL refuse a conversion started through the conversion check, the document converter or a document-builder script when the source file, or the folder the result is saved to, lies in a private room, SHALL never convert an encrypted file, and SHALL refuse with 403 the copy-as-with-conversion request when the source file is marked encrypted or lies in a private room, or when the destination lies in a private room.

#### Scenario: Conversion into a private room
- **WHEN** a document-converter or document-builder result would be written into a private room
- **THEN** the operation is refused

#### Scenario: Copy-as into a private room
- **WHEN** a non-private file is copied with conversion into a private room or into a folder inside one
- **THEN** the server answers 403 and stores nothing

#### Scenario: Copy-as out of a private room
- **WHEN** an encrypted file is copied with conversion to a folder outside its room
- **THEN** the server answers 403 and creates no copy

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
The server SHALL write audit events for key envelope creation, update and deletion, for every stored file access-entry write (actor, file, the recipients whose entries were stored) and for every member revocation from a private room.

#### Scenario: Key events logged
- **WHEN** a user creates, replaces or deletes a key envelope
- **THEN** a matching audit event is recorded

#### Scenario: Access entries written
- **WHEN** a client writes a file's access entries and at least one recipient's entry is stored
- **THEN** an audit event records the actor, the file and the stored recipients

#### Scenario: Member revoked
- **WHEN** a member's access entries are removed from a room's files
- **THEN** an audit event records the actor, the room and the revoked user

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

### Requirement: No recovery or offboarding endpoints
The server SHALL NOT expose endpoints for administrative key recovery or for SCIM-driven offboarding from private rooms. The history of key writes for one file is available through the file history.

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
The server SHALL deny the copy right on a private room, on a file inside it and on a subfolder of it, to every user, room owner included, whether the room is active or archived. In an archived private room the other rights follow the rules of every archived room.

#### Scenario: File in an active private room
- **WHEN** the owner of an active private room lists its encrypted files
- **THEN** each file reports the copy right as false

#### Scenario: File in an archived private room
- **WHEN** the owner, a room manager, a content creator or an editor lists the encrypted files of an archived private room
- **THEN** each file reports the copy right as false, as it does editing, renaming, moving and deleting

### Requirement: Server-side copy out of a private room is refused
The server SHALL refuse a batch copy of a file or a folder from inside a private room to a folder outside that room, whether the room is active or archived, before the operation is queued, so no copy and no folder tree is created; it SHALL refuse a batch move or copy of a folder from outside into a private room; and only a move within the same private room SHALL pass the private-room check. A refusal before the operation is queued is a 403 with the message "Access denied".

#### Scenario: Copy out of an archived private room
- **WHEN** a member requests a batch copy of an encrypted file from an archived private room to My documents
- **THEN** the server refuses the request with 403 "Access denied", queues no operation and creates no file

#### Scenario: Copy out of an active private room
- **WHEN** a member requests a batch copy of an encrypted file from an active private room to My documents
- **THEN** the server refuses the request with 403 "Access denied" and creates no file

#### Scenario: Copy within the same private room
- **WHEN** a member requests a batch copy of an encrypted file into a subfolder of the same private room
- **THEN** the server refuses the request and creates no file

#### Scenario: Move into another private room
- **WHEN** a member of two private rooms requests a batch move of an encrypted file from one into the other
- **THEN** the server refuses the request with 403 "Access denied" and moves nothing

#### Scenario: Subfolder moved out
- **WHEN** the owner requests a batch move of a subfolder of a private room to a folder in My documents
- **THEN** the folder stays in the room and nothing appears outside

#### Scenario: Open folder moved in
- **WHEN** the owner requests a batch move of a folder from My documents into a private room
- **THEN** the folder stays outside and the room is unchanged

#### Scenario: Subfolder moved within the room
- **WHEN** the owner requests a batch move of a subfolder of a private room into another folder of the same room
- **THEN** the folder is moved

#### Scenario: Subfolder copied out of an archived private room
- **WHEN** the owner requests a batch copy of a subfolder of an archived private room to a folder outside it
- **THEN** no folder, not even an empty one, lands outside

### Requirement: Rooms list privacy filter
The server SHALL split the rooms list by the private setting:
- `searchArea=Active` returns no private room, whether the privacy filter is absent, `None` (0) or `NotPrivate` (2);
- `searchArea=Active` with `privacyFilter=Private` (1) is read as `searchArea=PrivateRooms` and returns the section;
- on every other search area the filter applies as given: `Private` only private rooms, `NotPrivate` none, absent or `None` no filter.

#### Scenario: Active rooms without a filter
- **WHEN** the rooms list is requested with `searchArea=Active` and no privacy filter
- **THEN** no room with the private setting is returned

#### Scenario: Private rooms only
- **WHEN** the rooms list is requested with `searchArea=Active&privacyFilter=Private`
- **THEN** only active rooms with the private setting are returned, as with `searchArea=PrivateRooms`

#### Scenario: Archived private rooms
- **WHEN** the rooms list is requested with `searchArea=Archive&privacyFilter=Private`
- **THEN** only archived rooms with the private setting are returned from the shared Archive

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

### Requirement: New-items counts include private rooms
The server SHALL count new items of private rooms under the Private root: that root's new-items count, its news listing and mark-as-read on it. The Rooms root's count, news listing and mark-as-read SHALL NOT cover private rooms.

#### Scenario: New file in a private room
- **WHEN** a member uploads a file into a private room
- **THEN** the Private root's new-items count of the other members grows, the Rooms root's does not, and the Private root's news listing includes the file

### Requirement: Room socket events carry no private flag
The server SHALL send room socket events (create, update and delete of a folder) with the room's id, parent, title, room type and creator only. The private setting is not part of the payload. Archiving or restoring a room SHALL be sent as a delete from the source followed by a create in the destination.

#### Scenario: User invited into a private room
- **WHEN** a user is added to a private room
- **THEN** that user receives a create-folder event whose payload does not say the room is private

### Requirement: Server-built room links
The server SHALL build links to an active room or a folder inside one as `rooms/shared/{id}/filter?folder={id}`. Links to an archived room or a folder inside one SHALL be built as `rooms/archived/filter?folder={id}`. Private rooms SHALL get the same forms.

#### Scenario: Link to an archived private room
- **WHEN** the server builds a link to an archived private room
- **THEN** the link is `rooms/archived/filter?folder={id}`

### Requirement: Room metadata features withheld for private rooms
The server SHALL refuse with 400 a private room creation that turns content indexing on or carries a data lifetime or a watermark that is not explicitly disabled, and SHALL refuse with 400 a private room update that turns indexing on or sends an enabled lifetime or watermark, because each of them requires the server to read or transform the document content. Turning any of them off SHALL stay possible.

#### Scenario: Watermark on a private room
- **WHEN** a room update sets a watermark on a private room
- **THEN** the server refuses the update with 400 and the room is unchanged

#### Scenario: Indexing at creation
- **WHEN** a private room is created with indexing enabled
- **THEN** the server refuses the request with 400 and creates no room

#### Scenario: Lifetime without the enabled flag
- **WHEN** a private room is created with a lifetime object that does not say it is disabled
- **THEN** the server refuses the request with 400

#### Scenario: Settings turned off
- **WHEN** an update of a private room sets indexing off and a disabled lifetime and watermark
- **THEN** the update is applied

### Requirement: Encrypted file titles are validated
The server SHALL refuse with 400, when an upload session opens into a private room or a folder of one, a file name that is not an opaque identifier, a lowercase UUID optionally followed by a dot and a lowercase alphanumeric extension, so that no plaintext file name is stored for an encrypted file; an uppercase UUID or extension and a second dot count as readable.

#### Scenario: Plaintext title on an encrypted upload
- **WHEN** an upload session into a private room carries a human-readable title, an uppercase UUID or extension, or a second dot
- **THEN** the server refuses the session with 400 before any chunk

#### Scenario: Opaque title
- **WHEN** the title is a UUID followed by an extension
- **THEN** the upload is accepted

#### Scenario: Opaque title without an extension
- **WHEN** a file without an extension is uploaded encrypted under a bare UUID
- **THEN** the upload is accepted

### Requirement: Upload session abort
The server SHALL abort an open upload session on request, discarding the chunks received so far, and SHALL answer 404 for a session that does not exist, was finalised, aborted or expired. It SHALL refuse with 403 to abort a session another account opened, and SHALL answer 404 for an abort whose folder segment is not the folder the session uploads into, keeping the session open. The client SHALL call it when an encrypted upload is cancelled after its session opened.

#### Scenario: Cancelled encrypted upload
- **WHEN** the user cancels an encrypted upload after the first chunk was sent
- **THEN** the client aborts the session and no partial file remains in the room

#### Scenario: Session of another account
- **WHEN** a user asks to abort an upload session another account opened
- **THEN** the server answers 403 and the session stays open

#### Scenario: Abort through another folder
- **WHEN** an abort request names a folder other than the one the session uploads into
- **THEN** the server answers 404 and the session stays open

### Requirement: Per-file access history
The server SHALL list every stored write of a file's access entries in the file's history and in its folder's history as a "file keys issued" entry with the actor and the time, without the recipients and without the wrap content; the recipients SHALL be recorded in the audit trail only.

#### Scenario: History read
- **WHEN** a reader of an encrypted file requests its history after a key write
- **THEN** the history lists a "file keys issued" entry with the actor and the time and no recipient

#### Scenario: Write with nothing stored
- **WHEN** a key write skips every recipient
- **THEN** no history entry and no audit event is recorded

### Requirement: Administrator bypass excludes archived private rooms
The server SHALL NOT grant a portal administrator, the portal owner included, who is not a member of an archived private room any right by role alone: no read, copy or download on its files and folders, and no move, delete or index export on the room. This SHALL match an active private room. An administrator who is a member SHALL keep the rights of their own share.

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
The server SHALL send the socket events of a private room, active or archived, and of its entries only to users who can read the room, and SHALL send a webhook payload about an entry of a private room only to the subscriptions whose account can read that entry, judged for each subscription on its own. It SHALL NOT add portal administrators who are not members to the recipients, so the room title reaches no one outside the room.

#### Scenario: Private room renamed
- **WHEN** a private room is renamed or a file is added to it
- **THEN** members receive the event and a portal administrator who is not a member receives none

#### Scenario: Webhook of a folder of a private room
- **WHEN** a folder of a private room changes and a member's subscription is checked before the subscription of an account outside the room
- **THEN** the member's subscription receives the payload and the outside subscription receives none

### Requirement: Public keys of prospective members
The server SHALL return, to a caller who may change the access of an active private room, the public keys of the named portal users, members or not, with no private half on any entry, the caller's own included, so the client can verify an invitee's key before granting access. It SHALL answer 404 for an unknown room, 400 for a room that is not private, a folder inside a room or a malformed id, and 403 for a caller who cannot read the room or may not change its access.

#### Scenario: Invitee with a key
- **WHEN** a caller who may change the access of a private room asks for the keys of a portal user who is not a member and has stored keys
- **THEN** the user's public keys are returned with their ids, without the encrypted private half

#### Scenario: Caller among the candidates
- **WHEN** the caller names their own id
- **THEN** their entry is returned without the encrypted private half

#### Scenario: Caller who may not invite
- **WHEN** a member without the right to change the room's access, a non-member or an administrator who is not a member asks for keys
- **THEN** the request is refused with 403 and no key is returned

#### Scenario: Archived private room
- **WHEN** the owner of an archived private room asks for the keys of a user
- **THEN** the request is refused with 403, because the access of an archived room cannot change

### Requirement: Prospective members who cannot be invited are absent
The server SHALL leave out of the prospective-members answer, without failing the request, a named user who has no stored key or no public key, is a guest, is terminated or does not exist on the portal; a repeated id SHALL count once, and no ids SHALL answer an empty list.

#### Scenario: Invitee without a key
- **WHEN** a named user has never stored a key
- **THEN** the user is absent from the answer and the request still succeeds

#### Scenario: Guest or terminated user named
- **WHEN** a named user is a guest, is terminated or belongs to another portal
- **THEN** the user is absent from the answer and the request still succeeds

#### Scenario: Same user twice
- **WHEN** the same id is named twice
- **THEN** the user's keys are returned once

#### Scenario: No users named
- **WHEN** the request names no user
- **THEN** the answer is an empty list

### Requirement: Missing file keys of a room
The server SHALL report, to a caller who may change the access of an active private room, which of the named users, or of the room's direct members and its creator when none is named, hold no key on which encrypted files of the room, subfolders included, as identifiers only; a user who holds every key SHALL be absent, a file stored in the clear SHALL never be reported, and an id that names nobody on the portal SHALL be ignored. It SHALL apply the access rules of the prospective-members request.

#### Scenario: Member without a key on one file
- **WHEN** the owner asks for the missing keys of a member who holds no key on one encrypted file
- **THEN** the answer lists that member with that file, and lists nothing for them once the key is written

#### Scenario: No users named
- **WHEN** the owner asks without naming users
- **THEN** the room's members are checked and a user outside the room is not reported

#### Scenario: Plain file
- **WHEN** the room holds a file stored in the clear and no encrypted file
- **THEN** the answer is empty

#### Scenario: Caller who may not change access
- **WHEN** a member without that right, an administrator who is not a member, or the owner of an archived private room asks
- **THEN** the request is refused with 403

### Requirement: Saving keys keeps the user's other sign-in links
The server SHALL replace only the user's encryption key record when the user's keys are saved or deleted, and SHALL NOT remove any other account link of the user, such as a Google or SSO sign-in.

#### Scenario: User with a linked sign-in provider saves keys
- **WHEN** a user whose account is linked to a sign-in provider creates or replaces their encryption keys
- **THEN** the keys are saved, the provider link stays, the user can still sign in through it, and the user holds one encryption key record

#### Scenario: User with a linked sign-in provider deletes a key
- **WHEN** a user whose account is linked to a sign-in provider deletes an encryption key
- **THEN** the key is removed and the provider link stays

### Requirement: No external or invitation links on a private room
The server SHALL refuse with 403 to create or update an external link or an invitation link with any access on a private room, active or archived, or on a folder or file inside one, so that a private room is reached through membership only. Revoking a link that exists SHALL stay possible.

#### Scenario: External link requested
- **WHEN** a room manager requests an external link for a private room
- **THEN** the server refuses the request with 403 and the room has no external link

#### Scenario: Invitation link requested
- **WHEN** a room manager requests an invitation link for a private room
- **THEN** the server refuses the request with 403 and no link is created

#### Scenario: Link revoked
- **WHEN** a room manager sets the access of a link that a private room still holds to none
- **THEN** the request is accepted and the link is removed

### Requirement: Room-level copies of a private room are refused
The server SHALL refuse to duplicate a private room, to save it as a room template (403) and to export its index, and SHALL report the copy, duplicate, index-export, AI chat and vectorization rights as unavailable on a private room and on every file and folder inside it, whether the room is active or archived, because each of them carries the room's structure, titles or content outside the room.

#### Scenario: Duplicate requested
- **WHEN** a room manager requests a duplicate of a private room
- **THEN** the server refuses the request and creates no room

#### Scenario: Template requested
- **WHEN** a room manager asks to save a private room as a template
- **THEN** the server refuses the request with 403 and creates no template

#### Scenario: Index export requested
- **WHEN** a caller requests the index export of a private room
- **THEN** the server refuses the request and produces no export

#### Scenario: Rights reported
- **WHEN** the owner reads a private room
- **THEN** its security reports copy, duplicate and index export as false

### Requirement: Plaintext never enters a private room
The server SHALL refuse with 403 an upload session into a private room, or into a folder of one, that is not marked encrypted, before any chunk, and SHALL refuse with 403 on the file write path any file inside a private room that is not marked encrypted, whichever route writes it, so that no new way of creating a file stores a plain one there. An ordinary room SHALL keep accepting plain files under any name.

#### Scenario: Session without the encrypted flag
- **WHEN** an upload session into a private room is opened without the encrypted flag
- **THEN** the server refuses it with 403 and no session exists

#### Scenario: Plain file created in the room
- **WHEN** a file is created in the clear in a private room or in one of its subfolders through the file creation route
- **THEN** the server refuses it with 403 and creates no file

#### Scenario: Ordinary room
- **WHEN** a plain file is created or an unencrypted session is opened in a room that is not private
- **THEN** the server accepts it as before

### Requirement: Private rooms need a Document Server that encrypts
The server SHALL refuse with 403, after the key check, the creation of a private room or a private AI agent, and with 415 the editor configuration of an encrypted file of a private room, while the connected Document Server does not serve the crypto library the browser decrypts with.

#### Scenario: Room created without the library
- **WHEN** a user with encryption keys creates a private room and the Document Server does not serve the crypto library
- **THEN** the server answers 403 and creates no room

#### Scenario: Encrypted file opened without the library
- **WHEN** the editor configuration of an encrypted file of a private room is asked for and the Document Server does not serve the crypto library
- **THEN** the server answers 415

### Requirement: Audit trail names a private room neutrally
The server SHALL show the title of a private room, the titles of its folders and the old title of a renamed one as the neutral label ("Private room") in the audit trail and its report, keeping the users' names, and the history of the room SHALL show its members the real titles. Events written before this rule SHALL keep their titles.

#### Scenario: Audit trail read by an administrator
- **WHEN** an administrator reads the audit trail or its report for events of a private room
- **THEN** the room and its folders appear as "Private room" and the names of the users are shown

#### Scenario: History of the room
- **WHEN** a member reads the history of the private room
- **THEN** the real titles are shown

#### Scenario: Ordinary room
- **WHEN** an administrator reads the audit trail for events of a room without the private setting
- **THEN** its title is shown

### Requirement: Backup excludes private-room keys
The server SHALL NOT include the wrapped file keys of private rooms or the users' encryption key records in a portal backup, and a restore SHALL NOT keep the ids of files and users. A restored portal therefore holds the encrypted files of its private rooms without a key that opens them.

#### Scenario: Portal restored from a backup
- **WHEN** a portal with a private room is restored from a backup
- **THEN** the private room and its encrypted files are present, no member can open them, and no key import restores that access

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

### Requirement: Clearing the access of a private room
The server SHALL refuse with 403 a portal administrator who is not a member clearing the access of a private room or of an entry inside one, while the clearing of an ordinary room by an administrator stays as it was; whoever loses access to a private room through a clearing SHALL lose their wrapped file keys, the room's current owner excepted.

#### Scenario: Access cleared by an administrator outside the room
- **WHEN** a portal administrator who is not a member clears the access of a private room
- **THEN** the server answers 403 and nothing changes

#### Scenario: Members cleared by the owner
- **WHEN** the owner clears the access of a private room
- **THEN** the members lose their keys on every encrypted file of the room and the owner keeps theirs

### Requirement: File keys cannot be written in an archived private room
The server SHALL refuse with 403 a write of file access entries for a file of an archived private room, because the key write needs the right to create content in the parent room and the archive grants none. A member who missed entries before the room was archived gets them only after the room is restored.

#### Scenario: Key write in an archived private room
- **WHEN** a room manager writes access entries for a file of an archived private room
- **THEN** the server answers 403 and stores nothing

#### Scenario: Key write after the restore
- **WHEN** the room is restored from the archive and the same entries are written
- **THEN** the server stores them

### Requirement: The E2E rooms app gates only the private section listing
The server SHALL use the E2E rooms app of the portal only to list the private rooms section: while the app is off, `GET files/@private` answers 404 and the root folders request leaves the Private root out. The rooms list with the private rooms area, the key routes, private room creation and access to existing private rooms SHALL NOT depend on the app.

#### Scenario: App off, section requested
- **WHEN** the E2E rooms app is off and a client requests `GET files/@private`
- **THEN** the server answers 404

#### Scenario: App off, root folders
- **WHEN** the E2E rooms app is off and a client requests the root folders
- **THEN** the response has no Private root

#### Scenario: App off, other private-room routes
- **WHEN** the E2E rooms app is off and a member with keys lists rooms with the private rooms area, writes file keys or creates a private room
- **THEN** the server handles the request as while the app is on

### Requirement: Guests cannot hold encryption keys
The server SHALL refuse with 403 a guest who creates, replaces or deletes an encryption key envelope, and SHALL store nothing.

#### Scenario: Guest creates a key
- **WHEN** a guest posts an encryption key envelope
- **THEN** the server answers 403 and stores nothing

#### Scenario: Guest deletes a key
- **WHEN** a guest deletes an envelope by id
- **THEN** the server answers 403

### Requirement: Oversized key set is refused
The server SHALL refuse with 400, and store nothing, a create or replace request whose resulting key set does not fit the stored sign-in profile once encrypted (65,535 bytes), so a set is never truncated in storage. The boundary applies to the encrypted profile, so a client cannot compute it exactly from the plain set.

#### Scenario: Key set too large
- **WHEN** a user posts an envelope that makes their key set too large to store
- **THEN** the server answers 400 and the keys they already had stay as they were

### Requirement: File rights reported to the owner of a private room
The server SHALL report on a file of an active private room, to the room's owner, the comment, review, custom-filter and edit-history rights as granted, since it grants the owner every right it has not denied for the room; it SHALL deny on such a file the fill-forms, form-filling, AI, conversion, embedding and vectorization rights. In an archived private room it SHALL deny all of these.

#### Scenario: Spreadsheet in an active private room
- **WHEN** the owner of an active private room lists an encrypted spreadsheet in it
- **THEN** the file reports Comment, Review, CustomFilter, EditHistory and SubmitToFormGallery as true, and FillForms, StartFilling, FillingStatus, ResetFilling, StopFilling, OpenForm, AskAi, Convert, Embed and Vectorization as false

#### Scenario: PDF in an active private room
- **WHEN** the owner of an active private room of the custom type lists an encrypted PDF in it
- **THEN** the file reports OpenForm as true and FillForms as false, and SubmitToFormGallery as true only when the encrypted header marks the file as a PDF form

#### Scenario: Image in an active private room
- **WHEN** the owner of an active private room lists an encrypted image in it
- **THEN** the file reports SubmitToFormGallery and OpenForm as false

#### Scenario: File in an archived private room
- **WHEN** the owner of an archived private room lists an encrypted file in it
- **THEN** the file reports Comment, Review, CustomFilter, EditHistory, SubmitToFormGallery and OpenForm as false

### Requirement: Private root
The server SHALL provide a root folder for the private rooms section, of folder type `PrivateRooms` (42), listed by the root folders request and read through `GET files/@private` while the E2E rooms app is on. The root SHALL hold no rooms: a private room stays under the Rooms root with its root folder type, and the section lists rooms by their private setting.

#### Scenario: Root folders list
- **WHEN** the client requests the root folders while the E2E rooms app is on
- **THEN** the response contains the Private root, of folder type `PrivateRooms`

#### Scenario: App turned off
- **WHEN** the E2E rooms app is off
- **THEN** the root folders list has no Private root and `GET files/@private` answers 404

#### Scenario: Private room folder data
- **WHEN** the client reads a private room
- **THEN** its root folder type is the Rooms root type and its parent is the Rooms root

#### Scenario: Section listing
- **WHEN** the rooms list is requested with `searchArea=PrivateRooms`, or `GET files/@private` is read
- **THEN** only the active private rooms the caller is a member of are returned, and an administrator outside a private room does not see it

#### Scenario: Recent with the section's area
- **WHEN** Recent is requested with `searchArea=PrivateRooms`
- **THEN** the server answers 400

### Requirement: Room groups belong to one section
The server SHALL accept `PrivateRooms` as the area of a room group, and SHALL take into a group only rooms of its own section, answering 400 otherwise. A private room linked to a group of the Rooms area SHALL NOT be listed or counted there, and the link SHALL be kept. The server SHALL NOT accept a privacy filter on the room-group endpoints.

#### Scenario: Private room added to a Rooms group
- **WHEN** a private room is added to a group of the Rooms area
- **THEN** the server answers 400

#### Scenario: Group of the private section
- **WHEN** a group is created with the `PrivateRooms` area and private rooms are added to it
- **THEN** the group lists and counts those rooms

#### Scenario: Older link to a Rooms group
- **WHEN** a Rooms-area group still holds a link to a private room
- **THEN** the group's room count and listing leave that room out
