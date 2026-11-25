# files-settings — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `fm` =
`packages/client/src/pages/Profile/Section/Body/sub-components/file-management/index.tsx`, `store` =
`packages/client/src/store/FilesSettingsStore.ts`, `ds/` =
`packages/client/src/pages/PortalSettings/categories/integration/DocumentService/`, `server` =
`../server/openspec/specs/files-settings/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Personal file settings** | | |
| The switches of the tab, each saved on change | `fm:108-255`; `store:400-470` | CODE-ONLY |
| Quick actions toggle and its caption | `quick-actions.spec.ts:160, 182` | E2E-CONFIRMED |
| Switches on the server | `server`, "Personal file settings switches"; "Switches for quick actions and room grouping" | SERVER-SPEC |
| **The quick actions bar** | | |
| Hide with a toast to bring it back; keyboard; off for a user who turned it off; back when refused | `quick-actions.spec.ts:82, 105, 125, 140` | E2E-CONFIRMED |
| Stored value, saved value wins, failures keep the previous value, Undo races | `packages/client/src/store/__tests__/FilesSettingsStore.quickActions.test.ts:87-210` | UNIT-CONFIRMED |
| **Document templates** | | |
| Page, select a template, customized template, preview by title, long labels | `default-templates.spec.ts:54, 74, 145, 199, 237, 284` | E2E-CONFIRMED |
| From the portal or the device, same format, download, reset with confirmation | `packages/client/src/pages/PortalSettings/categories/common/DefaultTemplates/TemplatesRow.tsx:93-265`; `packages/client/src/store/portal-settings/DefaultTemplatesStore.ts:107-141` | CODE-ONLY |
| Templates on the server | `server`, "Default template from an existing file"; "Default template from an upload"; "Default template reset" | SERVER-SPEC |
| **Document Server address** | | |
| Whitespace and line breaks stripped; empty is valid; invalid rejected | `ds/__tests__/utils.test.ts:41, 48, 55, 62, 67` | UNIT-CONFIRMED |
| Three addresses, advanced settings, save, restore | `ds/index.js:111-250` | CODE-ONLY |
| Address checked on the server | `server`, "Document Server address is changed with verification" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Start page choices | Owned by `apps` | `packages/client/src/pages/Profile/Section/Body/sub-components/file-management/sub-components/__tests__/DefaultPageSetting.test.tsx` |
| Connecting Docs Connect editors | Owned by `docs-connect` | `ds/index.js:254-400` |
| Conversion prompt | Owned by `file-operations` | `packages/client/src/components/dialogs/ConvertDialog/index.js:107-141` |
| Quick actions of a form room | Owned by `form-filling-workflow` | `quick-actions.spec.ts:237, 255` |
