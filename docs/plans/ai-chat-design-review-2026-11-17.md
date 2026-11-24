# AI Chat: browser review against the design boards (2026-11-17)

A walk through all fifteen boards of the "DocSpace — AI Chat" design artifact
and the same screens of the running client, with the findings checked against
the `ai-chat-agents-design` OpenSpec change.

## Scope and setup

- **Design**: claude.ai artifact `RjERC5xvn5xwMr73vSvB2q`, version
  `1794906879-af87`. `proposal.md` records version `1794687729-e1b1`, so some
  boards changed after the specs were written (noted per board below).
- **Client**: `feature/new-ai-concept` at `4c1a85c22c0`, served at
  `http://localhost:8092`, signed in as Administrator (portal owner), light
  theme, desktop width (about 1510 px).
- **Specs**: `openspec/changes/ai-chat-agents-design` (proposal, tasks and the
  eleven capability specs).

Each finding is tagged:

- **[spec]** contradicts a requirement, and no open task covers it (or the
  task is only gated).
- **[task N]** known gap: an unticked task of `tasks.md` covers it.
- **[design]** differs from the board; the specs do not require it, or put it
  out of scope.
- **[conflict]** the board and the spec disagree with each other; the client
  follows one of them.
- **[bug]** behaviour defect unrelated to the boards.

## Chat: what works

- **Default agent**: a message was sent, the reply arrived, and the
  conversation appeared in Recent and in the history.
- **Chat on an agent**: Contract Reviewer asked to confirm the
  `document_agent` tool; after Allow it created `Cats note.docx`, which then
  appeared on the Content tab.
- **Slash menu**: filtering (`/cla`), picking with Enter, the tick on a called
  skill, and the call drawn inline in the link colour.
- **Agent menus**: the title menu in the fullscreen chat and in the room's
  chat panel, the agent switcher on an agent's page, the history with search.
- **Reload**: the fullscreen chat came back on the same conversation.
- **Console**: no errors after the reload. The console was not recorded before
  it, so earlier errors cannot be ruled out.

## Spec violations

1. **[spec] Bin on a knowledge base in an agent's chat.** In the room's chat
   panel on Contract Reviewer the slash menu draws a bin on "Contract
   standards". `ai-chat-source-menus`, "Lists of a chat on an agent": no one
   gets a remove control on a knowledge base.
2. **[spec, task 3.4 gated] Model picker stays a dropdown in the panel on an
   agent.** `ai-agent-conversations`, "Model of a chat on an agent", requires
   a label no role can change, on the page and in the panel alike. The agent's
   page does it; the panel does not.
3. **[spec] Details of a skill.** The panel shows Type, File extension, Size,
   Versions and Comments, and has no Skill set and no Command row.
   `ai-skill-sets`, "Skill in the Info panel", requires the opposite.
4. **[spec] Recent on an agent's page.** It lists only that agent's
   conversations and hides the rest. `ai-agent-conversations`, "Recent in the
   sidebar": until the storage can list them together, Recent lists the
   conversations that belong to no agent.

## Behaviour defects

- **[bug]** In the fullscreen chat the address and the browser tab title stay
  those of the Agents list (`/ai-rooms/filter?type=12`, "Agents - ONLYOFFICE").
- **[bug]** The Info panel closes by itself on the way list → agent → list.
  Rooms keeps it open on the way list → room.
- **[bug]** A skill set or a knowledge base opened by its short address
  (`/ai-rooms/32/filter?folder=32`, without `type`) highlights Agents in the
  sidebar instead of Skill sets or Knowledge bases.
- **[bug]** A history list opened in one place opens by itself in the others
  (the agent's page, the room's chat panel).
- **[bug]** The "+" menu opens over the input instead of above it.
- **[bug]** The first Escape does not close the agent menu of the title; the
  next click only closes the menu instead of acting. The context menu of
  Rooms closes on the first Escape.

## Findings by board

### 01, 05–07: fullscreen chat and composer menus

- **[task 1.5, 1.7]** "+" > Skill sets is a flat list of rooms with the room
  icon. The board has the caption, the hint and the sets as groups with their
  skills.
