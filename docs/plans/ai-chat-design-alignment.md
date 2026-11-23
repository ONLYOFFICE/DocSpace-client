# AI Chat design alignment: implementation plan

Status: draft, deliberately not committed. Written 2026-11-12.

Update, same day: the requirements now live in the OpenSpec change
`openspec/changes/ai-chat-agents-design/`, and where the two differ the change wins. Three of the
decisions below were taken by the feature owner: D3 (the interface says "agent" everywhere,
roles included), D4 (conversations belong to an agent; the default agent's history and Recent
list everything) and D5 (generated files are saved at once, "Save to room…" copies). D6 and D7
(official agents, portal-wide access) are out of scope of that change. This file stays as the
longer working note: the per-item "Today" references and the cross-repository shipping steps.

The designer's "DocSpace — AI Chat" design was compared with the code of the client, ui-kit
and ai-chat. This plan covers what the design shows and the code does not have yet: what to
build, in which repository, in what order, and what has to be decided first.

## 1. Inputs

### Design

claude.ai artifact `RjERC5xvn5xwMr73vSvB2q` ("DocSpace — AI Chat"), version `1794490827-6127`,
read on 2026-11-12. The share key is left out of this file on purpose; ask Timofey for the link.
The artifact is read-only for us and nothing in it was changed.

| # | Board | File in the artifact | What it is about |
|---|-------|----------------------|------------------|
| 01 | Menu | `project/Main.dc.html` | The left sidebar ("AI Chat left menu") |
| 02 | Room picker | `project/Room.dc.html` | A room with the docked chat panel, agent menu open |
| 03 | Room agent | `project/RoomAgent.dc.html` | The same panel with an agent picked, "Agent actions" open |
| 04 | Agents | `project/Agents.dc.html` | The Agents list with the info panel |
| 05 | Plus menu | `project/MainPlus.dc.html` | The composer's "+" menu ("merged plus menu") |
| 06 | Slash | `project/MainSlash.dc.html` | The slash command menu |
| 07 | Data sources | `project/MainData.dc.html` | The "+" menu's Data sources submenu |
| 08 | Agent chat + info | `project/MainSlashFull.dc.html` | An agent's chat, info panel on Context |
| 09 | Agent chat + about | `project/MainAbout.dc.html` | An agent's chat with an About panel |
| 10 | Agent chat + content | `project/MainContent.dc.html` | An agent's chat, info panel on Content |

### Code it was compared with

| Prefix used below | Checkout | Branch | Commit |
|-------------------|----------|--------|--------|
| `client/` | this repository | `feature/new-ai-concept` | `976af7bf8b9` |
| `ui-kit/` | `../../docspace-ui-kit-react` (4.1.0) | `feature/new-ai-concept` | `5e822133` |
| `ai-chat/` | `../../onlyoffice-ai-chat` | `feature/composer-plus-menu` | `a41cb023` |
| `server/` | `../server` | `feature/new-ai-concept` | `078ef6889c` |

The client vendors ai-chat `1.0.2-progress.50` and a local ui-kit tarball; ui-kit's peer range
for ai-chat is `>=1.0.2-progress.46`. Line numbers below are as of these commits.

### How reliable this is

- Every board was compared with the three front-end repositories, and every difference found
  was re-checked by a second pass that tried to find an existing implementation. 54 of 56
  differences survived (27 missing, 27 partly done); the code references under "Today" come
  from that comparison and from reading the extension points directly.
- The boards were read as HTML source, not looked at rendered. Pixel, colour and spacing
  differences are out of scope; structure, elements, states and actions are in.
- Server statements come from reading `../server` at the commit above. CodeGraph, which
  `openspec/config.yaml` requires for server facts, was not installed on this machine, so
  confirm each server statement through it before it goes into an OpenSpec artifact.

### Vocabulary

The design and the code use different words for the same things.

| Design | Code |
|--------|------|
| Agent | An AI project: a room of type 12 (`RoomsType.AiProjectRoom`) under the "AI rooms" root. Internals are named `AiProject*` and `AiPreset*`. |
| Default AI agent | The chat with no agent applied. |
| Skill set | An Instructions room (type 10) connected to a chat; its Markdown files are the skills. In ai-chat: `selectedContextFolders`, `roomSkills`. |
| Knowledge base | A Knowledge room (type 11) connected to a chat. In ai-chat: `selectedKnowledgeFolders`. |
| Data source | A folder or room connected as the chat's context. In ai-chat: `selectedFolderContexts`, at most `FOLDER_CONTEXTS_LIMIT`. |
| "+" menu | The composer's attach menu, `ai-chat/src/ui/pages/chat/sub-components/ComposerActionAttachments.tsx`. |
| Slash menu | The list shown while the draft ends in `/`, `ComposerSkillsMenu.tsx` in the same folder. |

## 2. Summary

- The differences collapse into 35 work items in seven phases, plus 3 items that apply only if
  board 01's composer turns out to be the final one (see D1).
- Thirteen items need no decision and no server work. They are the suggested first slice:
  1.1–1.7, 2.1, 3.1, 4.2, 4.3, 6.1, 6.2.
- Fifteen questions for the designer, the product owner or the .NET team are listed in
  section 4. Four of them (D4–D7) change the data model and gate phase 7.
- Board 01's composer contradicts boards 05–07. The code already follows boards 05–07, and
  board 01 is about the sidebar, so its composer is most likely an older state. This one
  answer removes three items.

| Phase | What | Boards | Repositories | Blocked by |
|-------|------|--------|--------------|------------|
| 1 | Composer "+" and slash menus | 05, 06, 07 | ai-chat, ui-kit | nothing (1.8–1.10: D1) |
| 2 | Chat panel header and agent menu | 02, 03 | ui-kit, client | 2.2: D11; 2.3: D10, D14; 2.5: D4; 2.6: D3 |
| 3 | Agent page header | 08, 09, 10 | client, ui-kit | 3.3: D9; audience part of 3.2: D7 |
| 4 | Agents list | 04 | client | 4.1: D13; 4.4: 7.1; 4.5: 7.2 |
| 5 | Info panel | 04, 08, 09, 10 | client, ui-kit, ai-chat | D8, D12; 5.4: 7.5; 5.5: D5, 7.5 |
| 6 | Messages | 08, 09 | ai-chat, ui-kit, client | 6.3, 6.4: D5, D15 |
| 7 | Server-led changes | 03, 04, 09, 10 | server, then the others | D4, D5, D6, D7 |

## 3. Conventions

**Sizes** are rough, for one developer who knows the area, without review: S is up to half a
day, M is one to two days, L is three days or more.

**Each item** has the same parts: Design (what the board shows), Today (what the code does,
with paths), Change (what to do, per repository), Checks (the automated checks that must cover
it). "Depends on" appears only when something blocks the item.

