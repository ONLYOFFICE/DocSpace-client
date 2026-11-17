# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
decisions: they come from the UX concept review of 2026-11-17 and from
reading the code of `release/v4.1.0` on the same day.

What the code does today:

- The passphrase form computes a strength grade from a meter and validates
  length, composition and common patterns separately; the two results are
  shown side by side. The list of rules is the tooltip of the kit's
  password input, opened above the field.
- The passphrase change dialog validates the same rules and enables its
  action only when they pass, but shows no strength line.
- The recovery input is one text area; a phrase is validated as a whole and
  every failure maps to `Common:InvalidRecoveryPhrase`.
- The key card of Keys management prints status, creation date,
  fingerprint, key id and algorithm as one list, with the label colour of
  the profile description and three icon buttons in the kit's default icon
  colour.
- The invitation result prints its reasons with the description style of the
  invite panel.
- The media viewer maps every decryption error to
  `Common:EncryptionDecryptPartialFailed`. The shared mapping of encryption
  errors, which the downloads and the editor page use, already turns a
  missing wrap into `Common:EncryptedFileNoAccessYet`.

## Goals / Non-Goals

**Goals:**

- Each fix lands where the behaviour is owned, so the SDK and the editor
  page receive the shared ones without their own copy.
- No change to what is generated, sealed, stored or sent.

**Non-Goals:**

- A check that the recovery phrase was saved (proposal.md, Out of scope).
- A new layout of the dialogs: `private-rooms-key-ux-refresh` owns that.
- Any change to the kit's components beyond the placement property of
  decision 2 and what an audit task proves is needed.

## Decisions

### 1. One function decides the grade that is shown

The grade shown is the meter's grade when the validation passes and the weak
grade otherwise. The form asks one function for it, so creation and the
passphrase change cannot drift apart. The passphrase change dialog, which
showed no grade, shows the same strength line as key creation; the owner
chose that on 2026-11-17 over dropping the change dialog from the
requirement.

### 2. The rules stay in the tooltip of the password input, opened where it covers nothing

The creation and change forms keep the rules in the tooltip of the kit's
password input, as every other password form of the product does: the
password change, registration and activation pages of login and the
password of a shared link. The kit's input opens that tooltip above the
field, over the hint and the generate action. The kit gains an optional
property for that placement, defaulting to the top, so the other forms do
not change, and the key dialogs ask for the right side. The kit anchored the
tooltip to the bare text field, so on the right side it opened over the
reveal button of the field and inside the dialog (measured by the Playwright
case of task 1.3: field ending at x 878, tooltip starting at x 882, dialog
ending at x 920). The kit therefore anchors it to the whole field, reveal
button included; on a wide screen it then starts past the field and covers
at most the empty right padding of the dialog, none of its texts, fields or
actions. The owner chose that on 2026-11-17 over an offset tied to the
dialog's layout and over the bottom side on every screen. Where there
is no room, in the aside on a narrow screen or on a tablet, the flip
middleware of the kit's `Tooltip` (`components/tooltip/index.tsx`, whose
first fallback after the right side is the bottom) moves it below the
field, where it covers the confirmation field while the passphrase is
typed. The owner accepted that on 2026-11-17.

Alternatives considered:

- A list of the rules in the form, under the field. Implemented as task 1.3
  in aba912004ff and reverted in 93eba409c24: it is a second way to show
  password rules, used by the key dialogs alone.
- The tooltip above the field on a narrow screen. Rejected: it covers the
  hint and the generate action, which is what the review found.

Audit of task 1.1 (`docspace-ui-kit-react` `release/v4.1.0`, the version
4.1.0 the client installs): the kit needs no switch. In
`components/password-input/index.tsx` the rules are the content of a
`Tooltip` rendered only when the property `isDisableTooltip` (declared in
`PasswordInput.types.ts`, covered by `PasswordInput.test.tsx`) is false.
Validation does not depend on it: `hooks/usePasswordInput.ts` calls
`checkPassword` of `hooks/usePasswordValidation.ts` on every change outside
`simpleView`, and that calls `onValidateInput(progressScore,
passwordValidation)` with the result of each rule (`length`, `digits`,
`capital`, `special`, `allowed`). The tooltip opens above the field:
`place="top"` is fixed in `index.tsx`, and no property of `PasswordInput`
changes it, so decision 2 needs a property in the kit.

