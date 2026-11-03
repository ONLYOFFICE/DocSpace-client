# Proposal

## Why

The key-management spec records "the system SHALL NOT trap the focus inside the
dialog in this version, so Tab from the last action leaves it". That was the
kit's behaviour when it was written: no dialog trapped the focus. The kit now
keeps Tab and Shift+Tab inside every open `ModalDialog` and `Aside`, and the
branch that brought it (`feature/keyboard-focus-a11y`) merged
`release/v4.1.0`, so the key dialogs trap the focus like every other dialog of
the product and the "No trap" scenario no longer holds. A modal dialog whose
page behind is inert (`aria-modal`) is expected to keep the focus (WAI-ARIA
dialog pattern); a key dialog letting Tab wander to the page behind its
backdrop is the one exception, and nothing about keys calls for it.

## What Changes

- The requirement "Tab order in key dialogs follows the visual order" is
  replaced by "Tab in key dialogs follows the visual order and stays inside
  the dialog": the visual order and its two scenarios stay, the v1
  limitation goes. Tab from a key dialog's last control goes to its first
  one, Shift+Tab from the first to the last, and the page behind the dialog
  is out of the keyboard's reach while it is open. (A replacement rather than
  a modification, as a modified requirement keeps every scenario it had and
  "No trap" cannot stay.)
- The "No trap" scenario gives way to scenarios for the wrap in both
  directions and for a confirmation opened over a key dialog (the
  unsaved-changes question), which holds the focus while it is open.
- The PassphraseModal tests that pinned the old behaviour follow the
  requirement; the unit tests stub what jsdom does not lay out, so the trap
  sees the dialog's controls.

No change to the dialogs' markup, their focus on open or on close, Enter
handling or errors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Tab order in key dialogs follows the
  visual order" is removed and "Tab in key dialogs follows the visual order
  and stays inside the dialog" added, which traps the focus in a key dialog
  instead of letting Tab leave it.

## Impact

- Behaviour comes from `@onlyoffice/apps-ui-kit`'s `useFocusTrap`, already in
  `ModalDialog` and `Aside` through the locally packed ui-kit; no code of the
  key dialogs changes.
- Tests: `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx`.
- No server (`../server`) or Document Server work.

Out of scope: the focus trap itself (owned by ui-kit, reviewed there), other
dialogs of the product, and the order of controls inside each key dialog,
which stays as specified.

Needs a human: confirmed on 2026-11-03 by the branch owner, who chose the trap
for every dialog over an exemption for the key dialogs.
