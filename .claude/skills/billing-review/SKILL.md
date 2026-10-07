---
name: billing-review
description: Review the current diff for billing correctness — payer/billing conditions must come from the store getters, not inline re-spellings or duplicated logic. Use after changing stores, billing pages, or ui-kit billing code.
argument-hint: "[<baseBranch>] [--uikit-src <path>]"
---

# Billing review

Read-only review. The spec the diff is checked against is
`.claude/rules/billing-access.md` — read it before reviewing. Never
edit, never commit; the output is findings, each with a file:line and a
concrete suggested fix.

The billing code is split across two repositories: the client keeps the
wiring (routes, the sidebar, store glue, E2E specs), while the billing
pages, components and the canonical getters live in `billing/**` of
`docspace-ui-kit-react`, consumed here only as a prebuilt tarball. A
ui-kit change is invisible in the client diff (at most a swapped
`onlyoffice-apps-ui-kit.tgz`), so the review has two halves.

## Scope

**Client half.** The branch diff against its base, resolved the same way
as `review-branch` (reuse `.claude/scripts/review/review-scope.mjs`),
plus uncommitted changes.

**ui-kit half.** Locate the clone and check its branch:

```bash
node .claude/scripts/ui-kit/locate.mjs --status [--uikit-src <path>]
```

It prints the clone's path (`--uikit-src`, then `DOCSPACE_UI_KIT_SRC`,
then its gitignored `config.local.json`, then
`../../docspace-ui-kit-react`), both branches with their release lines,
whether the clone is clean, and a `status:` line — or exits 1 when no
clone is found. Two outcomes need the user, both asked with the
interactive option dialog, never in prose:

- **exit 1** — ask where the `docspace-ui-kit-react` clone is: "enter
  the path" first, "review the client half only" second; offer to
  remember the answer with
  `node .claude/scripts/ui-kit/locate.mjs --save <path>`.
- **`status: MISMATCH`** — the clone is on another release line than
  the client, so its diff is not the code this client branch builds
  against. Ask: "use the clone as it is", "switch the clone to <client
  line>", "point to another clone". Switch only on that explicit
  choice and only when the status says the clone is clean; a dirty
  clone is never checked out from under the user.

Then, in the clone, resolve its own base and diff with its own script:

```bash
node <clone>/.claude/scripts/review/review-scope.mjs [<baseBranch>] --diff
```

The two repositories mirror branch names but have independent bases;
state both resolved bases in the report. A review that skipped the
ui-kit half must say so — the getters cannot be checked without it.

Findings anchor to lines the diff adds or changes. Surrounding code is
context to check the diff against, never a target: a pre-existing
problem the review happens to see is at most one closing sentence
("noticed, pre-existing, out of scope"), never a finding.

The unpaid-portal side is NOT this skill's job: the allowed API surface
of an unpaid portal is pinned by
`packages/client/__tests__/unpaid-portal-requests.spec.ts` (an
allowlist of requests per reachable page). During review, only glance
at conditional reachability that the spec's fixed mocks cannot
exercise; anything the spec catches, leave to the spec.

## Trigger paths

Run this skill whenever a diff touches any of the paths below.

Client repository:

- `packages/client/src/store/PaymentStore.ts`, `ServicesStore.ts`,
  `DocsConnectStore.ts`
- `packages/client/src/pages/PortalSettings/categories/payments/**`
- `packages/client/src/pages/PaymentComplete/**`
- `packages/client/src/components/BillingSidebar/**`
- `packages/client/src/components/MainBar/**` — the low-balance banner
- `packages/shared/routes/Route.private.tsx` — the billing redirects
- `onlyoffice-apps-ui-kit.tgz` — a swapped tarball means ui-kit changed;
  check the ui-kit half
- billing consumers outside billing:
  `packages/client/src/components/AiAgentsTour/**`,
  `packages/shared/pages/backup/manual-backup/**`,
  `packages/client/src/pages/PortalSettings/categories/developer-tools/DocsConnect/**`

`docspace-ui-kit-react` (in the clone):

- `billing/**`

The path list cannot know about places that do not exist yet, so there
is a content trigger too: run the checks when the diff text — in any
file, in either repository — mentions a billing identifier:

```
isPayer|canUpdateTariff|isStripePortalAvailable|isCardLinkedToPortal|
isAlreadyPaid|walletCustomer|isBalanceInsufficient|isNotPaidPeriod|
isGracePeriod|usePaymentStore|useServicesStore|PAYMENT_ROUTES
```

When that fires in a location the path list does not cover, add the new
location to the list above as part of the review.

## The check — billing conditions come from getters

The canonical getters live in `billing/store/PaymentStore.ts` of the
ui-kit clone (`isPayer`, `canUpdateTariff`, `isStripePortalAvailable`,
`isCardLinkedToPortal`, `isAlreadyPaid`, `isCardMissingOrInactive`) and
in the client `packages/client/src/store/PaymentStore.ts`. What each one
means is written in `billing-access.md`. Read the ui-kit getters from
the clone; without it, the installed package's `dist/` is compiled
output and no substitute for review.

Flag in the diff:

1. **Inline re-spelling** — a new condition that combines
   payer/card/balance flags (`isCardLinkedToPortal && !isPayer`,
   `!isAlreadyPaid && …`) where an existing getter already means the
   same thing. Fix: use the getter.
2. **Duplicated getter** — the same computed condition appears in both
   the ui-kit and the client PaymentStore. Fix: extract the body into a
   plain function in `billing/utils/` of the ui-kit repository and call
   it from both getters (the ui-kit half lands in
   `docspace-ui-kit-react`, the client half here).
3. **Incomplete condition** — a new check misses a case the rule names:
   the `isNonProfit` branch, the "no payer yet" first purchase, the
   standalone bypass. Fix: either the existing getter that already
   covers the case, or — when it is genuinely a new rule — a new getter
   next to the others, never an inline one-off.
4. **Misplaced billing UI** — billing pages and components live in
   `billing/**` of the ui-kit repository; the client keeps only the
   wiring (routes, the sidebar, store glue). A diff that adds a new
   billing page or component under `packages/client/**` is a finding:
   the code belongs in ui-kit, and the fix lands in the ui-kit repo.

## Report

Rank findings: duplicated getters first, then inline conditions. For
each: file:line, which rule it breaks (quote `billing-access.md`), and
the suggested fix. A finding inside the ui-kit clone must name the clone
path and say the fix belongs to the `docspace-ui-kit-react` repository,
on its own branch. When nothing is found, say so explicitly — and say
whether the ui-kit half was reviewed.
