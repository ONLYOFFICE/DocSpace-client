# Design

## Context

See proposal.md (Why) for the motivation, and the seven spec deltas for the behavior: two room types (`instructions-room`, `knowledge-room`), the server contract (`ai-projects-api`), the chat logic (`ai-chat-sources`), and the three client views (`ai-projects-catalog`, `ai-project-workspace`, `ai-chat-project-picker`).

- **Prior state.** Before this change, the client had an AI Agents section backed by `AiRoomStore`, `CreateEditAgentStore` and agent branches across the Files stores. Chat setups were saved as localStorage "AI presets" through a floppy button in the chat header. Skills came from a `.ai` folder; now they come from Instructions rooms.
- **Server, what exists on the branch.**
  - Files: `RoomType` 10 / 11 with `FolderType` 38 / 39, their role sets in `FileSecurity.AvailableRoomAccesses` (both types currently allow Room manager, Content creator, Editing, Read), and the vectorization gate: `Create`, `CopyTo` and `MoveTo` into a Knowledge room are refused while `IsVectorizationEnabledAsync()` is false.
  - **The .NET side** (2026-10-31, 96a4fdefca, c48b5391fc, 64c79db1dc): one AI root, `FolderType.AiHub` (41), holding Instructions (10 / `FolderType` 38), Knowledge (11 / 39) and AI project (12 / `FolderType.AiProjectRoom` 40) rooms, all three covered by `DocSpaceHelper.IsAiHubRoom`; `FolderType.AiProjects` and `SearchArea.AiProjects` are gone. All three types go through the shared `files/rooms` routes (create with `roomType`, `GET/PUT/DELETE files/rooms/{id}`, list with `searchArea=AiHub`), which refuse with 400 the settings that do not apply. `AiHubService` (formerly `AiProjectRoomService`) and the public `AiHubController` serve a project's linked rooms (`GET/POST/DELETE files/rooms/{id}/sources`; `files_ai_project_room`, one flat set of room ids per project, at most 20 per type, sorted by title, unlinked when the room is deleted, archived or moved to Trash) and the skills catalog (`files/rooms/{id}/skills`, `files/rooms/skills?roomIds=`). A project member reads every linked room through a virtual share record (`SubjectType.AiProject` = 5) that `SecurityDao.GetSharesAsync` builds for AiHub entries only. The internal `internal/ai/projects*` and `internal/ai/rooms/skills` routes are deleted. A project's model is kept in the ASC.AI assignments storage scoped by entity (`internal/ai/assignments`, actionType `Chat`, `entityId` = project id), the mechanism agents used for their profile.
  - **The project model** (2026-11-01, ee2f480944): `GET/PUT files/rooms/{id}/model` (`AiHubController`), `{ profileId }`, readable by every member, set by the owner and Project managers, refused with 400 for a missing or non-chat profile, never cleared; a change goes to the audit trail and is announced as an update of the project room.
  - ASC.AI.Chat (Node): the `/api/2.0/ai/projects*` layer (list, create, get, update, delete, skills, knowledge) is removed. Node keeps the chat-round binding: `applyAiProjectChatContext` rewrites a round whose `entityId` is a project from `GET files/rooms/{id}` (id, title, access, `inRoom`), `GET files/rooms/{id}/sources` and `GET files/rooms/{id}/skills`, read with the caller's forwarded credentials; `roomSkills.ts` reads the composer's rooms through `GET files/rooms/skills?roomIds=` in batches of 20. Thread storage folds any non-agent `entityId` to the global scope. A round's model is the project's own (`GET files/rooms/{id}/model`), else the portal's Chat assignment; Node has no project route.
