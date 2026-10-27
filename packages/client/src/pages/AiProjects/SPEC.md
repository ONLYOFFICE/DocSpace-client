# AI Projects — functional specification

Status: design agreed on 2026-10-26 (feature/new-ai-concept), not implemented.
Mockups: https://claude.ai/artifact/YVDfynw9F3x2AyPCiUs1EP (private canvas, 20 artboards in 5 rows).
Replaces the localStorage "AI presets" shipped on this branch (`AiPresetsStore`, `AiPresetsBridge`,
the floppy save button in the chat header).

---

## 1. Concept

An **AI project** is a saved chat setup shared with a group of people. It bundles:

| Part | Scope | Where it is set |
|------|-------|-----------------|
| Model (chat profile) | shared by every member | Create / Edit project |
| Instructions rooms (array) | shared | Create / Edit project |
| Knowledge bases (array of Knowledge rooms) | shared | Create / Edit project |
| Context folder (one folder) | **per user, per chat**, never part of the project | Sources column → Context |
| Members and roles | shared | Invite panel, Info panel → Contacts |
| Conversations | **per user**: every member has their own threads inside the project | chat toolbar (history, new chat) |

A project is not a container for files: it has no file list and no Files tab. Rooms it links to are
references by id, not nested rooms.

**Access rule:** when a user is added to a project (any role), the server shares **every** linked
Instructions room and Knowledge room with that user as **Viewer** (`ReadOnly`) — unless the user is
already a member of that room, in which case their existing role is kept. The same happens the
other way round: when a room is added to the project, every current member who is not yet in the
room gets Viewer on it. So a member never sees a "no access" state for a linked room. These are
real `files_security` rows, not a transitive check (see §9).

---

## 2. Roles and user types

### 2.1 Project roles (three)

| Role | `ShareAccessRights` | Who may hold it |
|------|---------------------|-----------------|
| Owner | `FullAccess` | portal Owner, DocSpace admin, Room admin |
| Project manager | `RoomManager` | portal Owner, DocSpace admin, Room admin |
| Member | `Collaborator` | every type, Guest included |

### 2.2 Rights matrix

| Action | Owner | Project manager | Member |
|--------|:-----:|:---------------:|:------:|
| Open the project, chat with its model, instructions and knowledge | + | + | + |
| Pick a personal context folder | + | + | + |
| New chat, chat history (own threads) | + | + | + |
| Pin to top, disable notifications, copy link, project info | + | + | + |
| Change model, add / remove Instructions and Knowledge rooms | + | + | |
| Rename, change logo | + | + | |
| Invite people, change member roles (not the owner), remove members | + | + | |
| Duplicate project | + | + | |
| Change project owner | + | | |
| Delete project | + | | |
| Leave the project | | + | + |

The owner has no "Leave": they must hand the project over first ("Change project owner").

### 2.3 Portal user types

| | Owner / DocSpace admin | Room admin | User | Guest |
|--|:--:|:--:|:--:|:--:|
| Sees the AI Projects section | + | + | + | + |
| Sees every project on the portal | + | | | |
| Sees projects they own or were invited to | + | + | + | + |
| Creates projects | + | + | | |
| Can be Owner / Project manager | + | + | | |
| Can be Member | + | + | + | + |

When AI is not enabled on the portal the section renders an "AI is not enabled" empty state for
everyone (admins get a link to AI settings) and the "New project" controls are hidden.

---

## 3. Navigation

- Article (left sidebar): **AI Projects** item in the `Apps` group, between Forms and AI agents,
  using the AI agents icon until a dedicated one exists. Route `/ai-projects`.
- Section header: title `AI Projects`, right side: `Subscription expired` (when applicable),
  `AI Chat` button, Info panel toggle — exactly as the AI agents section.
- Inside a project the section header becomes `← | <Project name> ▾  +  ⋮` with the Info panel
  toggle on the right (the agent page pattern). No tabs.
- Tablet (< 1024px): the article collapses into the 60px icon rail; the list switches from Table to
  the rows view. Mobile (< 600px): hamburger / logo / avatar top bar, rows view, floating `+`.

---

## 4. The list (`/ai-projects`)

### 4.1 Quick tiles

