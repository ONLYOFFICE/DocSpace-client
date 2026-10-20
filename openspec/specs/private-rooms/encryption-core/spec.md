# Private Rooms Encryption Core Specification

## Purpose
Defines the client-side end-to-end encryption model behind private rooms: how a user's identity key is protected, how each file gets its own content key, how that key is handed to room members, what the encrypted file looks like on the server, where secrets live in the browser, how peer keys are trusted, and which threat-model limitations v1 accepts on purpose. Everything here is observable through the wire formats, the server's stored data and the user-visible outcomes; it is the contract the other private-rooms capabilities build on. Implementation: `packages/shared/services/encryption/*` (identity, hpke, streaming-encryption, file-keys, room-file-access, tofu-store, secret-storage, device-unlock-store, passkey-unlock, recovery, select-user-key) and `packages/shared/services/private-room/*`; the wire-format reference is the stashed `FORMAT.md` (v2), which the code matches except for the newer IS_FORM flag. Device-unlock policy: a remembered device survives auto-lock by design and its record expires after 30 days, so auto-lock bounds the post-XSS window only on devices that are not remembered; on a remembered device the bound is the record age.

## Requirements

### Requirement: Per-user identity key pair
The system SHALL give each user an X25519 identity key pair. The private key SHALL never leave the browser unencrypted: it is stored on the server only inside an identity envelope that the user's passphrase (and optionally recovery phrase) can open.

#### Scenario: Identity registered
- **WHEN** a user generates encryption keys
- **THEN** the server receives the public key and the sealed envelope, and never the raw private key

### Requirement: Identity envelope format and passphrase slot
The system SHALL seal the private key in a versioned envelope (version 2) that carries the public key, a passphrase slot with Argon2id parameters, salt and AES-256-GCM ciphertext, and an optional recovery slot. The public key SHALL be bound as associated data so a swapped public key makes the envelope unreadable.

#### Scenario: Default KDF cost
- **WHEN** a new envelope is created
- **THEN** the passphrase slot uses Argon2id with 64 MiB memory, 3 iterations, 4 lanes and a 32-byte derived key

#### Scenario: Tampered public key
- **WHEN** the public key stored next to an envelope differs from the key bound inside it
- **THEN** opening the envelope fails and no private key is produced

#### Scenario: Out-of-range KDF parameters
- **WHEN** an envelope declares memory above 1 GiB or iterations or lanes above 64
- **THEN** the envelope is rejected before any key derivation runs

### Requirement: Recovery slot from a 24-word phrase
The system SHALL derive the optional recovery slot from a 24-word BIP-39 phrase generated from 256 bits of entropy with a checksum word, normalised with NFKD, using the same Argon2id cost as the passphrase slot.

#### Scenario: Phrase opens the envelope
- **WHEN** the user enters the 24 words of their recovery phrase
- **THEN** the private key is recovered without the passphrase

#### Scenario: Wrong word count
- **WHEN** a phrase with a word count other than 24 is entered
- **THEN** it is rejected without a key-derivation attempt

### Requirement: Per-file content key
The system SHALL encrypt every file in a private room with its own random 32-byte AES-256 key (DEK). There SHALL be no room-level key.

#### Scenario: Two files in one room
- **WHEN** two files are uploaded to the same private room
- **THEN** each is encrypted with a different DEK

### Requirement: DEK wrapped per recipient with authenticated HPKE
The system SHALL wrap the DEK once per room member using HPKE in authenticated mode (DHKEM X25519 / HKDF-SHA256 / AES-256-GCM) under the sender's identity key, binding the sender user id, recipient user id and the server-assigned file id into the key schedule. The wrap blob SHALL carry its version, suite and sender id.

#### Scenario: Wrap bound to file id
- **WHEN** a wrap produced for file A is presented as the wrap for file B
- **THEN** unwrapping fails

#### Scenario: Wrap bound to recipient
- **WHEN** a wrap produced for user X is unwrapped with user Y's identity
- **THEN** unwrapping fails

#### Scenario: Malformed wrap blob
- **WHEN** a wrap blob has the wrong length, magic, version or suite
- **THEN** it is rejected before decryption

