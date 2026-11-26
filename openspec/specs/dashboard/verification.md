# dashboard — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The page calls no operation of its own, so Purpose names no operationIds.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `da` = `dashboard-appearance.spec.ts` (a generated
matrix over role, edition, plan, AI, Developer Tools and width; its single test body runs at line 544 for every case),
`gr` = `guest-restrictions.spec.ts`, `dta` = `dev-tools-access.spec.ts`, `id` = `integrations-dialogs.spec.ts`,
`dash/` = `packages/client/src/pages/Dashboard/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Welcome header** | | |
| Plan line for a SaaS owner or admin, naming the plan; none for others or on a server installation; Community upgrade line for its admins and owner | `da:580-600` | E2E-CONFIRMED |
| Upgrade and customize offers lead to the payments page | `dash/sub-components/Header.tsx:121-150` | CODE-ONLY |
| **Profile card** | | |
| Card for everyone; rename pencil for admin and owner only; type with its help icon except for the owner | `da:564-578` | E2E-CONFIRMED |
| Set password reached with Tab and opened with Enter | `dashboard-profile-keyboard.spec.ts:58` | E2E-CONFIRMED |
| **Creating and uploading** | | |
| Guest tiles and upload link disabled with the explanation; an ordinary user without it | `gr:91, 109, 120, 141` | E2E-CONFIRMED |
| AI Chat action only with AI on and not for a guest | `da:634-638` | E2E-CONFIRMED |
| New files go to My documents | `dash/hooks/useCreateActions.tsx:85-159` | CODE-ONLY |
| **Application cards** | | |
| Three or four cards by AI; the AI Chat card; private rooms card after Forms with Beta and its button by right | `da:640-671` | E2E-CONFIRMED |
| Subtitle names the plan for a SaaS admin only | `da:602-614` | E2E-CONFIRMED |
| Create or Open by right; position and badge; disabled card for whoever may switch the app on, none otherwise | `dash/hooks/__tests__/useModuleItems.test.tsx:73, 83, 93, 111, 119, 123, 133`; `dash/sub-components/__tests__/ModuleCard.test.tsx:54, 66` | UNIT-CONFIRMED |
| Plugin cards placed by the sections the reader may open | `dash/__tests__/utils.test.ts:48-76` | UNIT-CONFIRMED |
| **Developer Tools card** | | |
| Shown where offered, gone when limited for the reader; integrations card along with it on SaaS | `da:616-632` | E2E-CONFIRMED |
| Guest shown the section and told why; refusal as a toast; documentation still a link; User told why Docs Connect does not open | `dta:123, 147, 193, 223` | E2E-CONFIRMED |
| **Integrations card** | | |
| Steps for a platform; manage once an instance exists; room admin refused with the reason; API reference for another platform; each tile its platform | `id:125, 148, 175, 202, 224` | E2E-CONFIRMED |
| Connect link for owner and admins on SaaS only | `da:616-632` | E2E-CONFIRMED |
| **Welcome dialog** | | |
| Opens only from the help button; no help button where no tour runs | `dash/sub-components/Header.tsx:79-83, 157-164`; `.claude/rules/dashboard-matrix.md` ("Nothing has to be dismissed on arrival") | CODE-ONLY |
| **Layout of the dashboard** | | |
| Filled rows in 3, 2 and 1 columns | `da:671` | E2E-CONFIRMED |
| Same width with and without a scrollbar, no flicker | `dashboard-scrollbar-loop.spec.ts:106, 131` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Install dialogs of AI Forms, AI Arbiter and AI rooms | The AI applications' install flows belong to change `ai-chat-agents-design` | `dash/InstallModuleDialog/`, `dash/InstallAiArbiterDialog/`, `dash/EnableAiRoomsDialog/` |
| The Dashboard tour | Owned by `onboarding-tours` | `dashboard-tour.spec.ts` |
