# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes and no mock handler changes. The texts and the decisions of proposal.md were approved by the owner on 2026-11-13. Tasks 1.1 and 3.1 change the English values; group 4 translates them.

## 1. Description of the Private Room block

- [x] 1.1 Shared, client and SDK: add Common:PrivateRoomPanelDescription in English, return it from `getRoomTypeDescriptionTranslation` for the Private type and read it in the private row of the SDK dialog (design decision 1). Verify: cases "Edit dialog of a private room" and "Create dialog of a private room" in `RoomType.test.tsx`, "Creating a private room" in the unit test of the SDK dialog; `cd packages/shared && pnpm exec vitest run components/room-type`; `cd packages/sdk && pnpm exec vitest run "src/app/(rooms)"`
  - 2026-11-13: `getRoomTypeDescriptionTranslation` returns the new key for the Private type and the SDK row reads it; Common:PrivateRoomDescription keeps its tooltip and tile readers. The edit dialog shows the same component with the same type, so one unit case, "Create dialog of a private room" in `RoomType.test.tsx`, covers both panels; "Creating a private room" is in `index.private.test.tsx` of the SDK dialog and also finds no link there.

## 2. Learn more link

- [x] 2.1 Shared and client: add the `privateRoomsHelpUrl` getter to `SettingsStore`, the optional `helpUrl` prop to `RoomType`, and pass it from `SetRoomParams.js` for the Private type (decisions 2 and 3). Verify: cases "Help article configured" and "No help article" in `RoomType.test.tsx` and in a unit test of the getter (entry present, entry missing, domain missing); `cd packages/shared && pnpm exec vitest run components/room-type store`; `cd packages/client && pnpm exec vitest run src/components/dialogs/CreateEditRoomDialog`
  - 2026-11-13: `SettingsStore.privateRoomsHelpUrl` joins the help-center domain and the entry `privaterooms` and is `undefined` when either is missing; the entry is an optional field of `THelpCenterEntries`. `RoomType` takes `helpUrl` and shows the link only in its display variant, which the type union now lists; `SetRoomParams.js` passes the address only when the displayed type is Private. The getter cases are in `SettingsStore.helpUrls.test.ts`; a third block case finds no link in the chooser variant.

## 3. Label of the download entry

- [ ] 3.1 Common: reword Common:DownloadWithoutDecryption in English to "Download encrypted copy" and update the E2E specs that find the entry by its text (decision 4). Verify: case "Label of the entry" in `encrypted-file-ui.spec.ts`; the menu snapshots do not change (`cd packages/client && pnpm exec vitest run src/store/contextOptionsStore src/store/filesActionsStore`, `git diff` of `__snapshots__` empty)

## 4. Texts

- [ ] 4.1 Common: write the translator comments of the two keys (`translate-comments`) and translate them into the 31 other languages (`translate-locales`) (decision 5). Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no failure beyond the keys foreign to this change; `npm --prefix ./common/tests run test:lefthook`; foreign `.meta` files restored

## 5. E2E

- [ ] 5.1 Client: run `encrypted-file-ui.spec.ts`, `private-room-cross-user-download.spec.ts` and `private-rooms-section.spec.ts` in Docker `tests-dev`. Verify: no failure beyond the ones known before this change; every screenshot that changes is updated only through the Docker update script, looked at and named here

## 6. Gate

- [ ] 6.1 Run the gate, every command on its own with its exit code read: `pnpm exec tsc` in the six packages, the shared, client, sdk and doceditor unit suites, `biome lint` in the packages touched, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main specs included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- The `privaterooms` entry of the help center is added in `../buildtools` when the article has an address; until then the link is not shown.
- The translations are not reviewed by native speakers.
