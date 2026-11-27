# sdk-embedding — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> Rows added after `release/v4.1.0` was merged in at `b5479f67ea9` were checked on that merge.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
client E2E paths omit `packages/client/__tests__/`. Shorthands: `js/` =
`packages/client/src/pages/PortalSettings/categories/developer-tools/JavascriptSDK/`, `sdk/` = `packages/sdk/src/`,
`useSDK/` = `packages/client/src/pages/Home/Hooks/__tests__/`, `server` = `../server/openspec/specs/portal-settings/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Presets** | | |
| Two columns, shrinking together, one column below 600px | `sdk-presets.spec.ts:107, 128, 151` | E2E-CONFIRMED |
| The preset list | `js/presets/` (DocSpace, Manager, SimpleRoom, RoomSelector, FileSelector, Editor, Viewer, MediaViewer, Uploader) | CODE-ONLY |
| **A preset page** | | |
| Sample code highlighted | `javascript-sdk-code-highlighting.spec.ts:64` | E2E-CONFIRMED |
| Size, target, elements, preview, Get code, version, event log | `js/sub-components/PresetWrapper.js`; `js/sub-components/GetCodeDialog.js`; `js/sub-components/VersionSelector.tsx`; `js/sub-components/EventLogBlock.js` | CODE-ONLY |
| **Allowed domains** | | |
| Several at once, duplicates skipped, removal, read-only for Room admins and Users, HTTPS warning | `js/sub-components/csp.js:64-96, 151-160, 210` | CODE-ONLY |
| Domains on the server | `server`, "Configuring the Content Security Policy"; "Domains of the Content Security Policy" | SERVER-SPEC |
| **Connectors** | | |
| Listed below the presets, catalog tile, embedding and automation instructions, catalog fallback, from a preset page | `sdk-connectors.spec.ts:84, 134, 148, 181, 207, 227, 273` | E2E-CONFIRMED |
| Catalog order, pages from external resources, split, icon, repository and steps | `js/sub-components/__tests__/sdk-connectors-catalog.test.ts:76-199` | UNIT-CONFIRMED |
| **Methods a host may call** | | |
| Wrong-mode reply, result, error, setCustomActions, folder info, host window only | `useSDK/useSDK.dispatch.test.ts:94, 105, 113, 128, 139, 150` | UNIT-CONFIRMED |
| Folder info fields kept and dropped | `useSDK/useSDK.folderInfo.test.ts:83, 93, 106` | UNIT-CONFIRMED |
| The SDK app's method registry and replies | `sdk/providers/SDKConfigProvider.test.tsx:57, 66, 75`; `sdk/providers/sdkMethods.test.ts:8, 19, 34` | UNIT-CONFIRMED |
| Personal frame: data methods answered with the list entities, a Manager method refused with the wrong-mode reply | `packages/sdk/__tests__/e2e/personal.spec.tsx:78, 102` | E2E-CONFIRMED |
| Forms frame: list methods answered, folder information refused with the wrong-mode reply | `packages/sdk/__tests__/e2e/forms.spec.tsx:141` | E2E-CONFIRMED |
| **Selector frames** | | |
| File selector: every option alone and in threes, light, dark and right-to-left, with items and empty | `packages/sdk/__tests__/e2e/fileSelector.spec.tsx:51-3757` | E2E-CONFIRMED |
| Room selector: header, search, cancel, labels, Russian and Arabic, light and dark, with items and empty | `packages/sdk/__tests__/e2e/roomSelector.spec.tsx:48-1692` | E2E-CONFIRMED |
| Accept disabled until a room is picked, the picked room reported once; cancel reported; search typed in | `packages/sdk/__tests__/e2e/roomSelector.spec.tsx:1714, 1758, 1786-1907` | E2E-CONFIRMED |
| **Custom actions of a frame** | | |
| File actions by extension, the click reported with the item; create items in New; replaced by `setCustomActions`; shown in the context menu | `packages/sdk/__tests__/e2e/personal.spec.tsx:115, 141, 154, 166` | E2E-CONFIRMED |
| Forms frame: the custom file action offered where it applies, the room reported as the folder | `packages/sdk/__tests__/e2e/forms.spec.tsx:158` | E2E-CONFIRMED |
| Manager frame: file action by extension with the click and folder reported, room action by section, none outside a frame, the whole selection for a group action, create items with the open folder | `packages/client/src/store/contextOptionsStore/__tests__/frameActions.helpers.test.ts:74, 88, 94, 99, 115` | UNIT-CONFIRMED |
| **Frame targets** | | |
| Not found, no access, refused link first, unknown error header ignored, public room links | `sdk/app/media-viewer/page.test.tsx:66-249` | UNIT-CONFIRMED |
| Password page for a link with a password; refused link named; client header dropped | `sdk/proxy.test.ts:55, 73, 86, 99` | UNIT-CONFIRMED |
| **Signing in a frame with an OAuth token** | | |
| Data loaded in the browser in an OAuth frame | `sdk/app/media-viewer/page.oauth.client.test.tsx:56-114`; `sdk/proxy.test.ts:36, 46` | UNIT-CONFIRMED |
| Unauthorized report and sign-out without the cookie logout | `packages/shared/store/AuthStore.oauth.test.ts:124-187` | UNIT-CONFIRMED |
| **Host storage for a frame** | | |
| Commands, call ids, timeouts, wrong type or source, not framed | `sdk/utils/externalStorage.test.ts:113-258` | UNIT-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Private rooms in a frame and the private-surface policy | Owned by `private-rooms/sdk-surface` and `private-rooms/feature-gating` | `sdk/proxy.test.ts:241-290`; `useSDK/useSDK.createInPrivateRoom.test.ts`; `sdk/app/uploader/page.test.tsx`; `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`; `packages/sdk/__tests__/e2e/private/private-security.spec.ts` |
| AI chat, agents and arbiter frames, and the AI chat button of a Forms frame | Owned by the change `ai-chat-agents-design` | `sdk/proxy.test.ts:114-216`; `sdk/app/(ai-agents)/`; `packages/sdk/__tests__/e2e/aiAgents.spec.tsx`; `packages/sdk/__tests__/e2e/aiArbiter.spec.tsx`; `packages/sdk/__tests__/e2e/chat.spec.tsx`; `packages/sdk/__tests__/e2e/forms.spec.tsx:60-104` |
| Creating a form in a third-party room of a Forms frame | Follows `form-filling-workflow` and `room-types` | `packages/sdk/__tests__/e2e/forms.spec.tsx:198` |
| The rooms, personal files and forms pages served in a frame | Follow the specs of those features | `sdk/app/(rooms)/`; `sdk/app/(personal-files)/`; `sdk/app/(forms)/` |
| Personal files E2E of the SDK app | Follow `files-navigation` and `keyboard-and-hotkeys` | `packages/sdk/__tests__/e2e/personal-files/` |
