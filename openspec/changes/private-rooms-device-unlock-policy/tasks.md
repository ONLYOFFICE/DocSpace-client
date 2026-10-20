# Tasks

## 1. Confirm the policy

- [ ] 1.1 Get the user's confirmation of option A (survive auto-lock, 30-day record age) in design.md D1, or update proposal, specs and design to the chosen alternative; verified by the decision and its date recorded in design.md

## 2. Record expiry in the device-unlock store

- [ ] 2.1 Add a maximum-record-age constant and reject records older than it (or with a future timestamp) in the restore path, deleting the record; verify with new cases in `packages/shared/services/encryption/__tests__/device-unlock-store.test.ts` (fresh record restores, 31-day-old record returns null and is deleted, future timestamp is deleted)
- [ ] 2.2 Expose the record's written time for the Keys management page; verify with a unit test on the accessor in the same test file

## 3. Context behaviour and copy

- [ ] 3.1 Add a test to `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` proving that after the idle or visibility lock a remembered device restores silently and an expired record prompts; verify with `cd packages/shared && pnpm exec vitest run context/encryption`
- [ ] 3.2 Add `Common:RememberDeviceHint` under the remember checkbox in `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and `Common:DeviceUnlockRememberedUntil` next to Forget device in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysManagement.tsx`; verify with `cd packages/client && pnpm exec vitest run keys-management`
- [ ] 3.3 Run `translate-comments` then `translate-locales` for the two new keys and `cd common/tests && npx vitest run test/locales.test.js`; verify the locale suite is green for all 31 languages

## 4. End-to-end and documentation

- [ ] 4.1 Extend `packages/client/__tests__/keys-management-advanced.spec.ts` with a remembered-device scenario (unlock with remember, trigger the hidden-tab lock, perform an encrypted action without a prompt); verify with `cd packages/client && pnpm exec playwright test keys-management-advanced.spec.ts`
- [ ] 4.2 Record the policy and the rewritten "auto-lock bounds the XSS window only on non-remembered devices" note in the Purpose of `openspec/specs/private-rooms/encryption-core/spec.md` (and in SECURITY.md once it is committed); verify with `npx -y @fission-ai/openspec@latest validate --all --strict`

## Workflow follow-up

- Archive the change after review; archiving merges both delta specs into the main specs.
