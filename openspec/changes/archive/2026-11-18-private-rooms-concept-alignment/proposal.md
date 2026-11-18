# Proposal

## Why

The designers' demo stand shows private rooms in three places where the
release shows nothing or less: the dashboard has no card of the app, the
Private list does not say that its files are encrypted, and Keys management
does not say whether the key is locked. The owner compared the release, the
stand and a variant that keeps the decisions of the specs on 2026-11-18 and
chose that variant.

## What Changes

- **Dashboard.** The apps of the dashboard get a card of private rooms, with
  the icon and the name of the sidebar item, the Beta badge and the
  description of the apps catalog. Its button creates a private room for a
  user who may create rooms and opens the section for everybody else.
- **Private list.** The header of the list shows a line saying that the files of the section are end-to-end encrypted and readable
  by room members only.
- **Keys management.** The page opens with a sentence on what the key, the
  passphrase and the recovery phrase are for. The heading of the key shows
  the state of the key, locked or unlocked, in the words of the room header.
  While the key is locked the page says what unlocking gives and offers the
  unlock action under the key. The recovery phrase gets a heading and a
  sentence of its own above its link.

Nothing else of the page changes: the status, the creation date, the
fingerprint with its explanation, the details, the device settings and the
reset stay as the main specs describe.

Out of scope, each kept as the main specs have it:

- The place of the sidebar item (after Forms), the label of the create
  button (Common:NewPrivateRoom) and the key state indicator, which stays
  out of the header of the Private list.
- The locked-key block of a room: it stands above the file list, which
  keeps the names as stored.
- The split of Keys management into tabs, the table of trusted devices, the
  reminder about the recovery phrase, the Contacts column, the invitation of
  a person without a key, and the red style of destructive actions.
- The key setup dialog. The stand shows it in four steps; it was not seen
  there, because the account of the stand holds a key already.
- The icons of the section and of the locked room: taken from the stand on
  2026-11-18 (`a6885bbc9d4`).

Depends on no work in `../server` and none in the Document Server. The card
reads what the client already knows: whether the section is available and
whether the E2E rooms app is on.

## Decisions

Taken by the owner on 2026-11-18, with the variants on the canvas
"Private rooms: redesign options":

1. The variant that keeps the decisions of the specs is built, not the
   stand as it is.
2. The three new English texts of the table below.

Proposed here and confirmed by the owner on 2026-11-18 with the go-ahead
to apply:

3. The button of the card. For a user who may create rooms it reads
   Common:CreatePrivateRoom, opens the Private list and starts the creation
   there, on the Private type, as the create button of the section does.
   For everybody else it reads Common:Open and opens the list. The
   alternative is Common:Open for everybody, as the AI Workspace card has.
4. The card carries the Beta badge, as the sidebar item does, and loses it
   with the same task of `private-rooms-release-gate` (2.1).
5. The card is shown to whoever sees the sidebar item. On a standalone
   portal with the app switched off, an administrator gets the card with
   the "Disabled" state and the button to the apps settings, as for Rooms
   and Forms; nobody else gets it.

### Texts (English)

| Key | Text |
|-----|------|
| `Common:PrivateRoomsSectionNote` (new) | Files here are end-to-end encrypted: only room members can read them. |
| `Common:KeysManagementIntro` (new) | Your encryption key protects files in private rooms. Your passphrase unlocks the key; your recovery phrase helps restore access if you forget it. |
| `Common:RecoveryPhraseSectionText` (new) | Use your 24-word recovery phrase to set a new passphrase and restore access to your existing key. |

Reused as they are: Common:Private, Common:DashboardE2eRoomsDescription,
Common:CreatePrivateRoom, Common:Open, Common:KeyLocked,
Common:KeyUnlocked, Common:PrivateRoomLockedBarText, Common:UnlockKey,
Common:RecoveryPhraseTitle.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sidebar-section`: a dashboard card of the app; the
  creation of a private room started from that card; a line about
  encryption in the header of the Private list.
- `private-rooms/key-management`: the introduction, the state of the key
  and the unlock action on the Keys management page, and the heading and
  the sentence of the recovery phrase.

## Impact

- Client: the dashboard apps (`packages/client/src/pages/Dashboard`), the
  header of the list (`packages/client/src/pages/Home/Section/Header`) and
  Keys management
  (`packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`).
- Locales: three new keys of `Common`, with their translator comments and
  31 translations.
- E2E: the dashboard screenshot matrix gains a card on every frame of a
  portal with the section, so its frames are retaken under Docker; the
  frames of the Private list and of Keys management change as well. The
  frames that show the icons replaced on 2026-11-18 are retaken with them.
- The SDK private pages are not changed.
