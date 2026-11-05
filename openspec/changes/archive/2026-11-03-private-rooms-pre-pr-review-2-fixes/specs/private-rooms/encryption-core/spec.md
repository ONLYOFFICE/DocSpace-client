# Spec Delta

## ADDED Requirements

### Requirement: A lock wipes only the cache slot
The system SHALL hand each caller of the unlocked identity its own copy of the key material, and a lock, a key deletion, a user switch or an idle expiry SHALL wipe only the cache slot. An operation that obtained the identity before the lock SHALL finish with intact key material; the next operation SHALL find the identity locked.

#### Scenario: Lock now during an upload
- **WHEN** the user chooses Lock now while an encrypted upload that already obtained the identity is wrapping its file key
- **THEN** the upload completes with wraps that the uploader and the room members can open, and the next encryption operation asks for the unlock

#### Scenario: Idle expiry during a re-wrap
- **WHEN** the in-memory slot expires while a re-wrap that already obtained the identity is running
- **THEN** the re-wrap completes with valid wraps

### Requirement: Wrapping refuses an erased key
The system SHALL refuse to wrap or unwrap a file key with a private key whose bytes are all zero, and SHALL report it as an encryption failure instead of storing a wrap.

#### Scenario: All-zero private key
- **WHEN** a wrap is requested with a private key of 32 zero bytes
- **THEN** the wrap fails and no access entry is written
