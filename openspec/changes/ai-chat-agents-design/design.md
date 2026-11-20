# Design

## Context

See proposal.md (Why, Source of truth) for the motivation and the three bases. This section holds only what shapes the approach.

- **Three repositories.** The chat is drawn by the ai-chat library (`onlyoffice-ai-chat`, branch `feature/composer-plus-menu`), wrapped by ui-kit's `ai-agent/*` (`docspace-ui-kit-react`, branch `feature/new-ai-concept`), and steered by the client through the props `Shell.jsx` passes and the chat store ui-kit exposes. The client consumes both as local tarballs (ai-chat `1.0.2-progress.54`, ui-kit 4.1.0 with the peer range `>=1.0.2-progress.54`). A new library option reaches the client only after a library pack, a ui-kit build with a raised peer range, and the client's lockfile.
- **The library has other hosts** (the desktop editors' plugin among them). Whatever this change adds to it is switched on through its widget configuration and leaves the default as it is.
- **An agent is a room of type 12** with linked Instructions and Knowledge rooms and a model; its roles, rights and visibility are the server's. Nothing in this change alters them; `ai-agent-access` says what the interface offers on top of them.
- **What the removed AI Agents feature gives.** Its words: 110 of its `Common` keys are still in `Common.json`, translated in every language. Its rule that the chat inside an agent is scoped to that agent. Its limit of the Agent manager role to admins. Its room type, quota, knowledge files, result storage and MCP list are not brought back; the table below sets the two side by side.
- **No CodeGraph on the authoring machine** (no `codegraph` CLI, no `.codegraph/` in `../server`). By the decision of 2026-11-12 this change states no new fact about `../server`. Everything it needs from the server is listed in proposal.md as an expected contract, and tasks.md gates the dependent tasks on confirming it through CodeGraph.

### Old agents and agents now

The left column is the client as it was before commit `fac66aa42ba`, read from the repository history.

| | Old agents | Agents in this change |
|---|---|---|
| What an agent is | A room of type 9 with files of its own: a knowledge base and a result storage, a quota, MCP servers. | A room of type 12 with no files: a model plus linked skill sets and knowledge bases. |
| Roles | Agent manager, Content creator, Viewer; a Viewer had no chat. | Agent manager and Member; every member chats. |
| Who may be Agent manager | Portal owner, DocSpace admins, room admins; disabled for a User with a note. | The same, and the same note (`UserAgentMaxAvailableRoleWarning`). |
| Guests and groups | A guest as Viewer only, a group up to Content creator. | Not offered in the invite panel. |
| Who creates | Portal owner, DocSpace admins, room admins. | The same. |
| Admin who is not a member | View-only: the results of others, a notice, no chat. | The "not a member" view, no chat. |
| Model in the composer | Changed there by those who may edit the agent; a label for others. | A label for everyone; changed in the agent's form. |
| Scope of the chat | The agent inside its room. An agent picked elsewhere kept the location's scope and was only remembered by the conversation. | The agent, wherever the chat runs on it. |
| Menu | Edit agent, Invite contacts, Copy link, Agent info, pin, notifications, change owner, Leave agent, Delete agent. | The same actions in the boards' order, with Share agent for the invite. |
| Info panel | Members, History, Details. | Details and Context. |
| Guests and the chat | A guest never starts the AI chat. | The same (`ai-agent-access` "Guests have no AI chat"). |

### Boards and what covers them

Version `1794687729-e1b1` of the design, read on 2026-11-16, has fifteen boards. Compared with what this file recorded on 2026-11-13: board 01's slash menu gained a Knowledge bases section and sentence-case "Manage ..." rows and lost the toolbar buttons with badges and "Commands"; board 04 is now the Templates tab with a template's Info panel; board 09's About tab is Details; boards 11–14 have new columns and Info panels; board 13 is a modal with a Markdown toolbar; board 15 is new.

| Board | Covered by | Left out, and why |
|-------|------------|-------------------|
| 01 Menu | The sidebar already matches; the slash menu's Knowledge bases section and its sentence-case rows: `ai-chat-source-menus` "Slash menu", "Manage rows". | The chip row for a called skill and the "Added" label: calls stay inline and are ticked (`ai-chat-source-menus` "Skill calls in the draft", "Calling a skill from a list"). Knowledge bases are inert rows, not buttons. |
| 02 Room picker | `ai-chat-agent-menu` (menu, title, Save as new agent, header) | — |
| 03 Room agent | `ai-chat-agent-menu` (Agent actions, history in the menu), `ai-agent-conversations` | Share agent, New chat, Save as new agent and Expand inside "Agent actions": the menu holds the agent's own actions (owner, 2026-11-13), New chat and Expand keep their buttons and "Save as new agent" is in the title menu. |
| 04 Agents | `ai-agents-list` (tabs, Templates catalog, Template in the Info panel, Category row), `ai-agent-info-panel` | The "Already added" mark: nothing the client reads ties a room to its template (proposal, server item 5). The Model row of a template: the template files carry no model (`ASC.AI.Chat/templates/agents/*/*.json`). "Create agent from …" is the catalog's Install. Owner "ONLYOFFICE" on an agent: `ai-agents-list` "No official agents". |
| 05 Plus menu | `ai-chat-source-menus` (Skill sets list, removing a set, manage rows) | Its "Manage Skill Sets..." is written in sentence case, as on board 01. |
| 06 Slash | `ai-chat-source-menus` (Slash menu, skill calls) | The hover box on a call: needs a rich input. The board lists skill sets only; the sections of board 01 are taken, with Data sources after them. |
| 07 Data sources | `ai-chat-source-menus` (Data sources list, limit, manage rows) | — |
| 08 Agent chat + info | `ai-agent-page` (title menu, Share agent), `ai-agent-info-panel` (Context), `ai-chat-messages` | Context's Data sources section (the owner's decision, proposal). The "current room" tag: the agent's page has no location. |
| 09 Agent chat + details | `ai-agent-info-panel` (Details), `ai-agents-list` "Agent description" | Access "Everyone in DocSpace": `ai-agent-access` "No portal-wide access". Owner "ONLYOFFICE": as on board 04. |
| 10 Agent chat + content | `ai-agent-info-panel` (Content) | "Not saved" and "From device": files are saved at once and the origin is not recorded. The copy to a room is not built. |
| 11 Skill sets | `ai-skill-sets` (Columns of the Skill sets list, Skill set in the Info panel, Use a skill set in the chat) | The set's description and the skill names on the count's hover: server item 5. "Used by" is a number, not the agents' names ("Used by comes from the room"). Last modified shows the time too. |
| 12 Skill set open | `ai-skill-sets` (Skills of an opened skill set, Skill in the Info panel, View instructions, Use a skill set in the chat) | — |
| 13 Edit skill | `ai-skill-sets` (Edit skill, Markdown toolbar, What the toolbar buttons do, Saving a skill) | The instructions are a code editor, not a plain text field. |
| 14 Knowledge bases | `ai-knowledge-bases` (Columns, Indexing state of a knowledge base, Knowledge base in the Info panel, Use a knowledge base in the chat) | The description and "Last indexed" (the list shows Last modified): server item 5. "Used by" is a number, not the agents' names ("Used by comes from the room"). The state is marked in the table view only. |
| 15 Knowledge base open | `ai-knowledge-bases` (Files of an opened knowledge base, Indexing state of a file, File in the Info panel) | The reason a file failed (server item 5): a fixed note says it could not be prepared. The "Add files" button: the create menu keeps "Upload from storage" and "Upload from device". |

