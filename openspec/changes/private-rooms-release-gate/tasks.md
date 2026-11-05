# Tasks

## 1. Gate criteria (no code; each box is ticked only by evidence)

- [x] 1.1 `private-rooms-upload-fail-closed` archived; verify with `openspec list` showing it under `changes/archive`. Archived 2026-10-20 (`changes/archive/2026-10-20-private-rooms-upload-fail-closed`)
- [x] 1.2 `private-rooms-tofu-on-upload` archived; verify with `openspec list`. Archived 2026-10-20 (`changes/archive/2026-10-20-private-rooms-tofu-on-upload`)
- [ ] 1.3 `private-rooms-invite-atomic-rewrap` archived; verify with `openspec list`
- [ ] 1.4 `private-rooms-editor-contract` archived and the Document Server release named in its README; verify with `openspec list` and the README
- [x] 1.5 `private-rooms-device-unlock-policy` and `private-rooms-dse3-header-authentication` archived, or deferred with an accepted-limitation requirement merged into the main spec; verify with `openspec show private-rooms/encryption-core --type spec`. `private-rooms-device-unlock-policy` archived 2026-10-20; `private-rooms-dse3-header-authentication` deferred to the next version by the owner on 2026-11-02, with the requirement "DSE3 header flags and name length are not authenticated" merged into `private-rooms/encryption-core` by the archive of `private-rooms-dse3-header-limitation` on 2026-11-03
- [ ] 1.6 `private-rooms-sdk-gating-and-parity`, `private-rooms-ux-gaps`, `private-rooms-remove-dead-api-calls` archived; verify with `openspec list`
- [ ] 1.7 `private-rooms-server-hardening` items for owner change, availability rule, metadata guards, title validation, e-mail title and the account-link fix of 12.1 merged on `../server` (recovery and offboarding too if the launch scope is B2B); verify with the contract tests under `packages/shared/__mocks__/handlers/*/__tests__` passing against the real server routes. Progress 2026-11-05: the metadata guards (3.1a) and the account-link fix (12.1) merged on 2026-11-04 (`bd89a24dcd`, `3b9c527a6e`), the owner change (2.1, as a 409 with the missing-keys route) and the e-mail title (4.2, a neutral label in the default culture only) on 2026-11-05 (`1259577f63`); the availability rule and title validation are still open
- [ ] 1.8 External penetration test of the crypto core and private-room flows completed and its summary published; verify by linking the report in this change's README.md
- [ ] 1.9 Accessibility pass on the key dialogs and the keys management page completed; verify with `private-rooms-dialog-keyboard-and-focus` and `private-rooms-keys-page-keyboard` archived (`openspec list`) and their unit tests and the keyboard-only pass in `packages/client/__tests__/keys-management.spec.ts` passing in CI. Both changes were archived on 2026-10-29 with their unit tests and the keyboard-only pass green under Docker (`tests-dev`); the CI dispatch is still to run, and the review of 2026-10-30 opened `private-rooms-key-dialog-keyboard-followups` for four keyboard gaps it found, to be archived before this box is ticked. That change was archived on 2026-11-02 (`changes/archive/2026-11-02-private-rooms-key-dialog-keyboard-followups`), with the keys E2E specs and the pre-push gate green under Docker (`tests-dev`); only the CI dispatch on the pushed branch remains before this box is ticked
- [ ] 1.10 Accessibility pass on the private-room panels (invite panel, Members view) completed; verify with a change covering them archived and its checks passing in CI (no such change exists yet; `private-rooms-ux-gaps` checked the key dialogs only)
- [x] 1.11 `private-rooms-spec-drift-fixes` archived; verify with `openspec list` showing it under `changes/archive`. Archived 2026-11-02 (`changes/archive/2026-11-02-private-rooms-spec-drift-fixes`)
- [ ] 1.12 `private-rooms-beta-release` archived, so the beta requirements this change modifies are in the main specs; verify with `openspec list` showing it under `changes/archive`
- [ ] 1.13 The portal setting for private rooms merged on the server release branch (proposal prerequisite 8); verify by recording in design.md, with the server files read through CodeGraph, its JSON name, the payload that carries it, the route an administrator writes it through and its default on upgraded and new portals

