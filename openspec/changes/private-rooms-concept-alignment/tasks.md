# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. Decisions 3 to 5 of the proposal were confirmed by the owner on 2026-11-18.

## 1. Dashboard

- [x] 1.1 Client: add the card of private rooms to the dashboard apps (`packages/client/src/pages/Dashboard/hooks/useModuleItems.tsx`), after Forms, shown only while the section is available to the user, with the installed state of the E2E rooms app, Common:Private, Common:DashboardE2eRoomsDescription, the icon of the sidebar item and no tour (design decision 1). Verify: cases "Section available", "Section not available" and "App switched off on a standalone portal" in a unit test of the hook next to it; `cd packages/client && pnpm exec vitest run src/pages/Dashboard`
- [x] 1.2 Client: the button of the card. Common:CreatePrivateRoom for a user who may create rooms: it leaves a request and opens `/private/filter`, and the list takes the request and starts its own create entry point once; Common:Open for everybody else (design decision 2). Verify: cases "Room admin", "Room admin without a key" and "User who cannot create rooms" in the unit test of the hook and in a unit test of the place that takes the request; `pnpm exec vitest run src/pages/Dashboard src/pages/Home`
- [x] 1.3 Client: show the shared Beta badge beside the title of the card (design decision 3). Verify: case "Card with the badge" in a unit test of the card component; `pnpm exec vitest run src/pages/Dashboard`

## 2. Private list

- [x] 2.1 Locales: add Common:PrivateRoomsSectionNote, Common:KeysManagementIntro and Common:RecoveryPhraseSectionText to `public/locales/en/Common.json` with the texts of the proposal, write their translator comments with `/translate-comments` and translate them with `/translate-locales`. Verify: `cd common/tests && npx vitest run test/locales.test.js`; `npm --prefix ./common/tests run test:lefthook`. Done 2026-11-18: the three keys are in all 31 languages with translator comments; `test:lefthook` green (61 passed, 3 skipped); `locales.test.js` 44 passed, 2 failed on 14 keys of other features (AI and top-up keys in Common) that have no translations on the branch, none of them from this change
- [x] 2.2 Client: show Common:PrivateRoomsSectionNote with the encryption mark in the header of the Private list and of its Archive, not inside a room, giving way on a narrow header (design decision 4). Verify: cases "Private list", "Inside a room" and "Narrow window" in a unit test next to the header; `pnpm exec vitest run src/pages/Home/Section/Header`. Done 2026-11-18 with the English text of the key added here; the line stands in the controls slot at the end of the header row (design decision 4), and the narrow header is covered by the style alone: a unit test lays nothing out

## 3. Keys management

- [x] 3.1 Client: show Common:KeysManagementIntro at the top of Keys management, with and without a key. Verify: cases "User with a key" and "User without a key" in the unit tests of `keys-management`; `pnpm exec vitest run src/pages/Profile`
- [x] 3.2 Client: show the state of the key, Common:KeyLocked or Common:KeyUnlocked, beside the heading of the key, from the encryption context, with token colours that keep 4.5:1 in both themes (design decisions 5 and 7). Verify: cases "Locked key", "Key locks while the page is open" and "User without a key", and a contrast case beside the existing one for the status badges; `pnpm exec vitest run src/pages/Profile`
- [x] 3.3 Client: while the key is locked, show Common:PrivateRoomLockedBarText under the heading and the primary action Common:UnlockKey under the key, calling the shared unlock (design decision 6). Verify: cases "Unlock from the page", "Unlock cancelled" and "Unlocked key"; `pnpm exec vitest run src/pages/Profile`
- [x] 3.4 Client: put Common:UseRecoveryPhrase under the heading Common:RecoveryPhraseTitle and the sentence Common:RecoveryPhraseSectionText. Verify: case "User with a key" of the recovery block; `pnpm exec vitest run src/pages/Profile`

## 4. E2E and gate

- [x] 4.1 E2E: assert the card and its button in `packages/client/__tests__/dashboard-appearance.spec.ts` (the section as a condition of its mocks, both halves of each rule), the line in `private-rooms-section.spec.ts`, and the state, the unlock action and the recovery block in `keys-management.spec.ts`. Verify: `cd packages/client && pnpm test:e2e:docker:dev` for the three specs. Done 2026-11-18: the three specs under Docker (`tests-dev`), 182 passed; the matrix also gets a block for a standalone portal with the E2E rooms app off, and its row check lets a fifth card wrap to a second row
- [ ] 4.2 E2E: retake under Docker (`tests-dev`, `--update-snapshots=changed`) the frames this change and the icons of 2026-11-18 alter, and read the diff: the dashboard frames may differ in the apps grid only, the others in the header line, the Keys management page and the replaced icons. Verify: the three specs green under Docker, then the full client E2E run; the list of retaken frames recorded here
- [ ] 4.3 Run the gate, each command with its exit code read: `pnpm exec tsc` in client and shared, Biome on the touched folders, the client and shared unit suites, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date and the counts

## Workflow follow-up

- `docspace-ui-kit-react`: a slot beside the title of the header component, so the line of the Private list can stand where the canvas has it.
- Stand: compare the three places with the canvas of 2026-11-18 on the local stack, in both themes, before the archive.
- `private-rooms-release-gate` 2.1 removes the Beta badges; add the dashboard card to it when this change is archived.
- Archive after 4.3 and the stand comparison; the archive merges the deltas into `private-rooms/sidebar-section` and `private-rooms/key-management`.
