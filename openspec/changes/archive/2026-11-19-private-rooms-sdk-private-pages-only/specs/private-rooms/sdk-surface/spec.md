# Spec Delta

## ADDED Requirements

### Requirement: Private addresses are decided before anything is listed
The SDK SHALL decide whether a folder named by an address or reached by navigation lies in a private room from the room on the folder's own path, whatever the folder's own private field says, with one request that carries only the folder's id. It SHALL request the folder's contents only once the folder is known to lie outside private rooms, and SHALL send no search text before. A folder whose path cannot be read SHALL NOT be listed.

#### Scenario: Folder named with a search text
- **WHEN** a generic SDK address names a folder inside a private room and carries a search text
- **THEN** the only request made for the folder carries its id and no search text, no listing of the folder is requested, and the address of the private page carries no search text

#### Scenario: Room of the folder cannot be read
- **WHEN** the path of the folder named by a generic SDK address cannot be loaded
- **THEN** no listing of the folder is rendered and the page shows its not-found view

#### Scenario: Folder outside private rooms
- **WHEN** a generic SDK address names a folder of a room without the private setting
- **THEN** the folder is listed on the generic page with the address's sorting, filters and search, as before

### Requirement: Frame events carry no item of a private room
The SDK SHALL NOT pass a private room, a folder inside one or an encrypted file to the host in a frame event, nor a search or filter text typed on a private page; the navigation event of the private pages SHALL carry only the section and the page address without such text. An encrypted file opened while the host subscribed to `onFileManagerClick` SHALL be opened by the SDK itself, as for `onEditorOpen`.

#### Scenario: Host subscribed to file clicks, encrypted file
- **WHEN** a host that subscribed to `onFileManagerClick` embeds the SDK and a user opens an encrypted file of a private room
- **THEN** no `onFileManagerClick` event is sent, no data of the file reaches the host, and the SDK opens the file itself

#### Scenario: Host subscribed to file clicks, file not encrypted
- **WHEN** the same host embeds the SDK and a user opens a file that is not encrypted
- **THEN** the `onFileManagerClick` event is sent with the file and the SDK opens nothing

#### Scenario: Navigation after a search of the private rooms list
- **WHEN** the user searches or filters the private rooms list in an embedded SDK
- **THEN** each navigation event the host receives carries the section and the page address without the search text or any filter value

## MODIFIED Requirements

### Requirement: Private rooms only through the private pages
The SDK SHALL list and open private rooms and their contents only on its private pages. Its generic room lists, active and archived, and its selectors SHALL leave private rooms out; any other SDK address or in-place navigation that names a private room or a folder inside one SHALL lead to the private page of that room. No generic flow (search, upload, creation, member removal, AI chat) SHALL run there. A private address of a room without the private setting SHALL lead to its generic room page.

#### Scenario: Generic rooms list
- **WHEN** the generic rooms list or its archive is opened in the SDK
- **THEN** no private room is listed

#### Scenario: Private room opened by its generic address
- **WHEN** a private room is opened at its generic room address
- **THEN** the private page of that room is shown, or the not-available view when the host has not enabled private rooms

#### Scenario: No plaintext through a generic page
- **WHEN** a user reaches a private room through any SDK address
- **THEN** an upload into it never sends plaintext and the AI chat is never offered

#### Scenario: Non-private room at a private address
- **WHEN** a room without the private setting is opened at its private address
- **THEN** its generic room page is shown, and no encrypted upload, create or copy runs on it

#### Scenario: Folder of a private room opened in personal files
- **WHEN** the personal files page is opened with the id of a private room or of a folder inside one
- **THEN** the private page of that room is shown with that folder open, or the not-available view when the host has not enabled private rooms or the page is served under OAuth, and no generic listing, search field, create tile, upload entry or AI entry is rendered for it

#### Scenario: Private folder named to the file selector
- **WHEN** the file selector is opened with the id of a private room or of a folder inside one
- **THEN** the not-available view is shown, nothing of the folder is listed and nothing can be picked or sent to the host

#### Scenario: Uploader aimed at a private folder
- **WHEN** the uploader is opened with a private room or a folder inside one as its target
- **THEN** the not-available view is shown, no file can be picked or dropped, and no upload session or folder is requested

#### Scenario: Room selector
- **WHEN** the room selector opens or searches its list
- **THEN** no private room is listed or offered

