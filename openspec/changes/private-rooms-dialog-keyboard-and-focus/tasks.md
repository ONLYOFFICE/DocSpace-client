# Tasks

## 1. ui-kit fix (docspace-ui-kit-react, release/v4.1.0)

- [x] 1.1 Fix `components/modal-dialog/sub-components/Modal.tsx` so the focus restore is registered even when the content already holds the focus on open; verify with a new test "hands the focus back after a field inside took it on open" in `components/modal-dialog/ModalDialog.test.tsx` and `pnpm test` green in the kit
- [x] 1.2 Record the focus fix under Unreleased in the kit's CHANGELOG.md; `useLiveRegionText` stays out of the kit's `hooks` barrel, which is part of its plugin API, and the client imports it by its deep path; verify with `pnpm build` in the kit and the deep import `@onlyoffice/apps-ui-kit/hooks/useLiveRegionText` resolving from `packages/shared`
- [x] 1.3 Pack the kit and bring it here with `pnpm run update-ui-kit`; verify the script's hash check passes, `pnpm test` (shared) and `pnpm test:client` stay green, and commit the tarball with `pnpm-lock.yaml`
- [x] 1.4 Make the kit's `Checkbox` keep the focus when it toggles (D10): the native input takes `tabIndex` and the focus, the icon is decorative, the focus border follows the input; correct the README, the story's `tabIndex` description and play function and the `tabIndex` JSDoc, and note it under Unreleased in CHANGELOG.md; verify with a new test "keeps the focus on the checkbox when Space toggles it" in `components/checkbox/Checkbox.test.tsx`, the held-Space test moved to the input, and `pnpm test` and `pnpm build` green in the kit, committed on release/v4.1.0
- [x] 1.5 Pack the kit again and bring it here with `pnpm run update-ui-kit`; verify the script's hash check passes, `pnpm test` (shared) and `pnpm test:client` stay green, and commit the tarball with `pnpm-lock.yaml`

## 2. Backdrop and close confirmation

