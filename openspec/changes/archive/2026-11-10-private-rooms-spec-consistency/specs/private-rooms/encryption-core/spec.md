## ADDED Requirements

### Requirement: Older versions of a file are not detected
The system SHALL NOT detect that the server returned an older version of the same file in place of the current one. Every version of a file is encrypted under that file's one data key, and the chunk authentication binds the version's file nonce, the chunk count and each chunk's position, but neither the file id nor a version number. The ciphertext of another file still fails, because it was encrypted under another key.

#### Scenario: Older version served
- **WHEN** the server returns an earlier stored version of an encrypted file in place of its current version
- **THEN** the earlier version decrypts without an error and the user sees its content

#### Scenario: Another file served
- **WHEN** the server returns the ciphertext of another encrypted file in place of this one
- **THEN** decryption fails with an authentication error and MUST NOT return any plaintext

## MODIFIED Requirements

### Requirement: Revocation removes access-list entries only
The system SHALL NOT generate a new DEK or re-encrypt file content when a member is removed from a private room. The server deletes the removed member's wrapped keys from the files of the room itself when their share of the room is removed, the room's creator excepted; the ciphertext stays as it is, so what the member saved or decrypted before stays readable to them.

#### Scenario: Member removed
- **WHEN** a member is removed from a private room
- **THEN** the ciphertext is unchanged, the member's entries are gone from each file's access list, and the server no longer lets the member read the files

### Requirement: DSE3 header flags, chunk size and name length are not authenticated
The system SHALL NOT authenticate the flags byte, the chunk size or the name length of a DSE3 version-2 header; only the chunk payloads with their count and position, the file nonce and the encrypted name are authenticated. Someone able to rewrite a stored ciphertext can change the flags the header carries or remove the encrypted name without decryption detecting it. A rewritten chunk size breaks the framing of the chunks, so decryption fails.

#### Scenario: Form flag cleared in storage
- **WHEN** the IS_FORM flag is cleared in the header of a stored encrypted PDF form
- **THEN** the file decrypts to its original content, its header no longer marks it as a form, and decryption reports no error

#### Scenario: Encrypted name stripped in storage
- **WHEN** the encrypted name is removed from the header of a stored encrypted file, with the has-name flag cleared and the name length set to zero
- **THEN** the file decrypts to its original content and shows under its opaque upload name, because no original name can be recovered

#### Scenario: Content still authenticated
- **WHEN** the chunk bytes, the chunk count or the file nonce of a stored encrypted file are changed
- **THEN** decryption fails with an authentication or format error and MUST NOT return any plaintext

#### Scenario: Chunk size rewritten in storage
- **WHEN** the chunk size in the header of a stored encrypted file of more than one chunk is changed
- **THEN** decryption fails with an authentication or format error and MUST NOT return any plaintext

## RENAMED Requirements

- FROM: `### Requirement: DSE3 header flags and name length are not authenticated`
- TO: `### Requirement: DSE3 header flags, chunk size and name length are not authenticated`
