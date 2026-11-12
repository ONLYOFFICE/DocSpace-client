# Private Room File Operations Specification

## Purpose

Describes what a user can do with files and folders inside a private (end-to-end encrypted) room in the client: upload, create, download, copy, move, delete, preview, search, and which actions, menu entries and hotkeys are withheld because the server only ever sees ciphertext. Opening a file in the editor is covered by the editor-integration capability; key material and wire formats by encryption-core; membership by room-membership. All behaviour here is the behaviour on the branch today, including a few neutral statements of current behaviour that later changes may tighten. Implementation: packages/client/src/store/uploadDataStore, packages/client/src/store/filesActionsStore (copyMove, download, delete, navigation, menu helpers), packages/client/src/store/filesStore (contextOptions, clientSearch, encryption, actions helpers), packages/client/src/store/contextOptionsStore, packages/client/src/store/HotkeyStore.ts, packages/client/src/HOCs/withHotkeys.js, packages/client/src/HOCs/withFileActions.js, packages/client/src/helpers/encryptedFileCreation.ts, packages/client/src/components/FilesSelector, packages/client/src/components/ItemIcon.tsx, packages/shared/components/media-viewer, packages/shared/services/private-room.

## Requirements

### Requirement: Uploads into a private room are encrypted on the client
The system SHALL encrypt each file on the client before it is uploaded into a private room, wrap the file key for the uploader and for each room member the server lists a key for, using that member's selected key so every member gets exactly one wrap, and mark the uploaded file as encrypted. The system SHALL NOT send a file into a private room in any other form. A failure to write the members' wraps SHALL be reported, never passed over.

#### Scenario: Member uploads a file
- **WHEN** a user with an encryption key drops a file into a private room
- **THEN** the bytes sent to the server are ciphertext under an opaque name and the resulting file is flagged encrypted with an access entry per room member

#### Scenario: Uploader without a key
- **WHEN** a user with no registered encryption key uploads into a private room
- **THEN** no bytes are sent, the item is marked failed in the upload panel with Common:EncryptionKeysRequiredForUpload, and the device-setup hint is shown

#### Scenario: Uploader declines to unlock
- **WHEN** the uploader has a key but cancels the unlock prompt when the upload starts
- **THEN** no bytes are sent and the item is marked failed with Common:EncryptionLockedUpload

#### Scenario: Member with two keys on the server
- **WHEN** the room access list holds two keys for one member
- **THEN** that member gets one access entry, for the selected key, and every other member still gets theirs

#### Scenario: Sharing with the members fails
- **WHEN** the file is stored with the uploader's entry but writing the other members' wraps fails
- **THEN** Common:EncryptedUploadShareFailed names the file, the members whose keys were read are marked as pending access for it, and the upload MUST NOT be reported as shared with them

### Requirement: No conversion on private upload
The system SHALL NOT offer or perform upload-time format conversion for files uploaded into a private room.

#### Scenario: Convertible file dropped
- **WHEN** a file whose format is normally offered for conversion is uploaded into a private room
- **THEN** the conversion prompt does not appear and the file is uploaded as is

### Requirement: Folder upload disabled in private rooms
The system SHALL NOT offer the "Upload folder" action or the Shift+I hotkey inside a private room. It SHALL refuse folder trees dropped into an open private room, or onto one of its folders, with Common:FolderUploadNotSupportedInPrivateRoom, deciding from the drop's target and not from the folder that is open when the files are queued. Drops onto a private room from outside it are refused as a whole by "Drops onto a private room from outside it are refused".

#### Scenario: Shift+U pressed
- **WHEN** the user presses Shift+U while a private room is open
- **THEN** the file picker opens, never the folder picker

#### Scenario: Shift+I pressed
- **WHEN** the user presses Shift+I while a private room is open
- **THEN** no folder picker opens

#### Scenario: Folders dropped on the view
- **WHEN** the user drags a folder tree into an open private room
- **THEN** nothing is uploaded and Common:FolderUploadNotSupportedInPrivateRoom is shown

#### Scenario: Files and folders dropped together
- **WHEN** a drop into an open private room contains both files and folders
- **THEN** the files are uploaded encrypted and the folders are refused with Common:FolderUploadNotSupportedInPrivateRoom

#### Scenario: Folders dropped on a folder of the open room
- **WHEN** the user drags a folder tree onto the row of a folder inside the open private room
- **THEN** no folder is created and Common:FolderUploadNotSupportedInPrivateRoom is shown

### Requirement: Re-import of a file downloaded without decryption
The system SHALL recognise an uploaded file that is already in the encrypted container format, recover its original file key through the uploader's unlocked identity, and upload it without encrypting it a second time.

#### Scenario: Ciphertext re-uploaded
- **WHEN** a file previously downloaded "without decryption" is uploaded back into the same private room
- **THEN** it is stored with its original file key and remains readable to room members

#### Scenario: Identity locked during re-import
- **WHEN** such a file is uploaded while the identity is locked and the user declines to unlock
- **THEN** the upload fails with a re-import error instead of double-encrypting

### Requirement: PDF forms are flagged in the encrypted header
The system SHALL detect a PDF form before encryption and set the form flag in the unencrypted container header so the server can classify the file.

#### Scenario: PDF form uploaded
- **WHEN** a fillable PDF form is uploaded into a private room
- **THEN** the container header carries the form flag and the file is listed as a form

### Requirement: Quota errors stop the batch
The system SHALL stop the remaining queued uploads when the server reports a quota error during a batch upload into a private room and SHALL mark those items as quota failures with a retry option.

#### Scenario: Quota exceeded mid-batch
- **WHEN** one upload in a batch fails with a quota error
- **THEN** queued uploads are not started and each affected item shows the quota failure state

### Requirement: Drops onto a private room from outside it are refused
The system SHALL refuse files dropped from the computer onto a private room, or onto a folder inside one, whenever the open folder is not inside that room. It SHALL show Common:OpenPrivateRoomToUpload and SHALL NOT start an upload session, create a folder or offer conversion. This SHALL hold for rows and tiles in every list. When the system cannot tell whether the target lies inside a private room, it SHALL refuse the drop and send nothing.

#### Scenario: Files dropped on a private room row
- **WHEN** a user drops files from the computer onto the row of a private room in the Rooms list
- **THEN** no upload session is started, no bytes are sent, nothing is added to the room, and Common:OpenPrivateRoomToUpload is shown

#### Scenario: Files dropped on a private room tile
- **WHEN** a user drops files from the computer onto the tile of a private room in the tile view of a rooms list
- **THEN** no upload session is started, no bytes are sent, and Common:OpenPrivateRoomToUpload is shown

#### Scenario: Folder tree dropped on a private room row
- **WHEN** a user drops a folder tree onto the row of a private room in a rooms list
- **THEN** no folder is created in the room, no file is sent, and Common:OpenPrivateRoomToUpload is shown instead of Common:FolderUploadNotSupportedInPrivateRoom

