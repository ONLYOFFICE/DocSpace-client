# Proposal

## Why

Stage 1 of the designers' review of private rooms
(`private-rooms-design-review-quick-fixes`) left the remarks that touch a
requirement. Five of them need no mock-up from the designers: one is a
place where the code does not do what the spec already says, the other
four are small enough to be decided from the review text. This change
takes those five, so that only the stepped key setup waits for a drawing.

## What Changes

- **A. The create-room panel waits for the key.** A user without a key who
  starts a private room from the Private section sees the key prompts on
  their own; the create-room panel appears after the key is registered.
  Today the panel is open under the prompts the whole time, although
  room-membership, "Starting private room creation without a key starts
  key generation", says the dialog opens "only after generation succeeds".
  Client and SDK. The prompts themselves do not change: merging them into
  one stepped setup waits for the designers' mock-up.
- **B. One Private Room block in the edit panel.** The edit panel of a
  private room shows the same Private Room block as the create panel,
  with its description, instead of a Custom room block and a second,
  collapsed Private Room block under it. The SDK already does so.
- **C. No quick-action tile in the Private list, and a button that says
  what it creates.** The banner above the list held one tile that did the
  same as the create button next to it; it goes. The create button of the
  section and the other entries labelled "New room" there read "New
  private room".
- **D. A section empty state that explains the section.** The empty
  Private list shows the encryption illustration of private rooms, says
  what a private room is (Common:PrivateRoomsListEmptyDescription, the
  text the SDK list already shows) and offers one action,
  Common:CreatePrivateRoom. Today it shows the confetti illustration of
  Rooms, "Please create the first private room." and a tile called
  "Create a new room".
- **E. "Forgot passphrase?" is there from the start.** The unlock dialog
  shows Common:ForgotPassphrase as soon as it opens, wherever a recovery
  path exists, not only after a failed attempt. It keeps its place under
  the remember-device option.

### Texts (English; approved by the owner on 2026-11-13)

| Key | Text | Where |
|-----|------|-------|
| `Common:NewPrivateRoom` (new) | New private room | create button of the Private section, its header action, the "+ New" entry of the list |
| `EmptyView:EmptyRootPrivateRoomsDescription` | Please create the first private room. | removed with its `.meta`; Common:PrivateRoomsListEmptyDescription takes its place |

Common:PrivateRoomsListEmptyDescription, Common:CreatePrivateRoom,
Common:PrivateRoomTitle, Common:PrivateRoomDescription and
Common:ForgotPassphrase exist and keep their texts.

### Out of scope

- The stepped key setup (one process instead of three dialogs) and the
  removal of the "Encryption key required" prompt: wait for a mock-up.
- The name and the icon of the section; a longer description and a
  "Learn more" link in the create panel; inviting a user without a key;
  the two download entries.
- The empty list and the create button of the SDK's private page: the SDK
  has its own, already with Common:CreatePrivateRoom and the explanation.
- The key prompt raised from a room-type card of the generic chooser: the
  Private type is not offered there (sidebar-section, "Generic chooser
  does not offer the Private type").

### Decisions taken by the owner on 2026-11-13

1. The text "New private room" is approved.
2. The quick-action tile is removed altogether. Keeping the banner and
   only renaming the tile was the alternative and is not used.
3. Common:ForgotPassphrase stays under the remember-device option,
   where the decision of 2026-11-11 (`private-rooms-locked-state`,
   decision 5) put it. The designers drew it directly under the field.
4. Common:PrivateRoomsListEmptyDescription is reused as the explanation
   of the empty section; no new text is written.

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: "Starting private room creation
  without a key starts key generation" gains the scenario of the panel
  that is not shown under the prompts; "Private badge in permanent
  settings" becomes one block in both panels.
- `private-rooms/sidebar-section`: "Quick actions in the section" (no
  banner), "Private rooms are created from the section" (no tile among
  the entry points), "Section empty state" (illustration, explanation,
  one action); a new requirement for the label of the create button.
- `private-rooms/key-management`: "Forgot passphrase link" (shown from
  the start).
- `private-rooms/sdk-surface`: a new requirement for the SDK dialog that
  waits for the key.

## Impact

- `packages/client/src/components/dialogs/CreateEditRoomDialog`
  (`CreateRoomDialog.js`, `sub-components/SetRoomParams.js`,
  `sub-components/PermanentSettings`).
- `packages/sdk/src/app/(private)/_components/create-room/PrivateCreateRoomDialog.tsx`.
- `packages/client/src/pages/Home/Hooks/useQuickActions.tsx`,
  `packages/client/src/helpers/quickActions.ts`,
  `packages/client/src/helpers/getSectionCreateButton.ts`,
  `packages/client/src/pages/Home/Section/Header/index.js`,
  `packages/client/src/store/contextOptionsStore/folderModel.helpers.ts`
  (its menu snapshot records i18n keys).
- `packages/client/src/components/EmptyContainer/sub-components/EmptyViewContainer`.
- `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`.
- `public/locales/*/Common.json` and `.meta` (one key added, 32
  languages); `packages/client/public/locales/*/EmptyView.json` and
  `.meta` (one key removed).
- Unit tests of the files above; `private-rooms-section.spec.ts`,
  `keys-management*.spec.ts` and the screenshot `catalog.private-empty.png`.
- No API or dependency change.
