# Private Rooms Sidebar Section Specification

## Purpose

Defines the Private section of the client sidebar. It covers:
- when the section exists and which lists it shows;
- how private rooms are kept out of the Rooms section while it exists;
- how private rooms are opened, left and created inside it;
- the rule that encryption never depends on the section;
- what a section built on the client alone cannot offer.

Implementation: packages/client/src/components/ClientArticleSidebar, packages/client/src/routes/client.js, packages/client/src/store/filesStore (fetch, mutations and socket helpers), packages/client/src/store/filesActionsStore (navigation and rooms helpers), packages/client/src/pages/Home (header, filter, body, useFiles, useQuickActions), packages/client/src/components/EmptyContainer, packages/client/src/helpers/{utils.js,articleNavigation.ts,quickActions.ts}, packages/shared/utils/{common.tsx,rooms.tsx}.

## Requirements

### Requirement: Section availability
The system SHALL make the Private section available only while two conditions hold: the private-rooms opt-in was set when the page loaded, and the E2E rooms app is on for the portal. Every app is on in SaaS. The section reads the opt-in once per page load. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: Opt-in set and app on
- **WHEN** the page loads with the opt-in set on a portal where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Opt-in absent
- **WHEN** the page loads without the opt-in
- **THEN** the Private section is not available, whatever the state of the app

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and the Rooms section lists private rooms again

#### Scenario: Opt-in set after load
- **WHEN** the opt-in is set after the page loaded
- **THEN** the section stays unavailable until the page is reloaded

### Requirement: Sidebar item
The system SHALL show a top-level sidebar item labelled Common:Private while the section is available, to every user whose sidebar shows the Rooms tree. The item SHALL be placed after Forms (after Rooms when Forms is absent) and before AI Agents. It SHALL have exactly one sub-item, Archive (Common:Archive).

#### Scenario: Section available
- **WHEN** the sidebar renders while the section is available
- **THEN** a Private item follows Forms and precedes AI Agents, and expanding it shows only the Archive sub-item

#### Scenario: Item clicked
- **WHEN** the user clicks the Private item
- **THEN** the private rooms list opens at `/private/filter`

#### Scenario: Section not available
- **WHEN** the sidebar renders while the section is not available
- **THEN** no Private item is shown

### Requirement: Section addresses
The system SHALL serve these section addresses:
- the list at `/private/filter`;
- a private room or a folder inside one at `/private/{id}/filter`;
- the archive at `/private/archived/filter`;
- an archived private room or a folder inside one at `/private/archived/filter?folder={id}`, the same form Rooms → Archive uses.

The sidebar SHALL highlight Private on the list and room addresses, and its Archive sub-item on the archive addresses.

#### Scenario: Archive address
- **WHEN** the user opens `/private/archived/filter`
- **THEN** the archived private rooms are listed and the Archive sub-item under Private is highlighted

#### Scenario: Room address
- **WHEN** the user opens `/private/{roomId}/filter` for a private room they belong to
- **THEN** the room contents are shown and the Private item is highlighted

#### Scenario: Archived room address
- **WHEN** the user opens `/private/archived/filter?folder={roomId}` for an archived private room they belong to
- **THEN** the room contents are shown and the Archive sub-item under Private is highlighted

### Requirement: Section addresses fall back to Rooms when the section is not available
The system SHALL open a `/private` address under the matching Rooms address, keeping its query, when the section is not available, so a shared link to a private room keeps working. The list and room addresses map to `/rooms/shared`, and the archive addresses to `/rooms/archived`.

#### Scenario: Link opened without the opt-in
- **WHEN** a member of a private room opens `/private/{roomId}/filter` without the opt-in
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the room opens in the Rooms section

### Requirement: Section lists only private rooms
The system SHALL request the section list as active rooms with the privacy filter Private, and its Archive as archived rooms with the privacy filter Private. Both values SHALL come from the address category, whatever privacy filter or search area the address query carries. A room without the private setting MUST NOT appear in either list.

#### Scenario: List opened
- **WHEN** the user opens the Private list
- **THEN** the rooms request carries `searchArea=Active` and `privacyFilter=Private`

#### Scenario: Address carries another privacy value
- **WHEN** the section list is opened with `privacyFilter=NotPrivate` in its address
- **THEN** the request still carries `privacyFilter=Private` and no non-private room is listed

#### Scenario: Archive address carries the active search area
- **WHEN** `/private/archived/filter?searchArea=Active` is opened
- **THEN** the request carries `searchArea=Archive` and only archived private rooms are listed

