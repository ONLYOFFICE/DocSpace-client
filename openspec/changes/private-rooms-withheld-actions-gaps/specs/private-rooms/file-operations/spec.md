# Spec Delta

## ADDED Requirements

### Requirement: The media viewer menu of an encrypted file withholds link and download-as entries
The media viewer SHALL NOT offer download-as or the room-member link entry (link-for-room-members, labelled Common:CopyLink) in the menu of an encrypted file, whatever rights the server reports for it. Download and download without decryption follow "Download decrypts on the client".

#### Scenario: Media viewer menu of an encrypted PDF
- **WHEN** the media viewer shows an encrypted PDF and the server reports the Download right on it
- **THEN** its menu has no download-as entry and no Common:CopyLink entry

#### Scenario: Media viewer menu of a PDF that is not encrypted
- **WHEN** the media viewer shows a PDF that is not encrypted and the server reports the Download right on it
- **THEN** its menu offers download-as and Common:CopyLink

### Requirement: A move by drag and drop inside a private room stays a move
The system SHALL move files and folders that the user drags onto a folder of the same private room through the server, without decryption and without the decryption confirmation, wherever that folder's row comes from: the first page of the list, a page loaded by scrolling, or a list update.

#### Scenario: Drop on a folder row loaded by scrolling
- **WHEN** the user drags encrypted files of a private room onto a folder row of the same folder that was loaded by scrolling to a later page, holding the Move right on them
- **THEN** the server moves them into that folder, they keep their ids, and no Common:EncryptedTransferBannerTitle confirmation is shown
- **AND** nothing MUST be decrypted, uploaded or copied

#### Scenario: Drop on a folder row of the first page
- **WHEN** the user drags encrypted files of a private room onto a folder row of the first page of the same folder
- **THEN** the server moves them into that folder and no confirmation is shown

#### Scenario: Drop on a folder outside private rooms
- **WHEN** the user drags encrypted files of a private room onto a folder outside private rooms
- **THEN** the Common:EncryptedTransferBannerTitle confirmation is shown first, as "Files leaving a private room are decrypted" describes

### Requirement: A declined unlock on a copy or move says nothing was transferred
The system SHALL show Common:EncryptionLockedCopy, and SHALL NOT show Common:EncryptionLockedAddMembers, when the user declines to unlock as an encrypted copy, move or duplicate starts: out of a private room, into another private room or inside the same room. Nothing SHALL be transferred and no source SHALL be deleted.

#### Scenario: Unlock declined on a copy out of a private room
- **WHEN** the user copies an encrypted file to My documents and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown, no file is copied, and Common:EncryptionLockedAddMembers is not shown

#### Scenario: Unlock declined on a move out of a private room
- **WHEN** the user moves encrypted files out of a private room, confirms the decryption warning and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and every source stays in the room

#### Scenario: Unlock declined on a duplicate
- **WHEN** the user duplicates an encrypted file and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and no copy is stored

## MODIFIED Requirements

### Requirement: Favorites, conversion and download-as withheld
The system SHALL NOT offer mark-as-favorite, convert or download-as for an encrypted file, nor favorites for a folder in a private room. The convert badge SHALL NOT be shown for an encrypted file and SHALL NOT open the conversion dialog, whatever conversion rights the server reports for it.

#### Scenario: Encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** mark-as-favorite, convert and download-as are absent

#### Scenario: Convert badge of an encrypted file
- **WHEN** an encrypted file whose format must be converted is listed in a list, table or tile view, and the server reports the Convert right on it
- **THEN** no convert badge is shown, and the conversion dialog cannot be opened for it

#### Scenario: Convert badge of a file that is not encrypted
- **WHEN** a file that is not encrypted and must be converted is listed, and the server reports the Convert right on it
- **THEN** the convert badge is shown and opens the conversion dialog

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name made plain as "Saved names are plain file names" describes, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name, made plain by the rule of "Saved names are plain file names"

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

