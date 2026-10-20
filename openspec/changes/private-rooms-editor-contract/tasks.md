# Tasks

## 1. Contract with the Document Server

- [ ] 1.1 Draft the versioned contract (configuration field shape, token handling given that the portal signs `editorConfig.encryptionKeys` today as the caller's key-pair list, DSE3 decrypt/encrypt on open and save, callback payload, minimum version) and get written sign-off from the Document Server team; verify by adding the signed-off document to this change folder as `contract-v1.md`
- [ ] 1.2 Record the answers to the design open questions in design.md (including whether the server keeps the key-pair list with `privateKeyEnc` in the signed configuration; if it should not, add a backend task here) and adjust the delta spec scenarios if the token or save round-trip differs; verify with `openspec validate private-rooms-editor-contract --strict`
- [ ] 1.3 Send the editor developers the corrections to the integration guide of 2026-07-01 listed in design.md Context (access-write route, access-read fields, key pairs without an id) and record the date it was sent in design.md; verified by that record

## 2. Capability check

- [ ] 2.1 Backend: expose a Document Server encrypted-editing capability boolean in the files settings payload (`../server`, files settings DTO), defaulting to false; verify with a server unit test and the Swagger output
- [ ] 2.2 Add the capability to the shared settings store and the MSW settings handler; verify with a shared unit test on the store getter
- [ ] 2.3 Client and SDK: refuse to open an encrypted file when the capability is false, showing Common:PrivateRoomEditorNotSupported, without starting the key flow; verify with `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.open.test.ts` and an SDK unit test on the docs-layout open handler
- [ ] 2.4 Doceditor: bail out before the key hook runs when the capability is false; verify with a doceditor unit test in `packages/doceditor/__tests__`

## 3. Typed configuration and contract version

- [ ] 3.1 Type `editorConfig.encryptionKeys` (dek, cryptoEngineId, contractVersion) in `packages/doceditor/src/types` and drop the `Object.assign` escape hatch in `Editor.tsx`; verify with `pnpm run tsc`
- [ ] 3.2 Add the contract version to the configuration and an MSW `openedit` mock for an encrypted file in `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`; verify with the mock contract test in `packages/shared/__mocks__/handlers/files/__tests__`

## 4. Co-editing restriction

- [ ] 4.1 Backend: emit a single-user co-editing configuration for encrypted files in `Configuration.cs` / `DocumentServiceHelper.cs`; verify with a server unit test asserting the co-editing section for an encrypted file
- [ ] 4.2 Doceditor: keep `canCoAuthoring = false` and pass the server co-editing section through unchanged; verify with a doceditor unit test
- [ ] 4.3 E2E: open the same encrypted file in two browser contexts and assert the second gets view mode; verify with a new client Playwright spec `packages/client/__tests__/private-room-editor.spec.ts`

## 5. Action policy

- [ ] 5.1 Doceditor: hide save-as and download-as for encrypted files (editor customization and the handlers in `useEditorEvents.ts`); verify with a doceditor unit test on the customization object
- [ ] 5.2 Doceditor: do not attach history events for encrypted files; verify with a doceditor unit test
- [ ] 5.3 Doceditor: withhold fill and submit for encrypted PDF forms; verify with a doceditor unit test on the form configuration
- [ ] 5.4 Add any new locale keys with `translate-comments` and `translate-locales`, then verify with `cd common/tests && npx vitest run test/locales.test.js`

## 6. SDK opening

- [ ] 6.1 SDK: open encrypted files through the key flow when the capability is present; verify by un-fixming the editor test in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` and running it

## 7. Integration

- [ ] 7.1 Client E2E: open an encrypted file end to end against the MSW `openedit` mock and assert the editor mounts with the typed keys; verify with `packages/client/__tests__/private-room-editor.spec.ts`
- [ ] 7.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, shared/client/sdk unit tests) and `openspec validate --all --strict`

## Workflow follow-up

- Archive the change only after the Document Server release that implements the contract is identified and the capability has been exercised on staging.
