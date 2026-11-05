# Tasks

## 1. PassphraseModal tab tests

- [ ] 1.1 Group the tab-order tests of `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` in a `describe` block whose `beforeEach` stubs `Element.prototype.getClientRects` with one rect and restores it afterwards (D2); verify "Forward through the creation dialog" and "Backwards from the primary action" pass unchanged with `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal`
- [ ] 1.2 Replace the "No trap" test with "Tab from the last action wraps" and "Shift+Tab from the first stop wraps" (D3), each asserting the named control that takes the focus and that the dialog contains `document.activeElement`; verify with `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal` and `pnpm test` (shared) green

## 2. Specs and gate

- [ ] 2.1 Confirm the key-management delta spec matches the behaviour on the branch; verify with `npx -y @fission-ai/openspec@latest validate private-rooms-key-dialog-focus-trap --strict` (`OPENSPEC_TELEMETRY=0`)
- [ ] 2.2 Record in this change's README.md that it depends on the docspace-ui-kit-react release carrying `useFocusTrap` (commits 11689902, 974277c5) and must not reach `release/v4.1.0` ahead of it; verify by reading the README
- [ ] 2.3 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, shared, client, sdk and doceditor unit tests); E2E `cd packages/client && pnpm exec playwright test __tests__/keys-management.spec.ts __tests__/modal-focus-trap.spec.ts` under Docker stays green
