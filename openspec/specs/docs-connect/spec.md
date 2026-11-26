# docs-connect Specification

## Purpose

Defines the Docs Connect page of Developer Tools in the web client: who gets it, the promo and trial start, the tenant
panel with its Statistics, Settings and Preview tabs, buying and changing a Docs Connect plan from that page, and
switching the portal's own editors to the Docs Connect instance.

Server counterpart: `../server/openspec/specs/storage-and-integrations` ("Access to Docs Connect tenant operations",
"Docs Connect trial", "Moving to Docs Connect Dev Pack", "Reading the Docs Connect tenant", "Updating the Docs Connect
configuration", "Docs Connect quota report") and `billing` for the plan charges. Operations called:
`startDocsCloudTrial`, `getTenant`, `getTenantInfo`, `getTenantConfig`, `updateTenantConfig`,
`createTenantQuotaReport`, `getTenantQuotaReport`, `calculateDevPack`, `switchToDevPack`, `getWalletServices`,
`getPortalTariff`, `getCustomerBalance`, `getQuotaPaymentInformation`, `calculateWalletPayment`,
`updateWalletPayment`, `checkDocServiceUrl`.

Out of scope: the Docs Connect card and page of Billing's add-ons and the return from the checkout (`billing`); who
reaches Developer Tools (`webhooks-and-api-keys`); the Document Server address itself (`files-settings`); the editors
the instance serves, including the license label shown inside them, which the instance decides.

Implementation: the DocsConnect page of `packages/client/src/pages/PortalSettings/categories/developer-tools`, the
Docs Connect store, `packages/shared/api/docs-connect` and `packages/shared/utils/devToolsAccess.ts`.

## Requirements

### Requirement: Who gets Docs Connect

Docs Connect SHALL exist on SaaS only and open for the owner and DocSpace admins; other users SHALL be told why it
does not open and kept out by its address. On a server installation no Docs Connect surface SHALL be shown, nothing
SHALL be asked about it, and its address SHALL be refused.

#### Scenario: Server installation

- **WHEN** an administrator of a server installation opens the Docs Connect address
- **THEN** the address is refused and no Docs Connect request is made

### Requirement: Promo and trial

Without an instance the page SHALL describe the service and offer a free trial; starting it SHALL create the instance
and show its panel, reloading the page so that the new instance may be framed. After a canceled subscription the page
SHALL offer the service again.

#### Scenario: Starting the trial

- **WHEN** an administrator starts the free trial
- **THEN** the instance is created and its panel is shown

### Requirement: Tabs of the instance

The instance panel SHALL offer Statistics, Settings and Preview, each with its own address that keeps the open tab.
An expired trial or a deactivated subscription SHALL lock the tabs and lead to Statistics.

#### Scenario: Expired trial

- **WHEN** an administrator opens the Settings address of an instance whose trial expired
- **THEN** the tabs are locked and Statistics is shown

### Requirement: Statistics

Statistics SHALL show the trial with its days left, ending soon or expired; the subscription — paid, with the Dev Pack,
a scheduled change of users or of the Dev Pack, a scheduled cancellation, or deactivated with its removal — and let a
scheduled change be canceled. It SHALL show editor and viewer usage for a period and build a usage report, and show
an error screen when the instance or the wallet cannot be read.

#### Scenario: Canceling a scheduled change

- **WHEN** an administrator cancels a scheduled reduction of users
- **THEN** the scheduled change is removed and the current plan is shown

### Requirement: Buying and changing a plan

The plan panel SHALL take the number of users and the optional Dev Pack, show the order summary, buy the plan when
the credits cover it and otherwise top up first, the top-up refused to anyone but the payer once a card is linked. An
increase SHALL be prorated; a reduction or disabling the Dev Pack SHALL be scheduled for the period end; switching to
the Dev Pack SHALL be priced by the server.

#### Scenario: Insufficient credits

- **WHEN** an administrator who is not the payer buys a plan the wallet does not cover
- **THEN** the insufficient funds state is shown and the purchase is not made

### Requirement: Paying for a plan safely

A retried purchase SHALL top up the wallet only by what is still missing and not again while a deposit is on its way;
a failed top-up SHALL change no plan; a method that settles later SHALL close the panel at once; a canceled checkout
SHALL keep the panel open; a declined purchase, cancellation or Dev Pack switch SHALL be reported in the user's
language.

#### Scenario: Retry after a failed switch

- **WHEN** the Dev Pack switch fails after the top-up and the administrator retries
- **THEN** the wallet is not topped up a second time

### Requirement: Settings of the instance

The Settings tab SHALL let an administrator change the general settings — the secret key, to copy, the JWT header,
WOPI, anonymous access, rebranding and file size limits — and the access rules allowing or denying addresses, refusing
a repeated rule and offering a reset; it SHALL disable Save while the secret is empty, restore the saved values on
Cancel, keep a rule that failed to delete, and show demo code to copy.

#### Scenario: Empty secret

- **WHEN** an administrator clears the secret key
- **THEN** Save is disabled

### Requirement: Preview of the editors

The Preview tab SHALL open the instance's editors on a desktop, show a fallback when the instance cannot be reached,
and a configuration hint when the preview cannot be signed.

#### Scenario: Instance unreachable

- **WHEN** the instance does not answer while the Preview tab opens
- **THEN** the fallback is shown instead of the editors

### Requirement: Using the instance for the portal

Where Docs Connect is available, the Document Server page SHALL offer an administrator to switch the portal's editors
to the instance after a confirmation while the instance exists and the portal does not use it yet, and SHALL show a
promo of the service otherwise.

#### Scenario: Switching editors

- **WHEN** an administrator confirms switching the portal's editors to Docs Connect
- **THEN** the portal's Document Server address points at the instance
