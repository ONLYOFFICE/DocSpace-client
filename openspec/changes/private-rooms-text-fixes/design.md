# Design

## Context

See proposal.md for the motivation and the texts. No stashed design
document covers this. Nothing here depends on server behaviour.

As read on 2026-11-11:

- The eleven keys live in `public/locales/*/Common.json` (32 languages)
  with `.meta` files. `EncryptionDeviceSetupHint` carries a `<0>` tag.
- `Common:NoAccessToEncryptedFile` has two readers: the title of the lock
  badge (`ItemIcon.tsx`, `encrypted-item-icon`), shown only to a user
  whose key list is known to be empty, and `getEncryptionErrorMessage`
  (`packages/shared/services/encryption/error-i18n.ts`) for a
  `NoAccessError`, which a key holder without a wrap gets.
- `InviteInput.js` of the client picks the description and the
  placeholder of the invite panel by `allowInvitingGuests`; a private room
  is not looked at. Its search is already limited to portal users.
- `getAccessOptions.tsx` builds the role list by room type and gives the
  Editor role Common:RoleEditorDescription for every type.
  Common:EditorDescription, the same sentence without form filling,
  exists.
- `KeyChangeDialog.tsx` formats its dates with
  `toLocaleString(i18n.language)` and its duration with English suffixes.
- `useExportKeyFlow.tsx` names the download
  `docspace-key-<8 hex of the fingerprint>.json`; the import flow reads
  the picked file's content and never its name.

## Goals / Non-Goals

**Goals:**

- No text of the list promises what is not there or ties the key to a
  device.
- No string of the two places bypasses i18n or names the brand.

**Non-Goals:**

- New features behind the texts (a rotation of the room's content, a
  retry for skipped invitees).

## Decisions

1. **Texts change in place; one key is renamed.**
   `KeyChangedReasonDevice` becomes `KeyChangedReasonReplaced` in the 32
   files, its `.meta` and its call site; the other ten keep their names.
2. **`NoAccessError` gets the existing Common:EncryptedFileNoAccessYet.**
   The badge keeps Common:NoAccessToEncryptedFile. No new text.
3. **The invite panel of a private room takes the member-only branch.**
   `InviteInput` treats a private room as a room that does not allow
   inviting guests for its description, placeholder and
   invitation-language block. The SDK's invite input gets the same rule if
   it shows the same texts; that is checked in the task, not assumed.
4. **The role description is chosen where the list is built.**
   `getAccessOptions` knows the room type; a private room is not a type of
   its own there, so the caller's "private" flag decides. Where no such
   flag reaches the builder, the task adds it as an optional parameter
   with today's text as the default.
5. **The duration is a number with a unit from `Intl.NumberFormat`**
   (`style: "unit"`, `unitDisplay: "long"`, units second to year) in the
   interface language, Latin digits as the dates of the dialog. Months
   and years stay the approximations they are today. Alternative:
   `Intl.DurationFormat`. Rejected: not available in every supported
   browser.
6. **The export file is `encryption-key-<fingerprint>.json`.** The
   fingerprint part keeps its eight hex digits.
7. **Translation is one pass after approval**: comments refreshed for the
   reworded keys, 31 languages retranslated from the new English,
   `translate-stale` run to prove nothing is left on the old wording.

## Risks / Trade-offs

- [Tests, mocks and E2E specs assert on the old English] → They are
  searched by the old text in the task and updated with it; menu
  snapshots must not change.
- [A user looks for an older export by its old name] → The name of files
  already saved does not change; only new exports carry the new name.
- [Retranslating eleven texts in 31 languages without native review] →
  Recorded as open, as for the earlier changes.
