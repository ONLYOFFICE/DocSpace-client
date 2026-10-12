---
paths:
  - "packages/shared/utils/getAccessOptions.tsx"
  - "packages/shared/utils/getUserTypeDescription.tsx"
  - "packages/shared/utils/common.tsx"
  - "packages/client/src/components/panels/InvitePanel/**"
  - "packages/client/src/components/dialogs/ChangeUserTypeDialog/**"
  - "packages/client/__tests__/access-control.spec.ts"
  - "packages/client/__tests__/accounts-access.spec.ts"
  - "packages/client/__tests__/rooms-context-menu.spec.ts"
  - "packages/client/__tests__/rooms-invite.spec.ts"
  - "packages/client/__tests__/invite.spec.ts"
  - "packages/client/__tests__/external-sharing-rooms.spec.ts"
  - "packages/client/__tests__/external-sharing-share-panel.spec.ts"
---

# Types, roles and access rights

Transcribed from the product spreadsheet *Types and Roles. Access rights*, which
lives outside the repository and is the source of truth. Where this file and the
spreadsheet disagree, the spreadsheet wins and this file is stale - say so
rather than picking one.

Two independent questions, and conflating them is the usual bug:

- **Portal user type** - what someone may do on the portal at all (create
  rooms, manage accounts, open settings).
- **Room role** - what they may do *inside one room*, granted by that room's
  owner or manager, and never more than their type allows.

## Vocabulary

| Spreadsheet | Code | Flag on `TUser` |
|-------------|------|-----------------|
| DocSpace Owner | `EmployeeType.Owner` | `isOwner` |
| DocSpace admin (Full admin in the UI) | `EmployeeType.Admin` | `isAdmin` |
| Room admin | `EmployeeType.RoomAdmin` | `isRoomAdmin` |
| User | `EmployeeType.User` | `isCollaborator` |
| Guest | `EmployeeType.Guest` | `isVisitor` |

`getUserType` (`packages/shared/utils/common.tsx`) is the only place that turns
those flags into a type, and the order it asks in is load-bearing: owner, admin,
room admin, user, guest. Do not re-derive a type from a single flag by hand.

| Room role | `ShareAccessRights` |
|-----------|---------------------|
| Room owner | `FullAccess` |
| Room manager | `RoomManager` |
| Content creator | `Collaborator` |
| Editor | `Editing` |
| Form filler | `FormFilling` |
| Reviewer | `Review` |
| Commentator | `Comment` |
| Viewer | `ReadOnly` |

Which roles a type may hold: **room owner** and **room manager** are open to the
portal owner, DocSpace admins and room admins only. Every other role is open to
every type, guests included.

## Portal types

`O` owner, `A` DocSpace admin, `RA` room admin, `U` user, `G` guest.

### My documents

The whole section, and every action in it - create, upload, move, copy, rename,
download, delete - is O A RA U. **A guest has no My documents at all**, which is
why the Overview's create section is disabled for them end to end.

### Rooms

| Action | O | A | RA | U | G |
|--------|---|---|----|---|---|
| See all rooms | + | + | | | |
| See rooms I own | + | + | + | | |
| Create rooms | + | + | + | | |
| See rooms I was invited to | + | + | + | + | + |
| Pin rooms | + | + | + | + | + |
| View members, history, room info | + | + | + | + | + |
| Edit own rooms | + | + | + | | |
| Invite external users to a room | + | + | + | + | + |
| Invite portal users and groups to a room | + | + | + | + | |
| Set a member's role when inviting | + | + | + | + | + |
| Change member and group roles | + | + | + | | |
| Remove members and groups | + | + | + | | |
| Archive own rooms | + | + | + | | |
| Duplicate own room | + | + | + | | |
| Duplicate someone else's room | + | + | | | |
| Change the owner of someone else's room | + | + | | | |
| Archive someone else's room | + | + | | | |

Nobody - not even the portal owner - may edit someone else's room, invite into
it, change roles in it, remove its members, or see the links of someone else's
public room. Reaching a room's contents goes through membership, not rank.

### Archive

Read-only: no creating, editing, inviting, role changes, removals or pinning for
anyone. What is left:

| Action | O | A | RA | U | G |
|--------|---|---|----|---|---|
| See all archived rooms | + | + | | | |
| See archived rooms I own | + | + | + | | |
| See archived rooms I was invited to | + | + | + | + | + |
| View members, history, room info | + | + | + | + | + |
| Duplicate own room into Rooms | + | + | + | | |
| Duplicate someone else's room into Rooms | + | + | | | |
| Restore own room | + | + | + | | |
| Restore any room | + | + | | | |
| Delete own room | + | + | + | | |
| Delete any room | + | + | | | |

### Accounts

The section itself is O A RA - users and guests never reach it.

| Action | O | A | RA |
|--------|---|---|----|
| Invite a DocSpace admin | + | | |
| Invite a room admin | + | + | |
| Invite a user | + | + | + |
| Promote to DocSpace admin | + | | |
| Promote to room admin | + | + | |
| Promote a guest to user | + | + | + |
| Demote a DocSpace admin (to room admin or user) | + | | |
| Demote a room admin to user | + | + | |
| Demote a user to guest | + | + | |
| Block or delete a DocSpace admin | + | | |
| Block or delete a room admin, user or guest | + | + | |
| Reassign a deleted person's data | + | + | |
| Create and edit groups, change their membership | + | + | |
| See the group list and its contents | + | + | + |
| See guests invited by other people | + | + | |
| See own guests | + | + | + |

