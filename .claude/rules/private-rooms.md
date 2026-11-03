---
paths:
  - "packages/shared/services/encryption/**"
  - "packages/shared/services/private-room/**"
  - "packages/shared/context/encryption/**"
  - "packages/shared/dialogs/passphrase-modal/**"
  - "packages/shared/dialogs/key-generation/**"
  - "packages/shared/dialogs/key-recovery/**"
  - "packages/shared/dialogs/key-change-dialog/**"
  - "packages/shared/api/privacy/**"
  - "packages/shared/utils/privateRooms.ts"
  - "packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/**"
  - "packages/client/src/components/EncryptionProviderWrapper.jsx"
  - "packages/client/src/helpers/encryptedFileCreation.ts"
  - "packages/client/src/store/filesStore/encryption.helpers.ts"
  - "packages/client/src/store/uploadDataStore/encryption.helpers.ts"
  - "packages/client/__tests__/private-room*.spec.ts"
  - "packages/client/__tests__/keys-management*.spec.ts"
  - "packages/client/__tests__/encrypted-file-ui.spec.ts"
  - "packages/doceditor/src/hooks/useFileEncryptionKeys.ts"
  - "packages/doceditor/src/components/EncryptionProviderWrapper.tsx"
  - "packages/sdk/src/app/(private)/**"
  - "openspec/**"
---

# Private rooms are developed spec-first (OpenSpec)

Private (end-to-end encrypted) rooms are the one feature of this repo managed
with OpenSpec. The behaviour that exists on the branch is written down as
main specs, and every planned change is a change folder:

- `openspec/specs/private-rooms/<capability>/spec.md` — current truth, one
  file per capability (feature-gating, encryption-core, key-management,
  room-membership, file-operations, editor-integration, sdk-surface,
  server-contract). Deliberate v1 limitations are requirements phrased as
  SHALL NOT, so do not "fix" one without a change that modifies the spec.
- `openspec/changes/<change>/` — proposal, delta specs, design, tasks for
  work that is not on the branch yet. `openspec list` shows them.
- `openspec/config.yaml` — project context and artifact rules the `/opsx:*`
  commands apply.

Workflow:

1. Before touching code under the paths above, read the owning spec and run
   `openspec list` to see whether a change already covers the work.
2. New work starts with `/opsx:propose <name>` (planning only), is
   implemented with `/opsx:apply`, and ends with `/opsx:archive`, which
   merges the delta into the main spec. Do not edit main specs by hand to
   describe behaviour that is not on the branch yet.
3. A bug fix that changes observable behaviour still goes through a change,
   even a small one; a pure refactor sets `skip_specs: true`.
4. `npx -y @fission-ai/openspec@latest validate --all --strict` must pass
   before a push that touches `openspec/`. The CLI is not a repo dependency;
   `npx` fetches it (set `OPENSPEC_TELEMETRY=0`).
5. Specs own the what and the why. Do not restate a requirement or a
   design decision in code or test comments; where the behaviour is
   counter-intuitive on its own (fail closed, a withheld action), leave at most
   a one-line pointer `Spec: <capability>, "<requirement name>"`. Test names
   carry the scenario name instead of a comment.
6. Server behaviour is never invented or guessed. Every statement about
   `../server` in a spec, design, task, MSW handler or contract test comes
   from its actual implementation, looked up with CodeGraph
   (`codegraph_explore` / `codegraph explore "<symbol names>"`, see
   `../server/.claude/rules/csharp-lsp.md`) and read in the source. Client
   types and existing mocks are not evidence. No `.codegraph/` in `../server`
   or no `codegraph` CLI: stop and ask the user to install and index it
   (`npm i -g @colbymchenry/codegraph`, then `codegraph init` in `../server`)
   instead of guessing. Details: the "Server behaviour" paragraph of
   `openspec/config.yaml`.
7. Commit after every completed task: one task (one ticked sub-item of
   tasks.md) = one commit with its code, tests, locales, mocks and the tick;
   planning edits and archives get their own commits. Subject in English,
   following the repository history: `<Package>: <Area>: <imperative
   summary>`, e.g. `Client: Private rooms: refuse key-less uploads before the
   upload session`, or `OpenSpec: <change>: <summary>` for artifact-only
   commits; body in plain prose, ending with `OpenSpec: <change> <task id>`.
   No AI-attribution lines (CLAUDE.md), no `--no-verify`, no push unless
   asked. Full wording: the "Commits" paragraph of `openspec/config.yaml`.
8. The feature stays behind the `privateRooms` localStorage flag
   (`packages/shared/utils/privateRooms.ts`) until a change explicitly
   releases it; see `private-rooms/feature-gating`.
