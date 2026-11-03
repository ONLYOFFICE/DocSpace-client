# Design

## Context

See proposal.md, "Why". The current state of the branch, read on 2026-11-03:

- **The browser opt-in.** `packages/shared/utils/privateRooms.ts` holds the
  flag (`isPrivateRoomsEnabled`, `PRIVATE_ROOMS_FLAG_KEY`). Since this branch
  it also holds `applyPrivateRoomsOptInFromUrl`, which writes the flag when
  the address carries `?privateRooms=true|1`, and `isPrivateRoomsOptInValue`,
  which the frame and SDK opt-ins use too. The flag is read in:
  - `AppsStore.privateRoomsOptIn`, behind `isPrivateRoomsSectionAvailable` (`packages/client/src/store/AppsStore.ts`);
  - the unreleased-apps map (`packages/client/src/helpers/disabled-apps.ts:47`);
  - the route tables (`packages/client/src/routes/general.js:46`, `withPrivateRooms`, evaluated once when the module loads);
  - the profile tabs (`packages/client/src/pages/Profile/Section/Body/index.tsx:202`);
  - the SDK opt-in helpers (`packages/sdk/src/app/(private)/_utils/private-rooms-opt-in.ts`, `_components/opt-in/PrivateRoomsOptInSource.tsx`).
- **Section availability.** `isPrivateRoomsSectionAvailable` combines the
  opt-in with the E2E rooms app. Apps are managed only on standalone portals
  (`canManageApps` is `settingsStore.standalone`), so on SaaS the section
  follows the opt-in alone (`AppsStore.ts:221-227`).
- **The user's keys.** They are loaded for every signed-in user when the
  application starts (`packages/shared/store/AuthStore.ts:283-293`, into
  `userStore.encryptionKeys`), so "the user holds a key" is known early.
- **The Beta badge.** `packages/shared/components/beta-badge` renders the
  constant label `BetaLabel` (`public/locales/.constants/consts.json`). Its
  tooltip text is fixed to `Common:BetaBadgeDescription`, which speaks about
  RTL languages, followed by `Common:BetaBadgeFeedback` (forum link and
  support e-mail). The client wraps it in `BetaBadgeWrapper`, which injects
  the forum URL, the e-mail and the colour scheme.
- **Slots for the badge.** ui-kit tabs take a `badge` node after the tab text
  (`TTabItem.badge`, primary tabs only). The sidebar items take
  `badgeComponent` and `collapsedBadgeComponent`; the Private item uses
  neither, because it has no new-items counter.
- **E2E.**
  - The base fixture writes the flag for every page (`packages/client/__tests__/fixtures/base.ts:69-75`), and `private-rooms-hidden.spec.ts` asserts the hidden state.
  - About 400 desktop screenshots show the Private sidebar item.
  - `AppsStore.installed.test.ts` writes the raw `"privateRooms"` key, which `tsc` cannot catch.
- **The server.** It has no availability setting today. The setting is
  `private-rooms-release-gate` task 2.1, and its availability rule is
  `private-rooms-server-hardening` task 3.1. This design records no server
  field name. The name is read in `../server` through CodeGraph once 2.1 has
  merged.

No stashed design document covers a beta. The stashed `V1_RELEASE_PROGRESS.md`
allowed a launch to individuals and SMB without recovery and SCIM. This change
follows that by leaving the B2B items out of the beta gate.

## Goals / Non-Goals

**Goals:**
- One switch an administrator controls, on SaaS and standalone alike.
- Nothing left that decides availability from browser storage or the address.
- The beta is visibly labelled wherever a user first meets the feature.
- `private-rooms-release-gate` stays the single definition of general
  availability.

**Non-Goals:**
- Changing the views a private room offers, or the editor.
- Per-user or per-group availability.

## Decisions

1. **The portal setting is the only switch, and an absent field means off.**
   This is the owner's decision of 2026-11-03. If an older server sends a
   payload without the field, the feature stays hidden instead of appearing
   with no switch.
   - *Alternative:* treat an absent field as on, as `private-rooms-release-gate` proposed for its testers.
   - *Why not:* on a release branch that would show the beta on any server that never shipped the setting.

