# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. The English texts of task 1.1 are those the owner approved with the proposal.

## 1. Locales

- [ ] 1.1 Common: add `PrivateRoomLockedBarTitle`, `PrivateRoomLockedBarText` and `UnlockKey` to `public/locales/en/Common.json` with their `.meta` and translator comments (`translate-comments`), and translate them into the 31 other languages (`translate-locales`). The keys are used by task 2.2; commit them together with it if the unused-key check requires a call site. Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no new failure beyond the four foreign keys; `npm --prefix ./common/tests run test:lefthook`; foreign `.meta` files restored

## 2. Client

- [x] 2.1 Client: keep whether the room's unlock request is pending in `EncryptionProviderWrapper.jsx` (`RoomUnlockEffect`) and expose it to the section body (design decisions 2 and 4). Verify: cases "pending while the entry request is open" and "settled after a cancel" in `packages/client/src/components/__tests__/EncryptionProviderWrapper.test.tsx`; `cd packages/client && pnpm exec vitest run src/components/__tests__`
- [ ] 2.2 Client: add the locked-key bar next to `KnowledgeVectorizationBar` and render it at both of its sites (decisions 1 to 3). Verify: cases "Prompt cancelled on entry", "Unlock from the bar", "Unlock from the bar cancelled", "Key locks while the room is open", "Remembered device", "Entry prompt open" and "User without a key" in a unit test next to the bar; `pnpm exec vitest run src/pages/Home/Section/Body`; `pnpm exec tsc` in client

## 3. Shared

- [ ] 3.1 Shared: move the remember option under the passphrase field in `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`, with the label weight of the field labels (decision 5). Verify: case "Option placed with the passphrase field" (reading order, Tab order, unticked) in `packages/shared/dialogs/passphrase-modal/__tests__/PassphraseModal.test.tsx`; `cd packages/shared && pnpm exec vitest run dialogs`; the sdk unit suite; `pnpm exec tsc` in the six packages

## 4. E2E

- [ ] 4.1 Client: add the cases "Prompt cancelled on entry" and "Unlock from the bar cancelled" to `packages/client/__tests__/private-room-access.spec.ts`, and rerun the specs that show the unlock dialog. Verify: Docker `tests-dev` for `private-room-*.spec.ts`, `encrypted-file-ui.spec.ts`, `key-flow-edge-cases.spec.ts`, `keys-management*.spec.ts`; a screenshot of the unlock dialog that changes is updated only through the Docker update script and named here

## 5. Gate

- [ ] 5.1 Run the gate, every command on its own so a failure stops the task: `pnpm exec tsc` in the six packages, the shared, client and sdk unit suites, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main spec included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 5.1.
- The SDK's private pages get no bar; the editor page is card C8.
- The translations are not reviewed by native speakers.
