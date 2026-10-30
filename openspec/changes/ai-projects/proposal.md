# Proposal

## Why

AI Agents tied a model, instructions and knowledge to a single agent room. Teams had no way to share one chat setup — a model plus several Instructions and Knowledge rooms — across a group while each person keeps their own conversations. AI Projects replace the agents with that shared setup, built on two new room types. This change records the feature as it is built on `feature/new-ai-concept` and the parts still owed, so it becomes the baseline spec.

## Source of truth

The target behavior is set by the product decisions in this change and by the C# contract `AiProjects-API-for-CSharp.md` (2026-10-28). The code on the branch is the current state: where the two differ, the spec follows the contract and tasks.md lists the code change (`linkedRoomId` filter, Knowledge room roles, the vectorization-off mode, the .NET side).

## What Changes

- **Two source room types**, created in Rooms like any other room:
  - **Instructions room** (type 10): its root Markdown files are skills the chat follows. Roles: Owner, Room manager, Content creator, Editor, Viewer.
  - **Knowledge room** (type 11): the whole room is vectorized and searched as a knowledge base. Roles: Owner, Room manager, Content creator, Viewer. With vectorization off the room shows a banner, blocks uploads and cannot be picked as a source.
- **AI Projects** section at `/ai-projects/:projectId?`, reachable while AI services are on:
  - a project is a room of type 12 binding one model, any number of Instructions rooms and any number of Knowledge rooms, with three roles (owner, Project manager, Member);
  - a list with table/rows/tiles views, search, owner and room filters, sort, infinite scroll, empty states and socket-driven updates;
  - create, edit, delete, duplicate, pin, mute, copy link, change owner, leave — all gated by the project's security flags;
  - membership through the room panels; members are also granted Viewer on every linked room.
- **Inside a project**: the chat opens in the section body with a read-only model, an intro, and a sources column (Instructions with skills, Knowledge with indexed files, a personal Context folder). Edits reach the open chat; deletion or loss closes it; leaving resets the chat.
- **Chat sources logic**: a round takes several Instructions rooms and several Knowledge rooms picked in the composer, and one Context folder that follows the user's location (picked by hand only inside a project); a project-scoped round is rewritten by the server to the project's settings; threads have one global scope per user and are never shared.
- **Chat outside the page**: "Choose AI Project" in the model picker applies a project in place; the header's save action creates a project from the chat's setup.
- **Server contract** `/api/2.0/ai/projects`: visibility guard, per-role rights, validation limits (170-character title, 100 rooms per kind, 10 pins), linked-room grants with warnings, chat-context for the AI service. Only the project-specific routes live there (list, get, create, update, delete, skills, knowledge); members, links, pin, mute, duplicate, owner, logo and history use the room routes, as agents did.
- **BREAKING**: the AI Agents feature is removed from the client and shared packages (routes, pages, dialogs, tour, quota settings, store branches, locales, six E2E specs). The SDK's `(ai-agents)` and `(ai-arbiter)` entry points stay. The localStorage AI presets are gone.

## Capabilities

### New Capabilities
- `instructions-room`: the Instructions room type — skills, roles, rights, use in chats and projects.
- `knowledge-room`: the Knowledge room type — vectorization, indexing state, roles, rights, the vectorization-off mode.
- `ai-projects-api`: the `/ai/projects` server contract — entity, roles, guard, rights, validation, grants, membership, listings, chat-context.
- `ai-projects-catalog`: the AI Projects section and its list — access, views, filters, empty states, lifecycle actions, membership through the room panels, live updates.
- `ai-project-workspace`: the open-project view — header, fixed model, intro, sources column, mobile strip, and how the view follows edits, deletion and leaving.
- `ai-chat-sources`: the chat logic — skills, knowledge search, Context folder, project override and refusals, thread scope, applying a project outside its page.
- `ai-chat-project-picker`: projects in a chat outside the projects page — the model picker entry and saving the chat setup as a project.

### Modified Capabilities
<!-- None: openspec/specs/ is empty. -->

## Impact

- **Client**: `packages/client/src/pages/AiProjects/**`, `components/AiPresetsBridge`, `Shell.jsx`, `routes/client.js`, `ClientArticleSidebar`, the Invite / Info / change-owner panels, the room role helpers (`getAccessOptions`, `getUserRoleOptionsByRoomType`, `Members.utils`), the Knowledge room empty/banner views; stores `AiProjectsStore`, `AiPresetsStore`.
- **Shared**: `packages/shared/api/ai/projects.ts`, the `/ai/projects` MSW mocks, room type titles, icons and access options for types 10, 11, 12.
- **Server (`../server`)**: ASC.AI.Chat (Node) serves `/api/2.0/ai/projects/*`, applies the project chat context to rounds and reads skills from Instructions rooms; the .NET AI service serves the room type, the list, the CRUD of `ai/projects` and the linked rooms (`projects/{id}/rooms`); Node composes the `aiProject` block, `skills`, `knowledge` and the chat context over them, and .NET must still store a model per project and grant Viewer on linked rooms. `FileSecurity` already blocks writes into Knowledge rooms with vectorization off.
- **Dependencies** (installed from local tarballs at the repo root): `@onlyoffice/apps-ui-kit` 4.1.0 (project room icon, `withoutArrows` tabs, room filter selectors, `AiChatStore.openProject` / `applyPreset` / `setProjectTitle` / `setComposerContextHidden` / `setFolderContextPickerEnabled` / `setOnSavePreset`, `profilePickerReadOnly`); `@onlyoffice/ai-chat` `1.0.2-progress.17` (several rooms per chat, composer room pickers).
- **Locales**: `Common:AIProject*`, `Common:InstructionsRoom*`, `Common:KnowledgeRoom*`; agent-only keys and the `AiAgentsTour` namespace removed.
- **Tests**: unit tests for the API module, `AiProjectsStore`, `AiPresetsStore`, `AiPresetsBridge`, `useAiPresetsPickerActions`, `useProjectContextMenu`, the page utils; E2E `ai-projects.spec.ts`, `ai-projects-access.spec.ts`.
