# Spec Delta

## Purpose

Defines the `/api/2.0/ai/projects` contract the client consumes: what an AI project is on the server, who may do what, how requests are validated and which answers and errors the client can rely on. Served by ASC.AI.Chat (Node), which delegates to the .NET AI service.

Like the agents API, `ai/projects` carries only what is specific to a project: the list with its filters, get, create, update, delete, and the `skills` and `knowledge` listings. Everything a project shares with a room (pin, mute, duplicate, leave, owner change, logo removal, members, invitation links, resend, history) goes through the room routes (`files/rooms/{id}/...`, `files/owner`, `files/fileops/duplicate`, `settings/notification/rooms`), which SHALL accept a room of type 12 wherever they accept the other room types, with the project rules below applied.

## ADDED Requirements

### Requirement: Project entity
An AI project SHALL be a room of type 12 (`FolderType.AiProjectRoom` 40) under its own root (`FolderType.AiProjects` 41). It SHALL hold no files. It SHALL carry an `aiProject` settings block: a chat profile (`null` = portal default), an ordered list of linked Instructions rooms (type 10) and an ordered list of linked Knowledge rooms (type 11). Linked rooms are references by id, never nested rooms.

#### Scenario: Project answered as a room
- **WHEN** the client reads `GET ai/projects/{id}`
- **THEN** the answer is a `FolderDto` with `roomType: 12`, `security` flags and an `aiProject` block

#### Scenario: Upload into a project
- **WHEN** a client tries to create a file or folder inside a project
- **THEN** the request is refused: a project holds no content

