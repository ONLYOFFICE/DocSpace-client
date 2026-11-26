# spaces-management Specification

## Purpose

Defines the management app of a server installation: who may open it and its sections, connecting the installation's
domain and creating, opening, limiting and deleting spaces, the installation-wide branding, the storage encryption,
and how Community Edition narrows the app.

Server counterpart: the multi-portal API of the installation (`/apisystem`: settings, check domain, portal register,
get, remove, rename), which the backend OpenAPI contract does not describe, and of the DocSpace API
`setTenantQuotaSettings`, `getStorageEncryptionSettings` and `startStorageEncryption`. The server side of storage
encryption is in `../server/openspec/specs/storage-and-integrations`.

Out of scope: the license page and the Community upgrade page the app shows (`billing`, "Payments on a server
installation"); the backup, auto-backup and restore pages it hosts (`backup-and-restore`); the branding of one portal
in its own settings (`branding-and-licensing`); the Spaces entry of the portal's own menu (`app-shell`); deleting one's
own portal from its settings (`portal-lifecycle`); the chunk retry shared with the client (`app-shell`).

Implementation: `packages/management` (Next.js), its spaces store, dialogs and settings pages, the shared
ChangeStorageQuotaDialog and `packages/shared/api/management`.

## Requirements

### Requirement: Who opens the management app

The management app SHALL open only on a server installation, for its owner and DocSpace admins, and only on a space
whose access is not restricted; anyone else, and every caller on SaaS, SHALL get the 403 page. Without a session it
SHALL lead to the sign-in page. Its sections SHALL be Spaces, Settings and Payments, with Upgrade in place of Payments
on Community Edition.

#### Scenario: User of the installation

- **WHEN** a User opens the management app
- **THEN** the 403 page is shown

### Requirement: Connecting the domain

Until the installation has a domain of its own, Spaces SHALL ask for the domain and the first space's name, validate
both, and, where the installation checks domains, refuse one that does not resolve (`Management:DomainNotFound`);
connecting SHALL save the domain, rename the space and open it at its new address.

#### Scenario: Unknown domain

- **WHEN** an administrator connects a domain the domain check cannot find
- **THEN** `Management:DomainNotFound` is shown and nothing is saved

### Requirement: Spaces of the installation

With a domain connected, Spaces SHALL list the spaces with their statistics, mark the current one and a space whose
setup is not completed, show the domain with a way to change it, and offer for each space to open it in a new tab and,
once set up, its settings and its storage quota, which SHALL be possible to change or turn off.

#### Scenario: Space without completed setup

- **WHEN** a space has not completed its setup
- **THEN** its row offers Open and Delete but neither its settings nor its quota

### Requirement: Creating a space

Creating a space SHALL take its name, optionally restrict access to it and optionally visit it at once; the new space
SHALL be listed after creation, or opened when visiting was chosen.

#### Scenario: Second space

- **WHEN** an administrator creates a second space
- **THEN** the list shows two spaces

### Requirement: Deleting a space

The last space SHALL NOT be deleted (`Management:DeleteWarning`). Deleting a space without completed setup SHALL remove
it at once (`Management:PortalDeleted`); deleting a set-up space SHALL warn first and, where the server asks the owner
to confirm, SHALL say a confirmation was sent to the owner's e-mail.

#### Scenario: Only space

- **WHEN** an administrator deletes the only space
- **THEN** `Management:DeleteWarning` is shown and nothing is deleted

### Requirement: Installation branding

Outside Community Edition, Settings SHALL open on Branding, with white label, brand name, company info and additional
resources applied to the installation, shown unavailable without the feature in the license. On Community Edition
there SHALL be no Branding tab, and Settings and every branding address SHALL lead to Data backup.

#### Scenario: Community Edition

- **WHEN** an administrator of a Community installation opens a branding address
- **THEN** Data backup opens and no Branding tab is shown

### Requirement: Storage encryption

The Storage tab SHALL describe the encryption of the installation's storage with its warning, say when the storage is
encrypted, let the administrator choose to notify users, and start the encryption or the decryption after a
confirmation, leading to the encryption progress page.

#### Scenario: Encrypted storage

- **WHEN** an administrator opens the Storage tab of an encrypted installation
- **THEN** the storage is reported as encrypted and decryption is offered
