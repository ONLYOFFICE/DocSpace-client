# Design

## Context

See proposal.md. After `private-rooms-beta-release`:
- a portal setting decides availability;
- the browser-local opt-in is gone;
- three surfaces carry the beta label: the Private sidebar item
  (`packages/client/src/components/ClientArticleSidebar`), the Keys
  management tab (`packages/client/src/pages/Profile/Section/Body/index.tsx`,
  through the tab's `badge` slot) and the administrator control for the
  setting.

All three show the shared Beta badge with the text
Common:PrivateRoomsBetaDescription. The release-specific work left here is
removing that label and publishing the documents. The prerequisites are
evidence from other changes, from the server and from the Document Server
team.

Until 2026-11-03 this change also carried the server setting and the removal
of the browser opt-in, with their design decisions:
- setting instead of deleting the gate;
- default off on upgraded portals;
- Keys management reachable for key holders;
- the E2E fixture reading the setting.

Those decisions now live in `private-rooms-beta-release` (proposal decisions
1 and 2, design decisions 1, 3 and 7).

The stashed `V1_RELEASE_PROGRESS.md` ("Final QA before B2B announce") and
`SDK_PRIVATE_PLAN.md` §19 ("Acceptance criteria before GA") are the only
release checklists the feature ever had. Both are unticked for the pentest,
accessibility and backend items, and are folded into the prerequisites in
proposal.md.

## Goals / Non-Goals

**Goals:**
- The prerequisites of general availability are visible as unchecked tasks
  until done.
- No beta label is left once they hold.

**Non-Goals:**
- Changing any private-room behaviour.
- Changing the setting or its default.

## Decisions

1. **The beta label goes in one commit.** The three surfaces share
   Common:PrivateRoomsBetaDescription, and the locale tests refuse an English
   key that no code uses. So the badges and the key are removed together, in
   every language.
   - *Alternative:* remove them surface by surface.
   - *Why not:* every step but the last would leave the key half-used, and the last step would carry the locale deletion anyway.

2. **The release documents stay in this change.** The beta has its own notes
   (`private-rooms-beta-release` 5.1). The general-availability notes replace
   them, list every accepted limitation, and drop the beta-only known issues
   that the prerequisites closed.

## Risks / Trade-offs

- **Prerequisite changes are archived but regressions are found later.** →
  The portal setting from the beta is the kill switch. Turning it off hides
  creation while leaving data reachable.
- **The badge removal changes the sidebar screenshots once more.** →
  Regenerate them in the same task as the E2E update, and announce it to the
  teams that merge into the release branch.

## Migration Plan

1. Tick the gate criteria as their evidence arrives.
2. Remove the beta label, its text and its E2E assertions in one client PR.
3. Publish the release notes and the compliance pack.
4. Rollback: revert the client PR, which brings the beta label back. Nothing
   on the server depends on it.

## Open Questions

- Proposal decision 2: whether frames and the SDK keep the host opt-in at
  general availability. Owner: feature owner. If they drop it, this change
  gains a feature-gating delta and a task for the SDK opt-in helpers.
