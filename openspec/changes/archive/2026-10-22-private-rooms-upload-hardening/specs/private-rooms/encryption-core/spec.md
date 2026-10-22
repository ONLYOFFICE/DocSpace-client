# Spec Delta

## MODIFIED Requirements

### Requirement: Opaque upload name with visible extension
The system SHALL upload every encrypted file under an opaque random UUID name that keeps the original extension, so the server never sees the original name but can still classify the file by type.

#### Scenario: Upload name
- **WHEN** `Report Q3.docx` is uploaded to a private room
- **THEN** the server stores a file named `<uuid>.docx`

#### Scenario: Non-opaque name refused
- **WHEN** an encrypted upload is attempted under a non-UUID name
- **THEN** the upload is refused before any bytes are sent

#### Scenario: Conflict check
- **WHEN** files are uploaded or copied into a private room
- **THEN** their original names are not sent to the server's upload conflict check, and MUST NOT appear in any request before or during the upload
