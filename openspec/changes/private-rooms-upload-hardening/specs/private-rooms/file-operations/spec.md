# Spec Delta

## ADDED Requirements

### Requirement: Name clashes in a private room are checked on the client
The system SHALL compare the decrypted names of files uploaded or copied into a private room with the decrypted names of the destination folder before sending anything. On a clash it SHALL offer to keep both, giving the new file a copy suffix, or to cancel; it SHALL NOT offer to overwrite the existing file or to add a version. Names not cached yet are recovered first while the identity is unlocked.

#### Scenario: Copy into a room holding a file of the same name
- **WHEN** an encrypted file named "New document.docx" is copied into a private room folder that already holds a file whose decrypted name is "New document.docx"
- **THEN** the user is asked before anything is sent; keeping both stores the copy under a suffixed decrypted name, and no overwrite or version option is offered

#### Scenario: Upload without a clash
- **WHEN** files whose decrypted names do not occur in the destination folder are uploaded into a private room
- **THEN** no conflict dialog is shown and nothing about the names is sent to the server

## MODIFIED Requirements

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
