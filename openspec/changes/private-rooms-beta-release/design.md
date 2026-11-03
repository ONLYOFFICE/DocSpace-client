# Design

## Context

See proposal.md, "Why". The current state of the branch, read on 2026-11-03:

- **The browser opt-in.** `packages/shared/utils/privateRooms.ts` holds the
  flag (`isPrivateRoomsEnabled`, `PRIVATE_ROOMS_FLAG_KEY`). Since this branch
  it also holds `applyPrivateRoomsOptInFromUrl`, which writes the flag when
  the address carries `?privateRooms=true|1`, and `isPrivateRoomsOptInValue`,
  which the frame and SDK opt-ins use too. The flag is read in:
  - `AppsStore.privateRoomsOptIn`, behind `isPrivateRoomsSectionAvailable` (`packages/client/src/store/AppsStore.ts`);
  - the unreleased-apps map (`packages/client/src/helpers/disabled-apps.ts`);
  - the route tables (`packages/client/src/routes/general.js`, `withPrivateRooms`, evaluated once when the module loads);
  - the profile tabs (`packages/client/src/pages/Profile/Section/Body/index.tsx`);
  - the SDK opt-in helpers (`packages/sdk/src/app/(private)/_utils/private-rooms-opt-in.ts`), which only borrow the parameter name and the value check.
- **Section availability.** `isPrivateRoomsSectionAvailable` returns false
  unless the browser flag or the frame opt-in is set, then follows the E2E
  rooms app. Apps are managed only on standalone portals (`canManageApps` is
  `settingsStore.standalone`), so on SaaS the section follows the opt-in
  alone. The two opt-ins are joined by OR, so the browser flag also opts an
  SDK frame in.
- **The user's keys.** They are loaded for every signed-in user when the
  application starts (`packages/shared/store/AuthStore.ts`, into
  `userStore.encryptionKeys`), so "the user holds a key" is known early.
- **The Beta badge.** `packages/shared/components/beta-badge` renders the
  constant label `BetaLabel` (`public/locales/.constants/consts.json`). Its
  tooltip title is fixed to `Common:BetaBadgeTitle` ("RTL interface") and its
  text defaults to `Common:BetaBadgeDescription`, both about RTL languages,
  followed by `Common:BetaBadgeFeedback` (forum link and support e-mail). Task
  2.1 added a description override; the title has none yet, so the Private
  badges show "RTL interface" as their title today.
- **E2E.**
  - The base fixture writes the flag for every page (`packages/client/__tests__/fixtures/base.ts`), and `private-rooms-hidden.spec.ts` asserts the hidden state.
  - The desktop screenshots already show the Private item with its Beta badge (commit `6f2d07034af`), because the fixture turns the flag on everywhere.
  - `AppsStore.installed.test.ts` writes the raw `"privateRooms"` key, which `tsc` cannot catch.
- **The server.** It has no availability setting, and none is expected for
  this release. Saving a key through `EncryptionLoginProvider.SetKeysAsync`
  calls `AccountLinker.RemoveProviderAsync(userId)` without a provider, which
  deletes the user's first account link of any provider before the encryption
  link is added (read through CodeGraph on `release/v4.1.0` at `d64d3396f5`).
  That is `private-rooms-server-hardening` 12.1.

## Goals / Non-Goals

**Goals:**
- Every user meets the feature without an opt-in, labelled as a beta.
- Standalone administrators keep a switch, the one apps already have.
- Nothing left that decides availability from browser storage or the address.
- `private-rooms-release-gate` stays the single definition of general
  availability, and owns the portal setting.

**Non-Goals:**
- Changing the views a private room offers, or the editor.
- Per-user or per-group availability.
- A switch on SaaS. It comes with the portal setting at general availability.

## Decisions

1. **The E2E rooms app is the only switch.** On SaaS every app is on, so the
   section is always offered; on standalone an administrator switches the app
   in the apps settings, which already updates the section without a reload.
   This is the owner's decision of 2026-11-03, taken because no server setting
   will ship with the release.
   - *Alternative:* the portal setting of the earlier plan.
   - *Why not:* the server has none; it moves to `private-rooms-release-gate`.
   - *Alternative:* keep the tester flag on SaaS until the setting lands.
   - *Why not:* the owner wants the beta in front of every user now.

