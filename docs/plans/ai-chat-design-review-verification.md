# AI Chat review fixes: browser verification checklist

Instructions for an agent that re-tests the DocSpace AI Chat fixes in a real
browser and confirms or refutes each one. Written 2026-11-18 for branch
`feature/new-ai-concept`. Background, if you need it:

- `docs/plans/ai-chat-design-review-2026-11-17.md`: the original report. "R:"
  below points to its line numbers.
- `docs/plans/ai-chat-design-review-by-repo.md`: the findings by repository.
- `docs/plans/ai-chat-design-review-remaining.md`: what is still open, and the
  owner's decisions.
- `openspec/changes/ai-chat-agents-design/`: the specs, which are the target
  behaviour.

## Rules

- Fix nothing. Do not edit code, specs or these documents. The only file you
  write is the results file (see "Output").
- Use the Chrome browser tools (claude-in-chrome). Do **not** use the
  Playwright MCP browser; the owner forbade it.
- Take a screenshot as evidence for every verdict, and say in one line what it
  shows.
- Do not change portal settings, billing or AI settings. Do not delete anything
  you did not create in this run. Ask the user before anything irreversible
  that the steps do not cover.
- Never type a password that is not a test value you created. The owner signs
  in as the portal owner. See "Roles" for other users.

## Setup

1. Open `http://localhost:8092`, signed in as the portal owner (Administrator).
   `http://127.0.0.1:8092` does not work for the Vite client (check D2). Use
   desktop width (about 1500 px) and the light theme unless a check says
   otherwise.