One tile `New project` above the filter (like `New agent`), for Owner / Admin / Room admin only.

### 4.2 Filter row

`+ New project` (primary, 140px, O/A/RA only) · Search · Filter · Sort · view toggle (table ↔ tiles).

Filter options: **My role** (Owner / Project manager / Member), **Has instructions**, **Has
knowledge base**. Sort: name, last activity (default, desc), created.

Applied filters render as chips under the row; an empty result shows the "No results matching your
search" state with a `Clear filter` action.

### 4.3 Table view (desktop)

| Column | Content |
|--------|---------|
| Name | 32px square logo with initials + name (no role tag after the name) |
| Instructions | room names as tag chips (the Rooms "Tags" column style), overflow as `+N` |
| Knowledge | same for Knowledge rooms |
| Last activity | `dd/mm/yyyy hh:mm` |
| ⋮ | context menu |

An empty Instructions / Knowledge cell stays empty (no dash). For a User the Members column is not
shown either; the table is the same for every type.

### 4.4 Tiles view

Card: logo + name + `⋮` on top, then two rows `Instructions: <tags>` and `Knowledge: <tags>`.
A row whose array is empty is not rendered. No date on a tile.

### 4.5 Rows view (tablet, mobile)

`RowContent` from ui-kit: one bold title line (logo + name) and **one** grey 12px side-info line,
elements joined with ` | `, e.g. `Instructions: Brand voice, Legal tone | Knowledge: Product
catalogue, Pricing 2026`. An empty group is omitted together with its separator. If we follow
`FilesRowContent` one to one, the side line depends on the sort field (Instructions / Knowledge /
date); the mockups show the fixed two-group variant.

### 4.6 Context menu (row, tile, section header ⋮ inside the project)

Owner / Project manager:

```
Select
Open
──
Pin to top
Disable notifications
──
Edit project
Invite people
Copy link
More options ▸  Duplicate · Project info · Change project owner (owner only)
──
Delete project (owner only)
```

Member:

```
Select
Open
──
Pin to top
Disable notifications
──
Copy link
Project info
──
Leave the project
```

Inside an open project the header `⋮` shows the same items minus Select / Open:
`Edit project | Invite people, Change project owner, Copy link, Project info | Pin to top, Disable
notifications, Duplicate | Delete project` (owner), or `Pin to top, Copy link, Project info | Leave
the project` (member). New chat, chat history and "Add …" items are **not** in this menu: the first
two live in the chat toolbar, adding rooms lives in the source sections.

### 4.7 Empty states

Illustrations and option icons are the product's own SVGs (`public/images/emptyview`,
`public/images/emptyFilter`); a dedicated AI Projects illustration and a `create.ai-project.svg`
option icon are to be drawn, the agents' ones are used meanwhile.

| Case | Owner / Admin / Room admin | User / Guest |
|------|---------------------------|--------------|
| No projects | "No AI projects yet" + description; actions: **Create project**, **Go to Rooms** (Instructions rooms and Knowledge bases are created there) | "No projects shared with you yet"; action: **Go to Rooms** |
| AI not enabled | "AI is not enabled on this portal"; admin: **Go to AI settings**; room admin: text only | text only |
| Filter without results | robot-with-magnifier illustration; **Clear filter** | same |

Mobile shows the same states with the illustration scaled to 150×105.

---

## 5. Inside a project

Layout (desktop): section header → chat toolbar row → `[sources column 300px] [chat]` →
optional Info panel 400px on the right. No tabs, no Files.

### 5.1 Chat toolbar row

The project's Navigation (back arrow, title, project `⋮`, info toggle) carries the ui-kit
`ChatToolbar` — **Chat history** (clock) and **New chat** (plus) — after the project menu. A hairline
separates it from the body. The chat renders in the section body as an agent's chat does
(`fullHeightBody`), so the section's own info panel opens beside it.

### 5.2 Sources column

