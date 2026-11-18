# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. No locale key is added.

## 1. Doceditor

- [ ] 1.1 Doceditor: keep the request for the access entries per file and attempt in `packages/doceditor/src/hooks/useFileEncryptionKeys.ts`, so a restart of the effect awaits the request already sent and a rejected attempt is not asked again before `retry` (design decisions 1 and 4). Verify: cases "Key flow restarts within one attempt" (the key list arriving and the unlock function changing leave `getFileEncryptionAccess` called once) and "Access entries could not be fetched" (an error with a status: called once, load-failed, then "Retry after a failed request" with a second call) in `packages/doceditor/src/hooks/__tests__/useFileEncryptionKeys.test.tsx`; `cd packages/doceditor && pnpm exec vitest run src/hooks`
- [ ] 1.2 Doceditor: repeat once a request for the access entries that got no answer, inside the kept request and without a delay; an error that carries a response is not repeated (design decisions 2 and 3). Verify: cases "Request without an answer" (two calls, ready, load-failed never shown) and "Repeated request without an answer" (two calls, load-failed) in the same test file; `cd packages/doceditor && pnpm exec vitest run src/hooks`
- [ ] 1.3 Stand: open an encrypted file on the local stack and count the requests for `files/{id}/access` of the editor page. Verify: one request per opening, recorded here with the date and the builds

## 2. Gate

- [ ] 2.1 Run `pnpm exec tsc` in `packages/doceditor`, `pnpm run test:doceditor`, Biome on `packages/doceditor/src`, `npm --prefix ./common/tests run test:lefthook` and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: every command green, recorded here with the date and the counts

## Workflow follow-up

- Archive after 2.1; the archive merges the delta into `private-rooms/editor-integration`.
