# Design

## Context

See proposal.md. The dead requests sit in `packages/shared/api/files/index.ts`
(`getIsEncryptionSupport` at line 1385 targeting `/files/@privacy/available`;
the desktop access call at line 1422 targeting `privacyroom/access/${fileId}`)
and `packages/shared/api/privacy/index.ts` (`getPrivacySettings` /
`updatePrivacySettings`, lines 43-58). The settings store wraps the first one
(`packages/shared/store/SettingsStore.ts:1262`) and the client shell reads the
resulting `isEncryptionSupport` for the desktop bridge. Under `privacyroom`
the server exposes only key CRUD and `privacyroom/{roomId}/access`
(`server/products/ASC.Files/Server/Api/PrivacyRoomController.cs`). Two
per-file routes exist under `files`:

- `GET files/file/{fileId}/publickeys`
  (`server/products/ASC.Files/Server/Api/SecurityController.cs:256`, served by
  `EncryptionKeyPairDto.cs:194-243`) returns the public keys of the users who
  hold the file (group shares skipped), with the private half only on the
  caller's own entries. It locates the private room itself, so a file in a
  subfolder works, answers 415 for a file outside a private room, and does not
  require the caller to hold a key of their own.
- `GET files/{fileId}/access` (`FilesController.cs:1228-1251`) returns the
  caller's key pairs and the access entries issued to the caller for that file.

The room route differs from the first one: it lists the room's members and
refuses a caller who holds no key of their own with 403
(`EncryptionKeyPairDto.cs:290-293`). The legacy `privacyroom/access/{fileId}`
the desktop call targets is therefore gone, but its job has a per-file
successor. The
stashed `04-implementation-status.md` already recorded that `GET /privacyroom`
does not exist and that "availability of private rooms = having keys", so the
removal follows a decision the feature author made in June 2026.

What the bridge served, read in the ONLYOFFICE repositories on 2026-10-20
(`master`, release v10.0.0): the desktop application's own encryption, which
is not the private-rooms scheme.

- `desktop-sdk` `ChromiumBasedEditors/lib/src/cefwrapper/client_renderer_wrapper.cpp`
  (`portal:login`): when the login data carries `encryptionKeys` with a
  `cryptoEngineId`, the desktop generates an RSA key pair with OpenSSL,
  encrypts the private key with AES-GCM under the portal login password and
  asks the page to store it through `cloudCryptoCommand("encryptionKeys")` or
  `"updateEncryptionKeys"`.
- `desktop-sdk` `ChromiumBasedEditors/plugins/encrypt/advanced2/worker.js`:
  documents are OOXML files with a per-document password, RSA-encrypted for
  each user's public key into a `docinfo`; the users' public keys come from
  the page through `getsharingkeys`.
- `web-apps` `apps/documenteditor/main/app/controller/Main.js` and `sdkjs`
  `common/apiBase.js`: the editor itself takes `editorConfig.encryptionKeys`
  from its server configuration (`put_EncryptedInfo`) and hands it to the
  crypto provider the desktop injects. That path does not go through the
  client and is not touched here.

Private rooms use X25519 keys with HPKE, the DSE3 container and an Argon2
passphrase, so the two schemes are incompatible. The editor-side bridge also
handed the user's X25519 key pair to the desktop engine under its crypto
engine id. How the desktop application opens private-room files is an open
product question outside this change.

## Goals / Non-Goals

**Goals:**
- No client request without a server route.
- The desktop application keeps its portal login without the dead encryption bridge.

**Non-Goals:**
- Reworking the desktop encryption bridge beyond the access call.
- Adding server routes.

## Decisions

1. **Delete rather than implement.** Alternatives: implement the three routes
   on the server. Rejected: the availability probe is replaced by "the user
   has keys", the settings read/write had no product meaning, and the per-file
   access request already has a successor route on the server
   (`files/file/{fileId}/publickeys`, see Context).
2. **Drop the desktop encryption bridge (decided 2026-10-20 with the user).**
   Both requests of the bridge fail today: the per-file access call has no
   route, and the key write sends `PUT privacyroom/keys` without the key id
   the server reads from `EncryptionKeyRequestDto`, so the replace targets an
   unknown key and answers 404. Alternatives were (a) the per-file
   `files/file/{fileId}/publickeys` and (b) the room route
   `privacyroom/{roomId}/access`; either would have needed the key write
   reworked as well. Dropping the bridge removes the encryption branch of
   `regDesktop`, the legacy key plumbing of the settings store and the legacy
   key requests of the files API module; the desktop login itself, the API-key
   provisioning and the system messages stay.
3. **Remove the legacy `isEncryptionSupport` flag.** It was only ever true
   when the dead availability probe answered, so every consumer sees `false`
   today; removing it is behaviour-neutral.

## Risks / Trade-offs

- [Desktop users lose the desktop encryption engine] → it already fails on
  both of its server requests, so nothing that works today is removed; the
  desktop smoke test checks that the login and ordinary documents still work.
- [Hidden consumer of the removed flag] → `pnpm run tsc` and the client unit
  suite catch it; the one test that references it is updated in the same
  task.

## Migration Plan

Single client PR; no data or server migration. Rollback is a revert.

## Open Questions

None. Decision 2 (drop the desktop bridge) was made on 2026-10-20.
