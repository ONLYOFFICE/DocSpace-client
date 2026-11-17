# Design

## Context

No stashed design document covers this change; it comes from the owner's
decision of 2026-11-17 and from reading the code of `release/v4.1.0` and of
`docspace-ui-kit-react` `release/v4.1.0` on the same day.

What the code does today:

- `PASSPHRASE_SETTINGS` of the passphrase strength service asks the kit's
  password input for a minimum length of 12, a capital letter, a digit and a
  punctuation character. The creation dialog and the passphrase change
  dialog pass it to the input, whose rules tooltip lists one line per rule
  that is switched on.
- The strength service checks the same rules itself
  (`checkPassphraseRules` / `meetsPassphraseRules` after
  `private-rooms-release-ux-fixes` task 1.2) and refuses a common pattern;
  the shown grade is weak until they all pass.
- The generate action of the creation dialog calls the kit's generator
  through the input's handle. The generator (`hooks/generatePassword.ts`,
  called from `hooks/usePasswordGenerator.ts`) takes its length and its
  character set from the same `passwordSettings`: one character of every
  class that is switched on, the rest drawn from lowercase letters plus
  those classes, `minLength` characters in all. With the composition rules
  off it would produce 12 lowercase letters.
- The passphrase seals the key envelope in the browser with Argon2id
  (64 MiB, 3 passes, 4 lanes: `ARGON2ID_DEFAULT_*` in
  `packages/shared/services/encryption/types.ts`).

## Goals / Non-Goals

**Goals:**

- One place states the rules of a new passphrase, and the tooltip, the
  shown grade and the confirm action all follow it.
- The generator's output does not change.

**Non-Goals:**

- A longer minimum, a generator built from words, new common patterns
  (proposal.md, Out of scope).
- Any change to how a passphrase seals or opens the key.

## Decisions

### 1. The rules are the length and the common-pattern check

`PASSPHRASE_SETTINGS` switches the capital letter, the digit and the
punctuation off and keeps the minimum of 12. The kit then checks the length
alone and its tooltip lists the length alone; `checkPassphraseRules` keeps
only the length and `meetsPassphraseRules` adds the common-pattern check as
before. The strength meter is unchanged: it still rewards variety, so a
passphrase of 12 lowercase letters is graded fair and accepted, and a longer
one of mixed characters strong.

### 2. The generator gets settings of its own

The kit's password input gains an optional property with the settings of
its generator, defaulting to `passwordSettings`, so every other form keeps
generating what it validates. The strength service exports the generator
settings of a passphrase (12 characters, capital letters, digits and
punctuation, which is today's `PASSPHRASE_SETTINGS`), and the creation
dialog passes them. The passphrase change dialog has no generate action and
passes nothing.

Alternative considered: a generator of the client's own, in the strength
service, setting the field through the input's handle. Rejected: it is a
second generator next to the kit's, which already draws without bias and
shuffles the required characters.

### 3. Existing passphrases are not touched

The rules apply where a new passphrase is entered: key creation, the
passphrase change and the new passphrase after a recovery. Unlocking never
checked them, so a passphrase set under the old rules keeps working and
nothing is asked of its owner.

### 4. Order with the release fixes

This change modifies "The strength grade does not contradict the passphrase
rules", which `private-rooms-release-ux-fixes` adds. `openspec validate`
accepts the delta now, but its archive refuses the MODIFIED block until that
requirement is in the main spec, so `private-rooms-release-ux-fixes` is
archived first.

## Risks / Trade-offs

- A passphrase of one character repeated twelve times, or a run of the
  alphabet, matches no common pattern and is graded fair. → Argon2id makes
  every guess cost 64 MiB and three passes, and the meter still shows the
  grade. A wider check against repeats and runs is left to a later change
  if the owner wants it.
- The kit gains a property only the key dialogs use. → It defaults to the
  validation settings, so nothing changes for the other forms.
- Screenshots of the rules tooltip taken by `private-rooms-release-ux-fixes`
  task 1.3 change. → Updated under Docker in the task that changes the
  rules.
