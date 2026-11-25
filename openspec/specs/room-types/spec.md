# room-types Specification

## Purpose

Defines how the web client creates and edits rooms of each type, the settings each type offers, room templates, room
groups in the Rooms list, and the life of a room: pinning, archiving, restoring, deleting, leaving and handing it to a
new owner, and its storage quota.

Server counterpart: `../server/openspec/specs/room-types` (types, settings, templates, groups, archive, owner, quota).
Operations called: `createRoom`, `createRoomThirdParty`, `createRoomFromTemplate`, `createRoomTemplate`,
`setPublicSettings`, `updateRoom`, `addRoomTags`, `uploadRoomLogo`, `createRoomLogo`, `changeRoomCover`, `pinRoom`,
`unpinRoom`, `archiveRoom`, `unarchiveRoom`, `deleteRoom`, `updateRoomsQuota`, `resetRoomQuota`, `changeFileOwner`,
`setFilesOrder`, `reorderRoom`, `startRoomIndexExport`, `addRoomGroup`, `getRoomGroups`, `updateRoomGroup`,
`deleteRoomGroup`.

Out of scope: who may create rooms and what each role may do in one (`user-type-permissions`,
`room-role-permissions`); inviting members (`invitations`); room links (`shared-links`); the Public room type under an
external sharing restriction (`shared-links`); third-party storage accounts (`storage-and-integrations`); the portal
quota settings (`quotas`); private rooms (`private-rooms`); the AI room types (change `ai-chat-agents-design`).

Implementation: `packages/client/src/components/dialogs/CreateEditRoomDialog`, `packages/client/src/components/GlobalEvents/{CreateRoomEvent,EditRoomEvent}`,
`packages/shared/utils/rooms.tsx`, `packages/client/src/components/dialogs/{CreateRoomTemplate,ArchiveDialog,RestoreRoomDialog,LeaveRoomDialog,EditRoomGroupsDialog,AddRoomToGroupDialog,ChangeQuotaDialog,LifetimeDialog}`,
`packages/client/src/components/panels/ChangeRoomOwnerPanel`, the rooms actions of the files actions store.

## Requirements

### Requirement: Room types offered for creation

The create-room dialog of the Rooms section SHALL offer the Form filling, Collaboration, Public, Custom and Virtual
Data Room types, each with its description, and SHALL NOT offer the AI room types or the private room type, which have
their own sections. A room's type SHALL NOT be changeable once it exists.

#### Scenario: Choosing a type

- **WHEN** a user who may create rooms opens the create-room dialog in Rooms
- **THEN** the five room types are offered and no AI or private type

#### Scenario: Editing a room

- **WHEN** a user opens the edit dialog of a Custom room
- **THEN** the type is shown but cannot be changed

### Requirement: Name, tags and logo

Every room SHALL require a name and SHALL refuse a name with forbidden characters (`Common:ContainsSpecCharacter`); an
empty name SHALL be reported as `Common:RequiredField`. A room SHALL accept tags, picked from existing ones or new, and a
logo, either an uploaded image cropped in the editor or a cover with a colour.

#### Scenario: Empty name

- **WHEN** a user tries to create a room without a name
- **THEN** the name field shows `Common:RequiredField` and the room is not created

### Requirement: Settings of a Virtual Data Room

A Virtual Data Room SHALL offer automatic indexing, file lifetime, the restriction of copying and downloading for
viewers, and watermarks. A new one SHALL start with indexing, the restriction and watermarks on and without a file
lifetime. Turning a file lifetime on for an existing room SHALL first ask for confirmation.

#### Scenario: New Virtual Data Room

- **WHEN** a user starts creating a Virtual Data Room
- **THEN** automatic indexing, the copy and download restriction and watermarks are on, and file lifetime is off

#### Scenario: Lifetime on an existing room

- **WHEN** a user turns on file lifetime while editing a Virtual Data Room
- **THEN** a confirmation dialog appears before the setting is taken

### Requirement: Settings of a Form filling room

A Form filling room SHALL offer collecting results in a spreadsheet (`Common:CollectResultsInXlsx`) and exporting
results to a connected database (`Common:ExportResultsToDatabase`), both on for a new room; without a database connection
the dialog SHALL say how to connect one.

#### Scenario: New Form filling room

- **WHEN** a user starts creating a Form filling room
- **THEN** both result options are on

### Requirement: Storage of a Public room

When third-party storage is enabled on the portal, creating a Public room (not from a template) SHALL offer to keep its
files in a connected third-party storage, in an existing folder or a new one named after the room. A room on
third-party storage SHALL have no storage quota.

#### Scenario: Public room on a third-party storage

- **WHEN** a user creates a Public room and picks a connected storage with a new folder
- **THEN** the room is created on that storage in a folder named after the room

### Requirement: Storage quota of a room

