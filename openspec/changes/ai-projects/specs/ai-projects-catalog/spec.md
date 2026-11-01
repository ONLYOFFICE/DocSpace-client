# Spec Delta

## Purpose

Gives the AI room types one section of their own, as the server keeps them under one root of `GET files/@root`: "AI rooms" (`FolderType.AiHub` 41) for Instructions rooms, Knowledge rooms and AI projects. It runs the Rooms machinery (views, filters, context menus, bulk actions, Info panel, live updates) and has its own creation picker and its own Recent, Favorites and Trash slots.

## ADDED Requirements

### Requirement: Section root
The client SHALL keep the AI rooms root that `GET files/@root` returns while AI services are enabled in the folder tree, title it "AI rooms" (41), count its new items and subscribe to its `DIR-{id}` socket channel like the Rooms root. A missing root SHALL hide the section. The `AiAgents` root (34) the server still returns SHALL be ignored.

#### Scenario: Root present
- **WHEN** `@root` answers a folder with `rootFolderType` 41
- **THEN** the sidebar shows "AI rooms" after Forms, and no "AI Projects" item

#### Scenario: AI services off
- **WHEN** `@root` answers without the AI root
- **THEN** the section is not shown and its routes redirect to the default start page

### Requirement: Routes
The section SHALL use the paths the server links to (`PathProvider`): `/ai-rooms/filter`, a room or project at `/ai-rooms/{id}/filter?folder={id}`, and the slots `/ai-rooms/recent|favorites|trash` (with `/filter`). There SHALL be no `/ai-projects` route. The bare `/ai-rooms` SHALL stay the SDK frame page. With AI services off, every section route SHALL redirect to the default start page.

#### Scenario: Server link to a Knowledge room
- **WHEN** a user follows `/ai-rooms/{id}/filter?folder={id}` from a notification for a Knowledge room they belong to
- **THEN** the room's files open under "AI rooms" with that sidebar item active

#### Scenario: The frame page keeps its path
- **WHEN** a user opens `/ai-rooms?section=rooms`
- **THEN** the Rooms app frame opens as before

### Requirement: Sidebar item and slots
The sidebar SHALL show "AI rooms" with the children Recent, Favorites and Trash (after a separator). The active item SHALL follow the pathname: `/ai-rooms/recent` lights Recent under "AI rooms", any other `/ai-rooms/` path (an open project included) lights "AI rooms".

#### Scenario: Slot active
- **WHEN** the user opens `/ai-rooms/trash/filter`
- **THEN** the Trash child under "AI rooms" is highlighted and the Rooms item is not

### Requirement: AI rooms listing
The "AI rooms" list SHALL be the Rooms list run with `searchArea=AiHub` (`GET files/rooms`): paged by 100 with infinite scroll, table, rows and tiles with the room columns (name, type, tags, owner, last activity), the room selection area, and a type filter limited to Instructions room, Knowledge room and AI project. Its filter and sort SHALL be remembered per user apart from the Rooms section's.

#### Scenario: Three types in one list
- **WHEN** a room admin with an Instructions room, a Knowledge room and an AI project opens "AI rooms"
- **THEN** all three are listed, sorted by last activity, each with its own icon

#### Scenario: Type filter
- **WHEN** the user filters "AI rooms" by "AI project"
- **THEN** only type-12 rooms are listed and an "AI project" chip is shown

### Requirement: Room actions
A room or project in "AI rooms" SHALL get the Rooms context menu, bulk header menu and Info panel (Contacts, History, Details), driven by its `security` flags, without the actions the server refuses for the AI types: no archive (the server never archives them), no save as template and no room groups. Delete SHALL remove the room outright, after a confirmation, as a form room is deleted from Forms. An AI project SHALL also offer no duplicate.

#### Scenario: Knowledge room menu
- **WHEN** the owner opens the menu of a Knowledge room in "AI rooms"
- **THEN** it offers open, edit, invite, pin, notifications, copy link, info, duplicate and delete, and no archive or template

