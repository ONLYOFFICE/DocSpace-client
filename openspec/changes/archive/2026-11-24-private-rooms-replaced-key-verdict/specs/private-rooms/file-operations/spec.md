# Spec Delta

## MODIFIED Requirements

### Requirement: A file wrapped for a key the user no longer holds is reported as such
The system SHALL treat an encrypted file as wrapped for a key the user no longer holds only when its access entry for the user names a key that is not in the user's key list and the user's key does not open that entry. It SHALL report such a file with Common:EncryptedFileKeyReplaced when the user downloads, copies, moves or opens in the media viewer that file alone, and SHALL name it in the report of the batch when it is one of several. It SHALL NOT report a file that the user's key opens.

#### Scenario: Download of one such file
- **WHEN** a user who replaced their key downloads one encrypted file that is wrapped for the previous key
- **THEN** Common:EncryptedFileKeyReplaced is shown, not Common:EncryptionDownloadFailed, and nothing is saved

#### Scenario: Media viewer
- **WHEN** that user opens such an image in the media viewer
- **THEN** the viewer shows Common:EncryptedFileKeyReplaced, not Common:EncryptionDecryptPartialFailed

#### Scenario: Key locked
- **WHEN** that user's key is locked and they copy one such file out of the private room
- **THEN** the passphrase is asked for first, Common:EncryptedFileKeyReplaced is shown once the key is unlocked, and nothing is uploaded or deleted

#### Scenario: One file of several
- **WHEN** that user copies two encrypted files out of a private room and one of them is wrapped for the previous key
- **THEN** the other file is copied and Common:EncryptedCopyFailed names the file that is wrapped for the previous key

#### Scenario: Entry without a key id
- **WHEN** the user's access entry of a file names no key, or the all-zero id
- **THEN** the file is handled as a file wrapped for the user, as before

#### Scenario: Key list not known
- **WHEN** the access entries of a file arrive without the user's key list
- **THEN** the file is not reported with Common:EncryptedFileKeyReplaced

#### Scenario: Key imported again
- **WHEN** the user deleted their key and imported the same key again from its export, so that the wraps of earlier files name a key id that the key list no longer holds
- **THEN** those files download, copy, move and open as before, and Common:EncryptedFileKeyReplaced is not shown

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