- **A project comes back as a room** (`FolderDto`, `roomType: 12`). The client composes the `aiProject` block itself (`packages/shared/api/ai/projects.ts`) from `files/rooms/{id}` and `files/rooms/{id}/sources`: `profile` (from `GET files/rooms/{id}/model`, named by `GET ai/profiles/get-by-id`; `null` = the portal default, also when the read fails), `instructionsRooms[]`, `knowledgeRooms[]`, `canEditSettings` (`security.EditRoom`), `warnings[]` (`roomUnavailable` for a refused link or unlink). The list answers the rooms without the block (`aiProject.partial` on the client), so `AiProjectsStore.openProject` reads the project on its own before the chat opens on it.
- **The chat lives in ui-kit and ai-chat.** The client can steer it only through the props `Shell.jsx` passes and the `AiChatStore` methods ui-kit exposes:
  - methods: `openProject`, `applyPreset`, `setProjectTitle`, `setOnSavePreset`, `setComposerContextHidden`, `setFolderContextPickerEnabled`;
  - props: `profilePickerReadOnly`, `contextRoom`, `entityId`, `chatIntro`, `suggestions`.
- **Branch history.** The branch first shipped mocked routes and a design note (dropped in 59affcf2e00), then an `ai/projects` contract served by Node over internal .NET routes, then two AI sections (7d32683f39), and now one AI rooms section over the Files API (96a4fdefca). The code is now the source of truth, and this change documents it.

## Goals / Non-Goals

**Goals:**
- Reuse the room machinery (Invite panel, Info panel, change-owner panel, invitation links, history) for projects instead of building parallel UI.
- Keep the chat wiring in `Shell.jsx` unchanged in shape. A project reaches the chat through the same "preset" hook the localStorage presets used.
- Make projects behave like rooms in the list: views, column settings, infinite scroll, socket-driven updates.

- Make the two source room types self-explanatory: a Knowledge room is a set of documents to search, an Instructions room a set of skills to follow, each with the smallest role set that fits.
- Keep a Knowledge room honest when vectorization is off: nothing new gets in, nothing pretends to be searchable.

**Non-Goals:**
- The SDK-frame `/ai-rooms` page (`pages/AiRooms`, the Rooms app frame): it keeps the bare `/ai-rooms` path; the "AI rooms" section takes the nested paths only.
- Implementing the .NET side here: `ai-projects-api` records the contract it serves; the code lives in `../server` on its own branch.
- Archiving projects, shared (non-personal) threads.
- The SDK's `(ai-agents)` and `(ai-arbiter)` entry points. They and the shared exports they import are kept deliberately.

## Decisions

### One AI section in Home, as the server keeps one root (2026-11-01)
The first cut was a stand-alone `/ai-projects` page with its own store (`AiProjectsStore` list, filters, sockets) and its own list views. It was replaced by two root sections when .NET served two roots (7d32683f39), and those by one when .NET moved the projects under the AI rooms root (96a4fdefca): `FolderType.AiHub` (41, "AI rooms") holds the Instructions, Knowledge and AI project rooms. The client treats it as it treats the Forms root (the most recent section added this way): `RoomSearchArea.AiHub`, `CategoryType.AiHub` / `AiHubRoom`, Home routes, `TreeFoldersStore.isAiHubFolder` (and `isAiSectionFolder`, beside `isRoomsFolder` / `isFormsFolder` in the Files stores), the sidebar item, the Rooms filter (type options 10, 11, 12), header, bulk menu, context options, table columns, tiles, empty view and sockets. The "AI Projects" item, the `/ai-projects/*` routes, `CategoryType.AiProjects` / `AiProject`, `RoomSearchArea.AiProjects` and its stored filter are removed.

Why "copy all of Rooms": it is one flag in each Files store, while the page re-implemented a third of it and still lagged (no bulk menu, no hotkeys, no selection area).

What stays of the page: the project workspace (chat, sources column, intro) and the project form. Home renders the workspace when the selected folder is a room of type 12, as `AIAgentView` once did for agent rooms; `AiProjectsStore` keeps the open project, its skills and knowledge, the chat sync (preset) and the project form state, and drops the list, filters and socket code.

*Alternative:* keep the page and only add the slots. Rejected: every Rooms feature would have to be copied a second time.

### The list through `files/rooms`
A project is a room of the AI rooms root, so the section's list is `GET files/rooms?searchArea=AiHub` like any rooms list, with the three AI types in it; `type=12` narrows it to projects (the chat's "Choose AI Project" picker). The Files stores never learn the difference.

