# Design

## Context

The key dialogs (`PassphraseModal`, `RecoveryPhraseDisplayModal`,
`RecoveryPhraseInputModal`, `KeyChangeDialog`, and the client's
`KeyRotationDialog` and `ResetKeysConfirmDialog`) all render the kit's
`ModalDialog`, whose `Modal` calls `useFocusTrap(contentRef, visible)`; its
aside presentation is the kit's `Aside`, which traps the same way. The trap is
therefore already active in every key dialog once the ui-kit pack of
`feature/keyboard-focus-a11y` is installed: this change brings the spec and
the tests in line with it. No stashed design document covers focus trapping;
the "SHALL NOT trap" came from the archived change
`2026-10-29-private-rooms-dialog-keyboard-and-focus` (design D4), written
when the kit had no trap.

The trap reads its stops at each key press and leaves out what is not
rendered (`getClientRects()` empty). jsdom lays nothing out, so in the unit
tests it sees no stop at all and Tab moves nothing - which is why "Forward
through the creation dialog" and "Backwards from the primary action" fail
after the merge, not only "No trap".

## Goals / Non-Goals

**Goals:** the key-management spec describes the trapped behaviour; the unit
tests pin it, in both directions and for a confirmation stacked over a key
dialog.

**Non-Goals:** any change to the trap, to the dialogs' markup or to their
focus on open and close.

## Decisions

### D1. Trap the key dialogs like every dialog, not exempt them

Alternative considered: a kit option to turn the trap off, set by the key
dialogs, keeping the spec as it is. Rejected by the branch owner: it would
make the key dialogs the only modal dialogs whose Tab reaches the page behind
an inert backdrop, and add a flag to the kit for one consumer.

### D2. Stub the layout in the PassphraseModal tests, not mock the trap

The tests stub `Element.prototype.getClientRects` to return one rect for
every element, as the kit's own trap tests do, so the trap sees the dialog's
controls and runs its real logic. Mocking `useFocusTrap` away would test the
markup order only and leave the wrap untested; switching the suite to a
browser runner is out of proportion. The stub is scoped to the Tab-order
tests (a `describe` with its own `beforeEach`/`afterEach`), so the other
tests keep jsdom's defaults.

### D3. The confirmation scenario is tested where the confirmation is opened

"A confirmation over a key dialog holds the focus" opens the unsaved-changes
confirmation with Escape after typing, as "Typed passphrase kept" does, then
presses Tab more times than the confirmation has controls and checks after
each press that the focus is inside the confirmation found with
`queryConfirmation()`. The kit lets only the top trap act (the confirmation
is nested in the creation dialog's DOM).

## Risks / Trade-offs

- [The stub marks hidden controls as rendered too] → the trap also leaves out
  `[inert]` content and disabled controls, and the assertions name the
  controls the spec lists, so a hidden control taking a stop would fail a
  test rather than pass silently.
- [The trap lives in the ui-kit pack, not in npm yet] → the tests run against
  the installed pack; going back to the npm release before ui-kit publishes
  the trap would fail these tests, which is the signal wanted.
