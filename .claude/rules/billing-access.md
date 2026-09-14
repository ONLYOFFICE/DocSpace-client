---
paths:
  - "packages/client/src/pages/PortalSettings/categories/payments/**"
  - "packages/client/src/components/BillingSidebar/**"
  - "packages/client/src/components/MainBar/**"
  - "packages/shared/routes/Route.private.tsx"
  - "packages/shared/store/CurrentTariffStatusStore.ts"
  - "libs/ui-kit/billing/**"
  - "packages/client/__tests__/payments.spec.ts"
  - "packages/client/__tests__/wallet-low-balance.spec.ts"
  - "packages/client/__tests__/billing-access.spec.ts"
  - "packages/client/__tests__/tariff-plan-states.spec.ts"
  - "packages/client/__tests__/unpaid-portal-requests.spec.ts"
  - "packages/client/__tests__/helpers/billing.ts"
---

# Billing access (payer / owner / admin)

Who may open the SaaS billing pages and which actions each role gets:
owner, portal admin, payer. SaaS only — standalone editions are out of
scope here. The room-role side of permissions lives in
`access-matrix.md`.

## Reaching the pages

- `/billing/**` and the Stripe callback `/billing/payment-complete` are
  open only to portal admins and the owner; everyone else is redirected
  to `/error/401`. Both places use `<PrivateRoute restricted>`
  (`Billing/Wrapper.tsx` and the route in `client.js`) — the same guard
  as `/portal-settings/**`. Keep the `restricted` prop in place; the
  tests in `Route.private.payments.test.tsx` check exactly this.
- Menu entries (`ProfileActionsStore`, dashboard plan line, low-balance
  bar) are hidden from non-admins by their own `isAdmin || isOwner`
  checks. Hiding a link is not access control: the page itself is
  protected only by the route guard above.

## The payer is an email, not a role

`getIsPayer` (`libs/ui-kit/billing/utils/paymentSelectors.ts`) simply
compares the signed-in user's email with `walletCustomerEmail` returned
by `GET /portal/payment/customerinfo`. This has three consequences:

- Payer info is requested only for admins and the owner
  (`AuthStore.ts`), so for everyone else `isPayer` is always false.
  Do not rely on it in UI that regular users can see.
- Before the first purchase there is no payer yet: `canUpdateTariff` is
  true for any admin, and whoever pays first becomes the payer.
- If the payer leaves the portal, their email is still stored
  (`walletCustomerInfo` becomes null, `walletCustomerEmail` stays), so
  other admins remain blocked. Only the owner or the payer
  (`isStripePortalAvailable`) can assign a new payer through the Stripe
  portal.

## Who may do what (when a payer exists)

**Payer only:**

- Change the plan and the manager count — `canUpdateTariff`
  (`main-tariff/PriceCalculation.tsx`).
- Top up the wallet and configure auto top-up — `canUpdateTariff` on
  the Wallet page (`wallet/WalletContainer.tsx`); the Overview card and
  the compact widget check bare `isPayer` instead
  (`overview/…/AvailableCredits.tsx`). Auto top-up cannot be enabled
  until the first top-up has been made (`wasFirstTopUp`).
- Re-link an expired or unlinked card —
  `walletCustomerStatusNotActive && isPayer`
  (`payment-method/index.tsx`).
- Buy paid services when the wallet balance is short: extra storage,
  paid manual backup, Docs Connect plans
  (`services/panels/additional-storage`,
  `shared/pages/backup/manual-backup`, `DocsConnect/BuyPlanPanel`).

**Owner or payer:**

- Open the Stripe customer portal, and through it reassign the payer —
  `isStripePortalAvailable` (`payment-method/index.tsx`,
  `shared/payer-information`). This is the owner's only extra right in
  billing; everywhere else a non-payer owner is as limited as any admin.

**Any admin:**

- Add the very first card, before any payer exists
  (`payment-method/index.tsx`).
- Buy or upgrade paid services — disk storage, Docs Connect plans — and
  run paid backups, as long as the wallet balance covers the chosen
  service (`services/ServicesItems.tsx`). When the balance is short, the
  admin has to ask the payer to top up the wallet by the missing amount
  (that purchase is payer-only, see above).
- Read everything and download usage / transaction reports
  (`usage/index.tsx`, `wallet/WalletContainer.tsx`), including every
  add-on page under `/billing/addons/*` (`services/pages/*`).

## What a non-payer admin sees

- `PayerOnlyWarning` is the banner "Only the Payer can manage this
  section. Learn more" (`Common:OnlyPayerCanManageSection`); the link
  opens `/billing/payment-method`, where the payer is named. It shows
  only on `/billing/wallet` and `/billing/tariff-plan`, when
  `isPayerInfoLoaded && !isPayer && isCardLinkedToPortal`
  (`Billing/Wrapper.tsx`).
