# Tasks

Most of the client work is already on `feature/new-ai-concept`. Tasks marked `[x]` record the commits that delivered them. Unchecked tasks are what the specs still require in the client, ui-kit / ai-chat and ASC.AI.Chat (Node). The .NET side is out of scope here and listed untracked in group 7.

## 1. Shared API and room types

- [x] 1.1 Add `RoomsType.AiProjectRoom` (12) to room titles, descriptions and access options, and keep it out of the user-creatable room types (e2f0b84e35e); verify that type 12 rooms render with the project icon
- [x] 1.2 Add the Instructions (10) and Knowledge (11) room types across Rooms: creation dialog, titles, icons, type filter, access options, members (67f8e24fda9); verify that both types can be created and filtered in Rooms
- [x] 1.3 Add `packages/shared/api/ai/projects.ts` with the project calls and the `toAiProject` / `aiProjectToRoom` mappers (03c7145721b); verify with `packages/shared/api/ai/projects.test.ts`
- [x] 1.4 Add the `/ai/projects` MSW handlers in `packages/shared/__mocks__/handlers/ai/projects.ts` (0608154ff67); verify that the E2E specs run against them

## 2. Instructions room (client + ASC.AI.Chat)

- [x] 2.1 Client: hide "New folder" and the folder-upload entries inside an Instructions room, offer only a Markdown file in "Create", and refuse non-`.md` files in the upload dialog and the drop zone with a message (`EmptyViewContainer.helpers`, the main button, the context menu, the upload store); verify with E2E cases for a folder create and a `.docx` drop in an Instructions room
- [x] 2.2 Client: read a linked room's skills when its row is expanded in the project's Instructions card instead of on project open (`AiProjectsStore.fetchSkills` per room on demand, `ProjectSources`); verify with a unit case that opening a project makes no skills request and expanding a row makes one
- [x] 2.3 ASC.AI.Chat: resolve the skills of composer-picked Instructions rooms (`actionArgs.contextRooms`) on every round from the server, the way `linkedSkillRooms` does for projects, instead of trusting the list the widget sent at connection; verify with a Node unit test where a skill is added between two rounds

## 2a. Knowledge room (client + ui-kit + ASC.AI.Chat)

- [x] 2a.1 Client: remove the Editor role from the Knowledge room in `getAccessOptions`, `getUserRoleOptionsByRoomType` and `Members.utils` (the Instructions room keeps it); verify with a unit test on the three helpers that type 11 offers Room manager, Content creator and Viewer only, and type 10 still offers Editor
- [x] 2a.2 Client: hide "New folder" and the folder-upload entries inside a Knowledge room, and open its files in view mode with no edit action; verify with an E2E case that a Knowledge room's "Create" offers no folder and a file opens read-only
- [x] 2a.3 Client: add the vectorization-off banner inside a Knowledge room (admin: link to AI settings; others: contact admin), driven by `settingsStore.aiConfig.vectorizationEnabled`; verify with an E2E screenshot of the room under `vectorizationEnabled: false` in the `/ai/config` mock
- [x] 2a.4 Client: hide the upload and create controls of a Knowledge room while vectorization is off (the server already refuses `Create` / `CopyTo` / `MoveTo`); verify that the main button and the drop zone are absent in that state
- [x] 2a.5 Client: disable Knowledge rooms with a hint in the project dialog's room selector while vectorization is off; verify with the create-dialog E2E case under `vectorizationEnabled: false`
- [x] 2a.6 ui-kit / ai-chat: hide the composer's knowledge base picker (`ComposerActionKnowledge`) while vectorization is off, driven by a host flag; verify by opening the composer's source actions in the running app with vectorization off
- [x] 2a.7 ASC.AI.Chat: refuse linking a Knowledge room (400) while vectorization is disabled, in `aiProjectsController` (create / update) and the mock; verify with a Node unit test that names a Knowledge room under the flag

- [x] 2a.8 Client: give a Knowledge room's "Create" menu "Upload from storage" (multi-select workspace picker filtered to `extsFilesVectorized`, copied in through `copyFilesToKnowledgeRoom`) and "Upload from device" (`accept` limited to `extsFilesVectorized`), in the main button, the "+" menu and the empty view, and block the create hotkeys in Instructions and Knowledge rooms; verify with `ContextOptionsStore.models.test.ts` (Knowledge room menu) and `hotkeys.test.ts`

## 2b. Align the client with the contract

