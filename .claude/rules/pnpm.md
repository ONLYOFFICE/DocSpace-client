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

`packageManager` in `package.json` is the single source of truth for the pnpm
version: CI (`pnpm/action-setup`) reads it, and the Dockerfiles pin the same
version in `npm install -g pnpm@…` — bump them together.