**Where code goes.** ui-kit and ai-chat are separate repositories; their code is changed
there, never from the client. Section 7 describes how a change travels to the client.

**ai-chat has other hosts** (the desktop editors' plugin and others). Every visual change in
the library is switched on through `WidgetConfig` and leaves the default as it is today.

**Strings.** Nothing user-facing is hardcoded, and brand and product names are passed as
variables (`getBrandName()`, `{{productName}}`). Section 8 lists the new keys.

**Commits.** One commit per finished item per repository, as soon as its checks pass, in that
repository's message style (`Client: AI chat: …`, `feat(ai-agent): …`, `feat(composer): …`,
`ASC.AI.Chat: …`). Nothing is pushed without being asked. This file stays out of commits.

**Visual check.** The automated checks do not look at the screen. Comparing the result with
the board is a manual step for the developer or the designer.

## 4. Decisions needed before coding

Each decision names what it blocks. Recommendations are mine and are there to make the
conversation shorter, not to replace it.

### D1. Which composer is final: board 01 or boards 05–07?

Board 01 shows separate "Skill sets" and "Knowledge bases" toolbar buttons with count badges,
a "Commands" button, a removable skill chip above the input, an "Added" label on a called
skill, an always-visible trash button on each skill set, and a "Knowledge bases" section inside
the slash menu. Boards 05–07 show a toolbar with only "+", the model picker and Send, skill
calls as inline tokens in the draft, a trash button that appears on hover, and a slash menu
with skill sets only. The code follows boards 05–07, and marks a called skill with a tick that a
second pick removes (ai-chat `3e3ad0d9`, `a41cb023`); board 06 shows no mark at all.

Recommendation: boards 05–07 are final, the tick stays. Blocks 1.8, 1.9, 1.10.

### D2. Hover box on inline skill tokens (board 06)

On the board a skill token in the draft gets a border and a background on hover. The draft is a
`<textarea>` over a coloured copy with `pointer-events: none`
(`ai-chat/src/ui/pages/chat/sub-components/ComposerInputHighlights.tsx`, `Thread.css:102-119`),
which can colour text but cannot draw padding or react to hover without moving the caret. The
only real fix is a rich input instead of the textarea: size L, with risk for input methods,
paste, history and mobile.

Recommendation: keep the colour only; at rest it already matches the board. No item is planned.

### D3. Vocabulary: "agent" or "AI project"?

The design says "agent" everywhere. The code mixes the two: the sidebar and the agent menu say
"Agents" and "Default AI agent", while the save button, the dialogs, the roles and the toasts
say "AI project" (32 keys with `AIProject` in the name in
`client/public/locales/en/Common.json`, for example
`AIProjectCreateTitle` "Create AI project", `AIProjectManager` "Project manager",
`AIProjectRoomTitle` "AI project"). Needed: the product's words for the room type, the role
names and the save action. Rewording the English makes every translation of those keys stale.

Blocks 2.6.

### D4. Is chat history per agent?

