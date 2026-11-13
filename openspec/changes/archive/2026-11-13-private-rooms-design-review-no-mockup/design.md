# Design

## Context

See proposal.md for the motivation. No stashed design document covers
these places. Nothing here depends on server behaviour, and no mock
handler changes.

As read on 2026-11-13 (branch `release/v4.1.0`):

- `ContextOptionsStore.onCreateRoom` dispatches `Events.ROOM_CREATE` with
  `startRoomType: RoomsTypePrivate` on a `/private` address and checks no
  key. `CreateRoomEvent` shows the dialog at once. The key gate lives in
  `CreateRoomDialog.js`: an effect offers key generation when the key
  list is empty, loading the list first when it is unknown, and renders
  the confirmation and the key dialogs as siblings of the aside panel,
  which stays `visible`. That is how the panel ends up under the prompts.
- The SDK's `PrivateCreateRoomDialog.tsx` has the same shape:
  `CreateEditRoomDialog visible={visible}` next to the prompts. It treats
  an unknown key list as one that may hold a key (`mayHoldKey`) and keeps
  the dialog shown meanwhile (sdk-surface, "Private room creation waits
  for a known key list").
- `SetRoomParams.js` shows `RoomType type="displayItem"` with
  `roomParams.type`. In the edit dialog that is Custom for a private room
  (the type the server stores), and `PermanentSettings` adds the private
  block under it with its description behind an info button. In the
  create dialog the type is the client-only `RoomsTypePrivate`, so the
  Private block is shown and no permanent block.
- `useQuickActions.tsx` returns one tile, `quick-private-room`, for the
  section `"private-rooms"`, which `helpers/quickActions.ts` picks for
  the Private list root. `Home/index.js` shows the banner when the hook
  says so and switches the section to its sticky layout with it.
- Common:NewRoom labels the create button
  (`helpers/getSectionCreateButton.ts`), the header action
  (`Section/Header/index.js`) and the "+ New" entry
  (`contextOptionsStore/folderModel.helpers.ts`, frozen in a menu
  snapshot that records i18n keys). All three know the Rooms root only.
- The empty Private list is the Rooms empty view with a title and a
  description chosen by `isPrivateScope` (`EmptyViewContainer.utils.tsx`)
  and the shared `createRoom` tile (`EmptyViewContainer.helpers.tsx`).
  The illustration helper has no private branch. The illustration of an
  empty private room and the texts Common:PrivateRoomsListEmptyDescription
  and Common:CreatePrivateRoom exist and are used by the SDK.
- `PassphraseModal.tsx` renders the link under the remember row when
  `onForgotPassphrase && externalError`. The editor page, the client's
  room entry and the delete-key flow all pass the handler.

## Goals / Non-Goals

**Goals:**

- The code does what "the dialog opens only after generation succeeds"
  says, in the client and the SDK, with the smallest move.
- One way to show a private room's type, in every panel.

**Non-Goals:**

- Moving the key gate out of the dialog components, or merging the three
  prompts: that is the stepped setup, which waits for a mock-up and will
  rework this part anyway.
- The link of the passphrase-change dialog, which has its own rule.

## Decisions

1. **The panel is hidden, not unmounted, while the key is missing.** In
   `CreateRoomDialog.js` the aside panel of a creation started on the
   Private type is shown only once the key list is known to hold a key;
   the gate, its effect and its callbacks stay where they are. A hidden
   aside draws no backdrop, and the prompts are modal dialogs of their
   own. Alternative: check the key in `onCreateRoom` before the event.
   Rejected for now: it moves the gate, its focus return and four test
   files for a flow the stepped setup will replace.
2. **The SDK hides its dialog only for a list known to be empty.**
   `PrivateCreateRoomDialog` passes `visible && mayHoldKey` for a
   creation. An unknown list keeps the dialog, as the existing
   requirement says; an edit is never hidden.
3. **The edit panel shows the Private type block.** `SetRoomParams`
   passes `RoomsTypePrivate` to the display block when the room is
   private, and `PermanentSettings` no longer adds a private block: the
   type block carries the title and the description. `roomParams.type`
   itself stays Custom in the edit dialog, so nothing that saves or
   reads the type changes. Alternative: set the type to Private in the
   edit params. Rejected: other settings of the dialog read the type.
4. **No quick actions for the Private list root.** `quickActions.ts`
   returns no section for it and the tile leaves `useQuickActions.tsx`.
   The list is then laid out without the banner, like any section whose
   banner is hidden. Inside a private room nothing changes.
5. **The label is chosen where the Rooms root is already told apart.**
   The three places take Common:NewPrivateRoom on a Private address, by
   the same `isPrivateRoomsRoute` test `onCreateRoom` uses. The menu
   snapshot changes by that one key.
6. **The section empty state gets private branches, not a new view.**
   The illustration helper and the options take the `isPrivateScope`
   flag the title and the description already take: the illustration of
   an empty private room, Common:PrivateRoomsListEmptyDescription for
   users who may create, and a create tile titled
   Common:CreatePrivateRoom with the description of the shared tile.
   EmptyView:EmptyRootPrivateRoomsDescription loses its reader and is
   removed.
7. **The link depends on the handler alone.** `PassphraseModal` shows it
   when `onForgotPassphrase` is passed and the dialog is not the creation
   one; its place in the markup, after the remember row, is unchanged, so
   the order of "Remember this device" holds.
8. **Translation is one pass after approval**, as before: the comment of
   the new key, 31 languages, the removed key deleted from 32 files.

## Risks / Trade-offs

- [The panel flashes for a user whose key list loads late] → It is
  hidden while the list is unknown and appears when it is known to hold
  a key; the wait is the one the key prompt already has.
- [Tests assert that the dialog is open under the prompt] → The unit
  tests of `CreateRoomDialog` and `PrivateCreateRoomDialog` and the
  section E2E are searched for it in tasks 1.1, 1.2 and 7.1.
- [Without the banner the Private list uses the older layout, where a
  bar above a table needs the sticky header rule] → No bar is shown on
  the list root; the locked-key bar appears only inside a room.
- [A user who relied on the tile] → The create button next to it does
  the same and now names what it creates.

## Open Questions

- Whether the create tile of the empty section should have a description
  of its own; the shared one ("Start the workspace by creating a room")
  is kept until the designers word another.
