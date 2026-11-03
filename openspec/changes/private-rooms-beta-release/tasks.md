# Tasks

Group 0 holds the beta gate. One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Server behaviour is read in `../server` through CodeGraph.

## 0. Beta gate and decisions (evidence only, no code)

- [ ] 0.1 The Document Server build shipped with the release is named and carries the crypto add-on (`private-rooms-editor-contract` 1.2), or `private-rooms-editor-contract` tasks 2.1 to 2.4 are archived. Verify: the build recorded in README.md.
- [ ] 0.2 Spreadsheets and presentations are covered: `private-rooms-editor-contract` 4.7 passes on the build of 0.1, or a follow-up change that opens them view-only and withholds their creation in private rooms is archived. Verify: the editor-contract record or `openspec list`.
- [ ] 0.3 The change that fixes the verified blockers of the second pre-PR review of 2026-11-03 is archived. Verify: `openspec list` shows it under `changes/archive`.
- [x] 0.4 Record proposal decisions 1 to 4 with their dates and owners in proposal.md. Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-beta-release --strict`. Done 2026-11-03: the owner removed the flag without a server setting and accepted the account-link risk of `private-rooms-server-hardening` 12.1.

## 1. Planning

- [x] 1.1 Revise `private-rooms-release-gate` with `/opsx:update` (design decision 9):
  - drop its groups 2 and 3 and its feature-gating delta, which this change owns;
  - keep its general-availability criteria;
  - add the removal of the Beta badges as its client work.

  Verify: `npx -y @fission-ai/openspec@latest validate --all --strict`. Done 2026-11-03: the release gate now covers general availability. Its prerequisites gain this change (1.12), it removes the beta label in one task (2.1) with its E2E update (2.2), and its deltas modify the administrator control and remove the two badge requirements this change adds.
- [x] 1.2 Revise `private-rooms-release-gate` a second time (design decision 9): it adds the portal setting from the server, its administrator control and the availability rule on top of the E2E rooms app, and its deltas no longer modify requirements this change stopped adding. Verify: `npx -y @fission-ai/openspec@latest validate --all --strict`. Done 2026-11-03: the release gate gains prerequisite 8 and task 1.13 for the server setting, group 5 for the settings read, the availability rule, the administrator control, the SDK layout and a setting-off spec, and its deltas add the administrator control and modify "Private rooms are offered on every portal" and "Section availability follows the E2E rooms app".

## 2. Beta badge

- [x] 2.1 Give `BetaBadge` (`packages/shared/components/beta-badge`) an optional description that replaces `Common:BetaBadgeDescription` and keeps the feedback links (design decision 5). Verify: new cases in `BetaBadge.test.tsx` for the default and the overridden text, with `cd packages/shared && pnpm exec vitest run components/beta-badge`.
- [x] 2.2 Put the Beta badge on the Private sidebar item through `badgeComponent` in `packages/client/src/components/ClientArticleSidebar/index.tsx`, with `BetaBadgeWrapper` and the description Common:PrivateRoomsBetaDescription. Add the key to `public/locales/en/Common.json` in the same commit, then run `/translate-comments` and `/translate-locales`. Verify:
  - cases "Beta badge shown" and "Badge tooltip" in `ClientArticleSidebar/__tests__/ClientArticleSidebar.test.tsx`, with no badge on the Archive sub-item;
  - `cd common/tests && npx vitest run test/locales.test.js`.
- [x] 2.3 Put the Beta badge on the Keys management tab through the tab's `badge` slot in `packages/client/src/pages/Profile/Section/Body/index.tsx`. Verify: a case "Tab label" in a new `packages/client/src/pages/Profile/Section/Body/__tests__/ProfileTabs.test.tsx`, and `pnpm run tsc`.
- [ ] 2.4 Give `BetaBadge` an optional title that replaces `Common:BetaBadgeTitle` (design decision 5), and pass the new key Common:PrivateRoomsBetaTitle from the sidebar item and the Keys management tab. Add the key to every language in the same commit, with its `.meta` comment written by `/translate-comments`. Verify:
  - a `BetaBadge.test.tsx` case for the overridden title, with a `t` mock that keeps `Common:BetaBadgeTitle` distinct;
  - the "Badge tooltip" cases of the sidebar and of `ProfileTabs.test.tsx` assert the title key;
  - `cd common/tests && npx vitest run test/locales.test.js`.

## 3. Availability

- [ ] 3.1 In `packages/client/src/store/AppsStore.ts`, drop `privateRoomsOptIn`: `isPrivateRoomsSectionAvailable` follows the E2E rooms app as `isInstalled` reads it, and inside an SDK frame also requires the frame opt-in. Remove `e2e-rooms` from the unreleased apps in `packages/client/src/helpers/disabled-apps.ts`. Verify:
  - cases "SaaS portal", "Standalone portal with the app on", "App switched off on a standalone portal", "Frame configuration carries the opt-in", "Frame configuration without the opt-in" and "Browser flag in a frame" in the AppsStore unit tests;
  - `cd packages/client && pnpm exec vitest run src/store src/helpers`.
- [ ] 3.2 Register the `profile/keys-management` routes of `packages/client/src/routes/general.js` unconditionally, behind a guard that renders the page while the section is available or the user holds a key, and otherwise falls back to the profile (design decision 4). Apply the same rule to the profile tab. Verify: cases "Section available", "App off, no key" and "App off, key held" in unit tests next to the guard and in `ProfileTabs.test.tsx`, and `pnpm run tsc`.
- [ ] 3.3 Delete the browser flag and its URL parameter from `packages/shared/utils/privateRooms.ts`, keeping the frame opt-in value check and the parameter name (design decision 6). Remove every import of the deleted names, including the SDK opt-in helpers, and the raw `"privateRooms"` key in `packages/client/src/store/__tests__/AppsStore.installed.test.ts`. Verify:
  - a rewritten `privateRooms.test.ts` with the case "Browser-local flag ignored";
  - `pnpm run tsc` and `pnpm run test:sdk`;
  - no `privateRooms` localStorage access left: `grep -rn "localStorage" packages --include=*.ts* | grep -i privaterooms` prints nothing outside tests that assert it is ignored.

## 4. E2E

- [ ] 4.1 Stop writing the `privateRooms` flag in `packages/client/__tests__/fixtures/base.ts`; the Arbiter flag stays. Verify: case "Base fixture", and the private-room specs (`private-room-*`, `private-rooms-section`, `keys-management*`, `key-flow-edge-cases`, `encrypted-file-ui`) green with `cd packages/client && pnpm test:e2e:docker:dev <specs>`.
- [ ] 4.2 Replace `private-rooms-hidden.spec.ts` with `private-rooms-app-off.spec.ts`, covering "App-off spec", "Browser-local flag ignored", "App off, key held", "Link opened while the section is not available" and "Chooser with the app off" on a mocked standalone portal. Verify under Docker as in 4.1.
- [ ] 4.3 Assert the badges: "Beta badge shown" in `private-rooms-section.spec.ts` and "Tab label" in `keys-management.spec.ts`, each with the tooltip title. Verify under Docker as in 4.1.
- [ ] 4.4 Run the full client E2E under Docker (`tests-dev`, `--update-snapshots=changed`). Design decision 7 expects no screenshot to move; check any that does by eye before committing it, and announce a regeneration to the teams that merge into the release branch. Verify: the full run, green except the failures the release branch has on its own (seven on 2026-11-03: five in `unpaid-portal-requests`, two in `ai-services-disabled`).

## 5. Documentation

- [ ] 5.1 Write `release-notes.md` in this change folder and link it from README.md, then record when it was handed to the documentation team. It contains:
  - the accepted v1 limitations, the SHALL NOT requirements of `private-rooms/encryption-core`;
  - the warning that a lost key and recovery phrase mean lost files;
  - the account-link risk: saving a key can remove a Google, SSO or other sign-in link until `private-rooms-server-hardening` 12.1 ships, so users with an external sign-in set a password first;
  - that standalone administrators switch the feature with the Private app, and that SaaS has no switch during the beta;
  - that the SDK private pages need the host opt-in;
  - the server and Document Server items still open at release time, taken from `private-rooms-server-hardening` and `private-rooms-editor-contract`;
  - the Document Server build of 0.1.

  Verify: that record.
- [ ] 5.2 Make `.claude/rules/private-rooms.md` (item 8 and its flag mentions) and the feature-flag line of the `openspec/config.yaml` context describe the beta shown to every user, not a hidden feature. Verify: `npx -y @fission-ai/openspec@latest validate --all --strict`.

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`, `pnpm run test:doceditor`), the SDK private E2E and `npx -y @fission-ai/openspec@latest validate --all --strict`. Verify: all green.
- [ ] 6.2 Run on staging with the Document Server of 0.1, and record date, builds and results in design.md:
  - a user who never opted in sees the Private section and the badges;
  - on a standalone portal an administrator switches the Private app off: the section goes, private rooms are listed in Rooms, and the Keys management tab stays for a key holder.

  Verify: that record.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-beta-release` after the beta is merged to the release branch. At the archive, rewrite the Purpose of `private-rooms/feature-gating` in the main spec so it describes the beta shown to every user instead of the tester opt-in.
- General availability then follows the revised `private-rooms-release-gate`.
