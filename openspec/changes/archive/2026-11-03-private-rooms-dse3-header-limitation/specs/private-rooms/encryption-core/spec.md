# Spec Delta

## ADDED Requirements

### Requirement: DSE3 header flags and name length are not authenticated
The system SHALL NOT authenticate the flags byte or the name length of a DSE3 header in this version; only the chunk payloads and the encrypted name are authenticated. Someone able to rewrite a stored ciphertext can change the flags the header carries or remove the encrypted name without decryption detecting it. The file content cannot be changed undetected.

#### Scenario: Form flag cleared in storage
- **WHEN** the IS_FORM flag is cleared in the header of a stored encrypted PDF form
- **THEN** the file decrypts to its original content, its header no longer marks it as a form, and decryption reports no error

#### Scenario: Encrypted name stripped in storage
- **WHEN** the encrypted name is removed from the header of a stored encrypted file, with the has-name flag cleared and the name length set to zero
- **THEN** the file decrypts to its original content and shows under its opaque upload name, because no original name can be recovered

#### Scenario: Content still authenticated
- **WHEN** the chunk bytes, the chunk count or the file nonce of a stored encrypted file are changed
- **THEN** decryption fails with an authentication or format error and MUST NOT return any plaintext
