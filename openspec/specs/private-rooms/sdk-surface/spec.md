# SDK Surface Specification

## Purpose
Describes the private-rooms surface of the embeddable SDK application: the room list, room contents and archive pages under the private route group, the encryption shell that wraps them, and the encrypted file actions the SDK shares with its generic file views. The client lists and opens private rooms natively in its Private section (`private-rooms/sidebar-section`); the SDK serves this surface to pages of the portal's own origin, as the requirement "SDK private pages are framed only by the portal's own origin" states. This capability records what the SDK does on the branch today, including the places where it deliberately stops short of the client (editor, key management, feature flag). Implementation: packages/sdk/src/app/(private)/**, packages/sdk/src/app/(docspace)/_contexts/EncryptedFileActionsContext.tsx, packages/sdk/src/app/(docspace)/_hooks/{useDownloadActions,useDecryptedFilename,useContextMenuModel}.ts, packages/sdk/src/app/(personal-files)/_components/docs-layout/index.tsx, packages/sdk/src/proxy.ts.

## Requirements

### Requirement: Private route group
The SDK SHALL serve a private-rooms list, a room contents page addressed by room id, and an archive page under its private route group, each rendered inside the private layout.

#### Scenario: Routes available
- **WHEN** a user opens the private list, a private room by id, or the private archive in the SDK
- **THEN** the matching page renders inside the private layout

### Requirement: Encryption shell wraps the private pages
The private layout SHALL wrap its pages in the encryption provider together with the passphrase modal and the key-change dialog, so unlock and trust-on-first-use prompts work without the client application.

#### Scenario: Unlock requested
- **WHEN** an action inside a private page needs the unlocked identity
- **THEN** the SDK's own passphrase modal opens

#### Scenario: Sender key changed
- **WHEN** a sender's key differs from the pinned key during an action
- **THEN** the SDK's own key-change dialog asks the user to accept or refuse

### Requirement: Shell side effects
The private layout SHALL run the shell effects: the locks of the user's other pages that every page follows (key-management, "A lock reaches every tab of the user"), in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep re-wrapping every member for a room manager once per room and page session, a device-setup hint only once the user's key list loaded empty, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked by Lock now, a key change or a logout in another page of the user, an SDK page or a client page
- **THEN** every SDK page of the user locks as well and aborts its encrypted operations, and the remembered record is left to the page that locked

#### Scenario: Idle lock in another tab
- **WHEN** another SDK page of the user locks after its idle time or because it was hidden
- **THEN** this SDK page stays unlocked

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

### Requirement: Encrypted file actions shared with the generic views
The SDK SHALL provide encrypted download, zip download, copy, move and duplicate through a shared encrypted-actions context so the generic file views use the same handlers as the private pages. A selection of one encrypted file SHALL be saved as that file, as from its own menu; only two or more encrypted files are saved as a zip.

#### Scenario: Download from a private room
- **WHEN** the user downloads one or more encrypted files
- **THEN** each file is decrypted in the browser before it is saved, with a zip for several files

#### Scenario: One encrypted file selected
- **WHEN** exactly one encrypted file is selected and downloaded from the header menu
- **THEN** the decrypted file itself is saved under its decrypted name, and no archive is built

### Requirement: Mixed and folder downloads refused
The SDK SHALL refuse a download that mixes encrypted and non-encrypted items with Common:PrivateRoomMixedDownloadNotSupported, and SHALL refuse any download of a folder inside a private room, alone or in a selection, with Common:PrivateRoomFolderDownloadNotSupported before any request. It SHALL NOT offer the download of a private room. Download without decryption is not affected.

#### Scenario: Mixed selection
- **WHEN** the selection contains encrypted and non-encrypted items
- **THEN** an error toast with Common:PrivateRoomMixedDownloadNotSupported is shown and nothing is downloaded

#### Scenario: Folder in a private room
- **WHEN** the user downloads a folder of a private room from its menu, the header menu or a selection
- **THEN** an error toast with Common:PrivateRoomFolderDownloadNotSupported is shown and no archive is requested from the server

#### Scenario: Private room in the list
- **WHEN** the user opens the context menu of a private room in the private rooms list or archive
- **THEN** no download entry is offered

### Requirement: Download without decryption
The SDK SHALL offer download without decryption for an encrypted file, saving the stored ciphertext unchanged, and for a folder inside a private room, requesting a server archive of its ciphertext files, as the client does. Neither unlocks the identity.

#### Scenario: Ciphertext download
- **WHEN** the user chooses download without decryption
- **THEN** the encrypted blob is saved as is, without unlocking the identity

#### Scenario: Folder downloaded without decryption
- **WHEN** the user chooses download without decryption on a folder of a private room
- **THEN** the server archive of the folder's ciphertext files is downloaded, and nothing is decrypted

### Requirement: Decrypted preview
The SDK media viewer SHALL decrypt an encrypted image, audio or video file in the browser before showing it.

#### Scenario: Preview an encrypted image
- **WHEN** the user previews an encrypted media file
- **THEN** the viewer shows the decrypted content

### Requirement: Decrypted titles in lists and history
The SDK SHALL recover the decrypted names of encrypted files whenever the file list changes (navigation, refresh, socket updates) and SHALL show them in the list views, the info panel history and the copy and move pickers once recovered. Until then it SHALL show the opaque server name and SHALL NOT prompt for unlock to show a name.

