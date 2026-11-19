# Spec Delta

## ADDED Requirements

### Requirement: A late encrypted upload result reaches only its own row
The system SHALL apply the result of an encrypted upload, whenever it arrives, only to the upload row it was started for, and SHALL change no row of another file or batch. A row that the user cancelled SHALL free its place in the upload queue once, so that the queue never runs more uploads at once than its limit.

#### Scenario: Result after cancel all and a new drop
- **WHEN** the user cancels all uploads while an encrypted file is in its wrap stage and drops new files before that stage ends
- **THEN** the late result marks no row of the new batch as uploaded, every new file is sent, and the cancelled file is handled as "Cancelling an encrypted upload" describes

#### Scenario: Row cancelled while the unlock prompt is open
- **WHEN** the user cancels the row of an encrypted upload while its unlock prompt is open and then dismisses the prompt
- **THEN** the row stays cancelled without an error, and the queue starts no more uploads at once than its limit

#### Scenario: Cancel all while the unlock prompt is open
- **WHEN** the user cancels all uploads while the unlock prompt of an encrypted upload is open, dismisses the prompt and drops new files
- **THEN** the new files are sent no more at once than the queue's limit, and no row of the new batch shows the dismissed prompt's error

### Requirement: An upload into a private room is sent only as a verified container
The system SHALL send bytes into a private room only as a container it produced for that upload, or as a container whose header it parsed and whose file key it recovered through the uploader's identity (see "Re-import of a file downloaded without decryption"). Which applies SHALL be decided from the file's content on every send, a retry included, and the checks before the upload (unlock of the batch, name comparison, auto-lock pause) SHALL count the file as the send does.

#### Scenario: File that is not a container
- **WHEN** a file that is not in the encrypted container format is uploaded into a private room
- **THEN** it is encrypted before any byte is sent

#### Scenario: Container whose key cannot be recovered
- **WHEN** a file in the encrypted container format is uploaded into a private room and no file of the room yields its key
- **THEN** no byte is sent and the item fails with Common:EncryptionReimportFailed

#### Scenario: Container with an unreadable header
- **WHEN** a file starts with the container's magic but its header cannot be parsed
- **THEN** no byte is sent and the item fails with Common:EncryptionReimportFailed

#### Scenario: Retry after a failed send
- **WHEN** an encrypted upload failed while its chunks were sent and the user retries it while locked
- **THEN** the unlock prompt of the batch is raised for it, the name comparison includes it, and it is encrypted again before any byte is sent

### Requirement: The name comparison of a private upload is not skipped
The system SHALL run the comparison of "Name clashes in a private room are checked on the client" for every file sent encrypted. A key list that is not known SHALL be read again before the files are compared. When the destination folder cannot be listed, its files SHALL NOT be sent and SHALL fail with Common:EncryptedNameCheckFailed, in the client and the SDK alike. A re-imported container SHALL be compared under its original name.

#### Scenario: Key list not known when the upload starts
- **WHEN** a user who holds a key uploads "Report.docx" into a private room folder holding a file of that decrypted name while the key list is not known, and the read of the list succeeds
- **THEN** the clash is offered before anything is sent, and the key stays unlocked for the upload as for a batch with a known list

#### Scenario: Folder listing fails in the client
- **WHEN** the listing of the destination folder fails while the names of an upload into a private room are compared
- **THEN** none of the files bound for that folder is sent and each fails with Common:EncryptedNameCheckFailed

#### Scenario: Folder listing fails in the SDK
- **WHEN** the listing of the destination folder fails while the SDK compares the names of an encrypted upload batch
- **THEN** none of the files bound for that folder is sent and each fails with Common:EncryptedNameCheckFailed

#### Scenario: Re-imported container in the folder of its source
- **WHEN** a file downloaded without decryption from a folder of a private room is uploaded back into that folder, which still holds the source file
- **THEN** the clash is offered under the source file's decrypted name, and keeping both stores the re-import under the suffixed name

## MODIFIED Requirements

### Requirement: Re-import of a file downloaded without decryption
The system SHALL recognise an uploaded file that is already in the encrypted container format, recover its original file key through the uploader's unlocked identity, decrypt it, which verifies every chunk, and upload it encrypted again under a new file key and its original name, like any other upload. It SHALL NOT encrypt the container a second time.

#### Scenario: Ciphertext re-uploaded
- **WHEN** a file previously downloaded "without decryption" is uploaded back into the same private room
- **THEN** it is stored under its original name and remains readable to room members

#### Scenario: Re-import gets a key of its own
- **WHEN** a file is re-imported while the file it was downloaded from is still in the room
- **THEN** the two files are encrypted under different file keys and different file nonces

#### Scenario: Damaged container
- **WHEN** a chunk of a re-imported container fails its authentication
- **THEN** no byte is sent and the item fails with Common:EncryptionReimportFailed

#### Scenario: Identity locked during re-import
- **WHEN** such a file is uploaded while the identity is locked and the user declines to unlock
- **THEN** the upload fails with a re-import error instead of double-encrypting
