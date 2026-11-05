# Design

## Context

The audit that triggered this change looked up every handler's server counterpart with CodeGraph in `../server` and read the source. Server facts used below, all under `../server/products/ASC.Files/` unless noted:

- Response envelope and status mapping: `common/ASC.Api.Core/Middleware/ResponseWrapper.cs` (ItemNotFound/FileNotFound 404, ArgumentException 400, SecurityException and InvalidOperationException 403, CustomHttpException its own code, NotSupportedException 415); null values are omitted (`WhenWritingNull`); a `Task` action answers an envelope without `response`.
- Keys: `Server/Api/PrivacyRoomController.cs` (create `Created(...)` 201, delete `NoContent()` 204, routes `keys`, `keys/{id}`, `{roomId:int}/access`) and `Core/Core/Entries/EncryptionKeyPairDto.cs` (409 on a duplicate id, 404 on an unknown id for replace and delete, 400 on blank key material, `null` when no key was stored, room access 404/400/403 and `SanitizeAccessKeys`), `Core/ApiModels/ResponseDto/EncryptionKeyDto.cs` (`cryptoEngineId`).
- File access: `Server/Api/FilesController.cs` (`GetEncryptionInfoAsync` reads only the caller's wraps; `SetEncryptionInfoAsync` binds a bare array), `Core/Core/Dao/TeamlabDao/FileDao.cs` (`SetFileKey` replaces listed users only), `Server/ApiModels/RequestDto/AccessRequestDto.cs`.
- Uploads: `Server/Api/UploadController.cs`, `ChunkedUploadSessionDto`, `UploadSessionResponseDto`.
- Entry DTOs: `Core/ApiModels/ResponseDto/FileEntryDto.cs` (`RootFolderId = entry.RootId`, the top ancestor, i.e. the Rooms section), `FolderDto` (`private` from the folder's own room settings row, written for rooms only, `Core/Core/Dao/TeamlabDao/FolderDao.cs`), `Core/Core/Security/FileSecurity.cs` (Copy denied in private rooms).
- Delete operation: `Server/Api/OperationController.cs` `DeleteBatchItems`, `FileOperationDto` (`[JsonPropertyName("Operation")]`, Delete = 2).

## Goals / Non-Goals

**Goals:** every private-room handler answers like the server for the routes, status codes, envelope and DTO fields the client reads; contract tests assert server behaviour.

**Non-Goals:** full server simulation (background operation progress, storage redirects); mocks outside private rooms.

## Decisions

1. **The server source is the only reference.** Each handler doc comment names the controller action it mirrors; a contract test per status branch. A shape that cannot be traced to `../server` is not added.
2. **Fix mocks before client.** Contract tests change first, then the handlers, then E2E specs are re-run; client fixes that fall out are recorded as tasks with the failing spec as evidence.
3. **Keep test-facing handles stable** (`getFiles`, `getKeys`, `setRoomKeys`, ...) so specs only change where the server behaviour they assert was invented.

## Risks / Trade-offs

- [Corrected mocks break E2E specs that encoded the invented behaviour] → expected; each failure is triaged as "spec asserted fiction" or "client bug the mock hid".
- [Some server behaviour depends on EF Core or background tasks and cannot be read in the repo, e.g. a duplicate user in one access write] → model only what the source shows; leave such branches out of the mock and say so in the handler comment.

## Open Questions

- Whether the first `fileops/delete` response can already report `finished`, given the server publishes a background task; the client polls either way.
