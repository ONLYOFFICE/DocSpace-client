# Design

## Context

See proposal.md. The opt-in lives in `packages/shared/utils/privateRooms.ts`
(`isPrivateRoomsEnabled`, presence flag; `applyPrivateRoomsOptInFromUrl` sets
it from a `?privateRooms=` URL parameter, which the SDK's keys-management
link adds). The client's main gate is `AppsStore.isPrivateRoomsSectionAvailable`
(`packages/client/src/store/AppsStore.ts`), which combines the flag with the
frame opt-in `frameConfig.privateRooms` and feeds the create-room chooser,
the protected app routes and the files store; the unreleased-apps map
(`packages/client/src/helpers/disabled-apps.ts`), the route tables
(`packages/client/src/routes/general.js`) and the profile tabs
(`packages/client/src/pages/Profile/Section/Body/index.tsx`) read the flag
directly. The SDK private routes are gated by the host opt-in since
`private-rooms-sdk-gating-and-parity` (archived 2026-10-28): the frame
property `privateRooms` (`packages/shared/types/Frame.ts`) is read in
`(private)/_utils/private-rooms-opt-in.ts`, `_components/opt-in`, the
layout, the page guards, `usePrivateRoute` and `usePrivateFrameBridge`. The
E2E base fixture sets the flag for every page
(`packages/client/__tests__/fixtures/base.ts`), `private-rooms-section.spec.ts`
sets it too, `AppsStore.installed.test.ts` writes the raw `"privateRooms"`
key, and `private-rooms-hidden.spec.ts` asserts the hidden state. The server
has no availability rule yet; the rule itself is
specified in `private-rooms-server-hardening` and this change only adds the
administrator-facing setting on top of it.

The stashed `V1_RELEASE_PROGRESS.md` ("Final QA before B2B announce") and
`SDK_PRIVATE_PLAN.md` §19 ("Acceptance criteria before GA") are the only
release checklists the feature ever had; both are unticked for pentest,
accessibility and backend items and are folded into the prerequisites in
proposal.md.

## Goals / Non-Goals

**Goals:**
- One switch, controlled by administrators, evaluated on the server.
- No code path left that depends on browser storage for availability.
- The release prerequisites are visible as unchecked tasks until done.

**Non-Goals:**
- Changing any private-room behaviour.
- Per-user or per-group availability (a later change if product asks).

## Decisions

1. **Server-side setting instead of deleting the gate outright.** A
   big-bang removal would leave administrators no way to keep private rooms
   off a portal (compliance or support reasons). The setting rides on the
   availability rule from `private-rooms-server-hardening`, so creation is
   refused server-side, not just hidden. Alternative: edition-only gating;
   rejected because product has not decided an edition rule.

2. **Default off for upgraded portals, on for new portals.** Upgraded
   portals get the feature only when an administrator enables it, which
   doubles as the staged rollout. Alternative: on everywhere; rejected until
   the pentest summary is published. Product may override (decision in the
   proposal).

3. **Keys management stays reachable when the setting is off and the user
   has keys.** Otherwise a user with existing private rooms could not unlock,
   export or reset keys after an administrator turns the feature off.

4. **The E2E fixture stops setting the flag; the MSW settings payload
   carries the setting.** Keeps every existing private-room spec green with
   the default payload and makes the off state a normal mocked variant.

## Risks / Trade-offs

- [Prerequisite changes archived but regressions found later] → the setting
  is the kill switch; turning it off hides creation while leaving data
  reachable.
- [Testers lose the console toggle] → the setting is exposed in the
  management settings; documentation in `.claude/rules/private-rooms.md` is
  updated in the same change.
- [SDK hosts that embedded `/sdk/private` while hidden] → they keep working
  when the setting is on; with it off they see the empty state, which is the
  intended behaviour.

## Migration Plan

1. Land the server setting (default per decision 2) with the settings
   payload field.
2. Land the client and SDK reads with a presence check: a server without the
   field behaves as "on" to avoid a dark period for testers.
3. Delete the localStorage helper, the unreleased-app entry, the route
   gating and the hidden-surfaces spec in one PR.
4. Publish release notes and the compliance pack.
5. Rollback: revert the client PR; the server setting is harmless on its own.

## Open Questions

- Where the setting is surfaced in the management UI (security section or
  rooms section). Owner: product design. Does not change the specs.
- Whether the frame property `privateRooms` stays once the server setting
  exists, as a host's way to hide the private surface on a portal that
  allows it, or goes with the browser flag. Owner: feature owner. Decides
  task 3.3 and the fate of "Client in an embedded frame takes the host
  opt-in".
