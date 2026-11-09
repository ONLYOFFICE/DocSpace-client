# Design

## Context

See proposal.md - Why. The behaviour this change records is on the branch today. The associated data of a chunk binds the suite, the file nonce, the chunk count, the chunk index and the last-chunk flag. The associated data of the encrypted name binds the suite and the file nonce. Neither binds the flags byte (offset 6), the chunk plaintext size (offset 7) or the name length (offset 31). The parser checks only that the has-name flag and the name length agree. The existing tamper tests cover the cases that fail (swapped chunks, nonce and chunk-count changes, tag bytes, truncation, a name flag that disagrees with the length). No test covers the two changes that pass.

A changed chunk plaintext size is not a silent case. It moves the chunk boundaries the decryptor reads, so a multi-chunk file fails authentication, and a single-chunk file decrypts to the same content. That is why the limitation names the flags byte and the name length.

The stashed FORMAT.md section 4 lists exactly the fields the code binds and predates the IS_FORM flag, so it neither documents nor contradicts the limitation. The code is the reference.

Server form classification, looked up through CodeGraph and read in `../server` on 2026-11-02:
- `FileChecker.CheckExtendedPDFstream` (`products/ASC.Files/Core/Utils/FileChecker.cs`) reads bit 0x02 of byte 6 of a DSE3 stream whatever the version.
- The file's stored category is set from the stream when the file is written: `FileStorageService.cs:1929, 1964, 2051`.
- A list filtered by forms reads the stored category, and reads the stream again only for a file without one (`EntryManager.cs:677`).
- The editor configuration asks `FileChecker.IsFormPDFFile`, which reads the stream again, cached for a day per file version.

So a flag cleared in storage after upload does not change the stored category at once. The spec scenario therefore states what the header and the decryption show, not how the server lists the file.

## Goals / Non-Goals

**Goals:**
- The main spec states the limitation the branch has, in the form `private-rooms-release-gate` 1.5 accepts for a deferral.
- Both silent cases are pinned by tests, so the next version's change turns them into failures on purpose.

**Non-Goals:**
- Any change to how the server classifies or lists files.

## Decisions

1. **One ADDED requirement in `encryption-core`, not a change to "DSE3 chunked file format".** The other v1 limitations in that spec are separate SHALL NOT requirements ("File extension is visible to the server", "No Web Worker isolation"). A separate requirement keeps the limitation visible and gives the version-3 change one block to remove. Alternative: a sentence added to "Chunk authentication binds position and length". Rejected: it would blur a positive requirement with a limitation.
2. **`private-rooms-dse3-header-authentication` stays active, marked deferred.** Its proposal, design and tasks are still the plan for the next version. Archiving it unimplemented would merge a delta that describes behaviour the branch does not have. Alternative: delete it and propose it again later. Rejected: the design records decisions (version bump, header slice, Document Server state) worth keeping.
3. **The tests run on version-2 containers built by the production builder.** They mutate only the header bytes and assert on the plaintext and the parsed header. No test-only builder is needed, since the builder already writes version 2.

## Risks / Trade-offs

- [The deferred change resumes and forgets the limitation] → the deferral note in its tasks.md says its delta must remove "DSE3 header flags and name length are not authenticated" and turn the two pinned tests into failure cases.
- [A reader takes the limitation for the server's view of forms] → the scenario speaks about the header and decryption only; the server facts live here, not in the spec.

## Migration Plan

None: tests and planning artifacts only. Rollback is a revert of the commits.
