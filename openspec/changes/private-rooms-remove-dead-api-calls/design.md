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

## Goals / Non-Goals

**Goals:**
- No client request without a server route.
- The desktop bridge keeps working, through the route that exists.

**Non-Goals:**
- Reworking the desktop encryption bridge beyond the access call.
- Adding server routes.

## Decisions

1. **Delete rather than implement.** Alternatives: implement the three routes
   on the server. Rejected: the availability probe is replaced by "the user
   has keys", the settings read/write had no product meaning, and the per-file
   access request already has a successor route on the server
   (`files/file/{fileId}/publickeys`, see Context).
2. **Which route the desktop bridge uses: open (see Open Questions).** The
   options are (a) the per-file `files/file/{fileId}/publickeys`, which needs
   no room lookup on the client and works in subfolders because the server
   locates the room; (b) the room route `privacyroom/{roomId}/access`, which
   needs the room id from the file's parent chain and is refused when the
   caller holds no key; (c) drop the desktop bridge. The earlier plan chose
   (b) on the assumption that no per-file route existed.
3. **Remove the legacy `isEncryptionSupport` flag.** It was only ever true
   when the dead availability probe answered, so every consumer sees `false`
   today; removing it is behaviour-neutral.

## Risks / Trade-offs

- [Desktop editors rely on the per-file route] → `privacyroom/access/{fileId}`
  does not exist on this server generation, so desktop encryption is already
  broken; either existing route from decision 2 is an improvement, verified by
  a desktop smoke test.
- [The two candidate routes answer differently] → the per-file route lists the
  users who hold the file and tolerates a key-less caller; the room route lists
  room members and refuses a key-less caller. The desktop smoke test must cover
  the chosen route's behaviour for a subfolder file.
- [Hidden consumer of the removed flag] → `pnpm run tsc` and the client unit
  suite catch it; the one test that references it is updated in the same
  task.

## Migration Plan

Single client PR; no data or server migration. Rollback is a revert.

## Open Questions

- Route for the desktop bridge (decision 2): per-file
  `files/file/{fileId}/publickeys`, room `privacyroom/{roomId}/access` resolved
  from the parent chain, or drop the bridge. Owner: product owner. Blocks
  task 2.1; the delta specs only require that the bridge uses a route the
  server exposes.
