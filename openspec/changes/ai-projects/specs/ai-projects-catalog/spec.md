# Spec Delta

## Purpose

Gives the AI room types two sections of their own, as the server keeps them under two roots of `GET files/@root`: "AI rooms" (`FolderType.AiHub` 42) for Instructions and Knowledge rooms, and "AI Projects" (`FolderType.AiProjects` 41) for AI projects. Both run the Rooms machinery (views, filters, context menus, bulk actions, Info panel, live updates); "AI rooms" has its own creation picker and its own Recent, Favorites and Trash slots.

## ADDED Requirements

### Requirement: Section roots
The client SHALL keep the two AI roots that `GET files/@root` returns while AI services are enabled in the folder tree, title them "AI rooms" (42) and "AI Projects" (41), count their new items and subscribe to their `DIR-{id}` socket channels like the Rooms root. A root missing from `@root` SHALL hide its section. The `AiAgents` root (34) the server still returns SHALL be ignored.

#### Scenario: Both roots present
- **WHEN** `@root` answers folders with `rootFolderType` 41 and 42
- **THEN** the sidebar shows "AI rooms" and "AI Projects" after Forms

#### Scenario: AI services off
- **WHEN** `@root` answers without the AI roots
- **THEN** neither section is shown and their routes redirect to the default start page

### Requirement: Routes
The sections SHALL use the paths the server links to (`PathProvider`):
- "AI rooms": `/ai-rooms/filter`, a room at `/ai-rooms/{id}/filter?folder={id}`, the slots `/ai-rooms/recent|favorites|trash` (with `/filter`);
- "AI Projects": `/ai-projects(/filter)`, a project at `/ai-projects/{id}/filter?folder={id}`.

The bare `/ai-rooms` SHALL stay the SDK frame page. With AI services off, every section route SHALL redirect to the default start page.

#### Scenario: Server link to a Knowledge room
- **WHEN** a user follows `/ai-rooms/{id}/filter?folder={id}` from a notification for a Knowledge room they belong to
- **THEN** the room's files open under "AI rooms" with that sidebar item active

#### Scenario: The frame page keeps its path
- **WHEN** a user opens `/ai-rooms?section=rooms`
- **THEN** the Rooms app frame opens as before

### Requirement: Sidebar items and slots
The sidebar SHALL show "AI rooms" with the children Recent, Favorites and Trash (after a separator), and "AI Projects" without children. The active item SHALL follow the pathname: `/ai-rooms/recent` lights Recent under "AI rooms", any other `/ai-rooms/` path lights "AI rooms", any `/ai-projects` path lights "AI Projects".

#### Scenario: Slot active
- **WHEN** the user opens `/ai-rooms/trash/filter`
- **THEN** the Trash child under "AI rooms" is highlighted and the Rooms item is not

### Requirement: AI rooms listing
The "AI rooms" list SHALL be the Rooms list run with `searchArea=AiHub` (`GET files/rooms`): paged by 100 with infinite scroll, table, rows and tiles with the room columns (name, type, tags, owner, last activity), the room selection area, and a type filter limited to Instructions room and Knowledge room. Its filter and sort SHALL be remembered per user apart from the Rooms section's.

#### Scenario: Two types in one list
- **WHEN** a room admin with an Instructions room and a Knowledge room opens "AI rooms"
- **THEN** both rooms are listed, sorted by last activity, each with its own icon

#### Scenario: Type filter
- **WHEN** the user filters "AI rooms" by "Knowledge room"
- **THEN** only type-11 rooms are listed and a "Knowledge room" chip is shown

### Requirement: AI Projects listing
The "AI Projects" list SHALL show the projects the caller may see as rooms: the Files list reads `GET ai/projects` (the project listing, which answers the folder content of the projects root in the shape of `files/rooms`) whenever the search area is `AiProjects`, with the same paging, views, columns and room selection area, the Rooms filters without the type filter, and its own remembered filter and sort.

#### Scenario: Projects listed
- **WHEN** a member of two projects opens "AI Projects"
- **THEN** both projects are listed with the AI project icon

### Requirement: Room actions
A room in either section SHALL get the Rooms context menu, bulk header menu and Info panel (Contacts, History, Details), driven by its `security` flags, without the actions the server refuses for the AI types: no archive (the server never archives them), no save as template and no room groups. Delete SHALL remove the room outright, after a confirmation, as a form room is deleted from Forms. An AI project SHALL also offer no duplicate.

#### Scenario: Knowledge room menu
- **WHEN** the owner opens the menu of a Knowledge room in "AI rooms"
- **THEN** it offers open, edit, invite, pin, notifications, copy link, info, duplicate and delete, and no archive or template

#### Scenario: Delete a project
- **WHEN** the owner confirms "Delete" on a project in "AI Projects"
- **THEN** the project disappears from the list once the delete operation finishes

### Requirement: Who may create
Only the portal owner, DocSpace admins and room admins SHALL see the create controls of both sections ("New room" or "New project" button, the "+" plus button, the empty state action). Users and guests SHALL see only the AI rooms and projects they belong to.

#### Scenario: Regular user
- **WHEN** a User opens either section
- **THEN** no create control is shown

