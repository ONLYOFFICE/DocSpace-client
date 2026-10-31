# Spec Delta

## Purpose

Defines the Instructions room (room type 10): a room whose Markdown files are the skills an AI chat follows, who may do what in it, and how it is used by chats and AI projects.

## ADDED Requirements

### Requirement: Room type
An Instructions room SHALL be a room of type 10 (`FolderType.InstructionsRoom` 38), offered in the "AI rooms" section's creation dialog with its own title, description and icon, created by `POST files/rooms` under the AI rooms root (`FolderType.AiHub` 42) and listed and filterable there like any other room type. The Rooms section SHALL NOT offer or list it. It SHALL be creatable by anyone who may create rooms.

#### Scenario: Create
- **WHEN** a room admin creates a room in "AI rooms" and picks "Instructions room"
- **THEN** a room of type 10 appears in "AI rooms" with the Instructions icon

#### Scenario: Filter
- **WHEN** the user filters Rooms by type "Instructions rooms"
- **THEN** only rooms of type 10 are listed

### Requirement: Markdown files only
An Instructions room SHALL hold Markdown (`.md`) files only: no subfolders can be created or moved into it, and a file of any other format SHALL be refused on upload, creation, copy or move, in the UI and by the server. Every file in the room is a skill.

#### Scenario: Upload a non-Markdown file
- **WHEN** a user drops a `.docx` file into an Instructions room
- **THEN** the upload is refused with a message that only Markdown files are allowed

#### Scenario: Create a folder
- **WHEN** a user tries to create a folder inside an Instructions room
- **THEN** the action is not offered and the server refuses it

#### Scenario: Create a file from the room
- **WHEN** a Content creator uses "Create" inside an Instructions room
- **THEN** only a Markdown file can be created

### Requirement: Skills
A skill SHALL be a Markdown file with YAML frontmatter `name` and `description`, followed by the instructions. The skill's name SHALL be the frontmatter `name`, or the file title without `.md` when there is none; the description SHALL be `""` when absent. The chat and the project views SHALL show the same name and description for a file.

#### Scenario: Skill with frontmatter
- **WHEN** the room holds `tone.md` starting with `name: tone` and `description: Write in the brand voice.`
- **THEN** the skill is listed as "tone" with that description

#### Scenario: Skill without frontmatter
- **WHEN** the room holds `glossary.md` with no frontmatter
- **THEN** the skill is listed as "glossary" with an empty description

### Requirement: Roles
The room SHALL offer these roles: Room owner (the creator), Room manager, Content creator, Editor and Viewer. Groups and the invitation link SHALL be able to join as Content creator, Editor or Viewer, not as Room manager. A member joining through an AI project SHALL get Viewer.

#### Scenario: Invite as Editor
- **WHEN** a Room manager invites a user as Editor
- **THEN** the user can open and edit the skills but not add or remove members

#### Scenario: Group as Room manager
- **WHEN** a Room manager tries to add a group as Room manager
- **THEN** the role is not offered for the group

### Requirement: Content rights
Every role SHALL read the skills and use the room in a chat or project. Editing existing skills SHALL be allowed to Owner, Room manager, Content creator and Editor. Creating and uploading files SHALL be allowed to Owner, Room manager and Content creator. Deleting, renaming and moving files SHALL be allowed to Owner and Room manager for any file, and to a Content creator for the files they created.

#### Scenario: Viewer uses the room
- **WHEN** a Viewer connects the room in a chat
- **THEN** its skills reach the chat and the Viewer cannot edit them

#### Scenario: Editor uploads
- **WHEN** an Editor tries to upload a file into the room
- **THEN** the upload is refused

#### Scenario: Content creator deletes another's skill
- **WHEN** a Content creator tries to delete a skill uploaded by someone else
- **THEN** the action is not offered

### Requirement: Room management rights
Renaming the room, changing its logo and settings, inviting, re-roling and removing members SHALL be allowed to Owner and Room manager. Deleting or archiving the room and changing its owner SHALL be allowed to the Owner only.

#### Scenario: Room manager archives
- **WHEN** a Room manager tries to archive the room
- **THEN** the action is not offered

### Requirement: Use in chats and projects
The room SHALL be selectable as a skills source in the chat composer and as an Instructions room of an AI project by anyone who can read it. A project SHALL be able to filter by a linked Instructions room, and a room SHALL be able to show the projects that link it.

#### Scenario: Pick in a project
- **WHEN** a Project manager edits a project and opens the Instructions room selector
- **THEN** only rooms of type 10 that the caller can read are listed

### Requirement: Independent of vectorization
Skills SHALL NOT be vectorized. An Instructions room SHALL stay fully usable — uploads, chat and projects — while vectorization is disabled on the portal; only Knowledge rooms are affected by that switch.

#### Scenario: Vectorization off
- **WHEN** vectorization is disabled and the user connects an Instructions room in the chat
- **THEN** its skills reach the chat as usual

### Requirement: When skill changes reach the chat
Every chat round SHALL take the room's current skills from the server, which caches them and refreshes its cache itself. A skill added, edited, renamed or removed SHALL therefore apply to the next round without reconnecting the room. The client SHALL NOT keep its own copy of the skills for the round.

#### Scenario: Body edited mid-chat
- **WHEN** an Editor changes the text of a connected skill while a Member is chatting with it
- **THEN** the Member's next round follows the new text

#### Scenario: Skill added mid-chat
- **WHEN** a new skill is uploaded while the room is connected to an open chat
- **THEN** the next round already has it

### Requirement: Skills shown in the UI
The client SHALL show the list of a room's skills (names, descriptions) in one place only: the Instructions card of an open project, when the room's row is expanded. That list SHALL be read from the server when the row is expanded, and SHALL NOT be refreshed live while it stays open.

#### Scenario: Expand a room
- **WHEN** a member expands an Instructions room in the project's sources column
- **THEN** the room's current skills are read and listed

#### Scenario: Skill added while expanded
- **WHEN** a skill is uploaded while the room's row is expanded
- **THEN** the list shows it after the row is collapsed and expanded again

### Requirement: Archive and deletion
An Instructions room SHALL never be archived, made a template or moved out of the AI rooms root: the server refuses all three, and the client SHALL offer none of them. Delete SHALL remove the room outright; a deleted room SHALL be unlinked from the projects that linked it, and an open project SHALL stop showing it on its next read.

#### Scenario: No archive
- **WHEN** the owner opens the menu of an Instructions room
- **THEN** it offers no "Move to archive" and no "Save as template"

#### Scenario: Deleted while linked
- **WHEN** the owner deletes an Instructions room linked to a project
- **THEN** the room is gone and the project's next read lists it no more
