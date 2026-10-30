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
  A bundle built from the current source on 2026-10-29 differs from the copy
  by 51 lines, all from those three commits. Until 2.1.0 the
  `DSE3_FLAG_IS_FORM` constant was not exported from the bundle entry,
  although `parseDSE3Header` already reported `isForm`.
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

### Read in the add-on code, 2026-10-29

The crypto add-on of build 10.0.0.133, read in `sdkjs/word/sdk-all-min.js`
(the same code sits in the `cell` and `slide` bundles; `sdkjs/pdf/sdk-all-min.js`
answers 404 and the PDF paths load `pdf/src/engine/drawingfile.js` on demand).
Minified names are left out; the behaviour is what the contract
(`contract-v1.md`) is written against.

- **Entry.** The core hands the encryption keys entry to one function. With
  `AscDesktopEditor` present and `dek` undefined it creates the desktop engine
  and sends `portal:cryptoinfo` with the whole entry; otherwise it creates the
  web engine, which starts only when `dek` is defined and, after the editor is
  ready, only when `window.OnlyofficeCrypto` and `crypto.subtle` exist. It
  then imports `dek` (base64) as a non-extractable AES-GCM key, sets the crypto
  mode to 1 and switches the collaborative-editing layer to encrypted changes.
  Nothing else in the entry is read. Without the library or WebCrypto nothing
  happens and no error is raised.
- **Open.** The engine fetches the document address itself. Bytes with a
  plaintext signature (ZIP, `DOCY`, `XLSY`, `PPTY`, `VSDY`, `%PDF`, `AT&T`, or
  the core's own detectors) are passed through undecrypted; otherwise
  `isDSE3Format` decides, `decryptFile(bytes, dek)` returns the data and the
  name, the name is published as the document name, and the decrypted bytes are
  kept for the save path. A rejected promise answers `null`, which the core
  reports as an open error. A decrypted PDF whose first 4096 bytes carry
  `/ONLYOFFICEFORM [ <len> <size> ]` followed by `stream\r\n` has its
  embedded form source extracted and is opened as a form.
- **Save.** `buildCryptoFile_Start` takes the package the core built (for a
  form or a PDF in the viewer, a PDF built in the browser with `BuildPdf`),
  replaces every `media/*` entry with its plaintext bytes (from the image
  cache, or decrypted when stored as an `ENCRYPTED;` string or a DSE3 blob),
  calls `encryptFile(bytes, { dek, fileName })` with the document name, and
  uploads the result through the core's save upload; a failed upload raises
  the core's save error. `isForm` is not passed.
- **Changes.** `encryptData` maps each change to `"ENCRYPTED;"` plus base64 of
  a random 12-byte IV and the AES-GCM ciphertext of `"DECRYPTED;"` plus the
  change, keeping outer quotes outside; `decryptData` reverses it and marks
  the batch failed when the prefix is missing or decryption throws. No
  associated data is used and the key is the file's DEK.
- **Download-as.** PDF and PDF/A are built in the browser and saved to the
  device; docx, docm, dotx, xlsx, xlsm, xltx, pptx, pptm, potx, ppsx and vsdx
  take the package built in the browser to the device; any other target
  returns to the core's generic path.
- **Images.** Pasted or chosen images become `cryptoimg://<n>.<ext>` entries
  with their bytes kept in memory; an image address fetched for display is
  decrypted when it starts with `ENCRYPTED;`. Whether an inserted image reaches
  the Document Server's media store in plaintext is not visible in the add-on
  and was not exercised in the run.
- **Capability.** `Asc.Addons.crypto` is set to true when the add-on is
  bundled; the engine's "has crypto" check is `!!window.OnlyofficeCrypto`.

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
- **Form classification.** `FileChecker.CheckExtendedPDFstream`
  (`Core/Utils/FileChecker.cs:57-71`) reads the first 300 bytes: a DSE3 magic
  answers from bit `0x02` of byte 6; otherwise `IsExtendedPDFFile`
  (`:96-143`) requires the PDF binary comment `%\xCD\xCA\xD2\xA9\r`,
  then exactly `1 0 obj\n<<\n`, then the configured signature
  (`files:oform:signature`, `OFormSettings.Signature`,
  `Core/Services/OFormService/OFormSettings.cs`; `ONLYOFFICEFORM` in buildtools
  `config/appsettings.json`) before `stream\r\n`, followed by ` [ ` and two
  space-terminated numbers. `FileDao.SaveFileAsync`
  (`Core/Core/Dao/TeamlabDao/FileDao.cs`) runs it for a `.pdf` title only while
  the file's category is still unset and then sets the PdfForm category, so a
  classified form keeps the category across versions whatever a later header
  says; `FileUploader.UploadChunkAsync` (`Core/Utils/FileUploader.cs`) runs it
  on the first chunk. The client mirror `pdf-form-signature.ts`
  (`sniffPdfFormBlob`, used by `encrypted-upload.ts` for `.pdf` uploads) is a
  verbatim port with the signature hardcoded; compared on 2026-10-29 at the
  user's request, the two agree on window, markers and order. The Document
  Server add-on is looser (the marker anywhere in 4096 bytes, no first-object
  prefix), so a PDF it treats as a form may be flagged by neither the server
  nor the client; the editor's own forms satisfy all three (observed: flags
  `0x03`).

