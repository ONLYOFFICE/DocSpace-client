# Document Server contract for encrypted files, version 1

Status: **draft of 2026-10-29, revised 2026-10-30 against build 10.0.2.5,
awaiting sign-off by the Document Server team.** Task 1.6 of `private-rooms-editor-contract` turns this draft into the
signed-off contract; until then every "MUST" below is the portal's proposal,
and every "observed" statement is a fact from the run described in
design.md ("Observed on 2026-10-29").

Sources, in order of authority:

1. The deployed Document Server builds 10.0.0.133 (read 2026-10-29) and
   10.0.2.5 (read 2026-10-30), developer edition
   (`onlyoffice/4testing-documentserver-de`), read in the browser bundles
   `sdkjs/{word,cell,slide,visio}/sdk-all-min.js` (the crypto add-on,
   `Asc.Addons.crypto`) and `sdkjs/common/crypto/onlyoffice-crypto.js` (the
   library copy, byte-identical in both builds). The public
   `ONLYOFFICE/sdkjs` repository does not carry the add-on.
2. The portal server (`../server`, branch `release/v4.1.0`), read through
   CodeGraph; file and line references are in design.md.
3. The live run of 2026-10-29 on the local Aspire stack (design.md).

## 1. Parties and scope

| Party | Owns |
|---|---|
| Portal server (`../server`) | the editor configuration (`openedit`), the document key and address, the file storage, the save callbacks, the capability flag |
| Client (this repository, `packages/doceditor`) | obtaining the data encryption key (DEK) in the browser, handing it to the editor configuration, the capability check, the action policy on the portal side |
| Document Server (web-apps + sdkjs) | decrypting and re-encrypting the container in the browser, encrypting co-editing changes, the save upload, the end of the editing session, the crypto library copy it ships |

Out of scope of this contract: the desktop application's crypto engine
(`portal:cryptoinfo`, see design.md Open Questions), changes to the DSE3 wire
format (`private-rooms-dse3-header-authentication`), and storing decrypted
copies in the portal.

## 2. Versions

| Item | Value in v1 | Where it is visible |
|---|---|---|
| Contract version | `1` | `editorConfig.encryptionKeys.contractVersion` (planned, task 3.2; absent in build 133) |
| Crypto library | `onlyoffice-crypto.js` 2.1.0, this hand-over; 2.0.0 is the unstamped build of 2026-07-01 (commit 8d6e613ce12) that builds 133 and 10.0.2.5 ship (223841 bytes, SHA-256 `58cb7f48…`) | banner on line 1 of the file (`/*! onlyoffice-crypto <version> <commit> */`) and `window.OnlyofficeCrypto.LIBRARY_VERSION` / `BUILD_COMMIT` |
| DSE3 container | version 2 read and written today; version 3 (authenticated header) is planned, see §5.4 | `window.OnlyofficeCrypto.VERSION_DSE3_FILE`, `parseDSE3Header(bytes).version` |
| Minimum Document Server | to be named by the Document Server team: the first release whose web client carries the crypto add-on and a library of 2.1.0 or newer | `Asc.Addons.crypto`, the library banner under the Document Server address |

Compatibility rule: a Document Server MUST read every DSE3 version its
library reads and write the version its library writes; the portal writes
version 2 until a Document Server release declares a library that reads
version 3 (design D6).

## 3. The encryption keys entry

### 3.1 Shape

The portal signs a configuration whose `editorConfig.encryptionKeys` is the
caller's key-pair list (one object per key pair: `id`, `publicKey`,
`privateKeyEnc`, `userId`, `date`, `cryptoEngineId`; `EncryptionKeyDto`).
The client then replaces the field, after signing, with one object:

```json
{
  "dek": "<base64 of the 32-byte AES-256 key>",
  "cryptoEngineId": "<engine id from the server's key pair, optional>",
  "contractVersion": 1
}
```

Observed: the web client reads **`dek` only**. `cryptoEngineId` is not read.
`contractVersion` does not exist yet and an unknown field is ignored.

### 3.2 Obligations

- DS-1. The add-on MUST keep reading `dek` as base64 of 32 bytes and MUST
  ignore fields it does not know.
