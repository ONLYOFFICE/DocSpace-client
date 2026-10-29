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
`encryptedEditBuffer.ts`) was implemented in this repository and later
removed. The branch then assumed Document Server-side decryption; the run
below shows that the decryption happens in the browser after all, inside
the Document Server's own web client rather than in this repository's page.

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

### Observed on 2026-10-29

A live run on the local Aspire stack against Document Server 10.0.0 build 133,
developer edition (`onlyoffice/4testing-documentserver-de:10.0.0.133`), with
JWT enabled for the browser and for requests. The editor code was read in
the deployed bundles: `web-apps/apps/documenteditor/main/app.js` and the
crypto add-on in `sdkjs/word/sdk-all-min.js` (`Asc.Addons.crypto`). The public
`ONLYOFFICE/sdkjs` `develop` branch on GitHub (last commit 2026-05-26) does
not contain this code.

- **Key hand-over.** `web-apps` passes `editorConfig.encryptionKeys` to the
  core as the document info's encrypted info. The add-on sets `userId` on it
  and, in a browser or whenever `dek` is present, starts its web crypto path,
  which reads only `dek` (base64) and imports it as an AES-GCM key.
  `cryptoEngineId` is not read. In the desktop application without `dek` it
  hands the whole entry to the application with the command
  `portal:cryptoinfo` instead.
- **Crypto library.** The add-on calls `window.OnlyofficeCrypto`
  (`decryptFile`, `encryptFile`, `isDSE3Format`), which the Document Server
  ships as its own copy of this repository's library at
  `sdkjs/common/crypto/onlyoffice-crypto.js`. That copy reports
  `VERSION_DSE3_FILE = 2`. Without the library or WebCrypto the add-on stays
  off without an error. The copy is the bundle handed to the editor
  developers on 2026-07-01, built from commit 8d6e613ce12: every function
  that commit added is in it and nothing later is, and it differs from the
  handed-over file only by a removed class-field declaration (`code;` in
  `CryptoError`), which does not change behaviour. Since then the bundled
  sources changed in three commits: c059f17c3bc (2026-07-22, recovery kit,
  not used by the editor), ff9f51aeffb (2026-09-01, the DSE3 form flag) and
  9f73ecc9094 (2026-10-23, an error class the client alone uses). The bundle
  carries no version stamp; it was identified by comparison with the history.
- **Open.** The editor frame downloads `document.url` itself
  (`filehandler.ashx?action=stream`, with `stream_auth` and `origin`) and
  decrypts it in the browser; the file name comes from the container header.
  In the run `document.url` was built from the portal address for requests
  from the Document Server (`docServicePortalUrl`,
  `http://host.docker.internal:8092/` on the local stack, read from
  `GET files/docservice` and the `openedit` response), which the browser
  could not reach until the host mapped that name to loopback.
- **Token.** The Document Server accepted the configuration although the
  signed `encryptionKeys` (the key-pair list) differs from the
  `{ dek, cryptoEngineId }` beside it, and it read the DEK from the unsigned
  part. In the bundle the entry is read only when the add-on starts and is
  not part of any message to the Document Server server (read in the code;
  the socket traffic was not captured). The signed token carries the key
  pairs, `privateKeyEnc` included, to the Document Server.
- **Save.** Ctrl+S and the Save button in the header both build the file in
  the browser, encrypt it with `encryptFile` under the same DEK and the real
  file name, and post it to the Document Server's `savefile` endpoint
  (`forcesavetype=1`). The portal stored a new version: DSE3, version byte 2,
  encrypted flag set, readable with the existing access entries.
- **Co-editing.** Two sessions edited the same encrypted file in real time.
  Each change is sent as `ENCRYPTED;` plus base64 of a random 12-byte IV and
  the AES-GCM ciphertext of `DECRYPTED;` plus the change. The Document
  Server's change store held 26 of 26 and 38 of 38 changes with that marker,
  and none contained the typed text.
- **Session end.** After a save and closing every editor, the Document
  Server kept the session (task status 0) and all its changes for more than
  three minutes and logged no assembly; the portal kept returning the same
  document key from `openedit`. Opening the file again downloaded the saved
  version as the base and replayed the kept changes on it: the editor
  reported "An error has occurred while opening the file" and the Document
  Server logged `clientLog: changesError`. Reproduced on two files, with both
  ways of saving. The edit history (`files/file/{id}/edit/history`) listed
  only version 1, and `edit/diff` returned no `changesUrl` for either
  version.
