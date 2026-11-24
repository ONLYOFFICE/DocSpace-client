# AI Chat review fixes: browser verification results

Run on 2026-11-18 against `http://localhost:8092`, following
`docs/plans/ai-chat-design-review-verification.md`. Browser: Chrome through the
claude-in-chrome tools (no Playwright).

## Environment

- Client: Vite dev server restarted with a fresh pre-bundle cache
  (`deps v=615fe2ee`). Before the restart the stand served the 16 Nov cache
  (`v=98ade068`) and `/ai-rooms` crashed with
  "aiChatStore.setChatAgent is not a function".
- Server: the pulled `feature/new-ai-concept` did not start: the migration
  runner failed on `Duplicate column name 'artifacts_folder_id'` (the local
  database has the older `20261113131013_MigrationContext_Upgrade107`, the code
  has the regenerated `20261117115750_MigrationContext_Upgrade108`). The run
  used the local branch `local/new-ai-concept-without-pull`: the state before
  the merge `7970f5f7ac` plus the owner's commits `401c0e44d4` and
  `f929331b09`. ASC.AI.Chat is identical to `feature/new-ai-concept`.
- Viewport: the browser page zoom is 90 %, so the layout width was 1666 CSS px
  (896 px high) instead of 1500 px; the window could not be resized after the
  first call. Narrow widths (682, 520 and 1000 px) were checked by loading the
  page in a same-origin iframe of that width.
- Roles: three users created with `POST /api/2.0/people`
  (`qa-verify-roomadmin@`, `qa-verify-docspaceadmin@`, `qa-verify-user@`
  `example.com`, types 1, 3 and 4). They were signed in one at a time on
  `http://192.168.139.3:8092` by the owner (password pasted from the
  clipboard). Room admin = Agent manager and User = Member of "QA verify agent".
- Light theme for the owner; the test users' sessions came up in the dark
  theme (their own default).

## Summary

90 checks: 81 CONFIRMED, 7 PARTIAL, 2 REFUTED, 0 BLOCKED.

