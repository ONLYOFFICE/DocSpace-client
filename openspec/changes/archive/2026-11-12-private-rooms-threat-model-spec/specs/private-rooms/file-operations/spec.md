# Spec Delta

## ADDED Requirements

### Requirement: Client search covers the open folder up to 10,000 items
The system SHALL NOT search a private room beyond the folder that is open: its subfolders and the other folders of the room are not searched. The system SHALL load at most 10,000 items of that folder for a search; when the folder holds more, it SHALL show Files:ClientSearchPartialResults and match only the loaded items.

#### Scenario: Match in a subfolder
- **WHEN** the user searches in a folder of a private room for a name that only a file in one of its subfolders has
- **THEN** the file is not found

#### Scenario: Folder above the limit
- **WHEN** the user searches in a folder of a private room that holds more than 10,000 items
- **THEN** Files:ClientSearchPartialResults is shown and a file beyond the loaded items is not found even though its name matches

### Requirement: Name sort orders only the loaded items
The system SHALL NOT order a whole folder of a private room by decrypted name while only a part of it is loaded: the server orders the pages by the opaque stored names, and the client re-orders the loaded items among themselves. An item of a page not loaded yet takes its place only once that page is loaded.

#### Scenario: Folder larger than one page
- **WHEN** a folder of a private room holds more items than one page and the list is sorted by name without a search
- **THEN** the loaded items are in the order of their decrypted names, and scrolling to the next page can place a newly loaded item above items already shown

### Requirement: Decrypted zip is assembled in memory
The system SHALL NOT stream a decrypted zip to disk: every selected file is decrypted in memory, and the archive is built in memory from all of them before it is saved. No size limit is enforced on the selection.

#### Scenario: Large selection
- **WHEN** the user downloads a selection of encrypted files whose total size is close to the browser's memory limit
- **THEN** the download may fail with a memory error, and no partial archive is saved

### Requirement: An interrupted encrypted download starts over
The system SHALL NOT resume the download of an encrypted file: the ciphertext is fetched as a whole before decryption, and a download that fails part-way SHALL be reported as failed, with nothing saved and no partial plaintext shown.

#### Scenario: Connection lost during a download
- **WHEN** the connection is lost while an encrypted file is being fetched for a decrypting download
- **THEN** the download fails with an error, no file is saved, and a new download fetches the file from its start