- **[task 1.8, 1.9]** All three sub-lists end with the same "Manage sources"
  row in the default text colour, after a separator. The board has "Manage
  Skill Sets...", "Manage Knowledge Bases..." and "Manage Sources..." in the
  link colour with a gear and no separator.
- **[task 1.8]** The rows of the "+" lists have no remove control.
- **[design]** The Data sources entry has a folder icon (sliders on the
  board) and reads "Data sources" ("Data Sources" on the board).
- **[design]** Slash menu: about 300 px high with a scrollbar (the board shows
  it whole), narrower than the board, flush against the input, and its
  "Manage ..." rows carry the sliders icon instead of a gear (board 06) or a
  plus (board 01).
- **[design]** The two pickers are titled differently: "Instructions rooms"
  and "Knowledge bases".
- **[design]** Sidebar: "Recent" instead of "Recents".
- **[conflict]** The title "AI Chat" has a menu arrow. Boards 01 and 05 draw
  it plain; `ai-chat-agent-menu` requires the menu. The client follows the
  spec.

### 02–03: chat panel in a room

- Board 02 matches, with "Save as new agent" at the end as the spec asks.
- **[design]** Board 03: the agent's name is cut ("Contract Revie…") because
  the header holds five buttons; the board has "+", "⋮" and "✕".
- **[conflict, task 4.5 gated]** The "⋮" menu lists Edit agent, Share agent,
  Agent info and Delete agent, as the spec says. The board lists Share agent,
  New chat, Save as new agent, Expand and a Chat history list.
- **[design]** The suggestion chips disappear once an agent is picked; the
  board keeps them.

### 04: Agents

- **[task 2.1–2.3]** The create button reads "New room"; the empty Info panel
  reads "See rooms details here". Both are the texts of the Rooms list.
- **[task 6.1–6.5]** Agent card: no description, no open-chat button, no
  Category row; skill sets and knowledge bases are joined by commas without
  icons; the "Knowledge…" label is cut; five narrow columns against two wide
  ones.
- **[conflict]** Templates: categories are chips under the search. The board
  (newer than the spec) has a filter button that opens a Category dropdown;
  `ai-agents-list` requires a row of category tabs.
- **[task 6.0i]** Templates: a card cannot be selected into the Info panel,
  so there is no "Add to my agents".
- **[design]** Templates: no "⋮" on a card and no green tick beside the name.

### 08–10: agent page

- **[spec]** Header order: the name, "⋮" and Share agent, with Chat history
  and New chat at the far right. The board and `ai-agent-page`, "Header of an
  agent's page": name, Chat history, New chat, "⋮", Share agent.
- **[task 5.3]** The "⋮" menu is worded for rooms throughout: Edit room,
  Invite people, Download, Room info, Change room owner, Leave the room,
  Delete room.
- **[task 2.2]** The empty state labels the sources "Skills" and "Knowledge"
  instead of "Skill sets" and "Knowledge bases".
- **[task 8.1–8.5]** No agent logo beside replies; a created document is a
  link in the text, not a card with "created by …".
- **[conflict]** Order of the Info panel tabs: Details, Context, Content. The
  board has Context, Content, Details; `ai-agent-info-panel` matches the
  client.
- **[task 2.2, 6.5]** Details: Type reads "AI project"; there is no
  Description, Access or Model. (Access, "Everyone in DocSpace", is out of
  scope.)
- **[design]** Context: one "Manage sources" link instead of a "Manage ..."
  row per section; no Data sources section (not built, per the proposal).
- **[design]** Content: a row has a download button instead of "⋮", and reads
  "size · date" instead of "Not saved · 2 min ago" (the latter is out of
  scope).

### 11–13: Skill sets

- **[task 2.x]** "New room" instead of "New".
- **[task 7a.7]** No "Use in chat" icon on a row; the copy-link icon takes its
  place.
- **[design, task 7b.7 gated]** No Used by column, no description and no "Used
  by agents" (out of scope until the server gives them).
- **[design]** The skills in a set's Details have no icon.
- **[spec]** Edit skill opens as a side panel, the form the product uses for
  its other edit dialogs. The board and `ai-skill-sets`, "Edit skill", call
  for a modal dialog; one of the two has to give way.
- **[design]** The editor font of Edit skill is proportional (monospace on
  the board).

