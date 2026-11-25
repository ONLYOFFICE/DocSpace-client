# file-sharing Specification

## Purpose

Defines how the web client shares files and folders outside the rooms with accounts and groups, and the sections
that sharing and personal marks produce: Shared with me, Recent and Favorites. It covers the "who has access" part of
the Share tab of the info panel, the contact selector that adds people and groups, the access levels offered and
changed there, the removal of an entry from Shared with me or Recent, and marking entries as favorites.

Server counterpart: `../server/openspec/specs/file-sharing`. The server decides who may share with whom, which levels
an entry accepts and which level wins when several apply; the client offers what the entry's `availableShareRights`
(`User`, `Group`) and each record's `canEditAccess` allow. Operations called: `getFileSecurityInfo`,
`getFolderSecurityInfo`, `setFileSecurityInfo`, `setFolderSecurityInfo`, `removeSecurityInfo`, `deleteRecent`,
`addFavorites`, `deleteFavoritesFromBody`, and, from the editor, `addFileToRecent`.

Out of scope: shared links (`shared-links`); room membership and invitations (`room-role-permissions`,
`invitations`); the info panel frame (`info-panel`); the section navigation, filters and table columns in general
(`files-navigation`); the portal sharing settings (`access-settings`, `files-settings`); private rooms
(`private-rooms`).

Implementation: `packages/shared/components/share` (hooks `useMembers`, sub-component `User`, `selector`),
`packages/client/src/components/ShareSelector`, `packages/client/src/pages/Home/InfoPanel/Body/views/Share`, the
favorite, recent and remove-from-list actions of the context options and files actions stores, the unsubscribe mode
of `packages/client/src/components/dialogs/DeleteDialog`.

## Requirements

### Requirement: Who has access to a file or folder

For a file or folder outside the rooms that may be shared, the Share tab SHALL list, below the links, the accounts
and groups the entry is shared with under `Common:WhoHasAccess`, with an add button, loading further records as the
list scrolls. With no record it SHALL show `Common:ShareForUsers` and a row `Common:AddUsersOrGroups`. For an entry
inside the rooms the Share tab SHALL show no such list.

#### Scenario: Shared file

- **WHEN** a user opens the Share tab of a file in My documents that is shared with two accounts
- **THEN** both accounts are listed with their access under `Common:WhoHasAccess`

#### Scenario: Entry inside a room

- **WHEN** a user opens the Share tab of a file inside a room
- **THEN** only the links are shown and no list of accounts

### Requirement: Explanation bar of the Share tab

The Share tab SHALL show a bar explaining sharing (`Common:ShareDocument` or `Common:ShareFolder`) that the user can
close for good in this browser. For an entry that is reachable through the link of a parent folder it SHALL show
instead a bar saying so (`Common:FileAvailableViaParentFolderLinkTitle` or
`Common:FolderAvailableViaParentFolderLinkTitle`), which cannot be closed.

#### Scenario: Bar closed

- **WHEN** a user closes the explanation bar and later opens the Share tab of another file
- **THEN** the bar is not shown again

#### Scenario: Parent folder shared by link

- **WHEN** a user opens the Share tab of a file inside a folder that has a shared link
- **THEN** the bar says the file is available through the parent folder link

### Requirement: Adding accounts and groups

The add button SHALL open the contact selector (`Common:Contacts`) listing active accounts, guests and groups, with
several picks allowed and those already sharing the entry shown as `Common:Shared` and not selectable. The selector
SHALL offer the entry's access levels, preset to Filling for a PDF form and Read only otherwise. Submitting SHALL
share the entry with every pick at that level, add them to the list and confirm with `Common:RoomCreateUser`.

#### Scenario: Share a document with two people

- **WHEN** a user picks two accounts in the selector with Comment and submits
- **THEN** the document is shared with both at Comment and both appear in the list

#### Scenario: Sharing refused

- **WHEN** the server refuses the share
- **THEN** its error is shown and the selector closes without changing the list

### Requirement: Access levels offered for a person or a group

The access selector of a record SHALL offer only the levels the entry lists for accounts or for groups in
`availableShareRights`, followed by `Common:Remove`. A file SHALL describe each level for its kind (document,
spreadsheet, presentation, PDF, PDF form, other); a folder SHALL offer `Common:FullAccess`, `Common:Editing`,
`Common:Review`, `Common:Comment`, `Common:ReadOnly` and `Common:DenyAccess` as listed. The owner's record SHALL show
`Common:Owner` only.