#### Scenario: Convertible file dropped on a private room row
- **WHEN** a file whose format is normally offered for conversion is dropped onto the row of a private room in a rooms list
- **THEN** the conversion prompt does not appear and nothing is sent

#### Scenario: Folder of a private room listed outside it
- **WHEN** files are dropped onto a folder of a private room that is listed in a view whose open folder is outside that room
- **THEN** nothing is sent and Common:OpenPrivateRoomToUpload is shown

#### Scenario: Target room cannot be determined
- **WHEN** files are dropped onto a folder of a room listed outside that room, and the system fails to load which room the folder belongs to
- **THEN** nothing is sent, no folder is created, and the files are not uploaded unencrypted anywhere

#### Scenario: Ordinary room row
- **WHEN** files are dropped onto the row of a room that is not private
- **THEN** they are uploaded into that room unencrypted

#### Scenario: Folder row inside the open private room
- **WHEN** files are dropped onto the row of a folder while the private room that contains it is open
- **THEN** they are encrypted and uploaded into that folder

#### Scenario: Another room opened during the directory read
- **WHEN** a folder tree is dropped onto a folder row inside the open private room and the user opens an ordinary room before the browser has finished reading the dropped directories
- **THEN** the drop keeps the privacy of the row's room: folder trees are refused there as in the private room, and no file of the drop is sent unencrypted

### Requirement: Upload target is fixed when the user starts the upload
The system SHALL fix, for every uploaded file, its target folder, whether that folder takes uploads, and whether it lies inside a private room, with that room's type and identity, at the moment the user drops, pastes or picks the files. Every later step SHALL use only this fixed target. Opening another folder, leaving the files section or the open folder being cleared SHALL NOT change where a file is sent, whether it is sent, or whether it is encrypted.

#### Scenario: Room left while files are queued
- **WHEN** a user uploads more files into a private room than are sent at once, and opens the Rooms list before the last of them has started
- **THEN** every file is sent encrypted under an opaque name into the private room, and no file is sent in plaintext

#### Scenario: Files section left while files are queued
- **WHEN** a user uploads files into a private room and opens a page outside the files section before the queue has finished
- **THEN** the remaining files are still sent encrypted into the private room

#### Scenario: Pasted files after navigation
- **WHEN** a user pastes files from the computer with Ctrl+V while a private room is open, and opens another folder before they have started
- **THEN** they are sent encrypted into the private room

#### Scenario: Private room opened while a plain upload is queued
- **WHEN** files queued for a folder outside any private room are still waiting and the user opens a private room
- **THEN** those files are sent unencrypted into the folder they were queued for, and nothing is sent into the private room

#### Scenario: Folder without the upload right opened during the directory read
- **WHEN** a folder tree is dropped on the list of a folder the user may upload into, and the user opens a folder without that right before the browser has finished reading the dropped directories
- **THEN** the files are uploaded into the folder they were dropped on; a drop on a folder without the right sends nothing, even if a folder with the right is opened meanwhile

### Requirement: Queued private uploads are sent only as ciphertext
The system SHALL send a file whose fixed target lies inside a private room only after encrypting it for that room, whatever folder is open when its turn comes. If the file cannot be encrypted then, the system SHALL mark it failed and SHALL NOT send any of its bytes:
- Common:EncryptionKeysRequiredForUpload without a usable key;
- Common:EncryptionLockedUpload when the unlock is declined;
- Common:EncryptionPrepareFailed when encryption yields no ciphertext.

#### Scenario: No key when the queued file starts
- **WHEN** a file queued for a private room reaches its turn while the user has no usable encryption key and another folder is open
- **THEN** no bytes are sent and the item fails with Common:EncryptionKeysRequiredForUpload

#### Scenario: Unlock declined for a queued batch
- **WHEN** the user declines the unlock prompt for a batch queued for a private room
- **THEN** none of its files that would be encrypted is sent, and each of them fails with Common:EncryptionLockedUpload

#### Scenario: Encryption yields no ciphertext
- **WHEN** the encryption step returns a file queued for a private room unencrypted
- **THEN** no upload session is started and the item fails with Common:EncryptionPrepareFailed

#### Scenario: Private target with another room type
- **WHEN** a file's fixed target lies in a private room but names a room type other than the custom room type
- **THEN** the file is refused and no bytes are sent, rather than being sent unencrypted

#### Scenario: Copy into a private room with another room type
- **WHEN** the path of the destination folder of a copy into a private room names a room type other than the custom room type
- **THEN** the copy is refused with Common:EncryptionPrepareFailed and no bytes are sent, as for an upload with such a target

### Requirement: Retry keeps the fixed target
The system SHALL retry a failed upload, from the upload panel or after a quota failure, against the target fixed when the file was first queued, never against the open folder. It SHALL apply the private-room upload rules to the file again before sending any byte, including the unlock prompt.

#### Scenario: Retry from another folder
- **WHEN** an upload into a private room failed and the user clicks Retry in the upload panel while the Rooms list is open
- **THEN** the file is encrypted and sent into the private room under an opaque name, and no plaintext is sent

#### Scenario: Retry still without a key
- **WHEN** a user who still has no encryption key retries a file that failed with Common:EncryptionKeysRequiredForUpload
- **THEN** no bytes are sent and the item fails again with Common:EncryptionKeysRequiredForUpload

#### Scenario: Retry while locked
- **WHEN** the user retries a file fixed for a private room while the encryption identity is locked, and declines the unlock prompt
- **THEN** no bytes are sent and the item fails with Common:EncryptionLockedUpload

#### Scenario: Retry after a quota failure
- **WHEN** files queued for a private room failed with a quota error and the user retries them after leaving the room
- **THEN** they are sent encrypted into the private room

#### Scenario: Retry while another upload is running
- **WHEN** the user retries a file fixed for a private room while other files of the queue are still uploading and the unlock prompt is open
- **THEN** no upload session is started for the retried file until the prompt is answered; if it is declined the file fails with Common:EncryptionLockedUpload, and it is never uploaded twice

### Requirement: Create new file in a private room
The system SHALL allow creating only docx, xlsx, pptx and pdf files inside a private room, each produced and encrypted on the client, and SHALL hide the create entries when the user has no encryption key. Creation errors SHALL be reported through localized messages.

#### Scenario: Create document with keys
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** an encrypted empty document is created and listed

#### Scenario: Unsupported extension requested
- **WHEN** a create request for any other extension reaches the private-room creation path
- **THEN** the request is rejected and Common:PrivateRoomCreateNotSupported is shown with the extension

#### Scenario: No keys
- **WHEN** the user has no encryption key
- **THEN** the "+ New" menu, the empty-view tiles, the quick-action tiles and the create hotkeys offer no file creation, only folder creation and upload

