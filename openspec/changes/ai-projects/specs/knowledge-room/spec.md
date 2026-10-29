# Spec Delta

## Purpose

Defines the Knowledge room (room type 11): a room whose whole content is vectorized and searched by the AI chat as a knowledge base, who may do what in it, how indexing is shown, and what happens when vectorization is turned off on the portal.

## ADDED Requirements

### Requirement: Room type
A Knowledge room SHALL be a room of type 11 (`FolderType.KnowledgeRoom` 39), offered in the room creation dialog with its own title, description and icon, listed and filterable in Rooms like any other room type.

#### Scenario: Create
- **WHEN** a room admin creates a room and picks "Knowledge room"
- **THEN** a room of type 11 appears in Rooms with the Knowledge icon

### Requirement: Flat room of sources
A Knowledge room SHALL hold files only: no subfolders can be created or moved into it. Every file SHALL be queued for vectorization when it is added, and only files whose vectorization completed SHALL be searchable. Files of unsupported formats or above the vectorization size limit SHALL be refused at upload with a message. Search results SHALL be scoped to the room the chunks came from.

#### Scenario: Upload a document
- **WHEN** a Content creator uploads a document into the room
- **THEN** the document is queued for vectorization and becomes searchable once completed

#### Scenario: Create a folder
- **WHEN** a user tries to create a folder inside a Knowledge room
- **THEN** the action is not offered and the server refuses it

#### Scenario: Unsupported format
- **WHEN** a user uploads a file whose format cannot be extracted
- **THEN** the upload is refused with a message naming the reason

### Requirement: Indexing state
Each file SHALL show its vectorization state (in progress, completed, failed). A failed file SHALL offer "Vectorization" (retry) to users with the right, as a file action and in the group menu. The room's counts of indexed and total files SHALL be shown wherever the room is listed as a project source.

#### Scenario: Retry
- **WHEN** a Content creator chooses "Vectorization" on a failed file
- **THEN** the file is queued again and its state turns to in progress

### Requirement: Files are read-only
Files in a Knowledge room SHALL NOT be editable by anyone, whatever their role: a file can only be read (opened for viewing, downloaded) or replaced by uploading a new one. Editing actions SHALL NOT be offered and the server SHALL refuse them.

#### Scenario: Owner opens a document
- **WHEN** the room owner opens a document from the room
- **THEN** it opens in view mode with no edit action

### Requirement: Roles
The room SHALL offer these roles: Room owner (the creator), Room manager, Content creator and Viewer. There SHALL be no Editor role, because nothing in the room can be edited: a member either reads or uploads. Groups and the invitation link SHALL be able to join as Content creator or Viewer. A member joining through an AI project SHALL get Viewer.

#### Scenario: Role list
- **WHEN** a Room manager opens the role picker in the Invite panel
- **THEN** it offers Room manager, Content creator and Viewer only

### Requirement: Content rights
Every role SHALL read and download the files and use the room in a chat or project. Uploading files, deleting own files and retrying vectorization SHALL be allowed to Owner, Room manager and Content creator. Deleting any file SHALL be allowed to Owner and Room manager. No role SHALL edit a file.

#### Scenario: Viewer uploads
- **WHEN** a Viewer tries to upload a file
- **THEN** the upload is refused

#### Scenario: Content creator deletes another's file
- **WHEN** a Content creator tries to delete a file uploaded by someone else
- **THEN** the action is not offered

### Requirement: Room management rights
Renaming the room, changing its logo and settings, inviting, re-roling and removing members SHALL be allowed to Owner and Room manager. Deleting or archiving the room and changing its owner SHALL be allowed to the Owner only.

#### Scenario: Room manager archives
- **WHEN** a Room manager tries to archive the room
- **THEN** the action is not offered

### Requirement: Use in chats and projects
The room SHALL be selectable as a knowledge base in the chat composer and as a Knowledge room of an AI project by anyone who can read it. A project SHALL be able to filter by a linked Knowledge room.

#### Scenario: Pick in the composer
- **WHEN** the user opens the knowledge base picker in the composer
- **THEN** only rooms of type 11 that the caller can read are listed

### Requirement: Vectorization off inside the room
While vectorization is disabled on the portal (no embedding provider configured, or the service off), the room SHALL show a banner that vectorization is not working, with a link to the AI settings for admins and a "contact your admin" text for others. Uploading, creating, copying or moving files into the room SHALL be blocked in the UI and refused by the server.

#### Scenario: Banner for an admin
- **WHEN** an admin opens a Knowledge room while vectorization is disabled
- **THEN** a banner says vectorization is not working and links to the AI settings

#### Scenario: Upload blocked
- **WHEN** a Content creator tries to upload into a Knowledge room while vectorization is disabled
- **THEN** the upload control is unavailable and the server refuses the upload

### Requirement: Vectorization off and selection
While vectorization is disabled, the composer SHALL NOT show its knowledge base picker, the project dialog SHALL show Knowledge rooms disabled with a hint that vectorization is off, and the server SHALL refuse to link one. Rooms already linked SHALL stay linked but SHALL NOT be searched.

#### Scenario: Composer picker hidden
- **WHEN** the user opens the composer's source actions while vectorization is disabled
- **THEN** there is no knowledge base picker

#### Scenario: Project dialog
- **WHEN** a Project manager opens the Knowledge room selector while vectorization is disabled
- **THEN** the rooms are shown disabled with a hint that vectorization is off

#### Scenario: Linked room while off
- **WHEN** a project links a Knowledge room and vectorization is then turned off
- **THEN** the room stays linked and the project's chat runs without knowledge search

### Requirement: Archive and deletion
An archived Knowledge room SHALL stay searchable by chats and projects that link it, read-only. A room in Trash SHALL be reported as unavailable in the projects that linked it; a permanently deleted room SHALL be unlinked from them.

#### Scenario: Archived room
- **WHEN** a linked Knowledge room is archived
- **THEN** it is still searched by the project's chat and shows as archived in the project
