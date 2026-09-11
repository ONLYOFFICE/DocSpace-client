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

`@onlyoffice/apps-ui-kit` is **not** a pnpm workspace package and ui-kit is not
checked out inside this repo at all. The six apps that use it depend on a
committed tarball at the repo root via
`"file:../../onlyoffice-apps-ui-kit.tgz"`.

The tarball is built and packed in the `docspace-ui-kit-react` repository and
copied here by hand; there is no build script on this side. To update: replace
`onlyoffice-apps-ui-kit.tgz` at the root, run `pnpm install`, and commit the
tarball with the resulting `pnpm-lock.yaml` change.

The tarball must be produced by `pnpm pack`, not `npm pack`: ui-kit's `main`,
`module`, `types` and `exports` fields live under `publishConfig`, which only
pnpm promotes to the top level when packing. An npm-packed tarball has no
entry points at all.

ui-kit's `exports` map is generated at build time by its own
`scripts/generate-exports-map.mjs` — one exact key per real `dist/` module
subpath, not a hand-written wildcard. A single `"./*"` wildcard cannot serve
this package: it mixes flat-file modules (`billing/utils/common.ts`) and
folder-with-index modules (`context/InterfaceDirectionContext/index.tsx`)
throughout, and per the ES module spec, the `exports`-array fallback only skips
an entry on a condition mismatch, never on a missing file — so any single
wildcard pattern order always breaks one shape or the other for a real deep
import. This was invisible while ui-kit was a pnpm workspace package, because
that resolved straight into source and never consulted `exports` at all; it
only surfaces once the package is installed from a tarball.

Because those ~900 subpaths are real `node_modules` entry points and the app
imports them directly, Vite treats each one as its own optimizable dependency.
`packages/client/vite.config.ts` lists ui-kit in `optimizeDeps.include` with
subpath globs for exactly this reason — without them a cold dev start
pre-bundles each subpath separately. `@onlyoffice/ai-chat` is deliberately
`optimizeDeps.exclude`d instead, to keep the lazy AI chunking in
`config/build.ts` intact.

### The ai-chat peer

`@onlyoffice/ai-chat` is an **optional peer** of ui-kit, and ui-kit statically
imports it from 19 of its `ai-agent/*` and `api/ai` modules without bundling
it. The client-side `file:../../onlyoffice-ai-chat-<version>.tgz` dependency is
what satisfies that peer, so it must stay declared in every app that reaches
those subpaths — dropping it resolves the peer to nothing and breaks the AI
agent at runtime.