### `/ai-rooms` shared with the SDK frame page
The server links AI rooms as `ai-rooms/{id}/filter?folder={id}`, and the bare `/ai-rooms` is already the Rooms app's SDK frame page. The section takes only the nested paths (`/ai-rooms/filter`, `/ai-rooms/{id}`, the slots); the frame keeps the bare path, and the checks that switch the client into the frame layout (`Client.jsx`, `SectionNavigationContext`) match it exactly instead of by prefix.

*Alternative:* move the section elsewhere and redirect. Rejected: every server link (notifications, history, share) would pay a redirect, and the frame page has no nested paths to lose.

### One creation dialog, three types; a direct form for projects
"New room" in "AI rooms" opens `CreateRoomDialog` with `isAiRoomsCreate`, the same switch Forms uses (`isFormsCreate`) to draw a fixed picker: Instructions, Knowledge and AI project. Instructions and Knowledge go through `POST files/rooms` (the server puts types 10/11 under the AI rooms root); picking AI project closes the room dialog and opens the project form (`CreateEditProjectDialog`, mounted with the Files panels as `AiProjectDialog`), saved through `POST files/rooms` with `roomType: 12` and then `POST files/rooms/{id}/sources`. "Edit" on a type-12 room (`Events.ROOM_EDIT`) reads the project and opens the same form. The project form's room selectors ask for `searchArea=AiHub`. The Rooms picker and the Rooms type filter drop the AI types.

*Alternative:* lift the project fields into the room dialog's second step. Rejected for now: the project form has its own selectors, model picker and logo flow, and the hand-off keeps one form for create, edit and the chat's save action.

### Slots scoped by folder type, no archive
Recent, Favorites and Trash of "AI rooms" are the shared special folders with `folderType` 38, 39 and 40 in the URL (`scopedUrl`, as Rooms and Forms do); the Rooms slots drop them. The server never archives an AI room or a project, so the section has no Archive slot or archive action, and delete removes a room outright (`DELETE files/rooms/{id}` with `deleteAfter: false`), as a form room is deleted from Forms.

### A client-side project facade over the Files routes
`packages/shared/api/ai/projects.ts` keeps its functions, but since Node dropped `ai/projects` it composes everything over the Files routes:
- list: `files/rooms?searchArea=AiHub&type=12`;
- read: `files/rooms/{id}` plus `files/rooms/{id}/sources` and `files/rooms/{id}/model` (its profile named by `ai/profiles/get-by-id`), composed into the `aiProject` block (`profile`, `null` on a failed model read; `canEditSettings` = `security.EditRoom`);
- create: `POST files/rooms` (title, tags, color, cover, logo, `roomType: 12`), then `POST .../sources`;
- update: `PUT files/rooms/{id}` (a GET when only the sources change), then a diff of the sources: `DELETE` the dropped, `POST` the new. A refused link or unlink does not fail the save and comes back as a `roomUnavailable` warning with the server's message;
- model: after the room and sources, `PUT files/rooms/{id}/model` with the picked model, the preselected default included (the server cannot clear a model); a refused write does not fail the save and comes back as a `modelNotSaved` warning;
- delete: `DELETE files/rooms/{id}` with `deleteAfter: false`;
- skills: `files/rooms/{id}/skills`;
- knowledge: the sources' Knowledge rooms are listed as they are; a room's files are read when its row is expanded, with one `GET files/{roomId}?filterType=1&count=100` (a Knowledge room holds at most 100 files).

Two mappers stay: `toAiProject` (logo colour with `#`, linked rooms with `available` and `archived` defaulted, `Leave` = `inRoom && access !== Owner`) and `aiProjectToRoom` (back to the `TRoom` shape the room panels read). Pin, mute, leave, owner change, logo removal, members, invitation links and history go through the room routes, so the room panels need no project branch.

*Alternative:* keep an `ai/projects` contract in Node over the internal .NET routes (the previous cut). Rejected once .NET served the project on the public Files routes: the Node layer only re-shaped the same calls, and the internal routes are gone.

### A project reaches the chat through three paths
Rooms the caller cannot read are filtered out before they reach the chat on every path.