## Goals / Non-Goals

**Goals:**
- One rule set for a chat that runs on an agent, whether it is shown on the agent's page or in the chat panel.
- Reuse the room machinery (rights, invite panel, Info panel, context options) for every agent action instead of a parallel set of dialogs.
- One model of a chat's sources behind the "+" menu, the slash menu and the Context tab, so they cannot disagree.
- Library additions that other hosts never see unless they ask for them.

**Non-Goals:**
- Renaming internals: stores, the API module, routes, locale keys and types keep their `AiProject*` and `AiPreset*` names.
- A rich text input in place of the composer's textarea.
- Implementing or specifying server routes. This change records what it expects and stops at the client side.
- Bringing back anything of the old agent room type beyond its words and its per-agent conversations.

## Decisions

### Words change, names in the code do not
Texts say "agent"; keys and code stay. Where a key kept from the old agents says the same thing, the call site switches to it, because those keys are already translated in every language: `AIAgent`, `AIAgents`, `CreateAgent`, `NewAgent`, `AgentName`, `AgentOwner`, `AgentManager`, `UserAgentMaxAvailableRoleWarning`, `EditAgent`, `AgentInfo`, `LeaveTheAgent`, `WantLeaveAgent`, `LeaveAgentDescription`, `DeleteAgent`, `DeleteAIAgentTitle`, `DeleteAIAgentDescription`, `AIAgentsEmptyScreenTent`, `EmptyFilterAIAgentsDescription`. An old text that describes what agents no longer have (the role descriptions speak of knowledge files and result storage) is not reused. The `AIProject*` values with no such twin are reworded, and the `AIProject*` keys that end up unused are removed.

*Alternative:* rename the keys to `Agent*`. Rejected: every locale file, every call site and the menu snapshots would change for no visible gain.

*Trap:* three Vitest snapshots record the i18n keys of the context menus (`.claude/rules/source-checks.md`), so the agent wording of the room menu changes them; update only those snapshots and review the diff.

### A conversation is scoped by its agent
The chat's scope, the id the library sends when it creates and lists conversations and with every round, is the agent's id whenever the chat runs on an agent: on its page, as today and as old agents had it, and in the chat panel, which is new: an old agent picked outside its room left the scope with the location. The library already asks for the list of the scope it is given, so on the client the change is where the scope is set. On the default agent the scope is empty and the history asks for all conversations.

Three things follow, and they are requirements of `ai-agent-conversations`:
- picking an agent switches the chat to it, with a new conversation when the current one has messages, instead of applying its settings to the conversation in progress;
- the model is fixed and the skill sets and knowledge bases are the agent's in the panel too, so the "sources manager" the client sets on the agent's page is set for a picked agent as well;
- the in-place apply stays for one case only: an edit of the agent the chat already runs on.

