# Design

## Context

The review of 2026-10-30 read the dialogs against ui-kit 4.1.0: `Modal`
(`components/modal-dialog/sub-components/Modal`) records
`document.activeElement` in an insertion effect when `visible` turns true
and, in its effect cleanup, focuses that element when the focus left with
the dialog. `FieldContainer` renders the error text and attaches it to the
field only while the field has an error. The kit inputs lose the focus in
Chrome when they become disabled (Firefox keeps it), which jsdom does not
reproduce. `UnsavedChangesDialog` (`packages/shared/dialogs/unsaved-changes-dialog`)
is shared with the rest of the product and listens for Enter on the window
through `useEventListener`; since 2026-10-29 it also cancels the key's
default action, so the focused button no longer gets its click.

No stashed design document covers these; the archived changes of 2026-10-29
are the reference, and the code matches them except for the four points of
the proposal.

## Goals / Non-Goals

**Goals:**
- Declining the discard confirmation from the keyboard keeps the input.
- Every key-dialog flow returns the focus to its opener, whichever dialog
  ends it.
- The user stays in the dialog after a failed action.

**Non-Goals:**
- A focus trap; changing the kit's focus restore for the general case.

## Decisions

### D1. The confirmation acts on Enter only from the dialog surface

`UnsavedChangesDialog` keeps its window listener (Enter anywhere while it is
visible means "close"), but ignores an Enter whose target is a button or a
control with the button role, so the focused button's own activation runs:
Common:CloseMenu confirms, Common:CancelButton declines. Alternative: drop
the window listener and rely on the buttons alone; rejected, since Enter
with the focus on the dialog itself (where the kit puts it on open) would
then do nothing. The change is in the shared dialog, so every caller gets
it; their tests are run.

### D2. The flows capture the opener once, before the first dialog

`useGenerateKeyFlow` and `useRecoverKeyFlow` remember `document.activeElement`
when the flow starts (the control that called `start`) and focus it when the
flow ends, whatever dialog ended it, instead of relying on each dialog's own
restore for a dialog that replaced another. The kit's restore stays in place
for the first dialog and is harmless afterwards: it focuses the body, which
the flow's own restore then overrides. Alternative: keep the previous dialog
mounted and hidden while the next one opens; rejected, it changes the
dialogs' mount contract and their close guards. Reproduced in a browser
before implementation (task 2.1); if the kit records the right opener after
all, the code task is closed with the recorded run and no code.

### D3. The error path refocuses its field

The passphrase prompt, the passphrase-change dialog and the recovery-phrase
input focus the invalid field once the pending action has failed (`isLoading`
false and an error set), through a ref on the field and an effect on the
error state. This is a no-op in jsdom and in Firefox, where the field never
lost the focus. Reproduced in a browser first (task 3.1).

### D4. One helper for the links

The key dialogs' action links move from `activateOnEnter` to
`activateAsButton` (Enter and Space, one activation per held key), the
follow-up the archived keys-page change named; `activateOnEnter` goes with
its last caller.

### D5. Tests

Unit tests cover D1 (Tab to the cancel button of the confirmation, then
`userEvent.keyboard("{Enter}")`) and D4 (a repeated keydown on a link); the
browser-only gaps D2 and D3 are pinned by Playwright cases in the
keyboard-only pass of `keys-management.spec.ts` (focus back on
Common:GenerateNewKey after cancelling the recovery display from the
keyboard; focus still in the passphrase field after a wrong passphrase) and
by jsdom tests of the flows for the explicit restore.

## Risks / Trade-offs

- [The shared confirmation dialog changes for every caller] → the change is
  a narrowing (Enter on a button lets the button act), covered by the
  dialog's own test; callers that relied on Enter anywhere to confirm keep
  it for Enter outside the buttons.
- [Browser-only behaviour regresses unnoticed] → the Playwright cases run
  under Docker in the E2E suite, not in the unit gate; the tasks say so.

## Migration Plan

Code only, behind the existing flag; no data, server or kit migration.
