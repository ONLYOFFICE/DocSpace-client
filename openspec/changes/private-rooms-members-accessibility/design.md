# Design

## Context

No stashed design document covers the accessibility of these panels. The
model is the work on the key dialogs: `key-management`, "Key dialogs are
accessible and adapt to narrow screens", "Key dialogs take the focus when
they open" and "Key dialogs return the focus when they close", done by
`private-rooms-ux-gaps` and its follow-ups and checked by keyboard-driven
Playwright cases.

What the code has today, read on 2026-11-12 and not yet run under a screen
reader:

| Part | Where | Observed |
|------|-------|----------|
| Invite panel shell | `packages/client/src/components/panels/InvitePanel/index.js` | A kit modal dialog shown as an aside; its header becomes `Common:EncryptedInviteResultTitle` when the result is shown |
| Invitation result | `InvitePanel/sub-components/InviteResult.js` | Plain sections with headings and texts; no live region, no focus move, sections not named |
| Invitee rows | `InvitePanel/sub-components/Item.js` | Icon-only remove control and a kit help button for warnings; no `aria-*` attribute in the file |
| Invitee search | `InvitePanel/sub-components/InviteInput.js` | A key handler on the field; the list of matches is built by hand |
| Members rows | `packages/shared/components/share/sub-components/User.tsx` | `Common:EncryptedAccessPending` and a drawn " |" in one text, the retry as a kit action link with a click handler, the role list titled `Common:Role` for every member |
| Re-encryption progress | the operations indicator, fed by `setSecondaryProgressBarData` with `OPERATIONS_NAME.roomReencryption` | Not read yet |
| SDK | `packages/sdk/src/app/(private)/_components/members`, `packages/sdk/src/app/(rooms)/_components/invite-panel` | Own copies of the members view and the invite panel |

The server is not involved: the panels read and write what they already do.

## Goals / Non-Goals

**Goals:**

- A user of a keyboard or a screen reader can invite people to a private
  room, read the result, see who is pending, retry, change a role and remove
  a member.
- Every requirement of the delta has a case that fails before the fix.

**Non-Goals:**

- A full audit of the invite panel and the Members view for rooms that are
  not private.
- New visible texts or a new layout.
- Conformance claims (a WCAG level) for the product.

## Decisions

1. **Audit first, in one task, with a fixed list.** Task 1.1 walks six
   surfaces with the keyboard and reads their accessibility tree: the invite
   panel before sending, the invitee row with a warning, the result, the
   operations indicator during a re-encryption, a member row with pending
   access, the removal confirmation. Its findings go into this file as a
   table, and the later tasks fix what the table lists. Alternative: fix from
   the code read above. Rejected: the read does not show what the kit
   components expose.

2. **Names come from i18n keys with the member's name as a variable.** A
   control of one invitee or member is named, for example, "Remove {{name}}"
   through a new Common key. Alternative: `aria-labelledby` pointing at the
   name element. Kept as an option per control where the name element has an
   id already; the result is the same for the requirement.

3. **The result is a region that takes the focus, not a live region.** The
   result replaces the content of an open dialog, so moving the focus to its
   container (focusable, named by the dialog title) makes a screen reader
   read it, and keeps a keyboard user from landing on nothing. A live region
   would read it too, and leave the focus on a removed button.

4. **The end of the re-encryption is announced through the notices the flow
   already raises.** `rewrapForInvitedMembers` and `retryPendingAccess`
   return notices that the callers show as toasts. The audit checks whether
   the kit toast is a status or an alert; if it is, the requirement is met by
   the toast and only the progress indicator needs a name and a value. If it
   is not, the fix is in the kit toast.

5. **The retry is a button.** The kit action link is replaced by a control
   with the button role, or the kit link gains it, whichever the audit shows
   is smaller. The drawn separator leaves the text and becomes decoration.

6. **Kit faults are fixed in the kit.** A fault traced to a kit component is
   fixed in `docspace-ui-kit-react` on `release/v4.1.0`, packed, and taken
   with `pnpm run update-ui-kit`; the test images are rebuilt after it.

7. **Checks are keyboard-driven Playwright cases with role and name
   locators** (`getByRole(..., { name })`), which fail when the role or the
   name is missing. A manual pass with a screen reader on the owner's stand
   is recorded here before the archive. The axe dependency is decision 1 of
   the proposal.

## Risks / Trade-offs

- [The shared member row serves every room] → A change to its markup can
  move screenshots of other rooms' Members view. The task that changes it
  reruns the specs that screenshot it and regenerates only what moved for
  this reason.
- [A kit fix reaches every user of the component] → The kit's own unit tests
  run before the pack; the client gate and the affected E2E specs run after
  `update-ui-kit`.
- [New locale keys in every language] → The translation skills run in the
  task that adds the keys, and the locale tests of the gate catch a missing
  variable.
- [A screen-reader pass depends on one reader] → The record names the reader
  and the browser; the Playwright cases hold the rest.

## Migration Plan

None. The change adds names and focus moves; nothing stored changes.

## Open Questions

- Which screen reader the manual pass uses (NVDA with Chrome is the
  proposal).
- Whether the audit finds faults outside the six surfaces that block the
  flow; they would be added as tasks, not fixed silently.
