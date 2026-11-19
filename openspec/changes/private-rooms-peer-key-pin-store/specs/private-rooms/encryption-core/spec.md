# Spec Delta

## MODIFIED Requirements

### Requirement: Peer public keys are pinned on first use
The system SHALL pin each peer's public key the first time it is seen, per current user, in IndexedDB, and in memory for the session only when the browser gives the page no IndexedDB. A key SHALL count as first seen only once its pin is stored. Later keys SHALL be compared with the peer's pinned and accepted keys in constant time. A pin that cannot be read or stored SHALL count as a refused key change, never as a first sight.

#### Scenario: First sight
- **WHEN** a peer's key is seen for the first time
- **THEN** it is stored as the pinned key for that user before the operation that needed it goes on

#### Scenario: IndexedDB unavailable
- **WHEN** the browser gives the page no IndexedDB, or refuses it any database
- **THEN** pins are kept in memory for the session and the operation continues

#### Scenario: Pin cannot be read
- **WHEN** the pin store is open but reading a peer's pin fails
- **THEN** the key is not pinned, no file is decrypted with it, no wrap is produced for it, and the stored pin is not overwritten

#### Scenario: Pin cannot be stored
- **WHEN** a peer's key is seen for the first time and storing its pin does not complete
- **THEN** the operation that needed the key is refused: no file is decrypted with it and no wrap is produced for it

#### Scenario: Pin store cannot be opened
- **WHEN** the browser offers IndexedDB but the current user's pin store cannot be opened, or its opening is blocked by another tab
- **THEN** the operation that needed a peer key is refused, and the next operation that needs one opens the store again

#### Scenario: Last-seen time not recorded
- **WHEN** a peer's key matches its pin and recording the time it was last seen does not complete
- **THEN** the key is used as a match

### Requirement: Key mismatch on unwrap is refused unless a resolver accepts it
The system SHALL compare the sender's public key with the pins when it unwraps a DEK, trying keys that match a pin first. It SHALL ask the key-change resolver only about a changed key that opened the wrap, and release that DEK only once the key is accepted and stored; without a resolver, or on refusal, the DEK SHALL be wiped and the unwrap fail with an authentication error. A key seen first SHALL be pinned only after it opened the wrap, and its DEK released only once the pin is stored.

#### Scenario: No resolver registered
- **WHEN** a sender key mismatch is detected in a context with no dialog
- **THEN** the file is not decrypted and the file key the changed key opened is wiped without being handed over

#### Scenario: User accepts the new key
- **WHEN** the key-change dialog is accepted
- **THEN** the new key joins the peer's trusted keys and the unwrap proceeds

#### Scenario: Unwrap waits for the decision
- **WHEN** a sender key differs from its pin and the key-change dialog has not been answered
- **THEN** the file key is not handed over and nothing is decrypted until the user accepts the key

#### Scenario: Listed changed key that does not open the wrap
- **WHEN** a sender with a pin is listed with two changed keys and the wrap was made with the second
- **THEN** the key-change dialog asks about the second key only, and the first is not trusted

#### Scenario: Pinned key listed beside a changed one
- **WHEN** the sender is listed with a pinned key and a changed key, and the wrap was made with the pinned key
- **THEN** the file is decrypted and no key-change dialog is shown

#### Scenario: Listed key that does not open the wrap
- **WHEN** a sender without a pin is listed with two keys and only the second opens the wrap
- **THEN** only the second key is pinned for the sender

#### Scenario: Sender pin cannot be stored
- **WHEN** a sender key seen for the first time opens the wrap and its pin cannot be stored
- **THEN** the file is not decrypted and the file key is not handed to the caller

### Requirement: Member keys are verified against pins when granting access
The system SHALL check each member's public key against its pin before wrapping a file key for them during invitation, backfill and upload fan-out, and SHALL skip members whose key mismatches and was not accepted. A changed key the user accepts SHALL be used only once it is stored among the member's trusted keys.

#### Scenario: Invited member with changed key
- **WHEN** a member being granted access has a key that mismatches its pin and the user refuses it
- **THEN** no wrap is produced for that member and the invitation reports the skipped member

#### Scenario: Unpinned member at upload
- **WHEN** the server lists a member whose key has never been seen on this device
- **THEN** the key is pinned and the wrap is produced once the pin is stored

#### Scenario: Accepted key cannot be stored
- **WHEN** the user accepts a member's changed key and storing it among the trusted keys does not complete
- **THEN** no wrap is produced for that key and the member is reported as a key that could not be checked