#### Scenario: Connected third-party room
- **WHEN** the user has a room on connected third-party storage
- **THEN** that room is never listed in the Private section

### Requirement: Rooms section excludes private rooms while the section is available
The system SHALL request the Rooms list and Rooms → Archive with the privacy filter NotPrivate while the Private section is available, so a private room is listed only in its own section. While the section is not available, those lists SHALL carry no privacy filter and list private rooms as before.

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

#### Scenario: Room group editor in Rooms
- **WHEN** the user edits the room groups of the Rooms section while the Private section is available
- **THEN** private rooms are not offered for grouping

### Requirement: Scope holds on every request of a list
The system SHALL apply the section's privacy filter and search area to every rooms-list request of the Rooms and Private lists. That covers:
- the first page and further pages loaded on scroll;
- search, sorting and filter changes;
- refreshes after live updates;
- the refill requests made after rooms leave a list by archiving, restoring, deleting or leaving.

#### Scenario: Next page
- **WHEN** the user scrolls the Private list to load the next page
- **THEN** the next-page request carries the same `privacyFilter=Private`

#### Scenario: Search in Rooms
- **WHEN** the user searches the Rooms list while the section is available
- **THEN** the search request carries `privacyFilter=NotPrivate`

#### Scenario: Refill after archiving
- **WHEN** the user archives a room in a Private list that has more rooms than one page
- **THEN** the refill request carries `privacyFilter=Private` and only private rooms move up into the list

#### Scenario: Restore from the archive
- **WHEN** the user restores a private room from Private → Archive
- **THEN** the user stays in Private → Archive, whose refreshed list requests `searchArea=Archive` with `privacyFilter=Private` and no longer contains the room

### Requirement: No Recent, Favorites, Templates or Trash under the section
The system SHALL NOT offer Recent, Favorites, Templates or Trash under the Private section, because private content never reaches them:
- favorites are withheld for it;
- deletion in a private room bypasses Trash;
- the server does not record encrypted files as recent;
- a private room cannot become a template.

#### Scenario: Section expanded
- **WHEN** the user expands the Private item
- **THEN** Archive is the only sub-item

### Requirement: No new-items counter on the section item
The system SHALL NOT show a new-items counter on the Private item or on its Archive sub-item in this version, because the section has no folder of its own to count against. A private room's own row in the list keeps its new-items badge.

#### Scenario: New file in a private room
- **WHEN** another member uploads a file into a private room the user belongs to
- **THEN** the Private item shows no counter, and the room's row in the Private section list shows its new-items badge

### Requirement: Rooms counter keeps counting private rooms
The system SHALL keep counting new items of private rooms in this version, because the server counts them under the Rooms root. This covers the Rooms item's new-items counter, its new-items panel and its mark-all-as-read. An item opened from that panel SHALL open under the Private section.

#### Scenario: New file in a private room
- **WHEN** another member uploads a file into a private room while the section is available
- **THEN** the Rooms item's counter grows, and opening that entry from its new-items panel shows the file under `/private`

### Requirement: Private rooms open inside the section
The system SHALL open a private room, and every folder inside it, under the section addresses while the section is available, whatever entry point led there. A Rooms address (`/rooms/shared/{id}/filter`, `/rooms/shared/filter?folder={id}` or `/rooms/archived/filter?folder={id}`) that turns out to hold a private room or one of its folders SHALL be replaced with its `/private` counterpart. This SHALL hold even while the Rooms app is switched off.

#### Scenario: Room clicked in the section
- **WHEN** the user opens a room from the Private list
- **THEN** the address becomes `/private/{roomId}/filter`

#### Scenario: Row link opened in a new tab
- **WHEN** the user opens a private room's row link in a new tab
- **THEN** the new tab opens `/private/{roomId}/filter` directly

#### Scenario: Rooms address of a private room
- **WHEN** `/rooms/shared/{roomId}/filter` is opened for a private room while the section is available
- **THEN** the address is replaced with `/private/{roomId}/filter` and the Private item is highlighted

#### Scenario: Archived room link
- **WHEN** `/rooms/archived/filter?folder={roomId}` is opened for an archived private room while the section is available
- **THEN** the address is replaced with `/private/archived/filter?folder={roomId}`

#### Scenario: Row link of the Rooms list
- **WHEN** `/rooms/shared/filter?folder={roomId}`, the row link form of the Rooms list, is opened for a private room while the section is available
- **THEN** the address is replaced with `/private/{roomId}/filter`, and the header shows the room's title, not the section name

