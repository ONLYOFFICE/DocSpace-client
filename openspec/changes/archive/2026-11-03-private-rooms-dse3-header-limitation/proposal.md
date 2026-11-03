# Proposal

## Why

`private-rooms-dse3-header-authentication` would bind the DSE3 header's flags byte and name length into the authenticated data through a new container version 3. The owner decided on 2026-11-02 to defer it to the next version, so as not to complicate the transition: the Document Server 10.0.0.133 library reads version 2 only, and the switch needs a Document Server release that reads version 3. Until then version 2 stays the only format the portal writes. `private-rooms-release-gate` 1.5 allows such a deferral only with an accepted-limitation requirement merged into `private-rooms/encryption-core`. The main spec says nothing about the unauthenticated header fields today, so the limitation would ship unrecorded.

## What Changes

- `private-rooms/encryption-core` gains a v1 limitation, phrased as SHALL NOT: the flags byte and the name length of the DSE3 header are not authenticated. Someone who can rewrite a stored ciphertext can clear the IS_FORM flag, or strip the encrypted name (has-name flag cleared, name length zeroed, name bytes dropped). Decryption does not notice either change: the content comes out unchanged, and in the second case the file shows under its opaque upload name. Anything that changes the content, the chunk count or the file nonce still fails decryption.
- Tamper tests on a version-2 container pin both silent cases, next to the existing cases that fail.
- `private-rooms-dse3-header-authentication` stays an active change, marked as deferred to the next version. When it resumes, its delta removes the limitation this change adds.
- No production code changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: adds the requirement "DSE3 header flags and name length are not authenticated", a v1 limitation.

## Impact

- Shared tests: `packages/shared/services/encryption/__tests__/dse3-tampering.test.ts`.
- OpenSpec: the README and tasks.md of `private-rooms-dse3-header-authentication` record the deferral. Once this change is archived, `private-rooms-release-gate` 1.5 can be checked against the main spec (`private-rooms-device-unlock-policy`, the other change it names, was archived on 2026-10-20).
- Server (`../server`): no work. Its form classification reads the DSE3 flags byte whatever the version (`FileChecker.CheckExtendedPDFstream`), confirmed through CodeGraph on 2026-11-02.
- Document Server: no work. The deferral exists because its 10.0.0.133 library reads version 2 only (`private-rooms-editor-contract` D6).
- Locales, SDK, doceditor: no work.

## Out of scope

- Implementing container version 3 or any change to the DSE3 format, the associated data or the parser.
- A user-facing notice that a file's header is unauthenticated.
- Any server-side check of stored ciphertext.

## Decisions for a human

- Decided 2026-11-02 by the owner: header authentication is deferred to the next version.
- Open: which release counts as "the next version", which decides when `private-rooms-dse3-header-authentication` resumes. Owner: feature owner. It does not block this change.
