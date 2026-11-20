# Tasks

## 1. Share tab of a folder inside a private room

- [ ] 1.1 In `getAvailableInfoPanelTabs` (`packages/client/src/helpers/info-panel/tabs.ts`) leave out `InfoPanelView.infoShare` when `isPrivacyFolder` is true, whatever `canShare` the selection carries, with a one-line `// Spec: private-rooms/room-membership, "Share tab hidden for private items"` pointer. Add to `packages/client/src/helpers/info-panel/__tests__/tabs.test.ts` the test "Folder inside a private room selected" (a folder with `canShare: true` and `isPrivacyFolder: true` gets no Share tab) and a check that the same folder with `isPrivacyFolder: false` still gets it. Mutation check: drop the new condition and see the scenario test fail. Verify with `cd packages/client && pnpm exec vitest run src/helpers/info-panel` and `pnpm exec tsc` in `packages/client`.

## 2. Gate

- [ ] 2.1 Run the pre-push gate: `npm --prefix ./common/tests run test:lefthook`, `pnpm nx run-many -t tsc lint test` over the six packages, and `openspec validate --all --strict`. Record the result here.
