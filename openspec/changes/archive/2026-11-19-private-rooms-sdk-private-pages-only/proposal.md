# Proposal

## Why

`private-rooms/sdk-surface` says that the SDK lists and opens private rooms
only on its private pages ("Private rooms only through the private pages")
and that no generic flow runs on a private room. This change spells that
rule out for each SDK address and entry, with a scenario and a test for
each, and states the neighbouring rules the same way: the frame events sent
to the host, the search of the copy and move pickers, the keys-management
links, the upload and create paths of the private pages, and the frame
methods of the client that create items.

## What Changes

- Every SDK address that names a private room or a folder inside one (the
  generic room pages, active and archived, the personal files page, the file
  selector and the uploader) and every in-place navigation of a generic page
  to such a folder continues on the private page of that room. Where the host
  has not opted in, or the page cannot serve the private pages, it shows the
  not-available view. The decision is taken from the room on the folder's
  path, with one request that carries only the folder's id, before the
  folder's contents are requested and before any search text is sent.
- The room selector keeps listing no private room; a test holds it.
- The chat page shows the not-available view when its scope (`agentId` or
  `entityId`) is a private room or a folder inside one, or its `fileId` is an
  encrypted file, and mounts no chat. The AI agent page opens only AI agent
  rooms; for any other room, a private one included, it shows its
  agent-not-available state without requesting the room's contents.
- Frame events carry no item of a private room: an encrypted file opened
  while the host subscribed to `onFileManagerClick` is opened by the SDK
  itself, as `onEditorOpen` already is, and the navigation event of the
  private pages carries no search or filter text.
- The copy and move pickers of the private pages offer no search.
- Every link to the keys-management page, the reset link of the ghost-state
  toast included, is built from the origin the SDK is served from and falls
  back to the in-place explanation when the page cannot be opened.
- The private pages upload and create only through their encrypted paths,
  never through the generic ones. An archived private room offers neither,
  whatever rights it reports.
- The client in an embedding frame refuses the `createFile` frame method for
  a private room or a folder inside one, and `createFolder` there unless the
  frame carries the private-rooms opt-in, before any request about the new
  item.
- The host-sync cases of `packages/sdk/__tests__/e2e/private/private-security.spec.ts`
  move onto the existing private fixture and SDK host fixture and are
  enabled.

No new user-facing text: the refusals reuse the not-available view
(Common:UnderDevelopment) and Common:EncryptionKeysManagedInProfile. No locale
change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sdk-surface`: four requirements modified ("Private rooms
  only through the private pages", "No search in private rooms", "No upload
  or creation without the create right", "Forgot passphrase and device setup
  link out to the client"); two added ("Private addresses are decided before
  anything is listed", "Frame events carry no item of a private room").
- `private-rooms/file-operations`: one requirement added ("Frame methods
  create nothing in a private room without the opt-in").

## Out of scope

- The external-link page of the SDK (`/sdk/public-room`): owned by
  `private-rooms-external-links`.
- Framing of the SDK private pages, the opt-in and the owner-change flow:
  `private-rooms-sdk-embedding-and-parity`. SDK conversion and the Copy of
  the selection menu: `private-rooms-withheld-actions-gaps`. Tests of the
  shell effects that this change does not alter:
  `private-rooms-test-coverage-gaps`, which also adds a test file for the
  ghost-state toast (task 2.6 adds its case there if that file exists by
  then).
- An encrypted uploader or a private file selector: the uploader and the
  selector refuse a private target; they do not get a private variant.
- The copy picker of the client application (`packages/client`): not checked
  in this review.
- The eight cases of `private-security.spec.ts` that need other
  infrastructure stay `test.fixme`: `csp-headers` (the policy is set by the
  SDK proxy, which the test server does not run; a `/private` case of
  `proxy.test.ts` is planned in `private-rooms-test-coverage-gaps`),
  `abort-on-lock-upload`,
  `abort-on-lock-download` and `401-mid-upload` (slowed transfer handlers),
  `broadcast-lock` and `broadcast-user-scope` (a two-context fixture),
  `auto-lock-tamper` and `tofu-migration` (no relation to addresses or frame
  events).
- The ui-kit selector: the picker search is switched off by the SDK (design
  decision 4). A kit change that hides the search only while the picker shows
  a private room would be a separate change in `docspace-ui-kit-react`.

## Server and Document Server

Nothing is needed from `../server` or the Document Server. The change relies
on server behaviour that exists (design.md, "Server facts"): the folder path
request returns the room entry with its private setting, and the Rooms area of
the rooms list returns no private room.

## Decisions

Taken by the owner on 2026-11-19; decision 6 was open until task 1.8 and
was taken, with decision 7, after it:

1. The uploader and the file selector show the not-available view for a
   private target, as the private pages do without the opt-in; no new text.
2. The pickers of the private pages lose search in every section, not only
   inside private rooms, because the SDK cannot tell from outside the kit
   which folder the picker shows. A kit change can refine it later.
3. Keys-management links use the frame's own origin; the owner confirmed
   that the SDK is always served from the origin of the client application.
   "Client not reachable" then means that the browser refused the new tab.
4. `createFolder` through a frame method stays allowed in a private room when
   the frame carries the opt-in, since folder titles are plain text by design
   (`encryption-core`, "Metadata is visible to the server").
5. Under OAuth (`auth=oauth`) the private pages are not served. A private
   target there shows the not-available view in place instead of a redirect.
6. `/sdk/chat` (read in task 1.8, design.md "The chat page") shows the
   not-available view for a private scope or an encrypted file, as the
   uploader and the file selector do, and mounts no chat; no new text.
7. `/sdk/ai-agents/[agentId]` decides by the room type, with one request
   carrying the room id before the room's contents, and shows its existing
   agent-not-available state for any room that is not an AI agent room.

## Impact

- SDK: `packages/sdk/src/app/(rooms)/_utils/private-room-address.ts` (moved
  to a module shared by the route groups), `(rooms)/rooms/[roomId]/page.tsx`,
  `(rooms)/archive/[roomId]/page.tsx`, `(personal-files)/personal-files/`
  (`loadData.ts`, `page.tsx`, `page.oauth.client.tsx`),
  `(selectors)/file-selector/` (`loadData.ts`, `page.tsx`,
  `page.oauth.client.tsx`), `uploader/` (`page.tsx`, `page.oauth.client.tsx`),
  `(docspace)/_hooks/useFolderActions.ts`, `(docspace)/_hooks/useFilesActions.ts`,
  `(personal-files)/_hooks/useDocsActions.ts`, `(personal-files)/_hooks/useDocsHotkeys.ts`,
  `(personal-files)/_components/docs-layout/`, `(private)/private/[roomId]/page.client.tsx`,
  `(private)/_hooks/usePrivateFrameBridge.ts`, `(private)/_hooks/useKeysManagementLink.ts`,
  `(private)/_utils/keys-management-link.ts`,
  `(private)/_components/private-shell/GhostStateToastEffect.tsx`; unit tests
  next to each.
- SDK: `(chat)/chat/page.client.tsx` and
  `(ai-agents)/ai-agents/[agentId]/page.client.tsx`, with unit tests.
- Client: `packages/client/src/pages/Home/Hooks/useSDK.js` and a unit test.
- E2E: `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` and
  `private-security.spec.ts`.