2. **Frames and the SDK keep the host opt-in.** A host that embeds the client
   or the SDK has not asked for a beta surface, so it has to request one.
   Inside an SDK frame only the frame configuration opts in; a browser value
   no longer does, which also closes the OR described in Context.
   - *Alternative:* offer the section in every frame.
   - *Why not:* it would show a beta inside third-party products without their consent.

3. **Keys management stays for users who hold a key**, as in decision 3 of
   `private-rooms-release-gate`. A user with existing private rooms must be
   able to unlock, export or reset their key after an administrator switches
   the app off.

4. **The keys routes are registered unconditionally and guarded by a route
   component.** `withPrivateRooms` in `general.js` runs once when the module
   loads, before the apps list and the keys arrive. A guard in the style of
   `PrivateRoomsSectionRoute` waits for them, then renders the page or falls
   back to the profile.

5. **`BetaBadge` takes an optional description and an optional title**, used
   in place of `Common:BetaBadgeDescription` and `Common:BetaBadgeTitle`. The
   feedback part and the label stay as they are. Private rooms pass
   `Common:PrivateRoomsBetaTitle` and `Common:PrivateRoomsBetaDescription`.
   - *Alternative:* a separate private-rooms badge component.
   - *Why not:* it would duplicate the tooltip, the device placement and the feedback links.

6. **The browser flag and its URL parameter are deleted. The frame opt-in
   value check and the parameter name stay**, because frames and the SDK still
   use them (decision 2). The module keeps only those.

7. **The E2E suite needs no setting.** The mocked apps list has the E2E rooms
   app on and the default settings are SaaS-like, so every spec sees the
   section without a fixture option. The screenshots committed in
   `6f2d07034af` already show that state, so removing the flag from the
   fixture moves none of them. The app-off spec mocks a standalone portal
   with the app off.

8. **Spreadsheets and presentations are a gate item, not part of this
   change.** If the Document Server build closes DS-17 and DS-19
   (`private-rooms-editor-contract` 4.7), nothing is restricted. Otherwise a
   separate change opens them view-only and withholds their creation. That
   change modifies `file-operations`, `sdk-surface` and `editor-integration`,
   which this change does not touch. The doceditor already switches to view
   mode for `action=view` (`packages/doceditor/src/utils/actions.ts:777,833`),
   and the client already passes it for previews
   (`packages/client/src/store/filesStore/actions.helpers.ts:163`).

9. **`private-rooms-release-gate` owns the portal setting again.** Revised a
   first time by task 1.1, it is revised a second time with this decision: it
   adds the server setting, the administrator control and the availability
   rule on top of the app, and still removes the Beta badges.

10. **The account-link loss is an accepted beta risk.** The owner decided on
    2026-11-03 to merge without waiting for `private-rooms-server-hardening`
    12.1 and without a client guard. The beta release notes name it.

## Risks / Trade-offs

- **Saving a key can delete a Google, SSO or other sign-in link** (Context,
  "The server"). → Accepted by the owner (decision 10). The release notes
  tell users with an external sign-in to set a password before they create a
  key; `private-rooms-server-hardening` 12.1 fixes it on the server.
- **No switch on SaaS.** Every SaaS user is offered the beta. → Accepted for
  the beta; the portal setting arrives with general availability.
- **Every user now meets the defects of the beta.** → The verified blockers of
  the second pre-PR review are fixed by their own change before the merge.
- **Testers lose the console toggle.** → They need none: the section is shown.
  `.claude/rules/private-rooms.md` says so in the same change.
- **The Document Server build lacks the crypto add-on.** Encrypted files then
  fail to open in the editor. → Gate items 0.3 and 0.4.

## Migration Plan

1. Revise `private-rooms-release-gate` (decision 9).
2. Land the Beta badge title, the availability read, the keys guard, the
   removal of the flag and the E2E changes on the feature branch.
3. Run the pre-push gate and the full client E2E under Docker, and the SDK
   private E2E.
4. Rollback: revert the client changes of this change. The flag and the
   hidden mode come back with the revert.

## Open Questions

- The wording of `Common:PrivateRoomsBetaTitle` and
  `Common:PrivateRoomsBetaDescription`. Product may reword them; the
  behaviour does not change.