Board 03 lists only the picked agent's conversations under "Chat history". Today threads are
one list per user: ASC.AI.Chat accepts the scope and ignores it
(`server/common/ASC.AI.Chat/app/storage/threadsStorage.ts:45-49`), and
`openspec/changes/ai-projects/design.md` records this as a deliberate trade-off ("Threads are
never shared and have one global scope per user"). A per-agent history needs answers to: what
the sidebar's "Recent" list shows, what happens to existing threads, whether opening a thread
from "Recent" switches the chat to its agent, and whether an agent picked in the docked panel
scopes the chat (today only an open agent page sends the agent's id,
`client/packages/client/src/Shell.jsx:913-918`).

Recommendation: decide before 2.5. A "yes" reverses a recorded decision, so write it as an
OpenSpec change. Blocks 2.5 and 7.4.

### D5. "Not saved" files

Boards 09 and 10 show generated files as "Not saved" until the user chooses "Save to room…".
Today nothing is unsaved. A generated image is uploaded at once into the folder the round works
in, or into My documents when that folder cannot take it
(`server/common/ASC.AI.Chat/app/storage/attachmentsStorage.ts`, `uploadToolImage` and
`insertGeneratedImage`), and documents are created by the DocSpace tools as ordinary files.

- Option A: keep saving at once. The list says where each file is, and "Save to room…" becomes
  "Copy to room…".
- Option B: a staging area. Generated files live in a hidden store tied to the thread, with a
  lifetime, until the user saves them. This needs new .NET storage, quota rules, cleanup, and
  editor access to files that are not in any folder.

Recommendation: A first; B only if the product insists. Blocks 5.5, 6.3, 6.4.

### D6. Official agents

Boards 04 and 09 show "Official ONLYOFFICE agent" and the owner "ONLYOFFICE" with a Verified
badge. Nothing of the kind exists in any repository. Open: who provides these agents (shipped
with the product, created per portal, served from a catalogue), whether a portal can edit or
delete them, how their names and descriptions are localised, which model and which skill sets
they use, and whether editions differ. This needs a product description and a .NET design.

Blocks 7.2, the subtitle in 5.2 and the badge in 4.5.

### D7. Portal-wide access

Board 09 shows "Access: Everyone in DocSpace". Today an agent is a room with members, and a
non-member sees "You are not a member of this AI project"
(`client/packages/client/src/pages/AiProjects/AiProjectView.tsx:307-315`). Open: whether
"everyone" is a second audience next to invited members, who may set it, and how such an agent
is listed for everyone. One point needs a security review: members read the agent's linked
Instructions and Knowledge rooms through a virtual share, so a portal-wide audience would open
those rooms to the whole portal.

Blocks 7.3, the Access row in 5.2 and the audience part of 3.2.

### D8. Info panel tabs

The design has Context, Content and About (boards 04, 08, 10); board 09 shows a panel titled
"About" with no tabs. Today an agent has Contacts, History and Details. Open: (a) where the
members list and the history feed go; (b) whether board 09 is an older form of the About tab;
(c) which tabs an agent selected in the list gets, where there is no conversation and Content
has nothing to show; (d) where tags are edited, which Details does today.

Recommendation: Context, Content, About in an open agent chat; About and Context for a
selection in the list; Contacts stays as a tab until "Share agent" covers managing members.
Blocks 5.1.

### D9. What the agent switcher does inside an agent's page

Boards 08–10 make the page title a menu of agents. Recommendation: a pick opens that agent's
page, and "Default AI agent" opens the plain AI Chat page. Blocks 3.3.

### D10. "Agent info" from the docked panel

On board 03 the docked panel's agent menu has "Agent info". The chat panel and the info panel
exclude each other today, so the info panel cannot open beside a docked chat. Recommendation:
the item opens the agent's page with the info panel on About. Blocks part of 2.3.

### D11. The agent menu with no agents

Once saving moves into the agent menu (2.2), a user with no agents has nowhere to save from,
because the title is a menu only while there are agents. Recommendation: the title is a menu
whenever the user may create agents, with "Default AI agent" and "Save as new agent" in it.
Blocks part of 2.2.

### D12. "current room" as a data source

Board 08 lists the room the chat was opened in among the data sources, tagged "current room".
Today the location is sent with each round as the working folder, but it is not a data source,
is not listed anywhere, and is no longer connected automatically. Recommendation: show it as a
read-only row; do not bring automatic connection back. Blocks part of 5.3.

### D13. What a category is

Board 04 has tabs "All", "My agents", then "Legal", "Reports", "Proposals", "HR docs",
"Meetings", "General". Recommendation: categories are the agents' tags and "My agents" is the
owner filter, which needs no server work. A fixed list would need a server enumeration.
Blocks 4.1.

### D14. Items of the agent menu beyond the design's four

The design has Edit agent, Share agent, Agent info and Delete agent. Today's menu also has pin,
notifications, change owner and leave. Recommendation: keep them, below the design's items.
Affects 2.3 and 3.1.

### D15. Small content questions

- "2 pages" on the document card: no page count is known for a document without rendering it.
- The name of a generated image: today `generated_image_<timestamp>.png`, on the board a
  meaningful name.
- What the row "Actions" menus on the Content tab contain.
- "From device" as an attachment's origin: a file from the device is stored as an ordinary
  portal file (`ui-kit/ai-agent/providers/files/device-uploader.tsx:19-20`), so the origin is
  not recorded anywhere.

Affects 5.4, 5.5, 6.3, 6.4.

## 5. Suggested order

1. First slice, no decisions and no server work: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, then 2.1,
   3.1, 4.2, 4.3, then 6.1, 6.2. Items 1.2–1.7 change ai-chat, and so do 6.1–6.2: ship each
   group as one ai-chat pack, not one pack per item.
2. Send D1–D15 to the designer, the product owner and the .NET team while the first slice is
   in work. D4–D7 take longest.
3. Phase 2, then phase 3, as D10, D11, D14 and D9 are answered.
4. Phase 5 tabs and the About and Context tabs (5.1–5.3); phase 4 tabs (4.1).
5. Server-led items (phase 7) and what waits for them: 4.4, 4.5, 5.4, 5.5, 6.3, 6.4, 2.5.

## 6. Work items

### Phase 1. Composer "+" and slash menus (boards 05, 06, 07)

#### 1.1 Fix: "Manage Skill Sets…" in the slash menu bypasses the agent's settings (S, ui-kit)

- **Design.** The row manages the skill sets of the current chat.
- **Today.** The slash menu shows the row whenever `onPickContextRooms` is set and calls it
  (`ai-chat/.../ComposerSkillsMenu.tsx:516-524`). ui-kit always passes the generic Instructions
  room picker (`ui-kit/ai-agent/providers/index.tsx:1203`). Inside an agent the "+" menu
  already does the right thing through `sourcesManager`
  (`ui-kit/ai-agent/providers/files/use-composer-sources.ts`): it opens the agent's settings,
  or shows no row to a member. The slash row does not follow that.
- **Change, ui-kit.** Where the widget config is assembled, pass
  `sourcesManager ? (sourcesManager.onManage ?? undefined) : onPickContextRooms`. The library
  hides the row when the callback is unset. The other use of `onPickContextRooms` in that file
  (line 728) stays.
- **Checks.** A ui-kit unit case for the three states: plain chat, agent owner, agent member.

#### 1.2 Remove a skill set from the slash menu (S, ai-chat and ui-kit)

- **Design.** Boards 05 and 06: a skill set's row shows a trash button on hover or keyboard
  focus, labelled "Remove <set name>". A click disconnects the set; the list stays open.
- **Today.** The row has only the fold arrow and the name, and a click folds it
  (`ComposerSkillsMenu.tsx:427-447`). The clouds store already has
  `deselectContextFolder(cloud, roomId)`.
- **Change, ai-chat.** Add the button at the end of the set's row: it keeps the focus in the
  input (`onMouseDown={keepFocus}`, as the rows do), stops the click from folding the set, and
  calls `deselectContextFolder(group.cloud, group.roomId)`. Hide it while
  `hideContextRoomDisconnect` is set. New key `RemoveSource` ("Remove {{name}}") in all 41
  files of `src/translations/`. The list keeps the focus in the input and walks only skill rows
  with the arrows, so the button is pointer-only at first; say so to the designer.
- **Change, ui-kit.** Set `hideContextRoomDisconnect: !!sourcesManager` in the widget config
  (ui-kit does not use the flag today), so an agent's sets cannot be dropped from the chat.
- **Checks.** `ai-chat/src/ui/pages/chat/tests/ComposerSkillsMenu.test.tsx`.

#### 1.3 A row action on "+" menu rows (M, ai-chat) — foundation for 1.4 and 1.6

- **Design.** Boards 05 and 07: rows with a trailing trash button shown on hover or focus;
  the last row of a list is drawn in the link colour.
- **Today.** `ComposerMenuItem` (`ai-chat/src/ui/pages/chat/composer-menu-items.ts`) has `id`,
  `text`, `icon`, `checked`, `onClick`, `items`, `isSeparator`. `DropDownItemProps`
  (`ai-chat/src/ui/components/dropdown-item/DropDownItem.types.tsx`) has `trailingIcon` and
  `trailingText` but nothing clickable at the end of a row.
- **Change, ai-chat.**
  - `ComposerMenuItem.action?: { icon; label; onClick }` and `ComposerMenuItem.tone?: "link"`.
  - `DropDownItemProps.trailingAction` with the same shape, drawn in
    `components/dropdown-item/index.tsx`. Its click does not run the row's `onClick` and does
    not close the menu, so several rows can be removed in a row.
  - `toRows` in `ComposerSourceMenus.tsx` maps both fields.
  - Decide the keyboard path with the dropdown's focus model in hand: a focusable nested button
    or a Delete key on the highlighted row.
  - Update the doc comments of `composerSkills`, `composerKnowledge` and `composerDataSources`
    in `src/widget-config.tsx`.
- **Checks.** `src/ui/components/dropdown-item/tests`, `tests/ComposerSourceMenus.test.tsx`.

#### 1.4 Data sources and Knowledge bases: remove from the row (S, ui-kit)

- **Design.** Board 07: each data source is one flat row with a hover trash button "Remove
  <name>". There is no third menu level. Knowledge bases are not drawn on any board; the same
  layout is assumed.
- **Today.** Each data source row opens another level with a single "Disconnect"
  (`use-composer-sources.ts:152-168`). Knowledge base rows only open the room.
- **Change, ui-kit.** Replace `items` with `action` calling `deselectFolderContext(cloud,
  room.id)`. Give knowledge base rows the same action with `deselectKnowledgeFolder` while the
  chat owns its sources (not inside an agent). With vectorization off, the per-row action
  replaces the "Disconnect" row at the bottom. Key `Common:RemoveSource`.
- **Checks.** `ui-kit/ai-agent/providers/files/use-composer-sources.test.ts`.
- **Depends on.** 1.3.

#### 1.5 Data sources: a room icon for a room (S, ai-chat and ui-kit)

- **Design.** Board 07: connected rooms carry the Rooms icon.
- **Today.** Every source gets `source-context`, a folder glyph (`use-composer-sources.ts:158`).
  A connected entry is `{ id, name, path? }` (`ai-chat/src/core/storage/context-folders.ts:5-10`)
  and does not say what it is.
- **Change.** ai-chat: an optional `kind?: "room" | "folder"` on `ContextRoom`, carried
  untouched. ui-kit: `context-folder-dialog.tsx` fills it from the picked item, and
  `use-composer-sources.ts` uses `btn-room` for a room. Entries saved earlier have no kind and
  keep the folder icon. The entries travel with each round as `actionArgs.folderContexts`, so
  check that ASC.AI.Chat ignores the extra field.
- **Checks.** `use-composer-sources.test.ts`, `context-folder-dialog.test.tsx`.

#### 1.6 "Manage …" rows: their own labels, link colour, no separator (S, ui-kit and client)

- **Design.** "Manage Skill Sets..." (boards 05, 06, 08), "Manage Knowledge Bases..." (board
  08), "Manage Sources..." (boards 07, 08): a gear, the link colour, directly under the list.
- **Today.** All three "+" submenus end with `Common:ManageSources` ("Manage sources") as a
  plain row after a separator (`use-composer-sources.ts:81, 93, 171-174`). Only the slash menu
  has the right text and colour.
- **Change.** ui-kit: one key per list, `tone: "link"` on the row, no separator rows. Client
  and ui-kit locales: new `Common:ManageSkillSets`, `Common:ManageKnowledgeBases`; reword
  `Common:ManageSources` to "Manage Sources...". The reworded key needs the other languages
  redone (`translate-stale`).
- **Checks.** `use-composer-sources.test.ts`; the locale tests.
- **Depends on.** 1.3.

#### 1.7 "+" → "Skill sets" opens the skill picker (M to L, ai-chat and ui-kit)

- **Design.** Board 05: the Skill sets flyout is the slash menu's list: the "SKILL SETS"
  caption, the hint, each set as a fold-out group with its skills, a hover trash button on a
  set, and "Manage Skill Sets...". A click on a skill calls it.
- **Today.** ui-kit passes `composerSkills`: one row per connected Instructions room, and a
  click opens the room in Files (`use-composer-sources.ts:63-111`). A skill can be called only
  from the slash menu.
- **Change, ai-chat.**
  - Extract the list body of `ComposerSkillsMenu.tsx` (caption, hint, groups, skill rows, empty
    states, the manage row) into a shared component that takes the pick handler. The slash menu
    keeps its query filter and its keys.
  - `DropDownItemProps.subMenuContent?: ReactNode`: a flyout, or a drilled-in level on mobile,
    that renders given content instead of rows.
  - A new `WidgetConfig.composerSkillsPicker?: boolean`. When on, the Skill sets row opens the
    shared list. A pick appends the call to the draft (`skillCommand(name)` after a space); a
    pick of a called skill removes it with the existing helpers.
- **Change, ui-kit.** Stop passing `composerSkills` and turn the flag on. Items 1.1 and 1.2
  then cover this list too.
- **To confirm with the designer.** Whether a pick closes the "+" menu, and that a click on a
  set no longer opens its room in Files.
- **Checks.** ai-chat `tests/ComposerSourceMenus.test.tsx`, `ComposerSkillsMenu.test.tsx`,
  `ComposerActionAttachments.test.tsx`; ui-kit `use-composer-sources.test.ts`.

#### 1.8–1.10 Only if board 01's composer is final (D1)

- **1.8 Knowledge bases section in the slash menu (M, ai-chat).** Below "Manage Skill
  Sets...": a divider, a "KNOWLEDGE BASES" caption, the connected bases with a remove button
  each (`deselectKnowledgeFolder`), and "Manage knowledge bases..." (`onPickKnowledgeRooms`,
  hidden with `hideKnowledgePicker`). The rows are not options and stay out of the arrow walk.
- **1.9 Skill chip above the input and the "Added" label (M, ai-chat).** A chip row next to the
  attachment chips in `Composer.tsx`, with the call kept out of the text; "Added" in place of
  the tick. This replaces the inline calls and the tick the library has today.
- **1.10 Toolbar buttons with count badges and "Commands" (M, ai-chat).** Two buttons with
  badges and one for prompts in `ComposerAction.tsx`, opening the same lists as the "+" rows.

### Phase 2. Chat panel header and agent menu (boards 02, 03)

#### 2.1 The agent's logo in the panel title (S, ui-kit)

- **Design.** Board 03: a 20px logo before the picked agent's name.
- **Today.** The title button draws only the name and the arrow
  (`ui-kit/ai-agent/ai-chat-panel/components/ai-chat-agent-picker/index.tsx:181-211`). The
  logo the client passes (`client/.../AiPresetsBridge/index.tsx:176-183`) is used only in the
  menu rows.
- **Change, ui-kit.** Draw `selected.icon` before the name.
- **Checks.** `AiChatAgentPicker.test.tsx`.

#### 2.2 "Save as new agent" moves into the agent menu (S to M, ui-kit and client)

- **Design.** Board 02: the agent menu ends with a separator and "+ Save as new agent" in the
  link colour. The header has no save icon.
- **Today.** A save icon in the header (`ai-chat-panel-save/index.tsx`, mounted as
  `rightExtras` in `ai-chat-panel-header-container/index.tsx:57`), tooltip "Save as AI
  project". The menu has no action, and it is not shown without agents
  (`ai-chat-agent-picker/index.tsx:92`; the client sets the menu only when there are agents,
  `client/.../AiPresetsBridge/index.tsx:210`).
- **Change, ui-kit.** Move the click logic of `AiChatPanelSave` into a hook. Draw the action
  under the list as a sibling button, since a listbox may hold only options and groups. Remove
  the header icon. Show the menu when `onSavePreset` is set even with no agents (D11).
- **Change, client.** `AiPresetsBridge` sets the menu with an empty list for a user who may
  create agents. Key `Common:SaveAsNewAgent`.
- **Checks.** `AiChatAgentPicker.test.tsx`; the client's `AiPresetsBridge` test; the
  screenshots of `ai-chat-header-button.spec.ts`.

#### 2.3 The "Agent actions" menu (L, ui-kit and client)

- **Design.** Board 03: a kebab after "New chat" opens Edit agent, Share agent, Agent info,
  Expand, Save as new agent, a separator, Delete agent.
- **Today.** Nothing in the panel. The operations exist for the agent's room elsewhere: the
  edit form (`client/.../store/AiProjectsStore.ts:489-510`), the invite panel, the info panel,
  the room's delete (`client/.../store/filesStore/contextOptions.helpers.ts:866-889`), and
  saving (`client/.../store/AiPresetsStore.ts:208-240`).
- **Change, ui-kit.** `AiChatStore.agentActions` (kept by reference, as `onSavePreset` is) with
  `setAgentActions`; an item is `{ id, label, icon?, onClick, danger?, separatorBefore? }`. The
  header draws the kebab while an agent is picked and the list is not empty. ui-kit adds its
  own items: Expand or Collapse on desktop, and Save as new agent when `onSavePreset` is set.
- **Change, client.** `AiPresetsBridge` builds the list for the picked agent. Rights are
  needed, and `TAiPreset` (`store/AiPresetsStore.ts:56-62`) carries none: keep the agent's
  `security` on the active preset, which `requestApply` already reads with the agent.
  - Edit agent: `aiProjectsStore.openEditDialogById(id)`, with `security.EditRoom`.
  - Share agent: the invite panel for the agent's room, with `security.EditAccess`.
  - Agent info: per D10.
  - Delete agent: the room's delete flow, with `security.Delete`; the chat then goes back to
    the default agent, as it does when a picked agent is gone.
- **Strings.** `Common:AgentActions`, `Common:ShareAgent`; `EditAgent`, `AgentInfo` and
  `DeleteAgent` exist in the client.
- **Checks.** `AiChatStore.test.ts`, a header test in ui-kit, the client's `AiPresetsBridge`
  and `AiPresetsStore` tests.

#### 2.4 The header changes when an agent is picked (S to M, ui-kit)

- **Design.** Default agent: title, Chat history, New chat, then Expand and Close on the
  right. Picked agent: title with logo, New chat, the kebab, then Close.
- **Today.** One layout for both
  (`ai-chat-panel-header/index.tsx:52-91`, `ai-chat-panel-header-container/index.tsx:53-60`).
- **Change, ui-kit.** With an agent picked: `ChatToolbar` without the history button (a new
  prop), no fullscreen icon, the kebab after "New chat". Until 2.5 ships, the menu gets a
  "Chat history" item that opens the history page, so the history stays reachable.
- **Checks.** A header test for both states.
- **Depends on.** 2.3.

#### 2.5 Chat history inside the agent menu (M, ui-kit, possibly ai-chat)

- **Design.** Board 03: under a "CHAT HISTORY" caption the menu lists recent conversations.
  The current one has a 2px accent bar and bold text; each row shows a "…" button on hover.
- **Today.** The history is a separate page (`ui-kit/ai-agent/chat-toolbar/index.tsx:45-52`),
  drawn by the library's `ChatList` and `ChatListItem`
  (`ai-chat/src/ui/components/layout/sub-components/`), which already have the active marker
  and the per-thread menu.
- **Change.** A compact list in the menu from the threads store (`threads`, `threadId`,
  `onSwitchToThread`, loaded through `ensureThreads`), five rows and a way to the full page.
  For the row menu, export a compact form of the library's list item instead of rebuilding
  the thread menu in ui-kit.
- **Depends on.** D4. Without a per-agent scope the list would show every conversation of the
  user under an agent's name.

#### 2.6 Wording: "agent" (M, client and ui-kit locales)

- **Design.** "agent" in every label.
- **Today.** See D3.
- **Change.** Reword the values the product settles on; keys and internal names stay. Run
  `translate-comments`, then `translate-stale` for the reworded keys.
- **Checks.** The locale tests (`cd common/tests && npx vitest run test/locales.test.js`).
- **Depends on.** D3.

### Phase 3. Agent page header (boards 08, 09, 10)

An open agent is drawn in the Home section: the header is the section's navigation
(`client/packages/client/src/pages/Home/Section/Header/index.js`), the chat fills the body
(`client/packages/client/src/pages/AiProjects/AiProjectView.tsx`).

#### 3.1 Agent wording and order in the page menu (S to M, client, possibly ui-kit)

- **Design.** After the title: Chat history, New chat, then a kebab with Edit agent, Share
  agent, Agent info, a separator and Delete agent.
- **Today.** The room's menu with room wording (`Common:EditRoom`, `Common:InviteContacts`,
  `Common:RoomInfo`; `client/.../store/contextOptionsStore/filesContextOptions.helpers.ts`
  around lines 466, 474, 699), with no branch for an agent. The chat toolbar sits after the
  kebab, in the `analyzeResponsesButton` slot (`Section/Header/index.js:1095-1110`).
