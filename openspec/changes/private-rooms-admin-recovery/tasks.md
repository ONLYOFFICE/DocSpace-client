# Tasks

The Backend tasks are done in `../server` by the backend team, on its own branch; nothing of them is committed from this repository. A Client task starts only after the Backend task it names has merged and been read through CodeGraph; one task is then one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Keep the pre-push gate in mind: tsc, biome, the locale tests and the shared, client and sdk unit tests stay green.

## 0. Decisions (before any other task)

- [ ] 0.1 Record the owner's answers to decisions 1 to 6 of proposal.md with their date in proposal.md and design.md, and revise the deltas and the tasks below where an answer differs from the assumed one. Verify: `npx -y @fission-ai/openspec@1.17.0 validate private-rooms-admin-recovery --strict`
- [ ] 0.2 Hand the `server-contract` delta of this change to the backend team and record its reply in design.md with the date: the storage, the routes and their shapes, the name of the setting, the audit events and the letter. Verify: that record, and the deltas revised where the reply differs

## 1. Server

- [ ] 1.1 Backend, after 0.2: the portal policy and the list of recovery administrators, written by the portal owner only and readable by every signed-in user with the administrators' public keys; a named administrator is a portal administrator who holds an encryption key. Verify: server tests for the owner turning recovery on, a refusal for anybody else, a refusal for a named user without a key, and the wraps deleted when recovery is turned off
- [ ] 1.2 Backend, after 1.1: store the wraps a key holder sends of their own key, one per current recovery administrator, and report whether a user is enrolled; refuse a guest, a wrap for somebody who is not a recovery administrator and any wrap while recovery is off. Verify: server tests for each of these four cases
- [ ] 1.3 Backend, after 1.2: delete the wraps made for an administrator who is removed, loses the administrator role, is deactivated, is deleted or resets the key, and the wraps of a user who is deleted, is turned into a guest (`private-rooms-server-followups` 1.6) or resets the key. Verify: server tests for an administrator removed and for a user who resets the key
- [ ] 1.4 Backend, after 1.2: give a wrap only to the recovery administrator it was made for, with an audit event for each read; accept from a recovery administrator a new envelope for an enrolled user only when its public key is the user's current one, mark the key as recovered until the user replaces the envelope, send the user a letter and write an audit event; leave the wrapped file keys untouched. Verify: server tests in `products/ASC.Files/Tests/Tests/08_Private` for a wrap read by its administrator and refused to the portal owner, for an envelope stored and one with another public key refused, for the mark cleared by the user's own envelope, and for a file of a private room that the user's file key still opens after the recovery

## 2. Crypto core

- [ ] 2.1 Client, after 0.1: add the wrap of an identity private key for a recovery administrator's public key and its opening to `packages/shared/services/encryption`, with authenticated HPKE and a context of its own next to the file-key wrap. Verify: unit tests in `packages/shared/services/encryption/__tests__` named after the scenarios "Wrap made", "Wrap opened by the administrator", "Wrap opened by somebody else" and "File-key wrap offered as an identity wrap", run with `cd packages/shared && pnpm exec vitest run services/encryption`
- [ ] 2.2 Client, after 2.1: seal a recovered private key in an identity envelope under a generated one-time passphrase with no recovery slot, and confirm the envelope opens with that passphrase and carries the same public key. Verify: unit tests next to the envelope tests, same command

## 3. Enrolment

- [ ] 3.1 Client, after 1.1 and 1.2 have merged: read the merged routes through CodeGraph and add the policy read, the wraps write and the enrolment status to `packages/shared/api/privacy`, with MSW handlers whose doc comments name the controller actions and contract cases for every scenario of the `server-contract` requirements "Organisational recovery is a portal policy" and "Recovery wraps are stored per user and administrator". Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`, and `pnpm exec tsc` in shared, client, sdk, doceditor, login and management
- [ ] 3.2 Client, after 3.1: enrol at key creation and at the next unlock, in the encryption context and the key generation dialog, with the text that names the recovery administrators before the key is created. Add the Common keys with `/translate-comments` and `/translate-locales` in the same commit. Verify: unit tests named after the four scenarios of "Enrolment in organisational recovery" next to the dialog and the context, and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 3.3 Client, after 3.2: show the recovery status in the keys management tab (`packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`). Verify: unit tests for "Enrolled" and "Recovered key", the locale tests, and `packages/client/__tests__/keys-management.spec.ts` under Docker `tests-dev` with its screenshots regenerated by `--update-snapshots=changed`
- [ ] 3.4 SDK, after 3.2: enrol at the key creation of `packages/sdk/src/app/(private)` with the same text. Verify: an SDK unit case "Key created with recovery on" and `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`

## 4. Recovery

- [ ] 4.1 Client, after 1.4 has merged: add the wrap read and the recovered-envelope write to `packages/shared/api/privacy` with MSW handlers and contract cases for every scenario of "A recovery administrator reads only the wrap made for them" and "Recovered key is written for the user by a recovery administrator". Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`
- [ ] 4.2 Client, after 4.1: add the restore action for a recovery administrator to the actions of a user in the accounts list, with the unlock of the administrator's key first and a dialog that shows the one-time passphrase once. Add and translate the Common keys in the same commit. Verify: unit tests named after the four scenarios of "Recovery of a user's key by a recovery administrator", the locale tests, and a new E2E spec `packages/client/__tests__/keys-recovery-by-admin.spec.ts` under Docker `tests-dev`
- [ ] 4.3 Client, after 4.1: require a new passphrase after the unlock of a recovered key, in the key dialogs of `packages/shared/dialogs`, and offer a new recovery phrase. Verify: unit tests for "First unlock after a recovery" and "New passphrase set", and the case "Recovered key unlocked" in `packages/client/__tests__/keys-management.spec.ts`

## 5. Settings

- [ ] 5.1 Client, after 1.1 has merged: add the control of the policy and of the recovery administrators for the portal owner at the place decided with the portal setting of `private-rooms-release-gate` 5.3, with the advice to name two administrators. Add and translate the Common keys in the same commit. Verify: component tests "Owner turns recovery on", "Not the owner" and "Administrator without a key", and the locale tests

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages), the client and SDK private-room specs under Docker and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md with the date
- [ ] 6.2 After `private-rooms-server-hardening` is archived: add to the `server-contract` delta of this change the removal of the main requirement "No administrative recovery endpoints", which that change leaves in place of "No recovery or offboarding endpoints". Verify: `npx -y @fission-ai/openspec@1.17.0 validate private-rooms-admin-recovery --strict`
- [ ] 6.3 Manual check on a stand with the merged server: turn recovery on, enrol a user, recover the key as the administrator, unlock with the one-time passphrase, set a new one and open a file of a private room; read the audit trail and the letter. Verify: the run recorded in design.md with the date and the builds

## Workflow follow-up

- Archive when the Backend tasks have merged and the Client tasks are done.
- `private-rooms-release-gate` 1.7 waits for this change; its documentation pack (3.1) takes the recovery procedure from the archived specs.
