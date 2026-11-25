# media-viewer — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `store` = `packages/client/src/store/MediaViewerDataStore.ts`,
`page` = `packages/client/src/pages/Home/MediaViewer/index.js`, `tests/` = `packages/client/src/store/__tests__/`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Files the viewer opens** | | |
| Image opens in the viewer over the list | `modal-focus-trap.spec.ts:401` | E2E-CONFIRMED |
| Image or media view, PDF with the PDF viewer, not an expired link | `store:548-556` | CODE-ONLY |
| **Paging through the folder** | | |
| Next and Previous stop at the ends; the file is selected in the list | `store:294-389` | CODE-ONLY |
| **Address and history** | | |
| One entry on opening, replaced while paging; stepped back over on closing; folder address for a viewer opened by link | `tests/MediaViewerDataStore.history.test.ts:118, 129, 138` | UNIT-CONFIRMED |
| Public room address with the key | `store:225-238` | CODE-ONLY |
| **Closing the viewer** | | |
| Focus kept inside; focus back to the row on Escape; address leaves `/media/view/` | `modal-focus-trap.spec.ts:401, 431` | E2E-CONFIRMED |
| Last file selected and scrolled to | `page:277-329` | CODE-ONLY |
| **Opening from a link** | | |
| `preview` parameter and viewer address; file loaded alone; error and folder on failure | `page:220-227`; `packages/client/src/pages/Home/Hooks/useFiles.ts:250-272`; `store:162-190` | CODE-ONLY |
| Empty playlist closes the viewer | `page:331-339` | CODE-ONLY |
| **File actions in the viewer** | | |
| Actions handed to the viewer | `page:356-387` | CODE-ONLY |
| No deletion of a file already in an operation | `page:229-255` | CODE-ONLY |
| **Downloading from the viewer** | | |
| Download from the viewer, a previewed file, a missing file | `packages/client/src/pages/Home/MediaViewer/__tests__/mediaDownload.helpers.test.ts:45, 53, 61, 73, 80` | UNIT-CONFIRMED |
| **Thumbnails for the viewer** | | |
| Thumbnails requested for waiting images and videos | `store:573-611` | CODE-ONLY |
| **A plugin's viewer** | | |
| Filter by role, including the deprecated role name | `tests/MediaViewerDataStore.pluginFilter.test.ts:68, 74, 83, 89` | UNIT-CONFIRMED |
| Opens on a folder file, reports a file outside the playlist | `tests/MediaViewerDataStore.pluginPlaylist.test.ts:101-140` | UNIT-CONFIRMED |
| Plugin switches the shown file | `tests/MediaViewerDataStore.pluginUpdate.test.ts:106-149` | UNIT-CONFIRMED |
| Own history entry; not handed over to the portal's viewer once closed | `tests/MediaViewerDataStore.history.test.ts:152, 163`; `tests/MediaViewerDataStore.pluginClose.test.ts:120-161` | UNIT-CONFIRMED |
| Next, Previous and file change reach the plugin | `plugins/media-viewer.spec.ts:142, 174, 206` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Zoom, rotation, the players and the viewer's own menu layout | Implemented in ui-kit, a separate repository | `@onlyoffice/apps-ui-kit/media-viewer` |
| Encrypted files in the viewer | Owned by `private-rooms/file-operations` | `packages/shared/components/media-viewer/MediaViewer.encryption.test.tsx` |
| A guard that keeps a file the viewer cannot play out of it never matches | Reachable only through a hand-typed viewer address of such a file; not checked in a browser | `store:192-215` |
| Plugin callbacks on load showing toasts | Owned by `plugins` | `plugins/media-viewer.spec.ts:81, 117` |
