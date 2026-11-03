# Tasks

## 1. Gate criteria (no code; each box is ticked only by evidence)

- [x] 1.1 `private-rooms-upload-fail-closed` archived; verify with `openspec list` showing it under `changes/archive`. Archived 2026-10-20 (`changes/archive/2026-10-20-private-rooms-upload-fail-closed`)
- [x] 1.2 `private-rooms-tofu-on-upload` archived; verify with `openspec list`. Archived 2026-10-20 (`changes/archive/2026-10-20-private-rooms-tofu-on-upload`)
- [ ] 1.3 `private-rooms-invite-atomic-rewrap` archived; verify with `openspec list`
- [ ] 1.4 `private-rooms-editor-contract` archived and the Document Server release named in its README; verify with `openspec list` and the README
- [x] 1.5 `private-rooms-device-unlock-policy` and `private-rooms-dse3-header-authentication` archived, or deferred with an accepted-limitation requirement merged into the main spec; verify with `openspec show private-rooms/encryption-core --type spec`. `private-rooms-device-unlock-policy` archived 2026-10-20; `private-rooms-dse3-header-authentication` deferred to the next version by the owner on 2026-11-02, with the requirement "DSE3 header flags and name length are not authenticated" merged into `private-rooms/encryption-core` by the archive of `private-rooms-dse3-header-limitation` on 2026-11-03
- [ ] 1.6 `private-rooms-sdk-gating-and-parity`, `private-rooms-ux-gaps`, `private-rooms-remove-dead-api-calls` archived; verify with `openspec list`
- [ ] 1.7 `private-rooms-server-hardening` items for owner change, availability rule, metadata guards, title validation and e-mail title merged on `../server` (recovery and offboarding too if the launch scope is B2B); verify with the contract tests under `packages/shared/__mocks__/handlers/*/__tests__` passing against the real server routes
- [ ] 1.8 External penetration test of the crypto core and private-room flows completed and its summary published; verify by linking the report in this change's README.md
- [ ] 1.9 Accessibility pass on the key dialogs and the keys management page completed; verify with `private-rooms-dialog-keyboard-and-focus` and `private-rooms-keys-page-keyboard` archived (`openspec list`) and their unit tests and the keyboard-only pass in `packages/client/__tests__/keys-management.spec.ts` passing in CI. Both changes were archived on 2026-10-29 with their unit tests and the keyboard-only pass green under Docker (`tests-dev`); the CI dispatch is still to run, and the review of 2026-10-30 opened `private-rooms-key-dialog-keyboard-followups` for four keyboard gaps it found, to be archived before this box is ticked. That change was archived on 2026-11-02 (`changes/archive/2026-11-02-private-rooms-key-dialog-keyboard-followups`), with the keys E2E specs and the pre-push gate green under Docker (`tests-dev`); only the CI dispatch on the pushed branch remains before this box is ticked
- [ ] 1.10 Accessibility pass on the private-room panels (invite panel, Members view) completed; verify with a change covering them archived and its checks passing in CI (no such change exists yet; `private-rooms-ux-gaps` checked the key dialogs only)
- [x] 1.11 `private-rooms-spec-drift-fixes` archived; verify with `openspec list` showing it under `changes/archive`. Archived 2026-11-02 (`changes/archive/2026-11-02-private-rooms-spec-drift-fixes`)
- [ ] 1.12 `private-rooms-beta-release` archived, so the beta requirements this change modifies are in the main specs; verify with `openspec list` showing it under `changes/archive`

## 2. Remove the beta label

- [ ] 2.1 Remove the Beta badge from the Private sidebar item (`packages/client/src/components/ClientArticleSidebar/index.tsx`), the Keys management tab (`packages/client/src/pages/Profile/Section/Body/index.tsx`) and the administrator control for the setting, and delete Common:PrivateRoomsBetaDescription from every language in the same commit (design decision 1). Keep the description option of the shared `BetaBadge` only if another surface uses it. Verify: the cases "No beta label" and the badge-free sidebar item and tab in the unit tests next to each surface, and `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 2.2 E2E: drop the badge assertions of `private-rooms-section.spec.ts` and `keys-management.spec.ts`, and regenerate the screenshots that show the Private item under Docker (`tests-dev`, `--update-snapshots=changed`). Verify: `cd packages/client && pnpm test:e2e:docker:dev` for those specs, then the full client E2E run

## 3. Documentation and release notes

- [ ] 3.1 Commit the reviewed compliance and positioning pack under `docs/private-rooms/` (BAA template, GDPR supplementary measures, data residency, recovery procedure, extension-leakage disclosure, shared responsibility model, marketing guidelines without "zero-knowledge"); verify with a review sign-off recorded in the change README.md
- [ ] 3.2 Write the general-availability release notes, replacing the beta notes of `private-rooms-beta-release`. They list every accepted limitation from `private-rooms/encryption-core` and the editor action policy. Verify by linking them from the change README.md
- [ ] 3.3 Update `.claude/rules/private-rooms.md` and the `context` block of `openspec/config.yaml` so neither describes the feature as a beta; verify with `openspec validate --all --strict`

## 4. Integration

- [ ] 4.1 Full pre-push gate plus the client, SDK and doceditor E2E suites on staging with the setting on and off; verify with green runs linked from the change README.md

## Workflow follow-up

- Archive the change after the production rollout. The archive merges the feature-gating, sidebar-section and key-management deltas, which drop the beta label.
- Revised on 2026-11-03 by `private-rooms-beta-release` 1.1: the former groups 2 (server setting) and 3 (remove the browser-local opt-in) and the feature-gating delta that removed the opt-in requirements moved to that change.
