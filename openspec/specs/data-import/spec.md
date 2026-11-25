# data-import Specification

## Purpose

Defines the data import wizard of the web client: choosing the source (Google Workspace, Nextcloud, ONLYOFFICE
Workspace), uploading its backup, choosing the users, completing their emails, setting their types, choosing what to
import, following the import and finishing it.

Server counterpart: `../server/openspec/specs/data-import`. Operations called: `listMigrations`,
`uploadAndInitializeMigration`, `getMigrationStatus`, `startMigration`, `cancelMigration`, `clearMigration`,
`getMigrationLogs`, `finishMigration`; the backup is uploaded in chunks to `migrationFileUpload.ashx`, which the API
description does not list.

Out of scope: who reaches the settings (`user-type-permissions`); the quotas the import runs against (`quotas`); the
accounts and groups once they exist (`people-and-groups`).

Implementation: `packages/client/src/pages/PortalSettings/categories/data-import` and the import accounts store.

## Requirements

### Requirement: Choosing the source

Data import SHALL offer Google Workspace, Nextcloud and ONLYOFFICE Workspace, each opening its own wizard by click or
by Enter or Space on its Import link.

#### Scenario: Keyboard

- **WHEN** an administrator focuses the Import link of a source and presses Enter
- **THEN** the import from that source starts

### Requirement: Uploading the backup

The first step SHALL take a backup file of the extensions the source accepts and upload it to the server in parts
with its progress, which Cancel SHALL stop after a confirmation. When the backup is read, the step SHALL say so, offer
the unsupported files for download, and report a backup without users (`Settings:NoUsersInBackup`); a backup larger
than the free storage SHALL raise the storage quota warning.

#### Scenario: Cancelling the upload

- **WHEN** an administrator cancels the upload and confirms
- **THEN** the upload stops and the import is cancelled

### Requirement: Steps of the wizard

After the upload the wizard SHALL go through choosing the users, then — for Nextcloud — adding the emails users lack,
setting their types, choosing what to import, the import itself and its result. Only users with an email SHALL be
selectable, and users who already exist in the portal SHALL be marked and left unchecked by default.

#### Scenario: Nextcloud users without email

- **WHEN** a Nextcloud backup holds users without an email
- **THEN** the wizard asks for their emails before setting the types

### Requirement: User types of the imported users

The types step SHALL let an administrator set each user's type, and SHALL say when the chosen administrators exceed
the paid seats of the tariff (`DataImportAdminLimitExceeded`).

#### Scenario: Too many administrators

- **WHEN** an administrator assigns more DocSpace or Room admins than the tariff allows
- **THEN** the admin limit warning is shown

### Requirement: What to import

The import step SHALL always import the users and SHALL let the administrator include the groups, the personal files,
the shared files and folders and, for ONLYOFFICE Workspace, the common files, which go to a separate Common room that
only DocSpace admins can reach.

#### Scenario: Without groups

- **WHEN** an administrator clears Groups and starts the import
- **THEN** the import runs without groups

### Requirement: Finishing the import

When the import ends the wizard SHALL show how many users were imported, report errors with a link to download the
log, and finish with Finish, sending the invitation letters only when `Settings:SendInviteLetter` is checked.

#### Scenario: Finish with letters

- **WHEN** an administrator checks Send invite letter and presses Finish
- **THEN** the import is finished and the imported users get the invitation letters
