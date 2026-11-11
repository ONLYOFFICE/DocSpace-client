# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The wording of the new message is for the owner to approve before 1.2 (proposal.md, decision 1). Nothing in `../server` changes.

## 1. Shared

- [x] 1.1 Read in `../server` through CodeGraph the delete route of one file (`DELETE files/file/{id}`): whether the user who created a file may delete it in a private room under each role that may upload, whether a deletion in a private room is permanent, and whether the answer carries a finished operation or one still running. Record the controller action and the files read in design.md, Context, and settle design decision 4 with it. Verify: the record in design.md with the commit of `../server`; `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Done 2026-11-11 at `a7d94e4b81`: the route queues an operation, a refusal lands in the operation's error, the deletion is final inside a room; who may delete was read in the action's remarks, not followed into `FileSecurity`; design decision 4 settled: the operation is awaited within a bound
- [x] 1.2 Shared: in `packages/shared/services/private-room/encrypted-upload-orchestrator.ts`, try the write of the uploader's entry again (design decision 1); when it still fails, or the wrapping itself failed, read the entries of the file, keep the file if the uploader's entry is there, otherwise delete it permanently; return whether the stored file was removed, without a file id when it was (design decisions 2 to 4); add `Common:EncryptionUploadNotKept` to `public/locales/en/Common.json` with the approved wording and let `getEncryptedUploadErrorMessage` choose it for a removed upload. Verify: cases "Entry written on a later try", "Entry cannot be written", "Key cannot be wrapped", "Entry written although the write reported a failure" and "Deletion fails" in `packages/shared/services/private-room/__tests__/encrypted-upload-orchestrator.test.ts`, the two existing wrap-failure cases revised to the new outcome; `cd packages/shared && pnpm exec vitest run services/private-room`; `pnpm exec tsc` in the six packages. Done 2026-11-11: six cases in the group "A stored upload without the uploader's entry is not kept", the five planned and "Deletion still running when it is answered"; the two earlier wrap-failure cases became "Key cannot be wrapped" and "Deletion fails"; the private-room suite 358 of 358, `tsc` clean in the six packages, Biome clean. The key is English only until 3.1, so the two completeness cases of `locales.test.js` list it

## 2. Client and SDK

- [ ] 2.1 Client: make `packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts` take the failed-row path, with the retry it offers and no listed file, for an upload whose stored file was removed, and keep "uploaded with error" for one whose deletion failed. Verify: cases "Entry cannot be written" and "Deletion fails" in the upload store tests under `packages/client/src/store/uploadDataStore/__tests__`; `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`; `pnpm exec tsc` in client
- [ ] 2.2 SDK: check that `packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts` fails the row with the message of the outcome and lists no file for a removed upload; change it only if it does not. Verify: a case "Upload through the SDK" next to the hook's tests; `pnpm test:sdk`; `pnpm exec tsc` in sdk

## 3. Translations

- [ ] 3.1 Write the translator comment of `Common:EncryptionUploadNotKept` with the `translate-comments` skill from its call sites and translate it with the `translate-key` skill, leaving the metadata of other keys as committed. Verify: `cd common/tests && npx vitest run test/locales.test.js`, and the `translate-stale` skill reports nothing for the key

## 4. E2E

- [ ] 4.1 E2E: give the encrypted-files mock a mock-only handle method that fails the access writes of a file (design decision 6), with a contract case stating it is not server behaviour, and add the case "Entry cannot be written" to `packages/client/__tests__/private-room-upload-target.spec.ts`: an upload whose entry cannot be written ends as a failed row with the message, the room lists no new file and the mock holds none. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`; `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/private-room-upload-target.spec.ts --reporter=line`

## 5. Gate

- [ ] 5.1 Run the gate: `pnpm exec tsc` in the six packages, the shared, client and sdk unit suites, `npm --prefix ./common/tests run test:lefthook`, `cd common/tests && npx vitest run test/locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 5.1; the archive adds the requirement to `file-operations`, and the criterion 1.19 of `private-rooms-release-gate` can then be ticked.
- Files orphaned before this change cannot be found from the client; whether the server sweeps encrypted files without any entry is a question for the backend.
