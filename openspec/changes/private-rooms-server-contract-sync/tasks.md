# Tasks

## 1. Other changes

- [x] 1.1 With `/opsx:update private-rooms-server-hardening`: rename its REMOVED header "No recovery, offboarding or file-key audit endpoints" to "No recovery or offboarding endpoints"; give its MODIFIED "Private room creation requires keys" the statement of this change (without the AI agent clause, which its scenario keeps) while keeping its "Public or form-filling room created as private" scenario; give its MODIFIED "Server-side copy out of a private room is refused" the 403 "Access denied" wording of this change (design decisions 3 and 4). Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-hardening --strict` (`OPENSPEC_TELEMETRY=0`)

## 2. Integration

- [x] 2.1 `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the validate summary

## 3. Client types and E2E mocks (added 2026-11-10)

- [x] 3.1 Types: in `packages/shared/api/privacy/types.ts` add a member key type whose `privateKeyEnc` is optional and return it from `getRoomEncryptionKeys` and `getFilePublicKeys` (`packages/shared/api/privacy/index.ts`), leaving `TEncryptionKeyPair` of the own key set as it is (design decision 5); make `userKeys` optional in `TFileEncryptionInfo` (`packages/shared/api/files/types.ts`); make `deleteEncryptionKey` resolve with no value. Adjust the readers the compiler names. Verify: `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client, sdk, doceditor, login and management; `cd packages/shared && pnpm exec vitest run services/private-room services/encryption api`
- [x] 3.2 403 texts: the refusals of `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` (the batch move of a file or folder across a private room's boundary, and `privacyroom/{roomId}/access/missing`) and of `packages/shared/__mocks__/handlers/privacyroom/index.ts` (`access/candidates`) that say "You don't have enough permission ..." answer 403 "Access denied", as `ResponseWrapper` does for a `SecurityException`; the contract cases that expect the old texts follow, and each changed handler's comment names the server action. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`
- [ ] 3.3 publickeys: the mock of `GET files/file/{fileId}/publickeys` returns the keys of the room's members other than the room owner, plus the file's creator, taken from an optional `createdBy` of the file seed (the room owner when left out) (design decision 7). Verify: contract cases "Room owner who did not create the file" and "Creator who left the room" in `packages/shared/__mocks__/handlers/files/__tests__/encrypted-files-contract.test.ts`, `cd packages/shared && pnpm exec vitest run __mocks__/handlers`; `pnpm exec tsc --noEmit -p tsconfig.json` in the six packages
- [ ] 3.4 Key mock: `privacyroomKeysHandlers` takes an option that makes the caller a guest, refused with 403 on create, replace and delete, and refuses with 400 a create or replace whose key set JSON exceeds 65,535 bytes, keeping the stored set (design decision 6). Verify: contract cases "Guest creates a key", "Guest deletes a key" and "Key set too large" in `packages/shared/__mocks__/handlers/privacyroom/__tests__/contract.test.ts`, `cd packages/shared && pnpm exec vitest run __mocks__/handlers`; `pnpm exec tsc --noEmit -p tsconfig.json` in the six packages
- [ ] 3.5 E2E: run every client spec that uses `encryptedFilesHandlers` or `privacyroomKeysHandlers` under Docker, since 3.2 to 3.4 change what they see, and adapt a spec that relied on the old mock. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/encrypted-file-ui.spec.ts __tests__/keys-management*.spec.ts __tests__/key-flow-edge-cases.spec.ts __tests__/private-room-*.spec.ts __tests__/private-rooms-*.spec.ts --reporter=line`
- [ ] 3.6 With `/opsx:update private-rooms-server-hardening`: give its MODIFIED "File public keys" the block of this change, so its archive does not put "plus the owner" back. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-hardening --strict`

## 4. Integration

- [ ] 4.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-server-contract-sync` once group 4 is done, before `private-rooms-server-hardening`, which removes "No recovery or offboarding endpoints" under its new name.