### Server: document key, document address and session

Task 6.1, read on 2026-10-29 through CodeGraph in `../server/products/ASC.Files`
on release/v4.1.0 (files changed after the last index were read on disk):

- **Document key.** A SHA-256 of the file id, version, creation date and the
  database key (`Core/Services/DocumentService/DocumentServiceHelper.cs:463-478`);
  it is not stored. An editor opening a file whose current version is a
  force-save gets the key of the newest version saved without force-save, the
  stable version (`DocumentServiceHelper.cs:312-319`,
  `Core/Core/EF/Queries/FileQueries.cs:568-597`). A force-save therefore keeps
  the key, and a save that is not a force-save (callback status 2) creates a
  new stable version and so a new key. The file tracker remembers the stable
  key (`Core/Utils/FileTracker.cs:416`, `Core/Utils/EntryManager.cs:1723-1771`),
  but `openedit` does not read it.
- **Document address.** `document.url` is the public portal address with
  `filehandler.ashx?action=stream&fileid=…&stream_auth=…`, built for the
  current version without a `version` parameter
  (`Core/Services/DocumentService/Configuration.cs:225-236`,
  `Core/Helpers/PathProvider.cs:108-132`); `ReplaceCommunityAddress` then swaps
  the host for the portal address meant for Document Server requests when one
  is set (`Core/Services/DocumentService/DocumentServiceConnector.cs:482-524`).
  After a force-save the key names the stable version while the address
  serves the current one, which is the "changesError" of the run. The stream
  action accepts `version` and checks `stream_auth` over id and version; for
  an encrypted file it skips the JWT header check
  (`Core/HttpHandlers/FileHandler.ashx.cs:589`, `603`, `616-626`).
- **Callbacks** (`Core/Services/DocumentService/DocumentServiceTracker.cs:215-270`):
  status 1 tracks the listed users and drops the tracked ones missing from the
  list, so an empty list clears the tracker; a key that does not match the
  stable key drops the users (`272-370`). Status 2 and 3 save as non-force-saves
  and remove the tracker; status 4 removes the tracker without saving; status 6
  and 7 save as force-saves and keep it. A save callback whose key does not
  match goes to a temporary store and is answered "Expected key" (`391-401`).
  The tracker cache lasts 60 seconds; on expiry with users listed the portal
  asks the Document Server `info` for the remembered key and keeps the users
  while it answers without error (`FileTracker.cs:44`, `317-380`).
- **Encrypted force-save** (`EntryManager.cs:1540-1587`): the first force-save
  after a stable version starts a new version group; later ones add versions
  to it, because encrypted versions are not overwritten. Each is marked as a
  user force-save, and the encrypted flag is copied from the callback's
  `encrypted` field, so a callback without it would store the version as not
  encrypted.
- **Commands.** The portal already sends `info` (whether the Document Server
  holds a session for a key, as a yes or no), `drop` and `meta`, and never
  `forcesave` (`Core/Helpers/DocumentService.cs:698-707`,
  `DocumentServiceConnector.cs:95-135`, `DocumentServiceHelper.cs:499-561`).

### Run of 2026-10-29, spreadsheets and presentations (task 4.3)

Same stack and build as the morning run (Document Server 10.0.0.133,
developer edition; portal on localhost:8092), one account ("Administrator")
in two tabs of one Chrome profile. The room's second member has no
credentials in any fixture, so the view-only member of task 4.3 was not
covered (task 4.6). Files were created from the room's "Spreadsheet" and
"Presentation" tiles; the Document Server's change store (`doc_changes`) and
task table (`task_result`) were read in the stack's MySQL, and its log with
`docker logs`.

- **Open and save work in both editors.** The new spreadsheet (file 41) and
  presentation (file 42) opened with their real names, were edited and saved
  with Ctrl+S. The portal stored version 2 of each as DSE3 version 2, suite
  1, flags `0x01`, encrypted flag set (5151 and 30742 bytes); the Document
  Server ran a force-save task (status 2) for each and kept the stable key. A
  third spreadsheet (file 43) reached version 3 after saves from two
  sessions.
- **Changes are stored encrypted in both editors.** Every stored change of
  the three files carried the `ENCRYPTED;` marker behind a leading quote
  (5 of 5, 93 of 93, 9 of 9) and none contained the typed text.
