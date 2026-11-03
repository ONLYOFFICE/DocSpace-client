# Proposal

## Why

Private rooms are still hidden behind a browser-local tester opt-in, while the
owner wants to ship them in the next release to real users. The full release
(`private-rooms-release-gate`) waits for an external penetration test, the
Document Server contract sign-off and the B2B items of
`private-rooms-server-hardening`, which do not fit the next release. A beta
fits: the server and editor fixes the beta needs are expected on the release
branches within a week (owner, 2026-11-03), and a visible "Beta" label tells
users the feature is still maturing. On 2026-11-03 the owner chose to control
the beta with a portal setting delivered by the server, so that administrators
on SaaS and standalone portals can switch it off.

## What Changes

- Private rooms are offered when a portal setting from the server settings
  payload allows them. The browser-local `privateRooms` flag and its
  `?privateRooms=` URL parameter are no longer read or written.
- Portal administrators switch private rooms on and off in the portal
  settings. The control is labelled as a beta.
- The Private sidebar item and the profile's Keys management tab carry a Beta
  badge. Its tooltip explains that the feature is in beta and links to the
  existing feedback channels. The shared `BetaBadge` gets a description
  override for this, since its tooltip text is specific to RTL languages today.
- Keys management stays reachable for users who already hold a key when the
  setting is off. Existing private rooms stay usable and are listed in Rooms.
- An embedded client frame and the SDK private pages still need the host
  opt-in, in addition to the setting.
- The E2E base fixture stops setting the flag. The MSW settings payload
  carries the setting, and a setting-off spec replaces the hidden-surfaces
  spec.
- Beta release notes list the accepted v1 limitations, the warning that a lost
  key means lost files, and the server and Document Server items still open at
  release time.
- `private-rooms-release-gate` is revised to cover the general availability
  that follows the beta. Its server setting and opt-in removal move into this
  change, and it gains the removal of the Beta badges.
- `.claude/rules/private-rooms.md` and the `openspec/config.yaml` context stop
  describing the feature as hidden.

**BREAKING** for testers: the localStorage flag and the URL parameter stop
working. A portal administrator turns the setting on instead.

### Prerequisites (beta gate)

The beta is not merged to a release branch until all of these hold:

1. `private-rooms-server-hardening` 12.1 is merged on the server release
   branch. Today saving a key can delete a user's Google or SSO sign-in link.
2. The portal setting from `private-rooms-release-gate` 2.1 is merged on the
   server release branch, and its JSON name has been read in `../server`
   through CodeGraph. If it misses the release, decision 1 below applies.
3. The Document Server build shipped with the release is named, and it
   carries the crypto add-on. Otherwise the capability check of
   `private-rooms-editor-contract` (2.1 to 2.4) is archived first.
4. Spreadsheets and presentations are covered. Either
   `private-rooms-editor-contract` 4.7 passes on that Document Server build
   (DS-17 and DS-19 closed), or a follow-up change that opens them view-only
   and withholds their creation in private rooms is archived first.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/feature-gating`: the browser-local opt-in is replaced by the
  portal setting. The setting adds an administrator control, keeps existing
  rooms usable when it is off and drives the E2E rooms app. Frames and the SDK
  require both the setting and the host opt-in. The E2E suite covers both
  states of the setting.
- `private-rooms/sidebar-section`: section availability reads the setting
  instead of the flag, and the sidebar item carries the Beta badge.
- `private-rooms/key-management`: the Keys management tab follows the setting,
  stays for users who hold a key, and carries the Beta badge.

## Impact

- **Client:**
  - availability: `packages/client/src/store/AppsStore.ts`, `packages/client/src/helpers/disabled-apps.ts`, `packages/client/src/routes/general.js`
  - Beta badge and Keys management tab: `packages/client/src/components/ClientArticleSidebar`, `packages/client/src/pages/Profile/Section/Body/index.tsx`
  - administrator control: a portal settings page (location is decision 3)
  - E2E: `packages/client/__tests__/fixtures/base.ts`, `private-rooms-hidden.spec.ts`, and the screenshots that show the sidebar
- **Shared:** `packages/shared/utils/privateRooms.ts` (the browser flag goes, the frame opt-in value check stays), the `BetaBadge` component, the settings store type, the MSW settings handler, and `public/locales` (new Common keys).
- **SDK:** the `(private)` layout and opt-in helpers read the setting in addition to the host opt-in.
- **Server (`../server`):**
  - `private-rooms-server-hardening` 12.1;
  - `private-rooms-release-gate` 2.1, the portal setting in the settings payload, editable by administrators;
  - `private-rooms-server-hardening` 3.1, the availability rule the setting builds on;
  - the default value of the setting on upgraded and new portals (decision 2).
- **Document Server:**
  - the release build named with the crypto add-on;
  - DS-17 and DS-19 for spreadsheets and presentations (prerequisite 4).
- **Docs:** beta release notes in this change folder, handed to the documentation team.

## Out of scope

- General availability: removing the Beta badges, the penetration test, the
  accessibility pass on the invite panel and the Members view, and the
  compliance pack. All of these stay in `private-rooms-release-gate`.
- The view-only restriction for spreadsheets and presentations. It is a
  separate follow-up change, proposed only if prerequisite 4 is not met by
  the Document Server build.
- A Beta label inside the SDK private pages. Hosts opt in explicitly there.
- Any functional change to private rooms beyond availability and labelling.

## Decisions needed

1. **Contingency if the server setting misses the release** (owner). Offer
   the beta on standalone portals only, with the E2E rooms app as the switch,
   and keep the tester flag on SaaS until the setting lands. This rewrites
   the feature-gating and sidebar-section deltas of this change.
2. **Default value of the setting** (product with the server team).
   Recommended: off on upgraded portals and on for new portals, as in
   `private-rooms-release-gate` decision 2.
3. **Where administrators find the control** (product design): the security
   settings, the rooms settings, or the apps catalog entry of the E2E rooms
   app.
4. **Default of the setting in the E2E MSW payload** (feature owner).
   Recommended: off, with the private-room specs turning it on. The sidebar
   screenshots of other suites then no longer depend on this feature.
