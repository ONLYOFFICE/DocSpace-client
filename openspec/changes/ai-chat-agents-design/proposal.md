# Proposal

## Why

The designer's "DocSpace — AI Chat" boards redraw the AI section around agents. The chat panel title is an agent menu, an agent has its own page with an actions menu, a Share button and an Info panel of Context, Content and Details, the Agents list has My agents and Templates tabs with cards under category tabs, Skill sets and Knowledge bases are lists of their own with their own columns, a skill is read and edited in dialogs, the composer's "+" and slash menus manage skill sets, knowledge bases and data sources, and replies carry file cards (the boards also draw the agent's logo beside a reply, which is not taken). The branch calls the same thing an AI project, keeps one conversation list per user and lacks most of those surfaces. This change records the target behaviour, by portal user type and by role in the agent, on top of the removed AI Agents feature and the code on the branch.

## Source of truth

- **Design**: the claude.ai Design artifact `RjERC5xvn5xwMr73vSvB2q` ("DocSpace — AI Chat"), version `1794687729-e1b1`, fifteen boards, read on 2026-11-16 as HTML source (first read on 2026-11-12 at version `1794490827-6127`). design.md maps each board to the requirements that cover it and lists what changed between the two versions.
- **New projects**: the code on `feature/new-ai-concept` (client `41831eb79f1`, ui-kit `7accde9d`, ai-chat `a2301965` packed as `1.0.2-progress.54`). An agent is a room of type 12 with linked Instructions and Knowledge rooms and a model.
- **Old agents**: the AI Agents feature as it was before client commit `fac66aa42ba`: its words (110 of its keys, `AIAgent`, `AgentOwner`, `AgentManager`, `EditAgent`, `AgentInfo`, `DeleteAgent` among them, are still in `Common.json`), its rule that the chat inside an agent is scoped to that agent, and its limit of the Agent manager role to admins. design.md sets the old agents and the new ones side by side.
- **Decisions taken on 2026-11-12** by the feature owner: conversations belong to an agent; generated files are saved at once and "Save to room…" copies them; the interface says "agent" everywhere; no new statement about `../server` is written without CodeGraph.

## What Changes

- **Vocabulary.** Every user-facing text calls a room of type 12 an agent: the room type "AI agent", the roles Agent owner, Agent manager and Member, the create and edit dialogs, menus, toasts and views.
- **Conversations belong to an agent.** **BREAKING** for the old rule "one global scope per user": a conversation belongs to the agent it was started on, or to the default agent. An agent's history lists that agent's conversations; the default agent's history and the sidebar's Recent list all of the user's conversations. Picking an agent switches the chat to it instead of applying its settings to the conversation in progress, and a chat on an agent follows the agent's settings on its page and in the chat panel alike.
- **Chat panel.** The title menu shows the picked agent's logo, ends with "Save as new agent" (the header's save icon goes), and a picked agent gets an "Agent actions" menu with its own history list; the header changes with it.
- **Agent page.** The title is the agent's logo and name (no agent switcher: agents are picked in the chat panel only, decided 2026-11-23), followed by chat history, new chat, the agent's actions and a "Share agent" button; the actions are worded for agents.
- **Agents list.** Category tabs (All, My agents, tags) and cards with a description, an "Open chat" button and stacked skill sets and knowledge bases.
- **Templates.** The Agents list gets two tabs over the filter, "My agents" and "Templates". The Templates tab shows the agent templates shipped with ASC.AI.Chat (three agents in each of Document, Presentation and Tables, with a skill set and a knowledge base each) as cards and installs one into the portal as new rooms; a selected template shows its Details and "Add to my agents" in the Info panel. Skill sets and Knowledge bases have no tabs.
- **Skill sets.** The list shows each set's number of skills, owner and last change, and its Info panel lists the set's skills with their commands. An opened skill set lists its skills by name, description and date; a skill's Details show its description, set, owner and command and open its instructions read-only; "Edit skill" edits them in a modal with a Markdown toolbar. A set and a skill can be used in a new chat from their row.
- **Knowledge bases.** The list shows each base's owner and last change and marks a base that is indexing or has failed files; an opened base lists its files by size, who added them and when, each with its indexing state; the Info panel tells the state of a base and of a file. A base can be used in a new chat from its row.
- **Info panel.** An agent has the tabs Details and Context, and on its own page Content, the artifacts and attachments of the conversation on screen; Context lists its skill sets, which unfold to their skills, and its knowledge bases. Contacts and History are not shown for an agent.
- **Composer menus.** The "+" menu's Skill sets entry opens the skill list; skill sets, knowledge bases and data sources are removed from their rows; each list has its own "Manage …" row; the slash menu lists the knowledge bases and data sources under the skills, to add and remove, and follows the agent's ownership of its sources.
- **Reload.** A reload brings back the fullscreen chat and its conversation instead of the agents list under it.
- **Messages.** No logo beside a reply, attachments above the user's message, a generated image without a card and a card for a generated document.
- **Access.** Every new entry point is offered by the rights the server returns for the agent, written out per portal user type and per agent role.

