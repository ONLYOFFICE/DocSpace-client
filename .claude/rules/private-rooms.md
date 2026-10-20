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
  - "packages/client/src/pages/E2eRooms/**"
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
5. The feature stays behind the `privateRooms` localStorage flag
   (`packages/shared/utils/privateRooms.ts`) until a change explicitly
   releases it; see `private-rooms/feature-gating`.
