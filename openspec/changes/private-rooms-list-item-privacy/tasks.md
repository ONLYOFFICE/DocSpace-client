# Tasks

## 1. List items keep the private flag

- [x] 1.1 Return `private: !!isPrivateRoom` from `buildFilesListItems` in `packages/client/src/store/filesStore/filesList.helpers.ts` (design D1); verify with a case in the `filesList.helpers` tests that a private room DTO yields an item with `private: true` and `isPrivateRoom: true`, and update only the affected snapshot keys

## 2. Consumers, tested from a list item

- [x] 2.1 Members tab and member removal: cases named "Members view of a room selected in a list", "Remove member of a room selected in a list" and "Removal from a room selected in a list" in `packages/client/src/pages/Home/InfoPanel/Body/views/Members/` tests, with the room built by `buildFilesListItems` (design D2); verify with `cd packages/client && pnpm exec vitest run InfoPanel/Body/views/Members`
- [x] 2.2 Info panel tabs: a case named "Private room selected in a list" for `helpers/info-panel/tabs.ts`; verify with `pnpm exec vitest run src/helpers/info-panel`
- [x] 2.3 Invite panel: a case named "Invite opened from the list" on the send handler of `components/panels/InvitePanel`, with the room taken from the list, asserting the unlock and the private invite path (design D3); verify with `pnpm exec vitest run InvitePanel`
- [x] 2.4 E2E: select a private room in the Private list with the info panel open and assert no `info_panel_members_links_block` and no Share tab, in `packages/client/__tests__/private-rooms-section.spec.ts`; verify with that spec in Docker

## 3. Integration

- [ ] 3.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify everything is green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-list-item-privacy` after review.
