# Design

## Context

See proposal.md for the motivation. No stashed design document covers the
media viewer; it is newer than them.

The media viewer page (`packages/sdk/src/app/media-viewer/`) already runs
the private-room check every generic SDK page uses: the room on the
folder's path decides (`private-rooms/sdk-surface`, "Private addresses are
decided before anything is listed"). The server page loads the path with
the server request, the OAuth page with the API client. A private target
renders the shared not-available view, which sends `onAppReady`.

What the server does, read in `../server` through CodeGraph:

- The folder path, `GET api/2.0/files/folder/{folderId}/path`
  (`products/ASC.Files/Server/Api/FoldersController.cs:559-581`, action
  `GetFolderPath`), carries no `[AllowAnonymous]`, unlike the folder
  listing (`:445-446`, `GetFolderByFolderId`) and the folder information
  (`:526-527`, `GetFolderInfo`) next to it. A visitor without an account
  is therefore refused the path even with a link key; on the stand it got
  401 on 2026-11-20 while the listing with the key answered 200.
- `GET api/2.0/files/share/{key}`
  (`products/ASC.Files/Server/Api/SecurityController.cs:579-586`,
  `GetExternalShareData`) needs no account and answers an
  `ExternalShareDto`: `Id` is the room, folder or file the link points at
  (`ApiModels/ResponseDto/ExternalShareDto.cs:56`), and `IsRoom` is true
  when the link opens a whole room (`:104`). A refused link is reported in
  `status`, which the SDK proxy already maps to the link error events.
- `GET api/2.0/files/folder/{folderId}` answers a visitor whose external
  link grants access to the folder and 401 otherwise
  (`FoldersController.cs:521-538`). Its `private` field is the folder's own
  `SettingsPrivate` (`Core/ApiModels/ResponseDto/FolderDto.cs:122`, set at
  `:595`).
- The private setting belongs to the room: the server itself walks up to
  the parent room to know whether an entry lies in a private room
  (`Core/Helpers/DocSpaceHelper.cs:191-196`,
  `LocatedInPrivateRoomAsync`), so a folder's own field says nothing for a
  folder inside a room.
- No link with access can be set on a private room or on anything inside
  one: `FileSharingAceHelper.SetAceObjectAsync` throws a security
  exception (403) for such a link and lets a revocation through
  (`products/ASC.Files/Core/Utils/FileSharing.cs:107-113`).

## Goals / Non-Goals

**Goals:**

- One decision for every caller of the media viewer, made before any file
  of the folder is listed or read.
- A visitor without an account keeps viewing a public room by its link.

**Non-Goals:**

- Changing the shared private-room check of the other SDK pages.
- Validating that the folder named by the address lies under the link's
  target: the server answers only what the link grants, and the gallery
  reports a refused listing as no access.

## Decisions

**D1. The path decides whenever it can be read.** Signed-in users and
OAuth frames read the path, so they keep the shared check unchanged. Only a
refusal for want of an account (401) together with a link key in the
address falls back to the link; every other failure keeps its event
(404 `onNotFound`, otherwise `onNoAccess`).

**D2. A link visitor is judged by the room the link opens.** The page
resolves the key with `GET files/share/{key}`. For a link that opens a
whole room (`IsRoom`), it reads that room with the key through
`GET files/folder/{Id}` and shows the not-available view when the room is
private. For a link to a folder or file inside a room, it lets the gallery
open: the server sets no link with access inside a private room
(FileSharing.cs:107-113), and the folder's own private field could not
tell anyway, since the setting belongs to the room. A room that cannot be
read ends in `onNoAccess`.

Alternatives considered:

- Skipping the check for a 401 with a key, as the branch does now. It
  decides nothing, and a link into a private room would pass unnoticed the
  day such links exist.
- Refusing every visitor whose link is not a whole room. Safe, but it
  breaks folder links for visitors while protecting nothing the server
  allows today.
- Deciding from the listing the gallery loads (`pathParts`). It names
  folder and room types only, carries no private setting, and would read
  the folder before the decision.

**D3. The page resolves the key itself.** The proxy already calls
`GET files/share/{key}` to validate the link, but it hands the page only
the link error. The page calls it again, on the 401 path alone, rather
than passing the whole answer through a request header: the call is
anonymous, reuses the anonymous session the first one opened
(SecurityController.cs:569-571), and the path is rare.

**D4. No new frame event.** The not-available view sends `onAppReady` as
on the other pages; failures use `onNotFound` and `onNoAccess`.

## Risks / Trade-offs

- [`private-rooms-external-links` allows links into private rooms] → D2
  would let a folder link inside a private room open the generic gallery.
  That change keeps the SDK out of its scope and serves link content only
  against a proof of the link's secret, so the gallery would get no
  plaintext; its SDK follow-up has to revisit D2 before the SDK serves its
  visitors.
- [One more anonymous request on the 401 path] → accepted; it runs only
  for visitors without an account.
