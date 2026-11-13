# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes and no mock handler changes. The text and the decisions of proposal.md were approved by the owner on 2026-11-13. Task 3.2 adds the new key in English; group 6 translates it.

## 1. Create-room panel waits for the key

- [x] 1.1 Client: show the aside panel of a creation started on the Private type only once the key list is known to hold a key, in `packages/client/src/components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js` (design decision 1). Verify: cases "No dialog under the prompts", "Key list still loading", "User accepts key generation" and "User cancels key generation" in `CreateRoomDialog.privateRoom.test.tsx` and `CreateRoomDialog.keyGenerationCancel.test.tsx`; `cd packages/client && pnpm exec vitest run src/components/dialogs/CreateEditRoomDialog`
  - 2026-11-13: the panel is hidden through its `visible` prop while a creation locked on the Private type has no key: the gate, its effect and its callbacks stay in the dialog. The panel also appears when the key was generated but the refresh of the key list failed, so a registered key never leaves the user without the panel. A creation started from a template or a room-type card keeps its dialog, as before.
- [x] 1.2 SDK: show the creation dialog only while the key list may hold a key, in `packages/sdk/src/app/(private)/_components/create-room/PrivateCreateRoomDialog.tsx` (decision 2). Verify: cases "Key-less user starts a private room", "Prompt cancelled", "Key holder" and "Editing a room" in `PrivateCreateRoomDialog.test.tsx`; `cd packages/sdk && pnpm exec vitest run "src/app/(private)"`
  - 2026-11-13: the dialog is hidden only for a creation whose key list is known to be empty; an unknown list and an edit keep it shown, as before. It appears once key generation reports success, whether or not the reload of the keys has finished.

## 2. Edit panel

- [x] 2.1 Client: show the Private type block in the edit panel of a private room and drop the private block of `PermanentSettings` (decision 3). Verify: cases "Edit dialog of a private room", "Create dialog of a private room" and "Edit dialog of an ordinary Custom room" in unit tests of `SetRoomParams` and `PermanentSettings`; `pnpm exec vitest run src/components/dialogs/CreateEditRoomDialog`
  - 2026-11-13: the display block takes its type from one helper, `getDisplayedRoomType` (`sub-components/displayedRoomType.ts`), which the three cases test; `SetRoomParams` has no render test and none was added. `PermanentSettings` lost its private block and its `isPrivate` prop; a case renders it and finds no private title. The `privacy` variant of `PermanentSetting` and its style have no caller left and are not removed here.

## 3. Private list: quick actions and create label

- [x] 3.1 Client: give the Private list root no quick-action section and remove the Private room tile, in `helpers/quickActions.ts` and `pages/Home/Hooks/useQuickActions.tsx` (decision 4). Verify: cases "Banner on a non-empty Private list" and "Banner inside a private room" in `helpers/__tests__/quickActions.test.ts` and `useQuickActions.test.tsx`; `pnpm exec vitest run src/helpers src/pages/Home/Hooks`
  - 2026-11-13: the section `private-rooms` and its tile are gone from `helpers/quickActions.ts` and `useQuickActions.tsx`, with the `onCreatePrivateRoom` callback and the `onCreateRoom` prop of `Home/index.js` that only fed it. The Private list is then laid out without the banner. The quick actions inside a private room are untouched.
- [x] 3.2 Client: add Common:NewPrivateRoom in English and use it for the create button, the header action and the "+ New" entry on a Private address (decision 5). Verify: cases "Create button in the Private list" and "Create button in the Rooms list" in the unit test of `getSectionCreateButton` and of the folder menu; the menu snapshot differs by that key only (`pnpm exec vitest run src/store/contextOptionsStore`, `git diff` of `__snapshots__`); `pnpm exec vitest run src/helpers src/store/contextOptionsStore`
  - 2026-11-13: one helper, `getNewRoomLabel` in `helpers/newRoomLabel.ts`, picks the label by the address, with the test `onCreateRoom` uses; the create button (`getSectionCreateButton.ts`, which the mobile create button shares), the header action and the "+ New" entry call it. The two cases are unit tests of the helper; `getSectionCreateButton` has no test of its own and none was added. The menu snapshots did not change: their harness runs on a Rooms address.

## 4. Section empty state

- [x] 4.1 Client: give the empty Private list the illustration of an empty private room, Common:PrivateRoomsListEmptyDescription and a create tile titled Common:CreatePrivateRoom (decision 6). Verify: cases "Room admin without private rooms", "User without private rooms", "Illustration of the section" and "Rooms section unchanged" in unit tests of the empty-view helpers; `pnpm exec vitest run src/components/EmptyContainer`; `cd common/tests && npx vitest run test/images.test.js`
  - 2026-11-13: the illustration, the description and the options take the `isPrivateScope` flag the title already took; the create tile keeps the icon and the description of the shared tile and takes the title Common:CreatePrivateRoom. The four cases call the helpers of the view in `__tests__/privateSectionEmptyState.test.tsx`. EmptyView:EmptyRootPrivateRoomsDescription has no reader left; its removal from the locale files is task 6.1. `images.test.js` passes.

