# Design

## Context

See proposal.md for the motivation and the texts. No stashed design
document covers any of this; the gate of the recovery dialog and the
"forgot" link rule come from commits older than OpenSpec. Nothing here
depends on server behaviour, and no mock handler changes.

As read on 2026-11-13 (branch `release/v4.1.0`, b58307d9500):

- `PassphraseModal.tsx`: the "Generate" link calls the imperative
  `onGeneratePassword` of the first `PasswordInput`; the value comes back
  through that input's `onChange`, which sets the passphrase only. The
  confirmation has its own state.
- `RecoveryPhraseDisplayModal.tsx`: `hasSaved` is set by the copy, print
  and download handlers only; the checkbox is disabled while it is false
  and Common:RecoveryPhraseSaveFirst is shown. The words are one text
  node, `words.join(" ")`, in a box with `user-select: all`. Print is a
  primary full-width button, the other two are secondary. The copy action
  writes the mnemonic string, not the DOM. `recovery-kit.ts` prints the
  words the same way, in a `dir="ltr"` block.
- `KeyRotationDialog.tsx`: Common:PassphraseMustBeDifferent is computed
  only after `attemptedSubmit`, which only a submit sets, and the submit
  is disabled while the two passphrases are equal. The new-passphrase
  input is the one field without `simpleView` and without `isFullWidth`,
  so the kit lays it out at the width of its content.
- `KeysList.tsx` passes `globalColors.secondGreen` and
  `globalColors.mainOrange` as the badge background; the kit badge draws
  white text when no `color` is given, in both themes.
- `getRoomTypeName(roomType, t)` in `helpers/filesUtils.js` takes the
  type alone. A private room has type Custom and `private: true`
  (room-membership, "Private room is a flagged Custom room"), so the four
  callers (table type cell, row content, tile, info panel details) print
  Common:CustomRooms.