- **Reopening the presentation failed 4 of 4 times** while the Document
  Server held its session: the generic open error, and in its log
  `changesError: Cannot read properties of null (reading 'me')`. The first
  attempt ran beside the original session; the other three after every
  editor had closed.
- **Reopening a spreadsheet failed intermittently, and once with no save
  and no change at all.** Of eight warm-cache opens, five failed and three
  succeeded; the two cold-cache first opens succeeded. The very first open of
  file 43 failed with no other session and an empty change store. Every
  failed spreadsheet open logged first `Uncaught TypeError: Cannot read
  properties of undefined (reading 'base64ToArrayBuffer')` at
  `sdkjs/cell/sdk-all-min.js:2235:111`, the add-on's byte-conversion helper
  reading `window.OnlyofficeCrypto`, then `Cannot read properties of null
  (reading 'Qka')` in `applyChanges` with `isDocumentLoadComplete: false`.
  The sdk injects the library as an `async` script; by the time a failed
  frame was inspected the library was present. Re-navigating the same tab to
  the same file after a failure opened it in both attempts, once after a
  force-save beside the still-open first session, whose changes replayed
  without error.
- **The spreadsheet editor does not apply relayed changes.** Two sessions of
  file 43 in Fast co-editing mode (checked in the Collaboration tab): a cell
  typed in one session never appeared in the other within 10 seconds, in
  either direction, before or after a save, while the other session's cell
  selection was shown and both sessions' changes were stored encrypted. The
  same two-tab test on document 21 (its morning session still alive with one
  unsaved change) relayed text both ways within 5 seconds.
- **Sessions are not ended.** The session of file 41 was still held (task
  status 0, 5 changes) 18 minutes after its last editor closed; files 42 and
  43 likewise.
- Not covered: a view-only member, image insertion (task 4.4), member
  removal (task 4.5), the presentation relay (no second session ever
  opened).

Consequences: D7 is revised below, the contract gains DS-17 and DS-18, task
4.3 is split into 4.3, 4.6 and 4.7, and proposal decision 6 asks whether
spreadsheets and presentations ship before the Document Server fixes land.

### Hand-over package of 2026-10-29

Prepared for the editor developers (task 1.3) in `enc-2.1.0` next to the
folder of the 2026-07-01 hand-over, outside the repository:

- `onlyoffice-crypto.js`, library 2.1.0, built from commit b0a476bd858c with
  `pnpm run build:crypto`; banner `/*! onlyoffice-crypto 2.1.0 b0a476bd858c */`,
  224861 bytes, SHA-256
  `fdeabffff6fc373b85fd5b0e847831536c1bf8b0202da9fd3714d24f1bb9a9d2`.
- `test-bundle.html`, the browser test page of the 2026-07-01 hand-over
  updated for 2.1.0 (stamp, form flag, error classes). It lives in the
  hand-over package only; `bundle-contract.test.ts` is the repository's check
  of the same surface.
- `contract-v1.md`, the draft contract of this change folder.
- `integration-guide.md` (v3) and `CHANGELOG.md` in the editor team's
  language, written from `contract-v1.md`: the editor consumes the DEK only,
  the three corrections to the v2 guide, the form flag on save, the build
  stamp, and the obligations DS-1 to DS-16.

Sent: pending (task 1.5).

### Run of 2026-10-30, Document Server 10.0.2.5

Same stack, one account ("Administrator") in two tabs, Document Server
developer edition 10.0.2.5 (`onlyoffice/4testing-documentserver-de:10.0.2.5`,
files dated 2026-10-27, `DocsAPI.DocEditor.version()` 10.0.2; the portal's
`settings/version/build` reports `documentServer` 10.0.2.5 while
`files/docservice` reports an empty `version`). A fresh Document Server, so
no session survived from 2026-10-29. The bundles were read on disk and the
verified statements are folded into contract-v1.md.

- **Library copy unchanged.** `sdkjs/common/crypto/onlyoffice-crypto.js` is
  byte-identical to the copy of build 133 (223841 bytes, SHA-256
  `58cb7f487f764d029c0a50a101b63c1c1f43f0bed973cfcbcf18490115184c07`): the
  build of 2026-07-01 minus one class-field declaration,
  `VERSION_DSE3_FILE = 2`, no `DSE3_FLAG_IS_FORM`, no `isForm`, no stamp.
  DS-8 stays unmet: `encryptFile` is still called with `dek` and `fileName`
  only.
- **Library loading gated.** The sdk injects the library with a dynamic
  script element and starts the crypto engine in its `onload`; the document
  open waits for the loader counter that script increments. A failed load
  still leaves the add-on silently off (DS-5 unmet). The add-on is also in
  the `visio` bundle.