### 14–15: Knowledge bases

- **[design]** The list shows coloured logos with initials; the board has a
  grey base icon. Skill sets do show their icon, so the two lists differ.
- **[design, task 7b.7 gated]** Columns are Name, Owner, Last modified, as the
  spec says; the board has Used by and Last indexed (out of scope).
- **[task 2.x]** "New room" instead of "New"; inside a base "New" instead of
  "Add files".
- The Indexed status is shown in the Details of a base and of a file. The
  Indexing and Error pills and the failure note were **not checked**: the
  portal has no such file.

### Everywhere

- **[task 2.3]** The AI Chat card on Home still speaks of an "Instructions
  room", a "Knowledge room" and an "AI project".
- **[design]** The composer's own menus ("+" and its sub-lists) are denser
  than on the boards: rows of about 27 px against 34 px, and the text is not
  semibold. The product's context menu has rows of about 31 px.

## Shared components: where the boards differ from the product

Checked on 2026-11-17 in Rooms and Files of the same portal. In each point
below the AI section behaves exactly as the other sections do, because it
uses the same component. These are not defects of the AI section and are
left out of the lists above; matching the boards here would mean changing the
component for the whole product.

- **Info panel tabs** are centred in every section; the boards align them
  left.
- **Metadata tab**: a room and a file in Rooms and Files have it too
  (Contacts, History, Details, Metadata; for a file Share, History, Details,
  Metadata). The boards draw none. An agent has none, as its spec requires.
- **Info panel header**: the item's logo and name repeat on every tab in
  every section; the boards draw them on Details only.
- **Details rows**: Last modified by and Tags are standard rows of a room's
  Details, Comments of a file's Details.
- **Dates** carry the time everywhere (`11/10/2026 9:30 PM`); the boards
  write "8 Nov 2026".
- **Owner cell** of a table reads "Me" with an avatar; the boards write the
  name.
- **File names** are shown without the extension in every list; the boards
  show it.
- **Table headers** are cut when a column is narrow ("Last modifi…"); the
  widths are the user's own.
- **View switch** is in the filter row of every list, an opened knowledge
  base included; board 15 has none.
- **View choice** (tiles or table) is one for all lists of the product, so
  Agents, Skill sets and Knowledge bases follow each other and Rooms.
- **Tile of a room without tags** shows its room type as a tag ("Custom" in
  Rooms, "Instructions rooms" on a skill set).
- **Tabs over a list** are the product's underlined tabs; board 04 draws My
  agents and Templates as pills.
- **Room logos** are initials on a colour until a cover is set; the boards
  give every agent an icon cover.
- **Back arrow** leads the header of every opened room; boards 08–10 have
  none on an agent's page, though boards 12 and 15 keep it.
- **Context menu**: no item is red in the product's menus, Delete included;
  board 08 draws "Delete agent" red.
- **Side panels** have full-width footer buttons; board 13 draws compact
  ones.
- **"Try Business"** sits in the header of every section on this plan; the
  boards do not draw it.

## Views covered

The boards draw one view of each screen: cards for Agents and Templates, the
table for Skill sets, Knowledge bases and what they hold. All fifteen were
read top to bottom. On the portal:

| Screen | Table | Tiles | Rows (compact) |
| --- | --- | --- | --- |
| Agents, My agents | seen | seen | seen (second session) |
| Agents, Templates | cards only | cards only | cards only |
| Skill sets | seen | seen | seen (second session) |
| Opened skill set | seen | seen | seen (second session) |
| Knowledge bases | seen | seen | seen (second session) |
| Opened knowledge base | seen | seen | seen (second session) |

The compact view shows only in a narrow window; it was seen in the second
session at 1000 px (see "Compact (rows) view and narrow window").

Tiles have no board to compare with. What they show:

- A skill set and a knowledge base are a logo, a name and the room type tag
  ("Instructions rooms", "Knowledge rooms"), with none of the table's columns
  (skills count, owner, date, indexing state).
- A skill is the generic code-file thumbnail with its name: no description
  and no command.
- A file of a knowledge base is the standard file tile; no file with an
  indexing state was there to check the alert icon of `ai-knowledge-bases`,
  "Indexing state of a file".

## Functional pass (2026-11-17, second session)