#### Scenario: PDF form

- **WHEN** a user opens the access selector of an account on a PDF form
- **THEN** Filling is offered with its PDF form description when the form lists it

### Requirement: Changing or removing a person's access

Choosing a level for a record SHALL save it at once and confirm with `Common:AccessRightsChanged`; choosing
`Common:Remove` SHALL withdraw the share and drop the record from the list. A record whose `canEditAccess` is false
SHALL show its level as plain text without a selector.

#### Scenario: Level changed

- **WHEN** the owner switches a shared account from Read only to Editing
- **THEN** the share is saved and `Common:AccessRightsChanged` is shown

#### Scenario: Removed

- **WHEN** the owner chooses Remove for a shared group
- **THEN** the group disappears from the list and the total drops by one

### Requirement: Records in the list

Each record SHALL show the avatar, the name, the user type and e-mail of an account, and `Common:MeLabel` for the
current user. The portal owner and administrators SHALL carry a tooltip saying they have full access. A group's name
SHALL open the dialog of its members, except for a system group.

#### Scenario: Group name

- **WHEN** a user activates the name of a group in the list
- **THEN** the dialog listing the group's members opens

### Requirement: Access changed elsewhere

While the Share tab of an entry is open, a change of the current user's own access to that entry announced by the
server SHALL update the record in the list without reloading it.

#### Scenario: Own access restricted

- **WHEN** another user restricts the current user's access to the open file
- **THEN** the current user's record shows the new level

### Requirement: The Shared with me section

The Shared with me section SHALL list the entries shared with the user, show an empty view when there are none, and
offer the table columns `Common:SharedBy` and `Common:AccessLevel`, each of which the user can hide in the table
settings.

#### Scenario: Empty

- **WHEN** nothing is shared with the user
- **THEN** the section shows its empty view

#### Scenario: Hiding a column

- **WHEN** the user switches off Shared by in the table settings
- **THEN** the column disappears from the table

### Requirement: Removing an entry from Shared with me

In Shared with me, `Common:RemoveFromList` in the context menu of an entry and in the header menu of a selection SHALL
ask for confirmation and then remove the entries from the user's list. The option SHALL be offered only in Shared with
me.

#### Scenario: From the context menu

- **WHEN** a user chooses Remove from list for the only shared file and confirms
- **THEN** the file disappears and the empty view is shown

#### Scenario: From the header menu

- **WHEN** a user selects the only shared file, chooses Remove from list in the header menu and confirms
- **THEN** the file disappears and the empty view is shown

### Requirement: Removing a room reached by a link from the list

For a room the user reached through an external link, `Common:RemoveFromList` SHALL remove it from the user's room
list. The option SHALL be disabled for the portal owner and administrators and for a room the user did not reach by a
link.

#### Scenario: Administrator

- **WHEN** a DocSpace admin opens the context menu of a room they reached by link
- **THEN** Remove from list is disabled

### Requirement: The Recent section

A document the user opens in the editor SHALL be added to Recent. Recent SHALL show an empty view when it has no
entry, and `Common:RemoveFromList`, offered only there, SHALL remove the chosen files from it, refresh the list and
confirm with `Files:RemovedFromRecent`.

#### Scenario: Remove from Recent

- **WHEN** a user chooses Remove from list for a file in Recent
- **THEN** the file is removed and `Files:RemovedFromRecent` is shown

### Requirement: Favorites

`Common:MarkAsFavorite` SHALL add the entry to Favorites and confirm with `Common:MarkedAsFavorite`;
`Common:RemoveFromFavorites` SHALL remove it and confirm with `Common:RemovedFromFavorites`, dropping it from the list
when the user is in Favorites. The Favorites section SHALL show an empty view when it has no entry.

#### Scenario: Mark a file

- **WHEN** a user chooses Mark as favorite for a file in My documents
- **THEN** a toast confirms the file was marked

#### Scenario: Remove in Favorites

- **WHEN** a user in Favorites chooses Remove from favorites for the only entry
- **THEN** the entry disappears and the empty view is shown

### Requirement: Context menus of Recent and Favorites entries

The context menu of an entry in Recent or Favorites SHALL follow what the entry is: a file of My documents, a file
reached by a link, a file in a room, a file shared with the user, an item in the Archive, or an image.

#### Scenario: File reached by a link

- **WHEN** a user opens the context menu of a file in Recent that they reached by a link
- **THEN** the menu offers the actions of a file reached by a link