#### Scenario: Two keys of one peer accepted at once
- **WHEN** two tabs of the same user accept different changed keys of one peer at the same time
- **THEN** both keys are among the peer's trusted keys

## ADDED Requirements

### Requirement: The first sight of a peer key is decided once per peer
The system SHALL decide the first sight of a peer's key once per current user and peer, also when several operations or tabs see keys of that peer at the same time: exactly one key SHALL be pinned as first seen, and every other key seen meanwhile SHALL be compared with that pin.

#### Scenario: Two keys of one peer seen at once
- **WHEN** two operations see different keys of a peer without a pin at the same time
- **THEN** one key is pinned as first seen, and the other is treated as a changed key and MUST NOT be used unless the user accepts it

#### Scenario: One key of one peer seen twice at once
- **WHEN** two operations see the same key of a peer without a pin at the same time
- **THEN** the key is pinned once, both operations go on, and no key-change dialog is shown

#### Scenario: Two tabs see a new peer
- **WHEN** two tabs of the same user see different keys of a peer without a pin at the same time
- **THEN** exactly one key is pinned as first seen, and the other tab treats its key as a changed key

### Requirement: A peer key that could not be checked is reported per operation
The system SHALL refuse the part of an operation that needs a peer key whose pin could not be read or stored, or whose pin store could not be opened. It SHALL NOT show the key-change dialog for it, SHALL NOT report it as a refused key change or remember it as one, SHALL NOT raise the ghost-state notification for it, and SHALL tell the user in the operation's own terms.

#### Scenario: Upload with a key that could not be checked
- **WHEN** a member's key cannot be checked during the fan-out of an upload
- **THEN** the file is uploaded, no wrap is written for that member, the member is kept as pending access for the file, and Common:EncryptedUploadShareFailed names the member, not Common:EncryptedUploadNotSharedWith

#### Scenario: Next file of the batch checks again
- **WHEN** a member's key could not be checked for one file of an upload batch
- **THEN** the next file of the batch checks that key again and does not treat it as refused

#### Scenario: Invitee whose key could not be checked
- **WHEN** an invitee's key cannot be checked
- **THEN** the invitee does not become a room member, no file access entry is created for them, and the invite panel names them under Common:EncryptedInviteFailed

#### Scenario: Re-wrap for a member whose key could not be checked
- **WHEN** a member's key cannot be checked while the files they lack are wrapped for them
- **THEN** no wrap is written for them, Common:EncryptedReencryptPartialFailure counts the files, and the member row shows Common:EncryptedAccessPending

#### Scenario: Backfill with a key that could not be checked
- **WHEN** the backfill sweep cannot check a member's key
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Download, copy or preview with a sender key that could not be checked
- **WHEN** the sender key of a file cannot be checked during a download, a copy or a preview
- **THEN** the file is not decrypted, Common:EncryptedKeyCheckFailed is shown, and the ghost-state toast is not shown

#### Scenario: Name recovery with a sender key that could not be checked
- **WHEN** the sender key of a file in the list cannot be checked while its original name is recovered
- **THEN** the file keeps its opaque name and the ghost-state toast is not shown

### Requirement: An unusable member key affects only that member
The system SHALL treat a listed public key that is not a well-formed X25519 public key as unusable for that member alone: it SHALL NOT be pinned or wrapped for, the other members of the same fan-out, invitation, re-wrap or backfill SHALL still get their wraps, and an unwrap SHALL go on to the sender's next candidate key.

#### Scenario: Upload with one unusable member key
- **WHEN** one member of a private room is listed with an unusable key during an upload
- **THEN** the file is uploaded, every other member gets a wrap, the member is kept as pending access for the file, and Common:EncryptedUploadShareFailed names only that member

#### Scenario: Invitation with one unusable key
- **WHEN** one invitee of several is listed with an unusable key
- **THEN** that invitee does not become a room member and is named under Common:EncryptedInviteFailed, and every other verified invitee gets a wrap of every file

#### Scenario: Backfill with one unusable key
- **WHEN** the backfill sweep meets a member listed with an unusable key
- **THEN** every other member gets their wraps, and the member is reconsidered on the next sweep

#### Scenario: Unusable sender candidate
- **WHEN** one of the sender's listed keys is unusable and another opens the wrap
- **THEN** the file is decrypted

#### Scenario: Unusable key is not pinned
- **WHEN** a member without a pin is listed with an unusable key
- **THEN** no pin is stored for the member, and a well-formed key listed later for them is seen for the first time
