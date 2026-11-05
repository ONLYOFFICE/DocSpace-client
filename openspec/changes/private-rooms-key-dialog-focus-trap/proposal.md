# Proposal

## Why

The key-management spec says a key dialog SHALL NOT trap the focus "in this
version": Tab from the last action leaves the dialog. That limitation was
recorded by `private-rooms-dialog-keyboard-and-focus` (archived 2026-10-29)
because the kit's modal had no trap then. The kit's `feature/keyboard-focus-a11y`
branch now keeps Tab and Shift+Tab inside every open `ModalDialog` and
`Aside` (`useFocusTrap`, commits 11689902 and 974277c5 in
docspace-ui-kit-react), following the WAI-ARIA modal dialog pattern. The
client's matching branch consumes that build, so the key dialogs trap the
focus whatever the spec says, and the shared unit tests that pin the old
behaviour fail and block the push.

The trap is the intended behaviour: `aria-modal` already tells assistive
technology the page behind is inert, and a keyboard user who tabs out of a
modal lands on controls they cannot use. The spec follows the product.

## What Changes

- The key-management requirement "Tab order in key dialogs follows the
  visual order" drops its SHALL NOT on trapping. Tab from the last stop of a
  key dialog moves to its first stop, Shift+Tab from the first stop moves to
  its last, and the focus never reaches the page behind while the dialog is
  open. The visual-order scenarios stay as they are.
- The PassphraseModal "No trap" unit test is replaced by wrap-around tests in
  both directions.
- The PassphraseModal tab-order tests give jsdom a layout, so the kit's trap
  sees the dialog's controls as rendered tab stops (jsdom reports no client
  rects, so today the trap finds no stops and swallows every Tab).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Tab order in key dialogs follows the
  visual order" — the no-trap limitation becomes a trap with wrap-around.

## Impact

- `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx`
  only. No product code in this repository changes: the trap lives in the
  kit and reaches every key dialog through `ModalDialog` and `Aside`.
- E2E: the keyboard pass in `packages/client/__tests__/keys-management.spec.ts`
  never tabs out of a key dialog, so it is unaffected; the general trap is
  pinned by `packages/client/__tests__/modal-focus-trap.spec.ts` on this branch.
- No locale, mock or server change.

## Dependencies

- docspace-ui-kit-react `feature/keyboard-focus-a11y` (the trap). The change
  is only true on a client branch that consumes a kit build carrying it; it
  must not reach `release/v4.1.0` ahead of that kit release.
- No `../server` or Document Server work.

## Out of scope

- The trap's implementation and its own tests, which belong to the kit.
- Non-key dialogs (invite panel, move and copy, Members view): not covered by
  the key-management spec.
- A global jsdom layout stub for all shared tests; see design D2.

## Decisions that needed a human

- Trap versus no trap for key dialogs: decided 2026-11-03 by Alexey
  Safronov — the trap wins.
