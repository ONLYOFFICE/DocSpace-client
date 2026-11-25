# room-types — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `dialog/` =
`packages/client/src/components/dialogs/CreateEditRoomDialog/`, `SetRoomParams` =
`dialog/sub-components/SetRoomParams.js`, `actions/` =
`packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Room types offered for creation** | | |
| Five types; no AI or private type in the Rooms chooser | `packages/shared/utils/rooms.tsx:58-62, 144-147` | CODE-ONLY |
| Which types exist and where they live | `../server/openspec/specs/room-types/spec.md`, "Room types offered by the API" | SERVER-SPEC |
| Type fixed in the edit dialog | `SetRoomParams:460-480`; `dialog/sub-components/__tests__/displayedRoomType.test.tsx:64` | UNIT-CONFIRMED |
| **Name, tags and logo** | | |
| Name required, forbidden characters refused | `SetRoomParams:494-510` | CODE-ONLY |
| Tags and logo or cover | `SetRoomParams:293-400, 516-530` | CODE-ONLY |
| **Settings of a Virtual Data Room** | | |
| Indexing, lifetime, copy and download restriction, watermarks | `dialog/sub-components/VirtualDataRoomBlock.js:151-205` | CODE-ONLY |
| New room: indexing, restriction and watermarks on, no lifetime | `packages/shared/utils/rooms.tsx:149-161` | CODE-ONLY |
| Lifetime on an existing room asks first | `dialog/sub-components/VirtualDataRoomBlock.js:132-143` | CODE-ONLY |
| **Settings of a Form filling room** | | |
| XLSX results and database export, on for a new room; connection hint | `dialog/sub-components/FormRoomBlock/FormRoomBlock.tsx:63-99`; `IntegrationBar.tsx:81-95`; `packages/shared/utils/rooms.tsx:185-186` | CODE-ONLY |
| **Storage of a Public room** | | |
| Third-party storage at creation, not from a template; no quota on third-party storage | `SetRoomParams:570-593` | CODE-ONLY |
| **Storage quota of a room** | | |
| Quota in the dialogs when a default is set | `SetRoomParams:570-579` | CODE-ONLY |
| Set, turn off (-1) and reset | `actions/rooms.test.ts:105, 131, 140` | UNIT-CONFIRMED |
| **Room templates** | | |
| Save as template, open it | `packages/client/src/components/dialogs/CreateRoomTemplate/CreateRoomTemplate.tsx:249-297` | CODE-ONLY |
| Template access list; room from a template | `SetRoomParams:531-538`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.simple.test.ts:137` | CODE-ONLY |
| Template rules | `../server/openspec/specs/room-types/spec.md`, "Room templates" … "Creating a room from a template" | SERVER-SPEC |
| **Room groups** | | |
| Edit room groups panel, toggle, Save/Cancel, revert | `room-grouping.spec.ts:132-335` | E2E-CONFIRMED |
| Group items disabled with grouping off; info tooltip | `room-grouping.spec.ts:337-491` | E2E-CONFIRMED |
| Tags row filters, All rooms active by default, hidden when off | `room-grouping.spec.ts:493-606` | E2E-CONFIRMED |
| Create group from the header menu; Create new group disabled when off | `room-grouping.spec.ts:608-860` | E2E-CONFIRMED |
| Delete asks, Cancel keeps; group item opens its rooms | `room-grouping.spec.ts:862-1026` | E2E-CONFIRMED |
| **Choosing rooms for a group** | | |
| Select disabled until a room is picked | `room-grouping.spec.ts:757` | E2E-CONFIRMED |
| Focus, arrows, Space/Enter, Enter after scrolling, Escape returns focus | `room-grouping.spec.ts:1144-1250` | E2E-CONFIRMED |
| **Pinning rooms** | | |
| Pin only unpinned, unpin only pinned | `actions/rooms.test.ts:15, 50` | UNIT-CONFIRMED |
| **Archiving and restoring rooms** | | |
| Archive dialog; restore dialog; quota warning on restore | `actions/rooms.test.ts:63, 79, 92`; `packages/client/src/components/dialogs/ArchiveDialog/index.js:84-102` | UNIT-CONFIRMED |
| **Deleting rooms** | | |
| Operation with progress | `actions/archiveDelete.test.ts:38` | UNIT-CONFIRMED |
| **Leaving a room** | | |
| Confirmation; owner offered Assign owner; form filler warning | `packages/client/src/components/dialogs/LeaveRoomDialog/index.js:66-141` | CODE-ONLY |
| Leave succeeds, refused, fails | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.leaveRoom.test.ts:64-145` | UNIT-CONFIRMED |
| Administrator leaving from the list or from inside the room | `FilesActionsStore.leaveRoom.test.ts:228-277` | UNIT-CONFIRMED |
| **Changing the room owner** | | |
| Owner change, leaving afterwards, refusal keeps the server's error | `actions/changeOwner.test.ts:124, 141, 164, 194, 221` | UNIT-CONFIRMED |
| Owner change from the edit dialog | `SetRoomParams:540-546` | CODE-ONLY |
| **Index of a Virtual Data Room** | | |
| Order saved, reorder leaves index mode | `actions/index.test.ts:31, 49, 58` | UNIT-CONFIRMED |
| One export at a time; success toast | `actions/exportIndex.test.ts:18, 26, 37` | UNIT-CONFIRMED |
| **Lifetime mark in the Rooms list** | | |
| Icon on the title line, truncation, tooltip | `room-grouping.spec.ts:1028-1142` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Public room type disabled under an external sharing restriction | Owned by `shared-links` | `external-sharing-rooms.spec.ts:165, 209` |
| Private room creation and its key generation | Owned by `private-rooms` | `dialog/__tests__/CreateRoomDialog.privateRoom.test.tsx` |
| Leaving agents, knowledge bases and skill sets | Owned by the change `ai-chat-agents-design` | `FilesActionsStore.leaveRoom.test.ts:188` |