- **Download-as and save-copy-as.** The editor offers DOCX and PDF only.
  The core's download-as checks the add-on first: for those formats the
  add-on builds the file in the browser and saves it to the device, so
  neither the Document Server conversion nor `onRequestSaveAs` is reached
  (read in the bundle, not executed). Print builds the PDF in the browser too.
- **Forms.** A PDF form created in the private room ("New PDF form") is a
  DSE3 container whose header flags carry both the encrypted-name and the
  form bit (`0x03`), and `GET files/file/{id}` reports `isForm: true`. Both
  private rooms on the stack are custom rooms (`roomType` 5); for the form
  the editor configuration gave `edit: true`, `fillForms: false`,
  `submitForm.visible: false`, `startFilling: true` and
  `startFillingMode: 1` (Share to fill out). "Share to fill out" offered
  only "Form data collection" (a form-filling room, with an XLSX of the
  responses) and "Recipient role-based filling" (a virtual data room); both
  take the form out of the private room. A field added in the edit mode and
  saved produced a new encrypted version whose header flags were `0x01`: the
  add-on calls `encryptFile` with `dek` and `fileName` only, and its library
  copy predates the form flag (ff9f51aeffb), so the form bit is lost on every
  save, while the API still reported `isForm: true`. Reading is unaffected:
  the copy opened the form whose header flags were `0x03`.
- **Capability.** The Document Server publishes no capability endpoint
  (`info/info.json` answers 404). Two signals exist: `Asc.Addons.crypto` in
  the editor frame, and `sdkjs/common/crypto/onlyoffice-crypto.js` under the
  Document Server address, which answers 200 with and without the build hash.

### Server form handling, read on 2026-10-29

Read through CodeGraph in `../server/products/ASC.Files` (files changed after
the last index were read on disk):

- "Private" is a flag on a room of any type (`Core/Core/Entries/Folder.cs:249`,
  `Server/ApiModels/RequestDto/CreateRoomRequestDto.cs:131`); creating a
  private room checks only that the creator holds encryption keys
  (`Core/Core/FileStorageService.cs:1164-1185`), so a private form-filling
  room or virtual data room is accepted by the API. Both private rooms the
  client created on the stack are custom rooms.
- Fill rights exist only in form-filling rooms, virtual data rooms and the
  user's own folder (`Core/Helpers/DocSpaceHelper.cs:81-82`, enforced in
  `Core/Core/Security/FileSecurity.cs:1741`). Start filling, the filler's
  draft and the editor's start-filling and submit settings have no private or
  encrypted check (`Core/Services/DocumentService/DocumentServiceHelper.cs:590-650`,
  `Core/Utils/EntryManager.cs:1304-1440`, `Server/Api/EditorController.cs:258-362`,
  `Core/Services/DocumentService/Configuration.cs:917-929`). The only
  encrypted branch of the editor permissions switches editing off for an
  encrypted file outside a private room (`DocumentServiceHelper.cs:268-274`).
- A submission is a force-save callback with the user-submit type
  (`Core/Services/DocumentService/DocumentServiceTracker.cs:40-83`, `473-476`).
  In a form-filling room it is saved as a new file in the done folder without
  the encrypted flag (`EntryManager.cs:2339-2366`, `Core/Core/Entries/File.cs:319`),
  and the responses report downloads `formsDataUrl`, the field values the
  Document Server produces, indexes them and builds an XLSX from them
  (`Core/Helpers/FormFillingReportCreator.cs:54-68`, `413-430`;
  `Core/Services/DocumentBuilderService/FormFillingReportBuilder.cs:52-110`);
  a failure there is only logged (`EntryManager.cs:2439-2441`). In a virtual
  data room only the final role's submit saves the stream into the same file,
  keeping the encrypted flag, and no content is read (`EntryManager.cs:2507-2570`,
  `2535-2541`). Fillers get the embedded editor type
  (`DocumentServiceHelper.cs:644-646`).
- A plain save of a form follows the regular save path and keeps the
  encrypted flag (`DocumentServiceTracker.cs:229-262`, `EntryManager.cs:1588-1591`).

## Goals / Non-Goals

**Goals:**
- One document that both repositories and the Document Server team agree on,
  versioned, referenced from the editor configuration.
- The client never shows ciphertext: it refuses to open when the capability
  is missing.
- Encrypted files co-edit through encrypted changes, and a saved encrypted
  file opens again.
- Every editor action has a decided behaviour for encrypted files.
- Test coverage exists for the key path and the open flow, and the parts
  only a real Document Server can show are recorded runs.

