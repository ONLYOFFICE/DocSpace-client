# backup-and-restore Specification

## Purpose

Defines what the web client offers an administrator to back up and restore the portal: the manual backup and where it
is written, paying for a backup on SaaS, the automatic backup schedule, the restore with its sources, list of backups
and confirmations, and the restore and storage encryption progress pages.

Server counterpart: `../server/openspec/specs/backup-and-restore`. Operations called: `startBackup`, `cancelBackup`,
`getBackupProgress`, `getBackupSchedule`, `createBackupSchedule`, `deleteBackupSchedule`, `getBackupHistory`,
`deleteBackup`, `deleteBackupHistory`, `startBackupRestore`, `getRestoreProgress`, `getAllBackupStorages`,
`topUpDeposit`. The client sends them under `portal/`, which the proxy rewrites to `backup/`; it also asks
`portal/enablerestore` and `portal/enableAutoBackup` and uploads a local archive to `backupFileUpload.ashx`, none of
which the API description lists.

Out of scope: which pages lead to the restore progress page while a restore runs (`portal-lifecycle`); the backup
add-on of Billing and its counters (`billing`); connecting the third-party account a backup is written to
(`storage-and-integrations`); the backup warning about private rooms (`private-rooms`); who reaches the settings
(`user-type-permissions`).

Implementation: `packages/shared/pages/backup`, `packages/shared/pages/PreparationPortal`,
`packages/shared/pages/EncryptionPortal`, and the data management settings of the client.

## Requirements

### Requirement: The backup page

Backup SHALL offer the tabs Data backup and Automatic backup. While the portal is unpaid it SHALL show only the manual
backup, with only the temporary storage available.

#### Scenario: Unpaid portal

- **WHEN** an administrator opens Backup on an unpaid portal
- **THEN** only the manual backup is shown and its paid destinations are disabled

### Requirement: Manual backup

The manual backup SHALL write a copy to the temporary storage, offering it for download (`Common:DownloadCopy`) when
ready, to a folder in Documents, to a folder of a connected third-party account, or to a third-party storage (Amazon
S3, Google Cloud Storage, Rackspace, Selectel) with its settings. While a backup runs the options SHALL be locked, its
progress shown, and it SHALL be possible to cancel it.

#### Scenario: Temporary storage

- **WHEN** an administrator creates a backup in the temporary storage and it finishes
- **THEN** a download button for the copy is shown

#### Scenario: Backup running

- **WHEN** a backup is in progress
- **THEN** the destinations and actions are disabled until it ends

### Requirement: Paying for a backup

On SaaS, once the month's free backups are used up, a backup SHALL be paid from the wallet. With a short balance the
payer with a linked card SHALL be offered `Common:TopUpAndMakeCopy`, which tops up first and creates no copy when the
top-up fails; without a card the top-up dialog SHALL open; another administrator SHALL be blocked with an explanation;
a payment method that settles later SHALL lead to the wallet top-up.

#### Scenario: Non-payer short of credits

- **WHEN** an administrator who is not the payer makes a paid backup with too little in the wallet
- **THEN** the copy is blocked and the reason is explained

### Requirement: Automatic backup

Where the tariff includes it, Automatic backup SHALL let an administrator switch the schedule on, pick the
destination (Documents, a connected account or a third-party storage), the period — every day, week or month at an
hour — and the number of copies kept, and save it. Switching it off and saving SHALL delete the schedule; Cancel SHALL
go back to the saved schedule.

#### Scenario: Turning the schedule off

- **WHEN** an administrator switches automatic backup off and saves
- **THEN** the backup schedule is deleted

### Requirement: Restoring the portal

Where the tariff includes it, Restore SHALL take a backup from a local `.gz` file, Documents, a connected account, a
third-party storage or the list of backups, offer to notify the users, and warn that the portal will be replaced. On
SaaS Restore SHALL stay disabled until the user agreement is checked; on a server installation it SHALL ask in a
confirmation dialog that needs an acknowledgement. A started restore SHALL open the restore progress page.

#### Scenario: Server installation

- **WHEN** an administrator of a server installation presses Restore
- **THEN** a confirmation dialog opens and its Restore stays disabled until the acknowledgement is checked

### Requirement: List of backups

The backup list SHALL show the stored backups and let an administrator restore one, delete one, or delete them all.

#### Scenario: Deleting a backup

- **WHEN** an administrator deletes a backup from the list
- **THEN** the backup is removed from the list

### Requirement: Restore and encryption progress pages

While the portal is being restored or its storage encrypted, the progress page SHALL show the progress updated by the
server's events, and an error when the operation fails.

#### Scenario: Restore fails

- **WHEN** the restore reports an error
- **THEN** the progress page shows the error instead of the progress
