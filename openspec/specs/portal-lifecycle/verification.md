# portal-lifecycle — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; login
E2E paths omit `packages/login/__tests__/`, client E2E paths are given in full. Shorthands: `route` =
`packages/shared/routes/Route.private.tsx`, `deleteData/` =
`packages/client/src/pages/PortalSettings/categories/delete-data/`, `server` =
`../server/openspec/specs/portal-lifecycle/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, mostly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **First-run wizard** | | |
| Render, success, error; with a license; on a cloud image | `wizard.spec.ts:48, 65, 98, 123, 166, 192, 211` | E2E-CONFIRMED |
| Terms, license and instance id checked before sending; portal opened | `packages/login/src/app/(root)/wizard/page.client.tsx:253-316` | CODE-ONLY |
| Wizard on the server | `server`, "First-run wizard of a server installation" | SERVER-SPEC |
| **Renaming the portal** | | |
| Empty, length, characters; confirmation; new address | `packages/client/src/pages/PortalSettings/categories/common/Customization/portal-renaming.js:213-298` | CODE-ONLY |
| Page closed where renaming is not allowed | `route:375-380` | CODE-ONLY |
| Name rules on the server | `server`, "Rules a portal name has to pass"; "Renaming a portal" | SERVER-SPEC |
| **Asking for deactivation or deletion** | | |
| Deletion page reachable for the Owner of an unpaid portal | `packages/client/__tests__/unpaid-portal-requests.spec.ts:233` | E2E-CONFIRMED |
| Owner only; email sent; disabled until the email is confirmed; dialog with a subscription | `route:238-247`; `deleteData/portalDeletion.js`; `deleteData/portalDeactivation.js` | CODE-ONLY |
| Owner only on the server | `../server/openspec/specs/user-type-permissions/spec.md`, "Portal settings" | SERVER-SPEC |
| **Changing the portal owner** | | |
| Dialog, pick, confirmation email | `packages/client/src/components/dialogs/ChangePortalOwnerDialog/`; `packages/client/src/store/contacts/UsersStore.ts:752-755` | CODE-ONLY |
| Owner change on the server | `server`, "Asking for the owner to be changed"; "Confirming the owner change" | SERVER-SPEC |
| **Confirmation pages of the portal** | | |
| Suspend: render, deactivate, cancel, after deactivation | `portalSuspend.spec.ts:64, 74, 101, 115` | E2E-CONFIRMED |
| Continue: render, reactivate, cancel | `portalContinue.spec.ts:60, 70, 95` | E2E-CONFIRMED |
| Remove: render, delete, cancel | `portalRemove.spec.ts:60, 70, 97` | E2E-CONFIRMED |
| Owner change: render, save, cancel | `portalOwnerChange.spec.ts:64, 74, 89` | E2E-CONFIRMED |
| Unblock | `packages/login/src/app/(root)/confirm/PortalUnblock/` | CODE-ONLY |
| **Deactivated or blocked portal** | | |
| Unavailable and blocked messages | `packages/shared/components/errors/Errors.test.tsx:157, 162` | UNIT-CONFIRMED |
| Every page and a signed-out visitor sent there | `route:86-105, 211-217, 345-352` | CODE-ONLY |
| Statuses on the server | `server`, "Status values of a portal" | SERVER-SPEC |
| **Restore and encryption in progress** | | |
| Restore and encryption progress pages | `route:269-299` | CODE-ONLY |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The unpaid portal: tariff page for admins, unavailable page for members | Owned by `billing` | `packages/client/__tests__/unpaid-portal-requests.spec.ts:194-246` |
| Wrong portal name and unreachable portal | Owned by `app-shell` | `packages/login/__tests__/portalNotFound.spec.ts`; `packages/client/__tests__/portal-not-found.spec.ts` |
| Starting a restore | Owned by `backup-and-restore` | `packages/client/src/components/dialogs/PreparationPortalDialog/` |