- **Change, client.** A label branch for `RoomsType.AiProjectRoom` with `Common:EditAgent`,
  `Common:ShareAgent`, `Common:AgentInfo`, `Common:DeleteAgent`; the design's four first,
  Delete last after a separator, the rest per D14. The same options feed the kebab of a card
  in the Agents list. For the order of the toolbar and the kebab, add a slot before the
  context button to ui-kit's `components/navigation` instead of reordering with CSS.
- **Checks.** The client store tests (`pnpm test:store`); `ai-projects.spec.ts`.

#### 3.2 The "Share agent" button (S, client)

- **Design.** An outlined "Share agent" button after the kebab.
- **Today.** The header's outlined button is for rooms ("Share room") and depends on
  `security.CopySharedLink` (`Section/Header/index.js:915-918, 1368`), which an agent's rights
  do not have. Sharing an agent means the invite panel, reached from the menu.
- **Change, client.** A branch for the agent's room: label `Common:ShareAgent`, a click opens
  the invite panel, shown with `security.EditAccess`. If D7 adds a portal-wide audience, the
  switch for it belongs in the same place.
- **Checks.** A header unit case; `ai-projects-access.spec.ts` for a member who sees no button.

#### 3.3 The agent switcher in the page title (M, ui-kit and client)

- **Design.** The title is a button with the agent's logo, name and an arrow that opens the
  list of agents.
