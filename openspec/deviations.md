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

## Client vs server

| # | Where | Client | Server | Status |
|---|-------|--------|--------|--------|

## Client vs product matrix (specs follow the client)

| # | Where | Matrix | Client | Status |
|---|-------|--------|--------|--------|

## Closed

| # | Where | What | Status |
|---|-------|------|--------|
