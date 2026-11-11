# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Server behaviour was read in `../server` through CodeGraph on 2026-11-11 at `a7d94e4b81` (design.md, Context); nothing in `../server` changes. No locale key is added.

## 1. Client

- [x] 1.1 Client: make `isKeysManagementAvailable` in `packages/client/src/helpers/privateRoomsSection.ts` answer false for a guest, and pass the guest flag of the user from the profile body (`pages/Profile/Section/Body/index.tsx`) and from `components/KeysManagementRoute` (design decisions 1, 2 and 4). Verify: cases for a guest with the section available and for a guest holding a key in the helper's unit test next to it; case "Guest" in `packages/client/src/pages/Profile/Section/Body/__tests__/ProfileTabs.test.tsx` and in the test of `KeysManagementRoute`; `cd packages/client && pnpm exec vitest run src/helpers src/pages/Profile src/components/KeysManagementRoute`; `pnpm exec tsc` in client

## 2. Shared and SDK

- [ ] 2.1 Shared: give `packages/shared/hooks/usePrivateRoomKeyGate.ts` the guest flag and make `offerKeyGeneration` decline for a guest without opening the offer (design decision 3); pass the flag from the client's `CreateRoomDialog` and the SDK's `PrivateCreateRoomDialog`. Verify: case "Guest reaches the key offer of room creation" in the hook's unit test; `cd packages/shared && pnpm exec vitest run hooks`; the creation dialog suites of client and sdk; `pnpm exec tsc` in the six packages

## 3. Gate

- [ ] 3.1 Run the gate: `pnpm exec tsc` in the six packages, the shared, client and sdk unit suites, `npm --prefix ./common/tests run test:lefthook`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main spec included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 3.1; the archive adds the guest scenario to "Keys management tab follows the Private section" and the requirement "Key generation is withheld from guests" in `key-management`.
- Whether the Private section itself is hidden from guests is not decided here.