- **Today.** The title is the room's name. The agent menu exists for the panel only and is
  switched off inside an open agent (`AiPresetsBridge/index.tsx:163, 210`,
  `isInsideOpenProject`).
- **Change.** ui-kit: a title slot in `components/navigation` (`titleContent`), and the agent
  menu exported for it. Client: inside an open agent, set the menu with the agent selected and
  a pick that navigates (D9), and pass it into the slot.
- **Checks.** `AiChatAgentPicker.test.tsx`; the client's `AiPresetsBridge` test; a navigation
  test in ui-kit.
- **Depends on.** D9; 2.1 for the logo.

### Phase 4. Agents list (board 04)

#### 4.1 Category tabs (M, client)

- **Design.** A tab row under the search row: All, My agents, then categories.
- **Today.** Owner and tags are options inside the filter dropdown
  (`client/packages/client/src/pages/Home/Section/Filter/index.js:1383-1405`). The section's
  submenu slot renders nothing (`pages/Home/Section/Tabs/index.js`).
- **Change, client.** A chip row for the agents list that drives the rooms filter the list
  already uses, so the address, paging and live updates keep working: "All" clears owner and
  tags, "My agents" sets the owner to the current user, a category sets one tag. Tags come
  from the source the filter's tag options use. The row scrolls sideways when it overflows.
  Keys `Common:MyAgents`, `Common:AgentCategories`.