- [x] 2.1 Set `closeOnBackdropClick={false}` on the four shared key dialogs; verify with tests "Backdrop click on the unlock prompt", "Escape still cancels" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` and "Backdrop click on the key-change dialog" in a new `packages/shared/dialogs/key-change-dialog/__tests__/KeyChangeDialog.test.tsx`
- [x] 2.2 Set `closeOnBackdropClick={false}` on `KeyRotationDialog` and `ResetKeysConfirmDialog`; verify with a backdrop test in each dialog's test file under `keys-management/modals/__tests__/`
- [x] 2.3 Add the close guard with `UnsavedChangesDialog` to the creation dialog, `KeyRotationDialog`, `RecoveryPhraseInputModal` and `RecoveryPhraseDisplayModal` (D2, including the ref-based Escape guard); verify with tests "Typed passphrase kept", "Typed passphrase discarded", "Nothing typed yet", "Recovery phrase not yet acknowledged", "Unlock prompt closes at once" next to the dialogs, and `pnpm test` (shared) and `pnpm test:client` green
- [x] 2.4 Cover the confirmation end to end in `packages/client/__tests__/key-flow-edge-cases.spec.ts` ("Typed passphrase kept", "Typed passphrase discarded"); verify with `cd packages/client && pnpm exec playwright test __tests__/key-flow-edge-cases.spec.ts` under Docker

## 3. Labels and error announcement

- [x] 3.1 Give the creation and unlock fields visible labels through `FieldContainer` (`labelText`, `labelFor`, input ids) and drop `labelVisible={false}`; verify by rewriting "Passphrase field" in `packages/shared/dialogs/__tests__/key-dialogs.a11y.test.tsx` to `getByLabelText("Common:Passphrase")` and `getByLabelText("Common:ConfirmPassphrase")`, and `cd common/tests && npx vitest run test/locales.test.js` green
- [x] 3.2 Give the three passphrase-change fields visible labels; verify with a new test "Passphrase-change fields" in `keys-management/modals/__tests__/keyDialogs.a11y.test.tsx` using `getByLabelText` for Common:CurrentPassphrase, Common:NewPassphrase and Common:ConfirmNewPassphrase
- [x] 3.3 Add the hidden live region fed by `useLiveRegionText` to the passphrase, passphrase-change and recovery-phrase-input dialogs, with the error attached to the field by `FieldContainer`; verify with tests "Mismatched confirmation", "Wrong passphrase announced", "Error cleared" in `PassphraseModal.test.tsx` and "Wrong recovery phrase" in a new `packages/shared/dialogs/key-recovery/__tests__/RecoveryPhraseInputModal.test.tsx` (`aria-invalid`, `aria-describedby` resolving to the message, region text once)
- [x] 3.4 Move the E2E dialog locators from placeholders and `input[name]` to `getByLabel` in `keys-management.spec.ts`, `keys-management-advanced.spec.ts`, `key-flow-edge-cases.spec.ts` and `private-room-tofu.spec.ts`; verify with those specs under Docker

## 4. Focus and Tab order

- [x] 4.1 Remove the hand-assigned `tabIndex` values from `PassphraseModal` and check the markup order of fields, links, checkbox and actions; verify with tests "Forward through the creation dialog", "Backwards from the primary action", "No trap" in `PassphraseModal.test.tsx` using `userEvent.tab()` and `toHaveFocus()`
- [x] 4.2 Pin focus on open; verify with tests "Prompt opened" in `PassphraseModal.test.tsx`, "Key-change dialog opened" in `KeyChangeDialog.test.tsx` and "Opened as an aside panel" in `key-dialogs.a11y.test.tsx` (narrow-width helper, `document.activeElement` inside the panel)
- [x] 4.3 Pin focus return (needs 1.3); verify with tests "Unlock completed" in `PassphraseModal.test.tsx` and "Generation cancelled from the keyboard" in `packages/shared/dialogs/key-generation/__tests__/useGenerateKeyFlow.test.tsx`, each rendering a trigger button and asserting `toHaveFocus()` on it after the dialog closes

## 5. Enter from text fields and busy state

- [x] 5.1 Add the shared Enter helper in `packages/shared/dialogs` (D5) and migrate `PassphraseModal` to it; verify with the existing Enter tests in `PassphraseModal.test.tsx` green and a helper test `packages/shared/dialogs/__tests__/enter-submit.test.ts` covering Enter, Shift+Enter on a textarea, disabled action and an already-handled event
- [x] 5.2 Adopt the helper in `KeyRotationDialog`; verify with tests "Passphrase change on Enter", "Enter while the action is disabled", "Enter on the cancel action" in `keys-management/modals/__tests__/KeyRotationDialog.test.tsx`
- [x] 5.3 Adopt the helper in `RecoveryPhraseInputModal`; verify with tests "Recovery phrase on Enter" and "Line break in the recovery phrase" in `RecoveryPhraseInputModal.test.tsx`
- [x] 5.4 Adopt `submitOnEnter` in `ResetKeysConfirmDialog` (its token field is a kit `TextInput`, tabbable on its own); verify with test "Reset token on Enter" in the existing `keys-management/modals/__tests__/ResetKeysConfirmDialog.test.tsx`
- [x] 5.5 Pin the busy state; verify with tests "Unlock in progress" and "Busy reported to assistive technology" in `PassphraseModal.test.tsx` (`aria-busy` on the primary action, fields disabled, submit spy called once)

## 6. Integration

- [x] 6.1 (needs 1.5) Add a keyboard-only pass to `packages/client/__tests__/keys-management.spec.ts` (Tab through the creation dialog, Enter to confirm, acknowledge the phrase, unlock with Enter) on desktop and mobile; verify with that spec under Docker through `tests-dev` (the `client-tests` image predates the dialog changes; see design.md, Implementation notes) and re-record only a baseline a layout change still moves (the passphrase-create baselines were re-recorded in 3.4)
- [x] 6.2 Note the role-and-name, `userEvent.tab`/`toHaveFocus` and `defaultPrevented` patterns in `.claude/rules/unit-tests.md`; verify by reading the rule back against the tests of groups 2 to 5
- [ ] 6.3 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify all green

## Workflow follow-up

- Point task 1.9 of `private-rooms-release-gate` at the tests of this change instead of the ux-gaps checks, in its own planning commit.
- Archive the change after review; verify the merged `key-management` spec describes the behaviour on the branch.
