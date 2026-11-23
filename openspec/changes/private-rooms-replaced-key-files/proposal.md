# Proposal

## Why

A user who deleted their encryption key and set up a new one still sees the
files of their private rooms, but none of them can be opened: every file is
wrapped for the key that no longer exists. Today the product says so late and
vaguely: one toast per browser session (Common:GhostStateDetected) that guesses
at causes, Common:SomethingWentWrong in the editor after the unlock, and
Common:EncryptionDecryptPartialFailed in the media viewer. After a page reload
the room says nothing at all. Users report that they cannot tell what happened
or what to do.

The cause is known before any key is asked for: the access entries of a file
name the key the wrap was made for, and the same answer lists the keys the
user holds now.

## What Changes

- A file whose wrap names a key the user no longer holds is recognised from
  its access entries, before the passphrase prompt and before any decryption
  is tried.
- Opening, downloading, copying or moving such a file alone reports one clear
  message (new Common:EncryptedFileKeyReplaced) in place of the generic
  failure; in a batch the file is named in the batch report as today.
- The editor ends the key flow of such a file in a state of its own with that
  message, without raising the unlock dialog and without the generic error.
- A private room shows a notice above its file list for as long as files of
  that kind are among the loaded ones, on every visit, with their number. The
  ghost-state toast is no longer raised for this cause; it stays for the
  others.

Out of scope:

- Giving the user access again (re-wrapping by another member, restoring the
  deleted key). The notice states the fact; it promises no remedy.
- Any change to what deleting a key does, or to its confirmation dialog.
- The SDK's private shell: it gets the new message through the shared error
  text, no notice of its own.
- The key state shown after returning from the editor (reported together with
  this problem, not reproduced; tracked separately).

Decisions that need a human:

- The wording of Common:EncryptedFileKeyReplaced and of the room notice.
- Whether the notice should carry an action (none is proposed: Keys management
  offers nothing that brings these files back).

Decided by the owner on 2026-11-23: the wording of design.md, decision 5, is
accepted, and the notice carries no action.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: a file wrapped for a key the user no longer
  holds is reported as such by download, copy, move and the media viewer, and
  by a notice in the room.
- `private-rooms/editor-integration`: the key flow gets an end state for such
  a file.
- `private-rooms/key-management`: the ghost-state toast is not raised for this
  cause.

## Impact

- Shared: `services/encryption` (errors, per-file access, error text,
  ghost-state notifier), `services/private-room` (filename recovery, download,
  copy), `components/media-viewer`.
- Client: file list of a private room (`pages/Home/Section/Body`), files store
  encryption helpers, download and copy/move helpers.
- Doceditor: `useFileEncryptionKeys`, `Editor.tsx`.
- Locales: new keys in `public/locales/*/Common.json` with `.meta` comments.
- Server (`../server`) and Document Server: no work. The change reads fields
  the server already returns.