- [x] 2b.1 (`ai-projects-catalog` search and filter) Send the list's room filter as `linkedRoomId` instead of `instructionsRoomId` / `knowledgeRoomId` (`shared/api/ai/projects.ts`, `AiProjectsStore`, the MSW handler); verify with `AiProjectsStore.test.ts` and the filter case in `ai-projects.spec.ts`
- [ ] 2b.2 Drop a project's linked room from the list and the open project when the server unlinks it (permanent deletion); show `profile.available: false` as "model unavailable" in the dialog, intro and Details; verify with unit cases in `AiProjectsStore.test.ts` on a reload that lost a room and a profile
- [x] 2b.3 Show the "model unavailable, change it" error in a project's chat on `profile.available: false` or a 409 `projectModelUnavailable`, with an Edit-project action for the owner and managers and an "ask a manager" text for members, keep the composer disabled until the model changes, and clear the error when an edit brings a working model (`Shell.jsx` `formatChatError`, `AiProjectsStore`, ui-kit error box); verify with an E2E case on a mock project with a deleted model for a manager and for a member

- [x] 2b.4 Keep only the project-specific calls in `shared/api/ai/projects.ts` (list, get, create, update, delete, skills, knowledge) and route pin, mute, duplicate, leave, owner change, logo removal, members, invitation links, resend and history through `api/rooms`, `api/files` and `api/settings`, dropping the `isAiProjectRoom` branches from the Invite panel, Contacts, History and the group-members dialog and the mirrored routes from ASC.AI.Chat (real and mock controllers); verify with `projects.test.ts` and `AiProjectsStore.test.ts`

## 3. Projects list section

- [x] 3.1 Add the `/ai-projects/:projectId?` route, the sidebar entry and the `AiProjectsGate` redirect when AI services are off (67f8e24fda9, e3e954bbc26); verify with `ai-projects-access.spec.ts`
- [x] 3.2 Add `AiProjectsStore` with list paging, search, owner and room filters, sort and a persisted view (187e82eb493, ae394fd452b, 989873d479b); verify with `store/__tests__/AiProjectsStore.test.ts`
- [x] 3.3 Add the table, rows and tiles views with source tags, column settings and infinite scroll (187e82eb493, 063da703aea, ae394fd452b); verify with the three list-view screenshots in `ai-projects.spec.ts`
- [x] 3.4 Add the empty states (none / AI not ready / filter without results) by caller type (187e82eb493, e3e954bbc26); verify with the empty-screen cases in `ai-projects.spec.ts`
- [x] 3.5 Add live updates over `DIR-{root}` and `DIR-{project}` with coalesced reloads and lost-project handling (03c7145721b); verify with the live-update cases in `AiProjectsStore.test.ts`
- [x] 3.6 Gate the empty state's "Create project" by the page's `canCreate` (role, chat available, AI ready) instead of the role alone (uncommitted); verify that the empty state on a standalone portal with no chat profile yet shows only "Go to Rooms" for an admin

- [x] 3.9 Make the list look like Rooms: drop the linked rooms from the table, rows, tiles and the Info panel Details, add Tags (managed in place through `TagManagement`, a click filtering the list) and Owner, take the Rooms filter (owner, Contacts, tags) and sorts (name, tags, owner, last activity), tags in the project dialog, `tags` in the API client and both mocks (`shared/api/ai/projects.ts`, `AiProjectsStore`, `ProjectsFilter`, `TableView`, `RowsView`, `ProjectTile`, `Details.utils.tsx`, the MSW handler, the Node mock); verify with `projects.test.ts`, `AiProjectsStore.test.ts` and the list cases of `ai-projects.spec.ts`

## 4. Project lifecycle and membership

