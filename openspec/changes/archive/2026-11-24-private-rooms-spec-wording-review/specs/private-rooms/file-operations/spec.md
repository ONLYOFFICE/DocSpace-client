# Spec Delta

## MODIFIED Requirements

### Requirement: Files leaving a private room are decrypted
The system SHALL decrypt files copied or moved out of a private room on the client and upload them as plaintext, after warning that they will be saved decrypted: in the destination picker, or in a confirmation before anything moves when the transfer starts without it (drag and drop, cut and paste). On move it SHALL delete each source only after its decrypted copy succeeded, and SHALL name the failed files with Common:EncryptedCopyFailed (copy) or Common:EncryptedMovePartialFailure (move).

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

### Requirement: Errors on encrypted paths are localized
The system SHALL take every message of an encrypted copy, download or open from the locale files, with no English fallback text in code. An error without a specific message SHALL show the general message of its operation: Common:EncryptionDownloadFailed for a decrypting download, Common:EncryptedCopyFailed or Common:EncryptedMovePartialFailure for a copy or a move, Common:EncryptionDecryptPartialFailed in the media viewer, and Common:EncryptedOperationFailed for a download without decryption.

#### Scenario: Error text is localized
- **WHEN** a decrypting download fails with an error that has no specific message
- **THEN** the toast shows Common:EncryptionDownloadFailed in the user's language, never the raw error object

#### Scenario: Download without decryption fails
- **WHEN** "Download without decryption" is picked in the header menu of a private room or in the context menu of a folder in one, and the server archive request fails without a specific message
- **THEN** the toast shows Common:EncryptedOperationFailed, never the raw error object

### Requirement: The media viewer reports a file that is not shared yet as no access
The system SHALL show Common:EncryptedFileNoAccessYet in the media viewer when the opened encrypted file holds no wrap for a user who has a key, before it asks for the passphrase or fetches the file, and SHALL keep Common:EncryptionDecryptPartialFailed for a failure that has no message of its own.

#### Scenario: Image not shared with the user yet
- **WHEN** a user who holds a key opens in the media viewer an encrypted image that is not wrapped for them
- **THEN** the viewer shows Common:EncryptedFileNoAccessYet

#### Scenario: Not shared yet while the key is locked
- **WHEN** a user whose key is locked opens in the media viewer an encrypted image that is not wrapped for them
- **THEN** the viewer shows Common:EncryptedFileNoAccessYet, no passphrase prompt is raised and the file content is not fetched

#### Scenario: File wrapped but damaged
- **WHEN** the file is wrapped for the user and its decryption fails
- **THEN** the viewer shows Common:EncryptionDecryptPartialFailed with the name of the file

#### Scenario: Next file in the viewer
- **WHEN** the user moves from a file that is not shared yet to one that is
- **THEN** the second file is shown and the message of the first is gone

### Requirement: Decrypted folder download
The system SHALL offer "Download" for a folder inside a private room and for the room itself, from its context menu or with the folder selected alone in the header menu; it SHALL decrypt every file in the subtree on the client and save them as one zip with original names, each under its path inside the folder, named and kept apart as "Archive directories come from the folder tree" describes, with the same progress as the multi-file decrypted download.

#### Scenario: Folder context menu
- **WHEN** the context menu of a folder in a private room is opened
- **THEN** both "Download" and "Download without decryption" are present

#### Scenario: Folder download
- **WHEN** the user picks "Download" on a folder containing encrypted files
- **THEN** a zip with the decrypted files under their original names is saved and progress is shown

#### Scenario: Names that differ only in case inside a folder
- **WHEN** the user picks "Download" on a folder holding two files that decrypt to "Budget.xlsx" and "budget.xlsx"
- **THEN** the zip holds "Budget.xlsx" and "budget (1).xlsx" in that folder's directory

#### Scenario: A file cannot be decrypted
- **WHEN** one file in the subtree has no access entry for the user
- **THEN** the zip is produced without it and Common:EncryptedDownloadPartial names the skipped file

#### Scenario: Folder selected in the header menu
- **WHEN** a folder of a private room is the only selected item and "Download" is picked in the header menu
- **THEN** the same zip is saved as from the folder's context menu, named after the folder, and no server archive of its ciphertext is requested

#### Scenario: No file can be decrypted
- **WHEN** none of the files can be decrypted and at least one of them fails for another reason than a key the user no longer holds
- **THEN** no zip is saved and Files:DecryptAllFailed is shown

#### Scenario: Every file is wrapped for a key the user no longer holds
- **WHEN** every file is wrapped for a key the user no longer holds
- **THEN** no zip is saved and Common:PrivateRoomReplacedKeyBarText is shown with the number of those files, not Files:DecryptAllFailed

### Requirement: A private room names the files wrapped for a key the user no longer holds
The system SHALL show a notice (Common:PrivateRoomReplacedKeyBarTitle, Common:PrivateRoomReplacedKeyBarText with the number of files) above the file list of a private room, or of a folder inside one, while files wrapped for a key the user no longer holds are among the loaded items. The notice SHALL be shown on every visit and SHALL NOT be dismissible. It SHALL NOT be shown together with the locked-key block.

#### Scenario: Room of a user who replaced the key
- **WHEN** a user who replaced their key opens a private room whose six files are wrapped for the previous key
- **THEN** the notice is shown above the list and gives the number six

#### Scenario: Page reload
- **WHEN** that user reloads the page in the room
- **THEN** the notice is shown again

#### Scenario: Mixed room
- **WHEN** the room holds two files wrapped for the previous key and one wrapped for the current key
- **THEN** the notice gives the number two and the third file shows its decrypted name

#### Scenario: No such files
- **WHEN** every loaded file is wrapped for a key the user holds
- **THEN** the notice is not shown

#### Scenario: Key locked
- **WHEN** the user's key is locked and the locked-key block is shown
- **THEN** the notice is not shown until the key is unlocked

#### Scenario: Leaving the room
- **WHEN** the user moves from that room to a section that is not a private room
- **THEN** the notice is gone

#### Scenario: Key imported again
- **WHEN** the user deleted their key and imported the same key again from its export, so that the wraps of earlier files name a key id that the key list no longer holds
- **THEN** the notice is not shown and those files show their decrypted names

#### Scenario: Counted until the names are cleared
- **WHEN** a file was counted and its access entry changes while the page stays open
- **THEN** the file stays counted until the key is locked, the user changes or the page is loaded again
