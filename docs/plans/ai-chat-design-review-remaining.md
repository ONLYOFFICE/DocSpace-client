# AI Chat design review: what is left

Temporary working document, updated 2026-11-18 after the second fix round. It
lists what is still open from `docs/plans/ai-chat-design-review-by-repo.md`,
which was built from the first report,
`docs/plans/ai-chat-design-review-2026-11-17.md`. "Review: lines" points into
the first report.

Decisions made by the owner on 2026-11-18:
- Where the boards and the spec disagree, the spec wins. The code already
  follows the spec in all four places, so nothing changed there.
- Product-wide shared components stay as they are.
- In "Auto approve", the document tool runs without asking.
- An agent has no invitation link.
- Installing a template asks for confirmation first.
- The "+" menu reads "Data Sources".
- The fullscreen chat keeps no address of its own.
- Skills keep their file names in the lists.

All 134 items in brief:

| Outcome | Items |
|---|---|
| Fixed | 97 |
| Partly done, the rest needs C# | 3 |
| Closed by a decision: spec over board, no change | 7 |
| Needs C# (another developer) | 5 |
| Product-wide shared components, kept as they are | 17 |
| Not code: checks, banners, dev environment | 5 |

Nothing was checked in a browser: every fix is verified by type checks,
linters and unit tests only.

## 1. Partly done: the rest needs C#

- [ ] **Connected sources are remembered per browser, not on the server.**
  Sources survive a reload, but they are stored per user and per
  conversation in the browser's storage. The thread storage has no metadata
  field. Keeping them on the server needs a thread metadata field: C# thread
  storage first, then ASC.AI.Chat `app/storage/threadsStorage.ts`.
  Review: lines 281-285, 338-339
- [x] **A member who joined through a group is missing from the agent menu.** *Superseded: server d2e3fe02c9c refuses groups as members of an agent.*
  Such a member reads `inRoom: false` (tasks.md group 11, a server item). Every
  agent of a direct member is now offered: the list is read page by page,
  not just the first 100. Review: lines 585-589
- [ ] **"Already added" on an installed template** (task 6.0j). Something on
  the server must tie a room to its template. The install confirmation and the
  lock against a second click are done. Review: lines 377-379

## 2. Closed by a decision: the spec wins, the code already follows it

