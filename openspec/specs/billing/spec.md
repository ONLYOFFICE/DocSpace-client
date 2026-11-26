# billing Specification

## Purpose

Defines what the web client offers around paying for a portal: the Billing section of a SaaS portal (overview,
wallet, tariff plan, add-ons, usage, invoices, payment method), who of the administrators may act there, the return
from the hosted checkout, the unpaid and grace periods, the low balance bar, and the Payments page of a server
installation.

Server counterpart: `../server/openspec/specs/billing` (tariff state, payment gate, payer, checkout, wallet, top-ups,
wallet services, reports). Operations called include `getPortalTariff`, `getQuotaPaymentInformation`,
`getPaymentQuotas`, `getPaymentAccount`, `getPaymentCurrencies`, `updatePayment`, `calculateWalletPayment`,
`updateWalletPayment`, `getCustomerBalance`, `getCustomerInfo`, `topUpDeposit`, `getWalletServices`,
`getWalletService`, `changeTenantWalletServiceState`, `getAccountingServicePrices`, `createCustomerOperationsReport`,
`getCustomerOperationsReport` and, on a server installation, `uploadLicense`.

Out of scope: the storage and count limits and their bars (`quotas`); the Billing entry of the profile menu
(`app-shell`); deleting an unpaid portal (`portal-lifecycle`); the Docs Connect service itself — its tenant, trial,
settings and preview (`docs-connect`); the AI spending limits and the AI chat's limit messages (change
`ai-chat-agents-design`); the upgrade offers of the dashboard (`dashboard`).

Implementation: the Billing pages come from the `@onlyoffice/apps-ui-kit` billing module, hosted by the client's
billing wrapper, sidebar and payment-complete route; the server installation page is `packages/shared/pages/Payments`.

## Requirements

### Requirement: Who reaches Billing

On SaaS the Billing section SHALL open for the owner and DocSpace admins only; any other user, and any of its
addresses including the checkout return page, SHALL lead to the 401 page. Old addresses under the portal settings
SHALL be forwarded to the matching Billing page. On a server installation the Billing addresses SHALL lead an
administrator to the license page in the portal settings and a member to the home page, and on Community Edition the
whole section SHALL be closed.

#### Scenario: Billing address on a server installation

- **WHEN** an administrator of an Enterprise server opens a Billing address
- **THEN** the license page of the portal settings opens

#### Scenario: Room admin opens the wallet

- **WHEN** a Room admin opens the wallet address
- **THEN** the 401 page is shown

### Requirement: Billing pages

The Billing section SHALL offer Overview, Wallet, Tariff plan, Add-ons, Usage, Invoices and Payment method, fitting
desktop, tablet and phone layouts and following the dark theme.

#### Scenario: Phone

- **WHEN** an administrator opens a Billing page on a phone
- **THEN** the page fits the phone layout

### Requirement: Only the payer manages the card and the plan

Once a card is linked, only the payer SHALL top up the wallet or change the plan; other administrators SHALL see the
same pages with those actions disabled and a warning (`Common:OnlyPayerCanManageSection`) leading to the payment
method page, which SHALL name the payer with a mailto link. When the payer has left, the owner SHALL be offered the
provider's portal and other administrators SHALL NOT.

#### Scenario: Non-payer on the tariff page

- **WHEN** an administrator who is not the payer opens the tariff plan
- **THEN** the warning is shown and the plan button is disabled

### Requirement: Overview

Overview SHALL show the wallet, the plan, the month's spend and the add-ons, each card leading to its page; without
activity every card SHALL say what will appear. On the free plan it SHALL show the limits and ask for a payment
method; in the grace period it SHALL ask to top up and renew; an unlinked card SHALL be reported.

#### Scenario: Non-payer

- **WHEN** an administrator who is not the payer opens Overview
- **THEN** the same cards are shown without the wallet actions

### Requirement: Tariff plan

