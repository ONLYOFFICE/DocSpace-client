# app-shell — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; client
E2E paths omit `packages/client/__tests__/`, login E2E paths are given in full. Shorthands: `menu` =
`packages/client/src/store/ProfileActionsStore.tsx`, `shared/` = `packages/shared/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The profile menu** | | |
| Billing entry for an admin, none for a member | `billing-access.spec.ts:577, 591` | E2E-CONFIRMED |
| Entries by type, edition and installation; unpaid period | `menu:450-635` | CODE-ONLY |
| **Help and session entries of the profile menu** | | |
| Help, support, feature, hotkeys, live chat, About, sign out in a frame | `menu:522-687` | CODE-ONLY |
| **Menu entries as links** | | |
| One new tab per middle click for Profile, Contacts, Settings | `profile-menu-links.spec.ts:56` | E2E-CONFIRMED |
| Contacts link absolute from a nested page | `accounts-access.spec.ts:101` | E2E-CONFIRMED |
| **Plugin entries in the profile menu** | | |
| Placement, separators, folding into one submenu | `packages/client/src/store/utils/__tests__/profileMenu.test.ts:61-138` | UNIT-CONFIRMED |
| **Live chat** | | |
| Switch on, stays on, off, menu stays open; widget loads; no key, no chat | `live-chat.spec.ts:127, 154, 177, 195, 210` | E2E-CONFIRMED |
| Steps aside from the create button; takes the corner back; hides and returns | `live-chat.spec.ts:355, 384, 409, 428, 481, 503` | E2E-CONFIRMED |
| Widget follows floating buttons and the switch | `packages/client/src/components/AppsSidebar/__tests__/LiveChatBlock.test.tsx:126-220` | UNIT-CONFIRMED |
| **About** | | |
| Dialog and mobile page per edition, products, AI tools beta, company | `about.spec.ts:201, 220` | E2E-CONFIRMED |
| Legal links per edition; no link without an address | `shared/components/about-dialog/AboutDialog.test.tsx:91, 104, 111, 118` | UNIT-CONFIRMED |
| **Error pages** | | |
| 401, 403, 404, offline, unavailable, access restricted, 520 with the report | `shared/components/errors/Errors.test.tsx:103-286` | UNIT-CONFIRMED |
| Crash page from the error boundary | `shared/components/error-boundary/ErrorBoundary.test.tsx:153-209` | UNIT-CONFIRMED |
| Invalid link page | `shared/components/errors/ErrorInvalidLink.tsx` | CODE-ONLY |
| **Recovering from a broken load** | | |
| Client: bootstrap in the head, retry, outage, bounded reloads | `chunk-retry.spec.ts:70, 86, 129, 163` | E2E-CONFIRMED |
| Login app: the same | `packages/login/__tests__/chunk-retry.spec.ts:60, 76, 108, 142` | E2E-CONFIRMED |
| Visibility and connectivity gates, reload budget | `shared/utils/chunk-retry-script.test.ts:192-592`; `shared/utils/chunk-load-error.test.ts:89-287` | UNIT-CONFIRMED |
| Chunk crash reloads, but not right after a reload | `shared/components/error-boundary/ErrorBoundary.test.tsx:224, 244` | UNIT-CONFIRMED |
| **A portal name that no longer exists** | | |
| Client redirect without a detour | `portal-not-found.spec.ts:84` | E2E-CONFIRMED |
| Login app: redirect, no bounce, live portal, rejected session, API error, unreachable API | `packages/login/__tests__/portalNotFound.spec.ts:84-226` | E2E-CONFIRMED |
| Private route leaves the redirect alone | `shared/routes/Route.portalNotFound.test.tsx:101, 107` | UNIT-CONFIRMED |
| **Focus in dialogs and panels** | | |
| Dialogs, filter panel, viewer, Move to, nested panels | `modal-focus-trap.spec.ts:282-705` | E2E-CONFIRMED |
| **Fitting the top row** | | |
| Collapse button at the trailing edge; squeezed slot collapses | `top-row-fit.spec.ts:179, 256, 307, 462` | E2E-CONFIRMED |
| Settings on a phone open the section list | `settings-mobile-section-list.spec.ts:74` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The AI chat button of the top row | Owned by the change `ai-chat-agents-design` | `top-row-fit.spec.ts:218` |
| Sidebar items of the Private and AI sections | Owned by `private-rooms/sidebar-section` and the change `ai-chat-agents-design` | `packages/client/src/components/ClientArticleSidebar/__tests__/ClientArticleSidebar.test.tsx` |
| Billing redirects of the private route | Owned by `billing` | `shared/routes/Route.private.payments.test.tsx` |
| Pages kept for the next sign-in | Owned by `authentication` | `shared/routes/Route.private.referenceUrl.test.tsx`; `shared/utils/referenceUrl.test.ts` |
| A "Debug Info" entry with an untranslated label | Shown only where the portal turns debug info on; a developer tool | `menu:689-699` |
