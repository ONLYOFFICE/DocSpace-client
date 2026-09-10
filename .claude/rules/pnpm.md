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

The repo has several independent lockfiles; the root audit sees only this
workspace. `node .claude/scripts/audit/audit-deps.mjs` (skill: `audit-deps`)
audits all of them and prints the override line for each finding. Each lockfile
is refreshed by its own command and must be committed together with the
`package.json` that changed — see `.claude/rules/generated-artifacts.md`.

`packageManager` in `package.json` is the single source of truth for the pnpm
version: CI (`pnpm/action-setup`) reads it, and the Dockerfiles pin the same
version in `npm install -g pnpm@…` — bump them together.

## The ui-kit tarball dependency

`@onlyoffice/apps-ui-kit` is **not** a pnpm workspace package. `libs/ui-kit` is
a separately cloned repository (gitignored, not a git submodule of this repo);
the six apps that use it depend on a committed tarball at the repo root via
`"file:../../onlyoffice-apps-ui-kit.tar.gz"`. Rebuild it with
`pnpm run build:ui-kit-tarball` after pulling a new `libs/ui-kit` commit, then
`pnpm install` here to relink against the refreshed tarball — see the
"ui-kit: separate repo, consumed as a tarball" section in `CLAUDE.md`.

The tarball must be produced by `pnpm pack`, not `npm pack`: ui-kit's `main`,
`module`, `types` and `exports` fields live under `publishConfig`, which only
pnpm promotes to the top level when packing. An npm-packed tarball has no
entry points at all. `scripts/build-ui-kit-tarball.js` always uses `pnpm`.

`libs/ui-kit/package.json`'s `exports` map is itself generated at build time
by `libs/ui-kit/scripts/generate-exports-map.mjs` (wired into ui-kit's own
`pnpm build`) — one exact key per real `dist/` module subpath, not a
hand-written wildcard. A single `"./*"` wildcard cannot serve this package: it
mixes flat-file modules (`billing/utils/common.ts`) and folder-with-index
modules (`context/InterfaceDirectionContext/index.tsx`) throughout, and per
the ES module spec, the `exports`-array fallback only skips an entry on a
condition mismatch, never on a missing file — so any single wildcard pattern
order always breaks one shape or the other for a real deep import. This was
invisible while ui-kit was a pnpm workspace package, because that resolved
straight into source and never consulted `exports` at all; it only surfaces
once the package is actually installed from a tarball. `build-ui-kit-tarball.js`
restores `libs/ui-kit/package.json` to its pre-build state after packing
(only when its working tree was clean beforehand), so the ~900 generated
entries never need to be committed there.