#### Scenario: Name recovered
- **WHEN** the file name cache holds a decrypted name for the file
- **THEN** list rows, tiles, history entries and picker items show the decrypted name

#### Scenario: File added by a list update
- **WHEN** an encrypted file appears in the open folder through a socket event or a navigation while the identity is unlocked
- **THEN** its decrypted name is recovered and shown without reloading the page

### Requirement: Member removal warning
When a member is removed from a private room in the SDK, the removal dialog SHALL warn that the member will lose access to encrypted files, and the removal SHALL run through the role update alone, without a revocation of the SDK's own; the server removes the member's wrapped keys with the share.

#### Scenario: Remove a member
- **WHEN** a member is removed from a private room
- **THEN** the warning is shown, the role update runs and the SDK writes no access entry

#### Scenario: Remove a group
- **WHEN** the subject of a removal from a private room is a group, which the server does not let join one in this version
- **THEN** the role update runs for the group alone, without expanding it into its members, and the SDK writes no access entry

### Requirement: Members grouped without groups and guests
The SDK members view of a private room SHALL bucket members into administrators, users and expected members, and SHALL NOT list groups or guests because they hold no encryption identity. A search of the members SHALL list only members the grouped view would list.

#### Scenario: Members listed
- **WHEN** the members panel of a private room opens
- **THEN** three sections are shown: administrators, users and expected

#### Scenario: Members searched
- **WHEN** the user searches the members of a private room and the matches include a member the grouped view leaves out, such as a guest or a disabled user who is not the owner
- **THEN** that member is not listed in the results

### Requirement: Copy and move destination resolved fail-closed
The SDK SHALL take the room of a copy or move destination from the destination folder's path, so a folder inside a private room counts as private whatever its own private field says. It SHALL resolve the destination before the unlock prompt, re-encrypt for a private destination, decrypt for one outside private rooms, and copy nothing with Common:EncryptedCopyFailed when the room cannot be resolved. Copy is offered for encrypted files although the server withholds the Copy right.

#### Scenario: Copy into a folder of another private room
- **WHEN** the user copies an encrypted file into a folder inside another private room
- **THEN** the file is uploaded encrypted for that room's members, and no plaintext is ever sent into the private room

#### Scenario: Copy into another private room
- **WHEN** the user copies an encrypted file into another private room
- **THEN** the file is decrypted in the browser and uploaded encrypted for that room's members, and the source stays in place

#### Scenario: Copy offered for an encrypted file
- **WHEN** the user opens the context menu of an encrypted file in an active private room
- **THEN** the copy action is offered although the server reports no Copy right for the file

#### Scenario: Destination outside private rooms
- **WHEN** an encrypted file is copied to a non-private folder
- **THEN** it is decrypted in the browser and uploaded through the standard upload, which asks before overwriting a file of the same name

#### Scenario: Destination unknown
- **WHEN** the destination room cannot be resolved
- **THEN** nothing is transferred, no unlock prompt is shown and Common:EncryptedCopyFailed names the files

#### Scenario: Destination without the create right
- **WHEN** the copy dialog is opened for encrypted files of a private room
- **THEN** rooms and folders where the user cannot create files are not selectable

#### Scenario: Move into another private room
- **WHEN** a move of encrypted files of a private room into another private room is requested
- **THEN** Common:CannotMoveToAnotherPrivateRoom is shown and nothing is transferred

#### Scenario: Locked identity
- **WHEN** the identity is locked and the user cancels the unlock prompt
- **THEN** the copy is cancelled with the locked-operation toast and nothing is transferred

### Requirement: Create menu inside a private room
Inside a private room the SDK SHALL create only docx, xlsx, pptx and pdf files, each produced and encrypted in the browser, from every create entry: the "+ New" menu, the empty view, the quick actions, the create hotkeys and the mobile main button. Without keys these entries SHALL offer only folder creation and upload. No create entry SHALL produce an unencrypted file in a private room.

#### Scenario: Create menu opened
- **WHEN** a user with keys opens the create menu inside a private room
- **THEN** document, spreadsheet, presentation, PDF form, folder and upload entries are present

#### Scenario: Create menu opened without keys
- **WHEN** a user without keys opens the create menu, the empty view or the quick actions inside a private room
- **THEN** only the folder and upload entries are present

#### Scenario: Document created
- **WHEN** the user picks "new document"
- **THEN** an encrypted empty document appears in the list under the chosen name

#### Scenario: PDF form hotkey
- **WHEN** a user with keys presses the PDF form hotkey inside a private room
- **THEN** an encrypted empty PDF form is created, and the editor's create route is never opened

#### Scenario: PDF form from the mobile main button
- **WHEN** the user chooses "New PDF form" from the mobile main button inside a private room
- **THEN** Common:MobileEditPdfNotAvailableInfo is shown and no file is created

#### Scenario: Unsupported extension requested
- **WHEN** a create request for any other extension reaches the private-room creation path
- **THEN** it is refused with Common:PrivateRoomCreateNotSupported and nothing is sent