A walk through the features of the AI Chat section and of the chat panel in
other sections, as the portal owner. Nothing was fixed. Tags as above;
**[check]** marks behaviour that may be intended and needs a decision.

### Compact (rows) view and narrow window (1000 px)

- The compact view was seen for Agents, Skill sets, Knowledge bases, an opened
  skill set and an opened knowledge base. A row is the logo, the name and a
  date only: no skills count or owner on a skill set, no description on a
  skill, no size or "added by" on a file of a knowledge base, no indexing
  state column.
- **[design]** Templates at this width: the search field is drawn partly under
  the tabs row (its top edge is cut).
- The collapsed sidebar keeps the agents as logos and Skill sets and
  Knowledge bases as icons below Recent; they are reached only by scrolling
  the sidebar at 900 px of height.

### Composer: sources of a chat on the default agent

- **[bug]** Skill sets and data sources connected to a new chat are lost on a
  page reload: after connecting "Contract review" (and, separately, the room
  "11") and reloading, the slash menu reads "No skills are connected to this
  chat" and lists no data source. The sets and the knowledge base connected in
  the first session were gone as well.
- **[spec, task 1.8]** "+" > Data sources draws a connected room with the
  folder icon and a chevron that opens a further level, and has no remove
  control. `ai-chat-source-menus`, "Data sources list": one flat row, the room
  icon for a room, a "Remove <name>" control.
- **[design]** The slash menu draws the room "11" with the folder icon too,
  and its bin is labelled "Disconnect folder: 11".
- **[check]** The data sources picker is titled "Apps", has no close button,
  and its first level offers "AI Workspace" (the section is called AI Chat
  everywhere else). Inside it the Instructions and Knowledge rooms are listed
  together and can be ticked as plain data sources, next to the two lists
  made for them.
- **[design]** In that picker Files and Forms carry the same icon, and Select
  is enabled with nothing ticked.
- Works: the bin of a data source in the slash menu removes it, keeps the
  menu open and the input focused; "Manage skill sets..." opens the picker
  with the slash menu still open under it, and a pick appears in the menu at
  once; typing after the slash hides the Knowledge bases and Data sources
  sections.
- **[bug]** With the "+" menu open, Escape followed by a click in the input
  only closes the menu; the text typed next is lost (the input is not
  focused).

### Fullscreen chat: messages, model, attachments

- Works: the model picker (models, Effort, Permissions); "Add files from
  storage" (the file becomes a chip in the draft and quick-action chips
  appear); the reply reads the attached file; copy, regenerate and "Save as
  docx" (opens the folder selector with a file name) on a reply; "Save AI
  Prompt" on a user's message.
- **[task 8.2]** The attachment of a sent message is a separate chip above
  the message, not inside it under the text, and carries a room-grid icon
  instead of the file type icon.
- **[design]** The user's message menu mixes the case of its two items:
  "Save AI Prompt" and "Save AI prompt to folder".
- **[design]** The folder selectors of "Add files from storage" and "Save as
  docx" are titled "Apps", like the data sources picker.

### Save as new agent, agent form

- Works: "Save as new agent" created the agent "QA test agent", listed at
  once in the sidebar and the menus; the agent form linked two skill sets and
  a knowledge base and added a tag, and the agent's page showed them without
  a reload.
- **[task 4.3a]** The dialog is titled "Save as AI project", is pre-filled
  with "New AI project", and the notice reads `AI project "QA test agent"
  saved`.
- **[task 2.2, 6.5]** The form is titled "Edit AI project", labels the skill
  sets "Instructions rooms", says "Everyone in the project chats with this
  model" and "Project owner", and has no Description field.
- **[bug]** In the Tags field of the form, Enter with a typed tag name saves
  and closes the form and drops the tag; the tag is added only by a click on
  "Create tag". (Not compared with the room form.)
- **[check]** The agent saved from a chat got no skill sets, because the
  chat's connections had been lost on the reload described above.

### Agent page: chat, slash menu, Info panel

- Works as specified for the owner: the slash menu lists the agent's sets
  and its knowledge base, the base has no bin, a set's bin unlinks the set
  from the agent at once (the page and Context follow), the model is a plain
  label, New chat starts an empty conversation, the history lists only this
  agent's conversations, and a conversation's menu has Open, Export to,
  Rename and Delete.
