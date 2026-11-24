# Spec Delta

## MODIFIED Requirements

### Requirement: Re-import of a file downloaded without decryption
The SDK SHALL recognise an uploaded file that is already in the encrypted container format, recover its original file key through the uploader's unlocked identity, decrypt it and upload it encrypted again under a new file key, as the client does; when that fails it SHALL report Common:EncryptionReimportFailed and send nothing.

#### Scenario: Ciphertext re-uploaded
- **WHEN** a file downloaded "without decryption" is uploaded back into the same private room
- **THEN** it is stored under its original name with a file key of its own and stays readable to room members

### Requirement: Shell side effects
The private layout SHALL run the shell effects: the locks of the user's other pages that every page follows (key-management, "A lock reaches every tab of the user"), in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep of missing file keys for a room manager once per room and page session, a device-setup hint only once the user's key list loaded empty, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked by Lock now, a key change or a logout in another page of the user, an SDK page or a client page
- **THEN** every SDK page of the user locks as well and aborts its encrypted operations, and the remembered record is left to the page that locked

#### Scenario: Idle lock in another tab
- **WHEN** another SDK page of the user locks after its idle time
- **THEN** this SDK page stays unlocked

#### Scenario: Unlock recovers names
- **WHEN** the identity becomes unlocked on a private page
- **THEN** encrypted file names in the current list are decrypted and shown

#### Scenario: Manager enters a room
- **WHEN** a room manager with an unlocked identity enters a private room in the SDK for the first time in the page session
- **THEN** the backfill sweep runs once for that room and wraps the file keys the server lists as missing, for members with a verified key

#### Scenario: Hint waits for the key list
- **WHEN** a private page opens and the key list has not been loaded yet
- **THEN** no device-setup hint is shown until the list has loaded and contains no key for this device

### Requirement: Download without decryption
The SDK SHALL offer download without decryption for an encrypted file, saving the stored ciphertext unchanged, and for a folder inside a private room, requesting a server archive of its ciphertext files. It SHALL offer it in the row menu of a file or a folder and, in the header menu, for one selected file only. Neither unlocks the identity.

#### Scenario: Ciphertext download
- **WHEN** the user chooses download without decryption
- **THEN** the encrypted blob is saved as is, without unlocking the identity

#### Scenario: Folder downloaded without decryption
- **WHEN** the user chooses download without decryption on a folder of a private room
- **THEN** the server archive of the folder's ciphertext files is downloaded, and nothing is decrypted
