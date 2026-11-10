# Tasks

## 1. Mock

- [ ] 1.1 In `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`, add an optional `versionGroup` to the file seed (default 1, kept on the record, reported as both `version` and `versionGroup`), and report the room owner's rights on a file as `FileSecurity.FilterEntryAsync` answers them: Rename, Lock, CopyLink, ReadHistory and EditHistory true in an active room, only ReadHistory in an archived one (design decision 3). The comment above `security` names the server method. Verify: cases "File in an active private room reports the owner's rename, lock, link and history rights", "File in an archived private room reports ReadHistory and none of the others" and "Seeded version group" in `packages/shared/__mocks__/handlers/files/__tests__/encrypted-files-contract.test.ts`, `cd packages/shared && pnpm exec vitest run __mocks__/handlers`; `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client, sdk, doceditor, login and management

## 2. Version badge

- [ ] 2.1 In `packages/shared/components/badges/index.tsx`, attach the version badge's click handler only when the item is not encrypted and has ReadHistory, and set its `Common:ShowVersionHistory` title only when the item is not encrypted (design decisions 1 and 2), with the one-line spec pointer. Verify: cases "Version badge of an encrypted file" (encrypted, `versionGroup` 3, ReadHistory true: the badge with `Common:VersionBadge` is shown, has no `Common:ShowVersionHistory` title, and a click in row and in tile view does not call `onShowVersionHistory`) and "Version badge of a file that is not encrypted" (the same file without the flag: the title is there and a click calls the handler once) in `packages/shared/components/badges/Badges.test.tsx`, `cd packages/shared && pnpm exec vitest run components/badges`; the encrypted cases fail on the component without the change; `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client and sdk

## 3. E2E

- [ ] 3.1 Client E2E: in `packages/client/__tests__/encrypted-file-ui.spec.ts`, a case "Version badge of an encrypted file" that seeds an encrypted file with `versionGroup` 3, finds its version badge by the label `V.3`, checks that it has no "Show version history" title, clicks it and checks that the version history panel does not open and that no `files/file/{id}/history` request is sent. Run it with every client spec that uses `encryptedFilesHandlers`, since task 1.1 changed the rights they see. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/encrypted-file-ui.spec.ts __tests__/keys-management-advanced.spec.ts __tests__/private-room-*.spec.ts __tests__/private-rooms-*.spec.ts --reporter=line`

## 4. Integration

- [ ] 4.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## Workflow follow-up

- Two more entry points belong to this change: the media viewer (download of the ciphertext and Rename for an encrypted file) and the plugin tabs of the info panel in a private room. They are added with `/opsx:update private-rooms-entry-point-gaps` before it is archived.
- Archive with `/opsx:archive private-rooms-entry-point-gaps` once all three entry points are done. The archive merges the badge scenarios into `openspec/specs/private-rooms/file-operations/spec.md`.
