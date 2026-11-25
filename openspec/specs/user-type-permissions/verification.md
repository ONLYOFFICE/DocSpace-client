# user-type-permissions — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `route` = `packages/shared/routes/Route.private.tsx`, `ctx` =
`packages/client/src/store/contacts/ContactsContextOptionsStore.ts`, `users` =
`packages/client/src/store/contacts/UsersStore.ts`, `rights` = `packages/client/src/store/AccessRightsStore.ts`,
`server` = `../server/openspec/specs/user-type-permissions/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **CODE-ONLY** (read from the code, no
test), **SERVER-SPEC** (the server decides it; cited from `../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Sections by user type** | | |
| Owner, DocSpace admin, Room admin see the Accounts list | `accounts-access.spec.ts:58, 72, 87` | E2E-CONFIRMED |
| User and Guest get the no-access empty view | `accounts-access.spec.ts:130, 147` | E2E-CONFIRMED |
| No Contacts entry in the profile menu for a User or a Guest | `packages/client/src/store/ProfileActionsStore.tsx:583-586` | CODE-ONLY |
| Portal settings for Owner and DocSpace admin, 401 otherwise | `packages/client/src/pages/PortalSettings/index.js:74`; `route:417-429` | CODE-ONLY |
| My documents closed to a Guest without a personal folder | `packages/client/src/routes/client.js:122-136`; `route:421-422` | CODE-ONLY |
| Section matrix on the server | `server`, "Section availability by user type" | SERVER-SPEC |
| **Creating rooms** | | |
| Create action follows the section's `security.Create` | `packages/client/src/pages/Home/Section/Header/index.js:892-898, 1065-1071` | CODE-ONLY |
| Create action disappears when the type is lowered | `rooms-forbidden.spec.ts:206` | E2E-CONFIRMED |
| Who may create rooms | `server`, "Room creation and management in the Rooms section" | SERVER-SPEC |
| **Inviting to the portal by type** | | |
| Invite menu per caller type, nothing while inviting is off | `ctx:697-777` | CODE-ONLY |
| Invitation matrix | `server`, "Inviting users by type" | SERVER-SPEC |
| **Changing another account's type** | | |
| Owner's type list includes DocSpace admin, each with a description | `contacts-change-type-mobile.spec.ts:155` | E2E-CONFIRMED |
| Options per caller; Guest only while guests may be invited | `ctx:353-445` | CODE-ONLY |
| Not for self, the Owner, a disabled account, another admin to an admin | `rights:130-157` | CODE-ONLY |
| Room admin turns a guest into a User without a list | `ctx:310-326, 471-486` | CODE-ONLY |
| Type change matrix | `server`, "Changing a user's type" | SERVER-SPEC |
| **Disabling, deleting and reassigning accounts** | | |
| Actions per caller and status; reassign not for a guest; no disable for LDAP | `users:756-818`; `rights:191-273` | CODE-ONLY |
| Disable and delete matrix | `server`, "Disabling, deleting and reassigning users" | SERVER-SPEC |
| **Guests of a Room admin** | | |
| Room list, share link, change type, remove | `users:783-790, 811-816, 877-883` | CODE-ONLY |
| No inviter filter or sort; no disabled status filter | `packages/client/src/pages/Home/Section/Filter/useContacts.tsx:576-582, 684, 817` | CODE-ONLY |
| Only own guests listed | `server`, "Groups and guest lists in Accounts" | SERVER-SPEC |
| **Managing groups** | | |
| Edit and Delete only for Owner and admins, not for LDAP groups | `packages/client/src/store/contacts/GroupsStore.ts:485-493, 539-589` | CODE-ONLY |
| No create action for a Room admin on the Groups tab | `ctx:669-679` | CODE-ONLY |
| Group management on the server | `server`, "Groups and guest lists in Accounts" | SERVER-SPEC |
| **Portal owner actions** | | |
| Owner change on own row, reset authenticator, disabled without an app | `users:752-755, 775-777`; `ctx:293-301` | CODE-ONLY |
| **Own type lowered during a session** | | |
| Bar with reload, room re-read, create action gone | `rooms-forbidden.spec.ts:206` | E2E-CONFIRMED |
| Bar dismissed; raised type shows none; unchanged type shows none | `rooms-forbidden.spec.ts:257, 275, 367` | E2E-CONFIRMED |
| Rights re-read inside a subfolder | `rooms-forbidden.spec.ts:444` | E2E-CONFIRMED |
| Lowered to Guest: who changed it; read-only personal folder warning | `users:276-293`; `packages/client/src/components/dialogs/ReducedRightsDialog/index.tsx:82-86`; `packages/client/src/pages/Home/Section/getWarningText.tsx:65-66` | CODE-ONLY |
| **A refused request keeps the user in place** | | |
| One toast, room stays open | `rooms-forbidden.spec.ts:148, 478` | E2E-CONFIRMED |
| Lowered type found after a denial or a socket reconnect | `rooms-forbidden.spec.ts:314, 344` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Room menus of a DocSpace admin who is not a member | Owned by `room-role-permissions` | `rooms-context-menu.spec.ts:458-662` |
| Billing pages and the Billing entry by type | Owned by `billing` | `billing-access.spec.ts` |
| Developer tools and Docs Connect by type | Owned by `webhooks-and-api-keys` | `dev-tools-access.spec.ts` |
| The dashboard's create section disabled for a guest | Owned by `dashboard` | `guest-restrictions.spec.ts` |
| Changing the AI spending limit of an account | Owned by the change `ai-chat-agents-design` | `ctx:327-334` |
| Storage quota of an account | Owned by `quotas` | `rights:275-300` |
