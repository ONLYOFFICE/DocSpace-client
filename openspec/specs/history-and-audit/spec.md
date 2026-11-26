# history-and-audit Specification

## Purpose

Defines how the web client shows what happened in the portal: the History tab of the info panel for files, folders
and rooms with its day filter and the export of a room's history, the Login history and Audit trail pages of the
security settings, and the reports built from them.

Server counterpart: `../server/openspec/specs/history-and-audit`. Operations called: `getFileHistory`,
`getFolderHistory`, `createReportFolderHistory`, `getReportFolderHistory`, `getLastLoginEvents`,
`getLastAuditEvents`, `createLoginHistoryReport`, `getLoginHistoryReport`, `createAuditTrailReport`,
`getAuditTrailReport`, `getAuditSettings`.

Out of scope: whether the info panel offers a History tab (`info-panel`); who reaches the security settings
(`portal-settings`); the version history of a file (`file-operations`, `editor-integration`); the user's own active
sessions (`profile`); the encryption key events of private rooms (`private-rooms/*`); the delivery history of
webhooks (`webhooks-and-api-keys`); which actions are recorded and how long the logs are kept, which the server
decides.

Implementation: the History view and its toolbar in the info panel, the `login-history` and `audit-trail` pages of
the security settings, and the document builder report store.

## Requirements

### Requirement: History of an entry

The History tab SHALL list the actions on the selected file, folder or room, newest first, grouped by day with
`Common:Today`, `Common:Yesterday`, the weekday within a week and the date otherwise, load older actions on scroll,
show an empty state when there are none, and re-read the list when the server reports new history of that entry.

#### Scenario: No actions

- **WHEN** a user opens the History tab of an entry without recorded actions
- **THEN** the empty history state is shown

### Requirement: Day filter of a room's history

On the History tab of a room that is not on a third-party storage, a day picker SHALL limit the list to the actions
up to the chosen day, from the room's creation day to today, and scroll the list back to the top. Clearing the day
SHALL bring the whole history back, and reopening the tab SHALL clear it. The picker SHALL NOT appear on other tabs.

#### Scenario: Picking a day

- **WHEN** a user picks a day in the history of a room
- **THEN** the history is requested up to that day

#### Scenario: Third-party room

- **WHEN** a user opens the History tab of a room on a third-party storage
- **THEN** neither the day picker nor the export is shown

### Requirement: Exporting a room's history

When the room allows exporting its history, the History tab SHALL offer an export of the whole history or of a date
range, build the report on the server, open the report file when it is ready, offer a link to it when the browser
blocks the new tab, and show the error the server returns. Without that right the export SHALL NOT be offered.

#### Scenario: Date range

- **WHEN** a user exports a room's history for a date range
- **THEN** the picked range is sent with the report request

#### Scenario: Export forbidden

- **WHEN** a user whose room security forbids the export opens the History tab
- **THEN** no export is offered

### Requirement: Login history and audit trail pages

The Login history page SHALL list the latest sign-in events with the user, the date and the action, and the Audit
trail page the latest events with the user, the date, the location and the action, or `Settings:NoEventsHereYet`
when there are none. Where the portal's plan does not include the audit, both pages SHALL carry the paid badge and
SHALL NOT build a report.

#### Scenario: Plan without the audit

- **WHEN** an administrator of a portal whose plan lacks the audit opens the Audit trail page
- **THEN** the paid badge is shown and the report button is disabled

### Requirement: Login and audit reports

Each page SHALL build its report in XLSX or CSV, the choice kept for the session, and say that the report is saved in
Files. Only one report of a kind SHALL be built at a time; a finished report SHALL be opened, unless the user left the
page, when it SHALL be announced instead; a failed one SHALL be reported and SHALL be possible to build again.

#### Scenario: Report format

- **WHEN** an administrator builds the audit trail report in CSV
- **THEN** the report is requested in the CSV format

#### Scenario: Leaving the page

- **WHEN** a report finishes after the administrator left its page
- **THEN** the report is announced and not opened