#### Scenario: Open location from a feed
- **WHEN** the user picks "Open location" on a file that lies in a folder of a private room
- **THEN** the folder opens under `/private/{folderId}/filter` with the Private item highlighted and the file highlighted

#### Scenario: Back from the editor
- **WHEN** the user closes the editor of a file in a private room through its back link
- **THEN** the file's folder opens under `/private`

#### Scenario: Rooms app switched off
- **WHEN** an e-mail link to a private room under `/rooms/shared` is opened on a standalone portal where the Rooms app is off and the section is available
- **THEN** the room opens under `/private` instead of the dashboard

#### Scenario: Rooms list with the Rooms app off
- **WHEN** a Rooms address that names no folder, such as `/rooms/shared/filter` or `/rooms/shared/{id}/filter` without `folder`, is opened on a standalone portal where the Rooms app is off and the section is available
- **THEN** the dashboard opens, as it does without the section, and the Rooms list is not shown

### Requirement: Section addresses are decided before the folder is shown
The system SHALL decide whether an address belongs to the Rooms or the Private section before showing the folder. A corrected address therefore:
- shows no Rooms state first;
- raises its notices, such as the missing-key warning, once;
- keeps the highlight that the entry point asked for;
- never alternates between the two sections.

Addresses inside an embedded frame SHALL be decided the same way.

#### Scenario: Cold link to a private room
- **WHEN** a member opens `/rooms/shared/{roomId}/filter` for a private room without keys on this device
- **THEN** the room appears under `/private` without first showing Rooms, and the missing-key warning is shown once

#### Scenario: Section not available
- **WHEN** a Rooms address of a private room is opened while the section is not available
- **THEN** the room opens under Rooms and the address is not changed again

#### Scenario: Embedded frame
- **WHEN** a Rooms address of a private room is opened in the client inside an embedded frame while the section is available
- **THEN** the address is replaced with its `/private` counterpart and the room opens there, as outside a frame

### Requirement: Private section in an embedded frame
The system SHALL offer the Private section to the client running inside an embedded frame under the same availability as outside a frame. A frame opened at a `/private` address SHALL show the Private list or the private room it names, and a frame that shows the menu SHALL show the Private item in it.

#### Scenario: Frame opened in the Private section
- **WHEN** a host embeds the client with the root path `/private/` while the section is available
- **THEN** the frame shows the Private list and its requests carry `privacyFilter=Private`

#### Scenario: Frame showing the menu
- **WHEN** a host embeds the client with the menu shown while the section is available
- **THEN** the frame's menu contains the Private item

### Requirement: Navigation up and out stays in the section
The system SHALL take the user from a private room to the Private list, or to Private → Archive for an archived private room, whenever they go up or are sent away. That covers breadcrumbs, the back button and Backspace, leaving the room, losing access, and the no-access view. It SHALL NOT take them to the Rooms section.

#### Scenario: Back from a private room
- **WHEN** the user presses back or Backspace at the root of a private room opened from the section
- **THEN** the Private list at `/private/filter` opens

#### Scenario: Leave a private room
- **WHEN** a member who is not an administrator leaves the private room they have open, alone or together with an owner change
- **THEN** the Private list opens, not the Rooms list

#### Scenario: Access to the open private room lost
- **WHEN** the user is removed from the private room they have open, or the server answers 403 for it
- **THEN** the Private list opens, not the Rooms list

#### Scenario: Removed from an archived private room
- **WHEN** the user loses access to an archived private room they have open
- **THEN** Private → Archive opens, not Rooms → Archive

#### Scenario: No-access view
- **WHEN** a `/private` address leads to a room that no longer exists or cannot be opened
- **THEN** the no-access view names the Private section (Common:Private), and both its button and its automatic redirect lead to the Private list

#### Scenario: No-access view offers no room types
- **WHEN** the no-access view of a private room is shown under `/private`
- **THEN** no tile or option for creating a room of the Rooms room types (Collaboration, Public, Custom, Virtual Data Room, from a template) is shown above it, and the redirect note reads as a sentence with the section name (Files:RoomAccessRedirectNote)

### Requirement: Non-private locations do not open inside the section
The system SHALL open a room without the private setting, or a folder outside private rooms, under its Rooms or Files address even when the link starts inside the Private section. A `/private` address that holds such a location SHALL be replaced with the matching Rooms address.

#### Scenario: Hand-edited address
- **WHEN** the user opens `/private/{roomId}/filter` for a room without the private setting
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the Rooms item is highlighted