### Requirement: File access list holds one wrap per member
The system SHALL store the per-member wraps in the file's access list on the server, one entry per user id. Each entry carries the user id, the public key id it was wrapped for, and the wrap blob. A wrap SHALL only be produced for a member key that passed the pin check.

#### Scenario: Upload fan-out
- **WHEN** a member uploads a file into a private room
- **THEN** the file's access list is written with a wrap for the uploader and one per room member, for that member's selected key, when the key matches its pin or was pinned on first sight; at most one entry per user

#### Scenario: Member key mismatch on upload
- **WHEN** a listed member key differs from its pin and the uploader refuses it or no resolver is registered
- **THEN** no wrap is written for that member, the file is still uploaded, and Common:EncryptedUploadNotSharedWith names the member

#### Scenario: Member key change accepted on upload
- **WHEN** a listed member key differs from its pin and the uploader accepts it in the key-change dialog
- **THEN** the new key is pinned and the wrap is written for it

### Requirement: DSE3 chunked file format
The system SHALL store every encrypted file as a DSE3 version-2 container: a header (magic, version, suite, flags, chunk plaintext size, chunk count, 16-byte file nonce, optional encrypted name) followed by 1 MiB plaintext chunks, each encrypted with AES-256-GCM under a fresh random 12-byte IV and carrying its tag.

#### Scenario: Chunk size
- **WHEN** a 3 MiB file is encrypted
- **THEN** the container holds three chunks of 1 MiB plaintext each

#### Scenario: Chunk IVs are unique
- **WHEN** any two chunks of any files are compared
- **THEN** their IVs differ, because each IV comes from the browser's cryptographic random source

### Requirement: Chunk authentication binds position and length
The system SHALL bind the file nonce, total chunk count, chunk index and last-chunk flag into each chunk's associated data, and SHALL reject a container whose chunks were reordered, replayed, removed, truncated or extended.

#### Scenario: Reordered chunks
- **WHEN** two chunks of a container are swapped
- **THEN** decryption fails with an authentication error

#### Scenario: Truncated container
- **WHEN** the last chunk is removed or cut short
- **THEN** decryption fails and no partial plaintext is returned

#### Scenario: Extended container
- **WHEN** extra bytes are appended after the last chunk
- **THEN** decryption fails

### Requirement: Encrypted original filename in the header
The system SHALL encrypt the original filename under the file's DEK, bound to the file nonce, and store it in the DSE3 header with the has-name flag set, so the name can be recovered from the first few kilobytes of the file.

#### Scenario: Name recovery by range request
- **WHEN** a member lists a private room
- **THEN** the original names are recovered by fetching only the head of each file and decrypting the name field

#### Scenario: Flag and name length disagree
- **WHEN** the has-name flag is set but the name length is zero, or vice versa
- **THEN** the header is rejected

### Requirement: Opaque upload name with visible extension
The system SHALL upload every encrypted file under an opaque random UUID name that keeps the original extension, so the server never sees the original name but can still classify the file by type.

#### Scenario: Upload name
- **WHEN** `Report Q3.docx` is uploaded to a private room
- **THEN** the server stores a file named `<uuid>.docx`

#### Scenario: Non-opaque name refused
- **WHEN** an encrypted upload is attempted under a non-UUID name
- **THEN** the upload is refused before any bytes are sent

### Requirement: PDF form flag in the header
The system SHALL set the IS_FORM header flag when the plaintext is detected as a PDF form, so the server can classify the encrypted file as a form without decrypting it.

#### Scenario: Form uploaded
- **WHEN** a PDF form is uploaded to a private room
- **THEN** the DSE3 header carries the IS_FORM flag and the server lists the file as a form

### Requirement: Secure context required
The system SHALL refuse every encryption operation when WebCrypto is unavailable (non-HTTPS origin or unsupported browser), and SHALL tell the user with Common:EncryptionRequiresHttps where a user action triggered it.

#### Scenario: Plain HTTP portal
- **WHEN** a user tries to generate keys or create a private room over HTTP
- **THEN** the action is refused with Common:EncryptionRequiresHttps

### Requirement: Unlocked identity lives in memory with idle expiry
The system SHALL keep the unlocked private key only in process memory, in a single slot bound to the user id, and SHALL discard it after 30 minutes without use. Idle expiry and auto-lock affect this slot only; a remembered-device record is governed by its own maximum age.