When the portal sets a default room quota, the create and edit dialogs SHALL offer the room's quota. The room menu SHALL
let users who may change it set a quota for selected rooms, turn the quota off for them or reset it to the default.

#### Scenario: Quota off

- **WHEN** an administrator turns the quota off for a room
- **THEN** the room is saved without a storage limit

### Requirement: Room templates

A user SHALL be able to save a room as a template (`Files:SaveAsTemplate`) and open the created template. A template
SHALL carry its name, tags, logo and the list of who may use it, and the create-room dialog SHALL let a user start a room
from a template available to them.

#### Scenario: Save as template

- **WHEN** a user saves a room as a template and chooses to open it
- **THEN** the template is created and opened in the Templates list

#### Scenario: Room from a template

- **WHEN** a user picks a template in the create-room dialog
- **THEN** the room's settings are taken from the template

### Requirement: Room groups

The Rooms list SHALL let a user turn grouping on and manage groups in the Edit room groups panel. With grouping on, a row
of group tags SHALL filter the list, All rooms active by default; with grouping off the row SHALL not show and the group
items SHALL be disabled. Rooms SHALL be added to a new or existing group from the header menu, and deleting a group SHALL
ask for confirmation.

#### Scenario: Filter by a group

- **WHEN** grouping is on and the user picks a group tag
- **THEN** the list shows only the rooms of that group

#### Scenario: Grouping off

- **WHEN** grouping is off
- **THEN** the group tags row is not shown and Create new group is disabled

#### Scenario: Delete a group

- **WHEN** a user deletes a group and cancels in the confirmation
- **THEN** the group stays

### Requirement: Choosing rooms for a group

The room selector of a new group SHALL keep Select disabled until a room is chosen, take the focus, move between rooms
with the arrows, tick and untick with Space or Enter, and give the focus back to Create new group on Escape.

#### Scenario: Keyboard choice

- **WHEN** a user opens the selector, moves with the arrows and presses Space on a room
- **THEN** the room is ticked and Select becomes enabled

### Requirement: Pinning rooms

Pin SHALL pin only the selected rooms not yet pinned, and Unpin SHALL unpin only the pinned ones.

#### Scenario: Mixed selection

- **WHEN** a user pins three rooms of which one is already pinned
- **THEN** only the two others are pinned

### Requirement: Archiving and restoring rooms

Moving rooms to the Archive SHALL ask for confirmation (`Common:ArchiveRoom` or `Common:ArchiveRooms`); restoring them,
or all of them, SHALL ask in the restore dialog. When restoring would exceed the storage quota, the client SHALL show the
quota warning instead.

#### Scenario: Archive one room

- **WHEN** a user chooses Move to Archive for a room
- **THEN** a dialog asks to confirm moving it to the Archive

#### Scenario: Restore over quota

- **WHEN** restoring a room would exceed the quota
- **THEN** the quota warning dialog opens

### Requirement: Deleting rooms

Deleting rooms SHALL run as an operation with its progress shown.

#### Scenario: Delete archived rooms

- **WHEN** a user deletes two archived rooms and confirms
- **THEN** the deletion runs with its progress shown

### Requirement: Leaving a room

Leaving SHALL ask for confirmation (`Common:LeaveTheRoom`, or `Common:LeaveTheFormSpace` for a Form filling room). The
room owner SHALL instead be asked to assign a new owner (`Common:AssignOwner`), which opens the owner change; a form
filler SHALL be warned about the forms they have not finished.

#### Scenario: Owner leaves

- **WHEN** the owner of a room chooses Leave the room
- **THEN** the dialog offers Assign owner and opens the owner change panel

#### Scenario: Leave refused

- **WHEN** the server refuses the leave
- **THEN** its error is shown and the user stays in the room

### Requirement: Changing the room owner

The owner and users allowed to change it SHALL be able to pick a new owner among the members, from the edit dialog or
the owner change panel, optionally leaving the room afterwards. A refused transfer SHALL keep the server's error.

#### Scenario: Owner change and leave

- **WHEN** an administrator assigns a new owner with "leave the room" ticked
- **THEN** the owner changes and the administrator leaves the room

### Requirement: Index of a Virtual Data Room

In a room with automatic indexing, the user SHALL be able to enter index editing, reorder entries and save the order,
and export the index; only one index export SHALL run at a time, and finishing one SHALL be confirmed with a toast.

#### Scenario: Second export

- **WHEN** an index export is already running and the user starts another
- **THEN** an error toast is shown and no second export starts

### Requirement: Lifetime mark in the Rooms list

A room with a file lifetime SHALL carry a lifetime icon on its title line, kept next to a long, truncated title, with a
tooltip on hover.

#### Scenario: Long title

- **WHEN** a room with a file lifetime has a title longer than its row
- **THEN** the title is truncated and the lifetime icon stays on the title line
