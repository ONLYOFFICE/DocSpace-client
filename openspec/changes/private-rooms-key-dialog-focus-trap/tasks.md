# Tasks

## 1. Tests follow the trapped Tab order

- [x] 1.1 Move "Forward through the creation dialog" and "Backwards from the primary action" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` into a `describe` that stubs `Element.prototype.getClientRects` and restores it after each test (D2), and make "Forward" visit each field's show-passphrase toggle between the fields; verify both pass with `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal`, where without the stub they fail
- [x] 1.2 Replace "No trap" with "Tab wraps from the last control" and "Shift+Tab wraps from the first control" in the same `describe`, and point its `Spec:` line at "Tab in key dialogs follows the visual order and stays inside the dialog"; verify with the same command, that each fails when `useFocusTrap` is mocked to do nothing, and that `git grep "Tab order in key dialogs follows the visual order"` finds nothing outside `openspec/`
- [ ] 1.3 Add "A confirmation over a key dialog holds the focus" (D3); verify with the same command that the focus stays inside the confirmation for more Tab presses than it has controls, and that `pnpm test` (shared) is green
- [ ] 1.4 Add the layout stub to the jsdom gaps of the "Dialog and keyboard tests" section in `.claude/rules/unit-tests.md`; verify the section names the stub and `PassphraseModal.test.tsx` as its example

## 2. Keyboard-only E2E flows

- [ ] 2.1 In `packages/client/__tests__/keys-management.spec.ts`, step from the passphrase field to the confirmation field through its show-passphrase toggle in "Create a key and unlock it from the keyboard" and "Focus back after the recovery display" (D4); verify with `pnpm test:e2e:docker:build` and `docker-compose run --rm -T -e WORKERS=3 tests-local pnpm exec playwright test __tests__/keys-management.spec.ts __tests__/key-flow-edge-cases.spec.ts` in `packages/client`, all green

## 3. Integration

- [ ] 3.1 Run `npx -y @fission-ai/openspec@latest validate --all --strict`, `pnpm test` (shared) and `cd packages/client && pnpm exec vitest run src/pages/Profile`; verify all are green

## Workflow follow-up

- Archive the change with `/opsx:archive` and commit it as `OpenSpec: private-rooms-key-dialog-focus-trap: archive`.
- Verify the archived main spec `openspec/specs/private-rooms/key-management/spec.md` no longer contains "No trap" or "SHALL NOT trap".
