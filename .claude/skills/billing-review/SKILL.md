---
name: billing-review
description: Review the current diff for billing correctness — payer/billing conditions must come from the store getters, not inline re-spellings or duplicated logic. Use after changing stores, billing pages, or ui-kit billing code.
argument-hint: "[<baseBranch>]"
---

# Billing review

Read-only review. The spec the diff is checked against is
`.claude/rules/billing-access.md` — read it before reviewing. Never
edit, never commit; the output is findings, each with a file:line and a
concrete suggested fix.

Scope: the branch diff against its base, resolved the same way as
`review-branch` (reuse `.claude/scripts/review/review-scope.mjs`), plus
uncommitted changes. Findings anchor to lines the diff adds or changes.
Surrounding code is context to check the diff against, never a target:
a pre-existing problem the review happens to see is at most one closing
sentence ("noticed, pre-existing, out of scope"), never a finding.

The unpaid-portal side is NOT this skill's job: the allowed API surface
of an unpaid portal is pinned by
`packages/client/__tests__/unpaid-portal-requests.spec.ts` (an
allowlist of requests per reachable page). During review, only glance
at conditional reachability that the spec's fixed mocks cannot
exercise; anything the spec catches, leave to the spec.

## Trigger paths

Run this check whenever a diff touches any of the paths below —
`review-branch` refers to this list to decide when to include this
skill.

- `libs/ui-kit/billing/**`
- `packages/client/src/store/PaymentStore.ts`, `ServicesStore.ts`,
  `DocsConnectStore.ts`
- `packages/client/src/pages/PortalSettings/categories/payments/**`
- `packages/client/src/pages/PaymentComplete/**`
- `packages/client/src/components/BillingSidebar/**`
- `packages/client/src/components/MainBar/**` — the low-balance banner
- `packages/shared/routes/Route.private.tsx` — the billing redirects
- billing consumers outside billing:
  `packages/client/src/components/AiAgentsTour/**`,
  `packages/shared/pages/backup/manual-backup/**`,
  `packages/client/src/pages/PortalSettings/categories/developer-tools/DocsConnect/**`

The path list cannot know about places that do not exist yet, so there
is a content trigger too: run the checks when the diff text — in any
file — mentions a billing identifier:

```
isPayer|canUpdateTariff|isStripePortalAvailable|isCardLinkedToPortal|
isAlreadyPaid|walletCustomer|isBalanceInsufficient|isNotPaidPeriod|
isGracePeriod|usePaymentStore|useServicesStore|PAYMENT_ROUTES
```

When that fires in a location the path list does not cover, add the new
location to the list above as part of the review.

## The check — billing conditions come from getters

The canonical getters live in
`libs/ui-kit/billing/store/PaymentStore.ts` (`isPayer`,
`canUpdateTariff`, `isStripePortalAvailable`, `isCardLinkedToPortal`,
`isAlreadyPaid`, `isCardMissingOrInactive`) and in the client
`packages/client/src/store/PaymentStore.ts`. What each one means is
written in `billing-access.md`.

Flag in the diff:

1. **Inline re-spelling** — a new condition that combines
   payer/card/balance flags (`isCardLinkedToPortal && !isPayer`,
   `!isAlreadyPaid && …`) where an existing getter already means the
   same thing. Fix: use the getter.
2. **Duplicated getter** — the same computed condition appears in both
   the ui-kit and the client PaymentStore. Fix: extract the body into a
   plain function in `libs/ui-kit/billing/utils/` and call it from both
   getters (the ui-kit half lands in `docspace-ui-kit-react`).
3. **Incomplete condition** — a new check misses a case the rule names:
   the `isNonProfit` branch, the "no payer yet" first purchase, the
   standalone bypass. Fix: either the existing getter that already
   covers the case, or — when it is genuinely a new rule — a new getter
   next to the others, never an inline one-off.
4. **Misplaced billing UI** — billing pages and components live in
   `libs/ui-kit/billing/**`; the client keeps only the wiring (routes,
   the sidebar, store glue). A diff that adds a new billing page or
   component under `packages/client/**` is a finding: the code belongs
   in ui-kit, and the fix lands in the ui-kit repo.

## Report

Rank findings: duplicated getters first, then inline conditions. For
each: file:line, which rule it breaks (quote `billing-access.md`), and
the suggested fix. A finding inside `libs/ui-kit/**` must say the fix
belongs to the ui-kit repo. When nothing is found, say so explicitly.
