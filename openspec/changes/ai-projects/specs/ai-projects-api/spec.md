# Spec Delta

## Purpose

Defines the server contract the client consumes for AI projects: what an AI project is on the server, who may do what, how requests are validated and which answers and errors the client can rely on. Since .NET 96a4fdefca (2026-10-31) it is served by ASC.Files on the shared room routes: a project is created, read, changed, deleted and listed through `files/rooms` like the Instructions and Knowledge rooms, its linked rooms ("sources") and skills through the public `AiHubController` routes (`files/rooms/{id}/sources`, `files/rooms/{id}/skills`, `files/rooms/skills`), called with the user's credentials. Of the old `ai/projects` contract only the model remains, proxied by ASC.AI.Chat (Node) to the .NET scoped assignments until it moves into Files; Node also binds a chat round to a project, and the client composes the project view over the Files routes.

Everything a project shares with a room (pin, mute, leave, owner change, logo, members, invitation links, resend, history, tags) goes through the room routes (`files/rooms/{id}/...`, `files/owner`, `settings/notification/rooms`), which accept a room of type 12 with the project rules below applied.

## ADDED Requirements

### Requirement: Project entity
An AI project SHALL be a room of type 12 (`FolderType.AiProjectRoom` 40) under the AI rooms root (`FolderType.AiHub` 41), beside the Instructions and Knowledge rooms. It SHALL hold no files. The server SHALL store its linked rooms as one set of room ids per project (`files_ai_project_room`), each an active Instructions room (type 10) or Knowledge room (type 11), told apart by the room's type. Linked rooms are references by id, never nested rooms.

#### Scenario: Upload into a project
- **WHEN** a client tries to create a file or folder inside a project
- **THEN** the request is refused: a project holds no content

### Requirement: Project room routes
A project SHALL be created with `POST files/rooms` and `roomType: 12`, read, changed and deleted with `GET/PUT/DELETE files/rooms/{id}`, and listed with `GET files/rooms?searchArea=AiHub` (with `type=12` for projects only). There SHALL be no project-specific create, read or list route.

#### Scenario: Project answered as a room
- **WHEN** the client reads `GET files/rooms/{id}` of a project
- **THEN** the answer is a `FolderDto` with `roomType: 12`, `security` flags, `access` and `inRoom`, and no linked rooms

### Requirement: Settings that do not apply
`POST files/rooms` and `PUT files/rooms/{id}` for an AI room type SHALL refuse with 400 the room settings that do not apply to it: privacy, indexing, lifetime, `denyDownload`, watermark, `chatSettings` and the form settings, and for a project also quota. A project's quota SHALL be refused before the room quota feature is checked.

#### Scenario: Quota on a project
- **WHEN** a create with `roomType: 12` carries a quota
- **THEN** the answer is 400 and no project is created

### Requirement: Project settings composed by the client
The client SHALL compose a project's `aiProject` block from `GET files/rooms/{id}` and `GET files/rooms/{id}/sources` and `GET ai/projects/{id}/model`: `profile` (`null` = the portal default, also when the model read fails), `instructionsRooms` and `knowledgeRooms` (id, title, logo, `available: true`, `archived: false`), `canEditSettings` (`security.EditRoom`) and `warnings` when the last save skipped something.

#### Scenario: Project read
- **WHEN** the client opens a project
- **THEN** it reads the room and its sources and the chat opens on the rooms the sources list

### Requirement: Project tags
A project SHALL carry tags as a room does: `tags` (names) in its DTO, bound and unbound through `files/rooms/{id}/tags`, and listed in the portal's `files/tags`.

#### Scenario: Tag bound in the list
- **WHEN** a Project manager binds the tag "sales" to a project through `files/rooms/{id}/tags`
- **THEN** the project is listed with `tags: ["sales"]` and "sales" is in `files/tags`

### Requirement: Roles
A project SHALL have three roles: project owner (`access` 1, the room's `createdBy`), Project manager (`access` 9, portal owner, DocSpace admin or room admin only, never a group) and Member (`access` 2, the room's Read; any user type including guests, directly or through a group). A project SHALL NOT be duplicated.