## 2. Remove the beta label

- [ ] 2.1 Remove the Beta badge from the Private sidebar item (`packages/client/src/components/ClientArticleSidebar/index.tsx`) and the Keys management tab (`packages/client/src/pages/Profile/Section/Body/index.tsx`), and delete Common:PrivateRoomsBetaTitle and Common:PrivateRoomsBetaDescription from every language in the same commit (design decision 1). Keep the title and description options of the shared `BetaBadge` only if another surface uses them. Verify: the cases "No beta label" and the badge-free sidebar item and tab in the unit tests next to each surface, and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 2.2 E2E: drop the badge assertions of `private-rooms-section.spec.ts` and `keys-management.spec.ts`, and regenerate the screenshots that show the Private item under Docker (`tests-dev`, `--update-snapshots=changed`). Verify: `cd packages/client && pnpm test:e2e:docker:dev` for those specs, then the full client E2E run

## 3. Documentation and release notes

- [ ] 3.1 Commit the reviewed compliance and positioning pack under `docs/private-rooms/` (BAA template, GDPR supplementary measures, data residency, recovery procedure, extension-leakage disclosure, shared responsibility model, marketing guidelines without "zero-knowledge"); verify with a review sign-off recorded in the change README.md
- [ ] 3.2 Write the general-availability release notes, replacing the beta notes of `private-rooms-beta-release`. They list every accepted limitation from `private-rooms/encryption-core` and the editor action policy. Verify by linking them from the change README.md
- [ ] 3.3 Update `.claude/rules/private-rooms.md` and the `context` block of `openspec/config.yaml` so neither describes the feature as a beta; verify with `openspec validate --all --strict`

## 4. Integration

- [ ] 4.1 Full pre-push gate plus the client, SDK and doceditor E2E suites on staging with the setting on and off; verify with green runs linked from the change README.md

## 5. Portal setting

- [ ] 5.1 After 1.13: add the setting to the shared settings type and the settings store, and to the MSW settings handler, mirroring the server DTO read through CodeGraph, with a doc comment naming the controller action and a contract case. An absent field counts as on (design decision 3). Verify: store getter cases "Setting on", "Setting off" and "Setting absent from the payload", and `cd packages/shared && pnpm exec vitest run __mocks__/handlers`
- [ ] 5.2 Make `AppsStore.isPrivateRoomsSectionAvailable` require the setting on top of the E2E rooms app and the frame opt-in. Verify: cases "SaaS portal", "Setting off" and "Standalone portal with the app on" in the AppsStore unit tests, and `cd packages/client && pnpm exec vitest run src/store`
- [ ] 5.3 After proposal decision 4: add the administrator control for the setting, without a Beta badge, at the decided place in the portal settings. It writes through the route recorded in 1.13, mirrored in MSW with a contract case. Add its Common keys with `/translate-comments` and `/translate-locales` in the same commit. Verify: cases "Administrator turns the setting off", "Not an administrator" and "No beta label" in a component test next to the control, and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 5.4 Make the SDK private layout (`packages/sdk/src/app/(private)/layout.tsx`) require the setting as well as the host opt-in. Verify: an SDK unit case "SDK route with the setting off", and `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`
- [ ] 5.5 E2E: a setting-off spec covering "Setting off", "Browser-local flag ignored" and "Administrator turns the setting off", with the MSW default following proposal decision 3. Verify: `cd packages/client && pnpm test:e2e:docker:dev` for that spec, then the full client E2E run

## Workflow follow-up

- Archive the change after the production rollout. The archive merges the feature-gating, sidebar-section and key-management deltas, which drop the beta label.
- Revised on 2026-11-03 by `private-rooms-beta-release` 1.1: the former groups 2 (server setting) and 3 (remove the browser-local opt-in) and the feature-gating delta that removed the opt-in requirements moved to that change.
- Revised again on 2026-11-03 by `private-rooms-beta-release` 1.2: the beta ships without a setting, so the setting, its administrator control and the availability rule on top of the E2E rooms app came back here as group 5 and prerequisite 1.13; the removal of the browser opt-in stays with the beta.
