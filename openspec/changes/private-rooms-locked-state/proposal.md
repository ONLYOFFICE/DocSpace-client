# Proposal

## Why

Entering a private room with a locked key raises the passphrase prompt
once for that folder. A user who cancels it is left in a room where the
files carry opaque names and nothing says why or how to go on: the prompt
does not come back until the user enters another folder or reloads the
page. Confirmed on the stand (review card C7). The same happens to a user
whose key locks by the idle timeout while the room is open.

The "remember this device" option that spares a user the prompt on every
page load sits last in the unlock dialog, under the forgot-passphrase link,
in the size of a footnote. The owner decided (H7) to show a bar with an
unlock action in the room and to make that option easier to notice without
ticking it by default.

## What Changes

- A private room, and any folder inside one, shows a bar at the top of its
  content while the user holds a key that is locked: a title, one sentence
  and an unlock action. The action raises the same unlock dialog as the
  room entry; after the unlock the bar goes and the names are decrypted
  without a page reload.
- The bar is not shown while the room's own unlock request is open or is
  being answered from a remembered device, so it does not flash under the
  dialog or on a device that unlocks silently. It is not shown to a user
  without a key or with an unknown key list; those states have their own
  messages.
- In the unlock dialog the "remember this device" option moves directly
  under the passphrase field, above the forgot-passphrase and passkey
  links, and its label is set in the weight of the dialog's field labels.
  It stays unticked by default and keeps its hint.

New user-facing strings, English, for the owner's approval before they are
translated:

| Key | Text |
|-----|------|
| `Common:PrivateRoomLockedBarTitle` | Your encryption key is locked |
| `Common:PrivateRoomLockedBarText` | Unlock it to see file names and to open, upload and download files. |
| `Common:UnlockKey` | Unlock |

`Common:RememberDeviceLabel` ("Don't ask again on this device") and
`Common:RememberDeviceHint` keep their texts.

Out of scope:

- The SDK's private pages: they get no bar here; the dialog change reaches
  them through the shared dialog.
- The editor page, card C8.
- Ticking the remember option by default, declined in H7.
- The wording of the other key texts, card C10.

Decisions that need a human:

1. The three texts above.
2. How far the remember option is raised. Proposed: moved under the
   passphrase field with a semibold label, nothing else. The alternative
   adds a tinted background behind the option and its hint; it draws the
   eye more and makes the dialog heavier for a choice that should stay
   deliberate.

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: a new requirement for the locked-key bar
  of a private room; "Remember this device" gains the placement of the
  option.

## Impact

- `packages/client/src/components/EncryptionProviderWrapper.jsx`
  (`RoomUnlockEffect`) and a new bar next to
  `packages/client/src/pages/Home/Section/Body/KnowledgeVectorizationBar.tsx`,
  with unit tests.
- `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and its
  styles and tests.
- Three keys in `public/locales/*/Common.json` with metadata, translated
  into the 31 other languages after approval.
- An E2E case in `packages/client/__tests__/private-room-access.spec.ts`.
- No API or dependency change.
