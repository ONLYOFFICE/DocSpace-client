# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green.

## 1. Key setup dialog

- [x] 1.1 Take the passphrase form out of `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and the recovery phrase content out of `packages/shared/dialogs/key-generation/RecoveryPhraseDisplayModal.tsx` into parts both the existing dialogs and the new one render, with no change of behaviour. Verify: `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal dialogs/key-generation` passes with the existing tests unchanged
- [x] 1.2 Build the three-step dialog in `packages/shared/dialogs/key-generation` and render it from `useGenerateKeyFlow.tsx`: the step shown, continue and back, the key pair and the recovery phrase generated once and kept while the dialog is open, the acknowledgement cleared on every entry to the last step. Verify: new cases in `packages/shared/dialogs/key-generation/__tests__/useGenerateKeyFlow.test.tsx` named after the scenarios of "Key setup is one dialog of three steps" and "Key setup steps can be walked back", and `useGenerateKeyFlow.focus.test.tsx` still passing
- [x] 1.3 Write the explanation step and its texts: add `Common:KeySetupKeyTitle`, `Common:KeySetupPassphraseTitle`, `Common:KeySetupRecoveryTitle`, their descriptions and `Common:KeySetupNotStored` to `public/locales/en/Common.json`, write their translator comments with the `translate-comments` skill and translate them with `translate-locales`. Verify: a unit case "Three terms explained" and "Key of the account", and `cd common/tests && npx vitest run test/locales.test.js`
- [x] 1.4 Name what is lost when key setup is closed on the recovery phrase step: add `Common:KeySetupDiscardRecovery`, translate it, and close the explanation step without a question. Verify: unit cases "Closed on the recovery phrase step" and "Closed on the explanation", and the locale tests
- [x] 1.5 Open key setup directly from the creation of a private room: drop the confirmation from `packages/client/src/components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js` and `packages/shared/hooks/usePrivateRoomKeyGate.ts`, and remove `Common:PrivateRoomKeyRequiredTitle` and `Common:PrivateRoomKeyRequiredDescription` from every locale. Verify: `packages/shared/hooks/usePrivateRoomKeyGate.test.tsx` with the scenarios of "Starting private room creation without a key opens key setup", and the locale tests
- [x] 1.6 Update the Playwright cases that walk key generation, `packages/client/__tests__/keys-management.spec.ts` and `private-rooms-section.spec.ts`, and their screenshots. Verify: both specs pass under Docker and the screenshot diff holds only the key setup dialog

## 2. Unlock dialog wording

- [x] 2.1 Label the confirm action of the unlock prompt `Common:UnlockKey` and reword `Common:PassphraseHint` in English so it names the encrypted files of private rooms and neither a private key nor a device; run `translate-stale` and retranslate the key. Verify: a case "Confirm action names the unlock" in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx`, the locale tests, and the screenshots of the unlock dialog updated under Docker

## 3. Fingerprint in groups

- [x] 3.1 Move the grouping of a fingerprint from `packages/shared/dialogs/key-change-dialog/KeyChangeDialog.tsx` to `packages/shared/services/encryption` and use it in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysList.tsx`, with a style that wraps only between groups. Verify: a unit test of the function, a case "Grouped fingerprint" in `keys-management/__tests__/KeysList.test.tsx`, the key-change dialog tests unchanged, and the Keys management screenshots updated under Docker

## 4. Key state indicator

- [x] 4.1 Move `AutoLockSetting.tsx` from the profile folder to a place the header can import, with its test, and no change of behaviour. Verify: `cd packages/client && pnpm exec vitest run src/pages/Profile` and the moved test pass
- [x] 4.2 Add the indicator to the header of a private room and of a folder inside one (`packages/client/src/pages/Home/Section/Header`): `Common:KeyUnlocked` or `Common:KeyLocked`, hidden without a key or while the key list is not known, raising the unlock dialog when locked. Add and translate the two keys. Verify: a unit test next to the component with the scenarios of "Key state is shown in the header of a private room", and the locale tests
- [x] 4.3 Add the popover of an unlocked key: the state, the auto-lock setting, `Common:LockNow`, a link to Keys management, operable from the keyboard with the focus returned on close. Verify: unit cases named after the scenarios of "Key state indicator leads to the key actions"
- [x] 4.4 Show `Common:LockNowForgetsDevice` in the popover on a remembered device; add and translate the key. Verify: unit cases "Remembered device" and "Device not remembered", and the locale tests
- [x] 4.5 Add Playwright cases for the indicator to `packages/client/__tests__/private-rooms-section.spec.ts`: shown unlocked, locked from the popover, unlocked from the indicator, absent in a room that is not private. Verify: the spec passes under Docker

## 5. Locked-key block

- [x] 5.1 Replace `packages/client/src/pages/Home/Section/Body/PrivateRoomLockedBar.tsx` with the block: illustration, `Common:PrivateRoomLockedBarTitle`, `Common:PrivateRoomLockedBarText`, the primary `Common:UnlockKey`, `Common:ForgotPassphrase`, under the same conditions as the bar and above the file list. Verify: the test of the bar rewritten for the block with every scenario of "A locked key is reported by a block in a private room" and of "File names stay as stored while the key is locked"
- [ ] 5.2 Show the block in place of the empty view in a private room without files while the key is locked. Verify: a unit case "Room without files" and a Playwright case in `packages/client/__tests__/private-rooms-section.spec.ts`
- [ ] 5.3 Update the screenshots of the specs that show a locked private room. Verify: `private-room-access.spec.ts`, `private-rooms-section.spec.ts` and `encrypted-file-ui.spec.ts` pass under Docker and the screenshot diff holds only the block

## 6. Mark of a missing key in the invite panel

- [ ] 6.1 In `docspace-ui-kit-react` on `release/v4.1.0`: give the people selector an optional property that receives the people of a loaded page and returns a label and a description per person, rendered in the row when the result arrives, the description tied to the label for assistive technology. Add a unit test there, run `pnpm build && pnpm verify:package && pnpm pack`, and take the pack with `pnpm run update-ui-kit`. Verify: the kit's unit suite passes and the client builds on the new pack
- [ ] 6.2 After 6.1: pass that property from `packages/client/src/components/panels/InvitePanel/index.js` for a private room only. It asks `getRoomCandidateKeys` for the ids of the page in batches, keeps the answers while the panel is open, and marks the people absent from the answer; a failed batch marks nobody. Add and translate `Common:NoEncryptionKeyMark` and `Common:NoEncryptionKeyMarkHint`. Verify: cases in `packages/client/src/components/panels/InvitePanel/__tests__/InvitePanel.privateInvite.test.tsx` named after the scenarios of both mark requirements, and the locale tests
- [ ] 6.3 Check that the mock of the candidates route in `packages/shared/__mocks__/handlers/privacyroom/index.ts` leaves out a user without a key, as `GetKeyPairForRoomCandidatesAsync` does, and add the case to its contract test if it is missing. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers/privacyroom`
- [ ] 6.4 Add Playwright cases "Person without a key is marked" and "Marked person selected and sent" to `packages/client/__tests__/private-room-invite.spec.ts` and update its screenshots. Verify: the spec passes under Docker

## 7. Gate

- [ ] 7.1 Run the private-room and keys-management specs of the client under Docker, the SDK private suite on a build made with `pnpm run test:build` (the shared dialogs reach it), the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md

## Workflow follow-up

- Archive after 7.1. The archive adds fourteen requirements to the main `key-management` and `room-membership` specs, changes one and removes two that the new ones replace.
