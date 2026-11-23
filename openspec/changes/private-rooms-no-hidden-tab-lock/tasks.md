# Tasks

## 1. Remove the rule

- [x] 1.1 Remove the `visibilitychange` lock from `packages/shared/context/encryption/EncryptionContext.tsx` and `locksWhenTabHidden` (preset field and exported reader) from `packages/shared/services/encryption/auto-lock-preference.ts`; drop the mock of the reader in `packages/sdk/src/app/(private)/_components/private-shell/AbortOnLockEffect.test.tsx`; replace the hidden-tab cases in `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` and `packages/shared/services/encryption/__tests__/auto-lock-preference.test.ts` with "Tab hidden" (stays unlocked with every preset) and "Idle time runs while the tab is hidden"; verify with `cd packages/shared && pnpm exec vitest run context/encryption services/encryption`, `pnpm test:sdk` and `pnpm exec tsc` in shared, client, sdk and doceditor
- [ ] 1.2 Rewrite the E2E cases that expect the hidden-tab lock: "auto-lock on tab visibility change hides the Lock now button" in `packages/client/__tests__/key-flow-edge-cases.spec.ts` becomes "a hidden tab keeps the key unlocked" with the 5-minute preset, and the remembered-device scenario in `keys-management-advanced.spec.ts` reaches its lock through the idle timeout instead; verify with `cd packages/client && pnpm exec playwright test key-flow-edge-cases.spec.ts keys-management-advanced.spec.ts` in Docker

## 2. Setting

- [x] 2.1 Remove the hint from `packages/client/src/components/AutoLockSetting/AutoLockSetting.tsx` and `AutoLockHint` from every `public/locales/*/Common.json` with its `.meta` files (bulk edit by script, per `.claude/rules/bulk-locale-edits.md`); update `AutoLockSetting.test.tsx`; verify with `cd packages/client && pnpm exec vitest run src/components/AutoLockSetting`, `cd common/tests && npx vitest run test/locales.test.js` and a search that finds no `AutoLockHint` outside `openspec/changes/archive`

## 3. Integration

- [ ] 3.1 Run `pnpm nx run-many -t tsc lint test --parallel=3`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; check on the local stand with the 5-minute preset and a remembered device that hiding the tab and returning leaves Common:KeyUnlocked and no locked-key block

## Workflow follow-up

- Archive the change after the integration check.
