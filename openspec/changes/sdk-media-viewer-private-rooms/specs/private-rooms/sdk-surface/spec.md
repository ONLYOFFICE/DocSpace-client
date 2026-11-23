# Spec Delta

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

#### Scenario: Media viewer aimed at a private folder
- **WHEN** the media viewer is opened with the id of a private room or of a folder inside one, on its server page or in an OAuth frame
- **THEN** the not-available view is shown, the host receives `onAppReady`, and no file of the folder is listed, read or played

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

### Requirement: Private addresses are decided before anything is listed
The SDK SHALL decide whether a folder named by an address or reached by navigation lies in a private room from the room on the folder's own path, whatever the folder's own private field says, with one request that carries only the folder's id. It SHALL request the folder's contents only once the folder is known to lie outside private rooms, and SHALL send no search text before. A folder whose path cannot be read SHALL NOT be listed, save for a media viewer visitor judged by a link.

#### Scenario: Folder named with a search text
- **WHEN** a generic SDK address names a folder inside a private room and carries a search text
- **THEN** the only request made for the folder carries its id and no search text, no listing of the folder is requested, and the address of the private page carries no search text

#### Scenario: Room of the folder cannot be read
- **WHEN** the path of the folder named by a generic SDK address cannot be loaded
- **THEN** no listing of the folder is rendered and the page shows its not-found view

#### Scenario: Folder outside private rooms
- **WHEN** a generic SDK address names a folder of a room without the private setting
- **THEN** the folder is listed on the generic page with the address's sorting, filters and search, as before

## ADDED Requirements

### Requirement: Media viewer judges a link visitor by the room the link opens
When the server refuses the folder path to a visitor without an account, the media viewer SHALL decide from the external link the address carries: it SHALL show the not-available view for a link that opens a private room, SHALL open the gallery for a link to a room without the private setting or to a folder or file inside a room, and SHALL report `onNoAccess` when there is no link or the room it opens cannot be read. Nothing of the folder SHALL be read before.

#### Scenario: Visitor of a public room link
- **WHEN** a visitor without an account opens the media viewer with a folder and the key of an external link to a room without the private setting
- **THEN** the media files of the folder are listed and shown

#### Scenario: Visitor of a link that opens a private room
- **WHEN** a visitor without an account opens the media viewer with the key of an external link whose room is private
- **THEN** the not-available view is shown, the host receives `onAppReady`, and no file of the folder is listed, read or played

#### Scenario: Visitor without a link
- **WHEN** a visitor without an account opens the media viewer with a folder and no link key
- **THEN** nothing of the folder is listed and the host receives `onNoAccess`

#### Scenario: Room of a valid link cannot be read
- **WHEN** the link in the address of a visitor without an account is valid but the room it opens cannot be read
- **THEN** nothing of the folder is listed and the host receives `onNoAccess`

#### Scenario: Invalid or expired link
- **WHEN** the link in the address is invalid or expired
- **THEN** the media viewer page stays in place and the host receives `onNotFound` for an invalid link and `onNoAccess` for an expired one, without being sent to the public room error pages