*Alternatives:* keep one list and filter it on the client by a stamp on the conversation (rejected: a conversation could be continued under another agent, and nothing on the server would hold the rule); scope the history only on the agent's page (rejected: board 03 shows the agent's history in the panel).

*State (2026-11-16):* the AI storage takes the scope (`ThreadStorageService.CreateAsync` checks the folder and stores it as `EntryId`; `ThreadQueries` lists by it), and ASC.AI.Chat now sends it on create and on list, which the thread artifacts required (see "Info panel"). What is built is the storage side only: the scope is still set by the page, so a pick in the chat panel does not yet start a conversation of that agent.

### The default agent's history lists everything
The history of the default agent, and the sidebar's Recent, list all of the user's conversations; an agent's history narrows to that agent. Opening a conversation switches the chat to the agent it belongs to.

*State (2026-11-16):* not reachable yet. A list asked without a scope answers only the threads of no project (`ThreadQueries`, `EntryId == null`), so since ASC.AI.Chat scopes threads the default agent's history and Recent show the conversations of no agent, and an agent's conversations are found in that agent only. The specs say so until the storage can list them together. Conversations started in an agent before the change carry no agent and stay in the general list.

*Why:* Recent already shows one list, and a user looking for a conversation should not have to remember which agent it was with. *Alternative:* the default agent lists only its own conversations (cleaner, but Recent would then be a third kind of list). To confirm with the product owner.

### The panel's agent actions come from the client
The title menu is shown by one rule, kept in ui-kit's chat store: the client has handed over its agents, and there is at least one agent or a save hook (`onSavePreset`, which the client sets only for a user who may create agents). The client therefore hands the menu over with no agents too and does not decide itself whether it shows. "Save as new agent" in the title menu and the removed header button share one hook that collects the chat's model and rooms, and the title menu offers it with an agent picked too.

ui-kit's chat store takes a list of actions for the picked agent (label, icon, handler, danger mark) from the client, which knows the agent's rights and owns the edit form, the invite panel and the delete flow. ui-kit adds only the history list: Expand keeps its button in the header and "Save as new agent" stays in the title menu, so the menu holds what is about the agent itself. The active agent the client keeps for the chat carries the agent's rights (change the settings, change the access, delete), read with the agent when it is picked.

Agent info makes the agent the Info panel's selection in place of the Files list's one and shows the panel where the user is; the chat panel closes, as the two share the side of the screen, and this close, unlike the user's own, keeps the agent: when that Info panel closes the chat opens again on it and the list gets its selection back. The Info panel is mounted with the Files pages only, so elsewhere the action goes to the agent's page.

Delete agent in the panel asks in a dialog of its own and deletes through the rooms API, not through the Files list's delete dialog: that one works on the list's selection, and the agent picked in the panel is not in it.

*Alternative:* ui-kit calls the room API itself. Rejected: ui-kit has none of the room dialogs.

### "Agent info" from the panel opens the Info panel in place of the chat
The chat panel and the Info panel exclude each other outside an agent's page, so the Info panel cannot open beside a docked chat: "Agent info" in the panel opens it instead of the chat, on the agent, and the page stays. *Alternative:* navigate to the agent's page with the Info panel on Details. Rejected: the user asked about the agent, not to leave where they are; it stays as the fallback for a page with no Info panel. *Alternative:* a dialog with the About content (no board shows one).

### The page title reuses the panel's agent menu
The navigation component of ui-kit gets a title slot, and the client puts the agent menu in it for a member. On the page a pick navigates: to the picked agent's page, or to the AI Chat page for the default agent. The same slot change lets the chat toolbar sit before the actions menu, as the boards show, instead of after it.

### Info panel: Details, Context and, on the agent's page, Content
An agent's panel has Details and Context. Details is the room's Details view. Context is a client view that reads the agent in full (its linked rooms and the caller's right to edit) and its skills, so it works the same for a card selected in the list and for "Agent info" from the chat panel. The server marks no room as an agent, so the tabs helper knows one by its room type. Each section of Context ends with its own "Manage ..." row (client, 2026-11-17); the Data sources section of board 08's Context is not built; the About tab of the first version of the boards is Details in the second.

Content exists only on the agent's own page, where the conversation on screen is known (`dialogsStore.aiChatActiveThreadId`, kept by `AiChatPageBridge`). Its two lists come from two places, as the server has them (`../server`, commits `8d1745d48f` and `de201d1dc6`):

- **Artifacts.** A thread of an AI project has a folder of its own inside the project (`ThreadFoldersService`, `<threadId>-artifacts`). `POST internal/ai/threads/{id}/artifacts` stores a file there and `GET api/2.0/files/rooms/{id}/threads/{threadId}/artifacts` lists it, both for the thread's author only. ASC.AI.Chat now saves a generated image through that route (`uploadThreadArtifact`), falling back to the round's folder when the thread takes none. The result files of the document agent go the same way: the outputs URL it delivers to names the round's thread, and its task log stays in the folder chosen for logs. Documents made by the .NET editor tools (`onlyoffice_generate_docx` and its kind, used while the document agent is not configured) are created by the server in the round's folder and are not routed there.
- **Attachments.** Nothing copies an attached file: a message keeps references to attachment records and each record names a DocSpace file where it is. The server stores `AttachmentsFolderId` but nothing fills or lists it. So the list is built in ASC.AI.Chat, not in the client: `GET api/2.0/ai/threads/attachments?threadId=` reads the thread's messages, takes the references of the user's messages, resolves them to file ids and answers each file as the Files service describes it, leaving out the deleted and the unreadable. *Alternative:* collect them in the browser from the messages on screen; rejected, as a long conversation is loaded in pages.

**Every attachment goes into the thread's attachments folder** (owner's decision, 2026-11-16), the files added from the device and the files picked in the portal alike, so the folder is the one place a conversation's inputs live, as the artifacts folder is for its outputs. The server does the last step (`../server`, commits `2f27926cce` and `6af79a13cc`): a file created in the root of the project room gets an attachment record of its own, and when attachments are bound to a message the caller's files that lie in that root are moved into the thread's folder, listed by `GET api/2.0/files/rooms/{id}/threads/{threadId}/attachments`. A chunked upload into the room is open to everyone who may chat with the agent and takes only an image or a format text is read from.

