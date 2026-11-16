# Design

## Context

See proposal.md for the motivation. No stashed design document covers the
mocks.

Server source: `../server` at `6fb6dfb17a`, read on 2026-11-16.

### A public or a form-filling room created as private

- `FileStorageService.CreateRoomAsync`
  (`products/ASC.Files/Core/Core/FileStorageService.cs`, line 667) refuses
  the private flag for the AI hub room types only and passes the request
  to `InternalCreateFolderAsync`, which runs the checks the mock already
  mirrors (the creator's keys, the Document Server, then indexing, lifetime
  and watermark) and saves the room with the private setting (line 1249).
- The wrapper `CreateRoomAsync<T>` (line 1079) sends the room-created audit
  event and webhook and then, for `FolderType.PublicRoom` and
  `FolderType.FillingFormsRoom` outside the templates, sets the primary
  external link (`SetExternalLinkAsync`, lines 1107-1114).
- `FileSharingAceHelper.SetAceObjectAsync`
  (`products/ASC.Files/Core/Utils/FileSharing.cs`, lines 107-113) throws a
  `SecurityException` for a link with an access in a private room.
  `SetAceLinkAsync` passes it on unchanged (`GenerateException`, line 6641).
- `CustomExceptionHandler` (`common/ASC.Api.Core/Middleware/ResponseWrapper.cs`)
  answers a `SecurityException` with 403 and the message "Access denied".
- Nothing removes the room saved before the link, so it stays stored.
- The room types are `RoomType.FillingFormsRoom` (1) and
  `RoomType.PublicRoom` (6) of
  `products/ASC.Files/Core/ApiModels/RequestDto/CreateRoomRequestDto.cs`.
- Not mirrored: `CheckPublicRoomCreationAsync`, which refuses a public room
  while the portal forbids external sharing, before any of this. The mock
  has no such portal state.

### The accounts offered for a room

- `UserController.GetUsersWithRoomShared`
  (`products/ASC.People/Server/Api/UserController.cs`, line 3152) answers
  each account through `EmployeeFullDtoHelper.GetShareCandidateAsync`
  (`common/ASC.Api.Core/Model/EmployeeFullDto.cs`), which is the full
  profile (`GetFullAsync`) for a caller who has access to the contacts.
- For another account the full profile holds the first and last name, the
  status and the activation status, the e-mail, the five role flags and
  `shared` (`CreateWithTypeAsync`); the user name, `isLDAP` and `isSSO`;
  the id, the display name, `hasAvatar`, `isAnonim`, the five avatar
  addresses and the profile link (`EmployeeDtoHelper`); the mobile phone
  activation status, the culture name when the account has one, the
  department, an empty string for an account in no group, and the
  registration date.
- It never holds `workFrom`, whose assignment is commented out (line 391),
  nor `theme` and `loginEventId`, which only the caller's own profile gets
  (`UserController.cs`, lines 1801 and 1805).
- `usedSpace` and the other quota fields are filled for a caller who is a
  DocSpace administrator, or for the caller's own account. The mock has no
  caller, so it leaves them out.

## Goals / Non-Goals

**Goals:**

- Each of the two mocks answers what the server answers for the requests
  the mock takes.

**Non-Goals:**

- Mirroring the search of the accounts route or its dependence on the
  caller.

## Decisions

1. **The mock keeps the refused room.** `getRooms` of the handle returns
   it after the 403, since the server has stored it. A test that reads the
   rooms after a refusal sees what a later listing of the portal would
   show. Alternative: answer 403 and store nothing. Rejected: it is the
   behaviour asked of the server in `private-rooms-server-hardening` 12.8,
   not the one it has.
2. **The account of the accounts mock is built from its own field list.**
   It no longer spreads the fixture of the caller's profile, so a field
   added to that fixture for the self route cannot reach another account's
   entry again.

## Risks / Trade-offs

- [A spec reads `workFrom`, `theme` or `loginEventId` of an offered
  account] → Task 2.1 searches the client and the SDK for a reader before
  the fields go, and task 3.1 runs the specs that use the mock.
- [`private-rooms-server-hardening` 12.8 lands and the mock is wrong
  again] → Its client mirror is part of that task; the scenario name is
  the same in both deltas, so the later one replaces this one.