- **[task 8.3, 8.4]** A generated image is drawn at the full width of the
  chat column (about 680 px square) with no card, file name, Download or
  "Save to room…". The reply under it is off screen until the user scrolls;
  the chat does not scroll to the end when the image arrives.
- Content lists the generated image with its size, time and a download
  button; Context unfolds a skill set to its skills.
- **[design]** Skills are named by their file slug in Context, in a set's
  Details and in the Skill sets tables ("clause-risk-check"), and by a title
  in the slash menu ("Clause risk check").
- **[check]** Details show a Model row only for an agent that stores its own
  model ("QA test agent"); "Contract Reviewer" has none, while its card names
  the portal's model. This corrects the note under boards 08–10.
- **[check]** The document tool asked for a confirmation before it ran, the
  image tool did not, with Permissions on "Auto approve" in both chats.

### Agents list and Templates

- Works: search by name, the filter panel (Owners, Contacts, Tags), sort,
  the create form from the list's button, the invite panel, and installing a
  template: "Formula Helper" was installed with its skill set "Spreadsheet
  formulas" and its knowledge base, a notice was shown and the My agents tab
  opened. In Templates the category and the search combine.
- **[task 6.1]** An agent tagged "QA" gives the list no category row, and the
  installed template did not tag its agent with its category ("Tables").
- **[task 2.1–2.3]** Wording: the create form is "Create AI project"; the
  invite panel says "Access to the project rooms", "Everyone invited to this
  project", "Add existing members to the room" and offers the role "Project
  manager".
- **[check]** Install runs on one click with no confirmation and creates
  three rooms; a second click on the same template would create them again
  (the "Already added" mark is task 6.0j).
- **[check]** The agent's menu offers Download, and the sort menu offers
  Type, though every row of the list is an agent.
- **[check]** The invite panel of an agent offers "Invite via link";
  `ai-agent-access` is to decide whether a link invite fits an agent (task
  9.2).

### Skill sets

- Works: creating a skill set, "New skill" (a form pre-filled with a
  template), Italic, Heading, the lists, Code and Link of the toolbar and
  undo, the name check ("The name must contain at least one letter or
  digit"), renaming a skill (the file is renamed, its history records it and
  the row gets a version mark), "Create skill with AI" (the generated file is
  shown for review and saved).
- **[bug]** Bold on a whole line selected by a triple click puts the closing
  marks at the start of the next line (`**1. The first thing to do.` /
  `**2. The next thing to do.`), because the selection holds the line break.
  A second click takes the marks off again.
- **[task 2.x]** Wording: the create form is "Create room" with the type
  "Instructions Room"; the breadcrumb of an opened set leads to "AI rooms";
  the first quick action of an empty set is "Create a new file", though it
  opens the New skill form.
- **[design]** The two ways to make a skill name it differently: "New skill"
  keeps the typed name ("QA Pirate hello"), "Create skill with AI" turns the
  typed "QA Haiku" into the file "qa-haiku". The AI form labels its fields
  "Name:" and "Description:" with colons, the Edit skill form without, and
  shows the result as the raw file with its frontmatter in a line-numbered
  editor, not in the Edit skill form.
- **[check]** A new skill set opens with the Info panel on Contacts, though
  the panel was closed before.

### Knowledge bases

- Works: creating a knowledge base, "Upload from storage" (the file is
  copied in), and the indexing state of a file in the opened base: the row
  showed "Indexing" and lost the mark by itself a few seconds later.
- **[task 2.x]** Wording: the create form is "Create room" with the type
  "Knowledge Room".
- **[design]** The form of a knowledge base lets the user set a logo; the
  form of a skill set shows a fixed icon.
- Not checked: a file that fails to index (the "Error" mark, "Try again" and
  the note in Details), and the mark of a base in the list.

### Chat panel in Files

- Works: the panel opens from the header button and from the "AI Chat" tile
  with the Files quick actions; a quick action fills the draft; the reply
  arrives; "AI tools" > "Ask AI" on a file opens the panel with the file
  attached and the file quick actions; Expand and collapse; Edit agent opens
  the form over Files; Agent info opens the Info panel on Details and Context
  (no Content) in place of the chat, and closing it brings the chat back on
  the same agent; closing and reopening the panel returns it to the default
  agent.
