# Design

## Context

See proposal.md for the why. Read on 2026-11-19 at `54bed4b404d` (client)
and `5636dd4a79` (server). The server files read below are unchanged at
`e5847cbaf5`, checked on the same day. No stashed design document covers
these behaviours.

Building blocks on the branch that this change reuses:

- `getPrivateRoomAddress` (`packages/sdk/src/app/(rooms)/_utils/private-room-address.ts`)
  builds the private page address of the room that holds a folder, keeping
  the request's parameters and the open subfolder. The generic room pages use
  it.
- `resolveFolderTarget` (`packages/shared/services/private-room/upload-target.ts`)
  takes a folder id and, unless the folder's section is known to lie outside
  the rooms sections, loads the folder's path and returns the room found on
  it: its id, its private setting and whether it is archived. The private
  room page already uses it to send a room without the private setting back
  to its generic page.
- A folder below the root of a private room is told apart by the room on its
  path, never by its own `private` field. That is how the client's
  `TreeFoldersStore.isPrivacyFolder` decides (the selected folder or any entry
  of its navigation path), and design decision 4 of
  `2026-11-12-private-rooms-key-lock-fixes` records why.
- The private layout renders the not-available view
  (`(private)/_components/not-available`, Common:UnderDevelopment) when the
  host has not passed the opt-in, so a redirect to a private address shows
  the right refusal without the redirecting page knowing about the opt-in.
- The private pages are server-rendered with the session cookie and have no
  OAuth variant. The personal files page, the file selector and the uploader
  each have one (`page.oauth.client.tsx`, `auth=oauth`).
- E2E: `packages/sdk/__tests__/e2e/private/fixtures.ts` seeds the
  `asc_auth_key` cookie and the fixture identity;
  `packages/sdk/__tests__/e2e/fixtures/sdkHost.ts` embeds an SDK page in a
  host page, records the frame events (`readSdkEvents`) and calls frame
  methods (`callSdkMethod`). `private-security.spec.ts` imports neither: it
  uses the bare base fixture, which is what its header lists as blockers B
  (cookie) and E (embedding).

### Server facts

Each claim below was located with CodeGraph and read in the source.

- `GET api/2.0/files/folder/{folderId}/path`
  (`products/ASC.Files/Server/Api/FoldersController.cs`, `GetFolderPath`)
  returns the breadcrumbs of the folder after a read check (403 without read
  access, 404 for a missing folder). The folder entries go through
  `FolderDtoHelper`, which sets `Private = folder.SettingsPrivate`
  (`products/ASC.Files/Core/ApiModels/ResponseDto/FolderDto.cs`). The room
  entry of the path therefore says whether the room is private.
