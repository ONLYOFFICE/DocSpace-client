# Tasks

One task is one commit: the code, the tests, the locales and the tick.

## 1. Audit

- [x] 1.1 Walk the six surfaces of design decision 1 with the keyboard and read their accessibility tree (Playwright `ariaSnapshot` under the Docker `tests-dev` service with the mocks of `private-room-invite.spec.ts` and `private-room-members.spec.ts`): the invite panel of a private room before sending, an invitee row with a warning, the invitation result, the operations indicator during a re-encryption, a member row with pending access, the removal confirmation. Record per surface what is not reachable, not operable, not named or not announced, and whether the fault is in the client, the shared package or a kit component, as a table in design.md. Verify: the table is in design.md and names a file for every finding. Done 2026-11-12: fifteen findings in design.md, "Audit of 2026-11-12", each with the file its fix goes to; none needs a kit change

## 2. Invite panel

- [ ] 2.1 After 1.1: make the invitee rows operable and named (`packages/client/src/components/panels/InvitePanel/sub-components/Item.js`, `InviteInput.js`): the remove control and the role list named after the invitee, the warning read with its text, the Tab order as shown. Add the Common keys for the names and translate them with the translation skills. Verify: a unit test next to `Item.js`, the cases "Invitee removed from the keyboard" and "Role chosen from the keyboard" in `packages/client/__tests__/private-room-invite.spec.ts`, and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 2.2 After 1.1: move the focus to the invitation result when it replaces the list and expose it as a named region with named groups (`InvitePanel/index.js`, `sub-components/InviteResult.js`). Verify: a unit test next to `InviteResult.js` and the cases "Result shown" and "Result with a skipped invitee" in `private-room-invite.spec.ts`

## 3. Re-encryption progress

- [ ] 3.1 After 1.1: give the operations indicator a name and a value for the re-encryption, and make its end announced once, through the toast if the audit shows the kit toast is a status or an alert, otherwise through the fix the audit names. Verify: a unit test next to the indicator and the cases "Re-encryption completes" and "Re-encryption fails" in `private-room-invite.spec.ts`

## 4. Members view

- [ ] 4.1 After 1.1: expose pending access as the member's state without the drawn separator and offer the retry as a button named after the member, busy while it runs (`packages/shared/components/share/sub-components/User.tsx`). Add and translate the Common key of the name. Verify: the unit test of the shared member row, the cases "Retry from the keyboard" and "Retry succeeds" in `packages/client/__tests__/private-room-members.spec.ts`, the locale tests, and the specs that screenshot a Members view rerun under Docker
- [ ] 4.2 After 1.1: name the role list of a member after the member and return the focus to the Members view when the removal confirmation closes (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/sub-components/User.tsx`, the shared member row). Verify: the cases "Removal confirmed from the keyboard" and "Removal declined from the keyboard" in `private-room-members.spec.ts`

## 5. ui-kit

- [x] 5.1 Only if 1.1 traces a finding to a kit component: fix it in `docspace-ui-kit-react` on `release/v4.1.0` with a unit test there, run `pnpm build && pnpm verify:package && pnpm pack`, take it with `pnpm run update-ui-kit` and rebuild the client and SDK test images. Verify: the kit's unit suite, and the client cases of groups 2 to 4 passing on the new build. If 1.1 finds none, tick this task with that note. Done 2026-11-12: the kit's combo box and access-right select take `ariaLabel` (`64a733a1` on the kit's `release/v4.1.0`, with a unit test; its unit suite passes, 3319 tests, and `verify:package` too); the pack is taken with `update-ui-kit` and the client test image is rebuilt. Done before groups 2 to 4, which pass the name

## 6. SDK

- [ ] 6.1 After groups 2 to 5: apply the same to the SDK's own copies, `packages/sdk/src/app/(private)/_components/members` and the invite panel of `packages/sdk/src/app/(rooms)/_components/invite-panel` as it opens for a private room. Verify: the SDK unit tests and keyboard cases in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`, run on a build made with `pnpm run test:build`

## 7. Gate

- [ ] 7.1 Run the private-room specs of the client under Docker, the SDK private suite, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md
- [ ] 7.2 Manual pass with a screen reader on the owner's stand over the six surfaces, recorded in design.md with the reader and the browser. Verify: the record, and every requirement of the delta marked as heard or not
- [ ] 7.3 Tick criterion 1.10 of `openspec/changes/private-rooms-release-gate/tasks.md`. Verify: the tick names this change

## Workflow follow-up

- Archive after 7.3. The archive adds the six requirements to the main `room-membership` spec.
