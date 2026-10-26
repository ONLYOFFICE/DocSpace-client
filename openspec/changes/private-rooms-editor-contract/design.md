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
the DEK. The signature covers that field: the token is computed over the
whole configuration DTO (`ConfigurationDto.cs:592`,
`result.Token = documentServiceHelper.GetSignature(result)`), whose
`editorConfig.encryptionKeys` is the caller's key-pair list
(`ConfigurationDto.cs:639`), each entry carrying `publicKey`,
`privateKeyEnc` (the caller's encrypted private half) and `cryptoEngineId`
(`EncryptionKeyDto.cs`). The client then overwrites the field with
`{ dek, cryptoEngineId }`, so the signed value and the value in the
configuration differ in shape and content. Co-editing is only a client flag (`packages/doceditor/src/utils/actions.ts:829`);
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

The editor developers received the private-rooms crypto on 2026-07-01 as
`onlyoffice-crypto.js` (the IIFE bundle built from
`packages/shared/services/encryption/lib-entry.ts`, global
`window.OnlyofficeCrypto`) with an integration guide in which the editor
unlocks the identity itself and talks to the DocSpace API directly. Read
against `../server` on 2026-10-20, three statements of that guide do not match
the server:

- It writes access entries with `PUT files/file/{fileId}/access`; the route is
  `PUT files/{fileId}/access` (`Server/Api/FilesController.cs`,
  `SetEncryptionInfoAsync`), so the guide's request answers 404.
- It reads `senderPublicKey` and `senderUserId` from each entry of
  `GET files/{fileId}/access`; `FileKeysDto` has neither (`userId`,
  `publicKeyId`, `privateKeyEnc`, `tenantId`, `fileId`, `createOn`) and the
  entries sit under the `response` envelope. The sender is named inside the
  wrap and its public key comes from `files/file/{fileId}/publickeys` or the
  room roster, as the client does.
- It writes key pairs without an id (`POST` and `PUT privacyroom/keys` with
  only `publicKey` and `privateKeyEnc`). `EncryptionKeyRequestDto.Id` has no
  default, so such a pair is stored with the all-zero id and a later `PUT`
  without an id replaces only that pair; it answers 404 for a pair the web
  client created with its own id.

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
   creation endpoint). The server refuses to convert an encrypted file or a
   file in a private room (`FileSecurity.cs:1894-1914` deny `Convert` there,
   `FileConverter.cs:306-309` disables conversion of encrypted files), but it
   does not stop converted or plaintext output from being written into a
   folder: `POST files/file/{fileId}/copyas` converts a readable source and
   inserts the result into the destination (`FilesControllerHelper.cs:263-280`)
   with only a create-rights check (`FileConverter.cs:643-654`), and the
   upload path has no private-room check (`FileUploader.cs:61-125`). Nothing
   on the server therefore keeps the Document Server's plaintext output out
   of an ordinary folder or out of a private room, which is why both actions
   are withheld in the editor. Print is local to the session. Version history is withheld in the
   client already, so the editor follows. Alternative: implement encrypted
   save-as (decrypt, re-encrypt with a new DEK, upload through the encrypted
   session); deferred to a later change.

5. **Contract version travels in the configuration.** A small integer next to
   `dek` and `cryptoEngineId`; the Document Server ignores versions it does
   not know and reports an error instead of opening ciphertext.
6. **The Document Server reads DSE3 versions 2 and 3 and writes version 3
   (decided 2026-10-26).** `private-rooms-dse3-header-authentication`
   authenticates the header fields in a version-3 container and keeps
   version-2 files readable without migration. No Document Server build
   decrypts DSE3 yet, so the contract asks for both versions from the start
   instead of adding version 3 to a shipped parser later.

## Risks / Trade-offs

- [Document Server does not implement the contract on the planned release
  train] → the capability check keeps encrypted files closed; private rooms
  remain usable as encrypted storage, and the release gate stays shut.
- [JWT signed before the client injects `encryptionKeys`] → today the server
  signs the field as the caller's key-pair list, including the encrypted
  private half, so a Document Server that validates the token against the
  configuration sees a different value than the `{ dek, cryptoEngineId }`
  the client sends, and the token itself hands the encrypted private key to
  the Document Server. The contract must state whether the field is outside
  the signed payload; if the Document
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

- Desktop application: the desktop's new crypto engine
  (`{DC522726-5E0E-43E5-AA02-8EA156BECBC5}`, see
  `private-rooms-remove-dead-api-calls` design) runs the editor inside the
  desktop. Does it take the editor configuration's `{ dek, cryptoEngineId }`
  hand-over as a web session does, or unwrap the DEK itself from the key pair
  the desktop bridge passes at login? Owner: the desktop developer. Until it
  is answered the editor page runs the same key path in the desktop as in the
  browser.

- How does the Document Server read `editorConfig.encryptionKeys` in a web
  session, and does it validate the field against the token? Owner: Document
  Server team. The answer changes the token-handling scenario only. (On the
  portal side the field is signed today, as the key-pair list; see Context.)
- Should the server keep the caller's key-pair list, with `privateKeyEnc`, in
  `editorConfig.encryptionKeys` and in the signed token at all, given that the
  client replaces the field and the Document Server does not need the
  encrypted private key? Owner: backend team with the Document Server team.
- Does the save callback return a container encrypted with the same DEK or a
  new one? Owner: Document Server team. If a new DEK, the server must receive
  a new wrap set from the client, which is a larger change.
- Minimum Document Server version. Owner: Document Server team.
