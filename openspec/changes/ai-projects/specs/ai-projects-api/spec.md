# Spec Delta

## Purpose

Defines the `/api/2.0/ai/projects` contract the client consumes: what an AI project is on the server, who may do what, how requests are validated and which answers and errors the client can rely on. Served by ASC.AI.Chat (Node), which delegates the room to the .NET AI service (`internal/ai/projects`, list, create, get, update, delete and the linked-rooms routes `GET/POST/DELETE internal/ai/projects/{id}/rooms`) and composes the rest of the contract (the `aiProject` block, the `skills` and `knowledge` listings, the chat context) over those routes and the Files API.

Like the agents API, `ai/projects` carries only what is specific to a project: the list with its filters, get, create, update, delete, and the `skills` and `knowledge` listings. Everything a project shares with a room (pin, mute, leave, owner change, logo removal, members, invitation links, resend, history) goes through the room routes (`files/rooms/{id}/...`, `files/owner`, `settings/notification/rooms`), which SHALL accept a room of type 12 wherever they accept the other room types, with the project rules below applied.

## ADDED Requirements

### Requirement: Project entity
An AI project SHALL be a room of type 12 (`FolderType.AiProjectRoom` 40) under its own root (`FolderType.AiProjects` 41). It SHALL hold no files. The .NET service SHALL store its linked rooms as one set of room ids per project (`files_ai_project_room`), each an active Instructions room (type 10) or Knowledge room (type 11) under the Rooms root, told apart by the room's type. Linked rooms are references by id, never nested rooms.

#### Scenario: Upload into a project
- **WHEN** a client tries to create a file or folder inside a project
- **THEN** the request is refused: a project holds no content

