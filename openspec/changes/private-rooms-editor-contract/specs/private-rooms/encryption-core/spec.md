# Spec Delta

## MODIFIED Requirements

### Requirement: PDF form flag in the header
The system SHALL set the IS_FORM header flag when the plaintext is detected as a PDF form, so the server can classify the encrypted file as a form without decrypting it. The detection SHALL apply the server's own plaintext rule to the first 300 bytes of a `.pdf` upload (the PDF binary comment, the first object, the form signature before the stream marker), so an encrypted upload is classified exactly as its plaintext would be by the server.

#### Scenario: Form uploaded
- **WHEN** a PDF form is uploaded to a private room
- **THEN** the DSE3 header carries the IS_FORM flag and the server lists the file as a form

#### Scenario: Marker outside the server's window
- **WHEN** a `.pdf` whose form marker lies beyond the first 300 bytes, or lacks the first-object prefix, is uploaded to a private room
- **THEN** the flag is not set, because the server would not classify the plaintext as a form either

#### Scenario: Non-PDF upload
- **WHEN** a file whose extension is not `.pdf` is uploaded to a private room
- **THEN** the flag is not set and the plaintext is not inspected for the form signature