### Requirement: Folder operations use the server path
A folder move within one private room, into any of its folders, SHALL be executed by the server without client-side re-encryption. A folder copied out of a private room or into another room, or moved out of private rooms, SHALL be withheld with Common:CannotTransferFolderFromPrivateRoom; a folder move into another private room is refused like any move there, with Common:CannotMoveToAnotherPrivateRoom. A folder copy SHALL NOT be offered inside a private room in this version.

#### Scenario: Folder moved within a private room
- **WHEN** the user moves a folder into another folder of the same private room
- **THEN** the server moves the folder and the files keep their existing wraps

#### Scenario: Folder moved to another room
- **WHEN** the user copies a folder of a private room to any other room or folder, or moves it out of the private rooms
- **THEN** the operation is refused with Common:CannotTransferFolderFromPrivateRoom and nothing is transferred

#### Scenario: Folder moved to another private room
- **WHEN** a move of a folder of a private room into another private room is requested
- **THEN** it is refused with Common:CannotMoveToAnotherPrivateRoom and nothing is transferred

#### Scenario: Folder copied within a private room
- **WHEN** the user opens the context menu of a folder in a private room
- **THEN** no copy action is offered, whatever rights the folder reports

### Requirement: SDK private surface honours the opt-in
The SDK private routes SHALL render the private-rooms list, room and archive pages only when the host has passed the private-rooms opt-in (the `privateRooms` property of the frame configuration); without it they SHALL render the "feature not available" view.

#### Scenario: Host passes the opt-in
- **WHEN** the host configuration enables private rooms and a signed-in user opens `/sdk/private`
- **THEN** the private rooms list renders

#### Scenario: Flag absent
- **WHEN** the host configuration does not enable private rooms
- **THEN** `/sdk/private`, `/sdk/private/[roomId]` and `/sdk/private/archive` render the not-available view and make no key or room requests

### Requirement: Translations needed by the private surface are bundled
The SDK SHALL ship every translation key the private surface renders; no component the private pages render, whichever route group it comes from, SHALL render a raw key. Keys that belonged to other namespaces are moved into Common or their namespace is bundled.

#### Scenario: Key from another namespace
- **WHEN** a private-surface component references a key that used to live outside Common (for example the remove-member dialog title)
- **THEN** the translated text is shown in the user's language, never the raw key

#### Scenario: Quota tooltip
- **WHEN** an upload in the SDK private surface fails on quota
- **THEN** the tooltip text is translated, not a raw key

#### Scenario: Room limit reached
- **WHEN** a user starts creating a room on the SDK private rooms list while the portal is at or near its room limit
- **THEN** the quota warning shows its title, text and buttons translated, and no raw key

### Requirement: Content security policy for the private surface
The SDK SHALL apply a content security policy to the private routes that allows inline scripts and styles and WebAssembly evaluation, takes every other source from the SDK's own origin, with data and blob addresses only where the page builds them itself, and allows connections to the SDK's own origin and, in production, to any https origin, since encrypted file contents may come from the storage's own address. Development builds also allow plain and socket connections.

#### Scenario: Private page served
- **WHEN** a private route is requested through the SDK proxy
- **THEN** the response carries the private-surface content security policy

#### Scenario: Connections in production
- **WHEN** a private route is requested from a production build
- **THEN** the policy allows connections to the SDK's own origin and to https origins only, and allows no evaluation of strings as scripts

### Requirement: Private list header uses the section label
The SDK private rooms list SHALL show Common:Private as its header title, the same label as the client's Private section. The archive page SHALL keep Common:Archive.

#### Scenario: List header
- **WHEN** a signed-in user opens the SDK private rooms list
- **THEN** the header title is Common:Private

#### Scenario: Archive header
- **WHEN** a signed-in user opens the SDK private archive
- **THEN** the header title is Common:Archive

### Requirement: Archive page follows private-room rules
The SDK SHALL treat a folder as inside a private room when any folder on its path belongs to a private room, whether the room is active or archived, and SHALL apply every private-room rule an archived room still allows exactly as in an active one. With no archived rooms the private archive page SHALL show the archive empty view, whose action leads back to the private rooms list.

#### Scenario: Archived private room opened
- **WHEN** an archived private room is opened
- **THEN** copy, download, download without decryption and preview behave as in an active private room, within the archived room's rights

#### Scenario: No archived rooms
- **WHEN** the archive list is empty
- **THEN** Common:ArchiveEmptyScreenHeader is shown, and its action opens the private rooms list rather than the other rooms

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

### Requirement: Moves stay inside the private room
The SDK SHALL offer only folders of the same private room as destinations of a move of its items, and SHALL let the server move files and folders within the room without decrypting them. A move into another private room SHALL be refused with Common:CannotMoveToAnotherPrivateRoom. The decryption warning SHALL appear only in the copy dialog.

#### Scenario: Move dialog
- **WHEN** the move dialog is opened for items of a private room
- **THEN** only folders of that same room are selectable and no decryption warning is shown

#### Scenario: File moved within the room
- **WHEN** the user moves an encrypted file into a folder of the same private room
- **THEN** the server moves it, it keeps its id and file keys, and nothing is decrypted or uploaded

#### Scenario: Move into another private room
- **WHEN** a move of encrypted files into another private room is requested
- **THEN** Common:CannotMoveToAnotherPrivateRoom is shown and nothing is transferred

