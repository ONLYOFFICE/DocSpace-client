# Tasks

One task is one commit with its tick (the "Commits" paragraph of
`openspec/config.yaml`). No locale changes. Keep the pre-push gate in mind:
tsc, biome, locale tests, shared, client and sdk unit tests must stay green.

## 1. Wording

- [ ] 1.1 Add the case "Other room type" to `packages/client/src/store/__tests__/CreateEditRoomStore.privateRoom.test.ts`: creating a Public, a Form filling, a Virtual data and a Collaboration room sends the room's own type with `private` false (design decision 3). Verify: `cd packages/client && pnpm exec vitest run src/store/__tests__/CreateEditRoomStore.privateRoom.test.ts`
- [ ] 1.2 Confirm the existing test matches the corrected frame scenario, with no edit expected: the block "Frame opened in the Private section" of `packages/client/src/helpers/__tests__/privateRoomsSectionNavigation.test.ts` (search area `PrivateRooms`, no privacy filter). Verify: `cd packages/client && pnpm exec vitest run src/helpers/__tests__/privateRoomsSectionNavigation.test.ts`, green, recorded here with the date

## 2. Room address without the folder parameter

- [ ] 2.1 In `packages/client/src/pages/Home/Hooks/useFiles.ts`, when a private room address carries no `folder` in its query, replace it with `/private/{room}/filter?folder={room}` from the route parameter (design decision 1), leaving an address with other list parameters as it is; do the same for the Rooms room address, `/rooms/shared/{room}/filter` (owner, 2026-11-19). Verify: the cases "Room address without the folder parameter" (the address is replaced once with the room's id and never becomes `/private/undefined/filter`) and "Room address" (an address with `?folder=` is not replaced), each for the private and for the Rooms address, in a new `packages/client/src/pages/Home/Hooks/__tests__/useFiles.privateRoomAddress.test.ts` (`cd packages/client && pnpm exec vitest run src/pages/Home/Hooks/__tests__/useFiles.privateRoomAddress.test.ts`), and `cd packages/client && pnpm exec tsc`
- [ ] 2.2 E2E: add the case "Room address without the folder parameter" to `packages/client/__tests__/private-rooms-section.spec.ts`: `/private/{roomId}/filter` opened with no query shows the room's files, the Private item is highlighted and the address ends with `?folder={roomId}`; and a case of the same name for an ordinary room at `/rooms/shared/{roomId}/filter` in the rooms spec that already opens a room by its address. Verify: `cd packages/client && docker-compose -f compose.yaml run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/private-rooms-section.spec.ts --reporter=line`, no failed case

## 3. Gate

- [ ] 3.1 Run the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `pnpm nx run-many -t tsc lint test --parallel=3`), each command on its own with its exit code read, and `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.17.0 validate --all --strict` on the branch and after a trial archive on a scratch copy of `openspec/`. Verify: every command green, recorded here with the date and counts

## Workflow follow-up

- Archive after 3.1. Before archiving, check that no change archived in
  the meantime modified the same three requirements; merge by hand if one
  did.
