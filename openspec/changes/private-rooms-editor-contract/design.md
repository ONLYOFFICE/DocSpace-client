# Design

## Context

See proposal.md for motivation. Today the doceditor resolves the DEK in the
browser (`packages/doceditor/src/hooks/useFileEncryptionKeys.ts:185-203`) and
injects `{ dek, cryptoEngineId }` into `editorConfig.encryptionKeys` with
`Object.assign` (`packages/doceditor/src/components/Editor.tsx:262-266`)
because the field is not part of the `@onlyoffice/document-editor-react`
typings. The server adds the caller's key pairs for private-room files
(`server/products/ASC.Files/Server/Api/EditorController.cs:311`,
`Configuration.cs:263`) and signs the configuration before the client adds
the DEK. Co-editing is only a client flag (`packages/doceditor/src/utils/actions.ts:829`);
the server's co-editing configuration (`Configuration.cs:317-326`) does not
look at the encrypted flag. The AI bridge is already disabled for encrypted
files (`packages/doceditor/src/hooks/useEditorEvents.ts:317-319`).

The stashed design documents (May–July 2026) all declare the editor out of
scope: AUDIT_FRONTEND/BACKEND "Out of scope: integration with
DocumentService / the editor", SDK_PRIVATE_PLAN §3 decision #8 "the editor
decrypts in its own (future) encryption infrastructure". The ARCHITECTURE.md
and DEVELOPMENT_PLAN_V2 design of an in-browser buffer mode
(`docEditor.openDocument(buffer)`, `document.url = "__data__"`,
`encryptedEditBuffer.ts`) was implemented and later removed; the branch now
assumes Document Server-side decryption, a contract nobody has written down.

## Goals / Non-Goals

**Goals:**
- One document that both repositories and the Document Server team agree on,
  versioned, referenced from the editor configuration.
- The client never shows ciphertext: it refuses to open when the capability
  is missing.
- Co-editing genuinely restricted, not flagged.
- Every editor action has a decided behaviour for encrypted files.
- Test coverage exists for the key path and the open flow.

**Non-Goals:**
- Multi-user encrypted co-editing (requires per-session key exchange in the
  Document Server; v2 at the earliest).
- Encrypted save-as / download-as / version diffs (withheld in v1).
- Changing the DSE3 format.

## Decisions

1. **Decryption stays in the Document Server (not the browser buffer mode).**
   Alternatives: (a) restore the removed buffer mode, where the browser
   decrypts and feeds bytes to the editor; (b) Document Server decrypts with
   the DEK from the configuration. (b) is what the branch and the server
   callback already assume (`DocumentServiceTracker.cs` accepts
   `fileData.Encrypted`), and it keeps co-editing possible later. (a) would
   need re-encryption on every save in the browser and a new save channel.
   Chosen: (b), with the explicit caveat that the Document Server team must
   confirm it.

2. **Capability declared by the server, not probed by the client.** The server
   already knows the Document Server version it talks to; it exposes a boolean
   (for example in the files settings payload) that the client reads once.
   Alternative: the client probes the Document Server directly, which breaks
   with proxies and the SDK. Chosen: server-declared capability.

3. **Co-editing restriction via the server co-editing configuration.** The
   server emits a single-user co-editing mode for encrypted files; the
   Document Server then grants view mode to a second session. Alternative:
   client-side lock on the file record; rejected because it cannot stop a
   second client. The `canCoAuthoring` flag stays only for backward
   compatibility.

4. **Action policy in v1: withhold save-as, download-as, version history and
   form submission; keep print.** Save-as and download-as would route
   plaintext through the Document Server output address into arbitrary
   folders (the save-as handler posts a Document Server URL to the file
   creation endpoint); the server already forbids conversion into and out of
   private rooms, so a visible action that silently fails is worse than no
   action. Print is local to the session. Version history is withheld in the
   client already, so the editor follows. Alternative: implement encrypted
   save-as (decrypt, re-encrypt with a new DEK, upload through the encrypted
   session); deferred to a later change.

5. **Contract version travels in the configuration.** A small integer next to
   `dek` and `cryptoEngineId`; the Document Server ignores versions it does
   not know and reports an error instead of opening ciphertext.

## Risks / Trade-offs

- [Document Server does not implement the contract on the planned release
  train] → the capability check keeps encrypted files closed; private rooms
  remain usable as encrypted storage, and the release gate stays shut.
- [JWT signed before the client injects `encryptionKeys`] → the contract must
  state whether the field is outside the signed payload; if the Document
  Server validates the whole configuration, the server would have to sign
  after the client supplies the DEK, which moves the DEK through the server
  (unacceptable) or requires a two-step token. Open question below.
- [DEK handed as a base64 string to a third-party iframe] → accepted for v1,
  recorded in `private-rooms/encryption-core`; the editor runs same-origin
  through the Document Server proxy.
- [Withholding actions confuses users] → menu items are absent, not greyed;
  the room header shows the private badge.

## Migration Plan

1. Land the capability flag on the server with a default of `false`.
2. Land the client refusal path; behind the feature flag nothing changes for
   ordinary users.
3. When the Document Server version ships, flip the capability on staging,
   run the new E2E suite, then production.
4. Rollback: turn the capability off; encrypted files stop opening in the
   editor but remain downloadable.

## Open Questions

- How does the Document Server read `editorConfig.encryptionKeys` in a web
  session, and is the field covered by the token signature? Owner: Document
  Server team. The answer changes the token-handling scenario only.
- Does the save callback return a container encrypted with the same DEK or a
  new one? Owner: Document Server team. If a new DEK, the server must receive
  a new wrap set from the client, which is a larger change.
- Minimum Document Server version. Owner: Document Server team.
