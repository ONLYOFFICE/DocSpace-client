# Proposal

## Why

Two open questions of the designers' review of private rooms ("Remarks and
suggestions on Private rooms", November 2026) need no mock-up and were
decided by the owner on 2026-11-13:

- the create-room panel says only "All files in this room will be
  encrypted"; the designers ask it to say what a private room is for and
  to name its essential limits before the room is created, with the
  details behind a "Learn more" link;
- the menu offers "Download" and "Download without decryption", and the
  designers read the second as "download with decryption" and asked why
  it exists. The entry is kept; its label is what misleads.

## What Changes

- **A. A description that explains the room.** The Private Room block of
  the create and edit panels, in the client and in the SDK, shows a new
  text, Common:PrivateRoomPanelDescription: what the room is for, who can
  read the files, and that the room cannot be made a regular one. The short
  Common:PrivateRoomDescription stays where it is a tooltip or a tile
  line.
- **B. A "Learn more" link that appears with the article.** The client
  block shows Common:LearnMore under the description when the portal's
  help-center resources carry the entry `privaterooms`, and shows no link
  otherwise. No such article exists today, so nothing is shown until the
  documentation is published and the entry is added to the resources.
- **C. A label that says what is downloaded.** The entry
  Common:DownloadWithoutDecryption reads "Download encrypted copy" in the
  client and the SDK. What it does and where it is offered do not change.

### Texts (English; approved by the owner on 2026-11-13)

| Key | Now | Proposed |
|-----|-----|----------|
| `Common:PrivateRoomPanelDescription` (new) | | A room for confidential files with end-to-end encryption: files are encrypted in your browser, and only room members can read them. A private room cannot be turned into a regular room. |
| `Common:DownloadWithoutDecryption` | Download without decryption | Download encrypted copy |

Common:PrivateRoomDescription, Common:PrivateRoomTitle and
Common:LearnMore exist and keep their texts.

### Out of scope

- The help-center article itself and the `privaterooms` entry in
  `../buildtools/config/externalresources.json`: added in the buildtools
  repository when the article has an address.
- A "Learn more" link in the SDK dialog: the SDK reads no help-center
  resources.
- Any change to what the two download entries do, and a submenu for them.
- The limits a private room has beyond the one named in the text
  (members with a key only, no version history, no conversion, no form
  filling, no AI and plugin actions): they belong to the article.

### Decisions taken by the owner on 2026-11-13

1. The two texts of the table are approved (the description in Russian;
   the English above is its rendering).
2. The description names one limit, that the room cannot be made a
   regular one. The limit on who can be a member is not added. The loss
   of access without the passphrase and the recovery phrase is not
   repeated here: it belongs to the key, not to the room, and the key
   setup states it and has it acknowledged.
3. The link is built now and stays hidden until the entry exists.
4. Both download entries stay; only the label of the second changes.

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: "Private badge in permanent settings"
  (the description of the block and the link under it).
- `private-rooms/sdk-surface`: a new requirement for the description of
  the SDK dialog.
- `private-rooms/file-operations`: "Download without decryption" (the
  label of the entry).

## Impact

- `packages/shared/components/room-type` (description of the Private
  type, optional link) and `packages/shared/store/SettingsStore.ts` (the
  address of the article).
- `packages/client/src/components/dialogs/CreateEditRoomDialog`
  (passes the address to the block).
- `packages/sdk/src/app/(rooms)/_components/create-edit-room-dialog/index.tsx`.
- `public/locales/*/Common.json` and `.meta`: one key added, one
  reworded, in 32 languages.
- Unit tests of the files above. The menu snapshot
  `FilesActionsStore.headerMenu.test.ts.snap` records i18n keys and does
  not change, since the key keeps its name. `encrypted-file-ui.spec.ts`
  and `private-room-cross-user-download.spec.ts` find the entry by its
  English text.
- No API or dependency change.