- [x] 4.1 Add the create/edit aside dialog: name, cover, model, Instructions and Knowledge room selectors, owner (187e82eb493, 7b83d0066ac); verify with the create-dialog case in `ai-projects.spec.ts`
- [x] 4.2 Add the context menu gated by the security flags, with leave derived for non-owners (187e82eb493); verify with `pages/AiProjects/__tests__/useProjectContextMenu.test.tsx`
- [x] 4.3 Add delete and duplicate through file operations, plus pin, mute, leave, change owner, copy link and server-warning toasts (03c7145721b); verify with the mutation cases in `AiProjectsStore.test.ts`
- [x] 4.4 Route the Invite panel, Info panel Contacts and History, invitation link and change-owner panel to `/ai/projects/{id}/*` for type 12 rooms, and show `aiProjectWarnings` (75a35715091, 03c7145721b); verify by inviting a Member in the running app and seeing them in Contacts
- [x] 4.5 Keep the Info panel selection in step with the open, edited, deleted or left project (716c3be08b3); verify that the panel closes after leaving the project
- [x] 4.6 Show the server's error text for mute/unmute through `errorMessage`, as the other actions do (uncommitted); verify that a refused mute toasts the server message
- [x] 4.7 Let the project dialog take an uploaded logo as the room dialog does (image editor, crop, "Delete"): upload through `files/logos`, send the crop as the body's `logo` on create/update and remove it with the room route `DELETE files/rooms/{id}/logo`, draw the picture in `ProjectLogo` (list, intro, header chips) and in the MSW mock; verify with `AiProjectsStore.test.ts` (logo removal) and the create case in `ai-projects.spec.ts` (picture upload)
- [x] 4.8 Open the new project (`/ai-projects/{id}`) after a successful create from the dialog, as Rooms opens a new room; the chat's save action (`AiPresetsStore`) keeps its place; verify with the create-dialog case in `ai-projects.spec.ts`

- [x] 4.9 Make a Member the room's Read (`access` 2) everywhere a project names its roles (`AiProjectAccess`, `getAccessOptions`, `getDefaultAccessUser`, the Contacts role options, both mocks) and drop Duplicate from the project menu, store, security shape and specs, as `FileSecurity` refuses it for a project; verify with `useProjectContextMenu.test.tsx`, `AiProjectsStore.test.ts` and `projects.test.ts`

- [x] 4.10 Remove the in-process AI projects mock from ASC.AI.Chat (controller, storage, config flag, README section, the chat-context and Files helper fallbacks) now that the .NET room type and CRUD exist; verify with the Node unit tests
- [x] 4.11 Compose the client contract over the .NET linked-rooms routes in ASC.AI.Chat (`storage/aiProjectRooms.ts`): the `aiProject` block on get / create / update, room lists of the body as link / unlink diffs with `roomUnavailable` warnings, `modelNotStored` for a chosen model, `skills` and `knowledge` from the Files API, the chat context from the project room and the portal's Chat assignment; the list stays without the block.
- [x] 4.12 Client: mark a project from the list as `aiProject.partial` and read it on its own in `AiProjectsStore.openProject` before the chat opens; drop the `role` / `hasInstructions` / `hasKnowledge` / `linkedRoomId` query fields .NET does not read; the MSW list answers without the block.

## 5. Inside a project

- [x] 5.1 Render the open project's chat in the section body under the project header with the chat toolbar (187e82eb493); verify by opening a project from the list and through a deep link
- [x] 5.2 Scope the chat to the project (`entityId`), make the model picker read-only, open the project's chat through ui-kit `AiChatStore.openProject` with its available linked rooms, and hand its Instructions rooms to Shell through the active preset (187e82eb493, 03c7145721b); verify that a Member cannot change the model
- [x] 5.3 Add the `ProjectIntro` empty-chat view with logo, model and room chips, and no suggestions (187e82eb493, e3e954bbc26); verify with the project screenshot in `ai-projects.spec.ts`
- [x] 5.4 Add the sources column: Instructions with skills, Knowledge with its files, personal Context, and room links via `filter?folder=` (187e82eb493, e3e954bbc26); verify by opening a skill and a room from the column
- [x] 5.5 Leave out the Instructions and Knowledge cards and tabs of a project without available rooms of that kind, and draw the sources as a tab strip on tablet and mobile (187e82eb493, 03c7145721b, bc0f3e55316, uncommitted availability filter); verify with the "project without sources" case in `ai-projects.spec.ts`
- [x] 5.6 Keep the chat in step with the project: apply edits in place, reset on leave, close on a lost project, close when leaving the page (96276b24c3f, e6ebb167409, e7575e26268); verify that a chat opened in Rooms after leaving a project uses the default model
- [x] 5.7 Knowledge card: list every file of a room with its vectorization state (not only indexed ones), offer "Vectorization" (retry, `api.ai.retryVectorization`, through the shared `FailedVectorizationBadge`) on a failed file to users with `security.Vectorization`, and show a warning icon with a tooltip at the end of a room row that has failed files; the Node mock sends `vectorizationStatus`, `security.Vectorization` and `failedFiles` in `GET ai/projects/{id}/knowledge` (the real controller passes them through from .NET, group 7); verify with `AiProjectsStore.test.ts` (retry) and the knowledge case in `ai-projects.spec.ts`
- [x] 5.8 Tell deletion and lost access apart when the open project goes: the socket `delete` event shows a "project was deleted" toast, a 404/403 on reload keeps `Common:AIProjectNotAvailable` (`AiProjectsStore.lostProjectId` carries the reason, `pages/AiProjects/index.tsx` picks the toast); verify with `AiProjectsStore.test.ts` and the lost-project case in `ai-projects.spec.ts`

