# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green.

## 1. Check of the recovery phrase at key setup

- [ ] 1.1 Add the check to `packages/shared/dialogs/key-generation/RecoveryPhraseDisplayModal.tsx` and move the registration in `useGenerateKeyFlow.tsx` behind it: three positions drawn anew each time, words compared lower-cased and trimmed, Back to the same phrase. Add `Common:RecoveryCheckTitle`, `Common:RecoveryCheckHint`, `Common:RecoveryCheckWordLabel` and `Common:RecoveryCheckMismatch`, write their translator comments with `translate-comments` and translate them with `translate-locales`. Verify: cases in `packages/shared/dialogs/key-generation/__tests__/RecoveryPhraseDisplayModal.test.tsx` and `useGenerateKeyFlow.test.tsx` named after the scenarios of "The recovery phrase is checked before the key is registered", and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 1.2 Update the Playwright cases that create a key, `packages/client/__tests__/keys-management.spec.ts` and `private-rooms-section.spec.ts`, with a helper that reads the asked positions and enters the words, and add the case "A word does not match". Verify: both specs pass under Docker

## 2. Passphrase form

- [ ] 2.1 Read how the kit's password input shows its rules and whether it can be shown without that tooltip; record the answer in design.md. Verify: the note in design.md names the kit file and the property, or states that the kit needs a switch
- [ ] 2.2 Cap the shown grade at `Common:PassphraseStrengthWeak` while the passphrase fails a rule, through one function used by creation and by the passphrase change (`packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`, `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`). Verify: a unit test of the function and cases named after the scenarios of "The strength grade does not contradict the passphrase rules" in `PassphraseModal.test.tsx` and in the test of the rotation dialog
- [ ] 2.3 After 2.1: list the rules under the passphrase field of both forms, marked met or unmet, and stop showing them in the tooltip; add the kit switch first if 2.1 found it missing (`docspace-ui-kit-react`, `release/v4.1.0`, `pnpm build && pnpm verify:package && pnpm pack`, then `pnpm run update-ui-kit`). Verify: cases "Rules shown while typing" and "Narrow screen" in `PassphraseModal.test.tsx`, the key dialog accessibility tests unchanged, and the screenshots of the creation dialog updated under Docker

## 3. Recovery phrase input

- [ ] 3.1 Read whether the kit's text area passes the input-assistance attributes through to the field; record the answer in design.md. Verify: the note names the kit file, or states that the kit needs the pass-through
- [ ] 3.2 Count the words under the input of `packages/shared/dialogs/key-recovery/RecoveryPhraseInputModal.tsx` and report another number than 24 on submit; add and translate `Common:RecoveryPhraseWordCount`. Verify: cases named after the scenarios of "The recovery phrase input counts its words" in the test of the modal, and the locale tests
- [ ] 3.3 Name the first word that is no recovery word with its position before the phrase is tried; add and translate `Common:RecoveryPhraseUnknownWord`. Verify: cases "Misspelled word" and "All words valid, phrase wrong" in the test of the modal and in `packages/shared/dialogs/key-recovery/__tests__` for the flow, and the locale tests
- [ ] 3.4 Reword `Common:InvalidRecoveryPhrase` in English without the name of the word-list standard, run `translate-stale` and retranslate it. Verify: a unit case "Wrong phrase" asserting the key, the locale tests, and no other key of the recovery input naming a standard (`grep -n "BIP" public/locales/en/Common.json` returns nothing)
- [ ] 3.5 After 3.1: declare input assistance off on the recovery text area and on the fields of the check of group 1, adding the pass-through to the kit first if 3.1 found it missing. Verify: unit cases "Recovery input" and "Check at key setup" asserting the attributes of the rendered fields

## 4. Key details in Keys management

- [ ] 4.1 Fold the key id and the algorithm under `Common:Details` in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysList.tsx`, closed on open, operable from the keyboard and exposed as expanded or collapsed. Verify: cases "Page opens" and "Details opened" in `keys-management/__tests__/KeysList.test.tsx`
- [ ] 4.2 Add `Common:KeyFingerprintHint` next to the fingerprint, tied to it as its description; translate it. Verify: a unit case "Hint shown" and the locale tests
- [ ] 4.3 Give the labels of the key details a colour of at least 4.5:1 and the action icons one of at least 3:1 in both themes, in `KeysManagement.module.scss` and `KeysList.tsx`; if the icon colour comes from the kit's icon button and cannot be set by the page, fix it in the kit. Verify: a Playwright case in `packages/client/__tests__/keys-management.spec.ts` that reads the computed colours in the light and in the dark theme and asserts the two ratios, and the Keys management screenshots updated under Docker

## 5. Invitation result

- [ ] 5.1 Show the reasons and the notes of `packages/client/src/components/panels/InvitePanel/sub-components/InviteResult.js`, and the reasons kept in the invite form, in the text colour and size of the names. Verify: a Playwright case in `packages/client/__tests__/private-room-invite.spec.ts` that reads the computed colours of the result in both themes and asserts 4.5:1, and its screenshots updated under Docker

## 6. Media viewer

- [ ] 6.1 Pass the decryption error of `packages/shared/components/media-viewer/MediaViewer.tsx` to the shared mapping of encryption errors and show its message, keeping `Common:EncryptionDecryptPartialFailed` for the errors it does not name. Verify: unit cases named after the scenarios of "The media viewer reports a file that is not shared yet as no access" next to the viewer, and a Playwright case in `packages/client/__tests__/private-room-cross-user-download.spec.ts` where a member opens an image that is not wrapped for them

## 7. Gate

- [ ] 7.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build`, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Archive after 7.1. The archive adds twelve requirements to the main `key-management`, `room-membership` and `file-operations` specs.
- `private-rooms-key-ux-refresh` is applied after this change, as its proposal and this one say.