#### Scenario: New file of an ordinary room opened from the section
- **WHEN** the user, inside the Private section, opens the location of a new file of an ordinary room from the new-items panel of Rooms
- **THEN** the file's folder opens under its Rooms address directly, without passing through `/private`

### Requirement: Section titles and path labels
The system SHALL show Common:Private as the header title of the section list, and as the page title the browser shows for it. The section's Archive SHALL show the same header as Rooms → Archive. Inside the section, the breadcrumb root SHALL read Common:Private instead of the title of the Rooms folder. Folders inside a private room SHALL keep the room's title row in the header, as in Rooms.

#### Scenario: Section list header
- **WHEN** the Private list is shown
- **THEN** the header title is Common:Private

#### Scenario: Browser tab title
- **WHEN** the Private list is shown
- **THEN** the browser tab reads Common:Private, not the title of the Rooms section

#### Scenario: Breadcrumb root in a private room
- **WHEN** the user opens the breadcrumbs of a folder inside a private room
- **THEN** their root reads Common:Private

#### Scenario: Folder inside a private room
- **WHEN** the user opens a folder inside a private room
- **THEN** the header shows the room's title row as it does for a folder inside an ordinary room

### Requirement: Private rooms are created from the section
The system SHALL open the create-room dialog directly on the Private room type, with the type locked, from every create entry point of the section:
- the header create button and the header "+" on an empty page;
- the mobile create button;
- "+ New" and the context menu of empty space in the list;
- the empty-state button and the quick-action tile;
- the Shift+R hotkey.

A user without the right to create rooms SHALL get none of these entry points.

#### Scenario: Room admin creates from the section
- **WHEN** a room admin with an encryption key presses the create button in the Private list
- **THEN** the create-room dialog opens on the Private room type with no type chooser and the type cannot be changed

#### Scenario: Hotkey in the section
- **WHEN** a room admin presses Shift+R on the Private list
- **THEN** the create-room dialog opens on the Private room type, not on the generic chooser

#### Scenario: User without the room-creation right
- **WHEN** a user of type User or Guest opens the Private list
- **THEN** no create entry point is offered and Shift+R does nothing

### Requirement: Quick actions in the section
The system SHALL show only a Private room tile in the quick-action banner of the Private list, to users who may create rooms. The banner SHALL NOT offer any other room type, a room template or an AI tile there. Users who may not create rooms SHALL see no banner in the section.

#### Scenario: Banner on a non-empty Private list
- **WHEN** a room admin opens a non-empty Private list with quick actions enabled
- **THEN** the banner shows only the Private room tile, and choosing it opens the create-room dialog on the Private type

### Requirement: Generic chooser does not offer the Private type
The system SHALL NOT offer the Private room card, or the Private type in the type dropdowns, in any create-room chooser opened outside the Private section. That covers the Rooms section, the dashboard and "+ New" in Rooms. The other room types SHALL be offered there as before.

#### Scenario: Create room in Rooms
- **WHEN** a room admin opens the create-room chooser from the Rooms section
- **THEN** the Private room card is absent and the other room types are offered

#### Scenario: Type dropdown after choosing a type
- **WHEN** the user opens the type dropdown of the create-room dialog started outside the section
- **THEN** the Private type is not offered

### Requirement: Encryption does not depend on the section
The system SHALL decide encryption, key checks, transfer rules and withheld actions from the private setting of the room and its folders, never from the section address. An address under `/private` MAY withhold more than the folder data does, and SHALL NOT withhold less.

#### Scenario: Private room opened under Rooms
- **WHEN** a member opens a private room under `/rooms/shared` while the section is not available and uploads a file
- **THEN** the file is encrypted on the client exactly as under `/private`, and the actions withheld in private rooms stay withheld

#### Scenario: Address adds a restriction
- **WHEN** the user is on the Private list, where no private room is open
- **THEN** the AI chat is still not offered, because the address withholds it

### Requirement: No AI chat in the section
The system SHALL NOT offer the AI chat button or any AI quick-action tile on a Private section address. That covers the list, its Archive, and the rooms and folders under both.

#### Scenario: Private list
- **WHEN** the user opens the Private list or Private → Archive
- **THEN** no AI chat button or AI tile is shown

### Requirement: Section filter
The system SHALL NOT offer the room-type group, the third-party storage group or the room-group controls in the filter of the Private section list and its Archive. Search, owner, tags, quota and sorting SHALL work as in Rooms.

