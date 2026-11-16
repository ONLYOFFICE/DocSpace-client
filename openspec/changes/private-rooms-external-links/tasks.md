# Tasks

The Backend tasks are done in `../server` by the backend team, on its own branch; nothing of them is committed from this repository. A Client task starts only after the Backend task it names has merged and been read through CodeGraph; one task is then one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). Keep the pre-push gate in mind: tsc, biome, the locale tests and the shared, client and sdk unit tests stay green.

## 0. Decisions (before any other task)

- [ ] 0.1 Record the owner's answers to decisions 1 to 4 of proposal.md with their date in proposal.md and design.md, and revise the deltas and the tasks below where an answer differs from the assumed one. Verify: `npx -y @fission-ai/openspec@1.17.0 validate private-rooms-external-links --strict`
- [ ] 0.2 Read in `../server`, through CodeGraph, how a file is served to a visitor of an external link and how the editor configuration is built for one, record both in design.md, then hand the `server-contract` delta to the backend team and record its reply with the date: the three fields added to the share record of a link, the routes, the proof and the name of the portal setting. Verify: those records, and the deltas revised where the reply differs
- [ ] 0.3 Ask the Document Server team whether a visitor without an account can join an encrypted editing session and whether view mode opens an encrypted document for one, and record the answer in design.md with its date. Verify: that record; the tasks of group 5 start only on a yes
- [ ] 0.4 Get from design the two screens the existing link controls lack, the notice at the creation of a link and the page of a visitor with its password prompt, and revise in the deltas of this change the main requirements that hide the Share tab and the link entries of the menus for private items (`room-membership`, "Share tab hidden for private items"; `file-operations`, "Context-menu entries withheld for encrypted files" and the one for folders). Verify: the screens linked from design.md and `validate --strict`

## 1. Server

- [ ] 1.1 Backend, after 0.2: the portal setting for external links of private rooms, and an external link of a private item stored as an ordinary link, primary or additional within the same limits, with its public key, sealed private key and proof hash, created and revoked by a caller who may change the access; a link without the key material, with the access to fill forms or with the download ban, and every invitation link, stays refused. Verify: server tests for each scenario of "No external or invitation links on a private room" of the delta
- [ ] 1.2 Backend, after 1.1: list the public keys of the links that cover a file with the members' keys, store a wrap for a link, refuse one for a link that does not cover the file, report the files a link has no wrap for, and delete the wraps and the sealed key at a revocation. Verify: server tests for each scenario of "External links of a private item are recipients of file keys", and for the wraps gone after a revocation
- [ ] 1.3 Backend, after 1.1: serve a link only against the proof, with the slowing of repeated wrong proofs, to a visitor without an account; serve the ciphertext and the wrap as stored, with the rights of the role and nothing outside the link; write the audit events. Verify: server tests for each scenario of "A link is served only against a proof of its secret", "A visitor of a link gets the content as stored" and "Use of an external link of a private item is audited"
- [ ] 1.4 Backend, after 1.3 and a yes to 0.3: the editor configuration of a visitor in the mode of the link's access, commenting, reviewing or editing, and the save of an encrypted document by one. Verify: a server test for "Document opened through a link with another access"

## 2. Crypto core

- [ ] 2.1 Client, after 0.1: add to `packages/shared/services/encryption` the key pair of a link, the derivation of the sealing key and of the proof from the secret under separate labels, with the password mixed in, and the sealing of the link's private key in an envelope. Verify: unit tests named after the scenarios of "The secret of a link stays in the address", run with `cd packages/shared && pnpm exec vitest run services/encryption`
- [ ] 2.2 Client, after 2.1: wrap a file key for a link and open it with the link's key, with the link id as the recipient. Verify: unit tests named after the scenarios of "An external link has a key pair of its own", same command

## 3. Creating and revoking

- [ ] 3.1 Client, after 1.1 and 1.2 have merged: add the link requests to `packages/shared/api` with MSW handlers whose doc comments name the controller actions and contract cases for the scenarios of the two server requirements. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`, and `pnpm exec tsc` in the six packages
- [ ] 3.2 Client, after 3.1 and 0.4: show for private items the link controls ordinary items have, in the client and the SDK, with the four accesses, the settings without the download ban, the notice at the creation and the revocation with its confirmation. Add the Common keys with `/translate-comments` and `/translate-locales` in the same commit. Verify: unit tests named after the scenarios of the three `room-membership` requirements of the delta, `cd common/tests && npx vitest run test/locales.test.js`, and a new E2E spec `packages/client/__tests__/private-room-external-links.spec.ts` under Docker `tests-dev`
- [ ] 3.3 Client, after 3.1: wrap for the links of a room at every upload and in the backfill (`packages/shared/services/private-room`). Verify: unit tests "File added under a linked folder" and a backfill case for a link, and the shared private-room integration tests

## 4. Visitor, access to view

- [ ] 4.1 Client, after 1.3 has merged: the requests of a visitor with their mocks and contract cases. Verify: `cd packages/shared && pnpm exec vitest run __mocks__/handlers`
- [ ] 4.2 Client, after 4.1: the public page of a link to a file, a folder and a room for a visitor who is not signed in: the password prompt, the decrypted names, the preview, the download, and the states of a revoked, expired or incomplete link. Add and translate the Common keys in the same commit. Verify: unit tests named after the scenarios of "A visitor opens an external link without an account", the locale tests, and E2E cases in `private-room-external-links.spec.ts`

## 5. Visitor in the editor

- [ ] 5.1 Doceditor, after 1.4 has merged and `private-rooms-editor-contract` 6.2 is done: open a document for a visitor of a link in the mode of the link's access, with the file key taken from the link. Verify: unit tests next to the key hook of `packages/doceditor`, and E2E cases for the four accesses named after the scenarios of "What a visitor of an external link can do"
- [ ] 5.2 Stand, after 5.1: a visitor without an account edits a document through a link while a member edits it, both save, and both reopen it. Verify: the run recorded in design.md with the date and the builds

## 6. Integration

- [ ] 6.1 Run the pre-push gate (`npm --prefix ./common/tests run test:lefthook`, then `nx run-many -t tsc lint test` over the six packages), the client and SDK private-room specs under Docker and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Verify: green runs recorded in design.md with the date
- [ ] 6.2 Manual check on a stand with the merged server: create a link with a password, open it in a browser that is not signed in, read and download a file, revoke the link and open the address again; read the audit trail. Verify: the run recorded in design.md with the date and the builds

## Workflow follow-up

- Archive when the Backend tasks have merged and the Client tasks are done.
- The release notes and the documentation pack of `private-rooms-release-gate` state the promise of proposal decision 4.
