# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`).

## 1. Administrator leaves a private room

- [x] 1.1 In `onLeaveRoomImpl` (`packages/client/src/store/filesActionsStore/rooms.helpers.ts`) take the member path for a room with the private setting whatever the user's type (design decision 1): remove the row at the root, land on the Private list from inside; keep the administrator path for other rooms; verify with new cases in `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.leaveRoom.test.ts` named after the delta scenarios ("Administrator leaves from the list", "Administrator leaves from inside the room", "Administrator leaves an ordinary room") and `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`. Done 2026-11-06: the helper keeps the administrator path only for a room without the private setting (`keepsReading`), the three cases pass with the five existing ones, client `tsc` clean
- [x] 1.2 Cover the owner change with the leave ticked: a case "Administrator leaves through the owner change" in `FilesActionsStore.changeOwner.test.ts` asserting the row's removal after `setFileOwner` succeeds; verify with `cd packages/client && pnpm exec vitest run src/store/filesActionsStore`. Done 2026-11-06: the case transfers a private room as an administrator with the leave ticked and asserts the role update and the row's removal
- [x] 1.3 Check the SDK leave dialog (`packages/sdk/src/app/(private)`) for an administrator branch of its own and align it if one exists; verify with the SDK unit tests. Done 2026-11-06: nothing to align. The SDK's private pages reuse the generic leave dialog (`packages/sdk/src/app/(rooms)/_components/leave-room-dialog/index.tsx`), which after the role update removes the room from the list (`filesListStore.removeItem`) and, from inside the room, goes to the Private list through `onLeftOpenRoom`, for every user alike; the owner-change leave of `usePrivateOwnerChangeFlow` drops the role and the dialog's `onOwnerChanged` refreshes the list the same way. No SDK code changed, so its unit suite is unchanged
- [ ] 1.4 E2E: a case "Administrator leaves" in `packages/client/__tests__/private-room-members.spec.ts` on the mocked portal, the owner leaving a private room from the list and the row gone; verify with `cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room-members.spec.ts`

## 2. Integration

- [ ] 2.1 Pre-push gate (`pnpm exec tsc` in client and sdk, `pnpm run lint`, `pnpm run test:client`, `pnpm run test:sdk`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify green

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-admin-leave` once 1.1 to 2.1 are on `release/v4.1.0`; the archive adds the requirement to `private-rooms/room-membership`.
