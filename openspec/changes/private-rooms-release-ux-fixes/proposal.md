# Proposal

## Why

The UX concept review of 2026-11-17 walked the current release on a live
stand next to the designers' concept. Part of what it found belongs to the
release itself, on screens the concept carried over unchanged. This change
covers those findings that the client can close on its own.

What the review saw:

- While a new passphrase misses a required character the strength line can
  still read "Good", and the list of rules opens over the text of the
  dialog and its generate action.
- A recovery phrase that is not accepted gets one general message that
  names a word-list standard; it does not say how many words were entered
  or which word is not a word of the phrase.
- The Keys management page puts the key id and the algorithm next to the
  fingerprint with the same weight, says nothing about what the fingerprint
  is for, and its labels and action icons are faint in both themes.
- The lines of the invitation result that name who was left out and what
  could not be shared are the faintest text of the panel.
- An encrypted media file that is not shared with the user yet opens with
  the general decryption failure, though the product has a message for that
  case and uses it elsewhere.

## What Changes

- The strength line never shows a passing grade while a rule of the
  passphrase is unmet, and the list of rules no longer covers the dialog.
- The recovery phrase input shows how many words it holds, names a word
  that is not part of any recovery phrase, and speaks without the name of
  the word-list standard.
- The recovery phrase input asks the browser for no input assistance.
- Keys management folds the key id and the algorithm under Details,
  explains what the fingerprint is for, and shows its labels and action
  icons with enough contrast.
- The texts of the invitation result are shown with enough contrast.
- The media viewer reports a file that is not shared with the user yet with
  the same message as the other ways of opening it.

Out of scope:

- A check that the recovery phrase was saved, such as asking for some of its
  words at key setup. The owner decided against it on 2026-11-17: an earlier
  version of the feature asked for words of the phrase and users disliked it.
  The acknowledgement tick stays the only gate, as the main spec describes.
- Inviting a person who has no key and telling them about it. It needs the
  server and is a feature, not a fix.
- A passphrase generator built from words. It changes how strong a
  generated passphrase is and needs the owner of the encryption design.
- The confirmation of deleting a key. It is followed by a passphrase
  confirmation, which is why it does not ask for a typed word as the reset
  does; the review took the two for one kind of action by mistake.
- The actions of a private room while the key is locked. They raise the
  unlock dialog when used, as the main specs describe.
- The SDK's own pages, and anything the concept adds:
  `private-rooms-key-ux-refresh` owns that.

Dependencies:

- No work on `../server` or the Document Server.
- `docspace-ui-kit-react` only if task 3.3 traces the colour of the action
  icons to the kit's icon button, or tasks 1.1 and 2.1 find a switch missing
  in the kit's password input or text area.

Order with `private-rooms-key-ux-refresh`: both touch the passphrase form
and Keys management. This change goes first; the
refresh then moves forms that already behave as specified here.

## Decisions needed

1. What the strength line shows while a rule is unmet. Proposed: the weak
   grade. The alternative shows no grade and names the missing rule there.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the strength line and the list of rules,
  the recovery phrase input, the key details of Keys management.
- `private-rooms/room-membership`: the contrast of the invitation result.
- `private-rooms/file-operations`: the message of the media viewer for a
  file that is not shared with the user yet.

## Impact

- `packages/shared/dialogs/passphrase-modal`,
  `packages/shared/dialogs/key-recovery`: the strength line and the recovery
  input. The SDK takes the shared dialogs.
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`:
  the key details.
- `packages/client/src/components/panels/InvitePanel`: the result texts.
- `packages/shared/components/media-viewer`: the message.
- `public/locales`: new Common keys and one reworded, in every language.
- Playwright screenshots of the passphrase dialog, the recovery dialog, Keys
  management and the invite result change.
