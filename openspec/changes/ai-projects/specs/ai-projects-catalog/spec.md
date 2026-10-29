# Spec Delta

## Purpose

Lets portal users find, create and manage AI projects — shared setups of a model, Instructions rooms and Knowledge rooms — from a dedicated section, with every action gated by the caller's rights on the project.

## ADDED Requirements

### Requirement: Section availability
The client SHALL serve the AI Projects section at `/ai-projects` and `/ai-projects/{projectId}` and link it from the article sidebar. When the portal's AI services are turned off, any visit to these routes SHALL redirect the user to their default start page instead of rendering the section or an error page.

#### Scenario: AI services on
- **WHEN** a signed-in user opens `/ai-projects` while AI services are enabled
- **THEN** the AI Projects section renders with its list

#### Scenario: AI services off
- **WHEN** a user opens `/ai-projects` or a project deep link while AI services are disabled
- **THEN** the user is redirected to their default start page

### Requirement: AI not ready state
While AI services are enabled but AI is not ready, the section SHALL show the "AI is not active" view in place of the filter and the list. AI is not ready when no chat profile exists on a standalone portal, or when the AI service is off on SaaS. The view SHALL hide every create entry point and offer admins the same activation actions as the AI chat (go to settings, activate, top up and activate).

#### Scenario: Standalone portal without a chat profile
- **WHEN** an admin opens the section on a standalone portal that has no chat profile
- **THEN** the "AI is not active" view shows with a link to the AI settings, and no "New project" control is visible

#### Scenario: State unknown while profiles load
- **WHEN** the chat profiles have not been loaded yet on a standalone portal
- **THEN** the "AI is not active" view is not shown until the profiles are known

### Requirement: Who may create projects
Only the portal owner, DocSpace admins and room admins SHALL see the controls that create a project. Users and guests SHALL see only the projects they belong to, with no create controls.

#### Scenario: Room admin
- **WHEN** a room admin opens the list
- **THEN** the "New project" button and the create action of the empty state are shown

#### Scenario: Regular user
- **WHEN** a user of type User or Guest opens the list
- **THEN** no create control is shown

### Requirement: Project list views
The list SHALL show each project's logo, name, linked Instructions rooms, linked Knowledge rooms and last activity. It SHALL offer a table and a tiles view on desktop; on tablet and mobile the table gives way to a rows view. The chosen view SHALL be remembered in the browser between visits. The list SHALL load in pages of 100 and fetch the next page as the user scrolls, without duplicates.

#### Scenario: Switching views
- **WHEN** the user switches from table to tiles and reloads the page
- **THEN** the list renders as tiles

#### Scenario: Table on a tablet
- **WHEN** a user with the table view chosen opens the list on a tablet
- **THEN** the list renders as rows

#### Scenario: More than one page
- **WHEN** the server reports more projects than are loaded and the user scrolls to the end of the list
- **THEN** the next page is appended and no project appears twice

#### Scenario: Empty source group
- **WHEN** a project links no Knowledge room
- **THEN** its Knowledge cell or row is left empty rather than showing a placeholder

### Requirement: Search, filter and sort
The list SHALL support a text search and the following filters:
- by owner (the caller or a picked user);
- by one linked Instructions room;
- by one linked Knowledge room.

It SHALL support sorting by name, last activity (the default, descending) or creation date. Applied filters SHALL show as removable chips. A newer query SHALL win over a page that is still loading. The room filter SHALL be sent to the server as `linkedRoomId`, the only room filter the contract defines.

#### Scenario: Filter by a Knowledge room
- **WHEN** the user picks a Knowledge room in the filter
- **THEN** only projects that link that room are listed, and a chip with the room's title is shown

#### Scenario: No results
- **WHEN** the search or filters match no project
- **THEN** the "nothing found" state shows with a "Clear filter" action that resets the search and filters

### Requirement: Empty list
With no projects and no filter applied, the list SHALL show an empty state for the caller's type:
- users who may create projects SHALL get a "Go to Rooms" action (Instructions and Knowledge rooms are made there) and a create action;
- the create action SHALL follow the page's own create check, so it is shown only while AI is ready;
- other users SHALL get a "no projects shared with you" text and a "Go to Rooms" action.

#### Scenario: Admin with no projects
- **WHEN** an admin with no projects opens the section
- **THEN** the empty state offers "Create project" and "Go to Rooms"

#### Scenario: Admin while AI readiness is unknown
- **WHEN** an admin with no projects opens the section on a standalone portal before the chat profiles have loaded
- **THEN** the empty state offers "Go to Rooms" but no "Create project"

#### Scenario: User with no projects
- **WHEN** a User with no projects opens the section
- **THEN** the empty state says no projects were shared with them and offers only "Go to Rooms"

