---
paths:
  - "pnpm-workspace.yaml"
  - "package.json"
  - "**/package.json"
  - "**/Dockerfile*"
  - ".github/workflows/**"
---

# pnpm configuration

All pnpm settings live in `pnpm-workspace.yaml` (`overrides`, `allowBuilds`, …) —
since pnpm 11 `.npmrc` is read for auth/registry only, and the `pnpm` field in
`package.json` is ignored.

Dependencies with install/postinstall scripts must be listed explicitly in
`allowBuilds` with a `true`/`false` value. An unreviewed package fails the
install with `ERR_PNPM_IGNORED_BUILDS` (`strictDepBuilds` is on by default), and
pnpm appends it to `pnpm-workspace.yaml` as a placeholder. Resolve placeholders
with `pnpm approve-builds` or by editing the file.

## Overrides

An override key may carry a selector (`"nanoid@^3"`), but the selector only
narrows *which dependents* get rewritten - the replacement range is resolved on
its own. `"nanoid@^3": ">=3.3.18"` therefore resolves to nanoid 6.x. Bound the
replacement to the major that is actually installed (`"^3.3.18"`) whenever more
than one major of the package exists in the lockfile.

The repo has seven independent lockfiles; the root audit sees only this
workspace. `node .claude/scripts/audit/audit-deps.mjs` (skill: `audit-deps`)
audits all of them and prints the override line for each finding. Each lockfile
is refreshed by its own command and must be committed together with the
`package.json` that changed — see `.claude/rules/generated-artifacts.md`.

`packageManager` in `package.json` is the single source of truth for the pnpm
version: CI (`pnpm/action-setup`) reads it, and the Dockerfiles pin the same
version in `npm install -g pnpm@…` — bump them together.
