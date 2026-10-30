# Proposal

## Why

A read of the code archived on 2026-10-29 by `private-rooms-dialog-keyboard-and-focus`
and `private-rooms-keys-page-keyboard` (review of 2026-10-30, against the
kit's `Modal`, `FieldContainer` and input components in ui-kit 4.1.0) found
four keyboard gaps the unit tests do not see, because jsdom neither blurs a
field that becomes disabled nor orders unmount and mount effects the way a
browser does:

1. The confirmation shown before a key dialog discards typed input
   (`UnsavedChangesDialog`) listens for Enter on the window and discards on
   any Enter while it is visible, including Enter pressed on its own Cancel
   button. A keyboard user who Tabs to Common:CancelButton and presses Enter
   loses the passphrase they typed, the opposite of what "Closing a key
   dialog with typed input asks for confirmation" promises for declining.
   Confirmed in the code; the listener predates the keyboard changes, which
   routed the key dialogs through it.
2. When one key dialog replaces another in the same render (the passphrase
   prompt gives way to the recovery-phrase display during generation, the
   phrase input gives way to the new-passphrase prompt during recovery), the
   new dialog records the document body as its opener: the previous dialog's
   fields were already disabled while the flow was pending, and its content
   is gone from the DOM before the new dialog reads the active element.
   Closing the second dialog then hands the focus to nothing while
   Common:GenerateNewKey is still on the page. Plausible from the kit's
   `Modal` code; to be confirmed in a browser.
3. A failed primary action (wrong passphrase, wrong recovery phrase)
   disables the fields while the action runs; Chrome drops the focus to the
   body when the focused field becomes disabled, and nothing moves it back
   once the error is shown, so the next Tab leaves the dialog. Plausible; to
   be confirmed in a browser.
4. `activateOnEnter`, used by the key dialogs' action links, has no
   auto-repeat guard, unlike `activateAsButton`; a held Enter clicks the link
   once per repeat. Confirmed in the code; the archived keys-page change
   already listed switching the links to `activateAsButton` as a follow-up.

## What Changes

- The discard confirmation of the key dialogs acts on Enter only when the
  focus is on the dialog surface, not on one of its buttons; Enter on
  Common:CancelButton declines and keeps the typed input.
- A key dialog that replaces another in the same flow hands the focus back
  to the control that opened the flow when it closes, the way a single
  dialog does.
- After a failed primary action the focus returns to the field that carries
  the error, so the user keeps typing without leaving the dialog.
- The key dialogs' action links (generate, forgot passphrase, passkey) use
  the Enter-and-Space helper with its auto-repeat guard.
- The gaps are pinned by scenarios in `private-rooms/key-management` and by
  Playwright cases where the unit tests cannot see them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Closing a key dialog with typed input
  asks for confirmation" gains the keyboard decline; "Key dialogs return the
  focus when they close" gains the replaced-dialog case; "Key-dialog errors
  are tied to their field" gains the focus after a failure; "Enter confirms
  a key dialog from its text fields" gains the held key on an action link.

## Impact

- Shared: `packages/shared/dialogs/unsaved-changes-dialog/index.tsx`,
  `packages/shared/dialogs/key-dialog-keys.ts`,
  `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`,
  `packages/shared/dialogs/key-generation/useGenerateKeyFlow.tsx`,
  `packages/shared/dialogs/key-recovery/useRecoverKeyFlow.tsx`,
  `packages/shared/dialogs/key-recovery/RecoveryPhraseInputModal.tsx` and
  their tests.
- Client: `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`
  for the same failure path; the E2E specs
  `packages/client/__tests__/keys-management.spec.ts` and
  `key-flow-edge-cases.spec.ts`.
- ui-kit: none expected; if the opener capture of `Modal` has to change for
  the replaced-dialog case, it is committed in `docspace-ui-kit-react` on
  release/v4.1.0 and brought here with `pnpm run update-ui-kit`.
- Locales, server (`../server`), Document Server: no work.

## Out of scope

- A focus trap inside the key dialogs ("Tab order in key dialogs follows the
  visual order" keeps "no trap in this version").
- The callers of `UnsavedChangesDialog` outside private rooms, beyond the
  shared fix of its Enter handling, which they receive as well; their own
  tests are run.

## Decisions for a human

- None beyond the archived requirements. The two browser-only gaps (2 and 3)
  are reproduced first; their code tasks are closed without code if a
  browser does not reproduce them.
