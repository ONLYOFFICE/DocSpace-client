# Private Room File Operations Specification

## Purpose

Describes what a user can do with files and folders inside a private (end-to-end encrypted) room in the client: upload, create, download, copy, move, delete, preview, search, and which actions, menu entries and hotkeys are withheld because the server only ever sees ciphertext. Opening a file in the editor is covered by the editor-integration capability; key material and wire formats by encryption-core; membership by room-membership. All behaviour here is the behaviour on the branch today, including a few neutral statements of current behaviour that later changes may tighten. Implementation: packages/client/src/store/uploadDataStore, packages/client/src/store/filesActionsStore (copyMove, download, delete, navigation, menu helpers), packages/client/src/store/filesStore (contextOptions, clientSearch, encryption, actions helpers), packages/client/src/store/contextOptionsStore, packages/client/src/store/HotkeyStore.ts, packages/client/src/HOCs/withHotkeys.js, packages/client/src/helpers/encryptedFileCreation.ts, packages/client/src/components/FilesSelector, packages/client/src/components/ItemIcon.tsx, packages/shared/components/media-viewer, packages/shared/services/private-room.

## Requirements

### Requirement: Uploads into a private room are encrypted on the client
The system SHALL encrypt each file on the client before it is uploaded into a private room when the user has an encryption key, wrap the file key for the uploader and for every member key the server lists for the room, and mark the uploaded file as encrypted.

#### Scenario: Member uploads a file
- **WHEN** a user with an encryption key drops a file into a private room
- **THEN** the bytes sent to the server are ciphertext under an opaque name and the resulting file is flagged encrypted with an access entry per room member

#### Scenario: Uploader without a key
- **WHEN** a user with no registered encryption key uploads into a private room
- **THEN** the encryption step is skipped and the file is sent as received (current behaviour; no rejection is performed by the client)

### Requirement: No conversion on private upload
The system SHALL NOT offer or perform upload-time format conversion for files uploaded into a private room.

#### Scenario: Convertible file dropped
- **WHEN** a file whose format is normally offered for conversion is uploaded into a private room
- **THEN** the conversion prompt does not appear and the file is uploaded as is

### Requirement: Folder upload disabled in private rooms
The system SHALL NOT offer the "Upload folder" action or the Shift+U hotkey inside a private room.

#### Scenario: Shift+U pressed
- **WHEN** the user presses Shift+U while a private room is open
- **THEN** no folder picker opens

#### Scenario: Folders dropped on the view
- **WHEN** the user drags a folder tree onto a private room
- **THEN** the drop is handled by the generic folder-tree upload path (current behaviour; no private-room guard is applied)

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

### Requirement: Create new file in a private room
The system SHALL allow creating only docx, xlsx, pptx and pdf files inside a private room, each produced and encrypted on the client, and SHALL hide the create entries when the user has no encryption key.

#### Scenario: Create document with keys
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** an encrypted empty document is created and listed

#### Scenario: Unsupported extension requested
- **WHEN** a create request for any other extension reaches the private-room creation path
- **THEN** the request is rejected with an error

#### Scenario: No keys
- **WHEN** the user has no encryption key
- **THEN** the "+ New" menu, the empty-view tiles, the quick-action tiles and the create hotkeys offer no file creation, only folder creation and upload

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
The system SHALL NOT offer rename for an encrypted file, neither in the context menu nor via the F2 hotkey.

#### Scenario: F2 on encrypted file
- **WHEN** the user presses F2 with an encrypted file selected
- **THEN** no rename editor opens

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

### Requirement: Files leaving a private room are decrypted
The system SHALL, when files are copied or moved out of a private room, decrypt them on the client with the unlocked identity and upload them as plaintext to the destination, after showing a warning banner in the destination picker. The system SHALL report Common:EncryptedCopyFailed with the failed names on error.

#### Scenario: Copy to My documents
- **WHEN** the user copies an encrypted file to a folder outside the room and confirms
- **THEN** a decrypted copy with the original name appears in the destination

#### Scenario: Move out of the room
- **WHEN** the user chooses "Move" to a destination outside the room
- **THEN** a decrypted copy is created in the destination and the source file is left in place (current behaviour)

#### Scenario: Identity locked
- **WHEN** the user declines to unlock when the transfer starts
- **THEN** no file is transferred

