# billing — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/portal` uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. The Billing pages themselves are code of the separate ui-kit
repository, so a claim without a client test is left out of the spec rather than cited from there. Shorthands:
`access` = `billing-access.spec.ts`, `addons` = `billing-addons.spec.ts`, `pages` = `billing-addon-pages.spec.ts`,
`plan` = `tariff-plan-states.spec.ts`, `wallet` = `billing-wallet.spec.ts`, `bonus` = `billing-wallet-bonus.spec.ts`,
`complete` = `billing-payment-complete.spec.ts`, `server` = `../server/openspec/specs/billing/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Who reaches Billing** | | |
| Member to 401 from the tariff page and the checkout return; Room admin from the wallet; admin opens the tariff page | `access:53, 65, 77, 89` | E2E-CONFIRMED |
| Old payments addresses forwarded on SaaS, kept on a server installation | `packages/client/src/routes/portalSettings.js:66-83` | CODE-ONLY |
| SaaS billing left alone; admin kept in, member bounced to 401 | `packages/shared/routes/Route.private.payments.test.tsx:135, 145, 178` | UNIT-CONFIRMED |
| Server installation: admin and owner to the license page, member home, wallet closed, no loop; Community closed | `packages/shared/routes/Route.private.payments.test.tsx:85, 91, 100, 109, 115, 125` | UNIT-CONFIRMED |
| **Billing pages** | | |
| Every page on phone and tablet, and in the dark theme | `billing-layouts.spec.ts:291, 327` | E2E-CONFIRMED |
| **Only the payer manages the card and the plan** | | |
| Non-payer warned with disabled top-up and plan button; owner non-payer alike; Learn more to the payment method page | `access:117, 138, 154, 168, 183` | E2E-CONFIRMED |
| Payer acts without a warning; payer named with mailto; departed payer: provider portal for the owner only | `access:202, 223, 244, 266, 290` | E2E-CONFIRMED |
| Tariff plan by payer, owner and admin, with and without a payer | `payments.spec.ts:441-740` | E2E-CONFIRMED |
| Who the payer is | `server`, "Who is the payer" | SERVER-SPEC |
| **Overview** | | |
| Cards for payer and non-payer; empty states; free plan; grace period; unlinked card; links; top-up | `billing-overview.spec.ts:177, 220, 248, 263, 285, 334, 349, 371` | E2E-CONFIRMED |
| **Tariff plan** | | |
| Prorated increase; scheduled decrease; locked calculator; order summary; downgrade confirmation | `plan:115, 208, 232, 259, 352` | E2E-CONFIRMED |
| Decrease refused by assigned admins or used storage; non-profit; sales request above the maximum | `plan:472, 513, 967, 986` | E2E-CONFIRMED |
| **Paying for a plan** | | |
| Short balance becomes a top-up; inactive card to checkout or wallet | `plan:148, 554, 585` | E2E-CONFIRMED |
| First purchase open to any admin through the checkout; payer-only once a card is linked | `plan:613, 646, 762` | E2E-CONFIRMED |
| Checkout on the server | `server`, "Buying a plan through the hosted checkout"; "Changing the subscription quantity" | SERVER-SPEC |
| **Moving a subscription to wallet billing** | | |
| Refund covers the plan; short refund named; confirm sends the count | `plan:847, 890, 926` | E2E-CONFIRMED |
| **Payment methods that settle later** | | |
| Wallet notice and no auto top-up; top-up dialog warning; settlement notice | `wallet:220, 619, 648` | E2E-CONFIRMED |
| Purchases become top-ups; dialog closes when the checkout opens | `plan:167, 313, 680, 715, 831`; `billing-storage-plan.spec.ts:201`; `billing-docs-connect-plan.spec.ts:240, 264, 295` | E2E-CONFIRMED |
| Transfer flow on return; activation left for later | `complete:680, 733` | E2E-CONFIRMED |
| **Wallet** | | |
| No auto top-up before a first top-up; thresholds; running top-up | `wallet:199, 249, 271` | E2E-CONFIRMED |
| History, AI token usage, empty history, type, dates, contact, keyboard, Escape | `wallet:292, 311, 331, 345, 368, 396, 426, 475, 522` | E2E-CONFIRMED |
| Report follows the filter; socket refresh; spend links to Usage | `wallet:807, 841, 877` | E2E-CONFIRMED |
| Movements and reports on the server | `server`, "Wallet movements, usage and reports" | SERVER-SPEC |
| **Topping up the wallet** | | |
| Amount, provider error, auto top-up dialog, values kept on failure | `wallet:606, 676, 713, 755, 778` | E2E-CONFIRMED |
| Upcoming payments, nothing scheduled, direct address | `wallet:544, 581, 597` | E2E-CONFIRMED |
| Top-up and automatic top-up on the server | `server`, "Wallet top-up"; "Automatic top-up settings" | SERVER-SPEC |
| **Promo credits and codes** | | |
| Credits added, expiry flag, no expiry line, spend split, unchanged without promo | `bonus:183, 213, 236, 257, 290` | E2E-CONFIRMED |
| Redeem, refusal reason, too many attempts, link a card first, unconfirmed code, footer, operation split | `bonus:306, 367, 396, 418, 451, 475, 493` | E2E-CONFIRMED |
| Promo codes on the server | `server`, "Redeeming a promo code"; "Bonus balance" | SERVER-SPEC |
| **Low balance bar** | | |
| Payer link to the simplified top-up; non-payer and departed payer; socket raises, top-up hides | `wallet-low-balance.spec.ts:125, 150, 173, 200, 232` | E2E-CONFIRMED |
| DocSpace admins only; closed for the session, back with the next low balance | `packages/client/src/components/MainBar/Bar.js:145-153, 384-407` | CODE-ONLY |
| Low balance watch on the server | `server`, "Automatic top-up and low-balance watch" | SERVER-SPEC |
| **Add-ons** | | |
| List with prices; running add-ons; backups and AI on at once; AI search rules; storage from a size; switching off | `addons:84, 103, 137, 154, 174, 199, 211, 260, 344, 362, 374, 390` | E2E-CONFIRMED |
| Wallet services on the server | `server`, "Wallet services switched on per portal"; "Buying wallet services" | SERVER-SPEC |
| **Add-ons need a card and credits** | | |
| Unlinked card leads to the provider | `addons:287, 307, 319`; `pages:614, 629` | E2E-CONFIRMED |
| AI warning and no backups on a short wallet; failed switch turns back | `addons:118, 413, 436, 456` | E2E-CONFIRMED |
| **Storage add-on** | | |
| Buy, running subscription, top up and buy, non-payer short of credits, deactivated, scheduled changes | `pages:332, 352, 383, 443, 476, 490, 532, 548, 574` | E2E-CONFIRMED |
| Upgrade priced; downgrade scheduled; 100 GB minimum; sales above 9999 GB; cancellation; grace period; deactivated plan | `billing-storage-plan.spec.ts:152, 240, 285, 327, 340, 384, 422, 450, 477` | E2E-CONFIRMED |
| Deactivated storage warning on the tariff page | `pages:1341, 1356, 1377` | E2E-CONFIRMED |
| **Backup, AI tools and AI search pages** | | |
| Backup counts, enabling, balance, empty wallet, top-up, report, failure, non-payer, free plan | `pages:660, 683, 703, 725, 749, 770, 778, 808, 826, 841` | E2E-CONFIRMED |
| AI tools and AI search usage, switches, warnings, non-payer | `pages:876, 897, 917, 936, 960, 971, 998, 1011, 1044, 1064, 1076` | E2E-CONFIRMED |
| Charges listed per page | `pages:1393, 1418, 1445, 1470, 1510, 1535` | E2E-CONFIRMED |
| **Docs Connect plan** | | |
| Top up and buy; non-payer; paid, deactivated, canceled, scheduled change and cancellation | `pages:1120, 1144, 1174, 1190, 1205, 1224, 1251, 1273, 1298` | E2E-CONFIRMED |
| Sales above 999; Dev Pack minimum; unchanged edit; renewed canceled plan; deactivated paid again; checkout error | `billing-docs-connect-plan.spec.ts:130, 169, 194, 216, 337, 363` | E2E-CONFIRMED |
| Docs Connect card in Add-ons: get started, trial, expired trial, cancel dialog, paid page, canceled page, promo | `docs-connect-billing.spec.ts:108, 133, 149, 166, 187, 207, 226` | E2E-CONFIRMED |
| **Usage and invoices** | | |
| Spend by service, empty period, periods, reload, by month, report, single service, rows to pages | `billing-usage.spec.ts:137, 159, 176, 206, 225, 244, 272, 293, 307` | E2E-CONFIRMED |
| Top-ups of four weeks, type filter, nothing matches, View invoice, empty states, folded filter | `billing-invoices.spec.ts:152, 187, 217, 247, 264, 282, 304` | E2E-CONFIRMED |
| Top-ups and invoices on the server | `server`, "Wallet top-ups and their invoices" | SERVER-SPEC |
| **Returning from the checkout** | | |
| Top-up then purchase for every product; card saved first; failures; amount and currency fallbacks; no details | `complete:157, 198, 233, 250, 270, 304, 341, 388, 417, 461, 485, 510, 534, 562, 588, 614, 637, 653, 668` | E2E-CONFIRMED |
| **Unpaid portal** | | |
| Admin to the tariff page; wallet and backup reachable; owner deletion; member to unavailable; only allowed requests | `unpaid-portal-requests.spec.ts:194, 207, 220, 233, 246` | E2E-CONFIRMED |
| Sidebar of two pages; read-only wallet; hidden pages back to the tariff page | `access:317, 350, 374` | E2E-CONFIRMED |
| Not-paid admin finishes the checkout return; other pages lead to the tariff plan | `packages/shared/routes/Route.private.payments.test.tsx:157, 168` | UNIT-CONFIRMED |
| Grace period: payer pays, non-payer warned; unlinked or expired card banner; payment method page | `access:388, 412, 434, 466, 498, 515, 541` | E2E-CONFIRMED |
| Payment gate on the server | `server`, "Payment gate while the portal is not paid"; "Tariff state of a portal" | SERVER-SPEC |
| **Payments on a server installation** | | |
| Enterprise and Developer license states; Community Edition | `payments.spec.ts:113-406` | E2E-CONFIRMED |
| Trial and enterprise views, license upload and activation, sales contact | `packages/shared/pages/Payments/Standalone/Standalone.test.tsx:67-141` | UNIT-CONFIRMED |
| Upgrade page of Community Edition | `packages/shared/pages/Payments/Bonus/Bonus.test.tsx:17, 29, 44, 66` | UNIT-CONFIRMED |
| Single tariff of a self-hosted installation | `server`, "Single tariff of a self-hosted installation" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The Docs Connect service: tenant, trial, statistics, settings, preview, its own plan panel | Owned by `docs-connect` | `docs-connect.spec.ts`; `docs-connect-settings.spec.ts`; `docs-connect-buy-plan.spec.ts` |
| AI spending limit reached in the chat | Owned by the change `ai-chat-agents-design` | `ai-chat-service-limit.spec.ts` |
| No AI request on a portal with AI switched off | Owned by the change `ai-chat-agents-design` | `ai-services-disabled.spec.ts:133, 157` |
| Billing entry of the profile menu | Owned by `app-shell` | `access:577, 591` |
| Upgrade path dialog of the dashboard | Owned by `dashboard` | `packages/shared/dialogs/upgrade-path-dialog/UpgradePathDialog.test.tsx` |
| Admin limit warning when inviting | Owned by `invitations` | `invite-quota-warning-dialog.spec.ts:141` |
