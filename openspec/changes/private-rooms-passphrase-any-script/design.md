# Design

## Context

No stashed design document covers this change. It comes from the release
review of 2026-11-19 and from reading `release/v4.1.0` at 54bed4b404d on the
same day.

What the code does:

- `checkPassphraseStrength` in
  `packages/shared/services/encryption/passphrase-strength.ts` scores a
  passphrase: 25 points for the minimum of 12 characters, 10 more at 16 and
  at 20, then 15 for `[a-z]`, 15 for `[A-Z]`, 15 for `\d` and 10 for ASCII
  punctuation. Weak below 40, fair from 40, good from 60, strong from 80;
  weak in any case below the minimum or with a common pattern. It also
  returns a list of suggestions (length, each missing class, common
  pattern).
- `isPassphraseAcceptable` accepts a passphrase when that grade is not weak.
  It is the confirm gate of `KeySetupDialog.tsx` (key setup, also reached
  from the SDK through `usePrivateRoomKeyGate`), of `PassphraseModal.tsx`
  with `isNew` (the new passphrase after a recovery, from
  `useRecoverKeyFlow.tsx`) and of `KeyRotationDialog.tsx` (passphrase
  change), on top of the kit's length check (`rulesPassed`). A submit that
  gets past the button with a weak grade sets `Common:PassphraseWeak`, but
  the button and Enter are only live when the gate passes, so the text is
  never shown.
- `meetsPassphraseRules` (length after trim, no common pattern) and
  `getShownPassphraseStrength` (weak unless the rules are met, else the
  meter's grade) were added by `2026-11-17-private-rooms-passphrase-length-only`.
  Only the strength line uses them. That change's design (decision 1) kept
  the meter as it was on the reasoning that "a passphrase of 12 lowercase
  letters is graded fair and accepted", which is true for Latin letters
  only: 12 letters of any other script score 25, 16 score 35, 20 score 45.
  A 12-character passphrase of punctuation alone scores 35 as well.
- `PassphraseStrengthLine.tsx` shows the label and the grade. The
  suggestions are not rendered anywhere and have no locale keys.
- The kit's password input (`usePasswordValidation`) checks only
  `value.trim().length >= minLength` with the settings the dialogs pass; it
  has no allowed-character rule there, so it already accepts any script.
- The passphrase is normalized with NFKC before Argon2id
  (`services/encryption/identity.ts`), so composed and decomposed forms of
  the same letters open the same key.

## Goals / Non-Goals

**Goals:**

- One function decides whether a new passphrase is accepted, and every
  dialog that takes one uses it.
- The grade and the confirm action never disagree.
- A passphrase in another script is graded like the same passphrase in
  Latin letters.

**Non-Goals:**

- A new scoring model; the points and thresholds stay.
- Any change to the kit, to sealing or to unlocking.

## Decisions

### 1. The confirm action follows the rules, not the meter

The three dialogs gate on `meetsPassphraseRules` in place of
`isPassphraseAcceptable`, which is removed together with its tests so that
no gate can lean on the meter again. Each dialog keeps the kit's
`rulesPassed` as well, as today. The submit handlers of `KeySetupDialog` and
`PassphraseModal` return without action when the rules are not met, in
place of setting `Common:PassphraseWeak`; with the gate and the guard equal
that branch cannot be reached, and its advice ("add more characters and
variety") contradicts the rules, so the key is removed from every locale.

Alternative considered: keep `isPassphraseAcceptable` and only fix the
meter (decision 2). Rejected: the gate would still depend on a grade meant
as a hint, and a 12-character passphrase of punctuation would stay refused
though it meets the rules.

### 2. The grade counts characters by Unicode category, with a floor

Planned (owner, 2026-11-19): `checkPassphraseStrength` tests Unicode categories
with the `u` flag in place of the ASCII classes:

| Points | Today | Planned |
|--------|-------|---------|
| 15 lowercase | `[a-z]` | `\p{Ll}`, or a caseless letter `\p{Lo}` / `\p{Lm}` |
| 15 uppercase | `[A-Z]` | `\p{Lu}` or `\p{Lt}` |
| 15 digits | `\d` | `\p{Nd}` |
| 10 punctuation | ASCII punctuation | `\p{P}` or `\p{S}` |

A caseless letter (CJK, Arabic, Hebrew, Thai and others) takes the
lowercase slot, so 12, 16 and 20 such characters are graded fair, fair and
good, exactly as 12, 16 and 20 lowercase Latin letters are. Cyrillic or
Greek in mixed case earns both case slots as Latin does.

On top, `getShownPassphraseStrength` returns at least fair for a
passphrase that meets the rules, so weak means exactly "not accepted" and
matches the disabled confirm action. The floor matters only for short
passphrases of a single kind of character other than letters or digits,
such as 12 punctuation characters.

Alternatives considered:

- Keep the ASCII classes and only add the floor. Rejected: a Cyrillic
  passphrase in mixed case with digits would stay a grade or two below the
  same passphrase in Latin letters, so the meter would still tell users of
  other scripts that their passphrase is worse.
- An estimator with dictionaries (zxcvbn). Rejected: a new dependency of
  several hundred kilobytes, dictionaries mostly in English, and a different
  grade for every existing test, for a line that is only a hint.

The `u` flag and `\p{...}` need ES2018. shared, client and doceditor target
ESNext and sdk ES2018; login and management (ES5) do not compile this file.

### 3. The suggestions leave the requirement and the code

Planned (owner, 2026-11-19): "Passphrase strength gate" drops "with
suggestions" and says the line shows a grade alone; the `suggestions` field
and the `PassphraseSuggestion` type are removed from the strength service.
Of the six suggestions, four ask for a lowercase letter, a capital letter, a
digit or a punctuation character, which is the composition the owner
dropped on 2026-11-17 (NIST SP 800-63B). The other two are covered already:
the length by the rules tooltip and by `Common:PassphraseTooShort` in the
passphrase change, the common pattern by `Common:PassphraseCommonPattern`
under the field.

Alternative considered: render the suggestions under the strength line.
Rejected: it needs four new locale keys, adds a block that can reflow the
dialog under the rules tooltip, and steers users back to the predictable
shape the owner wanted to avoid. Not left to the owner, since it follows
from that decision.

## Risks / Trade-offs

- [The common-pattern list holds Latin words and digit runs only, so a
  password common in another language is not refused.] → Argon2id (64 MiB,
  3 passes) makes each guess costly, and a localized list can follow in a
  later change if the owner wants it.
- [Length counts UTF-16 code units, as the kit's own check does, so a
  character outside the Basic Multilingual Plane (emoji, rare CJK
  extensions) counts twice, and a combining mark counts on its own.] → It
  only makes the minimum easier to reach for such input; every letter of
  Cyrillic, Greek, Arabic, Hebrew, Devanagari, CJK and Hangul in common use
  counts once. Changing it would need the kit to count the same way.
- [A caseless script is graded below what its larger alphabet would
  justify: 20 CJK characters are "good", not "strong".] → The grade is a
  hint and gates nothing after decision 1.
- [Existing tests could depend on the old scoring.] → Every existing
  passphrase test uses ASCII input, whose grade does not change, except
  through the floor of decision 2. The strength-service tests that assert
  `suggestions` are rewritten in the task that removes them.
- [Non-Latin test input could trip the ASCII-only source check.] → The
  check (`common/tests/test/ascii.test.js`) skips `.test.` files and every
  directory whose path contains `test`, `__tests__` among them, so unit and
  Playwright tests may hold the characters directly.

## Migration Plan

None. Passphrases set earlier keep opening the key; the rules apply where a
new passphrase is entered.
