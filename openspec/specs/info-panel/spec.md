# info-panel Specification

## Purpose

Defines the info panel of the Files, Rooms, Forms and Accounts sections as a frame: when it can be opened, which
tabs it offers for a selection, which tab it opens on and remembers, what it shows for no selection, several
items and items that cannot be shown, its header with the item's title, its width on a desktop, and the Details
tab of files, folders and rooms.

Server counterpart: none; the panel shows what the item lists already carry. The contents of the other tabs belong
to their own capabilities: Share (`shared-links`, `file-sharing`), the room's members (`room-role-permissions`,
`invitations`), History (`history-and-audit`), Metadata (`metadata`), plugin tabs (`plugins`), the Accounts views
(`people-and-groups`), the template gallery panel (`template-gallery`). The tabs and views of AI agents, knowledge
bases and skill sets are specified by the change `ai-chat-agents-design`; private rooms by
`private-rooms/room-membership`.

Implementation: `packages/client/src/pages/Home/InfoPanel` (Header, Body, views/Details), the tab rules in
`packages/client/src/helpers/info-panel/tabs.ts`, the panel state in `packages/client/src/store/InfoPanelStore.ts`,
the width in `packages/client/src/helpers/info-panel/width.ts`.

## Requirements

### Requirement: Where the panel can be opened

The info panel SHALL be available in the Files, Rooms and Forms sections and in Accounts, and SHALL NOT be
available on a page that a plugin adds. Its header SHALL be titled `Common:Info` and carry a close button that hides
the panel.

#### Scenario: Plugin page

- **WHEN** a user is on a page added by a plugin
- **THEN** the info panel cannot be shown

#### Scenario: Close

- **WHEN** a user presses the close button in the panel header
- **THEN** the panel is hidden

### Requirement: Tabs of a room

For a room of the Rooms section or the Archive, the panel SHALL offer the room's members first (`Common:Contacts`),
then `Common:SubmenuHistory` and `Common:SubmenuDetails`, then `Common:SubmenuMetadata` when the room supports
metadata, then the matching plugin tabs. A room template SHALL offer only its access list (`Common:Accesses`) and
Details. A room opened from Recent SHALL be treated as a file-list item, not a room.

#### Scenario: Custom room

- **WHEN** a user selects a Custom room in the Rooms list
- **THEN** the tabs are Contacts, History and Details, followed by Metadata when the room supports it

#### Scenario: Room template

- **WHEN** a user selects a room template
- **THEN** the tabs are Accesses and Details

### Requirement: Tabs of a file or folder

For a file or folder the panel SHALL offer `Common:Share` first when the item's `canShare` is true, and SHALL NOT
offer it for a private or encrypted item, an item inside a private room or an item of the AI section; then History
and Details, then Metadata when the item supports it, then the matching plugin tabs.

#### Scenario: Shareable document

- **WHEN** a user selects a document in My documents that may be shared
- **THEN** the tabs are Share, History, Details and Metadata

#### Scenario: Encrypted file

- **WHEN** a user selects an encrypted file
- **THEN** no Share tab and no plugin tab is offered

### Requirement: Selections without tabs

The panel SHALL show no tabs, and only the view that fits, for an item in the Trash (Details), for several selected
items, for the root folder of a section, for an item reached by an expired external link and for a shared room that
still asks for its password.

#### Scenario: Item in the Trash

- **WHEN** a user selects a file in the Trash
- **THEN** the panel shows its Details without tabs

### Requirement: The tab the panel opens on

Opening the panel from the header of a room, or of a folder inside a room, the Archive included, SHALL open it on
the room's members; opening it otherwise SHALL open it on Details. A tab the user picks SHALL be remembered
separately for rooms and for files and folders, the Share tab of a file and the members of a room counting as the
same pick; a remembered tab the next selection does not offer SHALL give way to its first tab.

#### Scenario: Room opened from its header

- **WHEN** a user inside a room opens the info panel from the section header
- **THEN** the panel opens on the room's members

#### Scenario: Remembered tab not available

- **WHEN** a user picked Share for a file and then selects a file that cannot be shared
- **THEN** the panel shows that file's first available tab

### Requirement: Nothing selected

With nothing selected, the panel SHALL show the empty view of the section: the rooms text
(`InfoPanel:RoomsEmptyScreenTent`) in Rooms and Forms, the files text (`Common:FilesEmptyScreenText`) in Files,
the gallery text (`InfoPanel:GalleryEmptyScreenText`) for room templates, and the Accounts texts for people, groups
and guests.

