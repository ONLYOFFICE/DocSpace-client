# portal-settings — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `sidebar` = `packages/client/src/components/PortalSettingsSidebar/index.tsx`, `sidebarTest` =
`packages/client/src/components/PortalSettingsSidebar/__tests__/PortalSettingsSidebar.test.tsx`, `common/` =
`packages/client/src/pages/PortalSettings/categories/common/`, `server` =
`../server/openspec/specs/portal-settings/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Sections of the settings** | | |
| Sections of the tree; AI settings, Apps, Payments and Upgrade by installation and edition; Delete data for the owner | `packages/client/src/pages/PortalSettings/utils/settingsTree.js:50-709`; `sidebar:184-245` | CODE-ONLY |
| Entries are links; an entry not drawn as a link navigates itself | `sidebarTest:125, 135` | UNIT-CONFIRMED |
| **Settings of an unpaid portal** | | |
| Backup, Payments and the owner's Delete data only | `sidebar:199-205` | CODE-ONLY |
| Billing pages of an unpaid portal | `packages/client/__tests__/unpaid-portal-requests.spec.ts:220, 233` | E2E-CONFIRMED |
| **Tabs of Customization** | | |
| General and Appearance shown, Branding hidden on Community Edition and shown elsewhere | `packages/client/__tests__/branding-community.spec.ts:64, 100` | E2E-CONFIRMED |
| Document and metadata templates tabs; phone list of General pages | `common/index.tsx:115-160`; `common/customization.js:83-88` | CODE-ONLY |
| Document templates tab opens | `packages/client/__tests__/default-templates.spec.ts:54` | E2E-CONFIRMED |
| **The General page** | | |
| Sections in order, renaming where allowed, banners on Enterprise only | `common/customization.js:89-119` | CODE-ONLY |
| **Language and time zone** | | |
| Language with beta badge, time zone, save, reload for an administrator without a language | `common/Customization/language-and-time-zone.js:403-422, 470-515` | CODE-ONLY |
| Time zone list on the server | `server`, "Time zone list" | SERVER-SPEC |
| **Domain** | | |
| Custom domain on a server installation; current domain and Send request on SaaS; paid badge | `common/Customization/dns-settings.js:159-292, 307-309` | CODE-ONLY |
| Custom domain on the server | `server`, "Custom domain of a self-hosted portal" | SERVER-SPEC |
| **Deep link mode** | | |
| Three modes, save | `common/Customization/configure-deep-link.tsx:160-235` | CODE-ONLY |
| Deep link on the server | `server`, "Setting the deep link mode"; "Reading the deep link mode" | SERVER-SPEC |
| **Promotional banners** | | |
| Enable and Disable, save | `common/Customization/ad-management.tsx:150-210` | CODE-ONLY |
| Enterprise only on the server | `server`, "Setting the banner flag" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Settings list on a phone from the profile menu | Owned by `app-shell` | `sidebarTest:153, 166, 172`; `packages/client/__tests__/settings-mobile-section-list.spec.ts:74` |
| AI services switch and AI settings | Owned by the change `ai-chat-agents-design` | `common/Customization/ai-services-management.tsx`; `packages/client/__tests__/ai-settings-saas.spec.ts` |
| Document templates | Owned by `files-settings` | `packages/client/__tests__/default-templates.spec.ts:74-284` |
| Portal renaming | Owned by `portal-lifecycle` | `common/Customization/portal-renaming.js` |
| Integration dialogs of the dashboard | Owned by `dashboard` | `packages/client/__tests__/integrations-dialogs.spec.ts` |