- The panel's "⋮" menu stays Edit agent, Share agent, Agent info, Delete agent.
  The board's New chat, Expand and history items wait for task 4.5, which is
  gated on the conversation scope (C#). Review: lines 108-110
- The board 03 panel header waits for the same task 4.5. Review: lines 106-107
- The "AI Chat" title of the fullscreen chat keeps its menu arrow.
  Review: lines 99-101
- The agent's Info panel tabs stay Details, Context, Content. Review: lines 141-143
- The Templates categories stay a row of tabs. Review: lines 122-124
- The fullscreen chat has no address of its own; the tab title reads "AI Chat".
  Review: lines 64-65
- Skills keep their file names in Context, Details and the tables.
  Review: lines 355-357

## 3. Needs C# (another developer)

- [ ] **Delete for a DocSpace admin outside the agent.** `FileSecurity.cs`
  grants no `Delete` on a room of type 12. The client shows Delete as soon as
  `security.Delete` is set. Review: lines 580-584
- [ ] **A file that yields no text is marked Indexed.** `VectorizationTask.cs`
  sets `Completed` with zero chunks. Until it sets `Failed`, the client's Error
  mark, "Try again" and failure note cannot be checked. Review: lines 477-480
- [ ] **Agent description** (tasks 6.4-6.5). The server neither stores nor
  returns it. The client part (form field, card line, Details row) waits for
  it. Review: lines 118, 144-146, 332-334
- [ ] **"Used by" and "Last indexed" columns, skill set description**
  (task 7b.7). No room DTO returns them. Review: lines 158-159, 171-172
- [ ] **Opening an agent's conversation from Recent** (task 3.6). It needs the
  agent id on a thread: ai-chat task 3.3, ASC.AI.Chat task 3.2, and C#
  `ThreadQueries.cs`, which lists only threads with `EntryId == null` without
  a scope. Until then Recent lists the conversations that belong to no agent.
  Review: lines 523-526

## 4. Product-wide shared components, kept as they are

Owner's decision (2026-11-18): these stay as the product has them.
- Table headers are cut with an ellipsis.
- A room tile without tags shows its type.
- No context menu item is red.
- Every opened room's header has a back arrow.
- Side panels have full-width footer buttons.
- The tabs over the Agents list are underlined.
- A new agent shows initials.
- Info panel tabs are centred.
- The Info panel has a Metadata tab.
- The item's title repeats on every Info panel tab.
- Details always show Last modified by, Tags and Comments.
- Dates include the time.
- The Owner column says "Me".
- File names are shown without the extension.
- Every list has the view switch.
- One view choice serves all lists.
- Every header has the "Try Business" badge.

Review: lines 195-229

## 5. Not code

- [ ] **Indexing states are still unverified in a browser** (the Indexing and
  Error marks, the failure note, the alert icon on tiles). This is blocked by
  the C# item "a file that yields no text is marked Indexed" (section 3).
  Review: lines 175-177, 256-258
- [ ] **The admin-limit banner is shown to a Room admin.** This is intended
  behaviour. Review: lines 551-552
- [ ] **The banners caused by the test users** (admin limit 3/3, email
  activation) were expected. The users are deleted. Review: lines 506-508, 572-573
- [ ] **The Vite client stays blank on `http://127.0.0.1:8092`.** The Next apps
  now accept that address (client `e2acfa3f50a`). Why the Vite client stays
  blank there was not found. Use `localhost` or the LAN address meanwhile.
  Review: lines 628-632

## 6. Still to do outside the code

- [ ] **Browser pass on the stand.** Not done: the owner left it out of this
  round. The places with the most risk:
  - the agent page header at desktop width and at 682 px;
  - the "+" lists and the slash menu, with their remove and Manage rows;
  - sources that come back after a reload;
  - the agent's logo and the document card in replies;
  - "Save to room..." on an image and on a document;
  - "Use in chat" on a skill's row, which puts the call in the draft;
  - the template install confirmation;
  - the Agents category row and the two-column cards;
  - the tile and compact views of skill sets and knowledge bases.
- [ ] **E2E.** Not done: the owner left it out of this round.
  - The screenshots of `ai-projects.spec.ts` are not refreshed.
  - The DocSpace admin case for the card's "Open chat" button in
    `ai-projects-access.spec.ts` is not added.
- [ ] **Push.** Nothing is pushed. The local commits are on
  `feature/new-ai-concept` in `onlyoffice-ai-chat`, `docspace-ui-kit-react`,
  the server repo (ASC.AI.Chat only, plus the user's merge of origin) and the
  client.

## Done in the second round (2026-11-18)

- ai-chat `1.0.2-progress.56`:
  - a host can put text in the draft of a new chat;
  - the "+" menu reads "Data Sources".
- ASC.AI.Chat: under "Auto approve" the document tool runs without asking.
  Under "ask" it still asks.
- ui-kit:
  - takes ai-chat `progress.56`;
  - `draft` for `openPreset`;
  - reads `Common:AIChat` and `Common:AIAgent`.
- client:
  - takes both packs;
  - "Use in chat" on a skill's row starts the chat with `/skill`;
  - template install confirmation and a lock against a second click;
  - no "Invite via link" for an agent;
  - grey knowledge base and skill set icons in Context and in the agent form;
  - every agent the user is a member of is read, not just the first 100;
  - "Open location" in the Content tab's file menu;
  - 127.0.0.1 accepted by the Next dev servers;
  - `Common:AiWorkspace` and `Common:AIProjectRoomTitle` removed, and the
    duplicate-value allowlist entry restored;
  - translations into all 31 languages of the 44 keys this run added or
    reworded, and of the 38 AI section keys the branch had added in English
    only. The full locale check (`locales.test.js`) passes, 46 of 46.
- OpenSpec, not committed:
  - Context and Content requirements;
  - no invitation link;
  - install confirmation and the category tag;
  - design.md;
  - tasks.md ticks.

  `openspec validate --strict` passes.
- The full pre-push gate of the client passes.
