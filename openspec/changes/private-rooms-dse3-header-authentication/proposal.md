# Proposal

## Why

The DSE3 container authenticates the chunk payloads (file nonce, chunk count, index, last-chunk flag) and the encrypted filename (file nonce), but not the plain header fields around them: the flags byte (has-name, IS_FORM), the chunk plaintext size and the name length. An attacker with write access to the stored blob can clear the IS_FORM flag so the server stops classifying the file as a form, or zero the name length and clear the has-name flag so the file decrypts under its opaque UUID name. Content integrity is intact in both cases, but the metadata downgrade is silent. The stashed FORMAT.md §4 documents only what is bound and gives no rationale for leaving the rest unbound, and it predates the IS_FORM flag, so this is a decision that was never taken rather than a decision to live with.

## What Changes

- The flags byte, chunk plaintext size and the name-length field are bound into the authenticated data of every chunk and of the encrypted name, so any change to them makes decryption fail.
- Because the associated data changes, the container format version is bumped (DSE3 version 3). Version-2 containers stay readable. The portal reads version 3 at once and writes it only once a Document Server release declares a library that reads it; until then new uploads keep writing version 2, because the Document Server decrypts with its own copy of the library and build 10.0.0.133 reads version 2 only (`private-rooms-editor-contract` D6, recorded 2026-10-30).
- The parser rejects a version-3 header whose flags or sizes were altered, with the existing authentication error.
- Re-import of a downloaded ciphertext (already supported) carries the container's version through unchanged.
- Existing version-2 files are not migrated (decided 2026-10-26): they stay readable with unauthenticated headers, and a re-import keeps them as they are, version included (the upload orchestrator uploads a DSE3 container unchanged under recovered keys).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/encryption-core`: "DSE3 chunked file format" (version 3 read, and written once the Document Server reads it; version 2 still read, and written until then), "Chunk authentication binds position and length" (header fields added to the associated data), "Encrypted original filename in the header" (name authentication binds flags and length), "PDF form flag in the header" (the flag is authenticated).

## Impact

- Shared: `packages/shared/services/encryption/streaming-encryption.ts` (header builder, parser, associated-data builders), `types.ts` (version constant, flags), the DSE3 tamper tests and wire-format tests.
- Server: the form classifier reads flag byte 0x02 at offset 6 of the unencrypted header (`FileChecker.cs`); the header layout up to the flags byte is unchanged, so the server keeps working. No server code checks the version byte (design.md, Migration Plan), so the server needs no change.
- SDK and doceditor: they consume the shared format code; no separate change. The Document Server reads and writes what its library copy does (version 2 in build 10.0.0.133); `private-rooms-editor-contract` asks each release to name its library build, and the portal writes version 3 only after a release that reads it is named. Whether the desktop crypto engine parses DSE3 is asked together with task 2.0 of `private-rooms-remove-dead-api-calls`.
- Tests: `packages/shared/services/encryption/__tests__/{dse3-tampering,wire-format,streaming-encryption}.test.ts`, upload/download integration tests.

## Out of scope

- Hiding the file extension (accepted limitation), per-room keys, re-keying.
- Changing the HPKE wrap or the identity envelope formats.

## Decisions needed

Decided on 2026-10-26:

1. The container version is bumped to 3; extending the version-2 associated data in place would make every existing file unreadable.
2. Existing version-2 files are not migrated.
3. Document Server support is a requirement of `private-rooms-editor-contract`, not a precondition of this change. Revised 2026-10-30: build 10.0.0.133 does decrypt DSE3, with a library that reads version 2 only, so the portal reads version 3 now and writes it only after a Document Server release declares a library that reads it (that change's D6).

Open:

4. How the portal switches to writing version 3: a constant flipped in one commit once the release is named (design decision 6, proposed), or the encrypted-editing capability payload of `private-rooms-editor-contract`. Owner: feature owner, before task 1.4.