A 380px column (the chat history's width) with three cards, sharing its height: Context keeps its
own, Instructions and Knowledge grow in equal shares up to their content and scroll inside.
Rooms are drawn as the folder tree draws them (room logo, name; a click opens the room).

| Section | Rows | Expands to | Section menu |
|---------|------|------------|--------------|
| Instructions | one per linked room | the room's skills (its Markdown files), each opens in the editor in a new tab | — |
| Knowledge base | one per linked room | the room's vectorized files, each opens in the editor in a new tab | — |
| Context | the user's own folder (room logo or folder icon, path as tooltip), or `+ Add room` | — | Change folder · Disconnect |

Every skill of a linked Instructions room is used by the chat: skills cannot be switched off.
Rooms are linked and unlinked in Edit project only. Context shows the note "Your folder only:
members pick their own context" for members.

### 5.3 Sources, history and info panel

The chat history and the info panel each take the sources column's place: while either is open
the column hides. Opening the info panel returns the chat from the history page. On mobile the
linked rooms are one scrolling strip above the chat (a tap opens the room); there is no column.

### 5.4 Chat

The ui-kit chat panel body. Empty thread = project logo, name and the sentence "Chat with <model>
using instructions from <rooms> and the <rooms> knowledge base. Your conversation is yours only."
plus four suggestion buttons. Composer: `+` (attach), prompts, and in the bottom-right the model
rendered by the library's **read-only profile picker** (`profilePickerReadOnly: true`): grey 12px text
with the model name, no arrow, before the send button. No role may change the model from the chat.
Composer source chips are hidden (`hideComposerContext`): the column replaces them.

### 5.5 Info panel

Title **Info**, tabs **Contacts · Details** (no History). Contacts: logo + project name, icons
search / invite / `⋮`, then `Users` with `name`, `type | email`, role select on the right
(Project manager / Member; Owner shown as text), `Expect people` for pending invitations. Role
select and remove are Owner / Project manager only; Member sees the list read-only.

---

## 6. Dialogs

All dialogs reuse the room dialog format.

### 6.1 Create AI project / Edit AI project — aside (`displayType="aside"`, 480px)

Header `Create AI project` / `Edit AI project` + `×`. Body, top to bottom:

1. Logo (64px, `Edit` link; initials or cover, colour swatches as rooms) + **Label:** input,
   placeholder `Enter name`, required.
2. *(Edit only)* **Project owner** block: avatar, name, `Change` button (as `ChangeRoomOwner`).
3. **Model:** dropdown of chat profiles, default `Portal default · <model>`; hint "Everyone in the
   project chats with this model. Members cannot change it from the chat."
4. **Instructions rooms:** selected rooms as removable chips + `Select rooms` → Room list selector
   (6.2) filtered to Instructions rooms, multi-select.
5. **Knowledge bases:** same, filtered to Knowledge rooms.

No Tags, no Context folder. Footer: `Create · Cancel` / `Save · Cancel`, equal width.

Entry points: `+ New project`, the `New project` tile, the empty state action, the list / header
context menu (`Edit project`). "Save as project" from a plain chat is dropped together with the
floppy.

### 6.2 Room selector

The `Room list` aside: back arrow, title (`Instructions rooms` / `Knowledge bases`), search, rows
with 32px logo, name and a checkbox, footer `Select (N) · Cancel`. Only rooms of the matching type
are listed; a room already used by the other selection is greyed.

### 6.3 Invite

The room `Invite` aside: `Invite via link` (toggle, link = Member), `Add manually` with
`Choose from list`, invitation language, search field with the role select on the right. Role
select: **Project manager** (O/A/RA only) / **Member**; for a User or Guest the select is locked
to Member. Footer `Send invitation · Cancel`.

### 6.4 Confirmations (modal, `Remove group` format, 364px)

- **Delete project** (owner): "You are about to delete the project *Name*. Are you sure you want to
  proceed? Members lose access to the project. The linked rooms stay untouched." `Delete · Cancel`.
- **Leave the project** (manager / member): "Do you really want to leave the project *Name*? You
  will no longer see it in AI Projects. The owner can invite you again." `Leave · Cancel`.
- **Change project owner** (owner, from Edit or the menu): people aside with radio buttons, only
  members who may own a project (O/A/RA) are selectable, checkbox "Leave me in the project as
  Project manager", footer `Change owner · Cancel`.

Disconnecting a room from a section needs no confirmation (toast with undo).

---

## 7. Mobile and tablet

- **List:** rows view (§4.5); floating `+` (MainButtonMobile) for O/A/RA only; empty states §4.7.
- **Project chat:** section header `← Name ▾ ⋮ [info]`, chat toolbar (history, new chat), a strip
  of source pills (tap → sources), the conversation, composer with the read-only model text.
- **Sources / Info:** full-screen Info panel with tabs `Sources · Contacts · Details`.
- **Tablet:** icon rail, rows view, tiles in two columns, Create / Edit asides unchanged.

---

## 8. Data model

A project is a **room** (`files_folders` row) with its own root, like AI agents:

| Enum | Value |
|------|-------|
| `FolderType.AiProjectRoom` | 40 |
| `RoomType.AiProjectRoom` | 12 |
| `FilterType.AiProjectRooms` | new |
| root `FolderType.AiProjects` | new, sibling of `AiAgents` (keeps projects out of Rooms) |

Settings table `files_room_ai_project_settings`, 1:1 with `files_room_settings`
(pattern: `DbRoomChatSettings`):

| Column | Type |
|--------|------|
| tenant_id, room_id | PK |
| profile_id | Guid? (null = portal default) |
| instructions_room_ids | int[] (JSON) |
| knowledge_room_ids | int[] (JSON) |

No `context_folder_id`: the context folder is personal and travels with the chat thread
(`actionArgs.folderContext`, as today). Room and profile names are **not** stored; they are
resolved at read time under the current user.

Members, roles, pins, notifications, archive/trash and links come from the room machinery
(`files_security`, `FileSecurity`) unchanged.

---

## 9. API

Reused as is:

| Method | Path | Use |
|--------|------|-----|
| GET | `files/rooms?type=12&filterValue&sortBy&sortOrder&startIndex&count` | list (search, sort, paging) |
| GET | `files/rooms/{id}` | project card |
| PUT | `files/rooms/{id}` | rename, logo, **settings block** |
| GET / PUT | `files/rooms/{id}/share` | members and roles |
| PUT | `files/rooms/{id}/pin`, `…/archive`, DELETE `files/rooms/{id}` | pin, archive (if kept), delete |
| POST | `files/rooms/{id}/links` | invite link (Member) |

Extended:

```csharp
// CreateRoomRequestDto / UpdateRoomRequestDto
public AiProjectSettingsRequestDto? AiProject { get; init; }

public class AiProjectSettingsRequestDto
{
    public Optional<Guid?> ProfileId { get; init; }          // absent = keep, null = portal default
    public Optional<int[]> InstructionsRoomIds { get; init; }
    public Optional<int[]> KnowledgeRoomIds { get; init; }
}

// FolderDto (RoomType 12 only)
public AiProjectSettingsDto? AiProject { get; init; }

public class AiProjectSettingsDto
{
    public AiProjectProfileDto? Profile { get; init; }
    public List<AiProjectSourceDto> InstructionsRooms { get; init; }
    public List<AiProjectSourceDto> KnowledgeRooms { get; init; }
    public bool CanEditSettings { get; init; }               // FullAccess || RoomManager
}

public class AiProjectProfileDto { Guid Id; string? Name; bool Available; }
public class AiProjectSourceDto  { int Id; string? Title; RoomType RoomType; int? SkillsCount; int? IndexedFiles; int? TotalFiles; }
```

Validation on create / update: every `InstructionsRoomIds` entry is a room of type 10, every
`KnowledgeRoomIds` entry a room of type 11, the saver has read access to each, the profile exists
and is enabled. Third-party (provider) rooms are rejected.

Server changes beyond the DTOs:

- `DocSpaceHelper`: FolderType ⇄ RoomType ⇄ FilterType mappings, `IsRoom`, the new root.
- `FileSecurity`: for type 12 the invitable accesses are `RoomManager` and `Collaborator`,
  default `Collaborator`; create rights O/A/RA; admin sees all.
- **Room grants on membership** (`FileSharing` / `AiProjectMembershipService`):
  - `PUT files/rooms/{id}/share` on a project, for every added user and every linked room of type
    10/11: if the user has no share on the room, add `ShareAccessRights.ReadOnly` (Viewer); if they
    already have one, leave it as is. Invitation links and pending email invitations grant the same
    Viewer share once the invitation is accepted.
  - `PUT files/rooms/{id}` adding rooms to `InstructionsRoomIds` / `KnowledgeRoomIds`: for every
    current project member without a share on the new room, add Viewer.
  - Grants are made on behalf of the project owner (room owner / manager rights are not needed from
    the inviting manager; the project owner must have at least Viewer on each linked room, which
    the validation in §9 guarantees).
  - Removing a user from the project or a room from the project does **not** revoke the Viewer
    share (see §11).
- `FolderDao.SaveFolderAsync` persists the settings block next to `ChatSettings`; a list read
  batch-loads settings and resolves titles / counts.
- ASC.AI.Chat: a round opened inside a project sends `actionArgs.project = { id }`; the Node side
  resolves the project's instructions rooms (all their skills) and knowledge
  rooms (search across all of them) and forces the project's profile.

---

## 10. Client and ui-kit changes

Client:

- `AiPresetsStore` / `AiPresetsBridge` / localStorage go away; `pages/AiProjects` becomes a rooms
  section bound to the `AiProjects` root (`FilesStore` filter `type=12`), reusing Table / Tiles /
  Rows views, FilterInput, the context-options store, the Info panel and the Invite panel.
- Register `RoomsType.AiProjectRoom = 12` / `FolderType.AiProjectRoom = 40`, role labels
  (`ProjectManager`, `ProjectMember`) in `getAccessOptions`, empty-view cases in
  `EmptyViewContainer.helpers`, context menu model in `contextOptionsStore`.
- `CreateEditRoomDialog` gets a project variant (no room type, no tags, the three project fields)
  or a sibling `CreateEditAiProjectDialog` sharing `SetRoomParams` pieces.
- Project page: section header + chat toolbar + sources column + ui-kit chat panel body with
  `profilePickerReadOnly`, `hideComposerContext`, `contextRoomScopesRounds`.
- Drop: the floppy / "Save as project", the `Choose AI Project` picker entry (projects are opened
  from their list, not from the model picker), `/ai-agents` leftovers in `NewArticle` and tours.

ui-kit:

- `AiChatStore.openProject({ id, profileId, instructionsRooms[], knowledgeRooms[] })` replacing
  `openPreset`; `AiChatPresetSettings` becomes arrays.
- `ContextRoomSync` / `ContextRoomWatcher` accept several Instructions rooms (skills merged,
  grouped by room in the Skills aside) and several Knowledge rooms.
- Enums `RoomsType.AiProjectRoom`, `FolderType.AiProjectRoom`, room logo / type title for 12.
- Remove `AiChatPanelSave`, `onSavePreset`, `applyPreset`.

Locales: new `Common` keys (`AIProjects`, `AIProject*`, `ProjectManager`, `ProjectMember`,
empty-state titles and descriptions, menu items) in all supported languages.

---

## 11. Open points

1. Archive for projects: not in v1 (delete only); the room machinery allows adding it later.
2. Threads: per user in v1. A shared history would need `project_id` on threads and a project
   thread list in the lib.
3. Side-info content on tablet / mobile: fixed two groups (as mocked) or sort-driven (as
   `FilesRowContent`).
4. Dedicated illustration and `create.ai-project.svg` icon for the empty states.
5. Whether a Member may add their own context folder from the Room selector or only from Files
   (mocked: FilesSelector, any readable folder).
6. Revoking the auto-granted Viewer share when a user leaves / is removed from the project or a room
   is unlinked: v1 keeps the share (simple, no surprises for users who were added to the room by
   other means); revoking only shares the project created would need a marker on the
   `files_security` row.

---

## 12. Mockup index

Row 1 — list by user type: Owner/Admin table · User table · Tiles · Tablet 900 · Mobile 390.
Row 2 — empty states: Admin · User/Guest · AI not enabled (admin | others) · filter without results.
Row 3 — inside a project: Owner (menus open) · Member · Skills aside.
Row 4 — Create (aside) · Edit (aside) · Instructions rooms selector · Invite · Delete / Leave / Change owner.
Row 5 — Mobile: project chat · sources (Info panel) · empty for a User.
