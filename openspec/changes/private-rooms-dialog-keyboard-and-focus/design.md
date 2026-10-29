# Design

## Context

See proposal.md for the motivation. What shapes the approach:

- Six dialogs share one presentation contract: `PassphraseModal`,
  `RecoveryPhraseDisplayModal`, `RecoveryPhraseInputModal` and
  `KeyChangeDialog` in `packages/shared/dialogs`, `KeyRotationDialog` and
  `ResetKeysConfirmDialog` under the client's keys-management tab. All render
  the ui-kit `ModalDialog` with `KEY_DIALOG_DISPLAY_TYPE`
  (`packages/shared/dialogs/key-dialog-display.ts`), which picks the modal or
  the aside presentation by viewport. The SDK shell and the editor wrapper
  render the shared four unchanged, so a change inside the components reaches
  every host.
- Each dialog passes its cancel handler (`onRefuse` for the key-change
  dialog) straight to `onClose`, which the kit calls from the cross, from an
  Escape keyup on `window`, from a backdrop click and, in the aside, from a
  swipe. None of them sets `closeOnBackdropClick` or `isCloseable`.
- The ui-kit on the branch is 4.1.0 (local tarball). Facts verified in its
  source on release/v4.1.0:
  - `ModalDialog` has `isCloseable` (guards every close route) and
    `closeOnBackdropClick` (guards only the backdrop). The backdrop is the
    element with id `modal-onMouseDown-close`; the dialog surface carries
    `data-testid="modal-dialog"`.
  - `Modal.tsx` moves the focus to the surface on open and restores it on
    close, for both presentations, but returns before registering the
    restore when something inside already has the focus. React `autoFocus`
    (`TextInput isAutoFocussed`) runs before that effect, so four of the six
    dialogs never hand the focus back. The kit's own test "leaves the focus on
    a field the dialog's content focused itself" pins the early return but
    not the missing restore.
  - `FieldContainer` adds `aria-invalid`, `aria-required` and an
    `aria-describedby` pointing at its error text to the control named by
    `labelFor` (or the first field inside). It renders no live region, so an
    error that appears is read only when the field is next focused.
  - `Button` sets `aria-busy` while `isLoading` and defaults to
    `type="button"`; `ModalDialog` can wrap its content in a form
    (`withForm`, `onSubmit`).
  - `useLiveRegionText` (`hooks/useLiveRegionText`) exists but is not exported
    from the hooks barrel; it resolves through the package's `./*` export.
- Today's dialog code: `labelVisible={false}` on every passphrase field, so
  the placeholder is the name; `tabIndex={2}` and `{3}` on the creation
  fields; Enter handled only in `PassphraseModal` through an `onKeyDown` on
  its fields; the recovery phrase field is a `Textarea` named by the hint
  above it (`aria-labelledby`); the reset token field is named by its
  instruction. `useGenerateKeyFlow` registers the key only after the recovery
  phrase is acknowledged, so cancelling the display modal discards an
  unregistered key.
- The shared `UnsavedChangesDialog` (`packages/shared/dialogs/unsaved-changes-dialog`)
  is a nested `ModalDialog` with Common:UnsavedChanges and
  Common:UnsavedChangesDescription; `EditLinkPanel` is the precedent for
  guarding a close with it, including ignoring Enter while it is open.
- None of the stashed design documents (SECURITY.md, FORMAT.md, the audits)
  covers dialog interaction; the code on the branch is the only reference.

## Goals / Non-Goals

**Goals:**

- Put every behaviour the delta spec adds inside the six dialog components,
  so client, SDK and editor hosts need no change of their own.
- Lean on the kit for focus, field wiring and busy state; add client code only
  where the kit has no mechanism (close guard, Enter, error announcement).
- Make each scenario a jsdom test with role, name and focus assertions, plus
  one keyboard-only E2E pass.

**Non-Goals:**

- A generic "confirm before close" facility for all dialogs of the product.
- Replacing the kit's focus handling with a client-side implementation.
- Any change to what the dialogs submit or to the flows behind them.

## Decisions

### D1. Backdrop: `closeOnBackdropClick={false}`, not `isCloseable={false}`

`closeOnBackdropClick` stops exactly the route the spec forbids and leaves
the cross, Escape and the aside swipe on the dialog's own `onClose`, which the
close guard (D2) wraps. `isCloseable={false}` would also swallow Escape and the
cross and force the dialogs to re-implement both.

### D2. Close guard with the shared unsaved-changes dialog

Each dialog that can hold input gets a `requestClose` handler passed as
`onClose`: when the dialog is "dirty" it opens `UnsavedChangesDialog`;
otherwise it calls the cancel handler at once. Dirty means: creation dialog,
either field non-empty; passphrase change, any of the three fields non-empty;
recovery phrase input, a non-blank phrase; recovery phrase display, the
acknowledgement not ticked. The unlock prompt, the reset dialog and the
key-change dialog keep passing their cancel handler directly.

The confirmation's "close" action discards (calls the cancel handler), its
"cancel" action keeps the dialog as it is. Because both the dialog and the
confirmation listen for Escape on `window`, the guard must ignore close
requests while the confirmation is visible, and it reads that flag from a ref,
since both keyup listeners run on the same event before React re-renders.
Enter from a field is likewise ignored while the confirmation is open.

The confirmation keeps the generic Common:UnsavedChanges texts, as confirmed
in the proposal's "Decisions taken".

