# Proposal

## Why

The interface designers reviewed private rooms on a stand and wrote down
eighteen remarks ("Remarks and suggestions on Private rooms", November
2026). Ten of them are small, contradict no requirement and need nothing
from the server: unreadable badges, an error that can never appear, a
checkbox that is locked without a reason in the spec, a welcome view shown
in the wrong place, a room type shown as Custom, a toast that repeats the
panel under it. This change takes those ten as stage 1, so that the beta
does not carry them while the larger remarks are designed.

## What Changes

### Key dialogs

- **Passphrase creation.** Common:GenerateLogoButton fills the passphrase
  and its confirmation, not the passphrase alone. Typing in either field
  afterwards brings the mismatch check back.
- **Recovery phrase.** The 24 words are a numbered list laid out as a
  grid, in the dialog and in the recovery kit. Print, download and copy
  are three actions of equal weight. The acknowledgement can be ticked at
  once: a user who wrote the words down by hand is not made to press a
  save action first. The primary action still needs the tick, and a save
  action does not tick it.
- **Passphrase change.** A new passphrase equal to the current one shows
  Common:PassphraseMustBeDifferent at the field. Today the text exists but
  can never appear: it waits for a submit that the disabled button
  forbids. The new-passphrase field takes the full width like the other
  two, and a divider separates the current passphrase from the new one.
- **Unlock prompt.** The hint of Common:RememberDeviceLabel gets a gap
  from the checkbox and lines up with its label.

### Keys management page

- The Common:Active and Common:NoKey badges get colours whose text meets
  a contrast of 4.5:1 in the light and the dark theme. Today white on
  `#22C386` and on `#F97A0B` gives about 2.3:1 and 2.7:1.

### Rooms

- **Room type.** A private room is labelled Private, not Custom, where
  the client shows the type of a room: the Type column, the row, the tile
  and the Type line of the info panel. The room stays a Custom room with
  the private flag for the server.
- **Empty folder.** An empty folder inside a private room shows an empty
  folder view with the create and upload entries the room allows, not the
  room's welcome with its list of properties.
- **Empty room.** The welcome of the room root gets a short title, four
  short lines and an icon of its own for each line, in the client and in
  the SDK copy.

### Invitation into a private room

- An invitee left out before the grant for want of a key is named with
  Common:EncryptedInviteNoKey ("Not invited: …"). Today the panel uses
  Common:EncryptedSkippedNoKeys, which says files "were not made
  available" to someone who was never invited.
- No toast repeats what the open panel shows.
- When nobody was invited, the panel keeps the invite form with the
  invitees still in the list and the reasons above it, instead of a
  result view that holds one grey sentence. Client and SDK.

### Texts (English; approved by the owner on 2026-11-13)

| Key | Now | Proposed |
|-----|-----|----------|
| `InvalidPassphrase` | Invalid passphrase | Incorrect passphrase |
| `GenerateNewKey` | Generate new key | Create key |
| `NoEncryptionKey` | No encryption key configured. Generate or import a key to enable file encryption. | No encryption key configured. Create or import a key to enable file encryption. |
| `CreatePassphraseHint` | Create a strong passphrase to protect your encryption key. You will need it to decrypt files on any device where you use this key. | Create a strong passphrase to protect your encryption key. Remember it or keep it in a password manager: you will need it to unlock your key. |
| `RecoveryPhraseHint` | Write down these 24 words in order and store them somewhere safe. They work across all your devices and are the only way to restore access to your encrypted files if you forget your passphrase. | Your passphrase unlocks your key from day to day. These 24 words are the only way to restore access to your encrypted files if you forget it. Write them down in order and store them somewhere safe. |
| `RecoveryPhraseSaveFirst` | Print, download, or copy your recovery phrase to continue. | removed with its `.meta` |
| `PrivateRoomEmptyTitle` | Welcome to the private room, where file contents and file names are encrypted | Files in this room are end-to-end encrypted |
| `PrivateRoomEmptyBenefitE2EE` | Your files are encrypted in your browser — only invited members can read them. | Files are encrypted in your browser. |
| `PrivateRoomEmptyBenefitAEAD` | Every document gets its own key, so one leaked file never exposes another. | Each file has its own encryption key. |
| `PrivateRoomEmptyBenefitHPKE` | Collaborate with trusted teammates without ever sharing your password. | Collaborate without sharing your passphrase. |
| `PrivateRoomEmptyBenefitKDF` | A 24-word recovery phrase keeps your access safe if you forget your passphrase. | Restore access with your recovery phrase. |
| `PrivateRoomType` (new) | | Private |
| `PrivateRoomFolderEmptyDescription` (new) | | Start working in the folder by creating files or folders |

