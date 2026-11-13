# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes and no mock handler changes. The English texts of proposal.md were approved by the owner on 2026-11-13; groups 1 to 5 add the two new keys in English, group 6 changes the reworded ones and translates all of them.

## 1. Key dialogs

- [x] 1.1 Shared: fill the confirmation with the generated passphrase in `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` (design decision 1); read the generator of the kit's password input and record here what it draws its randomness from and how long its result is. Verify: cases "Generate", "Generate over typed input" and "Edit after generating" in the unit tests of the dialog; `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal`
  - 2026-11-13: the kit input shows its own copy of the value and reads `inputValue` only when it mounts, so the confirmation is mounted again with the generated value (a `key` that counts generations) instead of being set through the prop. Generator of the kit (`password-input/hooks/usePasswordGenerator`), as read in the installed package: every character and the final shuffle come from `Math.random`, not from `crypto.getRandomValues`; the result is exactly `passwordSettings.minLength` characters, 12 here, with one capital, one digit and one special character guaranteed and the rest drawn from lowercase, capitals, digits and specials. A passphrase that protects an encryption key should not come from `Math.random`; the fix belongs to `docspace-ui-kit-react` (Workflow follow-up).
- [x] 1.2 Shared: give the checkbox hint of the unlock prompt a gap and the indent of its label in `PassphraseModal.module.scss`. Verify: the dialog's unit tests still pass; the screenshots of the unlock prompt that change are named here and updated in 7.1
  - 2026-11-13: no screenshot shows the unlock prompt: the key specs keep two, `passphrase-create.png` (the creation dialog, which has no remember option) and `delete-key-warning.png`. Nothing to update in 7.1 for this task.
- [ ] 1.3 Shared: render the recovery words as a numbered list in a grid, make the three save actions equal, and remove the save gate of the acknowledgement in `packages/shared/dialogs/key-generation/RecoveryPhraseDisplayModal.tsx` and its stylesheet (decisions 2 and 3). Verify: cases "Words written down by hand", "Save action does not acknowledge", "Numbered words" and "Numbers stay out of the copy" in the dialog's unit tests; "Recovery phrase not yet acknowledged" of the close guard still passes; `pnpm exec vitest run dialogs/key-generation`
- [ ] 1.4 Shared: list the words with the same numbers in the recovery kit, `packages/shared/dialogs/key-generation/recovery-kit.ts` (decision 2). Verify: case "Recovery kit" in the unit test of the module; `pnpm exec vitest run dialogs/key-generation`
- [ ] 1.5 Client: show Common:PassphraseMustBeDifferent without a submit, make the new-passphrase field full width and add the divider in `keys-management/modals/KeyRotationDialog.tsx` and its stylesheet (decision 4). Verify: cases "Same passphrase typed", "Enter with the same passphrase" and "Passphrase corrected" in the dialog's unit tests; "Passphrase change" of the strength gate still passes; `cd packages/client && pnpm exec vitest run src/pages/Profile`

## 2. Keys management page

- [ ] 2.1 Client: give the Common:Active and Common:NoKey badges of `keys-management/KeysList.tsx` a background and a text token per theme (decision 5). Verify: a unit test that computes the contrast of the four pairs and fails under 4.5:1; `npm --prefix ./common/tests run test:lefthook` (no hex literal); the tokens chosen are named here

## 3. Room type label

- [ ] 3.1 Client: add Common:PrivateRoomType in English and label a private room with it in the type cell of the table, the row content, the tile and the details of the info panel (decision 6); check whether the SDK shows a room's type anywhere and apply the same rule there, or record here that it does not. Verify: cases "Type column in the Private section", "Info panel" and "Archive holds both kinds" in unit tests of the label helper and the four callers; `pnpm exec vitest run src/helpers src/pages/Home src/components/InfoPanel`

## 4. Empty views

- [ ] 4.1 Client and Shared: add Common:PrivateRoomFolderEmptyDescription in English and show the folder mode of the private empty view below the room root, in `packages/client/src/components/EmptyContainer` and `packages/shared/components/empty-views/empty-private-room`; check how the SDK docs layout tells root from folder and pass it, or record here what it lacks (decision 7). Verify: cases "Empty folder with keys", "Empty folder without keys", "Empty folder without the create right", "Room root" and "Folder of an archived private room" in `EmptyPrivateRoomView.test.tsx` and the test of the shared copy; `pnpm exec vitest run src/components/EmptyContainer`; `cd packages/shared && pnpm exec vitest run components/empty-views`
- [ ] 4.2 Client and Shared: give each welcome line of the room root its own icon in both copies of the view (decision 8). Verify: a unit test that the four lines carry four different icons; `cd common/tests && npx vitest run test/images.test.js` shows no unused or duplicate image

## 5. Invitation into a private room

- [ ] 5.1 Shared: name a pre-grant skip for want of a key with Common:EncryptedInviteNoKey in `packages/shared/services/private-room/room-member-flows.ts`, keeping Common:EncryptedSkippedNoKeys for a member the wrap leaves out, and the same in both `InviteResult` components (decision 9). Verify: cases "Invitee has no key" and a case for a member skipped by the wrap in the unit tests of the module; `pnpm exec vitest run services/private-room`
- [ ] 5.2 Client: keep the invite form with its invitees and the announced reasons when nobody was invited, and raise toasts only when the panel can no longer show the outcome, in `packages/client/src/components/panels/InvitePanel` (decisions 10 and 11). Verify: cases "Only invitee has no key", "List corrected and sent again", "Somebody was invited", "Every invitee refused" and "Reason shown once" in the unit tests of the panel; `pnpm exec vitest run src/components/panels/InvitePanel`
- [ ] 5.3 SDK: the same in `packages/sdk/src/app/(rooms)/_components/invite-panel` and `packages/sdk/src/app/(private)/_hooks/usePrivateInviteFlow.ts`. Verify: case "Nobody invited" in the unit tests of the hook and the panel; `cd packages/sdk && pnpm exec vitest run`

## 6. Texts

- [ ] 6.1 Common: change the eleven English texts of proposal.md, remove Common:RecoveryPhraseSaveFirst with its `.meta` from the 32 languages, and update the unit tests, fixtures and E2E locators that assert on the old English ("Generate new key", "Invalid passphrase", the welcome title). Verify: `grep` for each old English sentence under `packages` finds nothing; the shared, client, sdk and doceditor unit suites
- [ ] 6.2 Common: refresh the translator comments of the reworded and the two new keys (`translate-comments`) and translate them into the 31 other languages (`translate-locales`) (decision 12). Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no failure beyond the keys foreign to this change; `translate-stale` reports none of the keys; `npm --prefix ./common/tests run test:lefthook`

## 7. E2E

- [ ] 7.1 Client: update the E2E specs and fixtures for the new shapes (the acknowledgement no longer disabled before a save action in `keys-management.spec.ts`, the invite panel staying on its form in the private-room specs) and run the private-room, encrypted-file, key-flow and keys-management specs in Docker `tests-dev`. Verify: no failure beyond the ones known before this change; every screenshot that changes (passphrase creation, unlock prompt, recovery phrase, keys management badges, empty private room) is updated only through the Docker update script and named here

## 8. Gate

- [ ] 8.1 Run the gate, every command on its own with its exit code read: `pnpm exec tsc` in the six packages, the shared, client, sdk and doceditor unit suites, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main specs included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 8.1.
- The translations are not reviewed by native speakers.
- If task 1.1 finds a weak generator in the kit, open the fix in the `docspace-ui-kit-react` repository.
- Stage 2 of the design review (proposal.md, "Out of scope") is proposed as changes of its own.
