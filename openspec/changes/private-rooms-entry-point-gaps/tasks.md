# Tasks

## 1. Mock

- [x] 1.1 In `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`, add an optional `versionGroup` to the file seed (default 1, kept on the record, reported as both `version` and `versionGroup`), and report the room owner's rights on a file as `FileSecurity.FilterEntryAsync` answers them: Rename, Lock, CopyLink, ReadHistory and EditHistory true in an active room, only ReadHistory in an archived one (design decision 3). The comment above `security` names the server method. Verify: cases "File in an active private room reports the owner's rename, lock, link and history rights", "File in an archived private room reports ReadHistory and none of the others" and "Seeded version group" in `packages/shared/__mocks__/handlers/files/__tests__/encrypted-files-contract.test.ts`, `cd packages/shared && pnpm exec vitest run __mocks__/handlers`; `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client, sdk, doceditor, login and management

## 2. Version badge

- [x] 2.1 In `packages/shared/components/badges/index.tsx`, attach the version badge's click handler only when the item is not encrypted and has ReadHistory, and set its `Common:ShowVersionHistory` title only when the item is not encrypted (design decisions 1 and 2), with the one-line spec pointer. Verify: cases "Version badge of an encrypted file" (encrypted, `versionGroup` 3, ReadHistory true: the badge with `Common:VersionBadge` is shown, has no `Common:ShowVersionHistory` title, and a click in row and in tile view does not call `onShowVersionHistory`) and "Version badge of a file that is not encrypted" (the same file without the flag: the title is there and a click calls the handler once) in `packages/shared/components/badges/Badges.test.tsx`, `cd packages/shared && pnpm exec vitest run components/badges`; the encrypted cases fail on the component without the change; `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client and sdk

## 3. E2E

- [x] 3.1 Client E2E: in `packages/client/__tests__/encrypted-file-ui.spec.ts`, a case "Version badge of an encrypted file" that seeds an encrypted file with `versionGroup` 3, finds its version badge by the label `V.3`, checks that it has no "Show version history" title, clicks it and checks that the version history panel does not open and that no `files/file/{id}/history` request is sent; it fails on the badge without task 2.1. Run it with every client spec that uses `encryptedFilesHandlers`, since task 1.1 changed the rights they see, and adapt the ones that relied on the old rights (in `private-rooms-section.spec.ts`, the info-panel helper opens More options before Info; design.md, Risks). Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/encrypted-file-ui.spec.ts __tests__/keys-management-advanced.spec.ts __tests__/private-room-*.spec.ts __tests__/private-rooms-*.spec.ts --reporter=line`

## 4. Integration

- [x] 4.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## 5. Media viewer

- [x] 5.1 In `packages/shared/components/media-viewer/MediaViewer.helpers.tsx`, leave the Rename entry out of `getDesktopMediaContextModel`, `getMobileMediaContextModel` and `getPDFContextModel` for an encrypted file, whatever its Rename right, with the one-line spec pointer (design decision 5). Verify: cases "Media viewer menu of an encrypted file" (desktop, mobile and PDF models, encrypted file with `security.Rename` true: no `rename` key) and "Media viewer menu of a file that is not encrypted" (the same file without the flag: `rename` is there) in `packages/shared/components/media-viewer/MediaViewer.test.tsx`, `cd packages/shared && pnpm exec vitest run components/media-viewer`; the encrypted cases fail on the helpers without the change; `pnpm exec tsc --noEmit -p tsconfig.json` in shared, client and sdk
- [x] 5.2 In `packages/client/src/pages/Home/MediaViewer/index.js`, make `onDownloadMediaFile` send a playlist item marked `encrypted` to `onClickDownload(file, t)`, with the file taken from the folder's files or from `previewFile`, and download nothing when no file is found; other items keep `openUrl` (design decision 4). Verify: the E2E case of task 5.3; `pnpm exec tsc --noEmit -p tsconfig.json` in client
- [x] 5.3 Client E2E: in `packages/client/__tests__/encrypted-file-ui.spec.ts`, a case "Download from the media viewer" that seeds an encrypted image whose bytes are built with `encryptFile` for the test user's key (as `private-room-cross-user-download.spec.ts` does), opens it in the media viewer with the identity unlocked, downloads it with the toolbar button and then with Ctrl+S, and checks that each saved file has the original name and the plaintext bytes; and a case "Media viewer menu of an encrypted file" that opens the viewer's menu and finds no Rename entry. Both fail without tasks 5.1 and 5.2. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/encrypted-file-ui.spec.ts --reporter=line`

## 6. Integration

- [x] 6.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## 7. Info panel

- [x] 7.1 In `packages/client/src/helpers/info-panel/tabs.ts`, add an `isPrivacyFolder` parameter to `getAvailableInfoPanelTabs` and add no plugin tab when the item is private or encrypted or `isPrivacyFolder` is true, with the one-line spec pointer; pass `treeFoldersStore.isPrivacyFolder` from `InfoPanel/Body` and `InfoPanel/Header` (`index.tsx` into `bodyGeneral.tsx` and `headerGeneral.tsx`) (design decision 6). Verify: cases "Info panel of a private room", "Info panel of a folder inside a private room" (a folder without the `private` flag, `isPrivacyFolder` true), "Info panel of an encrypted file" (`isPrivacyFolder` false, as in Recent) and "Info panel of an item outside private rooms" (the plugin tab is there), each with an enabled plugin tab, in `packages/client/src/helpers/info-panel/__tests__/tabs.test.ts`, `cd packages/client && pnpm exec vitest run src/helpers/info-panel`; the first three fail without the change; `pnpm exec tsc --noEmit -p tsconfig.json` in client

## 8. Integration

- [ ] 8.1 Pre-push gate (`npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages) and `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the gate output and the validate summary

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-entry-point-gaps` once group 8 is done; all three entry points are then covered. The archive merges the badge, media viewer rename and media viewer download scenarios into `openspec/specs/private-rooms/file-operations/spec.md` and the info panel scenarios into `openspec/specs/private-rooms/room-membership/spec.md`.
