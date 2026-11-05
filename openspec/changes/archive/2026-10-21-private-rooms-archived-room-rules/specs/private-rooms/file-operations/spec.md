# Spec Delta

## ADDED Requirements

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
The system SHALL copy encrypted files out of an archived private room only by decrypting them on the client and uploading the plaintext to the destination, from the Copy dialog and by drag-and-drop. The destination picker SHALL show the Common:EncryptedTransferBannerTitle / Common:EncryptedTransferBannerDescription warning first. The system SHALL NOT ask the server to copy an encrypted file out of the room.

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

### Requirement: No decrypted folder download in an archived private room
The system SHALL NOT offer the standard "Download" entry for a folder inside an archived private room, so no server archive of its ciphertext is offered as a plain download. It SHALL offer download-encrypted for the folder when it is downloadable, and SHALL withhold the other folder entries withheld in an active private room.

#### Scenario: Folder menu in an archived private room
- **WHEN** the context menu of a folder inside an archived private room is built
- **THEN** download, sharing-settings, copy-shared-link, manage-links, link-for-room-members and mark-as-favorite are absent and download-encrypted is present

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