#### Scenario: Delete a project
- **WHEN** the owner confirms "Delete" on a project in "AI rooms"
- **THEN** the project disappears from the list once the delete operation finishes

### Requirement: Who may create
Only the portal owner, DocSpace admins and room admins SHALL see the create controls of the section ("New room" button, the "+" plus button, the empty state action). Users and guests SHALL see only the AI rooms and projects they belong to.

#### Scenario: Regular user
- **WHEN** a User opens "AI rooms"
- **THEN** no create control is shown

### Requirement: Create picker of AI rooms
"New room" in "AI rooms" SHALL open the room creation dialog with a picker of three types: Instructions room, Knowledge room and AI project, each with its title, description and icon. Picking "AI project" SHALL close the dialog and open the project form; there SHALL be no separate "New project" control. The Rooms section's picker SHALL NOT offer the AI types.

#### Scenario: Knowledge room from the section
- **WHEN** a room admin picks "Knowledge room" in the "AI rooms" dialog, names it and saves
- **THEN** a type-11 room is created under the AI rooms root, opens in "AI rooms" and the Info panel shows its Contacts

#### Scenario: Rooms picker
- **WHEN** a room admin opens "New room" in the Rooms section
- **THEN** the picker offers no Instructions, Knowledge or AI project type

### Requirement: AI not set up
While AI is not set up on the portal, by the AI chat's own rule (a chat profile on standalone, the AI service on SaaS; unknown until the profiles load), the "AI rooms" list SHALL be replaced by an "AI is off" view with the chat's actions, whether rooms exist or not: "Go to settings" for an admin on standalone, "Activate" or "Top up and activate" for an admin on SaaS, "contact an admin" for others. Nothing SHALL be created there: no "New room", "+" or main button.

#### Scenario: SaaS without AI
- **WHEN** an admin opens "AI rooms" on a SaaS portal where the AI service is not activated
- **THEN** the section shows "AI isn’t active yet" with "Activate" (or "Top up and activate"), no mention of AI agents, and no create control

#### Scenario: Standalone without a chat profile
- **WHEN** a room admin opens "AI rooms" on a standalone portal with no chat profile
- **THEN** the section shows the "AI is off" view telling them to contact an admin, and no create control

### Requirement: Texts of the AI-off view
The "AI is off" view of "AI rooms" SHALL speak of AI projects, Instructions rooms and Knowledge rooms, and never of AI agents.

#### Scenario: Room admin on SaaS without AI
- **WHEN** a room admin opens "AI rooms" on a SaaS portal where AI is not activated
- **THEN** the view says AI isn't available yet and that AI projects, Instructions rooms and Knowledge rooms appear once the Full admin sets up AI

### Requirement: Instructions and Knowledge rooms from the picker
Instructions and Knowledge rooms picked in the "AI rooms" dialog SHALL be created through `POST files/rooms`, which puts them under the AI rooms root, and SHALL open at `/ai-rooms/{id}/filter?folder={id}`.

#### Scenario: Instructions room opens
- **WHEN** a room admin creates an Instructions room from the picker
- **THEN** the room opens at `/ai-rooms/{id}/filter?folder={id}`

### Requirement: Create a project
"AI project" in the create picker SHALL open the project form: a required name of up to 170 characters, a logo (color and cover, or an uploaded image), tags, a chat model (none meaning the portal default), Instructions and Knowledge rooms from selectors limited to that type and `searchArea=AiHub`. Save SHALL create the room through `POST files/rooms` (`roomType: 12`), link the rooms, write the model, show warnings as toasts and open `/ai-rooms/{id}/filter?folder={id}`.

#### Scenario: Create with rooms
- **WHEN** a room admin creates a project "Sales" with two Instructions rooms and one Knowledge room
- **THEN** a success toast shows and the project opens with those rooms; Back leads to the AI rooms list with the project in it