The tariff plan SHALL price a change of the administrators count: an increase prorated and due today, a decrease
scheduled for the period end and locking the calculator until it applies. A decrease below the assigned
administrators or the used storage SHALL be refused, a count above the plan's maximum SHALL turn into a sales
request, and a non-profit portal SHALL see its benefits without the calculator.

#### Scenario: Scheduled decrease

- **WHEN** the payer removes an administrator seat
- **THEN** the change is scheduled for the end of the period and the calculator is locked

### Requirement: Paying for a plan

An increase SHALL be charged to the wallet and, when the balance is short, SHALL turn into a top-up. The first
purchase on the free plan SHALL be open to any administrator and go through the provider's checkout; once a card is
linked the purchase SHALL be the payer's. With an inactive card the purchase SHALL go through the checkout unless the
credits cover it.

#### Scenario: Short balance

- **WHEN** the payer adds administrator seats with too little money in the wallet
- **THEN** the upgrade is offered as a wallet top-up

### Requirement: Moving a subscription to wallet billing

When a portal moves to wallet billing, the client SHALL show what the refund of the old subscription covers: nothing
due on the card when the refund covers the new plan, otherwise the rest named with its amount; confirming SHALL send
the new administrators count and close the dialog.

#### Scenario: Short refund

- **WHEN** the refund does not cover the new plan
- **THEN** the dialog names the amount left to pay by card

### Requirement: Payment methods that settle later

When the payer pays with a method whose funds arrive later, the client SHALL say the funds settle later, SHALL hide
automatic top-up, SHALL turn a purchase into a wallet top-up, SHALL close the purchase dialog as soon as the checkout
opens, and SHALL leave an add-on's activation for later.

#### Scenario: Settling top-up

- **WHEN** the payer tops up with a method that settles later
- **THEN** the top-up ends with the settlement notice

### Requirement: Wallet

The wallet SHALL show the balance, the month-to-date spend leading to Usage, automatic top-up with its thresholds
(offered only after a first top-up), and the transaction history filtered by type, period and contact, with a report
built for the filter. A top-up reported by the server SHALL refresh the balance and the history without a reload.

#### Scenario: History by contact

- **WHEN** the payer picks a contact in the history filter
- **THEN** only what that contact spent is listed

### Requirement: Topping up the wallet

The top-up dialog SHALL show the amount to pay, report a provider error and stay open on failure. The automatic
top-up dialog SHALL ask for the two thresholds, open on the current values, and keep the previous settings when
saving fails. The upcoming payments tab SHALL explain what will be charged, or say nothing is scheduled.

#### Scenario: Failed top-up

- **WHEN** the provider refuses a top-up
- **THEN** its error is shown and the dialog stays open

### Requirement: Promo credits and codes

Promo credits SHALL be added to the available credits, with an expiry warning within a week, and the spend and the
operations SHALL show the part paid with them. The Top up dialog SHALL redeem a promo code, say why a code is refused,
ask to try later after too many attempts, and without a linked card offer to link one first.

#### Scenario: Refused code

- **WHEN** the payer enters a promo code that billing refuses
- **THEN** the reason is shown under the field

### Requirement: Low balance bar

When the wallet balance runs low, DocSpace admins SHALL see a bar: the payer with a link to a simplified top-up,
others asked to contact the payer, by a mailto link when the payer has left. A top-up SHALL hide it; closed, it SHALL
stay hidden for the session and SHALL come back with the next low balance.

#### Scenario: Socket raises the bar

- **WHEN** the server reports a low balance while the client is open
- **THEN** the bar appears without a reload

### Requirement: Add-ons

Add-ons SHALL list storage, backups, AI tools, AI search and Docs Connect with their price and state; a running one
SHALL show what it costs now. Backups and AI tools SHALL switch on or off at once, AI search SHALL need AI tools on
first, AI tools off SHALL take AI search down, and storage SHALL start from choosing a size and ask before cancelling.