#### Scenario: Guest as Member
- **WHEN** a Project manager invites a guest as Member
- **THEN** the guest is accepted with `access` 2

#### Scenario: Guest as Project manager
- **WHEN** a Project manager tries to give a User or a group the Project manager role
- **THEN** the request is refused with 403

### Requirement: Visibility guard
Every project route SHALL answer 404 when the id names no AI project where a project is required (`sources`, project `skills`), and 403 when the project exists but the caller cannot read it. A 403 for the action itself (edit, delete) follows the read check. The portal owner and DocSpace admins SHALL see every project without being members.

#### Scenario: Outsider reads a project
- **WHEN** a room admin who is not in the project reads its sources
- **THEN** the answer is 403

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not in the project reads it
- **THEN** the answer is 200 with `inRoom: false` and `access` 0

#### Scenario: Sources of an ordinary room
- **WHEN** `GET files/rooms/{id}/sources` names a room that is not a project
- **THEN** the answer is 404

### Requirement: Read rights
Reading a project (room, sources, skills, history, members) and pinning it SHALL be allowed to the owner, Project managers, Members and admins outside the project.

#### Scenario: Member reads members
- **WHEN** a Member reads `GET files/rooms/{id}/share` of a project
- **THEN** the answer is 200 with the member list

### Requirement: Management rights
Update, linking and unlinking rooms, logo delete, member changes, resend and the invitation link SHALL be allowed to the owner and Project managers. Members and an admin outside the project SHALL get 403. Mute SHALL require membership (owner, Project manager or Member).

#### Scenario: Member edits
- **WHEN** a Member sends `PUT files/rooms/{id}` of a project with a new title
- **THEN** the answer is 403

#### Scenario: Admin outside mutes
- **WHEN** a DocSpace admin who is not a member mutes the project
- **THEN** the answer is 403

### Requirement: Owner-level rights
Delete and change owner SHALL be allowed to the owner and to admins outside the project only; Project managers and Members SHALL get 403. Leave SHALL be allowed to Project managers and Members; the owner and an admin outside the project SHALL get 400. Chat SHALL be allowed to members only.

#### Scenario: Manager deletes
- **WHEN** a Project manager sends `DELETE files/rooms/{id}` of a project
- **THEN** the answer is 403

#### Scenario: Admin deletes
- **WHEN** a DocSpace admin who is not a member deletes the project
- **THEN** the answer is 200 with the delete operation

### Requirement: Who may create
Only the portal owner, DocSpace admins and room admins SHALL create projects. The creator becomes the owner. The role check SHALL run before any room id is examined.

#### Scenario: User creates
- **WHEN** a User sends `POST files/rooms` with `roomType: 12`
- **THEN** the answer is 403 and no project is created

### Requirement: Body validation
The server SHALL validate a create or update body before writing anything; the first failure answers 400 with a localised message. The title SHALL be 1–170 characters after trimming, the colour six hex digits, the cover a known id. `tags` (names) SHALL be taken as a room's create and edit take them. An uploaded logo goes in the body as `logo` and is removed through `DELETE files/rooms/{id}/logo`.

#### Scenario: Long title
- **WHEN** a create sends a 171-character title
- **THEN** the answer is 400 with the title-length message

### Requirement: Sources read
`GET files/rooms/{id}/sources` SHALL answer the project's linked rooms as `instructionsRooms` and `knowledgeRooms`, each `{ id, title, logo }` sorted by title, to anyone who may read the project.

#### Scenario: Sources of a project
- **WHEN** a Member reads the sources of a project with one Instructions and one Knowledge room
- **THEN** each list holds its room with id, title and logo

### Requirement: Sources link
`POST files/rooms/{id}/sources { roomIds }` SHALL link the listed rooms not linked yet; rooms already linked SHALL be skipped. The caller SHALL be able to manage the project and each listed room. Each write SHALL be one history entry naming the rooms and SHALL push a folder update.

#### Scenario: Member links a room
- **WHEN** a Member sends `POST files/rooms/{id}/sources`
- **THEN** the answer is 403

