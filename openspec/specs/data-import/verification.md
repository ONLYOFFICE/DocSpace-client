# data-import — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `di/` = `packages/client/src/pages/PortalSettings/categories/data-import/`, `server` =
`../server/openspec/specs/data-import/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Choosing the source** | | |
| Import started by Enter or Space; other keys ignored | `di/components/__tests__/Providers.test.tsx:70, 78` | UNIT-CONFIRMED |
| Three sources, click on an item | `di/components/Providers.tsx:84-146` | CODE-ONLY |
| Who may import | `server`, "Who may use data import" | SERVER-SPEC |
| **Uploading the backup** | | |
| Accepted extensions, chunked upload, cancel with confirmation, unsupported files, no users, quota warning | `di/components/SelectFileStep.tsx:100-460`; `packages/client/src/store/ImportAccountsStore.ts:434-446` | CODE-ONLY |
| Archive rules and the quota check on the server | `server`, "Archive requirements per source"; "Backup size against the storage quota"; "Cancelling a parse" | SERVER-SPEC |
| **Steps of the wizard** | | |
| Steps per source; email step for Nextcloud | `di/NextcloudWorkspace/Stepper/index.tsx:51-166`; `di/OnlyofficeWorkspace/Stepper/index.tsx:52-160`; `di/GoogleWorkspace/Stepper/index.tsx` | CODE-ONLY |
| Users classified on the server | `server`, "Classifying the users found" | SERVER-SPEC |
| **User types of the imported users** | | |
| Types per user; admin limit warning | `di/components/SelectUsersTypeStep/index.tsx`; `di/sub-components/AdminsInfoBlock.tsx:57-80` | CODE-ONLY |
| Paid-user quota on the server | `server`, "Failures and the paid-user quota"; "Importing a user as DocSpace admin" | SERVER-SPEC |
| **What to import** | | |
| Users always; groups, personal, shared and common files | `di/components/ImportStep.tsx:125-275` | CODE-ONLY |
| What each option imports on the server | `server`, "Importing groups"; "Importing personal files and their shares"; "Importing common and project files of a Workspace portal" | SERVER-SPEC |
| **Finishing the import** | | |
| Imported count, errors and log download, invitation letters, Finish | `di/components/ImportCompleteStep.tsx:76-171` | CODE-ONLY |
| Finish and log on the server | `server`, "Finishing the import"; "Downloading the log" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Processing step progress and its error toast | Covered by the server's progress requirement; nothing client-specific beyond the progress | `di/components/ImportProcessingStep.tsx` |
