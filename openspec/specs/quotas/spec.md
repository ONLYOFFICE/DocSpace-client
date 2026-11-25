# quotas Specification

## Purpose

Defines how the web client shows and changes the storage and count limits of a portal: the Storage management page
(used space, the sections that take it, recalculation, the top lists), the default quota of users and rooms, the
portal-wide quota of a server installation, the storage quota of accounts in Contacts, the storage column of the
Rooms list, the bars that announce a limit, and the message for the paid users limit.

Server counterpart: `../server/openspec/specs/quotas`. Operations called: `getPortalInformation`, `getPortalUsersCount`, `getUserQuotaSettings`,
`saveRoomQuotaSettings`, `setTenantQuotaSettings`, `updateUserQuota`, `resetUsersQuota`, `getFilesUsedSpace`,
`getQuotaPaymentInformation`; the default user quota is saved with `POST settings/userquotasettings` and the
recalculation runs through `settings/recalculatequota` and `settings/checkrecalculatequota`, which the API
description hides.

Out of scope: the quota of a single room and the quota warning when restoring rooms (`room-types`); quota errors of
uploads (`file-operations`) and of the editor (`editor-integration`); the quota warning and error pages of
invitations (`invitations`); buying more storage, the tariff and the wallet bar (`billing`); who reaches the settings
at all (`user-type-permissions`).

Implementation: the storage management settings, the quota form, the storage quota and change quota dialogs, the
quota bars of the main bar, the storage quota control of the Contacts and Rooms lists, and the current quota store of
`packages/shared`.

## Requirements

### Requirement: Storage management page

Storage management (`Settings:StorageManagement`) SHALL show when the portal was created, the number of active users,
the data region on SaaS, the storage used (and the total where there is one), the space taken by each section, and
Recalculate (`Recalculate`) with the time of the last update. While a recalculation runs the button SHALL stay busy
and the page SHALL refresh once it ends.

#### Scenario: Recalculation

- **WHEN** an administrator presses Recalculate
- **THEN** the button stays busy until the server reports the recalculation finished, and the figures are reloaded

### Requirement: Quotas and statistics are a paid feature

Where the tariff has no statistics feature, the Quotas and Statistics parts of Storage management SHALL carry the paid
badge, the quota switches SHALL be disabled and the top lists SHALL NOT be shown.

#### Scenario: Free plan

- **WHEN** an administrator of a portal without the statistics feature opens Storage management
- **THEN** the quota switches are disabled and marked as paid

### Requirement: Default quota of users and rooms

Storage management SHALL offer a switch for the default quota of users (`DefineQuotaPerUser`) and of rooms
(`DefineQuotaPerRoom`). Turning one on SHALL open the size form, saving SHALL apply the size, and turning it off SHALL
remove the default. While the Rooms application is off the room quota and the rooms top list SHALL NOT be offered.

#### Scenario: Turning the user quota off

- **WHEN** an administrator turns off a default user quota that is set
- **THEN** the default is removed and the figures are reloaded

### Requirement: Top lists of Storage management

With the statistics feature the page SHALL list the five rooms and the five users that take the most space, each with
its used space and limit, and offer Show more (`Common:ShowMore`) when there are more, which SHALL open the Rooms or
Contacts list sorted by used space.

#### Scenario: Show more users

- **WHEN** an administrator presses Show more under the top users
- **THEN** the Contacts list opens sorted by used space

### Requirement: Portal-wide quota of a server installation

On a server installation without a portal quota, Storage management SHALL offer `Common:ManageStorageQuota`; with one
set it SHALL show the total and a menu to change the quota or turn it off, each in a dialog that SHALL require a size
before saving a change.

#### Scenario: Turning the portal quota off

- **WHEN** an administrator picks Disable quota for the portal and confirms
- **THEN** the portal quota is removed and the total is no longer shown

### Requirement: The quota size form

The size form SHALL start empty for a quota that is not set, keep a typed zero visible without allowing it to be
saved, offer an unlimited option that disables the size, keep Save disabled while nothing changed, save on Enter
where it has buttons, and go back to the initial values on Cancel.

#### Scenario: Zero

- **WHEN** a user types 0 into the size form
- **THEN** the zero stays in the field and Save stays disabled

### Requirement: Storage quota of accounts

With the statistics feature, the owner and DocSpace admins SHALL see each account's used space and limit in Contacts
and its info panel, sort by storage, and change the quota of one or several accounts, set it back to the default
(`Common:SetToDefault`) for a custom quota, or turn it off (`Common:DisableQuota`). Guests SHALL get none of this, and
the quota filter SHALL be offered only while a default user quota is set.

#### Scenario: Back to the default

- **WHEN** an administrator sets a custom quota of an account back to the default
- **THEN** `Common:StorageQuotaReset` is shown and the account's limit is the default

#### Scenario: Room admin

- **WHEN** a Room admin opens Contacts
- **THEN** no storage column and no quota actions are offered

### Requirement: Storage column of the Rooms list

With the statistics feature, the owner and DocSpace admins SHALL see each room's used space and limit in the Rooms
list, sort rooms by storage and, while a default room quota is set, filter them by quota; other users SHALL NOT see the\ncolumn.

#### Scenario: User

- **WHEN** a User opens the Rooms list
- **THEN** no storage column is shown

### Requirement: Limit bars

Near or at a limit the client SHALL show one bar at a time: the room count and the paid users count to DocSpace and
Room admins, the storage of the tariff, of the portal or of the user's own quota to every type but Guest. A DocSpace
admin's bar SHALL lead to the tariff page or, for a portal or personal quota, to Storage management; others SHALL be
asked to contact an administrator. A closed bar SHALL stay closed in that browser.

#### Scenario: Storage almost used up

- **WHEN** a DocSpace admin signs in while the tariff storage is nearly used up
- **THEN** a bar says so and leads to the tariff page

### Requirement: Paid users limit

When changing users' type or turning users on fails, the client SHALL report the paid users limit
(`Common:QuotaPaidUserLimitError`) with a link to Billing (`Common:PaymentsTitle` on a server installation), except for
a Room admin and on Community Edition.

#### Scenario: Type change over the limit

- **WHEN** a DocSpace admin raises a User to Room admin while every paid seat is taken
- **THEN** the paid users limit message is shown with a link to Billing