#### Scenario: Idle expiry
- **WHEN** 30 minutes pass without any encryption operation
- **THEN** the next operation finds the identity locked

#### Scenario: User switch
- **WHEN** a different user id requests the slot
- **THEN** the stored key is wiped and nothing is returned

#### Scenario: Idle expiry on a remembered device
- **WHEN** the in-memory slot expires and a remembered-device record within its age limit exists
- **THEN** the next operation restores the key from the record without a prompt

### Requirement: Remembered device keeps the key in IndexedDB
The system SHALL, when the user opts to remember the device, store the private key in IndexedDB encrypted with AES-GCM under a non-extractable wrapping key kept in the same database, together with the time it was written. It SHALL restore the key silently on the next identity request, including after auto-lock, until the user locks or forgets the device or the record is older than the maximum age (30 days by default).

#### Scenario: Silent restore
- **WHEN** a remembered device needs the identity after a page reload
- **THEN** the key is restored without a passphrase prompt

#### Scenario: Explicit lock forgets the device
- **WHEN** the user chooses Lock now or Forget device
- **THEN** the IndexedDB record is deleted

#### Scenario: Record older than the maximum age
- **WHEN** a restore finds a record written more than 30 days ago, or with a timestamp in the future
- **THEN** the record is deleted and no key is returned, so the caller prompts the user

#### Scenario: Successful passphrase unlock refreshes the record
- **WHEN** the user unlocks with the passphrase and the remember option on a device whose record expired
- **THEN** a new record with the current time replaces the old one

### Requirement: Passkey unlock derives the key-encryption key from WebAuthn PRF
The system SHALL support unlocking with a platform passkey: the private key is sealed under a key derived (HKDF-SHA256) from the WebAuthn PRF extension output, and the credential id, PRF salt, IV and ciphertext are kept in IndexedDB. Without PRF support enrolment SHALL fail cleanly.

#### Scenario: Passkey unlock
- **WHEN** an enrolled user confirms the passkey prompt
- **THEN** the identity is unlocked without a passphrase

#### Scenario: PRF unsupported
- **WHEN** the authenticator does not return a PRF output
- **THEN** enrolment reports failure and no record is written

### Requirement: Peer public keys are pinned on first use
The system SHALL pin each peer's public key the first time it is seen (per current user, in IndexedDB with an in-memory fallback when IndexedDB is unavailable), and SHALL compare later keys against the pin in constant time.

#### Scenario: First sight
- **WHEN** a peer's key is seen for the first time
- **THEN** it is stored as the pinned key for that user

#### Scenario: IndexedDB unavailable
- **WHEN** IndexedDB cannot be opened
- **THEN** pins are kept in memory for the session and the operation continues

### Requirement: Key mismatch on unwrap is refused unless a resolver accepts it
The system SHALL, before unwrapping a DEK, compare the sender's public key with the pin. On mismatch it SHALL ask the registered key-change resolver; without a resolver, or when the resolver refuses, the unwrap SHALL fail with an authentication error before any decryption.

#### Scenario: No resolver registered
- **WHEN** a sender key mismatch is detected in a context with no dialog
- **THEN** the file is not decrypted

#### Scenario: User accepts the new key
- **WHEN** the key-change dialog is accepted
- **THEN** the new key replaces the pin and the unwrap proceeds

### Requirement: Member keys are verified against pins when granting access
The system SHALL check each member's public key against its pin before wrapping a file key for them during invitation, backfill and upload fan-out, and SHALL skip members whose key mismatches and was not accepted.

#### Scenario: Invited member with changed key
- **WHEN** a member being granted access has a key that mismatches its pin and the user refuses it
- **THEN** no wrap is produced for that member and the invitation reports the skipped member

#### Scenario: Unpinned member at upload
- **WHEN** the server lists a member whose key has never been seen on this device
- **THEN** the key is pinned and the wrap is produced

### Requirement: Decrypted filenames are session-scoped
The system SHALL cache decrypted filenames only in sessionStorage and SHALL clear the cache whenever the identity is locked.

