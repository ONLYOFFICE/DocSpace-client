# Proposal

## Why

Criterion 1.10 of `private-rooms-release-gate` asks for an accessibility pass
on the private-room panels: the invite panel and the Members view. No change
covers them. `private-rooms-ux-gaps` and its follow-ups did the key dialogs
only (`key-management`, "Key dialogs are accessible and adapt to narrow
screens" and the two focus requirements). The owner decided on 2026-11-12 to
do the pass before launch.

A first read of the code, with nothing run under a screen reader yet, shows
where the private-room parts of the two panels fall short:

- The invitation result replaces the invitee list inside the panel after the
  re-encryption. Nothing announces it and the focus stays where it was, on a
  button that is no longer there.
- The pending-access marker of a member is a text joined to its retry action
  by a drawn bar, and the retry action is an action link, not a button.
- The re-encryption progress goes to the operations indicator of the page.
  Whether its value, its end and its failure reach assistive technology is
  not known.
- The invitee rows carry icon-only controls (remove, the warning of an
  invitee without a key) whose accessible names are not known.

## What Changes

- The invite panel, as it opens for a private room, is operable from the
  keyboard alone and its controls carry accessible names.
- The invitation result takes the focus when it is shown and is exposed as
  one named region, with the granted, pending, refused and skipped groups
  each named.
- The re-encryption progress is exposed with a name and a value, and its end
  is announced once: done, done with files left out, or failed.
- The pending-access marker and its retry action in the Members view are
  exposed to assistive technology: the marker as the member's state, the
  retry as a button named after the member, busy while it runs.
- The member rows of a private room are operable from the keyboard: the role
  list and the removal it holds.
- The SDK's private pages get the same, where they render their own copies of
  these parts.

Out of scope:

- The key dialogs, the keys-management page, the Private list, the locked-key
  bar and the editor page.
- The panels of rooms that are not private, except where a fix lands in a
  component both share; such a fix is not held back.
- Colour contrast and zoom, unless the audit of task 1.1 finds a private-room
  element that fails them.
- Any change to what the panels do or say: no new texts on screen, only names
  for assistive technology.

No work on `../server` or the Document Server is needed.

## Decisions needed

1. How the result is checked. Proposed: keyboard-driven Playwright cases and
   assertions on accessible roles and names, as `private-rooms-ux-gaps` did,
   plus one manual pass with a screen reader recorded in design.md. The
   alternative is to add `@axe-core/playwright` as a dev dependency and run
   it over the two panels; it finds more, and it is a new dependency of the
   repository.
2. Fixes in `docspace-ui-kit-react`. The panels are built from kit components
   (the action link, the help button, the role list, the modal dialog). Where
   the fault is in one of them the fix goes to the kit's `release/v4.1.0`, as
   the owner decided for this release on 2026-11-12, and the client takes a
   new kit build.
3. Whether the SDK's private pages are in. Proposed: yes, since they render
   their own members view and invite flow and criterion 1.10 names the
   panels, not the application.

Decided by the owner on 2026-11-12: (1) without axe, keyboard-driven cases
and one manual pass with a screen reader; (2) kit faults are fixed in the
kit's `release/v4.1.0`; (3) the SDK's private pages are in.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: six requirements added on the keyboard
  operation and accessible names of the invite panel, the invitation result,
  the re-encryption progress, the pending-access marker and the member rows.

## Impact

- Client: `packages/client/src/components/panels/InvitePanel` (the panel, its
  result and its invitee rows), `packages/client/src/pages/Home/InfoPanel/Body/views/Members`,
  the operations indicator that shows the re-encryption progress.
- Shared: `packages/shared/components/share/sub-components/User.tsx` (the
  pending-access marker and its retry).
- SDK: `packages/sdk/src/app/(private)/_components/members` and the invite
  panel of `packages/sdk/src/app/(rooms)/_components/invite-panel`.
- ui-kit (`docspace-ui-kit-react`): only if the audit traces a fault to a kit
  component.
- Locales: new keys for accessible names, in every supported language.
- Tests: `packages/client/__tests__/private-room-invite.spec.ts`,
  `packages/client/__tests__/private-room-members.spec.ts`, the SDK's
  `__tests__/e2e/private`, and unit tests next to the changed components.
- `private-rooms-release-gate`: criterion 1.10 is ticked when this change is
  archived.