- DS-2. The add-on SHOULD read `contractVersion` and refuse to open (with a
  distinct error, §10) when the major version is one it does not implement.
- DS-3. The add-on MUST NOT send `dek`, the decrypted document or any
  decrypted change to the Document Server's server side. Observed: the DEK is
  read when the add-on starts and is not part of any message to the server
  (read in the bundle; the socket traffic was not captured).
- DS-4. With `AscDesktopEditor` present and `dek` undefined the add-on hands
  the whole entry to the desktop application (`portal:cryptoinfo`); with `dek`
  present it takes the web path. This stays as is until the desktop developer
  answers (design.md Open Questions).

### 3.3 Token

Observed: the Document Server accepts the configuration although the signed
`encryptionKeys` (the key-pair list) differs from the object beside it, and
the DEK stays outside the signed payload. The token still hands the caller's
key pairs, `privateKeyEnc` included, to the Document Server's server side.
Open: whether the portal keeps the key-pair list in the configuration at all
(backend with the Document Server team; task 1.2).

## 4. Opening a document

### 4.1 Download in the browser

Observed: the editor frame fetches `document.url` itself
(`filehandler.ashx?action=stream&fileid=…&stream_auth=…`). The portal skips
the Document Server JWT header check for an encrypted file; `stream_auth`
over the file id and version is still required.

- P-1 (portal). `document.url` of an encrypted file MUST be reachable from
  the user's browser; the host swap to the address meant for Document
  Server requests (`ReplaceCommunityAddress`) MUST be skipped for it
  (design D8, task 6.3).
- P-2 (portal and Document Server). Both origins MUST be secure contexts
  (HTTPS, or localhost): the add-on uses `crypto.subtle`.

### 4.2 Decision tree of the add-on (observed)