### Requirement: One create action makes one file
The system SHALL create exactly one file for one create action in a private room, under the name the user confirmed, and SHALL NOT start a second creation when the file-name setting changes while the file is being created. The name dialog SHALL stay open, with its Create button loading, until the creation has finished.

#### Scenario: Don't ask again ticked in the name dialog
- **GIVEN** a user with keys who is asked for file names (Common:DontAskAgain is off in the profile)
- **WHEN** the user chooses "New presentation" in a private room, ticks Common:DontAskAgain in the name dialog and presses Create
- **THEN** exactly one encrypted presentation, Common:NewPresentation, is created and one editor opens
- **AND** no second file is created after the setting has been saved

#### Scenario: Name typed and Don't ask again ticked
- **WHEN** the user types "Q4 plan" in the name dialog of a new presentation, ticks Common:DontAskAgain and presses Create
- **THEN** only "Q4 plan.pptx" is created, and no file with the default name appears

#### Scenario: Dialog during the creation
- **WHEN** the user presses Create with Common:DontAskAgain ticked and the encrypted file is still being produced
- **THEN** the name dialog stays open with its Create button loading, and closes once the file is created or the creation fails

#### Scenario: File names not asked
- **GIVEN** Common:DontAskAgain is on in the profile
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** no name dialog is shown and exactly one encrypted document, Common:NewDocument, is created

### Requirement: PDF creation on mobile
The system SHALL show Common:MobileEditPdfNotAvailableInfo instead of creating a PDF form when the empty-view tile is used on a mobile device.

#### Scenario: Mobile tap on PDF tile
- **WHEN** the user taps "New PDF form" in the empty private room view on mobile
- **THEN** the info toast is shown and no file is created

### Requirement: New PDF form entry present in private rooms
The system SHALL list "New PDF form" among the create entries of a private room when the user has keys (current behaviour; form filling itself is not offered, see the forms requirement).

#### Scenario: Create menu opened
- **WHEN** a user with keys opens the "+ New" menu in a private room
- **THEN** the entries are document, spreadsheet, presentation, PDF form, folder and upload files

### Requirement: Rename withheld for encrypted files
The system SHALL NOT offer rename for an encrypted file, neither in the context menu, nor in the media viewer menu, nor via the F2 hotkey.

#### Scenario: F2 on encrypted file
- **WHEN** the user presses F2 with an encrypted file selected
- **THEN** no rename editor opens

#### Scenario: Media viewer menu of an encrypted file
- **WHEN** the user opens the menu of an encrypted file in the media viewer, on a desktop or on a mobile device, including the menu of a PDF
- **THEN** rename is absent, whatever rename right the server reports for the file

#### Scenario: Media viewer menu of a file that is not encrypted
- **WHEN** the user opens the media viewer menu of a file that is not encrypted and may be renamed
- **THEN** rename is present

### Requirement: Transfer into a private room is refused
The system SHALL refuse to copy or move items from outside into a private room, showing Common:CannotTransferToPrivateRoom, and SHALL exclude private rooms from the destination picker for such operations.

#### Scenario: Drag from My documents into a private room
- **WHEN** a file from a non-private location is dropped onto a private room
- **THEN** nothing is transferred and Common:CannotTransferToPrivateRoom is shown

#### Scenario: Destination picker
- **WHEN** the copy or move dialog is opened for items outside private rooms
- **THEN** private rooms are not selectable as destination

### Requirement: Folders cannot leave a private room
The system SHALL refuse to copy or move a folder out of a private room, showing Common:CannotTransferFolderFromPrivateRoom.

#### Scenario: Folder dragged out
- **WHEN** a folder inside a private room is dropped onto a destination outside it
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown

#### Scenario: Folder copied to another private room
- **WHEN** the user copies a folder of a private room, alone or together with files, into another private room
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown, while the selected encrypted files are copied re-encrypted

### Requirement: Files leaving a private room are decrypted
The system SHALL decrypt files copied or moved out of a private room on the client and upload them as plaintext, after warning that they will be saved decrypted: in the destination picker, or in a confirmation before anything moves when the transfer starts without it (drag and drop, cut and paste). On move it SHALL delete each source only after its decrypted copy succeeded, and SHALL report Common:EncryptedCopyFailed with the failed names on error.

#### Scenario: Copy to My documents
- **WHEN** the user copies an encrypted file to a folder outside the room and confirms
- **THEN** a decrypted copy with the original name appears in the destination

#### Scenario: Move out of the room
- **WHEN** the user moves encrypted files to a destination outside the room, confirms the warning, and every decrypted copy succeeds
- **THEN** the decrypted copies appear in the destination and the source files are deleted from the private room

#### Scenario: Move out by drag and drop or paste
- **WHEN** the user drops encrypted files of a private room onto a folder outside private rooms, or pastes there files cut in a private room
- **THEN** a confirmation with Common:EncryptedTransferBannerTitle and Common:EncryptedTransferBannerDescription is shown, and nothing MUST be decrypted, uploaded or deleted before the user confirms

#### Scenario: Warning declined
- **WHEN** the user cancels that confirmation
- **THEN** nothing is transferred and the source files stay in the private room

#### Scenario: Move with a failed copy
- **WHEN** the user moves several encrypted files out and one decrypted copy fails
- **THEN** the sources of the successful copies are deleted, the failed source stays in place, and Common:EncryptedMovePartialFailure names it

#### Scenario: Identity locked
- **WHEN** the user declines to unlock when the transfer starts
- **THEN** no file is transferred and no source is deleted

### Requirement: Copy within the same private room
The system SHALL allow copying an encrypted file to the root of the same private room, wherever the copy is started, and SHALL give the copy the first copy suffix that no file of the destination carries, without asking.

#### Scenario: Same-room copy
- **WHEN** an encrypted file is copied to the root of its own room
- **THEN** a second encrypted file with a suffixed name appears

#### Scenario: Copy of a name that already has a copy
- **WHEN** the room root holds "Report.docx" and "Report (1).docx", and "Report.docx" is copied to the root
- **THEN** the copy is stored as "Report (2).docx" and no conflict dialog is shown

#### Scenario: Duplicate started outside the room
- **WHEN** an encrypted file is duplicated while the open folder is not its private room
- **THEN** the copy is encrypted for the file's room as a Duplicate inside the room would be, and its content MUST NOT be sent as plaintext

### Requirement: Duplicate of an encrypted file follows the move right
The system SHALL offer Duplicate in the context menu of an encrypted file of an active private room when the server grants the Move right on the file, although the server reports no Duplicate right for any entry of a private room. It SHALL NOT offer it without the Move right or in an archived private room. Duplicate SHALL copy the file as the same-room copy does and MUST NOT ask the server to duplicate it.