### Requirement: Name clashes checked before sending
The SDK SHALL compare the decrypted names of files uploaded, copied or duplicated into a private room folder with the decrypted names in that folder before sending anything. On a clash it SHALL offer to keep both, with the first free copy suffix, or to cancel, and SHALL NOT offer to overwrite or to add a version.

#### Scenario: Copy of a name that already has a copy
- **WHEN** the folder holds "Report.docx" and "Report (1).docx" and "Report.docx" is duplicated or copied into the same folder
- **THEN** the copy is stored as "Report (2).docx" without a prompt

#### Scenario: Upload with a clashing name
- **WHEN** a file whose decrypted name matches a file in the destination folder is uploaded
- **THEN** the user is asked to keep both or cancel before any byte is sent

### Requirement: Upload refused without a usable identity
The SDK SHALL refuse an upload into a private room before any byte is sent when the user has no key, marking each item failed in the upload panel with Common:EncryptionKeysRequiredForUpload and showing the device-setup hint, and when the user declines to unlock, marking each item failed with Common:EncryptionLockedUpload and showing Common:EncryptionUploadCancelled.

#### Scenario: Uploader without a key
- **WHEN** a user with no registered key uploads into a private room
- **THEN** no bytes are sent, the items fail with Common:EncryptionKeysRequiredForUpload and the device-setup hint is shown

#### Scenario: Uploader declines to unlock
- **WHEN** the uploader cancels the unlock prompt when the upload starts
- **THEN** no bytes are sent and the items fail with Common:EncryptionLockedUpload

### Requirement: Upload panel follows encrypted uploads
The SDK upload panel SHALL show each encrypted upload's progress and its encrypting phase, SHALL take a file the user cancels, from its row or in the name-clash dialog, out of the panel and its progress, SHALL fail a file stopped by a lock of the identity with Common:EncryptionLockedUpload, SHALL stop every running upload on "Cancel all", and SHALL warn with Common:EncryptedUploadNotSharedWith when a member was left out because their key change was refused.

#### Scenario: Encrypting phase
- **WHEN** a file is being encrypted before it is sent
- **THEN** its row in the upload panel shows the encrypting label and then its progress

#### Scenario: Member left out
- **WHEN** a member's key change is refused during an upload
- **THEN** the file is uploaded for the other members and Common:EncryptedUploadNotSharedWith names the member

#### Scenario: Name clash cancelled
- **WHEN** the user cancels the name-clash dialog of an upload into a private room
- **THEN** the files of that upload leave the panel and its progress, nothing of them is sent, and the upload button does not report them as uploaded

#### Scenario: Identity locked during an upload
- **WHEN** the identity is locked while files are uploading into a private room
- **THEN** each file not yet stored fails with Common:EncryptionLockedUpload and the upload button shows the failure

#### Scenario: Cancel all with two uploads running
- **WHEN** two uploads into private rooms are running and the user presses "Cancel all"
- **THEN** both stop, no further byte of either is sent, and no file of either keeps uploading out of sight of the panel

### Requirement: Quota errors stop the batch and retry keeps the target
The SDK SHALL stop the queued uploads of a batch into a private room when the server reports a quota error, mark them as quota failures with a retry option, and retry a failed upload against the folder fixed when it was first queued, applying the private-room upload rules again, including the unlock prompt.

#### Scenario: Quota exceeded mid-batch
- **WHEN** one upload in a batch fails with a quota error
- **THEN** queued uploads are not started and each affected item shows the quota failure with a retry option

#### Scenario: Retry after navigation
- **WHEN** a failed upload is retried after the user opened another folder
- **THEN** the file is encrypted and sent to the folder it was first queued for

### Requirement: Re-import of a file downloaded without decryption
The SDK SHALL recognise an uploaded file that is already in the encrypted container format, recover its original file key through the uploader's unlocked identity and upload it without encrypting it again; when that fails it SHALL report Common:EncryptionReimportFailed and send nothing.

#### Scenario: Ciphertext re-uploaded
- **WHEN** a file downloaded "without decryption" is uploaded back into the same private room
- **THEN** it is stored with its original file key and stays readable to room members

### Requirement: Dropped folders and drop targets
The SDK SHALL refuse folder trees dropped into a private room or onto one of its folders with Common:FolderUploadNotSupportedInPrivateRoom while uploading the files of the same drop, and SHALL upload files dropped onto a folder row into that folder, not into the open one.

#### Scenario: Files and folders dropped together
- **WHEN** a drop into an open private room contains files and folders
- **THEN** the files are uploaded encrypted and the folders are refused with Common:FolderUploadNotSupportedInPrivateRoom

#### Scenario: Files dropped on a folder row
- **WHEN** files are dropped onto the row of a folder inside the open private room
- **THEN** they are uploaded encrypted into that folder

### Requirement: Menu entries withheld for encrypted items
The SDK SHALL withhold for an encrypted file, in row, header and selection menus, the entries the client withholds: rename, favorites, version entries, download-as, conversion, AI and integrator custom actions, and open and preview when the file opens only after a conversion; and for a folder inside a private room, also within a selection and whatever rights it reports: copy, duplicate and favorites. It SHALL offer download without decryption in the row and header menus.

