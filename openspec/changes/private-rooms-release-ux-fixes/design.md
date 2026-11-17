# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
decisions: they come from the UX concept review of 2026-11-17 and from
reading the code of `release/v4.1.0` on the same day.

What the code does today:

- The passphrase form computes a strength grade from a meter and validates
  length, composition and common patterns separately; the two results are
  shown side by side. The list of rules is the tooltip of the kit's
  password input.
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
- Any change to the kit's components beyond what an audit task proves is
  needed.

## Decisions

### 1. One function decides the grade that is shown

The grade shown is the meter's grade when the validation passes and the weak
grade otherwise. The form asks one function for it, so creation and the
passphrase change cannot drift apart.

### 2. The rules are listed inside the form

The creation and change forms list the rules under the passphrase field,
each marked met or unmet as the user types, and stop using the tooltip of
the kit's password input for them. If the kit's input cannot be shown
without that tooltip, the audit of task 1.1 says so and the switch is added
to the kit.

Alternative considered: moving the tooltip to the side. Rejected: in the
aside presentation on a narrow screen there is no side.

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

- Listing the rules inside the form makes the dialog taller. → The list is
  short and the dialog already scrolls in the aside presentation.
- Colours are tokens shared with other pages. → A new use of an existing
  token, or a local token of the page; no shared token changes its value.
- Screenshots of several Playwright specs change. → Updated in the task that
  changes the screen, under Docker.
