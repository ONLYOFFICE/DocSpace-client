# Design

## Context

See proposal.md, "Why". Each defect was traced in the code on 2026-11-03.

**H2 — key list not loaded counts as "no key".**
- `api.privacy.getEncryptionKeys` answers `[]` for a user without keys. In
  the client, `userStore.encryptionKeys === null` therefore means "not loaded
  or failed". The start-up load swallows its error
  (`packages/shared/store/AuthStore.ts:290`).
- Three places read `null` as "no key":
  - `CreateRoomDialog.js:186`: the auto-prompt for a Private or template
    start;
  - `CreateRoomDialog.js:203`: the room-type card;
  - `KeysManagement.tsx:101`: `hasKeys` hides or shows Generate and Import.
- `usePrivateRoomKeyGate` never passes `hasExistingKeys` to
  `useGenerateKeyFlow`.
- In the SDK, `EncryptionIdentityStore.loadKeys` sets `keys = []` on an error
  (`(private)/_store/EncryptionIdentityStore.tsx:77`). `keysLoaded` is
  `keys !== null` (`EncryptionShell.tsx:97`), so `PrivateCreateRoomDialog`
  auto-prompts for a key. A failed reload when the tab regains focus also
  clears `userKeys`, which locks the identity.
- The server stores an envelope under any new id (`private-rooms/server-contract`
  "Key envelope creation"). The newest envelope then becomes the user's key
  (`selectUserKey`), so files wrapped only for the old key become unreadable
  for the user.

**H3 — the SDK private pages lose the opt-in.**
- Three URL writers in `(rooms)` push `?${filter.toUrlParams()}`:
  `rooms-filter/useRoomsFilter.tsx:120`, `rooms-list/index.tsx:860` and
  `empty-view/index.tsx:116`. The private list and archive render them
  through `RoomsLayout`.
- `RoomsFilter.toUrlParams` keeps no parameter it does not own
  (`packages/shared/api/rooms/filter.ts`), unlike `FilesFilter`, which appends
  `getOtherSearchParams()`.
- `usePrivateRoute` and `usePrivateFrameBridge` rebuild the opt-in from the
  live `useSearchParams()`. Next 16.4.3 keeps that in sync with `pushState`.
- The room page returns `null` without the opt-in
  (`private/[roomId]/page.tsx:87`). The layout, which renders the
  not-available view, does not run again on a soft navigation.

**M1 and M2 — cancelling an encrypted upload.**
- The client aborts the orchestrator through
  `when(() => self.uploaded || file.cancel, abort)`
  (`uploadDataStore/chunkUpload.helpers.ts:829`, added in 289a97ff0d0).
- The orchestrator (`encrypted-upload-orchestrator.ts`) checks the signal at
  three points: before the wrap stage (`:725`), before the self-wrap (`:514`)
  and inside the members' fan-out (`:531`, `:564`).
- An abort there returns `aborted` with the stored `fileId`. The client
  returns silently on `result.aborted` (`:875`). The file stays without the
  uploader's entry, or without the members' entries, and is never marked
  pending.
- The row's cancel button is shown until the row gets a `fileId`, which
  happens only after the orchestrator returns (`UploadPanel/FileRow.js:289`).
  A cancel during the wrap stage is therefore reachable. The batch cancel
  marks every file still uploading with `cancel: true` (`cancelUploadImpl`).
- With parallel chunks, a cancel makes axios reject `uploadChunkParallel` or
  `finalizeUploadSession` with a `CanceledError`, which is not the
  orchestrator's `AbortedError`. The result is `failedAt: "upload"`, and
  `failUploadSession` writes the transport's message ("canceled") as the row
  error.
- In the sequential path the last chunk request takes no signal, and the
  check after the loop can still abort a session whose last chunk was
  already sent.

**M4 — the key-change queue reuses the open dialog.**
- `EncryptionContext` renders one `<KeyChangeDialog visible>` while
  `keyChangeRequest?.displayName` is set. `settleKeyChange` replaces the
  request with the next one in the same render tree (`:474-479`, `:573-585`).
- ui-kit's `Modal` takes the focus in an effect keyed on `[visible, contentRef]`,
  so it does not take it again.
- `KeyChangeDialog` keeps the previous fingerprints in state until its digest
  effect resolves.
- Member-key producers always pass a display name, so the next request opens
  in the same instance.

**M5 — the name lookup reaches the 403 handler.**
- For a request without a name, the context calls `getUserById`
  (`EncryptionContext.tsx:426-444`). No caller passes `senderDisplayName` for
  sender-key mismatches, so every download, open or name recovery that hits a
  changed sender key does the lookup.
- On the server, `UserController.GetProfileByUserId` (`[HttpGet("{userId}")]`,
  `products/ASC.People/Server/Api/UserController.cs:1257-1293`) throws
  `SecurityException` when `UserManager.CanUserViewAnotherUserAsync` is false.
  That method answers false for any caller of type User or Guest asking for
  someone else (`common/ASC.Core.Common/Users/UserExtensions.cs:170-187`).