## 6. Chat sources and projects outside the page

- [x] 6.1 Stop connecting an Instructions room by location; Instructions and Knowledge rooms are picked in the composer (a3791d4f305, ai-chat progress.14–17); verify that opening the chat inside an Instructions room shows no connected skills room
- [x] 6.2 Switch `AiPresetsStore` from localStorage to `ai/projects`, with a 100-project picker list and re-reading on pick (a3791d4f305); verify with `store/__tests__/AiPresetsStore.test.ts`
- [x] 6.3 Add the `useAiPresetsPickerActions` "Choose AI Project" entry and the "not available" notice for a gone project (67f8e24fda9, a3791d4f305); verify with `Hooks/__tests__/useAiPresetsPickerActions.test.ts`
- [x] 6.4 Add the `AiPresetsBridge` save-as-project dialog for owner, admins and room admins, hidden inside a project (67f8e24fda9, a3791d4f305); verify with `components/AiPresetsBridge/__tests__/AiPresetsBridge.test.tsx`
- [x] 6.5 Reset the chat's model and all rooms when a chat with an applied project closes, and leave a chat with no project untouched (uncommitted); verify with the two closing cases in `AiPresetsBridge.test.tsx`
- [x] 6.6 Server (Node): rewrite a project-scoped round from the project's chat-context, refuse with 403 / 409, read skills from Instructions rooms, fold threads to the global scope (`../server` 169966cba5 and earlier); verify with the ASC.AI.Chat unit tests
- [x] 6.7 ASC.AI.Chat: when a project-scoped round carries no `actionArgs.folderContext`, use the caller's My documents as the location fragment and the file tools' scope instead of the project id (`applyAiProjectChatContext` / `withContextFragment`); verify with a Node unit test on a project round without a folder context

## 7. Deferred to the .NET side (not tracked here)

These come from the specs but are owned by `../server` C#; they are listed so the client and Node tasks above are not mistaken for the whole job.

- Store a model per project (`aiProject.profileId`, three states on update) and serve it in the DTO and the chat context; until then Node answers `profile: null` and a `modelNotStored` warning (the room type, the list, the CRUD and the linked rooms `projects/{id}/rooms` landed on 2026-10-30).
- Grant Viewer on the linked rooms to every member (on invite, accepted link, owner change and link) and report a `grantSkipped` warning.
- Make Instructions and Knowledge rooms flat (refuse folder create, copy and move) and limit Instructions rooms to `.md` on upload, create, copy and move, with a user-facing message.
- Drop `FileShare.Editing` from `AvailableRoomAccesses[KnowledgeRoom]` (no share migration: the feature is unreleased).
- Refuse linking a Knowledge room while vectorization is disabled, in the .NET validation.
- Take the uploaded `logo` in the create/update body and let the room routes (`files/rooms/{id}/{pin,unpin,share,links,resend,logo}`, `files/folder/{id}/log`, `files/owner`, `files/fileops/duplicate`, `settings/notification/rooms`) accept the AI project room type with the project rules of `ai-projects-api`.
- On `PUT files/rooms/{id}/share` of a project, invite each new member to every linked Instructions and Knowledge room as Viewer and report a room that could not be granted as a `grantSkipped` warning, per `ai-projects-catalog` "Members are invited to the linked rooms".

## 8. Remove AI Agents

- [x] 8.1 Remove the agent routes, pages, dialogs, tour, quota settings page, stores and Files-store branches, agent locales and six agent E2E specs, keeping the SDK-used shared exports (fac66aa42ba, 91f882044e8); verify that `pnpm run tsc` and `pnpm run lint` pass

## 9. Integration checks