### Requirement: Project settings block
`GET ai/projects/{id}` SHALL answer the room with an `aiProject` block composed by the Node service: `profile` (`null`: the portal default, since the server stores no model with a project yet), `instructionsRooms` and `knowledgeRooms` (each room as the server lists it: id, title, logo, `roomType`, `available: true`, `archived: false`), `canEditSettings` (the room's `EditRoom`) and `warnings` when the last change skipped something.

#### Scenario: Project answered as a room
- **WHEN** the client reads `GET ai/projects/{id}`
- **THEN** the answer is a `FolderDto` with `roomType: 12`, `security` flags and an `aiProject` block built from `GET internal/ai/projects/{id}/rooms`

### Requirement: Project tags
A project SHALL carry tags as a room does: `tags` (names) in its DTO, bound and unbound through `files/rooms/{id}/tags`, and listed in the portal's `files/tags`.

#### Scenario: Tag bound in the list
- **WHEN** a Project manager binds the tag "sales" to a project through `files/rooms/{id}/tags`
- **THEN** the project is listed with `tags: ["sales"]` and "sales" is in `files/tags`

### Requirement: Roles
A project SHALL have three roles: project owner (`access` 1, the room's `createdBy`), Project manager (`access` 9, portal owner, DocSpace admin or room admin only, never a group) and Member (`access` 2, the room's Read; any user type including guests, directly or through a group). Each member SHALL also hold Viewer on every linked room, granted by the server. A project SHALL NOT be duplicated.

#### Scenario: Guest as Member
- **WHEN** a Project manager invites a guest as Member
- **THEN** the guest is accepted with `access` 2

#### Scenario: Guest as Project manager
- **WHEN** a Project manager tries to give a User or a group the Project manager role
- **THEN** the request is refused with 403

### Requirement: Visibility guard
Every project route SHALL answer 404 with one message when the id names no AI project or a folder of another type, and 403 when the project exists but the caller cannot read it. A 403 for the action itself (edit, delete) follows the read check. The portal owner and DocSpace admins SHALL see every project without being members.

#### Scenario: Outsider reads a project
- **WHEN** a room admin who is not in the project reads it
- **THEN** the answer is 403

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not in the project reads it
- **THEN** the answer is 200 with `inRoom: false` and `access` 0

### Requirement: Read rights
Reading a project (get, list, history, members, skills, knowledge) and pinning it SHALL be allowed to the owner, Project managers, Members and admins outside the project.

#### Scenario: Member reads members
- **WHEN** a Member reads `GET files/rooms/{id}/share` of a project
- **THEN** the answer is 200 with the member list

### Requirement: Management rights
Update, logo delete, member changes, resend and the invitation link SHALL be allowed to the owner and Project managers. Members and an admin outside the project SHALL get 403. Mute SHALL require membership (owner, Project manager or Member).

#### Scenario: Member edits
- **WHEN** a Member sends `PUT ai/projects/{id}` with a new title
- **THEN** the answer is 403

#### Scenario: Admin outside mutes
- **WHEN** a DocSpace admin who is not a member mutes the project
- **THEN** the answer is 403

### Requirement: Owner-level rights
Delete and change owner SHALL be allowed to the owner and to admins outside the project only; Project managers and Members SHALL get 403. Leave SHALL be allowed to Project managers and Members; the owner and an admin outside the project SHALL get 400. Chat SHALL be allowed to members only.

#### Scenario: Manager deletes
- **WHEN** a Project manager sends `DELETE ai/projects/{id}`
- **THEN** the answer is 403

#### Scenario: Admin deletes
- **WHEN** a DocSpace admin who is not a member deletes the project
- **THEN** the answer is 200 with the delete operation

### Requirement: Who may create
Only the portal owner, DocSpace admins and room admins SHALL create projects. The creator becomes the owner. The role check SHALL run before any room id is examined.

#### Scenario: User creates
- **WHEN** a User sends `POST ai/projects`
- **THEN** the answer is 403 and no room id in the body is validated

### Requirement: Body validation
The server SHALL validate a create or update body before writing anything; the first failure answers 400 with a localised message. The title SHALL be 1–170 characters after trimming, the colour six hex digits, the cover a known id. `tags` (names) SHALL be taken as a room's create and edit take them. Unknown body properties (such as `quota`, `lifetime`, `watermark`) SHALL be refused. An uploaded logo goes in the body as `logo` and is removed through the room route `DELETE files/rooms/{id}/logo`.

#### Scenario: Room-only field
- **WHEN** the body carries `tags` or `quota`
- **THEN** the answer is 400 for an unknown property

#### Scenario: Long title
- **WHEN** a create sends a 171-character title
- **THEN** the answer is 400 with the title-length message

### Requirement: Linked room routes
The .NET service SHALL serve the links as `GET internal/ai/projects/{id}/rooms` (`instructionsRooms` and `knowledgeRooms`, each `{ id, title, logo }` sorted by title, for anyone who may read the project), `POST .../rooms { roomIds }` (links the rooms not linked yet, 204) and `DELETE .../rooms { roomIds }` (unlinks the linked ids, 204). The writes SHALL be for the owner and Project managers only, each one history entry naming the rooms, and SHALL push a folder update.

#### Scenario: Member links a room
- **WHEN** a Member sends `POST internal/ai/projects/{id}/rooms`
- **THEN** the answer is 403

#### Scenario: Already linked
- **WHEN** `roomIds` names a room already linked, twice
- **THEN** the answer is 204 and the room is linked once

### Requirement: Linked room validation
`roomIds` SHALL hold 1 to 200 ids. Every room being linked SHALL be an active Instructions or Knowledge room under the Rooms root that the caller can read; any other id (missing, archived, in Trash, of another type, unreadable) SHALL refuse the whole request with 400 naming the ids, linking nothing. A project SHALL link at most 100 rooms of each type; a request over the limit SHALL answer 400 and keep the existing links.

#### Scenario: Room of another type
- **WHEN** `roomIds` names an Instructions room and an ordinary room
- **THEN** the answer is 400 naming the ordinary room and neither is linked

#### Scenario: Over the limit
- **WHEN** a project links 100 Instructions rooms and one more is sent
- **THEN** the answer is 400 and the 100 stay linked

### Requirement: Linked rooms in the create and update body
The client SHALL send the linked rooms inside `aiProject` as `instructionsRoomIds` and `knowledgeRoomIds` (positive ids, duplicates dropped); the Node service SHALL take the block apart and never forward it. On create it SHALL link both lists right after the room is made; on update a list sent SHALL be brought about exactly (missing rooms linked, rooms left out unlinked, `[]` unlinks all of that kind) and a list absent or `null` SHALL keep its rooms.

#### Scenario: Unlink all Knowledge rooms
- **WHEN** an update sends `"aiProject": { "knowledgeRoomIds": [] }`
- **THEN** the project links no Knowledge room afterwards and its Instructions rooms are unchanged

### Requirement: Refused link on save
A link or unlink the server refuses SHALL NOT fail the save: the answer carries the project as it is and a `roomUnavailable` warning with the server's message in `aiProject.warnings`, which the client shows as a toast.

#### Scenario: Refused room on create
- **WHEN** a create names an archived Instructions room
- **THEN** the project is created, the answer lists no Instructions room and `aiProject.warnings` holds a `roomUnavailable` entry with the server's message

### Requirement: Project model
A `profileId` sent in `aiProject` SHALL be a UUID of an existing profile that supports chat, or `null`; the Node service SHALL check this before anything is written. The .NET service stores no model with a project yet, so a project SHALL run on the portal's Chat assignment: the answer reports `profile: null`, and a non-null `profileId` SHALL be answered with a `modelNotStored` warning in `aiProject.warnings` instead of being dropped silently or failing the save.

#### Scenario: Profile without chat
- **WHEN** a create names an embedding-only profile
- **THEN** the answer is 400 saying the profile does not support chat

#### Scenario: Model chosen
- **WHEN** a create names a chat profile
- **THEN** the project is created with `profile: null` and `aiProject.warnings` holds a `modelNotStored` entry

### Requirement: Partial update semantics
On update, an absent field SHALL keep its value; a present `tags` replaces the set. Unknown body properties SHALL be refused by the .NET service with 400. A body holding only the `aiProject` block SHALL read the room instead of writing it and still bring the links about.

#### Scenario: Rename only
- **WHEN** an update sends only a new title
- **THEN** the title changes and the linked rooms are unchanged

### Requirement: Linked-room grants
When a user becomes a member (invite, accepted link, owner change) and when a room is linked to a project, the server SHALL grant Viewer on the linked room to every member who has no share on it. Existing shares SHALL never be downgraded, no e-mail SHALL be sent, and a grant that cannot be made SHALL become a warning (`grantSkipped`, `ownerLostAccess`) in the answer rather than a failure. Removing a member or unlinking a room SHALL NOT revoke the grant.

#### Scenario: Invite grants rooms
- **WHEN** a user is invited to a project with two linked rooms they are not in
- **THEN** they get Viewer on both rooms

#### Scenario: Existing Editor kept
- **WHEN** an invited user already is an Editor of a linked room
- **THEN** their Editor role on that room stays

#### Scenario: Grant skipped
- **WHEN** a grant on a linked room fails for one member
- **THEN** the membership change succeeds and `aiProjectWarnings` reports the room

### Requirement: Membership routes
Members SHALL be managed through the room routes `GET/PUT files/rooms/{id}/share`, `POST .../resend` and `GET/PUT .../links`; leaving is a share change that sets the caller's own `access` to 0. `access` SHALL be 0 (remove), 2 or 9; the owner SHALL NOT appear in a share change. A project SHALL have at most one invitation link, which joins as Member. The owner and a member who belongs only through a group SHALL NOT be able to leave.

#### Scenario: Owner leaves
- **WHEN** the owner sets their own `access` to 0 through `PUT files/rooms/{id}/share` of a project
- **THEN** the answer is 400 "The project owner cannot leave the project. Change the owner first."

#### Scenario: Second link
- **WHEN** a Project manager creates an invitation link while one exists
- **THEN** the answer is 403

### Requirement: Change owner
`PUT files/owner` with the project id SHALL hand the project to an active portal owner, DocSpace admin or room admin, who need not be a member yet. The former owner stays as Project manager, as a room keeps its former owner as a room manager; the client leaves the project in a separate share change when the user asked not to stay. The new owner SHALL be granted Viewer on every linked room. Handing to the current owner SHALL be refused with 400.

#### Scenario: Hand over and stay
- **WHEN** the owner hands the project to a room admin and stays
- **THEN** the room admin is the owner and the former owner is listed with `access` 9

### Requirement: Delete
Delete (`DELETE ai/projects/{id}`) SHALL be permanent (no archive), answered as a file operation to poll, and SHALL remove the project's settings and the members' threads while leaving linked rooms and their Viewer shares untouched.

#### Scenario: Delete keeps rooms
- **WHEN** the owner deletes a project with linked rooms
- **THEN** the linked rooms and the members' Viewer access on them remain

### Requirement: Pin and mute
Pin and unpin (`PUT files/rooms/{id}/pin` and `.../unpin`) SHALL be personal to the caller, with at most 10 pinned projects per user (an 11th pin answers 403) and a separate counter from rooms and agents. Mute (`POST settings/notification/rooms`) SHALL be personal and SHALL require membership.

#### Scenario: Eleventh pin
- **WHEN** a user with 10 pinned projects pins another
- **THEN** the answer is 403

### Requirement: Listing query
`GET ai/projects` SHALL return a page of the projects the caller may see, pinned first. Query: `filterValue` (title), `sortBy` (`DateAndTime` default, `AZ`, `DateAndTimeCreation`, `Tags`, `Author`), `sortOrder`, `startIndex`, `count`, and the subject and tag filters of `files/rooms` (`subjectId` with `excludeSubject`, `subjectOwnerId`, `tags` as a JSON array, `withoutTags`). No other filter exists.

#### Scenario: Outsider lists
- **WHEN** a User who belongs to no project lists projects
- **THEN** the answer is 200 with an empty page

### Requirement: Listing items
Each listed project SHALL be a full room DTO (`tags`, `createdBy`, `updatedBy`, `pinned`, `mute`, `inRoom`, `access`, `security` included) without the `aiProject` block: the list shows no linked rooms, and the client reads a project on its own (`GET ai/projects/{id}`) when it opens or picks it.

#### Scenario: Project opened from the list
- **WHEN** the user opens a project from the list
- **THEN** the client reads `GET ai/projects/{id}` and the chat opens on the rooms that answer lists

### Requirement: Skills listing
`GET ai/projects/{id}/skills` SHALL be composed by the Node service from `GET internal/ai/projects/{id}/rooms` and the Files API, with the caller's credentials: every linked Instructions room (sorted by title, as the server lists them) with its skills (id, name, description from the Markdown frontmatter of its root files, `GET files/rooms/{id}/ai`). A room whose files cannot be read SHALL come back with `available: false` and no skills, never 403.

#### Scenario: Unreadable linked room
- **WHEN** a member reads the skills of a project whose Instructions room they lost access to
- **THEN** that room is listed with `available: false` and an empty skills list

### Requirement: Knowledge listing
`GET ai/projects/{id}/knowledge` SHALL be composed the same way: every linked Knowledge room with its files (`GET files/{roomId}`, files only, read in pages of 100 up to 1000, with `truncated` when there are more) and the room's `totalFiles`, `indexedFiles` and `failedFiles`. A room whose files cannot be read SHALL come back with `available: false` and no files, never 403.

#### Scenario: Room over the listing size
- **WHEN** a linked Knowledge room holds 1200 files
- **THEN** the room comes with 1000 files, `totalFiles: 1200` and `truncated: true`

### Requirement: Knowledge file state
Each file in the knowledge listing SHALL carry `indexed` (its vectorization completed), its `vectorizationStatus` (in progress, completed, failed, or `null` when never queued) and `security.Vectorization` (whether the caller may retry it). Each room SHALL carry `totalFiles`, `indexedFiles` and `failedFiles`.

#### Scenario: Failed file for a Viewer
- **WHEN** a Viewer of the room reads the knowledge listing and one file failed to vectorize
- **THEN** the file comes with `vectorizationStatus: failed` and `security.Vectorization: false`, and the room's `failedFiles` is 1

### Requirement: Project logo image
A project SHALL take an uploaded logo the way a room does: the picture is uploaded to `files/logos`, and the create or update body carries it as `logo` (`tmpFile`, `x`, `y`, `width`, `height`); `DELETE files/rooms/{id}/logo` removes it, allowed to the owner and Project managers. The project DTO SHALL then carry the logo sizes (`small`, `medium`, `large`, `original`) and no cover; removing the picture SHALL return the project to its colour and cover.

#### Scenario: Set and remove the picture
- **WHEN** a Project manager saves the project with a cropped picture and later deletes the logo
- **THEN** the project is listed with the picture's sizes, then again with its colour and cover only

### Requirement: Chat context
The Node service SHALL compose a project's chat context once per round and on thread creation, from `GET internal/ai/projects/{id}` (the caller's `access` as the role, `inRoom` as `canChat`), `GET internal/ai/projects/{id}/rooms` (the linked rooms, all readable by the caller) and the portal's Chat assignment (the effective model, available when it exists and can chat). It is not a client route.

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not a member sends a message in the project
- **THEN** the round is refused with 403

