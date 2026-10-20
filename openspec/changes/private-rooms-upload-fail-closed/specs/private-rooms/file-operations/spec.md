# Spec Delta

## MODIFIED Requirements

### Requirement: Uploads into a private room are encrypted on the client
The system SHALL encrypt each file on the client before it is uploaded into a private room, wrap the file key for the uploader and for every member key the server lists for the room, and mark the uploaded file as encrypted. The system SHALL NOT send a file into a private room in any other form.

#### Scenario: Member uploads a file
- **WHEN** a user with an encryption key drops a file into a private room
- **THEN** the bytes sent to the server are ciphertext under an opaque name and the resulting file is flagged encrypted with an access entry per room member

#### Scenario: Uploader without a key
- **WHEN** a user with no registered encryption key uploads into a private room
- **THEN** no bytes are sent, the item is marked failed in the upload panel with Common:EncryptionKeysRequiredForUpload, and the device-setup hint is shown

#### Scenario: Uploader declines to unlock
- **WHEN** the uploader has a key but cancels the unlock prompt when the upload starts
- **THEN** no bytes are sent and the item is marked failed with Common:EncryptionLockedUpload

### Requirement: Folder upload disabled in private rooms
The system SHALL NOT offer the "Upload folder" action or the Shift+U hotkey inside a private room, and SHALL refuse folder trees dropped onto a private room with Common:FolderUploadNotSupportedInPrivateRoom.

#### Scenario: Shift+U pressed
- **WHEN** the user presses Shift+U while a private room is open
- **THEN** no folder picker opens

#### Scenario: Folders dropped on the view
- **WHEN** the user drags a folder tree onto a private room
- **THEN** nothing is uploaded and Common:FolderUploadNotSupportedInPrivateRoom is shown

#### Scenario: Files and folders dropped together
- **WHEN** a drop onto a private room contains both files and folders
- **THEN** the files are uploaded encrypted and the folders are refused with Common:FolderUploadNotSupportedInPrivateRoom

### Requirement: Files leaving a private room are decrypted
The system SHALL, when files are copied or moved out of a private room, decrypt them on the client with the unlocked identity and upload them as plaintext to the destination, after showing a warning banner in the destination picker. On move, the system SHALL delete each source file only after its decrypted copy succeeded. The system SHALL report Common:EncryptedCopyFailed with the failed names on error.

#### Scenario: Copy to My documents
- **WHEN** the user copies an encrypted file to a folder outside the room and confirms
- **THEN** a decrypted copy with the original name appears in the destination

#### Scenario: Move out of the room
- **WHEN** the user chooses "Move" to a destination outside the room and every decrypted copy succeeds
- **THEN** the decrypted copies appear in the destination and the source files are deleted from the private room

#### Scenario: Move with a failed copy
- **WHEN** the user moves several encrypted files out and one decrypted copy fails
- **THEN** the sources of the successful copies are deleted, the failed source stays in place, and Common:EncryptedMovePartialFailure names it

#### Scenario: Identity locked
- **WHEN** the user declines to unlock when the transfer starts
- **THEN** no file is transferred and no source is deleted

### Requirement: Clipboard hotkeys follow the private-room transfer rules
The system SHALL apply the private-room transfer rules to Ctrl+X and Ctrl+V exactly as to drag-and-drop and the copy/move dialog: transfer into a private room is refused, folders cannot leave a private room, files leaving are decrypted on the client, and items cut and pasted inside the same private room are moved by the server without decryption. Ctrl+C puts no private-room item on the clipboard, because the server denies copying them.

#### Scenario: Paste with hotkey
- **WHEN** items copied from a non-private location are pasted with Ctrl+V into a private room
- **THEN** nothing is transferred and Common:CannotTransferToPrivateRoom is shown

#### Scenario: Cut and paste out of a private room
- **WHEN** encrypted files are cut with Ctrl+X and pasted with Ctrl+V outside the room
- **THEN** decrypted copies appear in the destination and the sources are deleted after the copies succeed

#### Scenario: Folder cut out of a private room
- **WHEN** a folder inside a private room is cut and pasted outside it
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown

#### Scenario: Paste within the same private room
- **WHEN** encrypted files are cut with Ctrl+X and pasted into a subfolder of the same private room
- **THEN** the server moves them in place and no decryption to plaintext happens

#### Scenario: Copy hotkey inside a private room
- **WHEN** the user presses Ctrl+C on items in a private room
- **THEN** nothing is added to the clipboard

## RENAMED Requirements

- FROM: `### Requirement: Clipboard hotkeys use the generic transfer path`
- TO: `### Requirement: Clipboard hotkeys follow the private-room transfer rules`
