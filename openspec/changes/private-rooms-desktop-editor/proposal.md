# Proposal

## Why

The ONLYOFFICE desktop application cannot open private-room files, and
nothing says what it should do instead. Its own encryption (RSA keys wrapped
with the portal login password, OOXML documents with a per-document password)
is a different scheme from private rooms (X25519 with HPKE, the DSE3
container, an Argon2 passphrase), and the portal-side bridge to it was removed
in `private-rooms-remove-dead-api-calls` because it never worked against this
server. Meanwhile the editor page still unwraps the file key in the desktop
application and hands it to the editor configuration, where the desktop
injects its own crypto provider that expects its own key format, so the
outcome is undefined and untested.

## What Changes

- Until a desktop path for private rooms exists, the editor running inside
  the desktop application refuses to open a private-room file: it does not
  unlock the identity, does not unwrap or hand over a file key, and shows a
  localized message that points the user to the browser.
- Record the owner decision on the long-term desktop path, one of: the
  desktop application adopts the private-rooms crypto; the desktop editor
  uses the browser key path of `private-rooms-editor-contract`; private-room
  files stay withheld in the desktop application. The decision and the
  agreement with the Desktop Editors team go into design.md; the work it
  implies becomes its own change.
- Add one locale key for the refusal, translated to every supported language.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: adds the requirement that private-room
  files are withheld in the desktop application.

## Impact

- `packages/doceditor` (`hooks/useFileEncryptionKeys.ts` and the component
  that renders the key state, `utils/constants.ts` `IS_DESKTOP_EDITOR`),
  `public/locales/*/Common.json` and its `.meta`.
- Tests: a doceditor unit test for the desktop refusal.
- Server: none for the refusal. `EditorController` keeps attaching the
  caller's key pairs to the editor configuration of a private-room file; the
  refusal happens before the editor is mounted, so they never reach the
  desktop crypto provider.
- External: any long-term path other than "withheld" depends on the Desktop
  Editors team (`desktop-sdk`) and possibly on Document Server work tracked in
  `private-rooms-editor-contract`.

## Out of scope

- Implementing either long-term desktop path (desktop crypto or browser key
  path in the desktop editor); it follows the decision as a separate change.
- The client file list inside the desktop application: opening a file still
  starts the editor, which shows the refusal.
- The desktop application's own encryption for ordinary portal files.

## Decisions needed

1. Long-term desktop path for private rooms (owner, with the Desktop Editors
   team): desktop adopts the private-rooms crypto, desktop editor uses the
   browser key path, or files stay withheld. Until then the refusal applies.
2. Message wording: a new key that points to the browser is assumed, rather
   than reusing Common:PrivateRoomEditorNotSupported, whose text says only
   that encrypted files cannot be opened in the editor yet.