1. If the bytes carry a known plaintext signature (ZIP `PK\x03\x04`, `DOCY`,
   `XLSY`, `PPTY`, `VSDY`, `%PDF`, `AT&T`, or the core's own detectors) they
   are opened as they are, without decryption.
2. Else, if `OnlyofficeCrypto.isDSE3Format(bytes)`: `decryptFile(bytes, dek)`
   → `{ data, fileName }`; the name from the container header becomes the
   document name (`asc_onDocumentName`, desktop `SetDocumentName`), and the
   decrypted bytes are kept for the save path.
3. A decryption failure answers `null` to the core, which reports an open
   error. Ciphertext is never rendered.
4. If the decrypted bytes are a PDF whose first 4096 bytes contain
   `/ONLYOFFICEFORM [ <len> <size> ]` followed by `stream\r\n`, the embedded
   form source is extracted and the document is opened as a form.

- DS-5. When `dek` is present but `window.OnlyofficeCrypto` or
  `crypto.subtle` is missing, the add-on MUST fail with a distinct error
  instead of staying off silently (observed: it stays off, and the core then
  tries to open the DSE3 bytes as a document).
- DS-6. A container of an unsupported DSE3 version MUST produce a distinct
  error (the library throws `UnsupportedVersionError`; the add-on today maps
  every failure to the generic open error).
- DS-17. The add-on's open path MUST NOT run before the crypto library has
  loaded. Observed on 2026-10-29: the sdk injects
  `sdkjs/common/crypto/onlyoffice-crypto.js` as an `async` script, and in
  five of eight warm-cache spreadsheet opens the add-on read
  `window.OnlyofficeCrypto` before it existed (`base64ToArrayBuffer` of
  undefined, `sdk-all-min.js:2235:111`), so the open failed; a retry opened
  the same file. On 10.0.2.5 the engine starts in the library's `onload` and
  the first open waits for it (4 of 4 warm opens on 2026-10-30), but a
  second session joining a held session with 257 pending changes failed the
  same way, so the change-apply path on join MUST wait for the library too.

### 4.3 Editors covered

Observed: the add-on is present in the document, spreadsheet and
presentation bundles; PDF and PDF forms open through the document editor
(`sdkjs/pdf/src/engine/drawingfile.js` is loaded on demand). The runs of
2026-10-29 verified open, save and encrypted change storage for documents,
PDF forms, spreadsheets and presentations; reopening and co-editing of
spreadsheets and presentations carry the defects DS-17 and DS-18 and the
presentation reopen failure of §7.

## 5. Saving

### 5.1 Path (observed)

Ctrl+S and the Save button both run `buildCryptoFile_Start`:

1. The core builds the document package in the browser. Media entries inside
   the package (`media/*`) are resolved to their plaintext bytes from the
   add-on's image cache; an entry stored as an `ENCRYPTED;` string or as a
   DSE3 blob is decrypted first.
2. For a PDF form (or a PDF opened in the viewer) the PDF is built in the
   browser (`drawingfile.js`, `BuildPdf`) with the form source embedded.
3. `OnlyofficeCrypto.encryptFile(bytes, { dek, fileName })` with the same DEK
   and the real file name.
4. The container is posted to the Document Server's `savefile` endpoint with
   `forcesavetype=1`; the Document Server calls the portal back with status 6
   (`ForceSave`) or 7, `forcesavetype` 1 (`User`) and `encrypted: true`.
5. The portal stores a new encrypted version in the current version group
   (`EntryManager.cs:1540-1587`); the document key does not change, because a
   force-save keeps the stable version (design "Server: document key").

Observed result: DSE3 version 2, encrypted flag set, readable with the
existing access entries, no new key wraps.

### 5.2 Obligations

- DS-7. `encryptFile` MUST be called with the DEK of the opened container and
  the document name the container carried (or the new name after a rename in
  the editor).
- DS-8. **Form flag.** `encryptFile` MUST be called with
  `isForm: header.isForm` where `header = parseDSE3Header(openedBytes)`, and
  with `isForm: true` for a form created in the session, so the saved
  container keeps the `0x02` header flag (library 2.1.0 or newer; observed in
  build 133: the flag is dropped on every save, flags `0x03` → `0x01`).
- DS-9. The container version written is the one the shipped library writes
  (`VERSION_DSE3_FILE`); no other version is written.
- P-3 (portal). A save callback for a file whose current version is encrypted
  and that carries no `encrypted` flag MUST be refused, and the previous
  version stays current (design D10, task 6.4). Today the flag is copied from
  the callback as is.
- P-4 (portal). The server classifies a PDF as a form from the first 300
  bytes of the stored file, reading the DSE3 header flag for an encrypted file
  (`FileChecker.CheckExtendedPDFstream`), and only while the file's category
  is still unset (`FileDao.SaveFileAsync`); a form keeps its classification
  across versions. The client sets the flag with a byte-for-byte mirror of the
  server's plaintext check (§5.3).

### 5.3 How the form flag is decided

Three implementations exist; they agree on every form the editor produces,
and differ on edge cases:

| Implementation | Window | Rule |
|---|---|---|
| Portal server `FileChecker.IsExtendedPDFFile` (also used by `FileUploader.UploadChunkAsync` on the first chunk) | first 300 bytes | binary comment `%\xCD\xCA\xD2\xA9\r`, then exactly `1 0 obj\n<<\n`, then the configured signature (`files:oform:signature`, `ONLYOFFICEFORM` in buildtools `config/appsettings.json`) before `stream\r\n`, followed by ` [ ` and two space-terminated numbers |
| Client `pdf-form-signature.ts` (`sniffPdfFormBlob`, used by `encrypted-upload.ts` for `.pdf` uploads) | first 300 bytes | the same rule with the signature hardcoded |
| Document Server add-on (form source extraction) | first 4096 bytes | `/ONLYOFFICEFORM [ <len> <size> ]` anywhere, then `stream\r\n` |

For an encrypted file the server never sees the plaintext, so the client's
mirror is the only classifier at upload, and the Document Server's save is
the only classifier afterwards (DS-8). The client mirror is a verbatim port
of the server rule, so a PDF form the server would classify from plaintext is
flagged the same way when it is uploaded encrypted; a PDF the Document Server
treats as a form because the marker sits beyond the first 300 bytes, or
without the `1 0 obj` prefix, is flagged by neither the server nor the
client. The signature is a server setting; the client assumes its default.

### 5.4 Container versions

The portal's library writes version 2 today. `private-rooms-dse3-header-authentication`
introduces version 3 (flags, chunk size and name length authenticated).
Decided 2026-10-26: the Document Server MUST read versions 2 and 3 and
write what its library writes; the portal keeps writing version 2 until a
Document Server release declares a library that reads version 3.

## 6. Co-editing changes

### 6.1 Wire format (observed)

Every change `c` the core sends while the add-on is active is replaced by

```
"ENCRYPTED;" + base64( iv[12] || AES-256-GCM(dek, iv, utf8("DECRYPTED;" + c)) )
```

with a fresh random 12-byte IV per change and the file's DEK imported as a
non-extractable AES-GCM key. A change that arrives quoted keeps its quotes
outside the envelope. On receipt the add-on decrypts and requires the
`DECRYPTED;` prefix; otherwise the batch is marked failed and the core
reports `changesError`. The Document Server's change store held only
`ENCRYPTED;` entries in the run (26 of 26, 38 of 38) and none contained the
typed text.

### 6.2 Obligations

- DS-10. Changes MUST be relayed and stored only in this encrypted form; the
  Document Server's server side MUST NOT decrypt them (it has no key).
- DS-11. Co-editing MUST stay enabled for encrypted files (decided
  2026-10-29); the portal's `canCoAuthoring` flag is not read by the Document
  Server and the client stops forcing it (task 4.1).
- DS-12 (recommended, not required for v1). The change key SHOULD be derived
  from the DEK per document key (for example HKDF-SHA256 with the document
  key as info), and the document key SHOULD be bound as associated data, so
  a change cannot be replayed into another session of the same file and the
  file's DEK is not used for two message streams. Owner: Document Server team;
  the portal records the answer in design.md.
- DS-18. The spreadsheet editor MUST apply relayed encrypted changes as the
  document editor does. Observed on 2026-10-29 in Fast mode with two
  sessions of one spreadsheet: each session showed the other's cell
  selection, both sessions' changes were stored encrypted, but neither
  session applied the other's changes within 10 seconds, before or after a
  save; the same test on a document relayed text both ways within 5
  seconds. Observed on 2026-10-30 on 10.0.2.5: relayed in both directions
  within 10 seconds; closed by that build, kept as a requirement.
- DS-19. Reopening a presentation while its session is held MUST NOT apply
  the session's changes on top of a base that already contains them.
  Observed on 2026-10-30 on 10.0.2.5: after a save and a reopen the typed
  text appeared twice, while the document editor reopened correctly under
  the same conditions. Until the Document Server ends the session on save
  or replays idempotently, P-5 serves the stable base.
- DS-13 (to verify, task 4.4). Images inserted into an encrypted document are
  kept by the add-on as `cryptoimg://` references with their bytes in memory.
  Whether an inserted image reaches the Document Server's media store or the
  portal in plaintext is not known; the contract requires that no plaintext
  media leaves the browser outside the encrypted container.

## 7. End of an editing session and reopening

Observed in build 133: after a save and closing every editor, the Document
Server kept the session and all its changes for more than three minutes,
logged no assembly and sent no closing callback; the portal kept returning
the same document key; a reopen downloaded the saved version and replayed
the kept changes on it, which failed with `changesError`. The edit history
listed version 1 only and `edit/diff` had no `changesUrl`.

Afternoon run of 2026-10-29 (design.md, "Run of 2026-10-29, spreadsheets
and presentations"): reopening a presentation while the Document Server
held its session failed on every attempt (`changesError: Cannot read
properties of null (reading 'me')`), reopening a spreadsheet failed
intermittently and once without any save or change (DS-17), and a retry
after a force-save opened and replayed the session's changes without
error. The base mismatch behind P-5 is therefore not the only cause; P-5
stays as the portal's part, and the Document Server team receives the log
lines.

Run of 2026-10-30 on 10.0.2.5 (design.md, "Run of 2026-10-30"): with the
session held after a force-save, the document reopened with the saved
content once, and the presentation reopened without an error but with the
session's changes applied on top of the saved base, so the typed text
appeared twice (DS-19). Sessions were still not ended after every editor
left.

- P-5 (portal, design D7, task 6.2). When an editor opens an encrypted file
  whose current version is a force-save, the portal asks the Document Server
  (`info` command) whether the stable key still has a session. While it
  does, the configuration carries the stable key and `document.url` of the
  stable version (`stream&version=N`), so the replay lands on its own base.
  Otherwise the current version is promoted to stable, which yields a new key
  and a fresh session from the latest save.
- DS-14 (to answer, task 1.2). Which callback the Document Server sends when
  the last editor of an encrypted document leaves (status 1 with an empty
  user list, status 4, or none), when it drops the session and its changes,
  whether changes a save already contains are dropped, and what happens to
  unsaved encrypted changes when the session cache expires (`expire.files`,
  86400 s in build 133). The portal's file tracker and P-5 depend on the
  answer.
- Accepted for v1: edits left unsaved when the last editor leaves exist only
  as encrypted changes inside the Document Server, which cannot assemble a
  file from them; they survive a reopen while the session lasts and are lost
  when it ends, so users save explicitly.

## 8. Download-as, save-copy-as, print, history

Observed (read in the bundle; the save-to-device paths were not executed):

- Download-as PDF or PDF/A: the PDF is built in the browser and saved to the
  device; for ZIP-based targets (docx, docm, dotx, xlsx, xlsm, xltx, pptx,
  pptm, potx, ppsx, vsdx) the package built in the browser is saved to the
  device. Any other target returns to the core's generic path. The editor's
  menu offered DOCX and PDF for a document in the run.
- Print builds the PDF in the browser.
- Save-copy-as follows download-as; the client refuses the portal-side
  `onRequestSaveAs` for encrypted files (task 5.1).
- Version history: the portal withholds it; the Document Server has no
  encrypted history to show.

Obligations:

- DS-15. For an encrypted document the Document Server MUST NOT offer a
  download-as target that goes through its conversion service, and MUST NOT
  send the document to that service for any purpose (download, print,
  thumbnails, comparison, mail merge). Read in the bundle on 2026-10-30: a
  target outside the browser-built set (docx, docm, dotx, xlsx, xlsm, xltx,
  pptx, pptm, potx, ppsx, vsdx, pdf, pdfa) falls through to the core's
  conversion path with the browser-built plaintext package; only the
  save-formats menu guard keeps such targets out of reach.
- P-6 (portal, decided 2026-10-29). Decrypted copies exist only on the user's
  device; no copy is stored in a portal folder.

## 9. PDF forms

- Filling an encrypted form in the edit mode of a private room works and its
  save stays encrypted (observed); the save MUST keep the form flag (DS-8).
- P-7 (portal, design D9, task 5.4). A form submission of an encrypted file
  into form-data collection (a form-filling room) MUST be refused by the
  server, because the result would be stored unencrypted and its field values
  reported in plaintext.
- Client: "Share to fill out" is hidden for a form in a private room (task
  5.3).
- Open: role-based filling in a private virtual data room (task 5.6).

## 10. Errors

| Situation | Today (build 133) | Contract |
|---|---|---|
| `dek` given, library or WebCrypto missing | add-on silently off, core opens ciphertext as a document and fails | distinct error, DS-5 |
| Wrong DEK, tampered container | generic open error | distinct error naming the cause (`DecryptionError`, `AuthenticationError`) |
| Unsupported container version | generic open error | distinct error, DS-6 |
| Change fails to decrypt | `changesError` | unchanged |
| Save upload refused by the portal (P-3) | not applicable yet | the editor shows the save error the core already has for a failed `savefile` |

## 11. Capability signal

Observed: `info/info.json` answers 404; the frame exposes
`Asc.Addons.crypto === true`; `sdkjs/common/crypto/onlyoffice-crypto.js`
answers 200 under the Document Server address, with or without the build
hash in the path. With library 2.1.0 the first line of that file names the
library version and the source commit. Read on 2026-10-30: on 10.0.2.5
`info/info.json` is served from loopback only (`allow 127.0.0.1`) with
`serverInfo.buildVersion` and `buildNumber`, nothing about the library;
`DocsAPI.DocEditor.version()` answers `10.0.2`; the portal's
`settings/version/build` reports `documentServer` 10.0.2.5 while
`files/docservice.version` is empty. The 404 of 2026-10-29 came from the
portal's `/ds/` proxy, which answers the client application for every path,
not from the Document Server.

- P-8 (portal, design D2, task 2.1). The portal exposes an encrypted-editing
  capability to the client, derived until further notice from the library
  path answering 200; the client refuses to open an encrypted file without
  it (task 2.3).
- DS-16 (to answer, task 1.2). The Document Server SHOULD publish the
  capability and the library version through a stable signal (its
  `healthcheck`/info endpoint or the `DocsAPI` version object) so the portal
  stops probing a file path.

## 12. Live revocation

The portal already asks the Document Server to drop users who lost their
rights on a file when its sharing changes (`DocumentServiceHelper.CheckUsersForDropAsync`,
called from `FileSharing.cs`): every tracked editor without edit, review,
comment, fill or custom-filter rights is sent in a `drop` command with the
stable document key. Whether the removal of a private-room member reaches
this path for every open file of the room is verified by task 4.5; until
then the editor-level behaviour on member removal is unspecified, and the
client-side guarantee stays the one of `private-rooms/encryption-core`
("No forward secrecy for already-decrypted content").

## 13. Obligations summary

| Id | Owner | Obligation | Status |
|---|---|---|---|
| DS-1 | Document Server | read `dek` (base64, 32 bytes), ignore unknown fields | observed |
| DS-2 | Document Server | check `contractVersion`, refuse an unknown major | new |
| DS-3 | Document Server | never send the DEK or plaintext to its server side | observed, to confirm |
| DS-4 | Document Server | desktop hand-off when `dek` is undefined | observed, open with the desktop developer |
| DS-5 | Document Server | fail with an error when the library or WebCrypto is missing | new |
| DS-6 | Document Server | distinct error on an unsupported container version | new |
| DS-7 | Document Server | save with the same DEK and the real name | observed |
| DS-8 | Document Server | keep the form flag on save (`isForm`, library 2.1.0) | new |
| DS-9 | Document Server | write the container version of the shipped library | observed |
| DS-10 | Document Server | relay and store changes encrypted only | observed |
| DS-11 | Document Server | co-editing enabled | observed |
| DS-12 | Document Server | per-document change key and AAD | recommended |
| DS-13 | Document Server | no plaintext media outside the container | to verify |
| DS-14 | Document Server | define the end of an encrypted session | to answer |
| DS-15 | Document Server | no conversion-service path for encrypted documents | to confirm |
| DS-16 | Document Server | capability and library version signal | to answer |
| DS-17 | Document Server | open path waits for the crypto library | first open closed in 10.0.2.5; the join path still races |
| DS-18 | Document Server | spreadsheet editor applies relayed encrypted changes | closed in 10.0.2.5 |
| DS-19 | Document Server | no duplicated replay on a presentation reopen | new, from the run of 2026-10-30 |
| P-1 | Portal server | `document.url` reachable from the browser | task 6.3 |
| P-2 | Portal and Document Server | secure contexts | deployment rule |
| P-3 | Portal server | refuse a save without the encrypted flag | task 6.4 |
| P-4 | Portal server | form classification from the header | implemented |
| P-5 | Portal server | stable key and base while a session exists | task 6.2 |
| P-6 | Portal | no decrypted copy stored in the portal | task 5.1 |
| P-7 | Portal server | refuse encrypted form submissions | task 5.4 |
| P-8 | Portal server | capability flag | task 2.1 |

## 14. Open questions

Listed with owners in design.md, "Open Questions"; the ones this contract
depends on are DS-4, DS-12, DS-13, DS-14, DS-16, DS-19 and the token
question of §3.3.

## 15. Change log

- 2026-10-29: first draft, from the run of the same day, the bundles of
  build 10.0.0.133 and the server code on `release/v4.1.0`.
- 2026-10-29, afternoon: DS-17 and DS-18 and the presentation reopen
  failure, from the spreadsheet and presentation run.
- 2026-10-30: read against build 10.0.2.5 and a run on it: DS-17 narrowed
  to the join path, DS-18 closed, DS-19 added, DS-15 and DS-16 made
  precise, the sources and the library row updated.