#### Scenario: Header menu of an encrypted file
- **WHEN** a single encrypted file is selected and the header menu is opened
- **THEN** no favorites, rename or download-as entry is shown and download without decryption is offered

#### Scenario: Header menu of a folder inside a private room
- **WHEN** a folder inside a private room is open and its header menu is opened
- **THEN** no copy, duplicate or favorites entry is shown

#### Scenario: Selection holding a folder of a private room
- **WHEN** a folder of a private room is ticked, alone or with encrypted files, and the selection menu is opened, whatever Copy right the folder reports
- **THEN** no copy entry is offered

#### Scenario: Selection of encrypted files only
- **WHEN** only encrypted files of a private room are ticked and the selection menu is opened
- **THEN** copy is offered although the server reports no Copy right for the files

#### Scenario: Integrator action on an encrypted file
- **WHEN** the host registered custom context actions and the user opens the menu of an encrypted file
- **THEN** the custom actions are not shown

#### Scenario: Encrypted file that must be converted
- **WHEN** the user opens the menu of an encrypted file that opens only after a conversion
- **THEN** no open or preview entry is shown

### Requirement: Room menu of a private room
The SDK SHALL NOT offer duplicate, embedding settings, download or link entries in the context menu of a private room or of a selection of private rooms, and SHALL offer the invite entry to a user who may edit the room.

#### Scenario: Private room menu
- **WHEN** the user opens the menu of a private room in the private rooms list
- **THEN** duplicate, embedding settings, download and link entries are absent

#### Scenario: Selected private rooms
- **WHEN** several private rooms are selected and their menu is opened
- **THEN** no download entry is offered

### Requirement: Encrypted errors are localized
The SDK SHALL take every message of an encrypted upload, copy, move, download or create from the locale files, with no English fallback text in code; an error without a specific message SHALL show Common:EncryptedOperationFailed.

#### Scenario: Download fails
- **WHEN** the decryption of a downloaded file fails
- **THEN** a localized message is shown, never a raw error text or object

### Requirement: Membership from every entry point
The SDK SHALL run the private-room flows (invite with re-wrap, owner change with key checks and current members as candidates, room edit showing the private badge) from every place they can be started: the private rooms list, the info panel and the header menu of an open private room.

#### Scenario: Invite from the header of an open room
- **WHEN** the user invites a member from the header menu of an open private room
- **THEN** the identity is unlocked first and every encrypted file of the room gains an entry for the invitee

#### Scenario: Owner change from the header of an open room
- **WHEN** the user changes the owner from the header menu of an open private room
- **THEN** only current members are candidates and a candidate without a verified key is refused

#### Scenario: Info panel menu of an open room
- **WHEN** the user picks edit, invite or change owner in the info panel menu of an open private room
- **THEN** the private flow of that action starts, as from the private rooms list

#### Scenario: Edit from the info panel of an open room
- **WHEN** the user picks edit in the info panel menu of an open private room
- **THEN** the private room's edit dialog opens with the private badge

#### Scenario: Invite from the info panel of an open room
- **WHEN** the user picks invite in the info panel menu of an open private room
- **THEN** the private invite panel opens, offering people only

#### Scenario: Owner change from the info panel of an open room
- **WHEN** the user picks change owner in the info panel menu of an open private room
- **THEN** the private owner-change dialog opens with the current members as candidates

### Requirement: Invite panel offers people only and reports the invitation result
The SDK invite panel of a private room SHALL offer portal users only, with no Guests tab and no groups. It SHALL grant room access to the verified invitees before wrapping their file keys, and SHALL stay open after sending with the result of each invitee (granted, pending access, or skipped with Common:EncryptedInviteNoKey or Common:EncryptedSkippedKeyMismatch) until the user closes it. When nobody was invited it SHALL keep the invite form, and it SHALL NOT repeat a skip reason in a toast.

#### Scenario: People selector
- **WHEN** the user opens "choose from list" in the invite panel of a private room
- **THEN** no Guests tab and no group is shown

#### Scenario: Order of operations
- **WHEN** an invitation to a private room is sent from the SDK
- **THEN** room access is granted to the verified invitees before their file keys are wrapped, and each granted invitee ends up holding an access entry for every encrypted file in the room or shown as pending access

#### Scenario: Mixed invitation
- **WHEN** some invitees have verified keys and others are skipped
- **THEN** only the verified invitees are granted access, and the panel stays open listing the skipped ones with the reason

#### Scenario: Nobody invited
- **WHEN** the only invitee of an SDK invitation into a private room has no registered encryption key
- **THEN** the invite form stays with that user in the list, Common:EncryptedInviteNoKey names them above the list, and neither an invite result nor a toast with the same sentence is shown

### Requirement: Leaving a private room drops the role without a revocation of its own
The SDK SHALL, when the user leaves a private room, including through an owner change with the leave option, drop the role without a revocation of its own; the server removes the leaver's wrapped keys with the role, the room's current owner excepted.

#### Scenario: Member leaves
- **WHEN** a member leaves a private room
- **THEN** the role is dropped, the SDK writes no access entry, and the leaver's keys are gone from every encrypted file of the room

