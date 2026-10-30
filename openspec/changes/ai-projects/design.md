# Design

## Context

See proposal.md (Why) for the motivation, and the seven spec deltas for the behavior: two room types (`instructions-room`, `knowledge-room`), the server contract (`ai-projects-api`), the chat logic (`ai-chat-sources`), and the three client views (`ai-projects-catalog`, `ai-project-workspace`, `ai-chat-project-picker`).

- **Prior state.** Before this change, the client had an AI Agents section backed by `AiRoomStore`, `CreateEditAgentStore` and agent branches across the Files stores. Chat setups were saved as localStorage "AI presets" through a floppy button in the chat header. Skills came from a `.ai` folder; now they come from Instructions rooms.
- **Server, what exists on the branch.**
  - Files: `RoomType` 10 / 11 with `FolderType` 38 / 39, their role sets in `FileSecurity.AvailableRoomAccesses` (both types currently allow Room manager, Content creator, Editing, Read), and the vectorization gate: `Create`, `CopyTo` and `MoveTo` into a Knowledge room are refused while `IsVectorizationEnabledAsync()` is false.
  - ASC.AI.Chat (Node): `/api/2.0/ai/projects/*` with every route the client calls. The room (list, create, get, update, delete) is delegated to `internal/ai/projects…` on .NET; the `aiProject` block, the `skills` and `knowledge` listings and the project chat context are composed in Node (`storage/aiProjectRooms.ts`) over the .NET linked-rooms routes (`GET/POST/DELETE internal/ai/projects/{id}/rooms`) and the Files API. `applyAiProjectChatContext` rewrites a project-scoped round from the project's `chat-context`. `roomSkills.ts` reads skills from an Instructions room's root. Thread storage folds any non-agent `entityId` to the global scope.
  - **The .NET side** (2026-10-30): room type 12 with its own root, `FileSecurity` rules, `ai/projects` list / create / get / update / delete and the linked rooms (`files_ai_project_room`, one flat set of room ids per project, the type told apart by the room, at most 100 per type, sorted by title, unlinked when the room is deleted, archived or moved to Trash) in `ASC.AI`. Still missing: a stored model per project and the Viewer grants on linked rooms. The in-process Node mock that stood in before is removed; development runs against the real service.
- **A project comes back as a room** (`FolderDto`) with an `aiProject` block: `profile` (always `null` until .NET stores a model), `instructionsRooms[]`, `knowledgeRooms[]`, `canEditSettings`, `warnings[]` (`roomUnavailable`, `modelNotStored`). The list answers the rooms without the block (`aiProject.partial` on the client), so `AiProjectsStore.openProject` reads the project on its own before the chat opens on it.
- **The chat lives in ui-kit and ai-chat.** The client can steer it only through the props `Shell.jsx` passes and the `AiChatStore` methods ui-kit exposes:
  - methods: `openProject`, `applyPreset`, `setProjectTitle`, `setOnSavePreset`, `setComposerContextHidden`, `setFolderContextPickerEnabled`;
  - props: `profilePickerReadOnly`, `contextRoom`, `entityId`, `chatIntro`, `suggestions`.
- **Branch history.** The branch first shipped mocked routes and a design note (dropped in 59affcf2e00; it predates the `ai/projects` API). The code is now the source of truth, and this change documents it.

## Goals / Non-Goals

**Goals:**
- Reuse the room machinery (Invite panel, Info panel, change-owner panel, invitation links, history) for projects instead of building parallel UI.
- Keep the chat wiring in `Shell.jsx` unchanged in shape. A project reaches the chat through the same "preset" hook the localStorage presets used.
- Make projects behave like rooms in the list: views, column settings, infinite scroll, socket-driven updates.

- Make the two source room types self-explanatory: a Knowledge room is a set of documents to search, an Instructions room a set of skills to follow, each with the smallest role set that fits.
- Keep a Knowledge room honest when vectorization is off: nothing new gets in, nothing pretends to be searchable.

**Non-Goals:**
- Implementing the .NET side here: `ai-projects-api` is the contract it must meet; the code lives in `../server` on its own branch.
- Archiving projects, shared (non-personal) threads, revoking auto-granted Viewer shares.
- The SDK's `(ai-agents)` and `(ai-arbiter)` entry points. They and the shared exports they import are kept deliberately.

## Decisions

