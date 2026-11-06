# Tasks

## 1. Client

- [x] 1.1 In `buildContextOptions` (`packages/client/src/store/filesStore/contextOptions.helpers.ts`), keep `duplicate` for a file that is encrypted and has `security.Move`, whatever `security.Duplicate` says (design decision 1), with the one-line spec pointer of decision 2. Verify: cases "Duplicate offered for an encrypted file" (Move true, Duplicate false), "Duplicate withheld without the move right" (Move false) and "Duplicate withheld in an archived private room" (the archived rights of the mock: Move false) in `packages/client/src/store/filesStore/__tests__/FilesStore.contextOptions.branches.test.ts`, `cd packages/client && pnpm exec vitest run src/store/filesStore`. Review any snapshot diff in `__snapshots__` before taking it with `-u` on that folder only; it may show only `duplicate` on encrypted rows
- [x] 1.2 Client E2E: in `packages/client/__tests__/private-room-cross-room-copy.spec.ts`, a case "Duplicate offered for an encrypted file" that opens Move or copy → Duplicate on the row of an encrypted file of the room, unlocks, and checks that the room holds a second encrypted file whose stored bytes are a DSE3 container and not the plaintext, with the key entries of the room's members. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=2 tests-dev pnpm exec playwright test __tests__/private-room-cross-room-copy.spec.ts --reporter=line`

## 2. SDK

- [x] 2.1 In `packages/sdk/src/app/(docspace)/_hooks/useItemContextMenu.ts`, add the duplicate item for a file when `security.Duplicate` is set or when the file is encrypted and `security.Move` is set, with the same spec pointer. Verify: cases "Duplicate offered for an encrypted file", "Duplicate withheld without the move right" and "Duplicate withheld in an archived private room" next to "Copy offered for an encrypted file" in `useItemContextMenu.test.tsx`, `cd packages/sdk && pnpm exec vitest run "src/app/(docspace)/_hooks"`
- [x] 2.2 SDK private E2E: rebuild (`cd packages/sdk && pnpm run test:build`) and run `pnpm exec playwright test __tests__/e2e/private --reporter=line`. "Same-room copy" and "Copy of a name that already has a copy" pass without spec edits, and nothing else fails. Verify: that run's summary. Done 2026-11-06 after `9bf28c4199d`: 36 passed, 14 skipped, none failed (34 passed and these two failed before the change)

## 3. Integration

- [x] 3.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green; then record in `private-rooms-invite-atomic-rewrap` 5.1 that the SDK private folder is fully green again. Verify: the gate output and the validate summary. Done 2026-11-06: `common/tests` 61 passed and 3 skipped, `nx run-many -t tsc lint test` green over the six packages, `validate --all --strict` 21 of 21; recorded in `private-rooms-invite-atomic-rewrap` 5.1, now ticked

## Workflow follow-up

- Proposal decision 1 (Move as a stand-in, or the server answering Duplicate by role for encrypted files) is open for the owner and the backend team. If the server changes, the client rule needs no edit: the server's Duplicate answer is already its first operand.
- Archive with `/opsx:archive private-rooms-encrypted-duplicate` after review. The archive adds the requirement to `openspec/specs/private-rooms/file-operations/spec.md`.
