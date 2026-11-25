# user-type-permissions Specification

## Purpose

Defines what the web client offers each portal user type — DocSpace Owner, DocSpace admin, Room admin, User, Guest —
outside a single room: which sections open, who may create rooms, whom a user may invite to the portal, whose type a
user may change and to what, who may disable, delete and reassign accounts, who manages groups and guests, and what
happens on screen when a user's own type is lowered during a session. The product matrix is transcribed in
`.claude/rules/access-matrix.md`.

Server counterpart: `../server/openspec/specs/user-type-permissions` (the outer limit each type has, enforced by the
API). The client hides or disables what a type may not do, so the user is not offered an action the server refuses;
where the server sends a `security` flag (rooms, folders, files) the client follows the flag instead of the type.
Operations called: `getSelfProfile`, `updateUserType`, `startUserTypeUpdate`, `updateUserStatus`, `deleteMember`,
`deleteGuests`, `inviteUsers`.

Out of scope: what a role allows inside a room (`room-role-permissions`); how the Accounts lists, dialogs and groups
work (`people-and-groups`); the invite panel itself (`invitations`); billing pages by type (`billing`); developer tools
by type (`webhooks-and-api-keys`); the dashboard's create section (`dashboard`); private rooms (`private-rooms`).

Implementation: the route guards of the client, the access rights store, the Accounts context options and the
`ChangeMyType` socket handler.

## Requirements

### Requirement: Sections by user type

The client SHALL open Accounts to the DocSpace Owner, DocSpace admins and Room admins, and Portal settings to the
DocSpace Owner and DocSpace admins only. A User or a Guest who opens Accounts SHALL see the no-access empty view, and
the profile menu SHALL NOT offer them Contacts. Any other type opening Portal settings SHALL be sent to the 401 page.
My documents SHALL NOT open for a Guest, unless the Guest still holds a personal folder.

#### Scenario: Room admin opens Accounts

- **WHEN** a Room admin opens the Accounts people list
- **THEN** the list is shown

#### Scenario: User opens Accounts

- **WHEN** a User opens the Accounts address
- **THEN** the no-access empty view is shown instead of the list

#### Scenario: Room admin opens Portal settings

- **WHEN** a Room admin opens a Portal settings address
- **THEN** the client navigates to the 401 page

### Requirement: Creating rooms

The action that creates a room SHALL be offered in the Rooms section only while the section's `security.Create` is
true, which the server grants to the DocSpace Owner, DocSpace admins and Room admins; a User or a Guest SHALL NOT be
offered it.

#### Scenario: User in Rooms

- **WHEN** a User opens the Rooms section
- **THEN** no create action is offered in the header or the main button

### Requirement: Inviting to the portal by type

The invite menu of Accounts SHALL offer the DocSpace admin type to the DocSpace Owner only, the Room admin type to the
Owner and DocSpace admins, and the User type to every type that reaches Accounts. It SHALL NOT offer the Guest type,
and SHALL offer nothing while inviting members is turned off for the portal.

#### Scenario: DocSpace admin invites

- **WHEN** a DocSpace admin opens the invite menu in Accounts
- **THEN** Room admin and User are offered and DocSpace admin is not

#### Scenario: Room admin invites

- **WHEN** a Room admin opens the invite menu in Accounts
- **THEN** only User is offered

### Requirement: Changing another account's type

The type selector SHALL offer DocSpace admin to the DocSpace Owner only, and Room admin, User and, while guests may be
invited, Guest to the Owner and DocSpace admins. It SHALL NOT be offered for one's own account, the Owner's, a
disabled account, or, to a DocSpace admin, another DocSpace admin's. A Room admin SHALL only turn a guest into a User.

#### Scenario: DocSpace admin and another admin

- **WHEN** a DocSpace admin looks at a DocSpace admin's row
- **THEN** the type cannot be changed there

#### Scenario: Room admin and a guest

- **WHEN** a Room admin chooses to change the type of a guest
- **THEN** the guest is turned into a User without a list of types

### Requirement: Disabling, deleting and reassigning accounts

The client SHALL offer disabling, enabling, deleting and reassigning data to the DocSpace Owner for every account but
their own, and to a DocSpace admin for every account but the Owner's, a DocSpace admin's and their own. Deleting and
reassigning SHALL be offered only for a disabled account, reassigning not for a guest, and disabling not for an LDAP
account. None of these SHALL be offered to a Room admin.

#### Scenario: Room admin

- **WHEN** a Room admin opens the context menu of a User
- **THEN** no disable, delete or reassign action is offered

#### Scenario: Active account

- **WHEN** the Owner opens the context menu of an active User
- **THEN** disabling is offered and deleting is not

### Requirement: Guests of a Room admin

A Room admin SHALL see only their own guests, without the inviter filter and the inviter sort, and SHALL be offered
for an active guest: its room list, the link that shares the guest with another manager, turning it into a User and
removing it from their list (`Common:Remove`) instead of disabling or deleting it.

#### Scenario: Remove a guest

- **WHEN** a Room admin chooses Remove for a guest
- **THEN** the remove confirmation is shown and, once confirmed, the guest leaves the Room admin's list

### Requirement: Managing groups

Creating, editing and deleting groups SHALL be offered to the DocSpace Owner and DocSpace admins only, and not for a
group synchronized from LDAP. A Room admin SHALL see the groups and their members without these actions.

#### Scenario: Room admin on the Groups tab

- **WHEN** a Room admin opens the Groups tab
- **THEN** no create action is offered and the group menu has no Edit or Delete

### Requirement: Portal owner actions

Changing the portal owner SHALL be offered only to the Owner, on their own row; resetting another account's
authenticator app SHALL be offered only to the Owner, and SHALL be disabled for an account without one.

#### Scenario: DocSpace admin's own row

- **WHEN** a DocSpace admin opens the context menu of their own row
- **THEN** no owner change is offered

### Requirement: Own type lowered during a session

When the server reports that the user's own type was lowered, the client SHALL keep the current page, re-read the open
folder or room with the new rights and show a bar (`MainBar:UserTypeLoweredHeader`, `MainBar:UserTypeLoweredDescription`)
that offers a reload and can be dismissed. A raised or unchanged type SHALL show no bar. A user lowered to Guest SHALL be
told who changed the type, and a personal folder left read-only SHALL warn that its files will be deleted.

#### Scenario: Room admin becomes a User

- **WHEN** the type of a Room admin inside a room is changed to User
- **THEN** the bar appears, the room stays open and the create action disappears

#### Scenario: Type raised

- **WHEN** the type of a User is changed to Room admin
- **THEN** no bar is shown

### Requirement: A refused request keeps the user in place

When a request on an open room is refused because the user's rights changed, the client SHALL keep the room open, show
one error toast and re-read the user's type and the room's rights; finding a lowered type SHALL show the same bar.

#### Scenario: Denied request

- **WHEN** a request made while a room is open answers 403
- **THEN** the room stays open and exactly one toast says access is denied
