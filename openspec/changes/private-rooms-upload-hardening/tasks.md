# Tasks

## 1. No original names on the server

- [x] 1.1 Skip `checkIsFileExist` for items whose fixed target is private, and read the AI-room skip from the target, in `handleUploadConflictsImpl` (`packages/client/src/store/uploadDataStore/start.helpers.ts`), design D1; verify with a case named "Conflict check" in `src/store/uploadDataStore/__tests__/start.helpers.test.ts` asserting no `upload/check` call for a private target, and an E2E assertion in `private-room-upload-target.spec.ts` that no request body contains the original name

## 2. Retry, drop and gate

- [x] 2.1 Unlock before resetting retried private items, fail them with `Common:EncryptionLockedUpload` on decline, and guard `startSessionFuncImpl` against an item already in action (design D3); verify with a case named "Retry while another upload is running" in `src/store/uploadDataStore/__tests__/UploadDataStore.retry.test.ts` (no session before the prompt is answered, one session after it is accepted)
- [x] 2.2 Limit case (b) of `resolveDropTarget` to rows of the snapshot's folder and take the snapshot on the native drop event in `HOCs/withFileActions.js` and `pages/Home/index.js` (design D4); verify with a case named "Another room opened during the directory read" in `target.helpers.test.ts` and wiring tests for the row lookup (toast, failed lookup sends nothing) and the section drop
- [x] 2.3 Refuse a private target with another room type in `resolveUploadGate` (`packages/shared/services/private-room/encrypted-upload.ts`, design D5); verify with a case named "Private target with another room type" in `packages/shared/services/private-room/__tests__/upload-encryption-gate.test.ts`

## 3. Name clashes in a private target

- [x] 3.0 Decide with the product owner how name clashes are handled (design D2: client-side check with "keep both", or duplicates allowed as a limitation); record the decision and its date in design.md and, for (a), add the requirement to the file-operations delta before implementing it
- [x] 3.1 Implement option (a), decided on 2026-10-22: check the decrypted names of the destination (filename cache plus recovery) and offer "keep both" with a copy suffix, with any new locale key run through `/translate-comments` and `/translate-locales`; verify with unit tests named after the new scenarios and an E2E case copying into a private room that already holds a file of the same name

## 4. Leftovers

- [ ] 4.1 Delete `packages/client/src/components/Article/Body/Items.js`, read the quota from the target folder in `createFoldersTreeImpl`, add tests named "Shift+U pressed" and "Shift+I pressed", and turn the restating comments of design D6 into `Spec:` pointers; verify with `pnpm run tsc`, `pnpm run lint` and `cd packages/client && pnpm exec vitest run src/store/uploadDataStore src/store/filesActionsStore`

## 5. Integration

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`), the private-room E2E specs in Docker, and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-upload-hardening` after review.