- **Spreadsheet warm opens 4 of 4** (file 43), against 5 of 8 failures on
  build 133: the first-open part of DS-17 is closed.
- **Joining a held session still races.** A second session of file 43,
  opened while the first held 257 changes, failed with the generic open
  error and `clientLog: changesError: Cannot read properties of undefined
  (reading 'base64ToArrayBuffer')` in the Document Server log (09:12:56Z,
  key `cSirCPxO…`); a retry a minute later, with 3 changes in the session,
  joined and showed them. The change-apply path on join reads the library
  before it has loaded.
- **Live relay works in both directions** (file 43, Fast mode): a cell typed
  in either session appeared in the other within 10 seconds. DS-18 is closed
  by this build.
- **Document reopens after a save.** File 7: typed, Ctrl+S (version 3
  stored, encrypted), left, reopened: the saved content once, no error, the
  same document key, session still held (task status 0, 7 changes).
- **Presentation reopens with duplicated content.** File 42: typed
  " + run 10.0.2.5" into the subtitle, Ctrl+S (version 3, `savefile` 200),
  left, reopened: no error, the same key `zADFt59p…`, session held with 30
  changes, and the subtitle read "… + run 10.0.2.5 + run 10.0.2.5". The
  session's changes were applied on top of the force-saved base. DS-19 in
  the contract; the portal side is P-5.
- **Sessions are not ended** on this build either: files 7, 42 and 43 kept
  task status 0 after every editor left.
- **`info/info.json`** exists on this build but nginx serves it from
  loopback only (`ds-docservice.conf:78-82`); it reports
  `serverInfo.buildVersion` 10.0.2 and `buildNumber` 5 and nothing about
  the crypto library. The 404 recorded on 2026-10-29 came from the portal's
  `/ds/` proxy, which answers the client application for every path, not
  from the Document Server.
- **Not covered:** a second account (every session was the same user),
  images (4.4), member removal (4.5), the presentation relay.

### Server read of 2026-10-30

Read through CodeGraph on `release/v4.1.0` (a782a03fab), confirming the
references of 2026-10-29 (moved: `ReplaceCommunityAddress` is
`DocumentServiceConnector.cs:482-525`, the `openedit` action
`EditorController.cs:253-314`, `FileTracker.cs:417`) and adding:

- **Configuration.** `editorConfig.encryptionKeys` is set only for a file
  located in a private room, from the caller's own key list, unsanitized, so
  `privateKeyEnc` is in it (`EditorController.cs:311-314`,
  `EncryptionKeyPairDto.cs:153-162`, `EncryptionKeyDto.cs:49-87`); the token
  signs the whole DTO (`ConfigurationDto.cs:592`) and nothing changes the
  field afterwards, while other fields are mutated after signing
  (`:595-608`, `EditorController.cs:322-385`). The only encrypted or private
  branches of the configuration: permissions off for an encrypted file
  outside a private room (`DocumentServiceHelper.cs:268-274`),
  `info.favorite` null (`Configuration.cs:509-512`),
  `customization.mentionShare` false (`:905-910`), the go-back link of the
  Privacy section (`:878-883`), `document.isForm` from the DSE3 flag byte
  (`ConfigurationDto.cs:809`). Permissions, `modeWrite`, co-editing,
  force-save, `submitForm`, `startFilling`, plugins and templates never read
  `Encrypted`. `document.url` carries `version=` for a view-only or history
  opening (`Configuration.cs:232`, `PathProvider.cs:121-125`), not for Edit,
  Review or Comment; the note of 2026-10-29 "without a version parameter"
  holds for the editing case only.
- **Tracking.** The web client never calls `trackeditfile`; the tracker is
  kept by the callbacks (status 1 users, `DocumentServiceTracker.cs:272-370`),
  so the current-version-only key check of `TrackEditFileAsync`
  (`FileStorageService.cs:2141`) does not affect encrypted editing.
- **Callbacks.** `TrackerData.Encrypted` is a plain bool parsed from the body
  or the JWT (`FileHandler.ashx.cs:1528-1533`, `1556-1598`); absent means
  false. Changes and history are stored only for non-force-saves (`:567`,
  `SaveHistoryAsync` `:766-800`); `edit/history` and `edit/diff` have no
  encrypted guard and serve the Document Server's diff as stored.
