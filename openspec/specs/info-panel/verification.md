# info-panel — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
E2E paths omit `packages/client/__tests__/`. Shorthands: `InfoPanel` = `packages/client/src/pages/Home/InfoPanel`,
`tabs` = `packages/client/src/helpers/info-panel/tabs.ts`, `tabs.test` = its `__tests__/tabs.test.ts`, `store` =
`packages/client/src/store/InfoPanelStore.ts`, `Details.utils` = `InfoPanel/Body/views/Details/Details.utils.tsx`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Where the panel can be opened** | | |
| Files, Rooms, Forms and Accounts; not on a plugin page | `store:443-479` | CODE-ONLY |
| Header `Common:Info` with a close button | `InfoPanel/Header/headerGeneral.tsx:102-162` | CODE-ONLY |
| **Tabs of a room** | | |
| Members (`Common:Contacts`), History, Details, Metadata if supported, plugin tabs | `tabs:160-305`; `InfoPanel/Header/headerGeneral.tsx:122-147`; `tabs.test:58` | UNIT-CONFIRMED |
| Room template: `Common:Accesses` and Details | `tabs:132-141`; `headerGeneral.tsx:124-126` | CODE-ONLY |
| Room from Recent handled as a list item | `tabs:160-168` | CODE-ONLY |
| Plugin tabs filtered by rights, ids and room types | `tabs.test:273-321` | UNIT-CONFIRMED |
| **Tabs of a file or folder** | | |
| Share only with `canShare`; never for private/encrypted items, items in a private room or in the AI section | `tabs:178-192`; `tabs.test:184, 217, 77` | UNIT-CONFIRMED |
| Shareable document: Share, History, Details, Metadata | `tabs.test:77-105` (a file of My documents has Metadata) | UNIT-CONFIRMED |
| Encrypted file: no Share, no plugin tab | `tabs.test:184, 345` | UNIT-CONFIRMED |
| **Selections without tabs** | | |
| No tabs for Trash, several items, a section root, an expired external link, a locked shared room | `headerGeneral.tsx:75-95`; `tabs:128-130`; `InfoPanel/Body/bodyGeneral.tsx:114-121` | CODE-ONLY |
| **The tab the panel opens on** | | |
| Room or folder in a room opened from its header: members; otherwise Details | `store:154-197`; `packages/client/src/store/__tests__/InfoPanelStore.view.test.ts:70` | UNIT-CONFIRMED |
| Remembered separately for rooms and for files; Share and members are one pick | `store:424-435` | CODE-ONLY |
| An unavailable remembered tab gives way to the first one | `bodyGeneral.tsx:147-152`; `headerGeneral.tsx:117-120` | CODE-ONLY |
| My documents never uses the rooms view | `packages/client/src/store/__tests__/InfoPanelStore.routes.test.ts:67` | UNIT-CONFIRMED |
| **Nothing selected** | | |
| Section-specific empty text | `InfoPanel/Body/sub-components/NoItem/index.tsx:116-135`, `NoRoomItem.tsx:61`, `NoFileOrFolderItem.tsx:58`, `NoGalleryItem.tsx:62`, `NoContactsItem.tsx:67-70` | CODE-ONLY |
| **Several items selected** | | |
| Count with `Common:ItemsSelected` / `InfoPanel:SelectedUsers` / `InfoPanel:SelectedGroups`, no tabs | `InfoPanel/Body/sub-components/SeveralItems/index.tsx:81-84`; `bodyGeneral.tsx:178-179` | CODE-ONLY |
| **Items that cannot be shown** | | |
| Expired external link: not available, per kind | `NoItem/ExpiredItem.tsx:95-112` | CODE-ONLY |
| Locked shared room: `Common:NeedPassword`, `Common:EnterPassword` | `NoItem/LockedItem.tsx:83-87` | CODE-ONLY |
| **Item title in the panel** | | |
| Title replaced on a new selection after an extension changed its markup | `info-panel-title-selection.spec.ts:218-256` | E2E-CONFIRMED |
| **Room logo in the panel** | | |
| Logo editable only with `EditRoom` | `InfoPanel/Body/sub-components/ItemTitle/RoomsItemTitle.tsx:239-287` | CODE-ONLY |
| Rejected save: error shown, list kept | `info-panel-room-details.spec.ts:322-364` | E2E-CONFIRMED |
| **Panel width on a desktop** | | |
| 400 to 800 pixels, kept across reloads, cap | `info-panel-resize.spec.ts:241-261`; `packages/client/src/helpers/info-panel/width.ts:42-51` | E2E-CONFIRMED |
| Click keeps the width, double click restores 400 | `info-panel-resize.spec.ts:263-279` | E2E-CONFIRMED |
| Narrows to fit a smaller window without saving, widens back; list keeps 416 | `info-panel-resize.spec.ts:281-299` | E2E-CONFIRMED |
| Name column keeps 210 pixels | `info-panel-resize.spec.ts:327-354` | E2E-CONFIRMED |
| Finger on the edge | `info-panel-resize.spec.ts:397-407, 434-456` | E2E-CONFIRMED |
| No edge below the desktop layout | `info-panel-resize.spec.ts:409-427` | E2E-CONFIRMED |
| **Floating launchers beside the panel** | | |
| Live chat launcher moves clear of the panel | `info-panel-resize.spec.ts:301-325` | E2E-CONFIRMED |
| And of the docked AI chat, returning when it closes | `info-panel-resize.spec.ts:356-388` | E2E-CONFIRMED |
| **Details of a room** | | |
| Owner, storage type, type, content, dates, last editor, tags (also empty when the user may add one), storage | `Details.utils:249-274` | CODE-ONLY |
| Upload counted once when the socket event comes first | `info-panel-room-details.spec.ts:150-244` | E2E-CONFIRMED |
| Counts taken from the server after a socket event | `info-panel-room-details.spec.ts:246-287` | E2E-CONFIRMED |
| Room without a security object renders | `info-panel-room-details.spec.ts:118-148` | E2E-CONFIRMED |
| **Details of a file or folder** | | |
| Folder and file property lists | `Details.utils:275-319` | CODE-ONLY |
| Shared item: who shared it, access level | `Details.utils:289-290, 312-313` | CODE-ONLY |
| Version comment without the edit-history right has no edit control | `InfoPanel/Body/sub-components/__tests__/CommentEditor.test.tsx:116-120` | UNIT-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Details of agents, skills, skill sets and knowledge bases; the Context and Content tabs | Owned by the change `ai-chat-agents-design` | `Details.utils:215-248`; `tabs:121-158` |
| Form information cards in Details (AI and collection cards) | Owned by `form-filling-workflow` | `InfoPanel/Body/views/Details/sub-components/FormInfo` |
| The members list, History, Metadata and plugin tab contents | Owned by their capabilities (see Purpose) | `InfoPanel/Body/views/*` |
