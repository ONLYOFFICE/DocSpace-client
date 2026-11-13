# Design

## Context

See proposal.md for the motivation. Nothing here depends on server
behaviour, and no mock handler changes.

As read on 2026-11-13 (branch `release/v4.1.0`):

- The Private Room block of the client panels is the shared `RoomType`
  component (`packages/shared/components/room-type`) rendered by
  `SetRoomParams.js` with `type="displayItem"`. Its description comes
  from `getRoomTypeDescriptionTranslation`, which returns
  Common:PrivateRoomDescription for `RoomsTypePrivate`. The same function
  feeds the list and dropdown variants of `RoomType`; the Private type is
  not offered there (sidebar-section, "Generic chooser does not offer the
  Private type").
- Common:PrivateRoomDescription is also the tooltip of the room icon in
  the client header and in the SDK header, and the line under the create
  tile of the empty Private section. A two-sentence text does not fit
  those places.
- The SDK dialog (`create-edit-room-dialog/index.tsx`) renders its own
  private row with Common:PrivateRoomTitle and
  Common:PrivateRoomDescription. The SDK reads no help-center resources.
- `SettingsStore` exposes `helpCenterDomain` and `helpCenterEntries` from
  `externalResources.helpcenter`, and builds article addresses as
  `domain + entry`. Its existing getters fall back to the bare domain
  when an entry is missing.
- `../buildtools/config/externalresources.json` has no help-center entry
  for private rooms. Its `site` block has `privaterooms`
  (`/private-rooms.aspx`), a page of the marketing site, not the article
  the designers mean.
- The label Common:DownloadWithoutDecryption is read in three places:
  `filesContextOptions.helpers.ts`, `FilesHeaderOptionStore.ts` and the
  SDK's `useContextMenuModel.ts`. Two E2E specs find the entry by its
  English text.

## Decisions

1. **A new key for the panel text.** Common:PrivateRoomPanelDescription
   is returned by `getRoomTypeDescriptionTranslation` for
   `RoomsTypePrivate`; the SDK row reads the same key.
   Common:PrivateRoomDescription keeps its text and its three other
   readers. Rewording the short key was the alternative and would put two
   sentences into a tooltip.
2. **The address is a getter that may be empty.** `SettingsStore` gets
   `privateRoomsHelpUrl`: `domain + entries.privaterooms` when both
   exist, otherwise `undefined`. It does not fall back to the bare
   domain, unlike the older getters: a link that opens the front page of
   the help center explains nothing.
3. **The link is a prop of the block.** `RoomType` takes an optional
   `helpUrl` and renders Common:LearnMore under the description of the
   `displayItem` variant when it is set, opening in a new tab with
   `rel="noopener noreferrer"`. `SetRoomParams.js` passes the getter's
   value only for the Private type. The component stays free of stores.
4. **The download key keeps its name.** Only the values of
   Common:DownloadWithoutDecryption change. The call sites, the menu
   snapshots that record keys and the requirement names in the specs stay
   as they are; the specs keep naming the action "download without
   decryption".
5. **Translations.** The new key and the reworded one are translated into
   the 31 other languages in the same change, with translator comments
   written first. The label is a menu entry and stays short in every
   language.

## Risks

- The description is long for a block that held one line. The panel
  scrolls, and the block of other room types already holds two lines.
- The translations are not reviewed by native speakers.