#### Scenario: Already linked
- **WHEN** `roomIds` names a room already linked, twice
- **THEN** the request succeeds and the room is linked once

#### Scenario: Room the caller only reads
- **WHEN** a Project manager links a Knowledge room in which they are a Viewer
- **THEN** the request is refused and nothing is linked

### Requirement: Sources link validation
`roomIds` SHALL hold 1 to 40 ids. Every room being linked SHALL be an active Instructions or Knowledge room of the AI rooms root; any other id SHALL refuse the whole request with 400, linking nothing. A project SHALL link at most 20 rooms of each kind; a request over the limit SHALL answer 400 and keep the existing links.

#### Scenario: Room of another type
- **WHEN** `roomIds` names an Instructions room and an ordinary room
- **THEN** the answer is 400 and neither is linked

#### Scenario: Over the limit
- **WHEN** a project links 20 Instructions rooms and one more is sent
- **THEN** the answer is 400 and the 20 stay linked

### Requirement: Sources unlink
`DELETE files/rooms/{id}/sources { roomIds }` (1 to 40 ids) SHALL unlink the listed rooms that are linked. Only the caller's rights on the project SHALL be checked, not on the rooms.

#### Scenario: Unlink a room the caller cannot manage
- **WHEN** a Project manager unlinks a Knowledge room in which they have no role
- **THEN** the room is unlinked

### Requirement: Project save in the client
On create the client SHALL post the room, then link both lists through `POST .../sources`. On update it SHALL put the room (or only read it when just the sources change) and bring the lists about exactly: rooms left out unlinked through `DELETE .../sources`, new rooms linked through `POST .../sources`; a list not sent keeps its rooms.

#### Scenario: Unlink all Knowledge rooms
- **WHEN** a Project manager clears the Knowledge rooms in the project form and saves
- **THEN** the client unlinks them, the project links no Knowledge room and its Instructions rooms are unchanged

### Requirement: Refused link on save
A link or unlink the server refuses SHALL NOT fail the save: the project stays saved, and the client reports a `roomUnavailable` warning with the server's message as a toast.

#### Scenario: Refused room on create
- **WHEN** a create names a room the server refuses to link
- **THEN** the project is created without that room and a toast shows the server's message

### Requirement: Project model storage
A project's model SHALL be stored in the .NET assignments storage scoped by entity (`internal/ai/assignments`, actionType `Chat`, `entityId` = project id). No stored model SHALL mean the project runs on the portal's Chat assignment. ASC.AI.Chat SHALL proxy it as `GET/PUT /api/2.0/ai/projects/{id}/model` until Files serves it, when the proxy goes away.

#### Scenario: No stored model
- **WHEN** the client reads `GET ai/projects/{id}/model` of a project that never stored one
- **THEN** the answer is `{ profile: null }` and the project chats on the portal's default Chat model

### Requirement: Model read
`GET ai/projects/{id}/model` SHALL first read the project with the caller's credentials (`files/rooms/{id}`, `roomType` 12, its 403 or 404 relayed) and answer `{ profile: { id, name, provider, available } | null }`.

#### Scenario: Not a project
- **WHEN** the id names an ordinary room
- **THEN** the answer is 404

### Requirement: Model write
`PUT ai/projects/{id}/model { profileId }` SHALL require `security.EditRoom` on the project; `profileId` SHALL be `null` or the UUID of an existing chat-capable profile, else 400. It SHALL upsert `PUT internal/ai/assignments { assignments: { Chat }, entityId }` and answer the model read's shape.

#### Scenario: Profile without chat
- **WHEN** a Project manager puts an embedding-only profile
- **THEN** the answer is 400 and the stored model is unchanged

#### Scenario: Member writes
- **WHEN** a Member puts a model
- **THEN** the answer is 403

### Requirement: Model in the client save
The client SHALL read the model with the project and, after saving the room and sources, write it when the form sends one; a new project left on the default SHALL write nothing. A refused write SHALL NOT fail the save and SHALL come back as a `modelNotSaved` warning toast with the server's message.