#### Scenario: Duplicate offered for an encrypted file
- **WHEN** a room manager, or a content creator on a file they created, opens the context menu of an encrypted file in an active private room
- **THEN** Duplicate is offered although the server reports no Duplicate right, and choosing it stores a second encrypted file with a suffixed name in the same folder
- **AND** no server duplicate request is sent and the content MUST NOT be sent as plaintext

#### Scenario: Duplicate withheld without the move right
- **WHEN** an editor, a viewer, or a content creator on a file someone else created opens the context menu of an encrypted file in an active private room
- **THEN** no Duplicate entry is shown

#### Scenario: Duplicate withheld in an archived private room
- **WHEN** the user opens the context menu of an encrypted file in an archived private room
- **THEN** no Duplicate entry is shown

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

#### Scenario: No own access entry
- **WHEN** the user downloads one encrypted file for which they hold no access entry
- **THEN** nothing is downloaded and Common:EncryptionDownloadFailed is shown

#### Scenario: Download from the media viewer
- **WHEN** the user downloads an encrypted file from the media viewer with its download button or Ctrl+S, and the identity is unlocked
- **THEN** the browser saves the plaintext file under its original name, and the ciphertext MUST NOT be handed to the browser as the download

#### Scenario: Download from the media viewer of a file that cannot be found
- **WHEN** the user downloads an encrypted file from the media viewer, and the file is neither in the current folder list nor the file the viewer was opened for
- **THEN** Common:EncryptionDownloadFailed is shown, nothing is downloaded, and the ciphertext MUST NOT be handed to the browser as the download

### Requirement: Multiple encrypted files download as a decrypted zip
The system SHALL decrypt each selected encrypted file and deliver them together as Files.zip, a decrypted name that clashes with another taking the lowest numbered suffix no other entry has. A selected folder that lies in a private room SHALL be included as its decrypted subtree under the folder's name, and no server archive SHALL be requested for it. Non-encrypted files and folders outside private rooms of the same selection download through the standard path.

#### Scenario: Several encrypted files selected
- **WHEN** the user downloads a selection of encrypted files
- **THEN** a single Files.zip containing the decrypted files is saved

#### Scenario: Decrypted names clash
- **WHEN** two selected files decrypt to the same name and a third already carries that name with the suffix (1)
- **THEN** the zip holds all three, the clashing one under the suffix (2)

#### Scenario: Files and folders selected
- **WHEN** an encrypted file and a folder of the same private room are selected and "Download" is picked in the header menu
- **THEN** one Files.zip is saved with the file under its decrypted name at the root and the folder's files under their decrypted names inside a directory named after the folder, and no server archive is requested

### Requirement: Download without decryption
The system SHALL offer "Download without decryption" for encrypted files and for folders in a private room, in the item context menu and in the bulk header menu of a private room; for a file it SHALL save the ciphertext container, for a folder it SHALL request a server archive of the ciphertext.

#### Scenario: Encrypted file
- **WHEN** the user picks download-encrypted on a file
- **THEN** the raw container is saved under its opaque name

#### Scenario: Folder in a private room
- **WHEN** the user picks download-encrypted on a folder
- **THEN** a server-side archive of the ciphertext files is produced and downloaded

#### Scenario: Bulk header menu
- **WHEN** several encrypted files are selected in a private room and the header menu is opened
- **THEN** "Download without decryption" is offered next to "Download"

### Requirement: Decrypted folder download
The system SHALL offer "Download" for a folder inside a private room and for the room itself, from its context menu or with the folder selected alone in the header menu; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, each under its path inside the folder, a name that clashes inside its folder taking the lowest numbered suffix no other entry has, with the same progress and error reporting as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

#### Scenario: Folder selected in the header menu
- **WHEN** a folder of a private room is the only selected item and "Download" is picked in the header menu
- **THEN** the same zip is saved as from the folder's context menu, named after the folder, and no server archive of its ciphertext is requested

### Requirement: Deletion bypasses the recycle bin
The system SHALL delete items in a private room permanently, never moving them to the recycle bin, and SHALL always show the delete confirmation with the permanent-deletion note, whichever way the deletion starts: the item menu, the menu of a selection, the header menu, the Delete key or the menu of the folder being viewed.

#### Scenario: Delete a file
- **WHEN** the user deletes a file in a private room and confirms
- **THEN** the file is removed immediately and does not appear in Trash

#### Scenario: Confirmation disabled in settings
- **WHEN** the user has turned off delete confirmations and deletes items in a private room from the item menu, the menu of a selection, the header menu, with the Delete key or from the menu of the folder being viewed
- **THEN** the confirmation dialog is shown before anything is deleted, and nothing MUST be deleted without it

### Requirement: Version operations withheld
The system SHALL NOT offer version history, finalize version, version list, version blocking or editing of the version comment for an encrypted file. The version badge of an encrypted file MAY show the version count, but SHALL NOT open the version history or carry the Common:ShowVersionHistory tooltip, whatever history rights the server reports for the file.

#### Scenario: Context menu of an encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** show-version-history, finalize-version, version and block-unblock-version are absent

#### Scenario: Version badge of an encrypted file
- **WHEN** the user clicks the version badge of an encrypted file that has several versions, in a list, table or tile view, and the server reports the ReadHistory right on it
- **THEN** the version history panel MUST NOT open, no version list is requested, and the badge has no Common:ShowVersionHistory tooltip

#### Scenario: Version badge of a file that is not encrypted
- **WHEN** the user clicks the version badge of a file that is not encrypted and has several versions, and the server reports the ReadHistory right on it
- **THEN** the version history panel opens, and the badge carries the Common:ShowVersionHistory tooltip

#### Scenario: Version comment of an encrypted file in the info panel
- **WHEN** the Details view of the info panel shows an encrypted file and the server reports the EditHistory right on it
- **THEN** the comment has no Common:EditButton or Common:AddButton control, no version list is requested, and a comment MUST NOT be sent to the server

#### Scenario: Version comment of a file that is not encrypted in the info panel
- **WHEN** the Details view of the info panel shows a file that is not encrypted and the server reports the EditHistory right on it
- **THEN** the comment carries the Common:EditButton or Common:AddButton control

### Requirement: Favorites, conversion and download-as withheld
The system SHALL NOT offer mark-as-favorite, convert or download-as for an encrypted file, nor favorites for a folder in a private room.

#### Scenario: Encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** mark-as-favorite, convert and download-as are absent

### Requirement: Files that need conversion cannot be opened
The system SHALL NOT open an encrypted file whose format requires server conversion and SHALL show Common:PrivateRoomConvertNotSupported instead; view, preview and edit entries SHALL be absent for it.

#### Scenario: Legacy format in a private room
- **WHEN** the user double-clicks an encrypted file that must be converted before viewing
- **THEN** Common:PrivateRoomConvertNotSupported is shown and nothing opens

