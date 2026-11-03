# Tasks

Group 0 holds the beta gate and the decisions. Tasks that name a server field or route wait for the server merge and read it in `../server` through CodeGraph. That needs `.codegraph/` in `../server`, which is not set up on this machine as of 2026-11-03. One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`).

## 0. Beta gate and decisions (evidence only, no code)

- [ ] 0.1 `private-rooms-server-hardening` 12.1 is merged on the server release branch: `EncryptionLoginProvider.SetKeysAsync` removes only the encryption link. Verify by reading it on the release branch through CodeGraph, and record the server commit in this change's README.md.
- [ ] 0.2 The portal setting of `private-rooms-release-gate` 2.1 is merged on the server release branch. Record in design.md, with the server files read through CodeGraph: its JSON name, the payload that carries it, the route an administrator writes it through, and its default on upgraded and new portals. Verify: that record. If the setting will not make the release, take proposal decision 1 and revise the feature-gating and sidebar-section deltas before any task of groups 3 and 4.
- [ ] 0.3 The Document Server build shipped with the release is named and carries the crypto add-on (`private-rooms-editor-contract` 1.2), or `private-rooms-editor-contract` tasks 2.1 to 2.4 are archived. Verify: the build recorded in README.md.
- [ ] 0.4 Spreadsheets and presentations are covered: `private-rooms-editor-contract` 4.7 passes on the build of 0.3, or a follow-up change that opens them view-only and withholds their creation in private rooms is archived. Verify: the editor-contract record or `openspec list`.
- [ ] 0.5 Record proposal decisions 1 to 4 with their dates and owners in proposal.md. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-beta-release --strict`.

## 1. Planning

- [x] 1.1 Revise `private-rooms-release-gate` with `/opsx:update` (design decision 9):
  - drop its groups 2 and 3 and its feature-gating delta, which this change owns;
  - keep its general-availability criteria;
  - add the removal of the Beta badges as its client work.

  Verify: `npx -y @fission-ai/openspec@latest validate --all --strict`. Done 2026-11-03: the release gate now covers general availability. Its prerequisites gain this change (1.12), it removes the beta label in one task (2.1) with its E2E update (2.2), and its deltas modify the administrator control and remove the two badge requirements this change adds.

## 2. Beta badge

- [x] 2.1 Give `BetaBadge` (`packages/shared/components/beta-badge`) an optional description that replaces `Common:BetaBadgeDescription` and keeps the feedback links (design decision 5). Verify: new cases in `BetaBadge.test.tsx` for the default and the overridden text, with `cd packages/shared && pnpm exec vitest run components/beta-badge`.
- [ ] 2.2 Put the Beta badge on the Private sidebar item through `badgeComponent` in `packages/client/src/components/ClientArticleSidebar/index.tsx`, with `BetaBadgeWrapper` and the description Common:PrivateRoomsBetaDescription. Add the key to `public/locales/en/Common.json` in the same commit, then run `/translate-comments` and `/translate-locales`. Verify:
  - cases "Beta badge shown" and "Badge tooltip" in `ClientArticleSidebar/__tests__/ClientArticleSidebar.test.tsx`, with no badge on the Archive sub-item;
  - `cd common/tests && npx vitest run test/locales.test.js`.
- [ ] 2.3 Put the Beta badge on the Keys management tab through the tab's `badge` slot in `packages/client/src/pages/Profile/Section/Body/index.tsx`. Verify: a case "Tab label" in a new `packages/client/src/pages/Profile/Section/Body/__tests__/ProfileTabs.test.tsx`, and `pnpm run tsc`.

## 3. Portal setting

- [ ] 3.1 After 0.2: add the setting to the shared settings type and the settings store. Add it to the MSW settings handler, mirroring the server DTO read through CodeGraph, with a doc comment naming the controller action and a contract case. The MSW default follows proposal decision 4. Verify:
  - store getter cases "Setting on", "Setting off" and "Setting absent from the payload";
  - `cd packages/shared && pnpm exec vitest run __mocks__/handlers`.
- [ ] 3.2 In `packages/client/src/store/AppsStore.ts`, replace the browser opt-in behind `isPrivateRoomsSectionAvailable` with the setting, keeping the frame opt-in on top of it. Make the `e2e-rooms` entry of `packages/client/src/helpers/disabled-apps.ts` read the setting. Verify:
  - cases "Setting on and app on", "Setting off", "Frame configuration carries the opt-in", "Frame configuration without the opt-in" and "Catalog with the setting off" in the AppsStore unit tests;
  - `cd packages/client && pnpm exec vitest run src/store`.