#### Scenario: Model refused on save
- **WHEN** a Project manager saves a project with a model the server refuses
- **THEN** the project and its rooms are saved and a toast shows the server's message

### Requirement: Partial update semantics
On `PUT files/rooms/{id}` of a project, an absent field SHALL keep its value; a present `tags` replaces the set. Settings that do not apply to a project SHALL be refused with 400.

#### Scenario: Rename only
- **WHEN** an update sends only a new title
- **THEN** the title changes and the linked rooms are unchanged

### Requirement: Member access to linked rooms
A project member SHALL read every linked room through a virtual share record (`SubjectType.AiProject`) that the server builds when it reads the shares of AI rooms entries; it SHALL never be stored. Unlinking a room or removing the member SHALL take the access away. A member's own share on a linked room SHALL be kept as it is.

#### Scenario: Member reads a linked room
- **WHEN** a Member of a project opens a Knowledge room linked to it in which they have no role
- **THEN** they can read the room's files

#### Scenario: Unlinked
- **WHEN** the room is unlinked from the project
- **THEN** the Member can no longer read it

### Requirement: Linked rooms not listed for members
A linked room readable only through a project SHALL NOT be listed in the member's AI rooms section, and no share SHALL be added to the room's members list.

#### Scenario: AI rooms list of a Member
- **WHEN** a Member who belongs to no Knowledge room opens the AI rooms section
- **THEN** the project is listed and its linked Knowledge room is not

### Requirement: Membership routes
Members SHALL be managed through `GET/PUT files/rooms/{id}/share`, `POST .../resend` and `GET/PUT .../links`; leaving sets the caller's own `access` to 0. `access` SHALL be 0, 2 or 9; the owner SHALL NOT appear in a share change. A project SHALL have at most one invitation link, joining as Member. The owner and a group-only member SHALL NOT leave.

#### Scenario: Owner leaves
- **WHEN** the owner sets their own `access` to 0 through `PUT files/rooms/{id}/share` of a project
- **THEN** the answer is 400 "The project owner cannot leave the project. Change the owner first."

#### Scenario: Second link
- **WHEN** a Project manager creates an invitation link while one exists
- **THEN** the answer is 403

### Requirement: Change owner
`PUT files/owner` with the project id SHALL hand the project to an active portal owner, DocSpace admin or room admin, who need not be a member yet. The former owner stays as Project manager, as a room keeps its former owner as a room manager; the client leaves the project in a separate share change when the user asked not to stay. Handing to the current owner SHALL be refused with 400.

#### Scenario: Hand over and stay
- **WHEN** the owner hands the project to a room admin and stays
- **THEN** the room admin is the owner and the former owner is listed with `access` 9

### Requirement: Delete
Delete (`DELETE files/rooms/{id}`, sent with `deleteAfter: false`) SHALL be permanent (no archive), answered as a file operation to poll, and SHALL remove the project's links and the members' threads while leaving the linked rooms untouched.

#### Scenario: Delete keeps rooms
- **WHEN** the owner deletes a project with linked rooms
- **THEN** the linked rooms remain and the members' access through the project ends

### Requirement: Pin and mute
Pin and unpin (`PUT files/rooms/{id}/pin` and `.../unpin`) SHALL be personal to the caller, with the AI rooms (projects included) pinned on an allowance of their own, counted apart from rooms and AI agents. Mute (`POST settings/notification/rooms`) SHALL be personal and SHALL require membership.

#### Scenario: Pin past the allowance
- **WHEN** a user who has pinned as many AI rooms as allowed pins another project
- **THEN** the answer is 403 and their pinned rooms of the Rooms section do not count

### Requirement: AI rooms root in @root
`GET files/@root` SHALL include the AI rooms root (`FolderType.AiHub` 41, title "AI rooms") while AI services are enabled for the portal, with its `new` count, as it includes the Rooms, Forms and Archive roots. Its `DIR-{id}` socket channel SHALL carry the folder events of the rooms and projects created, changed or deleted under it. There SHALL be no separate AI Projects root.

