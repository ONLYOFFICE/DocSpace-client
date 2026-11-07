# Proposal

## Why

Private rooms reach users first as a beta (`private-rooms-beta-release`):
- the browser-local tester flag is gone, and the Private section is shown to
  every user;
- on standalone portals the E2E rooms app is the only switch, and SaaS has
  none;
- the Private sidebar item and the Keys management tab carry a Beta badge.

The beta deliberately ships without the items that general availability
needs: an external penetration test, the Document Server contract sign-off,
the server hardening found in the 2026-10-20 audit, the accessibility pass on
the member panels, and a portal setting that lets administrators switch the
feature on SaaS as well. This change is the definition of done for general
availability. It lists those prerequisites, adds the portal setting, removes
the beta label once they hold, and publishes the release documents.

## What Changes

- Offer private rooms only while a portal setting from the server settings
  payload allows them, on top of the E2E rooms app on standalone portals.
  Portal administrators switch the setting in the portal settings, on SaaS and
  standalone.
- Remove the Beta badges from the Private sidebar item and the Keys management
  tab, together with the Common:PrivateRoomsBetaTitle and
  Common:PrivateRoomsBetaDescription texts they share.
- Publish release notes listing every accepted v1 limitation from
  `private-rooms/encryption-core` (no room key, no forward secrecy for
  already-decrypted content, visible file extension, per-device identity,
  in-memory buffering, unauthenticated DSE3 header flags) and the editor
  action policy.
- Commit the compliance and positioning documents recovered from the stashes
  under `docs/private-rooms/`, after review.
- Update `.claude/rules/private-rooms.md` and `openspec/config.yaml` so they
  describe a released feature, not a beta.

Revised on 2026-11-03, twice: first the portal setting and the removal of the
browser opt-in moved to `private-rooms-beta-release`; then the owner shipped
the beta without a setting, and the setting came back here.

### Prerequisites (gate criteria)

The change MUST NOT be applied until all of the following hold:

1. Archived: `private-rooms-beta-release`, `private-rooms-upload-fail-closed`,
   `private-rooms-tofu-on-upload`, `private-rooms-invite-atomic-rewrap` and
   `private-rooms-editor-contract`.
2. Decided, then archived or explicitly deferred with an accepted-limitation
   requirement: `private-rooms-device-unlock-policy` and
   `private-rooms-dse3-header-authentication`.
3. Archived: `private-rooms-sdk-gating-and-parity`, `private-rooms-ux-gaps`,
   `private-rooms-remove-dead-api-calls` and `private-rooms-spec-drift-fixes`.
4. `private-rooms-server-hardening` items merged on the server:
   - always: owner-change hand-over, metadata guards, title validation,
     the e-mail title, and the account-link fix of 12.1 (all merged by
     2026-11-05); the availability rule only if product decides on one
     (`private-rooms-server-hardening` decision 1; the server added none
     and the portal setting of prerequisite 8 is the availability control
     of this change);
   - if the launch scope is B2B: recovery and offboarding as well.
5. External penetration test performed on the crypto core and the private
   room flows, with the summary published (stashed task #69).
6. Accessibility pass on the key dialogs and the private-room panels.
7. A Document Server release implementing the encrypted-editing contract is
   named and exercised on staging.
8. The portal setting for private rooms is merged on the server release
   branch, and its JSON name, payload, write route and defaults have been read
   in `../server` through CodeGraph.
9. Backup and restore of private rooms: the loss is an accepted
   limitation for now (owner, 2026-11-06; `private-rooms-server-hardening`
   decision 9 and task group 15), so the warning on the backup and restore
   pages is merged and the release notes carry the limitation. Found by
   the backend team on 2026-11-05: a restored portal cannot open the files
   of its private rooms. The backup of the keys with the original ids is
   a later option and not a gate criterion.
10. Every Document Server build the release adopts, the one named for
    prerequisite 7 and each later one up to general availability, has passed
    the editor check on a stand with the crypto add-on before the portal
    moves to it: create, edit, save, close every editor and reopen; a second
    member joining a held session; a view-only member. The E2E suites stop
    at the configuration handed to `DocsAPI.DocEditor`, so a Document Server
    that changes what it expects passes them unnoticed (decided by the owner
    on 2026-11-06). The check of 2026-11-06 on 10.0.3.19 fails at the
    reopen (`private-rooms-editor-contract` 6.2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/feature-gating`: a portal setting decides availability on
  top of the E2E rooms app, and administrators switch it in the portal
  settings.
- `private-rooms/sidebar-section`: section availability reads the setting, and
  the Private sidebar item loses its Beta badge.
- `private-rooms/key-management`: the Keys management tab loses its Beta badge.

These deltas modify requirements that `private-rooms-beta-release` adds. They
apply once that change is archived (prerequisite 1).

## Impact

- **Client:**
  - availability: `packages/client/src/store/AppsStore.ts`, the settings store type;
  - the administrator control in the portal settings (location is decision 4);
  - `packages/client/src/components/ClientArticleSidebar`;
  - `packages/client/src/pages/Profile/Section/Body/index.tsx`;
  - `public/locales` (the two beta keys removed, the control's keys added);
  - the E2E specs that assert the badges, a setting-off spec, and the sidebar screenshots.
- **Shared:** the MSW settings handler and its contract case.
- **SDK:** the `(private)` layout reads the setting in addition to the host opt-in.
- **Server (`../server`):** the portal setting (prerequisite 8) and the
  `private-rooms-server-hardening` items of prerequisite 4.
- **Document Server:** the release named in prerequisite 7.
- **Docs:** the `docs/private-rooms/` compliance and positioning pack, and the
  release notes.

## Out of scope

- Any functional change to private rooms themselves.
- Marketing copy beyond the "no zero-knowledge claim" rule from the stashed
  positioning audit.

## Decisions needed

1. Launch scope: individuals and SMB (prerequisite 4 without recovery and
   offboarding), or B2B (with them). The stashed V1 plan allowed the former,
   with an explicit note in the release notes.
2. Whether frames and the SDK keep the host opt-in at general availability.
   `private-rooms-beta-release` keeps it for the beta.
3. Default value of the portal setting on upgraded and new portals (product
   with the server team). Upgraded portals ran the beta with the section
   shown, so on keeps their state.
4. Where administrators find the control: the security settings, the rooms
   settings, or the apps catalog entry of the E2E rooms app.
