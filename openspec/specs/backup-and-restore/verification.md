# backup-and-restore — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call reaches after the `portal/…backup|restore…` → `backup/…`
> rewrite of `../buildtools/config/nginx/onlyoffice.conf:646-649`.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `bk/` = `packages/shared/pages/backup/`, `manual` = `bk/manual-backup/ManualBackup.test.tsx`, `auto` =
`bk/auto-backup/AutoBackup.test.tsx`, `restore` = `bk/restore-backup/RestoreBackup.test.tsx`, `server` =
`../server/openspec/specs/backup-and-restore/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The backup page** | | |
| Two tabs; only the manual backup while unpaid | `packages/client/src/pages/PortalSettings/categories/data-management/index.js:143-232` | CODE-ONLY |
| Paid destinations disabled while unpaid | `manual:410` | UNIT-CONFIRMED |
| Backup page reachable on an unpaid portal | `packages/client/__tests__/unpaid-portal-requests.spec.ts:220` | E2E-CONFIRMED |
| Backups allowed while unpaid | `server`, "Payment state of the portal" | SERVER-SPEC |
| **Manual backup** | | |
| Destinations, temporary storage and download, Documents, connected account, storage | `manual:199, 246, 268, 284, 293, 302, 315, 333, 351` | UNIT-CONFIRMED |
| Locked while running; disabled page; error | `manual:371, 391, 427` | UNIT-CONFIRMED |
| Cancel a running backup | `bk/manual-backup/index.tsx:508-517` | CODE-ONLY |
| Progress over the socket | `manual:581` | UNIT-CONFIRMED |
| Starting and cancelling on the server | `server`, "Starting a manual backup"; "Failed and cancelled backups" | SERVER-SPEC |
| **Paying for a backup** | | |
| Top up then copy; no copy on failure; copy despite a failed balance refresh | `manual:458, 486, 499` | UNIT-CONFIRMED |
| Plain button with enough balance, for a non-payer, without a card; non-payer blocked; payer not blocked; delayed payment | `manual:521, 527, 533, 545, 556, 562` | UNIT-CONFIRMED |
| Free allowance and paid service on the server | `server`, "Free monthly allowance and the paid backup service" | SERVER-SPEC |
| **Automatic backup** | | |
| Toggle, destinations, save creates, off deletes, cancel restores; error | `auto:225, 236, 245, 256, 269, 276, 291, 300` | UNIT-CONFIRMED |
| Period, hour and copies; tariff gate | `bk/auto-backup/index.tsx:345-414`; `bk/auto-backup/sub-components/ScheduleComponent/ScheduleComponent.tsx` | CODE-ONLY |
| Schedule on the server | `server`, "Creating the backup schedule"; "Scheduled backups require the allowance or the paid service" | SERVER-SPEC |
| **Restoring the portal** | | |
| Sources, notification and agreement checkboxes, backup list, standalone confirmation, cancel, existing flow, disabled | `restore:145, 166, 181, 192, 206, 217, 229, 259, 279, 308` | UNIT-CONFIRMED |
| `.gz` file, warning, progress page after the start | `bk/restore-backup/index.tsx:285-400`; `bk/restore-backup/sub-components/button-component/ButtonComponent.tsx:100-185` | CODE-ONLY |
| Restore on the server | `server`, "Who may restore and from what"; "Uploading an archive to restore from"; "The portal while it is being restored" | SERVER-SPEC |
| **List of backups** | | |
| Restore, delete one, delete all | `bk/restore-backup/sub-components/backup-list/index.tsx:118-200` | CODE-ONLY |
| History and deletion on the server | `server`, "Backup history"; "Deleting backups" | SERVER-SPEC |
| **Restore and encryption progress pages** | | |
| Restore progress, error, socket events | `packages/shared/pages/PreparationPortal/PreparationPortal.test.tsx:79, 99, 116, 135, 178` | UNIT-CONFIRMED |
| Encryption progress, error, socket events | `packages/shared/pages/EncryptionPortal/EncryptionPortal.test.tsx:83, 106, 113, 146, 181, 235` | UNIT-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Warning that private rooms are not in the backup | Owned by `private-rooms` | `manual:212, 220`; `bk/sub-components/PrivateRoomsBackupWarning.tsx` |
| Backup add-on pages and counters of Billing | Owned by `billing` | `packages/client/__tests__/billing-addon-pages.spec.ts:660-841` |
| Which pages lead to the restore progress page | Owned by `portal-lifecycle` | `packages/shared/routes/Route.private.tsx:269-299` |
| Rooms and Forms in the folder picker while their apps are off | Owned by `apps` | `packages/client/src/pages/PortalSettings/categories/data-management/backup/manual-backup/index.tsx:268-269` |
