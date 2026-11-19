# Proposal

## Why

The main spec says a new passphrase is accepted on its length and the
common-pattern rule alone ("A new passphrase needs no particular
characters"). The dialogs instead keep their confirm action off while the
strength meter grades the passphrase weak, and the meter counts only Latin
letters, ASCII digits and ASCII punctuation. A passphrase written in another
script gets points for its length only, so up to 19 characters it is graded
weak and cannot be confirmed, with no message saying why. The release
review of 2026-11-19 saw it on a stand: 16 Cyrillic letters in the Create
passphrase step read "Weak" and Continue stayed disabled. Users who write in
Cyrillic, Greek, Arabic, Hebrew, CJK or any other script are turned away by
a rule the product says it does not have.

The archived change `2026-11-17-private-rooms-passphrase-length-only`
dropped the composition rules and added the helper that checks the length
and the common-pattern rule, but left the confirm actions on the meter: its
design took for granted that every passphrase of 12 characters is graded at
least fair, which holds for 12 lowercase Latin letters only.

The same review found that the "Passphrase strength gate" requirement
promises a strength meter "with suggestions" that the dialogs never show.

## What Changes

- The confirm action of every dialog that takes a new passphrase (key
  setup, the new passphrase after a recovery with the recovery phrase, and
  the passphrase change) follows the passphrase rules: at least 12
  characters and no common pattern, in any script. The strength grade no
  longer decides whether the passphrase is accepted.
- The strength grade counts letters, case, digits and punctuation by their
  Unicode category, so a passphrase in another script is graded as the same
  passphrase in Latin letters would be. A passphrase that meets the rules is
  never graded weak, so the grade and the confirm action always agree.
- The "Passphrase strength gate" requirement drops the suggestions: the
  strength line shows a grade only. The unused suggestions are removed from
  the strength service, and `Common:PassphraseWeak`, whose advice ("add more
  characters and variety") no dialog can reach any more, is removed.

Out of scope:

- A list of common patterns in other languages. The list stays as it is
  (design.md, Risks).
- Counting length in user-perceived characters. Length keeps counting UTF-16
  code units as the kit's password input does; every letter of the scripts
  named above counts as one (design.md, Risks).
- An entropy estimator with dictionaries such as zxcvbn (design.md,
  decision 2).
- Any change to how a passphrase seals or opens the key: it is already
  normalized with NFKC before Argon2id, so a passphrase in any script opens
  the key on any device.
- The unlock dialog. It never checked the rules of a new passphrase.

Dependencies:

- No work on `../server`, the Document Server or `docspace-ui-kit-react`.
  The passphrase is used only in the browser to seal the key envelope, and
  the kit's password input already checks only the length with the settings
  the dialogs pass (`passwordSettings` without `allowedCharactersRegexStr`).

No open change covers this work (`openspec list` on 2026-11-19).
`private-rooms-admin-recovery` task 4.3 will add one more place that takes a
new passphrase; it reuses the same dialogs and so inherits these rules.

## Decisions

The design records two choices the findings asked for; both follow from the
owner's decision of 2026-11-17 to judge a passphrase by its length and common
patterns only:

1. The grade counts characters by Unicode category and never reads weak for
   an accepted passphrase (design.md, decision 2), rather than keeping the
   Latin classes with only a floor.
2. The suggestions leave the requirement and the code (design.md,
   decision 3), rather than being rendered: every suggestion but the length
   and the common pattern asks for a character class the rules dropped.

The owner confirmed both on 2026-11-19.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Passphrase strength gate" loses the
  suggestions; "A new passphrase needs no particular characters" covers
  every script and the new passphrase after a recovery; "The strength grade
  does not contradict the passphrase rules" also forbids a weak grade for an
  accepted passphrase; a new requirement makes the grade count letters of
  every script.

## Impact

- `packages/shared/services/encryption/passphrase-strength.ts`: scoring by
  Unicode category, the floor of the shown grade, the suggestions and
  `isPassphraseAcceptable` removed.
- `packages/shared/dialogs/key-generation/KeySetupDialog.tsx`,
  `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`,
  `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/modals/KeyRotationDialog.tsx`:
  the confirm action follows the rules. The SDK has no copy of these
  dialogs: its private-room creation reaches the shared key setup dialog
  through `usePrivateRoomKeyGate`, and its own `PassphraseModal` use is the
  unlock dialog.
- `public/locales/*/Common.json` and `.meta`: `PassphraseWeak` removed.
- Unit tests of the strength service and of the three dialogs; a Playwright
  case in `packages/client/__tests__/keys-management.spec.ts`.
