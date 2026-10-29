# Proposal

## Why

Keys management (Profile > Keys management) cannot be used without a pointer.
The key card's actions (change passphrase, export, delete) are the kit's
`IconButton`, a `<div>` that is no tab stop, answers no key and has no role or
name, and the page's action links (Import key, Use recovery phrase, Forget
device, Lock now) are anchors without `href`, which are no tab stop either.
The keyboard-only E2E pass of `private-rooms-dialog-keyboard-and-focus`
(task 6.1) had to open the export prompt with a click for that reason, and a
keyboard or screen-reader user cannot export, rotate or delete a key, import
one, recover with the phrase or lock the device at all. Two controls that do
take the focus are unnamed: the passkey toggle, whose label is a separate
text, and the auto-lock selector, which is named only by its selected value.

## What Changes

- The three key card actions become buttons for the keyboard and assistive
  technology: a tab stop each, activated by Enter and Space, exposed with the
  button role and named Common:ChangePassphrase, Common:ExportKey and
  Common:Delete. A disabled action (while a key is being deleted) is no tab
  stop.
- The page's action links (Common:ImportKey, Common:UseRecoveryPhrase,
  Common:ForgetDeviceButton, Common:LockNow) become tab stops with the button
  role, activated by Enter and Space; their visible text stays their name.
- The passkey toggle is named by its label, Common:PasskeyUnlockLabel, and the
  auto-lock selector by Common:AutoLockLabel, so a screen reader says what is
  being switched or chosen and not only its value.
- Tab moves through the page's controls in their displayed order; every
  control shows a visible focus indicator.
- A dialog opened from one of these controls hands the focus back to it when
  it closes (the behaviour `private-rooms-dialog-keyboard-and-focus` added to
  the key dialogs), which the keyboard can now reach and test.
- A ui-kit addition, in `docspace-ui-kit-react` on release/v4.1.0:
  `IconButton` accepts `role` (and `ariaLabel`, as `Link` does). Its props
  have no `role` today, so a consumer cannot expose an icon button as a
  button without a cast; nothing changes for consumers that do not pass it.
- The keyboard-only E2E pass opens the export prompt from the keyboard
  instead of with a click, and checks that the focus returns to the export
  action.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: new requirements that the keys management
  page is operable from the keyboard (tab stops, Enter and Space, order,
  visible focus) and that its controls are named for assistive technology.
  No existing requirement text changes; the open change
  `private-rooms-dialog-keyboard-and-focus` modifies "Key dialogs are
  accessible and adapt to narrow screens", which this change leaves alone.

## Impact

- Client: `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/`
  (`KeysList.tsx`, `KeysManagement.tsx`, `AutoLockSetting.tsx`) and its unit
  tests; the E2E spec `packages/client/__tests__/keys-management.spec.ts`.
- Shared: one key helper next to `activateOnEnter` in
  `packages/shared/dialogs/key-dialog-keys.ts` for Enter and Space, with its
  test.
- ui-kit: the `IconButton` prop addition, committed on release/v4.1.0 of
  `docspace-ui-kit-react` (no feature branch), and a refreshed tarball here
  through `pnpm run update-ui-kit`.
- Locales: no new keys; every name reuses an existing Common key.
- Server (`../server`) and Document Server: no work; nothing in this change
  touches a request or a response.
- Builds on `private-rooms-dialog-keyboard-and-focus` (implemented on the
  branch): the focus return and the keyboard-only E2E pass come from it.

## Out of scope

- The key dialogs themselves; their keyboard behaviour is the other change's.
  Their action links (generate, forgot passphrase, passkey) keep answering
  Enter only; switching them to the new Enter-and-Space helper is a follow-up.
- Making every `IconButton` or action `Link` in the product keyboard-operable
  by default in the kit; that changes the tab order of the whole product and
  is a decision for the kit, not for this feature.
- The `ComboBox` role (`button` rather than `combobox`) and its unannounced
  highlighted option, documented as a kit limitation.
- Other Profile tabs.

## Decisions for a human

- The `IconButton` prop addition in the kit (recommended) rather than passing
  `role` through a cast in the client.
- The passkey toggle takes its label through the kit's `label` prop, which
  replaces the separate text beside it and may move it slightly; the
  alternative is an `aria-label` on the toggle with the text left as it is.