- **Checks.** A unit test for the chip-to-filter mapping; `ai-projects.spec.ts`.
- **Depends on.** D13.

#### 4.2 "Open chat" button on a card (S, client)

- **Design.** A chat icon button next to the kebab, labelled "Open chat with <agent>".
- **Today.** The whole card opens the agent
  (`client/.../Section/Body/TilesView/AiProjectTile.tsx`, `onRoomClick`).
- **Change, client.** An icon button in the card's top row that calls the same handler; add
  its class to `CONTROLS` so the card does not fire twice. Key `Common:OpenChatWith`.
- **Checks.** A tile unit case.

#### 4.3 Skill sets and knowledge bases as stacked rows with icons (S, client)

- **Design.** Each name on its own line with its icon.
- **Today.** One line, names joined with commas (`AiProjectTile.tsx`, `list`).
- **Change, client.** One row per name with the skill set or knowledge base icon. The tile
  grid uses a fixed height, so cap the rows (two, then "+N") and check the grid still lines up.
- **Checks.** A tile unit case; the screenshots of `ai-projects.spec.ts`.

#### 4.4 Description on a card (S, client)

Two lines of the agent's description under the name. Depends on 7.1.

#### 4.5 Verified owner (S, client)

The owner row shows the provider's name with a Verified badge for an official agent. Depends
on 7.2.

### Phase 5. Info panel (boards 04, 08, 09, 10)

Today an agent gets Contacts, History and Details
(`client/packages/client/src/helpers/info-panel/tabs.ts:108-118`; labels in
`pages/Home/InfoPanel/Header/headerGeneral.tsx:115-124`; views under
`pages/Home/InfoPanel/Body/views/`; view ids in `helpers/info-panel/index.ts:42-49`). The chat
of an open agent is drawn in the section body so that the info panel can stand beside it.

#### 5.1 Tabs Context, Content, About (M, client)

- **Change, client.** New view ids for Context and Content; About either reuses the details id
  with its own label for an agent or gets its own id. In `tabs.ts` the agent branch returns the
  tabs D8 settles on, for an open agent and for a selection in the list separately. A stored
  view the agent no longer has falls back to the first tab, which the helper already does.
  Key `Common:Context`; `Common:Content`, `Common:About` and `Common:Info` exist.
- **Checks.** A unit test for `getAvailableInfoPanelTabs` with an agent selection.
- **Depends on.** D8.

#### 5.2 The About tab (M, client)

- **Design.** A 60px logo, the name and a provenance line; DESCRIPTION; DETAILS with Owner,
  Access, Model, Created, Last modified; SKILL SETS as fold-out sets listing their skills;
  KNOWLEDGE BASES as a list.
- **Today.** Details shows Owner, Type, Date modified, Last modified by, Creation date, Tags
  and Model (`views/Details/Details.utils.tsx:172-198`) under the room's title block. The
  store can already read an agent's skills and knowledge files (`AiProjectsStore.ts`,
  `fetchSkills`, `fetchKnowledgeFiles`), and nothing on screen uses them.
- **Change, client.** A new view. The list answers agents without their settings, so a
  selected agent is read in full first. Sections with no data are left out: Description until
  7.1, the provenance line until 7.2, the Access row until 7.3.
- **Checks.** A view unit test with a full and a partial agent.

#### 5.3 The Context tab (L, ui-kit and client)

- **Design.** Board 08: SKILL SETS (fold-out sets with their skills) and "Manage Skill
  Sets..."; KNOWLEDGE BASES and "Manage Knowledge Bases..."; DATA SOURCES and "Manage
  Sources...", one of them tagged "current room".
- **Today.** The same data lives only in the composer's "+" menu, in the library's clouds
  store.
- **Change.** ui-kit: a component that reads the clouds store and takes the same callbacks and
  the same `sourcesManager` rule as `use-composer-sources.ts`, so the panel and the "+" menu
  cannot disagree. Client: mount it as the Context view. The section header already mounts
  `ChatToolbar`, which reads the same stores, so the panel should be inside the providers too;
  verify first. For an agent selected in the list there is no chat: show the agent's own skill
  sets and knowledge bases and no data sources. The "current room" row follows D12.
- **Checks.** A ui-kit test for the component; a client test for the two modes.

#### 5.4 The Content tab: Attachments (M to L, several)

- **Design.** Board 10: the files added to this conversation, each with its origin and size
  ("From device · 1.2 MB", "Design for Marketing · 48 KB") and an "Actions" kebab.
- **Today.** Attachments show only inside each message. Nothing lists the attachments of a
  thread: the library's routes are save, get, delete and link
  (`ai-chat/src/core/services/attachments/types.ts:21-34`), and the .NET controller has no
  list either. The answer for an attachment has no size and no origin
  (`server/products/ASC.AI/Server/Models/ResponseDto/AttachmentDto.cs`).
- **Change.** Use the list route of 7.5. Size and place come from the Files API by the
  attachment's entry id. "From device" needs a stored origin (D15); until then show where the
  file is.
- **Depends on.** 7.5, D15.

#### 5.5 The Content tab: Artifacts (L, several)

- **Design.** Board 10: the files the agent produced here, "Not saved · 2 min ago", an
  "Actions" kebab, and "Download all".
- **Today.** No list of produced files exists. Generated images are stored as attachments
  marked `source: "tool"` and saved to a folder at once; documents made by tools are not
  recorded as belonging to the thread at all.
- **Change, with option A of D5.** Record every file a tool creates as a thread attachment
  with `source: "tool"` in ASC.AI.Chat; list them through 7.5; show where each one is;
  "Download all" is the Files bulk download of those ids; the row menu offers open, download
  and copy to a room.
