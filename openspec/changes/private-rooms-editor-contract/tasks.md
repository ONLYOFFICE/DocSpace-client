# Tasks

## 1. Contract with the Document Server

- [x] 1.1 Draft the versioned contract from the run of 2026-10-29 (design.md Context, "Observed on 2026-10-29" and "Read in the add-on code"): the encryption keys entry and which fields the web client reads, token handling, DSE3 decrypt and encrypt in the browser with versions 2 and 3 read and version 3 written, the crypto library build the Document Server ships, the save through `savefile`, encrypted co-editing changes, the end of an encrypted session, the form flag kept on save, and the minimum version. Done 2026-10-29 as `contract-v1.md` (status: draft) with the numbered obligations DS-1 to DS-16 and P-1 to P-8
- [ ] 1.2 Record the Document Server team's answers to the open questions in design.md (session end and unsaved changes, library build per release, editions that carry the crypto add-on, a capability signal) and whether the server keeps the key-pair list with `privateKeyEnc` in the signed configuration (if not, add a backend task here); adjust the delta spec scenarios if an answer differs; verify with `openspec validate private-rooms-editor-contract --strict`
- [x] 1.3 Prepare the hand-over package for the editor developers: the corrections to the integration guide of 2026-07-01 listed in design.md Context (access-write route, access-read fields, key pairs without an id), a bundle built from the current library (with the form flag, ff9f51aeffb, and the build stamp of 1.4), the request that the add-on pass the form flag of the opened container to `encryptFile` on save (design D9), the contract draft and the browser test page; record the bundle's stamp in design.md. Done 2026-10-29: design.md "Hand-over package of 2026-10-29", bundle 2.1.0 from commit b0a476bd858c
- [x] 1.4 Add a build stamp to the crypto bundle: `lib-entry.ts` exports the library version and the source commit the bundle was built from (set in `vite.lib.config.ts` at build time); verify with a case in `packages/shared/services/encryption/__tests__/bundle-contract.test.ts` and the stamp read from a freshly built bundle. Done 2026-10-29: `LIBRARY_VERSION` 2.1.0 in `types.ts` (the unstamped build of 2026-07-01 counts as 2.0.0), `BUILD_COMMIT` defined at build time (`-dirty` from a modified tree, `dev` outside a bundle build), the same two values as a banner on the first line of the file, `DSE3_FLAG_IS_FORM` exported, and `pnpm run build:crypto` in `packages/client` as the build command

- [ ] 1.5 Send the package of 1.3 to the editor developers and record the date, the recipients' team and the bundle's stamp in design.md ("Hand-over package", "Sent"); verified by that record
- [ ] 1.6 Get written sign-off from the Document Server team on `contract-v1.md`, item by item (DS-1 to DS-16), and record the date and the signing team at the top of the document, replacing the draft status; verified by that record and `openspec validate private-rooms-editor-contract --strict`

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

- [x] 4.3 Run the open, save, reopen and co-editing checks for a spreadsheet and a presentation in a private room on a Document Server with the crypto add-on; verify by recording the run (date, build, result per file type and mode) in design.md. Done 2026-10-29 ("Run of 2026-10-29, spreadsheets and presentations"): open, save and encrypted change storage work in both editors; the presentation reopen fails on every attempt, the spreadsheet reopen intermittently (DS-17), and the spreadsheet editor does not apply relayed changes (DS-18), so the "Editors covered" scenarios stay requirements, not observed facts
- [ ] 4.6 Repeat 4.3 for a view-only member (a second account with keys and read rights on the room) for each file type: the editor opens in view mode, decrypts, and offers no save; verify by the record in design.md
- [ ] 4.7 BLOCKED on the Document Server fixes for DS-17 and DS-18 and the presentation reopen failure: re-run 4.3 on the build that ships them, including the presentation relay that no second session reached on 2026-10-29; verify by the record in design.md and by turning the "Editors covered" scenarios into observed facts
- [ ] 4.4 Verify where an image inserted into an encrypted document goes: insert a picture from the device and one by address, save, co-edit, and read the Document Server's media store and the portal's storage; verify by recording in design.md whether any plaintext image left the browser, and if one did, raise proposal decision 5 before any further task of this change
- [ ] 4.5 Remove a member from a private room while that member edits an encrypted file; record which `drop` command the portal sends (`DocumentServiceHelper.CheckUsersForDropAsync`), what the removed member's editor shows and whether their later saves are refused; verify by the record in design.md and, if the member keeps editing, a requirement added to the delta spec