### Requirement: Member removal is blocked during active uploads
The SDK SHALL refuse to start removing a member of a private room while uploads into the room or any folder inside it are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count, and SHALL let the removal start once they finish.

#### Scenario: Uploads in flight
- **WHEN** the user removes a member while an upload into the room is running
- **THEN** Common:CannotRemoveMemberWhileUploads is shown and no removal starts

#### Scenario: Uploads into a subfolder
- **WHEN** the user removes a member while an upload into a subfolder of the room is running
- **THEN** Common:CannotRemoveMemberWhileUploads counts that upload and no removal starts

### Requirement: Private room creation gate
The SDK SHALL refuse to start private room creation when the browser does not expose WebCrypto, with Common:EncryptionRequiresHttps. It SHALL re-fetch the keys before creating, refuse with Common:EncryptionKeysRequiredForPrivateRoom when none exist, and close the creation when the user cancels or key generation fails. A key list that failed to load SHALL NOT count as an empty one.

#### Scenario: Plain HTTP origin
- **WHEN** a user starts creating a private room on an origin without WebCrypto
- **THEN** Common:EncryptionRequiresHttps is shown and no dialog opens

#### Scenario: Key generation cancelled
- **WHEN** a user without keys starts creating a private room and cancels key generation
- **THEN** no creation dialog is left open

#### Scenario: Key list failed to load
- **WHEN** the SDK's request for the user's key list fails, on page load or on a reload when the tab regains focus
- **THEN** the keys known before the failure are kept, no key-generation prompt is offered on account of the failure, and an unlocked identity is not locked by it

### Requirement: Share tab hidden for private items
The SDK SHALL NOT show the Share tab of the info panel for a private room, a folder inside it, or an encrypted file, whether the room is active or archived, as the client does. The info panel header SHALL offer only the tabs its body shows.

#### Scenario: Encrypted file selected
- **WHEN** an encrypted file of a private room is selected and the info panel opens
- **THEN** the tabs are History and Details, and no Share tab is shown

#### Scenario: Private room selected
- **WHEN** a private room is selected in the private rooms list or its archive and the info panel opens
- **THEN** the tabs do not include Share

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

### Requirement: Files list follows encrypted operations
The SDK SHALL list a file stored by an encrypted upload, duplicate or copy in the open folder as soon as it is stored, under its decrypted name, without waiting for a socket event or a navigation.

#### Scenario: Upload without a socket connection
- **WHEN** an encrypted upload into the open folder finishes and no socket event arrives
- **THEN** the file is listed under its decrypted name

### Requirement: No clipboard transfers in private rooms
The SDK SHALL NOT offer copy, cut or paste hotkeys for items of a private room.

#### Scenario: Ctrl+C pressed
- **WHEN** the user presses Ctrl+C, Ctrl+X or Ctrl+V with items of a private room selected
- **THEN** nothing is put on the clipboard and nothing is transferred

### Requirement: Private pages keep the host opt-in
The SDK SHALL keep the private-rooms opt-in in the address of the private pages through every change of the list's sorting, search, filters and page, and SHALL build every private navigation from the opt-in the page was opened with, not from the address it has at that moment.

#### Scenario: Room opened after sorting
- **WHEN** the user sorts or searches the private rooms list and then opens a room
- **THEN** the room page renders its content and its address carries the opt-in

#### Scenario: Frame reloaded after a filter change
- **WHEN** the user clears a filter of the private rooms list or its archive and the frame is then reloaded
- **THEN** the same private page renders, not the not-available view

### Requirement: Private room creation waits for a known key list
The SDK SHALL treat a key list that is not loaded, or failed to load, as one that may hold a key: the private-room dialog SHALL NOT offer key generation or import until the list is known to be empty. Creating a room while the list is unknown SHALL load it first, or wait for the load already running; a load that fails SHALL show Common:EncryptionKeysLoadFailed and create nothing.

#### Scenario: Key list still loading
- **WHEN** a user who holds a key opens the private-room dialog before the key list has loaded
- **THEN** the dialog offers no key generation, and its Create button creates the room once the list has loaded

#### Scenario: Create pressed during the load
- **WHEN** a user who holds a key presses Create in the private-room dialog while the key list is being loaded
- **THEN** the room is created once that load ends with the key, and Common:EncryptionKeysLoadFailed is not shown

#### Scenario: Key list failed to load
- **WHEN** the key list fails to load and the user presses Create in the private-room dialog
- **THEN** Common:EncryptionKeysLoadFailed is shown, no key is generated and no room is created

#### Scenario: Key list known to be empty
- **WHEN** the key list has loaded and holds no key
- **THEN** the dialog offers key generation as before

### Requirement: SDK invitations into a private room are sent one invitee per request
The SDK SHALL invite into a private room as the room-membership requirements "Private-room invitations are sent one invitee per request" and "Refused invitees are named in the invite result" describe.

#### Scenario: One invitee has never registered a key
- **WHEN** the SDK invite panel invites A, who holds a key, and B, who never registered one, into a private room
- **THEN** A becomes a member and receives the file keys, and the result names B with Common:EncryptedInviteNoKey

### Requirement: Pending access in the SDK members list
The SDK SHALL show a member of a private room for whom some files could not be re-wrapped as pending access (Common:EncryptedAccessPending), with a retry action for a user who may edit the room that re-wraps the missing files, as the client does.