- [ ] 3.3 Register the `profile/keys-management` routes of `packages/client/src/routes/general.js` (lines 83 and 455) unconditionally, behind a guard that renders the page when the setting is on or the user holds a key and otherwise falls back to the profile (design decision 4). Apply the same rule to the profile tab. Verify: cases "Setting on", "Setting off, no key" and "Setting off, key held" in unit tests next to the guard and in `ProfileTabs.test.tsx`.
- [ ] 3.4 Delete the browser flag and its URL parameter from `packages/shared/utils/privateRooms.ts`, keeping the frame opt-in value check (design decision 6). Remove every import of the deleted names, and the raw `"privateRooms"` key in `packages/client/src/store/__tests__/AppsStore.installed.test.ts`. Verify:
  - a rewritten `privateRooms.test.ts` with the case "Browser-local flag ignored";
  - `pnpm run tsc`;
  - no `privateRooms` localStorage access left: `grep -rn "localStorage" packages --include=*.ts* | grep -i privaterooms` prints nothing.
- [ ] 3.5 After 0.2 and proposal decision 3: add the administrator control for the setting, with the Beta badge, at the decided place in the portal settings. It writes through the route recorded in 0.2, and that route is mirrored in MSW with a contract case. Add its Common keys with `/translate-comments` and `/translate-locales` in the same commit. Verify:
  - cases "Administrator turns the setting on" and "Not an administrator" in a component test next to the control;
  - `cd common/tests && npx vitest run test/locales.test.js`.
- [ ] 3.6 Make the SDK private layout (`packages/sdk/src/app/(private)/layout.tsx` and the opt-in helpers of `_utils/private-rooms-opt-in.ts`) require the setting as well as the host opt-in. Verify:
  - SDK unit cases "SDK route without the host opt-in" and "SDK route with the setting off", with `cd packages/sdk && pnpm exec vitest run`;
  - `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`.

## 4. E2E

- [ ] 4.1 Stop writing the flag in `packages/client/__tests__/fixtures/base.ts`. Add a fixture option that turns the setting on in the mocked settings payload, and enable it in every private-room spec: `private-room-*`, `private-rooms-section`, `keys-management*`, `key-flow-edge-cases` and `encrypted-file-ui`. Verify: case "Base fixture", and those specs green with `cd packages/client && pnpm test:e2e:docker:dev <specs>`.
- [ ] 4.2 Replace `private-rooms-hidden.spec.ts` with `private-rooms-setting-off.spec.ts`, covering "Setting-off spec", "Browser-local flag ignored", "Setting off, key held" and "Old bookmark with the setting off". Verify under Docker as in 4.1.
- [ ] 4.3 Assert the badges: "Beta badge shown" in `private-rooms-section.spec.ts` and "Tab label" in `keys-management.spec.ts`. Verify under Docker as in 4.1.
- [ ] 4.4 Regenerate the screenshots this group changes under Docker (`tests-dev`, `--update-snapshots=changed`) and check by eye that a sample differs only in the sidebar. Record the count in the commit and announce it to the teams that merge into the release branch. Verify: the full client E2E run under Docker, green except the failures the release branch has on its own.

## 5. Documentation

- [ ] 5.1 Write `release-notes.md` in this change folder and link it from README.md, then record when it was handed to the documentation team. It contains:
  - the accepted v1 limitations, the SHALL NOT requirements of `private-rooms/encryption-core`;
  - the warning that a lost key and recovery phrase mean lost files;
  - that the SDK private pages are unavailable while the setting is off;
  - the server and Document Server items still open at release time, taken from `private-rooms-server-hardening` and `private-rooms-editor-contract`;
  - the Document Server build of 0.3.

  Verify: that record.
- [ ] 5.2 Make `.claude/rules/private-rooms.md` (item 8 and its flag mentions) and the feature-flag line of the `openspec/config.yaml` context describe the portal setting and the beta, not a hidden feature. Verify: `npx -y @fission-ai/openspec@latest validate --all --strict`.

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`, `pnpm run test:doceditor`) and `npx -y @fission-ai/openspec@latest validate --all --strict`. Verify: all green.
- [ ] 6.2 Run on staging, with the server build carrying 0.1 and 0.2 and the Document Server of 0.3, and record date, builds and results in design.md:
  - an administrator turns the setting on, and the section and the badges appear for another user after a reload;
  - with the setting off, private rooms are listed in Rooms and the Keys management tab stays for a key holder;
  - a user with a Google or SSO link saves a key and keeps the link.

  Verify: that record.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-beta-release` after the beta is merged to the release branch. At the archive, rewrite the Purpose of `private-rooms/feature-gating` in the main spec so it describes the beta setting instead of the tester opt-in.
- General availability then follows the revised `private-rooms-release-gate`.
