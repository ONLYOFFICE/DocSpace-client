# Design

## Context

See proposal.md for the motivation. What shapes the approach, all read in the
code on the branch and in `docspace-ui-kit-react` release/v4.1.0:

- The page is `KeysManagement.tsx` (keys-management tab of the profile), the
  key card is `KeysList.tsx`, the auto-lock selector `AutoLockSetting.tsx`.
- Kit `IconButton` renders a `<div>` (through `TooltipContainer`) with
  `aria-disabled` and no role. Its props document `tabIndex` and `onKeyDown`
  for the consumer to make it keyboard-operable ("Enter and Space do nothing
  unless this handler implements them") but have no `role`. `title` is
  consumed by the shared tooltip and never reaches the DOM outside
  `NODE_ENV=test`. Unknown props are spread onto the `<div>`, so a hyphenated
  `aria-label` passes, a `role` does not type-check. The click handler already
  ignores clicks while `isDisabled`.
- Kit action `Link` is an `<a>` without `href`; its props document `role`
  ("button", since it acts), `tabIndex` and `onKeyDown` for the same purpose,
  and a string child becomes its `aria-label`.
- Kit `ToggleButton` wraps a visually hidden, focusable checkbox in a
  `<label>`; its `label` prop renders the text inside that label. The page
  renders the passkey text as a separate `Text` beside it, so the checkbox has
  no name.
- Kit `ComboBox` is reachable and keyboard-operable (Enter, Space and the
  arrows on its `role="button"`), named by the selected option's label only;
  it forwards no ARIA props to the button, and a `<label>` cannot name a
  `<div>`. Its README records the unannounced highlight as a kit limitation.
- Generate, delete-unused and reset are kit `Button`s, native buttons that
  need nothing.
- Precedents in the client: `EditRoomGroupsDialog/sub-components/GroupItem.tsx`
  gives `IconButton`s `tabIndex={disabled ? -1 : 0}` and an Enter handler;
  the key dialogs give action links `role="button"`, `tabIndex={0}` and
  `onKeyDown={activateOnEnter}` (`packages/shared/dialogs/key-dialog-keys.ts`).
- No stylesheet in the kit's `IconButton` or `Link`, in the shared styles or
  in the page sets `outline: none`; a focused element with a `tabindex` gets
  the browser's `:focus-visible` ring.
- None of the stashed design documents covers the keys page's keyboard use;
  the code is the only reference.

## Goals / Non-Goals

**Goals:**

- Every control of the page usable and named from the keyboard, with the
  wiring at the call sites, as the kit documents it.
- One Enter-and-Space activation used by every non-native action on the page.
- The keyboard-only E2E pass of the dialog change drives the page too.

**Non-Goals:**

- Changing the default behaviour of `IconButton`, `Link` or `ComboBox` for
  the rest of the product.
- Touching the key dialogs' own links (they keep `activateOnEnter`).

## Decisions

### D1. Wire the keyboard at the call sites, as the kit documents

Each key card action gets `tabIndex={isDeleting ? -1 : 0}`, the button role,
a name and the activation handler (D3); each action link gets
`role="button"`, `tabIndex={0}` and the same handler. The actions' own
`onClick` stays the only place that acts, so the busy and disabled guards
already there apply to the keyboard as well.

Alternative considered: make a clickable `IconButton` and an action `Link`
keyboard-operable by default in the kit. Rejected here: it adds a tab stop to
every icon button and action link in the product, which is a product-wide
decision for the kit, not a private-rooms change.

### D2. Kit: `IconButton` accepts `role` and `ariaLabel`

`IconButtonProps` gains `role?: React.AriaRole` and `ariaLabel?: string`,
worded and placed like `Link`'s, rendered on the `<div>`; without them
nothing changes. The README prop table is regenerated from the JSDoc, the
change goes under _Added_ in the kit's CHANGELOG, a kit unit test pins that
both reach the element, and the commit lands on release/v4.1.0 without a
feature branch, followed by `pnpm run update-ui-kit` here.

Alternatives considered:

- Passing `role` through a spread or a cast in the client: works, but hides
  from the kit's types and docs a use the kit itself recommends.
- Only `aria-label` (it type-checks as a hyphenated attribute): ARIA does not
  allow a name on a generic `<div>`, so without the role it is not reliably
  announced.

### D3. One activation helper for Enter and Space

`activateAsButton` joins `activateOnEnter` in
`packages/shared/dialogs/key-dialog-keys.ts`: on Enter or Space that nothing
has handled and that is not an auto-repeat, it prevents the default (Space
would scroll the page) and clicks the element, so the action's own `onClick`
runs exactly as for a pointer. It is tested in
`dialogs/__tests__/key-dialog-keys.test.ts` with the same fake events as its
sibling.

Alternatives considered:

- Extending `activateOnEnter` to Space: changes the key dialogs' links, which
  belong to `private-rooms-dialog-keyboard-and-focus`, and its test treats
  Space as a key to ignore. Recorded as a follow-up in the proposal.
- A page-local handler like `GroupItem`'s: a third copy of the same logic,
  and Enter only.
- Activating Space on keyup as a native button does: the action may open a
  dialog that takes the focus between keydown and keyup; acting on keydown,
  once per press, keeps the key with the control that had it.

### D4. Names

- Key card actions: `ariaLabel` with the key their `title` already uses
  (Common:ChangePassphrase, Common:ExportKey, Common:Delete).
- Action links: their visible text, which the kit already turns into the name.
- Passkey toggle: the kit's `label` prop with Common:PasskeyUnlockLabel,
  replacing the separate `Text` (a decision for a human in the proposal; the
  fallback is an `aria-label` on the toggle and the `Text` kept).
- Auto-lock selector: its block becomes a `role="group"` labelled
  (`aria-labelledby`) by the existing Common:AutoLockLabel heading, so a
  screen reader entering it reads the label and then the button with the
  selected preset. An `aria-label` on the button would replace the preset it
  announces today, and the kit forwards none anyway.

### D5. Visible focus comes from the browser

No style is added: the focused `<div>` and `<a>` get the browser's
`:focus-visible` ring. The E2E pass checks the computed outline of a focused
key card action; only if it reads `none` does the page get a focus style of
its own, in `KeysManagement.module.scss`, coloured by a theme variable
(no hardcoded colour, which the source checks reject).

### D6. Tests

- Kit: `IconButton.test.tsx`, role and `aria-label` on the element.
- Shared: `key-dialog-keys.test.ts`, Enter, Space, a repeat, a handled key.
- Client unit: `KeysList.test.tsx` with the real kit, the three actions by
  role and name, their Tab order, Enter and Space calling the handlers, no tab
  stop while deleting; `AutoLockSetting.test.tsx` (new), the group named
  Common:AutoLockLabel holding the button; a `KeysManagement.test.tsx`
  (new) for the action links (role, Tab, Space on Lock now) and the passkey
  toggle's name. The page is exported only through `inject`, so the test
  renders it inside mobx-react's `Provider` with a fake `userStore` and mocks
  `useEncryption`, the eight flow hooks and the passkey and device-unlock
  services with `vi.mock`.
- E2E (`keys-management.spec.ts`): the keyboard-only pass opens export from
  the keyboard (focus on Common:ChangePassphrase, Tab to Common:ExportKey,
  Enter), checks the focus ring, and checks that the focus is back on
  Common:ExportKey once the prompt closes; a no-key test presses Enter on
  Common:ImportKey and waits for the file chooser; Space on Common:LockNow
  locks. Run through `tests-dev` after the kit tarball is refreshed and the
  `client-tests` image rebuilt.

## Risks / Trade-offs

- [The toggle's `label` prop moves or restyles the passkey text] → the E2E
  screenshots of the page are checked; if it moves, D4's fallback keeps the
  layout.
- [A global hotkey takes Enter or Space on the profile page before the
  control] → the E2E pass presses real keys on each kind of control.
- [Focus return after deleting the only key] → the card is gone when the
  dialog closes, so the focus cannot return there; the dialog change's
  requirement already limits the return to a control still on the page.
- [Kit addition] → opt-in props, no default changes; the client needs the
  refreshed tarball before the key card can pass `role`.

## Migration Plan

No data or server change. The behaviour ships with the page; a revert of the
commits restores the previous one. The kit addition is backwards compatible.