- On the client, the 403 runs the forbidden handler for `/private` and
  `/rooms/...` addresses (`packages/shared/utils/axiosClient.ts:597-613`). In
  the client that toasts Common:AccessDenied and calls
  `refreshRightsAfterForbidden` (`Shell.jsx:301-312`).
- Confirmed through CodeGraph on 2026-11-03: the route attribute is at
  `UserController.cs:1257`, the check at `:1289` and the throw at `:1291`;
  the User or Guest branch is at `UserExtensions.cs:184`.

**M6 — cancelling inside key generation.**
- `useGenerateKeyFlow` wires `onCancel={reset}` on both dialogs, so a cancel
  calls neither `onError` nor anything else.
- `usePrivateRoomKeyGate` closes the creation only on `onError` or on a
  declined prompt. The client and SDK create dialogs both use the gate.

## Goals / Non-Goals

**Goals:**
- Every fix carries a test that fails on the current branch.
- Fixes live in shared code wherever the client and the SDK share the defect.

**Non-Goals:**
- Reworking the upload pipeline beyond the cancel stages.
- Changing `RoomsFilter.toUrlParams` for the client, whose addresses carry no
  foreign parameters.

## Decisions

1. **"Unknown" is a state of its own for the user's key list.**
   - The client treats `encryptionKeys === null` as unknown, and the SDK
     store keeps the last good list on an error. `keysLoaded` becomes true
     only after a successful load.
   - Before a key offer, the create flows await `refreshKeysFromServer`. They
     offer generation only when it returned an empty list, and otherwise
     toast Common:EncryptionKeysLoadFailed and close the private start.
   - The keys page shows the failure with Common:TryAgain instead of Generate
     and Import.
   - The gate passes `hasExistingKeys` through as a second guard.
   - *Alternative:* default the list to `[]` on error.
   - *Why not:* that is the defect.

2. **A cancel stops counting once the last chunk is on its way.**
   - The orchestrator passes the signal to session start and chunk sending
     only. `finalizeUploadSession` and the wrap stage run without it, and
     after the last chunk was sent the stage moves to "stored" with no further
     signal check.
   - The client then treats a successful result as uploaded even if the row
     was cancelled, and clears its cancel mark.
   - *Alternative:* delete the stored file on a late cancel.
   - *Why not:* deletion of encrypted files bypasses the recycle bin, and a
     failed delete would leave the same orphan with an extra error path.
     Completing the wraps keeps the file readable and the outcome honest.

3. **A transport cancel counts as a cancel.** The orchestrator's catch
   returns `aborted` when the error is its `AbortedError` or the signal is
   aborted, whatever error class the transport raised.

4. **The client's cancel watcher reacts to the row's cancel mark only.**
   `self.uploaded` is also set when a later batch finds nothing to start
   (`chunkUpload.helpers.ts:440`). The batch cancel already marks the rows, so
   the watcher drops `self.uploaded`.

5. **Each key-change request remounts its dialog.** The dialog gets
   `key={userId:newKey}`, so the Modal takes the focus again and the
   fingerprints start empty. `settleKeyChange` takes the request it answers
   and shifts the queue only when that request is still at its head, so a
   stale click cannot answer the next one.

6. **The name lookup skips the forbidden handler.**
   - `getUserById` takes an optional `skipForbidden` option, passed to
     `request` the way the upload session request does, and the context uses
     it. A failed lookup keeps the user-id fallback.
   - *Alternative:* take the name from the room members list.
   - *Why not:* sender-key mismatches are raised for a file, without a room
     roster at hand.

7. **The generation flow reports a user cancel.** `useGenerateKeyFlow` takes
   an `onCancel` called from both dialogs' cancel paths. The gate forwards it
   to an `onKeyGenerationCancelled` the create dialogs supply. They close the
   creation when it started on the Private type or from a template, and keep
   the dialog open when a type card started it.

8. **The SDK keeps the opt-in it was opened with.**
   - The `(private)` layout already renders only with the opt-in. It provides
     a `PrivateRoomsOptInContext` set to true, and `usePrivateRoute` and
     `usePrivateFrameBridge` build their paths from that context instead of
     `useSearchParams()`.
   - The three `(rooms)` URL writers go through one SDK helper that appends
     the current parameters `RoomsFilter` does not own, as
     `getOtherSearchParams` does for files. The address keeps `privateRooms`
     for reloads.

## Risks / Trade-offs

- **A late cancel of a large batch keeps files the user meant to drop.** →
  The files are listed as uploaded, and the user deletes them like any file.
  The spec states this outcome.
- **The keys page shows an error where it used to show Generate.** → This is
  the intended outcome; Common:TryAgain reloads the list.
- **The SDK URL helper keeps an unrelated host parameter longer than before.**
  → The same rule already applies to the files list.

## Migration Plan

None: client-side fixes only, no data migration. Rollback is a revert of the
commits.