- `EmptyViewContainer.tsx` returns `EmptyPrivateRoomView` whenever
  `isPrivacyFolder` is true, and that getter is true for every folder on
  a private path (file-operations, "Private-room rules follow the room
  into Archive"). The view has no notion of root or folder. The SDK
  renders the shared copy from its docs layout.
- `InvitePanel/index.js`: when nobody was granted, it raises the notices
  of `skippedMemberNotices` as toasts and then sets the invite outcome,
  which swaps the form for `InviteResult`. `skippedMemberNotices` builds
  its no-key sentence from Common:EncryptedSkippedNoKeys and is also used
  after the grant, for members the wrap had to leave out; there the
  sentence is right. The SDK hook `usePrivateInviteFlow` does the same.
- The open change `private-rooms-members-accessibility` made
  `InviteResult` a named region that takes the focus. It does not touch
  the invite form.

## Goals / Non-Goals

**Goals:**

- Each of the ten remarks is closed with the smallest change at the
  place that renders it.
- Client and SDK stay alike where they share a text or a component.

**Non-Goals:**

- A fix inside the ui-kit repository (badge, password input).
- A new layout of the key dialogs beyond the recovery list, the divider
  and the spacing.
- Any change to which invitees are skipped or refused, or to the wrap.

## Decisions

1. **Generate fills the confirmation in the consumer.** `PassphraseModal`
   marks that a generation was requested and copies the next value the
   input reports into the confirmation as well. The kit is not changed.
   Alternative: generate in `PassphraseModal` itself. Rejected: it would
   duplicate the kit's rule set and its switch of the field to readable
   text.
2. **The recovery words are an ordered list.** One `<ol>` with 24 `<li>`,
   laid out as a grid, `dir="ltr"`. The numbers are list markers, so they
   are neither in the text content of the box nor in a manual selection:
   the E2E helpers that split the box on whitespace keep reading 24
   words, and "Numbers stay out of the copy" holds without extra code.
   `recovery-kit.ts` emits the same list. Alternative: numbers as text in
   each cell. Rejected for both reasons above.
3. **The save gate is removed, not replaced.** `hasSaved`,
   Common:RecoveryPhraseSaveFirst and the disabled state of the checkbox
   go; the close guard ("Recovery phrase not yet acknowledged") is
   untouched. The three save actions become secondary buttons in one row
   that wraps on a narrow screen.
4. **The equal-passphrase error does not wait for a submit.** It is shown
   as soon as both fields hold the same non-empty text, with the mark,
   the attached text and the announcement the other field errors of that
   dialog already have. Common:PassphraseTooShort stays behind
   `attemptedSubmit`; the composition tooltip covers that case.
5. **Badge colours are token pairs chosen by contrast.** `KeysList`
   passes a background and a text colour from `globalColors` for each
   badge and each theme; a unit test computes the contrast of every pair
   and fails under 4.5:1. No hex literal is written (`colors.test.js`).
   Alternative: fix the default text colour in the kit badge. Rejected:
   another repository and every other badge of the product.
6. **The type label is decided before the label helper is called.** One
   helper takes the room (type and private flag) and returns
   Common:PrivateRoomType for a private room, the old label otherwise;
   the four callers use it. The tile gets the mapped label, since the kit
   tile calls its `getRoomTypeName` prop with the type alone. The column
   stays: Archive holds both kinds, and the AI section's way of dropping
   the column needs a storage key of its own.
7. **The empty folder is a mode of the private view.** `EmptyPrivateRoomView`
   (client and shared copy) learns whether the open folder is the room
   root. Below the root it takes the title and illustration of the
   standard empty folder, drops the property list and describes its
   entries with Common:PrivateRoomFolderEmptyDescription; the entries
   themselves are the ones it builds today, so the key and create-right
   rules stay in one place. Alternative: route folders to the standard
   empty folder view. Rejected: its tiles ignore the key state and offer
   neither folder creation nor upload, which breaks "Create new file in a
   private room", scenario "No keys".
8. **The welcome lines get existing icons.** Lock, key, people and
   restore from `public/images/icons/16`, one per line, in the client
   view and the shared copy (proposal, decision 3).
9. **A pre-grant skip for want of a key is worded as "not invited".**
   The panel uses Common:EncryptedInviteNoKey for it, the text the result
   already uses for a 403. Common:EncryptedSkippedNoKeys keeps its text
   and stays for a member left out by the wrap after the grant.
   Alternative: reword Common:EncryptedSkippedNoKeys. Rejected: it would
   then be wrong after the grant.
10. **Nobody invited: the form stays.** The send handler does not set an
    outcome when nobody was granted; it keeps the invitees and sets the
    notices to show above the list, in a block that is announced
    (`role="status"`). The block is cleared when the list changes or the
    next send starts. "Invite again" is then the ordinary send button.
11. **Toasts only when the panel cannot show the outcome.** While the
    panel is open, the notices go to the form block or to `InviteResult`.
    The existing guard that compares the send run tells when the panel
    was closed or reused during the wrap; only then are the notices
    raised as toasts, as today.
12. **Translation is one pass after approval**, as in
    `2026-11-11-private-rooms-text-fixes`: comments refreshed, 31
    languages retranslated from the approved English, `translate-stale`
    run. Common:RecoveryPhraseSaveFirst is deleted from the 32 files and
    `.meta`.

## Risks / Trade-offs

- [A generated passphrase can be confirmed without being read] → The
  field shows it as readable text, the reworded Common:CreatePassphraseHint
  tells the user to keep it, and the recovery phrase restores access. A
  copy action in that dialog belongs to the stage-2 setup design.
- [The quality of the kit's generator is not known] → It was reported,
  not read, that it draws from `Math.random` and stops at the minimum
  length. Task 1.1 reads the kit source and records the finding; a fix
  is a ui-kit change and is not made here.
- [Tests, fixtures and screenshots assert on today's shapes] → Each task
  names the ones it changes: the disabled acknowledgement
  (`keys-management.spec.ts`), locators by "Generate new key" and
  "Invalid passphrase", `passphrase-create.png` and the recovery dialog
  screenshots, the unit tests of the empty view and the invite panel.
- [The form block is not the focused region the result is] → It is
  announced through its role; the focus stays where the user was, on the
  send button, which is the next thing they need.
- [Thirteen texts in 31 languages without native review] → Recorded as
  open, as for the earlier changes.

## Open Questions

- Whether the designers send icons and badge colours of their own
  (proposal, decisions 3 and 4). The change does not wait for them.