- [ ] 9.1 Run `openspec validate ai-projects --strict` and verify it passes
- [ ] 9.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`) and verify every command passes
- [ ] 9.3 Run `ai-projects.spec.ts` and `ai-projects-access.spec.ts` in Docker and verify they pass with the committed screenshots
- [ ] 9.4 Run the locale completeness check (`cd common/tests && npx vitest run test/locales.test.js`) and verify the new `Common:*` keys exist in every supported language
- [ ] 9.5 Against the real `ai/projects`, verify the specs end to end: create a project, invite a Member, check the Viewer grant on a linked room, open as that Member, edit from the owner's side, turn vectorization off and check the Knowledge room banner and pickers, then delete

## 10. AI sections (replace the AI Projects page; two roots since .NET 7d32683f39)

- [x] 10.1 Shared: `RoomSearchArea.AiHub` / `AiProjects`, `CategoryType.AiHub` / `AiHubRoom` / `AiProjects` / `AiProject`, `FOLDER_NAMES[41]` / `[42]`, both roots in `sortInDisplayOrder`, `AI_HUB_SECTION_TYPES` (10, 11) and `AI_HUB_SECTION_FOLDER_TYPES` (38, 39) in `shared/utils/rooms.tsx` with 10/11 dropped from `ROOMS_SECTION_TYPES`, `ROOMS_SECTION_FOLDER_TYPES` and `getCreateRoomTypes`; per-user filter keys for both search areas; `api.rooms.getRooms` reads `ai/projects` for `searchArea=AiProjects`; verify with a unit test on `getRooms`
- [x] 10.2 Client stores: `TreeFoldersStore` (`aiHubFolder(Id)`, `aiProjectsFolder(Id)`, `isAiHubFolder(Root)`, `isAiProjectsFolder(Root)`, `isAiSectionFolder`, `isAiProjectRoomRoot`, the root titles), the `isRooms` unions in FilesStore, fetch / mutation / socket helpers, TableStore, selection and views, the category and URL helpers, back navigation and the section trash URL; verify with the store suites
- [x] 10.3 Routes and sidebar: `/ai-rooms/filter`, `/ai-rooms/:room(/filter)`, `/ai-rooms/recent|favorites|trash(/filter)`, `/ai-projects(/filter)`, `/ai-projects/:room(/filter)` rendered by Home behind an AI-services gate; the bare `/ai-rooms` stays the SDK frame (`Client.jsx`, `SectionNavigationContext` match it exactly); the "AI rooms" item with three slots and the "AI Projects" item in `ClientArticleSidebar`
- [x] 10.4 Section UI: header titles and plus buttons, `getSectionCreateButton` / mobile create button ("New room", "New project"), the filter (type options 10/11 in AI rooms, none in AI Projects, remembered apart), the bulk header menu, group and item context options (no archive, no template, no groups for the AI types; no duplicate for a project), `getFolderModel` "+ New", empty views (none / AI not ready / filter) and the quick actions
- [x] 10.5 Create and edit: `isAiRoomsCreate` three-type picker, the project form for "AI project" and for "New project" (`isAiProjectCreate`), `Events.ROOM_EDIT` on a type-12 room opens the form, `onOpenNewRoom` lands in the room's section, the project form's room selectors ask for `searchArea=AiHub`; verify with `AiProjectsStore.test.ts`
- [x] 10.6 Workspace in Home: `AiProjectView` in `pages/Home/View` for a type-12 room; `AiProjectsStore` reduced to the open project, sources, chat sync and the form; the page, its list views, filter, header, empty state and `useProjectContextMenu` deleted; `Shell.jsx` without the page exception
- [x] 10.7 ASC.AI.Chat (Node): list the Instructions and Knowledge rooms for the composer pickers with `searchArea=AiHub` (`roomSkills.ts`); verify with the Node unit tests
- [x] 10.8 ui-kit: the room selector asks for `searchArea=AiHub` when its type filter holds only Instructions or Knowledge rooms (the composer's room pickers and the project form), as it does for form rooms; verify with `useRoomsHelper.test.tsx`
- [x] 10.9 Mocks, locales and E2E: the `@root` mock serves both roots, `aiSectionsHandlers` serves the AI rooms list and the AI room folders; the 67 `Common` keys of the AI feature have translator comments and are translated into every language; `ai-projects.spec.ts` / `ai-projects-access.spec.ts` cover both sections (14 cases, screenshots taken in Docker)

## Workflow follow-up

- Archive the change with `/opsx:archive ai-projects` once 9.x passes, so the seven capabilities land in `openspec/specs/` as the baseline.