- **Paths that treat ciphertext as plaintext.** `copyas` with the same
  extension copies through `CreateNewFileAsync`
  (`FileStorageService.cs:2025-2063`), which never copies
  `template.Encrypted`, and with another extension inserts the ciphertext
  under the new title (`FilesControllerHelper.cs:263-280`).
  `RestoreVersionAsync` by address saves with `encrypted=false`
  (`:2662-2675`), as do PUT `saveediting` (`:2159-2169`) and the document
  builder (`DocumentBuilderScriptRunner.cs:594`). `FileConverter` refuses
  the conversion (`:306-309`) but `ExecAsync` returns the raw stream
  (`:342-346`) and `ExecSynchronouslyAsync` sends it to the Document Server
  (`:369-391`). Every save publishes an index event whose handler
  base64-encodes the content with no `Encrypted` check (`FileDao.cs:838-843`,
  `IndexEventProcessingService.cs:113-127`, `FactoryIndexerFile.cs:47-60`,
  `FileDao.cs:2914-2975`). `GetReferenceDataAsync` has no encrypted guard
  (`:4756-4830`). Thumbnails are refused (`Builder.cs:328-335`),
  `UpdateToVersionFileAsync` refuses encrypted files
  (`EntryManager.cs:1840-1843`), lock and unlock work
  (`FileStorageService.cs:2485-2560`), mentions see `canShare` false
  (`:5169-5173`).
- **Member removal.** `CheckUsersForDropAsync` runs for file entries only
  (`FileSharing.cs:527-530`, `599-602`); a room security update passes the
  room folder (`FileStorageService.cs:4375-4388`), so open files of the room
  are never dropped; the rights re-check on the next tracking throws without
  a `drop` (`EntryManager.cs:1745-1753`).
- **Capability surface.** `GET files/docservice` returns `DocServiceUrlDto`
  (`DocServiceUrlDto.cs:40-107`) with `version` from `GetVersionsAsync`
  (`DocumentServiceConnector.cs:274-316`, fallback "4.1.5.1");
  `GET files/settings` returns `FilesSettingsDto` with `extsWebEncrypt`
  (`FilesSettingsDto.cs:496`). Probes that already talk to the Document
  Server: `CheckDocServiceUrlAsync` (`:318-480`) and the healthcheck
  (`DocumentService.cs:674-692`).
- **Forms.** As recorded on 2026-10-29; the refusal points are
  `EntryManager.cs:1647` (UserSubmit), `DocumentServiceTracker.cs:485-491`,
  `Configuration.cs:926` (`submitForm.visible`) and
  `FileStorageService.cs:2219-2255` (`StartFillingAsync`).

### Client read of 2026-10-30

- **Open path.** Client list: `navigation.helpers.ts:650-717` (plugins
  skipped, must-convert refused) → `openDocEditorImpl`
  (`filesStore/actions.helpers.ts:133-194`) → `/doceditor?fileId=`; no
  capability check anywhere. SDK: `docs-layout/index.tsx:502-507` refuses
  unconditionally. Doceditor: `getData` (`utils/actions.ts:761-890`) calls
  `openEdit` and sets `canCoAuthoring=false` for encrypted (`:828-830`); the
  server's key-pair list stays in `config.token` and `config.editorConfig`
  (`Editor.tsx:211-213`); `EncryptionProviderWrapper.tsx:140-211` loads the
  envelopes; `useFileEncryptionKeys.ts` fetches the access entries (three
  times per open, seen on the stand), requires the identity, loads the
  sender keys, unwraps the DEK (`room-file-access.ts:59-165`), recovers the
  name from a 4 KiB range and builds `{ dek, cryptoEngineId? }`, injected
  with `Object.assign` (`Editor.tsx:260-268`) because
  `@onlyoffice/doceditor-types` has no such field; `contractVersion` is not
  sent. Failures end in `status: "error"` and Common:SomethingWentWrong; the
  editor never mounts before `ready`.
- **Settings.** There is no shared files-settings store: `files/settings`
  lands in the client `FilesSettingsStore`, the SDK `DocsSettingsStore` and
  the doceditor `useFilesSettings` (fetched after mount, so a doceditor gate
  has to come from `getData`).
- **Desktop.** The key hook runs in the desktop too, so `dek` is present
  and the add-on takes the web path; `initDesktop.ts:47-98` also hands the
  key pairs to `portal:login`.
- **Tests.** `packages/doceditor` has no unit-test runner (Playwright
  only), so every "doceditor unit test" needs task 0.1 first.
- **Editor events** wired in `Editor.tsx:270-360` that break or leak for an
  encrypted file, ranked: `onRequestRefreshFile` hands the raw configuration
  without the DEK to `refreshFile` (breaks the session); `onRequestRename`
  writes the plaintext name as the server title; `onRequestSharingSettings`
  opens the sharing the client withholds; `onRequestCreateNew` creates a
  plaintext file in the private-room folder; `onRequestSaveAs` (5.1) and
  `onRequestStartFilling` (5.3) move plaintext out; the history events
  (5.2); `onMetaChange` marks favorites the client withholds;
  `onRequestSendNotify` sends comment text; `onError` only logs, so DS-5 and
  DS-6 would be invisible; the file pickers can hand an encrypted file's
  ciphertext to the Document Server. Unchanged and safe: `onInfo`,
  `onMakeActionLink`, `onDownloadAs`, `onSubmit`, `onRequestClose`,
  `onRequestEditRights`, `onDocumentStateChange`, `onRequestReferenceData`,
  `onRequestOpen`. Tasks 9.1 to 9.12.

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
   Found on 2026-10-30: the portal already reports the Document Server
   build through `settings/version/build` (10.0.2.5 on the stand) while
   `files/docservice.version` is empty; `info/info.json` is loopback-only
   and names the build, not the library; so the boolean is derived from the
   library path until a published signal exists (DS-16).

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
   Until a Document Server declares a library that reads version 3, the
   portal keeps writing version 2, so build 10.0.0.133 keeps opening every
   file; the choice is made in `private-rooms-dse3-header-authentication`.

