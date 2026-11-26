# spaces-management — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The `/apisystem` routes of `packages/shared/api/management` are not in
> `../server/sdk/docspace-api-spec/docspace-backend.yaml` (submodule `ce37da4`); the three DocSpace operations of
> Purpose were checked there by their routes.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
management E2E paths are `packages/management/__tests__/<spec>.spec.ts`. Shorthands: `sp` = `spaces.spec.ts`, `st` =
`settings.spec.ts`, `mg/` = `packages/management/src/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **CODE-ONLY** (read from the code, no
test), **SERVER-SPEC** (the server decides it; cited from `../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Who opens the management app** | | |
| Server installation only; owner and admins only; restricted space refused; 403 otherwise | `mg/app/layout.tsx:84-110` | CODE-ONLY |
| Sign-in without a session; the root leads to Spaces | `mg/proxy.ts:58-73` | CODE-ONLY |
| Sections, Upgrade instead of Payments on Community | `mg/components/article/index.tsx:62-153` | CODE-ONLY |
| Article Settings item leads to Data backup on Community | `st:303` | E2E-CONFIRMED |
| **Connecting the domain** | | |
| Configuration state | `sp:54` | E2E-CONFIRMED |
| Domain check, validation, save and rename, opening at the new address | `mg/app/spaces/configuration/body.tsx:101-135` | CODE-ONLY |
| **Spaces of the installation** | | |
| List of spaces; change domain dialog | `sp:74, 188` | E2E-CONFIRMED |
| Current space and setup marks; row actions; quota change and switch-off | `mg/app/spaces/multiple/row-content.tsx`; `mg/app/spaces/multiple/spaces-row.tsx:73-162` | CODE-ONLY |
| **Creating a space** | | |
| Second space created and listed | `sp:96` | E2E-CONFIRMED |
| Restricted access and visit options | `mg/dialogs/create-portal/index.tsx:74-133, 200-209` | CODE-ONLY |
| **Deleting a space** | | |
| Second space deleted after the dialog | `sp:145` | E2E-CONFIRMED |
| Last space refused; set-up warning; confirmation sent to the owner | `mg/app/spaces/multiple/spaces-row.tsx:82-88`; `mg/dialogs/delete-portal/index.tsx:76-148` | CODE-ONLY |
| **Installation branding** | | |
| Branding renders; unavailable without the feature; not available under the license | `st:51, 167, 242` | E2E-CONFIRMED |
| No Branding tab on Community; branding addresses lead to Data backup | `st:285, 316` | E2E-CONFIRMED |
| **Storage encryption** | | |
| Page in the decrypted and encrypted states; unavailable without the feature | `st:126, 144, 227` | E2E-CONFIRMED |
| Notify users, confirmation, start and progress page | `mg/app/settings/encrypt-data/EncryptWarningDialog.tsx:53-105` | CODE-ONLY |
| Encryption on the server | `../server/openspec/specs/storage-and-integrations/spec.md`, "Starting storage encryption", "Reading the encryption settings", "Encryption progress" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Payments and Upgrade page content | Owned by `billing` | `payments.spec.ts`; `bonus.spec.ts:48` |
| Data backup, auto-backup and restore pages of the app | Owned by `backup-and-restore` | `st:70, 89, 108, 182, 197, 212` |
| Chunk retry of the app | Owned by `app-shell` | `chunk-retry.spec.ts` |
