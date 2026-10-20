# Spec Delta

## MODIFIED Requirements

### Requirement: DSE3 chunked file format
The system SHALL write every new encrypted file as a DSE3 version-3 container: a header (magic, version, suite, flags, chunk plaintext size, chunk count, 16-byte file nonce, optional encrypted name) followed by 1 MiB plaintext chunks, each encrypted with AES-256-GCM under a fresh random 12-byte IV and carrying its tag. The system SHALL still read version-2 containers.

#### Scenario: Chunk size
- **WHEN** a 3 MiB file is encrypted
- **THEN** the container holds three chunks of 1 MiB plaintext each

#### Scenario: Chunk IVs are unique
- **WHEN** any two chunks of any files are compared
- **THEN** their IVs differ, because each IV comes from the browser's cryptographic random source

#### Scenario: New upload writes version 3
- **WHEN** a file is encrypted for upload after this change
- **THEN** the header version byte is 3

#### Scenario: Version-2 container still opens
- **WHEN** a container written before the change is downloaded
- **THEN** it decrypts with the version-2 rules and its name is recovered

#### Scenario: Unknown version
- **WHEN** a container declares a version other than 2 or 3
- **THEN** it is rejected before any decryption

### Requirement: Chunk authentication binds position and length
The system SHALL bind the file nonce, total chunk count, chunk index and last-chunk flag into each chunk's associated data and, for version-3 containers, also the flags byte, the chunk plaintext size and the name length. The system SHALL reject a container whose chunks were reordered, replayed, removed, truncated or extended, or whose version-3 header fields were altered.

#### Scenario: Reordered chunks
- **WHEN** two chunks of a container are swapped
- **THEN** decryption fails with an authentication error

#### Scenario: Truncated container
- **WHEN** the last chunk is removed or cut short
- **THEN** decryption fails and no partial plaintext is returned

#### Scenario: Extended container
- **WHEN** extra bytes are appended after the last chunk
- **THEN** decryption fails

#### Scenario: Flags byte altered
- **WHEN** any bit of the flags byte of a version-3 container is changed after encryption
- **THEN** decryption of the first chunk fails with an authentication error

#### Scenario: Chunk plaintext size altered
- **WHEN** the chunk plaintext size field of a version-3 container is changed to another valid value
- **THEN** decryption fails with an authentication error

### Requirement: Encrypted original filename in the header
The system SHALL encrypt the original filename under the file's DEK, bound to the file nonce and, for version-3 containers, to the flags byte and name length, and store it in the DSE3 header with the has-name flag set, so the name can be recovered from the first few kilobytes of the file.

#### Scenario: Name recovery by range request
- **WHEN** a member lists a private room
- **THEN** the original names are recovered by fetching only the head of each file and decrypting the name field

#### Scenario: Flag and name length disagree
- **WHEN** the has-name flag is set but the name length is zero, or vice versa
- **THEN** the header is rejected

#### Scenario: Name stripped from a version-3 container
- **WHEN** the has-name flag is cleared and the name length zeroed on a version-3 container
- **THEN** chunk decryption fails and the file is not shown under its opaque name

### Requirement: PDF form flag in the header
The system SHALL set the IS_FORM header flag when the plaintext is detected as a PDF form, so the server can classify the encrypted file as a form without decrypting it, and SHALL authenticate the flag in version-3 containers.

#### Scenario: Form uploaded
- **WHEN** a PDF form is uploaded to a private room
- **THEN** the DSE3 header carries the IS_FORM flag and the server lists the file as a form

#### Scenario: Form flag cleared on a version-3 container
- **WHEN** the IS_FORM flag is cleared on a stored version-3 container
- **THEN** the server may list the file as a plain PDF, but the client refuses to decrypt it and reports an authentication error
