# onboarding-tours — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The tours call no operation of their own, so Purpose names no operationIds.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `dt` = `dashboard-tour.spec.ts`, `ft` =
`files-tour.spec.ts`, `rt` = `rooms-tour.spec.ts`, `fmt` = `forms-tour.spec.ts`, `tour/` =
`packages/client/src/components/Tour/`, `steps(X)` = `packages/client/src/components/XTour/__tests__/tourSteps.test.ts`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Starting a tour** | | |
| Never offered on its own; the help button opens the dialog; the tour it starts is the dashboard's; closing leaves the page | `dt:290, 310, 321, 333` | E2E-CONFIRMED |
| The request is spent when the tour starts and cleared when it ends | `packages/client/src/store/__tests__/DashboardTourStore.test.ts:15, 26` | UNIT-CONFIRMED |
| A section tour requested from its card starts once the section is ready; a request on a phone is dropped | `packages/client/src/pages/Dashboard/index.tsx:503-507`; `tour/usePendingTour.ts:58-90` | CODE-ONLY |
| Section tours armed by their request start once the section loads | `packages/client/__tests__/helpers/tour.ts:60-91` (used by `ft`, `rt`, `fmt`) | E2E-CONFIRMED |
| **Audiences of a tour** | | |
| Mapping of user types to audiences | `tour/__tests__/audience.test.ts:41-70` | UNIT-CONFIRMED |
| Admin, user and guest walkthroughs of each tour | `dt:172, 186, 204`; `ft:140, 152, 294, 325`; `rt:127, 139, 160`; `fmt:219, 257, 274` | E2E-CONFIRMED |
| Nothing that creates for users and guests; no create button at the close; guest without Trash | `steps(Files):315, 327, 336, 356, 382`; `steps(Rooms):192, 199, 228, 333`; `steps(Forms):187, 194, 206, 473` | UNIT-CONFIRMED |
| **Steps follow the page** | | |
| Profile step dropped after dismissal; ends on the sidebar | `dt:222, 261` | E2E-CONFIRMED |
| Missing cards and narrow screens drop their steps; top-to-bottom order | `steps(Dashboard):35-133, 210-227`; `steps(Files):421-454`; `steps(Rooms):320-346`; `steps(Forms):392-430` | UNIT-CONFIRMED |
| New menu opened and put away; hidden share button revealed; info panel opened for the member step | `ft:169, 199`; `rt:202` | E2E-CONFIRMED |
| Targets checked before the run; menus and controls opened on the way in and closed on the way out | `tour/__tests__/stepBuilders.test.ts:103-195, 333-509` | UNIT-CONFIRMED |
| **Sample content on an empty section** | | |
| Stood-in list walked and handed back; closing on the empty list for those who cannot create | `ft:362, 377, 401, 413`; `rt:245, 263, 337, 360, 380`; `fmt:306, 324, 352, 375, 397, 416` | E2E-CONFIRMED |
| Ends on the New button with own content | `ft:140`; `rt:180`; `fmt:240` | E2E-CONFIRMED |
| The section fades through the swap and comes back even when abandoned | `tour/__tests__/stepBuilders.test.ts:674, 713` | UNIT-CONFIRMED |
| **Moving through a tour** | | |
| Arrow keys and a backdrop click; the list left alone; the quick-actions strip left where it was | `ft:221, 252, 268` | E2E-CONFIRMED |
| Walking back out of the closing step | `rt:286` | E2E-CONFIRMED |
| Anchor kept inside its scroll container | `tour-scroll.spec.ts:111`; `tour/__tests__/stepBuilders.test.ts:930-1010` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The forms tour of the SDK's AI forms application | Owned by change `ai-chat-agents-design` with the AI applications | `packages/sdk/src/app/(forms)/_components/forms-tour/` |
| Wording of each step | i18n content, checked by the step tests | `steps(Dashboard):147`; `steps(Files):283` |