### Requirement: Create and edit a project
The create and edit dialog SHALL collect:
- a required name of up to 170 characters, and a logo (a color, or a built-in cover; no image upload);
- a chat profile (model), where none selected means the portal default;
- any number of Instructions rooms and any number of Knowledge rooms, each chosen in a room selector limited to that room type.

Edit SHALL also show the project owner. Any warnings the server returns SHALL be shown as toasts.

#### Scenario: Create with rooms
- **WHEN** a room admin creates a project named "Sales" with two Instructions rooms and one Knowledge room
- **THEN** the project appears at the top of the list with those rooms, and a success toast is shown

#### Scenario: Missing name
- **WHEN** the user submits the dialog with an empty name
- **THEN** the dialog stays open and marks the name as required

#### Scenario: Server warning
- **WHEN** the server saves the project but returns a warning (for example a Viewer grant on a linked room was skipped)
- **THEN** the project is saved and the warning's server message is shown as a toast

### Requirement: Project actions are gated by security flags
The project context menu (row, tile and open-project header) SHALL show each action only when the project's matching security flag is true: pin (`Pin`), notifications (`Mute`), edit (`EditRoom`), duplicate (`Duplicate`), invite (`EditAccess`), change owner (`ChangeOwner`) and delete (`Delete`).

#### Scenario: Flag off
- **WHEN** a project's `Delete` flag is false for the caller
- **THEN** its context menu has no "Delete project" item

### Requirement: Actions every member gets
Copy link and project info SHALL always be offered. "Leave" SHALL be offered to a caller who is in the project and is not its owner. "Open" SHALL be offered in the list's menus only, not in the open project's header or the Info panel.

#### Scenario: Member menu
- **WHEN** a Member, whose project grants `Pin` and `Mute` but no management flag, opens the project's menu in the list
- **THEN** it offers open, pin, notifications, copy link, project info and leave, and no edit, invite, change owner or delete

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not in a project opens its menu
- **THEN** "Leave" is not offered

#### Scenario: Owner cannot leave
- **WHEN** the project's owner opens its context menu
- **THEN** "Leave" is not offered

### Requirement: Lifecycle operations
Each lifecycle operation SHALL behave as follows:
- Delete and leave SHALL ask for confirmation.
- Delete and duplicate SHALL follow their server file operation until it finishes. A duplicate copies the project without its members.
- Copy link SHALL put `{origin}/ai-projects/{id}` on the clipboard.
- On any failure, the server's error text SHALL be shown as a toast.

#### Scenario: Delete
- **WHEN** the owner confirms "Delete project"
- **THEN** the project disappears from the list once the delete operation finishes

#### Scenario: Leave
- **WHEN** a Member confirms "Leave the project"
- **THEN** the project is removed from their list

#### Scenario: Change owner
- **WHEN** the owner hands the project to an admin or room admin and stays in the project
- **THEN** the project shows the new owner and the former owner's menu no longer offers delete or change owner

#### Scenario: Change owner and leave
- **WHEN** the owner hands the project over and chooses to leave it
- **THEN** the project drops from the former owner's list

### Requirement: Membership through the room panels
Project members SHALL be managed through the existing room panels (Invite, Info panel Contacts, the invitation link, resend invitations). For a project these panels SHALL call the project's `/ai/projects/{id}` endpoints instead of the `files/rooms` ones. The invitable roles SHALL be Project manager and Member. The Info panel of a project SHALL show the Contacts, History and Details tabs.

#### Scenario: Invite a member
- **WHEN** a Project manager invites a user as Member from the Invite panel
- **THEN** the invitation is sent to `/ai/projects/{id}/share` and the user appears in Contacts

### Requirement: Members are invited to the linked rooms
Inviting a user to a project SHALL also invite them to every linked Instructions and Knowledge room, so a member never meets a linked room they cannot open. A member who could not be invited to a linked room SHALL be reported as a warning.

#### Scenario: Linked rooms come with the project
- **WHEN** a Project manager invites a user who is in none of the project's linked rooms
- **THEN** the user gets access to every linked room and can open them from the sources column

#### Scenario: Grant warning on invite
- **WHEN** the server could not grant a new member Viewer on a linked room
- **THEN** the invitation succeeds and the server's warning is shown as a toast

### Requirement: Live updates
While the section is open, the list SHALL follow folder changes made by others: projects created or deleted under the projects root, and edits to projects on the list. Bursts of change events SHALL be coalesced into one reload. A project the caller can no longer see SHALL drop from the list.

#### Scenario: Created elsewhere
- **WHEN** another user creates a project the caller belongs to
- **THEN** the list reloads and shows it without a manual refresh

#### Scenario: Access lost
- **WHEN** the caller is removed from a project on their list
- **THEN** that project disappears from the list
