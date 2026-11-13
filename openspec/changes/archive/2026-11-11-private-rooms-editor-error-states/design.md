# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.
Nothing here depends on server behaviour: the change sorts the outcomes of
the client's own steps and does not read status codes.

Editor page, as read on 2026-11-11:

- `EncryptionProviderWrapper.tsx` reads the user's key list once. A failed
  read is stored as an empty list (`setKeys([])`), and `keysReady` turns
  true either way. The hook learns `keysReady` through
  `useEncryptionKeysReady`.
- `useFileEncryptionKeys.ts` runs one `acquire` per file: it reads the
  file's access entries (`getFileEncryptionAccess`), requires an entry of
  the user, calls `requireIdentity()`, loads the sender keys
  (`loadFileSenderKeysSafe`, which does not throw), unwraps the file key
  and recovers the display name. Its statuses are `off`, `loading`,
  `unlocking`, `ready`, `error`. A dismissed dialog gives `error` once the
  keys are ready; every thrown error gives `error`.
- `Editor.tsx` shows Common:LoadingProcessing while the flow is not ready
  and Common:SomethingWentWrong for `error`, through `EditorMessage`.
- `requireIdentity()` resolves to `null` both for a dismissed dialog and
  for a user without a configured key; the context's `hasConfiguredKey`
  tells the two apart.

## Goals / Non-Goals

**Goals:**

- A dismissed unlock dialog, a missing wrap, a missing key and a failed
  request each get their own message.
- Unlock and the failed requests can be repeated without a page reload.

**Non-Goals:**

- Automatic retries.
- Any change to what happens once the editor is mounted.

## Decisions

1. **The hook's `error` splits into named statuses.** `unlock-cancelled`,
   `no-access`, `no-key`, `load-failed`, and `error` for the rest. The
   page maps a status to a message and an action; the hook holds no text.
2. **How each status is reached, without status codes:**
   - `load-failed`: the read of the user's key list failed, or the request
     for the file's access entries threw;
   - `no-access`: the access entries arrived and hold no entry of the
     user;
   - `no-key`: the key list is known and the context reports no
     configured key;
   - `unlock-cancelled`: a key is configured and `requireIdentity()`
     resolved to `null`;
   - `error`: anything thrown after the access entries were read (unwrap,
     a refused key change).
   Order of the checks: key list, then access entries, then identity, so a
   user without a key is told to set one up before being told about a
   wrap they could not have.
3. **The hook returns `retry`.** It runs `acquire` again; for a failed key
   list it first asks the wrapper to read the list again. The wrapper
   exposes "the read failed" and "read again" next to `keysReady`, in the
   same context module. A failed read is no longer stored as an empty
   list.
4. **The page shows the message with one button** where an action exists:
   Common:UnlockKey for `unlock-cancelled`, Common:TryAgain for
   `load-failed`. The button is the kit's `Button`, under the text inside
   `EditorMessage`. While a retry runs the page shows the loading text
   again.
5. **Common:EncryptionKeysLoadFailed is reused for both failed requests.**
   Its text ("Could not load your encryption keys. Check your connection
   and try again.") fits the access entries too: they are the user's key
   for this file. No third text.
6. **The cancel-while-loading wait stays.** While the key list is still
   loading, a `null` identity keeps the `unlocking` status and the effect
   runs again when the list arrives, as today.

## Risks / Trade-offs

- [A refusal of the access-entries request shows the connection message]
  → The retry is harmless, and the change does not guess which status
  means a refusal; a file the user may not read is not opened by the page
  in the first place.
- [The no-access message gives no advice] → The owner took the short
  text (proposal decision 1); what the user should do next is left to
  card C10.
