# Design

## Context

See proposal.md for the motivation. The state the approach rests on, read on
2026-10-20:

- Server: for a file in a private room, `EditorController` attaches the
  caller's key pairs to the editor configuration
  (`../server/products/ASC.Files/Server/Api/EditorController.cs`, the
  `docParams.LocatedInPrivateRoom` branch, `EncryptionKeys =
  encryptionKeyPairDtoHelper.GetKeyPairAsync()`; the field is
  `EditorConfig.EncryptionKeys` in `Core/Services/DocumentService/Configuration.cs`).
  The server does not know whether the editor runs in the desktop application.
- Editor page: `packages/doceditor/src/hooks/useFileEncryptionKeys.ts` runs for
  every encrypted file in the browser and in the desktop application alike:
  it unlocks the identity, unwraps the DEK and replaces
  `editorConfig.encryptionKeys` with `{ dek, cryptoEngineId }`;
  `components/Editor.tsx` keeps the editor unmounted until that state is
  `ready` and renders `error` as Common:SomethingWentWrong.
  `utils/constants.ts` detects the desktop application by
  `window.AscDesktopEditor`.
- Editor: `web-apps` `apps/documenteditor/main/app/controller/Main.js` passes
  `editorConfig.encryptionKeys` to `docInfo.put_EncryptedInfo`; `sdkjs`
  `common/apiBase.js` hands it to `AscCommon.createCryptoProvider`, which
  `sdkjs` does not define: the desktop application injects it.
- Desktop application (`desktop-sdk`): its crypto is RSA key pairs wrapped
  with the portal login password
  (`ChromiumBasedEditors/lib/src/cefwrapper/client_renderer_wrapper.cpp`,
  `portal:login`) and OOXML documents with a per-document password
  RSA-encrypted per user (`ChromiumBasedEditors/plugins/encrypt/advanced2/worker.js`).
  It has no handler for a DSE3 container or a raw DEK.
- No stashed design document covers the desktop application for private
  rooms; `private-rooms-remove-dead-api-calls` design.md records the removal
  of the old portal-side bridge.

## Goals / Non-Goals

**Goals:**
- No file key of a private room reaches the desktop application's crypto
  provider until a desktop path is agreed.
- The desktop user gets a clear, localized reason instead of an undefined
  editor state.

**Non-Goals:**
- A working desktop path for private rooms (decision 2 below).
- Any change to the browser path.

## Decisions

1. **Refuse in the editor page, before key acquisition.** The desktop check
   runs first in the key hook: in the desktop application an encrypted file
   ends in a new `unsupported` state without the unlock, the access-entry
   request or the unwrap, and the editor component renders that state with
   Common:PrivateRoomDesktopEditorNotSupported. Alternatives: refuse in the
   client file list inside the desktop application (does not cover links and
   the SDK, and the editor page would still unwrap if reached); let the
   desktop provider receive the DEK (undefined behaviour in a provider built
   for another format). The editor page is the one place every entry point
   goes through.
2. **Long-term path: open, owner decision with the Desktop Editors team.**
   (a) The desktop application implements the private-rooms crypto (X25519
   with HPKE, DSE3, the passphrase-protected identity) in `desktop-sdk`;
   (b) the desktop editor takes the browser key path of
   `private-rooms-editor-contract`, which needs the desktop provider to step
   aside for a DSE3 file and the Document Server contract that change
   defines; (c) private-room files stay withheld in the desktop application.
   Until the decision, the refusal of decision 1 is the behaviour.
3. **A new message key.** Common:PrivateRoomDesktopEditorNotSupported says that
   private-room files open only in the browser for now. Alternative: reuse
   Common:PrivateRoomEditorNotSupported, whose text ("Encrypted files cannot
   be opened in the editor yet") is wrong for a user whose browser opens the
   same file.

## Risks / Trade-offs

- [Desktop users lose access they believe they have] → today the outcome is
  undefined at best; the message points to the browser, which works.
- [`window.AscDesktopEditor` also exists in other desktop contexts] → the
  check is the one the editor page already uses for the desktop login; a
  false positive only withholds a private-room file, never an ordinary one.

## Open Questions

- Decision 2. Owner: product owner with the Desktop Editors team.
