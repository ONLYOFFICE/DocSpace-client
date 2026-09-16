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

The repo has several independent lockfiles; the root audit sees only this
workspace. `node .claude/scripts/audit/audit-deps.mjs` (skill: `audit-deps`)
audits all of them and prints the override line for each finding. Each lockfile
is refreshed by its own command and must be committed together with the
`package.json` that changed — see `.claude/rules/generated-artifacts.md`.

## pnpm version pinning

`packageManager` in `package.json` is the source of truth only for the tools
that read it: `pnpm/action-setup` in CI, corepack in the buildtools build image,
and pnpm's own self-switching. The Dockerfiles install pnpm with
`npm install -g pnpm@...`, which has no such fallback - a stale pin there is the
version the image really ships.

The version is therefore hardcoded across three repos: 8 files here
(`package.json`, including `engines.pnpm`, plus `docker/Dockerfile`,
`docker/e2e/Dockerfile` and the five `packages/*/Dockerfile`) and 2 in
`docspace-ui-kit-react` (its `packageManager` and its `Dockerfile`; that repo
declares no `engines.pnpm`, since pnpm is not a constraint on a consumer of the
published package). buildtools pins no version, but only because its build
image uses a bare `corepack enable` and lets `packageManager` decide - adding a
`corepack prepare pnpm@latest` there would silently reintroduce an unpinned
pnpm. Bump them together with the `update-pnpm` skill, which rediscovers the pin
sites rather than trusting this list, knows which sites follow `packageManager`
automatically, and audits the buildtools scripts for flags a new major drops.

Since pnpm 12 the lockfile also carries a `packageManagerDependencies` document
pinning the pnpm binary itself, which makes `pnpm-lock.yaml` a multi-document
YAML file. Nx parses it for the project graph and has supported multiple
documents since 22.7, so the pinned Nx must not drop below that. Any new script
that reads the lockfile needs a multi-document loader.

## The ui-kit tarball dependency

`@onlyoffice/apps-ui-kit` is **not** a pnpm workspace package and ui-kit is not
checked out inside this repo at all. The six apps that use it depend on a
committed tarball at the repo root via
`"file:../../onlyoffice-apps-ui-kit.tgz"`.

The tarball is built and packed in the `docspace-ui-kit-react` repository
(`pnpm build && pnpm pack`) and copied here; there is no build script on this
side. The filename carries no version on purpose - the version lives in the
package and shows up in the lockfile entry, so a bump touches no app manifest.

**Do not update it by hand.** Copying the `.tgz` over and running `pnpm install`
silently installs nothing: the `file:onlyoffice-apps-ui-kit.tgz` specifier is
unchanged, pnpm matches the integrity already in `pnpm-lock.yaml` and keeps the
cached copy. The install is green, the lockfile is untouched, and node_modules
still holds the previous build. `pnpm install --force` does not help either,
because the recorded integrity still matches what it has.

```bash
pnpm run update-ui-kit                 # newest pack in ../../docspace-ui-kit-react
pnpm run update-ui-kit path/to/pack.tgz
```

It copies the tarball, rewrites the recorded integrity, drops the extracted
copy under `node_modules/.pnpm/`, reinstalls, and then verifies by hash that
what landed in node_modules is what was copied in - the silent no-op above is
precisely what it refuses to let pass. Commit `onlyoffice-apps-ui-kit.tgz`
together with the `pnpm-lock.yaml` change it produces.

The verification digests **everything the tarball ships** in **every** extracted
copy under `node_modules/.pnpm/@onlyoffice+apps-ui-kit@*` (skipping the
`node_modules` pnpm adds there), against the tarball read with node's own gzip
and tar walker. Three earlier shortcuts are why: comparing only
`dist/styles.css` passed any build that changed just JavaScript; comparing only
`dist/` missed `styles/` and `locales/`, which the exports map serves directly
and which hundreds of the client's own `.module.scss` files `@use`; and checking
only the copy the client resolves left a stale sibling in place, which is what
the apps resolving to *that* copy would run. It also runs when the tarball is
unchanged, because the install can die after the lockfile and the extracted
copies were already rewritten. The `tar` binary is deliberately not used - the
GNU tar shipped with Git Bash reads a Windows path as a remote `host:path` spec
and refuses it.

### Running the client against a ui-kit checkout

Waiting for build, pack, install and a dev-server restart on every ui-kit edit
is the cost of consuming a prebuilt package. `DOCSPACE_UI_KIT_SRC` removes it
for local work by pointing the client's Vite at a checkout instead:

