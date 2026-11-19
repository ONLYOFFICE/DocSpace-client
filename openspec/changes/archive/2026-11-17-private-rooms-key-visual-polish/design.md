# Design

## Context

See proposal.md for the motivation. What shapes the approach:

- The comparison of 2026-11-17 was made on three sources: the designers'
  stand as captured on 2026-11-16 (its client bundle was the same on
  2026-11-17), the release build of 2026-11-17 on a local stand, and the same
  build served to Playwright with the mocked backend, in the light theme, the
  dark theme and at 390 px.
- No stashed design document covers the look of these screens; the concept
  is the only reference, and the main specs win where they disagree with it.
- No server contract is touched.
- The indicator is the kit's `Button` of the extra small size with an icon
  (`KeyStateIndicator.tsx`). The main spec forbids telling the state by
  colour or icon alone; the text stays.
- The recovery phrase is an ordered list in a grid of
  `repeat(auto-fill, minmax(120px, 1fr))` with the numbers as generated
  content, so that a selection holds the words alone
  (`RecoveryPhraseContent.tsx`, `RecoveryPhraseDisplayModal.module.scss`).
  In the dialog of 400 px that grid gives two columns.
- The key setup dialog is the kit's `ModalDialog` at its default width of
  400 px; `isLarge` gives 520 px. On a phone it is an aside panel.
- The question on close is the shared `UnsavedChangesDialog`, used by four
  key dialogs and by two panels outside private rooms. It takes a
  `description` and has fixed labels.
- The mark is drawn by the kit's selector item (`components/selector`,
  `.itemMark`): a `Text` of 12 px in `--selector-body-description-text`,
  placed after the label block, with a tooltip tied to it as a description.
- Keys management already draws Common:NoKey as the kit's `Badge` with the
  colours of `keyStatusBadgeColors.ts`.
- The hex colour check of the pre-push gate allows no colour literal outside
  a `themes` path; colours come from kit tokens.

## Goals / Non-Goals

**Goals:**

- The five places look as the concept draws them, within the main specs.
- Every new colour pair is measured in both themes by a Playwright case, the
  way the earlier contrast fixes are.

**Non-Goals:**

- A new kit component. The pill and the tiles are styles of the page; only
  the mark needs the kit, because the row is the kit's.
- Pixel parity with the designers' stand, whose accent colour and build
  differ from the release.

## Decisions

1. **The pill is a style of the existing button, not a new element.** The
   indicator keeps the kit's `Button`, its test id, its focus ring and its
   keyboard behaviour; the page adds a class with a full radius and, per
   state, a background, a border and a text colour taken from the kit's
   status tokens (positive for unlocked, warning for locked) in a tint that
   keeps the text at 4.5:1. If the kit's button does not let the page set
   these through a class, the indicator becomes a native `button` with the
   same attributes; a kit variant was rejected as too much for one use.
2. **Tiles keep the ordered list and the generated numbers.** The list stays
   an `ol` with `li` items, so the order and the count are still read aloud
   and a hand selection still copies the words alone. Only the grid changes:
   four fixed columns, two under the phone breakpoint the dialog already
   switches at, each `li` a tile with its own background and radius, the
   number before the word. Tiles built from `div`s with the number as text
   were rejected: they would put the numbers into a copied selection.
3. **The whole key setup dialog is 520 px wide on a wide screen**
   (`isLarge`), not only its last step. Four tiles need about 110 px each for
   an eight-letter word in the monospace face at 13 px with its number; 400 px
   leaves 86. Widening one step alone would make the dialog jump between
   steps. The rules tooltip of the passphrase step opens beside the dialog
   and needs 320 px there; on a screen too narrow for both, the kit already
   places it below the field.
4. **The save actions stay three buttons of the same size and kind**, each
   with an icon, in the flex row that already wraps. The concept draws copy
   as a link; the main spec asks for three actions of equal weight, so it is
   not followed there. Download and copy have icons of 16 px in
   `public/images/icons/16`; print takes an existing printer icon if the
   repository has one, otherwise a new one is added from design.
5. **Explanation icons are decoration of 16 px in a tinted square of 32 px**,
   before each term: a key, the padlock the indicator uses, and a restore
   arrow. They are `aria-hidden`; the `dl` structure stays.
6. **The fingerprint is laid out as a grid of groups**, four columns, two
   under the width where four do not fit, instead of free wrapping. The
   groups stay separate `span`s with a space between them, so a copied
   fingerprint is unchanged.