- **[spec, task 3.4 gated]** Picking an agent while the chat has messages
  keeps the default agent's conversation on screen under the agent's name.
  `ai-agent-conversations`, "Picking an agent in the chat panel": a new
  conversation starts on the picked agent.
- **[spec, task 3.x gated]** The panel's Chat history on a picked agent lists
  the conversations of the default agent and not the agent's own ("Simple Red
  Circle on White Background" of "QA test agent" is missing).
  `ai-agent-conversations`, "History of an agent".
- **[spec]** Confirmed on a second agent: in the panel the slash menu draws a
  bin on the agent's knowledge base and keeps the model a dropdown; on the
  agent's own page both follow the spec.
- **[bug]** After leaving an opened knowledge base for Files, the Files
  address keeps `type=11`
  (`/rooms/personal/filter?folder=4&…&type=11`).
- **[check]** The reply to the "Find large files" quick action names the
  current location by its internal id ("the current location (id 4)").
- **[design]** The attached file's chip in the panel draft carries the
  room-grid icon, as in the fullscreen chat.

### Session notes

- No console error was recorded during the session, reloads included.
- Chat pickers ("Add files from storage", data sources, "Save as docx") have
  no title and no close button: the breadcrumb root "Apps" stands in the
  title's place. The same selector opened from a knowledge base is titled
  "Select" and has a close button.

## Functional pass, third session (2026-11-17)

The items left unchecked by the second session. Deletions were confirmed by
the feature owner for the test objects only.

### Upload from device

- Works: a file uploaded from the device into an agent's chat becomes a chip
  in the draft, the reply reads it, and Content lists it under Attachments;
  two files uploaded from the device into a knowledge base are listed at
  once.
- **[bug]** After a file is uploaded from the device on an agent's page, the
  page shows the list's filter row (search, filter, sort and view buttons)
  under its header, above the chat, and keeps it until the page is left.
- **[bug]** The conversation started with an uploaded file stays titled "New
  chat" in the history and in Recent; conversations started with text get a
  generated title.
- **[check]** A PDF made of random bytes, uploaded to a knowledge base, gets
  no mark in the list and Status "Indexed" in its Details. No failed file
  could be produced, so the "Error" mark, "Try again" and the failure note
  stay unchecked.

### Conversation actions, agent menu

- Works: Rename (inline, the sidebar follows), Delete (asks "Are you sure you
  want to delete this chat?", the conversation leaves the history and
  Recent), Copy link (notice shown), Pin to top and Unpin (pin mark on the
  row), Disable and Enable notifications (mark on the row).
- **[task 5.3]** Wording of the notices and dialogs: "Room pinned", "Leave
  the room", "You are the owner of this room".
- **[spec]** The agent owner is offered "Leave the room", which opens a
  dialog asking to assign another owner first. `ai-agent-page`, "Actions menu
  of an agent": the owner's menu has no Leave agent.
- **[task 2.1]** "Change room owner" opens a panel titled "Change project
  owner" that says "The new owner must be a Apps admin or a room admin" (the
  Contacts invite menu calls the same type "Full admin").

### Inviting members to an agent

- Works: three test users were added to the portal (a Room admin, a DocSpace
  admin, a User); the agent's invite panel lists portal members only (no
  guests, no groups), offers two roles, and gives a User the role Member by
  itself with an info mark while a Room admin keeps the manager role; "Send
  invitation" added both with the notice "Users invited".
- **[task 2.1]** The roles are named "Project manager" and "Member", with
  descriptions that speak of "the project".
- **[check]** The portal's plan counts the two admin-type test users against
  its limit: the banner "The limit is reached for the number of admins: 3/3"
  is now shown on every page.

### Dark theme

- The agent's page, the slash and "+" menus, a conversation, an opened skill
  set and the Templates tab were seen in the dark theme: nothing unreadable,
  no light patch.
- **[bug]** With a fullscreen chat open in the tab, opening another address
  of the section by URL (the Templates tab, an opened skill set) shows the
  fullscreen chat over that page instead of the page.
  `ai-agent-conversations`, "A reload keeps the open chat", speaks of a
  reload of the same page only.