#### Scenario: Chat opened with a private scope or file
- **WHEN** the chat page is opened with a private room or a folder inside one as its scope, or with an encrypted file to attach
- **THEN** the not-available view is shown, no chat is mounted, nothing is attached or uploaded, and the host still receives `onAppReady`

#### Scenario: Room that is not an AI agent opened as an agent
- **WHEN** the AI agent page is opened with the id of a room that is not an AI agent room, a private room included
- **THEN** the agent-not-available view is shown, the room's contents are not requested and no chat is offered

#### Scenario: Folder of a private room reached on a generic page
- **WHEN** a generic page navigates in place to a private room or a folder inside one, by opening a folder or the location of a file
- **THEN** the private page of that room is shown with that folder open, or the not-available view, and the generic page requests no listing of the folder

### Requirement: No search in private rooms
The SDK SHALL NOT offer search inside a private room, active or archived, nor in the copy and move pickers of its private pages, and SHALL NOT send a search text for a private room to the server. Opening the location of an encrypted file, on any page, SHALL NOT put its name in a search, the address or a message to the host.

#### Scenario: Private room opened
- **WHEN** a private room or a folder inside it is open
- **THEN** no search field is shown and no folder request carries a search text

#### Scenario: Open location from the history
- **WHEN** the user opens the location of an encrypted file from the info panel history
- **THEN** its folder opens, and the file name is not sent to the server, written to the address or passed to the host

#### Scenario: Copy or move picker on a private page
- **WHEN** the copy or the move picker is opened on a private page
- **THEN** the picker shows no search field in any folder and none of its requests carries a search text

#### Scenario: Open location of an encrypted file on a generic page
- **WHEN** the location of an encrypted file is opened from a generic page
- **THEN** the file name is not sent to the server, written to the address or passed to the host

### Requirement: No upload or creation without the create right
The SDK SHALL NOT start an upload or a file creation from any entry, hotkeys and drops onto a row included, in a private room folder where the user cannot create files, nor anywhere in an archived private room whatever rights it reports, and SHALL NOT send the names of picked or dropped files to the server for it. A private page SHALL upload and create only through its encrypted paths, never through the generic ones.

#### Scenario: Upload hotkey in an archived room
- **WHEN** the user presses the upload hotkey in an archived private room
- **THEN** no file picker opens and no request carries a file name

#### Scenario: File dropped on a row of an archived room
- **WHEN** the user drops a file onto a row of an archived private room
- **THEN** no upload starts and no request carries a file name

#### Scenario: File dropped without the create right
- **WHEN** a user who cannot create files in a private room folder drops a file onto it or onto one of its rows
- **THEN** no upload starts, no unlock prompt opens and no request carries a file name

#### Scenario: Archived room whatever its rights
- **WHEN** an archived private room is open and the rights reported for it include creation
- **THEN** no upload or create entry is offered, the upload and create hotkeys do nothing, and no request carries a file name

#### Scenario: Private page without an encrypted path
- **WHEN** an upload or a creation is requested on a private page that has no encrypted upload or create path for the open folder
- **THEN** nothing is uploaded or created and no request carries a file name

### Requirement: Forgot passphrase and device setup link out to the client
The SDK SHALL NOT offer key recovery or key management itself, and SHALL offer key generation only where creating a private room needs a key; the forgot-passphrase link, the device-setup hint and the reset link of the ghost-state toast SHALL open the client's keys-management profile page on the origin the SDK is served from, in a new tab, and SHALL explain in place when that page cannot be opened.

#### Scenario: Forgot passphrase
- **WHEN** the user clicks the forgot link in the SDK passphrase modal
- **THEN** the client's profile keys-management page opens in a new tab, its address carrying no opt-in parameter

#### Scenario: No keys on this device
- **WHEN** a user without an identity on this device enters a private room in the SDK
- **THEN** a hint pointing to the client's keys-management page is shown

#### Scenario: Client not reachable
- **WHEN** the keys-management page cannot be opened from the frame, the browser refusing the new tab
- **THEN** the hint explains that keys are managed in the DocSpace profile (Common:EncryptionKeysManagedInProfile) instead of opening a broken link

#### Scenario: Link address
- **WHEN** the forgot link, the device-setup hint or the reset link of the ghost-state toast is opened
- **THEN** the page opened is the keys-management page on the origin the SDK is served from

#### Scenario: Reset link of the ghost-state toast
- **WHEN** the user clicks the reset link of the ghost-state toast
- **THEN** the toast closes and the keys-management page opens in a new tab, or Common:EncryptionKeysManagedInProfile is shown when it cannot be opened
