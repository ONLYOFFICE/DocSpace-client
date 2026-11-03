# Spec Delta

## ADDED Requirements

### Requirement: Cancelling an encrypted upload
The system SHALL end an encrypted upload that the user cancels before its ciphertext is stored as cancelled: the upload session is aborted and no error is shown, whether the chunks are sent one by one or in parallel. Once the ciphertext is stored, a cancel SHALL NOT interrupt the wrap stage: the file is shared with the uploader and the members as for any upload, and its outcome is reported as for an upload that was not cancelled.

#### Scenario: Cancelled while chunks are sent
- **WHEN** the user cancels an encrypted upload, one row or the whole batch, while its chunks are being sent
- **THEN** the upload session is aborted, the row shows the upload as cancelled, and no error text such as the transport's "canceled" is shown

#### Scenario: Cancelled after the file is stored
- **WHEN** the user cancels an encrypted upload after the server stored its ciphertext but before the access entries were written
- **THEN** the uploader's entry and the members' entries are written as for any upload, and the file is listed and reported as uploaded

#### Scenario: Sharing fails after a late cancel
- **WHEN** a late cancel arrives and writing the members' entries then fails
- **THEN** Common:EncryptedUploadShareFailed names the file and the members whose keys were read are marked as pending access for it

#### Scenario: Stored file never left without its entries
- **WHEN** an encrypted upload is cancelled at any stage
- **THEN** the system MUST NOT leave a stored encrypted file without the uploader's access entry, and MUST NOT leave its members without either an entry or a pending-access mark, without reporting it
