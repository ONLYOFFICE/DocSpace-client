# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). No behaviour changes and no code: the pre-push gate (tsc, biome, locale tests, shared, client and sdk unit tests) is not affected, no locale changes.

## 1. Decisions

- [x] 1.1 Record the owner's answers to decisions 2, 3 and 4 of proposal.md with their date, and bring the `key-management` delta in line with them (drop or keep the scenario "Forget device while unlocked" and the requirement "Passphrase composition rules"). Verify: `npx -y @fission-ai/openspec@1.17.0 validate private-rooms-threat-model-spec --strict`. Done 2026-11-12: "Forget device" and the auto-lock preset are fixed with code in a change of their own, so the modified "Remember this device" left the delta; "Passphrase composition rules" stays; the validation passes

## 2. Check against the branch

- [ ] 2.1 Read each row of the table in design.md, Context, against the code once more at the commit of the day, and correct the delta where the code moved. Verify: the date and the commit recorded here; for the search cap and first-seen pinning, `cd packages/client && pnpm exec vitest run src/store/filesStore` and `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/tofu-store.test.ts` pass

## 3. Gate

- [ ] 3.1 Archive this change on a scratch copy of `openspec/` and run `npx -y @fission-ai/openspec@1.17.0 validate --all --strict` there and on the branch, so that no requirement of the main specs passes 500 characters after the archive. Verify: both green, recorded here with the date and the counts
- [ ] 3.2 After the archive: tick criterion 1.21 of `private-rooms-release-gate` with the name of the archived change. Verify: `npx -y @fission-ai/openspec@1.17.0 validate private-rooms-release-gate --strict`

## Workflow follow-up

- Archive after 3.1; 3.2 is committed in `private-rooms-release-gate` after the archive.
- Decisions 2 and 4 of proposal.md become one change with code: "Forget device" locks the identity, and a newly picked auto-lock preset restarts the idle timer.
