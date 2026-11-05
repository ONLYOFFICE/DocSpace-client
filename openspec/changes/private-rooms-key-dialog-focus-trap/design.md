# Design

## Context

`private-rooms-dialog-keyboard-and-focus` (archived 2026-10-29) left focus
untrapped on purpose (its proposal, "Out of scope", and design D4: "No trap
is added (spec: SHALL NOT in this version)"). The reason was the kit, not the
product: `ModalDialog` had no trap, and adding one in the client for six
dialogs was out of scope. No stashed design document covers the decision.

The kit's `feature/keyboard-focus-a11y` branch adds `useFocusTrap`
(`hooks/useFocusTrap`) and turns it on in `ModalDialog`'s `Modal`
sub-component (`useFocusTrap(contentRef, !!visible && !hideContent)`) and in
`Aside`. It listens for `keydown` on `document`, cancels every Tab and
Shift+Tab, and moves the focus itself to the next or previous stop inside the
topmost open trap, wrapping at both ends. There is no prop to turn it off.
The client consumes that build as a local tarball
(`file:../../onlyoffice-apps-ui-kit.tgz`).

## Decisions

### D1. The key dialogs take the kit's trap as is

No client code changes. Every key dialog renders through `ModalDialog` (modal
or aside presentation), so all six get the trap from the kit. An opt-out prop
for key dialogs was considered and rejected: it would keep a behaviour the
WAI-ARIA modal pattern advises against, only to honour a limitation that was
recorded because the kit lacked the trap.

### D2. jsdom layout stub scoped to the PassphraseModal tab tests

The trap counts an element as a stop only if `getClientRects().length > 0`
and its computed `visibility` is not `hidden`. jsdom has no layout and always
returns an empty rect list, so the trap finds no stops, cancels the Tab and
leaves the focus where it is. That is why "Forward through the creation
dialog" and "Backwards from the primary action" fail although the markup
order is right.

The tab-order tests stub `Element.prototype.getClientRects` to return one
rect for the duration of each test (`vi.spyOn` in a `beforeEach` of a
`describe` block that groups them, restored afterwards). A stub in
`packages/shared/vitest/setupTests.ts` was rejected: every one of the other
213 shared test files would see every element as laid out, including ones
hidden with `display: none`, which some components and kit internals read to
decide what to render, and no other shared test tabs through a dialog today.
If more dialogs need Tab tests later, moving the stub into the setup is a
separate decision.

The stub makes elements under `display: none` count as stops too. The
PassphraseModal creation dialog renders no hidden controls in its tab path,
so the tests are not weakened; a future test of a dialog that does should
stub per element instead.

### D3. Wrap-around tests replace "No trap"

The "No trap" test is replaced by two tests named after the new scenarios,
"Tab from the last action wraps" and "Shift+Tab from the first stop wraps".
Each asserts the exact control that receives the focus (by role and name or
label) and that the dialog still contains `document.activeElement`. The first
stop is whatever the creation dialog renders first in its tab order (the
header's close control when the kit renders one, otherwise the passphrase
field); the test names it explicitly rather than computing it, so a change of
order is caught.

The `Spec:` pointer above the old test is kept on the new pair, pointing at
the same requirement, since the trap's behaviour is now the expected one but
still a requirement of its own.

## Risks

- The change is correct only while the client consumes a kit build with the
  trap. If `release/v4.1.0` is merged into this branch again, nothing
  changes; if this branch is merged into `release/v4.1.0` before the kit
  release that carries the trap, the wrap tests fail there. Task 2.2 records
  the dependency for the merge.
- E2E: `keys-management.spec.ts` walks the creation and recovery dialogs
  forward only and never past the last action, so it is unaffected;
  `modal-focus-trap.spec.ts` covers the trap in a real browser.
