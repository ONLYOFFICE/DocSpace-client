# Proposal

## Why

Private rooms are hidden behind a browser-local opt-in (`privateRooms` in
localStorage) because the feature was not releasable on 2026-08-14 and still
is not. The opt-in is a discoverability control only: any user can set it
from the console, the SDK private routes ignore it, and the server exposes
every private-room endpoint regardless. Releasing means replacing that opt-in
with a real availability control and proving, change by change, that the
blockers found in the 2026-10-20 audit are closed. This change is the
definition of done for the feature: it lists the prerequisites, replaces the
opt-in with a server-side setting, and removes the gating from the client,
the SDK and the E2E suite.

## What Changes

- Replace the `privateRooms` localStorage opt-in with a server-side
  availability setting that administrators can turn off; the client, the
  E2E rooms app and the SDK read that setting instead of localStorage.
- Remove the gated-surface logic (create-room chooser, apps catalog and
  sidebar, keys-management tab and routes) and the hidden-surfaces E2E spec;
  the base E2E fixture stops setting the flag.
- Publish release notes that list every accepted v1 limitation from
  `private-rooms/encryption-core` (no room key, no forward secrecy for
  already-decrypted content, file extension visible, per-device identity,
  in-memory buffering) and the editor action policy.
- Commit the compliance and positioning documents recovered from the stashes
  under `docs/private-rooms/` after review.
- Update `.claude/rules/private-rooms.md` and `openspec/config.yaml` so they
  no longer describe the feature as hidden.

**BREAKING**: the localStorage opt-in stops working; testers use the server
setting.

### Prerequisites (gate criteria)

The change MUST NOT be applied until all of the following hold:

1. Archived: `private-rooms-upload-fail-closed`, `private-rooms-tofu-on-upload`,
   `private-rooms-invite-atomic-rewrap`, `private-rooms-editor-contract`.
2. Decided and archived or explicitly deferred with an accepted-limitation
   requirement: `private-rooms-device-unlock-policy`,
   `private-rooms-dse3-header-authentication`.
3. Archived: `private-rooms-sdk-gating-and-parity`, `private-rooms-ux-gaps`,
   `private-rooms-remove-dead-api-calls`.
4. `private-rooms-server-hardening`: owner-change hand-over, availability
   rule, metadata guards, title validation and e-mail title items merged on
   the server; recovery and offboarding merged if the launch scope is B2B.
5. External penetration test performed on the crypto core and the private
   room flows, with the summary published (stashed task #69).
6. Accessibility pass on the key dialogs and private-room panels.
7. Document Server release implementing the encrypted-editing contract is
   named and exercised on staging.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/feature-gating`: the browser-local opt-in requirements are
  removed and replaced by a server-side availability setting; the SDK and
  server "not gated" statements become obsolete; the E2E fixture requirement
  is removed.

## Impact

- Client: `packages/shared/utils/privateRooms.ts` (deleted),
  `packages/shared/utils/rooms.tsx`, `packages/client/src/helpers/disabled-apps.ts`,
  `packages/client/src/routes/general.js`, `packages/client/src/pages/Profile/Section/Body/index.tsx`,
  `packages/shared/store/SettingsStore.ts` (new setting), E2E fixture
  `packages/client/__tests__/fixtures/base.ts`, spec
  `packages/client/__tests__/private-rooms-hidden.spec.ts` (replaced by a
  setting-off spec).
- SDK: `packages/sdk/src/app/(private)` layout reads the setting.
- Server (`../server`): a portal setting for private-room availability
  exposed in the settings payload; builds on the availability rule from
  `private-rooms-server-hardening`.
- Docs: `docs/private-rooms/` compliance and positioning pack, release notes.

## Out of scope

- Any functional change to private rooms themselves.
- Marketing copy beyond the "no zero-knowledge claim" rule from the stashed
  positioning audit.

## Decisions needed

1. Launch scope: individuals/SMB (prerequisite 4 without recovery and
   offboarding) or B2B (with them). The stashed V1 plan allowed the former
   with an explicit note in the release notes.
2. Default of the server-side setting on upgrade: on for every portal, or
   off until an administrator enables it. Recommendation: off for existing
   portals, on for new ones, so administrators opt in consciously.