### 3. The recovery input checks the words before the phrase

The client already ships the list of words a recovery phrase is built from.
On submit the input splits the text on white space, reports a count other
than 24, then the first word that is not in the list with its position, and
only then tries the phrase. The count under the field is derived from the
same split.

`Common:InvalidRecoveryPhrase` is reworded in English; the other languages
are retranslated from it.

### 4. Input assistance is declared off on the field

The recovery text area carries the standard attributes that turn off spelling check, automatic correction, automatic
capital letters and saved suggestions. If the kit's text area drops unknown
attributes, the audit of task 2.1 says so and the pass-through is added to
the kit.

Audit of task 2.1 (`docspace-ui-kit-react` `release/v4.1.0`): the kit needs
the pass-through. `components/textarea/Textarea.tsx` takes its props by name
and renders the `textarea` of `react-autosize-textarea` with those alone;
there is no rest spread, and `TextareaProps` in `Textarea.types.ts` is a
closed type that says so ("this type is closed and accepts no arbitrary DOM
attributes", on `aria-label`). `spellCheck`, `autoCorrect`, `autoCapitalize`
and `autoComplete` are neither declared nor passed, so the recovery input
cannot set them today. Task 2.5 adds them to the kit's text area as declared
props passed to the field, the way `aria-label` and its siblings are.

### 5. Key details: a disclosure, a hint, two colours

The key id and the algorithm move under a disclosure button; the hint of the
fingerprint is tied to it as its description. The labels take a text token
that reaches 4.5:1 on the card in both themes, and the icon buttons are
given a colour that reaches 3:1. Both are checked with the measured colours
of the built page, not with the token names.

### 6. The invitation result uses the body text colour

The reasons and the notes take the text colour and size of the names. The
same style serves the reasons kept in the invite form.

### 7. The media viewer asks the shared mapping

The viewer passes the error it caught to the shared mapping of encryption
errors and shows what it returns, keeping its own message with the file
name for an error the mapping does not name.

## Risks / Trade-offs

- On a narrow screen the tooltip covers the confirmation field while the
  passphrase is typed. → The kit closes it once the passphrase is long
  enough and the field shows no error, or on a click outside it
  (`components/password-input/index.tsx`).
- Colours are tokens shared with other pages. → A new use of an existing
  token, or a local token of the page; no shared token changes its value.
- Screenshots of several Playwright specs change. → Updated in the task that
  changes the screen, under Docker.

## Verification (task 6.1)

Run on 2026-11-17 on `release/v4.1.0` at 34ec0d63a5c, with the kit pack
built from `docspace-ui-kit-react` `release/v4.1.0` at 2b1be433:

- Client Playwright under Docker (`tests-dev`): the private-room specs
  (`private-room-*.spec.ts`, `private-rooms-app-off.spec.ts`,
  `private-rooms-section.spec.ts`), the keys-management specs
  (`keys-management.spec.ts`, `keys-management-advanced.spec.ts`,
  `key-flow-edge-cases.spec.ts`) and `encrypted-file-ui.spec.ts`: 188
  passed, none failed.
- SDK private suite (`__tests__/e2e/private`) on a build made with
  `pnpm run test:build`: 36 passed.
- Pre-push gate: `npm --prefix ./common/tests run test:lefthook` with 61
  passed and 3 skipped (the translation-completeness suites the gate leaves
  out), then `nx run-many -t tsc lint test` over the six packages: all 21
  tasks green, none from the cache.
- `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`: 24 passed.

The full locale suite still reports six Common keys without translations
(`AIApiKeysDescriptionNoPercent`, `AIModelsDescriptionWithFeeNoPercent`,
`AIProjectAddFolder`, `AIProjectAddKnowledge`, `AIProjectAddSkills`,
`AiWorkspaceKnowledge`). They come from AI projects work committed on
2026-11-10, not from this change, which translated each key it added.