A room admin invites and promotes up to *user* and no further: nobody grants a
rank they do not hold. Guests are never added to groups, whoever asks.

### Portal settings

O and A. Deleting the portal is the owner's alone.

### Share

| Action | O | A | RA | U | G |
|--------|---|---|----|---|---|
| Share files with portal users | + | + | + | + | |
| Share files with guests | + | + | + | | |
| Share with guests the sharer cannot see | + | + | | | |
| See the user and group list while sharing | + | + | + | | |
| Quick share for forms | + | + | + | + | |

## Room roles

`RO` room owner, `RM` room manager, `CC` content creator, `Ed` editor,
`FF` form filler, `Rv` reviewer, `Cm` commentator, `Vw` viewer.

### The room

| Action | RO | RM | CC | Ed | FF | Rv | Cm | Vw |
|--------|----|----|----|----|----|----|----|----|
| Edit the room | + | + | | | | | | |
| Invite users, set their role on invite | + | + | + | + | + | + | + | + |
| Change member roles | + | + | | | | | | |
| Create, edit and delete room links | + | + | | | | | | |
| Moderate people asking to join | + | + | | | | | | |
| Remove members | + | + | | | | | | |
| View members, history, room info | + | + | + | + | + | + | + | + |
| Archive the room | + | | | | | | | |
| Delete the room | + | | | | | | | |

Nobody changes their own role, in any role.

### Files and folders

| Action | RO | RM | CC | Ed | FF | Rv | Cm | Vw |
|--------|----|----|----|----|----|----|----|----|
| Create, upload | + | + | + | | | | | |
| Edit files | + | + | + | + | | | | |
| Fill form fields | + | + | + | + | + | | | |
| Review | + | + | + | + | | + | | |
| Comment | + | + | + | + | + | + | + | |
| Lock files against co-authors | + | + | + | | | | | |
| View version history | + | + | + | + | | | | |
| Manage version history | + | + | + | | | | | |
| Create, edit and delete file links | + | + | | | | | | |
| View content and comments, copy, print, download | + | + | + | + | + | + | + | + |
| Save docxf as oform | + | + | + | | | | | |
| Delete, move and copy own files | + | + | + | | | | | |
| Delete, move, copy, rename other people's files | + | + | | | | | | |
| Copy files in from My documents | + | + | + | | | | | |

Third-party (provider) version history is nobody's, in any role.

### Archived rooms

Everything above collapses to reading: members, history, room info, content,
comments, copy, print and download for every role, plus version history for
RO RM CC Ed and copying files out into My documents for RO RM CC. Restoring and
deleting the room are the room owner's alone.

## Room-type deltas

Only the differences from the tables above.

**Virtual Data Room** has no reviewer and no commentator. Inviting users and
setting their role on invite narrow to RO RM, where an ordinary room lets every
role invite. It adds the PDF-form lifecycle: creating, uploading and configuring
filling are RO RM CC; editing forms adds Ed; seeing unconfigured forms is
RO RM CC Ed Vw; seeing configured forms one participates in adds FF.

**Form filling room** has only RO RM CC FF. Inviting narrows to RO RM the same
way, and viewing comments drops FF. Its own actions: starting and cancelling
collection, creating, uploading and editing PDF forms, and syncing results to a
spreadsheet are RO RM CC; enabling XLSX collection and database sync are RO RM;
the form list - running, in progress and completed - is visible to RO RM CC FF.

## Where the spreadsheet reads ambiguously, the code decides

Two rows are answered three different ways across the sheets. The code is right
in both, and this is what it does.

### Who may invite into a room

The client never asks "which role am I" for this. It asks the room itself:
`room.security.EditAccess`, computed per room by the API, gates the invite entry
points (`Members` panel, `RoomsItemTitle`, the empty-view actions). That is why
the same action can read as "every role" in the base sheet and as "owner and
manager only" for VDR and form filling rooms - the narrowing is the server's,
per room type, and the client follows whatever it is handed.

What the client does own is which role may then be *granted*:
`filterPaidRoleOptions` treats room owner and room manager as paid roles, so a
guest, a user or a group being invited has its access dropped to a free role
(`fixAccess`), and in an AI room a guest is forced to viewer. Read
`getAccessOptions` for the full list offered per room type.

So: to answer "may this person invite here", read `security.EditAccess` — never
re-derive it from a type or a role.

### Adding guests to groups

Nobody, and it is enforced by omission: the group member selector
(`CreateEditGroupDialog` -> `MembersSelector`) does not pass `withGuests`, so
`PeopleSelector` never shows the guests tab and only queries the People area.
Guests are not offered because they are not fetched, which is worth knowing
before "fixing" a selector that looks incomplete.

## Using this

- Both matrices are *product* rules, not implementation details: whatever
  decides visibility must ask the same question the route guard and the API ask,
  or the UI offers something that answers 403.
- E2E specs cover these by role rather than by flag - the mocked users are
  `owner`, `admin`, `roomAdmin`, `regular` (type *User*) and `visitor`
  (*Guest*); see `selfByTypeHandler` and `usersByType`.
- When a task touches one cell, read the whole row: the same action usually
  appears again for the archive, for the room roles and for a room type, and
  those copies drift apart one fix at a time.
