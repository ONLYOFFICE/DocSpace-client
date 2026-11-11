# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

- The defect: `private-rooms-editor-contract`, task 6.2 and design.md
  "Release stand check of 2026-11-06". After a save, the editor
  configuration of the file carries the document key of version 1 for
  editing while the file is at version 2
  (`DocumentServiceHelper.GetParamsAsync`,
  `products/ASC.Files/Core/Services/DocumentService/DocumentServiceHelper.cs`).
  The same holds for the four document types, but only a text document
  fails to open.
- The editor page (`packages/doceditor/src/components/Editor.tsx`) knows
  the file is encrypted (`config.file.encrypted`), the document type the
  server computed (`config.documentType`, "word" for a text document) and
  the mode (`config.editorConfig.mode`). It renders ui-kit toasts through
  the providers of the page and already shows
  `Common:PrivateRoomEditorNotSupported` from `Common.json`.

## Goals / Non-Goals

**Goals:**

- The warning reaches the user before the first edit, on every route into
  the editor.
- It is cheap to remove: one call site, one key, one requirement.

**Non-Goals:**

- Detecting whether a given document is already broken, or whether the
  connected server carries the fix.

## Decisions

1. **The editor page, not the client.** A warning at file creation
   (`packages/client/src/helpers/encryptedFileCreation.ts`) misses uploaded
   documents and direct links, and the SDK would need a copy. The editor
   page is shared by all of them. Alternative: both places. Rejected: two
   messages for one fact.
2. **A closable toast, shown once per opening.** It does not block typing
   and needs no new component. Alternatives for the owner (proposal.md,
   decision 1): a banner above the editor frame, which stays visible but
   takes height from the editor on every opening; a confirmation dialog
   before the editor mounts, which cannot be missed but adds a click to
   every opening of every text document.
3. **Keyed on the document type from the server and the edit mode.** The
   warning shows when the file is encrypted, `documentType` is the text one
   and the mode is edit. The extension is not consulted: the server already
   mapped it.
4. **Shown after the keys are ready.** While the page waits for the keys
   or shows a refusal, no editor is mounted and nothing can be edited, so
   the warning waits for the editor.

## Risks / Trade-offs

- [A toast can be closed unread] → The owner chooses the placement; the
  banner and the dialog are the stronger options.
- [The warning outlives the fix] → Task 3.1 removes it and names its
  condition.
- [A server with the fix still shows it] → Accepted until removal; the
  client has no signal to tell.
