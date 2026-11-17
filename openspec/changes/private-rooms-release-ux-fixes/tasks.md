# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green.

## 1. Passphrase form

- [x] 1.1 Read how the kit's password input shows its rules and whether it can be shown without that tooltip; record the answer in design.md. Verify: the note in design.md names the kit file and the property, or states that the kit needs a switch
- [x] 1.2 Cap the shown grade at `Common:PassphraseStrengthWeak` while the passphrase fails a rule, through one function used by creation and by the passphrase change (`packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`, `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`). Verify: a unit test of the function and cases named after the scenarios of "The strength grade does not contradict the passphrase rules" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx` and in `keys-management/modals/__tests__/KeyRotationDialog.test.tsx`
- [x] 1.3 Keep the rules in the tooltip of the kit's password input and open it where design decision 2 says. In `docspace-ui-kit-react` on `release/v4.1.0` give `PasswordInput` an optional property for the placement of its rules tooltip, defaulting to `top`, and anchor that tooltip to the whole field with its reveal button, with kit unit tests (`pnpm build && pnpm verify:package && pnpm pack`, then `pnpm run update-ui-kit` here); then ask for the right side in `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and `KeyRotationDialog.tsx`. A first implementation as a list under the field (aba912004ff) was reverted (93eba409c24). Verify: the kit's `PasswordInput.test.tsx` cases for the property and the anchor; Playwright cases "Rules shown while typing" and "Narrow screen" in `packages/client/__tests__/keys-management.spec.ts` that type into the passphrase field of the creation dialog and assert from bounding boxes that on a wide screen the tooltip is clear of the title, the hint, Generate, the passphrase field with its reveal button, the confirmation field and the actions, and in the aside on a narrow screen lies below the field and clear of the title, the hint, Generate and the actions, with their screenshots added under Docker; the key dialog accessibility tests unchanged

## 2. Recovery phrase input

- [x] 2.1 Read whether the kit's text area passes the input-assistance attributes through to the field; record the answer in design.md. Verify: the note names the kit file, or states that the kit needs the pass-through
- [x] 2.2 Count the words under the input of `packages/shared/dialogs/key-recovery/RecoveryPhraseInputModal.tsx` and report another number than 24 on submit; add `Common:RecoveryPhraseWordCount`, write its translator comment with `translate-comments` and translate it with `translate-locales`. Verify: cases named after the scenarios of "The recovery phrase input counts its words" in `packages/shared/dialogs/key-recovery/__tests__/RecoveryPhraseInputModal.test.tsx`, and `cd common/tests && npx vitest run test/locales.test.js`
- [x] 2.3 Name the first word that is no recovery word with its position before the phrase is tried; add and translate `Common:RecoveryPhraseUnknownWord`. Verify: cases "Misspelled word" and "All words valid, phrase wrong" in `RecoveryPhraseInputModal.test.tsx`, a case "All words valid, phrase wrong" in `useRecoverKeyFlow.test.tsx` (the flow receives only a phrase the input has accepted, so a misspelled word never reaches it), and the locale tests
- [ ] 2.4 Reword `Common:InvalidRecoveryPhrase` in English without the name of the word-list standard, run `translate-stale` and retranslate it. Verify: a unit case "Wrong phrase" asserting the key, the locale tests, and no key of the recovery input naming a standard (`grep -n "BIP" public/locales/en/Common.json` returns nothing)
- [ ] 2.5 After 2.1: declare input assistance off on the recovery text area, adding the pass-through to the kit first if 2.1 found it missing. Verify: a unit case "Recovery input" asserting the attributes of the rendered field

## 3. Key details in Keys management

- [ ] 3.1 Fold the key id and the algorithm under `Common:Details` in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysList.tsx`, closed on open, operable from the keyboard and exposed as expanded or collapsed. Verify: cases "Page opens" and "Details opened" in `keys-management/__tests__/KeysList.test.tsx`
- [ ] 3.2 Add `Common:KeyFingerprintHint` next to the fingerprint, tied to it as its description; translate it. Verify: a unit case "Hint shown" and the locale tests
- [ ] 3.3 Give the labels of the key details a colour of at least 4.5:1 and the action icons one of at least 3:1 in both themes, in `KeysManagement.module.scss` and `KeysList.tsx`; if the icon colour comes from the kit's icon button and cannot be set by the page, fix it in the kit. Verify: a Playwright case in `packages/client/__tests__/keys-management.spec.ts` that reads the computed colours in the light and in the dark theme and asserts the two ratios, and the Keys management screenshots updated under Docker

## 4. Invitation result

- [ ] 4.1 Show the reasons and the notes of `packages/client/src/components/panels/InvitePanel/sub-components/InviteResult.js`, and the reasons kept in the invite form, in the text colour and size of the names. Verify: a Playwright case in `packages/client/__tests__/private-room-invite.spec.ts` that reads the computed colours of the result in both themes and asserts 4.5:1, and its screenshots updated under Docker

## 5. Media viewer

- [ ] 5.1 Pass the decryption error of `packages/shared/components/media-viewer/MediaViewer.tsx` to the shared mapping of encryption errors and show its message, keeping `Common:EncryptionDecryptPartialFailed` for the errors it does not name. Verify: unit cases named after the scenarios of "The media viewer reports a file that is not shared yet as no access" next to the viewer, and a Playwright case in `packages/client/__tests__/private-room-cross-user-download.spec.ts` where a member opens an image that is not wrapped for them

## 6. Gate

- [ ] 6.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build`, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Archive after 6.1. The archive adds eleven requirements to the main `key-management`, `room-membership` and `file-operations` specs.
- `private-rooms-key-ux-refresh` is applied after this change, as its proposal and this one say.
