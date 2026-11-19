# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green. Test names carry the scenario names;
where a scenario covers several inputs, the case is parametrized and named
`<scenario>: <script>, <n> characters`. Non-Latin input is written directly
in the test files (design.md, Risks).

## 1. Strength service

- [x] 1.1 Score lowercase, uppercase, digits and punctuation by Unicode category in `checkPassphraseStrength` of `packages/shared/services/encryption/passphrase-strength.ts`, with a caseless letter in the lowercase slot (design.md, decision 2). Verify: cases "Cyrillic lowercase" (12, 16, 20 characters: fair, fair, good), "Caseless script" (12, 16, 20 CJK characters: fair, fair, good), "Cyrillic mixed case" and "Punctuation of another script" in `packages/shared/services/encryption/__tests__/passphrase-strength.test.ts`, the existing ASCII cases unchanged; `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/passphrase-strength.test.ts` and `pnpm exec tsc` in shared, client and sdk
- [x] 1.2 Return at least fair from `getShownPassphraseStrength` for a passphrase that meets the rules. Verify: case "Accepted passphrase is not weak" in `passphrase-strength.test.ts` (12 punctuation characters, and 12 Cyrillic letters, graded fair or better), the cases of "The strength grade does not contradict the passphrase rules" unchanged; the same vitest command
- [x] 1.3 Remove the suggestions (`suggestions` of the result and the `PassphraseSuggestion` type) from the strength service and rewrite the strength-service cases that asserted them to assert the grade. Verify: a case "Strength line shows a grade only" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` asserting that the strength row holds `Common:PassphraseStrengthLabel` and one grade and nothing else, `grep -rn "suggestions" packages/shared/services/encryption` returning nothing, `cd packages/shared && pnpm exec vitest run services/encryption dialogs/passphrase-modal`, and `pnpm exec tsc` in shared, client and sdk

## 2. Confirm actions follow the rules

- [x] 2.1 Gate Continue of the passphrase step of `packages/shared/dialogs/key-generation/KeySetupDialog.tsx` on `meetsPassphraseRules` with the kit's `rulesPassed`, and make its submit handler return without action when the rules are not met, in place of setting `Common:PassphraseWeak`. Verify: a new `packages/shared/dialogs/key-generation/__tests__/KeySetupDialog.passphrase.test.tsx` (harness as in `PassphraseModal.test.tsx`) with "Passphrase in another script" for Cyrillic and CJK at 12, 16 and 20 characters (Continue enabled, no error), "Too short in another script" for 11 Cyrillic and 11 CJK characters, "Accepted passphrase is not weak", "Lowercase words" and "Common pattern still refused"; `cd packages/shared && pnpm exec vitest run dialogs/key-generation` and `pnpm exec tsc` in shared, client and sdk
- [x] 2.2 Do the same for the new passphrase of `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` (`isNew`, reached after a recovery with the recovery phrase). Verify: in `PassphraseModal.test.tsx` under "A new passphrase needs no particular characters", "New passphrase after a recovery in another script" for Cyrillic and CJK at 12, 16 and 20 characters and "Too short in another script"; under "The strength grade does not contradict the passphrase rules", "Accepted passphrase is not weak"; `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal dialogs/key-recovery` and `pnpm exec tsc` in shared, client and sdk
- [x] 2.3 Do the same for the save action and the submit handler of `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`. Verify: in `keys-management/modals/__tests__/KeyRotationDialog.test.tsx`, "Passphrase change in another script" for Cyrillic and CJK at 12, 16 and 20 characters (save enabled, no field error), "Too short in another script" and "Accepted passphrase is not weak at a passphrase change"; `cd packages/client && pnpm exec vitest run src/pages/Profile/Section/Body/sub-components/keys-management` and `pnpm exec tsc` in client
- [x] 2.4 Remove `isPassphraseAcceptable` and its cases from the strength service and its tests (design.md, decision 1). Verify: `grep -rn "isPassphraseAcceptable" packages --include=*.ts --include=*.tsx` returns nothing outside `node_modules` and build output, the vitest commands of 1.1, 2.2 and 2.3 green, `pnpm exec tsc` in shared, client and sdk
- [x] 2.5 Delete `Common:PassphraseWeak` from `public/locales/*/Common.json` and its `.meta` file, following `.claude/rules/bulk-locale-edits.md`. Verify: `grep -rn "PassphraseWeak" packages public/locales --include=*.ts --include=*.tsx --include=*.json` returns nothing outside build output, and `cd common/tests && npx vitest run test/locales.test.js`

## 3. End to end

- [ ] 3.1 Add Playwright cases "Passphrase in another script" to `packages/client/__tests__/keys-management.spec.ts`, creating a key with 16 Cyrillic letters and with 12 CJK characters through the Create passphrase step and asserting that the strength line does not read "Weak", Continue is enabled and the key is registered, and "Passphrase change in another script" to `keys-management-advanced.spec.ts`, changing the passphrase to 20 Cyrillic letters. Verify: `keys-management.spec.ts` and `keys-management-advanced.spec.ts` green under Docker (`cd packages/client && pnpm test:e2e:docker:start`)

## 4. Gate

- [ ] 4.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build`, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Archive after 4.1. The archive adds one requirement to the main `key-management` spec and modifies three: "Passphrase strength gate", "A new passphrase needs no particular characters" and "The strength grade does not contradict the passphrase rules".
- `private-rooms-admin-recovery` task 4.3 adds a new passphrase after an administrator recovery through the same dialogs; its tests should take the "in another script" cases over.
