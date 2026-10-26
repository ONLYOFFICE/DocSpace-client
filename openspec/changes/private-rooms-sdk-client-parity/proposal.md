# Proposal

## Why

The SDK private-rooms surface is a lightweight client for integrations: it may offer fewer actions than the client, but each action it offers must behave as in the client. A parity audit on 2026-10-26 (file-operations and room-membership against the SDK) found that the SDK runs its own copies of the client's rules, and they have drifted. Three of the gaps put plaintext into a private room:
- A copy or move into a subfolder of a private room takes the decrypting branch, because a subfolder's own `private` field is false.
- A private room opened through the SDK's generic room pages uploads, removes members and offers the AI chat with the non-private flows.
- Shift+O and the mobile "New PDF form" create an unencrypted file.

The server does not stop any of these, since it accepts an upload session without the encrypted flag into a private room. About forty smaller differences cover uploads, transfers, menus, downloads, names and membership.

## What Changes

- **Reuse instead of copies.** Every rule the SDK needs is taken from the client by moving the client's logic into `packages/shared` and calling it from both apps. Each SDK copy goes away once the shared version replaces it.
- **Private rooms only through `/private`.** The SDK's generic room lists leave private rooms out, through the client's own scoping helper. A generic room address of a private room leads to its private page, so no non-private flow ever runs on a private room.
- **Transfer destinations.** The room a copy or move goes to is taken from the destination folder's path, as in the client, so a subfolder of a private room is a private destination.
- **Transfer plan.** Moves and copies follow the client: the Move dialog stays in the room and a same-room move is done by the server, copy names avoid clashes, and copy-out goes through the standard upload with its conflict check.
- **One upload pipeline.** The client's encrypted upload and the SDK's encrypted upload become one shared pipeline, used by both apps:
  - the no-key and declined-unlock failures,
  - the quota stop and retry,
  - re-import of ciphertext,
  - the name-clash check,
  - the skipped-member warning,
  - the folder-drop refusal and the drop target.
- **Creation.** Every create entry (menu, empty view, quick actions, hotkeys, mobile button) creates encrypted files or is withheld. The light client gains PDF form creation, as in the client.
- **Menus.** Menus withhold what the client withholds for encrypted items, private folders and private rooms (rename, favorites, integrator actions, duplicate room, embedding), including header menus. Download without decryption is offered in the header menu.
- **Downloads and errors.** Folder downloads in a private room are refused everywhere, and no server archive of ciphertext is offered. Errors on encrypted paths are localized.
- **Membership.** It runs the private flows from every entry point, including the room header:
  - invite with re-wrap, and the panel closes before the progress bar runs,
  - no Guests tab in the people selector,
  - owner change with key checks,
  - leaving revokes the leaver's own entries,
  - the removal guard reports active uploads,
  - room creation follows the client's key and secure-context gate.
- **Names and archive.** Encrypted names are recovered on every list update and shown in history, recent files and the pickers. Archived rooms keep the active-room rules.
- **Deliberate light-client limits.** These are stated as requirements:
  - no search in private rooms (the query would leave the browser and match only opaque names),
  - no decrypted folder download,
  - no clipboard hotkeys.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/sdk-surface`. Existing requirements that change:
  - "Copy and move destination resolved fail-closed": destination from the folder path, Move dialog kept in the room.
  - "Create menu inside a private room": PDF form offered, every create entry encrypted.
  - "Mixed and folder downloads refused": folder selections and private room downloads refused as well.
  - "Decrypted titles in lists and history": recovered on every list update, shown in pickers and recent files.

  New requirements: private rooms only through the private pages; same-room moves by the server; the shared upload rules; the shared menu rules; localized errors; membership from every entry point; leaving revokes own entries; archive rules; the light-client limits.

The client's own behaviour (`private-rooms/file-operations`, `private-rooms/room-membership`) does not change. Moving its logic into `packages/shared` is a refactor that its existing tests keep in place.

## Impact

- **Shared.** New and extended modules under `packages/shared/services/private-room`, taken from client-only code:
  - upload target and drop rules,
  - the transfer plan and picker rules,
  - copy names,
  - create rules,
  - leave-time revocation,
  - invite result reporting,
  - owner candidates,
  - menu predicates.

  The shared encrypted-upload orchestrator gains the client's upload rules. Shared hooks for resolved titles and picker titles are reused as they are.
- **Client.** The client imports the moved helpers from `packages/shared`, and its encrypted upload branch in `packages/client/src/store/uploadDataStore` switches to the shared orchestrator. Behaviour stays as its specs describe it, kept in place by the existing client unit tests and the `private-room-*.spec.ts` E2E specs.
- **SDK.** Affected areas:
  - `packages/sdk/src/app/(private)/**`
  - `(personal-files)/_components/docs-layout`, `_hooks/useFileOperations.ts`, `useDocsActions.ts`, `useDocsHotkeys.ts`, `useDocsMenuModels.tsx`
  - `(docspace)/_hooks` (menus, downloads, header menu), `(docspace)/(files)/_components/list`
  - `(rooms)/**` (list scoping, room pages, room dialogs, invite panel)

  SDK copies replaced by shared code are deleted.
- **Mocks.** The empty-template mock also serves `new.pdf` (the server ships `common/resources/DocStore/new/*/new.pdf`), with contract tests.
- **Server and Document Server.** No dependency. The change relies on server behaviour that already exists:
  - the rooms-list privacy filter,
  - the folder path,
  - same-room moves allowed by the server.

## Out of scope

- Opening encrypted files in the editor (`private-rooms-editor-contract`).
- Key generation and key management inside the SDK; the link-out stays.
- Client-side search, decrypted folder download and clipboard hotkeys in the SDK: withheld by decision, not ported.
- The pending-access state and retry of invitations (`private-rooms-invite-atomic-rewrap`). This change moves today's invite orchestration into `packages/shared`, so that change then lands in both apps at once.
- A `private` mode in the sdk-js repository (task 1.5 of `private-rooms-sdk-gating-and-parity`).

## Decisions needed

- **Generic SDK lists without the host opt-in.** Decided 2026-10-26: private rooms are reachable only through `/private`. When the host has not passed the opt-in, this change still leaves private rooms out of the generic lists, rather than listing them as the client does when its flag is off. The SDK has no other private flows to run them through. Confirm during review.
- **Room "Download" in the client.** The `private-rooms/room-membership` requirement "Room-level operations withheld" lists download as absent for a private room. The client still offers download and download-encrypted there, and a unit test pins it. The SDK follows the client's code, so the spec or the client has to change. That is a client decision outside this change.
- **Sequencing.** This change modifies sdk-surface requirements that `private-rooms-sdk-gating-and-parity` also modifies. Archive that change first; the MODIFIED texts here build on its delta.