- On the tariff page and the Wallet page the buttons stay visible but
  disabled; everywhere else (the Overview card, the compact wallet
  widget) they are not rendered at all. Keep this split.
- Buying on a short balance (storage, paid backup, Docs Connect) is
  refused by the shared check
  `isBalanceInsufficient && isCardLinkedToPortal && !isPayer`.
- Every refusal message points at the payer: "contact the Payer
  (<name/email>)". What goes into the parentheses is a convention: if
  customer info returned the payer's profile (`walletCustomerInfo`),
  the payer exists on the portal — show their name; if it did not, the
  payer is not a portal user — show their email as a plain `mailto:`
  link: the click opens the mail client with the payer's address
  prefilled and nothing else (no prepared subject or body — do not
  oversell it as a "ready letter"). The unknown-payer texts
  that differ for the owner and for an admin exist only on the Payment
  method page (`shared/payer-information`).

## Unpaid / grace period

When the portal is unpaid (`isNotPaidPeriod`):

- An admin or the owner is forced to `/billing/tariff-plan` from
  anywhere; only wallet URLs and `/portal-settings/backup/data-backup`
  stay reachable (`Route.private.tsx`). The portal deletion pages also
  stay open, but for the owner only.
- Everyone else is sent to `/portal-unavailable`.
- The billing sidebar shows only two items while unpaid — Wallet and
  Tariff plan. Overview, Add-ons, Payment method and Usage are hidden
  (the `hideWhenNotPaid` flag in `BillingSidebar/index.tsx`).
- The Wallet page opens, but its top-up buttons are disabled — the only
  way to pay is the repurchase flow on the tariff page
  (`UpdatePlanButtonContainer`). The wallet is kept reachable so the
  admin can see the balance that was not enough to cover the tariff,
  and, before deciding to delete the portal, check whether any money
  is left on the wallet account.

During the grace period (`isGracePeriod`):

- The portal keeps working, but nothing new can be added — no new
  rooms, no new contacts; only what already exists can be used.
- Billing stays fully open, with the usual payer guards.
- The manager slider becomes read-only, and the storage toggle is
  blocked behind a modal.

How a portal enters the grace period — the tariff charge failed. The
tariff is always debited from the wallet; when the wallet is short, the
missing amount is first auto-charged from the card onto the wallet
balance, and only then the full price is debited from the wallet, so
every movement is visible in the transaction history (this card
fallback exists for the tariff only). So there are two ways in:

- the card was unlinked in Stripe while the wallet balance is not
  enough;
- neither the wallet nor the card had enough money for the tariff.

How to get out:

- no card linked — link a card first, top up the balance, then restart
  the subscription manually;
- card linked — top up the wallet by the missing amount, then press the
  pay button.

## One-click purchases

Wherever possible a service is bought in one click. If the wallet
balance does not cover the price, the missing amount is first charged
into the wallet (from the linked card), and the full price is then
taken from the wallet balance — the buyer never goes through a separate
top-up step.

## Service renewals

Services never enter a grace period and never charge the card: they
renew from the wallet only. If the wallet cannot cover a renewal (disk
storage, Docs Connect), the service is switched off; its page keeps
showing the previous plan so it can be bought again.

## Billing checks outside the billing pages

- `canActivateAi`
  (`packages/client/src/components/AiAgentsTour/index.tsx`) decides
  whether the AI empty screen offers a way to switch AI on:
  `standalone || !isCardLinkedToPortal || isPayer`. Standalone is sent
  to connect a provider; with no card linked any admin may activate;
  once a card is linked, only the payer.
- Paid manual backup (`shared/pages/backup/manual-backup`) and Docs
  Connect plans (`developer-tools/DocsConnect/BuyPlanPanel`) also live
  outside `/billing` but follow the same rule as the add-ons: any admin
  buys while the wallet balance covers it; when it does not, only the
  payer can top up.
- When the wallet balance drops below 1 credit, the portal shows the
  banner "Your credits are running low" on every page
  (`MainBar/Bar.js`, `MainBar/QuotasBar.js`). The payer can top up
  straight from the banner, whatever page they are on; an admin is only
  offered to contact the payer. Pinned by
  `wallet-low-balance.spec.ts`.

## The payment-complete page (Stripe callback)

