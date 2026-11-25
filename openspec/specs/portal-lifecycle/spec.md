# portal-lifecycle Specification

## Purpose

Defines what the web client offers across a portal's life: the first-run wizard of a server installation, renaming the
portal, asking for it to be deactivated or deleted, changing its owner, the confirmation pages those requests lead to,
and what users see while the portal is deactivated, blocked, being restored or being encrypted.

Server counterpart: `../server/openspec/specs/portal-lifecycle` (registration, name rules, statuses, the confirmation
links, suspension, deletion, owner change, blocking). Operations called: `completeWizard`, `uploadLicense`,
`getIsLicenseRequired`, `getPortalHostname`, `getTimeZones`, `sendSuspendInstructions`, `suspendPortal`,
`continuePortal`, `sendDeleteInstructions`, `deletePortal`, `unblockPortal`, `sendOwnerChangeInstructions`,
`updatePortalOwner`; renaming calls `PUT portal/portalrename`, which the API description does not list.

Out of scope: payments and the tariff of a portal (`billing`); backup and restore themselves (`backup-and-restore`); a
wrong portal name or an unreachable portal (`app-shell`); the spaces of a multi-portal installation
(`spaces-management`).

Implementation: the wizard and the portal confirmation pages of `packages/login`, the Delete data and portal renaming
settings of the client, the change portal owner and delete portal dialogs, the unavailable, preparation and encryption
pages, and the private route of `packages/shared`.

## Requirements

### Requirement: First-run wizard

A server installation that has not finished its setup SHALL open the wizard: the owner's email and password (with a
generator), the portal's language and time zone, the domain, a license file when the installation requires one, the
instance id on a cloud image, and agreement to the license terms. Missing or wrong values SHALL be marked; on success the
portal SHALL open.

#### Scenario: License required

- **WHEN** the wizard of an installation that requires a license is submitted without a license file
- **THEN** the license field is marked and the setup is not completed

#### Scenario: Setup completed

- **WHEN** the owner fills the wizard correctly and agrees to the terms
- **THEN** the setup completes and the portal opens

### Requirement: Renaming the portal

Where the portal may be renamed, the settings SHALL let an administrator enter a new name, refuse an empty one, one
outside the allowed length (`Common:PortalNameLength`) or one with forbidden characters (`Common:PortalNameIncorrect`),
ask for confirmation, and then move the browser to the portal's new address. Where renaming is not allowed the page
SHALL NOT open.

#### Scenario: Too short

- **WHEN** an administrator enters a name shorter than the allowed minimum
- **THEN** the length error is shown and the name is not saved

### Requirement: Asking for deactivation or deletion

Delete data SHALL offer the Owner, and nobody else, deactivating and deleting the portal. Either request SHALL send a
confirmation email to the Owner and say so (`PortalDeletionEmailSended`); while the Owner's email is not confirmed the
button SHALL be disabled with an offer to send the activation email again. With a paid subscription, deleting SHALL ask
in a dialog first.

#### Scenario: DocSpace admin and deletion

- **WHEN** a DocSpace admin opens the portal deletion address
- **THEN** the client navigates to the portal root

### Requirement: Changing the portal owner

The Owner SHALL be able to pick a new owner among the portal's people in a dialog that lists what the owner may do, and
send the change for confirmation by email (`Settings:ConfirmEmailSended`).

#### Scenario: Owner change requested

- **WHEN** the Owner picks a user and confirms the change
- **THEN** a confirmation email is sent and the dialog says so

### Requirement: Confirmation pages of the portal

The links of the lifecycle emails SHALL open pages that confirm or cancel the step: deactivate (`Common:Deactivate`),
continue (`Reactivate`), delete (`Common:Delete`), change the owner (`Common:SaveButton`) and unblock (`Unblock`). A
confirmed step SHALL say what happened and move on after a short wait; Cancel SHALL leave without changing the portal.

#### Scenario: Deactivate

- **WHEN** the Owner confirms deactivation from the emailed link
- **THEN** the portal is deactivated and the page says so

#### Scenario: Cancel deletion

- **WHEN** the Owner presses Cancel on the deletion page
- **THEN** the portal is not deleted

### Requirement: Deactivated or blocked portal

While the portal is deactivated or blocked, every page SHALL lead to the unavailable page, which says whether the portal
is deactivated or blocked; a signed-out visitor SHALL be sent there instead of to the login page.

#### Scenario: Blocked portal

- **WHEN** a user opens any page of a blocked portal
- **THEN** the unavailable page says the portal is blocked

### Requirement: Restore and encryption in progress

While the portal is being restored from a backup, every page SHALL lead to the restore progress page; while its storage
is being encrypted, to the encryption progress page.

#### Scenario: Restore running

- **WHEN** a user opens the Rooms section while a restore runs
- **THEN** the restore progress page is shown
