# Proposal

## Why

Private rooms are still hidden behind a browser-local tester opt-in, while the
owner wants to ship them in the next release to real users. The full release
(`private-rooms-release-gate`) waits for an external penetration test, the
Document Server contract sign-off and the B2B items of
`private-rooms-server-hardening`, which do not fit the next release. A beta
fits: the server and editor fixes the beta needs are expected on the release
branches within a week (owner, 2026-11-03), and a visible "Beta" label tells
users the feature is still maturing.

The first plan controlled the beta with a portal setting from the server. No
such setting will ship with the release, so on 2026-11-03 the owner decided to
remove the tester flag and show the Private section to every user, labelled as
a beta, with the E2E rooms app as the switch on standalone portals.

## What Changes

- Private rooms are offered on every portal without an opt-in. The
  browser-local `privateRooms` flag and its `?privateRooms=` URL parameter are
  no longer read or written.
- On a standalone portal an administrator switches the feature off and on with
  the E2E rooms app ("Private") in the apps settings. SaaS has no switch.
- The Private sidebar item and the profile's Keys management tab carry a Beta
  badge. Its tooltip has a private-rooms title and text, and links to the
  existing feedback channels. The shared `BetaBadge` gets a description and a
  title override for this, since both are specific to RTL languages today.
- Keys management stays reachable for users who already hold a key when the
  app is switched off. Existing private rooms stay usable by their address
  and are listed nowhere, the Rooms section included (owner's decision,
  confirmed 2026-11-10). The server leaves them out of the Rooms list; the
  client keeps the non-private filter on Rooms → Archive for that
  (2026-11-11).
- An embedded client frame and the SDK private pages still need the host
  opt-in. Inside a frame, a browser value no longer opts in.
- The E2E base fixture stops setting the flag, and an app-off spec replaces
  the hidden-surfaces spec.
- Beta release notes list the accepted v1 limitations, the warning that a lost
  key means lost files, the account-link risk of saving a key, and the server
  and Document Server items still open at release time.
- `private-rooms-release-gate` is revised to cover the general availability
  that follows the beta. It owns the portal setting and its administrator
  control, and the removal of the Beta badges.
- `.claude/rules/private-rooms.md` and the `openspec/config.yaml` context stop
  describing the feature as hidden.

**BREAKING** for testers: the localStorage flag and the URL parameter stop
working. They are no longer needed.

### Prerequisites (beta gate)

The private-rooms code is on `release/v4.1.0` since 2026-11-03 (PR !798),
still hidden behind the browser-local flag. The flag is not removed there
until these hold:

1. The Document Server build shipped with the release is named, and it
   carries the crypto add-on. Otherwise the capability check of
   `private-rooms-editor-contract` (2.1 to 2.4) is archived first.
2. Spreadsheets and presentations are covered. Either
   `private-rooms-editor-contract` 4.7 passes on that Document Server build
   (DS-17 and DS-19 closed), or a follow-up change that opens them view-only
   and withholds their creation in private rooms is archived first.
3. The verified blockers of the second pre-PR review of 2026-11-03 are fixed
   by their own change.
4. Ticking "Don't ask again" in the name dialog of a private room creates
   one file, not two: `private-rooms-create-dialog-single-file` is archived
   first.

`private-rooms-server-hardening` 12.1 is not a prerequisite any more: the
owner accepted the account-link risk for the beta (decision 2). The fix
merged on the server on 2026-11-04 (`3b9c527a6e`), before the beta shipped.

Prerequisites 1 and 2 no longer hold the flag back (decision 6): the flag is
removed while they are open, and the release notes name them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/feature-gating`: the browser-local opt-in is removed and the
  feature is offered on every portal, with the E2E rooms app as the standalone
  switch. Existing rooms stay usable when the app is off. Frames take the host
  opt-in alone. The E2E suite runs without the flag.
- `private-rooms/sidebar-section`: section availability follows the E2E rooms
  app instead of the flag, and the sidebar item carries the Beta badge with
  its own tooltip title.
- `private-rooms/key-management`: the Keys management tab follows the section,
  stays for users who hold a key, and carries the Beta badge.

## Impact

- **Client:**
  - availability: `packages/client/src/store/AppsStore.ts`, `packages/client/src/helpers/disabled-apps.ts`, `packages/client/src/routes/general.js`
  - Beta badge and Keys management tab: `packages/client/src/components/ClientArticleSidebar`, `packages/client/src/pages/Profile/Section/Body/index.tsx`
  - E2E: `packages/client/__tests__/fixtures/base.ts`, `private-rooms-hidden.spec.ts`
- **Shared:** `packages/shared/utils/privateRooms.ts` (the browser flag goes, the frame opt-in value check stays), the `BetaBadge` component, and `public/locales` (Common keys).
- **SDK:** the opt-in helpers keep the parameter name after the shared module shrinks; behaviour unchanged.
- **Server (`../server`):** none for the beta. `private-rooms-server-hardening` 12.1 merged there on 2026-11-04 (`3b9c527a6e`); the release notes name the server build that carries it.
- **Document Server:**
  - the release build named with the crypto add-on;
  - DS-17 and DS-19 for spreadsheets and presentations (prerequisite 2).
- **Docs:** beta release notes in this change folder, handed to the documentation team.

## Out of scope

- General availability: the portal setting and its administrator control,
  removing the Beta badges, the penetration test, the accessibility pass on
  the invite panel and the Members view, and the compliance pack. All of
  these are in `private-rooms-release-gate`.
- The view-only restriction for spreadsheets and presentations. It is a
  separate follow-up change, proposed only if prerequisite 2 is not met by
  the Document Server build.
- A Beta label inside the SDK private pages. Hosts opt in explicitly there.
- The defects found by the second pre-PR review. They are fixed by their own
  change.
- Any functional change to private rooms beyond availability and labelling.

## Decisions

1. **No server setting; the section is shown on every portal** (owner,
   2026-11-03). Standalone administrators use the E2E rooms app; SaaS has no
   switch until general availability.
2. **Merge without the server fix for the account-link loss** (owner,
   2026-11-03), with no client guard. The release notes name the risk.
   Overtaken on 2026-11-04: the fix landed on `release/v4.1.0` of the server
   (`3b9c527a6e`).
3. **The switch is the apps catalog entry of the E2E rooms app** (follows
   from decision 1). No new administrator control in this change.
4. **The E2E suite runs with the section shown** (follows from decision 1):
   the mocked apps list has the app on, and the app-off spec switches it off.
5. **The rest of the beta is committed directly on `release/v4.1.0`**
   (2026-11-03). PR !798 merged the feature branch there with the flag in
   place, so the gate above holds back the removal of the flag, not the
   merge.
6. **The flag is removed before prerequisites 1 and 2 hold** (2026-11-03),
   with the risk accepted: on a Document Server build without the crypto
   add-on, or with DS-17 and DS-19 still open, encrypted documents,
   spreadsheets or presentations may not open in the editor. Gate items 0.1
   and 0.2 stay open and feed the release notes (task 5.1); they no longer
   hold back tasks 3.1 to 3.3.