| ID | Verdict | Evidence |
|----|---------|----------|
| A1 | CONFIRMED | Contract Reviewer header: back, logo + name ▾, Chat history, New chat, "⋮", Share agent; "Try Business" at the far right. |
| A2 | CONFIRMED | 682 px iframe: order kept right after the title, neither title nor "Share agent" cut, "⋮" not moved. (At 520 px the mobile layout drops Share agent, as for rooms.) |
| A3 | CONFIRMED | QA verify agent page: qa-note.txt attached from the device and sent with text; no filter row appeared, reply "Biscuit" under the QA logo. |
| A4 | CONFIRMED | DocSpace admin outside the agent: title "QA verify agent" plain, no arrow, a click opens nothing. |
| A5 | CONFIRMED | Empty state of Contract Reviewer reads "Skill sets" / "Knowledge bases". |
| A6 | CONFIRMED | Outsider sees "You are not a member of this agent" / "Only members of the agent can chat with it. Ask an Agent manager to invite you." |
| A7 | CONFIRMED | Info panel open on Agents → agent page (panel beside the chat, Details/Context/Content) → back: panel still open. |
| A8 | CONFIRMED | Agent reply starts with a 24×24 "CR" tile; card "cats.docx · created by Contract Reviewer" opens the editor (fileId 95), "Save to room..." opens "Select folder". Default agent: no logo, card "short_dog_overview.docx" without "created by". |
| M1 | CONFIRMED | Owner card: Select, Open \| Edit agent, Share agent, Agent info, Pin to top, Disable notifications, Copy link, Change agent owner \| Delete agent. Owner page: Edit, Share, Agent info, Copy link, Change agent owner \| Delete agent (no Pin/Notifications on the page, as `ai-agent-page` "Actions menu of an agent" specifies). Agent manager: same labels, no Change owner/Delete. No Download, no "More options". |
| M2 | CONFIRMED | Owner has no "Leave agent" in either menu; Agent manager has it on card and page. |
| M3 | CONFIRMED | Notices captured: "Agent pinned", "Agent unpinned". |
| M4 | CONFIRMED | Manager: dialog "Leave agent", "Do you really want to leave this agent? You will be able to join it again via new invitation by an agent admin." (note: "agent admin", not "Agent manager"); cancelled. |
| M5 | CONFIRMED | "QA verify agent 2": "Delete this agent?" naming the agent, checkbox; notice "Agent removed"; Agents list at `/ai-rooms/filter?type=12…`, tab title "Agents", no Rooms body. |
| M6 | CONFIRMED | Item and panel "Change agent owner"; note "The new owner must be a Full admin or a Room admin. Users and guests cannot own an agent.", no "Apps admin". |
| P1 | CONFIRMED | Owner/manager in "/": skill sets with bins, knowledge base without, "Manage ..." rows; "+" Manage rows and slash "Manage knowledge bases..." open Edit agent, slash "Manage skill sets..." opens the Skill sets picker (spec `ai-chat-source-menus` names only the "+" rows and slash KB row). Member: no bins, no Manage rows, only "Manage sources...". |
| P2 | CONFIRMED | Agent picked: model is a plain label for owner, manager and member; default agent: "Claude Sonnet 5.5 ▾" dropdown again. |
| P3 | CONFIRMED | Room 11 panel: default message → pick QA verify agent: new empty conversation; history lists only "Identifying a cat's name from an attached note"; default again: new conversation. |
| P4 | CONFIRMED | Room chips ("Summarize room" …) still shown after picking the agent. |
| P5 | CONFIRMED | Adding QA skill set and then removing it in Edit agent + Save: the panel's "/" follows each time, conversation "ready" stays. |
| P6 | CONFIRMED | Outsider: title menu only "Default AI agent" + "Save as new agent", no agents in the sidebar. Owner: all 9 agents in a scrolling list. |
| P7 | CONFIRMED | Title menu (mouse) closes on the first Escape; open again + click the room's view switch: menu closes and the view switches in the same click. |
| F1 | CONFIRMED | Tab title "AI Chat - ONLYOFFICE" while open, "Agents - ONLYOFFICE" after closing. |
| F2 | CONFIRMED | Fullscreen chat open, typed `/ai-rooms/45/…` → QA skill set opens; typed Templates URL → Templates; reload with the chat open → chat returns. |
| F3 | CONFIRMED | History open in fullscreen → close → agent page shows the chat; room 11 panel shows the chat with chips. |
| S1 | CONFIRMED | `/ai-rooms/45/filter?folder=45` highlights Skill sets, `/ai-rooms/46/…` highlights Knowledge bases. |
| S2 | CONFIRMED | Agent page Recents = the same no-agent conversations as elsewhere; the agent's new conversation not added. |
| S3 | CONFIRMED | Sidebar group "Recents". |
| S4 | CONFIRMED | Collapsed: Home, Files, Rooms, Forms, Private, AI Chat, Agents, Recents, Skill sets, Knowledge bases; no per-agent icons; all visible at 896 px. |
| S5 | CONFIRMED | KB → Files: `/rooms/personal/filter?folder=4&page…&sortby…&sortorder…`, no `type=`/`tab=`. |
| S6 | CONFIRMED | Skill set → typed Templates URL: Agents title and tabs, no back arrow/room menu, tab title "Agents". |
| S7 | CONFIRMED | New default chat with image + md + text: Recents "Describing a markdown file and a red image" within 3 s; agent chat with a file titled "Identifying a cat's name…". |
| S8 | CONFIRMED | Files panel "Find large files": table Location "Files", no "id 4". |
| C1 | PARTIAL | Menu opens upward (top 490) but its bottom (750) overlaps the input line (708–745). The empty fullscreen composer sits at the bottom, so "composer in the upper half" never occurs. |
| C2 | CONFIRMED | "+" → Escape → click in input → typed text lands in the textarea. |
| C3 | CONFIRMED | Caption "SKILL SETS" + hint, group Budgeting with skills and a bin; click adds `/budget-builder `, second click removes; menu stays; "Manage skill sets..." blue, gear, no separator. |
| C4 | CONFIRMED | Default agent: flat row "QA knowledge base" with "Remove QA knowledge base", removed without closing the menu; Manage row blue/gear. Agent chat: no remove; Manage row for owner/manager only, none for the member. |
| C5 | CONFIRMED | "Data Sources" with sliders icon; "11" flat row, room icon, "Remove 11"; "Manage sources...". |
| C6 | CONFIRMED | "+" rows 36 px, weight 600; sub-list rows 32 px. |
| C7 | CONFIRMED | Room "11" in "/": room icon, bin "Disconnect room: 11" (title "Disconnect room"). Folder half not checked (see below). |
| C8 | CONFIRMED | Whole list shown (298 CSS px, no scroll), gap above the composer ≈10 px, gear on every "Manage ..." row. |
| C9 | CONFIRMED | Budgeting + QA knowledge base + room 11, one message, reload: all three in "+" and "/"; "Save as new agent" → agent has Budgeting and QA knowledge base. |
| C10 | CONFIRMED | "Select" title + close; root "Apps" with Files, Rooms, Forms (no AI section); Select disabled until "Select (1)"; Files and Forms icons differ. |
| C11 | CONFIRMED | "Add files from storage" → "Select files" + close; reply "Save as docx" → "Select folder" + close + File name. |
| C12 | CONFIRMED | Pickers titled "Skill sets" and "Knowledge bases". |
| MSG1 | PARTIAL | Image (240×240 preview + name) and document inside the bubble under the text, same in the panel draft; but the document chip shows the Word "W" icon for `.md` and `.txt`, not their own file-type icon. |
| MSG2 | CONFIRMED | Card 420 px (max-width 420), "generated_image_2026-11-18_18-16-41.png · generated", Download, "Save to room..." → "Select folder" → "…successfully copied to Files"; chat scrolled to the reply. |
| MSG3 | CONFIRMED | User message menu: "Save AI prompt", "Save AI prompt to folder". |
| MSG4 | CONFIRMED | Auto approve (the stand's value): document tool ran without a prompt; "Ask every time": Confirmation for `document_agent` shown. Restored to Auto approve. |
| IP1 | CONFIRMED | Model row on the list (Contract Reviewer "Claude Sonnet 5.5", Budget Planner "GPT 6 Luna") and on the agent page. |
| IP2 | CONFIRMED | Type "AI agent". |
| IP3 | CONFIRMED | Owner and manager: "Manage skill sets..." / "Manage knowledge bases..." open Edit agent; member: no Manage rows; grey book (skill set) and document (KB) icons. |
| IP4 | PARTIAL | Content row menu: Download, "Save to room...", "Open location". "Open location" stays on the agent chat (`folder=34`) and only shows the file in the Info panel; the file is in folder 54 "<thread>-artifacts", which is never opened. The copy panel is titled "Select" with crumbs "Apps > AI rooms > Contract Reviewer". |
| IP5 | CONFIRMED | qa-haiku Details: Skill set, Owner, Command `/qa-haiku`, dates, View instructions; no extension/size/versions/comments. |
| IP6 | CONFIRMED | QA skill set Details > Skills: qa-haiku `/qa-haiku`, QA Pirate hello `/qa-pirate-hello`, skill icon. |
| IP7 | CONFIRMED | "See AI agents details here", "See skill set details here", "See knowledge base details here". |
| W1 | CONFIRMED | "Create agent" / "Edit agent", "Agent name:", "Skill sets", "Agent owner"; hints speak of the agent/chat, no "project". |
| W2 | CONFIRMED | Enter in Tags adds chip "QAenter"; form stays open and unsaved (cancelled). |
| W3 | CONFIRMED | Dialog "Save as new agent", "New agent" pre-selected; notice `Agent "QA verify agent 2" saved`. |
| W4 | CONFIRMED | Roles "Agent manager" / "Member" with agent descriptions; "Access to the agent's skill sets and knowledge bases"; "Add existing members to the agent." |
| W5 | CONFIRMED | Agent invite panel has no "Invite via link"; room 11 invite panel has it. |
| W6 | CONFIRMED | Chip cross tooltip/aria "Remove Contract review". |
| L1 | CONFIRMED | "New agent" (filter row, header "+" tooltip, empty view) on Agents; "New" on Skill sets and Knowledge bases (filter row, "+", empty view); never "New room". The empty-view heading is outdated — see New issues. |
| L2 | CONFIRMED | Tag QA → row All / Document / QA; QA narrows to the agent, URL `tags=["QA"]`, reload keeps it. (Row appeared only after a reload.) |
| L3 | PARTIAL | Category row, "+2" after two sets, dash for none, chat button for members only (none for the outsider) all correct; but cards are 306 px high while the grid step is ~198 px, so the next row covers the bottom: QA verify agent's Owner row is hidden. |
| L4 | CONFIRMED | Two wide columns of agent cards. |
| L5 | CONFIRMED | Sort menus of Agents, Skill sets, Knowledge bases: Name, Tags, Owner, Last activity date (no Type). |
| L6 | CONFIRMED | "Create skill set" (type Skill set, fixed book icon); "Create knowledge base" (type Knowledge base, fixed icon, no logo/cover editor). |
| L7 | CONFIRMED | Home AI Chat card: "A skill set with skills, a knowledge base the chat searches or an agent that brings them together". |
| T1 | CONFIRMED | Card click selects: description, Owner ONLYOFFICE ✓, Type "Template", Category, "Add to my agents"; Context lists Proofreading (proofread, tone-adjust) and Editorial standards; click between cards clears. |
| T2 | PARTIAL | "⋮" = "Add to my agents", "Info"; verified tick beside the name, but it is blue, not green (spec only says "verified mark"). |
| T3 | CONFIRMED | "Install this template?" names Proofreader and what it creates; Cancel created nothing; during install the dialog spins, Cancel and the Info "Add to my agents" disabled, card icon under the backdrop; "Proofreader has been installed", My agents tab. (Deleted afterwards.) |
| T4 | CONFIRMED | Proofreader tagged "Document": Tags column, card Category row, category row. |
| T5 | CONFIRMED | 1000 px iframe: search field fully below the tabs. |
| T6 | CONFIRMED | User: cards and Info panel shown; no install icon, "⋮" only "Info", no "Add to my agents". (Optional API call not made.) |
| SK1 | CONFIRMED | Triple-click + Bold → `**Writes … names.**` on that line; Bold again removes; cancelled. |
| SK2 | CONFIRMED | View instructions and Edit skill are centred modals. |
| SK3 | CONFIRMED | Editor font `SFMono-Regular, Consolas, "Liberation Mono", Menlo…`. |
| SK4 | CONFIRMED | Result in Edit skill fields (Name, "Command in chat: /qa-verify-skill", Description, Instructions; no frontmatter/line numbers); labels without colons; saved as "QA Verify skill.md". |
| SS1 | CONFIRMED | Row "Use in chat" (no copy-link icon) → new fullscreen default chat with only Budgeting. |
| SS2 | CONFIRMED | qa-haiku "Use in chat" → only QA skill set, draft `/qa-haiku ` focused with the caret after it. |
| SS3 | CONFIRMED | Crumb and back lead to "Skill sets" / "Knowledge bases". |
| SS4 | PARTIAL | "QA verify set" created; Info panel did not open by itself; but the first quick action is "Invite people" ("Add members to work together in the room"), "New skill" is second, and two descriptions say "Instructions room". |
| KB1 | CONFIRMED | Create button inside a knowledge base: "Add files". |
| KB2 | CONFIRMED | Grey knowledge base icon in table, tiles and compact rows. |
| V1 | CONFIRMED | Skill set tiles: Skills, Owner, Last modified; KB tiles: Owner, Last modified (no badge because every base is indexed; spec shows none then). |
| V2 | PARTIAL | Skill tiles show `/command` and description, but the "Use in chat" button covers the start of the command ("/qa-" hidden: "haiku", "pirate-hello"). |
| V3 | REFUTED | 1000 px compact rows show icon + name only for Agents, Skill sets, Knowledge bases, skills and KB files: no owner, date, "Skills: N", status, description, size or added-by. |
| D1 | CONFIRMED | `127.0.0.1:8092/login` renders; empty Sign in → "Required field"; typing works. |
| D2 | REFUTED | Known open, recorded only: `127.0.0.1:8092/rooms/personal` stays a blank white page, also when signed in there; no console errors. |
| LOC1 | CONFIRMED | Russian: "Источники данных", "Управление наборами навыков...", "Изменить агента" etc., "Использовать в чате", "Установить этот шаблон?", "Агент закреплен"/"Агент откреплен", "Недавние", "Создать набор навыков"; "Leave agent" = "Покинуть агента" in the locale. Restored to English. |

## New issues

1. **Skill set bin labelled "Disconnect room".** Default chat with Budgeting
   connected; type "/" or open "+" > Skill sets: the bin next to "Budgeting"
   has aria-label and title "Disconnect room" (rooms in Data sources correctly
   read "Disconnect room: 11").
2. **Draft attachments land in the folder at once and stay.** Room 11, chat
   panel: paste an image and attach an .md file, then remove both chips without
   sending: `qa-red.png` and `qa-upload.md` remain in room 11. The fullscreen
   chat put its attachments into My documents the same way.
3. **Every document_agent run leaves `task-log (N).md` in My documents**
   (`task-log (3).md` after the cats.docx run at 17:55, `task-log (4).md` after
   the dogs run at 18:19).
4. **A new default chat inherits an agent's linked rooms.** After working with
   "QA verify agent" (agent page, panel picks by several roles), AI Chat from
   the sidebar + New chat on Default AI agent started with Budgeting, Contract
   review, QA skill set, Spreadsheet formulas and QA knowledge base connected —
   exactly that agent's rooms; Contract review and Spreadsheet formulas had
   never been connected to a default chat. "Save as new agent" then copied
   them into "QA verify agent 2".
5. **Empty views use the old wording.** Room admin with no AI rooms: Agents,
   Skill sets and Knowledge bases all show "No AI rooms yet" and "Instructions
   rooms hold skills, Knowledge rooms hold the files the chat searches, and AI
   projects bring them together…"; the "New" action on Skill sets/KB carries the
   generic AI Chat description.
6. **Skill set and knowledge base menus are still room menus.** Skill sets list
   row "⋮": Edit room, Invite people, Copy link, More options, Leave the room
   (offered to the owner), Delete room; the delete dialog reads "Delete this
   room?" / "The room "Proofreading" will be permanently deleted". Same on
   Knowledge bases. The agent form's pickers are "Select room".
7. **Skills are not listed by file name in the chat menus.** "QA Pirate hello"
   and "qa-haiku" appear as "Qa pirate hello" and "Qa haiku" in "+" and "/".
8. **Info panel on the Agents list has no Content tab.** Selecting an agent on
   the list gives Details and Context only; the agent page has Details,
   Context, Content.
9. **"Find large files" cannot rank by size.** The reply in Files says the tool
   returns no file sizes and lists the files without sizes.
10. **Pickers of the chat show coloured initials.** "Manage knowledge
    bases..." / "Manage skill sets..." pickers show coloured initial logos, not
    the grey icons, and the KB picker's Select looked enabled with nothing
    ticked. "+" > Knowledge bases rows use the rooms-grid icon; in "Select files"
    the "AI Chat" entry shares the Rooms icon.
11. **Narrow panel submenu overlaps its parent.** Member, Files panel on QA
    verify agent: "+" > Knowledge bases opens its submenu on top of the "+"
    menu; a click on the base row navigates to the knowledge base.
12. **Category row needs a reload.** After saving the tag "QA" the row stayed
    "All | Document" until the page was reloaded.
13. Minor: panel "⋮" uses different icons from the page "⋮" (pencil/share vs
    gear/person); the KB level of "+" with nothing connected shows only the
    Manage row, while Skill sets shows caption, hint and "No skills are
    connected to this chat"; Skill sets/KB tables say "Last modified" while the
    sort says "Last activity date".

## Not checked

- T6 optional `POST /api/2.0/ai/templates/install` as the User: the call was
  refused by the tool's permission check, so not sent.
- C7 folder half ("Disconnect folder", folder icon): no folder was available as
  a data source and none was created.
- V1 indexing badge and P1 member data-source bin: nothing was indexing, and the
  member had no data source connected.
- A2 "narrowest Chrome allows" and the 1500 px width: the window could not be
  resized; widths were emulated with an iframe and the layout width was 1666 px.
- C1 "composer in the upper half": the composer is always at the bottom.
- Image attach through "Add files from device": the native dialog cannot be
  driven; the image was pasted instead.

## Left on the portal

- Deleted in this run (approved): "QA verify agent", "QA verify agent 2",
  installed "Proofreader" with its skill set "Proofreading" and knowledge base
  "Editorial standards".
- Still there (deletion not approved):
  - skill set "QA verify set" (id 60) with "QA Verify skill.md";
  - test users `qa-verify-roomadmin@`, `qa-verify-docspaceadmin@`,
    `qa-verify-user@example.com` (pending activation); the owner now sees the
    "admin limit 3/3" banner;
  - room 11: `qa-red.png`, `qa-upload.md`,
    `generated_image_2026-11-18_18-16-41.png`, `short_dog_overview.docx`;
  - My documents: `qa-upload.md`, `qa-red.png`,
    `generated_image_2026-11-18_18-16-41.png`, `task-log (3).md`,
    `task-log (4).md`;
  - Contract Reviewer: conversation "Create a short docx about cats" and its
    artifact `cats.docx`;
  - default-agent conversations: "Find Largest Files Ranked by Size and
    Location", "Greeting and one-word reply", "Describing a markdown file and a
    red image", "One-Word Reply Request", "Drawing a Red Circle", plus empty new
    chats.
- Restored: profile language en-US, Permissions "Auto approve", Rooms sort Last
  activity descending, list view, sidebar expanded, no pins.
