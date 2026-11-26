# keyboard-and-hotkeys — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The hotkeys call no operation of their own, so Purpose names no operationIds.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `hk` = `hotkeys.spec.ts`, `flk` =
`files-list-keyboard.spec.ts`, `kn` = `keyboard-navigation.spec.ts`, `chk` = `contacts-hotkeys.spec.ts`, `whk` =
`packages/client/src/HOCs/withHotkeys.js`, `hkt` = `packages/client/src/helpers/__tests__/hotkeys.test.ts`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **When list hotkeys act** | | |
| Nothing under the delete confirmation; Esc closes the Shift+C menu and keeps the selection | `hk:345, 364` | E2E-CONFIRMED |
| Keys owned by the focused control; context menu detection | `hkt:69-132` | UNIT-CONFIRMED |
| Not while loading, with a dialog, a context menu or the media viewer, or in a text field | `whk:137-148` | CODE-ONLY |
| **Selecting with the keyboard** | | |
| Arrows and j/k; Ctrl+A, Esc and Shift+N; caret kept after Esc; ranges from the caret; Ctrl+arrows; non-Latin layout | `hk:201, 218, 236, 252, 267, 280, 293, 312` | E2E-CONFIRMED |
| Grid steps in tiles, after the info panel narrows it and after a resize; caret after deleting its folder | `hk:480, 499, 522, 540, 566` | E2E-CONFIRMED |
| Layout-independent letters | `packages/shared/utils/getHotkeyLetter.test.ts:41` | UNIT-CONFIRMED |
| `x`, Enter and Backspace | `whk:265-316, 370` | CODE-ONLY |
| **Action hotkeys** | | |
| F2 rename; V switches the view; Ctrl+/ opens the panel; Shift+D whichever key is released first | `hk:396, 405, 413, 421, 434` | E2E-CONFIRMED |
| Shift+U and Shift+I open the pickers | `packages/client/src/HOCs/__tests__/withHotkeys.upload.test.tsx:115, 124, 133, 184` | UNIT-CONFIRMED |
| Create hotkeys blocked in the flat AI source rooms, left to the Create right elsewhere | `hkt:187, 192` | UNIT-CONFIRMED |
| Folders without actions, guests, Shift+R in Rooms and Forms, Alt+Shift+O, Ctrl+I | `whk:156-200, 408-441, 518` | CODE-ONLY |
| **Deleting with the keyboard** | | |
| Confirmation and Esc to cancel | `hk:379` | E2E-CONFIRMED |
| Deleted at once when the confirmation is off | `packages/client/src/HOCs/__tests__/withHotkeys.upload.test.tsx:223, 230` | UNIT-CONFIRMED |
| Archive in Rooms, delete in Archive, unfavorite in Favorites, nothing in Recent | `whk:444-480` | CODE-ONLY |
| **Clipboard** | | |
| Cut into the same folder does nothing; copy into it checks conflicts | `hk:451, 465` | E2E-CONFIRMED |
| Paste ignored without the right; transfer between ordinary folders | `packages/client/src/store/__tests__/HotkeyStore.clipboard.test.ts:361, 373, 394` | UNIT-CONFIRMED |
| System files pasted are uploaded; Ctrl+Shift+C copies the rows as text | `whk:246-256, 543-555` | CODE-ONLY |
| **Focus in the list** | | |
| Arrows move the focus; Tab through the row and out; Shift+Tab; return to the caret; restored focus; dialog gives it back; selection kept; Tab selects a row; hotkeys on the row name; tiles; Shift+F10; group menu; click; page load; rooms | `flk:172-607` | E2E-CONFIRMED |
| Focus taken off a row button and given to the list | `hkt:156-175` | UNIT-CONFIRMED |
| **Reaching the page by Tab** | | |
| Visible stops, reachability, reverse order, collapsed sections, search, filter panel, room menu, sorting, view switch, sidebar collapse, group tabs | `kn:225, 237, 275, 308, 336, 350, 369, 398, 412, 431, 441, 473` | E2E-CONFIRMED |
| **Contacts hotkeys** | | |
| People: moving, Ctrl+A, Esc and Shift+N, ranges, nothing under the menu, copy with and without a selection | `chk:123, 140, 156, 168, 178, 194, 202` | E2E-CONFIRMED |
| Groups: the same keys | `chk:229, 237, 245, 259, 271, 287` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Hotkeys and clipboard inside private rooms | Owned by `private-rooms/file-operations` | `packages/client/src/store/__tests__/HotkeyStore.clipboard.test.ts:205-346`; `packages/client/src/HOCs/__tests__/withHotkeys.upload.test.tsx:268, 288` |
| The content of the hotkeys panel | A list of the hotkeys above | `packages/client/src/components/panels/HotkeysPanel/` |
| Undo and redo | The hotkeys are commented out | `whk:486-500` |