### Requirement: Media preview decrypts on the client
The system SHALL fetch and decrypt an encrypted image, audio or video in the browser before showing it in the media viewer, SHALL close the viewer when the user dismisses the passphrase prompt, and SHALL report decryption failures with a localized message.

#### Scenario: Open encrypted image
- **WHEN** the user opens an encrypted image with the identity unlocked
- **THEN** the decrypted image is displayed and the viewer never requests a server-rendered preview

#### Scenario: Passphrase prompt dismissed
- **WHEN** the viewer needs the identity and the user cancels the prompt
- **THEN** the viewer closes

### Requirement: Opening without keys is withheld
The system SHALL NOT offer view, preview, edit, open or download entries for an encrypted file when the user's key list is known to hold no key, and SHALL show a "no access" badge on such files. While the key list is not known, because it has not loaded or failed to load, the system SHALL NOT show that badge or withhold those entries on account of keys.

#### Scenario: User without keys
- **WHEN** a user with no encryption key lists a private room
- **THEN** every encrypted file shows the lock badge titled Common:NoAccessToEncryptedFile and its menu has no open or download entries

#### Scenario: Key list not known
- **WHEN** a user lists a private room while their key list has not loaded or failed to load
- **THEN** no encrypted file shows the lock badge titled Common:NoAccessToEncryptedFile on account of keys, and the menus keep their open and download entries

### Requirement: Entering a private room without keys warns
The system SHALL show Common:EncryptionKeysNotConfigured when a user whose key list is known to hold no key navigates into a private room. When the key list is not known, the system SHALL read it again on entering the room and, when that read fails, SHALL show Common:EncryptionKeysLoadFailed with a Common:TryAgain action instead; the action SHALL read the list again.

#### Scenario: Navigate into room
- **WHEN** a user with no keys opens a private room
- **THEN** the warning toast Common:EncryptionKeysNotConfigured is shown

#### Scenario: Key list could not be loaded
- **WHEN** a user opens a private room while their key list is not known, and the read of the list fails
- **THEN** the error toast Common:EncryptionKeysLoadFailed is shown with Common:TryAgain, and Common:EncryptionKeysNotConfigured is not shown

#### Scenario: Retry succeeds
- **WHEN** the user presses Common:TryAgain and the read of the list succeeds with a key
- **THEN** the room asks to unlock the key and shows the decrypted file names after the unlock, without a page reload

#### Scenario: Retry fails
- **WHEN** the user presses Common:TryAgain and the read of the list fails again
- **THEN** Common:EncryptionKeysLoadFailed is shown again with Common:TryAgain

### Requirement: Encrypted names are recovered on every list update
The system SHALL resolve the display names of encrypted files from their containers whenever the file list changes, including navigation, refresh and socket-driven updates, and SHALL cache resolved names for the session.

#### Scenario: Socket adds a file
- **WHEN** another member uploads a file and the socket event adds it to the list
- **THEN** the new row shows its decrypted name once the identity is unlocked, without a manual refresh

### Requirement: Client-side search over decrypted names
The system SHALL perform search inside a private room on the client against resolved names, and SHALL re-sort by name on the resolved names, folders first.

#### Scenario: Search in a private room
- **WHEN** the user types a query while in a private room
- **THEN** only files whose decrypted name contains the query are shown

#### Scenario: Sort by name
- **WHEN** the list is sorted by name
- **THEN** the order follows the decrypted names, not the opaque server names

### Requirement: Open location uses client search
The system SHALL, for "Open location" on an encrypted file, navigate to the parent folder and apply a pending client-side search for the resolved name instead of a server search.

#### Scenario: Open location from search results
- **WHEN** the user chooses open-location on an encrypted file
- **THEN** the parent folder opens with the file highlighted via client-side search

### Requirement: Feeds show resolved names
The system SHALL show the decrypted display name of encrypted files in the History and New-files feeds and in notifications that name a file, recovering the name from the file header when it is not cached and the identity is unlocked; while locked or before recovery completes the opaque name is shown. Recent is not one of these feeds: the server never records an encrypted file as recent.

#### Scenario: History tab
- **WHEN** the History tab of a private room is opened with the identity unlocked
- **THEN** encrypted files are listed by their decrypted names, even if the file list has not been visited in this session

#### Scenario: New files panel
- **WHEN** the New-files panel lists encrypted files of a private room and the identity is unlocked
- **THEN** each entry shows the decrypted name

#### Scenario: Identity locked
- **WHEN** a feed lists encrypted files while the identity is locked
- **THEN** the opaque names are shown and no unlock prompt is raised by the feed itself

#### Scenario: Recent after opening an encrypted file
- **WHEN** the user opens an encrypted file and then opens Recent
- **THEN** the encrypted file is not listed there

### Requirement: Forms are not fillable in private rooms
The system SHALL NOT offer fill-form, start-filling, filling-status, stop-filling, make-form or submit-to-gallery for an encrypted file.

#### Scenario: Encrypted PDF form
- **WHEN** the context menu of an encrypted PDF form is opened
- **THEN** no form filling or gallery entry is present

### Requirement: Context-menu entries withheld for encrypted files
The system SHALL NOT show the following entries for an encrypted file: link-for-room-members, sharing-settings, copy-shared-link, manage-links, copy-general-link, send-by-email, create-room, ask-ai, make-form, submit-to-gallery, docu-sign, custom-filter, update-xlsx-data, vectorization, embedding-settings, convert, download-as, mark-as-favorite, rename, edit-index, version entries and form-filling entries; it SHALL add download-encrypted.

#### Scenario: Full menu of an encrypted file
- **WHEN** the context menu of an encrypted file is built
- **THEN** none of the listed entries is present and download-encrypted is present

### Requirement: Context-menu entries withheld for folders in private rooms
The system SHALL NOT show sharing-settings, copy-shared-link, manage-links, link-for-room-members, create-room, favorites, edit-index, copy-to or duplicate for a folder inside a private room, and SHALL add download-encrypted when the folder is downloadable; the standard download decrypts the folder on the client (Decrypted folder download).

#### Scenario: Folder menu in a private room
- **WHEN** the context menu of a folder inside a private room is built
- **THEN** none of the listed entries is present

### Requirement: Clipboard hotkeys follow the private-room transfer rules
The system SHALL apply the private-room transfer rules to Ctrl+X and Ctrl+V exactly as to drag-and-drop and the copy/move dialog: transfer into a private room from outside is refused, a move into another private room is refused, folders cannot leave a private room, files leaving for a destination outside private rooms are decrypted on the client, and items cut and pasted inside the same private room are moved by the server without decryption. Ctrl+C puts no private-room item on the clipboard.

#### Scenario: Paste with hotkey
- **WHEN** items copied from a non-private location are pasted with Ctrl+V into a private room
- **THEN** nothing is transferred and Common:CannotTransferToPrivateRoom is shown