```bash
pnpm run start:ui-kit-src                 # same app set as `pnpm start`
pnpm run start:ui-kit-src start:lite      # any other start script
DOCSPACE_UI_KIT_SRC=../elsewhere pnpm run start:ui-kit-src
```

Use the **root** script, or the "Start (ui-kit src)" button. `pnpm start` fans
out to five apps through Nx, so the root is where the variable has to be set; a
script in `packages/client` alone is never the one anyone runs. The path is
resolved against the repo root. The switch lives entirely in
`packages/client/config/` (`ui-kit-dev.ts` plus one line each in `resolve.ts`,
`css.ts`, `server.ts` and `vite.config.ts`) and changes nothing in the ui-kit
repository; the checkout serves its own `assets/`, `styles/` and `locales/`,
exactly as the tarball does. `optimizeDeps` drops the ui-kit globs in this mode,
because pre-bundling would freeze the files being edited.

Four properties keep it honest:

- **It is a Vite alias only, never a tsconfig path.** `pnpm tsc` in the pre-push
  gate keeps resolving `@onlyoffice/apps-ui-kit` through `node_modules`, so a
  client import of a subpath the *package* does not export still fails the gate
  while the browser is happily serving source.
- **It is a dev-server switch only.** `vite.config.ts` refuses `vite build`
  while the variable is set. `resolve` and `css` are shared by both commands, so
  a build would otherwise take ui-kit from the checkout - and emit a different
  artifact, since the chunking rules in `config/build.ts` match node_modules
  paths a checkout does not have.
- **An import that escapes the checkout fails.** Under the alias, ui-kit source
  is processed by the client's config, so `PUBLIC_DIR`, `SRC_DIR`,
  `@docspace/shared` and friends would resolve from inside ui-kit and break only
  later, in its own rollup build. `config/plugins/ui-kit-boundary.ts` covers
  JS/TS; sass never reaches `resolveId`, so `config/css.ts` carries the same
  check in its `findFileUrl` importer, keyed on `containingUrl`.
- **Source mode is more forgiving than packing.** It does not exercise the
  extracted stylesheet and its cascade order, `"use client"` preservation, the
  exports wildcard and module shape, the generated `.d.mts`, or the type-only
  subpaths that have no runtime module. Run the client once **without** the
  variable before committing a new tarball.

`resolve.dedupe` is built from the checkout's own `peerDependencies` rather than
a hand-picked list: every peer is a package both trees resolve separately, and a
second copy of anything holding module state (a context, a store, a socket) is a
silent behaviour change. A hand-picked subset rots on the next bump either side.

The tarball must be produced by `pnpm pack`, not `npm pack`: ui-kit's `main`,
`module`, `types` and `exports` fields live under `publishConfig`, which only
pnpm promotes to the top level when packing. An npm-packed tarball has no
entry points at all.

ui-kit's `exports` map is a single `"./*"` wildcard onto
`dist/{esm,cjs}/*/index.js`. That works only because its rollup build
normalises every module to `<subpath>/index.js` (`entryFileNames` in its
`rollup.config.mjs`), giving the package one uniform shape. A wildcard cannot
serve a mixed tree: per the ES module spec the `exports`-array fallback skips an
entry on a condition mismatch, never on a missing file, so with both flat-file
and folder-with-index modules present either pattern order breaks one shape.
An earlier iteration generated ~900 exact keys instead; normalising the output
replaced both the map and the script that wrote it.

Because those subpaths are real `node_modules` entry points and the app imports
them directly, Vite treats each one as its own optimizable dependency.
`packages/client/vite.config.ts` lists ui-kit in `optimizeDeps.include` with
subpath globs for exactly this reason - without them a cold dev start
pre-bundles each subpath separately. `@onlyoffice/ai-chat` is deliberately
`optimizeDeps.exclude`d instead, to keep the lazy AI chunking in
`config/build.ts` intact.

### The ai-chat peer

`@onlyoffice/ai-chat` is an **optional peer** of ui-kit, and ui-kit statically
imports it from its `ai-agent/*` and `api/ai` modules without bundling it. The
client-side `file:../../onlyoffice-ai-chat-<version>.tgz` dependency is what
satisfies that peer, so it must stay declared in every app that reaches those
subpaths - dropping it resolves the peer to nothing and breaks the AI agent at
runtime.

27 of ai-chat's own 31 peers are optional too, so pnpm installs none of them
for an app that does not declare them. An app that reaches `ai-agent/*` has to
declare that list itself; `packages/client` and `packages/sdk` do, and
`UnusedDependenciesTest` allowlists them because nothing imports them by name.