Common:PassphraseMustBeDifferent keeps its text ("New passphrase must be
different from current"): it says what the designers asked for.

### Out of scope

Stage 2 and the open questions of the review, each a change of its own:

- one stepped key setup before the create-room panel opens, and the
  removal of the "Encryption key required" prompt;
- one Private Room block in the edit-room panel, a longer description
  and a "Learn more" link in the create-room panel;
- the quick-action tile and the label of the header create button;
- the empty state of the Private section;
- Common:ForgotPassphrase shown before a failed attempt;
- the name and the icon of the sidebar section;
- inviting a user who has no key yet;
- the two download entries.

Also out of scope: the look of the editor page after a dismissed unlock
(its behaviour was corrected on 2026-11-11), any change inside the
ui-kit repository, and a review of the translations by native speakers.

### Decisions

Taken by the owner on 2026-11-13:

1. The thirteen texts of the table are approved.

2. The label of the type is a new key, Common:PrivateRoomType
   ("Private"), so that a later rename of the section label
   Common:Private does not reach the Type column. Reusing Common:Private
   was the alternative and is not used.
3. The four welcome lines take icons that are already in
   `public/images/icons/16` (lock, key, people, restore).
4. The two badge colours are the tokens the task picks by the contrast
   rule.

The owner asks the designers for icons and colours of their own; if they
arrive, they replace the ones of decisions 3 and 4 in a change of their
own or in a task added here before the archive.

Depends on: nothing in `../server` or the Document Server. The change
states nothing new about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Recovery phrase is shown once and must
  be acknowledged" (numbered list, equal save actions, acknowledgement
  available at once); new requirements for the generated passphrase, for
  a new passphrase equal to the current one, and for the readable status
  badges.
- `private-rooms/room-membership`: "Invitees without usable keys are
  skipped with a warning" and "Refused invitees are named in the invite
  result" (text of the reason, no repeated toast); new requirements for
  an invitation that invited nobody and for the Private type label.
- `private-rooms/sdk-surface`: "Invite panel offers people only and
  reports the invitation result" follows the same two rules.
- `private-rooms/file-operations`: a new requirement for the empty folder
  inside a private room.

## Impact

- `packages/shared/dialogs/passphrase-modal`,
  `packages/shared/dialogs/key-generation` (dialog and `recovery-kit.ts`).
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`
  (`KeysList.tsx`, `modals/KeyRotationDialog.tsx`).
- `packages/client/src/helpers/filesUtils.js` and the four places that
  show a room's type (table cell, row content, tile, info panel details).
- `packages/client/src/components/EmptyContainer` and
  `packages/shared/components/empty-views/empty-private-room`.
- `packages/client/src/components/panels/InvitePanel`,
  `packages/sdk/src/app/(rooms)/_components/invite-panel`,
  `packages/sdk/src/app/(private)/_hooks/usePrivateInviteFlow.ts`,
  `packages/shared/services/private-room/room-member-flows.ts`.
- `public/locales/*/Common.json` and `.meta`: eleven texts reworded, two
  keys added, one removed, in 32 languages.
- Unit tests of the files above; E2E specs and fixtures that read the
  recovery phrase block, wait for the acknowledgement to be disabled, or
  find controls by "Generate new key" and "Invalid passphrase"; the
  screenshots of the passphrase and recovery dialogs.
- No API or dependency change.
