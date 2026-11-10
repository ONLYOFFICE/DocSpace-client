## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Encrypted flag on file update
The server SHALL accept an encrypted flag on the file-content update request, require edit rights, and store the uploaded bytes as a new version carrying that flag. An update without the flag of an encrypted file, or of a file in a private room, SHALL be refused with 403 and store nothing, so encrypted content never becomes an open file.

#### Scenario: Encrypted update
- **WHEN** a client updates a file's content with the encrypted flag set
- **THEN** the new version is stored and marked encrypted

#### Scenario: Update without the flag
- **WHEN** a client updates the content of an encrypted file, or of a file in a private room, without the encrypted flag
- **THEN** the server answers 403 and no version is stored

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

### Requirement: No recovery or offboarding endpoints
The server SHALL NOT expose endpoints for administrative key recovery or for SCIM-driven offboarding from private rooms. The history of key writes for one file is available through the file history.

#### Scenario: Recovery requested
- **WHEN** a client calls an administrative recovery endpoint
- **THEN** the server answers 404 because no such route exists

## RENAMED Requirements

- FROM: `### Requirement: No recovery, offboarding or file-key audit endpoints`
- TO: `### Requirement: No recovery or offboarding endpoints`