- **Depends on.** D5, D15, 7.5.

### Phase 6. Messages (boards 08, 09)

#### 6.1 The agent's logo beside each reply (M, ai-chat, ui-kit, client)

- **Design.** A 24px rounded logo at the start of every assistant message.
- **Today.** No avatar and no way for a host to pass one. The message grid already has a
  first column that the content skips
  (`ai-chat/src/ui/pages/chat/sub-components/AssistantMessage.tsx:695-720`).
- **Change.** ai-chat: `WidgetConfig.assistantAvatar?: ReactNode`, drawn in that column;
  check that the "working" indicator and tool rows still line up. ui-kit: an `AiChatStore`
  field passed into the config. Client: the picked agent's `ProjectLogo` at 24px, from the
  active preset in the panel and from the open agent on its page; nothing for the default
  agent.
- **Known limit.** The logo is the agent the chat runs on now, not the one that wrote an old
  reply. A per-message logo needs the agent recorded with the thread (see D4).
- **Checks.** An ai-chat message test with and without the avatar.

#### 6.2 Attachments inside the user's bubble (S to M, ai-chat, ui-kit)

- **Design.** Inside the bubble, under the text: an image preview of 240×150 with its file
  name, or a file chip.
- **Today.** A strip above the bubble with 72×72 thumbnails and no names
  (`ai-chat/.../UserMessage.tsx:400-417, 504-540`).
- **Change.** ai-chat: a `WidgetConfig` option for the placement, default as today; the new
  layout draws the larger preview with a caption. ui-kit turns it on.
- **Checks.** `UserMessage` tests for both placements.

#### 6.3 The generated image card (M, ai-chat and ui-kit)

- **Design.** The image in a bordered card with a footer: "<name> · generated", Download,
  "Save to room…".
- **Today.** A bare image (`ai-chat/src/ui/components/tool-fallback/index.tsx:176-205`).
- **Change.** ai-chat: the card around a generated image, the attachment's title as the name, a
  built-in Download, and host actions for the footer. ui-kit: the second action opens the
  folder selector and, with option A of D5, copies the already stored file to the chosen room.
- **Depends on.** D5, D15.

#### 6.4 The generated document card (L, ai-chat and ui-kit)

- **Design.** A card with the file icon, the name and "2 pages · created by <agent>".
- **Today.** The tool call is drawn as the generic tool row, and the file opens in an editor
  tab (`ui-kit/ai-agent/providers/index.tsx:831-847`, `host-tool-groups/`).
- **Change.** ai-chat: a way for the host to draw the result of named tools, registered next
  to the fallback renderer in `AssistantMessage.tsx`. ui-kit: a file card for the tools it
  already recognises as file-creating, with the icon by extension and a click that opens the
  file. The page count follows D15.
- **Depends on.** D5, D15.

### Phase 7. Server-led changes

Each of these starts with the .NET or ASC.AI.Chat side. The client part is small once the
contract exists. MSW handlers and contract tests follow the server as implemented.

#### 7.1 Agent description (M, server and client)

- **Today.** An agent has a title, tags, a logo, a model, instructions, suggestions and linked
  rooms (`client/packages/shared/api/ai/projects.ts:163-211`). The create-room request has no
  description either.
- **Change.** Server: a description on the agent, returned with the room in the list if
  possible, so a card needs no extra request. Client: the field in `TAiProjectSettings` and the
  request types, an input in `CreateEditProjectDialog`, the card (4.4), the About tab (5.2).
- **Check first.** The client reads `files/rooms/{id}/instructions` and `.../suggestions`
  (`projects.ts:66-67`), and neither route is in the local `../server` checkout, where
  `AiHubController` serves sources, skills and the model only. Find out where those two live
  before adding a third field next to them.

#### 7.2 Official agents (L)

Follows D6. Client part: a flag on the agent, the badge on the card (4.5), the provenance line
on About (5.2), and settings that cannot be edited. The strings take the provider's name as a
variable.

#### 7.3 Portal-wide access (L)

Follows D7. Client part: the Access row (5.2), the audience switch with "Share agent" (3.2),
the non-member view in `AiProjectView.tsx`, the sidebar's and the menu's agent lists.

#### 7.4 Per-agent threads (M to L)

Follows D4. ASC.AI.Chat passes the agent's id as the thread scope on create and list instead of
dropping it (`threadsStorage.ts`); the sidebar's "Recent" list and the chat's scope in
`Shell.jsx` follow the answers to D4. Unblocks 2.5.

#### 7.5 The files of a thread (M, server, ASC.AI.Chat, ai-chat)

- **Today.** Attachments are stored with their thread, but nothing lists them by thread. The
  .NET controller has create, read by id, read many, bind to a message and delete
  (`server/products/ASC.AI/Server/Api/AttachmentsStorageController.cs`).
- **Change.** .NET: a list of a thread's attachments, with the source (user or tool). ASC.AI.Chat:
  the route and the storage method. ai-chat: `AttachmentsStorage.readByThread` and the engine
  route, optional for a storage that does not have it, so other hosts keep working.
- **Unblocks.** 5.4, 5.5.

## 7. How a change travels between repositories

1. **ai-chat.** Work on `feature/composer-plus-menu`. Run `npm run typecheck`, `npm run lint`,
   `npm run test:run`. Pack without a version commit: `node scripts/pack-pre.mjs
   1.0.2-progress.<n>`; the last pack is `progress.50`.
2. **A library change that ui-kit does not call** (a pure look change): in the client run
   `pnpm run update-ai-chat ../../onlyoffice-ai-chat/<pack>.tgz`. No ui-kit build is needed
   while ui-kit's peer range covers the version.
3. **A new `WidgetConfig` field that ui-kit uses:** in ui-kit swap its ai-chat tarball, raise
   the peer range to the new version, run ui-kit's own gate, build and `pnpm pack`. Then in the
   client, in this order: `pnpm run update-ai-chat <pack>`, `pnpm update -r
   @onlyoffice/apps-ui-kit`, `pnpm run update-ui-kit`.
4. **A change to the library's engine or storage contracts** (7.5): ASC.AI.Chat in the server
   repository takes the pack too, and its OpenAPI output is regenerated.
5. **Client.** `pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`,
   `npm --prefix ./common/tests run test:lefthook`. Commit the tarballs, the manifests and
   `pnpm-lock.yaml` together.

## 8. New strings

Key names are proposals. The client's `public/locales/*/Common.json` is the source; ui-kit
keeps a committed English subset in `locales/en/Common.json` for its own build, tests and
Storybook; ai-chat has its own 41 files in `src/translations/`.

