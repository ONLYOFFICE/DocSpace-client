# files-navigation Specification

## Purpose

Defines how a user moves around the Files, Rooms and Forms sections of the web client: the page opened at sign-in,
the section a folder or room belongs to, how a list is loaded, viewed, sorted, filtered, searched and selected, how it
follows changes made elsewhere, and what happens when the user loses access while inside a room.

Server counterpart: none as a whole; the lists come from the folder and room listings of
`../server/openspec/specs/file-operations` and `../server/openspec/specs/room-types`, and the live changes from the
socket events the server sends. Operations called: `getFolderByFolderId`, `getRootFolders`, `getRoomsFolder`,
`getFolderInfo`, `getFileInfo`.

Out of scope: keyboard navigation and hotkeys (`keyboard-and-hotkeys`); the info panel (`info-panel`); what each entry's
menu offers (`room-role-permissions`, `user-type-permissions`); the actions themselves (`file-operations`); Shared with
me, Recent and Favorites (`file-sharing`); room groups and room types (`room-types`); which apps and sections a portal
has (`apps`); the header and sidebar layout (`app-shell`); metadata filters (`metadata`); private rooms
(`private-rooms/sidebar-section`); the AI sections (change `ai-chat-agents-design`).

Implementation: `packages/client/src/store/FilesStore.ts` and `filesStore/`, `packages/client/src/store/SelectedFolderStore.ts`,
`packages/client/src/helpers/{defaultStartPage,sectionTrashNavigation,formsSectionNavigation,getSectionCreateButton}`,
`packages/client/src/pages/Home/Section`, `packages/client/src/components/EmptyContainer`.

## Requirements

### Requirement: The page opened at sign-in

The client SHALL open the start page the portal stores when that section is still available to the user, and the
Home overview otherwise or when nothing is stored. A guest SHALL never be routed to the Files section. A start page of
Private SHALL open Rooms while private rooms are not available, and Home when Rooms is off too. Inside an OAuth frame
the client SHALL open Rooms instead of the overview unless a section is named explicitly.

#### Scenario: Nothing stored

- **WHEN** a user signs in on a portal with no stored start page
- **THEN** the Home overview opens

#### Scenario: Guest with Files stored

- **WHEN** a guest signs in and the stored start page is the Files section
- **THEN** Home opens instead

#### Scenario: Section switched off

- **WHEN** the stored start page is a section whose app is switched off
- **THEN** Home opens

### Requirement: The section an item belongs to

A Form filling room and the folders inside it SHALL be shown under Forms, whichever section it was created or opened
from; any other room SHALL stay under Rooms. Section roots and non-room sections seen from a Forms route SHALL keep their
own section.

#### Scenario: Form room created from Rooms

- **WHEN** a user creates a Form filling room from the Rooms section
- **THEN** the room opens under Forms

### Requirement: The Trash of a section

Each section SHALL have its own Trash: an item deleted inside a room SHALL be found in the Rooms Trash, inside a Form
filling room in the Forms Trash, and in My documents in the My documents Trash.

#### Scenario: Deleted in a room

- **WHEN** a user follows the link of the deletion toast for a file deleted inside a room
- **THEN** the Rooms Trash opens

### Requirement: The create button of a section

In a folder where the user may create, the section header SHALL offer New with the folder's create menu.

#### Scenario: Ordinary folder

- **WHEN** a user opens a folder where they may create
- **THEN** the header offers New with its create menu

### Requirement: Views of a list

A list SHALL be shown as a table, rows or tiles, as the user chose; the choice SHALL be kept in the browser. Switching
to tiles SHALL request the thumbnails of the entries shown. A layout that does not fit the chosen view (a phone, a room
type with a fixed view) SHALL show the view that fits instead.

#### Scenario: Tiles

- **WHEN** a user switches the list to tiles
- **THEN** the choice is kept and thumbnails are requested for the entries

### Requirement: Sorting and filtering

Applying a filter SHALL reset the list to its first page. The sort a user picks SHALL be saved for that user and used
next time. The Rooms list SHALL be loaded 100 rooms per page.

#### Scenario: Sort kept

- **WHEN** a user sorts My documents by size and reloads the page
- **THEN** the list is sorted by size again

### Requirement: Loading a list in pages

A list SHALL load its next page when the user scrolls to its end, until the server reports no more entries.

#### Scenario: Long folder

- **WHEN** a user scrolls to the end of a folder holding more entries than one page
- **THEN** the next page is appended

### Requirement: Search in a list

Typing in the search field SHALL filter the list after a short pause, without losing the text being typed or the caret,
also when the result is empty and the empty view appears.

#### Scenario: Empty result

- **WHEN** the search resolves to no result while the user keeps typing
- **THEN** the caret stays in the field and the typing continues

### Requirement: Selecting entries

A click on an entry's checkbox SHALL toggle it in the selection; Shift SHALL select the range between the caret and the
entry. The header checkbox SHALL select all entries or all entries of one kind (documents, images, rooms of a type).
Entries an operation is working on SHALL not be selected by such a choice.

#### Scenario: Range

- **WHEN** a user selects a file, then Shift-clicks a file three rows lower
- **THEN** the four files are selected

#### Scenario: Documents only

- **WHEN** a user chooses Documents in the header checkbox menu
- **THEN** only the documents of the list are selected

### Requirement: Following changes made elsewhere

The open list SHALL follow the server's socket events: a file created in the open folder SHALL appear, a deleted entry
SHALL disappear unless an own operation is moving it into the folder, an updated entry SHALL be re-read, a room created by
another user SHALL be added to Rooms or to Forms by its type, and the folder's counts SHALL be taken from the server.
When the open template is removed, the client SHALL return to its templates listing.

#### Scenario: File created by another user

- **WHEN** another user creates a file in the folder the user has open
- **THEN** the file appears in the list

#### Scenario: Form room created elsewhere

- **WHEN** another user creates a Form filling room the user can see
- **THEN** it is added to the Forms list and not to the Rooms list

#### Scenario: Own access changed

- **WHEN** the server reports that the user's access to the open folder changed
- **THEN** the folder is reloaded

### Requirement: Losing access inside a room

A request refused inside a room SHALL keep the room open and show a single error toast. When the user's type is lowered,
noticed by a refused request or a socket reconnect, the client SHALL stay in the room and show a dismissible bar that
offers to reload; a raised or unchanged type SHALL show no bar. Inside a subfolder, such events SHALL re-read the room's
rights.

#### Scenario: Refused request

- **WHEN** a request for the open room's data is refused
- **THEN** the room stays open and one "Access denied" toast is shown

#### Scenario: Type lowered

- **WHEN** a socket event tells that the user's type was lowered
- **THEN** a bar offers to reload and the user stays in the room

### Requirement: Empty views

A section or folder without entries SHALL show the empty view of its kind, and a filter or search with no result SHALL
show the empty view for no results.

#### Scenario: Empty Favorites

- **WHEN** a user opens Favorites with no favorite entry
- **THEN** the empty view of Favorites is shown
