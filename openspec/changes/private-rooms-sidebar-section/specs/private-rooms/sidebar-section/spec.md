# Spec Delta

## Purpose

Defines the Private rooms section of the client sidebar. It covers when the section exists, which lists it shows, how private rooms are kept out of the Rooms section while it exists, how private rooms are opened and created inside it, and what a section built on the client alone cannot offer. Implementation: packages/client/src/components/ClientArticleSidebar, packages/client/src/routes/client.js, packages/client/src/store/filesStore (fetch and socket helpers), packages/client/src/pages/Home (header, filter, body, useFiles), packages/client/src/components/EmptyContainer, packages/client/src/helpers/{utils.js,articleNavigation.ts}, packages/shared/utils/{common.tsx,rooms.tsx}.

## ADDED Requirements

### Requirement: Section availability
The system SHALL make the Private rooms section available only while two conditions hold: the private-rooms opt-in was set when the page loaded, and the E2E rooms app is on for the portal. Every app is on in SaaS. The section reads the opt-in once per page load. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: Opt-in set and app on
- **WHEN** the page loads with the opt-in set on a portal where the E2E rooms app is on
- **THEN** the Private rooms section is available

#### Scenario: Opt-in absent
- **WHEN** the page loads without the opt-in
- **THEN** the Private rooms section is not available, whatever the state of the app

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and the Rooms section lists private rooms again

#### Scenario: Opt-in set after load
- **WHEN** the opt-in is set after the page loaded
- **THEN** the section stays unavailable until the page is reloaded

### Requirement: Sidebar item
The system SHALL show a top-level sidebar item labelled Common:PrivateRooms while the section is available, to every user whose sidebar shows the Rooms tree. The item SHALL be placed after Forms, or after Rooms when Forms is absent. It SHALL have exactly one sub-item, Archive (Common:Archive).

#### Scenario: Section available
- **WHEN** the sidebar renders while the section is available
- **THEN** a Private rooms item follows Forms, and expanding it shows only the Archive sub-item

#### Scenario: Item clicked
- **WHEN** the user clicks the Private rooms item
- **THEN** the private rooms list opens at `/private/filter`

#### Scenario: Section not available
- **WHEN** the sidebar renders while the section is not available
- **THEN** no Private rooms item is shown

### Requirement: Section addresses
The system SHALL serve the following section addresses:
- the list at `/private/filter`;
- a private room or a folder inside one at `/private/{id}/filter`;
- the archive at `/private/archived/filter`;
- an archived private room at `/private/archived/{id}/filter`.

The sidebar SHALL highlight Private rooms on the list and room addresses, and its Archive sub-item on the archive addresses.

#### Scenario: Archive address
- **WHEN** the user opens `/private/archived/filter`
- **THEN** the archived private rooms are listed and the Archive sub-item under Private rooms is highlighted

#### Scenario: Room address
- **WHEN** the user opens `/private/{roomId}/filter` for a private room they belong to
- **THEN** the room contents are shown and the Private rooms item is highlighted

### Requirement: Section addresses fall back to Rooms when the section is not available
The system SHALL open a `/private` address under the matching Rooms address when the section is not available, so a shared link to a private room keeps working. The list and room addresses map to `/rooms/shared`, and the archive addresses to `/rooms/archived`.

#### Scenario: Link opened without the opt-in
- **WHEN** a member of a private room opens `/private/{roomId}/filter` without the opt-in
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the room opens in the Rooms section

### Requirement: Section lists only private rooms
The system SHALL request the section list as active rooms with the privacy filter Private, and its Archive as archived rooms with the privacy filter Private. A room without the private setting MUST NOT appear in either list, whatever privacy value the address carries.

#### Scenario: List opened
- **WHEN** the user opens the Private rooms list
- **THEN** the rooms request carries `searchArea=Active` and `privacyFilter=Private`

#### Scenario: Address carries another privacy value
- **WHEN** the section list is opened with `privacyFilter=NotPrivate` in its address
- **THEN** the request still carries `privacyFilter=Private` and no non-private room is listed

#### Scenario: Connected third-party room
- **WHEN** the user has a room on connected third-party storage
- **THEN** that room is never listed in the Private rooms section

### Requirement: Rooms section excludes private rooms while the section is available
The system SHALL request the Rooms list and Rooms → Archive with the privacy filter NotPrivate while the Private rooms section is available, so a private room is listed only in its own section. While the section is not available, those lists SHALL carry no privacy filter and list private rooms as before.

#### Scenario: Section available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is available
- **THEN** the request carries `privacyFilter=NotPrivate` and no private room is listed

#### Scenario: Section not available
- **WHEN** the user opens Rooms while the section is not available
- **THEN** the request carries no privacy filter and private rooms are listed with their private badge