#### Scenario: Retry from the SDK members list
- **WHEN** a user who may edit the room retries a pending member and every missing file is re-wrapped
- **THEN** the pending marker disappears and Common:EncryptedAccessRestored is shown

### Requirement: Private room creation needs a Document Server that encrypts
The SDK SHALL refuse to start private room creation when its files settings report that the connected Document Server cannot work with encrypted files, with Common:PrivateRoomDocServiceNotSupported, and SHALL show the same key when the server refuses the creation for that reason.

#### Scenario: Document Server without encryption
- **WHEN** a user starts creating a private room and the files settings report no encrypted-editing support
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown and no dialog opens

#### Scenario: Creation refused by the server
- **WHEN** the server refuses the creation of a private room because the Document Server cannot encrypt
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown instead of the server's message

### Requirement: SDK explains a refused access change in a private room
The SDK SHALL show Common:EncryptedAccessChangeRefused when the server refuses with 403 a leave, a member's removal or a member's role change in a private room, MUST NOT show the server's own message text for it, and SHALL close its leave dialog after a refused leave, as the client does. A leave refused after an owner change SHALL close the owner-change dialog, since the transfer took place. Any other failure SHALL be shown as before, the leave dialog staying open.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the dialog closes, and no text of the server appears

#### Scenario: Removal or role change refused
- **WHEN** a manager removes a member of a private room or changes the member's role in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member stays as listed, and no text of the server appears

#### Scenario: Leave fails for another reason
- **WHEN** a member confirms leaving a private room in the SDK and the request fails without a 403
- **THEN** the failure is shown and the dialog stays open

#### Scenario: Leave after an owner change refused
- **WHEN** the owner hands a private room over in the SDK with the leave option and the server answers 403 to the leave
- **THEN** Common:EncryptedAccessChangeRefused is shown once, the owner-change dialog closes, the room shows its new owner, and no text of the server appears

### Requirement: SDK reads pending access from the server
The SDK SHALL read the room's missing file keys from the server whenever its private members list loads for a user who may invite into the room or edit its members, and SHALL show the listed members as pending access, as the client does.

#### Scenario: Marker after a reload
- **WHEN** a member of a private room lacks the key of some encrypted file and a user who may invite reloads the SDK page and opens the members list
- **THEN** the member's row shows Common:EncryptedAccessPending

#### Scenario: User who may neither invite nor edit
- **WHEN** such a member opens the members list
- **THEN** the missing keys are not requested

### Requirement: SDK copy picker lists private rooms under a Private entry
The SDK SHALL list private rooms under a Private entry at the root of the copy destination picker of its private pages, since the Rooms list of the picker holds no private room. The entry SHALL NOT be offered for a move or a restore, nor on the generic pages.

#### Scenario: Copy into another private room
- **WHEN** a user copies an encrypted file on a private page and picks another private room under the Private entry
- **THEN** the copy is stored in that room encrypted for it, and the source file stays

#### Scenario: Copy into a folder of another private room
- **WHEN** the user picks a folder of another private room under the Private entry
- **THEN** the copy is stored in that folder, encrypted for the room that holds it

#### Scenario: Move on a private page
- **WHEN** a user opens the move picker on a private page
- **THEN** it offers no Private entry

### Requirement: SDK private-room dialog waits for the key
The SDK SHALL NOT show the private-room creation dialog behind the key-generation prompt, the passphrase dialog or the recovery-phrase dialog. For a user whose key list is known to be empty the creation dialog SHALL appear once a key is registered, and cancelling the prompts SHALL leave no dialog open. A key list that is not known yet SHALL keep the dialog shown, as "Private room creation waits for a known key list" describes.

#### Scenario: Key-less user starts a private room
- **WHEN** a user whose key list is known to be empty starts creating a private room in the SDK
- **THEN** the key-generation prompt is shown on its own, and the creation dialog appears after the key is registered

#### Scenario: Prompt cancelled
- **WHEN** that user cancels the key-generation prompt or one of its dialogs
- **THEN** no creation dialog is shown and no room is created

#### Scenario: Key holder
- **WHEN** a user who holds a key starts creating a private room in the SDK
- **THEN** the creation dialog opens at once and no key prompt is shown

#### Scenario: Editing a room
- **WHEN** a user opens the edit dialog of a private room in the SDK
- **THEN** the dialog opens at once, whatever the state of the key list

### Requirement: Private room dialog explains the room
The SDK SHALL show Common:PrivateRoomPanelDescription under Common:PrivateRoomTitle in the private block of its create and edit room dialog, the text the client shows there. It SHALL NOT show a help link in that block.

#### Scenario: Creating a private room
- **WHEN** the SDK's create dialog of a private room is open
- **THEN** the private block shows Common:PrivateRoomTitle and Common:PrivateRoomPanelDescription and no link

### Requirement: SDK saved names follow the client rules
The SDK SHALL name a decrypted file it saves, and each entry of a decrypted archive it saves, by the rules of the client: "Saved names are plain file names" and "Archive directories come from the folder tree" of private-rooms/file-operations, so the same file is saved under the same name from either.

