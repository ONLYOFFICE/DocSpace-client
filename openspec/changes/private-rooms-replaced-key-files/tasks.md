# Tasks

## 1. Recognise the case

- [x] 1.1 Add `KeyReplacedError` to `packages/shared/services/encryption/errors.ts` and `isWrappedForReplacedKey(info, userId)` to `room-file-access.ts` (design.md, decisions 1 and 2); verify with new cases in `packages/shared/services/encryption/__tests__/room-file-access.test.ts`: other key id, same id in another letter case, empty id, all-zero id, missing or empty `userKeys`, no own entry
- [x] 1.2 Add Common:EncryptedFileKeyReplaced to `public/locales/en/Common.json`, write its `.meta` comment with the `translate-comments` skill, translate it with `translate-key`, map `KeyReplacedError` to it in `error-i18n.ts` and return early for it in `reportPotentialGhostState`; verify with `packages/shared/services/encryption/__tests__/ghost-state-notifier.test.ts` (no toast, session gate untouched), the error-i18n test, and `cd common/tests && npx vitest run test/locales.test.js`

## 2. Single-file operations

- [ ] 2.1 Raise the message before the unlock in download and copy/move (`packages/client/src/store/filesActionsStore/download.helpers.ts`, `copyMove.helpers.ts`, `packages/shared/services/private-room/encrypted-copy.ts`), beside the existing no-access branch; in a batch the file goes to the existing report; verify with the unit tests of those helpers (single file: Common:EncryptedFileKeyReplaced and no `requireIdentity` call; two files: one copied, one named) via `pnpm test:store` and `cd packages/shared && pnpm exec vitest run services/private-room`
- [ ] 2.2 Show the message in the media viewer before the content is fetched (`packages/shared/components/media-viewer/MediaViewer.tsx`); verify with a MediaViewer unit test: message shown, no fetch of the file, message gone on the next file

## 3. Editor

- [ ] 3.1 Add the `key-replaced` status to `packages/doceditor/src/hooks/useFileEncryptionKeys.ts`, checked before `requireIdentity`, and its entry in `KEY_FLOW_ENDS` of `Editor.tsx`; verify with `pnpm test:doceditor`: the hook test asserts the status and that `requireIdentity` was not called, the Editor test asserts the text, no button and no editor component

## 4. Room notice

- [ ] 4.1 Record the files that match the predicate during filename recovery (`packages/shared/services/private-room/encrypted-filename-recovery.ts`) in a set cleared with the filename cache; verify with the recovery unit test: ids recorded, no ghost-state call, set empty after a lock
- [ ] 4.2 Add Common:PrivateRoomReplacedKeyBarTitle and Common:PrivateRoomReplacedKeyBarText (plural forms) with `.meta` comments and translations, expose the count of loaded files in the set from the files store, and render the notice in `packages/client/src/pages/Home/Section/Body` under the private-room condition, never together with the locked-key block; verify with a component test next to `PrivateRoomLockedBlock.test.tsx` (count shown, hidden at zero, hidden while locked) and the locale test
- [ ] 4.3 Extend the MSW access handler in `packages/shared/__mocks__/handlers` with a file whose entry names a key outside `userKeys` (`Array.from`, no spread of a Set) and add an E2E case to `packages/client/__tests__/private-room-*.spec.ts`: notice with the number on entry and after a reload, the media viewer message; verify with `pnpm exec tsc` in shared, client, login and management and the E2E spec in Docker

## 5. Integration

- [ ] 5.1 Run `pnpm exec tsc` in shared, client, doceditor and sdk, `pnpm nx run-many -t lint test --parallel=3`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`; check on the local stand (room 19 of the reported case) that the notice gives 6, the media viewer and a download give the new message, and no ghost-state toast appears

## Workflow follow-up

- Archive the change once the wording is confirmed by the owner.
