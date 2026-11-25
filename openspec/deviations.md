# Known deviations of the web client

The specifications in `specs/` describe the web client as it behaves today. This file keeps what was
deliberately left out of them: behaviour that looks like a client defect rather than a design decision,
places where the client and the server disagree, and places where the client and the product matrix
(`.claude/rules/access-matrix.md`, `.claude/rules/dashboard-matrix.md`) disagree. Each row names the
specification it would belong to; the evidence stays in that specification's `verification.md`.

The server keeps its own register in `../server/openspec/deviations.md`; its section "Web client vs server"
is not repeated here, only referenced from the rows below that it already covers.

Status: **OPEN**, **OPEN (product decision)** when which side is wrong is not settled, **FIXED** with the
commit, **REFUTED**, **NOT A DEFECT** for behaviour recorded so nobody files it.

Defects that bypass access, leak data or secrets, or let a caller act for another account or portal are not
listed here: they are tracked privately until a released version fixes them.

## Suspected client defects (not written into the specs)

| # | Where | What the client does | Evidence | Status |
|---|-------|----------------------|----------|--------|
| C1 | shared-links | The copy-link quick button of a file, folder or room copies its primary link without checking whether it expired; the link row and the context menu item refuse an expired link with an error. | `packages/client/src/HOCs/withQuickButtons.js:105-134` against `actions.helpers.tsx:751-754` | OPEN |
| C3 | file-operations | After an upload finishes, the progress counters are reset on a timer; an upload started inside that window loses its percent, size and uploaded count, while its files stay queued. | `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.finish.test.ts:229` (pinned as a known race) | OPEN |
| C4 | quotas | Once any bar has been closed in the browser, the two combined bars (rooms and storage near or at the limit) are shown only if they were themselves closed before, and stay hidden otherwise: their check is the opposite of every other bar's. | `packages/client/src/components/MainBar/Bar.js:292-297` against `:285-291` | OPEN |
| C5 | quotas | A type change or a status change that fails for any reason is reported as the paid users limit (`Common:QuotaPaidUserLimitError`), whatever the server answered. | `packages/client/src/components/GlobalEvents/ChangeUserTypeEvent.tsx:112-120`; `packages/client/src/components/dialogs/ChangeUserStatusDialog/index.tsx:108-120` | OPEN |
| C2 | shared-links | A link for anyone keeps the "Blocked by admin" label and the reduced actions menu while the administrator allows existing links; only copying is unaffected. | `external-sharing-share-panel.spec.ts:297-333` | NOT A DEFECT (design decision) |

## Client vs server

| # | Where | Client | Server | Status |
|---|-------|--------|--------|--------|

## Client vs product matrix (specs follow the client)

| # | Where | Matrix | Client | Status |
|---|-------|--------|--------|--------|

## Closed

| # | Where | What | Status |
|---|-------|------|--------|
