# Proposal

## Why

The parts of the designers' UX concept accepted on 2026-11-17 reached the
release the same day (`private-rooms-key-ux-refresh`,
`private-rooms-release-ux-fixes`). A comparison of that build with the
designers' stand, screen by screen, shows that the behaviour arrived and the
look did not: five places still draw the accepted part more plainly than the
concept does, and two of them read worse for it.

What the comparison saw:

- The key state indicator is a neutral rectangular button, the same in both
  states; the concept draws a rounded pill whose colour follows the state.
- The recovery phrase step lists the 24 words in two columns, which makes the
  dialog 835 px tall, and stacks its three save actions in two rows without
  icons; the concept shows compact numbered tiles four in a row and the
  actions in one row with icons.
- The explanation step of key setup is three paragraphs of text; the concept
  puts an icon before each of the three terms.
- In Keys management the fingerprint of eight groups wraps as seven and one.
- The question asked when key setup is closed on a later step is titled
  Common:UnsavedChanges and confirmed with Common:CloseMenu, the labels of
  the general dialog, neither of which names key setup.
- In the people list of the invite panel the mark of a person without a key
  is grey text beside the checkbox, drawn like the "Invited" note of the same
  list; in the dark theme it measures 3.42:1. The concept draws a badge next
  to the name.

## What Changes

- The key state indicator is drawn as a rounded pill coloured by the state of
  the key. The text and the padlock stay as they are, the same icon in both
  states.
- The recovery phrase is shown as numbered tiles, four in a row on a wide
  screen and two on a phone, and each of its three save actions carries an
  icon. The key setup dialog becomes wider on a wide screen to hold them.
- Each of the three terms of the explanation step is preceded by an icon.
- The fingerprint in Keys management breaks into lines of four groups.
- The question asked when key setup is closed is titled and confirmed with
  labels that name key setup.
- The mark of a person without a key in the invite panel is drawn as a badge
  next to the name, with a text contrast of at least 4.5:1 in both themes.

Out of scope:

- Any change of behaviour: what the indicator opens, when the recovery phrase
  may be acknowledged, who can be selected in the invite panel.
- A different padlock for each state of the key. The owner decided on
  2026-11-17 that the icon is the same in both and the text tells the state.
- The layout of the locked-key block. The owner decided on 2026-11-17 that
  it stands above the file list; the concept centres it over a blurred list.
- The "Important" notes and the passphrase tick of the concept's passphrase
  step, the red style of the delete action, the split of Keys management into
  two tabs, and everything the earlier changes left out of scope.
- The labels of the close question in the other key dialogs (passphrase
  change, recovery input, the standalone recovery display). They keep
  Common:UnsavedChanges and Common:CloseMenu.
- The SDK's own pages. The shared dialogs reach the SDK as they are.

Dependencies:

- `docspace-ui-kit-react`, on its `release/v4.1.0`: the people selector draws
  the mark of an item as a badge next to the label. A kit pack is adopted
  here.
- No work on `../server` or the Document Server.

## Decisions

Decided by the owner on 2026-11-17:

1. All five parts of the comparison are taken, in one change.
2. The mark of a missing key becomes a badge next to the name. Keeping the
   text beside the checkbox and only raising its contrast was the
   alternative.

No decision is open. The exact colours, icons and sizes are left to the
implementation within the limits the specs set (design.md).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the look of the key state indicator, of the
  recovery phrase and of the explanation step, the lines of the fingerprint,
  and the labels of the question that closes key setup.
- `private-rooms/room-membership`: the place and the contrast of the mark of
  a person without a key.

## Impact

- `packages/client/src/pages/Home/Section/Header/sub-components/KeyStateIndicator.tsx`:
  the pill.
- `packages/shared/dialogs/key-generation`: the tiles and the icons of the
  recovery phrase, the icons of the explanation, the width of the dialog, the
  labels passed to the close question.
- `packages/shared/dialogs/unsaved-changes-dialog`: optional labels.
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`:
  the lines of the fingerprint.
- `docspace-ui-kit-react` `components/selector`: the mark as a badge; a new
  kit pack adopted here.
- `public/locales`: two new Common keys, in every language.
- `public/images/icons`: icons for the explanation step and the print action,
  if no existing icon fits.
- Playwright screenshots of the key setup dialog, the Keys management page
  and the people list of the invite panel change.