#### Scenario: Name with separators in an SDK archive
- **WHEN** two encrypted files are downloaded together in the SDK and one decrypts to a name holding "/"
- **THEN** that file is one entry at the root of the archive, with the separator saved as "_"

#### Scenario: Names that differ only in case in an SDK archive
- **WHEN** two encrypted files that decrypt to "Budget.xlsx" and "budget.xlsx" are downloaded together in the SDK
- **THEN** the archive holds "Budget.xlsx" and "budget (1).xlsx"

#### Scenario: Single file saved from the SDK
- **WHEN** one encrypted file whose decrypted name holds a control character is downloaded in the SDK
- **THEN** the browser is asked to save it under the name without that character

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

### Requirement: SDK does not send an encrypted file to conversion
The SDK SHALL NOT start a server conversion of an encrypted file whose format must be converted, from a double click, the Enter key or any other open action, and SHALL show Common:PrivateRoomConvertNotSupported instead, as the client does. The conversion dialog SHALL NOT open for such a file. This refusal SHALL come before the check of the Document Server's encrypted-editing capability, as in the client.

#### Scenario: Encrypted file that must be converted opened
- **WHEN** the user double-clicks, or presses Enter on, an encrypted file of a private room whose format must be converted, while the Document Server can open encrypted files
- **THEN** Common:PrivateRoomConvertNotSupported is shown, no conversion dialog opens and no conversion is requested from the server

#### Scenario: Encrypted file that must be converted, Document Server without encryption
- **WHEN** the user opens an encrypted file of a private room whose format must be converted, while the Document Server cannot open encrypted files
- **THEN** Common:PrivateRoomConvertNotSupported is shown, not Common:PrivateRoomEditorNotSupported, and no conversion dialog opens

#### Scenario: File outside private rooms that must be converted
- **WHEN** the user opens a file that is not encrypted and must be converted
- **THEN** the conversion dialog opens as before

### Requirement: SDK declined unlock on a copy or move says nothing was transferred
The SDK SHALL show Common:EncryptionLockedCopy, and SHALL NOT show Common:EncryptionLockedAddMembers, when the user declines to unlock as an encrypted copy, move or duplicate starts. Nothing SHALL be transferred.

#### Scenario: Unlock declined on a copy in the SDK
- **WHEN** the user copies an encrypted file out of a private room in the SDK and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and no file is copied

#### Scenario: Unlock declined on a duplicate in the SDK
- **WHEN** the user duplicates an encrypted file in the SDK and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and no copy is stored

### Requirement: SDK reports a file without a wrap on a copy as no access
The SDK SHALL show Common:EncryptedFileNoAccessYet when an encrypted copy or duplicate of a single file fails because the file holds no wrap for the user, and SHALL name that file in Common:EncryptedCopyFailed when it is one of several files of a copy.

#### Scenario: Duplicate of a file without a wrap in the SDK
- **WHEN** a user who holds a key duplicates in the SDK an encrypted file that is not wrapped for them and unlocks the key
- **THEN** Common:EncryptedFileNoAccessYet is shown and no copy is stored

#### Scenario: One file of several without a wrap in the SDK
- **WHEN** a user who holds a key copies in the SDK two encrypted files out of a private room and one of them is not wrapped for them
- **THEN** the other file is copied and Common:EncryptedCopyFailed names the file that is not wrapped for them

### Requirement: SDK private pages are framed only by the portal's own origin
The SDK SHALL let only pages of the portal's own origin frame its private pages, and SHALL send them with same-origin opener and resource policies. In this version the private pages SHALL NOT be offered to embedding hosts of another origin, trusted or not; such hosts get private rooms through the embedded client frame.

#### Scenario: Private page framed by the portal
- **WHEN** a page of the portal's own origin frames `/sdk/private`
- **THEN** the private page renders in the frame

#### Scenario: Private page framed by another origin
- **WHEN** a private route is requested through the SDK proxy
- **THEN** the response allows framing by the portal's own origin alone and carries same-origin opener and resource policies, also when the portal trusts other origins for its SDK

### Requirement: SDK owner change wraps the candidate's missing files
The SDK SHALL transfer a private room to a new owner as the room-membership requirement "Ownership transfer wraps the candidate's missing files" describes: it wraps the files the server lists as missing for the candidate before it asks for the transfer, and counts with Common:EncryptedReencryptPartialFailure the files that stay missing or that the server names when it refuses the transfer.

#### Scenario: Missing entries wrapped before the transfer
- **WHEN** the owner transfers a private room in the SDK to a member who lacks an entry on some of its encrypted files
- **THEN** those files gain the member's entry before the transfer is asked, and the member becomes the owner

#### Scenario: Entries still missing
- **WHEN** some of those files cannot be wrapped for the candidate
- **THEN** the transfer is not asked, the owner stays and Common:EncryptedReencryptPartialFailure counts the files

#### Scenario: Transfer refused by the server
- **WHEN** the server refuses the transfer with 409 because the candidate still lacks an entry on an encrypted file
- **THEN** the owner stays, Common:EncryptedReencryptPartialFailure counts the files the server lists as missing, and no text of the server appears

#### Scenario: Unlock declined
- **WHEN** the owner declines to unlock their identity for the transfer
- **THEN** nothing is read or written, the owner stays and Common:EncryptionUnlockRequired is shown
