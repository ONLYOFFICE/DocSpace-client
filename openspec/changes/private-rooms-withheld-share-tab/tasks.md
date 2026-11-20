# Tasks

## 1. Share tab of a folder inside a private room

- [ ] 1.1 In `getAvailableInfoPanelTabs` (`packages/client/src/helpers/info-panel/tabs.ts`) leave out `InfoPanelView.infoShare` when `isPrivacyFolder` is true, whatever `canShare` the selection carries, with a one-line `// Spec: private-rooms/room-membership, "Share tab hidden for private items"` pointer. Add to the first `describe` of `packages/client/src/helpers/info-panel/__tests__/tabs.test.ts`, next to "Private room selected in a list" and "Encrypted file selected", the test "Folder inside a private room selected" (a folder with `canShare: true` and `isPrivacyFolder: true` gets no Share tab) and a check that the same folder with `isPrivacyFolder: false` still gets it. Mutation check: drop the new condition and see the scenario test fail. Verify with `cd packages/client && pnpm exec vitest run src/helpers/info-panel` and `pnpm exec tsc` in `packages/client`.

## 2. Gate

- [ ] 2.1 Run the client E2E under Docker `tests-dev` on an image rebuilt after the last ui-kit update (`private-room-*.spec.ts` and `private-rooms-section.spec.ts`, which open the info panel of private items); the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `pnpm nx run-many -t tsc lint test` over the six packages); and `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. The SDK does not import the client helper and no locale file changes, so the SDK private suite and the full locale suite are not run. Verify: every command green, recorded in design.md under "Gate runs" with the date and counts
