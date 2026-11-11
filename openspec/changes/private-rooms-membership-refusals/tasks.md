# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Server behaviour was read in `../server` through CodeGraph on 2026-11-11 at `a7d94e4b81` (design.md, Context); nothing in `../server` changes. The wording of the message is the owner's to approve before 1.1.

## 1. Client

- [x] 1.1 Shared and client: add `Common:EncryptedAccessChangeRefused` to `public/locales/en/Common.json` with the wording the owner approved (proposal.md, What Changes); add the helper that tells the refusal of a share request, a 403, from other failures, next to the private-room services (`packages/shared/services/private-room`); and make the leave action of the files actions store (`onLeaveRoomImpl`, `packages/client/src/store/filesActionsStore/rooms.helpers.ts`) catch it for a private room: it shows the message and resolves, while every other failure, and a 403 in a room that is not private, still rejects (design decisions 1 and 2). Verify: a unit test next to the helper; cases "Leave refused", "Leave fails for another reason" and "Refusal in an ordinary room" in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.leaveRoom.test.ts`, and "Leave after an owner change refused" in `FilesActionsStore.changeOwner.test.ts` next to it, where the owner-change setup lives; the cases of `packages/client/src/components/dialogs/LeaveRoomDialog/__tests__/LeaveRoomDialog.test.tsx` still pass, a resolved action closing the dialog; `cd packages/client && pnpm exec vitest run src/store/filesActionsStore src/components/dialogs/LeaveRoomDialog`; `pnpm exec tsc` in shared, client, sdk, doceditor, login and management. Done 2026-11-11: the helper cases 5 of 5, the store and dialog suites 215 of 215, `tsc` clean in the six packages; `locales.test.js` passes except its two completeness cases, which wait for 3.1 and already list four keys of another feature
- [x] 1.2 Client: make `updateRole` of the members view (`packages/client/src/pages/Home/InfoPanel/Body/views/Members/sub-components/User.tsx`) show `Common:EncryptedAccessChangeRefused` for the refusal in a private room, and the server's error as before otherwise (design decision 3). Verify: cases "Removal refused", "Role change refused" and "Refusal in an ordinary room" in a new `Members.accessRefusal.test.tsx` under `packages/client/src/pages/Home/InfoPanel/Body/views/Members/__tests__`; `cd packages/client && pnpm exec vitest run src/pages/Home/InfoPanel/Body/views/Members`; `pnpm exec tsc` in client. Done 2026-11-11: the members suites 25 of 25, with a fourth case "Failure that is not a refusal"; `tsc` clean in client
- [x] 1.3 E2E: add the case "Removal refused" to `packages/client/__tests__/private-room-members.spec.ts`: a member listed in the `withoutKeys` option of the room members mock is removed, the message is shown, the server's sentence is not, and the member stays listed. The mock needs no change (design.md, Context). Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/private-room-members.spec.ts --reporter=line`. Done 2026-11-11: the spec passes 6 of 6 under Docker `tests-dev`, with a second new case "Leave refused" that also checks the dialog closes and the shell shows no "Access denied" toast after it

## 2. SDK

- [ ] 2.1 SDK: make the leave dialog (`packages/sdk/src/app/(rooms)/_components/leave-room-dialog/index.tsx`) show `Common:EncryptedAccessChangeRefused` and close after the refusal of a private room, staying open with the error after any other failure (design decision 4). Verify: cases "Leave refused" and "Leave fails for another reason" in `index.test.tsx` next to it; `pnpm test:sdk`; `pnpm exec tsc` in sdk
- [ ] 2.2 SDK: make the role update of the private members view (`packages/sdk/src/app/(private)/_components/members/PrivateMemberUser.tsx`) show `Common:EncryptedAccessChangeRefused` for the refusal. Verify: case "Removal or role change refused" in a test next to `PrivateMemberUser.removal.test.tsx`; `pnpm test:sdk`; `pnpm exec tsc` in sdk

## 3. Translations

- [ ] 3.1 Write the translator comment of `Common:EncryptedAccessChangeRefused` with the `translate-comments` skill from the call sites of 1.1 to 2.2, and translate the key with the `translate-locales` skill. Verify: `cd common/tests && npx vitest run test/locales.test.js`, and the `translate-stale` skill reports nothing for the key

## 4. Records and gate

- [ ] 4.1 Correct the record of `private-rooms-server-hardening` 6.7 in its tasks.md: before it the refused leave was reported by the shell's 403 handler with `Common:AccessDenied`, and the dialog stayed on its loader; since it the dialog showed the server's sentence, which this change replaces. Verify: `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`
- [ ] 4.2 Run the gate: `pnpm exec tsc` in the six packages, the shared, client and sdk unit suites, `cd common/tests && npx vitest run test/locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date

## Workflow follow-up

- The refusal itself goes to the backend: the key check only when a user first gets access, and a stable reason in the answer. Both are tasks of the server follow-up change, not of this one.
- Once the server reports the reason, a later change narrows the message to key refusals.
- Archive after 4.2; the archive merges the two deltas into `room-membership` and `sdk-surface`.
