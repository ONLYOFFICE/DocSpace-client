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

The desktop bridge, as found on 2026-10-20:

- Two desktop crypto engines are told apart by `cryptoEngineId`. The old one
  is the desktop application's own encryption (`desktop-sdk`
  `ChromiumBasedEditors/plugins/encrypt/advanced2`, id
  `{FFF0E1EB-13DB-4678-B67D-FF0A41DBBCEF}`, also `desktopConstants.cryptoEngineId`
  in the client): RSA key pairs wrapped with the portal login password and
  OOXML documents with a per-document password. The new one carries the id
  `{DC522726-5E0E-43E5-AA02-8EA156BECBC5}`, which the desktop developer asked
  for so the two can be told apart; the server gives it to every key pair
  (`DefaultCryptoEngineId` in
  `server/products/ASC.Files/Core/ApiModels/ResponseDto/EncryptionKeyDto.cs`).
- The editor-side bridge (`packages/doceditor/src/utils/initDesktop.ts`, since
  2026-07-28) picks the user's key pair from the server configuration and
  hands it, with that engine id, to the desktop in `portal:login`
  (`packages/shared/utils/desktop.ts`). The desktop asks for the sharing keys
  of a file through `cloudCryptoCommand("getsharingkeys")`, which the bridge
  answers with the per-file privacy access call, the route that does not
  exist; it writes keys through `"encryptionKeys"` / `"updateEncryptionKeys"`,
  which call `PUT privacyroom/keys` without a key id. The request DTO carries
  no default id (`EncryptionKeyRequestDto.Id`), so that write replaces only a
  key pair stored without an identifier (read with the all-zero id,
  `EncryptionKeyPairDto.cs` `ParseKeys`) and answers 404 for a user whose key
  pair has one.
- The new engine is not in the public ONLYOFFICE repositories (`desktop-sdk`,
  `desktop-apps`, `web-apps`, `sdkjs`; `master` at release v10.0.0 and
  `develop`, which stopped in May 2026); `sdkjs` `feature/crypto` (April 2026)
  only adds the `AscCommon.CryptoProvider` abstraction the engine plugs into.
  There is no public `hotfix/v10.0.1` branch.
- Independently of the desktop, the editor developers received the
  private-rooms crypto as `onlyoffice-crypto.js` with an integration guide
  (2026-07-01); its discrepancies with the server are recorded in
  `private-rooms-editor-contract`.

## Goals / Non-Goals

**Goals:**
- No client request without a server route.
- The desktop bridge keeps working, through routes that exist.

**Non-Goals:**
- Reworking the desktop encryption bridge beyond the access call.
- Adding server routes.

## Decisions

1. **Delete rather than implement.** Alternatives: implement the three routes
   on the server. Rejected: the availability probe is replaced by "the user
   has keys", the settings read/write had no product meaning, and the per-file
   access request already has a successor route on the server
   (`files/file/{fileId}/publickeys`, see Context).
2. **Keep the bridge and redirect its sharing-keys request; the contract is
   open (see Open Questions).** Options: (a) the per-file
   `files/file/{fileId}/publickeys`, which lists the public keys of the users
   who hold the file, needs no room lookup and works in subfolders; (b) the
   room route `privacyroom/{roomId}/access`, which needs the room id from the
   file's parent chain and refuses a caller without a key. (a) is
   recommended because it answers exactly what `getsharingkeys` asks for. A
   decision of 2026-10-20 to drop the bridge was reverted the same day: the
   new engine id is the desktop developer's request, so the bridge is the
   desktop's way into private rooms, not dead code.
3. **Remove the legacy `isEncryptionSupport` flag.** It was only ever true
   when the dead availability probe answered, so every consumer sees `false`
   today; removing it is behaviour-neutral.

## Risks / Trade-offs

- [The desktop engine expects another answer shape] → the shape is part of
  the contract agreed in decision 2 and checked by the desktop smoke test.
- [The key write replaces only an id-less key pair] → recorded in Context;
  whether the new engine writes keys at all is part of decision 2.
- [Hidden consumer of the removed flag] → `pnpm run tsc` and the client unit
  suite catch it; the one test that references it is updated in the same
  task.

## Migration Plan

Single client PR; no data or server migration. Rollback is a revert.

## Open Questions

- Decision 2: the bridge contract with the desktop's new crypto engine
  (route and shape of the `getsharingkeys` answer, key writes). Owner: the
  desktop developer, with this change. Blocks task 2.1.