#### Scenario: No own access entry
- **WHEN** a user who holds a key downloads one encrypted file for which they hold no access entry
- **THEN** nothing is downloaded, no passphrase prompt is raised, and Common:EncryptedFileNoAccessYet is shown, not Common:EncryptionDownloadFailed

#### Scenario: Download from the media viewer
- **WHEN** the user downloads an encrypted file from the media viewer with its download button or Ctrl+S, and the identity is unlocked
- **THEN** the browser saves the plaintext file under its original name, made plain by the same rule, and the ciphertext MUST NOT be handed to the browser as the download

#### Scenario: Download from the media viewer of a file that cannot be found
- **WHEN** the user downloads an encrypted file from the media viewer, and the file is neither in the current folder list nor the file the viewer was opened for
- **THEN** Common:EncryptionDownloadFailed is shown, nothing is downloaded, and the ciphertext MUST NOT be handed to the browser as the download

### Requirement: A file without a wrap for the user is reported as no access
The system SHALL report a file whose access entries hold no wrap for a user who has a key with Common:EncryptedFileNoAccessYet when the user downloads, copies, moves or opens that file alone, and SHALL name it in the report of the batch when it is one of several files of a copy, move or decrypted archive. For a download, copy or move of that file alone it SHALL do so before it asks for the passphrase. It SHALL NOT advise that user to set up encryption keys.

#### Scenario: Key holder without a wrap
- **WHEN** a user who holds a key downloads, copies, moves out or opens an encrypted file that is not wrapped for them, and that file is the only one of the action
- **THEN** the message is Common:EncryptedFileNoAccessYet, not Common:NoAccessToEncryptedFile, Common:EncryptionDownloadFailed or Common:EncryptedCopyFailed

#### Scenario: Copy of one file without a wrap while the key is locked
- **WHEN** a user who holds a key and whose key is locked copies or moves out of a private room one encrypted file that is not wrapped for them
- **THEN** Common:EncryptedFileNoAccessYet is shown, no passphrase prompt is raised, and nothing is uploaded or deleted

#### Scenario: One file of several without a wrap
- **WHEN** a user who holds a key copies two encrypted files out of a private room and one of them is not wrapped for them
- **THEN** the other file is copied and Common:EncryptedCopyFailed names the file that is not wrapped for them

#### Scenario: User without a key
- **WHEN** a user whose key list is known to hold no key lists a private room
- **THEN** the lock badge keeps the title Common:NoAccessToEncryptedFile

### Requirement: Media preview decrypts on the client
The system SHALL fetch and decrypt an encrypted image, audio or video in the browser before showing it in the media viewer, SHALL close the viewer when the user dismisses the passphrase prompt, and SHALL report decryption failures with a localized message. An encrypted TIFF (.tif, .tiff) or HEIC (.heic, .heif) image SHALL be decoded in the browser after decryption and shown as an unencrypted one of that format is.

#### Scenario: Open encrypted image
- **WHEN** the user opens an encrypted image with the identity unlocked
- **THEN** the decrypted image is displayed and the viewer never requests a server-rendered preview

#### Scenario: Open encrypted TIFF or HEIC image
- **WHEN** the user opens an encrypted TIFF or HEIC image with the identity unlocked
- **THEN** the decrypted image is decoded in the browser and displayed, the viewer never requests a server-rendered preview, and the decrypted content MUST NOT be sent to the server for decoding

#### Scenario: Passphrase prompt dismissed
- **WHEN** the viewer needs the identity and the user cancels the prompt
- **THEN** the viewer closes

### Requirement: The media viewer reports a file that is not shared yet as no access
The system SHALL show Common:EncryptedFileNoAccessYet in the media viewer when the opened encrypted file holds no wrap for a user who has a key, before it asks for the passphrase or fetches the file, and SHALL keep Common:EncryptionDecryptPartialFailed for a file that is wrapped for the user and still does not decrypt.

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
