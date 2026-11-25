# editor-integration Specification

## Purpose

Defines the document editor application of the web client (`/doceditor`): opening a file in the ONLYOFFICE editor,
creating a file and opening it, what the client does for the editor's requests — editing rights, renaming, favorites,
version history, save as, new document, inserting files from DocSpace, linked data, mentions, sharing, closing — and the
pages around the editor: shared link passwords, errors, the mobile app offer, storage quota warnings, session expiry
and recovery from a broken page load.

Server counterpart: none of its own; the editor configuration and the file actions come from
`../server/openspec/specs/file-operations` and `file-sharing`. Operations called: `openEditFile`, `getDocServiceUrl`,
`getDeepLinkSettings`, `getExternalShareData`, `createFile`, `copyFileAs`, `startFileConversion`, `updateFile`,
`addFavorites`, `deleteFavoritesFromBody`, `getEditHistory`, `getEditDiffUrl`, `restoreFileVersion`, `getSharedUsers`,
`getProtectedFileUsers`, `sendEditorNotify`, `getReferenceData`, `getPresignedFileUri`, `getSelfProfile`.

Out of scope: forms in the editor — starting and stopping filling, sharing to fill out, the completed form page, renamed
form fields (`form-filling-workflow`); encrypted files (`private-rooms/editor-integration`); the editor inside the Embed
SDK and OAuth frames (`sdk-embedding`); the editor's own interface, which the Document Server provides.

Implementation: `packages/doceditor` (the root, create, start-filling and completed-form pages, the editor component and
its event hooks).

## Requirements

### Requirement: Opening a file

The editor page SHALL open the file named by `fileId`, in view or edit mode as `action` asks, at a given `version` when
one is named and through a shared link's key when one is given. On a phone it SHALL open the mobile editor. The browser
tab SHALL show the document's title, prefixed with `*` while changes are unsaved.

#### Scenario: Unsaved changes

- **WHEN** the user types in a document
- **THEN** the tab title starts with `*` until the document is saved

### Requirement: Password of a shared link

When a file is opened through a shared link protected by a password, the editor page SHALL ask for the password first
and open the file once it is accepted.

#### Scenario: Protected link

- **WHEN** a visitor opens a file through a link with a password
- **THEN** the password form is shown instead of the editor

### Requirement: Errors while opening

When the file cannot be opened, the page SHALL show the error page (`Something went wrong.`) with the server's message
when there is one; an answer without an error SHALL NOT be reported as the generic unexpected error, and a technical
cause SHALL be kept off the page.

#### Scenario: Proxy error

- **WHEN** opening a file answers with a page that is not JSON
- **THEN** the generic message is shown and the parsing error is not

### Requirement: Creating a file and opening it

The create page SHALL create a file in the named folder — empty, from a template, or as a copy of another file in
another format — and replace itself with the editor of the new file. When creation is refused for access or quota, the
editor SHALL open empty with the server's message. Any other failure SHALL show the error page; a session that ended
SHALL lead to sign-in and back.

#### Scenario: Create fails behind a proxy

- **WHEN** creating a file answers without a JSON body
- **THEN** the error page is shown and no React error replaces it

### Requirement: Editing rights from the viewer

Asking for editing rights in view mode SHALL reopen the file in edit mode. A file that must be converted first SHALL be
converted, and the converted file SHALL open with `Editor:DocumentConverted`.

#### Scenario: Old format

- **WHEN** the user asks to edit a DOC file that the server must convert
- **THEN** the DOCX copy opens in edit mode with a message naming it

### Requirement: Going back and closing

The editor SHALL offer a button to the file's location for a signed-in user who is not a Guest — the Forms section for a
form of a Form filling room, the default templates settings for a default template — and SHALL NOT offer it to a
Guest or an anonymous visitor. Closing SHALL first send pending form field reports, then leave as configured.

#### Scenario: Guest

- **WHEN** a Guest opens a document
- **THEN** no button leads to the file's location

### Requirement: Renaming and favorites

Renaming the document in the editor SHALL be offered when the file's `security.Rename` is true and SHALL rename the file.
Marking the document as favorite in the editor SHALL add it to or remove it from the user's favorites, and the editor
SHALL show the state the server keeps afterwards.

#### Scenario: Rename

