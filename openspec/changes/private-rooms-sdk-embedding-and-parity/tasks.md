# Tasks

One task is one commit: the code, the tests, the locales and the tick. Keep
the pre-push gate in mind: tsc, biome, locale tests and the shared, client
and SDK unit tests must stay green. Group 1 follows both proposal decisions, taken
by the owner on 2026-11-19. Unit tests of the SDK run with
`cd packages/sdk && pnpm exec vitest run <path>`; its private E2E suite with
`cd packages/sdk && pnpm run test:build && pnpm exec playwright test __tests__/e2e/private`.

## 1. Embedding limit and policy

- [ ] 1.1 Pin the headers of the private routes in `packages/sdk/src/proxy.test.ts` (development and production builds), and delete the fixme case "csp-headers" of `packages/sdk/__tests__/e2e/private/private-security.spec.ts`, which these cases replace (design decision 2; `private-rooms-test-coverage-gaps` leaves it to this task). If task 4.2 of `private-rooms-sdk-private-pages-only` has moved that spec file meanwhile, delete the case where it now is. No change to `proxy.ts`. Verify: cases "Private page served", "Connections in production", "Private page framed by the portal" and "Private page framed by another origin" (asserting `frame-ancestors 'self'`, the same-origin opener and resource policies, `connect-src 'self' https:` and no `'unsafe-eval'` in production), and `cd packages/sdk && pnpm exec vitest run src/proxy.test.ts`
- [ ] 1.2 Correct the "Embedding" paragraph of `openspec/changes/private-rooms-beta-release/release-notes.md` for option A: the embedded client frame (the host library's Manager mode) shows private rooms when the host sets `privateRooms` in the frame configuration, which host library 2.2.0 passes to the frame without declaring it; the SDK's own private pages under `/sdk/private` open only from pages of the portal's own origin in this version. Before writing the first sentence, confirm on a stand that a Manager-mode frame from a trusted origin with `privateRooms: true` shows the Private section, and record the run in design.md. Verify: the stand note in design.md, the paragraph no longer says the SDK private pages take the property from a host, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`
- [ ] 1.3 Hand the library item of design.md ("Hand-over to the host library") to the owners of `docspace-sdk-js` and record the date and the addressee there. Verify: the dated line in design.md

## 2. Owner change

- [ ] 2.1 Make `packages/sdk/src/app/(private)/_hooks/usePrivateOwnerChangeFlow.ts` unlock through `requireIdentity`, call `prepareNewOwner` before `setFileOwner`, and on a 409 count the candidate's files from `getRoomMissingFileKeys` (design decision 3). Verify: cases "Missing entries wrapped before the transfer", "Entries still missing", "Transfer refused by the server" and "Unlock declined" in a new `(private)/_hooks/usePrivateOwnerChangeFlow.test.tsx`, the existing `usePrivateOwnerChangeFlow.leave.test.tsx` unchanged, and, in the members group of `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`, the fixme case "change-owner" replaced by Playwright cases "Missing entries wrapped before the transfer" and "Transfer refused by the server" on the `encryptedFiles` mock, which answers 409 as `SecurityController.ChangeFileOwner` does (`private-rooms-test-coverage-gaps` leaves that fixme to this task)
- [ ] 2.2 Close `(private)/_components/owner-change/PrivateChangeOwnerDialog.tsx` after the transfer whatever the leave step answers, and show Common:EncryptedAccessChangeRefused for a 403 on that step in a private room, never the server's text (design decision 8). Verify: cases "Leave after an owner change refused" and a leave failing without a 403 in `PrivateChangeOwnerDialog.test.tsx`, and `cd packages/sdk && pnpm exec vitest run "src/app/(private)/_components/owner-change"`

## 3. Info panel menu of an open room

- [ ] 3.1 Send edit, invite and change owner of `(rooms)/_hooks/useRoomContextMenuModel.ts` to `RoomActionsOverrideContext` when it is present, as leave already is (design decision 4). Verify: cases "Edit from the info panel of an open room", "Invite from the info panel of an open room" and "Owner change from the info panel of an open room" in `(private)/_components/info-panel/index.test.tsx` rendering the open-room page's providers, a case in `(rooms)/_hooks/useRoomContextMenuModel.test.tsx` that the generic model without an override still calls its callbacks, and a Playwright case "Owner change from the info panel of an open room" in `private-rooms.spec.ts`

## 4. Translations of the quota warning

- [ ] 4.1 Copy `LicenseExpiredRestriction`, `PlanPaymentOverdue`, `GracePeriodActive`, `LicenseGracePeriodInfo`, `ChooseNewPlan`, `CannotCreateNewRoom`, `NewRoomWillExceedLimit`, `RoomsQuotaAlmostExhausted`, `NumberOfRoomsAccordingToTariff` (client `Payments`) and `ContactToUpgradeTariff` (client `MainBar`) into `public/locales/<lng>/Common.json` of every language with their translations and `.meta`, with a dry-run-first script that checks placeholders and tags (`.claude/rules/bulk-locale-edits.md`); refresh the translator comments with `/translate-comments` and fill missing languages with `/translate-locales`; make `(rooms)/_components/quota-warning-dialog/index.tsx` ask for Common only; widen `(private)/translations.test.ts` to the files of `(private)`, `(rooms)`, `(docspace)` and `(personal-files)`, where a key with a namespace other than Common fails and an unprefixed key fails unless Common holds it (design decision 5). Verify: a case "Room limit reached" next to the dialog asserting translated texts and no raw key, the widened `translations.test.ts` (which fails on the dialog before the change), a Playwright case "Room limit reached" in `private-rooms.spec.ts` with the rooms quota at its limit, and `cd common/tests && npx vitest run test/locales.test.js`

## 5. Private room creation

- [ ] 5.1 Make `EncryptionIdentityStore.loadKeys` (`(private)/_store/EncryptionIdentityStore.tsx`) return the load in flight to a second caller, so `resolveEncryptionKeys` of `PrivateCreateRoomDialog` decides on its result (design decision 6). Verify: a case "Create pressed during the load" in `(private)/_store/EncryptionIdentityStore.test.tsx` and in `(private)/_components/create-room/PrivateCreateRoomDialog.test.tsx`, the cases "Key list still loading", "Key list failed to load" and "Key list known to be empty" unchanged, and `cd packages/sdk && pnpm exec vitest run "src/app/(private)/_store" "src/app/(private)/_components/create-room"`

## 6. Upload panel

- [ ] 6.1 Keep one abort controller per batch in `(docspace)/_store/UploadStore.tsx`; `cancelBatch` aborts all of them and `dropPending` drops only rows whose upload has stopped (design decision 7). Verify: a case "Cancel all with two uploads running" in `(docspace)/_store/UploadStore.test.tsx` asserting both batches' signals are aborted and no running row is dropped, and `cd packages/sdk && pnpm exec vitest run "src/app/(docspace)/_store/UploadStore.test.tsx"`
- [ ] 6.2 In `(private)/_hooks/useEncryptedUpload.ts`, take the files of a cancelled name-clash dialog out of the panel and its totals as `cancelItem` does, and fail files stopped by a lock with Common:EncryptionLockedUpload. Verify: cases "Name clash cancelled" and "Identity locked during an upload" in `(private)/_hooks/useEncryptedUpload.test.tsx`, a case in `UploadStore.test.tsx` that after a lock `errorsCount` counts the stopped files, and after a cancelled clash `hasItems` is false when no other row is left, and the Playwright case "Upload with a clashing name: cancel sends nothing" in `private-rooms.spec.ts` extended to assert that the panel holds no row of the cancelled files

## 7. Members search

- [ ] 7.1 Move the exclusions of `classifyMembers` (`(private)/_components/members/PrivateMembersView.utils.ts`) into one predicate used by the sections and by the search results of `PrivateMembersView.tsx` (design decision 9). Verify: a case "Members searched" in `PrivateMembersView.utils.test.ts` and in a members view test with a search text, "Members listed" unchanged, and `cd packages/sdk && pnpm exec vitest run "src/app/(private)/_components/members"`

## 8. Gate

- [ ] 8.1 Run the SDK private suite on a build made with `pnpm run test:build`, the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages, with `pnpm exec tsc` in `packages/sdk` beforehand), the full locale suite, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; on a stand, record the response headers of `/sdk/private` through nginx (both policies present). Verify: green runs and the header note recorded in design.md

## Workflow follow-up

- Archive after 8.1. The archive adds two requirements to the main `sdk-surface` spec and replaces eight.
- In the archive commit, change the Purpose of the main `sdk-surface` spec from "the SDK keeps serving this surface for embedding hosts" to say the surface is served to pages of the portal's own origin, as the framing requirement states.
- If the owner later chooses option B of decision 1, it is a change of its own with the preconditions listed in design.md, decision 1.
