# Spec Delta

## MODIFIED Requirements

### Requirement: Shell side effects
The private layout SHALL run the shell effects: lock state synchronised across tabs, in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep that re-wraps every member for a room manager once per room and page session, a device-setup hint shown only once the user's key list has loaded and is empty, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked in one SDK tab
- **THEN** other SDK tabs lock as well and abort their encrypted operations

#### Scenario: Unlock recovers names
- **WHEN** the identity becomes unlocked on a private page
- **THEN** encrypted file names in the current list are decrypted and shown

#### Scenario: Manager enters a room
- **WHEN** a room manager with an unlocked identity enters a private room in the SDK for the first time in the page session
- **THEN** the backfill sweep runs once for that room and re-wraps every member with a verified key

#### Scenario: Hint waits for the key list
- **WHEN** a private page opens and the key list has not been loaded yet
- **THEN** no device-setup hint is shown until the list has loaded and contains no key for this device

### Requirement: Forgot passphrase and device setup link out to the client
The SDK SHALL NOT offer key generation, recovery or key management itself; the forgot-passphrase link and the device-setup hint SHALL open the client's keys-management profile page in a new tab through a link that works while the client keeps the feature behind its opt-in, and SHALL explain in place when the client page is not reachable from the host.

#### Scenario: Forgot passphrase
- **WHEN** the user clicks the forgot link in the SDK passphrase modal
- **THEN** the client's profile keys-management page opens in a new tab with the opt-in carried along, so the page renders even if the browser has no flag set

#### Scenario: No keys on this device
- **WHEN** a user without an identity on this device enters a private room in the SDK
- **THEN** a hint pointing to the client's keys-management page is shown

#### Scenario: Client not reachable
- **WHEN** the host embeds the SDK from an origin where the client application is not available
- **THEN** the hint explains that keys are managed in the DocSpace profile (Common:EncryptionKeysManagedInProfile) instead of opening a broken link

### Requirement: Create menu inside a private room
Inside a private room in the SDK, the create menu SHALL offer "new document", "new spreadsheet", "new presentation", "new folder" and "upload files" to a user with keys, creating files through the same client-side encrypted creation as the client application; without keys only folder and upload are offered. PDF forms are not offered.

#### Scenario: Create menu opened
- **WHEN** a user with keys opens the create menu inside a private room
- **THEN** document, spreadsheet, presentation, folder and upload entries are present and no PDF form entry

#### Scenario: Create menu opened without keys
- **WHEN** a user without keys opens the create menu inside a private room
- **THEN** only the folder and upload entries are present

#### Scenario: Document created
- **WHEN** the user picks "new document"
- **THEN** an encrypted empty document appears in the list under the chosen name

### Requirement: Folder operations use the server path
A folder move within the same private room SHALL be executed by the server without client-side re-encryption. A folder copy or move across rooms, into a private room or out of a private room SHALL be withheld with Common:CannotTransferFolderFromPrivateRoom, so no folder transfer can leave files unreadable or unencrypted.

#### Scenario: Folder moved within a private room
- **WHEN** the user moves a folder inside the same private room
- **THEN** the server moves the folder and the files keep their existing wraps

#### Scenario: Folder moved to another room
- **WHEN** the user tries to move or copy a folder from a private room to any other room or folder
- **THEN** the operation is refused with Common:CannotTransferFolderFromPrivateRoom and nothing is transferred

### Requirement: SDK private surface honours the opt-in
The SDK private routes SHALL render the private-rooms list, room and archive pages only when the host has passed the private-rooms opt-in (the `privateRooms` property of the frame configuration); without it they SHALL render the "feature not available" view. The opt-in SHALL be removed together with the client flag at release.

#### Scenario: Host passes the opt-in
- **WHEN** the host configuration enables private rooms and a signed-in user opens `/sdk/private`
- **THEN** the private rooms list renders

#### Scenario: Flag absent
- **WHEN** the host configuration does not enable private rooms
- **THEN** `/sdk/private`, `/sdk/private/[roomId]` and `/sdk/private/archive` render the not-available view and make no key or room requests

### Requirement: Translations needed by the private surface are bundled
The SDK SHALL ship every translation key the private surface renders; no private-surface component SHALL render a raw key. Keys that belonged to other namespaces are moved into Common or their namespace is bundled.

#### Scenario: Key from another namespace
- **WHEN** a private-surface component references a key that used to live outside Common (for example the remove-member dialog title)
- **THEN** the translated text is shown in the user's language, never the raw key

#### Scenario: Quota tooltip
- **WHEN** an upload in the SDK private surface fails on quota
- **THEN** the tooltip text is translated, not a raw key

## ADDED Requirements

### Requirement: Archive page follows private-room rules
The SDK archive page for private rooms SHALL apply the same rules as the active room page: no Share tab, encrypted download path and key check before listing encrypted files. With no archived rooms it SHALL show the archive empty view, whose action leads back to the private rooms list.

#### Scenario: Archived private room opened
- **WHEN** the user opens an archived private room in the SDK
- **THEN** the info panel offers no Share tab and downloads go through the decrypting path

#### Scenario: No archived rooms
- **WHEN** the archive list is empty
- **THEN** Common:ArchiveEmptyScreenHeader is shown, and its action opens the private rooms list rather than the other rooms

## RENAMED Requirements

- FROM: `### Requirement: No feature-flag gating in the SDK`
- TO: `### Requirement: SDK private surface honours the opt-in`

- FROM: `### Requirement: Only the Common namespace is bundled`
- TO: `### Requirement: Translations needed by the private surface are bundled`