### Requirement: Copy within the same private room
The system SHALL allow copying an encrypted file to the root of the same private room and SHALL give the copy a copy suffix in its name.

#### Scenario: Same-room copy
- **WHEN** an encrypted file is copied to the root of its own room
- **THEN** a second encrypted file with a suffixed name appears

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

### Requirement: Multiple encrypted files download as a decrypted zip
The system SHALL decrypt each selected encrypted file and deliver them together as Files.zip, downloading non-encrypted items of the same selection through the standard path.

#### Scenario: Several encrypted files selected
- **WHEN** the user downloads a selection of encrypted files
- **THEN** a single Files.zip containing the decrypted files is saved

### Requirement: Download without decryption
The system SHALL offer "Download without decryption" for encrypted files and for folders in a private room; for a file it SHALL save the ciphertext container, for a folder it SHALL request a server archive of the ciphertext.

#### Scenario: Encrypted file
- **WHEN** the user picks download-encrypted on a file
- **THEN** the raw container is saved under its opaque name

#### Scenario: Folder in a private room
- **WHEN** the user picks download-encrypted on a folder
- **THEN** a server-side archive of the ciphertext files is produced and downloaded

### Requirement: No decrypted folder download
The system SHALL NOT offer the standard "Download" entry for a folder inside a private room or for the room itself.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** download is absent and only download-encrypted is present

### Requirement: Deletion bypasses the recycle bin
The system SHALL delete items in a private room permanently, never moving them to the recycle bin, and SHALL always show the delete confirmation with the permanent-deletion note.

#### Scenario: Delete a file
- **WHEN** the user deletes a file in a private room and confirms
- **THEN** the file is removed immediately and does not appear in Trash

#### Scenario: Confirmation disabled in settings
- **WHEN** the user has turned off delete confirmations
- **THEN** the confirmation dialog is still shown for items in a private room

### Requirement: Version operations withheld
The system SHALL NOT offer version history, finalize version, version list or version blocking for an encrypted file.

#### Scenario: Context menu of an encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** show-version-history, finalize-version, version and block-unblock-version are absent

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
The system SHALL NOT offer view, preview, edit, open or download entries for an encrypted file when the user has no encryption key, and SHALL show a "no access" badge on such files.

#### Scenario: User without keys
- **WHEN** a user with no encryption key lists a private room
- **THEN** every encrypted file shows the lock badge titled Common:NoAccessToEncryptedFile and its menu has no open or download entries

### Requirement: Entering a private room without keys warns
The system SHALL show Common:EncryptionKeysNotConfigured when a user without encryption keys navigates into a private room.

#### Scenario: Navigate into room
- **WHEN** a user with no keys opens a private room
- **THEN** the warning toast Common:EncryptionKeysNotConfigured is shown

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

### Requirement: Feeds show opaque names
The system SHALL show the server-side opaque names of encrypted files in Recent, History and New-files feeds and in notifications (current behaviour; name resolution is applied only in the file list, Details and room title).

#### Scenario: History tab
- **WHEN** the History tab of a private room is opened
- **THEN** encrypted files are listed by their opaque names

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
The system SHALL NOT show sharing-settings, copy-shared-link, manage-links, link-for-room-members, create-room, favorites, edit-index, copy-to, duplicate or download for a folder inside a private room, and SHALL add download-encrypted when the folder is downloadable.

#### Scenario: Folder menu in a private room
- **WHEN** the context menu of a folder inside a private room is built
- **THEN** none of the listed entries is present

### Requirement: Clipboard hotkeys use the generic transfer path
The system SHALL route Ctrl+C, Ctrl+X and Ctrl+V between folders through the generic copy and move operation (current behaviour; the private-room transfer guards of the drag and dialog paths are not applied there).

#### Scenario: Paste with hotkey
- **WHEN** items are copied with Ctrl+C and pasted with Ctrl+V into another folder
- **THEN** the generic server-side copy operation is requested regardless of whether source or destination is a private room

### Requirement: Create hotkeys respect keys
The system SHALL ignore the file-creation hotkeys inside a private room when the user cannot create encrypted files.

#### Scenario: Shift+D without keys
- **WHEN** a user with no keys presses the new-document hotkey in a private room
- **THEN** nothing is created

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
