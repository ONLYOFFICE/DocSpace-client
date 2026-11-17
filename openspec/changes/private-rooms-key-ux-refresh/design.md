# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
decisions: they come from the UX concept review of 2026-11-17, which read the
designers' stand, the current release on a live stand and the code of
`release/v4.1.0`.

What the code does today, read on 2026-11-17:

- Key generation is a hook that renders two dialogs one after another, the
  passphrase dialog in its creation mode and the recovery phrase display.
  The key pair and the recovery phrase are generated when the passphrase is
  submitted; the key is registered when the recovery phrase is confirmed.
- The creation of a private room without a key shows a confirmation with
  `Common:PrivateRoomKeyRequiredTitle` before that hook runs.
- The passphrase dialog serves both creation and unlock. Its confirm action
  is `Common:ContinueButton` unless the caller passes a label.
- A locked key in a private room is a bar built on the kit's public-room
  bar, shown once the unlock request the room raised on entry has settled.
- The auto-lock setting is a component of the Keys management page.
- The fingerprint is grouped by a function private to the key-change dialog
  and printed ungrouped in Keys management.
- The invite panel of a private room lists people with the kit's people
  selector, which loads the people itself and has no way to mark an item.
  The keys of the selected people are read after the send.

## Goals / Non-Goals

**Goals:**

- One place owns each piece: the key setup dialog in the shared package, the
  indicator and the locked-key block in the client, the fingerprint grouping
  in the shared encryption services.
- The callers of key generation keep their contract: they request the flow
  and render what it returns.
- No new server route and no change to what the server stores.

**Non-Goals:**

- A new look for the kit dialogs. The steps reuse the kit's modal dialog,
  buttons, fields and checkbox.
- The SDK's own header and room body.
- Any change to when the key is generated or registered.

## Decisions

### 1. Key setup is one dialog that owns its step

The hook keeps its shape (a request function, a pending flag, the dialogs to
render) and renders one dialog whose body depends on the step: explanation,
passphrase, recovery phrase. The passphrase form and the recovery phrase
content are taken out of their dialogs into parts that the new dialog and
the existing dialogs both render, so the unlock dialog, the passphrase
change and the rules of the two forms stay in one place.

The key pair and the recovery phrase are generated once, when the passphrase
step is confirmed for the first time, and kept while the dialog is open.
Going back and forward reuses them; only the passphrase that seals the
envelope is taken from the form at the last confirmation. This is what makes
"the same 24 words" hold.

Alternative considered: three dialogs opened in sequence with a shared step
indicator. Rejected: the page behind would flash between them, the focus
would be returned and taken three times, and Back would have to reopen a
closed dialog.

### 2. The prompt before key setup goes away

The creation gate stops rendering the confirmation and requests key setup
directly. The explanation step carries the cancel action that the prompt
had. `Common:PrivateRoomKeyRequiredTitle` and
`Common:PrivateRoomKeyRequiredDescription` lose their last use and are
removed from every locale.

### 3. The indicator reads the encryption context

The indicator is a client component in the section header. It reads the
state the encryption context already publishes (key list known, key
configured, unlocked) and calls its lock and unlock functions. It holds no
state of its own, so a lock by the idle timer, by another control or by
another tab's event shows at once.

The popover renders the existing auto-lock setting. The setting moves from
the profile folder to a place both the profile and the header import, with
no change to how the preset is stored, so a pick in one place is the pick in
the other.

Whether the device is remembered is read the same way Keys management reads
it for its "remembered until" line.

### 4. The locked-key block replaces the bar in place

The block is shown under the same conditions as the bar: a private room or a
folder inside one, the key list known, a key configured and locked, and the
room's entry request settled. It renders above the file list instead of
inside the bar slot. In a room with no files it takes the place of the empty
view, since an empty view that invites to upload cannot be acted on while
the key is locked.

The file list is not touched. It already shows the names as stored while the
key is locked, and the block adds nothing over it.

### 5. One function groups a fingerprint

The grouping function moves from the key-change dialog to the encryption
services of the shared package and both places call it. The value copied to
the exported file name stays ungrouped.

### 6. The mark is decided per loaded page, by the kit selector's new hook

Server contract, read in `../server` at `9b360f0e74` through CodeGraph:

- `GET api/2.0/privacyroom/{roomId}/access/candidates` with `userIds`
  repeated in the query,
  `products/ASC.Files/Server/Api/PrivacyRoomController.cs`,
  `GetRoomCandidateKeys`; request
  `products/ASC.Files/Server/ApiModels/RequestDto/GetRoomCandidateKeysRequestDto.cs`.
- `products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`,
  `GetKeyPairForRoomCandidatesAsync`: the caller must be able to change the
  room's access; a user who does not exist, is terminated or is a guest is
  skipped; a user with no stored keys is skipped; the answer lists the keys
  that carry a public key, with the private half removed.

So a listed portal user who is absent from the answer has no key. The people
list of a private room holds no guests and no groups, and the inviter can
change the room's access, so the answer covers every row.

The kit's people selector gets one optional property: a function that
receives the people of a loaded page and returns, per person, a label and a
description to show in the row. The selector calls it after each page and
renders the label next to the name once the result arrives. The client
passes a function that asks the candidates route for the ids of the page.

Alternatives considered:

- Reading the keys of every portal user up front. Rejected: the list is
  paged and may hold thousands of people.
- A new field in the people list of the server. Rejected for this change: it
  is server work, and the Contacts column that would also need it is out of
  scope.
- Disabling the rows of people without a key through the selector's existing
  disabled list. Rejected by decision 2 of the proposal; it stays a small
  step if that decision changes.

## Risks / Trade-offs

- The query string of one page of ids may grow long. → The client asks in
  batches of a fixed size and merges the answers; a failed batch leaves its
  rows unmarked.
- One request per loaded page adds load while the inviter scrolls. → The
  request is made only for a private room and only for pages the selector
  actually loads; answers are kept for the time the panel is open.
- Moving the passphrase form and the recovery content into shared parts
  touches dialogs that have accessibility requirements with tests. → The
  existing unit tests of both dialogs stay and must pass unchanged; the new
  dialog adds its own.
- The mark depends on a kit release. → The kit change is a separate task
  done first; the client task starts after the pack is taken.
- Screenshots of several Playwright specs change at once. → They are
  updated in the task that changes the screen, under Docker, and reviewed
  per spec.

## Open Questions

- The illustration of the locked-key block: a new image or one the product
  already ships. It does not change the specs or the tasks.
