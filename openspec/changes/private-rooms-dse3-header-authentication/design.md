# Design

## Context

See proposal.md for motivation. The header builder (`packages/shared/services/encryption/streaming-encryption.ts:92-106`) writes magic, version, suite, a flags byte combining `DSE3_FLAG_HAS_ENCRYPTED_NAME` (0x01) and `DSE3_FLAG_IS_FORM` (0x02, `types.ts:67-68`), the chunk plaintext size, chunk count, file nonce, name length and the encrypted name. The parser (`:133-155`) validates ranges and the flag/name-length agreement but nothing cryptographic. `buildChunkAad` (`:186-200`) binds prefix, suite, file nonce, chunk count, index and last flag; `buildNameAad` (`:202-207`) binds prefix, suite and nonce. The server's form classifier reads byte 6 for bit 0x02 (`server/products/ASC.Files/Core/Utils/FileChecker.cs:42-66`) and notes the semantics are frozen.

The stashed FORMAT.md §4 ("AAD binding") lists exactly the fields the code binds and nothing more; it does not know the IS_FORM flag (added in commit ff9f51aeffb, 2026-09-01). SECURITY.md has no entry for header integrity. This design therefore records a new decision, not a reversal.

## Goals / Non-Goals

**Goals:**
- Every byte of the header that influences how a file is interpreted (flags, sizes, name presence) is covered by the authentication tag of the data it describes.
- Old containers remain readable; the server's form classifier keeps working without a deploy.

**Non-Goals:**
- Hiding the extension or the file size; changing chunk size, suite or the wrap format.
- Forcing re-encryption of existing files (a policy decision left to the proposal's decisions list).

## Decisions

1. **Bump the container version to 3 instead of extending the v2 associated data.** A v2 file encrypted with the old associated data cannot be decrypted with the new one, so changing the AAD in place would brick every existing private-room file. A version byte already exists and the parser branches on it. Alternative: a feature bit in the flags byte meaning "extended AAD". Rejected: the flags byte is itself one of the unauthenticated fields, so a downgrade attack could clear the bit.
2. **Bind the whole fixed header prefix, not individual fields.** The version-3 chunk and name associated data append the 11 header bytes from `flags` through `nameLen` (flags 1, chunkPlaintextSize 4, chunkCount 4, nameLen 2) after the file nonce. Binding the prefix as one slice is simpler to reason about and automatically covers any future header field placed before the name. Alternative: bind only flags. Rejected: the chunk size and name length are equally attacker-controlled.
3. **Keep the header layout byte-identical.** The server classifier reads offset 6 and the Document Server (per `private-rooms-editor-contract`) will parse the same layout; only the version byte and the AAD construction change. No server deploy is required for classification.
4. **Write v3, read v2 and v3, no forced migration (decided 2026-10-26).** The feature is behind a flag and unreleased, so the population of v2 files is test data. Re-import (download without decryption, upload again) already rebuilds the container and will produce v3, which is enough as an opt-in migration. Alternatives, rewrite on next edit and background re-upload, were not taken.
5. **Version-2 reads are marked.** The decrypt result carries `headerAuthenticated: false` for v2 so callers (download, editor) can surface a one-line notice later if the product wants it; no UI is added in this change.

## Risks / Trade-offs

- [Document Server rejects version 3] → no Document Server build decrypts DSE3 yet; `private-rooms-editor-contract` requires it to read versions 2 and 3 and write version 3 (decided 2026-10-26), so the requirement is in place before the first consumer is built.
- [Any third party parsing DSE3 (desktop editors, MCP) breaks on version 3] → the layout is unchanged; only a strict version check breaks, and none is known in this repo. Grep the sibling repos before merge, and ask the desktop developer whether the new crypto engine parses DSE3 together with task 2.0 of `private-rooms-remove-dead-api-calls` (task 4.3).
- [Two code paths (v2/v3) in the parser for a long time] → v2 read support is isolated in the AAD builders behind the version switch and covered by the existing tamper tests run against both versions.

## Migration Plan

1. Land the format change behind the existing `privateRooms` flag; new uploads write v3.
2. Server: no change. Checked on 2026-10-28 (`../server` at `e618acc6c0`, task 4.1): `grep -rn "DSE3" ../server --include=*.cs` finds one reader, `FileChecker.CheckExtendedPDFstream` (`products/ASC.Files/Core/Utils/FileChecker.cs:42-67`), which matches the magic and reads the form flag at offset 6 and leaves the version byte alone on purpose ("the byte is read independently of the version byte", `:42-44`). No server task is needed.
3. Rollback: revert the client; v3 files written in between stay readable only by clients with the change, so the rollback window must be short or the migration policy must be "none" (decision 2).

## Open Questions

- Whether to show a notice for v2 files in the download and editor paths; can be decided after the format lands without changing the specs.
