# Proposal

## Why

The E2E suite for private rooms runs against MSW handlers that claim to mirror the C# server, but a CodeGraph audit of `../server` (branch `hotfix/v4.0.1`) found that none of the six `privacyroom` handlers and six of the eleven encrypted-files handlers match the server's routes, status codes or response shapes, and three contract tests pin the wrong behaviour. Client code that passes against these mocks can fail against the real server (a duplicate key id answers 409, not a no-op; `files/{id}/access` returns only the caller's wraps; items in a room carry the Rooms section id as `rootFolderId`; the server denies `Copy` inside a private room). A test that passes against an invented server proves nothing, so the mocks have to be brought back to the implementation before more E2E coverage is built on them.

## What Changes

- Rewrite the `privacyroom` key handlers to the server contract: create answers 201, a duplicate id 409, blank key material 400; replace answers 404 for an unknown id; delete answers 204 with no body and 404 for an unknown id; list omits `response` when no key was stored; stored keys carry `cryptoEngineId`.
- Rewrite `privacyroom/{roomId}/access`: 404 for an unknown room, 400 for a non-private room, 403 when the caller holds no key; the private half only on the caller's own entries; entries without a public key dropped.
- Rewrite the encrypted-files handlers: `files/{id}/access` returns only the caller's `fileKeys` (with `tenantId`, `createOn`) and 403 for a missing file; the access write takes a bare array, replaces only the listed users and returns no `response`; `publickeys` answers 415 outside a private room and sanitises foreign entries; the upload-session handlers return the server's session and upload DTOs and status codes (201 on the final chunk and on finalize, finalisation only on finalize or the sequential last chunk).
- Fix the file and folder DTOs the mocks build: `rootFolderId` is the Rooms section id, a room's `parentId` is the section id, `parentRoomType` of a custom room's content is 19, `encrypted` is omitted when false, file `security.Copy` is false inside a private room, subfolders report `private: false`; drop fields the server does not have (`CoAuhtoring`, `EditForm`, `folderType`, `isArchive`, `Disconnect`, folder `pathParts`). The listing `pathParts` is the breadcrumb chain from the Rooms section, each part with `id`, `title`, `folderType` and, for a room, `roomType`.
- Fix every handler doc comment to name the real controller action, and align `fileops/delete` with `FileOperationDto` (no `files`/`folders` for a delete, a `status` field).
- Update the contract tests that pin the wrong behaviour, then fix whatever E2E specs and client code the corrected mocks expose.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/server-contract`: adds the requirement that the E2E mocks mirror this contract as implemented in `../server`.

## Impact

- `packages/shared/__mocks__/handlers/privacyroom/**`, `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`, `packages/shared/__mocks__/handlers/files/privateRoomList.ts` and their contract tests.
- Private-room E2E specs in `packages/client/__tests__` (`private-room-*.spec.ts`, `keys-management*.spec.ts`, `encrypted-file-ui.spec.ts`) and any client code they show to depend on the invented shapes.
- Server: none. Every expected shape is taken from `../server` through CodeGraph and the source; nothing is inferred.

## Out of scope

- Server changes; mismatches are fixed on the mock side only.
- Mocks unrelated to private rooms.

## Decisions needed

- Whether client code that only works against the old mock shapes is fixed inside this change or split out, once the corrected mocks show how much there is.
- `private-rooms-upload-fail-closed` task 5.4 (E2E for a move out of a private room) is blocked on this change.
