# Tasks

## 1. Contract with the Document Server

- [ ] 1.1 Draft the versioned contract from the run of 2026-10-29 (design.md Context, "Observed on 2026-10-29"): the encryption keys entry and which fields the web client reads, token handling, DSE3 decrypt and encrypt in the browser with versions 2 and 3 read and version 3 written, the crypto library build the Document Server ships, the save through `savefile`, encrypted co-editing changes, the end of an encrypted session, and the minimum version; get written sign-off from the Document Server team; verify by adding the signed-off document to this change folder as `contract-v1.md`
- [ ] 1.2 Record the Document Server team's answers to the open questions in design.md (session end and unsaved changes, library build per release, editions that carry the crypto add-on, a capability signal) and whether the server keeps the key-pair list with `privateKeyEnc` in the signed configuration (if not, add a backend task here); adjust the delta spec scenarios if an answer differs; verify with `openspec validate private-rooms-editor-contract --strict`
- [ ] 1.3 Send the editor developers the corrections to the integration guide of 2026-07-01 listed in design.md Context (access-write route, access-read fields, key pairs without an id) and record the date it was sent in design.md; verified by that record

## 2. Capability check

- [ ] 2.1 Backend: expose a Document Server encrypted-editing capability boolean in the files settings payload (`../server`, files settings DTO), defaulting to false and derived from the crypto library path until the Document Server publishes a signal (design D2); verify with a server unit test and the Swagger output
- [ ] 2.2 Add the capability to the shared settings store and the MSW settings handler; verify with a shared unit test on the store getter
- [ ] 2.3 Client and SDK: refuse to open an encrypted file when the capability is false, showing Common:PrivateRoomEditorNotSupported, without starting the key flow; verify with `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.open.test.ts` and an SDK unit test on the docs-layout open handler
- [ ] 2.4 Doceditor: bail out before the key hook runs when the capability is false; verify with a doceditor unit test in `packages/doceditor/__tests__`

## 3. Typed configuration and contract version

- [ ] 3.1 Type `editorConfig.encryptionKeys` (dek, cryptoEngineId, contractVersion) in `packages/doceditor/src/types` and drop the `Object.assign` escape hatch in `Editor.tsx`; verify with `pnpm run tsc`
- [ ] 3.2 Add the contract version to the configuration and an MSW `openedit` mock for an encrypted file in `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`; verify with the mock contract test in `packages/shared/__mocks__/handlers/files/__tests__`

## 4. Co-editing

- [ ] 4.1 Doceditor: stop clearing `canCoAuthoring` for encrypted files (the removed requirement), leaving the generic co-editing configuration in place; verify with a doceditor unit test asserting the flag is not forced for an encrypted configuration
- [ ] 4.2 Run co-editing against a Document Server with the crypto add-on (the local Aspire stack or staging): two members edit one encrypted file, each sees the other's changes, and the Document Server's change store holds only changes with the `ENCRYPTED;` marker; verify by recording the run (date, build, result) in design.md

## 5. Action policy

- [ ] 5.1 Doceditor: refuse `onRequestSaveAs` for an encrypted file, so no Document Server address is posted to the file-creation endpoint, while the editor's own download-as and save-copy-as stay available; verify with a doceditor unit test on the save-as handler
- [ ] 5.2 Doceditor: do not attach history events for encrypted files; verify with a doceditor unit test
- [ ] 5.3 Doceditor: withhold fill and submit for encrypted PDF forms; verify with a doceditor unit test on the form configuration
- [ ] 5.4 Add any new locale keys with `translate-comments` and `translate-locales`, then verify with `cd common/tests && npx vitest run test/locales.test.js`

## 6. Session end and document address

- [ ] 6.1 Backend: look up in `../server` (CodeGraph) how the document key and `document.url` of a file are produced and when the key changes, and record the findings with their source files in design.md D7 and D8; verified by that record
- [ ] 6.2 Backend: keep the base of an encrypted editing session stable and start a fresh session once a saved session has ended (design D7, with the Document Server team's answer from 1.2); verify with a server unit test and a recorded run on a Document Server with the crypto add-on: save, close every editor, reopen, and rejoin while another member edits, all without a change error
- [ ] 6.3 Backend: build `document.url` of an encrypted file from the portal's public address (design D8); verify with a server unit test and a recorded run with an internal portal address for the Document Server that the browser cannot reach

## 7. SDK opening

- [ ] 7.1 SDK: open encrypted files through the key flow when the capability is present; verify by un-fixming the editor test in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` and running it

## 8. Integration

- [ ] 8.1 Client E2E: open an encrypted file end to end against the MSW `openedit` mock and assert the editor mounts with the typed keys; verify with `packages/client/__tests__/private-room-editor.spec.ts`
- [ ] 8.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, shared/client/sdk unit tests) and `openspec validate --all --strict`

## Workflow follow-up

- In `private-rooms-dse3-header-authentication`, record that the Document Server encrypts and decrypts with its own copy of the library (build 10.0.0.133 writes version 2), so version 3 needs a Document Server build that ships a library reading it; its own planning commit.
- Archive the change only after the Document Server release that implements the contract is identified and the capability has been exercised on staging.