#### Scenario: Cut and paste out of a private room
- **WHEN** encrypted files are cut with Ctrl+X and pasted with Ctrl+V outside the room
- **THEN** decrypted copies appear in the destination and the sources are deleted after the copies succeed

#### Scenario: Cut and paste a file another member uploaded
- **WHEN** a file uploaded by another room member is cut with Ctrl+X, the user opens a folder outside the room and pastes with Ctrl+V
- **THEN** the file is decrypted with that member's public key, the decrypted copy appears in the destination and the source is deleted

#### Scenario: Folder cut out of a private room
- **WHEN** a folder inside a private room is cut and pasted outside it
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown

#### Scenario: Paste within the same private room
- **WHEN** encrypted files are cut with Ctrl+X and pasted into a subfolder of the same private room
- **THEN** the server moves them in place and no decryption to plaintext happens

#### Scenario: Paste into another private room
- **WHEN** encrypted files are cut with Ctrl+X and pasted with Ctrl+V in another private room
- **THEN** nothing is transferred and Common:CannotMoveToAnotherPrivateRoom is shown

#### Scenario: Copy hotkey inside a private room
- **WHEN** the user presses Ctrl+C on items in a private room
- **THEN** nothing is added to the clipboard

### Requirement: Create hotkeys respect keys
The system SHALL ignore the file-creation hotkeys inside a private room when the user cannot create encrypted files, and SHALL ignore there the hotkey that creates a form from a file, which the create menu of a private room does not offer.

#### Scenario: Shift+D without keys
- **WHEN** a user with no keys presses the new-document hotkey in a private room
- **THEN** nothing is created

#### Scenario: Form from a file
- **WHEN** a user, with keys or without, presses Alt+Shift+O in a private room
- **THEN** no file picker opens and nothing is created

### Requirement: Quick actions in private rooms
The system SHALL show only the create-file tiles as quick actions inside a private room, and only when the user can create encrypted files.

#### Scenario: Private room with keys
- **WHEN** a user with keys opens an empty private room
- **THEN** the quick-action area shows the document, spreadsheet, presentation and PDF tiles

### Requirement: Encrypted items carry a badge
The system SHALL show the private badge on every encrypted file and on every private room outside Archive.

#### Scenario: Private room in the rooms list
- **WHEN** the rooms list contains a private room
- **THEN** its icon carries the private badge

### Requirement: Sender keys of files leaving a private room
The system SHALL look up the public keys of a file's senders in the source room's roster together with the file's own public keys when it decrypts the file to take it out of the room, so a file another member uploaded decrypts even where the source room is not known.

#### Scenario: Source room not known
- **WHEN** a file another member uploaded is copied or moved out of the room through a path that does not know the source room
- **THEN** the file is decrypted with that member's public key taken from the file's own public keys, and no source is deleted unless the copy succeeded

### Requirement: Private-room rules follow the room into Archive
The system SHALL treat the open folder as inside a private room when it, or any folder on its path, belongs to a room with the private setting, whatever section holds the room (Rooms or Archive). Every rule of this capability that a read-only archived room still allows SHALL apply there exactly as in an active private room. A room without the private setting SHALL NOT be treated as private in either section.

#### Scenario: Archived private room opened
- **WHEN** a member opens an archived private room
- **THEN** the private-room rules apply, as they did before the room was archived

#### Scenario: Folder inside an archived private room
- **WHEN** a member opens a subfolder of an archived private room
- **THEN** the private-room rules apply there as at the room root

#### Scenario: Ordinary archived room
- **WHEN** a user opens an archived room without the private setting
- **THEN** no private-room rule applies: search goes to the server and copies are made by the server

#### Scenario: Download in an archived private room
- **WHEN** a member downloads an encrypted file from an archived private room with the identity unlocked
- **THEN** the browser saves the plaintext file under its original name, decrypted on the client

### Requirement: Files copied out of an archived private room are decrypted
The system SHALL copy encrypted files out of an archived private room to a destination outside private rooms only by decrypting them on the client and uploading the plaintext to the destination, from the Copy dialog and by drag-and-drop. The destination picker SHALL show the Common:EncryptedTransferBannerTitle / Common:EncryptedTransferBannerDescription warning first. The system SHALL NOT ask the server to copy an encrypted file out of the room.

#### Scenario: Copy to My documents
- **WHEN** a member copies an encrypted file from an archived private room to My documents and confirms
- **THEN** a decrypted copy with the original name appears in My documents and the source stays in the room

#### Scenario: No server copy
- **WHEN** encrypted files are copied out of an archived private room by any route
- **THEN** no server copy operation is requested for them, so no copy of the ciphertext is attempted

#### Scenario: Warning in the destination picker
- **WHEN** the Copy dialog is opened for encrypted files in an archived private room, at the room root or in a subfolder
- **THEN** the picker shows the Common:EncryptedTransferBannerTitle warning

#### Scenario: Identity locked
- **WHEN** the member declines to unlock when the copy starts
- **THEN** no file is copied

### Requirement: Folders cannot leave an archived private room
The system SHALL refuse to copy a folder out of an archived private room, showing Common:CannotTransferFolderFromPrivateRoom, and SHALL NOT offer copy-to or duplicate for a folder inside it.

#### Scenario: Folder dragged out
- **WHEN** a folder inside an archived private room is dropped onto My documents
- **THEN** nothing is transferred and Common:CannotTransferFolderFromPrivateRoom is shown

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder inside an archived private room is opened
- **THEN** copy-to and duplicate are absent

### Requirement: Decrypted folder download in an archived private room
The system SHALL offer the standard "Download" for a folder inside an archived private room and decrypt it on the client as in an active private room, so no server archive of its ciphertext is offered as a plain download. It SHALL offer download-encrypted for the folder when it is downloadable, and SHALL withhold the other folder entries withheld in an active private room.

#### Scenario: Folder menu in an archived private room
- **WHEN** the context menu of a folder inside an archived private room is built
- **THEN** download and download-encrypted are present, and sharing-settings, copy-shared-link, manage-links, link-for-room-members, mark-as-favorite, copy-to and duplicate are absent

### Requirement: Copy hotkey withheld in an archived private room
The system SHALL NOT put any item of an archived private room on the clipboard with Ctrl+C, although the server grants the copy right there. Copying out of such a room goes through the Copy dialog or drag-and-drop, where files are decrypted.

#### Scenario: Ctrl+C on encrypted files
- **WHEN** a member selects encrypted files in an archived private room and presses Ctrl+C
- **THEN** nothing is added to the clipboard and no "added to clipboard" notice is shown

#### Scenario: Paste after Ctrl+C
- **WHEN** the member then opens My documents and presses Ctrl+V
- **THEN** no item from the archived private room is transferred and no server copy is requested

### Requirement: Client-side search in an archived private room
The system SHALL search inside an archived private room on the client against the resolved names, as in an active private room. The search query SHALL NOT be sent to the server or written into the page address.