2. Make sure the running build has the fixes:
   - **Client.** The client dev server (Vite, port 5001 behind nginx at 8092)
     must be restarted after the package updates of 2026-11-18, or it serves
     the old ui-kit and ai-chat from its pre-bundle cache. Quick test: in the
     fullscreen chat's composer, the "+" menu must read "Data Sources" with a
     capital S, and its Skill sets entry must open a grouped skill list. If it
     does not, stop and ask the user to restart the client dev server (if
     needed with Vite's `--force`).
   - **ASC.AI.Chat.** The Node service must run the server repo's
     `feature/new-ai-concept` HEAD. Quick test: check T6 (template install
     refused for a User) or S8 (location named, not by id). If they fail, ask
     the user whether the backend was restarted before marking them refuted.
3. Test data already on the portal:
   - Agents: "Contract Reviewer" (linked to the skill set "Contract review" and
     the knowledge base "Contract standards"), and "Formula Helper", installed
     from a template with "Spreadsheet formulas" and "Formula reference".
   - Skill sets: "Budgeting", "Contract review", "Spreadsheet formulas", and
     "QA skill set" with the skills "QA Pirate hello" and "qa-haiku".
   - Knowledge bases: "Contract standards", "Formula reference", and "QA
     knowledge base" with `dogs.docx`, `qa-broken.pdf` and `qa-note.txt`.
   - A custom room named "11".
   - You may create your own agent for destructive checks (call it "QA verify
     agent"), and delete it at the end.
4. Small files for uploads, if you need them:
   - `/private/tmp/claude-501/-Users-fognir-GitHub-DocSpace-client/0674c61a-fdbf-4b23-b877-bd4648a619e8/scratchpad/upload/`
     holds `qa-upload.md`, `qa-note.txt`, `qa-broken.pdf` and `qa-wrong.png`.
   - The scratchpad may be gone. If so, create equivalent files in your own
     scratchpad.
5. URLs:
   - Agents: `/ai-rooms/filter?type=12&searchArea=AiHub`
   - Skill sets: `type=10`
   - Knowledge bases: `type=11`
   - An opened room: `/ai-rooms/{id}/filter?folder={id}`
   - Files: `/rooms/personal`

## Roles

Some checks need other users: a Room admin made Agent manager of your test
agent, a User made Member of it, and a DocSpace admin who is a member of no
agent.

1. Create them from the owner's session with `POST /api/2.0/people`. Use type
   1 for the Room admin, 3 for the DocSpace admin and 4 for the User. Give
   them `@example.com` e-mails and a generated test password.
2. Save the password in your own scratchpad, not in the chat or the results.
3. A second session cannot share the owner's cookie on `localhost`. Sign the
   test user in on the LAN address `http://192.168.3.6:8092`. If your rules do
   not let you enter the password there, ask the user to sign in, and wait.
4. Invite the Room admin and the User to "QA verify agent" through "Share
   agent".
5. At the end, ask the user before you delete the test users. To delete one,
   disable it first, then use the row menu "Delete user" in Contacts.

## Output

Write `docs/plans/ai-chat-design-review-verification-results.md` (do not
commit it). It has:

- A summary table: ID, verdict, one-line evidence.
  - **CONFIRMED**: the fix works as expected.
  - **REFUTED**: it does not; say what happens instead.
  - **PARTIAL**: say which part fails.
  - **BLOCKED**: say why: missing data, a role you could not get, or a server
    not restarted.
- A "New issues" section for defects you meet that no check covers, with
  steps and the page.
- A "Not checked" section.

Report in English. Keep the IDs below.

## What not to report as a defect

These are decided, or wait for C# work by another developer. Mention one only
if it behaves differently from what is described here.

- **Spec over board (owner's decision):**
  - the chat panel's "⋮" menu is Edit agent, Share agent, Agent info, Delete
    agent;
  - the panel header has history, new chat, agent actions, expand and close;
  - the fullscreen "AI Chat" title keeps its menu arrow;
  - the agent's Info panel tabs are Details, Context, Content;
  - the Templates categories are a row of tabs;
  - the fullscreen chat has no address of its own;
  - skills are listed by file name.
- **Product-wide components kept as they are:**
  - table headers cut with an ellipsis;
  - the room type shown as a tag on tiles;
  - no red Delete;
  - a back arrow on opened rooms;
  - full-width side panel footer buttons;
  - underlined tabs over the Agents list;
  - initials on new agents;
  - centred Info panel tabs;
  - the Metadata tab;
  - the item title repeated on every Info panel tab;
  - Last modified by, Tags and Comments rows in Details;
  - dates with the time;
  - "Me" in the Owner column;
  - no file extensions;
  - the view switch in every list, and one view choice for all lists;
  - the "Try Business" badge.
- **Waits for C# (expected still open):**
  - no Delete agent for a DocSpace admin outside the agent;
  - a file with no text is marked Indexed, so the Error states cannot be
    produced;
  - no agent description;
  - no "Used by" or "Last indexed";
  - a conversation of an agent cannot be opened from Recent on its agent
    (Recent lists the conversations of no agent);
  - no "Already added" on a template;
  - sources are remembered per browser, not on the server;
  - a member through a group misses the agent in menus.

---

## Checks

### A. Agent page

- **A1. Header order** (R: 131-133). Open an agent you are a member of.
  - Expected: the header reads the name (with the agent menu arrow), Chat
    history, New chat, "⋮", Share agent, in this order. "Try Business" stays at
    the far end.
  - Was: name, "⋮", Share agent, with Chat history and New chat at the far
    right.
- **A2. Header at a narrow width** (R: 615-618). Resize the window to about 682
  px (or the narrowest Chrome allows).
  - Expected: the controls keep that order right after the title. The title
    is cut first, and "Share agent" is not cut.
  - Was: "Share ag…", and "⋮" moved to the far right.
- **A3. No filter row after a device upload** (R: 471-473, 529-530). On the
  agent page, attach a file from the device in the composer and send it.
  - Expected: no Files filter row (search, filter, sort, view) appears between
    the header and the chat.
- **A4. Non-member title** (R: 590-592). As the DocSpace admin outside the agent
  (Roles), open the agent's URL.
  - Expected: the name is plain text, with no dropdown arrow and no
    breadcrumb popup.
- **A5. Empty state labels** (R: 137-138). Open an agent with no conversation
  yet, or start a new chat on the agent page.
  - Expected: the source groups read "Skill sets" and "Knowledge bases".
- **A6. "Not a member" text** (R: 593-594). As the outside DocSpace admin.
  - Expected: "You are not a member of this agent" and "Only members of the
    agent can chat with it. Ask an Agent manager to invite you."
- **A7. Info panel stays open** (R: 66-67). On the Agents list, open the Info
  panel, open an agent, then go back to the list.
  - Expected: the Info panel is still open. It can also be opened beside the
    agent's chat.
- **A8. Agent logo and "created by"** (tasks 8.1-8.5). On an agent page, ask for
  something that creates a document, for example "Create a short docx about
  cats".
  - Expected: every reply starts with the agent's logo, a 24 px tile.
  - Expected: the created document appears as a card under the tool call,
    with its type icon, its name and "created by <agent name>". A click opens
    it. The card has "Save to room...".
  - On the default agent, replies have no logo and cards have no "created by"
    line.

### M. Agent menus and dialogs

- **M1. Menu wording and order** (R: 134-136, 380-381, 543-547). Open the "⋮" on
  the agent page and on its card, as the owner.
  - Expected order: select and open (card only), separator, then Edit agent,
    Share agent, Agent info, Pin, Notifications, Copy link, Change agent
    owner; then a separator and Delete agent.
  - Expected: no Download and no "More options" fold.
  - Repeat as the Agent manager: same labels, with no Change owner and no
    Delete unless the rights allow them.
- **M2. No Leave for the owner** (R: 490-492). As the owner.
  - Expected: no "Leave agent" in either menu. The Agent manager has "Leave
    agent".
- **M3. Pin notice** (R: 488-489). Pin, then unpin an agent.
  - Expected: "Agent pinned" and "Agent unpinned", not "Room pinned".
- **M4. Leave dialog** (R: 488-489). As the Agent manager, choose Leave agent,
  then cancel.
  - Expected: the dialog speaks of an agent ("Leave agent").
- **M5. Delete dialog and redirect** (R: 598-607). On your own "QA verify agent"
  page, choose Delete agent and confirm, ticking the checkbox if one is shown.
  - Expected: the dialog says agent ("Delete this agent?", with the agent
    named).
  - Expected: the notice is "Agent removed".
  - Expected: the Agents list opens (title Agents, tabs My agents and
    Templates, agent cards) at `/ai-rooms/filter?...type=12...`, with the tab
    title "Agents". It must not show the Rooms body (room type tiles, "All
    rooms").
  - Do this last for that agent, or recreate the agent afterwards.
- **M6. Change owner wording** (R: 493-495). Choose Change agent owner, then
  close the panel without changing anything.
  - Expected: the item and the panel title read "Change agent owner".
  - Expected: the note reads "The new owner must be a Full admin or a Room
    admin. Users and guests cannot own an agent." It must not contain "Apps
    admin".

### P. Chat panel on a picked agent (Files or a room)

- **P1. Sources manager per role** (R: 46-49, 441-443, 548-550, 564-569). In
  Files, open the chat panel and pick "QA verify agent" in the title menu. Type
  "/" in the composer.
  - Owner or Agent manager: skill set rows may have bins. Knowledge bases have
    no bin. "Manage skill sets..." and "Manage knowledge bases..." open the
    agent's edit form.
  - Member: no bins on skill sets or knowledge bases, and no "Manage ..." rows
    for them. Data sources stay the user's own, with a bin.
- **P2. Model is read-only** (R: 50-53). Look at the model control while an agent
  is picked in the panel.
  - Expected: a label, not a dropdown, for every role. Picking the default
    agent makes it a dropdown again.
- **P3. Scoped history** (R: 433-440).
  1. On the default agent, send a message in the panel.
  2. Pick an agent.
     - Expected: a new empty conversation starts on the agent; the old
       messages are not shown under the agent's name.
  3. Open Chat history.
     - Expected: only that agent's conversations.
  4. Pick the default agent again.
     - Expected: a new conversation again.
- **P4. Suggestion chips** (R: 111-112). With an empty chat, pick an agent.
  - Expected: suggestion chips still show: the agent's own suggestions, or the
    section's.
- **P5. Editing the picked agent updates the panel**. With an agent picked, as
  the owner, open its edit form from "Manage skill sets...", change its skill
  sets and save.
  - Expected: the panel's chat follows: the new sets are connected, and the
    conversation stays.
- **P6. Membership in the agent menus** (R: 585-589). As the outside DocSpace
  admin, open the panel's title menu and look at the sidebar's Agents.
  - Expected: only agents they are a member of (possibly none). As the owner,
    every agent the owner is a member of is listed, even beyond 100.
- **P7. Escape on the agent menu** (R: 74-76). Open the title menu with a mouse
  click and press Escape once.
  - Expected: the menu closes on the first Escape.
  - Open it again and click a button elsewhere on the page. Expected: the
    menu closes and that button acts in the same click.

### F. Fullscreen chat

- **F1. Tab title** (R: 64-65). Open AI Chat (fullscreen) from the sidebar.
  - Expected: the browser tab title reads "AI Chat - <product>", and returns to
    the page's title when the chat closes.
  - The address stays the Agents list by decision.
- **F2. No chat over another page** (R: 515-519). With the fullscreen chat open,
  type the Templates tab's URL (or a skill set's URL) into the same tab.
  - Expected: that page opens, not the chat. Then reload while the chat is
    open on its own page: the chat comes back.
- **F3. History does not follow you** (R: 71-72). Open Chat history in the
  fullscreen chat, close the chat, then open an agent page and a room's chat
  panel.
  - Expected: both show the chat, not the history list.

### S. Sidebar, navigation, server replies

- **S1. Highlight by short address** (R: 68-70). Open `/ai-rooms/{skillSetId}/filter?folder={skillSetId}`
  without `type`, and the same for a knowledge base.
  - Expected: the sidebar highlights Skill sets or Knowledge bases, not Agents.
- **S2. Recent on an agent's page** (R: 57-60). Open an agent page and look at
  Recent.
  - Expected: it lists the conversations that belong to no agent, the same as
    on other pages, and not only the agent's.
- **S3. "Recents"** (R: 98). Expected: the sidebar group reads "Recents".
- **S4. Collapsed sidebar** (R: 275-277). Collapse the sidebar.
  - Expected: AI Chat, Agents, Recents, Skill sets, Knowledge bases, with no
    icon per agent or per conversation. Skill sets and Knowledge bases are
    reachable at a window height of 900 px without scrolling.
- **S5. No `type=11` in Files** (R: 444-446). Open a knowledge base, then go to
  Files from the sidebar.
  - Expected: the Files address has no `type=` and no `tab=`.
- **S6. Templates after a skill set** (R: 520-522). Open a skill set, then type
  the Templates tab URL.
  - Expected: the Agents header (title, tabs) without a back arrow or room
    menu, and the tab title "Agents".
- **S7. New conversation title with a file** (R: 474-476, 527-529). Start a new
  conversation by attaching a file from the device with a short text.
  - Expected: a real title replaces "New chat" in history and Recents within
    seconds, not minutes.
- **S8. Location named** (R: 447-448). In Files (My documents), run the quick
  action "Find large files".
  - Expected: the reply names the location by its name ("My documents"),
    never as "id 4".

### C. Composer: "+" menu and slash menu

- **C1. "+" menu opens upward** (R: 73). In an empty fullscreen chat (composer in
  the upper half), open "+".
  - Expected: the menu opens above the input and does not cover it.
- **C2. Escape, then click** (R: 304-306). Open "+", press Escape, click in the
  input and type.
  - Expected: the text lands in the input.
- **C3. "+" > Skill sets** (R: 82-84).
  - Expected: a level with the caption "Skill sets" and its hint, each set as
    a group listing its skills, and a bin per set (default agent).
  - Expected: a click on a skill adds `/skill-name` to the draft, and a second
    click removes it. The menu stays open.
  - Expected: the list ends with "Manage skill sets..." in the link colour,
    with a gear icon and no separator.
- **C4. "+" > Knowledge bases** (R: 85-89). Connect a knowledge base first.
  - Expected: flat rows, each with a remove control ("Remove <name>") that
    removes it without closing the menu.
  - Expected: it ends with "Manage knowledge bases..." (link colour, gear, no
    separator).
  - Inside an agent's chat: no remove control, and the Manage row only for
    those who may edit the agent.
- **C5. "+" > Data Sources** (R: 90-91, 286-289).
  - Expected: the entry reads "Data Sources" with a sliders icon.
  - Expected: each connected room or folder is one flat row with a room or
    folder icon and a "Remove <name>" control, with no further level.
  - Expected: it ends with "Manage sources...".
- **C6. Menu density** (R: 183-185).
  - Expected: "+" rows are about 36 px high and semibold; sub-list rows are
    about 32 px.
- **C7. Slash menu: room or folder** (R: 290-291). Connect the room "11" as a
  data source, then type "/".
  - Expected: the room has the room icon, and its bin reads "Disconnect room".
    A folder keeps the folder icon and "Disconnect folder".
- **C8. Slash menu size** (R: 92-95). Expected: the whole list shows, up to about
  560 px or 60% of the window height. The gap above the input is about 10 px.
  The "Manage ..." rows have a gear icon.
- **C9. Sources survive a reload** (R: 281-285, 338-339). On the default agent,
  connect a skill set, a knowledge base and the room "11" to a new chat, send
  one message, and reload.
  - Expected: all three are still connected, both in "+" and in "/".
  - Expected: after "Save as new agent" from such a chat, the new agent has
    the skill sets.
- **C10. Data source picker** (R: 292-298).
  - Open "Manage sources...". Expected: the selector has a title and a close
    button; the root crumb is not standing in for the title.
  - Expected: no AI section with Instructions or Knowledge rooms.
  - Expected: Select stays disabled until something is ticked.
  - Expected: Files and Forms have different icons.
  - Expected: the first level reads "AI Chat" if an AI entry appears at all,
    never "AI Workspace".
- **C11. Other chat pickers** (R: 320-321, 455-458). "Add files from storage"
  and "Save as docx" from a reply.
  - Expected: each has a title ("Select files" or "Select folder") and a
    close button.
- **C12. Room picker titles** (R: 96-97). Expected: the composer's skill set
  picker is titled "Skill sets", and the knowledge picker "Knowledge bases".

### MSG. Messages

- **MSG1. Attachments inside the bubble** (R: 315-317). Send a message with an
  image and a document attached.
  - Expected: both appear inside the bubble, under the text. The image is a
    preview of about 240 px with its name. The document is a chip with its
    file-type icon, not the rooms-grid icon. The same holds in the chat panel
    draft.
- **MSG2. Generated image card** (R: 349-352). Ask for an image, for example
  "draw a red circle".
  - Expected: a card (at most about 420 px wide) with the picture, "<name> ·
    generated", Download and "Save to room...".
  - Expected: "Save to room..." opens a folder selector ("Select folder") and
    copies the image there.
  - Expected: the chat scrolls to show the reply under the image.
- **MSG3. Message menu case** (R: 318-319). Open the user message's menu.
  - Expected: "Save AI prompt" and "Save AI prompt to folder", both in
    sentence case.
- **MSG4. Auto approve** (R: 361-362). Set Permissions to "Auto approve" and ask
  for a document.
  - Expected: the document tool runs without a confirmation.
  - With "ask", it still asks.

### IP. Info panel of an agent, a skill set or a skill

- **IP1. Model row** (R: 144-145, 358-360). Expected: the Details of every agent
  show a Model row, including "Contract Reviewer" (portal model) and on the
  agent's own page.
- **IP2. Type** (R: 144). Expected: Type reads "AI agent", not "AI project".
- **IP3. Context Manage rows** (R: 147-148). As the owner or Agent manager.
  - Expected: Skill sets ends with "Manage skill sets..." and Knowledge bases
    with "Manage knowledge bases...". Each opens the agent form.
  - A Member sees neither.
  - Linked knowledge bases and skill sets show the grey knowledge base and
    skill set icons, not coloured logos.
- **IP4. Content row menu** (R: 149-151). On the agent page's Content tab,
  open a file row's "⋮".
  - Expected items: Download, "Save to room..." (opens the copy panel) and
    "Open location" (opens the folder the file is in).
- **IP5. Skill Details** (R: 54-56). Select a skill inside "QA skill set".
  - Expected: Details show Skill set and Command (for example `/qa-haiku`),
    not File extension, Size, Versions or Comments.
- **IP6. Skill icons in a set's Details** (R: 160). Select "QA skill set".
  - Expected: each listed skill has the skill icon.
- **IP7. Empty Info panel text** (R: 116-117). With nothing selected, open the
  Info panel on Agents, Skill sets and Knowledge bases.
  - Expected: a text about agents, skill sets or knowledge bases, not "See
    rooms details here".

### W. Agent form, Save as new agent, invite panel

- **W1. Agent form wording** (R: 332-334, 373). Open "New agent" and Edit agent.
  - Expected titles: "Create agent" / "Edit agent".
  - Expected: the name field reads "Agent name"; the skill set block "Skill
    sets"; the owner row "Agent owner".
  - Expected: the hints speak of an agent, not a project.
- **W2. Enter in Tags** (R: 335-337). In the agent form, type a tag name in Tags
  and press Enter.
  - Expected: the tag is added, and the form stays open and unsaved.
- **W3. Save as new agent** (R: 329-331). In a default-agent chat, choose "Save
  as new agent".
  - Expected: the dialog title is "Save as new agent", pre-filled with "New
    agent". After saving, the notice reads `Agent "<name>" saved`.
- **W4. Invite panel wording** (R: 373-376, 504-505). Open Share agent.
  - Expected: the roles read "Agent manager" and "Member". The descriptions
    and the sources access text speak of the agent. The manual invite hint
    reads "Add existing members to the agent."
- **W5. No invitation link** (R: 382-384). Expected: the agent's invite panel
  has no "Invite via link" section. A normal room still has it.
- **W6. Remove control on room chips**. In the agent form, hover the cross on a
  linked room chip. Expected: its title reads "Remove <room name>".

### L. Agents list and wording

- **L1. Create button** (R: 116-117, 155, 173). Expected: "New agent" on Agents,
  and "New" on Skill sets and Knowledge bases, never "New room". Check the
  filter-row button, the header's plus title and the empty view.
- **L2. Category row** (R: 371-372). Tag "QA verify agent" with "QA" (Edit
  agent > Tags).
  - Expected: a row under the filter: All, then QA (and other tags). Choosing
    QA narrows the list and adds the tag to the address. A reload keeps it.
- **L3. Card** (R: 118-121).
  - Expected: a Category row with the first tag.
  - Expected: a chat button that opens the agent page, for members only.
  - Expected: skill sets and knowledge bases one per line with icons, "+N"
    after two, and a dash when there are none.
  - Expected: the "Knowledge bases" label is not cut, and all cards are the
    same height.
- **L4. Two columns** (R: 120-121). At 1500 px the agent cards are laid out in
  two wide columns.
- **L5. No Type sort** (R: 380-381). Expected: the sort menu of the three AI
  lists has no Type.
- **L6. Create forms** (R: 398-399, 416-417). On Skill sets choose New.
  - Expected: titled "Create skill set", type "Skill set", a fixed skill set
    icon.
  - Same on Knowledge bases: "Create knowledge base", "Knowledge base", a fixed
    knowledge base icon, and no logo or cover editor.
- **L7. Home card** (R: 181-182). On Home, the AI Chat card's description
  speaks of a skill set, a knowledge base and an agent.

### T. Templates tab

- **T1. Selection into the Info panel** (R: 125-126). Click a template card with
  the Info panel open.
  - Expected: Details with its description, Owner, Type "Template", Category
    and "Add to my agents".
  - Expected: Context lists what it brings.
  - A click between the cards clears the selection.
- **T2. Card menu and tick** (R: 127). Expected: a "⋮" with "Add to my agents"
  (or Install) and Info. The green verified tick sits beside the name.
- **T3. Install confirmation** (owner's decision). Click Install, then Cancel.
  - Expected: a confirmation names the template and what it creates. Cancel
    creates nothing.
  - Confirm on a small template.
  - Expected: while it installs, Install, the menu item and "Add to my agents"
    are disabled, and a second click does nothing. Then the notice and the My
    agents tab.
  - Delete what you installed afterwards (ask the user first).
- **T4. Category tag on install** (R: 371-372). Expected: the installed agent
  has its template's category as a tag. It shows on the card's Category row
  and in the category row.
- **T5. Search at 1000 px** (R: 273-274). Expected: at about 1000 px wide, the
  search field is not drawn under the tabs.
- **T6. User cannot install** (R: 570-571). As the User (type 4), open
  Templates.
  - Expected: the cards and the Info panel show, but there is no Install icon,
    no menu item and no "Add to my agents".
  - Optional: `POST /api/2.0/ai/templates/install` from the User's session
    returns 403.

### SK. Skills

- **SK1. Bold on a triple-clicked line** (R: 394-397). In Edit skill, triple-click
  a line and press Bold.
  - Expected: `**line**` on that line, not `**` at the start of the next line.
    Pressing Bold again removes the marks.
- **SK2. Edit skill is a modal** (R: 161-163). Expected: Edit skill and View
  instructions open as centred modal dialogs, not side panels.
- **SK3. Monospace editor** (R: 164-165). Expected: the instructions editor uses a
  monospace font.
- **SK4. Create skill with AI** (R: 402-407). Run it with the name "QA Verify
  skill".
  - Expected: the result shows in the Edit skill fields (name with its
    command, description, instructions), not as a raw file with frontmatter
    and line numbers.
  - Expected: the labels have no colons.
  - Expected: after saving, the file is named "QA Verify skill.md" and the
    command is `/qa-verify-skill`.

### SS. Skill sets list and an opened skill set

- **SS1. Use in chat on a set** (R: 156-157, task 7a.7). On the Skill sets list,
  click a row's "Use in chat" icon. There is no copy-link icon in its place.
  - Expected: a new fullscreen chat on the default agent with only that set
    connected.
- **SS2. Use in chat on a skill**. Inside "QA skill set", click "Use in chat" on
  "qa-haiku".
  - Expected: the same, and the composer already holds `/qa-haiku `, ready to
    type after.
- **SS3. Breadcrumb** (R: 399-400). Expected: inside a skill set, the crumb and
  the back arrow lead to "Skill sets", not "AI rooms" or Agents. The same holds
  for a knowledge base ("Knowledge bases").
- **SS4. Empty set quick action** (R: 400-401). Create a skill set "QA verify
  set".
  - Expected: the first quick action reads "New skill".
  - Expected: the Info panel does not open on Contacts by itself (R: 408-409).

### KB. Knowledge bases

- **KB1. Add files button** (R: 173-174). Inside a knowledge base the create
  button reads "Add files".
- **KB2. Icons** (R: 169-170). Expected: the Knowledge bases list shows a grey
  knowledge base icon, not coloured initials, in the table, compact and tile
  views.

### V. Tile and compact views

- **V1. Tiles of skill sets and knowledge bases** (R: 251-253).
  - Skill set tiles: Skills count, Owner, Last modified.
  - Knowledge base tiles: Owner, Last modified and the indexing badge.
- **V2. Skill tiles** (R: 254-255). Inside a skill set in tiles: each skill shows
  its `/command` and description, not a generic thumbnail.
- **V3. Compact rows** (R: 268-272).
  - Agents: owner and date.
  - Skill sets: "Skills: N", owner and date.
  - Knowledge bases: owner, date and status.
  - Skills: description and date.
  - Knowledge base files: size, added by and date.

### D. Dev environment

- **D1. Login on 127.0.0.1** (R: 628-632). Open `http://127.0.0.1:8092/login`.
  - Expected: the login page reacts (the form works).
- **D2. Vite client on 127.0.0.1**. Known open: the client was blank there.
  Only record what you see.

### LOC. Translations, spot check

- **LOC1.** Switch the owner's language to Russian (Profile), check a few new
  strings, then switch back to English:
  - "+" > Data Sources (English only in the library is fine);
  - "Manage skill sets...";
  - the agent menu (Edit agent, Leave agent);
  - "Use in chat";
  - the template install confirmation;
  - "Agent pinned";
  - Recents;
  - the create forms.

  Expected: Russian text with the agent and skill set wording, and no English
  fallbacks or raw keys.

## Cleanup

- Delete the conversations, "QA verify agent", "QA verify set", "QA Verify
  skill" and the templates you installed, after asking the user.
- Delete the test users, after asking the user (see "Roles").
- Restore the owner's language, theme and any setting you changed.
- List in the results what you left on the portal.
