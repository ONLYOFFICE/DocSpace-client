# Proposal

## Why

The editor page asks the server for the access entries of an encrypted file
more than once per opening: the key flow starts again whenever the user's key
list, the key state or the unlock function changes, and every start sends the
request anew. On the local stand of 2026-11-18 one opening sent three such
requests; two were answered at once, the third got no answer within the
30-second limit, and the page ended in "Could not load your encryption keys"
although the answer had been there twice
(`private-rooms-editor-contract` design.md, "Run of 2026-11-18 on the local
stack, Document Server 10.0.3.58", "Seen once, on the portal's side").

## What Changes

- One opening sends the request for the access entries once. Every restart of
  the key flow within the same attempt reuses that request and its answer.
- A request that got no answer from the server (the time limit or the network,
  no HTTP status) is repeated once without the user doing anything, before the
  flow ends in the load-failed state. A request the server answered with an
  error is not repeated.
- Common:TryAgain starts a new attempt with a new request, as it does today.

Out of scope:

- The other requests of the page (the user's key list, the files settings,
  the sender keys). In the development build the first two are sent twice by
  the double run of effects, which a production build does not have.
- The time limit of API requests (30 seconds, `public/scripts/config.json`).
- The error an editor reports after it has mounted (Document Server error
  codes); a way to repeat that opening is discussed apart from this change.
- The version badge of encrypted files, handed to the designers by the owner
  on 2026-11-18.

Decisions for a human:

1. One silent repeat, not more. With the 30-second limit a second repeat
   would keep the loading state for up to a minute and a half. Proposed: one.

Depends on no work in `../server` and none in the Document Server; the route
and its answer stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: the requirement "Editor fetches the
  file's access entries" gains the single request per attempt and the one
  repeat of a request that got no answer.

## Impact

- `packages/doceditor/src/hooks/useFileEncryptionKeys.ts` and its unit test
  `packages/doceditor/src/hooks/__tests__/useFileEncryptionKeys.test.tsx`.
- No API change, no locale key, no change in `packages/shared`.