- **Open.** The page calls ui-kit `AiChatStore.openProject({ profileId, instructionsRooms, knowledgeRooms })`. It is the project-named form of `openPreset`: it starts a fresh thread with the project's model, skills rooms and knowledge rooms. At the same time `AiProjectsStore.openProject` sets `AiPresetsStore.activePreset`, which Shell reads for `contextRoom` (the Instructions rooms) and `AiPresetsBridge` reads for the chat title.
- **Edit or reset.** An edit of the open project (by anyone) and leaving the project go through `applyPreset`. It changes the open chat in place, without a new thread, and the reset passes an empty preset.
- **Picker outside the page.** `AiPresetsBridge` also applies the project through `applyPreset`, because a project picked in a running chat should not discard its thread.

*Alternative:* one entry point for all three. Rejected: opening a project must start a new thread, while an edit or a pick must keep the current one, and ui-kit already separates the two.

### The page store and the presets store are separate
- `AiProjectsStore` holds the open project, its skills and knowledge, the project form and the chat sync; the list, filters and sockets are the Files stores'.
- `AiPresetsStore` (app-wide) holds the picker's project list, the active preset, and the save dialog for chats outside the page.
- `AiPresetsBridge` lives inside `AiAgentProviders`, where the chat store is reachable, and does the MobX ↔ chat-store wiring that a MobX store cannot do.

### Live updates follow the rooms' socket pattern
The list follows the Files socket events on `DIR-{aiHubRoot}` as Rooms does. For the open project the store handles `s:modify-folder` on `DIR-{openProject}`:
- events are coalesced over 300 ms;
- a 404 or 403 on reload drops the project, sets `lostProjectId`, and the view goes back to the AI rooms list.

The store never takes over or drops a channel it did not subscribe to itself, because the Files stores may hold the same channel.

### The open project is drawn like an agent's chat
The chat renders in the section body (`fullHeightBody`), not in the floating panel. This lets the section's own Info panel open beside it, and lets the sources column, the history and the Info panel share one side slot.

`Shell.jsx` needs no page exception any more: the project opens inside Home at `/ai-rooms/{id}/filter?folder={id}`, which sets `currentClientView` and the selected folder.

### Leaving a project resets the chat
Two reactions reset the chat with an empty `applyPreset`, one per way a project reaches it:
- on the page, a reaction on `activeProject` handles every in-project exit: Back, closing the chat, lost or deleted project, page unmount. On unmount the project is closed before the chat panel, so the "closing the chat leaves the project" reaction finds nothing and does not navigate back;
- in `AiPresetsBridge`, a reaction on the chat's visibility handles a project applied from the picker.

Closing the chat on the page can fire both. The reset is idempotent and the bridge never navigates, so that is harmless.

### Gate on the section routes
The `/ai-rooms/*` routes are gated as an app (`ProtectedAppRoute appId="ai-rooms"`) and redirect to the default start page when AI services are off; the sidebar item is only added while the AI root is in `@root`. The separate "AI is off" view of the projects root is gone with that root.

### Source rooms are ordinary rooms with a narrowed role set
Instructions and Knowledge rooms reuse the room machinery (creation dialog, members, invitation links, archive, filters) and differ only in type, icon, texts and roles. The Knowledge room drops the Editor role: its files are sources to index, and an Editor who rewrites a document in place silently changes what the chat cites. The Instructions room keeps Editor, because skills are text that several people refine. The server's `AvailableRoomAccesses` and the three client role helpers (`getAccessOptions`, `getUserRoleOptionsByRoomType`, `Members.utils`) must agree; today all of them still offer Editing for the Knowledge room.

*Alternative:* a per-room "editable" switch. Rejected: a role set is what admins already understand.

### Vectorization off is a room state, not a portal error
The gate sits on the server in `FileSecurity` (`Create` / `CopyTo` / `MoveTo` refused) and in the knowledge tool (no search), so the client only has to mirror it: a banner inside the room from `settingsStore.aiConfig.vectorizationEnabled`, disabled upload controls, and disabled entries in the Knowledge room pickers of the composer and the project dialog. Linked rooms stay linked so that turning vectorization back on needs no re-linking. The banner previously existed for agents (`KnowledgeDisabledContainer`, removed with them in fac66aa42ba) and comes back for the room.

