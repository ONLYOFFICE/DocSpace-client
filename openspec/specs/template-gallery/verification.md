# template-gallery — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The gallery talks to the external templates CMS, not to the DocSpace API, so Purpose names no operationIds.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `tgf` = `template-gallery-filter.spec.ts`, `tgh` =
`template-gallery-hotkeys.spec.ts`, `os` = `packages/client/src/store/__tests__/OformsStore.test.ts`, `oapi` =
`packages/shared/api/oforms/index.test.ts`, `tg/` = `packages/client/src/components/TemplateGallery/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Opening the gallery** | | |
| Opening from the store actions; the Forms section flag | `packages/client/src/store/contextOptionsStore/__tests__/ContextOptionsStore.actions3.test.ts:190, 205` | UNIT-CONFIRMED |
| Tabs by file type, PDF only without tabs from the Forms section, tab switch resets the filter | `tg/index.tsx:57-135, 222-272` | CODE-ONLY |
| Taxonomy reloaded for the new type on reset; filter panel closed on a tab switch | `os:260, 318` | UNIT-CONFIRMED |
| **Filtering templates** | | |
| Purpose and categories as chips; Clear all keeps the search; language switch keeps the categories the language has | `tgf:104, 135, 160` | E2E-CONFIRMED |
| Groups by purpose, alphabetical; categories without templates hidden; add and remove; purpose switch drops the other purpose's categories; gallery language; Clear all | `os:134, 141, 149, 174, 184, 208, 279, 330, 346` | UNIT-CONFIRMED |
| Filter request params and per-extension counts | `oapi:53, 87, 94, 186, 200` | UNIT-CONFIRMED |
| Clear all only with two or more chips | `tg/Filter/SelectedFilters/index.tsx:155` | CODE-ONLY |
| **Template details** | | |
| Details panel with description, properties and the suggest link | `packages/client/src/pages/Home/InfoPanel/Body/views/Gallery/index.tsx:68-150`; `tg/Tiles/index.tsx:68-74` | CODE-ONLY |
| **Creating from a template** | | |
| Enter in the Forms section opens the space dialog without creating | `tgh:154` | E2E-CONFIRMED |
| A file of the template's type named and opened in the editor | `packages/client/src/store/contextOptionsStore/actions.helpers.tsx:644-680` | CODE-ONLY |
| **Keyboard in the gallery** | | |
| Files list hotkeys blocked; Esc in the submit dialog closes only it | `tgh:115, 134` | E2E-CONFIRMED |
| Esc closes the filter panel first; click outside closes it; arrows leave the tiles alone with the panel open | `tgf:201, 216, 226` | E2E-CONFIRMED |
| Focused tab or button keeps its keys; tiles walked otherwise | `tg/hooks/__tests__/useTemplateGalleryHotkeys.test.tsx:58, 75` | UNIT-CONFIRMED |
| Enter, `i`, Home and End | `tg/hooks/useTemplateGalleryHotkeys.ts:196-236` | CODE-ONLY |
| **Loading and errors** | | |
| Dimming, superseded answers dropped, paging rules | `os:388, 406, 427, 444, 470, 489, 514, 532, 552` | UNIT-CONFIRMED |
| Error screen for an unexpected status and the previous contract; network failure told apart | `os:564, 574, 594`; `oapi:164` | UNIT-CONFIRMED |
| Error descriptions | `tg/index.tsx:314-321` | CODE-ONLY |
| **Submitting to the gallery** | | |
| Not for a guest; file chosen, sent and the upload page opened; failure toast | `packages/client/src/store/AccessRightsStore.ts:121-128`; `packages/client/src/components/dialogs/SubmitToFormGallery/index.js:100-135, 173` | CODE-ONLY |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Differences from the mockup: the language label, Clear all from two chips, category names in the CMS language | Kept by design; the spec describes the current behaviour and none is a deviation | — |
| The submit entry of a file's context menu | Shown by the file's security; the menu belongs to `file-operations` | `packages/client/src/store/filesStore/contextOptions.helpers.ts:280` |
