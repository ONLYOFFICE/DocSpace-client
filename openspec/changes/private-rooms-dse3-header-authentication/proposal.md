# Proposal

## Why

The DSE3 container authenticates the chunk payloads (file nonce, chunk count, index, last-chunk flag) and the encrypted filename (file nonce), but not the plain header fields around them: the flags byte (has-name, IS_FORM), the chunk plaintext size and the name length. An attacker with write access to the stored blob can clear the IS_FORM flag so the server stops classifying the file as a form, or zero the name length and clear the has-name flag so the file decrypts under its opaque UUID name. Content integrity is intact in both cases, but the metadata downgrade is silent. The stashed FORMAT.md §4 documents only what is bound and gives no rationale for leaving the rest unbound, and it predates the IS_FORM flag, so this is a decision that was never taken rather than a decision to live with.

## What Changes

- The flags byte, chunk plaintext size and the name-length field are bound into the authenticated data of every chunk and of the encrypted name, so any change to them makes decryption fail.
- Because the associated data changes, the container format version is bumped (DSE3 version 3). Version-2 containers stay readable; new uploads write version 3.
- The parser rejects a version-3 header whose flags or sizes were altered, with the existing authentication error.
- Re-import of a downloaded ciphertext (already supported) carries the container's version through unchanged.
- **Decision required** before implementation: whether to migrate existing version-2 files (re-encrypt on next write, or a background re-upload) or to accept that files uploaded before the change keep unauthenticated headers. The artifacts assume "read both, write v3, no forced migration".

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/encryption-core`: "DSE3 chunked file format" (version 3 written, version 2 still read), "Chunk authentication binds position and length" (header fields added to the associated data), "Encrypted original filename in the header" (name authentication binds flags and length), "PDF form flag in the header" (the flag is authenticated).

## Impact

- Shared: `packages/shared/services/encryption/streaming-encryption.ts` (header builder, parser, associated-data builders), `types.ts` (version constant, flags), the DSE3 tamper tests and wire-format tests.
- Server: the form classifier reads flag byte 0x02 at offset 6 of the unencrypted header (`FileChecker.cs`); the header layout up to the flags byte is unchanged, so the server keeps working. Any server-side parser that checks the version byte must accept 3; recorded for `private-rooms-server-hardening`.
- SDK and doceditor: they consume the shared format code; no separate change, but the Document Server side of the editor contract must accept version 3 (see `private-rooms-editor-contract`).
- Tests: `packages/shared/services/encryption/__tests__/{dse3-tampering,wire-format,streaming-encryption}.test.ts`, upload/download integration tests.

## Out of scope

- Hiding the file extension (accepted limitation), per-room keys, re-keying.
- Changing the HPKE wrap or the identity envelope formats.

## Decisions needed

1. Approve the version bump to DSE3 v3 (versus extending v2 associated data in place, which would make every existing v2 file unreadable).
2. Migration policy for existing version-2 files: none (recommended for a flagged, unreleased feature), rewrite on next edit, or background re-upload.
3. Confirm the Document Server build that will decrypt DSE3 accepts version 3 before this ships.