### Requirement: Create picker of AI rooms
"New room" in "AI rooms" SHALL open the room creation dialog with a picker of three types: Instructions room, Knowledge room and AI project, each with its title, description and icon. Instructions and Knowledge rooms SHALL be created through `POST files/rooms`, which puts them under the AI rooms root, and open at `/ai-rooms/{id}/filter?folder={id}`. Picking "AI project" SHALL close the dialog and open the project form. The Rooms section's picker SHALL NOT offer the AI types.

#### Scenario: Knowledge room from the section
- **WHEN** a room admin picks "Knowledge room" in the "AI rooms" dialog, names it and saves
- **THEN** a type-11 room is created under the AI rooms root, opens in "AI rooms" and the Info panel shows its Contacts

#### Scenario: Rooms picker
- **WHEN** a room admin opens "New room" in the Rooms section
- **THEN** the picker offers no Instructions, Knowledge or AI project type

### Requirement: Create a project
"New project" in "AI Projects" SHALL open the project form directly: a required name of up to 170 characters, a logo (color and cover, or an uploaded image), tags, a chat profile (model, none meaning the portal default), Instructions rooms and Knowledge rooms from room selectors limited to that type and to `searchArea=AiHub`. Save SHALL call `POST ai/projects`, show server warnings as toasts and open the project at `/ai-projects/{id}/filter?folder={id}`.

#### Scenario: Create with rooms
- **WHEN** a room admin creates a project "Sales" with two Instructions rooms and one Knowledge room
- **THEN** a success toast shows and the project opens with those rooms; Back leads to the list with the project in it

#### Scenario: Missing name
- **WHEN** the user submits the project form with an empty name
- **THEN** the form stays open and marks the name as required

### Requirement: Rooms limit in the project form
The project form SHALL NOT state the limit of 20 rooms per type anywhere, and the room selector SHALL NOT grey out rooms at the limit. Ticking a room past the limit SHALL leave it unticked and show a warning toast naming the limit.

#### Scenario: Rooms past the limit
- **WHEN** 20 Instructions rooms are ticked in the selector and the user ticks one more
- **THEN** the room stays unticked and a warning toast says a project can include up to 20 Instructions rooms

### Requirement: Edit a project
"Edit" on an AI project (list menu, header menu, Info panel, intro) SHALL open the project form filled from `GET ai/projects/{id}`, with the owner shown, and save through `PUT ai/projects/{id}`. "Edit" on an Instructions or Knowledge room SHALL open the ordinary room edit dialog.

#### Scenario: Edit model
- **WHEN** the owner edits a project and picks another model
- **THEN** the project is saved and an open chat of that project switches to the model in place

### Requirement: Opening a room
Opening an Instructions or Knowledge room SHALL show its files under "AI rooms" with the rules of `instructions-room` and `knowledge-room`. Opening an AI project SHALL show the project workspace of `ai-project-workspace` in place of a file list. Back from either SHALL return to its section list.

#### Scenario: Open a project
- **WHEN** the user opens the "Sales" project from the list
- **THEN** the URL becomes `/ai-projects/{id}/filter?folder={id}` and the project's chat fills the section body under the project header

### Requirement: Recent, Favorites and Trash of AI rooms
The slots of "AI rooms" SHALL show the shared special folders scoped by `folderType` 38 and 39, as the Rooms slots do with the room folder types. The Rooms section's slots SHALL stop including types 38 and 39. "AI Projects" SHALL have no slots: a project holds no files.

#### Scenario: AI rooms Recent
- **WHEN** a user who opened a file in a Knowledge room and a file in a Custom room opens AI rooms > Recent
- **THEN** only the Knowledge room file is listed

### Requirement: Empty states
With no rooms and no filter, each section SHALL show an empty state for the caller's type: users who may create get a create action ("New room" in "AI rooms", "Create project" in "AI Projects"), others a "nothing shared with you yet" text. A filter with no results SHALL show "nothing found" with "Clear filter".

#### Scenario: Admin with no AI rooms
- **WHEN** an admin with no AI rooms opens "AI rooms"
- **THEN** the empty state offers "New room"

### Requirement: AI not ready in AI Projects
While AI services are enabled but AI is not ready (no chat profile on standalone, service off on SaaS), "AI Projects" SHALL show the "AI is not active" view with the admin activation actions in place of its empty state and hide its create controls.

#### Scenario: Admin with no projects
- **WHEN** an admin with no projects opens "AI Projects" while AI is ready
- **THEN** the empty state offers "Create project"

#### Scenario: AI not ready
- **WHEN** an admin opens "AI Projects" on a standalone portal that has no chat profile
- **THEN** the "AI is not active" view shows with a link to the AI settings, and no create control is visible

### Requirement: Membership through the room panels
Members of every AI room and project SHALL be managed through the room panels (Invite, Info panel Contacts, invitation link, resend) over the `files/rooms/{id}` routes. For an AI project the invitable roles SHALL be Project manager and Member; inviting to a project SHALL also give the member Viewer on its linked rooms, and a skipped grant SHALL be reported as a warning toast.

#### Scenario: Invite a project member
- **WHEN** a Project manager invites a user as Member from the Invite panel
- **THEN** the invitation goes to `files/rooms/{id}/share` and the user appears in Contacts

### Requirement: Live updates
Both sections SHALL follow the Files socket events as Rooms does: rooms created, edited or deleted under their roots by others appear, change or vanish without a reload, and a room the caller can no longer see drops from the list.

#### Scenario: Created elsewhere
- **WHEN** another user creates an AI project the caller belongs to
- **THEN** it appears in the caller's "AI Projects" list without a manual refresh
