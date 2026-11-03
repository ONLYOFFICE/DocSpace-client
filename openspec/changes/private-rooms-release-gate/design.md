# Design

## Context

See proposal.md. After `private-rooms-beta-release`:
- the browser-local opt-in is gone and the Private section is shown to every
  user;
- the E2E rooms app is the only switch, on standalone portals; SaaS has none;
- two surfaces carry the beta label: the Private sidebar item
  (`packages/client/src/components/ClientArticleSidebar`) and the Keys
  management tab (`packages/client/src/pages/Profile/Section/Body/index.tsx`,
  through the tab's `badge` slot).

Both show the shared Beta badge with the title Common:PrivateRoomsBetaTitle
and the text Common:PrivateRoomsBetaDescription. The release-specific work
left here is the portal setting, removing that label and publishing the
documents. The prerequisites are evidence from other changes, from the server
and from the Document Server team.

History: until 2026-11-03 this change carried the server setting and the
removal of the browser opt-in. The first revision moved both to
`private-rooms-beta-release`. The owner then shipped the beta without a
setting, because none would reach the release, and the setting came back
here. The removal of the browser opt-in stays with the beta.

The stashed `V1_RELEASE_PROGRESS.md` ("Final QA before B2B announce") and
`SDK_PRIVATE_PLAN.md` §19 ("Acceptance criteria before GA") are the only
release checklists the feature ever had. Both are unticked for the pentest,
accessibility and backend items, and are folded into the prerequisites in
proposal.md.

## Goals / Non-Goals

**Goals:**
- The prerequisites of general availability are visible as unchecked tasks
  until done.
- One switch an administrator controls, on SaaS and standalone alike.
- No beta label is left once they hold.

**Non-Goals:**
- Changing any private-room behaviour.

## Decisions

1. **The beta label goes in one commit.** The two surfaces share
   Common:PrivateRoomsBetaTitle and Common:PrivateRoomsBetaDescription, and
   the locale tests refuse an English key that no code uses. So the badges
   and the keys are removed together, in every language.
   - *Alternative:* remove them surface by surface.
   - *Why not:* every step but the last would leave the keys half-used, and the last step would carry the locale deletion anyway.

2. **The release documents stay in this change.** The beta has its own notes
   (`private-rooms-beta-release` 5.1). The general-availability notes replace
   them, list every accepted limitation, and drop the beta-only known issues
   that the prerequisites closed.

3. **The setting sits on top of the E2E rooms app, and an absent field means
   on.** Standalone administrators keep the app they used during the beta. A
   server without the field is one that predates the setting, and it ran the
   beta with the section shown, so the client keeps showing it there.
   - *Alternative:* an absent field means off.
   - *Why not:* a client upgraded before its server would hide private rooms that users already rely on.

4. **The keys routes keep the guard of the beta.** It already renders the page
   while the section is available or the user holds a key; reading the
   setting changes only what "available" means.

## Risks / Trade-offs

- **Prerequisite changes are archived but regressions are found later.** →
  The portal setting is the kill switch. Turning it off hides creation while
  leaving data reachable.
- **The badge removal changes the sidebar screenshots once more.** →
  Regenerate them in the same task as the E2E update, and announce it to the
  teams that merge into the release branch.
- **The setting's default hides the section on upgraded portals.** → Proposal
  decision 3, taken with product and the server team before the setting
  lands.

## Migration Plan

1. Tick the gate criteria as their evidence arrives.
2. Once the server setting has merged, read its JSON name in `../server`
   through CodeGraph, add it to the settings type and the MSW handler, then
   land the client and SDK reads and the administrator control.
3. Remove the beta label, its texts and its E2E assertions in one client PR.
4. Publish the release notes and the compliance pack.
5. Rollback: revert the client PR, which brings the beta label back. The
   setting does nothing without the client reads.

## Open Questions

- Proposal decision 2: whether frames and the SDK keep the host opt-in at
  general availability. Owner: feature owner. If they drop it, this change
  gains a feature-gating delta and a task for the SDK opt-in helpers.
