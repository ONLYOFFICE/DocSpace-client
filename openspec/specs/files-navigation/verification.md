# files-navigation — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> Rows added after `release/v4.1.0` was merged in at `b5479f67ea9` were checked on that merge.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthand: `helpers/` =
`packages/client/src/helpers/__tests__/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The page opened at sign-in** | | |
| Home when nothing is stored; stored section while available | `helpers/defaultStartPage.test.ts:61-95` | UNIT-CONFIRMED |
| Guest never routed to Files | `helpers/defaultStartPage.test.ts:77, 95` | UNIT-CONFIRMED |
| Private falls back to Rooms, then Home when Rooms is off | `helpers/defaultStartPage.test.ts:114, 122, 180` | UNIT-CONFIRMED |
| Switched-off section opens Home | `helpers/defaultStartPage.test.ts:149-167` | UNIT-CONFIRMED |
| OAuth frame opens Rooms unless a section is named | `helpers/defaultStartPage.test.ts:134, 140` | UNIT-CONFIRMED |
| **The section an item belongs to** | | |
| Form filling rooms and their folders under Forms; other rooms under Rooms; roots untouched | `helpers/formsSectionNavigation.test.ts:48-108` | UNIT-CONFIRMED |
| **The Trash of a section** | | |
| Rooms, Forms and My documents Trash | `helpers/sectionTrashNavigation.test.ts:60-79`; `packages/client/src/store/__tests__/SecondaryProgressDataStore.trashToast.test.tsx:100` | UNIT-CONFIRMED |
| **The create button of a section** | | |
| New with the create menu in a folder | `helpers/getSectionCreateButton.test.ts:23` | UNIT-CONFIRMED |
| **Views of a list** | | |
| Table, rows or tiles; kept in the browser; tiles request thumbnails; fitted view for the layout | `packages/client/src/store/FilesStore.ts:951-980` | CODE-ONLY |
| Full tile rows at every width and regrouped after a resize (personal files of the SDK frame) | `packages/sdk/__tests__/e2e/personal-files/tiles.spec.ts:75, 94` | E2E-CONFIRMED |
| **Files being edited** | | |
| Editing icon; hover list with an anonymous editor; scroll past the maximum height; no photo for an anonymous editor; phone modal closed by the backdrop | `editors-tooltip.spec.ts:62, 72, 102, 123, 165, 172, 195, 213` | E2E-CONFIRMED |
| **Sorting and filtering** | | |
| Filter resets paging; sort saved per user; Rooms loaded 100 per page | `packages/client/src/store/filesStore/__tests__/FilesStore.filter.test.ts:63, 76, 95` | UNIT-CONFIRMED |
| The server stores `sortBy` as the account's default rooms sort | yaml `getRoomsFolder` description | SERVER-SPEC |
| **Loading a list in pages** | | |
| Next page on scroll until no more | `packages/client/src/store/filesStore/__tests__/FilesStore.filesList.test.ts`; `packages/client/src/store/filesStore/__tests__/FilesStore.fetchFiles.test.ts` | CODE-ONLY |
| **Search in a list** | | |
| Debounced search keeps the caret and the typing through an empty result | `search-input-caret.spec.ts:79` | E2E-CONFIRMED |
| **Selecting entries** | | |
| Toggle and Shift range | `packages/client/src/store/filesStore/__tests__/FilesStore.selectionActions.test.ts:61, 105` | UNIT-CONFIRMED |
| Select all or by kind; active entries left out | `packages/client/src/store/filesStore/__tests__/FilesStore.selection.test.ts:52-144` | UNIT-CONFIRMED |
| Group menu checkbox options walked by the arrows | `files-list-keyboard.spec.ts:465` | E2E-CONFIRMED |
| **Following changes made elsewhere** | | |
| New file in the open folder appears; duplicates and other folders ignored | `packages/client/src/store/filesStore/__tests__/FilesStore.socketHandlers.test.ts:66-90` | UNIT-CONFIRMED |
| Deleted entry removed unless an own operation moves it in | `packages/client/src/store/filesStore/__tests__/FilesStore.socket.test.ts:57-124` | UNIT-CONFIRMED |
| Updated entry re-read | `packages/client/src/store/filesStore/__tests__/FilesStore.socketHandlers.test.ts:105, 120` | UNIT-CONFIRMED |
| Rooms created elsewhere go to Rooms or Forms by type | `packages/client/src/store/filesStore/__tests__/FilesStore.socketCreate.test.ts:159-219, 303-326` | UNIT-CONFIRMED |
| Counts taken from the server, kept on failure | `packages/client/src/store/filesStore/__tests__/FilesStore.socketCreate.test.ts:478-535` | UNIT-CONFIRMED |
| Removed template returns to the templates listing | `packages/client/src/store/filesStore/__tests__/FilesStore.socketCreate.test.ts:336-370` | UNIT-CONFIRMED |
| Own access changed reloads the folder | `packages/client/src/store/filesStore/__tests__/FilesStore.socketHandlers.test.ts:171, 194` | UNIT-CONFIRMED |
| **Losing access inside a room** | | |
| Refused request: room kept, one toast | `rooms-forbidden.spec.ts:148-184` | E2E-CONFIRMED |
| Lowered type: reload bar, stays in the room; bar dismissible | `rooms-forbidden.spec.ts:206, 257, 314, 344` | E2E-CONFIRMED |
| Raised or unchanged type: no bar | `rooms-forbidden.spec.ts:275, 367` | E2E-CONFIRMED |
| Rights re-read inside a subfolder | `rooms-forbidden.spec.ts:444, 478` | E2E-CONFIRMED |
| **Empty views** | | |
| Empty view per section; Shared with me, Recent and Favorites | `shared-with-me.spec.ts:78`; `recent.spec.ts:57`; `favorites.spec.ts:79` | E2E-CONFIRMED |
| No-results view after a filter or search | `packages/client/src/components/EmptyContainer` | CODE-ONLY |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Client-side search of encrypted names | Owned by `private-rooms` | `packages/client/src/store/filesStore/__tests__/FilesStore.clientSearch.test.ts` |
| Keyboard focus and hotkeys of the list | Owned by `keyboard-and-hotkeys` | `files-list-keyboard.spec.ts` |
| Room groups in the Rooms list | Owned by `room-types` | `room-grouping.spec.ts` |
| Fitting the top row (sidebar button, AI chat button) | Owned by `app-shell` | `top-row-fit.spec.ts` |
