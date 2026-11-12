# Spec Delta

## ADDED Requirements

### Requirement: Encryption protects against a storage leak and a passive server
The system SHALL keep the content and the original name of every file of a private room unreadable to anyone who holds the stored data without a member's unlocked key: a copy of the file storage, of the database or of a backup, and a server that stores and returns what clients send it without altering it. This is the protection the encryption is designed to give; the limits of it are requirements of their own.

#### Scenario: Stored data copied
- **WHEN** someone obtains the stored files, the access lists and the identity envelopes of a portal, and no member's passphrase or recovery phrase
- **THEN** no file content and no original file name of a private room can be read from them

#### Scenario: Server relays without altering
- **WHEN** the server stores and returns ciphertext, wraps and public keys exactly as the clients sent them
- **THEN** it MUST NOT be able to decrypt any file of a private room

### Requirement: No protection against an active server
The system SHALL NOT protect the files of a private room against a server that alters what it answers. The server names the members a file key is wrapped for and supplies their public keys, and a key seen for the first time is pinned without a question. A server that lists a key of its own for a member, or adds a member, receives a wrap of every file uploaded or re-wrapped after that.

#### Scenario: Key supplied by the server for an unseen member
- **WHEN** the server lists, for a member this device has never seen, a public key that is not that member's
- **THEN** the key is pinned as first seen, no dialog is shown, and the files uploaded afterwards are wrapped for it

#### Scenario: Member added by the server
- **WHEN** the server lists among the members of a private room a user the room's people never invited
- **THEN** the next upload wraps its file key for that user as for any member

#### Scenario: Key replaced for a pinned member
- **WHEN** the server lists a different key for a member whose key is already pinned on this device
- **THEN** the key-change dialog is shown and no wrap is produced for the new key unless the user accepts it

### Requirement: No out-of-band verification of peer keys
The system SHALL NOT offer a way to compare a member's key with that member outside the portal: no fingerprint of another user is shown and no key can be marked as verified. Trust in a peer key rests on first use and on the key-change dialog alone.

#### Scenario: Looking for a member's fingerprint
- **WHEN** a user opens the members of a private room
- **THEN** no key fingerprint of another member is shown and no action marks a member's key as verified

### Requirement: Metadata is visible to the server
The system SHALL NOT hide from the server the title of a private room and of its folders, the size of each file, the length of its encrypted name, the number of its chunks, whether it is a PDF form, which user wrapped each file key, the room's members and roles, and the times of upload and change. Only the file content and the base name of a file are encrypted.

#### Scenario: Room and folder titles
- **WHEN** a private room or a folder in it is created or renamed
- **THEN** its title is sent to the server and stored as plain text

#### Scenario: File size
- **WHEN** an encrypted file is stored
- **THEN** the size of its content follows from the stored size, which adds a fixed header, the encrypted name and a fixed overhead per chunk

#### Scenario: Sender of a wrap
- **WHEN** a file key is wrapped for a member
- **THEN** the access entry names the user who wrapped it
