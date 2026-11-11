# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. The English texts are those the owner approves with the proposal.

## 1. Code without new text

- [x] 1.1 Shared: report `NoAccessError` with Common:EncryptedFileNoAccessYet in `packages/shared/services/encryption/error-i18n.ts` (design decision 2). Verify: case "Key holder without a wrap" in the unit test of the module; `cd packages/shared && pnpm exec vitest run services/encryption`
- [x] 1.2 Client: make the invite input of a private room take the member-only description, placeholder and no invitation language (decision 3); check the SDK's invite input and apply the same rule there if it shows those texts, or record here that it does not. Verify: case "Portal allows inviting guests" in a unit test of `InviteInput`; `cd packages/client && pnpm exec vitest run src/components/panels/InvitePanel`
  - 2026-11-11: the SDK's invite input shows the same texts and takes the same rule. The rule is one function, `offersGuestInvitation` in `packages/shared/services/private-room/invite-panel-rules.ts`, and the case "Portal allows inviting guests" is a unit test of that function; neither invite input has a render test, and none was added.
- [x] 1.3 Shared: describe the Editor role of a private room with Common:EditorDescription where the role list is built (decision 4). Verify: cases "Role list of a private room" and "Role list of another room" in a unit test of `getAccessOptions`; `pnpm exec vitest run utils`; `pnpm exec tsc` in the six packages
- [ ] 1.4 Shared: format the duration of the key-change dialog with `Intl.NumberFormat` in the interface language (decision 5). Verify: case "Duration in the interface language" for seconds, days and years in `packages/shared/dialogs/key-change-dialog` tests; `pnpm exec vitest run dialogs/key-change-dialog`
- [ ] 1.5 Client: name the exported key file `encryption-key-<fingerprint>.json` (decision 6). Verify: case "Export" in the test of `useExportKeyFlow`; the E2E specs and mocks that name the file found by the old name and updated; `pnpm exec vitest run src/pages/Profile`

## 2. Texts

- [ ] 2.1 Common: change the eleven English texts, rename `KeyChangedReasonDevice` to `KeyChangedReasonReplaced` with its call site and `.meta` (decision 1), and update the unit tests, mocks and E2E specs that assert on the old English. Verify: `grep` for each old English sentence under `packages` finds nothing; menu snapshots under `packages/client/src/store/**/__snapshots__` unchanged; the shared, client, sdk and doceditor unit suites
- [ ] 2.2 Common: refresh the translator comments of the eleven keys (`translate-comments`) and retranslate them into the 31 other languages (`translate-locales`) (decision 7). Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no failure beyond the four foreign keys; `translate-stale` reports none of the eleven keys; `npm --prefix ./common/tests run test:lefthook`; foreign `.meta` files restored

## 3. E2E

- [ ] 3.1 Client: run the private-room, encrypted-file, key-flow and keys-management specs in Docker `tests-dev` after the text change. Verify: no failure beyond the two wide-screen screenshot cases of `keys-management.spec.ts`; a screenshot that changes because of a text is updated only through the Docker update script and named here

## 4. Gate

- [ ] 4.1 Run the gate, every command on its own with its exit code read: `pnpm exec tsc` in the six packages, the shared, client, sdk and doceditor unit suites, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main spec included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 4.1.
- The translations are not reviewed by native speakers.
