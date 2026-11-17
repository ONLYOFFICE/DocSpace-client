# Proposal

## Why

A new passphrase must hold a Latin capital letter, a digit and a punctuation
character on top of its length. Such rules push people towards a predictable
shape (a capital at the start, a digit and "!" at the end) and add little a
guesser has to pay for, while they turn away long passphrases of plain words.
NIST SP 800-63B advises length and a check against common choices instead.
The owner decided on 2026-11-17 to drop the composition rules.

## What Changes

- A new passphrase, at key creation and at a passphrase change, is accepted
  when it has at least 12 characters and matches no common pattern. It no
  longer has to hold a capital letter, a digit or a punctuation character.
- The rules tooltip of the passphrase field lists the length alone.
- The passphrase generator keeps its output: 12 characters with at least one
  Latin capital letter, one digit and one punctuation character, drawn from
  letters, digits and punctuation. It stops following the validation rules,
  which no longer ask for those characters.

Out of scope:

- A longer minimum. The owner decided on 2026-11-17 to keep 12 characters.
- A generator built from words: the generator stays a character generator
  (owner, 2026-11-17).
- New entries in the list of common patterns, such as one character repeated
  (design.md, Risks).
- Passphrases set before this change: the rules apply to a new passphrase
  only, and unlocking never checked them.

Dependencies:

- `docspace-ui-kit-react`: the generator of the password input reads its
  character set from the same settings as the validation
  (`components/password-input/hooks/generatePassword.ts`); it needs a
  property for settings of its own. A kit release is adopted here.
- No work on `../server` or the Document Server: the passphrase is used only
  in the browser to seal the key envelope.

Order: after `private-rooms-release-ux-fixes`, whose requirement on the
strength grade this change modifies and whose rules tooltip it shortens.
`private-rooms-key-ux-refresh` keeps a change of the passphrase rules out of
scope and is not affected.

## Decisions

Decided by the owner on 2026-11-17:

1. The composition rules are dropped; the length and the common-pattern rule
   stay.
2. The minimum stays at 12 characters.
3. The generator keeps building a passphrase of 12 characters from letters,
   digits and punctuation.

No decision is open.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the composition rules are removed, the
  requirement on the generated passphrase states its own character set, and
  the requirement on the shown strength grade loses its composition case.

## Impact

- `docspace-ui-kit-react` `components/password-input`: settings for the
  generator of their own.
- `packages/shared/services/encryption/passphrase-strength.ts`: the rules and
  the generator settings.
- `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and
  `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`:
  the settings they pass to the input. The SDK takes the shared dialog.
- Unit tests of the strength service and of both dialogs; Playwright specs
  whose comments describe the rules; the screenshots of the rules tooltip.