#### Scenario: Address asks Rooms for private rooms
- **WHEN** a Rooms address carrying `privacyFilter=Private` is opened while the section is available
- **THEN** the request carries `privacyFilter=NotPrivate`

#### Scenario: Room group opened in Rooms
- **WHEN** a room group that contains private rooms is opened in Rooms while the section is available
- **THEN** the private rooms of that group are not listed

### Requirement: Scope holds on every request of a list
The system SHALL apply the section's privacy scope to every rooms-list request of the Rooms and Private rooms lists. That includes the first page, further pages loaded on scroll, search, sorting and filter changes, and refreshes after live updates.

#### Scenario: Next page
- **WHEN** the user scrolls the Private rooms list to load the next page
- **THEN** the next-page request carries the same `privacyFilter=Private`

#### Scenario: Search in Rooms
- **WHEN** the user searches the Rooms list while the section is available
- **THEN** the search request carries `privacyFilter=NotPrivate`

### Requirement: No Recent, Favorites, Templates or Trash under the section
The system SHALL NOT offer Recent, Favorites, Templates or Trash under the Private rooms section in this version. The server can scope those listings only by folder type, and folder type does not tell private rooms apart. Content of private rooms SHALL keep appearing in the Recent, Favorites and Trash of the Rooms section.

#### Scenario: Section expanded
- **WHEN** the user expands the Private rooms item
- **THEN** Archive is the only sub-item

#### Scenario: Recently opened private file
- **WHEN** the user opens a file in a private room and then opens Rooms → Recent
- **THEN** the file is listed there

### Requirement: No new-items counter on the section item
The system SHALL NOT show a new-items counter on the Private rooms item or on its Archive sub-item in this version, because the section has no folder of its own to count against. A private room's own row in the list keeps its new-items badge.

#### Scenario: New file in a private room
- **WHEN** another member uploads a file into a private room the user belongs to
- **THEN** the Private rooms item shows no counter, and the room's row in the Private rooms list shows its new-items badge

### Requirement: Private rooms open inside the section
The system SHALL open a private room, and every folder inside it, under the section addresses while the section is available, whatever entry point led there. An address under `/rooms/shared` or `/rooms/archived` that turns out to hold a private room or one of its folders SHALL be replaced with its `/private` counterpart.

#### Scenario: Room clicked in the section
- **WHEN** the user opens a room from the Private rooms list
- **THEN** the address becomes `/private/{roomId}/filter`

#### Scenario: Rooms address of a private room
- **WHEN** `/rooms/shared/{roomId}/filter` is opened for a private room while the section is available
- **THEN** the address is replaced with `/private/{roomId}/filter` and the Private rooms item is highlighted

#### Scenario: Open location from Recent
- **WHEN** the user picks "Open location" on a file that lies in a folder of a private room
- **THEN** the folder opens under `/private/{folderId}/filter` with the Private rooms item highlighted

#### Scenario: Archived private room
- **WHEN** the user opens a room from Private rooms → Archive
- **THEN** the address becomes `/private/archived/{roomId}/filter` and the Archive sub-item stays highlighted

### Requirement: Navigation up stays in the section
The system SHALL take the user back to the Private rooms list when they go up from a private room's root with the breadcrumbs or the back button, or to its Archive for an archived private room. It SHALL NOT take them to the Rooms section.

#### Scenario: Back from a private room
- **WHEN** the user presses back at the root of a private room opened from the section
- **THEN** the Private rooms list at `/private/filter` opens

#### Scenario: Access to the open private room lost
- **WHEN** the user is removed from the private room they have open, or the server answers 403 for it
- **THEN** the Private rooms list opens, not the Rooms list

### Requirement: Non-private rooms do not open inside the section
The system SHALL replace a `/private` address that holds a room without the private setting, or one of its folders, with the matching `/rooms/shared` or `/rooms/archived` address. A non-private room is never shown under the Private rooms section.

#### Scenario: Hand-edited address
- **WHEN** the user opens `/private/{roomId}/filter` for a room without the private setting
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the Rooms item is highlighted

### Requirement: Section titles and path labels
The system SHALL show Common:PrivateRooms as the header title of the section list. The section's Archive SHALL show the same header as Rooms → Archive. Inside the section, the breadcrumb root and the root of the Location column SHALL read Common:PrivateRooms instead of the title of the Rooms folder.

#### Scenario: Section list header
- **WHEN** the Private rooms list is shown
- **THEN** the header title is Common:PrivateRooms

#### Scenario: Location column in a search
- **WHEN** a search in the section lists items with their location
- **THEN** each location path starts with Common:PrivateRooms

