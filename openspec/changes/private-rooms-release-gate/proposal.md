# Proposal

## Why

Private rooms reach users first as a beta (`private-rooms-beta-release`):
- a portal setting controls availability instead of the browser-local tester
  flag;
- the Private sidebar item, the Keys management tab and the administrator
  control carry a Beta badge.

The beta deliberately ships without the items that general availability
needs: an external penetration test, the Document Server contract sign-off,
the server hardening found in the 2026-10-20 audit, and the accessibility pass
on the member panels. This change is the definition of done for general
availability. It lists those prerequisites, removes the beta label once they
hold, and publishes the release documents.

## What Changes

- Remove the Beta badges from the Private sidebar item and the Keys management
  tab, and the beta label from the administrator control for the setting,
  together with the Common:PrivateRoomsBetaDescription text they share.
- Publish release notes listing every accepted v1 limitation from
  `private-rooms/encryption-core` (no room key, no forward secrecy for
  already-decrypted content, visible file extension, per-device identity,
  in-memory buffering, unauthenticated DSE3 header flags) and the editor
  action policy.
- Commit the compliance and positioning documents recovered from the stashes
  under `docs/private-rooms/`, after review.
- Update `.claude/rules/private-rooms.md` and `openspec/config.yaml` so they
  describe a released feature, not a beta.

Revised on 2026-11-03: the portal setting and the removal of the browser
opt-in moved to `private-rooms-beta-release`. That change ships them as the
beta, and this change no longer carries them.

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
   - always: owner-change hand-over, availability rule, metadata guards,
     title validation and the e-mail title;
   - if the launch scope is B2B: recovery and offboarding as well.
5. External penetration test performed on the crypto core and the private
   room flows, with the summary published (stashed task #69).
6. Accessibility pass on the key dialogs and the private-room panels.
7. A Document Server release implementing the encrypted-editing contract is
   named and exercised on staging.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/feature-gating`: the administrator control for the setting is
  no longer labelled as a beta.
- `private-rooms/sidebar-section`: the Private sidebar item loses its Beta
  badge.
- `private-rooms/key-management`: the Keys management tab loses its Beta badge.

These deltas modify requirements that `private-rooms-beta-release` adds. They
apply once that change is archived (prerequisite 1).

## Impact

- **Client:**
  - `packages/client/src/components/ClientArticleSidebar`;
  - `packages/client/src/pages/Profile/Section/Body/index.tsx`;
  - the administrator control added by `private-rooms-beta-release`;
  - `public/locales` (Common:PrivateRoomsBetaDescription removed in every language);
  - the E2E specs that assert the badges and the sidebar screenshots.
- **Server (`../server`):** the `private-rooms-server-hardening` items of
  prerequisite 4. This change itself needs no server work.
- **Document Server:** the release named in prerequisite 7.
- **Docs:** the `docs/private-rooms/` compliance and positioning pack, and the
  release notes.

## Out of scope

- Any functional change to private rooms themselves.
- Marketing copy beyond the "no zero-knowledge claim" rule from the stashed
  positioning audit.
- The portal setting, its default and the removal of the browser opt-in:
  `private-rooms-beta-release` owns them.

## Decisions needed

1. Launch scope: individuals and SMB (prerequisite 4 without recovery and
   offboarding), or B2B (with them). The stashed V1 plan allowed the former,
   with an explicit note in the release notes.
2. Whether frames and the SDK keep the host opt-in at general availability.
   `private-rooms-beta-release` keeps it for the beta.