Alternative considered: a prop on `ModalDialog` in the kit ("confirm before
close"). Rejected: the dirtiness rule is per dialog and the kit has no notion
of it.

### D3. Focus on open and close comes from the kit

The dialogs do nothing of their own: those with a text field keep their
autofocus, so the field gets the focus; the recovery display and the
key-change dialog get the surface focus the kit gives. The restore on close
needs the kit fix: `Modal.tsx` must register its cleanup even when the content
already holds the focus (capture `previous`, skip only the `content.focus()`
call, always return the restore). The fix ships in `docspace-ui-kit-react` on
release/v4.1.0 with a unit test next to "takes the focus when it opens and
hands it back when it closes", and reaches this repository through
`pnpm run update-ui-kit`.

Alternative considered: a client-side hook that records the opener and
restores it. Rejected: duplicates what the kit already does for every other
dialog, and the bug is the kit's to fix.

### D4. Tab order is DOM order

Remove every hand-assigned `tabIndex` from the dialogs. The markup already
lists fields, links, checkbox and actions in their displayed order, which the
"Forward through the creation dialog" test pins with `userEvent.tab()` and
`toHaveFocus()`. No trap is added (spec: SHALL NOT in this version).

### D5. Enter through one shared field-level handler

A small helper in `packages/shared/dialogs` returns the `onKeyDown` for a text
field: on Enter without Shift, when nothing has already handled the event and
the primary action is enabled, it prevents the default and calls the submit
handler; on a textarea with Shift held it does nothing, so the line break
stays native. `PassphraseModal` migrates its existing handler to it; the
passphrase-change, recovery-phrase and reset dialogs adopt it. Buttons, links
and checkboxes get no handler, so Enter on them stays with the control.

Alternatives considered:

- `ModalDialog withForm` + `onSubmit`: implicit submission with a disabled
  default button behaves differently across browsers and jsdom, and the
  textarea needs a handler anyway.
- A `window` keydown listener as in `EditLinkPanel`: needs target filtering
  that a field-level handler gets for free, and would race the kit's Escape
  and the confirmation's own Enter.

### D6. Labels through `FieldContainer`

Each passphrase field gets `labelText` (existing Common keys), `labelFor`
pointing at the input's id and a vertical layout; `labelVisible={false}`
goes away. The kit then adds `aria-invalid`, `aria-required` and the error
association on its own. Placeholders may stay as hints but no longer name a
field. The recovery phrase textarea and the reset token input keep their
`aria-labelledby` to the hint and the instruction; their existing a11y
scenarios stay valid.

### D7. Error announcement with a hidden live region

`FieldContainer` ties the error text to the field but announces nothing. Each
dialog renders one visually hidden live region fed by `useLiveRegionText`
with the current error text: the hook delays the text so the region is
announced, and the dialog passes the same text until the error changes, so
typing does not repeat it. The hook is deliberately kept out of the kit's
`hooks` barrel, which is part of its plugin API, so the client imports it by
its deep path `@onlyoffice/apps-ui-kit/hooks/useLiveRegionText`:
portal-internal by the kit's tiering, resolved through the package's wildcard
export and pinned by the tarball the apps install.

Alternative considered: the kit's `StatusMessage` (`role="alert"`). Rejected:
it is a visible status row, and the error already has a visible place under
the field.

### D8. Busy state is already there; only tests are added

The primary action passes `isLoading`, so the kit sets `aria-busy`; the
fields pass `isDisabled={isLoading}`; the Enter helper and the button both
check the enabled flag, so a second submission is refused. The scenarios
"Unlock in progress" and "Busy reported to assistive technology" pin this.

### D9. Tests

- Unit tests (Vitest, RTL, `userEvent`) next to each dialog, titles carrying
  the scenario names. Backdrop: mouse down on the kit's backdrop element.
  Focus return: the test renders a trigger button, focuses it, opens and
  closes the dialog, and asserts `toHaveFocus()` on the trigger. Aside: the
  narrow-width helper the existing a11y tests use. Enter: assert on
  `event.defaultPrevented` and on the submit spy. Announcements: the hidden
  region's text after the hook's delay (`vi.useFakeTimers`).
- The two a11y tests swap their placeholder assertions for `getByLabelText`.
- E2E (`packages/client/__tests__/keys-management.spec.ts`): one keyboard-only
  pass, create a key and unlock, with `getByRole("dialog")`, `getByLabel`
  and `page.keyboard`; dialog locators in the other specs move from
  placeholder and `input[name]` to `getByLabel` where the labels change.
- `Spec:` pointers only where the behaviour is counter-intuitive on its own:
  the refused backdrop close and the absent focus trap.

## Risks / Trade-offs

- [Escape reaches both the dialog and its confirmation] → the guard ignores
  close requests while the confirmation is visible, through a ref; the
  "Typed passphrase kept" test presses Escape twice.
- [The kit fix lands after the client work] → the groups that do not need it
  come first; the focus-return tests for autofocused dialogs are the only
  ones red until the tarball is refreshed, and they sit in their own task.
- [Removing `tabIndex` changes the creation dialog's order] → the markup order
  is checked while removing it; the forward-order test fails otherwise.
- [E2E specs locate fields by placeholder] → the task that adds the labels
  updates those locators in the same commit.
- [Deep import of a kit-internal hook] → pinned by the tarball; if the kit
  moves the hook, the import path is the only thing that changes, and the
  announcement tests catch it.
- [Confirmation on the recovery phrase display annoys users who saved the
  phrase but did not tick the box] → the box is the acknowledgement the spec
  already requires before the dialog can be confirmed; the question is asked
  only on cross and Escape.

## Migration Plan

No data or server change. The behaviour ships with the dialogs; a revert of
the commits restores the previous one. The kit fix is a patch of 4.1.0 and
needs no migration.