### Skills are parsed by .NET when saved, never by Node or the client
The .NET side checks a skill's frontmatter when the file is saved into an Instructions room (`SkillFrontmatter`, reading the first 64 KB through `PrefixedStream`), refuses an invalid file, and keeps `name` and `description` in `files_skill`, updated on moves and deletions. The chat reads that catalog through `GET files/rooms/skills?roomIds=` (Node `roomSkills.ts`, 20 rooms a call), the project view and the project's rounds through `GET files/rooms/{id}/skills`, so there is one parser and no file download per skill. Node reads only a skill's body, on demand.

### Remove the AI Agents feature outright
Projects replace agents in the sidebar, and the agent code paths in the Files stores were the main source of branching. They are deleted together with their locales and E2E specs, not hidden behind a flag.

## Risks / Trade-offs

- **[Trade-off]** The Files API keeps the project model as an id only (`files/rooms/{id}/model` answers `{ profileId }`) and cannot clear it. → The client names it with `ai/profiles/get-by-id` and the form always stores the picked model; a project never returns to "follow the portal default" once it has one.
- **[Trade-off]** A member's access to linked rooms is virtual (`SubjectType.AiProject`, built on read, never stored): it follows linking and unlinking with no grants to clean up, but those rooms do not appear in the member's AI rooms list; the member reaches them through the project.
- **[Risk]** Role sets drift between server and client for the Knowledge room. → Mitigation: one task changes `FileSecurity.AvailableRoomAccesses` and the three client helpers together, with a unit test on the client helpers.
- **[Risk]** A project still travels as a "preset" (`activePreset`, `applyPreset`) beside `openProject`, which makes the code harder to follow. → Mitigation: doc comments on `AiProjectsStore`, `AiPresetsStore` and `AiPresetsBridge` explain the hook. A ui-kit `applyProject` could remove the remaining preset names.
- **[Risk]** Outside the page, a chat closed with an applied project must lose the model and rooms too, not only `activePreset`. → Mitigation: `AiPresetsBridge` resets the chat with an empty `applyPreset` when the chat closes with an active preset, as the page does on leaving a project. A chat with no project applied is left alone. Covered in `AiPresetsBridge.test.tsx`.
- **[Trade-off]** Threads are never shared and have one global scope per user: there is no agent or project scope any more. The project id the chat sends as `entityId` selects the project's model and rooms for a round, not a separate thread list. So the history inside a project shows the user's threads from everywhere. That is what keeps "your conversation is yours only" true; a per-project history would need a new thread scope on the server.
- **[Trade-off]** The picker reads at most 100 projects, with no paging. Acceptable for a model-picker submenu; the full list lives in the AI rooms section.
- **[Trade-off]** The client composes a project from several Files calls (room, sources, then one link and one unlink call on save), so a save is not atomic: a refused link leaves the room saved and is reported as a warning.
- **[Trade-off]** Removing agents is breaking for portals that relied on them in the web client. The server still serves agents, and the SDK entry points remain.

## Migration Plan

- No client data migration. The localStorage presets are abandoned rather than imported, because they were only on this unreleased branch.
- Rollout depends on the .NET AI rooms root (96a4fdefca and later) being deployed together with the ASC.AI.Chat build that dropped `ai/projects`, on ui-kit 4.1.0 (now a local tarball) and on ai-chat `1.0.2-progress.17` (also a local tarball). Both packages must be published, and the manifests moved back to npm versions, before release.
- No server data migration either: the AI room types and projects are unreleased, so no Instructions or Knowledge room lives outside the AI rooms root and no Knowledge room has Editor members.
- Rollback means reverting the branch merge. The server can keep serving agents and projects independently.

## Open Questions

- **Default view and side-info content on tablet and mobile.** The rows view shows fixed Instructions / Knowledge groups. Whether it should follow the sort field as `FilesRowContent` does can be settled with design later.
- **Illustrations.** A dedicated empty-state illustration and a project icon are still to be drawn. The agents' assets are used for now.