### Requirement: Linked room lifecycle
When a linked room is deleted, moved to Trash or archived, the server SHALL unlink it from every project; restoring the room SHALL NOT link it again. Deleting a project SHALL drop its links. A project lists only the rooms that are linked and active, so a linked room is never reported as unavailable.

#### Scenario: Linked room archived
- **WHEN** a linked Instructions room is archived and later restored
- **THEN** the project lists it in neither state until it is linked again

### Requirement: Model lifecycle
A project runs on the portal's Chat assignment. When that assignment names no profile, a deleted one or one without the chat capability, rounds in the project SHALL be refused with 409 `projectModelUnavailable` until the portal's model is fixed.

#### Scenario: Portal model removed
- **WHEN** an admin deletes the profile the portal's Chat assignment names
- **THEN** chatting in any project answers 409

### Requirement: Notifications and history
The server SHALL e-mail members on invitation, role change, removal and project deletion (mute-aware, never to the actor), with project wording and the roles "Project manager" / "Member". The project history (`GET files/folder/{id}/log`) SHALL record create, rename, rooms linked / unlinked (`RoomsLinkedToAiProject` 6117 / `RoomsUnlinkedFromAiProject` 6118, one entry per request naming the rooms), owner change and the membership events, so the History tab can show them.

#### Scenario: Invitation e-mail
- **WHEN** a Project manager invites a user with notifications on
- **THEN** the user receives a project invitation e-mail naming the role

#### Scenario: History after an edit
- **WHEN** the owner links two rooms in one save
- **THEN** the history shows one "rooms linked" entry naming both rooms

### Requirement: Invitation link acceptance
Joining through the project's invitation link SHALL add the user as Member, grant Viewer on the linked rooms, and land them on `/ai-projects/{id}`.

#### Scenario: Join by link
- **WHEN** a user opens a valid project invitation link and signs in
- **THEN** they become a Member and the project opens

### Requirement: Errors reach the client
A refused request SHALL carry a user-facing, localised message, and the Node service SHALL relay it unchanged, so the client can show it as a toast.

#### Scenario: Validation message shown
- **WHEN** a create fails on the title length
- **THEN** the client receives the server's message text in the error body
