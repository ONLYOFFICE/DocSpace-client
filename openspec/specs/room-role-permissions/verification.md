# room-role-permissions — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `access` = `packages/shared/utils/getAccessOptions.tsx`,
`Members/` = `packages/client/src/pages/Home/InfoPanel/Body/views/Members/`, `matrix` =
`.claude/rules/access-matrix.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it; the room menus by screenshot), **UNIT-CONFIRMED** (a Vitest
test asserts it), **CODE-ONLY** (read from the code, no test), **MATRIX-ONLY** (only the product matrix says it),
**SERVER-SPEC** (the server decides it; cited from `../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Roles offered per room type** | | |
| Custom, Collaboration, Public, Form filling, Virtual Data Room role lists | `access:243-311` | CODE-ONLY |
| Viewer and Room manager and Content creator kept in ordinary rooms | `Members/__tests__/Members.utils.test.ts:45, 52` | UNIT-CONFIRMED |
| Role sets per room type in the product | `matrix`, "Room-type deltas" | MATRIX-ONLY |
| Roles each room type accepts on the server | `../server/openspec/specs/vdr-room-roles/spec.md`; `../server/openspec/specs/form-filling-room-roles/spec.md` | SERVER-SPEC |
| **Paid roles for those who cannot hold them** | | |
| Room manager dropped for groups and for users other than owner, admins, room admins | `Members/sub-components/User.tsx:122-126` | CODE-ONLY |
| Who may hold room owner and room manager | `matrix`, "Which roles a type may hold" | MATRIX-ONLY |
| **The members list of a room** | | |
| Groups of administrators, groups, users, guests, expected; paging | `packages/shared/components/share/Share.helpers.tsx:633-732`; `Members/index.tsx:306-430` | CODE-ONLY |
| Plain role without `canEditAccess`; template without roles | `packages/shared/components/share/sub-components/User.tsx:311-348`; `Members/sub-components/User.tsx:109-110` | CODE-ONLY |
| Members view of a room selected in a list | `Members/__tests__/Members.listSelection.test.tsx:204` | UNIT-CONFIRMED |
| **Changing a member's role** | | |
| Saved with `Common:AccessRightsChanged`; same role ignored; server error shown | `Members/sub-components/User.tsx:137-165, 205-206` | CODE-ONLY |
| Forms-blocking change confirmed and forced | `Members/sub-components/User.tsx:148-152` | CODE-ONLY |
| Role change refused | `Members/__tests__/Members.accessRefusal.test.tsx:219, 233, 251` | UNIT-CONFIRMED |
| **Removing a member** | | |
| Ordinary room: removed without a confirmation, also from a room selected in a list | `Members/__tests__/Members.listSelection.test.tsx:213, 228, 272` | UNIT-CONFIRMED |
| Removal refused | `Members/__tests__/Members.accessRefusal.test.tsx:201` | UNIT-CONFIRMED |
| **Repeating invitations** | | |
| Resend icon for `EditAccess`; `resendEmailInvitations`; success toast | `Members/sub-components/User.tsx:105-135` | CODE-ONLY |
| **Room menus follow the role in the room** | | |
| Room owner, Room manager and Content creator menus per room type | `rooms-context-menu.spec.ts:664-1270` | E2E-CONFIRMED |
| DocSpace admin: Room manager, Content creator, not in the room | `rooms-context-menu.spec.ts:48-662` | E2E-CONFIRMED |
| Room actions per role in the product | `matrix`, "The room" | MATRIX-ONLY |
| **Actions follow the server's rights, not the role name** | | |
| Invite and management actions gated by `security.EditAccess` | `matrix`, "Who may invite into a room"; `Members/sub-components/User.tsx:107-108`; `Members/index.tsx:173-178` | CODE-ONLY |
| Inviting narrows to owner and manager in VDR and Form filling rooms | `../server/openspec/specs/vdr-room-roles/spec.md`; `../server/openspec/specs/form-filling-room-roles/spec.md` | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| "Nobody changes their own role" | The matrix says so, the server lets a Room manager lower their own role; the client shows whatever `canEditAccess` the server sends | `matrix`, "The room"; `../server/openspec/deviations.md`, "Matrix says one thing" |
| Removing a member of a private room, pending access and its retry | Owned by `private-rooms/room-membership` | `Members/__tests__/Members.removalGuard.test.tsx`; `Members.pendingAccess.test.tsx` |
| Agent roles and the removal warning for agents | Owned by the change `ai-chat-agents-design` | `Members/__tests__/Members.utils.test.ts:14-40`; `Members.listSelection.test.tsx:247` |
| File and folder actions per role inside a room | The client follows each entry's `security` flags; the rules are the server's | `matrix`, "Files and folders"; `../server/openspec/specs/room-role-permissions` |