## 5. Action policy

- [ ] 5.1 Doceditor: refuse `onRequestSaveAs` for an encrypted file, so no Document Server address is posted to the file-creation endpoint, while the editor's own download-as and save-copy-as stay available; verify with a doceditor unit test on the save-as handler
- [ ] 5.2 Doceditor: do not attach history events for encrypted files; verify with a doceditor unit test
- [ ] 5.3 Doceditor: hide "Share to fill out" for a PDF form in a private room (no start-filling event attached; design D9); verify with a doceditor unit test on the editor events of an encrypted form in a private room
- [ ] 5.4 Backend: refuse a form submission of an encrypted file into form-data collection, or refuse to create a private form-filling room, choosing after reading the submission path in `../server` (design D9, "Server form handling"); verify with a server unit test that no result file is stored and no field value reaches the report
- [ ] 5.5 Add any new locale keys with `translate-comments` and `translate-locales`, then verify with `cd common/tests && npx vitest run test/locales.test.js`
- [ ] 5.6 Verify role-based filling in a private virtual data room created through the API, on a Document Server with the crypto add-on: every filler opens and fills the encrypted form, and the final submit keeps it encrypted; record the run in design.md and turn the open question into a requirement

- [ ] 5.7 Add to `packages/shared/services/private-room/__tests__/pdf-form-signature.test.ts` a fixture taken from the first 300 bytes of a PDF form the editor produced (the stand's "New PDF form" file, decrypted) and a plain PDF from the same editor, asserting the mirror classifies both as the server does (design D15); verify with `cd packages/shared && pnpm exec vitest run services/private-room/__tests__/pdf-form-signature.test.ts`

## 6. Session end and document address

- [x] 6.1 Backend: look up in `../server` (CodeGraph) how the document key and `document.url` of a file are produced and when the key changes, and record the findings with their source files in design.md D7 and D8; verified by that record
- [ ] 6.2 Backend: when an editor opens an encrypted file whose current version is a force-save, ask the Document Server `info` for the stable key; while it holds the session, serve the stable key with `document.url` of the stable version, otherwise promote the current version to stable for a new key (design D7, after 6.5); verify with server unit tests for both branches and a recorded run on a Document Server with the crypto add-on: save, close every editor and reopen; save and rejoin while another member edits; leave without saving and reopen; all without a change error
- [ ] 6.3 Backend: skip `ReplaceCommunityAddress` for `document.url` of an encrypted file, so it keeps the public portal address (design D8); verify with a server unit test and a recorded run with the portal address for the Document Server set to one the browser cannot reach
- [ ] 6.4 Backend: refuse a save callback for a file whose current version is encrypted when it carries no encrypted flag, keeping the previous version (design D10); verify with a server unit test
- [ ] 6.5 Record which callbacks the Document Server sends when the last editor of an encrypted document leaves (status 1 with no users, status 4, or none) and how the file tracker ends, from the portal's callback handling on the local stack; record the run in design.md and adjust D7 if the file can stay "being edited"

## 7. SDK opening

- [ ] 7.1 SDK: open encrypted files through the key flow when the capability is present; verify by un-fixming the editor test in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` and running it

## 8. Integration

- [ ] 8.1 Client E2E: open an encrypted file end to end against the MSW `openedit` mock and assert the editor mounts with the typed keys; verify with `packages/client/__tests__/private-room-editor.spec.ts`
- [ ] 8.2 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, shared/client/sdk unit tests) and `openspec validate --all --strict`

## Workflow follow-up

- In `private-rooms-dse3-header-authentication`, record that the Document Server encrypts and decrypts with its own copy of the library (build 10.0.0.133 ships the bundle of 2026-07-01 and reads and writes version 2), and make the portal write version 2 until the Document Server declares a library that reads version 3 (design D6); its own planning commit.
- Archive the change only after the Document Server release that implements the contract is identified and the capability has been exercised on staging.