#### Scenario: Search by decrypted name
- **WHEN** a member types part of a decrypted file name in the search box of an archived private room
- **THEN** only files whose decrypted name contains the query are shown

#### Scenario: Query stays on the client
- **WHEN** a member searches inside an archived private room
- **THEN** no folder request carries the query and the address contains no search value

#### Scenario: Search cleared
- **WHEN** the member clears the search box
- **THEN** the full list of the folder is shown again

#### Scenario: Open location of an encrypted file
- **WHEN** a member uses Open location on an encrypted file of an archived private room
- **THEN** the parent folder opens with the file found by client-side search, the search box shows its name, and clearing the search box clears the search

### Requirement: Copy into another private room is re-encrypted
The system SHALL copy encrypted files from a private room, active or archived, into another private room only by decrypting each file on the client and uploading it encrypted for the destination room. The file key SHALL be wrapped for the user and the destination room's members, with the same key checks and skipped-member report as an upload into that room. The source SHALL stay in place.

#### Scenario: Copy to another private room
- **WHEN** a member of two private rooms copies an encrypted file from the first into the second and confirms
- **THEN** an encrypted copy with the original name appears in the second room, its members with keys can open it, and the source stays in the first room

#### Scenario: Copy from an archived private room
- **WHEN** a member copies an encrypted file from an archived private room into an active private room
- **THEN** an encrypted copy appears in the active room, and no upload into that room is sent without encryption

#### Scenario: Key wrapped for the destination room
- **WHEN** an encrypted file is copied into another private room whose members differ from the source room's
- **THEN** the copy's key is wrapped for the destination room's members, and MUST NOT be wrapped for members of the source room who are not in the destination

#### Scenario: Destination member without a key
- **WHEN** a member of the destination room has no key at the time of the copy
- **THEN** the copy is uploaded encrypted with its key wrapped for the members who have one; the member without a key gets no wrap and, as with an upload into that room, is not named in a skipped-member report

#### Scenario: Identity locked
- **WHEN** the user declines to unlock when the copy starts
- **THEN** no file is copied

### Requirement: Copy into another private room needs access to it
The system SHALL offer another private room, or a folder in one, as a copy destination only where the user may create files. It SHALL resolve the destination room from the destination folder's own path before decrypting anything, and SHALL copy nothing, reporting Common:EncryptedCopyFailed, when that room cannot be resolved.

#### Scenario: Room without create right
- **WHEN** the Copy dialog is opened for encrypted files of a private room and the user cannot create files in another private room
- **THEN** that room is not selectable as destination

#### Scenario: Subfolder of another private room
- **WHEN** the user picks a subfolder of another private room as the copy destination
- **THEN** the copy is encrypted for the room that contains the subfolder

#### Scenario: Destination room cannot be resolved
- **WHEN** the path of the chosen destination folder cannot be loaded
- **THEN** no file is decrypted or uploaded and Common:EncryptedCopyFailed names the files

### Requirement: Move into another private room is refused
The system SHALL NOT move files or folders from a private room into another private room. Such a move SHALL be refused on the client with Common:CannotMoveToAnotherPrivateRoom before any request is sent, and nothing SHALL be transferred.

#### Scenario: Move dialog
- **WHEN** the Move dialog is opened for items of a private room
- **THEN** only folders of that same room are selectable as destination

### Requirement: Name clashes in a private room are checked on the client
The system SHALL compare the decrypted names of files uploaded or copied into a private room with the decrypted names of the destination folder before sending anything. On a clash it SHALL offer to keep both, giving the new file a copy suffix, or to cancel; it SHALL NOT offer to overwrite the existing file or to add a version. Names not cached yet are recovered first while the identity is unlocked.

#### Scenario: Copy into a room holding a file of the same name
- **WHEN** an encrypted file named "New document.docx" is copied into a private room folder that already holds a file whose decrypted name is "New document.docx"
- **THEN** the user is asked before anything is sent; keeping both stores the copy under a suffixed decrypted name, and no overwrite or version option is offered

#### Scenario: Upload without a clash
- **WHEN** files whose decrypted names do not occur in the destination folder are uploaded into a private room
- **THEN** no conflict dialog is shown and nothing about the names is sent to the server

### Requirement: Pickers show resolved names
The system SHALL show the decrypted display name of encrypted files in the file and destination pickers, recovering it from the file header when it is not cached and the identity is unlocked. While locked or before recovery completes the opaque name is shown, and the picker itself SHALL NOT raise an unlock prompt.

#### Scenario: Destination picker in a private room
- **WHEN** the Copy or Move dialog lists the encrypted files of a private room with the identity unlocked
- **THEN** each file is listed by its decrypted name, not by its opaque server title

#### Scenario: Picker while locked
- **WHEN** a picker lists encrypted files while the identity is locked
- **THEN** the opaque names are shown and no unlock prompt is raised by the picker

### Requirement: No decryption warning in a Move that stays in the room
The destination picker SHALL NOT show the Common:EncryptedTransferBannerTitle warning for a Move from a private room, because the Move is pinned to that room and nothing can leave it decrypted.

#### Scenario: Move dialog of a private room
- **WHEN** the Move dialog is opened for encrypted files of a private room
- **THEN** no decryption warning is shown

### Requirement: Errors on encrypted paths are localized
The system SHALL take every message of an encrypted copy, download or open from the locale files, with no English fallback text in code; an error without a specific message SHALL show Common:EncryptedOperationFailed.

#### Scenario: Error text is localized
- **WHEN** an encrypted copy, download or open fails with an error that has no specific message
- **THEN** the toast shows Common:EncryptedOperationFailed in the user's language, never the raw error object

#### Scenario: Download without decryption fails
- **WHEN** "Download without decryption" is picked in the header menu of a private room or in the context menu of a folder in one, and the server archive request fails without a specific message
- **THEN** the toast shows Common:EncryptedOperationFailed, never the raw error object

### Requirement: Cancelling an encrypted upload
The system SHALL end an encrypted upload that the user cancels before its ciphertext is stored as cancelled: the upload session is aborted and no error is shown, whether the chunks are sent one by one or in parallel. Once the ciphertext is stored, a cancel SHALL NOT interrupt the wrap stage: the file is shared with the uploader and the members as for any upload, and its outcome is reported as for an upload that was not cancelled.

#### Scenario: Cancelled while chunks are sent
- **WHEN** the user cancels an encrypted upload, one row or the whole batch, while its chunks are being sent
- **THEN** the upload session is aborted, the row shows the upload as cancelled, and no error text such as the transport's "canceled" is shown

#### Scenario: Cancelled after the file is stored
- **WHEN** the user cancels an encrypted upload after the server stored its ciphertext but before the access entries were written
- **THEN** the uploader's entry and the members' entries are written as for any upload, and the file is listed and reported as uploaded