**Non-Goals:**
- Storing an editor copy (save-as) in a portal folder.
- Encrypted version diffs.
- Changing the DSE3 format.

## Decisions

1. **Decryption happens in the Document Server's web client, in the
   browser.** Observed on 2026-10-29: the editor frame decrypts and
   re-encrypts with the library copy the Document Server ships, and neither
   the DEK nor plaintext reaches the Document Server server. The branch had
   assumed server-side decryption (`DocumentServiceTracker.cs` accepts
   `fileData.Encrypted`); the callback flag still holds, since the saved
   container arrives encrypted. Alternative: restore this repository's buffer
   mode; unnecessary, the editor already does it.

2. **Capability declared by the server, not probed by the client.** The server
   already knows the Document Server it talks to; it exposes a boolean (for
   example in the files settings payload) that the client reads once. Until
   the Document Server team publishes a signal, the server derives it from the
   crypto library path (`sdkjs/common/crypto/onlyoffice-crypto.js` answering
   200 under the Document Server address). Alternative: the client probes the
   Document Server directly, which breaks with proxies and the SDK.

3. **Co-editing allowed (decided 2026-10-29).** The Document Server encrypts
   every change with the DEK and stores only ciphertext, and each co-editor's
   doceditor unwraps the DEK from that member's own access entry, so
   co-editing keeps the end-to-end property. Alternative considered and
   dropped: a single-user co-editing configuration from the server, which
   would only remove a working feature. The client stops clearing
   `canCoAuthoring`, which the Document Server does not read.

4. **Action policy in v1: decrypted copies on the device, print, no history.** Download-as and save-copy-as are allowed (decided
   2026-10-29) because the editor builds them in the browser and saves them to
   the device; nothing plaintext reaches the portal or the Document Server.
   The doceditor still refuses `onRequestSaveAs` for an encrypted file, so a
   Document Server build that ever converted on the server could not post a
   plaintext copy into a folder: the server refuses to convert an encrypted
   or private-room file (`FileSecurity.cs:1894-1914`,
   `FileConverter.cs:306-309`), but `POST files/file/{fileId}/copyas` inserts
   a converted copy with only a create-rights check
   (`FilesControllerHelper.cs:263-280`, `FileConverter.cs:643-654`). Print is
   local to the session. Version history is withheld: the client withholds
   version operations for encrypted files, the edit history lists no saved
   version, and there is no `changesUrl` to show. Forms follow D9.

5. **Contract version travels in the configuration.** A small integer next to
   `dek` and `cryptoEngineId`; the Document Server ignores versions it does
   not know and reports an error instead of opening ciphertext.

6. **The Document Server reads DSE3 versions 2 and 3 and writes version 3
   (decided 2026-10-26).** `private-rooms-dse3-header-authentication`
   authenticates the header fields in a version-3 container and keeps
   version-2 files readable without migration. The Document Server decrypts
   and encrypts with its own copy of this repository's library, which writes
   version 2 in build 10.0.0.133, so the container version is a property of
   the library build each Document Server release ships. The contract names
   that build; a portal that writes version 3 needs a Document Server that
   ships a library reading it, or the editor cannot open those files. Build
   10.0.0.133 ships the bundle of 2026-07-01 (commit 8d6e613ce12). The bundle
   gets a build stamp (library version and source commit), so the contract
   and a running editor can name the build instead of comparing files.

7. **A saved encrypted document reopens from a matching base.** The editor
   takes its base from `document.url` while the Document Server replays the
   session's changes, so the base must be the version the session started
   from, and the session must end once its changes are saved. Options:
   (a) the server binds `document.url` of a session to the version it started
   from, so a member who rejoins after a save gets a consistent base, and the
   Document Server closes the session once the last editor leaves and drops
   the changes an encrypted save already contains, after which the server
   issues a new document key; (b) the server issues a new document key right
   after storing an encrypted save, which fixes a reopen but splits members
   still editing into two sessions. Chosen: (a), with the Document Server team
   for the session end; the backend looks up how the document key and
   `document.url` are produced (CodeGraph) before choosing the mechanism.

8. **The document address of an encrypted file is a public address.** The
   editor downloads it in the browser, so the server builds it from the
   portal's public address, not from the address meant for requests from the
   Document Server. The backend looks up where the address is built
   (CodeGraph) before changing it.