- **[bug]** Opened by URL right after an opened skill set, the Templates tab
  keeps a room's header: a back arrow, "Agents" as a title with a dropdown
  arrow and a "⋮" menu, and the browser tab title is the bare product name.
- **[spec, task 3.6 gated]** A click in Recent on a conversation of "QA test
  agent" opened it in the fullscreen chat of the default agent ("AI Chat"
  title, model dropdown), not on the agent's page.
  `ai-agent-conversations`, "Opening a conversation of another agent".
- Correction to "Upload from device": the conversation started with an
  uploaded file did get a generated title a few minutes later; only the delay
  differs from conversations started with text. The filter row on the agent's
  page went away after a reload.

### Roles: Agent manager (a Room admin, Member of "QA test agent" as manager)

Signed in at the LAN address as the test Room admin.

- As specified: the Agents list shows only the agent the user is a member of;
  the create button is offered; the agent's page has "Share agent"; no
  conversation of the owner is listed in the history or in Recent; the slash
  menu on the page has a bin on the skill set, none on the knowledge base,
  and the three "Manage ..." rows; "Agent actions" in the Files panel lists
  Edit agent, Share agent and Agent info, without Delete agent; the panel's
  agent menu lists "Default AI agent", the one agent and "Save as new agent".
- Card menu: Select, Open, Pin to top, Disable notifications, Edit room,
  Invite people, Copy link, Download, Room info, Leave the room. Page menu:
  Edit room, Invite people, Copy link, Download, Room info, Leave the room.
  Neither offers change owner or delete, as specified; the wording and the
  order are those of a room (task 5.3).
- **[spec]** In the Files panel the manager's slash menu has "Disconnect
  knowledge base: Contract standards" as well: the bin on a knowledge base
  is drawn for every role there.
- **[check]** The banner about the admin limit is shown to the Room admin
  too, with "contact the Full admin".

### Roles: Member (a User, Member of "QA test agent")

- As specified: the list shows only that agent and offers no create button;
  the page has no "Share agent"; the card menu is Select, Open, Pin to top,
  Disable notifications, Copy link, Download, Room info, Leave the room, and
  the page menu Copy link, Download, Room info, Leave the room (no edit, no
  invite); on the agent's page the slash menu lists the agent's skills with
  no bin and only "Manage sources...", and "+" > Skill sets lists the set
  with no manage row; in the Files panel the agent menu has no "Save as new
  agent" and "Agent actions" holds Agent info only.
- **[spec]** In the Files panel, with the agent picked, the Member's slash
  menu has "Disconnect room", "Manage skill sets...", "Disconnect knowledge
  base: Contract standards" and "Manage knowledge bases...".
  `ai-chat-source-menus`, "Lists of a chat on an agent": Members get no
  remove control and no such row. The controls were not used, so whether
  they change the agent or only the chat on screen is not known.
- **[check]** A User, who may not create agents, sees the Templates tab with
  an Install button on each of the nine cards. Install was not pressed.
- **[check]** The test user, created through the API, is shown a banner
  asking to activate the email on every page.

### Roles: DocSpace admin outside the agent

- As specified: the Agents list shows all ten agents; the card menu has no
  notifications; the agent's page shows the "not a member" view with no Chat
  history, New chat or "Share agent".
- **[spec]** Neither menu offers Delete: the card menu is Select, Open, Pin
  to top, Copy link, Download, Room info, Change room owner, and the page
  menu Copy link, Download, Room info, Change room owner. `ai-agent-page`,
  "Actions menu of an agent" and "Actions menu on a card", give a DocSpace
  admin outside the agent Delete agent.
- **[spec, task 3.5]** The agent menu of the Files chat panel lists all ten
  agents, and the sidebar lists them under Agents, though the admin is a
  member of none. `ai-agent-conversations`, "Only members chat with an
  agent": such an agent is not offered in any agent menu. Picking one was
  not tried.
- **[spec]** On the "not a member" page the title has a dropdown arrow (it
  opens the breadcrumb "AI rooms"); `ai-agent-page`, "Header for a
  non-member", asks for the name as plain text.
