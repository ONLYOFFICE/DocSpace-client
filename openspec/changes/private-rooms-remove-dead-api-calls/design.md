# Design

## Context

See proposal.md. The dead requests sit in `packages/shared/api/files/index.ts`
(`getIsEncryptionSupport` at line 1385 targeting `/files/@privacy/available`;
the desktop access call at line 1422 targeting `privacyroom/access/${fileId}`)
and `packages/shared/api/privacy/index.ts` (`getPrivacySettings` /
`updatePrivacySettings`, lines 43-58). The settings store wraps the first one
(`packages/shared/store/SettingsStore.ts:1262`) and the client shell reads the
resulting `isEncryptionSupport` for the desktop bridge. The server exposes
only key CRUD and `privacyroom/{roomId}/access`
(`server/products/ASC.Files/Server/Api/PrivacyRoomController.cs`). The
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
   access route is a strict subset of the room access route.
2. **Desktop bridge resolves keys by room.** The desktop editor knows the
   file's parent chain from the editor configuration; resolving the room id
   mirrors what the web editor does for subfolders. Alternative: drop the
   desktop bridge; kept as a fallback decision for the product owner.
3. **Remove the legacy `isEncryptionSupport` flag.** It was only ever true
   when the dead availability probe answered, so every consumer sees `false`
   today; removing it is behaviour-neutral.

## Risks / Trade-offs

- [Desktop editors rely on the per-file route] → the route never existed on
  this server generation, so desktop encryption is already broken; the room
  route is an improvement, verified by a desktop smoke test.
- [Hidden consumer of the removed flag] → `pnpm run tsc` and the client unit
  suite catch it; the one test that references it is updated in the same
  task.

## Migration Plan

Single client PR; no data or server migration. Rollback is a revert.
