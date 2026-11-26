# storage-and-integrations — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `direct` = `packages/shared/components/direct-third-party-connection/`, `combo` =
`packages/client/src/components/dialogs/CreateEditRoomDialog/sub-components/ThirdPartyStorage/ThirdPartyComboBox.tsx`,
`server` = `../server/openspec/specs/storage-and-integrations/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Services offered for a connection** | | |
| Activated first; activation required; settings in a new tab for an administrator; hint for others | `combo:124-136, 212-245` | CODE-ONLY |
| Services the server offers | `server`, "Storage services a portal offers"; "Provider lists need a signed-in member who is not a guest" | SERVER-SPEC |
| **Connecting an account** | | |
| OAuth window or login, password and address; required fields; success; error | `packages/shared/dialogs/connect/ConnectDialog.tsx:112-260, 300-400` | CODE-ONLY |
| Credentials and address on the server | `server`, "Connecting a third-party account"; "Rejected credentials store nothing"; "Server address of a new connection" | SERVER-SPEC |
| **Account for backups** | | |
| Account list, selection, Connect when not connected, folder picker when connected, disabled and error states | `direct/DirectThirdPartyConnection.test.tsx:147, 156, 170, 202, 211, 245, 261, 270` | UNIT-CONFIRMED |
| Reconnect and Disconnect in the account menu | `direct/DirectThirdPartyConnection.tsx:234-258` | CODE-ONLY |
| Backup account on the server | `server`, "Backup storage account of the portal"; "Disconnecting the backup account removes its schedule" | SERVER-SPEC |
| **Disconnecting an account** | | |
| Confirmation, success, reload inside the folder, backup account forgotten | `packages/shared/dialogs/delete-third-party/DeleteThirdPartyDialog.tsx:70-120` | CODE-ONLY |
| Disconnecting on the server | `server`, "Disconnecting an account"; "An account a room stands on cannot be disconnected" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Storage encryption | Offered by the management app; owned by `spaces-management` | `packages/management/src/app/settings/encrypt-data/` |
| Data storage and CDN of an installation | No client page offers them | — |
| Enabling users to connect storages | The client has a store action but no control that calls it | `packages/client/src/store/FilesSettingsStore.ts:485` |
| Provider title shown instead of a quota | Owned by `quotas` | `packages/client/src/components/SpaceQuota/index.js:189-194` |
