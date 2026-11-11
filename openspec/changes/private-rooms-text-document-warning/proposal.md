# Proposal

## Why

A text document saved once in a private room cannot be opened for editing
again: the editor answers error -82. It was reproduced on the release stand
on 2026-11-06 and 2026-11-10 with a docx, for the room owner and for an
invited member alike; spreadsheets, presentations and PDFs reopen. The fix
belongs to the server (`private-rooms-editor-contract` 6.2) and is not on
the branch. Until it lands, a user finds out only after the work is saved.
The owner decided on 2026-11-10 to warn in the interface.

## What Changes

- When the editor opens an encrypted text document for editing, it shows
  one warning before the user types anything. Proposed placement and
  wording, for the owner to approve before any code:
  - **Where:** a warning toast on the editor page, shown once per opening,
    staying until the user closes it. The editor page is the one place
    every route to a first edit passes through: a file created in the room,
    an uploaded one, a link opened directly.
  - **Text**, new key `Common:PrivateRoomTextDocumentWarning`: "After you
    save this document, it may open for viewing only."
- No warning for a spreadsheet, a presentation or a PDF, for a file opened
  for viewing, or for a file that is not encrypted.
- A task of this change removes the warning, its key and its requirement
  once `private-rooms-editor-contract` 6.2 is done and checked on the
  stand.

Out of scope:

- The fix itself, and any client workaround for reopening the document.
- A warning in the file list of the room or in the create dialog (see
  design.md for why the editor page alone).
- Text formats other than docx were not tried on the stand. The warning
  covers every document the server opens with the text editor, since the
  cause is not tied to the extension as far as it is known.

Decisions that need a human:

1. The placement: a closable warning toast on the editor page (proposed),
   or a banner above the editor frame, or a confirmation dialog before the
   editor mounts.
2. The wording of `Common:PrivateRoomTextDocumentWarning`.

Decided by the owner on 2026-11-10: text documents carry a warning in the
interface until the server is fixed, and the blocker goes into the beta
gate (the gate is a separate piece of work).

Depends on: `../server`, `private-rooms-editor-contract` 6.2, for removing
the warning. Nothing for showing it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: a new requirement, the warning shown
  when an encrypted text document is opened for editing.

## Impact

- `packages/doceditor/src/components/Editor.tsx` or a hook next to it, and
  a unit test.
- `public/locales/*/Common.json`: one new key in every language, with its
  translator comment.
- No API or dependency change.