So what is left to the client and ASC.AI.Chat is to get the file into the room:
- a file from the device is uploaded there by ui-kit, as before; one the room refuses for its format (400) goes to My documents instead of failing;
- a file picked in the portal is copied there by ASC.AI.Chat when it is attached (`copyIntoProject`: read with the caller's credentials, uploaded through an upload session), and the copy is what is attached.

A file that cannot be copied stays attached where it is and is not in the folder, so not on Content: a format the room refuses, a file over 50 MB (held in memory on the way), a third-party file. The list ASC.AI.Chat built from the messages is gone; Content reads both lists from the Files service. Known costs: a portal file is stored twice and counts twice against the quota, later edits of the original do not reach the conversation, and a file attached and removed before the message is sent leaves its copy in the room's root. Conversations outside an agent have no folders at all.

**A thread now belongs to its agent.** Both artifact routes refuse a thread whose `EntryId` is not the project, and ASC.AI.Chat used to create every thread with `entityId: null`. It now passes the project id on create and on list (`threadsStorage.ts`). The C# list without an entity answers only threads of no project, so: an agent's history lists that agent's conversations, the history outside agents lists the rest, and a conversation started in an agent before this change stays in the general list. This is the "conversations belong to an agent" rule of `ai-agent-conversations`, arrived at from the storage side; the history of all conversations for the default agent still needs the server.

Contacts and History are gone with them. **Members are managed on a Members tab** (decided 2026-11-18): for the Agent owner and Agent managers who are members (`security.EditAccess` and not `inRoom === false`, `canManageAgentMembers` in `helpers/info-panel/tabs.ts`), the agent's panel ends with the room's own members list under `Common:Members`, after Content on the agent's page. It is the Contacts view of a room as it was: search, the invite button that opens the invite panel "Share agent" opens, the agent's two roles (`Members.utils.ts`) and removal with `Common:RemoveAgentMemberWarning` (`User.tsx`, see "Losing access deletes a member's conversations"), so nothing new is drawn. A Member and a DocSpace admin who is not a member get no tab, which keeps their panel as boards 08 and 09 draw it. *Alternative:* a members list inside the invite panel; rejected, as the invite panel only collects new invitations and would need a second list, its own search and its own role and removal controls.

*State (2026-11-18):* the server closed the storage side (`../server` 2f27926cce, 6af79a13cc, 581104bef6, 1741b043ae, 3fc2dbf741, 15b42be860, e4d6f32d52, aa4b63e038, 1d4b733b1f, b849d75901; archived change `2026-11-18-add-ai-project-thread-files`). Everything inside an agent is its creator's alone, readable, downloadable and copyable and nothing else, refused to the owner and admins too; the agent lists no contents and reports no counters; the upload event reaches the uploader only, with no new mark and no notification; the two lists are paged (`count` 1 to 100, 100 by default), and the client reads the first page. Deleting a conversation answers at once and a background pass removes its files. **A Content row has no "Open location"** (decided 2026-11-18): every file it lists lies in a folder of the conversation (`<threadId>-artifacts` or the attachments folder) that is internal to the agent, read-only to its author and not listed by the agent, so the item would lead into a bare system folder. The conversation on screen is where the file is; a row offers Download and "Save to room..." only. Details still hides Storage for an agent: the conversation files count against the agent and the portal, which Details does not show yet (`Details.utils.tsx` says so).

### Content follows the rounds of the conversation
No socket event announces a new artifact or attachment, so the lists change only on a new request. Until now Content read both lists every 15 seconds while it was shown (`REFRESH_MS` in `AiAgentContent`): two requests per tick for as long as the panel is open, and a delay of up to 15 seconds. It reads them instead when the chat reports a round of the conversation on screen: the ai-chat `ChatCallbacks` the client already passes through `Shell.jsx` (`onStreamStart`, after the server has stored the message and moved its attachments; `onToolCallResult`, when an artifact is saved; `onStreamEnd`, `onStreamError` and `onStreamStop`), each carrying the thread id. `Shell.jsx` composes them with the handlers it has (`useAiChatNotice`) and hands the thread id to a counter in `dialogsStore` (`aiChatThreadFilesChange`, `notifyAiChatThreadFilesChanged`), built in a small testable module beside `AiChatPageBridge`; Content reads again when the counter moves for its own thread, after a short debounce that merges a tool result and the round's end. A request id kept in a ref lets only the latest answer for the current thread land, which the per-effect `cancelled` flag did not do inside one thread. The timer goes; a read when the browser tab becomes visible again covers a round that ended unseen and the same user on another device.

*Alternatives:* watch the falling edge of `useMessageStore.isRequestRunning` in `AiChatPageBridge` (no `Shell.jsx` change, but no thread id, and false edges on a thread switch, a stop or an orphaned stream); keep the timer, only while the tab is visible and slower. *Known gap:* a round orphaned by a thread switch (ai-chat `_streamEpoch`) reports nothing more, so returning to that conversation before it ends shows its files only on the next signal or visibility change. *Not checked against a running server:* whether an artifact is listed by the time `onStreamEnd` fires; if not, one delayed read after the end is added.

### Losing access deletes a member's conversations
Since server 18cb4ed823e (BREAKING), removing a member's access to an agent deletes the conversations that member started there, with their files, and a new invitation does not bring them back. It happens on `PUT files/rooms/{id}/share` with `access` 0 (a manager's removal, or the member's own leave, which the client sends from `rooms.helpers.ts` and `AiProjectsStore.leaveProject`) and on `removeSecurityInfo` from the owner. A change of owner alone deletes nothing (`beforeOwnerChange`), but the change-owner panel's "Leave agent" box makes `AiProjectsStore.changeOwner` leave right after the handover, which then deletes the former owner's conversations. Deactivating a user in People deletes nothing by itself. "Remove from list" (`removeSecurityInfo`) is offered only for external rooms and never reaches an agent.

So the client says it before it sends, in three places:
- **Leave agent**: the non-owner text of `LeaveRoomDialog` becomes `Common:LeaveAgentConversationsWarning`. `Common:WantLeaveAgent` is kept unchanged, as the SDK's legacy leave-agent dialog uses it. The owner still sees `Common:LeaveAgentDescription`.
- **Change owner**: while the current owner hands over an agent, `ChangeRoomOwnerPanel` shows `Common:AIProjectChangeOwnerLeaveInfo` (who may own an agent, and that leaving as well deletes their conversations) in place of `Common:AIProjectChangeOwnerInfo`. *Alternative:* a separate confirmation before `changeOwner` when "Leave agent" is ticked.
- **Remove a member**: `RemoveUserConfirmationDialog` takes a reason instead of the encrypted flag (`"formFilling" | "encryptedRoom" | "agentMember"`, default `"formFilling"`, which keeps today's text), and the Members role menu (`User.tsx`) asks with `"agentMember"` (`Common:RemoveAgentMemberWarning`) before removing a member of an agent. The Members view is not reachable for an agent today (`helpers/info-panel/tabs.ts`), so this is ready for whatever task 7.2 brings back.

The keys say "agent manager", the role's name in `ai-agent-naming`, where the old `WantLeaveAgent` says "agent admin".

The knowledge files with their vectorization state and the retry action, which the removed sources column had, are not carried into the panel: the boards list knowledge bases as plain rows. They remain inside the Knowledge room itself.

### Composer lists: library pieces, host content
- A row of a host list gets a trailing action (icon, label, handler) and a link tone; the dropdown item draws the action without running the row's own handler or closing the menu.
- The slash menu's list body becomes a component shared with the "+" menu, shown through a dropdown level that takes content instead of rows. A host opts in with one flag and stops passing rows for Skill sets.
- Inside an agent, the slash menu edits the agent's skill sets in place for those who may change the agent: a set keeps its remove control and "Manage skill sets..." opens the Instructions room picker. Both report what was connected and disconnected - the library through a widget callback for the removed set, ui-kit's picker for a pick - and the client applies that change to the agent's linked rooms, one save after another, reverting the chat when a save is refused. Only the change is handed over, never the chat's list: the chat leaves out a linked room with no skills, and a save of the list would unlink it. For a Member the flag that already keeps the library from disconnecting a room is turned on and the picker callback is absent. The "+" menu's "Manage ..." rows still open the agent's edit form.
- The remove control of a skill set is a bin that is always shown, labelled with the existing "Disconnect room" text: no new translation key, and it is reachable on a touch screen, where a control shown on hover is not.
- A connected data source carries an optional kind (room or folder) for its icon; entries saved earlier have none and keep the folder icon.
- The slash menu lists every source of the chat (ai-chat `a2301965`, ui-kit `7accde9d`, 2026-11-16): under the skills a Knowledge bases section and a Data sources section, each with a bin per row and its "Manage ..." row, all in one scrolling body under the fixed caption and hint. The rows of these two sections are not options, so the keyboard walks the skills only; the typed text narrows them by name and hides their "Manage ..." rows. The library takes the host's pickers (`onPickKnowledgeRooms`, `onPickFolderContext`) and a flag that hides the bins of the knowledge bases (`hideKnowledgeDisconnect`). Inside an agent ui-kit sets that flag for everyone, as the bases are the agent's settings, and points "Manage knowledge bases..." at the agent's edit form for those who may change it and leaves it out for the others; the data sources stay the user's own. Knowledge bases go through the form, unlike skill sets, because no in-place save of the agent's Knowledge rooms exists yet.
- The "Manage ..." rows are written in sentence case ("Manage skill sets...", "Manage knowledge bases...", "Manage sources..."), as on board 01; the slash menu already says so (ai-chat `133fa1b0`), the "+" menu still reads "Manage sources" in all three lists until task 1.9.

*State (2026-11-16):* the agent is the owner of the sources only on its page. An agent picked in the chat panel's title menu leaves the slash menu and the "+" menu as on the default agent, bins and pickers included, until the panel sets the sources owner for a picked agent (task 3.4).

*Alternative:* express the Skill sets list as nested host rows. Rejected: rows cannot carry a caption, a hint or fold-out groups.

*Alternative:* inside an agent, forbid disconnecting a set for everyone and open the agent's edit form from the slash menu's "Manage skill sets...", as the "+" menu does. Rejected: a change made in the slash menu is expected to last, and a second way through the form for one room is slower than the control already on the row.

### Generated files are saved at once
By the decision of 2026-11-12 a generated file is a portal file from the start; there is no "Not saved" state. In a conversation of an agent that file lies in the conversation's folder of artifacts (a generated image and the document agent's results since 2026-11-16; see "Info panel"), which is also what the Content tab lists; in any other conversation it lies in the round's folder or My documents, as before. "Save to room…" copies it with the Files copy operation. The image card is drawn by the library with a built-in Download and host actions; the document card is drawn by the host through a renderer the library calls for named tools, since only the host knows which tools create files and how to open them. The Artifacts list needs the server to record what tools created (item 3).

### Categories are tags
"My agents" is the owner filter and a category is a tag; both already exist in the rooms filter the list uses, so the address, paging and live updates keep working. The tabs are the tags of the agents the user can see, read from the list without a tag filter. With more than one page of agents (100), a tag that occurs only further down gets no tab until that page is loaded. *Alternative:* a fixed list of categories from the server.

### Templates are a catalog shipped with ASC.AI.Chat
The server refuses to save an AI room as a room template (`FileStorageService.CheckCanCreateRoomTemplateAsync` rejects a room whose type `IsAiHubRoom()`), so the Templates tab cannot be the rooms list with `searchArea=Templates`. The templates are files instead, in `server/common/ASC.AI.Chat/templates`: `agents/<category>/<name>.json`, `skill-sets/<name>/` (a `template.json` and Markdown skills) and `knowledge-bases/<name>/` (a `template.json` and its `.docx` / `.md` files). An agent names its skill sets and knowledge bases by their path, and each of those is a template of its own, so it can be installed without the agent.

ASC.AI.Chat reads the folder once and serves it as `GET api/2.0/ai/templates`. `POST api/2.0/ai/templates/install` puts one template into the portal with the caller's credentials, through the routes the client itself uses: `POST files/rooms` (room type 10, 11 or 12), `POST files/{id}/insert` for each file, `POST files/rooms/{id}/sources` to link an agent's rooms, `PUT files/rooms/{id}/model` with the portal's chat model (the `Chat` action, else the `Default` slot), and `PUT files/rooms/{id}/instructions`. Every install makes new rooms, nothing is matched against the portal and nothing is rolled back when a step is refused. No route in `../server` serves the instructions yet, so that step is tolerated: the agent is returned with `instructionsNotSaved` in `warnings`. The model step is tolerated the same way (`modelNotSaved`), also when the portal has no chat model to give. The client shows them in place of the success toast: one warning that names what was skipped, the instructions first, then the model (`Common:AiTemplateInstructionsNotSaved`, `Common:AiTemplateModelNotSaved`); an unknown warning is ignored (2026-11-18). Every template file also carries a `color` (six hex digits) and a built-in room `cover` id, which ASC.AI.Chat passes to `POST files/rooms` for the rooms it creates and the card and Info panel draw (server `21fef12b72`, 2026-11-18). A room has no field for a template's description, so it stays in the catalog; the category is installed as the agent room's tag (`tags` of `POST files/rooms`, ASC.AI.Chat `e92341de43`, 2026-11-17), which the category row and the card read. Before installing, the client asks for confirmation and disables the template's install controls until the installation ends (2026-11-18).

In the client the tab is a query of its own on the list's address (`tab=templates`), not a search area: the list underneath stays the section's list, so the title, the sidebar entry and the header do not change, and the catalog is drawn in place of the list and its filter. After an install the user is returned to the My agents tab, where the new agent is. While the section loads the tabs are a skeleton, as the header and the filter are.

**Templates are offered for agents only** (client `cd7a394e82a`, 2026-11-16). The Skill sets and Knowledge bases lists have no tabs, and a `tab=templates` left in their address is ignored. Their templates stay in the service's catalog and are installed with the agent that names them; the catalog component still knows the other two kinds, but no list reaches them. The keys `Common:MySkillSets` and `Common:MyKnowledgeBases` went with the tabs.

Board 04 also selects a template in the Info panel (Details with Owner, Type "Template", Category, and "Add to my agents"; Context with what it brings). A template is not a room, so the client has to build that view from the catalog entry; it is specified in `ai-agents-list` "Template in the Info panel" and built in the client (`AiTemplatesStore`, 2026-11-17).

### Skill sets and Knowledge bases are lists of their own
The three lists of the AI section are one folder, the AI section root, narrowed by the rooms filter to one room type. The table view picks its columns by that type: Skill sets (Name, Skills, Owner, Last modified) and Knowledge bases (Name, Owner, Last modified) each get their own columns and their own stored column choice and widths, versioned like the other tables; Agents keep the room columns. An opened skill set (Name, Description, Last modified) and an opened knowledge base (Name, Size, Added by, Added) are told by their room type, or by the parent room's type inside a folder, and get their own columns too. The tile grid keys its measured row heights by the kinds of rows shown, since agent tiles are taller than room tiles and the three lists share one folder (client `096d247c84f`).

Every column is read from what the rooms list and the folder listing already answer: the number of skills of a set is the room's file count (an Instructions room holds Markdown files only). Two things need more reads:

- **The indexing state of a knowledge base** is derived from its files: any failed file makes it Error, otherwise any file in progress makes it Indexing, otherwise it is indexed; a base with no files has no state. Each row reads the base's files (the first page of 100) through the knowledge listing the project view already used, once per base and file count; the Details tab reads them again. Nothing pushes a change of state, so the list does not follow indexing live; a failed read is not retried in the session. *Alternative:* a state on the room from the server (none is read today).
- **The description of a skill** is read from its file, once per file version, and shared by the row and the Info panel. A failed read is not retried in the session; a save makes a new version, which is read again.

The file badges are shared: the pill of a file in progress now reads "Indexing" instead of "Preparing", and a failed file gets an "Error" pill in the table and row views instead of the alert icon (the tile view keeps the icon). This reaches every list that shows a file's indexing state, not only knowledge bases. A file's Details show its indexing state as Status, and a failed file a fixed note above the properties.

### Used by comes from the room

Server `6b55a3daa8` (2026-11-19, change `add-linked-projects-to-ai-rooms` in `../server/openspec`) gives what "Used by" needs; the contract, as its OpenAPI text states it:

- A Knowledge or an Instructions room object carries `linkedProjectsCount`: every agent linked to the room, readable by the caller or not. Other room types, and the short room object of the new-items listing, do not carry it.
- `GET api/2.0/files/rooms/{id}/projects` (`getRoomProjects`) answers one page of the agents that use the room, each with `id`, `title` and `logo`, sorted by title, paged with `startIndex` and `count` (25 by default), with the total in the envelope. Only the agents the caller may read are listed, so the total can be lower than `linkedProjectsCount`. 404 for another kind of room, 403 without read access to the room or with the AI features off.
- `update-folder` is sent for each room whose number changes: when an agent links it, unlinks it or is deleted.

The client shows the number as the Used by column of both lists, on their tiles and in their compact rows, and lists the agents in the Details ("Used by agents"). The number is not sortable: the server sorts the section by no such key. The list in the Details reads the first hundred agents and tells the rest by their number; it is read again when the room's number changes, which the existing `update-folder` handling brings without new code (`refreshFolder` re-reads the room and replaces the list item and the selection). An agent's name in the list is not a link. The column sits after Skills in the Skill sets list and after Name in the Knowledge bases list; its place and the plain number were not compared with boards 11 and 14.

The stored column sets of both lists are reset (`TableVersions.SkillSets` and `KnowledgeBases` are "2"), so the new column shows for a user who chose columns before.

### A skill is read in a dialog and edited in a modal
The Command column of 134d6791cd1, the Type column renamed, is reverted: an opened set lists the description instead, and the command is shown where a skill is looked at one by one (its Details, the skill list of its set's Details, the Edit skill dialog). The instructions left the Info panel for a read-only dialog behind "View instructions", which offers Edit to those who may edit and rename the file. Edit skill became a modal, as board 13 draws it, replacing the side panel recorded on 2026-11-13; its toolbar edits the Markdown text in place (wrap or unwrap a selection, mark or unmark its lines, a link with its address selected) and keeps the editor's selection. The skill generation dialog shares the editor, not the toolbar.

### A reload brings back the fullscreen chat
The fullscreen chat has no address of its own: AI Chat opens it over the agents list, so a reload showed the list. While the chat is open fullscreen outside an agent's page, the client keeps the page on screen (the chat or its history) and its conversation in the tab's session storage, per user, and reopens them once the conversations are read; a conversation no longer listed gives way to a new chat. Closing the chat, leaving fullscreen or entering an agent's page drops the record; an agent's page is brought back by its own address. No agent is kept, so a restored conversation opens on the default agent (client `598939c7b1f`).

### Official agents and portal-wide access are stated as absent
Both are on the boards and neither can be specified without a product description and a server design. They are written as requirements of absence (`ai-agents-list` "No official agents", `ai-agent-access` "No portal-wide access"), so the gap is visible and testable, and they will be changes of their own.

## Risks / Trade-offs

- **[Risk] The server items are not designed.** → The tasks that need them are gated in tasks.md and name the item; nothing else waits for them.
- **[Trade-off] Picking an agent no longer keeps the conversation.** Users lose "apply to this conversation", and a model and sources chosen on the default agent are dropped when the chat moves to an agent. The conversation stays in its history, and a conversation that can only ever have had one agent is what makes an agent's history and its logo beside replies truthful.
- **[Trade-off] An agent's Info panel has no Contacts tab.** "Share agent" invites, but nothing lists an agent's members, changes a role or removes a member. → Open question below; task 7.2.
- **[Risk] Leaving or removal deletes conversations for good.** Server 18cb4ed823e deletes a member's conversations and files of an agent when their access ends, and a new invitation restores nothing. → The client warns before removal, in the leave dialog and in the change-owner panel ("Losing access deletes a member's conversations"); tasks 9.4–9.6.
- **[Trade-off] Content learns of new files from the chat, not the server.** A round orphaned by a thread switch, or one run on another device, reports nothing here. → A read when the browser tab becomes visible again; tasks 7.4–7.6.
- **[Trade-off] "Agent info" in the chat panel closes the chat for as long as the Info panel is open.** → That close is not the user's: the chat keeps its agent and opens again when the Info panel closes.
- **[Risk] Rewording makes translations stale.** → Agent keys that are already translated are reused; `translate-stale` covers the reworded ones.
- **[Risk] A library option without the matching ui-kit peer range leaves ui-kit on the old pack.** → The shipping order in the Migration Plan; `pnpm peers check` after each update.
- **[Trade-off] Tags as categories** show no tab for a tag that occurs only beyond the first 100 agents.
- **[Risk] Card height.** The tile grid uses one height; the description and the stacked rows are capped to keep it.
- **[Risk] One read per row.** The Knowledge bases list reads each base's files to tell its state, and an opened skill set reads each skill file for its description. → Both are cached (per base and file count, per file version) and shared with the Info panel; a list of bases is paged by 100 like any rooms list.
- **[Trade-off] The indexing state is not live.** A base keeps "Indexing" after its last file finished, or "Error" after a successful retry, until its file count changes or its Details are opened. → Stated as a requirement (`ai-knowledge-bases` "The list does not follow indexing live"); a pushed state would need the server.
- **[Trade-off] Shared file badges.** "Indexing" and the "Error" pill replace "Preparing" and the alert icon for every file with an indexing state, not only in knowledge bases.
- **[Risk] Existing conversations.** Conversations used to have one scope per user, so every conversation started before this change, inside an agent or not, shows as a conversation of the default agent, and agents start with an empty history.

## Migration Plan

1. ai-chat: the composer pieces first (row action, link tone, shared skill list), then the message pieces; each batch is one pack made with `node scripts/pack-pre.mjs 1.0.2-progress.<n>`.
2. ui-kit: take the pack, raise the peer range, build and `pnpm pack`.
3. Client: `pnpm run update-ai-chat <pack>`, `pnpm update -r @onlyoffice/apps-ui-kit`, `pnpm run update-ui-kit`, in that order; commit the tarballs, the manifests and `pnpm-lock.yaml` together.
4. ASC.AI.Chat takes the same library pack when the threads or attachments contracts change, and ships the scope before the client starts sending it for a picked agent.
5. Rollback is a revert in each repository. Conversations created with a scope stay in the storage and show in the single list again.

No data migration: conversations are not rewritten, and the reworded texts change no stored value.

## Open Questions

These can be answered while the work goes on; none of them changes the requirements above.

- Whether a pick in the "+" menu's skill list closes the menu or leaves it open for another pick.
- The keyboard path to a row's remove control: a focusable button inside the row, or the Delete key on the highlighted row.
- Whether removing a skill set from an agent in the slash menu asks for confirmation: one click now changes the agent for every member.
- Whether the change-owner panel warns through its note (`Common:AIProjectChangeOwnerLeaveInfo`) or asks a separate confirmation when "Leave agent" is ticked; and whether the removal confirmation of an agent keeps the "Remove user" title.
- Whether Content pages past the first 100 files of a section.
- Whether a DocSpace admin's `removeSecurityInfo` on an agent also deletes every member's conversations (the admin bypass of `FileStorageService.RemoveAceAsync`); no client path sends it for an agent today. To confirm with the server team.
- Whether Details shows the space an agent's conversation files take: they count against the agent and the portal, not the member's quota, while Details hides Storage for an agent and its comment (`Details.utils.tsx`) says an agent takes none.
- Whether a category is the agent's first tag or any of its tags, once the category row of `ai-agents-list` is built.
- How an installed template is known, now that board 04 marks it "Already added", and whether a second install is offered at all: today it makes a copy, and nothing the client reads ties a room to its template.
- Whether the My agents tab keeps a category row: board 04 now draws one on the Templates tab only.
- Whether the Info panel of a template names a model: board 04 shows one and the template files carry none. An installed agent is given the portal's chat model as its own on install (server 2843ec45ad), so the panel could name that model.
- ~~Whether an installed agent takes its template's category as a tag~~: it does (2026-11-17).
- Whether the history of all conversations marks each one with its agent's logo.
- The name given to a generated image; today it is a timestamp.
- Whether the room types should be renamed "Skill set" and "Knowledge base" later, to match the menus.
- The "current room" tag of board 08, once the designer says which chat has a location.
- Whether Last modified shows the date only, as boards 11 and 14 do; the lists show the date and the time, as the other room lists do.
- Whether the Info panel of a skill set and of a knowledge base keeps Contacts and History, as boards 11 and 14 draw, while an agent's has neither.
- Whether the state of a knowledge base is also marked in the tile and row views.