9. **PDF forms: fill as an edit, no form-data collection, no "Share to fill
   out".** Filling a form in the edit mode of a private room works and its
   save stays encrypted, so it is allowed. Submission into a form-filling room
   is refused for encrypted files: the server would store the result as an
   unencrypted file nobody holds a key for, and its responses report needs the
   field values in plaintext. The refusal sits on the server (the backend
   chooses between refusing an encrypted submission and refusing a private
   form-filling room, after reading the code). "Share to fill out" is hidden in
   a private room (decided 2026-10-29), since both its destinations take the
   form out of the room. The editor's save must keep the form flag; that is a
   contract item for the Document Server team, in two parts: a bundle built
   after ff9f51aeffb, and the add-on passing the form flag of the container it
   opened to `encryptFile` when it saves.
   Role-based filling in a private virtual data room is server-compatible but
   unverified in the editor, and stays an open question.

## Risks / Trade-offs

- [Document Server does not implement the contract on the planned release
  train] → the capability check keeps encrypted files closed; private rooms
  remain usable as encrypted storage, and the release gate stays shut.
- [JWT signed before the client injects `encryptionKeys`] → observed: the
  Document Server accepts the configuration and reads the DEK from the
  unsigned part, so the DEK stays out of the token and off the Document Server
  server. The token still hands the key pairs, `privateKeyEnc` included, to
  the Document Server; whether the server keeps them there is an open
  question below.
- [DEK handed as a base64 string to a third-party iframe] → accepted for v1,
  recorded in `private-rooms/encryption-core`; the editor runs same-origin
  through the Document Server proxy.
- [Decrypted copies on users' devices] → accepted by the feature owner on
  2026-10-29; the copy is what the user already sees in the editor.
- [The library copy in the Document Server drifts from this repository] →
  the contract names the build; `private-rooms-dse3-header-authentication`
  waits for a Document Server that reads version 3.
- [Edits left unsaved when the last editor leaves exist only as encrypted
  changes in the Document Server, which cannot build a file from them] →
  open question below; until it is answered, users save explicitly.
- [A private form-filling room created through the API accepts submissions
  today] → task 5.4 makes the server refuse them; until then the client does
  not create such rooms.
- [The form flag is lost on every editor save] → contract item; the API kept
  `isForm` in the run, so the form stays a form in the portal meanwhile.
- [Withholding actions confuses users] → menu items are absent, not greyed;
  the room header shows the private badge.

## Migration Plan

1. Land the capability flag on the server with a default of `false`.
2. Land the client refusal path; behind the feature flag nothing changes for
   ordinary users.
3. When the Document Server version ships, flip the capability on staging,
   run the new E2E suite and the recorded runs, then production.
4. Rollback: turn the capability off; encrypted files stop opening in the
   editor but remain downloadable.

## Open Questions

- Desktop application: the desktop's new crypto engine
  (`{DC522726-5E0E-43E5-AA02-8EA156BECBC5}`, see
  `private-rooms-remove-dead-api-calls` design) runs the editor inside the
  desktop. Observed on 2026-10-29: without `dek` the editor hands the key
  pairs to the application (`portal:cryptoinfo`); with `dek` it takes the
  web path. Which of the two the new engine expects is for the desktop
  developer. Until it is answered the editor page runs the same key path in
  the desktop as in the browser.
- Should the server keep the caller's key-pair list, with `privateKeyEnc`, in
  `editorConfig.encryptionKeys` and in the signed token at all, given that the
  web editor reads only `dek` and the Document Server server does not need
  the encrypted private key? Owner: backend team with the Document Server team.
- How does the Document Server end an encrypted editing session: does it
  close it after the last editor leaves, drop changes that a save already
  contains, and send a final callback? What happens to unsaved encrypted
  changes when the session cache expires (`expire.files` is 86400 seconds in
  build 133)? Owner: Document Server team.
- Which build of the crypto library does each Document Server release ship,
  and when does a build that reads and writes DSE3 version 3 ship? Owner:
  Document Server team, together with
  `private-rooms-dse3-header-authentication`.
- Does the community or enterprise edition carry the crypto add-on, or only
  the developer edition, and from which release? This sets the minimum
  Document Server version. Owner: Document Server team.
- Will the Document Server publish a capability signal (health check or
  settings) to replace the library-path probe? Owner: Document Server team.
- Role-based filling in a private virtual data room: does the encrypted
  editor work in the embedded mode fillers get, and does every filler hold an
  access entry for the form? A private virtual data room can only be created
  through the API today. To be verified on a Document Server with the crypto
  add-on before a policy is set.
