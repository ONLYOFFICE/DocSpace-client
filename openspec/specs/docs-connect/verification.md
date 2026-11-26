# docs-connect — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/docs-connect` uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `dc` = `docs-connect.spec.ts`, `dcs` =
`docs-connect-settings.spec.ts`, `dcb` = `docs-connect-buy-plan.spec.ts`, `page/` =
`packages/client/src/pages/PortalSettings/categories/developer-tools/DocsConnect/`, `server` =
`../server/openspec/specs/storage-and-integrations/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Who gets Docs Connect** | | |
| User kept out by address and told why; admin gets the page | `dev-tools-access.spec.ts:208, 223, 240` | E2E-CONFIRMED |
| Server installation: no surface, no request, address refused | `dc:587` | E2E-CONFIRMED |
| SaaS only, administrators only | `packages/shared/utils/devToolsAccess.ts:88-109` | CODE-ONLY |
| Tenant operations on the server | `server`, "Access to Docs Connect tenant operations" | SERVER-SPEC |
| **Promo and trial** | | |
| Promo without an instance; trial started and panel shown; canceled subscription promo | `dc:129, 152, 184` | E2E-CONFIRMED |
| Reload after the trial starts | `page/PromoPage.tsx` | CODE-ONLY |
| Trial on the server | `server`, "Docs Connect trial" | SERVER-SPEC |
| **Tabs of the instance** | | |
| Settings by deep link | `dcs:120` | E2E-CONFIRMED |
| Locked tabs lead to Statistics | `dc:291, 530` | E2E-CONFIRMED |
| Expired trial and deactivated subscription lock; active one does not | `page/__tests__/utils.locked.test.ts:62-87` | UNIT-CONFIRMED |
| **Statistics** | | |
| Trial active, ending soon, expired; paid, with Dev Pack; scheduled changes and their cancellation; scheduled cancellation; deactivated and removal | `dc:207, 247, 268, 311, 335, 358, 397, 439, 465, 490` | E2E-CONFIRMED |
| Error screen when the instance or the wallet cannot be read | `dc:551, 568` | E2E-CONFIRMED |
| Usage for a period and the usage report | `page/TenantPanel/Statistics.tsx` | CODE-ONLY |
| Quota report on the server | `server`, "Docs Connect quota report" | SERVER-SPEC |
| **Buying and changing a plan** | | |
| Defaults and order summary; Dev Pack total; buy with credits; insufficient funds; prorated upgrade; scheduled reduction; scheduled Dev Pack disable, also with a user change; server-priced Dev Pack upgrade; top-up dialog without a card | `dcb:149, 171, 191, 220, 242, 290, 318, 354, 385, 431` | E2E-CONFIRMED |
| Price of a deactivated plan follows its previous Dev Pack | `page/__tests__/utils.price.test.ts:66-117` | UNIT-CONFIRMED |
| Dev Pack on the server | `server`, "Moving to Docs Connect Dev Pack" | SERVER-SPEC |
| **Paying for a plan safely** | | |
| Top-up once on retries, only the missing part, none while a deposit is pending; no plan change after a failed top-up; delayed payment; canceled checkout; translated declines | `packages/client/src/store/__tests__/DocsConnectStore.buyPlan.test.ts:204-525` | UNIT-CONFIRMED |
| **Settings of the instance** | | |
| Deep link, save, empty secret, cancel, IP rule with failed deletion rolled back, secret copied, demo code | `dcs:120, 134, 169, 181, 193, 243, 256` | E2E-CONFIRMED |
| JWT header, WOPI, anonymous access, rebranding, file size limits, repeated rule, reset | `page/TenantPanel/Settings.tsx`; `page/TenantPanel/sub-components/AddRuleDialog.tsx`; `page/TenantPanel/sub-components/ResetRulesDialog.tsx` | CODE-ONLY |
| Configuration on the server | `server`, "Updating the Docs Connect configuration" | SERVER-SPEC |
| **Preview of the editors** | | |
| Fallback when unreachable; hint when the token cannot be signed | `dcs:284, 303` | E2E-CONFIRMED |
| Desktop only | `page/TenantPanel/Preview.tsx` | CODE-ONLY |
| **Using the instance for the portal** | | |
| Ready banner with Connect editors, confirmation, promo otherwise | `packages/client/src/pages/PortalSettings/categories/integration/DocumentService/index.js:254-410`; `page/TenantPanel/sub-components/ApplyToPortalDialog.tsx` | CODE-ONLY |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Docs Connect add-on page and card of Billing; checkout return for Docs Connect | Owned by `billing` | `billing-docs-connect-plan.spec.ts`; `docs-connect-billing.spec.ts`; `billing-payment-complete.spec.ts:417, 461, 588, 614` |
| The license label inside the instance's editors | Decided by the instance, not the client | — |
| What disabling the Dev Pack sends to the server | The request zeroes only the Dev Pack line by design; its effect on the plan is the server's | `packages/shared/api/docs-connect/index.ts:505-547` |