#### Scenario: AI enabled
- **WHEN** a member calls `@root` on a portal with AI services enabled
- **THEN** one section has `rootFolderType` 41 and none is an AI Projects root

#### Scenario: AI disabled
- **WHEN** a member calls `@root` on a portal with AI services disabled
- **THEN** no section has `rootFolderType` 41

### Requirement: AI rooms root
`POST files/rooms` with `roomType` 10, 11 or 12 SHALL create the room under the AI rooms root, and `GET files/rooms?searchArea=AiHub` SHALL list that root's rooms with the filters, sorts and paging of the Active listing; such rooms SHALL NOT appear in `searchArea=Active` and SHALL NOT count toward the room-count limit. Server links to them SHALL be `ai-rooms/{id}/filter?folder={id}`.

#### Scenario: Knowledge room created
- **WHEN** a room admin posts `files/rooms` with `roomType: 11`
- **THEN** the room's `parentId` is the AI rooms root and it is listed by `searchArea=AiHub` only

#### Scenario: Projects only
- **WHEN** the client lists `files/rooms?searchArea=AiHub&type=12`
- **THEN** only AI projects are listed

### Requirement: AI rooms lifecycle
A room of the AI rooms root SHALL never be archived (403), made a template (403) or moved out of the root; a duplicate of an Instructions or Knowledge room SHALL land in the same root; a delete SHALL remove the room outright. No folder SHALL be created in the root itself.

#### Scenario: Archive refused
- **WHEN** the owner archives an Instructions room
- **THEN** the answer is 403

### Requirement: Linked rooms come from the AI rooms root
Only Instructions and Knowledge rooms of the AI rooms root SHALL be linked to a project and returned in its sources. No migration is needed: the feature is unreleased, so no such room exists outside that root.

#### Scenario: Linking a room
- **WHEN** a Project manager links a Knowledge room listed by `searchArea=AiHub`
- **THEN** the project's sources list it under `knowledgeRooms`

### Requirement: Special folders scoped to AI rooms
`GET files/@recent`, `@favorites` and `@trash` SHALL accept `folderType` 38, 39 and 40 in their scope filter and return only the entries that sit in rooms of those types, the way they do for `FolderType.FormRoom`.

#### Scenario: Scoped recent
- **WHEN** a user calls `files/@recent?folderType=38&folderType=39&folderType=40`
- **THEN** only files opened inside Instructions and Knowledge rooms are returned

### Requirement: Listing items
Each listed project SHALL be a full room DTO (`tags`, `createdBy`, `updatedBy`, `pinned`, `mute`, `inRoom`, `access`, `security` included) without linked rooms: the list shows none, and the client reads a project and its sources on their own when it opens or picks it.

#### Scenario: Outsider lists
- **WHEN** a User who belongs to no project lists `files/rooms?searchArea=AiHub&type=12`
- **THEN** the answer is 200 with an empty page

### Requirement: Project skills
`GET files/rooms/{id}/skills` SHALL answer `{ rooms: [{ id, title, logo, skills: [{ id, name, description }] }] }`: for an Instructions room its own skills, for a project every linked Instructions room with its skills; any other id SHALL answer 404. Reading the project SHALL be enough to read the skills of its rooms.

#### Scenario: Skills of a project
- **WHEN** a Member reads the skills of a project with two linked Instructions rooms
- **THEN** both rooms are listed with their skills, read through the project

### Requirement: Skills of picked rooms
`GET files/rooms/skills?roomIds=…` (1 to 20 ids, the parameter repeated) SHALL answer the skills of those Instructions rooms in the same shape; a room the caller cannot read, or that is not an Instructions room, SHALL be left out. The Node service SHALL read the composer's rooms this way in batches of 20 and SHALL NOT parse frontmatter itself.

#### Scenario: Unreadable picked room
- **WHEN** the composer's skills read names a room the caller cannot read
- **THEN** that room is absent from the answer

### Requirement: Knowledge listing
The client SHALL compose a project's knowledge from its sources' Knowledge rooms, reading each with `GET files/{roomId}?filterType=1` in pages of 100 up to 1000 files (`truncated` when there are more), four rooms at a time. A room whose files cannot be read SHALL be shown as unavailable with no files, without failing the others.

