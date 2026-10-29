# Tasks

## 1. ui-kit: IconButton role and name (docspace-ui-kit-react, release/v4.1.0)

- [x] 1.1 Add `role` and `ariaLabel` to `IconButtonProps`, worded like `Link`'s and rendered on the element (D2); regenerate the README prop table with `pnpm run readme:props` and note the props under _Added_ in CHANGELOG.md; verify with a new test "puts role and aria-label on the element" in `components/icon-button/IconButton.test.tsx`, and `pnpm run tsc`, `pnpm test`, `pnpm run readme:props:check` and `pnpm build` green in the kit, committed on release/v4.1.0 without a feature branch
- [x] 1.2 Pack the kit with `pnpm pack` and bring it here with `pnpm run update-ui-kit`; verify the script's hash check passes, `pnpm test` (shared) and `pnpm test:client` stay green, and commit the tarball with `pnpm-lock.yaml`

## 2. Enter-and-Space activation

- [x] 2.1 Add `activateAsButton` next to `activateOnEnter` in `packages/shared/dialogs/key-dialog-keys.ts` (D3); verify with tests in `packages/shared/dialogs/__tests__/key-dialog-keys.test.ts` for Enter, Space, an auto-repeat and an already handled key, and `pnpm exec tsc --noEmit -p tsconfig.json` in shared

## 3. Key card actions

- [x] 3.1 Give the change-passphrase, export and delete actions in `KeysList.tsx` `tabIndex` (-1 while deleting), `role="button"`, `ariaLabel` and `activateAsButton` (needs 1.2, 2.1); verify with tests "Tab across the key card", "Key card actions announced", "Action disabled during a deletion" and "Delete from the keyboard" (Space calls the delete handler, Enter on export calls the export handler) in `keys-management/__tests__/KeysList.test.tsx` with the real kit

## 4. Page actions and device settings

- [ ] 4.1 Give the import, recovery-phrase, forget-device and lock-now links in `KeysManagement.tsx` `role="button"`, `tabIndex={0}` and `activateAsButton`; verify with tests "No key yet", "Text actions announced" and "Lock with Space" in a new `keys-management/__tests__/KeysManagement.test.tsx` (the page inside mobx-react's `Provider` with a fake `userStore`, `useEncryption`, the flow hooks and the passkey and device-unlock services mocked, D6)
- [ ] 4.2 Name the passkey toggle through the kit's `label` prop and the auto-lock selector through a group labelled by its Common:AutoLockLabel heading (D4); verify with tests "Passkey toggle" and "Device section" in `KeysManagement.test.tsx`, and "Auto-lock selector" and "Moving through the open list" (arrows move the highlight, Enter selects, the button stays `role="button"`) in a new `keys-management/__tests__/AutoLockSetting.test.tsx`

## 5. Integration

- [ ] 5.1 Extend the keyboard-only pass in `packages/client/__tests__/keys-management.spec.ts`: once the key is registered, focus Common:ChangePassphrase, Tab to Common:ExportKey and check its computed outline is not `none` ("Focused key card action"; add the D5 style only if it is), Enter opens the export prompt with the focus in its field ("Export from the keyboard"), unlock with Enter and check the focus is back on Common:ExportKey, Space on Common:Delete opens the warning with no DELETE sent ("Delete from the keyboard"), Space on Common:LockNow locks ("Lock with Space"); add a no-key test where Enter on Common:ImportKey opens the file chooser; verify with the spec under Docker through `tests-dev` after rebuilding the `client-tests` image with `pnpm test:e2e:docker:build`, re-recording only a baseline the passkey label still moves
- [ ] 5.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify all green

## Workflow follow-up

- Archive `private-rooms-dialog-keyboard-and-focus` before this change, so the main key-management spec takes its requirements first.
- Consider switching the key dialogs' action links from `activateOnEnter` to `activateAsButton` in a change of their own.
- Archive this change after review; verify the merged `key-management` spec describes the behaviour on the branch.
