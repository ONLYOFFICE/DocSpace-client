# Tasks

## 1. Cause and wording

- [ ] 1.1 Carry the cause in the file results of `packages/shared/services/private-room/room-encryption.ts`, add `reencryptFailureText` and `keyReplacedFileIds` to `room-member-flows.ts` and use them for the message after an invitation and after a retry (design.md, decisions 1-3); verify with cases "Invitation by a user who replaced their key", "Retry by the same user" and "Mixed causes" in the unit tests of the two modules via `cd packages/shared && pnpm exec vitest run services/private-room`
- [ ] 1.2 Word the pending section of the invitation result with `reencryptFailureText` in `packages/client/src/components/panels/InvitePanel/sub-components/InviteResult.js` and `packages/sdk/src/app/(rooms)/_components/invite-panel/sub-components/InviteResult.tsx`; verify with a case in each panel's unit test and `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client and sdk

## 2. Integration

- [ ] 2.1 Run `pnpm nx run-many -t tsc lint test --parallel=3`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; check on the local stand, in the room "Review check room", that the retry on the pending member shows the text with 4 files
