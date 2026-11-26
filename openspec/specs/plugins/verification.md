# plugins — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/plugins` uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
plugin E2E paths omit `packages/client/__tests__/plugins/`. Shorthands: `store/` = `packages/client/src/store/__tests__/`,
`helpers/` = `packages/client/src/helpers/plugins/__tests__/`, `page/` =
`packages/client/src/pages/PortalSettings/categories/integration/Plugins/`, `server` =
`../server/openspec/specs/plugins/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The plugins page** | | |
| Empty state, list, upload of a `.zip`, information shown | `plugins.spec.ts:59, 79, 108, 217` | E2E-CONFIRMED |
| Load, initialization and compatibility results of an upload; version warning | `page/hooks/usePluginUpload.ts:60-85`; `page/sub-components/PluginCacheWarningDialog.tsx`; `store/PluginStore.loadError.test.ts:215, 585` | UNIT-CONFIRMED |
| Upload switch and package rules on the server | `server`, "Installation-wide plugin switches"; "Uploading a plugin package"; "Re-uploading a plugin under the same name" | SERVER-SPEC |
| **Switching, configuring and deleting a plugin** | | |
| Toggle and delete | `plugins.spec.ts:145, 176` | E2E-CONFIRMED |
| Settings dialog: opens, renders, saves, reopens with values, cancel | `settings.spec.ts:72, 94, 115, 135, 198, 218` | E2E-CONFIRMED |
| Stored settings read and written; switch in another session | `store/PluginStore.reactRuntime.test.ts:137-236`; `store/PluginStore.initSettings.test.ts:139-253` | UNIT-CONFIRMED |
| Switching and deleting on the server | `server`, "Switching a plugin on or off and storing its settings"; "Deleting a plugin"; "Clients are told when a plugin changes" | SERVER-SPEC |
| **Broken plugins** | | |
| Load error: listed, tooltip, off not back on, dialog offers deletion, deletable | `load-error.spec.ts:80, 102, 116, 136, 159` | E2E-CONFIRMED |
| Initialization error: marked, tooltip, dialog, mark kept after toggling | `init-error.spec.ts:83, 99, 109, 129` | E2E-CONFIRMED |
| Nothing published by a broken plugin; mark cleared on a successful retry; error texts | `store/PluginStore.loadError.test.ts:128-559`; `helpers/errors.test.ts:55-165` | UNIT-CONFIRMED |
| **Language of a plugin** | | |
| English by default, translated, fallback for an unsupported language | `locale-sample.spec.ts:91, 109, 134, 183, 246, 295` | E2E-CONFIRMED |
| **Who sees a plugin's entries** | | |
| User types, users and groups, empty list, no user loaded | `helpers/roles.test.ts:45-116`; `store/PluginStore.userRole.test.ts:72, 82` | UNIT-CONFIRMED |
| Order by plugin name, numbers as numbers | `store/PluginStore.navigationOrder.test.ts:100-128` | UNIT-CONFIRMED |
| Group lists and roles on the Home page | `workspace-app.spec.ts:157, 177, 416, 456` | E2E-CONFIRMED |
| **Context menu and main button entries** | | |
| Context menu by file type, nested under More options, group actions | `context-menu.spec.ts:78, 96, 114, 147, 178, 216, 231` | E2E-CONFIRMED |
| Main button More submenu and nested items | `main-button.spec.ts:83, 104, 124, 144, 173, 192` | E2E-CONFIRMED |
| **Sidebar entries and plugin pages** | | |
| Buttons, also collapsed and in settings | `article-button.spec.ts:62, 86, 105, 118, 144, 184` | E2E-CONFIRMED |
| Navigation items per section and role, page by click and by URL, active item, unknown key, other section | `article-navigation.spec.ts:94-309` | E2E-CONFIRMED |
| Widget placement, first by name, filters, sections, collapsed sidebar, phone | `article-widget.spec.ts:176-387` | E2E-CONFIRMED |
| **Profile entries** | | |
| Menu entries | `profile-menu.spec.ts:97, 143, 161, 190, 278` | E2E-CONFIRMED |
| Tab after the portal's own, by address, unknown tab to Login, filters | `profile-tab.spec.ts:102, 139, 153, 167` | E2E-CONFIRMED |
| Card rows, filters, phone | `profile-field.spec.ts:112, 151, 167` | E2E-CONFIRMED |
| **Info panel tabs** | | |
| Tabs by item and file type, content and its loading | `info-panel.spec.ts:88-264` | E2E-CONFIRMED |
| **Files and events a plugin handles** | | |
| File clicks | `file-item.spec.ts:67, 88, 110` | E2E-CONFIRMED |
| Media viewer callbacks | `media-viewer.spec.ts:63-206` | E2E-CONFIRMED |
| Portal events | `event-listener.spec.ts:68, 88` | E2E-CONFIRMED |
| **What a plugin can show** | | |
| Create dialog and modal dialog | `create-dialog-sample.spec.ts:87-208`; `modal-dialog-sample.spec.ts:81-193` | E2E-CONFIRMED |
| Selectors | `selector.spec.ts:127-439` | E2E-CONFIRMED |
| Embedded page and messages; frame hand-over | `post-message.spec.ts:79, 100, 130`; `helpers/htmlFrame.test.ts:65-106` | E2E-CONFIRMED |
| Floating operations; API calls; navigation and info panel | `floating-operations.spec.ts:89-165`; `api-sample.spec.ts:115-196`; `navigation-sample.spec.ts:87, 117` | E2E-CONFIRMED |
| **Entries on the Home page** | | |
| Cards, page or own action, widgets, captioned block, disabled plugin | `workspace-app.spec.ts:100, 125, 139, 486, 519, 536, 569, 600, 662` | E2E-CONFIRMED |
| **The Plugin SDK page** | | |
| Links and samples with version and repository | `packages/client/src/pages/PortalSettings/categories/developer-tools/PluginSDK/index.js:94-184` | CODE-ONLY |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The system Markdown plugin keeps only its preview for `.md` files | A rule for one system plugin, not for plugins in general | `helpers/markdown.test.ts:44-65` |
| Placement of plugin entries in the profile menu | Owned by `app-shell` | `packages/client/src/store/utils/__tests__/profileMenu.test.ts` |
| Plugin entries in the media viewer data | Covered by the media viewer row above; store detail | `store/MediaViewerDataStore.plugin*.test.ts` |