### Requirement: Roles
A project SHALL have three roles: project owner (`access` 1, the room's `createdBy`), Project manager (`access` 9, portal owner, DocSpace admin or room admin only, never a group) and Member (`access` 11, any user type including guests, directly or through a group). Each project member SHALL also hold Viewer (`Read`) on every linked room, granted by the server; that Viewer share is never a project role.

#### Scenario: Guest as Member
- **WHEN** a Project manager invites a guest as Member
- **THEN** the guest is accepted with `access` 11

#### Scenario: Guest as Project manager
- **WHEN** a Project manager tries to give a User or a group the Project manager role
- **THEN** the request is refused with 403

### Requirement: Visibility guard
Every project route SHALL answer 404 with one message when the id names no AI project, a project in Trash, a folder of another type, or a project the caller cannot read. A 403 SHALL appear only after this guard, when the caller sees the project but may not perform the action. The portal owner and DocSpace admins SHALL see every project without being members.

#### Scenario: Outsider reads a project
- **WHEN** a room admin who is not in the project reads it
- **THEN** the answer is 404

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not in the project reads it
- **THEN** the answer is 200 with `inRoom: false` and `access` 0

### Requirement: Read rights
Reading a project (get, list, history, members, skills, knowledge) and pinning it SHALL be allowed to the owner, Project managers, Members and admins outside the project.

#### Scenario: Member reads members
- **WHEN** a Member reads `GET files/rooms/{id}/share` of a project
- **THEN** the answer is 200 with the member list

### Requirement: Management rights
Update, logo delete, member changes, resend, the invitation link and duplicate SHALL be allowed to the owner and Project managers. Members SHALL get 403. An admin outside the project SHALL get 403 on all of them except duplicate. Mute SHALL require membership (owner, Project manager or Member).

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
The server SHALL validate a create or update body before writing anything; the first failure answers 400 with a localised message. The title SHALL be 1–170 characters after trimming, the colour six hex digits, the cover a known id. Unknown body properties (room-only fields such as `tags`, `quota`, `lifetime`, `watermark`) SHALL be refused. An uploaded logo goes in the body as `logo` and is removed through the room route `DELETE files/rooms/{id}/logo`.

#### Scenario: Room-only field
- **WHEN** the body carries `tags` or `quota`
- **THEN** the answer is 400 for an unknown property

#### Scenario: Long title
- **WHEN** a create sends a 171-character title
- **THEN** the answer is 400 with the title-length message

### Requirement: Linked room validation
Each list SHALL hold at most 20 positive ids; duplicates within a list SHALL be dropped silently; the same id in both lists SHALL be refused. Every room being added SHALL exist, be readable by the caller and by the project owner, be of the expected type (10 for Instructions, 11 for Knowledge), not be third-party storage and not be in Trash or Archive. A missing room and an unreadable room SHALL give the same message.

#### Scenario: Too many rooms
- **WHEN** a create names 21 Knowledge rooms
- **THEN** the answer is 400 "A project can link at most 20 Knowledge rooms"

#### Scenario: Wrong room type
- **WHEN** an Instructions room id is sent in `knowledgeRoomIds`
- **THEN** the answer is 400 naming the room as not a Knowledge room

#### Scenario: Owner cannot read the room
- **WHEN** a Project manager links a room the project owner cannot read
- **THEN** the answer is 400 saying the owner has no access to that room

### Requirement: Profile validation
A `profileId` SHALL name an existing profile that supports chat; the all-zero id SHALL be refused. The AI service (Node) SHALL check this before forwarding, and the .NET service SHALL check it again.

#### Scenario: Profile without chat
- **WHEN** a create names an embedding-only profile
- **THEN** the answer is 400 saying the profile does not support chat

### Requirement: Partial update semantics
On update, an absent field SHALL keep its value. Inside `aiProject`, `profileId` SHALL have three states: absent (keep), `null` (portal default) or a profile id. A list sent as `null` SHALL keep its value; `[]` SHALL unlink every room of that kind. Validation of rooms SHALL run only on rooms being added.

#### Scenario: Reset the model
- **WHEN** an update sends `"aiProject": { "profileId": null }`
- **THEN** the project falls back to the portal default model and its rooms are unchanged

#### Scenario: Unlink all Knowledge rooms
- **WHEN** an update sends `"knowledgeRoomIds": []`
- **THEN** the project links no Knowledge room afterwards

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
Members SHALL be managed through the room routes `GET/PUT files/rooms/{id}/share`, `POST .../resend` and `GET/PUT .../links`; leaving is a share change that sets the caller's own `access` to 0. `access` SHALL be 0 (remove), 9 or 11; the owner SHALL NOT appear in a share change. A project SHALL have at most one invitation link, which joins as Member. The owner and a member who belongs only through a group SHALL NOT be able to leave.

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

### Requirement: Delete and duplicate
Delete (`DELETE ai/projects/{id}`) SHALL be permanent (no archive), answered as a file operation to poll, and SHALL remove the project's settings and the members' threads while leaving linked rooms and their Viewer shares untouched. Duplicate (`PUT files/fileops/duplicate` with the project id in `folderIds`) SHALL copy name, logo, model and the linked rooms the caller can read, SHALL NOT copy members, links, pins, mute or threads, and SHALL make the caller the owner of the copy.

#### Scenario: Delete keeps rooms
- **WHEN** the owner deletes a project with linked rooms
- **THEN** the linked rooms and the members' Viewer access on them remain

#### Scenario: Duplicate drops members
- **WHEN** a Project manager duplicates a project with five members
- **THEN** the copy has one member: the Project manager as owner

### Requirement: Pin and mute
Pin and unpin (`PUT files/rooms/{id}/pin` and `.../unpin`) SHALL be personal to the caller, with at most 10 pinned projects per user (an 11th pin answers 403) and a separate counter from rooms and agents. Mute (`POST settings/notification/rooms`) SHALL be personal and SHALL require membership.

#### Scenario: Eleventh pin
- **WHEN** a user with 10 pinned projects pins another
- **THEN** the answer is 403

### Requirement: Listing query
`GET ai/projects` SHALL return a page of the projects the caller may see, pinned first. Query: `filterValue` (title), `sortBy` (`DateAndTime` default, `AZ`, `DateAndTimeCreation`), `sortOrder`, `startIndex`, `count`, `subjectId` (owner), `role` (0/1/9/11), `hasInstructions`, `hasKnowledge`, `linkedRoomId` (a linked room of either kind). No other filter exists; the client's room filter SHALL be sent as `linkedRoomId`.

#### Scenario: Unreadable linked room filter
- **WHEN** the caller filters by a `linkedRoomId` they cannot read
- **THEN** the answer is 200 with an empty page, not an error

#### Scenario: Outsider lists
- **WHEN** a User who belongs to no project lists projects
- **THEN** the answer is 200 with an empty page

### Requirement: Listing items
Each listed project SHALL be a full room DTO with its `aiProject` block, where every linked room reports `available`, `archived`, its logo, and `skillsCount` (Instructions) or `totalFiles` / `indexedFiles` (Knowledge). A linked room the caller cannot read SHALL be reported with `available: false` and no title.

#### Scenario: Deleted linked room
- **WHEN** a linked Knowledge room was deleted
- **THEN** the project lists it with `available: false` and `title: null`

### Requirement: Sources listings
`GET ai/projects/{id}/skills` SHALL list every linked Instructions room in linked order with its skills (id, name, description from the Markdown frontmatter). `GET ai/projects/{id}/knowledge` SHALL list every linked Knowledge room with all of its files (at most 1000, with `truncated` when there are more). A room the caller cannot read SHALL come back with `available: false` and no content, never 403.

#### Scenario: Unreadable linked room
- **WHEN** a member reads the skills of a project whose Instructions room they lost access to
- **THEN** that room is listed with `available: false` and an empty skills list

### Requirement: Knowledge file state
Each file in the knowledge listing SHALL carry `indexed`, its `vectorizationStatus` (in progress, completed, failed) and `security.Vectorization` (whether the caller may retry it). Each room SHALL carry `totalFiles`, `indexedFiles` and `failedFiles`.

#### Scenario: Failed file for a Viewer
- **WHEN** a Viewer of the room reads the knowledge listing and one file failed to vectorize
- **THEN** the file comes with `vectorizationStatus: failed` and `security.Vectorization: false`, and the room's `failedFiles` is 1

### Requirement: Project logo image
A project SHALL take an uploaded logo the way a room does: the picture is uploaded to `files/logos`, and the create or update body carries it as `logo` (`tmpFile`, `x`, `y`, `width`, `height`); `DELETE files/rooms/{id}/logo` removes it, allowed to the owner and Project managers. The project DTO SHALL then carry the logo sizes (`small`, `medium`, `large`, `original`) and no cover; removing the picture SHALL return the project to its colour and cover.

#### Scenario: Set and remove the picture
- **WHEN** a Project manager saves the project with a cropped picture and later deletes the logo
- **THEN** the project is listed with the picture's sizes, then again with its colour and cover only

### Requirement: Chat context
The server SHALL expose an internal `chat-context` for a project: the caller's role, `canChat`, the stored and the effective profile, whether the profile is available, and the linked rooms split into readable and unavailable ids. It SHALL NOT be reachable by the client; the AI service reads it once per round and on thread creation.

#### Scenario: Admin outside the project
- **WHEN** chat-context is read for a DocSpace admin who is not a member
- **THEN** it answers `myRole: 0` and `canChat: false`

### Requirement: Linked room lifecycle
When a linked room is permanently deleted, the server SHALL unlink it from every project (with a history entry) and push an update to those projects. A linked room in Trash, of a changed type, or unreadable by the caller SHALL be reported as unavailable, not unlinked. A renamed linked room SHALL push an update to the projects that link it.

#### Scenario: Linked room deleted for good
- **WHEN** a linked Knowledge room is deleted from Trash
- **THEN** every project that linked it drops it from `knowledgeRooms` and the open lists refresh

#### Scenario: Linked room in Trash
- **WHEN** a linked room is moved to Trash
- **THEN** the project still lists it with `available: false`

### Requirement: Model lifecycle
When a project's profile is deleted or loses the chat capability, the server SHALL keep the stored `profileId` (no silent fallback), report `profile.available: false`, notify the owner and Project managers, and refuse rounds with 409 until the model is changed.

#### Scenario: Profile removed
- **WHEN** an admin deletes the profile a project uses
- **THEN** the project shows its model as unavailable, its owner and managers are notified, and chatting in it answers 409

### Requirement: Notifications and history
The server SHALL e-mail members on invitation, role change, removal and project deletion (mute-aware, never to the actor), with project wording and the roles "Project manager" / "Member". The project history (`GET files/folder/{id}/log`) SHALL record create, rename, model change, room linked / unlinked, Viewer grants on linked rooms, duplicate, owner change, model unavailable, and the membership events, so the History tab can show them.

#### Scenario: Invitation e-mail
- **WHEN** a Project manager invites a user with notifications on
- **THEN** the user receives a project invitation e-mail naming the role

#### Scenario: History after an edit
- **WHEN** the owner links a room and changes the model in one save
- **THEN** the history shows one "room linked" entry per added room and one "model changed" entry

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
