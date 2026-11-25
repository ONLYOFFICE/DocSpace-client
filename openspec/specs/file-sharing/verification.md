# file-sharing — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `useMembers` =
`packages/shared/components/share/hooks/useMembers.tsx`, `User` =
`packages/shared/components/share/sub-components/User.tsx`, `helpers` =
`packages/shared/components/share/Share.helpers.tsx`, `selector` =
`packages/shared/components/share/selector/index.tsx`, `menu` =
`packages/client/src/store/contextOptionsStore/filesContextOptions.helpers.ts`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it; for Recent and Favorites menus, a screenshot comparison),
**UNIT-CONFIRMED** (a Vitest test asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the
server decides it; cited from `../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Who has access to a file or folder** | | |
| `Common:WhoHasAccess` list with an add button, paged on scroll; `Common:ShareForUsers` + `Common:AddUsersOrGroups` when empty | `useMembers:183-189, 253-339` | CODE-ONLY |
| No account list for an entry inside the rooms | `packages/shared/components/share/index.tsx:77-80`; `useMembers:254` | CODE-ONLY |
| Sharing status of a shared file shown | `packages/shared/components/share/Share.test.tsx:174` | UNIT-CONFIRMED |
| **Explanation bar of the Share tab** | | |
| Closable bar remembered per user in the browser; parent-folder bar not closable | `packages/shared/components/share/sub-components/ShareInfoBar.tsx:56-88` | CODE-ONLY |
| **Adding accounts and groups** | | |
| Selector: active accounts, guests, groups, multi-select, already shared shown as `Common:Shared` | `selector:140-174` | CODE-ONLY |
| Preset level Filling for a PDF form, Read only otherwise; levels from the entry | `selector:67-124`; `packages/client/src/components/ShareSelector/index.tsx:85-92` | CODE-ONLY |
| Submit shares with `setFileSecurityInfo` / `setFolderSecurityInfo`, adds to the list, `Common:RoomCreateUser` | `selector:77-109`; `useMembers:147-154`; `packages/shared/services/share-link.service.ts:294-301` | CODE-ONLY |
| Refusal: error shown, selector closes | `selector:103-108` | CODE-ONLY |
| Which accounts may receive a share | `../server/openspec/specs/file-sharing/spec.md`, "Who may share and with whom" | SERVER-SPEC |
| **Access levels offered for a person or a group** | | |
| Levels from `availableShareRights.User` / `.Group`, then Remove; file descriptions by kind; folder labels; owner fixed | `helpers:734-1093` | CODE-ONLY |
| Levels the server accepts outside a room | `../server/openspec/specs/file-sharing/spec.md`, scenario "Accepted access levels" | SERVER-SPEC |
| **Changing or removing a person's access** | | |
| Saved at once with `Common:AccessRightsChanged`; Remove drops the record and the total | `useMembers:216-251` | CODE-ONLY |
| Read-only record without `canEditAccess` | `User:311-348` | CODE-ONLY |
| **Records in the list** | | |
| Avatar, name, type and e-mail, `Common:MeLabel`, owner/admin tooltip | `User:153-308` | CODE-ONLY |
| Group name opens the members dialog, not for a system group | `User:237-247`; `packages/client/src/pages/Home/InfoPanel/Body/views/Share/index.tsx:74-81` | CODE-ONLY |
| **Access changed elsewhere** | | |
| Socket self-restriction events update the record | `useMembers:102-145` | CODE-ONLY |
| **The Shared with me section** | | |
| Section lists shared entries | `shared-with-me.spec.ts:62-76` | E2E-CONFIRMED |
| Empty view | `shared-with-me.spec.ts:78-101` | E2E-CONFIRMED |
| `Common:SharedBy` column shown and hideable | `shared-with-me.spec.ts:229-268` | E2E-CONFIRMED |
| `Common:AccessLevel` column shown and hideable | `shared-with-me.spec.ts:270-311` | E2E-CONFIRMED |
| **Removing an entry from Shared with me** | | |
| Context menu: confirm, entry removed, empty view | `shared-with-me.spec.ts:103-159`; `menu:1044-1058`; `packages/client/src/components/dialogs/DeleteDialog/index.js:157, 209-210, 293` | E2E-CONFIRMED |
| Header menu: confirm, entry removed, empty view | `shared-with-me.spec.ts:161-227` | E2E-CONFIRMED |
| Offered only in Shared with me | `menu:1053-1057` | CODE-ONLY |
| **Removing a room reached by a link from the list** | | |
| `removeSecurityInfo` for a room reached by link; disabled for owner, admins and rooms not reached by link | `menu:903-913`; `packages/client/src/store/contextOptionsStore/actions.helpers.tsx:379-417` | CODE-ONLY |
| **The Recent section** | | |
| The editor adds an opened document with `addFileToRecent` | `packages/doceditor/src/hooks/useEditorEvents.ts:1203` | CODE-ONLY |
| List and empty view | `recent.spec.ts:57-90` | E2E-CONFIRMED |
| Remove from list: removed, `Files:RemovedFromRecent` | `recent.spec.ts:191-222`; `packages/client/src/store/filesActionsStore/selection.helpers.ts:734-752` | E2E-CONFIRMED |
| Offered only in Recent | `menu:1037-1043` | CODE-ONLY |
| **Favorites** | | |
| Mark: `Common:MarkedAsFavorite` | `favorites.spec.ts:312-343`; `packages/client/src/store/ContextOptionsStore.tsx:373-384` | E2E-CONFIRMED |
| Remove in Favorites: entry dropped, empty view | `favorites.spec.ts:101-153`; `packages/client/src/store/filesActionsStore/rooms.helpers.ts:102-112` | E2E-CONFIRMED |
| Section and empty view | `favorites.spec.ts:59-99` | E2E-CONFIRMED |
| **Context menus of Recent and Favorites entries** | | |
| Recent: file by link, in a room, shared with me, Archive, image, plain file | `recent.spec.ts:92-189` (screenshots) | E2E-CONFIRMED |
| Favorites: folder, file by link, in a room, shared, Archive, image | `favorites.spec.ts:155-310` (screenshots) | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| A debugging `console.log` in the editing description of spreadsheets, presentations and PDFs | Not observable to a user; a code cleanup | `helpers:789-793` |
| Access-pending rows and their retry | Private rooms (`private-rooms/room-membership`) | `User:87-130, 264-306` |
| Sharing from the SDK personal files | Owned by `sdk-embedding` | `packages/sdk/src/app/(personal-files)/_components/share-selector` |
