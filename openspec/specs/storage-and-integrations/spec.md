# storage-and-integrations Specification

## Purpose

Defines how the web client connects third-party storage accounts: the services offered when a room is created on a
third-party storage or a backup is written to a connected account, which of them still need activation, the
connection dialog (OAuth or login and password, with a server address where the service needs one), reconnecting,
and disconnecting an account.

Server counterpart: `../server/openspec/specs/storage-and-integrations` (storage services, connecting, rejected
credentials, server address, re-authentication, disconnecting, backup storage account, OAuth consent). Operations
called: `getCapabilities`, `getThirdPartyAccounts`, `getAllProviders`, `saveThirdParty`, `deleteThirdParty`,
`getBackupThirdPartyAccount`, `saveThirdPartyBackup`.

Out of scope: the room created on a third-party storage (`room-types`); the backup itself and its third-party storages
(`backup-and-restore`); the keys an administrator enters for a service (`access-settings`, "Third-party services");
the storage encryption of an installation, which the management app offers (`spaces-management`); the data storage
and CDN of an installation, which no client page offers.

Implementation: the connect and delete third-party dialogs and the direct third-party connection component of
`packages/shared`, the third-party store, and the third-party storage picker of the create room dialog.

## Requirements

### Requirement: Services offered for a connection

The storage pickers SHALL list the services the portal offers, the activated ones first. A service whose keys are not
set SHALL be marked `Common:ActivationRequired`: for an administrator choosing it SHALL open the third-party services
settings in a new tab, for anyone else it SHALL be disabled with the hint `Common:EnableThirdPartyIntegration`.

#### Scenario: User and an inactive service

- **WHEN** a Room admin opens the storage picker of a new room and a service is not activated
- **THEN** the service is disabled with the activation hint

### Requirement: Connecting an account

Connecting an account SHALL open the provider's sign-in in a new window for an OAuth service and SHALL otherwise ask
for a login and a password, plus the server address where the service needs one; an empty required field SHALL be
marked (`Common:RequiredField`). A successful connection SHALL say so (`Common:SuccessfulConnectionOfAThirdParty`), and
a refused one SHALL report the server's error.

#### Scenario: WebDAV without an address

- **WHEN** a user connects a service that needs a server address and leaves the address empty
- **THEN** the address is marked as required and nothing is connected

### Requirement: Account for backups

The backup pages SHALL let an administrator pick a service, connect it if it is not connected, choose a folder of the
connected account, and from the account's menu reconnect or disconnect it.

#### Scenario: Not connected

- **WHEN** an administrator picks a service that is not connected for a backup
- **THEN** a Connect button is offered instead of the folder picker

### Requirement: Disconnecting an account

Disconnecting an account SHALL ask for confirmation (`Common:DisconnectCloudTitle`); afterwards the client SHALL report
`Common:SuccessDeleteThirdParty`, reload the folder when the user was inside it, and forget the account as the backup
account when it was one.

#### Scenario: Backup account

- **WHEN** an administrator disconnects the account the backups were written to
- **THEN** the backup page no longer shows a connected account