## 5. Forgot passphrase link

- [x] 5.1 Shared: show Common:ForgotPassphrase in the unlock dialog whenever a handler is passed, in `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` (decision 7). Verify: cases "Link before any attempt", "Link after failure", "Link under the remember option" and "Passphrase creation" in `PassphraseModal.test.tsx`, with "Option placed with the passphrase field" still passing; `cd packages/shared && pnpm exec vitest run dialogs/passphrase-modal`
  - 2026-11-13: the link depends on the handler alone and is left out of the passphrase-creation dialog; its place in the markup, after the remember row, did not move, so "Option placed with the passphrase field" and the Tab-order cases pass unchanged. The link of the passphrase-change dialog keeps its own rule.

## 6. Texts

- [x] 6.1 Common: remove EmptyView:EmptyRootPrivateRoomsDescription with its `.meta` from the 32 languages, write the translator comment of Common:NewPrivateRoom (`translate-comments`) and translate it into the 31 other languages (`translate-locales`) (decision 8). Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no failure beyond the keys foreign to this change; `npm --prefix ./common/tests run test:lefthook`; foreign `.meta` files restored
  - 2026-11-13: EmptyView:EmptyRootPrivateRoomsDescription is removed from the 32 `EmptyView.json` files of the client and from `.meta`. Common:NewPrivateRoom got its translator comment from the call site (model `claude-fable-5-2`) and its 31 translations, each built from the language's own words for "new room" and "private room". The metadata run rewrote 934 foreign `.meta` files and created two for foreign keys; all restored or removed. `locales.test.js`: 44 of 46, the two completeness cases failing on the six foreign AI keys only; `test:lefthook`: 61 passed, 3 skipped.

## 7. E2E

- [x] 7.1 Client: update `private-rooms-section.spec.ts` for the panel that waits for the key, the list without a banner, the create label and the new empty state, and `keys-management*.spec.ts` or the room-entry specs for the link shown from the start; run the private-room, encrypted-file, key-flow and keys-management specs in Docker `tests-dev`. Verify: no failure beyond the ones known before this change; every screenshot that changes (`catalog.private-empty.png` among them) is updated only through the Docker update script, looked at and named here
  - 2026-11-13: Docker `tests-dev`, `WORKERS=3`. Full run of the private-room, encrypted-file, key-flow and keys-management specs: 174 passed, 3 failed. Two were the new assertion of this task: a closed aside panel stays mounted and is moved off screen, so `toBeHidden` does not hold for it; the cases now assert that the Create button of the panel is not in the viewport while the key prompt is shown. The third, "Re-encryption aborted: the panel is closed" of `private-room-invite.spec.ts`, did not repeat. Rerun of `private-rooms-section.spec.ts` and `private-room-invite.spec.ts`: 74 of 74. Spec changes: the empty section expects the explanation and a tile titled "Create private room"; "Banner on a non-empty Private list" expects no tile at all; a new case reads "New private room" on the create button; the first case of `encrypted-file-ui.spec.ts` expects the forgot-passphrase link in the prompt before any attempt. No Playwright screenshot changed. `catalog.private-empty.png` belongs to `packages/client/tests/catalog_tests.js`, a suite the Playwright runs do not include; it was not run and its screenshot is not updated.

## 8. Gate

- [x] 8.1 Run the gate, every command on its own with its exit code read: `pnpm exec tsc` in the six packages, the shared, client, sdk and doceditor unit suites, `biome lint` in the packages touched, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main specs included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date
  - 2026-11-13: each command run on its own with its exit code read. `pnpm exec tsc` exit 0 in shared, client, sdk, doceditor, login and management. Unit suites, all exit 0: shared 2381, client 2237, sdk 506, doceditor 125. `biome lint` exit 0 in shared, client and sdk. `test:lefthook`: 61 passed, 3 skipped. `locales.test.js`: 44 of 46, the two completeness cases failing on the six foreign AI keys only. E2E as recorded in 7.1. `openspec validate --all --strict`: 21 of 21; after a trial archive of `private-rooms-design-review-quick-fixes` and then this change on a scratch copy, 19 of 19 with the main specs included.

## Workflow follow-up

- Archive after 8.1; `private-rooms-design-review-quick-fixes` is archived first, since both change room-membership and key-management.
- The translations are not reviewed by native speakers.
- The stepped key setup is proposed as a change of its own once the designers send its mock-up.
