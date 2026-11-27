# people-and-groups Specification

## Purpose

Defines the Accounts (Contacts) section of the web client: the Members, Groups and Guests tabs and the view of one
group, their columns, sorting and filters, the actions on an account — changing its name, email, password or type,
disabling, enabling, deleting it, reassigning its data, repeating its invitation, sharing a guest — and creating,
editing and deleting groups, plus what the info panel shows for an account or a group.

Server counterpart: `../server/openspec/specs/people-and-groups` (profiles, statuses, email changes, data reassignment
and removal, groups). Who may do each action is stated in `user-type-permissions`. Operations called:
`searchUsersByExtendedFilter`, `getProfileByUserId`, `updateMember`, `sendEmailChangeInstructions`, `sendUserPassword`,
`updateUserStatus`, `updateUserType`, `startUserTypeUpdate`, `getUserTypeUpdateProgress`, `terminateUserTypeUpdate`,
`necessaryReassign`, `startReassign`, `getReassignProgress`, `terminateReassign`, `deleteMember`, `removeUsers`,
`deleteGuests`, `resendUserInvites`, `getGuestSharingLink`, `getGroups`, `addGroup`, `getGroup`, `updateGroup`,
`deleteGroup`, `addMembersTo`, `removeMembersFrom`, `getGroupByUserId`.

Out of scope: which type may do what (`user-type-permissions`); the invite panel and invitation links (`invitations`);
one's own profile page (`profile`); storage quotas of accounts (`quotas`); keyboard shortcuts of the lists
(`keyboard-and-hotkeys`); the AI spending limit (change `ai-chat-agents-design`).

Implementation: `packages/client/src/pages/Home/Section/ContactsBody`, the contacts stores, the Accounts filter, the
Users and Groups views of the info panel, and the account and group dialogs.

## Requirements

### Requirement: Tabs of Accounts

Accounts SHALL offer the Members (`Common:Members`), Groups (`Common:Groups`) and Guests (`Common:Guests`) tabs.
Opening a group SHALL show its members under the group's name, with a way back to the group list.

#### Scenario: Open a group

- **WHEN** a DocSpace admin opens a group from the Groups tab
- **THEN** the group's members are listed and the header shows the group's name

### Requirement: Columns of the account lists

The members table SHALL show, besides the name, the type, groups, email and, where storage is shown, the storage
column; the guests table SHALL show the email and, for the Owner and DocSpace admins, the inviter and the registration
date. Columns SHALL be turned on and off from the table settings, and lists SHALL load more accounts as they scroll.

#### Scenario: Guests table

- **WHEN** the Owner opens the Guests tab in the table view
- **THEN** the Inviter and Registration date columns are offered

### Requirement: Sorting the lists

Members SHALL sort by name, type, group, email and, where storage is shown, storage; guests by name, email, inviter and
registration date, a Room admin's guests without the inviter; groups by title, number of members and head of group.

#### Scenario: Sort guests

- **WHEN** the Owner sorts the Guests tab by registration date
- **THEN** the guests are listed in that order

### Requirement: Filtering the lists

The members filter SHALL offer group (without a group, other, a chosen group), status (active, pending, disabled),
type, paid or free account on SaaS, login type (SSO, LDAP, standard) and, with a default quota, storage. The guests
filter SHALL offer inviter (me, other, a chosen person), status and login type. A Room admin SHALL NOT be offered the
inviter or the disabled status. The groups filter SHALL offer member (me, other, a chosen person) and a head-of-group
search.

#### Scenario: Pick a group in the filter

- **WHEN** a DocSpace admin chooses Group, then Other, and picks a group from the groups selector
- **THEN** the filter shows that group as its value and the list shows its members

### Requirement: Changing an account's type

Choosing another type SHALL ask for confirmation. Lowering an account to User or Guest SHALL first ask the server
whether its data must be passed to someone else and, if so, run the type change as a reassignment with progress.
Choosing the type the account already has SHALL do nothing.