#### Scenario: Sharing fails after a late cancel
- **WHEN** a late cancel arrives and writing the members' entries then fails
- **THEN** Common:EncryptedUploadShareFailed names the file and the members whose keys were read are marked as pending access for it

#### Scenario: Stored file never left without its entries
- **WHEN** an encrypted upload is cancelled at any stage
- **THEN** the system MUST NOT leave a stored encrypted file without the uploader's access entry, and MUST NOT leave its members without either an entry or a pending-access mark, without reporting it

### Requirement: Cancelling a queued encrypted upload in the SDK stops it
The SDK SHALL take the cancel signal of every file of an encrypted upload batch when the batch starts, so that cancelling a file that is still waiting in the batch stops it before any of its bytes are sent.

#### Scenario: File cancelled while waiting
- **WHEN** a user uploads two files into a private room through the SDK and cancels the second while the first is still uploading
- **THEN** the second file is not uploaded, no file is created for it, and its row is gone

### Requirement: Key writes are left out of the History tab
The system SHALL leave the file-keys-issued entry the server lists in a file's and a folder's history (action FileKeysSet, 5164) out of the History tab of a private room and of its files, rendering the other entries as before; the write stays in the audit trail with its recipients.

#### Scenario: Key write listed
- **WHEN** the history of a private room or of one of its files carries a file-keys-issued entry
- **THEN** the tab shows nothing for it and the other entries as usual

### Requirement: A stored upload without the uploader's entry is not kept
The system SHALL, when the uploader's own access entry of a stored encrypted upload cannot be written, try the write again while the key is in memory, and SHALL then delete the stored file permanently and report the upload as failed, since nobody could decrypt it. It SHALL keep a file whose entry turns out to be written. When the deletion fails too, it SHALL report Common:EncryptionUploadWrapFailed for the stored file.

#### Scenario: Entry written on a later try
- **WHEN** the first write of the uploader's entry fails and a later try succeeds
- **THEN** the upload is reported as uploaded and no error is shown

#### Scenario: Entry cannot be written
- **WHEN** every try to write the uploader's entry of a stored upload fails
- **THEN** the stored file is deleted permanently, the row shows Common:EncryptionUploadNotKept as a failed upload that can be retried, and no file is listed for it

#### Scenario: Key cannot be wrapped
- **WHEN** wrapping the key for the uploader fails after the ciphertext is stored
- **THEN** no write is tried, the stored file is deleted permanently and the upload is reported as failed

#### Scenario: Entry written although the write reported a failure
- **WHEN** the write reported a failure and the file turns out to hold the uploader's entry
- **THEN** the file MUST NOT be deleted, and the upload is reported as uploaded

#### Scenario: Deletion fails
- **WHEN** the uploader's entry cannot be written and the deletion of the stored file fails as well
- **THEN** the file stays listed, its row shows Common:EncryptionUploadWrapFailed, and the failure is not reported as a successful upload

#### Scenario: Upload through the SDK
- **WHEN** the uploader's entry cannot be written for an upload made through the SDK
- **THEN** the stored file is deleted permanently and the row fails with Common:EncryptionUploadNotKept

### Requirement: An unknown key list is read again before an action is refused
The system SHALL read the user's key list again when a download, a copy or move, an upload or a file creation in a private room starts while the list is not known. It SHALL refuse the action as for a user without a key only when the list is known to be empty, and SHALL report Common:EncryptionKeysLoadFailed and do nothing when the read fails.

#### Scenario: Read succeeds with a key
- **WHEN** a user who holds a key downloads an encrypted file while the key list is not known, and the read of the list succeeds
- **THEN** the download goes on as with a loaded list

#### Scenario: Read fails
- **WHEN** a user downloads, copies, moves, uploads or creates a file in a private room while the key list is not known, and the read of the list fails
- **THEN** Common:EncryptionKeysLoadFailed is shown, nothing is sent, and neither Common:EncryptionKeysNotConfigured nor the device-setup hint is shown

#### Scenario: Read answers with an empty list
- **WHEN** the read of the list succeeds and holds no key
- **THEN** the action is refused as for a user without a key

### Requirement: A file without a wrap for the user is reported as no access
The system SHALL report a file whose access entries hold no wrap for a user who has a key with Common:EncryptedFileNoAccessYet, and SHALL NOT advise that user to set up encryption keys.

#### Scenario: Key holder without a wrap
- **WHEN** a user who holds a key downloads, copies or opens an encrypted file that is not wrapped for them
- **THEN** the message is Common:EncryptedFileNoAccessYet, not Common:NoAccessToEncryptedFile

#### Scenario: User without a key
- **WHEN** a user whose key list is known to hold no key lists a private room
- **THEN** the lock badge keeps the title Common:NoAccessToEncryptedFile

### Requirement: Client search covers the open folder up to 10,000 items
The system SHALL NOT search a private room beyond the folder that is open: its subfolders and the other folders of the room are not searched. The system SHALL load at most 10,000 items of that folder for a search; when the folder holds more, it SHALL show Files:ClientSearchPartialResults and match only the loaded items.

#### Scenario: Match in a subfolder
- **WHEN** the user searches in a folder of a private room for a name that only a file in one of its subfolders has
- **THEN** the file is not found

#### Scenario: Folder above the limit
- **WHEN** the user searches in a folder of a private room that holds more than 10,000 items
- **THEN** Files:ClientSearchPartialResults is shown and a file beyond the loaded items is not found even though its name matches

### Requirement: Name sort orders only the loaded items
The system SHALL NOT order a whole folder of a private room by decrypted name while only a part of it is loaded: the server orders the pages by the opaque stored names, and the client re-orders the loaded items among themselves. An item of a page not loaded yet takes its place only once that page is loaded.

#### Scenario: Folder larger than one page
- **WHEN** a folder of a private room holds more items than one page and the list is sorted by name without a search
- **THEN** the loaded items are in the order of their decrypted names, and scrolling to the next page can place a newly loaded item above items already shown

### Requirement: Decrypted zip is assembled in memory
The system SHALL NOT stream a decrypted zip to disk: every selected file is decrypted in memory, and the archive is built in memory from all of them before it is saved. No size limit is enforced on the selection.

#### Scenario: Large selection
- **WHEN** the user downloads a selection of encrypted files whose total size is close to the browser's memory limit
- **THEN** the download may fail with a memory error, and no partial archive is saved

### Requirement: An interrupted encrypted download starts over
The system SHALL NOT resume the download of an encrypted file: the ciphertext is fetched as a whole before decryption, and a download that fails part-way SHALL be reported as failed, with nothing saved and no partial plaintext shown.

#### Scenario: Connection lost during a download
- **WHEN** the connection is lost while an encrypted file is being fetched for a decrypting download
- **THEN** the download fails with an error, no file is saved, and a new download fetches the file from its start
