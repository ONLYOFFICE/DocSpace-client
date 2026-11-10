# Tasks

## 1. Group decision in the server hardening change

- [ ] 1.1 With `/opsx:update private-rooms-server-hardening`: remove its MODIFIED block of "Removing a group revokes each member"; drop the group clause and the "Group removed" scenario from its ADDED "File keys follow the share"; delete tasks 6.4 and 6.5, with the clearing-path extension written into 6.4 on 2026-11-10; record the owner's decision of 2026-11-10 (groups and guests are not supported in private rooms in this version) in its design.md (design decision 4). Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-hardening --strict` (`OPENSPEC_TELEMETRY=0`)
- [ ] 1.2 Re-read through CodeGraph the user path of "File keys follow the share" and of "Clearing the access of a private room" (`FileSharingAceHelper.SetAceObjectAsync`, `RevokeFileKeysAsync`, `FileStorageService.RemoveSharesAsync`) and move both into the main `server-contract` spec if the server matches them, as the partial syncs of 2026-11-10 did; a requirement that does not match stays in the delta and is reported. Verify: each moved block equals its delta block; `npx -y @fission-ai/openspec@latest validate --all --strict`

## 2. Tests of the integrity limitations

- [ ] 2.1 In `packages/shared/services/encryption/__tests__/dse3-tampering.test.ts`, add the cases "Chunk size rewritten in storage" (a file of two chunks with the header's chunk size changed fails with an authentication or format error and returns no plaintext), "Older version served" (two versions encrypted under the same data key with different file nonces; the older one decrypts to its own content without an error) and "Another file served" (a container encrypted under another key fails with an authentication error). Verify: `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/dse3-tampering.test.ts`; `pnpm exec tsc --noEmit -p tsconfig.json` in shared

## 3. Purpose sections

- [ ] 3.1 Rewrite by hand the Purpose of `openspec/specs/private-rooms/feature-gating/spec.md` (private rooms are a beta offered while the E2E rooms app is on, with the host opt-in of an embedding frame; no browser-local flag) and of `openspec/specs/private-rooms/editor-integration/spec.md` (the editor's web client decrypts and encrypts in the browser with the DEK the client hands over; save-as, version history and the other withheld actions are handled for encrypted files), keeping each Implementation line accurate (design decision 5). Verify: `npx -y @fission-ai/openspec@latest validate --specs --strict`

## 4. Other changes

- [ ] 4.1 In `openspec/changes/private-rooms-dse3-header-authentication/tasks.md`, note that its version-3 header binding must modify or remove "DSE3 header flags, chunk size and name length are not authenticated" for version-3 containers when it archives after this change, and that it does not close "Older versions of a file are not detected". Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-dse3-header-authentication --strict`

## 5. Integration

- [ ] 5.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-spec-consistency`. Right after the archive, point the spec comment in `dse3-tampering.test.ts` at the renamed requirement, in its own commit: before the archive the new name is not in the main spec yet.
