# Spec Delta

## ADDED Requirements

### Requirement: A stored upload without the uploader's entry is not kept
The system SHALL, when the uploader's own access entry of a stored encrypted upload cannot be written, try the write again while the key is in memory, and SHALL then delete the stored file permanently and report the upload as failed, since nobody could decrypt it. It SHALL keep a file whose entry turns out to be written. When the deletion fails too, it SHALL report Common:EncryptionUploadWrapFailed for the stored file.

#### Scenario: Entry written on a later try
- **WHEN** the first write of the uploader's entry fails and a later try succeeds
- **THEN** the upload is reported as uploaded and no error is shown

#### Scenario: Entry cannot be written
- **WHEN** every try to write the uploader's entry of a stored upload fails
- **THEN** the stored file is deleted permanently, the row shows Common:EncryptionUploadNotKept as a failed upload that can be retried, and no file is listed for it

#### Scenario: Key cannot be wrapped
- **WHEN** wrapping the key for the uploader fails after the ciphertext is stored
- **THEN** no write is tried, the stored file is deleted permanently and the upload is reported as failed

#### Scenario: Entry written although the write reported a failure
- **WHEN** the write reported a failure and the file turns out to hold the uploader's entry
- **THEN** the file MUST NOT be deleted, and the upload is reported as uploaded

#### Scenario: Deletion fails
- **WHEN** the uploader's entry cannot be written and the deletion of the stored file fails as well
- **THEN** the file stays listed, its row shows Common:EncryptionUploadWrapFailed, and the failure is not reported as a successful upload

#### Scenario: Upload through the SDK
- **WHEN** the uploader's entry cannot be written for an upload made through the SDK
- **THEN** the stored file is deleted permanently and the row fails with Common:EncryptionUploadNotKept
