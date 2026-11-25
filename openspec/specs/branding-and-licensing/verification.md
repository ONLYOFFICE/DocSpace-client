# branding-and-licensing — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `common/` = `packages/client/src/pages/PortalSettings/categories/common/`, `brand/` =
`packages/shared/pages/Branding/`, `server` = `../server/openspec/specs/branding-and-licensing/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Where branding is offered** | | |
| No tab and 404 on Community Edition; tab and direct link elsewhere | `packages/client/__tests__/branding-community.spec.ts:64, 79, 100, 116` | E2E-CONFIRMED |
| Paid badge and disabled inputs without the feature, not on a server installation | `brand/BrandName/BrandName.test.tsx:86, 91, 96, 136`; `brand/WhiteLabel/WhiteLabel.test.tsx:98`; `brand/CompanyInfo/CompanyInfo.test.tsx:91`; `brand/AdditionalResources/AdditionalResources.test.tsx:72` | UNIT-CONFIRMED |
| Company details and links only on a single-portal server installation | `common/branding.js:76-123` | CODE-ONLY |
| Who may change branding | `server`, "Whether branding may be changed"; "Editions of the installation" | SERVER-SPEC |
| **Brand name** | | |
| Input, save, cancel to the saved name, reminder | `brand/BrandName/BrandName.test.tsx:101, 108, 118, 127` | UNIT-CONFIRMED |
| Empty, length 2 to 40, forbidden characters | `brand/BrandName/index.tsx:111-127` | CODE-ONLY |
| Logo text on the server | `server`, "Saving and clearing the logo text" | SERVER-SPEC |
| **Logos** | | |
| Logo text, save, restore, restore disabled, logos from text, uploaded file | `brand/WhiteLabel/WhiteLabel.test.tsx:105, 117, 136, 148, 155, 162, 190` | UNIT-CONFIRMED |
| Slots and their light and dark variants | `brand/WhiteLabel/index.tsx` | CODE-ONLY |
| Logo slots on the server | `server`, "Logo slots and their public listing"; "Saving logos from image data"; "Restoring the built-in logos" | SERVER-SPEC |
| **Company details** | | |
| Inputs, save, validation errors, save only for a valid change | `brand/CompanyInfo/CompanyInfo.test.tsx:111, 124, 148, 158` | UNIT-CONFIRMED |
| About window checkbox; restore | `brand/CompanyInfo/index.tsx:101-104, 203, 314-316` | CODE-ONLY |
| Company details on the server | `server`, "Changing and resetting the company details" | SERVER-SPEC |
| **Help and community links** | | |
| Checkboxes, save, reminder, restore and its disabled state | `brand/AdditionalResources/AdditionalResources.test.tsx:82, 91, 106, 123, 145, 157` | UNIT-CONFIRMED |
| Links on the server | `server`, "Help and community links of the installation" | SERVER-SPEC |
| **Branding on a phone** | | |
| Sections listed, company and links hidden when not offered, links open pages | `brand/MobileView/MobileView.test.tsx:51, 60, 66, 72` | UNIT-CONFIRMED |
| **Colour themes** | | |
| Preview, pick and save, limit of nine, standard themes locked, delete selects another | `common/appearance.js:150-185, 218-270, 330-378, 508-580, 670-690` | CODE-ONLY |
| Themes on the server | `server`, "Adding, changing and selecting a colour theme"; "Deleting a colour theme" | SERVER-SPEC |
| **Greeting title** | | |
| Empty refused, save, restore, success message | `common/Customization/welcome-page-settings.js:280-296, 315-356, 415-425` | CODE-ONLY |
| Greeting on the server | `server`, "Changing and restoring the greeting title" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| License upload and license states | Owned by `billing` | `packages/shared/pages/Payments/Standalone/Standalone.test.tsx` |
| "Not available under license" and the default branding of the management app | Owned by `spaces-management` | `common/Branding/brandName.js:155`; `brand/WhiteLabel/NotAvailable.tsx` |
| Branding shown in About and the profile menu | Owned by `app-shell` | `packages/shared/components/about-dialog/AboutDialog.test.tsx` |
