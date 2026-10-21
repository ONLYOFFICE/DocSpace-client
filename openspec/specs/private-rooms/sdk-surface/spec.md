# SDK Surface Specification

## Purpose
Describes the private-rooms surface of the embeddable SDK application: the room list, room contents and archive pages under the private route group, the encryption shell that wraps them, and the encrypted file actions the SDK shares with its generic file views. The client lists and opens private rooms natively in its Private section (`private-rooms/sidebar-section`); the SDK keeps serving this surface for embedding hosts. This capability records what the SDK does on the branch today, including the places where it deliberately stops short of the client (editor, key management, feature flag). Implementation: packages/sdk/src/app/(private)/**, packages/sdk/src/app/(docspace)/_contexts/EncryptedFileActionsContext.tsx, packages/sdk/src/app/(docspace)/_hooks/{useDownloadActions,useDecryptedFilename,useContextMenuModel}.ts, packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx, packages/sdk/src/proxy.ts.

## Requirements

### Requirement: Private route group
The SDK SHALL serve a private-rooms list, a room contents page addressed by room id, and an archive page under its private route group, each rendered inside the private layout.

#### Scenario: Routes available
- **WHEN** a user opens the private list, a private room by id, or the private archive in the SDK
- **THEN** the matching page renders inside the private layout

### Requirement: Client app embeds the SDK surface
The client's E2E rooms app SHALL render the SDK private list or archive in an iframe, choosing the archive address when the archive section is requested.

#### Scenario: Rooms section
- **WHEN** the E2E rooms app opens without a section
- **THEN** the iframe loads the SDK private list

#### Scenario: Archive section
- **WHEN** the E2E rooms app opens the archive section
- **THEN** the iframe loads the SDK private archive

### Requirement: Encryption shell wraps the private pages
The private layout SHALL wrap its pages in the encryption provider together with the passphrase modal and the key-change dialog, so unlock and trust-on-first-use prompts work without the client application.

#### Scenario: Unlock requested
- **WHEN** an action inside a private page needs the unlocked identity
- **THEN** the SDK's own passphrase modal opens

#### Scenario: Sender key changed
- **WHEN** a sender's key differs from the pinned key during an action
- **THEN** the SDK's own key-change dialog asks the user to accept or refuse

### Requirement: Shell side effects
The private layout SHALL run the shell effects: lock state synchronised across tabs, in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep that re-wraps every member for a room manager once per room and page session, a device-setup hint when the user has no keys, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked in one SDK tab
- **THEN** other SDK tabs lock as well and abort their encrypted operations

#### Scenario: Unlock recovers names
- **WHEN** the identity becomes unlocked on a private page
- **THEN** encrypted file names in the current list are decrypted and shown

#### Scenario: Manager enters a room
- **WHEN** a room manager with an unlocked identity enters a private room in the SDK for the first time in the page session
- **THEN** the backfill sweep runs once for that room and re-wraps every member with a verified key

### Requirement: Forgot passphrase and device setup link out to the client
The SDK SHALL NOT offer key generation, recovery or key management itself; the forgot-passphrase link and the device-setup hint SHALL open the client's keys-management profile page in a new tab.

#### Scenario: Forgot passphrase
- **WHEN** the user clicks the forgot link in the SDK passphrase modal
- **THEN** the client's profile keys-management page opens in a new tab

#### Scenario: No keys on this device
- **WHEN** a user without an identity on this device enters a private room in the SDK
- **THEN** a hint pointing to the client's keys-management page is shown

### Requirement: Encrypted file actions shared with the generic views
The SDK SHALL provide encrypted download, zip download, copy, move and duplicate through a shared encrypted-actions context so the generic file views use the same handlers as the private pages.

#### Scenario: Download from a private room
- **WHEN** the user downloads one or more encrypted files
- **THEN** each file is decrypted in the browser before it is saved, with a zip for several files

### Requirement: Mixed and folder downloads refused
The SDK SHALL refuse a download that mixes encrypted and non-encrypted items with Common:PrivateRoomMixedDownloadNotSupported, and SHALL refuse a folder download inside a private room with Common:PrivateRoomFolderDownloadNotSupported.

#### Scenario: Mixed selection
- **WHEN** the selection contains encrypted and non-encrypted items
- **THEN** an error toast with Common:PrivateRoomMixedDownloadNotSupported is shown and nothing is downloaded

#### Scenario: Folder in a private room
- **WHEN** the user downloads a folder of a private room
- **THEN** an error toast with Common:PrivateRoomFolderDownloadNotSupported is shown and nothing is downloaded

### Requirement: Download without decryption
The SDK context menu SHALL offer a "download without decryption" item for an encrypted file that saves the stored ciphertext unchanged.

#### Scenario: Ciphertext download
- **WHEN** the user chooses download without decryption
- **THEN** the encrypted blob is saved as is, without unlocking the identity

### Requirement: Decrypted preview
The SDK media viewer SHALL decrypt an encrypted image, audio or video file in the browser before showing it.

#### Scenario: Preview an encrypted image
- **WHEN** the user previews an encrypted media file
- **THEN** the viewer shows the decrypted content

### Requirement: Decrypted titles in lists and history
The SDK SHALL show the decrypted name of an encrypted file in its list views and in the info panel history once the name has been recovered, and SHALL fall back to the opaque server name until then.

#### Scenario: Name recovered
- **WHEN** the file name cache holds a decrypted name for the file
- **THEN** list rows, tiles and history entries show the decrypted name

### Requirement: Member removal warning and group expansion
When a member is removed from a private room in the SDK, the removal dialog SHALL warn that the member will lose access to encrypted files, and a removed group SHALL be expanded to its members before the revocation runs. The server keeps the wraps of removed members; access ends only through the lost read access.

#### Scenario: Remove a group
- **WHEN** a group is removed from a private room
- **THEN** a revocation runs for every member of the group, and their wrap entries remain stored on the server

### Requirement: Members grouped without groups and guests
The SDK members view of a private room SHALL bucket members into administrators, users and expected members, and SHALL NOT list groups or guests because they hold no encryption identity.

#### Scenario: Members listed
- **WHEN** the members panel of a private room opens
- **THEN** three sections are shown: administrators, users and expected

### Requirement: Copy and move destination resolved fail-closed
The SDK SHALL decide per destination whether an encrypted copy or move re-encrypts (destination in the same private room), decrypts to plaintext (destination outside private rooms), or is blocked (destination room cannot be resolved).

#### Scenario: Destination outside private rooms
- **WHEN** an encrypted file is copied or moved to a non-private folder
- **THEN** it is decrypted and uploaded as plaintext

#### Scenario: Destination unknown
- **WHEN** the destination room cannot be resolved
- **THEN** the operation is blocked and nothing is transferred

#### Scenario: Locked identity
- **WHEN** the identity is locked and the user cancels the unlock prompt
- **THEN** the copy or move is cancelled with the locked-operation toast

### Requirement: Create menu inside a private room
Inside a private room in the SDK, the create menu SHALL offer only "new folder" and "upload files"; document, spreadsheet, presentation and PDF form creation are not offered.

#### Scenario: Create menu opened
- **WHEN** the user opens the create menu inside a private room
- **THEN** only the folder and upload entries are present

### Requirement: Folder operations use the server path
Folder move inside the SDK private surface SHALL be executed by the server without client-side re-encryption; only files go through the encrypted copy path. The server refuses a folder copy inside a private room.

#### Scenario: Folder moved within a private room
- **WHEN** the user moves a folder inside the same private room
- **THEN** the server moves the folder and the files keep their existing wraps

### Requirement: No feature-flag gating in the SDK
The SDK private routes SHALL be reachable regardless of the client's private-rooms localStorage flag; the SDK performs no feature-flag check.

#### Scenario: Flag absent
- **WHEN** the private-rooms flag is not set in the browser
- **THEN** the SDK private list, room and archive pages still render

### Requirement: Only the Common namespace is bundled
The SDK SHALL load only the Common translation namespace; a string that belongs to another namespace is rendered as its raw key.

#### Scenario: Key from another namespace
- **WHEN** a private-surface component references a key outside Common
- **THEN** the raw key text is shown instead of a translation

### Requirement: Content security policy for the private surface
The SDK SHALL apply a content security policy to the private routes that allows inline scripts and styles and WebAssembly evaluation, restricting sources to the SDK's own origin.

#### Scenario: Private page served
- **WHEN** a private route is requested through the SDK proxy
- **THEN** the response carries the private-surface content security policy
