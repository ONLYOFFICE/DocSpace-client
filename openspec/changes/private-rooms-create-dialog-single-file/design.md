# Design

## Context

See proposal.md, "Why". The create flow on `release/v4.1.0`, read on
2026-11-03:

- **The create event stays mounted across requests.** `GlobalEvents`
  renders the create event under a fixed key while `createDialogProps.visible`
  is set, and a new create request only replaces its props
  (`packages/client/src/components/GlobalEvents/index.js`, `onCreate` and the
  render of `CreateEvent`). Every caller sends `id: -1`, so nothing in the
  props tells two requests apart except their fields. The event unmounts when
  its `onClose` clears the props.
- **The decision effect.** `CreateEvent.js` decides in one effect whether to
  show the name dialog (setting off, no `withoutDialog`) or to call `onSave`
  at once with the title or the suggested name. Its dependencies are
  `extension`, `title`, `fromTemplate`, `withoutDialog` and `onSave`; its
  cleanup hides the dialog.
- **`onSave` changes identity with the setting.** Its `useCallback` lists
  `keepNewFileName`, `withoutDialog` and `title`, which it does not read, and
  `actionEdit` twice.
- **The dialog saves the setting in parallel.** `Dialog.js` `onSaveAction`
  starts `setKeepNewFileName(true)` and `onSave` together when the box is
  ticked. `FilesSettingsStore.setKeepNewFileName` writes the store value after
  the client's `changeKeepNewFileName` request returns.
- **Private rooms hold the event open.** The private branch of `onSave` opens
  an empty editor window when editors open in a new tab, awaits
  `runEncryptedFileCreation` (unlock, produce,
  encrypt, upload) and closes the event in `finally`. An ordinary room with an
  editor calls `window.open` and returns, so `finally` closes the event before
  the setting request returns; a form room (`openEditor: false`) awaits
  `createFile` and shares the race.
- **The second file.** The store value turns on, the observer re-renders,
  `onSave` gets a new identity, the effect cleans up (the dialog hides) and
  runs again, takes the `else` branch and calls `onSave(null, title ||
  suggestedName)`. That is a second encrypted creation under the default
  name, and a second `window.open` while the click's user activation still
  lets a popup through.
- **Tests.** Nothing tests `GlobalEvents`. No E2E creates an encrypted file
  through the name dialog, and the E2E mocks have no handler for the setting
  route, only `keepNewFileName: false` in the settings fixture
  (`packages/shared/__mocks__/handlers/files/filesSettings.ts`).

No stashed design document covers the create dialog.

## Goals / Non-Goals

**Goals:**
- The dialog-or-create decision runs once per create request, whatever else
  re-renders the event meanwhile.
- A test that reproduces the race without timing.

**Non-Goals:**
- A second request for the same file type while one is still being created
  is dropped today, because its props equal the running ones. This change
  keeps that.
- The dependencies `onSave` reads but does not list.

## Decisions

1. **The decision follows the create request, not the save callback.** The
   effect depends only on the request fields (`extension`, `title`,
   `fromTemplate`, `withoutDialog`) and calls the latest `onSave` through a
   ref updated on every render. A change of the setting or of the callback no
   longer re-runs the decision, and no longer runs the cleanup, so the open
   dialog keeps its loading Create button until `finally` closes it (spec
   "Dialog during the creation").
   - *Alternative:* a ref that lets the decision run once per mount.
   - *Why not:* the event stays mounted across requests (Context), so a
     request for another file type sent during an encrypted creation would be
     swallowed.
   - *Alternative:* drop only `keepNewFileName` from the `onSave` dependencies.
   - *Why not:* any other listed value that changes during a creation
     (`openOnNewPage`, `createFile`, `openDocEditor`, ...) re-runs the decision
     the same way.
   - *Alternative:* save the setting in the dialog after `onSave` settles.
   - *Why not:* it reorders every create dialog and still leaves the effect
     re-entrant for the other dependencies.

2. **`onSave` stops listing values it does not read**: `keepNewFileName`,
   `withoutDialog`, `title` and the second `actionEdit`. With decision 1 they
   no longer cause the bug; they only recreate the callback.

3. **Verified by a component test, not an E2E.** The test renders the create
   event in a `mobx-react` `Provider` with fake stores, as the
   `ClientArticleSidebar` test does. The files settings fake is observable and
   its `setKeepNewFileName` turns the value on; `runEncryptedFileCreation` is
   mocked with a promise the test resolves after the setting has turned on,
   and `window.open` is stubbed. An E2E would need a mock of the setting route
   that mirrors `../server` through CodeGraph and the whole encrypted creation
   driven through the dialog, which no spec does today. The real editor is
   covered by the manual run of task 2.2.

## Risks / Trade-offs

- [The ref calls an `onSave` from a later render than the decision] → That is
  the intent: the latest callback carries the latest stores; the request
  fields it acts on are the ones the decision saw.
- [A legitimate re-decision is skipped] → The decision still re-runs when any
  request field changes; the case "Another file type requested during a
  creation" in task 1.1 guards it.
- [The recording's editors stayed at "Loading presentation"] → Task 2.2
  checks a single creation on the dev stand; a remaining hang becomes its own
  change (proposal, "Out of scope").

## Run on the dev stand (task 2.2)

2026-11-03, local stand (`localhost:8092`): client `release/v4.1.0` at
`6a5c0b5291a` served by the Vite dev server, DocSpace server 3.1.0,
Document Server 10.0.2.5. Administrator, private room "Pirate room" (id 11),
editors opening in a new tab.

- Common:DontAskAgain switched off, then "+ New" > "Presentation", the box
  ticked in the name dialog, Create.
- Result: one file, `New presentation.pptx` (id 33), the room went from three
  files to four; one editor tab (`doceditor?fileId=33`); the setting read
  back as on.
- The editor opened the presentation with its empty title slide. The
  "Loading presentation" hang of the recording did not occur with a single
  file on this Document Server, so no separate change is proposed.

## Migration Plan

1. Commit the fix with its test directly on `release/v4.1.0`.
2. Rollback: revert that commit; the duplicate comes back only for the ticked
   box in private and form rooms.
