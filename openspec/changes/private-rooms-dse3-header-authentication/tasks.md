# Tasks

## 0. Decisions (before any code)

- [x] 0.1 Record the answers to the three decisions (version bump, migration policy, Document Server acceptance of version 3): decided 2026-10-26, bump to 3, no migration, Document Server support required by `private-rooms-editor-contract`; recorded in proposal.md and design.md.

## 1. Format constants and associated data

- [ ] 1.1 Add `DSE3_VERSION_V3` next to the existing version constant in `packages/shared/services/encryption/types.ts`, keep the v2 constant for reading, and document the header-prefix slice (flags through nameLen) that version 3 authenticates; verify with `cd packages/shared && pnpm exec vitest run services/encryption/__tests__/wire-format.test.ts` after extending it with the v3 layout case.
- [ ] 1.2 Make `buildChunkAad` and `buildNameAad` in `streaming-encryption.ts` take the container version and append the header-prefix bytes for version 3; verify with unit tests asserting the exact AAD bytes for v2 and v3.
- [ ] 1.3 Write version 3 in the header builder and branch the parser on the version byte (2 or 3; anything else rejected before decryption); verify with new cases in `__tests__/streaming-encryption.test.ts` for round-trip v3, read v2 fixture, reject v4.

## 2. Tamper coverage

- [ ] 2.1 Extend `__tests__/dse3-tampering.test.ts` with version-3 cases: flags byte flipped, IS_FORM cleared, has-name cleared with nameLen zeroed, chunkPlaintextSize changed, nameLen changed; verify each fails with the authentication error and that the same mutations on a v2 fixture still behave as before (documenting the v2 limitation).
- [ ] 2.2 Mark the decrypt result with `headerAuthenticated` (true for v3, false for v2) and cover it in `__tests__/streaming-encryption.test.ts`.

## 3. Upload, download, re-import and name recovery on version 3

- [ ] 3.1 Run the private-room integration suites (`packages/shared/services/private-room/__tests__/{upload-download,filename-recovery,cross-user-download}.integration.test.ts`) against v3 output and add a v2-fixture re-import case to `encrypted-upload-orchestrator.test.ts` asserting the re-imported container is written as v3; verify green.
- [ ] 3.2 Confirm the 4 KiB range read used for name recovery still covers the header for v3 (layout unchanged); verify with the existing `encrypted-filename-recovery.test.ts`.

## 4. Server and editor compatibility

- [x] 4.1 Grep `../server` for any DSE3 version check (`grep -rn "DSE3" ../server --include=*.cs`) and record the result in design.md; if a check exists, open a task in `private-rooms-server-hardening`; verify the note is present.
- [x] 4.2 Record in `private-rooms-editor-contract` that the Document Server reads DSE3 versions 2 and 3 and writes version 3 (2026-10-26); verified by the requirement "Versioned Document Server encryption contract" and its scenario "Container versions" there.
- [ ] 4.3 Ask the desktop developer, together with task 2.0 of `private-rooms-remove-dead-api-calls`, whether the new desktop crypto engine parses DSE3 and accepts version 3; record the answer and its date in design.md before merging.

## 5. Integration check

- [ ] 5.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `pnpm run test`, `pnpm run test:client`) and the E2E spec `packages/client/__tests__/encrypted-file-ui.spec.ts`; verify green.
- [ ] 5.2 Confirm `npx -y @fission-ai/openspec@latest validate private-rooms-dse3-header-authentication --strict` passes.

## Workflow follow-up

- Do not merge the version bump before task 4.3 is answered; the Document Server side is a requirement of `private-rooms-editor-contract` and does not hold this change.
- Archive with `/opsx:archive private-rooms-dse3-header-authentication` after review.
