# Spec Delta

## MODIFIED Requirements

### Requirement: Copy and move destination resolved fail-closed
The SDK SHALL take the room of a copy or move destination from the destination folder's path, so a folder inside a private room counts as private whatever its own private field says. It SHALL resolve the destination before the unlock prompt, re-encrypt for a private destination, decrypt for one outside private rooms, and copy nothing with Common:EncryptedCopyFailed when the room cannot be resolved. Copy is offered for encrypted files although the server withholds the Copy right.

#### Scenario: Copy into a folder of another private room
- **WHEN** the user copies an encrypted file into a folder inside another private room
- **THEN** the file is uploaded encrypted for that room's members, and no plaintext is ever sent into the private room

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

### Requirement: Mixed and folder downloads refused
The SDK SHALL refuse a download that mixes encrypted and non-encrypted items with Common:PrivateRoomMixedDownloadNotSupported, and SHALL refuse any download of a folder inside a private room, alone or in a selection, with Common:PrivateRoomFolderDownloadNotSupported. It SHALL NOT offer a server archive of a private room, its folders or its files.

#### Scenario: Mixed selection
- **WHEN** the selection contains encrypted and non-encrypted items
- **THEN** an error toast with Common:PrivateRoomMixedDownloadNotSupported is shown and nothing is downloaded

#### Scenario: Folder in a private room
- **WHEN** the user downloads a folder of a private room from its menu, the header menu or a selection
- **THEN** an error toast with Common:PrivateRoomFolderDownloadNotSupported is shown and no archive is requested from the server

#### Scenario: Private room in the list
- **WHEN** the user opens the context menu of a private room in the private rooms list or archive
- **THEN** no download entry is offered

### Requirement: Decrypted titles in lists and history
The SDK SHALL recover the decrypted names of encrypted files whenever the file list changes (navigation, refresh, socket updates) and SHALL show them in the list views, the info panel history, recent files and the copy and move pickers once recovered. Until then it SHALL show the opaque server name and SHALL NOT prompt for unlock to show a name.

#### Scenario: Name recovered
- **WHEN** the file name cache holds a decrypted name for the file
- **THEN** list rows, tiles, history entries, recent files and picker items show the decrypted name

#### Scenario: File added by a list update
- **WHEN** an encrypted file appears in the open folder through a socket event or a navigation while the identity is unlocked
- **THEN** its decrypted name is recovered and shown without reloading the page

### Requirement: Folder operations use the server path
A folder move within one private room, into any of its folders, SHALL be executed by the server without client-side re-encryption. A folder copied out of a private room or into another room, or moved out of private rooms, SHALL be withheld with Common:CannotTransferFolderFromPrivateRoom; a folder move into another private room is refused like any move there, with Common:CannotMoveToAnotherPrivateRoom. A folder copy SHALL NOT be offered inside a private room in this version.

#### Scenario: Folder moved within a private room
- **WHEN** the user moves a folder into another folder of the same private room
- **THEN** the server moves the folder and the files keep their existing wraps

#### Scenario: Folder transferred out of the room
- **WHEN** the user copies a folder of a private room to any other room or folder, or moves it out of the private rooms
- **THEN** the operation is refused with Common:CannotTransferFolderFromPrivateRoom and nothing is transferred

#### Scenario: Folder moved to another private room
- **WHEN** a move of a folder of a private room into another private room is requested
- **THEN** it is refused with Common:CannotMoveToAnotherPrivateRoom and nothing is transferred

#### Scenario: Folder copied within a private room
- **WHEN** the user opens the context menu of a folder in a private room
- **THEN** no copy action is offered, whatever rights the folder reports

## ADDED Requirements

### Requirement: Private rooms only through the private pages
The SDK SHALL list and open private rooms only on its private pages. Its generic room lists, active and archived, SHALL leave private rooms out, and a generic room address of a private room SHALL lead to the private page of that room. No generic room flow (upload, member removal, AI chat) SHALL run on a private room.

#### Scenario: Generic rooms list
- **WHEN** the generic rooms list or its archive is opened in the SDK
- **THEN** no private room is listed

#### Scenario: Private room opened by its generic address
- **WHEN** a private room is opened at its generic room address
- **THEN** the private page of that room is shown, or the not-available view when the host has not enabled private rooms

#### Scenario: No plaintext through a generic page
- **WHEN** a user reaches a private room through any SDK address
- **THEN** an upload into it never sends plaintext and the AI chat is never offered

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
The SDK upload panel SHALL show each encrypted upload's progress and its encrypting phase, SHALL mark cancelled items as cancelled, and SHALL warn with Common:EncryptedUploadNotSharedWith when a member was left out because their key change was refused.

