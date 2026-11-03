# Tasks

## 1. Pin the limitation

- [x] 1.1 In `packages/shared/services/encryption/__tests__/dse3-tampering.test.ts`, add a `describe` for the version-2 limitation with two tests named after the scenarios. "Form flag cleared in storage": a container from `encryptFile(..., { isForm: true })` with bit 0x02 of byte 6 cleared decrypts to the same bytes, and `parseDSE3Header` reports `isForm` false. "Encrypted name stripped in storage": a container from `encryptFile(..., { fileName })` with the name bytes removed, bit 0x01 of byte 6 cleared and bytes 31-32 set to zero decrypts to the same bytes, and `parseDSE3Header` reports no encrypted name. Scenario "Content still authenticated" stays covered by that file's existing cases (swapped chunks, chunk count, file nonce, tag bytes, truncation). Verify: `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/dse3-tampering.test.ts` green and `pnpm exec tsc --noEmit -p tsconfig.json` in `packages/shared`.

## 2. Mark the version-3 change as deferred

- [x] 2.1 In `openspec/changes/private-rooms-dse3-header-authentication/`, add to the README and to the top of tasks.md the owner decision of 2026-11-02: the change is deferred to the next version, and its open tasks stay as the plan. Add to its tasks.md that its delta must also remove the requirement "DSE3 header flags and name length are not authenticated" from `private-rooms/encryption-core` and turn the two tests of 1.1 into failure cases for version 3. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-dse3-header-authentication --strict`.

## 3. Integration

- [ ] 3.1 Run `pnpm run test` (shared unit tests) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify both green.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-dse3-header-limitation`, which merges the requirement into `private-rooms/encryption-core`.
- Then `private-rooms-release-gate` 1.5 can be checked: `private-rooms-device-unlock-policy` was archived on 2026-10-20, and the header limitation will be in the main spec (`openspec show private-rooms/encryption-core --type spec`).