#### Scenario: AI search without AI tools

- **WHEN** an administrator switches AI search on while AI tools are off
- **THEN** the client asks to switch AI tools on first

### Requirement: Add-ons need a card and credits

Without a linked card, switching an add-on on or opening its page SHALL lead to the provider to link one. A nearly
empty wallet SHALL warn on the AI tools card while AI tools run, and an empty one SHALL make backups unavailable. A
switch that fails SHALL report the error and turn back off.

#### Scenario: Unlinked card

- **WHEN** an administrator switches an add-on on without a linked card
- **THEN** the provider's page opens to link a card

### Requirement: Storage add-on

The storage page SHALL offer a size from 100 GB, send a larger size than 9999 GB to the sales team, price an increase
for the rest of the period, schedule a decrease or a cancellation for the next period, refuse changes in the grace
period, and keep a deactivated plan as the previous one that can be renewed or removed.

#### Scenario: Too small

- **WHEN** the payer asks for less than 100 GB
- **THEN** the size is refused

### Requirement: Backup, AI tools and AI search pages

The backup page SHALL count the month's free and paid backups and how many the balance buys; the AI tools and AI
search pages SHALL show the month's usage, the fee and the switch. Each page SHALL list its charges, and SHALL offer
top-up to the payer only.

#### Scenario: Non-payer on the backup page

- **WHEN** an administrator who is not the payer opens the backup page
- **THEN** backups can be enabled but no top-up is offered

### Requirement: Docs Connect plan

The Docs Connect page SHALL let the payer buy a plan for a number of users, with the Dev Pack raising the minimum to
ten, more than 999 users turning into a sales request, and a short balance into a top-up. It SHALL show a paid plan's
charge, a scheduled user change or cancellation, keep a deactivated plan as the previous one, and renew a canceled\nplan with its previous size.

#### Scenario: More than 999 users

- **WHEN** the payer asks for more than 999 Docs Connect users
- **THEN** a request to the sales team is offered instead

### Requirement: Usage and invoices

Usage SHALL break the spend down by service for a chosen period, by service or by month, order a report for it, and
lead from each row to the page it is billed from. Invoices SHALL list the completed top-ups of the last four weeks
with their type and a View invoice link opening the provider's page in a new tab, filterable by type.

#### Scenario: Period without spend

- **WHEN** an administrator picks a period with no spend
- **THEN** Usage says so and offers no report

### Requirement: Returning from the checkout

After the provider's checkout the client SHALL top up the wallet and then perform the purchase it was opened for —
plan, storage, backups, AI tools, AI search or Docs Connect — step by step, and land on its page. A failed top-up
SHALL say the card is kept and skip the purchase; a failed purchase SHALL keep the top-up and lead back to the\nadd-on.

#### Scenario: Failed activation

- **WHEN** the top-up succeeds and the add-on activation fails
- **THEN** the top-up is kept and the client leads back to the add-on

### Requirement: Unpaid portal

While a SaaS portal is unpaid, administrators SHALL be sent to the tariff plan and members to the unavailable page,
asking the server only what the page needs. Billing SHALL keep only Wallet and Tariff plan, the wallet read-only even
for the payer, and other Billing pages except the return from the checkout SHALL lead back to the tariff plan; the
backup page SHALL stay reachable.

#### Scenario: Member of an unpaid portal

- **WHEN** a User opens the client of an unpaid portal
- **THEN** the portal unavailable page is shown

### Requirement: Payments on a server installation

Payments of a server installation SHALL show the Enterprise or Developer Edition license — trial, time-limited,
lifetime, grace period or expired — let an administrator upload and activate a license file and contact sales, and
on Community Edition SHALL show the upgrade offer with the enterprise features and instructions.

#### Scenario: Expired license

- **WHEN** an administrator opens Payments with an expired lifetime license
- **THEN** the expired state of the license is shown