#### Scenario: Room over the listing size
- **WHEN** a linked Knowledge room holds 1200 files
- **THEN** the room comes with 1000 files, `totalFiles: 1200` and `truncated: true`

### Requirement: Knowledge file state
Each file in the knowledge listing SHALL carry `indexed` (its vectorization completed), its `vectorizationStatus` (in progress, completed, failed, or `null` when never queued) and `security.Vectorization` (whether the caller may retry it). Each room SHALL carry `totalFiles`, `indexedFiles` and `failedFiles`.

#### Scenario: Failed file for a Viewer
- **WHEN** a Viewer of the room reads the knowledge listing and one file failed to vectorize
- **THEN** the file comes with `vectorizationStatus: failed` and `security.Vectorization: false`, and the room's `failedFiles` is 1

### Requirement: Project logo image
A project SHALL take an uploaded logo the way a room does: the picture is uploaded to `files/logos`, and the create or update body carries it as `logo` (`tmpFile`, `x`, `y`, `width`, `height`); `DELETE files/rooms/{id}/logo` removes it, allowed to the owner and Project managers. The DTO then carries the logo sizes and no cover; removing it returns the colour and cover.

#### Scenario: Set and remove the picture
- **WHEN** a Project manager saves the project with a cropped picture and later deletes the logo
- **THEN** the project is listed with the picture's sizes, then again with its colour and cover only

### Requirement: Chat binding in Node
For a round or thread whose `entityId` is a project, the Node service SHALL read, with the caller's forwarded credentials, `GET files/rooms/{id}` (the caller's `access` as the role, `inRoom` as `canChat`), `GET files/rooms/{id}/sources` and `GET files/rooms/{id}/skills`. The round's model SHALL be the project's scoped assignment, else the portal's Chat assignment. It is not a client route.

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not a member sends a message in the project
- **THEN** the round is refused with 403

### Requirement: Linked room lifecycle
When a linked room is deleted, moved to Trash or archived, the server SHALL unlink it from every project; restoring the room SHALL NOT link it again. Deleting a project SHALL drop its links. A project lists only the rooms that are linked and active, so a linked room is never reported as unavailable.

#### Scenario: Linked room moved to Trash
- **WHEN** a linked Instructions room is moved to Trash and later restored
- **THEN** the project lists it in neither state until it is linked again

### Requirement: Model lifecycle
A project runs on its stored model, else on the portal's Chat assignment. When that effective profile is missing, deleted or without the chat capability, rounds in the project SHALL be refused with 409 `projectModelUnavailable` until the model is changed.

#### Scenario: Portal model removed
- **WHEN** an admin deletes the profile a project stores as its model
- **THEN** chatting in that project answers 409

### Requirement: Notifications and history
The server SHALL e-mail members on invitation, role change, removal and project deletion (mute-aware, never to the actor), with project wording and the roles "Project manager" / "Member". The history (`GET files/folder/{id}/log`) SHALL record create, rename, rooms linked / unlinked (6117 / 6118, one entry per request naming the rooms), owner change and membership events.

#### Scenario: Invitation e-mail
- **WHEN** a Project manager invites a user with notifications on
- **THEN** the user receives a project invitation e-mail naming the role

#### Scenario: History after an edit
- **WHEN** the owner links two rooms in one save
- **THEN** the history shows one "rooms linked" entry naming both rooms

### Requirement: Invitation link acceptance
Joining through the project's invitation link SHALL add the user as Member, which gives them read access to the linked rooms through the project, and land them on `/ai-rooms/{id}/filter?folder={id}`.

#### Scenario: Join by link
- **WHEN** a user opens a valid project invitation link and signs in
- **THEN** they become a Member and the project opens

### Requirement: Errors reach the client
A refused request SHALL carry a user-facing, localised message, so the client can show it as a toast.

#### Scenario: Validation message shown
- **WHEN** a create fails on the title length
- **THEN** the client receives the server's message text in the error body
