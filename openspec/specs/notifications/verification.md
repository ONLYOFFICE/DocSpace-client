# notifications — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/settings` and `packages/shared/api/files`
> uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `pr` = `profile.spec.ts`, `notif/` =
`packages/client/src/pages/Profile/Section/Body/sub-components/notifications/`, `nfb/` =
`packages/client/src/components/NewFilesBadge/`, `smtp/` =
`packages/client/src/pages/PortalSettings/categories/integration/SMTPSettings/`, `server` =
`../server/openspec/specs/notifications/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Notification channels** | | |
| The tab with its channels; Telegram configured but not linked; linked with the username (screenshots) | `pr:190, 216, 273` | E2E-CONFIRMED |
| Not configured: settings link for an admin, `Notifications:AdminSetupRequired` for others; invalid address marked | `notif/sub-components/Channel.tsx:80-163` | CODE-ONLY |
| Channels of the installation | `server`, "Delivery channels of the installation" | SERVER-SPEC |
| **Linking Telegram** | | |
| Connect dialog | `pr:242` | E2E-CONFIRMED |
| Link reported by the server event; disconnect after confirmation with its toast | `notif/NotificationsChannels.tsx:88-115`; `packages/client/src/components/dialogs/DisconnectAccountDialog/index.tsx` | CODE-ONLY |
| The link on the server | `server`, "Telegram link of a profile" | SERVER-SPEC |
| **Notification kinds** | | |
| Four switches saved one by one for the own account | `notif/sub-components/RoomsActionsContainer.tsx`, `RoomsActivityContainer.tsx`, `DailyFeedContainer.tsx`, `UsefulTipsContainer.tsx` | CODE-ONLY |
| Kinds on the server | `server`, "Notification kinds a member can switch" | SERVER-SPEC |
| **Muting a room** | | |
| The menu entry runs the mute action; the room's mute flag follows | `packages/client/src/store/contextOptionsStore/__tests__/ContextOptionsStore.actions.test.ts:177`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.actions.test.ts:53` | UNIT-CONFIRMED |
| No mute entries for an admin who is not a member of an AI agent | `ai-projects-access.spec.ts:616` | E2E-CONFIRMED |
| Offered by the room's security outside a public room; counter adjusted; toasts; muted badge unmutes | `packages/client/src/store/contextOptionsStore/folderModel.helpers.ts:133-153`; `packages/client/src/store/filesActionsStore/rooms.helpers.ts:143-188`; `packages/client/src/HOCs/withBadges.js:117-128` | CODE-ONLY |
| Muted list on the server | `server`, "Muting single rooms" | SERVER-SPEC |
| **New files badge** | | |
| Form rooms left to the Forms panel | `nfb/__tests__/NewFilesPanel.sections.test.tsx:126, 132` | UNIT-CONFIRMED |
| Count capped at 999+; open and mark read; Mark read and Enter; Esc | `nfb/index.tsx:400`; `nfb/sub-components/NewFilesPanel.tsx:152-258`; `nfb/sub-components/NewFilesPanelItemFile.tsx:82-114` | CODE-ONLY |
| New items on the server | `server`, "New items of a room", "New items across all rooms" | SERVER-SPEC |
| **SMTP settings** | | |
| Required fields, Save waits for a change, Default settings disabled at the defaults | `smtp/sub-components/ButtonContainer.js:83-100, 228-244` | CODE-ONLY |
| Fields of the form | `smtp/sub-components/CustomSettings.js` | CODE-ONLY |
| Who may read and save; reset values | `server`, "SMTP settings of the portal" | SERVER-SPEC |
| **SMTP test message** | | |
| Offered only without unsaved changes; polled; result toast | `smtp/sub-components/ButtonContainer.js:136-200, 247-253` | CODE-ONLY |
| The test on the server, its rate limit | `server`, "SMTP test message" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Letters, digests, retention and payment letters | Written by the server | `server` |
| Push device registration | No web client surface | `server`, "Push device registration" |
| New files of private rooms and their mark as read | Owned by `private-rooms/*` | `nfb/__tests__/NewFilesPanel.sections.test.tsx:119, 138`; `nfb/__tests__/NewFilesPanelFileList.test.tsx`; `nfb/__tests__/NewFilesPanelItemFile.test.tsx` |
| Contact form for administrators, join invitation from the sign-in page | Sign-in pages are owned by `authentication` | — |
