# Tasks

## 1. Unit cases named after the scenarios

- [x] 1.1 In `packages/client/src/store/filesStore/__tests__/FilesStore.contextOptions.branches.test.ts`, rename the private room case "Room context menu" to the scenario "Private room with the download right". Add a case "Private room context menu" asserting that edit-index, export-room-index, save-as-template and duplicate-room are absent for a private room whose rights would grant them, while download stays present. Verify with `cd packages/client && pnpm exec vitest run src/store/filesStore`, with the menu snapshots unchanged.
- [x] 1.2 In `packages/client/src/store/contextOptionsStore/__tests__/ContextOptionsStore.actions3.test.ts`, rename the case "Room download in the Private section" to the scenario "Room downloaded". Add a case "Room downloaded without decryption" asserting that "Download without decryption" on a private room requests the server archive of that room (`downloadFiles` with the room's id among the folder ids) and does not start the decrypted zip. Verify with `cd packages/client && pnpm exec vitest run src/store/contextOptionsStore`.

## 2. Integration check

- [x] 2.1 Run `pnpm run test:client` and `npx -y @fission-ai/openspec@latest validate private-rooms-room-download-offered --strict`; verify both pass.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-room-download-offered` after review; the archive merges the MODIFIED and ADDED requirements into `openspec/specs/private-rooms/room-membership/spec.md`.
- The SDK side does not change: `private-rooms/sdk-surface` "Room menu of a private room" keeps withholding the room download.
- Design decision 2 leaves open the menu of a private room without the download right, where the client keeps "Download without decryption". Settle it in a later change, after reading the server's archive check in `../server` through CodeGraph.
