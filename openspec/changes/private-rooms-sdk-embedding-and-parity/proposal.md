# Proposal

## Why

The release-readiness review of 2026-11-19 looked at the SDK's private
pages from two sides: who can embed them, and whether they behave as the
client does.

Embedding. The main spec says the SDK keeps serving its private surface
"for embedding hosts", and the beta release notes tell hosts to set
`privateRooms` in the frame configuration. Neither holds for the SDK's own
private pages:

- The host library (`docspace-sdk-js` 2.2.0, every branch) has no
  `privateRooms` property in its frame configuration, no mode that opens
  `/sdk/private`, and its `navigateSection` answers only in Forms and
  Personal mode. A host cannot reach the private pages through it.
- The private pages tell the browser that only pages of the portal's own
  origin may frame them, and they send same-origin opener and resource
  policies (seen on a stand through nginx on 2026-11-19). The stashed
  design documents chose this on purpose: the private surface was planned
  for the portal's own pages only, and its script policy was accepted on
  that ground.
- The requirement that the opt-in is "removed together with the client
  flag at release" is stale: the client flag is gone, and
  `private-rooms-beta-release` decision 2 keeps the host opt-in.

Parity. On the private pages:

- An owner change never wraps the candidate's missing files first, so the
  server refuses it whenever the candidate lacks a file key, and the SDK
  then shows a general error.
- In an open private room the edit, invite and change-owner entries of the
  info panel menu do nothing.
- "Create room" at the room limit opens a quota warning made of raw
  translation keys, because the dialog reads namespaces the SDK does not
  ship.
- Pressing Create in the private-room dialog while the key list is still
  loading reports that the key list could not be loaded.
- Files cancelled in the name-clash dialog, or stopped by a lock, stay in
  the upload panel looking like running uploads, and the upload button then
  reports the batch as completed; "Cancel all" stops only the newest batch.
- When the leave step of "change owner and leave" is refused with 403, the
  SDK shows the server's text and keeps the dialog open although the room
  already has its new owner.
- A members search lists members the grouped members list leaves out.
- The content security policy requirement says connections are limited to
  the SDK's own origin, while production allows any https origin; no unit
  test covers the private routes of the proxy.

## What Changes

- The SDK private pages stay framed by the portal's own origin only in this
  version, and the specs, the release notes and the host-library hand-over
  say so (decision 1). The opt-in requirement loses its stale sentence.
- The content security policy requirement describes the policy the proxy
  sends, and unit tests pin it (decision 2).
- An SDK owner change wraps the candidate's missing files before it asks for
  the transfer, and counts the files the server names when it refuses one,
  as the client does.
- The info panel menu of an open private room starts the private edit,
  invite and owner-change flows.
- The quota warning takes its texts from Common, and the translation test
  covers every component the private pages render.
- Create waits for a key list that is still loading.
- A file cancelled in the name-clash dialog leaves the upload panel, a file
  stopped by a lock fails with the locked-upload message, and "Cancel all"
  stops every running upload.
- A refused leave after an owner change shows
  Common:EncryptedAccessChangeRefused and closes the dialog.
- A members search leaves out whom the grouped list leaves out.

Out of scope:

- Embedding the SDK private pages in another origin (decision 1, option B).
  It is recorded in design.md as a follow-up with its preconditions.
- Any change to `docspace-sdk-js`: a separate repository. Its items are a
  hand-over (design.md, "Hand-over to the host library").
- Generic SDK addresses of private rooms, frame events, search text and
  selector routes: `private-rooms-sdk-private-pages-only`.
- SDK conversion and the Copy of the selection menu:
  `private-rooms-withheld-actions-gaps`.
- The quota warning of the generic rooms list is fixed by the same task,
  since the dialog is shared, but no requirement is added for it.

Findings of the review left out after reading the code:

- An invitee "with an empty avatar sent by e-mail": every user the server
  returns carries an avatar address (`EmployeeDtoHelper.InitAsync` sets it
  from `GetAvatarUrlsAsync`, default photo included), and the invite panel
  of a private room refuses a typed address, so no portal user reaches the
  e-mail branch.
- A guest creating a private room: the SDK offers room creation to
  administrators and room administrators only, and the client closes the
  dialog for a guest the same way.

Dependencies:

- `../server`: nothing new. The owner change uses `POST api/2.0/files/owner`,
  which answers 409 while the candidate lacks a file key, and
  `GET api/2.0/privacyroom/{roomId}/access/missing`, both on the branch.
- `docspace-sdk-js`: one hand-over item (decision 1), not blocking.
- No Document Server work.

## Decisions

Taken by the owner on 2026-11-19:

1. **Who may embed the SDK private pages in 4.1.0:** pages of the portal's
   own origin only, as today. The specs state it as a limitation of this
   version, the release notes say that hosts get private rooms through the
   embedded client frame and not through `/sdk/private`, and the host
   library is asked only to declare `privateRooms` for that frame.
   Embedding by origins the portal trusts is left to a later change. It
   first needs a stricter script policy and a new review of a page that
   takes the passphrase and the recovery phrase, a stand run of the storage
   a frame of another origin gets (the device unlock, the trust list of
   member keys and the lock across tabs would each start over per host), a
   frame permission for passkey unlock, and a release of the host library.
2. **Connections allowed by the private pages in production:** kept and
   described. The SDK's own origin and any https origin, as since
   `7ed38a24255`, because encrypted file bodies may come from the storage's
   own address, which the proxy does not know. Where the portal's own
   policy is served too, the browser applies both.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/sdk-surface`: the framing limit, the opt-in, the content
  security policy, the owner change, the info panel menu of an open room,
  the bundled translations, Create during a key-list load, the upload panel,
  a refused leave after an owner change and the members search.

## Impact

- `packages/sdk/src/proxy.ts` and `proxy.test.ts`: tests only, under the
  decisions taken.
- `packages/sdk/src/app/(private)`: the owner-change flow and dialog, the
  info panel, the identity store, the create dialog, the encrypted upload
  hook, the members view, `translations.test.ts`.
- `packages/sdk/src/app/(rooms)/_components/quota-warning-dialog`,
  `packages/sdk/src/app/(docspace)/_store/UploadStore.tsx`,
  `packages/sdk/src/app/(personal-files)/_components/upload-panel`.
- `public/locales/*/Common.json` and `.meta`: the quota warning texts copied
  from the client's Payments and MainBar namespaces.
- `openspec/changes/private-rooms-beta-release/release-notes.md`: the
  embedding paragraph.
- `docspace-sdk-js`: hand-over only.