2. **Frames and the SDK keep the host opt-in on top of the setting.** A host
   that embeds the client or the SDK has not asked for a beta surface, so it
   has to request one. This settles the open question of
   `private-rooms-release-gate` for the beta; general availability may
   revisit it.
   - *Alternative:* follow the setting alone.
   - *Why not:* it would show a beta inside third-party products without their consent.

3. **Keys management stays for users who hold a key**, as in decision 3 of
   `private-rooms-release-gate`. A user with existing private rooms must be
   able to unlock, export or reset their key after an administrator turns the
   setting off.

4. **The keys routes are registered unconditionally and guarded by a route
   component.** `withPrivateRooms` in `general.js` runs once when the module
   loads, before the settings payload arrives, so it cannot read the setting.
   A guard in the style of `PrivateRoomsSectionRoute` waits for the settings
   and the keys, then renders the page or falls back to the profile.

5. **`BetaBadge` takes an optional description**, used in place of
   `Common:BetaBadgeDescription`. The feedback part and the label stay as
   they are. Private rooms pass the new key `Common:PrivateRoomsBetaDescription`
   through `BetaBadgeWrapper`.
   - *Alternative:* a separate private-rooms badge component.
   - *Why not:* it would duplicate the tooltip, the device placement and the feedback links.

6. **The browser flag and its URL parameter are deleted. The frame opt-in
   value check stays**, because frames and the SDK still use it (decision 2).
   The remaining helper keeps its module, renamed if only the frame part is
   left.

7. **The E2E settings payload carries the setting.** Its default is proposal
   decision 4; the recommendation is off, with the private-room specs turning
   it on through a fixture option.
   - *Why off:* the screenshots of the other suites would then no longer show the Private item. One more regeneration of the sidebar screenshots happens either way, because the Beta badge or the removal of the item changes them.

8. **Spreadsheets and presentations are a gate item, not part of this
   change.** If the Document Server build closes DS-17 and DS-19
   (`private-rooms-editor-contract` 4.7), nothing is restricted. Otherwise a
   separate change opens them view-only and withholds their creation. That
   change modifies `file-operations`, `sdk-surface` and `editor-integration`,
   which this change does not touch. The doceditor already switches to view
   mode for `action=view` (`packages/doceditor/src/utils/actions.ts:777,833`),
   and the client already passes it for previews
   (`packages/client/src/store/filesStore/actions.helpers.ts:163`).

9. **`private-rooms-release-gate` is revised before this change is applied.**
   Both changes remove the same feature-gating requirements. Whichever archives
   second would otherwise fail validation. The revision:
   - drops groups 2 and 3 and the feature-gating delta of the release gate, which this change now owns;
   - keeps its general-availability criteria;
   - adds the removal of the Beta badges.

## Risks / Trade-offs

- **The server setting misses the release.** The beta cannot ship as
  specified → proposal decision 1 is the fallback: standalone only, with the
  tester flag kept on SaaS. It needs a rewrite of the feature-gating and
  sidebar-section deltas, so the gate checks the setting first.
- **Testers lose the console toggle.** → The administrator control replaces
  it. `.claude/rules/private-rooms.md` says so in the same change.
- **The setting is off and a member uses the SDK.** The SDK private pages
  show the not-available view, so private rooms cannot be reached through the
  SDK. → This is accepted for the beta, and the release notes name it. The
  client keeps them reachable in Rooms.
- **The default value on upgrade surprises users.** → This is proposal
  decision 2, taken with product and the server team before the gate.
- **The screenshot churn hits other teams again.** → Decision 7, plus one
  regeneration commit, announced to the teams that merge into the release
  branch.

## Migration Plan

1. Revise `private-rooms-release-gate` (decision 9).
2. Once the server setting has merged, read its JSON name in `../server`
   through CodeGraph. Add it to the settings type and the MSW handler,
   mirroring the server.
3. Land the client and SDK reads, the administrator control, the Beta badges
   and the E2E changes on a branch from the release branch.
4. Verify on staging with the setting on and off, on the Document Server
   build named for the release.
5. Rollback: revert the client branch. The server setting does nothing
   without the client reads. Testers then return to the tester flag, which
   the revert restores.

## Open Questions

- The wording of `Common:PrivateRoomsBetaDescription`. Product writes it
  before the locale task; it does not change the behaviour.