### Requirement: Private rooms are created from the section
The system SHALL open the create-room dialog directly on the Private room type, with the type locked, from every create entry point of the section:
- the header create button;
- the sidebar main button and the mobile create button;
- the empty-state button;
- "+ New" on the list.

A user without the right to create rooms SHALL see none of these entry points.

#### Scenario: Room admin creates from the section
- **WHEN** a room admin with an encryption key presses the create button in the Private rooms list
- **THEN** the create-room dialog opens on the Private room type with no type chooser and the type cannot be changed

#### Scenario: User without the room-creation right
- **WHEN** a user of type User or Guest opens the Private rooms list
- **THEN** no create entry point is offered

### Requirement: Generic chooser does not offer the Private type
The system SHALL NOT offer the Private room card, or the Private type in the type dropdowns, in any create-room chooser opened outside the Private rooms section. That covers the Rooms section, the dashboard and "+ New" in Rooms. The other room types SHALL be offered there as before.

#### Scenario: Create room in Rooms
- **WHEN** a room admin opens the create-room chooser from the Rooms section
- **THEN** the Private room card is absent and the other room types are offered

#### Scenario: Type dropdown after choosing a type
- **WHEN** the user opens the type dropdown of the create-room dialog started outside the section
- **THEN** the Private type is not offered

### Requirement: Section filter
The system SHALL NOT offer the room-type group, the third-party storage group or the room-group controls in the filter of the Private rooms list and its Archive. Search, owner, tags, quota and sorting SHALL work as in Rooms.

#### Scenario: Filter opened in the section
- **WHEN** the user opens the filter panel in the Private rooms list
- **THEN** no room-type or storage options are offered, and owner and tags filters are available

### Requirement: No room groups in the section
The system SHALL NOT offer room grouping in the Private rooms section in this version. There is no grouping toggle, no group chips, no pinned group and no "add to group" action.

#### Scenario: Context menu of a private room in the section
- **WHEN** the user opens the context menu of a private room in the Private rooms list
- **THEN** no create-group or add-to-group entry is offered

### Requirement: Section empty state
The system SHALL show the Private rooms empty state when the unfiltered section list is empty. Its title is EmptyView:EmptyRootPrivateRoomsTitle. Users who may create rooms SHALL see EmptyView:EmptyRootPrivateRoomsDescription and a create button. Other users SHALL see EmptyView:EmptyRootPrivateRoomsUserDescription and no button. An empty filtered list SHALL show the standard nothing-found view.

#### Scenario: Room admin without private rooms
- **WHEN** a room admin opens an empty Private rooms list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsTitle, EmptyView:EmptyRootPrivateRoomsDescription and a create button

#### Scenario: User without private rooms
- **WHEN** a user of type User opens an empty Private rooms list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsUserDescription and no create button

### Requirement: Info panel in the section
The system SHALL make the info panel available on the Private rooms list, on its Archive and inside private rooms. It SHALL show the same views and tabs as for the same item in Rooms.

#### Scenario: Nothing selected on the list
- **WHEN** the user opens the info panel on the Private rooms list with nothing selected
- **THEN** the panel shows its nothing-selected view instead of staying empty

#### Scenario: Private room selected
- **WHEN** the user selects a private room in the section with the info panel open
- **THEN** the panel shows the room's details and members

### Requirement: Live updates respect the split
The system SHALL insert a room that arrives through a live update only into the open list whose privacy scope it matches. That covers a room created, restored or shared with the user.

#### Scenario: Invited to a private room
- **WHEN** another user adds the current user to a private room while the Rooms list is open and the section is available
- **THEN** the room is not inserted into the Rooms list, and it is listed in Private rooms once that list is opened

#### Scenario: Ordinary room created in another tab
- **WHEN** the user creates a non-private room in another tab while the Private rooms list is open
- **THEN** the room is not inserted into the Private rooms list

### Requirement: E2E rooms entry points lead to the section
The system SHALL redirect `/e2e-rooms` to `/private/filter`, and `/e2e-rooms?section=archive` to `/private/archived/filter`, while the section is available. Launching the E2E rooms app SHALL open `/private/filter`. No client page SHALL frame the SDK private surface.

#### Scenario: Old bookmark
- **WHEN** the user opens `/e2e-rooms` while the section is available
- **THEN** the address is replaced with `/private/filter` and the native Private rooms list is shown

#### Scenario: Archive bookmark
- **WHEN** the user opens `/e2e-rooms?section=archive` while the section is available
- **THEN** the address is replaced with `/private/archived/filter`

### Requirement: Section is not a start page option
The system SHALL NOT offer the Private rooms section as a default start page in the file-management settings in this version.

#### Scenario: Default page setting
- **WHEN** the user opens the default start page setting while the section is available
- **THEN** Private rooms is not among the options