7. **A saved encrypted document reopens from a matching base, on the portal
   side.** The cause is the portal's: after a force-save the key still names
   the stable version while `document.url` serves the current one ("Server:
   document key, document address and session"), and the browser takes its
   base from that address while the Document Server replays the session's
   changes on it. When the base does not change, a reopen works, unsaved
   edits included (file 21 in the run). Chosen, with no Document Server
   change: when an editor opens an encrypted file whose current version is a
   force-save, the server asks the Document Server `info` for the stable key.
   While that session exists, it serves the stable key with `document.url` of
   the stable version (`stream&version=N`, which the handler already
   supports), so the replay lands on its own base. When no session exists, it
   promotes the current version to stable by clearing its force-save mark,
   which gives a new key and a fresh session from the latest save.
   Alternatives: a new key right after every encrypted force-save, which
   splits members still editing into two sessions and loses edits made after
   the save and not saved; the stable base without the `info` check, which
   shows content from before the save once the Document Server no longer
   holds the changes.

   Revisited after the afternoon run of 2026-10-29 ("Run of 2026-10-29,
   spreadsheets and presentations"): the base alone does not explain the
   failure. A spreadsheet failed to open with no save and an empty change
   store, every failed spreadsheet open began with the crypto library missing
   from the frame, a retry after a force-save opened and replayed the
   session's changes, and the presentation failed on every reopen with a
   different error. The portal-side part of this decision stays: it removes
   the base mismatch from the Document Server team's analysis and fixes the
   "session over" case. It is no longer expected to fix the reopen on its
   own; the Document Server side is DS-17 (the open path waits for the
   library), DS-14 (the end of the session) and the presentation failure,
   reported with the run's log lines.

   Run of 2026-10-30 on 10.0.2.5: the document reopened correctly after a
   save with the session held, the presentation reopened with the session's
   changes applied twice on the force-saved base (DS-19). The portal-side
   part stays as decided: serving the stable base while the session lives
   removes the replay-on-saved-base for every editor; DS-19 asks the
   presentation editor not to apply a change twice, or the Document Server
   to end the session on save.

8. **The document address of an encrypted file stays public.** The editor
   downloads it in the browser. `document.url` is built from the public portal
   address and then `ReplaceCommunityAddress` swaps its host for the address
   meant for Document Server requests; for an encrypted file the swap is
   skipped.

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

10. **An encrypted file's save fails closed.** The encrypted flag of a
    force-saved version is copied from the callback, so a callback without it
    would store ciphertext marked as plaintext. The server refuses a save of a
    file whose current version is encrypted when the callback carries no
    encrypted flag, and keeps the previous version.

11. **The bundle carries a build stamp and a library version.** Implemented
    2026-10-29 (task 1.4): `LIBRARY_VERSION` (2.1.0, a constant next to the
    other version constants) and `BUILD_COMMIT` (the short hash, `-dirty`
    from a modified tree, defined by the bundle build) are exported, and the
    same two values are the first line of the file, so a deployed copy is
    identified by reading one line. The unstamped build of 2026-07-01 is
    2.0.0; the library version moves independently of the DocSpace release.
    Alternatives: a hash list in the contract, which needs the file and a
    tool; a richer build-info object, dropped as more than the contract
    needs.

12. **The add-on fails closed and names its errors.** When `dek` is present
    but the library or WebCrypto is missing, or the container version is
    unsupported, the Document Server reports a distinct error (contract
    DS-5, DS-6) instead of staying off or reporting the generic open error.
    The client's capability check (D2) covers the portal side of the same
    gap; both are needed, because the capability can be wrong about the
    frame the user actually loaded.

13. **Change encryption as observed is accepted for v1.** Each change is
    AES-GCM under the file's DEK with a random 96-bit IV and no associated
    data (contract §6). The expected message count per document stays far
    below the random-IV bound, and the Document Server holds only
    ciphertext. The contract records a recommendation (DS-12): derive the
    change key from the DEK per document key and bind the document key as
    associated data, so a change cannot be replayed into another session of
    the same file. Owner: the Document Server team; not a release
    prerequisite.

14. **Secure contexts are a deployment rule, not a code check.** The add-on
    needs `crypto.subtle`, so the Document Server origin must be HTTPS or
    localhost, like the portal (`private-rooms/encryption-core`, "Secure
    context required"). The capability check of D2 does not detect an
    insecure Document Server origin; D12 makes the frame report it.

15. **The client's form-flag check stays a verbatim mirror of the server
    rule.** Compared on 2026-10-29 ("Server form handling", "Form
    classification"): same 300-byte window, same markers, same order, the
    signature hardcoded to the server's configured default. The mirror is
    kept rather than replaced by the Document Server's looser rule, because
    the server is the classifier of record for every plaintext upload and the
    flag must mean "the server would have said form". A change of the
    server's signature setting would silently desynchronise the two; the
    risk is recorded below.

16. **Editor events on an encrypted file follow the client's private-room
    rules (proposed 2026-10-30, owner to confirm).** Rename, sharing
    settings, favorites and version history are withheld in the editor as
    they are in the file list; `refreshFile` re-injects the typed keys
    entry; create-new from the editor goes through the encrypted creation
    path or is withheld (proposal decision 7); errors from the Document
    Server frame are shown as page text; the file pickers skip encrypted
    files; mentions are decided by the owner (decision 7). Alternative:
    leave the events generic and rely on the server to refuse; rejected,
    the server stores a plaintext name or a plaintext new file today.

## Implementation notes

For the session that implements this change: read proposal.md, this file and
tasks.md, then `.claude/rules/private-rooms.md` and the "Commits" paragraph of
`openspec/config.yaml`. Work the tasks in the order of the "Order of work"
block of tasks.md; one task is one commit with its tick; a task marked
BLOCKED or "after <x>" waits.

- **Where the code is.** Doceditor is a Next.js app in `packages/doceditor`:
  `src/components/Editor.tsx` wires the editor events and the key hook,
  `src/hooks/useFileEncryptionKeys.ts` resolves the DEK,
  `src/hooks/useEditorEvents.ts` holds the event handlers, `src/utils/events.ts`
  the small ones, `src/utils/actions.ts` `getData` runs on the Next server side
  (no DOM, no stores), `index.d.ts` augments `@onlyoffice/doceditor-types`.
  The client file list is MobX in `packages/client/src/store`; the SDK is
  `packages/sdk/src/app`; shared code, the MSW mocks
  (`packages/shared/__mocks__/handlers`) and the crypto core
  (`packages/shared/services/encryption`, `services/private-room`) are in
  `packages/shared`.
- **Tests.** `packages/doceditor` has no Vitest until task 0.1 (Playwright
  only, in `packages/doceditor/__tests__`); after 0.1 unit tests live in
  `src/**/__tests__/*.test.tsx` and run with `cd packages/doceditor && pnpm
  exec vitest run`. The SDK config is the template (jsdom, globals, the
  ui-kit inline rule, the `@` and `@docspace/shared` aliases). Test names
  carry the scenario name of the spec; no comment restates a requirement; at
  most a one-line `Spec: <capability>, "<requirement>"` pointer where the
  behaviour is counter-intuitive. The gate before a push: `pnpm run tsc`,
  `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run
  test`, `pnpm run test:client`, `pnpm run test:sdk`, and after 0.1
  `pnpm run test:doceditor`.
- **Server facts are never guessed.** Every server statement here comes from
  `../server` read through CodeGraph (`codegraph explore "<Symbols>"` in
  `../server`, then the file); the line numbers in tasks.md are from
  `release/v4.1.0` at a782a03fab and may move. An MSW handler mirrors the
  controller action named in its doc comment; read it before writing the
  mock.
- **Capability field.** Tasks 2.2, 2.3, 2.4, 7.1 and the doceditor part of
  8.1 need the JSON name the backend chooses in 2.1; they are not started
  before it is recorded in D2. Everything in phase A of tasks.md is
  independent of it.
- **Traps.** `isSkipError` (`Root.tsx:144-148`) still mounts the editor, so a
  capability refusal in the doceditor needs its own state, not an error
  status. `useFilesSettings` resolves after the key hook starts, so the
  doceditor gate is fed from `getData`. `onRequestRefreshFile` hands
  `refreshFile` a raw `openEdit` result (the server's key-pair list, no DEK);
  the DEK is wiped after the hand-over (`wipeDek`), so the event is withheld
  rather than re-fed. `files/{id}/access` is requested three times per open
  today; harmless, worth one call. The feature stays behind the
  `privateRooms` localStorage flag; nothing in this change touches
  `packages/shared/utils/privateRooms.ts`. Common:PrivateRoomEditorNotSupported
  exists in `public/locales/en/Common.json`; re-wording it is a locale change
  made with the translate skills in the same commit as the code.
- **Stand.** The local Aspire stack serves the portal at
  http://localhost:8092 with the Document Server build set by
  `APP_EDITOR_VERSION` in `.vscode/tasks.json`; the private room on the stand
  is folder 10 with the files of the runs (7 document, 40 PDF form, 41 and 43
  spreadsheets, 42 presentation). The Document Server's change store is the
  stack's MySQL (`host.docker.internal:33306`, database `onlyoffice`, tables
  `doc_changes` and `task_result`; the credentials are in the editors
  container's `/etc/onlyoffice/documentserver/local.json`), its log is
  `docker logs` of the editors container; `info/info.json` answers only
  from inside that container.
- **Decisions pending.** Proposal decisions 5, 6 and 7 and decision 16
  above are the owner's; tasks 9.4, 9.6, 9.10 and 9.11 wait for them and are
  not decided by the implementing session.

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
  observed: they survive a reopen while the session lasts, the editor warns
  before leaving, and portal downloads show the last saved version; they are
  lost when the Document Server drops the session, so users save explicitly.
- [The file tracker keeps an encrypted file "being edited" while the Document
  Server holds a session nobody uses] → the eviction re-probe keeps the users
  while `info` answers without error; task 6.5 records which callbacks arrive
  when the last editor leaves before D7 is implemented.
- [A private form-filling room created through the API accepts submissions
  today] → task 5.4 makes the server refuse them; until then the client does
  not create such rooms.
- [The form flag is lost on every editor save] → contract item; the API kept
  `isForm` in the run, so the form stays a form in the portal meanwhile.
- [Withholding actions confuses users] → menu items are absent, not greyed;
  the room header shows the private badge.

- [Changes encrypted under the file DEK with random IVs and no associated
  data] → accepted for v1 (D13); the recommendation DS-12 is with the Document
  Server team.
- [Client form-flag mirror drifts from the server rule or from the configured
  signature] → the server rule has no unit test and the client test uses a
  synthetic prefix; task 5.7 adds a fixture produced by the editor to the
  client test, and the signature setting is named in the contract (§5.3).
- [Inserted images or other media leave the browser in plaintext] → not
  exercised; task 4.4 verifies it before release, and the contract requires
  that they do not (DS-13).
- [Spreadsheet co-editing silently diverges] → closed by Document Server
  10.0.2.5 (run of 2026-10-30); what remains for proposal decision 6 is the
  join race of DS-17 and the duplicated replay of DS-19.
- [Editor events bypass the private-room rules of the file list] → tasks
  9.1 to 9.9; until then a rename from the editor writes the real name to
  the server and a new document from the editor is stored in plaintext
  inside the private room.
- [Server paths store ciphertext as a plaintext file or send it to the
  Document Server] → tasks 10.2 to 10.4; `copyas`, restore by address and
  conversion are reachable through the API today.

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
- When the last editor of an encrypted document leaves, which callback does
  the Document Server send (status 1 with no users, status 4, or none), and
  when does it drop the session? The portal's tracker and D7 depend on it.
  Task 6.5 records it on the local stack; the Document Server team confirms.
- Spreadsheets and presentations, after the run of 2026-10-30 on 10.0.2.5:
  the join race of DS-17 and the duplicated replay of DS-19 remain; the
  first-open race and DS-18 are closed by that build. Owner: Document
  Server team.
- Mentions and comments on encrypted files: `onRequestSendNotify` carries
  the comment text to the portal; withhold, or accept as plaintext
  metadata? Owner: feature owner (proposal decision 7).
- Create-new from the editor on an encrypted file: encrypted creation in
  the same folder, or withheld? Owner: feature owner (proposal decision 7).
- Inserted images: do `cryptoimg://` images reach the Document Server's media
  store or the portal in plaintext when a document is saved or co-edited?
  Task 4.4; owner: Document Server team for the answer, this change for the
  recorded run.
- View-only members: a member with read rights opens the editor in view mode
  with the same key path; whether the add-on decrypts in the viewer and
  withholds the save path is unverified. Part of task 4.3.
- Member removal and live sessions: the portal drops users who lost their
  rights on a file when its sharing changes
  (`DocumentServiceHelper.CheckUsersForDropAsync`, two callers in
  `Core/Utils/FileSharing.cs`); whether a private-room member removal reaches
  that path for every open file of the room, and what the removed member's
  editor shows, is verified by task 4.5.
- DS-12 (per-document change key and associated data): accepted or declined
  by the Document Server team; task 1.2 records the answer.
- Why a second session joining a held session with many pending changes
  still reads the library before it has loaded (DS-17 on 10.0.2.5), and why
  the presentation editor applies the held changes on top of the
  force-saved base while the document editor does not (DS-19). Owner:
  Document Server team, with the runs of 2026-10-29 and 2026-10-30.
