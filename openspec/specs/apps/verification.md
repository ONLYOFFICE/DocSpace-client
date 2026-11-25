# apps — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to `packages/client/`; E2E
paths omit `__tests__/`. Shorthands: `store` = `src/store/AppsStore.ts`, `storeTest` =
`src/store/__tests__/AppsStore.installed.test.ts`, `page` = `src/pages/PortalSettings/categories/apps/index.tsx`,
`guardTest` = `src/components/ProtectedAppRoute/__tests__/ProtectedAppRoute.test.tsx`, `server` =
`../server/openspec/specs/apps/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Where applications can be switched** | | |
| On in SaaS whatever the server says; follows the flag on standalone | `storeTest:85, 95` | UNIT-CONFIRMED |
| Apps entry dropped and its address redirected in SaaS | `src/components/PortalSettingsSidebar/index.tsx:191-196`; `src/routes/portalSettings.js:99-107` | CODE-ONLY |
| **The Apps settings list** | | |
| Catalogue entries with title and description | `src/helpers/__tests__/apps-catalog.test.tsx:46` | UNIT-CONFIRMED |
| Unreleased application off without its opt-in | `storeTest:141` | UNIT-CONFIRMED |
| Files always on and locked; failure toast | `src/helpers/apps-catalog.tsx:103`; `page:81-91, 101-105` | CODE-ONLY |
| Writes need the portal-settings right | `server`, "Who may read and who may write"; "Switching an application on or off" | SERVER-SPEC |
| **Switches wait for the real state** | | |
| Locked while pending, locked after a failed load, real state once loaded | `apps-disabled.spec.ts:143, 161, 176` | E2E-CONFIRMED |
| Locked while saving | `page:105` | CODE-ONLY |
| **A switched-off application is gone** | | |
| Rooms address redirected to the dashboard | `apps-disabled.spec.ts:93, 106` | E2E-CONFIRMED |
| Redirect; shared route open while either app is on | `guardTest:105, 114` | UNIT-CONFIRMED |
| Sidebar leaves out Rooms and Forms | `src/components/ClientArticleSidebar/index.tsx:623, 701, 1014-1015` | CODE-ONLY |
| **Before the list of applications arrives** | | |
| Waits on standalone, not in SaaS; passes after a failed load; asks for the list | `guardTest:86, 93, 99, 123` | UNIT-CONFIRMED |
| Rooms open after a failed load | `apps-disabled.spec.ts:122` | E2E-CONFIRMED |
| Optimistic until loaded; failure flagged and cleared on retry | `storeTest:108, 115, 127` | UNIT-CONFIRMED |
| **What a switched-off application takes along** | | |
| No create-room entry while Rooms is off | `src/store/filesStore/__tests__/FilesStore.contextOptions.test.ts:228`; `src/store/filesActionsStore/__tests__/FilesActionsStore.isAvailableOption.test.ts:135` | UNIT-CONFIRMED |
| Pickers drop Rooms and Forms | `src/components/FilesSelector/__tests__/utils.test.ts:86, 92` | UNIT-CONFIRMED |
| Start page falls back to Home; Private falls back to Home when Rooms is off too | `src/helpers/__tests__/defaultStartPage.test.ts:154, 167, 180` | UNIT-CONFIRMED |
| Start page setting does not offer a switched-off section | `src/pages/Profile/Section/Body/sub-components/file-management/sub-components/__tests__/DefaultPageSetting.test.tsx:128, 139` | UNIT-CONFIRMED |
| **A switch made elsewhere** | | |
| Socket event updates the list | `store:179-190` | CODE-ONLY |
| The server sends the event after a switch | `server`, "Clients are told when an application is switched" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The Private application and its section | Owned by `private-rooms/feature-gating` and `private-rooms/sidebar-section` | `storeTest:174-294` |
| Application cards of the dashboard and enabling from there | Owned by `dashboard` | `src/pages/Dashboard/hooks/__tests__/useModuleItems.test.tsx` |
| Installing and removing the AI forms and arbiter applications; a guest kept out of the AI files page | Owned by the change `ai-chat-agents-design` | `store:238-329`; `guardTest:131` |
| The SaaS client ignores a flag stored as off on the server | A product decision stated in Purpose, not a defect | `store:197-202` |
