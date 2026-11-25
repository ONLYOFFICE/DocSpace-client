# invitations — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; client
E2E paths omit `packages/client/__tests__/`, login E2E paths omit `packages/login/__tests__/`. Shorthands: `panel/` =
`packages/client/src/components/panels/InvitePanel/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The invite panel** | | |
| Add manually or from the list, type or role per invitee, remove, send, `Common:UsersInvited` | `panel/index.js:600-680, 1327`; `panel/sub-components/InviteInput.js:628-654`; `panel/sub-components/Item.js:372-386` | CODE-ONLY |
| Offered in Accounts and for a room with `EditAccess` | `.claude/rules/access-matrix.md`, "Who may invite into a room" | CODE-ONLY |
| Result after sending | `panel/__tests__/InviteResult.test.tsx` | UNIT-CONFIRMED |
| **Checking the invitees** | | |
| Invalid email, already added, disabled, no match | `panel/sub-components/Item.js:265, 357-358`; `panel/sub-components/InviteInput.js:348-553` | CODE-ONLY |
| **Roles a type cannot hold** | | |
| Role lowered to the highest allowed, with the warning | `panel/utils/index.js:82-87`; `panel/utils/__tests__/makeFreeRole.test.ts` | UNIT-CONFIRMED |
| **Inviting guests** | | |
| Invite as guest; link description for guests or members | `panel/sub-components/InviteInput.js:585, 653-654`; `panel/sub-components/ExternalLinks.js:168-175` | CODE-ONLY |
| Who may invite guests | `../server/openspec/specs/invitations/spec.md`, "Room invitation by email" | SERVER-SPEC |
| **Invitation link of a room** | | |
| Create | `rooms-invite.spec.ts:63-106` | E2E-CONFIRMED |
| Delete | `rooms-invite.spec.ts:108-152`; `panel/sub-components/ExternalLinks.js:112-118` | E2E-CONFIRMED |
| Update | `rooms-invite.spec.ts:154-236` | E2E-CONFIRMED |
| Free roles only | `panel/sub-components/ExternalLinks.js:152-166` | CODE-ONLY |
| **Invitation link of the portal** | | |
| Create, delete, update in Accounts | `invite.spec.ts:63, 99, 135` | E2E-CONFIRMED |
| **Expired or full invitation links** | | |
| Room link: expired, users limit | `rooms-invite.spec.ts:238, 285`; `panel/sub-components/ExternalLinks.js:99-329` | E2E-CONFIRMED |
| Portal link: expired, users limit | `invite.spec.ts:195, 232` | E2E-CONFIRMED |
| Copy refused for an expired or unavailable link | `panel/index.js:753-779` | CODE-ONLY |
| **Paid limits when inviting** | | |
| Administrator limit warning, upgrade label whole in every culture | `invite-quota-warning-dialog.spec.ts:141` | E2E-CONFIRMED |
| Paid roles locked at the user limit | `panel/sub-components/ExternalLinks.js:236-237` | CODE-ONLY |
| Quota rules | `../server/openspec/specs/invitations/spec.md`, "Paid-user limit when inviting" | SERVER-SPEC |
| **Joining through an invitation link** | | |
| Email step, sign-in, registration (standalone and SaaS) | `linkInvite.spec.ts:79-160, 184, 249, 284` | E2E-CONFIRMED |
| Errors, quota, expired | `linkInvite.spec.ts:165, 219, 325, 348, 381, 397` | E2E-CONFIRMED |
| **Accepting an email invitation** | | |
| Render, success, error in both variants | `empInvite.spec.ts:68-191` | E2E-CONFIRMED |
| **Sharing a guest with another manager** | | |
| Render, approve, deny | `guestShareLink.spec.ts:69, 89, 114` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Inviting into a private room (keys, pending access, results) | Owned by `private-rooms/room-membership` | `panel/__tests__/InvitePanel.privateInvite.test.tsx`; `panel/sub-components/InviteResult.js:94-167` |
| Inviting into an agent and its sources | Owned by the change `ai-chat-agents-design` | `panel/__tests__/InvitePanel.agentInvite.test.tsx` |