#### Scenario: Missing name
- **WHEN** the user submits the project form with an empty name
- **THEN** the form stays open and marks the name as required

### Requirement: Rooms limit in the project form
The project form SHALL NOT state the limit of 20 rooms per type anywhere, and the room selector SHALL NOT grey out rooms at the limit. Ticking a room past the limit SHALL leave it unticked and show a warning toast naming the limit.

#### Scenario: Rooms past the limit
- **WHEN** 20 Instructions rooms are ticked in the selector and the user ticks one more
- **THEN** the room stays unticked and a warning toast says a project can include up to 20 Instructions rooms

### Requirement: Edit a project
"Edit" on an AI project (list menu, header menu, Info panel, intro) SHALL open the project form filled from the project's room and sources, with the owner shown, and save through `PUT files/rooms/{id}`, the sources diff and the model write. "Edit" on an Instructions or Knowledge room SHALL open the ordinary room edit dialog.

#### Scenario: Edit model
- **WHEN** the owner edits a project and picks another model
- **THEN** the project is saved and an open chat of that project switches to the model in place

### Requirement: Opening a room
Opening an Instructions or Knowledge room SHALL show its files under "AI rooms" with the rules of `instructions-room` and `knowledge-room`. Opening an AI project SHALL show the project workspace of `ai-project-workspace` in place of a file list. Back from either SHALL return to the AI rooms list.

#### Scenario: Open a project
- **WHEN** the user opens the "Sales" project from the list
- **THEN** the URL becomes `/ai-rooms/{id}/filter?folder={id}` and the project's chat fills the section body under the project header

### Requirement: Recent, Favorites and Trash of AI rooms
The slots of "AI rooms" SHALL show the shared special folders scoped by `folderType` 38, 39 and 40, as the Rooms slots do with the room folder types. The Rooms section's slots SHALL stop including those types.

#### Scenario: AI rooms Recent
- **WHEN** a user who opened a file in a Knowledge room and a file in a Custom room opens AI rooms > Recent
- **THEN** only the Knowledge room file is listed

### Requirement: Empty state
With no AI rooms or projects and no filter, the section SHALL show one empty state for the caller's type: "No AI rooms yet" with a "New room" action (opening the three-type picker) for users who may create, "No AI rooms shared with you yet" for others. A filter with no results SHALL show "nothing found" with "Clear filter". There SHALL be no separate projects empty state.

#### Scenario: Admin with no AI rooms
- **WHEN** an admin with no AI rooms opens "AI rooms"
- **THEN** the empty state says "No AI rooms yet" and offers "New room"

#### Scenario: User with nothing shared
- **WHEN** a User who belongs to no AI room or project opens "AI rooms"
- **THEN** the empty state says "No AI rooms shared with you yet" and offers no action

### Requirement: Membership through the room panels
Members of every AI room and project SHALL be managed through the room panels (Invite, Info panel Contacts, invitation link, resend) over the `files/rooms/{id}` routes. For an AI project the invitable roles SHALL be Project manager and Member; a member reads the linked rooms through the project (see `ai-projects-api`), so no share is added to those rooms.

#### Scenario: Invite a project member
- **WHEN** a Project manager invites a user as Member from the Invite panel
- **THEN** the invitation goes to `files/rooms/{id}/share` and the user appears in Contacts

### Requirement: Live updates
The section SHALL follow the Files socket events as Rooms does: rooms and projects created, edited or deleted under its root by others appear, change or vanish without a reload, and a room the caller can no longer see drops from the list.

#### Scenario: Created elsewhere
- **WHEN** another user creates an AI project the caller belongs to
- **THEN** it appears in the caller's "AI rooms" list without a manual refresh

### Requirement: Lost project returns to the list
When the open project is deleted or the caller loses access to it, the view SHALL go back to the AI rooms list (`/ai-rooms/filter`).

#### Scenario: Project deleted while open
- **WHEN** the owner deletes a project another member has open
- **THEN** that member lands on the AI rooms list
