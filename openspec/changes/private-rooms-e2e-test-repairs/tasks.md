# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change touches test code only.

## 1. Client

- [x] 1.1 E2E: make `startHeldInvitation` of `packages/client/__tests__/private-room-invite.spec.ts` wait until the uploaded file holds the key of the uploader before it installs the route that holds key writes. Verify: the two "Re-encryption aborted" cases repeated ten times each under Docker `tests-dev` (`--repeat-each=10 -g "Re-encryption aborted"`) without a failure, then the whole spec once
  - 2026-11-16: the helper polls the file keys of the uploaded file until they hold the uploader alone, then waits for the quiet network as before. Docker `tests-dev`, `WORKERS=3`: the two cases repeated ten times each, 20 of 20; before the repair the same cases failed once in 8 and once in 12 runs. The whole spec: 8 of 8.

## 2. SDK

- [x] 2.1 E2E: look for the heading "Private rooms" in "List header" and in the absence check of "Archive header" of `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`. Verify: `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private/private-rooms.spec.ts` on a build made with `pnpm run test:build`, with no failed case
  - 2026-11-16: both cases look for "Private rooms". Run locally on the build of `test:build` made the same day, without screenshots, since the machine has no SDK test image: 36 passed, 3 skipped, none failed.

## 3. Gate

- [ ] 3.1 Run `pnpm exec tsc` in client and sdk, `biome lint` on the two spec files and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: clean runs recorded here with the date

## Workflow follow-up

- Archive after 3.1; there is no delta to merge.