- **WHEN** an Editor renames the document in the editor header
- **THEN** the file is renamed and the tab title follows

### Requirement: Version history

The editor SHALL offer the version history when the file's `security.ReadHistory` is true, show the changes of each
version, and offer restoring a version when `security.EditHistory` is true; a failure SHALL be shown inside the history.
Closing the history SHALL reload the editor.

#### Scenario: Restore

- **WHEN** a user with history editing rights restores an earlier version
- **THEN** the history is refreshed with the restored version as the current one

### Requirement: Save a copy

A signed-in user who is not a Guest SHALL be able to save a copy in another format: choose a folder in the file
selector, keep or change the name, and either open the copy in a new tab or get the result as a message in the editor.
Folders for form results SHALL NOT be chosen.

#### Scenario: Copy as PDF

- **WHEN** a User saves a copy of a document as PDF into My documents
- **THEN** the copy is created there and the editor says so

### Requirement: New document from the editor

A signed-in user who is not a Guest SHALL be able to create a new document of the same kind from the editor, except from
a PDF; the new file SHALL be created in the same folder and opened.

#### Scenario: New spreadsheet

- **WHEN** a User chooses to create a new spreadsheet from the spreadsheet editor
- **THEN** a new spreadsheet is created in the same folder and opened

### Requirement: Inserting files from DocSpace

When the editor asks for an image, a document to compare, a spreadsheet for a mail merge or the source of linked data,
the client SHALL open the file selector and hand the editor a temporary address of the picked file.

#### Scenario: Insert an image

- **WHEN** the user inserts an image from DocSpace and picks a PNG
- **THEN** the editor receives an address from which it loads the picture

### Requirement: Linked data between files

For a file outside a third-party storage, the client SHALL answer the editor's request for linked data of another file
and SHALL open a linked file when the editor asks.

#### Scenario: Refresh linked data

- **WHEN** a spreadsheet refreshes data linked from another spreadsheet
- **THEN** the client returns the current data of the linked file

### Requirement: Mentions

For a signed-in user, the editor's mention list SHALL offer the people who can open the file, and mentioning SHALL notify
them; people mentioned without access to the file SHALL be named in a message (`UsersWithoutAccess`).

#### Scenario: Mention without access

- **WHEN** a comment mentions an address that has no access to the file
- **THEN** the editor shows that the mentioned person cannot open the file

### Requirement: Sharing from the editor

The editor SHALL offer the sharing settings of the file when the user may share it, and SHALL NOT offer them for a form
being filled.

#### Scenario: Open sharing

- **WHEN** a Room manager opens the sharing settings from the editor
- **THEN** the sharing panel of the file is shown over the editor

### Requirement: Storage quota in the editor

When the room's, the user's or the portal's storage quota is reached, the editor SHALL show a bar naming which quota
it is, saying that editing is unavailable when the file is opened, or that further edits will not be saved when the
quota is reached during editing.

#### Scenario: Room quota reached while editing

- **WHEN** the room's quota is reached while a document is open
- **THEN** the bar says the room quota is reached and further edits will not be saved

### Requirement: Session expiry

When the user's session ends while a document is open, the editor SHALL close and lead to sign-in; after signing in as
the same user, the document SHALL open again. Another user signing in SHALL NOT be sent to it.

#### Scenario: Same user signs in

- **WHEN** the session of a user editing a document expires and the user signs in again
- **THEN** the document opens again

### Requirement: The mobile app offer

On a phone, outside the SDK and embedded views, when the portal has the mobile apps configured, the editor SHALL offer
opening the document in the app or staying in the browser, with an option to remember the choice; where the portal
opens documents only in the app, it SHALL hand the document over to the app.

#### Scenario: Offer on a phone

- **WHEN** a user opens a document on a phone without a remembered choice
- **THEN** the page offers to open it in the app or stay in the browser

### Requirement: Recovering from a broken page load

When the editor's scripts fail to load, the page SHALL load them again and, while they keep failing, reload a bounded
number of times. When the page's data stream breaks off, the page SHALL reload once and open the file; a second break
within the same window SHALL show the error page.

#### Scenario: Network outage while loading

- **WHEN** the network drops while the editor page loads and comes back
- **THEN** the editor opens without a white screen
