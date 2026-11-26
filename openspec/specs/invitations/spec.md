# invitations Specification

## Purpose

Defines how the web client invites people to the portal and to rooms: the invite panel, inviting by email or from the
contact list with a type or a role, invitation links of the portal and of a room with their limits, the warnings shown
when a paid limit stops an invitation, and the pages in the login app where an invited person joins.

Server counterpart: `../server/openspec/specs/invitations` (who may invite whom, link and quota rules, statuses).
Operations called: `inviteUsers`, `setRoomSecurity`, `setRoomLink`, `getInvitationLink`,
`getInvitationLinkByEmployeeType`, `createInvitationLink`, `updateInvitationLink`, `deleteInvitationLink`,
`resendEmailInvitations`.

Out of scope: the roles a room offers and what they allow (`room-role-permissions`); user types and who may invite whom
(`user-type-permissions`); shared links of rooms (`shared-links`); signing in (`authentication`); payments behind a
paid limit (`billing`); private rooms (`private-rooms/room-membership`); agents (change `ai-chat-agents-design`).

Implementation: `packages/client/src/components/panels/InvitePanel`, `packages/client/src/components/panels/LinkSettingsPanel`,
`packages/client/src/components/dialogs/InviteQuotaWarningDialog`, `packages/login/src/app/(root)/confirm` invite pages.

## Requirements

### Requirement: The invite panel

The invite panel SHALL let a user add people by email (`Common:AddManually`) or from the contact list
(`Common:ChooseFromList`), give each a user type for the portal or a role for a room, remove an invitee before sending,
and send the invitations with `Common:SendInvitation`, confirmed by `Common:UsersInvited`. It SHALL be offered only where
the user may invite: in Accounts by type, in a room when its `EditAccess` is true.

#### Scenario: Invite two people to a room

- **WHEN** a Room manager adds two accounts with Editor and sends
- **THEN** both are invited with Editor and `Common:UsersInvited` is shown

### Requirement: Checking the invitees

An address that is not a valid email SHALL be marked with `Common:EmailErrorMessage`; people already in the room or the
portal SHALL be reported with `Common:UsersAlreadyAdded` and not added twice; disabled accounts SHALL be shown as
disabled and not selectable. A search with no match SHALL say so and offer to invite the address.

#### Scenario: Already a member

- **WHEN** a Room manager adds an account that is already a member of the room
- **THEN** `Common:UsersAlreadyAdded` is shown and the account is not added again

### Requirement: Roles a type cannot hold

When a role chosen for an invitee is above what the invitee's type may hold, the client SHALL lower it to the highest
allowed role and say so (`Common:UserMaxAvailableRoleWarning`, `Common:GroupMaxAvailableRoleWarning`).

#### Scenario: Group as Room manager

- **WHEN** a group is invited to a room with Room manager
- **THEN** its role is lowered to the highest role a group may hold and the warning is shown

### Requirement: Inviting guests

Where the room allows guests, the client SHALL offer inviting an outside address as a guest (`Common:InviteAsGuest`) and
describe the invitation link accordingly; otherwise it SHALL describe it as a link for portal members only.

#### Scenario: Room that allows guests

- **WHEN** a Room manager opens the invite panel of a room that allows guests
- **THEN** the invitation link is described as open to guests

### Requirement: Invitation link of a room

The invite panel of a room SHALL let a user switch the room's invitation link on and off (`Common:InviteViaLink`), copy
it, choose the role it grants among the free roles, and open its settings, where an expiration and a limit of people who
may join are set. Switching it off SHALL revoke the link.

#### Scenario: Create

- **WHEN** a Room manager switches the invitation link on
- **THEN** a link is created and shown with its role

#### Scenario: Delete

- **WHEN** a Room manager switches the invitation link off
- **THEN** the link is revoked and no longer shown

#### Scenario: Update

- **WHEN** a Room manager changes the link's role and settings
- **THEN** the link is saved with them

### Requirement: Invitation link of the portal

In Accounts, the invite panel SHALL let a user switch on an invitation link for a user type, copy it and set its
expiration and joining limit; switching it off SHALL delete the link.

#### Scenario: Create portal link

- **WHEN** a DocSpace admin switches on the invitation link in Accounts
- **THEN** a link for the chosen type is created and shown

### Requirement: Expired or full invitation links

A link past its expiration SHALL show its date as an error with `Common:LinkSettingsExpired`; a link whose joined count
reached its limit SHALL show the count as an error with `Common:LinkSettingsUsersLimitToast`. Copying a link that expired
or is no longer available SHALL be refused with an error.

#### Scenario: Expired

- **WHEN** the invite panel shows a link whose expiration has passed
- **THEN** the date is marked as an error and its tooltip says the link expired

#### Scenario: Limit reached

- **WHEN** the number of people who joined equals the link's limit
- **THEN** the count is marked as an error and its tooltip says the limit is reached

### Requirement: Paid limits when inviting

When inviting would exceed the paid-user limit or the administrator limit of the plan, the client SHALL show the invite
quota warning, whose upgrade action stays readable in every language, and SHALL keep the roles that need a paid seat
from being chosen.

#### Scenario: Administrator limit

- **WHEN** inviting would exceed the plan's administrator limit
- **THEN** the warning dialog is shown with its upgrade action label in one piece

### Requirement: Joining through an invitation link

Opening a portal invitation link SHALL show the join page: an email step, then sign-in for an existing account or
registration for a new one, with the standalone and SaaS variants of registration. A failed step SHALL show its error; a
link over quota or expired SHALL show the matching error page.

#### Scenario: New person

- **WHEN** a new person opens an invitation link and registers
- **THEN** the account is created and the person is signed in

#### Scenario: Expired link

- **WHEN** a person opens an expired invitation link
- **THEN** the expired-link page is shown

### Requirement: Accepting an email invitation

An invitation sent by email SHALL open the page where the invited person sets their name and password and joins, in the
standalone and SaaS variants, and SHALL show the error when joining fails.

#### Scenario: Join

- **WHEN** an invited person fills the form and submits it
- **THEN** the account is activated and the person is signed in

### Requirement: Sharing a guest with another manager

When another manager wants to use someone's guest, the guest's owner SHALL get a page to approve or deny it.

#### Scenario: Approve

- **WHEN** the guest's owner opens the request and approves it
- **THEN** the guest is shared with the requesting manager
