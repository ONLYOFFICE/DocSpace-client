# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