## Out of scope

- Official (verified) agents and portal-wide access ("Everyone in DocSpace"): both need a product description and a server design first. The specs state their absence as requirements.
- A staging area for generated files and the "Not saved" state.
- The composer of board 01 where it contradicts boards 05–07: a chip row for called skills and the "Added" label (in its first version also toolbar buttons with count badges and a "Commands" button). Its Knowledge bases section of the slash menu is built, with a Data sources section after it. Also the hover box on inline skill calls and the "current room" tag on a data source.
- A description of skill sets and knowledge bases, "Last indexed", the reason a file failed to index, and the "Already added" mark of an installed template: each needs data the client does not read today (see "Server work this change depends on").
- Renaming the Instructions and Knowledge room types, the SDK's `(ai-agents)` and `(ai-arbiter)` entry points, and the implementation of the server side.

## Decisions that need a human

Taken as working assumptions from the boards; each changes a requirement if answered otherwise, and design.md records the alternative.

- Boards 05–07, not board 01, define the composer (designer); the slash menu takes the Knowledge bases section of board 01 and adds Data sources (built on 2026-11-16).
- The Info panel of an agent is cut to Details and Context, with Content on the agent's own page (owner's decision, 2026-11-13; Content built on 2026-11-16); the Data sources section of Context lists the user's own data sources while the chat runs on the agent (built on 2026-11-23). Members are invited through "Share agent"; where roles are changed and members removed is open.
- An agent's page has no agent switcher (2026-11-23; until then a pick in its title opened the picked agent's page). "Agent info" in the chat panel opens the Info panel on Details in place of the chat, without leaving the page; closing it brings the chat back on the agent (product owner, 2026-11-13; the designer's first answer was the agent's page).
- The title of the chat panel is a menu for a user with no agents who may create one (designer).
- Categories are the agents' tags, and "My agents" is the owner filter (product). Board 04 now draws the category row on the Templates tab only; whether "My agents" keeps one is open.
- Templates are offered for agents only; the skill set and knowledge base templates are installed with the agent that brings them (built on 2026-11-16, client `cd7a394e82a`).
- The agent menu on a page and on a card keeps pin, notifications, change owner, copy link and leave after the design's items (designer).
- The default agent's history and Recent list all conversations, and opening one switches the chat to its agent (product).
- Official agents and portal-wide access (product and .NET), listed under Out of scope.

## Server work this change depends on

Each item is a contract of `../server`; what has landed is read in its source and recorded in design.md, the rest is still expected. tasks.md gates the tasks that need it.

1. Conversations by agent. *Landed:* the AI storage keeps the project a thread belongs to and lists the threads of one project or of none. *Still expected:* one list of all of a user's conversations with their agents, for the default agent's history and Recent.
2. The files of a conversation. *Landed:* a thread of a project has a folder of artifacts, listed by `GET files/rooms/{id}/threads/{threadId}/artifacts`. The thread's attachments folder is filled from the root of the project room when attachments are bound to a message, and listed by `GET files/rooms/{id}/threads/{threadId}/attachments`. *Also landed (2026-11-18):* the files are their author's alone and the agent lists none; deleting a conversation answers at once and its files are removed in the background; removing a member's access, or the member leaving, deletes the conversations they started there with their files (BREAKING, server 18cb4ed823e), which the client now warns about; groups and the Read role are refused as members. *Still expected:* a portal file copied there by the server (server 581104bef6 accepts the copy, ASC.AI.Chat still reads and re-uploads it); an event that tells the author of a new artifact or attachment, which the client stands in for with the chat's round events.
3. Files created by tools. *Landed:* `POST internal/ai/threads/{id}/artifacts`, which ASC.AI.Chat uses for generated images and the document agent's results. *Still expected:* the documents the .NET editor tools create are saved there too.
4. An agent's description, readable in the list.
5. For skill sets and knowledge bases (boards 11 and 14): the agents that link each one ("Used by"), a description, and for a knowledge base the time it was last indexed. *Landed (2026-11-19, server 6b55a3daa8):* the number of agents on the room (`linkedProjectsCount`), their list (`GET files/rooms/{id}/projects`) and an `update-folder` event when the number changes. *Still expected:* the description and the time of the last indexing. For a file that failed to index, the reason (board 15). For a room created from a template, the template it came from (the "Already added" mark of board 04).
6. Texts the server composes (notification e-mails, history entries, error messages) say "agent" and "Agent manager".