### A dedicated `/ai/projects` API client, mapped to room shapes
`packages/shared/api/ai/projects.ts` has two mappers:
- `toAiProject` normalizes the server room into the page's `TAiProject`: logo color with `#`, linked rooms with `available` and `archived` defaulted, and `Leave` derived. Leave is `inRoom && access !== Owner`, because rooms have no such flag.
- `aiProjectToRoom` converts back to the `TRoom` shape the room panels read.

The module holds only what is specific to a project (list, get, create, update, delete, `skills`, `knowledge`), as the agents API did. Pin, mute, leave, owner change, logo removal, members, invitation links and history go through the room routes, so the room panels need no project branch and `AiProjectsStore` calls `api/rooms`, `api/files` and `api/settings` for them.

*Alternative:* mirror every room route under `/ai/projects/{id}` (the first cut). Rejected: it doubled the Node and .NET surface for calls whose behaviour is the room's, and the panels had to branch on the room type at every call.

*Alternative:* call `files/rooms?type=12` for the list too, as the early design note proposed. Rejected: ASC.AI.Chat owns the project contract (warnings, linked-room resolution, `skills` and `knowledge` listings), and agents already follow the delegate pattern.

### A project reaches the chat through three paths
Rooms the caller cannot read are filtered out before they reach the chat on every path.

- **Open.** The page calls ui-kit `AiChatStore.openProject({ profileId, instructionsRooms, knowledgeRooms })`. It is the project-named form of `openPreset`: it starts a fresh thread with the project's model, skills rooms and knowledge rooms. At the same time `AiProjectsStore.openProject` sets `AiPresetsStore.activePreset`, which Shell reads for `contextRoom` (the Instructions rooms) and `AiPresetsBridge` reads for the chat title.
- **Edit or reset.** An edit of the open project (by anyone) and leaving the project go through `applyPreset`. It changes the open chat in place, without a new thread, and the reset passes an empty preset.
- **Picker outside the page.** `AiPresetsBridge` also applies the project through `applyPreset`, because a project picked in a running chat should not discard its thread.

*Alternative:* one entry point for all three. Rejected: opening a project must start a new thread, while an edit or a pick must keep the current one, and ui-kit already separates the two.

### The page store and the presets store are separate
- `AiProjectsStore` (page-scoped) holds the list, filters, the open project, dialogs and the socket channels.
- `AiPresetsStore` (app-wide) holds the picker's project list, the active preset, and the save dialog for chats outside the page.
- `AiPresetsBridge` lives inside `AiAgentProviders`, where the chat store is reachable, and does the MobX ↔ chat-store wiring that a MobX store cannot do.

### Live updates follow the rooms' socket pattern
The page subscribes to `DIR-{projectsRoot}` and `DIR-{openProject}` and handles `s:modify-folder`:
- events are coalesced per project over 300 ms;
- a create, or an unknown id under the root, reloads the list;
- a 404 or 403 on reload drops the project, and if it was open sets `lostProjectId`.

The store never takes over or drops a channel it did not subscribe to itself, because the Files stores may hold the same channel.

### The open project is drawn like an agent's chat
The chat renders in the section body (`fullHeightBody`), not in the floating panel. This lets the section's own Info panel open beside it, and lets the sources column, the history and the Info panel share one side slot.

`Shell.jsx` treats `/ai-projects` as its own section for chat availability, because `currentClientView` and the selected folder are only set by Home.

### Leaving a project resets the chat
Two reactions reset the chat with an empty `applyPreset`, one per way a project reaches it:
- on the page, a reaction on `activeProject` handles every in-project exit: Back, closing the chat, lost or deleted project, page unmount. On unmount the project is closed before the chat panel, so the "closing the chat leaves the project" reaction finds nothing and does not navigate back;
- in `AiPresetsBridge`, a reaction on the chat's visibility handles a project applied from the picker.

Closing the chat on the page can fire both. The reset is idempotent and the bridge never navigates, so that is harmless.

### Gate in the page module, readiness inside the page
The route itself is not gated. `AiProjectsGate`, the page module's export, redirects to `DefaultPageRedirect` when `aiServicesEnabled` is false, and the sidebar item is only added while it is true. The page itself reuses the agents' `useChatNoAccess` readiness and activation flow for the "AI not ready" view.