#### Scenario: Rooms section

- **WHEN** the panel is open in the Rooms list and nothing is selected
- **THEN** the rooms empty text is shown

### Requirement: Several items selected

With more than one item selected, the panel SHALL show how many are selected (`Common:ItemsSelected`; in Accounts
`InfoPanel:SelectedUsers` or `InfoPanel:SelectedGroups`) and no tabs.

#### Scenario: Three files

- **WHEN** a user selects three files with the panel open
- **THEN** the panel shows that three items are selected and offers no tabs

### Requirement: Items that cannot be shown

For an item reached by an external link that has expired the panel SHALL show that it is not available, worded for
a file, a folder or a room (`Common:FileLinkExpired`, `Common:FolderLinkExpired`, `Common:RoomLinkExpired`); for a
shared room that still asks for its password it SHALL show `Common:NeedPassword` with `Common:EnterPassword`.

#### Scenario: Expired room link

- **WHEN** a user selects a room they reached by a link that has expired
- **THEN** the panel shows `Common:RoomNotAvailable` with `Common:RoomLinkExpired`

### Requirement: Item title in the panel

The panel SHALL show the selected item's icon or room logo and its full title, and SHALL follow the selection: a new
selection SHALL replace the title even when a browser extension has changed the title's markup.

#### Scenario: Title after an extension split it

- **WHEN** a browser extension wrapped part of the selected room's title in its own element and the user selects another item
- **THEN** the title shows the newly selected item's name only

### Requirement: Room logo in the panel

A user whose rights on the room include `EditRoom` SHALL be able to change its logo from the panel; others SHALL
see the logo without the edit control. A rejected logo save SHALL show the server's error and leave the room list as
it was.

#### Scenario: Logo save rejected

- **WHEN** the server rejects the new logo of a room
- **THEN** its error message is shown and the room list still shows every room

### Requirement: Panel width on a desktop

On a desktop layout the panel SHALL be resizable from its edge, by mouse or by finger, between 400 and 800 pixels,
always leaving the file list at least 416 pixels and its name column at least 210. The width SHALL be kept across
reloads; a click on the edge SHALL keep it and a double click SHALL restore 400. Below the desktop layout the panel
SHALL have no resizable edge.

#### Scenario: Widening and the cap

- **WHEN** a user drags the panel's edge 200 pixels outwards and reloads
- **THEN** the panel is 600 pixels wide after the reload
- **AND** dragging further stops at 800 pixels

#### Scenario: Smaller window

- **WHEN** the window shrinks so that the saved width would leave the list less than 416 pixels
- **THEN** the panel narrows to fit without changing the saved width, and widens back when the window grows

#### Scenario: Tablet or phone

- **WHEN** the layout is a tablet or a phone
- **THEN** the panel has no edge to drag

### Requirement: Floating launchers beside the panel

The live chat launcher SHALL move clear of the info panel as the panel widens, and clear of the docked AI chat, and
SHALL return when the panel or the chat closes.

#### Scenario: Panel widens

- **WHEN** the info panel is widened with the live chat launcher on screen
- **THEN** the launcher moves so that the panel does not cover it

### Requirement: Details of a room

The Details tab of a room SHALL show its owner, its storage type for a third-party room, its type, its content as
counts of folders and files, its modification and creation dates with who last modified it, its tags (also with
none yet, when the user may add one) and its storage use. The counts SHALL follow socket events for the room without
counting one upload twice, and SHALL be taken from the server when it sends them.

#### Scenario: Upload counted once

- **WHEN** a file is uploaded to the selected room and the socket event arrives before the upload finishes
- **THEN** the content shows one more file, not two

#### Scenario: Room without a security object

- **WHEN** the selected room comes without its security rights
- **THEN** the Details tab still renders without an error

### Requirement: Details of a file or folder

The Details tab of a folder SHALL show its owner, type, content, dates and last editor, and, when present, its index,
author, who shared it and the user's access level. The Details tab of a file SHALL show its owner, type, extension,
size, dates and last editor, its versions and comment, and, when present, its resolution, lifetime end, index,
author, who shared it, access level and the linked table name.

#### Scenario: Shared file

- **WHEN** a user selects a file in Shared with me
- **THEN** Details shows who shared it and the user's access level

#### Scenario: Version comment without the right

- **WHEN** the selected file does not grant the right to edit its history
- **THEN** its version comment is shown without the edit control