- **[task 2.3]** The view reads "You are not a member of this AI project.
  Only project members can chat in it. Ask a Project manager to invite you."

### Delete agent

- **[bug]** After "Delete room" was confirmed on the page of "QA test agent",
  the agent was removed and left the sidebar, but the screen that opened is
  a mix: the title "Agents" with the My agents and Templates tabs and the
  Agents entry selected in the sidebar, over the body of the Rooms section
  (the room type tiles, "All rooms" and "Add group", the room "11"). The
  address is `/ai-rooms/filter?sortBy=DateAndTime&sortOrder=descending`,
  without `type`, and the browser tab reads "Rooms". `ai-agent-page`, "Delete
  agent from its page": the Agents list opens.
- **[task 5.3]** The dialog reads "Delete this room?", 'The room "QA test
  agent" will be permanently deleted', and the notice "Room removed".
- Delete agent from the chat panel was not tried: the only test agent was
  spent on the page.

### Narrow window

- Chrome did not go below 682 px of width, so the phone layout (the lists of
  the "+" menu taking the menu's place) was not reached.
- **[design]** At 682 px the header of an agent's page cuts "Share agent" to
  "Share ag…" and "Try Business" to "Try Busin…", and moves the "⋮" menu to
  the far right, after Chat history and New chat. The slash menu, the list
  in the compact view and the chat itself fit.

### Vectorization off

- Not checked. AI settings > Knowledge base has no switch: vectorization is
  part of the paid "AI agents & tools" service, turned on and off in
  Billing, and billing was not touched.

### Signing in as another user (environment)

- The login app's page does not react on `http://127.0.0.1:8092` (its dev
  build accepts `localhost` and the machine's LAN addresses only), and the
  client stays blank there after an API sign-in, with no console error. A
  second session therefore needs the LAN address
  (`http://192.168.3.6:8092`).

## Not checked

- Delete agent from the chat panel, and the notice of "Agent lost while the
  chat runs on it".
- Change owner to another user (the selector was only opened), a Member
  leaving an agent, removing a member or changing a member's role.
- Picking an agent the user is not a member of, in the panel of a DocSpace
  admin; the bins and "Manage ..." rows a Member gets in the panel.
- Installing a template as a User.
- A file that fails to index, vectorization turned off, the 20 data sources
  limit, a portal without a chat model.
- "Save AI Prompt", Prompts, the web search switch, Effort and Permissions.
- "Save to room…" and the document card (not built).
- The phone layout (below 600 px).

## Left on the portal by the test

- The default agent's chat has the skill sets Budgeting and Contract review
  and the knowledge base Contract standards connected.
- Two new conversations: "Simple addition question: 2+2" and one with
  Contract Reviewer.
- `Cats note.docx` among that conversation's artifacts.

Added by the functional pass (nothing was deleted):

- Agents: "QA test agent" (tag "QA", linked to "Contract review" and
  "Contract standards", one conversation with a generated image) and
  "Formula Helper", installed from its template together with the skill set
  "Spreadsheet formulas" and the knowledge base "Formula reference".
- Skill set "QA skill set" with the skills "QA Pirate hello" and "qa-haiku".
- Knowledge base "QA knowledge base" with a copy of `dogs.docx`.
- Conversations on the default agent: one about the attached `dogs.docx` and
  "Find and Rank Largest Files by Size and Location".
- The connections of the first session (two skill sets, one knowledge base)
  are no longer on the default agent's chat: they did not survive a reload.

After the third session:

- Deleted, as confirmed: the agent "QA test agent" with its conversations,
  and before that one of its conversations.
- Three test users (`qa-roomadmin@example.com`,
  `qa-docspaceadmin@example.com`, `qa-user@example.com`) were created for
  the role checks and deleted afterwards at the feature owner's request;
  their data was reassigned to Administrator, and the banner about the admin
  limit is gone.
- "QA knowledge base" also holds `qa-broken.pdf` (random bytes) and
  `qa-note.txt`.
- Still there from the second session: "Formula Helper" with "Spreadsheet
  formulas" and "Formula reference", "QA skill set" with two skills, the
  conversations on the default agent.
- Restored: the light theme of the owner, notifications and the pin of the
  test agent, the Room admin invite link (switched off again).
