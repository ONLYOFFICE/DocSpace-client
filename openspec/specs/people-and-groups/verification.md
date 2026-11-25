# people-and-groups — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `dialogs/` = `packages/client/src/components/dialogs/`, `ctx` =
`packages/client/src/store/contacts/ContactsContextOptionsStore.ts`, `users` =
`packages/client/src/store/contacts/UsersStore.ts`, `filter` =
`packages/client/src/pages/Home/Section/Filter/useContacts.tsx`, `server` =
`../server/openspec/specs/people-and-groups/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **CODE-ONLY** (read from the code, no
test), **SERVER-SPEC** (the server decides it; cited from `../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Tabs of Accounts** | | |
| Members, Groups, Guests; group view titled by the group | `packages/client/src/pages/Home/Section/Header/index.js:800-815`; `packages/client/src/routes/contacts.js:62-159` | CODE-ONLY |
| Opening a group | `packages/client/src/store/contacts/GroupsStore.ts:600-620` | CODE-ONLY |
| **Columns of the account lists** | | |
| Members and guests columns; inviter and date not for a Room admin | `packages/client/src/pages/Home/Section/ContactsBody/Users/TableView/TableHeader.tsx:80-170` | CODE-ONLY |
| Load more on scroll | `users:899-924` | CODE-ONLY |
| **Sorting the lists** | | |
| Sort options per tab | `filter:761-854` | CODE-ONLY |
| **Filtering the lists** | | |
| Filter groups per tab | `filter:524-748` | CODE-ONLY |
| Groups selector opens from Group → Other, picks by keyboard, Escape returns, cross clears | `people-filter-groups-selector.spec.ts:113, 142, 182, 196, 222` | E2E-CONFIRMED |
| Filtered lists on the server | `server`, "Filtered people lists"; "Listing and filtering groups" | SERVER-SPEC |
| **Changing an account's type** | | |
| Confirmation; reassignment check before lowering; same type ignored | `users:1427-1504` | CODE-ONLY |
| Type change as a queued job with progress | `server`, "Watching a type conversion"; "Cancelling a type conversion" | SERVER-SPEC |
| **Disabling and enabling accounts** | | |
| Dialog worded for users or guests, success toast | `dialogs/ChangeUserStatusDialog/index.tsx:94-105` | CODE-ONLY |
| **Deleting accounts** | | |
| Cannot be undone; reassign link for a single account that needs it | `dialogs/DeleteProfileEverDialog/sub-components/BodyComponent.tsx:100-180` | CODE-ONLY |
| Remove guest confirmation | `dialogs/RemoveGuest/index.tsx:80` | CODE-ONLY |
| Deleting needs a disabled account | `server`, "Deleting one disabled profile"; "Deleting several disabled profiles" | SERVER-SPEC |
| **Reassigning data** | | |
| New owner among active admins and Room admins, not the account itself | `dialogs/DataReassignmentDialog/index.js:182-226` | CODE-ONLY |
| Progress, abort, start again, delete when finished; rooms only for a User or a Guest | `dialogs/DataReassignmentDialog/sub-components/Body/index.js:50-69`; `Body/Progress.js:54-154`; `Body/Description.js:47-51`; `Footer/index.js:49-87` | CODE-ONLY |
| Reassignment on the server | `server`, "Starting a data reassignment"; "Watching a data reassignment"; "Cancelling a data reassignment" | SERVER-SPEC |
| **Editing another account** | | |
| Name, email, password actions, not for SSO or LDAP | `users:744-773`; `ctx:192-215` | CODE-ONLY |
| Email validated and instructions sent; password instructions sent | `dialogs/ChangeEmailDialog/index.js:100, 197`; `dialogs/ChangePasswordDialog/index.js:75` | CODE-ONLY |
| Email change rules | `server`, "Validation of an email change"; "Immediate change versus instructions" | SERVER-SPEC |
| **Repeating invitations** | | |
| Single and multiple, toast | `packages/client/src/helpers/contacts/utils.ts:267-283`; `dialogs/SendInviteDialog/index.js:67`; `ctx:283-292, 494-500` | CODE-ONLY |
| **Sharing a guest and an account's rooms** | | |
| Guest link copied with a toast | `packages/client/src/helpers/contacts/utils.ts:285-293` | CODE-ONLY |
| Rooms filtered by member in a new tab | `ctx:549-565` | CODE-ONLY |
| **Creating and editing groups** | | |
| Create needs a name and a head; edit needs a change and a name with head or members | `dialogs/CreateEditGroupDialog/CreateGroupDialog.tsx:198`; `dialogs/CreateEditGroupDialog/EditGroupDialog.tsx:191, 251` | CODE-ONLY |
| Member selector without guests | `dialogs/CreateEditGroupDialog/sub-components/MembersSelector/MembersSelector.tsx:72`; `.claude/rules/access-matrix.md`, "Adding guests to groups" | CODE-ONLY |
| Delete confirmation | `dialogs/DeleteGroupDialog/index.js:89` | CODE-ONLY |
| Groups on the server | `server`, "Creating a group" … "Setting the group manager" | SERVER-SPEC |
| **Info panel of an account or a group** | | |
| Account fields, type selector when allowed | `packages/client/src/pages/Home/InfoPanel/Body/views/Users/index.tsx:173-310` | CODE-ONLY |
| Group head, members count, LDAP mark | `packages/client/src/pages/Home/InfoPanel/Body/views/Groups/` | CODE-ONLY |
| **Changing the type on a phone** | | |
| Row stays in place; every type described; no scroll | `contacts-change-type-mobile.spec.ts:131, 155, 183, 193` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Arrow keys, selection and copy shortcuts in the lists | Owned by `keyboard-and-hotkeys` | `contacts-hotkeys.spec.ts` |
| Storage quota column, filter and actions | Owned by `quotas` | `filter:690-691` |
| AI spending column and limit | Owned by the change `ai-chat-agents-design` | `ctx:327-334` |
| Who may do each action | Owned by `user-type-permissions` | `packages/client/src/store/AccessRightsStore.ts` |
| A "delete personal data" option that no account's menu includes | Not reachable in the UI | `ctx:255-262` |