| Key | English | Where | Item |
|-----|---------|-------|------|
| `RemoveSource` | Remove {{name}} | ai-chat, Common | 1.2, 1.4 |
| `ManageSkillSets` | Manage Skill Sets... | Common (exists in ai-chat) | 1.6 |
| `ManageKnowledgeBases` | Manage Knowledge Bases... | Common | 1.6 |
| `ManageSources` | Manage Sources... (reworded from "Manage sources") | Common | 1.6 |
| `SaveAsNewAgent` | Save as new agent | Common | 2.2 |
| `AgentActions` | Agent actions | Common | 2.3 |
| `ShareAgent` | Share agent | Common | 2.3, 3.1, 3.2 |
| `MyAgents` | My agents | Common | 4.1 |
| `AgentCategories` | Agent categories | Common | 4.1 |
| `OpenChatWith` | Open chat with {{name}} | Common | 4.2 |
| `Context` | Context | Common | 5.1 |
| `DataSources` | Data sources | Common (exists in ai-chat) | 5.3 |
| `CurrentRoom` | current room | Common | 5.3 |
| `Attachments` | Attachments | Common (exists in ai-chat) | 5.4 |
| `Artifacts` | Artifacts | Common | 5.5 |
| `SaveToRoom` | Save to room… | Common | 6.3 |
| `GeneratedLabel` | generated | ai-chat | 6.3 |
| `CreatedByAgent` | created by {{name}} | Common | 6.4 |
| `Description` | Description | Common | 7.1 |
| `OfficialAgent` | Official {{organizationName}} agent | Common | 7.2 |
| `Verified` | Verified | Common | 7.2 |
| `EveryoneInPortal` | Everyone in {{productName}} | Common | 7.3 |

Already there and reusable: `Common:EditAgent`, `AgentInfo`, `DeleteAgent`, `Agents`,
`DefaultAIAgent`, `Content`, `About`, `Info`, `SkillSets`, `AIProjectKnowledgeRooms`
("Knowledge bases"), `Files:DownloadAll`.

For new keys run `translate-comments` first, then `translate-locales`. For reworded keys run
`translate-stale`; no test catches a translation left on the old wording.

## 9. Checks

| Repository | Unit tests to extend | Other |
|------------|----------------------|-------|
| ai-chat | `src/ui/pages/chat/tests/ComposerSkillsMenu.test.tsx`, `ComposerSourceMenus.test.tsx`, `ComposerActionAttachments.test.tsx`, `Composer.test.tsx`; `src/ui/components/dropdown-item/tests` | typecheck, lint |
| ui-kit | `ai-agent/providers/files/use-composer-sources.test.ts`, `context-folder-dialog.test.tsx`, `use-integration.test.tsx`; `ai-agent/providers/ai-chat-store/AiChatStore.test.ts`, `AiChatStoresBridge.test.tsx`; `ai-agent/ai-chat-panel/components/ai-chat-agent-picker/AiChatAgentPicker.test.tsx` | its own gate |
| client | `src/components/AiPresetsBridge/__tests__`, `src/store/__tests__/AiPresetsStore.test.ts`, `AiProjectsStore.test.ts`, `src/pages/AiProjects/__tests__` | Playwright: `ai-projects.spec.ts`, `ai-projects-access.spec.ts`, `ai-chat-header-button.spec.ts` |

The header, the cards and the info panel change the committed screenshots; refresh them with
`pnpm test:e2e:docker:update-screenshots` and look at the differences before committing.

## 10. Risks and traps

- **Two repositories away.** A `WidgetConfig` field is useless until ui-kit's peer range and
  the client's lockfile have moved (section 7). Batch library changes.
- **The slash menu keeps the focus in the input.** Any new control in it must prevent the
  focus from leaving on mouse down, or the list closes.
- **DocSpace restyles `--text-tertiary` classes** as a 10px caption, which is why the slash
  menu sets that colour inline. The shared list of 1.7 must keep doing so.
- **"+" lists are at most two levels deep** (`MAX_DEPTH` in `ComposerSourceMenus.tsx`).
- **The card grid has a fixed height** (4.3, 4.4): more lines on a card can break it.
- **The chat panel and the info panel exclude each other** outside an agent's page (D10).
- **Rewording English** leaves every other language stale (1.6, 2.6).
- **The agent travels as a "preset"** in the client (`activePreset`, `applyPreset`). New
  wiring in `AiPresetsBridge` should follow the existing reactions and not add a third path.
- **Server statements here were read without CodeGraph** (section 1).

## 11. Coverage by board

| Board | Items | Already matches |
|-------|-------|-----------------|
| 01 Menu | 1.8–1.10 (only with D1) | The whole sidebar: AI Chat with Agents, Recent, Skill sets, Knowledge bases and "Show more"; the header; the empty state; the disclaimer |
| 02 Room picker | 2.2, 2.6 | The room's AI Chat button; the agent menu with the default agent, the "Agents" group, logos and keys; history and New chat; suggestion chips |
| 03 Room agent | 2.1, 2.3, 2.4, 2.5, 7.4 | Picking an agent applies its model and sources; New chat; Close |
| 04 Agents | 4.1–4.5, 5.1, 5.2, 7.1–7.3 | The list with search, filter, sort and view switch; the card with model, skill sets, knowledge bases, owner and kebab; the create and edit form |
| 05 Plus menu | 1.3, 1.6, 1.7 | The "+" menu's groups, order and rows; Prompts; the web search switch; flyouts on desktop and drill-down on mobile |
| 06 Slash | 1.1, 1.2 | The slash menu: caption, hint, fold-out sets, readable skill names, keys, coloured calls in the draft, "Manage Skill Sets..." |
| 07 Data sources | 1.4, 1.5, 1.6 | The Data sources list with up to 20 folders and rooms and a way to add one |
| 08 Agent chat + info | 3.1–3.3, 5.3, 6.1–6.4 | The agent's chat as a page; history and New chat in the header; the info panel switch; Copy and Regenerate under a reply |
| 09 Agent chat + about | 5.2, 6.1–6.4, 7.1–7.3 | As board 08 |
| 10 Agent chat + content | 5.4, 5.5, 7.5 | The panel frame, the tab strip, the Close button |

The code has these and the design does not show them; ask the designer before removing any:
the description line under the welcome title ("Choose an action or ask a question"), the tick
on a called skill, "Save as docx" under a reply, and pin, notifications, change owner and leave
in the agent's menu.

## 12. Turning this into OpenSpec changes

AI planning in this repository lives in `openspec/changes/ai-projects/`. Once the decisions of
section 4 are made, each phase can become its own change next to it: the items map to tasks,
each with its check, and the decisions become the design. Phase 7 and D4 revise what
`ai-projects` records (threads, the agent's API), so they belong in deltas to its
`ai-chat-sources`, `ai-project-workspace` and `ai-projects-api` capabilities.
