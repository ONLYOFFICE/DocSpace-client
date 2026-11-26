# metadata — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/metadata` and of the metadata part of
> `packages/shared/api/ai` uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `mt` = `metadata-templates.spec.ts`, `mip` =
`metadata-info-panel.spec.ts`, `mf` = `metadata-filter.spec.ts`, `mai` = `metadata-ai.spec.ts`, `tpl/` =
`packages/client/src/pages/PortalSettings/categories/common/MetadataTemplates/`, `view/` =
`packages/client/src/pages/Home/InfoPanel/Body/views/Metadata/`, `filter/` =
`packages/client/src/pages/Home/Section/Filter/MetadataFilter/`, `ai/` =
`packages/client/src/components/panels/MetadataAIPanel/`, `shared` = `packages/shared/utils/metadata.test.ts`,
`server` = `../server/openspec/specs/metadata/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Metadata templates page** | | |
| Create, rename, delete after confirmation, show a hidden template again | `mt:84, 180, 237, 259` | E2E-CONFIRMED |
| Columns of the list | `tpl/sub-components/TableView/TableHeader.tsx` | CODE-ONLY |
| Templates are managed by a DocSpace admin only | `server`, "Creating a metadata template" | SERVER-SPEC |
| **Editing a template** | | |
| Taken field name, repeated option | `mt:147` | E2E-CONFIRMED |
| Field deletion confirmed on save | `mt:180` | E2E-CONFIRMED |
| Name taken ignoring case, `System` held back, at least one field, unique non-empty options, Save needs a change | `tpl/__tests__/utils.test.ts:168, 186, 402, 412, 416, 473, 489` | UNIT-CONFIRMED |
| Reordering, new positions sent | `tpl/__tests__/utils.test.ts:113, 325, 425-437` | UNIT-CONFIRMED |
| A partial write is reported and the list reloaded; the last field is never left alone to delete | `tpl/__tests__/utils.test.ts:207, 244, 261` | UNIT-CONFIRMED |
| **Entries that have metadata** | | |
| Portal entries only: no third-party, Trash, private, encrypted, AI agent entries or section roots | `shared:163, 172, 186, 208` | UNIT-CONFIRMED |
| No Metadata tab in the AI section | `packages/client/src/helpers/info-panel/tabs.ts:195-204` | CODE-ONLY |
| **Who edits metadata** | | |
| Edit right per entry kind | `view/__tests__/utils.test.ts:145` | UNIT-CONFIRMED |
| Read-only tab without actions | `view/index.tsx:112-173` | CODE-ONLY |
| The write right on the server | `server`, "The right to write the metadata of an entry" | SERVER-SPEC |
| **Metadata of an entry** | | |
| Visible templates with fields sorted by name; empty state | `view/__tests__/utils.test.ts:156, 185` | UNIT-CONFIRMED |
| Removing a template after confirmation | `mip:255` | E2E-CONFIRMED |
| Re-read on the server's update event | `view/hooks/useEntryMetadata.ts:103-115`; `server`, "Clients are told about metadata changes" | CODE-ONLY |
| **Adding a template and its values** | | |
| Adding from the empty state with values; editing values; fractional number refused | `mip:112, 203` | E2E-CONFIRMED |
| Only unassigned templates with fields, searchable | `view/__tests__/utils.test.ts:196, 208` | UNIT-CONFIRMED |
| Whole numbers within the safe range; only changed values sent; date kept as the UTC day | `view/__tests__/utils.test.ts:321, 328, 339, 350`; `shared:67, 84, 96` | UNIT-CONFIRMED |
| Empty list: admin led to the settings, others told to ask an admin | `view/sub-components/TemplatePanel/TemplateList.tsx` | CODE-ONLY |
| **Custom fields** | | |
| Adding with a taken name refused; renaming | `mip:291, 353` | E2E-CONFIRMED |
| At most 50; case-only rename refused; rename as removal plus write | `view/__tests__/utils.test.ts:178, 407, 436` | UNIT-CONFIRMED |
| Limit on the server | `server`, "Limits and dictionary of the custom fields" | SERVER-SPEC |
| **Applying a template to the content** | | |
| Conflict choice sent; progress; turned off without asking | `mip:408, 472, 508` | E2E-CONFIRMED |
| Run shown on its templates, bar full only on success, outcome of a launched run | `view/__tests__/utils.test.ts:482, 490, 503` | UNIT-CONFIRMED |
| Done or failed toast | `view/hooks/useMetadataCascade.ts:57-76` | CODE-ONLY |
| The cascade on the server | `server`, "Cascade of a template over the content of a folder" | SERVER-SPEC |
| **Filtering by metadata** | | |
| Text and choice; number comparison with a fraction refused; chip removal; deleted option dropped from a link; empty state; kept while searching | `mf:108, 168, 209, 229, 250, 280` | E2E-CONFIRMED |
| Operators per type; deleted fields and options dropped; chips; shown only with a filterable template or a set filter | `filter/__tests__/utils.test.ts:97, 181, 223, 313, 340, 386` | UNIT-CONFIRMED |
| Not offered in public rooms, third-party, private folders and unsupported roots | `packages/client/src/pages/Home/Section/Filter/index.js:276-280` | CODE-ONLY |
| Sections the server takes or refuses | `server`, "Sections that take or refuse the metadata filter" | SERVER-SPEC |
| **Filling metadata with AI** | | |
| Hidden while no model is ready; filling; undo by field and keyboard; suggesting custom fields; opening from the tab | `mai:128, 143, 192, 227, 254, 271` | E2E-CONFIRMED |
| Files only; filling only with fields; hidden where AI cannot read or write | `ai/__tests__/utils.test.ts:147, 155, 164` | UNIT-CONFIRMED |
| Undo, redo and Ctrl+Z handling | `ai/__tests__/utils.test.ts:317, 348`; `ai/__tests__/useUndoHistory.test.ts:44-100` | UNIT-CONFIRMED |
| The AI routes on the server | `../server/openspec/specs/ai-agents/spec.md`, "Metadata values filled from a file" | SERVER-SPEC |
| **AI refusals** | | |
| Admin led to the model assignment; regular user asked to contact the Full admin; unexpected error; limit reached | `mai:295, 325, 344, 404, 414` | E2E-CONFIRMED |
| Missing model told apart; each refusal explained; spending limit, empty wallet and provider credits told apart | `ai/__tests__/utils.test.ts:474, 480, 493, 513, 539` | UNIT-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Metadata through copy, move, Trash, backup and the text search | Decided by the server | `server` |
| Anonymous access through an external link | Who may write through a link is decided by the server; no client test covers a public room | `server`, "Metadata reached through an external link" |
| The model choice and the spending limits | Owned by change `ai-chat-agents-design` | — |