#### Scenario: Encrypting phase
- **WHEN** a file is being encrypted before it is sent
- **THEN** its row in the upload panel shows the encrypting label and then its progress

#### Scenario: Member left out
- **WHEN** a member's key change is refused during an upload
- **THEN** the file is uploaded for the other members and Common:EncryptedUploadNotSharedWith names the member

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
The SDK SHALL withhold for an encrypted file, in row, header and selection menus, the entries the client withholds: rename, favorites, version entries, download-as, conversion, AI and integrator custom actions; and for a folder inside a private room: copy, duplicate and favorites. It SHALL offer download without decryption in the row and header menus.

#### Scenario: Header menu of an encrypted file
- **WHEN** a single encrypted file is selected and the header menu is opened
- **THEN** no favorites, rename or download-as entry is shown and download without decryption is offered

#### Scenario: Header menu of a folder inside a private room
- **WHEN** a folder inside a private room is open and its header menu is opened
- **THEN** no copy, duplicate or favorites entry is shown

#### Scenario: Integrator action on an encrypted file
- **WHEN** the host registered custom context actions and the user opens the menu of an encrypted file
- **THEN** the custom actions are not shown

### Requirement: Room menu of a private room
The SDK SHALL NOT offer duplicate, embedding settings, download or link entries in the context menu of a private room, and SHALL offer the invite entry to a user who may edit the room.

#### Scenario: Private room menu
- **WHEN** the user opens the menu of a private room in the private rooms list
- **THEN** duplicate, embedding settings, download and link entries are absent

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

### Requirement: Invite panel offers people only and closes before re-encryption
The SDK invite panel of a private room SHALL offer portal users only, with no Guests tab and no groups, and SHALL close once the room security update succeeds, showing the re-encryption progress afterwards.

#### Scenario: People selector
- **WHEN** the user opens "choose from list" in the invite panel of a private room
- **THEN** no Guests tab and no group is shown

#### Scenario: Order of operations
- **WHEN** the room security update succeeds
- **THEN** the panel closes and the re-encryption progress is shown until the file keys are wrapped

### Requirement: Leaving a private room revokes own access first
The SDK SHALL, when the user leaves a private room, including through an owner change with the leave option, run a revocation of the user's own access entries before dropping the role, on a best-effort basis that never blocks leaving.

#### Scenario: Member leaves
- **WHEN** a member leaves a private room
- **THEN** the revocation of their own entries runs before their role is dropped

### Requirement: Member removal is blocked during active uploads
The SDK SHALL refuse to start removing a member of a private room while uploads into the room are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count, and SHALL let the removal start once they finish.

#### Scenario: Uploads in flight
- **WHEN** the user removes a member while an upload into the room is running
- **THEN** Common:CannotRemoveMemberWhileUploads is shown and no removal starts

### Requirement: Private room creation gate
The SDK SHALL refuse to start private room creation when the browser does not expose WebCrypto, with Common:EncryptionRequiresHttps. It SHALL re-fetch the keys before creating, refuse with Common:EncryptionKeysRequiredForPrivateRoom when none exist, and close the creation when the user cancels or key generation fails.

#### Scenario: Plain HTTP origin
- **WHEN** a user starts creating a private room on an origin without WebCrypto
- **THEN** Common:EncryptionRequiresHttps is shown and no dialog opens

#### Scenario: Key generation cancelled
- **WHEN** a user without keys starts creating a private room and cancels key generation
- **THEN** no creation dialog is left open

### Requirement: Archive follows the active-room rules
The SDK SHALL treat a folder as inside a private room when any folder on its path belongs to a private room, whether the room is active or archived, and SHALL apply every private-room rule an archived room still allows exactly as in an active one.

#### Scenario: Archived private room opened
- **WHEN** an archived private room is opened
- **THEN** copy, download without decryption and preview behave as in an active private room, within the archived room's rights

### Requirement: No search in private rooms
The SDK SHALL NOT offer search inside a private room, active or archived, and SHALL NOT send a search text for a private room to the server.

#### Scenario: Private room opened
- **WHEN** a private room or a folder inside it is open
- **THEN** no search field is shown and no folder request carries a search text

### Requirement: No clipboard transfers in private rooms
The SDK SHALL NOT offer copy, cut or paste hotkeys for items of a private room.

#### Scenario: Ctrl+C pressed
- **WHEN** the user presses Ctrl+C, Ctrl+X or Ctrl+V with items of a private room selected
- **THEN** nothing is put on the clipboard and nothing is transferred
