# Tasks

## 1. Decline from the keyboard

- [ ] 1.1 Make `UnsavedChangesDialog` ignore an Enter whose target is a button or a control with the button role (D1); verify with tests "Enter on the dialog confirms" and "Enter on the cancel button declines" in a new `packages/shared/dialogs/unsaved-changes-dialog/__tests__/UnsavedChangesDialog.test.tsx`, "Typed passphrase kept from the keyboard" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` (Escape, Tab to Common:CancelButton, Enter, input still there), `cd packages/shared && pnpm exec vitest run dialogs` green, then `pnpm test:client` for the other callers of the dialog
- [ ] 1.2 Cover it end to end in `packages/client/__tests__/key-flow-edge-cases.spec.ts` ("Typed passphrase kept from the keyboard"); verify with that spec under Docker

## 2. Focus return across replaced dialogs

- [ ] 2.1 Reproduce in a browser: generate a key from Common:GenerateNewKey with the keyboard, cancel on the recovery-phrase display (Escape, confirm) and read `document.activeElement`; do the same for the recovery flow's new-passphrase prompt; record the result (browser, kit build) in design.md D2. If the focus is back on the opener, tick 2.2 as not needed with that record
- [ ] 2.2 Capture the opener in `useGenerateKeyFlow` and `useRecoverKeyFlow` when the flow starts and focus it when the flow ends (D2); verify with tests "Recovery display cancelled from the keyboard" in `packages/shared/dialogs/key-generation/__tests__/useGenerateKeyFlow.focus.test.tsx` and "New passphrase prompt cancelled" in a new `packages/shared/dialogs/key-recovery/__tests__/useRecoverKeyFlow.focus.test.tsx`, each asserting `toHaveFocus()` on the trigger after the second dialog closes
- [ ] 2.3 Add "Focus back after the recovery display" to the keyboard-only pass in `packages/client/__tests__/keys-management.spec.ts`; verify under Docker

## 3. Focus after a failed action

- [ ] 3.1 Reproduce in a browser: unlock with a wrong passphrase from the keyboard and read `document.activeElement` once Common:InvalidPassphrase is shown; the same for a wrong recovery phrase and for a wrong current passphrase in the passphrase-change dialog; record the result per browser in design.md D3. If the field keeps the focus everywhere, tick 3.2 as not needed with that record
- [ ] 3.2 Refocus the invalid field once the failed action has settled in `PassphraseModal`, `RecoveryPhraseInputModal` and `KeyRotationDialog` (D3); verify with tests "Focus kept after a wrong passphrase" in `PassphraseModal.test.tsx`, "Focus kept after a wrong recovery phrase" in `packages/shared/dialogs/key-recovery/__tests__/RecoveryPhraseInputModal.test.tsx` and "Focus kept after a wrong current passphrase" in `keys-management/modals/__tests__/KeyRotationDialog.keyboard.test.tsx` (the test blurs the field before the error lands, then `toHaveFocus()`)
- [ ] 3.3 Add "Typing again after a wrong passphrase" to the keyboard-only pass in `keys-management.spec.ts` (wrong passphrase, Enter, then type without Tab and unlock); verify under Docker

## 4. Action links

- [ ] 4.1 Switch the key dialogs' action links from `activateOnEnter` to `activateAsButton` and delete `activateOnEnter` with its last caller (D4); verify with "Held Enter on an action link" in `packages/shared/dialogs/__tests__/key-dialog-keys.test.ts` (a repeated keydown clicks once) and `pnpm run tsc`

## 5. Integration

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify all green

## Workflow follow-up

- `private-rooms-release-gate` 1.9 counts the two archived keyboard changes as the accessibility pass; this change follows them and is archived before that box is ticked.
- Archive with `/opsx:archive private-rooms-key-dialog-keyboard-followups` after review; verify the merged `key-management` spec describes the behaviour on the branch.
