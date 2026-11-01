# Proposal

## Why

AI Agents tied a model, instructions and knowledge to a single agent room. Teams had no way to share one chat setup — a model plus several Instructions and Knowledge rooms — across a group while each person keeps their own conversations. AI Projects replace the agents with that shared setup, built on two new room types. This change records the feature as it is built on `feature/new-ai-concept` and the parts still owed, so it becomes the baseline spec.

## Source of truth

The target behavior is set by the product decisions in this change and by the .NET code in `../server` after 96a4fdefca, c48b5391fc and 64c79db1dc (2026-10-31), which moved AI projects under the AI rooms root, serve them through the shared `files/rooms` routes and replaced the internal ASC.AI project routes; the earlier C# contract `AiProjects-API-for-CSharp.md` (2026-10-28) is superseded where they differ. The code on the branch is the current state; tasks.md lists what is still owed (the Docker screenshots, the server-side limits of the project model).

## What Changes

- **Two source room types**, created in the "AI rooms" section like any other room:
  - **Instructions room** (type 10): its root Markdown files are skills the chat follows; the server refuses a file without a valid `name` / `description` frontmatter, any subfolder and a 101st skill, and keeps the skills in a catalog. Roles: Owner, Room manager, Content creator, Editor, Viewer.
  - **Knowledge room** (type 11): the whole room is vectorized and searched as a knowledge base. Roles: Owner, Room manager, Content creator, Viewer. With vectorization off the room shows a banner, blocks uploads and cannot be picked as a source.
- **One AI section, "AI rooms"** (2026-11-01, after the .NET commit 96a4fdefca; it replaces first the stand-alone AI Projects page and then the separate "AI Projects" section), a root of `GET files/@root` beside Rooms and Forms, rendered by the Home page with the whole Rooms machinery:
  - root `FolderType.AiHub` (41), `searchArea=AiHub`, paths `/ai-rooms/filter` and `/ai-rooms/{id}/filter?folder={id}`; it lists Instructions rooms (10), Knowledge rooms (11) and AI projects (12) from `GET files/rooms` like any rooms list, its type filter offers the three, and its Recent, Favorites and Trash slots are scoped to folder types 38, 39 and 40;
  - an AI project binds any number of Instructions rooms and any number of Knowledge rooms (its "sources"), with three roles (owner, Project manager, Member); "New room" opens a three-type picker (Instructions, Knowledge, AI project → the project form);
  - Rooms views, filters, sorts, context and bulk menus, Info panel, hotkeys and socket updates come from the Files stores, not from a page store; nothing in the section is archived or made a template, and deletion is outright;
  - membership through the room panels; a project member reads every linked room through a virtual share the server derives from the project (never stored, so the room is not listed for them);
  - the Rooms section no longer offers or lists the AI room types.
- **Inside a project** (`/ai-rooms/{id}/filter?folder={id}`, drawn by Home in place of the file list for a room of type 12): the chat opens in the section body with a read-only model, an intro, and a sources column (Instructions with skills, Knowledge with indexed files, a personal Context folder). Edits reach the open chat; deletion or loss closes it; leaving resets the chat.
- **Chat sources logic**: a round takes several Instructions rooms and several Knowledge rooms picked in the composer, and one Context folder that follows the user's location (picked by hand only inside a project); a project-scoped round is rewritten by the server to the project's settings; threads have one global scope per user and are never shared.
- **Chat outside the page**: "Choose AI Project" in the model picker applies a project in place; the header's save action creates a project from the chat's setup.
- **Server contract** on the Files API: a project is created, read, changed, deleted and listed through the shared `files/rooms` routes (`roomType: 12`, `searchArea=AiHub`), with the room settings that do not apply refused; its linked rooms through `GET/POST/DELETE files/rooms/{id}/sources`; skills through `files/rooms/{id}/skills` and `files/rooms/skills?roomIds=`. Visibility guard, per-role rights, validation limits (170-character title, 20 rooms per kind, pins counted apart from rooms), virtual read access of members to linked rooms. The client composes the project view over these routes; of the old `ai/projects` contract ASC.AI.Chat (Node) keeps only the chat-round binding and a temporary model proxy.
- **Project model**: stored in the .NET assignments storage scoped by entity (`internal/ai/assignments`, actionType `Chat`, `entityId` = project id, as agents stored their profile), read and written through a temporary Node proxy `GET/PUT /api/2.0/ai/projects/{id}/model` until it moves into Files; no stored model means the portal's default Chat model. Server limits (members cannot read it, no scoped reset) are open tasks.
- **BREAKING**: the AI Agents feature is removed from the client and shared packages (routes, pages, dialogs, tour, quota settings, store branches, locales, six E2E specs). The SDK's `(ai-agents)` and `(ai-arbiter)` entry points stay. The localStorage AI presets are gone.

