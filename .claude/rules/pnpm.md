---
paths:
  - "pnpm-workspace.yaml"
  - "package.json"
  - "**/package.json"
  - "**/Dockerfile*"
  - ".gitea/workflows/**"
  - ".github/workflows/**"
---

# pnpm configuration

All pnpm settings live in `pnpm-workspace.yaml` (`overrides`, `allowBuilds`, …) —
since pnpm 11 `.npmrc` is read for auth/registry only, and the `pnpm` field in
`package.json` is ignored.

Settings use **camelCase** here (`nodeLinker`), not the kebab-case `.npmrc`
spelling (`node-linker`). A kebab key is silently ignored by pnpm ≤11 and fails
the install on pnpm ≥12; a pnpm setting left in `.npmrc` does nothing at all.
`node .claude/scripts/pnpm/check-config.mjs` (skill: `update-pnpm`) audits both
files for unknown, misspelled, superseded and stranded settings, and lists
settings added since the last pnpm bump.

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

## pnpm version pinning

`packageManager` in `package.json` is the source of truth only for the tools
that read it: `pnpm/action-setup` in CI, corepack in the buildtools build image,
and pnpm's own self-switching. The Dockerfiles install pnpm with
`npm install -g pnpm@…`, which has no such fallback — a stale pin there is the
version the image really ships.

The version is therefore hardcoded across three repos: 8 files here
(`package.json`, including `engines.pnpm`, plus `docker/Dockerfile`,
`docker/e2e/Dockerfile` and the five `packages/*/Dockerfile`) and 2 in the
`libs/ui-kit` submodule. buildtools pins no version, but only because its build
image uses a bare `corepack enable` and lets `packageManager` decide — adding a
`corepack prepare pnpm@latest` there would silently reintroduce an unpinned
pnpm. Bump them together with the `update-pnpm` skill, which rediscovers the pin
sites rather than trusting this list, knows which sites follow `packageManager`
automatically, and audits the buildtools scripts for flags a new major drops.

Since pnpm 12 the lockfile also carries a `packageManagerDependencies` document
pinning the pnpm binary itself, which makes `pnpm-lock.yaml` a multi-document
YAML file. Nx parses it for the project graph and has supported multiple
documents since 22.7, so the pinned Nx must not drop below that. Any new script
that reads the lockfile needs a multi-document loader.
