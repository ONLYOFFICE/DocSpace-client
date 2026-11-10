## MODIFIED Requirements

### Requirement: Deletion bypasses the recycle bin
The system SHALL delete items in a private room permanently, never moving them to the recycle bin, and SHALL always show the delete confirmation with the permanent-deletion note, whichever way the deletion starts: the item menu, the menu of a selection, the header menu, the Delete key or the menu of the folder being viewed.

#### Scenario: Delete a file
- **WHEN** the user deletes a file in a private room and confirms
- **THEN** the file is removed immediately and does not appear in Trash

#### Scenario: Confirmation disabled in settings
- **WHEN** the user has turned off delete confirmations and deletes items in a private room from the item menu, the menu of a selection, the header menu, with the Delete key or from the menu of the folder being viewed
- **THEN** the confirmation dialog is shown before anything is deleted, and nothing MUST be deleted without it

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

### Requirement: Create hotkeys respect keys
The system SHALL ignore the file-creation hotkeys inside a private room when the user cannot create encrypted files, and SHALL ignore there the hotkey that creates a form from a file, which the create menu of a private room does not offer.

#### Scenario: Shift+D without keys
- **WHEN** a user with no keys presses the new-document hotkey in a private room
- **THEN** nothing is created

#### Scenario: Form from a file
- **WHEN** a user, with keys or without, presses Alt+Shift+O in a private room
- **THEN** no file picker opens and nothing is created
