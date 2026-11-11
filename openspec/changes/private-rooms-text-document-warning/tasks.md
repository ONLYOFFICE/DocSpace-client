# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The placement and the wording are for the owner to approve before 1.1 (proposal.md, decisions 1 and 2). Nothing in `../server` changes.

## 1. Editor page

- [ ] 1.1 Doceditor: add `Common:PrivateRoomTextDocumentWarning` to `public/locales/en/Common.json` with the approved wording, and show it from the editor page (`packages/doceditor/src/components/Editor.tsx`) in the approved placement when the file is encrypted, the document type is the text one, the mode is edit and the keys are ready (design decisions 2 to 4). Verify: cases "Text document opened for editing", "Spreadsheet, presentation or PDF", "Text document opened for viewing" and "Text document that is not encrypted" in `packages/doceditor/src/components/__tests__/Editor.test.tsx`; `pnpm test:doceditor`; `pnpm exec tsc` in doceditor

## 2. Translations

- [ ] 2.1 Write the translator comment of the key with the `translate-comments` skill from its call site, and translate it with the `translate-key` skill. Verify: `cd common/tests && npx vitest run test/locales.test.js`, and the `translate-stale` skill reports nothing for the key

## 3. Removal

- [ ] 3.1 Backend-dependent, after `private-rooms-editor-contract` 6.2 is done and a docx reopens for editing on the stand after "create, edit, save, close": remove the warning, its key from every language and its requirement (a REMOVED delta in a follow-up change if this one is archived by then). Verify: the cases of 1.1 are gone with the code, `locales.test.js`, and the stand check recorded here with the date

## 4. Gate

- [ ] 4.1 Run the gate: `pnpm exec tsc` in the six packages, the doceditor unit suite, `cd common/tests && npx vitest run test/locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 4.1 with 3.1 moved to the change that removes the warning, or keep this change open until 3.1; the owner decides.