### Source rooms are ordinary rooms with a narrowed role set
Instructions and Knowledge rooms reuse the room machinery (creation dialog, members, invitation links, archive, filters) and differ only in type, icon, texts and roles. The Knowledge room drops the Editor role: its files are sources to index, and an Editor who rewrites a document in place silently changes what the chat cites. The Instructions room keeps Editor, because skills are text that several people refine. The server's `AvailableRoomAccesses` and the three client role helpers (`getAccessOptions`, `getUserRoleOptionsByRoomType`, `Members.utils`) must agree; today all of them still offer Editing for the Knowledge room.

*Alternative:* a per-room "editable" switch. Rejected: a role set is what admins already understand.

### Vectorization off is a room state, not a portal error
The gate sits on the server in `FileSecurity` (`Create` / `CopyTo` / `MoveTo` refused) and in the knowledge tool (no search), so the client only has to mirror it: a banner inside the room from `settingsStore.aiConfig.vectorizationEnabled`, disabled upload controls, and disabled entries in the Knowledge room pickers of the composer and the project dialog. Linked rooms stay linked so that turning vectorization back on needs no re-linking. The banner previously existed for agents (`KnowledgeDisabledContainer`, removed with them in fac66aa42ba) and comes back for the room.

### Skills are read by Node, not by the client
The client never parses Markdown. The chat reads frontmatter through `GET files/rooms/{id}/ai` (Node `roomSkills.ts`), the project view through `GET ai/projects/{id}/skills`, which Node composes from the same `roomSkills.ts`, so there is one frontmatter parser.

### Remove the AI Agents feature outright
Projects replace agents in the sidebar, and the agent code paths in the Files stores were the main source of branching. They are deleted together with their locales and E2E specs, not hidden behind a flag.

## Risks / Trade-offs

- **[Risk]** The .NET side stores no model per project and grants no Viewer on linked rooms yet: a chosen model is answered with a `modelNotStored` warning and the project runs on the portal's Chat model; members must be given access to the linked rooms by hand. → Mitigation: `ai-projects-api` names both as the server's remaining work; the Node composition keeps the page working meanwhile.
- **[Risk]** Role sets drift between server and client for the Knowledge room. → Mitigation: one task changes `FileSecurity.AvailableRoomAccesses` and the three client helpers together, with a unit test on the client helpers.
- **[Risk]** A project still travels as a "preset" (`activePreset`, `applyPreset`) beside `openProject`, which makes the code harder to follow. → Mitigation: doc comments on `AiProjectsStore`, `AiPresetsStore` and `AiPresetsBridge` explain the hook. A ui-kit `applyProject` could remove the remaining preset names.
- **[Risk]** Outside the page, a chat closed with an applied project must lose the model and rooms too, not only `activePreset`. → Mitigation: `AiPresetsBridge` resets the chat with an empty `applyPreset` when the chat closes with an active preset, as the page does on leaving a project. A chat with no project applied is left alone. Covered in `AiPresetsBridge.test.tsx`.
- **[Trade-off]** Threads are never shared and have one global scope per user: there is no agent or project scope any more. The project id the chat sends as `entityId` selects the project's model and rooms for a round, not a separate thread list. So the history inside a project shows the user's threads from everywhere. That is what keeps "your conversation is yours only" true; a per-project history would need a new thread scope on the server.
- **[Trade-off]** The picker reads at most 100 projects, with no paging. Acceptable for a model-picker submenu; the full list lives on the page.
- **[Trade-off]** Removing agents is breaking for portals that relied on them in the web client. The server still serves agents, and the SDK entry points remain.

## Migration Plan

- No client data migration. The localStorage presets are abandoned rather than imported, because they were only on this unreleased branch.
- Rollout depends on the rest of the .NET `ai/projects` implementation, on ui-kit 4.1.0 (now a local tarball) and on ai-chat `1.0.2-progress.17` (also a local tarball). Both packages must be published, and the manifests moved back to npm versions, before release.
- Existing Knowledge rooms with Editor members: when the Editor role is removed, those shares must be migrated to Viewer (or Content creator) by the server migration, and the client must not show an unknown role.
- Rollback means reverting the branch merge. The server can keep serving agents and projects independently.

## Open Questions

- **Default view and side-info content on tablet and mobile.** The rows view shows fixed Instructions / Knowledge groups. Whether it should follow the sort field as `FilesRowContent` does can be settled with design later.
- **Illustrations.** A dedicated empty-state illustration and a project icon are still to be drawn. The agents' assets are used for now.