#### Scenario: Lock clears names
- **WHEN** the identity locks (explicitly, on idle, or on tab hidden)
- **THEN** the filename cache is emptied and the list shows opaque names until the next unlock

### Requirement: Preferences stored in localStorage are validated on read
The system SHALL keep the auto-lock preset in localStorage and SHALL ignore values outside the allowed set when reading it back. No key choice and no migration progress is stored.

#### Scenario: Tampered auto-lock value
- **WHEN** the stored auto-lock value is not one of the offered presets
- **THEN** the default preset is used

### Requirement: Revocation removes access-list entries only
The system SHALL NOT generate a new DEK or re-encrypt file content when a member is removed from a private room. The server keeps the removed member's wraps in each file's access list, because an access-list write replaces only the users it names and never removes anyone else; access ends only because the server refuses the removed member read access.

#### Scenario: Member removed
- **WHEN** a member is removed from a private room
- **THEN** the ciphertext and each file's access list on the server are unchanged, and the server no longer lets the member read the files

### Requirement: No forward secrecy for already-decrypted content
The system SHALL NOT attempt to revoke access to content a removed member already decrypted or to a DEK they already unwrapped; protection of such content rests on the server refusing further downloads.

#### Scenario: Removed member keeps a local copy
- **WHEN** a removed member downloaded a file before removal
- **THEN** that copy stays readable to them

### Requirement: File extension is visible to the server
The system SHALL NOT hide the file extension from the server; only the base name is encrypted.

#### Scenario: Server-side filter by type
- **WHEN** the server filters a private room by document type
- **THEN** encrypted files are classified by their visible extension

### Requirement: Identity is per device
The system SHALL NOT synchronise unlocked identities or passphrases across devices. A new device SHALL need the passphrase-protected envelope or the recovery phrase of the user's key; only a user without a key generates one.

#### Scenario: Second device
- **WHEN** a user signs in on a second device
- **THEN** encrypted files show as inaccessible until the identity is unlocked or set up on that device

### Requirement: One access-list entry per user
The system SHALL write at most one wrap per user into a file's access list, because the server keys the list by file and user, and SHALL wrap for that user's selected key. A write SHALL never name the same user twice.

#### Scenario: Multi-key user at upload
- **WHEN** a file is wrapped for a user the server lists with two key pairs
- **THEN** the access list holds one entry for that user, wrapped for the selected key, and the write succeeds

### Requirement: No Web Worker isolation
The system SHALL NOT run key material in a Web Worker; all cryptography runs on the page's main thread within the page origin.

#### Scenario: Same-origin script
- **WHEN** a script runs in the page origin while the identity is unlocked
- **THEN** it can reach the unlocked key

### Requirement: No cross-device pin sync and no key transparency
The system SHALL NOT synchronise peer-key pins between devices and SHALL NOT consult a key-transparency log; each device builds its own pins.

#### Scenario: Key accepted on one device
- **WHEN** a changed peer key is accepted on device A
- **THEN** device B still shows the key-change dialog for the same peer

### Requirement: Whole files are buffered in memory
The system SHALL buffer the complete ciphertext in memory when encrypting and the complete plaintext when decrypting; peak memory is about twice the file size and no explicit size cap is enforced.

#### Scenario: Large file
- **WHEN** a file close to the browser's memory limit is encrypted or decrypted
- **THEN** the operation may fail with a memory error rather than streaming to disk

### Requirement: One selected key per user
The system SHALL operate with exactly one identity key per user. When the server lists several envelopes for a user, the system SHALL use the one with the newest server-set date, ties going to the last one listed, for the current user's own key and for every room member's key alike, and SHALL NOT register a second key for a user who already has one.

#### Scenario: Own key with leftover envelopes
- **WHEN** the server lists two envelopes for the current user
- **THEN** the envelope with the newer date is the user's key on every device and the other one is not used

#### Scenario: Member listed with two keys
- **WHEN** the room access list holds two keys for one member
- **THEN** the member's key with the newer date is the one used for that member

#### Scenario: File wrapped for an unused key
- **WHEN** the user's only access entry on a file was wrapped for an envelope that is not the selected one
- **THEN** the file cannot be unwrapped and the ghost-state notification applies
