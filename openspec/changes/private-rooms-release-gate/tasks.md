# Tasks

## 1. Gate criteria (no code; each box is ticked only by evidence)

- [ ] 1.1 `private-rooms-upload-fail-closed` archived; verify with `openspec list` showing it under `changes/archive`
- [ ] 1.2 `private-rooms-tofu-on-upload` archived; verify with `openspec list`
- [ ] 1.3 `private-rooms-invite-atomic-rewrap` archived; verify with `openspec list`
- [ ] 1.4 `private-rooms-editor-contract` archived and the Document Server release named in its README; verify with `openspec list` and the README
- [ ] 1.5 `private-rooms-device-unlock-policy` and `private-rooms-dse3-header-authentication` archived, or deferred with an accepted-limitation requirement merged into the main spec; verify with `openspec show private-rooms/encryption-core --type spec`
- [ ] 1.6 `private-rooms-sdk-gating-and-parity`, `private-rooms-ux-gaps`, `private-rooms-remove-dead-api-calls` archived; verify with `openspec list`
- [ ] 1.7 `private-rooms-server-hardening` items for owner change, availability rule, metadata guards, title validation and e-mail title merged on `../server` (recovery and offboarding too if the launch scope is B2B); verify with the contract tests under `packages/shared/__mocks__/handlers/*/__tests__` passing against the real server routes
- [ ] 1.8 External penetration test of the crypto core and private-room flows completed and its summary published; verify by linking the report in this change's README.md
- [ ] 1.9 Accessibility pass on the key dialogs and the keys management page completed; verify with `private-rooms-dialog-keyboard-and-focus` and `private-rooms-keys-page-keyboard` archived (`openspec list`) and their unit tests and the keyboard-only pass in `packages/client/__tests__/keys-management.spec.ts` passing in CI
- [ ] 1.10 Accessibility pass on the private-room panels (invite panel, Members view) completed; verify with a change covering them archived and its checks passing in CI (no such change exists yet; `private-rooms-ux-gaps` checked the key dialogs only)

## 2. Server-side setting

- [ ] 2.1 Backend: add a portal setting for private-room availability on top of the availability rule, exposed in the settings payload and editable by administrators; verify with a server unit test and the Swagger output
- [ ] 2.2 Add the setting to `packages/shared/store/SettingsStore.ts` and the MSW settings handler (default allow); verify with a shared unit test on the store getter

## 3. Remove the browser-local opt-in

- [ ] 3.1 Replace `isPrivateRoomsEnabled` reads in `packages/shared/utils/rooms.tsx`, `packages/client/src/helpers/disabled-apps.ts`, `packages/client/src/routes/general.js` and `packages/client/src/pages/Profile/Section/Body/index.tsx` with the settings-store value, keeping Keys management reachable for users who hold keys; verify with `cd packages/shared && pnpm exec vitest run utils/privateRooms.test.ts` rewritten against the store and the client unit tests for the chooser
- [ ] 3.2 Delete `packages/shared/utils/privateRooms.ts` and every import of `PRIVATE_ROOMS_FLAG_KEY`; verify with `pnpm run tsc`
- [ ] 3.3 SDK: read the setting in `packages/sdk/src/app/(private)/layout.tsx` and render the setting-off empty state; verify with an SDK unit test and `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`
- [ ] 3.4 E2E: remove the flag from `packages/client/__tests__/fixtures/base.ts`, replace `private-rooms-hidden.spec.ts` with a setting-off spec that mocks the settings payload; verify with `pnpm test:e2e:docker:start`

## 4. Documentation and release notes

- [ ] 4.1 Commit the reviewed compliance and positioning pack under `docs/private-rooms/` (BAA template, GDPR supplementary measures, data residency, recovery procedure, extension-leakage disclosure, shared responsibility model, marketing guidelines without "zero-knowledge"); verify with a review sign-off recorded in the change README.md
- [ ] 4.2 Write release notes listing every accepted limitation from `private-rooms/encryption-core` and the editor action policy; verify by linking them from the change README.md
- [ ] 4.3 Update `.claude/rules/private-rooms.md` and the `context` block of `openspec/config.yaml` so neither describes the feature as hidden; verify with `openspec validate --all --strict`

## 5. Integration

- [ ] 5.1 Full pre-push gate plus the client, SDK and doceditor E2E suites on staging with the setting on and off; verify with green runs linked from the change README.md

## Workflow follow-up

- Archive the change after the production rollout; the archive merges the feature-gating delta and retires the opt-in requirements.
