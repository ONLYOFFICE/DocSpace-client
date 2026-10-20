# Proposal

## Why

Private rooms cannot be released because the editor half of the feature has no
written, tested contract: the browser hands the file's data encryption key (DEK)
to the editor configuration, but nothing in this repository or the server
proves that a Document Server build consumes it in a web session, co-editing is
"disabled" only by a configuration flag that nobody reads, and save-as,
download-as, print, version history and form submission have no encrypted
branch at all. The SDK already refuses to open encrypted files for this reason
(Common:PrivateRoomEditorNotSupported). The gating commit of 2026-08-14 named
this as the reason the feature is hidden; the last editor-side commit is
2026-08-12, so the gap is not closing by itself.

## What Changes

- Write down and version the Document Server contract for encrypted files:
  how `editorConfig.encryptionKeys` is consumed, how the DSE3 container is
  decrypted and re-encrypted on save, what the callback returns, how the JWT
  treats the field, and the minimum Document Server version or capability.
- Add a Document Server capability check: the client refuses to open an
  encrypted file (with a localized message) when the connected Document
  Server does not declare encrypted-editing support, instead of showing
  ciphertext.
- Disable co-editing for encrypted files for real: the server emits a
  co-editing configuration that forbids concurrent sessions, and the client
  stops relying on the unconsumed `canCoAuthoring` flag.
- Define the policy for every editor action on an encrypted file: save-as,
  download-as, print, version history and form filling each either run
  through an encrypted path or are withheld in the editor UI. The proposed
  policy withholds save-as, download-as and version history in v1, keeps
  print, and withholds form submission.
- Let the SDK open encrypted files once the capability check passes.
- Add the missing test coverage: an MSW `openedit` mock for an encrypted
  file, a doceditor unit test for the key path, a client E2E that opens an
  encrypted file, and the SDK editor E2E un-fixmed.

**BREAKING** for testers: an encrypted file no longer opens against a
Document Server that does not declare the capability.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: the DEK hand-off gets a declared
  contract and capability check; the co-authoring requirement becomes a real
  co-editing restriction; the "no encrypted-specific handling" requirement
  and the "no Document Server version" requirement are replaced by explicit
  action policies and a capability requirement; the SDK refusal becomes
  conditional on the capability.

## Impact

- Client: `packages/doceditor/src` (key hook, editor config, editor events,
  actions), `packages/sdk/src/app/(personal-files)` docs layout, shared
  settings store (Document Server capability), locales.
- Server (`../server`): editor configuration (`EditorController`,
  `Configuration.cs` co-editing), Document Server version/capability probe,
  callback handling for encrypted saves; conversion guards already exist.
- Document Server team: owns the contract itself. Nothing in this change can
  be marked done until that team confirms how `encryptionKeys.dek` is read in
  a web session, what the save callback returns and which version ships it.
- Tests: `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`,
  `packages/doceditor/__tests__`, `packages/client/__tests__`,
  `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`.

## Out of scope

- Changing the DSE3 wire format (see `private-rooms-dse3-header-authentication`).
- Any new editor features for encrypted files beyond the v1 policy above.
- Removing the `privateRooms` flag (see `private-rooms-release-gate`).

## Decisions needed

1. The v1 action policy (withhold save-as / download-as / version history /
   form submit, keep print). Product owner decides; the specs below assume it.
2. Whether a Document Server without the capability should block only
   encrypted files or disable private-room creation altogether. The specs
   assume per-file refusal.
3. Who signs off the Document Server contract document and where it lives
   (proposed: `openspec/specs/private-rooms/editor-integration/spec.md`
   Purpose plus a versioned section in the Document Server repository).