## Capabilities

### New Capabilities
- `instructions-room`: the Instructions room type — skills, roles, rights, use in chats and projects.
- `knowledge-room`: the Knowledge room type — vectorization, indexing state, roles, rights, the vectorization-off mode.
- `ai-projects-api`: the project contract on the Files API (`files/rooms`, `.../sources`, `.../skills`) — entity, roles, guard, rights, validation, linked-room access, membership, listings, the chat binding in Node.
- `ai-projects-catalog`: the "AI rooms" section — root, routes, sidebar item and slots, the Rooms list run on the root with all three AI types, the create picker, the project form, the empty state, membership, live updates.
- `ai-project-workspace`: the open-project view — header, fixed model, intro, sources column, mobile strip, and how the view follows edits, deletion and leaving.
- `ai-chat-sources`: the chat logic — skills, knowledge search, Context folder, project override and refusals, thread scope, applying a project outside its page.
- `ai-chat-project-picker`: projects in a chat outside an open project — the model picker entry and saving the chat setup as a project.

### Modified Capabilities
<!-- None: openspec/specs/ is empty. -->

## Impact

- **Client**: `packages/client/src/pages/AiProjects/**` (the workspace and utils), `pages/Home` (the AI rooms section and `AiProjectView`), `components/AiPresetsBridge`, `Shell.jsx`, `routes/client.js`, `ClientArticleSidebar`, the Invite / Info / change-owner panels, the room role helpers (`getAccessOptions`, `getUserRoleOptionsByRoomType`, `Members.utils`), the Knowledge room empty/banner views, `EmptyAiRoomsContainer`; stores `AiProjectsStore`, `AiPresetsStore`.
- **Shared**: `packages/shared/api/ai/projects.ts` (a facade over `files/rooms`, `.../sources`, `.../skills` and `files/{id}`), the AI rooms MSW mocks on the `files/rooms` routes, room type titles, icons and access options for types 10, 11, 12.
- **Server (`../server`)**: .NET serves the AI rooms root in `@root` (`FolderType.AiHub` 41) with all three AI types under it, `searchArea=AiHub`, the shared `files/rooms` routes for them and the public `AiHubController` routes (`files/rooms/{id}/sources`, `files/rooms/{id}/skills`, `files/rooms/skills`) (96a4fdefca, c48b5391fc); the virtual read access of project members to linked rooms (64c79db1dc); the skills catalog (`files_skill`, filled when a skill is saved). `FolderType.AiProjects`, `SearchArea.AiProjects` and the internal `internal/ai/projects*` and `internal/ai/rooms/skills` routes are gone. No migration is needed, as the feature is unreleased. ASC.AI.Chat (Node) no longer serves the `/api/2.0/ai/projects*` CRUD, skills or knowledge; it keeps the chat-round binding of a project (reading the project, its sources and skills from the Files routes with the caller's credentials) and proxies the project model (`GET/PUT /api/2.0/ai/projects/{id}/model`) to the .NET scoped assignments (`internal/ai/assignments`) until Files serves it. `FileSecurity` already blocks writes into Knowledge rooms with vectorization off.
- **Dependencies** (installed from local tarballs at the repo root): `@onlyoffice/apps-ui-kit` 4.1.0 (project room icon, `withoutArrows` tabs, room filter selectors, `AiChatStore.openProject` / `applyPreset` / `setProjectTitle` / `setComposerContextHidden` / `setFolderContextPickerEnabled` / `setOnSavePreset`, `profilePickerReadOnly`, `FolderType.AiHub = 41` with `FolderType.AiProjects` removed); `@onlyoffice/ai-chat` `1.0.2-progress.17` (several rooms per chat, composer room pickers).
- **Locales**: `Common:AIProject*`, `Common:AiRooms*`, `Common:InstructionsRoom*`, `Common:KnowledgeRoom*`; agent-only keys and the `AiAgentsTour` namespace removed, and with the separate projects section `Common:AIProjects`, `NewAIProject`, `AIProjectsEmpty`, `AIProjectsEmptyDescription`, `AIProjectsEmptyUser`, `AIProjectsEmptyUserDescription`, `AIProjectCreate`, `AIProjectCreateDescription`.
- **Tests**: unit tests for the API module, `AiProjectsStore`, `AiPresetsStore`, `AiPresetsBridge`, `useAiPresetsPickerActions`, `useProjectContextMenu`, the page utils; E2E `ai-projects.spec.ts` (one AI rooms section: list with projects, picker, empty states, create, open project, sources), `ai-projects-access.spec.ts`.
