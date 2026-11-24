# Tasks

## 1. Verdict

- [ ] 1.1 Move the verdict into `unwrapDekForCurrentUser` in `packages/shared/services/encryption/room-file-access.ts` (design.md, decision 1); verify in `packages/shared/services/encryption/__tests__/room-file-access.test.ts` with real keys: "Key imported again" (a wrap that names another key id and that the key opens is unwrapped), a wrap for another key pair under another id throws `KeyReplacedError`, a wrap for another key pair under a listed id keeps its error
- [ ] 1.2 Pass the key list and drop the early checks in the shared callers (`services/private-room/encrypted-copy.ts`, `encrypted-download.ts` with the `keyReplaced` flag, `encrypted-filename-recovery.ts`, `components/media-viewer/MediaViewer.tsx`) and in `packages/doceditor/src/hooks/useFileEncryptionKeys.ts`; verify with their unit tests: the cases added for the replaced key now reach the unwrap and end as before, and a "Key imported again" case in each passes through; `cd packages/shared && pnpm exec vitest run services components/media-viewer`, `pnpm test:doceditor`
- [ ] 1.3 Follow the flag and the error in `packages/client/src/store/filesActionsStore/download.helpers.ts` and `copyMove.helpers.ts`; verify with `pnpm test:store`: single download and single copy show Common:EncryptedFileKeyReplaced after the unlock, the archives count by the flag, a file the key opens is delivered

## 2. Integration

- [ ] 2.1 Adjust the E2E case of `packages/client/__tests__/private-room-cross-user-download.spec.ts` to a wrap the key cannot open and add "Key imported again" (same key, another id: no notice, the file opens); run that spec in Docker; run `pnpm nx run-many -t tsc lint test --parallel=3`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; check on the local stand that room 19 still shows the notice with 6 files
