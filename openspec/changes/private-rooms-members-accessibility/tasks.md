# Tasks

One task is one commit: the code, the tests, the locales and the tick.

## 1. Audit

- [x] 1.1 Walk the six surfaces of design decision 1 with the keyboard and read their accessibility tree (Playwright `ariaSnapshot` under the Docker `tests-dev` service with the mocks of `private-room-invite.spec.ts` and `private-room-members.spec.ts`): the invite panel of a private room before sending, an invitee row with a warning, the invitation result, the operations indicator during a re-encryption, a member row with pending access, the removal confirmation. Record per surface what is not reachable, not operable, not named or not announced, and whether the fault is in the client, the shared package or a kit component, as a table in design.md. Verify: the table is in design.md and names a file for every finding. Done 2026-11-12: fifteen findings in design.md, "Audit of 2026-11-12", each with the file its fix goes to; none needs a kit change

## 2. Invite panel

- [x] 2.1 After 1.1: make the invitee rows operable and named (`packages/client/src/components/panels/InvitePanel/sub-components/Item.js`, `InviteInput.js`): the remove control and the role list named after the invitee, the warning read with its text, the Tab order as shown. Add the Common keys for the names and translate them with the translation skills. Verify: a unit test next to `Item.js`, the cases "Invitee removed from the keyboard" and "Role chosen from the keyboard" in `packages/client/__tests__/private-room-invite.spec.ts`, and `cd common/tests && npx vitest run test/locales.test.js`. Done 2026-11-12: the panel is a dialog named `Common:Invite` (the result title once the result is shown); the role list of an invitee is named `Common:RoleOfUser` and the default one `Common:RoleWithValue`; the separate remove icon is a kit icon button named `Common:RemoveInvitee`; after a removal the focus goes to the search field. Three keys translated into 31 languages. `AccessSelector.name.test.tsx` passes, `private-room-invite.spec.ts` passes under Docker, 6 of 6, with the two keyboard cases. Not covered: the warning of a row is the kit help button and was not on screen in a private room's panel; it is left for the pass of 7.2
- [x] 2.2 After 1.1: move the focus to the invitation result when it replaces the list and expose it as a named region with named groups (`InvitePanel/index.js`, `sub-components/InviteResult.js`). Verify: a unit test next to `InviteResult.js` and the cases "Result shown" and "Result with a skipped invitee" in `private-room-invite.spec.ts`. Done 2026-11-12: the result is a region named `Common:EncryptedInviteResultTitle` that takes the focus when it is shown; the invited and pending groups are named by their headings, the refused and skipped groups by the new `Common:NotInvited`, translated into 31 languages. `InviteResult.test.tsx` passes, and the steps "Result shown" and "Result with a skipped invitee" of the mixed-invitation case of `private-room-invite.spec.ts` pass under Docker, 6 of 6

## 3. Re-encryption progress

- [x] 3.1 After 1.1: give the operations indicator a name and a value for the re-encryption, and make its end announced once, through the toast if the audit shows the kit toast is a status or an alert, otherwise through the fix the audit names. Verify: a unit test next to the indicator and the cases "Re-encryption completes" and "Re-encryption fails" in `private-room-invite.spec.ts`. Done 2026-11-12: the indicator is the kit's operations button, which named itself after its icon; it carries the label of the running operation now, `Common:ReEncryptingFiles` for a re-encryption, or the count of processes when several run (`dbde2052` of the kit, with a unit test for the name and the value). The end is announced by the notice the flow raises, a kit toast with the alert role; the whole failure raises `Common:EncryptedReencryptFailed` the same way (`room-member-flows.test.ts`). The steps "Re-encryption completes" of `private-room-invite.spec.ts` and "Re-encryption ends with a file left out" of `private-room-members.spec.ts` pass under Docker; there the upload is still listed, so the name is the count of two

## 4. Members view

- [x] 4.1 After 1.1: expose pending access as the member's state without the drawn separator and offer the retry as a button named after the member, busy while it runs (`packages/shared/components/share/sub-components/User.tsx`). Add and translate the Common key of the name. Verify: the unit test of the shared member row, the cases "Retry from the keyboard" and "Retry succeeds" in `packages/client/__tests__/private-room-members.spec.ts`, the locale tests, and the specs that screenshot a Members view rerun under Docker. Done 2026-11-12: the pending state is its own text and the drawn bar is hidden from assistive technology; the retry is named `Common:RetryAccessFor` after the member, is exposed as busy while it runs and starts no second retry; when a retry succeeds and its button goes, the member's row takes the focus. The key is translated into 31 languages. The role list of a member is named `Common:RoleOfUser` here too, which task 4.2 asked for. `User.pendingAccess.test.tsx` passes (4 cases), the steps "Retry from the keyboard" and "Retry succeeds" of `private-room-members.spec.ts` pass under Docker, 6 of 6, and `external-sharing-rooms.spec.ts`, which screenshots a Members view, passes unchanged, 11 of 11
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