#### Scenario: Room admin to User with rooms

- **WHEN** a DocSpace admin lowers a Room admin who owns rooms to User
- **THEN** the dialog offers to pass the rooms to another account and shows the progress of the change

### Requirement: Disabling and enabling accounts

Disabling or enabling one or several accounts SHALL ask for confirmation in a dialog worded for users or for guests,
and SHALL confirm the change with a toast.

#### Scenario: Disable a user

- **WHEN** the Owner disables an active User and confirms
- **THEN** the account becomes disabled and a toast confirms it

### Requirement: Deleting accounts

Deleting one or several disabled accounts SHALL ask for confirmation and say that it cannot be undone; for a single
account whose data must be passed on, the dialog SHALL offer to reassign the data first. Removing a guest from a Room
admin's list SHALL ask for its own confirmation (`RemoveGuest`).

#### Scenario: Delete a disabled user

- **WHEN** the Owner deletes a disabled User and confirms
- **THEN** the account is deleted and a toast confirms it

### Requirement: Reassigning data

The data reassignment dialog SHALL let the user pick the new owner among active DocSpace admins and Room admins other
than the account itself, start the transfer, follow its progress, abort it and start it again, and, when opened from
the account's menu, delete the account once the transfer finishes. For a User or a Guest only rooms are transferred.

#### Scenario: Reassign and delete

- **WHEN** a DocSpace admin reassigns a disabled Room admin's data with deletion ticked
- **THEN** the progress is shown and the account is deleted when the transfer completes

### Requirement: Editing another account

For another account that is neither SSO nor LDAP, the client SHALL let those entitled send an email change to a new
address (validated before sending) and password change instructions to its email; its name SHALL NOT be changed from
Accounts, where only one's own row offers `PeopleTranslations:NameChangeButton`.

#### Scenario: Change another account's email

- **WHEN** the Owner enters a new valid email for a User
- **THEN** the activation instructions are sent to the new address

### Requirement: Repeating invitations

A pending account SHALL offer `LblInviteAgain`; several selected pending accounts SHALL be invited again after a
confirmation, and the client SHALL confirm the sending with a toast.

#### Scenario: Invite again

- **WHEN** a DocSpace admin chooses Invite again for a pending account
- **THEN** the invitation is resent and a toast names the email

### Requirement: Sharing a guest and an account's rooms

For a guest, the client SHALL copy a link that lets another manager add the guest to their own list. For an account,
it SHALL open the Rooms section, in a new tab, filtered to the rooms the account is a member of.

#### Scenario: Share a guest

- **WHEN** a Room admin chooses to share their guest
- **THEN** a link is copied and a toast confirms it

### Requirement: Creating and editing groups

Creating a group SHALL require a name and a head of group, and offer adding members; the member selector SHALL NOT
offer guests. Saving an edited group SHALL be possible only after a change, with a name and a head or members.
Deleting one or several groups SHALL ask for confirmation.

#### Scenario: Create a group

- **WHEN** a DocSpace admin enters a name and picks a head of group
- **THEN** Create becomes available and the group is created with its members

#### Scenario: Delete a group

- **WHEN** a DocSpace admin deletes a group and confirms
- **THEN** the group is removed from the list

### Requirement: Info panel of an account or a group

The info panel SHALL show for an account its type (changeable there when allowed), email, status, groups, inviter,
registration date, storage and, on SaaS, paid or free account, with SSO and LDAP marks; for a group its head and
number of members, with the LDAP mark for a synchronized group.

#### Scenario: Account in the panel

- **WHEN** a DocSpace admin selects a User and opens the info panel
- **THEN** the panel shows the User's type, email, status and groups

### Requirement: Changing the type on a phone

On a phone the type menu of an account SHALL open as a sheet in which every type carries its description and fits
without scrolling, and opening the menu SHALL keep the account's row in place.

#### Scenario: Type sheet

- **WHEN** the Owner opens the change type menu of an account on a phone
- **THEN** each type is shown with its description and the sheet does not scroll
