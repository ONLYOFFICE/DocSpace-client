# Tasks

One task is one commit: the code, the tests and the tick. Keep the pre-push
gate in mind: tsc, biome, locale tests and the shared, client and SDK unit
tests must stay green. No locale key is added or changed.

## 1. Generator settings in the kit

- [x] 1.1 In `docspace-ui-kit-react` on `release/v4.1.0` give `PasswordInput` an optional property with the settings of its generator, defaulting to `passwordSettings`, passed by `components/password-input/index.tsx` to `hooks/usePasswordGenerator.ts`; regenerate the README props; commit there, then `pnpm build && pnpm verify:package && pnpm pack` and `pnpm run update-ui-kit` here. Verify: kit cases in `components/password-input/PasswordInput.test.tsx` showing that the generator follows the new property when given and `passwordSettings` otherwise, `pnpm check:readme` in the kit, and `pnpm exec tsc` in shared, client, sdk and doceditor here

## 2. Rules of a new passphrase

- [ ] 2.1 Switch the capital letter, the digit and the punctuation off in `PASSPHRASE_SETTINGS` of `packages/shared/services/encryption/passphrase-strength.ts`, reduce `checkPassphraseRules` to the length, export the generator settings with today's values, and pass them from `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`; drop the tooltip texts of the removed rules from that dialog and from `KeyRotationDialog.tsx`. Verify: cases named after the scenarios of "A new passphrase needs no particular characters" and "The strength grade does not contradict the passphrase rules" in `services/encryption/__tests__/passphrase-strength.test.ts`, `dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` and `keys-management/modals/__tests__/KeyRotationDialog.test.tsx`, with the cases that expected the composition rules rewritten to these scenarios
- [ ] 2.2 Keep the generated passphrase as it is. Verify: a case "Generated characters" in `PassphraseModal.test.tsx` that generates many times and asserts 12 characters with a Latin capital letter, a digit and a punctuation character each time, and the cases of "A generated passphrase fills both fields" unchanged

## 3. End to end

- [ ] 3.1 Add a Playwright case "Lowercase words" to `packages/client/__tests__/keys-management.spec.ts` that creates a key with a passphrase of lowercase words, correct the comments on the rules in `key-flow-edge-cases.spec.ts` and `keys-management-advanced.spec.ts`, and update the screenshots of the rules tooltip under Docker. Verify: `keys-management*.spec.ts` and `key-flow-edge-cases.spec.ts` green under Docker

## 4. Gate

- [ ] 4.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build`, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Applied after `private-rooms-release-ux-fixes`, and archived after it: the archive modifies "The strength grade does not contradict the passphrase rules", which that change adds (design.md, decision 4).
- The archive adds one requirement to the main `key-management` spec, modifies two and removes "Passphrase composition rules".
