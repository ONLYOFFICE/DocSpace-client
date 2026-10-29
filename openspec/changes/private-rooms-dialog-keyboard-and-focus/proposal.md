# Proposal

## Why

The key dialogs (passphrase create and unlock, recovery phrase display and
input, key change, passphrase change, reset) are the only place where a user
types secrets, and they are the surface the release gate wants an
accessibility pass on (private-rooms-release-gate task 1.9). Today a click
beside the dialog silently cancels the flow, nothing in the specs says where
the focus goes or returns, Tab order is hand-numbered, Enter confirms only the
passphrase dialog, and the passphrase fields have no label because the
version of the ui-kit they were written against could not tie a label and an
error message to a field. The ui-kit now on the branch (4.1.0, merged from
release/v4.1.0) moves focus into a dialog on open and back on close, wires
`aria-invalid` and `aria-describedby` from a field container to its control,
exposes a switch for the backdrop click, and announces busy buttons and
alerts, so the behaviour can be specified and most of it comes for free.

## What Changes

- Key dialogs no longer close on a click on the backdrop; the header cross,
  Escape and the dialog's own actions remain the only ways out.
- Closing a key dialog that already holds what the user typed (a new
  passphrase, a passphrase change, a recovery phrase being entered) or the
  one-time recovery phrase that is not yet acknowledged asks for confirmation
  first, through the existing unsaved-changes dialog. The unlock prompt, the
  reset-token dialog and the key-change dialog close without a question.
- Every key dialog takes the focus when it opens (its first text field, else
  the dialog itself) and returns it to the control that opened it when it
  closes, in both the modal and the aside presentation. Tab moves through the
  dialog in visual order; the hand-numbered `tabIndex` values go away.
  Focus is deliberately not trapped in this version.
- Enter confirms every key dialog from any of its text fields when the primary
  action is enabled, including the recovery phrase field, where Shift+Enter
  keeps inserting a line break. Enter on a button, link or checkbox is left to
  that control.
- The passphrase fields get visible labels from the existing Common keys
  (Passphrase, ConfirmPassphrase, CurrentPassphrase, NewPassphrase,
  ConfirmNewPassphrase); each field's error message is associated with it and
  announced, and a pending action marks the primary button busy and disables
  the fields. This lifts the v1 limitation "placeholder is the accessible
  name".
- A ui-kit fix, in the `docspace-ui-kit-react` repository: ModalDialog does not
  register its focus restore when a field inside the dialog is already focused
  on open (React `autoFocus` runs before the effect), so a dialog with an
  autofocused field never hands the focus back. Verified in
  `components/modal-dialog/sub-components/Modal.tsx` on release/v4.1.0.
- Tests follow the patterns the spike/vitest-addon PR introduced: role and
  accessible-name queries, `userEvent.tab` with `toHaveFocus`,
  `defaultPrevented` for key handling, and the kit's test ids for the
  dialog chrome. One keyboard-only E2E pass covers passphrase creation and
  unlock.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the requirement "Key dialogs are accessible
  and adapt to narrow screens" loses its SHALL NOT on labels and gains the
  error association; new requirements cover the backdrop click, the close
  confirmation, focus on open and close, Tab order (with the no-trap
  limitation), Enter from text fields, and busy and error announcements. The
  key-change dialog's refuse action is no longer reachable by a backdrop
  click, which tightens "Key-change dialog" without changing its text.

## Impact

- Shared dialogs: `packages/shared/dialogs/passphrase-modal`,
  `key-generation/RecoveryPhraseDisplayModal`,
  `key-recovery/RecoveryPhraseInputModal`, `key-change-dialog`; client
  dialogs `keys-management/modals/KeyRotationDialog` and
  `ResetKeysConfirmDialog`. The SDK (`EncryptionShell`) and the editor
  (`EncryptionProviderWrapper`) render the same shared components and inherit
  the behaviour without their own change.
- Reused as is: `packages/shared/dialogs/unsaved-changes-dialog` and
  `packages/shared/hooks/useUnsavedChanges`; ui-kit `ModalDialog`
  (`closeOnBackdropClick`), `FieldContainer` (`labelText`, `labelFor`,
  `hasError`, `errorMessage`), `Button` (`aria-busy` while loading).
- Tests: `packages/shared/dialogs/__tests__/key-dialogs.a11y.test.tsx`
  (asserts the placeholder-only naming that this change removes),
  `passphrase-modal/__tests__/PassphraseModal.test.tsx`, the client
  `keyDialogs.a11y.test.tsx` and `KeyRotationDialog.test.tsx`, and the E2E
  specs `keys-management*.spec.ts`, `key-flow-edge-cases.spec.ts`,
  `private-room-tofu.spec.ts`, whose dialog locators may change.
- Locales: no new keys; labels and the confirmation reuse existing Common
  keys. The translation tests still run in the task that touches the labels.
- ui-kit: one fix in `docspace-ui-kit-react` on release/v4.1.0 and a refreshed
  tarball in this repository (`pnpm run update-ui-kit`). Until it lands, the
  "returns focus" scenarios for dialogs with an autofocused field fail; the
  task order keeps those tests last.
- Server (`../server`) and Document Server: no work; nothing in this change
  touches a request or a response.

## Out of scope

- Focus trapping inside the dialogs (recorded as a SHALL NOT for this
  version), the invite panel, the move and copy dialogs and the Members view:
  they are not key dialogs.
- Storybook or Vitest browser mode for the dialogs; the client has no
  Storybook, and that is an infrastructure decision for the whole repository.
- The hotkey ownership model the spike added to the client; it already leaves
  keys to an open dialog.
- Test-id and locator clean-up across the private-rooms E2E suite beyond the
  dialogs this change touches.

## Decisions taken

Confirmed by the feature owner on 2026-10-29, before implementation:

- The dialogs that ask before closing with typed data are passphrase
  creation, passphrase change, recovery phrase input, and the recovery phrase
  display before acknowledgement; the unlock prompt, the reset-token dialog
  and the key-change dialog close without a question.
- The confirmation reuses the generic unsaved-changes wording
  (Common:UnsavedChanges, Common:UnsavedChangesDescription); no new locale
  keys.
- Focus stays untrapped in this version; the spec records it as a SHALL NOT.
- Enter confirms every key dialog from its text fields, not only the
  passphrase prompt.