- The rooms list maps `searchArea=Active` to `RoomPrivacyFilter.NotPrivate`
  and `searchArea=Active&privacyFilter=Private` to the private section
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs`, the rooms query
  before `GetAllVirtualRoomsAsync`; server test
  `products/ASC.Files/Tests/Tests/08_Private/PrivateRoomSectionTests.cs`).
  The room selector and the room view of the file selector request
  `searchArea=Active` without a privacy filter
  (`(selectors)/room-selector/loadData.ts`, `(selectors)/file-selector/loadData.ts`),
  so they get no private room. That matches the main `server-contract`
  requirement "Rooms list privacy filter". The kit's room selector sends
  its search and next pages without a search area, and the rooms list then
  takes the Rooms area (`VirtualRoomsController.GetRoomsAsync`,
  `searchArea ?? SearchArea.Active`; read at `e5847cbaf5`), so a search
  lists no private room either.

## Goals / Non-Goals

**Goals:** one address decision shared by every generic SDK entry, the
frame-event, picker, link and upload rules of the delta, the client frame
methods, and tests named after every scenario.

**Non-Goals:** a private variant of the uploader or the file selector; any
change to the private pages' own listing; a change to the ui-kit.

## Decisions

1. **One resolver, decided from the path, before the listing.** The address
   helper moves out of the `(rooms)` group into a module the route groups
   share. It takes a folder id and the request's parameters, calls
   `resolveFolderTarget` (one path request carrying only the id), and
   returns the private page address of the room (`/private/<roomId>`, with
   `folder` for a subfolder, the other parameters kept and `search` dropped)
   or nothing. An unreadable path rejects, and the caller renders its
   not-found view. Every generic entry calls it before it requests the
   listing, and requests the listing only when it returns nothing. Rejected:
   identifying the folder by its listing and then asking for the room's
   info, because a listing request carries the address's search text and
   asks for the folder's contents, and the decision has to come before both.
   A folder-info request alone would need the room id first, which only the
   listing or the path gives.

2. **Which ids are resolved.** Personal files resolves its `folder`
   parameter unless it is one of the section aliases (`@my`, `@favorites`,
   `@recent`, `@share`, `@trash`) or the id they resolve to; those sections
   hold no private room. The room pages resolve `folder ?? roomId`. The
   file selector resolves `id` unless it is empty or the Rooms section. The
   uploader resolves `targetId` when it is given. The in-place navigation of
   a generic page (`openFolder`, `openLocation` in
   `(docspace)/_hooks/useFolderActions.ts`) passes the folder's own
   `rootFolderType` when the folder is in the open list, so a folder outside
   the rooms sections costs no request, and resolves any other folder with
   the path request. The section of the open folder is not used: `openFolder`
   also opens the destination of an operation, the parent of a restored item
   and a breadcrumb, which can lie in another section. A path that cannot be
   read leaves the page as it is, with Common:UnexpectedError. `/sdk/personal-files/[destination]` only redirects to the
   personal files page and is covered there.

3. **What the refusal is, per entry.** With the session cookie, the room
   pages, personal files and in-place navigation go to the private page
   address (server `redirect` or `router.replace`). The private layout then
   shows the room or the not-available view, depending on the opt-in, which
   stays in the kept parameters. Under OAuth, and in the file selector and
   the uploader, which have no private counterpart, the page renders the
   not-available view in place and mounts no listing, selector or uploader.
   It still sends `onAppReady`, so the host is not left waiting.

4. **The pickers of the private pages run without search.** The SDK
   passes `withSearch={!isPrivate}` to the kit's `FilesSelector` in
   `(personal-files)/_components/docs-layout/index.tsx`. Rejected for now:
   switching the search per folder, which needs a kit property fed by the
   kit's own `isInsidePrivateRoom` state and a kit release (proposal,
   decision 2).

5. **Frame events.** `openFile` in `(docspace)/_hooks/useFilesActions.ts`
   skips `onFileManagerClick` for a file with `encrypted`, as
   `open-doc-editor.ts` does for `onEditorOpen`, and continues with the
   SDK's own open path (the media viewer or the editor). The private frame
   bridge builds the address it sends in `onNavigate` without `search` and
   without `filterValue` (`withoutSearchText` in `usePrivateFrameBridge.ts`).
   The generic docs bridge stays disabled on the private pages
   (`enabled: !isPrivate`).

6. **Keys-management links from the frame's own origin.**
   `useKeysManagementLink` builds the URL from `window.location.origin`,
   which is the portal that serves the SDK under `/sdk`.
   `GhostStateToastEffect` opens its reset link through the same hook, so
   the blocked-tab explanation applies there too. The URL is then always
   known, so "Client not reachable" is the case where `window.open` returns
   nothing; the two unit cases of that name are reworked to a refused tab
   (proposal, decision 3).

7. **Only the encrypted paths on a private page.** In
   `(personal-files)/_hooks/useDocsActions.ts`, with private semantics
   (`privateCreate` set), upload and create run only through the overrides
   the page passes. Without one they refuse, and the generic upload and the
   editor's create route are not used. The private room page passes no
   override for an archived room, and the layout offers no upload or create
   entry, tile or hotkey there (`isArchive`), independent of the rights the
   room reports.

8. **Client frame methods.** `createFile` and `createFolder` in
   `packages/client/src/pages/Home/Hooks/useSDK.js` call
   `resolveFolderTarget` for the given folder first. `createFile` is refused
   for a private target. `createFolder` is refused there unless the frame is
   opted in, read from the same availability the Private section uses
   (`AppsStore.isPrivateRoomsSectionAvailable`). A refusal is thrown into
   the existing `catch`, so the host gets a `toFrameMethodError` answer and
   `refreshFiles` is not called. A frame method cannot produce an encrypted
   file, and folder titles are plain text by design (`encryption-core`,
   "Metadata is visible to the server"), which is why the two methods differ.

### The chat page (task 1.8)

Read on 2026-11-19 at `777b4a0b412` (client) with the ui-kit build the
branch installs. `/sdk/chat` (`(chat)/chat/page.tsx`, `page.client.tsx`,
`page.oauth.client.tsx`) takes three ids:

- `agentId` (also from a request header) or else `entityId` is the scope of
  the chat (`chatEntityId`, passed to the kit's `AiAgentProviders`). The kit
  also uses the scope as the folder that files uploaded from the device in
  the chat go to (`ai-agent/providers/files/upload-files`).
- `fileId` is a file that `ChatParamsBridge` loads with `getFileInfo` and
  attaches to the chat.

Each of them can name a private room, a folder inside one or an encrypted
file, so the change gets a scenario for the page (proposal, decision 6).

9. **The chat page decides its ids before the chat is mounted.**
   `ChatPage` (`(chat)/chat/page.client.tsx`, also rendered by the OAuth
   variant) resolves a numeric scope (`agentId`, else `entityId`) with
   `resolveFolderTarget` and loads `fileId` with `getFileInfo` before it
   renders `AiAgentProviders`. A private scope or a file with `encrypted`
   renders the not-available view, and `onAppReady` is sent as before. A
   file inside a private room is always encrypted, so the file's own flag
   decides and needs no path request. `ChatParamsBridge` attaches the file
   it is given; it no longer loads the file itself (proposal, decision 6).

10. **The AI agent page opens only AI agent rooms.**
    `(ai-agents)/ai-agents/[agentId]/page.client.tsx` reads the room with
    `getFolderInfo` before `getFolder`. A room whose `roomType` is not
    `RoomsType.AIRoom` sets the agent-not-available state
    (`setIsErrorAIAgentNotAvailable`), so the room's contents are not
    requested and no chat is mounted (proposal, decision 7).

## Risks / Trade-offs

- [One more request per generic address and per in-place navigation into
  the rooms sections] → The path request is small, and navigation outside
  the rooms sections needs none (decision 2).
- [A redirect drops `search` from a private address] → Intended: the
  private pages search on the client only ("No search in private rooms").
- [The OAuth variants cannot show a private room] → Accepted for this
  version (proposal, decision 5); the not-available view says the feature is
  not offered there.
- [One more request before the chat or an AI agent opens] → One small
  request carrying an id; the chat makes none without a scope or a file.

## Migration Plan

None: client-side only, no data or setting changes. Rollback is a revert of
the task commits.
