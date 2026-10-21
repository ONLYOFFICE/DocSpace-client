# Tasks

## 1. Opt-in plumbing

- [ ] 1.1 Confirm with the user the opt-in source (frame config property with query fallback, design D1); verified by the decision recorded in design.md
- [ ] 1.2 Add an injectable opt-in source to `packages/shared/utils/privateRooms.ts` (localStorage in the client, frame config or `?privateRooms=1` in the SDK) and read it in `packages/sdk/src/app/(private)/layout.tsx` to render the not-available view without it; verify with new cases in `packages/shared/utils/privateRooms.test.ts` and an SDK unit test for the layout gate (`cd packages/sdk && pnpm exec vitest run "src/app/(private)"`)
- [ ] 1.3 Make the client bootstrap honour `?privateRooms=1` for the keys-management deep link; verify with a case in `packages/client/__tests__/private-rooms-hidden.spec.ts` that opens `/profile/keys-management?privateRooms=1` without the stored flag and sees the page render

## 2. Keys management reachability and hint gating

- [ ] 2.1 Expose `keysLoaded` from `packages/shared/context/encryption/EncryptionContext.tsx` and gate `DeviceSetupHintEffect.tsx` and the create-key auto-prompt on it; verify with `packages/shared/context/encryption/__tests__/EncryptionContext.test.tsx` and the SDK private-shell unit tests
- [ ] 2.2 Point the forgot-passphrase and device-setup links at the deep link from 1.3 and show `Common:EncryptionKeysManagedInProfile` when the client origin is unknown; verify with SDK unit tests on `EncryptionShell.tsx` and `DeviceSetupHintEffect.tsx`

## 3. Document creation in SDK private rooms

- [ ] 3.1 Offer document, spreadsheet and presentation in `packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx` for private rooms when keys exist, calling `packages/shared/services/private-room/encrypted-file-creation.ts`; verify with a unit test on the private menu model and `cd packages/sdk && pnpm exec vitest run docs-layout`
- [ ] 3.2 Enable the SDK E2E case for creating a document in a private room in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`; verify with `cd packages/sdk && pnpm exec playwright test e2e/private`

## 4. Archive page and folder transfers

- [ ] 4.1 Apply the private-room rules to `packages/sdk/src/app/(private)/private/archive/**` (no Share tab, encrypted download path, key check, private empty view); verify with SDK unit tests for the archive page and an E2E case in `private-rooms.spec.ts`
- [ ] 4.2 Withhold cross-room folder copy/move in `packages/sdk/src/app/(docspace)/_hooks/useFileOperations.ts` with `Common:CannotTransferFolderFromPrivateRoom`, keeping same-room moves server-side; verify with `cd packages/sdk && pnpm exec vitest run useFileOperations useEncryptedCopyMove`
- [ ] 4.3 Decide how the SDK handles a folder copy within the same private room, which the server refuses today (design.md Open Questions: withhold with a localized message, client-side re-encrypting copy, or a backend change); record the decision in design.md and, if it adds behaviour, add the scenario to the sdk-surface delta before implementing it

## 5. Translations

- [ ] 5.1 Move the `People`, `UploadPanel` and `Files` keys the private surface renders into Common, update the client and SDK call sites, run `translate-stale` and `translate-locales`, then `cd common/tests && npx vitest run test/locales.test.js`; verify green for all 31 languages and no raw key in the SDK private pages (unit test asserting translated text)

## 6. End-to-end coverage

- [ ] 6.1 Seed the session cookie and the crypto fixture identity in `packages/sdk/__tests__/e2e/private/fixtures.ts` and remove `test.fixme` from unlock, upload, download, preview, duplicate, copy/move cross-room, copy-out and invite tests, leaving editor-open as `fixme` with a reference to `private-rooms-editor-contract`; verify with `cd packages/sdk && pnpm exec playwright test e2e/private`
- [ ] 6.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, locale tests, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive the change after review; archiving applies the RENAMED operations to `sdk-surface` and `feature-gating`.
- `private-rooms-release-gate` removes the opt-in introduced here together with the client flag.
