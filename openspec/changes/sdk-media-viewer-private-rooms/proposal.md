# Proposal

## Why

The Embed SDK gained a media viewer page that lists and plays the media
files of a folder named by its address. Like every generic SDK page it
must keep private rooms out (`private-rooms/sdk-surface`, "Private rooms
only through the private pages"), but no requirement names it yet. A
visitor without an account, who reaches a public room through its link,
also cannot read the folder path the SDK decides privacy from, so the
page needs another way to decide for that visitor.

## What Changes

- The media viewer page decides whether the folder it is given lies in a
  private room before it reads anything of the folder, on the server page
  and in an OAuth frame alike, and shows the not-available view for a
  private room or a folder inside one. Already on the branch.
- A folder whose path is missing ends in `onNotFound`, one that cannot be
  read otherwise in `onNoAccess`; an alias such as `@my` names no room and
  skips the check. Already on the branch.
- For a visitor without an account the page decides from the external
  link in its address: a link that opens a private room leads to the
  not-available view; a link to a room without the private setting, or to
  a folder or file inside a room, lets the gallery open; no link means no
  access. To be built: today the page lets such a visitor through without
  looking at the link.

Out of scope:

- Showing the contents of a private room in the media viewer. Private
  rooms stay on the private pages, which have no media viewer.
- Links that open encrypted content (`private-rooms-external-links`).
  That change keeps the SDK out of its scope; when it lands, its visitor
  pages are the place to revisit this decision.
- Any server change.

Decisions that need a human: none open. The treatment of a link to a
folder or file inside a room is decided in design.md (D2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sdk-surface`: "Private rooms only through the private
  pages" gains the media viewer scenario; "Private addresses are decided
  before anything is listed" makes room for a link visitor, and a new
  requirement states how the media viewer judges one.

## Impact

- Code: `packages/sdk/src/app/media-viewer/` (server page, OAuth page,
  helpers and their tests), the link resolution and folder requests in
  `packages/sdk/src/api/`.
- Server: no work. The change relies on what `../server` does today: the
  folder path (`GET api/2.0/files/folder/{folderId}/path`) is refused to a
  caller without an account, `GET api/2.0/files/share/{key}` and
  `GET api/2.0/files/folder/{folderId}` answer a visitor of a link, and no
  link with access can be set on a private room or anything inside one.
  Sources are cited in design.md.
- Embed SDK: no new event; the page keeps `onAppReady`, `onNotFound` and
  `onNoAccess`.