7. **`UnsavedChangesDialog` takes an optional title and an optional label of
   its confirming action**, next to the `description` it already takes. Key
   setup passes Common:KeySetupDiscardTitle ("Close key setup?") and
   Common:KeySetupDiscardConfirm ("Close setup"); every other caller passes
   nothing and is unchanged. Rewording Common:UnsavedChanges or
   Common:CloseMenu was rejected: both are used outside private rooms.
8. **The kit's selector draws the mark as its `Badge` inside the label
   block**, after the label, in place of the `Text` after the block. The mark
   object gains nothing: the selector picks the look, so the client's
   `getRoomCandidateKeys` wiring is untouched. The badge takes the kit's
   warning pair with a text contrast of 4.5:1 in both themes; the tooltip and
   its `aria-describedby` stay on the badge. The label keeps `truncate`, the
   badge does not shrink.

## Implementation notes

What the implementation settled differently from the decisions above, with
the reason:

- Decision 1: the kit's button reads its background and border from custom
  properties, so the pill sets those on the button through a class and no
  native button was needed. The tint is the status colour mixed into the
  page background (14% in the light theme, 22% in the dark one) with a
  border of the status colour; the text and the icon keep the main text
  colour, which gives about 11:1 on either tint.
- Decision 4: no printer icon existed in `public/images`; a 16 px one was
  added as `icons/16/print.react.svg`, drawn in the style of the set and
  open to replacement by design. The buttons of the row take 12 px of side
  padding instead of the small button's 28 px, which is what lets the three
  English labels share one row at 520 px.
- Decision 6: free wrapping under a width in `ch` could not be used. The
  fingerprint is set in "Roboto Mono" with a `monospace` fallback, and
  where the face is not loaded the groups differ in width, so a width in
  characters broke the line after the third group. The groups are instead
  nested in lines of four and halves of two: a line is a block, a half does
  not wrap inside. A handler puts the eight groups on one line into a copied
  selection, since the blocks would otherwise add a line break to it.
- Decision 8: the people selector draws its rows through the selector's
  custom row renderer, which the mark stood outside of. The selector now
  hands the badge with its tooltip to that renderer as its last argument,
  and the people selector places it on the line of the name; a row without
  a custom renderer gets it after the label, inside the label block.
- Task 2.2 asked for the long-label case in the locale with the longest
  labels. It is checked at 390 px in English instead, where the three labels
  already do not fit one row, which exercises the same wrapping.

## Risks / Trade-offs

- [The tint of a status token gives less than 4.5:1 for the text in one
  theme] → the Playwright case of each colour pair fails the task; the text
  colour is then the theme's main text colour on the tint.
- [A wider dialog leaves no room for the rules tooltip beside it on screens
  between 520 and about 1200 px] → the existing bounding-box cases "Rules
  shown while typing" and "Narrow screen" are rerun at 1024 px as well.
- [Translated labels of the save actions do not fit one row] → the row wraps;
  the spec allows it and a case at the longest locale label checks no cut.
- [The kit pack moves the mark for every user of the selector's mark] → the
  invite panel of a private room is its only user today (checked 2026-11-17
  in the client; the kit's own stories are updated with it).
- [Screenshots of the key dialogs, Keys management and the people list all
  change] → updated under Docker in the task that changes each screen, never
  from a local run.

## Verification (task 7.1)

Run on 2026-11-17 on `release/v4.1.0` at d0b0a035e13, with the kit pack
built from `docspace-ui-kit-react` `release/v4.1.0` at 71700b29:

- Client Playwright under Docker (`tests-local` on an image rebuilt for the
  pack): the private-room specs (`private-room-*.spec.ts`,
  `private-rooms-app-off.spec.ts`, `private-rooms-section.spec.ts`), the
  keys-management specs (`keys-management.spec.ts`,
  `keys-management-advanced.spec.ts`, `key-flow-edge-cases.spec.ts`) and
  `encrypted-file-ui.spec.ts`: 217 passed, none failed. Four screenshots
  changed: the two desktop ones of the passphrase step and the two of the
  marked people list.
- SDK private suite (`__tests__/e2e/private`) on a build made with
  `pnpm run test:build`: 36 passed, 14 skipped (the `fixme` cases of
  `private-security.spec.ts`).
- Pre-push gate: `npm --prefix ./common/tests run test:lefthook` with 61
  passed and 3 skipped, then `nx run-many -t tsc lint test` over the six
  packages: green.
- `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`: 22 passed.
- The kit's own unit suite at 71700b29: 3355 passed.

Not run: the doceditor's `private-room-editor.spec.ts`, which this change
does not reach beyond the shared dialogs the SDK suite already opens.

The full locale suite (`test/locales.test.js`), which the pre-push gate
skips, fails on six Common keys of the AI workspace that are absent from
every language but English. They were absent before this change; its own
two keys are present in all 31 languages.
