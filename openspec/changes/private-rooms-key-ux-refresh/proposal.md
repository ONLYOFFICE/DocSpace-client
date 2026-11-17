# Proposal

## Why

The UX concept review of 2026-11-17 compared the designers' concept of
private rooms with the current release, the code and the practice of other
end-to-end encrypted products. Five parts of the concept were accepted as
they stand, need no server work and make the first contact with the
encryption key easier to understand. This change brings them to the client.

Today a user who creates a key meets two dialogs in a row with no
explanation of what a key, a passphrase and a recovery phrase are. The state
of the key is visible only on the profile page or as a bar at the top of a
private room. The inviter learns that a person has no key only after the
invitation is sent. The unlock dialog confirms with a button that does not
name the action, and the key fingerprint is one string of 64 characters that
cannot be read to a colleague.

## What Changes

- Key setup becomes one dialog of three steps: an explanation, the
  passphrase, the recovery phrase. The rules of the passphrase and of the
  recovery phrase stay as they are and apply to their steps.
- Starting the creation of a private room without a key opens that dialog
  directly. The separate prompt that asked whether to create a key is
  dropped: the explanation step takes its place.
- The header of a private room shows the state of the user's key, locked or
  unlocked, as a labelled indicator. Its popover offers the auto-lock preset,
  Lock now and a link to Keys management.
- The bar that reports a locked key in a private room becomes a block with
  an illustration, the same texts, a primary unlock action and the
  forgot-passphrase link. The file list under it stays as it is today, with
  the names as stored.
- The people list of the invite panel of a private room marks the people
  who have no encryption key before the invitation is sent.
- The unlock dialog confirms with Unlock, and its hint speaks about opening
  encrypted files.
- Keys management shows the key fingerprint in groups of eight characters,
  as the key-change dialog already does.

Out of scope:

- Inviting a person who has no key. The mark only shows the state earlier;
  what happens after sending is unchanged.
- A check that the recovery phrase was saved, a tick for the passphrase, a
  change of the passphrase rules or of the passphrase generator.
- The Contacts column, the trusted devices table, the transfer of a key by
  QR code, the reminder about the recovery phrase, encrypted links, moving a
  room to a new one, and the red style of destructive actions.
- The split of the Keys management page into two tabs.
- The pages of the SDK that render their own header and room body. The
  shared dialogs reach the SDK as they are.
- Hiding the actions that need the key while the key is locked.

Dependencies:

- `docspace-ui-kit-react`: the people selector has no way to mark an item.
  It needs one, on the kit's `release/v4.1.0`, before the mark can be shown.
- No work on `../server` or the Document Server. The mark reads the existing
  route for the keys of invitation candidates.

## Decisions needed

1. The prompt before key setup. Proposed: drop it, since the first step of
   the dialog says the same and more. The alternative keeps the prompt and
   shows the explanation twice.
2. A person marked as having no key in the invite list. Proposed: the person
   stays selectable and is refused after sending, as today, so the invite
   result keeps naming them. The alternative makes the row unselectable.
3. Where the key state indicator is shown. Proposed: in the header of a
   private room and of a folder inside one. The alternative adds the header
   of the Private list.
4. The locked-key block and the file list. Proposed: the block stands above
   the list, which keeps the names as stored. The alternative replaces the
   list with the block.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: key setup in one dialog, the key state
  indicator and its popover, the locked-key block in a private room, the
  wording of the unlock dialog, the grouped fingerprint.
- `private-rooms/room-membership`: the mark of people without a key in the
  invite panel, and the start of key setup from the creation of a private
  room.

## Impact

- `packages/shared/dialogs/key-generation`, `packages/shared/dialogs/passphrase-modal`:
  the key setup dialog and the unlock wording. The SDK and the editor page
  take the shared dialogs.
- `packages/shared/hooks/usePrivateRoomKeyGate.ts`,
  `packages/client/src/components/dialogs/CreateEditRoomDialog`: the prompt
  is removed.
- `packages/client/src/pages/Home/Section/Header` and
  `packages/client/src/pages/Home/Section/Body`: the indicator and the
  locked-key block, which replaces `PrivateRoomLockedBar`.
- `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management`:
  the fingerprint, and the auto-lock setting reused by the popover.
- `packages/client/src/components/panels/InvitePanel`: the mark.
- `public/locales`: new Common keys and reworded ones, in every language.
- Playwright screenshots of the key dialogs, the Keys management page, the
  private room and the invite panel change.
