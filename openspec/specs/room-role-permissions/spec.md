# room-role-permissions Specification

## Purpose

Defines the room roles the web client offers per room type, how it shows a room's members and lets those entitled
change roles and remove members, and how the menus of rooms follow the user's role in the room. The product matrix of
roles is transcribed in `.claude/rules/access-matrix.md`; this spec states what the client does with it.

Server counterpart: `../server/openspec/specs/room-role-permissions`, `vdr-room-roles` and `form-filling-room-roles`
(which role may do what, and the roles each room type accepts). The client does not decide a member's rights itself:
it offers actions by the room's and entry's `security` flags and each member record's `canEditAccess`, as the server
computes them. Operations called: `getRoomSecurityInfo`, `setRoomSecurity`, `resendEmailInvitations`.

Out of scope: inviting new members (`invitations`); portal user types (`user-type-permissions`); room links
(`shared-links`); room actions themselves (`room-types`); private rooms (`private-rooms/room-membership`); agents
(change `ai-chat-agents-design`).

Implementation: `packages/shared/utils/getAccessOptions.tsx` (`getAccessOptions`, `filterPaidRoleOptions`), the
Members view of the info panel (`packages/client/src/pages/Home/InfoPanel/Body/views/Members`), the room options of
the context options store.

## Requirements

### Requirement: Roles offered per room type

The client SHALL offer, besides the room owner, these roles: in a Custom room Room manager, Content creator, Editor,
Reviewer, Commentator and Viewer; in a Collaboration room Room manager, Content creator, Editor and Viewer; in a Public
room Room manager and Content creator; in a Form filling room Room manager, Content creator and Form filler; in a
Virtual Data Room Room manager, Content creator, Editor, Viewer and Form filler.

#### Scenario: Virtual Data Room

- **WHEN** a Room manager opens the role selector of a member of a Virtual Data Room
- **THEN** no Reviewer and no Commentator role is offered

#### Scenario: Form filling room

- **WHEN** a Room manager opens the role selector of a member of a Form filling room
- **THEN** only Room manager, Content creator and Form filler are offered

### Requirement: Paid roles for those who cannot hold them

For a group, and for an account that is not the portal owner, a DocSpace admin or a room admin, the role selector SHALL
NOT offer the room manager role, which only those types may hold.

#### Scenario: User type

- **WHEN** a Room manager opens the role selector of a member of type User
- **THEN** Room manager is not offered

### Requirement: The members list of a room

The Members tab SHALL list a room's members grouped as administrators, groups, users, guests and people still expected
to accept their invitation, loading more as the list scrolls. A member record whose `canEditAccess` is false SHALL show
its role as plain text. A room template SHALL list who may use it without roles.

#### Scenario: Expected people

- **WHEN** a room has invitations not yet accepted
- **THEN** those people are listed under the expected group

### Requirement: Changing a member's role

Choosing another role for a member SHALL save it at once and confirm with `Common:AccessRightsChanged`; choosing the
current role SHALL do nothing. When the change would remove forms the member is filling, the client SHALL ask for
confirmation and repeat the change with the user's consent. A refused change SHALL show the server's error.

#### Scenario: Role changed

- **WHEN** a Room manager switches a member from Viewer to Editor
- **THEN** the role is saved and `Common:AccessRightsChanged` is shown

#### Scenario: Form filler with forms in progress

- **WHEN** the server answers that the change blocks the deletion of the member's forms
- **THEN** a confirmation appears and, if accepted, the change is sent again forced

### Requirement: Removing a member

Remove in a member's role selector SHALL remove the member from an ordinary room at once, and from a room selected in a
list as well as from the open room.

#### Scenario: Ordinary room

- **WHEN** a Room manager chooses Remove for a member of a Custom room
- **THEN** the member is removed without a confirmation

### Requirement: Repeating invitations

A user with the room's `EditAccess` SHALL be able to send the pending invitations of the room again from the header of
the expected group, confirmed with a toast.

#### Scenario: Resend

- **WHEN** a Room manager presses the resend icon of the expected group
- **THEN** the invitations are sent again and a toast confirms it

### Requirement: Room menus follow the role in the room

The context menu of a room SHALL offer the actions the user's role and type grant for its room type: a room owner and a
Room manager the room's management actions, a Content creator fewer, and a DocSpace admin who is not a member only what
an administrator may do on someone else's room.

#### Scenario: Content creator of a Collaboration room

- **WHEN** a Content creator opens the context menu of a Collaboration room
- **THEN** the menu offers the actions of a Content creator for that room type and no management actions

#### Scenario: DocSpace admin outside the room

- **WHEN** a DocSpace admin who is not a member opens the context menu of a Custom room
- **THEN** the menu offers the administrator's actions on someone else's room

### Requirement: Actions follow the server's rights, not the role name

Whether a user may edit a room, invite into it, manage its links or members, or act on an entry SHALL be read from the
room's and the entry's `security` flags; the client SHALL NOT derive these rights from a role or a user type on its own.

#### Scenario: Invite in a Virtual Data Room

- **WHEN** an Editor of a Virtual Data Room opens the room
- **THEN** no invite action is offered, because the room's `EditAccess` is false
