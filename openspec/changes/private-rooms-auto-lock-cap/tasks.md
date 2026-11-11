# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The owner approved the tab-hidden rule and the wording of the hint on 2026-11-11 (proposal.md, decisions 1 and 2). Nothing in `../server` changes.

## 1. Shared

- [x] 1.1 Shared: in `packages/shared/services/encryption/auto-lock-preference.ts` keep the presets 5m, 15m and 30m, each saying whether it locks on a hidden tab, make 30 minutes the default, and export the read of that rule for the stored value (design decisions 1 and 2); in `packages/shared/context/encryption/EncryptionContext.tsx` lock on a hidden tab by that rule instead of by a non-zero timeout. Verify: cases "Offered presets", "Preset off" (stored 0 and stored 3600 read as 30 minutes), "Tab hidden" and "Tab hidden with the default preset" in `packages/shared/services/encryption/__tests__/auto-lock-preference.test.ts` and next to the context's tests; `cd packages/shared && pnpm exec vitest run services/encryption context/encryption`; `pnpm exec tsc` in the six packages. Done 2026-11-11: the presets carry `locksWhenTabHidden`, the default is 1800 seconds, and the context asks `locksWhenTabHidden()` on a hidden tab; cases "Offered presets", "Preset off", "Tab hidden" and "Tab hidden with the default preset" in `auto-lock-preference.test.ts`, the last one also in `EncryptionContext.test.tsx`; the encryption suites 400 of 400, `tsc` clean in the six packages. The keys page still lists the two removed options until 2.1; picking one changes nothing

## 2. Client

- [ ] 2.1 Client: list the three presets in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/AutoLockSetting.tsx`, and remove `Common:AutoLockOff` and `Common:AutoLock1h` from `public/locales/*/Common.json` with their `.meta` files (design decision 4). Verify: case "Offered presets" in `__tests__/AutoLockSetting.test.tsx` next to the component; `cd packages/client && pnpm exec vitest run src/pages/Profile`; `cd common/tests && npx vitest run test/locales.test.js`; `pnpm exec tsc` in client

## 3. Translations

- [ ] 3.1 Set `Common:AutoLockHint` to the approved wording, refresh its translator comment with the `translate-comments` skill and translate it again in every language with the `translate-key` skill, leaving the metadata of other keys as committed (design decision 5). Verify: `cd common/tests && npx vitest run test/locales.test.js`, and the `translate-stale` skill reports nothing for the key

## 4. E2E and gate

- [ ] 4.1 E2E: run `packages/client/__tests__/keys-management.spec.ts`, `keys-management-advanced.spec.ts` and `key-flow-edge-cases.spec.ts` under Docker `tests-dev`; update a screenshot of the keys page only if it shows the selector's value, with `--update-snapshots`, and say so here. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test <specs> --reporter=line`
- [ ] 4.2 Run the gate: `pnpm exec tsc` in the six packages, the shared and client unit suites, `npm --prefix ./common/tests run test:lefthook`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 4.2; the archive rewrites "Auto-lock timeout presets" in `key-management`.
