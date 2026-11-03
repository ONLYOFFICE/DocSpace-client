# Spec Delta

## ADDED Requirements

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
- **WHEN** a member of the destination room has no usable key at the time of the copy
- **THEN** the copy is uploaded encrypted for the other members and the skipped member is reported as for an upload into that room

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

## MODIFIED Requirements

### Requirement: Folders cannot leave a private room
The system SHALL refuse to copy or move a folder out of a private room, showing Common:CannotTransferFolderFromPrivateRoom.

#### Scenario: Folder dragged out
- **WHEN** a folder inside a private room is dropped onto a destination outside it
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown

#### Scenario: Folder copied to another private room
- **WHEN** the user copies a folder of a private room, alone or together with files, into another private room
- **THEN** the folder is not transferred and Common:CannotTransferFolderFromPrivateRoom is shown, while the selected encrypted files are copied re-encrypted

### Requirement: Files leaving a private room are decrypted
The system SHALL, when files are copied or moved out of a private room to a destination outside private rooms, decrypt them on the client with the unlocked identity and upload them as plaintext to the destination, after showing a warning banner in the destination picker. On move, the system SHALL delete each source file only after its decrypted copy succeeded. The system SHALL report Common:EncryptedCopyFailed with the failed names on error.

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