When no card is linked to the portal yet, a purchase goes through
Stripe checkout. `openStripeCheckout` (`billing/utils/stripe-flow.ts`)
builds a success URL
`/billing/payment-complete?currency=…&amount=…&type=wallet&language=…&service=…`
(plus purchase-specific params such as `admins`, `storage`, `plan`,
`users`, `add`, `devpack`) and passes it to Stripe; after the payment
Stripe returns the user to that URL. Callers today:
`SimpleTopUpDialog`, `StoragePlanUpgrade` and the client
`DocsConnectStore`.

The page itself (`billing/payment-complete/PaymentCompletePage.tsx`,
mounted at `packages/client/src/pages/PaymentComplete`) then:

- strips the query string from the address bar and warns on closing the
  tab while processing;
- waits until the payment method is set (retrying `getCustomerInfo`),
  then tops up the deposit with the `amount`/`currency` from the URL;
- activates what was bought: wallet services from the `service` param
  (`resolveWalletServicesToActivate`), tariff managers from `admins`,
  Docs Connect seats from `users`/`add`/`devpack`;
- shows a processing/success/error card with per-service texts and a
  button leading to that service's page. Without payment params it just
  redirects to `/billing/wallet`.

**Everything on this page exists per service.** When a new paid service
is added, it must be wired in each of these, or its callback silently
falls back to the plain wallet texts and the wallet redirect:

- `PaymentFlavor` + `resolveFlavor` — which flavor the params mean;
- `getFlavorContent` — the card texts and `redirectUrl` for the flavor;
- `resolveWalletService` / `resolveWalletServicesToActivate` — the
  `service` string → `TenantWalletService` to switch on;
- the `*_REDIRECT_URL` constants — all in
  `payment-complete/PaymentCompletePage.utils.ts`.

## Traps

- **The payer getters — pick by meaning, not by proximity:**
  - `canUpdateTariff` is the check of the tariff purchase page
    (`main-tariff/PriceCalculation.tsx`), not a general payer flag. It
    carries the page's own special cases — `isNonProfit` portals get
    the page in a limited form, and the first purchase stays open while
    there is no payer yet — and after that it reduces to `isPayer`.
    The top-up buttons on the Wallet page reuse it
    (`wallet/WalletContainer.tsx`).
  - `isPayer` answers one question: is the current user the payer. Use
    it when that plain fact is all you need. It works both inside other
    getters (`canUpdateTariff`, `isStripePortalAvailable`) and on its
    own (the Overview top-up card, the compact wallet widget,
    re-linking an inactive card, the short-balance checks).
- Tests pin the matrix, one spec per angle:
  - `payments.spec.ts` (SaaS block) — screenshot views for payer, owner,
    owner-without-payer, admin and admin-without-payer.
  - `billing-access.spec.ts` — the matrix functionally: the 401 route
    guard; the payer-only warning with disabled buttons; the
    payment-method payer identity (known / departed payer, Stripe portal
    for owner only); the unpaid sidebar, read-only wallet and forced
    redirect; the grace-period payer guards; the admin-only profile-menu
    entry. Also the unlinked/expired card: the payer is offered to add a
    new one (and cannot pay until then), everyone else gets the payer's
    mailto.
  - `tariff-plan-states.spec.ts` — recalculation on a paid wallet
    tariff:
    - the prorated "Total due today" pill and the "Pay X & Upgrade" /
      "Top up & Upgrade" split on adding a manager;
    - the zero-due "Schedule change" downgrade;
    - the locked calculator with the cancellable banner while an admins
      change is scheduled;
    - the order summary the due-today hint opens — its figures and
      action label must match the page ("Price Details" for an upgrade,
      "Confirmation" for a downgrade);
    - the "Change pricing plan" refusal when the portal has outgrown
      the plan it is downgrading to, by assigned admins or by used
      storage;
    - the Startup plan: the first purchase is open to any admin and
      goes through Stripe checkout; a card already linked on Startup
      narrows it to the payer.
  - The wallet-billing migration is pinned in the same specs: both
    money paths of `MigrateToWalletDialog` (refund covers the plan /
    the shortfall lands on the card, with the cross-currency refund
    row), the agreement checkbox gating the confirm, and the absolute
    admin count its POST sends — unlike the ordinary upgrade, which
    sends the difference.
  - `unpaid-portal-requests.spec.ts` — the allowed API surface of an
    unpaid portal.
  - `wallet-low-balance.spec.ts` — payer vs contact-the-payer copy
    (incl. the departed-payer mailto link).
  - `Route.private.payments.test.tsx` — the redirects and the
    restricted admin/member split on `/billing/**`.
  - The shared mock setup for the billing specs lives in
    `__tests__/helpers/billing.ts` — its `useSaasBilling` takes the
    user, the payer (including "none" for a portal that never
    purchased), the tariff state, the plan and the card state.
