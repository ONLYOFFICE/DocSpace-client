# Proposal

## Why

Private rooms cannot be released because the editor half of the feature has no
written, tested contract. A live run on 2026-10-29 against Document Server
10.0.0 build 133 (developer edition) showed that the editor's web client does
consume the DEK the browser hands it: it downloads the DSE3 container in the
browser, decrypts and re-encrypts it there, and relays co-editing changes
encrypted with the DEK. The same run showed what is still missing: once a
user saves an encrypted document, the file no longer opens, because the
editing session is never closed and its changes are replayed on top of the
saved version; the document address must be reachable from the browser,
which nothing guarantees; the Document Server declares no capability the
portal could check; and the Document Server ships its own copy of the
crypto library, which fixes the container version it writes. The SDK still
refuses to open encrypted files (Common:PrivateRoomEditorNotSupported). The
gating commit of 2026-08-14 named the editor as the reason the feature is
hidden.

## What Changes

- Write down and version the Document Server contract for encrypted files as
  it works: the editor's web client reads the DEK from
  `editorConfig.encryptionKeys`, decrypts the DSE3 container in the browser
  with the crypto library the Document Server ships, saves by uploading a
  container it encrypted with the same DEK, and encrypts every co-editing
  change with the DEK. The contract names the container versions read (2 and
  3) and written (3, decided 2026-10-26 with
  `private-rooms-dse3-header-authentication`), the library build the
  Document Server ships, how the signed token treats the entry, and the
  first Document Server version that implements it.
- Add a Document Server capability check: the client refuses to open an
  encrypted file (with a localized message) when the connected Document
  Server does not support encrypted editing, instead of showing ciphertext.
- Allow co-editing of encrypted files (decided 2026-10-29): each co-editor
  unwraps the DEK from their own access entry, and the Document Server relays
  and stores only encrypted changes. The client stops clearing the
  unconsumed `canCoAuthoring` flag.
- Make a saved encrypted file open again, on the portal alone: while the
  Document Server still holds the editing session, the editor gets the base
  that session started from; once it is gone, a fresh session starts from the
  latest save. Unsaved edits keep surviving a reopen while the session lasts.
- Fail closed on a save without the encrypted flag: the server keeps the
  previous encrypted version instead of storing ciphertext as plaintext.
- Keep the document address of an encrypted file reachable from the user's
  browser, since the editor downloads it there.
- Define the policy for every editor action on an encrypted file. Download-as
  and save-copy-as are allowed (decided 2026-10-29): the editor builds a DOCX
  or PDF in the browser and saves a decrypted copy on the user's device, and
  no copy is stored in the portal or converted by the Document Server. Print
  is allowed; version history is withheld in v1.
- Define the policy for encrypted PDF forms, from a live run and the server
  code on 2026-10-29: creating, editing and filling a form as an edit work in
  a private room; the editor's save keeps the form flag of the container (it
  drops it today); a form submission into form-data collection (a
  form-filling room) is refused for encrypted files, because the server would
  store the result unencrypted and report its field values in plaintext;
  "Share to fill out" is hidden in a private room (decided 2026-10-29), since
  it only moves the form out of the room; role-based filling in a private
  virtual data room stays open until it is verified.
- Let the SDK open encrypted files once the capability check passes.
- Write the contract down as `contract-v1.md` in this change folder (draft
  of 2026-10-29, from the add-on code of build 10.0.0.133, the server code
  and the live run), with numbered obligations for the Document Server
  (DS-1 to DS-16), the portal server (P-1 to P-8) and the client, so the
  Document Server team can sign off item by item.
- Stamp the crypto bundle (library version and source commit as a banner
  and as exported constants), export the form-flag constant, and hand the
  editor developers a 2.1.0 build with a corrected integration guide, the
  contract and the browser test page (done 2026-10-29, sending pending).
- Make the add-on fail closed with distinct errors when the library or
  WebCrypto is missing or the container version is unknown, instead of
  staying off silently.
- Keep the client's PDF-form flag check a verbatim mirror of the server's
  classifier (compared 2026-10-29), and state in the encryption-core spec
  that the flag means what the server would decide from the plaintext.
- Add the missing test coverage: an MSW `openedit` mock for an encrypted
  file, doceditor unit tests for the key path and the action policy, a client
  E2E that opens an encrypted file, the SDK editor E2E un-fixmed, and a
  recorded run of save, reopen and co-editing against a real Document Server.

**BREAKING** for testers: an encrypted file no longer opens against a
Document Server that does not support encrypted editing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: the DEK hand-off gets a declared
  contract and capability check; co-editing of encrypted files is allowed
  and the co-authoring flag requirement is removed; a saved encrypted file
  reopens without replaying its changes; the document address stays
  reachable from the browser; the "no encrypted-specific handling" and "no
  Document Server version" requirements are replaced by explicit action
  policies and a capability requirement; the SDK refusal becomes conditional
  on the capability.
- `private-rooms/encryption-core`: "PDF form flag in the header" states the
  rule the flag follows (the server's plaintext classifier applied to the
  first 300 bytes) and its edge case.

## Impact

- Client: `packages/doceditor/src` (key hook, editor config, editor events,
  save-as handling, actions), `packages/sdk/src/app/(personal-files)` docs
  layout, shared settings store (Document Server capability), locales.
- Server (`../server`): editor configuration (the document address of an
  encrypted file, the document key after an encrypted save), the Document
  Server capability, the refusal of encrypted form submissions into
  form-data collection, and whether the signed configuration keeps the
  caller's key-pair list. The server already refuses to convert encrypted or
  private-room files.
- Document Server team: owns the contract, the end of an encrypted editing
  session, the form flag on save, and the crypto library build each release
  ships. Nothing in this
  change can be archived until that team confirms the contract and names the
  release that ships it.
- Shared: the crypto bundle build (`packages/shared/services/encryption/{lib-entry,types,vite.lib.config}.ts`)
  and `bundle-contract.test.ts`; the `build:crypto` script in `packages/client`.
- Tests: `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`,
  `packages/doceditor/__tests__`, `packages/client/__tests__`,
  `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`.

## Out of scope

- Changing the DSE3 wire format (see `private-rooms-dse3-header-authentication`).
- Storing an editor copy (save-as) in a portal folder; copies go to the
  user's device only.
- Removing the `privateRooms` flag (see `private-rooms-release-gate`).

## Decisions taken

Confirmed by the feature owner on 2026-10-29, after the live run:

- Co-editing of encrypted files is allowed.
- Download-as and save-copy-as are allowed as decrypted copies on the user's
  device.
- "Share to fill out" is hidden for a form in a private room.

## Decisions needed

1. The rest of the v1 action policy: print allowed, version history withheld.
   Product owner confirms; the specs below assume it.
2. Whether a Document Server without the capability should block only
   encrypted files or disable private-room creation altogether. The specs
   assume per-file refusal.
3. Who signs off the Document Server contract document and where it lives
   (proposed: `openspec/specs/private-rooms/editor-integration/spec.md`
   Purpose plus a versioned section in the Document Server repository).
   The draft now lives in `contract-v1.md` of this change folder.
4. Whether the Document Server team adopts the recommended change-key
   derivation and associated data (contract DS-12) in the first release or
   later; the client needs no change either way.
5. What the policy is if task 4.4 finds that inserted images reach the
   Document Server or the portal in plaintext: block image insertion for
   encrypted documents until fixed, or hold the release. Owner: feature
   owner with the Document Server team.
