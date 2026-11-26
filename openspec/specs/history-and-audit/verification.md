# history-and-audit — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses (`packages/shared/api/rooms` `getHistory`,
> `packages/shared/api/files` `startFolderLogReport` and its status call, the audit calls of
> `packages/shared/api/settings`).

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `rh` = `rooms-history.spec.ts`, `hist/` =
`packages/client/src/pages/Home/InfoPanel/Body/views/History/`, `sec/` =
`packages/client/src/pages/PortalSettings/categories/security/`, `dbr` =
`packages/client/src/store/__tests__/DocumentBuilderReportStore.test.ts`, `server` =
`../server/openspec/specs/history-and-audit/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **History of an entry** | | |
| Grouping by day, loading on scroll, empty state | `hist/index.tsx:66-180` | CODE-ONLY |
| Re-read on the server's history event | `hist/hooks/useSocket.ts` | CODE-ONLY |
| Endpoints, paging and who may read | `server`, "Entry history endpoints and the shape of an entry", "Who may read an entry history" | SERVER-SPEC |
| **Day filter of a room's history** | | |
| Third-party room without the toolbar; toolbar on the History tab only | `rh:196, 232` | E2E-CONFIRMED |
| Requested up to the day; creation day allowed; cleared day brings all back; cleared on reopening; scroll to top; no future days | `rh:249, 285, 321, 349, 381, 410` | E2E-CONFIRMED |
| Date filter on the server | `server`, "Entry history paging and date filter" | SERVER-SPEC |
| **Exporting a room's history** | | |
| Date range fields only for the range scope; range sent; file opened; link when the popup is blocked; polling; server error shown | `rh:428, 471, 511, 551, 593, 636` | E2E-CONFIRMED |
| Hidden when the room security forbids it, kept when it allows it | `rh:662, 681` | E2E-CONFIRMED |
| Busy button while the report is built | `hist/Toolbar/sub-components/ExportMenu/__tests__/ExportMenu.test.tsx:54, 63` | UNIT-CONFIRMED |
| Who may export on the server | `server`, "Who may export a folder history", "Folder history report" | SERVER-SPEC |
| **Login history and audit trail pages** | | |
| Columns, empty state of the audit trail, paid badge and disabled report without the audit feature | `sec/login-history/index.js`; `sec/audit-trail/index.js:98-131`; `sec/sub-components/HistoryMainContent.js:139-237` | CODE-ONLY |
| What the logs hold | `server`, "What the audit trail records", "Login actions that are recorded", "Reading the audit trail", "Reading the login history" | SERVER-SPEC |
| **Login and audit reports** | | |
| Format sent for each report, server default when none | `packages/client/src/store/__tests__/SettingsSetupStore.auditReport.test.ts:98, 113, 128` | UNIT-CONFIRMED |
| Opened when ready; one build per kind; announced after the page was left; error reported; rebuilt after a failure | `dbr:110, 186, 214, 278, 332` | UNIT-CONFIRMED |
| Format kept for the session; save location told | `sec/sub-components/HistoryMainContent.js:50-62, 239-241` | CODE-ONLY |
| Reports on the server | `server`, "Audit trail and login history reports" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Storage period of the logs | The settings block is commented out in the page; only the server rule stands | `sec/sub-components/HistoryMainContent.js:147`; `server`, "Retention settings of the two logs" |
| Encryption key events and locked identities in the history | Owned by `private-rooms/*` | `hist/__tests__/HistoryBlockContent.test.tsx`; `hist/__tests__/ItemList.test.tsx` |
| Active connections of other users, logout everywhere, syslog, suspicious-login letters | No client surface outside the profile's own sessions | `server` |
