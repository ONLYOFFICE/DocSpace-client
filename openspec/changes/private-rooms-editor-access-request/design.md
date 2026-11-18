# Design

## Context

See proposal.md, "Why". No stashed design document covers this; the key flow
of the editor page was last changed by `private-rooms-editor-error-states`
(archived 2026-11-11), whose states and `retry` stay as they are.

The key flow is one effect of the key hook
(`packages/doceditor/src/hooks/useFileEncryptionKeys.ts`). Its dependencies
include the key-list flags of the encryption wrapper, the configured-key flag
and the unlock function of the encryption context, and an attempt counter
that `retry` raises. Each run starts with the request for the access entries
and drops its own result when a later run has replaced it, so the request of
a replaced run is sent and thrown away. The flow may start before the key
list has arrived, which the scenario "User cancels unlock" of the main spec
relies on (the unlocking state while keys are still loading), so the order of
the steps is not changed.

The API client hands the hook the error of the HTTP library as it is: an
error without a `response` is a request the server did not answer (the time
limit, the network), an error with one carries the status.

## Goals / Non-Goals

**Goals:**

- One request for the access entries per file and attempt.
- One silent repeat of a request without an answer.

**Non-Goals:**

- A cache across page loads, tabs or files.
- A change of the order of the flow (key list first, then the entries).
- A repeat for the other requests of the page.

## Decisions

1. **The request is kept per file and attempt inside the hook.** A reference
   holds the promise of the request under the key "file id and attempt";
   every run of the effect with the same key awaits that promise, fulfilled
   or rejected. `retry` raises the attempt, so Common:TryAgain sends a new
   request. Alternative considered: wait for the key list before the first
   request. Rejected: it removes one of the restarts only and changes the
   state shown while keys are loading. Alternative: a module-level cache in
   `packages/shared`. Rejected: the other callers of the route (download,
   media viewer, upload) read the entries once and must see fresh ones.
2. **The repeat sits inside the kept request.** The promise the reference
   holds is "request, and once more if no answer came", so restarts of the
   effect cannot multiply the repeats. An error with a `response` is thrown
   at once.
3. **No delay before the repeat.** A request that ran into the time limit
   has already waited 30 seconds; a network error is repeated at once and
   fails again at once if the network is down, which ends in the load-failed
   state with its button as before.
4. **A rejected attempt stays rejected.** A restart of the effect after a
   failure shows the load-failed state again without a request; only `retry`
   asks again. This keeps a failing server from being asked on every change
   of the key state.

## Risks / Trade-offs

- [The entries change while the page is opening, for example the user is
  given access a second after the first request] → the flow ends in the
  no-access state as it would have a second earlier; a reload reads them
  again. The window is the opening of one page.
- [Up to 60 seconds of the loading state when the server answers neither
  request] → accepted; the limit of API requests is out of scope
  (proposal.md).
- [The development build runs effects twice] → the reference outlives that
  double run, so the count is one there as well; checked on the stand in
  task 1.3.
