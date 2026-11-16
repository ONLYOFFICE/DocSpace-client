# Proposal

## Why

Two end-to-end cases of private rooms fail for reasons of their own, found
on 2026-11-16 by the runs of `private-rooms-mock-server-parity` 3.1:

- The two "Re-encryption aborted" cases of
  `packages/client/__tests__/private-room-invite.spec.ts` fail now and
  then, about one run in ten, at their first assertion: no file key of the
  uploader. Their helper holds every key write once the upload "has
  settled", and takes a quiet network for that. When the key write of the
  upload itself comes after the quiet moment, the helper holds it too.
- "List header" of `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`
  looks for the heading "Private". The section is named "Private rooms"
  since `a43b9930315` (2026-11-13), which followed the new name in the
  client spec and not in the SDK one. "Archive header" of the same file
  checks that no heading "Private" is shown, which nothing can fail any
  more.

A failing case that says nothing about the product hides the next one that
does.

## What Changes

- The helper of the client spec waits until the uploaded file holds the
  uploader's key before it starts holding key writes.
- The two SDK cases name the section as the interface does.

No behaviour of the product changes, so the change carries no spec delta
(`skip_specs`).

Out of scope: any other case of the two specs.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- `packages/client/__tests__/private-room-invite.spec.ts`
- `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`
