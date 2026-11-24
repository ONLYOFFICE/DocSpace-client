# Tasks

No behaviour changes. One task is one commit with its tick.

## 1. Text outside the deltas

- [x] 1.1 Correct the two code comments that describe removed behaviour: the mention of hidden-tab locks above `lock` in `packages/shared/context/encryption/EncryptionContext.tsx`, and "every visit reads them again" above the replaced-key set in `packages/shared/services/encryption/filename-cache.ts`; verify with `cd packages/shared && pnpm exec tsc --noEmit -p tsconfig.json` and a search that finds no "hidden-tab" under `packages/shared/context/encryption/EncryptionContext.tsx`
- [ ] 1.2 Edit the Purpose of `openspec/specs/private-rooms/sdk-surface/spec.md`: the SDK opens encrypted files in the editor and there is no feature flag, only the host's opt-in (design.md, decision 3); verify with `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`

## 2. Gate

- [ ] 2.1 Run `npx -y @fission-ai/openspec@1.17.0 validate --all --strict` and check that no unarchived change carries one of the seventeen requirements (the search of design.md, decision 2, repeated); verify: validation green, search empty

## Workflow follow-up

- Archive after 2.1; the archive rewrites the seventeen requirements in the main specs.
