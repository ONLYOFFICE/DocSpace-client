# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green.

## 1. Key state indicator

- [x] 1.1 Draw the indicator of `packages/client/src/pages/Home/Section/Header/sub-components/KeyStateIndicator.tsx` as a pill coloured by the state, with colours from kit tokens for both themes and the same padlock in both states. Verify: unit cases "Unlocked and locked differ" and "Same icon" in `sub-components/__tests__/KeyStateIndicator.test.tsx`, and the existing indicator cases unchanged
- [ ] 1.2 Add a Playwright case "Readable in both themes" to the key state indicator group of `packages/client/__tests__/private-rooms-section.spec.ts` that reads the computed colours of the text, the icon and the pill in both states and both themes and asserts 4.5:1 and 3:1. Verify: the spec passes under Docker, "Shown whole on a phone" included

## 2. Recovery phrase

- [x] 2.1 Show the words of `packages/shared/dialogs/key-generation/RecoveryPhraseContent.tsx` as numbered tiles, four in a row and two under the phone breakpoint, keeping the ordered list and the generated numbers, and make the key setup dialog and the standalone recovery display large on a wide screen. Verify: cases "Wide screen", "Phone", "Longest word" and "Copied by hand" in `packages/shared/dialogs/key-generation/__tests__/RecoveryPhraseDisplayModal.test.tsx` for the structure and the copy, and a Playwright case in `packages/client/__tests__/keys-management.spec.ts` that asserts from bounding boxes four tiles in the first row at 1440 px, two at 390 px, and a phrase with an eight-letter word on one line
- [x] 2.2 Put an icon before the label of each save action, hidden from assistive technology, in the row that wraps. Verify: unit cases "Icons shown" and "Name of an action" in `RecoveryPhraseDisplayModal.test.tsx`, Playwright cases in `keys-management.spec.ts` that assert one row with no label cut at 1440 px and, as "Long labels", a wrapped row with no label cut at 390 px, where the English labels no longer fit one row, and `cd common/tests && npx vitest run test/images.test.js` if an icon was added
- [ ] 2.3 Rerun the bounding-box cases of the rules tooltip against the wider dialog and add a width of 1024 px to them. Verify: "Rules shown while typing" and "Narrow screen" of `keys-management.spec.ts` pass under Docker at 1440, 1024 and 390 px
- [ ] 2.4 Update the screenshots of the key setup dialog under Docker. Verify: `keys-management.spec.ts` and `private-rooms-section.spec.ts` pass under Docker and the screenshot diff holds only the key dialogs

## 3. Explanation step

- [x] 3.1 Put an icon before each of the three terms of the explanation step in `packages/shared/dialogs/key-generation/KeySetupDialog.tsx`, hidden from assistive technology, the `dl` unchanged. Verify: unit cases "Three icons" and "Read aloud" in `packages/shared/dialogs/key-generation/__tests__/useGenerateKeyFlow.test.tsx`, the existing "Three terms explained" unchanged, and the image test if an icon was added

## 4. Fingerprint

- [ ] 4.1 Lay the groups of the fingerprint out in lines of four, and of two where four do not fit, in `keys-management/KeysList.tsx` and `KeysManagement.module.scss`. Verify: a Playwright case "Even lines" in `keys-management.spec.ts` that asserts from the bounding boxes of the groups two lines of four at 1440 px and four lines of two at 390 px, the unit case "Grouped fingerprint" unchanged, and the Keys management screenshots updated under Docker

## 5. Question that closes key setup

- [x] 5.1 Give `packages/shared/dialogs/unsaved-changes-dialog` an optional title and an optional label of the confirming action; add `Common:KeySetupDiscardTitle` and `Common:KeySetupDiscardConfirm` to `public/locales/en/Common.json`, write their translator comments with `translate-comments`, translate them with `translate-locales`, and pass them from `KeySetupDialog.tsx`. Verify: unit cases "Closed on the recovery phrase step" and "Closed on the passphrase step with typed input" in `useGenerateKeyFlow.test.tsx`, a case "Passphrase change dialog" in `keys-management/modals/__tests__/KeyRotationDialog.keyboard.test.tsx` (the suite that renders the real dialog) asserting the general labels, and `cd common/tests && npx vitest run test/locales.test.js`

## 6. Mark of a missing key

- [x] 6.1 In `docspace-ui-kit-react` on `release/v4.1.0`: draw the mark of a selector item as a badge after the label, inside the label block, with the tooltip and its description tied to the badge, the label shortened before the badge, and a text contrast of at least 4.5:1 in both themes. Update the kit's unit tests and stories, run `pnpm build && pnpm verify:package && pnpm pack`, and take the pack with `pnpm run update-ui-kit`. Verify: the kit's unit suite passes and the client builds on the new pack
- [ ] 6.2 After 6.1: add Playwright cases "Readable in both themes", "Next to an invited person" and "Long name" to the marked-people group of `packages/client/__tests__/private-room-invite.spec.ts`, reading computed colours and bounding boxes, and update the screenshots of the people list under Docker. Verify: the spec passes under Docker, "Person without a key is marked" and "Marked person selected and sent" unchanged

## 7. Gate

- [ ] 7.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build` (the shared dialogs reach it), the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Archive after 7.1. The archive adds five requirements to the main `key-management` spec and changes one, and adds one requirement to `room-membership`.