#### Scenario: Filter opened in the section
- **WHEN** the user opens the filter panel in the Private list
- **THEN** no room-type or storage options are offered, and owner and tags filters are available

### Requirement: No room groups in the section
The system SHALL NOT offer room grouping in the Private section in this version. There is no grouping toggle, no group chips, no pinned group and no "add to group" action.

#### Scenario: Context menu of a private room in the section
- **WHEN** the user opens the context menu of a private room in the Private list
- **THEN** no create-group or add-to-group entry is offered

### Requirement: Section empty state
The system SHALL show the Private section empty state when the unfiltered section list is empty:
- its title is EmptyView:EmptyRootPrivateRoomsTitle;
- users who may create rooms SHALL see EmptyView:EmptyRootPrivateRoomsDescription and only a create button, with no invite, import or AI entries;
- other users SHALL see EmptyView:EmptyRootPrivateRoomsUserDescription and no button.

An empty filtered list SHALL show the standard nothing-found view.

#### Scenario: Room admin without private rooms
- **WHEN** a room admin opens an empty Private list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsTitle, EmptyView:EmptyRootPrivateRoomsDescription and a create button as its only option

#### Scenario: User without private rooms
- **WHEN** a user of type User opens an empty Private list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsUserDescription and no create button

### Requirement: Private archive empty state stays in the section
The system SHALL NOT offer a way to the Rooms section in the empty state of Private → Archive. An option to go back, when offered, SHALL open the Private list.

#### Scenario: Empty Private archive
- **WHEN** the user opens an empty Private → Archive
- **THEN** no option leads to the Rooms section; an option to go back, if offered, reads Common:GoToSection with the section name Common:Private and opens the Private list

### Requirement: No onboarding tour in the section
The system SHALL NOT start the Rooms onboarding tour, or show its stand-in rooms, on a Private section address.

#### Scenario: Pending Rooms tour
- **WHEN** a user whose Rooms tour has not run yet opens the Private list
- **THEN** the tour does not start there

### Requirement: Info panel in the section
The system SHALL make the info panel available on the Private section list, on its Archive and inside private rooms. It SHALL show the same views and tabs as for the same item in Rooms.

#### Scenario: Nothing selected on the list
- **WHEN** the user opens the info panel on the Private section list with nothing selected
- **THEN** the panel shows its nothing-selected view instead of staying empty

#### Scenario: Private room selected
- **WHEN** the user selects a private room in the section with the info panel open
- **THEN** the panel shows the room's details and members

### Requirement: Live updates respect the split
The system SHALL insert a room that arrives through a live update only into the open list whose privacy scope it matches. That covers a room created, restored or shared with the user. The client SHALL read the room's private setting from the room itself, because the live event does not carry it.

#### Scenario: Invited to a private room
- **WHEN** another user adds the current user to a private room while the Rooms list is open and the section is available
- **THEN** the room is not inserted into the Rooms list, and it is listed in Private once that list is opened

#### Scenario: Ordinary room created in another tab
- **WHEN** the user creates a non-private room in another tab while the Private list is open
- **THEN** the room is not inserted into the Private list

### Requirement: E2E rooms entry points lead to the section
The system SHALL redirect `/e2e-rooms` to `/private/filter`, and `/e2e-rooms?section=archive` to `/private/archived/filter`, while the section is available. Launching the E2E rooms app SHALL open `/private/filter`. No client page SHALL frame the SDK private surface.

#### Scenario: Old bookmark
- **WHEN** the user opens `/e2e-rooms` while the section is available
- **THEN** the address is replaced with `/private/filter` and the native Private list is shown

#### Scenario: Archive bookmark
- **WHEN** the user opens `/e2e-rooms?section=archive` while the section is available
- **THEN** the address is replaced with `/private/archived/filter`

### Requirement: Apps catalog uses the section label
The system SHALL title the E2E rooms app Common:Private in the apps catalog, the same label as the sidebar section. Its description stays Common:DashboardE2eRoomsDescription. The name "Rooms E2E" SHALL NOT appear anywhere in the client.

#### Scenario: Catalog with the flag
- **WHEN** an administrator opens the apps settings with the opt-in set
- **THEN** the E2E rooms app is listed as Common:Private with its description

### Requirement: Section is not a start page option
The system SHALL NOT offer the Private section as a default start page in the file-management settings in this version.

#### Scenario: Default page setting
- **WHEN** the user opens the default start page setting while the section is available
- **THEN** Private is not among the options
