# Proposal

## Why

AI is withheld in private rooms and on encrypted files on every surface: the
server denies the chat, the vectorization and the index export inside a
private room, the client offers no AI chat on a private address, the SDK
never offers it, and the editor does not initialise its AI plugin for an
encrypted file. The reason is one promise: the server has no clear text of a
private room. Every AI path of the portal today carries clear text through
the portal and stores part of it, so lifting the ban without a different
architecture would void the promise. On 2026-11-06 the owner decided to keep
the ban for now and to record the ways an integration could be built later,
so the next discussion starts from the facts rather than from scratch.

## What Changes

Nothing on the branch now. The ban stays as the main specs describe it
(`private-rooms/room-membership` "No AI chat in private rooms",
`private-rooms/sidebar-section` "No AI chat in the section",
`private-rooms/sdk-surface`, and the server denials recorded in
`private-rooms/server-contract` and `private-rooms-server-hardening`), and
the refusal of a private AI agent proposed by the server
(`private-rooms-server-hardening`, proposal decision 8) follows from it.

When an integration is scheduled, it is built in this order, each phase a
change of its own with its own specs:

1. **Editor-local AI on an encrypted file, with the model called from the
   browser.** The editor holds the clear text and the doceditor holds the
   file key, so the AI plugin can work on the document and attach files the
   doceditor decrypts itself; the model is called from the browser with the
   user's own provider access, the portal's gateway stays out, and the chat
   history stays in the browser or is stored as an encrypted file of the
   room. Behind a room-owner opt-in that members can see.
2. **Search over the room in the browser.** Decryption, embedding and the
   index all in the browser, the index kept as an encrypted file of the room
   wrapped for its members like any other file, so every member's browser
   can load and query it.
3. **Standalone portals with their own model.** The portal's gateway may
   carry clear text where the customer runs the model inside their own
   boundary; a portal setting, a room-owner opt-in and an audit event make
   it explicit. Never on SaaS.

Never: the server-side chat, vectorization or AI agents over a private room.
They need clear text on the server, which is what the private room exists
to prevent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None now (`skip_specs`). When a phase is scheduled, its change modifies
`private-rooms/room-membership` ("No AI chat in private rooms"),
`private-rooms/sidebar-section` ("No AI chat in the section"),
`private-rooms/sdk-surface`, `private-rooms/editor-integration` (the AI
plugin on an encrypted file) and, for phase 3 only, the denials of
`private-rooms/server-contract`.

## Impact

None now. The surfaces a scheduled phase touches are listed in design.md,
Context.

## Out of scope

- Any code change: the ban is kept.
- The positioning text of private rooms, which `private-rooms-release-gate`
  owns; a scheduled phase revises the promise it states.

## Decisions needed

None now. The decisions a scheduled phase needs are listed in design.md,
Open Questions, with the spikes that inform them.
