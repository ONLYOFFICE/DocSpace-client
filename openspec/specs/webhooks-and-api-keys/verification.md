# webhooks-and-api-keys — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `dt/` =
`packages/client/src/pages/PortalSettings/categories/developer-tools/`, `wh/` = `dt/Webhooks/`, `access` =
`packages/shared/utils/devToolsAccess.ts`, `socket` = `packages/client/src/store/__tests__/WebhooksStore.socket.test.ts`,
`server` = `../server/openspec/specs/webhooks-and-api-keys/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Who gets Developer Tools** | | |
| Guest shown the section, refused with a toast, kept out by address; documentation still a link | `dev-tools-access.spec.ts:123, 147, 193, 252` | E2E-CONFIRMED |
| Who opens and who is offered the section | `access:36-77` | CODE-ONLY |
| Offered by user type and the limit, on the dashboard | `dashboard-appearance.spec.ts:544` | E2E-CONFIRMED |
| The rule on the server | `server`, "Developer Tools access rule"; "Reading and changing the Developer Tools restriction" | SERVER-SPEC |
| **The Developer Tools overview** | | |
| Cards and links; Docs Connect only on SaaS for administrators | `dt/Main/index.tsx:73-190`; `packages/client/src/components/DeveloperToolsSidebar/index.tsx:80-170`; `access:88-109` | CODE-ONLY |
| User kept out of Docs Connect by address and told why; admin gets it | `dev-tools-access.spec.ts:208, 223, 240` | E2E-CONFIRMED |
| **Creating and editing a webhook** | | |
| Name, URL, secret, SSL, events and target IDs; list state, settings, delete | `wh/sub-components/WebhookDialog.js`; `wh/sub-components/TriggersForm.tsx`; `wh/sub-components/SecretKeyInput.js`; `wh/sub-components/SSLVerification.js`; `wh/sub-components/DeleteWebhookDialog.js` | CODE-ONLY |
| Webhooks on the server | `server`, "Creating a webhook configuration"; "Validation of the target URL"; "Switching a webhook on or off"; "Removing a webhook configuration" | SERVER-SPEC |
| **Delivery history** | | |
| Filter by date, time and status; select and retry with the count | `wh/WebhookHistory/sub-components/FilterDialog/`; `wh/WebhookHistory/sub-components/HistoryHeader.js:133-148` | CODE-ONLY |
| Journal and retries on the server | `server`, "Delivery journal"; "Retrying a delivery" | SERVER-SPEC |
| **Event details** | | |
| Status, request, response, copy, raw payload, too large, retry | `wh/WebhookEventDetails/`; `wh/WebhookEventDetails/sub-components/DetailsNavigationHeader.js:64-94` | CODE-ONLY |
| **Live webhook lists** | | |
| One re-read per burst; delete without a request; other subscription ignored; filter; failed re-read keeps the list; details re-read | `socket:145, 163, 187, 195, 205, 218, 233, 248, 261, 321, 430, 483, 639` | UNIT-CONFIRMED |
| **API keys** | | |
| List, create with permissions and lifetime, shown once, toggle, edit, delete, expired and deactivated marks | `dt/ApiKeys/index.tsx`; `dt/ApiKeys/sub-components/CreateApiKeyDialog/index.tsx`; `dt/ApiKeys/sub-components/useContextOptions.ts:44-66`; `dt/ApiKeys/sub-components/ApiKeysLifetimeIcon/index.tsx` | CODE-ONLY |
| API keys on the server | `server`, "Creating an API key"; "Permission catalogue of API keys"; "Listing API keys"; "Updating an API key"; "Deleting an API key"; "Expiry of an API key" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The Developer Tools access setting | Owned by `access-settings` | `packages/client/src/pages/PortalSettings/categories/security/access-portal/devToolsAccess.tsx` |