## Capabilities

### New Capabilities
- `ai-agent-naming`: the words the interface uses for an AI project and its roles.
- `ai-agent-access`: who is offered which agent action, by portal user type and by role in the agent.
- `ai-agent-conversations`: which agent a conversation belongs to, what each history lists, the rules of a chat that runs on an agent, and the chat a reload brings back.
- `ai-chat-agent-menu`: the agent menu in the chat panel title, saving the chat as a new agent, and the actions of the picked agent.
- `ai-agent-page`: the header of an agent's own page: the title, the actions and the Share button.
- `ai-agents-list`: the Agents list: My agents and Templates tabs, the templates catalog, category tabs, cards and the agent's description.
- `ai-skill-sets`: the Skill sets list and an opened skill set: their columns, the Info panel of a set and of a skill, View instructions, the Edit skill dialog with its Markdown toolbar, and Use in chat.
- `ai-knowledge-bases`: the Knowledge bases list and an opened knowledge base: their columns, the indexing state of a base and of a file, their Info panel, and Use in chat.
- `ai-agent-info-panel`: the Details and Context tabs of an agent's Info panel.
- `ai-chat-source-menus`: the composer's "+" lists of skill sets, knowledge bases and data sources, and the slash menu of skills, knowledge bases and data sources.
- `ai-chat-messages`: replies without a logo, attachments above the user's message, a generated image without a card, and the card of a created document.

### Modified Capabilities
<!-- None: openspec/specs/ holds no AI capability yet. -->

## Impact

- **Client**: `packages/client/src/components/AiPresetsBridge`, `AiChatPageBridge`, `Shell.jsx`, `pages/AiProjects/**`, `pages/Home/Section/{Header,Filter,Tabs}`, `pages/Home/Section/Body/TilesView/AiProjectTile.tsx`, `pages/Home/Section/Body/AiTemplatesCatalog`, the table views of the AI lists (`pages/Home/Section/Body/TableView/**`), `pages/Home/InfoPanel/**`, `helpers/info-panel`, `components/ClientArticleSidebar`, `components/dialogs/EditSkillDialog`, stores `AiPresetsStore`, `AiProjectsStore`, `DialogsStore`, `TableStore`, `SkillsStore`, `KnowledgeBasesStore`, the context option helpers.
- **Shared**: `packages/shared/api/ai/projects.ts` (description), `api/ai/threadFiles.ts`, `utils/skillFile.ts`, the file badges and `FailedVectorizationBadge` (the "Indexing" and "Error" pills reach every list that shows a file's indexing state), MSW handlers for the routes the server adds.
- **ui-kit** (`docspace-ui-kit-react`): `ai-agent/ai-chat-panel/**`, `ai-agent/chat-toolbar`, `ai-agent/providers/**`, `components/navigation`; a new build and pack.
- **ai-chat** (`onlyoffice-ai-chat`): the composer menus, the dropdown item, the message components, the threads and attachments contracts; new packs, and a higher peer range in ui-kit.
- **Server (`../server`)**: the six items above, in ASC.AI.Chat and in .NET.
- **Locales**: the `AIProject*` values reworded to "agent", new `Common` keys for the menus, tabs and cards, new keys in the 41 ai-chat translation files.
- **Tests**: unit tests in the three repositories; E2E `ai-projects.spec.ts`, `ai-projects-access.spec.ts`, `ai-chat-header-button.spec.ts` with their screenshots.
