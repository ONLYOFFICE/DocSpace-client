# Tasks

## 1. Decision

- [ ] 1.0 Record the long-term desktop path for private rooms (design.md decision 2: desktop adopts the private-rooms crypto, desktop editor uses the browser key path, or files stay withheld) agreed with the Desktop Editors team; verified by the decision, its date and the name of the follow-up change in design.md. Does not block group 2.

## 2. Refusal in the desktop application

- [ ] 2.1 Add `Common:PrivateRoomDesktopEditorNotSupported` (private-room files open only in the browser for now) to `public/locales/en/Common.json`, write its `.meta` comment with the `translate-comments` skill and translate it with `translate-key`; verify with `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 2.2 In `packages/doceditor/src/hooks/useFileEncryptionKeys.ts` end an encrypted file in a new `unsupported` state when the editor runs in the desktop application, before the identity unlock, the access-entry request and the unwrap; render that state in `packages/doceditor/src/components/Editor.tsx` with the new key and keep the editor unmounted; verify with `pnpm run tsc` and `pnpm run lint`
- [ ] 2.3 Add a doceditor E2E spec (`packages/doceditor/__tests__/private-room-desktop.spec.ts`) that stubs `window.AscDesktopEditor` with an init script and opens an encrypted private-room file through an `openedit` MSW handler mirroring `EditorController` (its doc comment names the action): the message is shown, no unlock prompt appears, no `files/{fileId}/access` request is sent; a second case opens an ordinary file in the same desktop stub and the editor mounts; verify with the doceditor Docker E2E run of that spec

## 3. Specs and gate

- [ ] 3.1 Confirm the editor-integration delta still matches the implemented behaviour; verify with `npx -y @fission-ai/openspec@latest validate private-rooms-desktop-editor --strict`
- [ ] 3.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, shared, client and sdk unit tests)
