---
name: update-pnpm
description: Bump the pinned pnpm version across every place it is hardcoded (client package.json and Dockerfiles, the ui-kit submodule, the buildtools build image) and check pnpm config compatibility — unknown, misspelled, superseded and .npmrc-stranded settings, plus new settings worth adopting. Use when upgrading pnpm, when a Dockerfile and packageManager have drifted apart, when a pnpm setting mysteriously has no effect, or when asked which pnpm version the repo uses.
argument-hint: "[<version>|latest|latest-11] [--check]  (no argument = latest)"
---

# Bump the pinned pnpm version

The pnpm version is pinned in **three separate repos** and in two different
syntaxes. A bump that only touches `packageManager` leaves every Docker build
on the old version — the local dev install and the released image silently
disagree, and nothing in the pre-push gate or CI catches it.

`--check` reports version drift and runs the config audit (§5) without editing
anything — use it to answer "is our pnpm config still valid?" on its own.

---

## 1. Resolve the target version

**The version argument is optional.** With no argument, target `latest` — do not
ask the user which version to use, resolve it:

```bash
npm view pnpm dist-tags --json     # latest, latest-11, latest-12, …
node -p "require('./package.json').packageManager"   # what is pinned now
```

Then report `current → target` and act on the comparison:

| Case | Do |
|---|---|
| already on the target | say so and stop — nothing to bump. Still offer the config audit (§5), which is useful on its own |
| same major | proceed without asking |
| **major differs** | stop and confirm with the user first, then work through §6 |

A major bump is the only case that needs a question, because majors change
install behaviour and this repo is usually on a `release/*` branch. Name the
concrete risks when asking (see §6) rather than asking an open "which version?".

An explicit argument overrides all of this: `12.4.1` pins that exact version,
`latest-11` the newest of that major. Pass a dist-tag or an exact version, never
a range.

---

## 2. Find every pin site

Never work from a remembered list — rediscover it, because new packages arrive
with new Dockerfiles:

```bash
# client repo + ui-kit submodule
grep -rn "pnpm@[0-9]" --include="*.json" --include="Dockerfile*" . \
  | grep -v node_modules
grep -n '"pnpm"' package.json                      # engines.pnpm

# buildtools is an OPTIONAL sibling repo - the client clones fine without it,
# so always guard, never assume the path exists
[ -d ../buildtools ] && grep -rEn "pnpm@|corepack|install -g pnpm" ../buildtools \
  | grep -v node_modules || echo "buildtools not cloned - skipping"
```

If `../buildtools` is absent, that is normal: skip every buildtools step, finish
the client and ui-kit work, and say so in the report rather than failing or
asking the user to clone it.

### Sites that must be edited by hand

| Repo | File | Form |
|---|---|---|
| client | `package.json` | `"packageManager": "pnpm@X.Y.Z"` **and** `"engines": { "pnpm": ">=MAJOR" }` |
| client | `docker/Dockerfile`, `docker/e2e/Dockerfile` | `npm install -g pnpm@X.Y.Z` |
| client | `packages/{client,login,doceditor,management,sdk}/Dockerfile` | `npm install -g pnpm@X.Y.Z` |
| ui-kit submodule | `libs/ui-kit/package.json` (both `packageManager` and `engines.pnpm`), `libs/ui-kit/Dockerfile` | same two forms |

That is 8 files in the client repo and 2 in the submodule. Keep every one on the
**exact same version** — the Dockerfiles install pnpm globally with npm, which
has no `packageManager` fallback, so a stale pin there really is the version the
image ships.

### Sites that follow automatically — do NOT edit

- `.gitea/workflows/frontend-common-tests.yaml` — `pnpm/action-setup@v4` with no
  `version:` input deliberately reads `packageManager`. Adding a `version:` here
  would create a fourth pin to keep in sync.
- `libs/ui-kit/.github/workflows/ci.yml` — same pattern.
- `../buildtools/install/docker/build/Dockerfile` — `corepack enable`, then runs
  `pnpm` inside `client/`, where the corepack shim fetches exactly the pinned
  `packageManager` version. Correct as is, and it must **stay** a bare
  `corepack enable`: a `corepack prepare pnpm@latest --activate` pins nothing,
  downloads a second pnpm whenever latest drifts off the pin, and leaves an
  unpinned pnpm as the image-wide default for anything built outside `client/`.
- `common/tests/package.json` — pinned to **npm**, not pnpm. Unrelated.

### Also audit buildtools for flags the new major dropped

buildtools drives every release build and is **not** covered by the client's
gate or CI, so a removed flag there surfaces as a broken release build. Only
possible when the repo is actually cloned next to the client:

```bash
[ -d ../buildtools ] && grep -rn "pnpm .*--" ../buildtools --include="*.sh" \
  --include="*.bat" --include="Dockerfile*" --include="Jenkinsfile" \
  | grep -v node_modules || echo "buildtools not cloned - skipping flag audit"
```

Check each flag against the target version — `pnpm <cmd> --help` lists them, but
absence from `--help` is not proof: verify by running the flag against the new
pnpm in a throwaway directory pinned with `packageManager`, and confirm the
control case (a bogus flag must error) so "accepted" means something.
Flags currently relied on: `--frozen-lockfile` and
`--dangerously-allow-all-builds` (MCP build) — both still valid in pnpm 12. The
Windows build does **not** use `--node-linker`; it edits `pnpm-workspace.yaml`
instead, for the reason given in §5.

Sibling repos built by the same scripts (`mcp`, checked out next to `client`)
carry their own `packageManager` and lockfile. They are **not** covered by this
skill; check their pin separately, because a build server with an unpinned
global pnpm will silently build them with whatever it has.

#### In buildtools: report defects, do not fix them

The only buildtools edit this skill makes is the version bump itself (and
keeping the build image on a bare `corepack enable`). Anything else the audit
turns up — a dead `sed`, a build script using a flag the new major dropped, a
stale workaround — gets **reported to the user, not edited**. buildtools is a
shared repo with its own release cadence, and a plausible-looking fix here is
the single most likely way this skill causes a merge conflict.

Before touching any buildtools file, check whether a fix already exists on an
unmerged branch:

```bash
git -C ../buildtools log --oneline --all -3 -- <file>
git -C ../buildtools branch -a --contains <commit>
```

Real example: `install/win/frontend-build.bat` carried a `sed` that uncommented
`node-linker=hoisted` in the client's `.npmrc`. When that line was dropped from
`.npmrc`, the `sed` silently stopped matching and the Windows build started
failing on MAX_PATH — a green build with the wrong layout. A fix already existed
on an unmerged `bugfix/frontend-build`, so rewriting it here would only have
produced a duplicate change and a conflict. Say what is broken and where the fix
already lives; let the user merge it.

That episode is also why the replacement contract is spelled out in
`pnpm-workspace.yaml` itself: the `sed` now targets the commented `nodeLinker`
line there, and its wording must not be reformatted.

Because pnpm ≥10 self-manages via `managePackageManagerVersions`, editing
`packageManager` is normally enough to switch the local binary; a Homebrew or
global pnpm of a different version is overridden inside the repo.

**One exception, on Windows.** Self-switching into pnpm ≥12 from a global pnpm
≤11 has been observed to leave a broken shim — the npm `pnpm` package is a
wrapper whose install script swaps in the native binary, and that script does
not run under self-switching, so cmd.exe ends up invoking a shell stub it cannot
execute. `pnpm install`, `pnpm start` and the whole pre-push gate then fail. The
fix is one-time, per machine, and cannot be made in the repo:

```powershell
npm i -g pnpm@<new version>
```

When a bump crosses into a new major, say this in the report so Windows users
are not left debugging it.

---

## 3. Edit

```bash
OLD=11.19.0; NEW=12.3.4
sed -i '' "s/pnpm@${OLD}/pnpm@${NEW}/" \
  package.json docker/Dockerfile docker/e2e/Dockerfile \
  packages/{client,login,doceditor,management,sdk}/Dockerfile
# engines only when the major changed
sed -i '' 's/"pnpm": ">=11"/"pnpm": ">=12"/' package.json
```

The `sed -i ''` above is the macOS form. On Linux use `sed -i` without the `''`;
in Git Bash on Windows the `''` is also wrong, and `sed -i.bak` followed by
deleting the `.bak` files is the portable option. Check the result either way —
a mis-quoted `-i` silently writes to a file named `''`.

The ui-kit files are **committed in the ui-kit repo**, never here. Edit them in
`libs/ui-kit/`, commit and push there, then commit the gitlink in the client
repo — see the ui-kit section of `CLAUDE.md`. The submodule may be
uninitialised (a clone without `--recurse-submodules` leaves `libs/ui-kit`
empty), so check before editing and skip that half if so:

```bash
[ -f libs/ui-kit/package.json ] || echo "ui-kit not initialised - skipping"
```

The submodule carries a standalone lockfile that also records the pinned pnpm
(see §4), so refresh it from the client root with the sanctioned wrapper — it
moves the root `pnpm-workspace.yaml` aside so the submodule resolves on its own:

```bash
pnpm run update-ui-kit-lock
```

Afterwards confirm the root `pnpm-workspace.yaml` came back (`git status` must
show it unmodified and no `pnpm-workspace.yaml.bak` left behind) — the wrapper
restores it with `mv`, which a failed install can interrupt.

---

## 4. Verify

```bash
pnpm --version                  # must print NEW (self-switch via packageManager)
pnpm install                    # validates pnpm-workspace.yaml, refreshes the lock
pnpm install --frozen-lockfile  # exactly what CI runs; must not error
git diff --stat pnpm-lock.yaml
```

Then run enough of the pre-push gate to prove the toolchain still drives the
build — at minimum `pnpm run tsc` and `pnpm run lint`, and for a major bump the
full gate (`pnpm run test`, `pnpm run test:client`).

Expect **both** lockfiles (root and `libs/ui-kit/`) to change even when no
dependency did: since pnpm 12 the lockfile carries a
`packageManagerDependencies` document pinning the pnpm binary itself with
per-platform integrity hashes, so every version bump rewrites it. That makes
`pnpm-lock.yaml` a **multi-document YAML** (a `---` separator before the real
lockfile). Nx parses this file for its project graph
(`nx/dist/src/plugins/js/lock-file/pnpm-parser.js`) and has handled multiple
documents since 22.7, so the pinned Nx must stay at or above that; a downgrade
below it would break the graph. `.claude/scripts/audit/audit-deps.mjs` only uses
the file as a marker for tree discovery. Any new script that reads it needs a
multi-document loader.

The diff should be **purely additive** when only the pnpm version changed.
Verify before accepting it:

```bash
git diff pnpm-lock.yaml | grep -c "^-[^-]"    # expect 0
```

A non-zero count means dependency resolution moved too, which is a separate
change that needs its own review.

Commit `pnpm-lock.yaml` together with the `package.json` that changed; see
`.claude/rules/generated-artifacts.md`.

---

## 5. Check config compatibility

A version bump can invalidate settings, rename them, or add ones worth adopting.
Run the checker against every `pnpm-workspace.yaml` in the repo — it is the step
that turns "the install worked on my machine" into a real answer:

```bash
node .claude/scripts/pnpm/check-config.mjs
```

It reports four failures (exit 1) and one advisory (exit 0):

| Report | Why it matters |
|---|---|
| **unknown setting** | A typo, or a setting the new major removed. pnpm ≥12 fails the install on these; pnpm ≤11 ignored them silently, so they can be long-standing dead config. |
| **wrong spelling** | `node-linker` instead of `nodeLinker`. `pnpm-workspace.yaml` is **camelCase**; the kebab-case spelling is the `.npmrc` form. pnpm ≤11 ignores it silently — the setting simply never takes effect — and pnpm ≥12 fails the install. |
| **superseded** | e.g. `cleanupUnusedCatalogs` → `catalogPrune`, `onlyBuiltDependencies`/`ignoredBuiltDependencies` → `allowBuilds`. Still works, but migrate while you are here. |
| **stranded in `.npmrc`** | Since pnpm 11 `.npmrc` is auth/registry only. A pnpm setting left there does nothing at all, and the file still looks correct — the nastiest of the four. |
| **new since baseline** (advisory) | Settings that appeared since the last bump, with their descriptions, as adoption candidates. |

Review the new settings and *propose* the ones that fit this repo rather than
adopting them wholesale — say what each would change and let the user decide.
Then record the new surface so the next bump diffs against it:

```bash
node .claude/scripts/pnpm/check-config.mjs --update-baseline
```

Commit `settings-baseline.json` with the bump; it is what makes the next
"what is new" diff meaningful. `--offline` checks against the baseline alone
when the schema cannot be fetched, and `--json` is for scripting.

### Settings that are a build concern, not a repo concern

Some settings fix one environment and would change everyone else's install.
`nodeLinker: hoisted` is the standing example: it flattens `node_modules`, which
rescues the Windows installer build from `MAX_PATH` failures during the copy
step, but repo-wide it changes resolution for every developer, CI job and Docker
build and re-exposes phantom dependencies.

**A CLI flag cannot scope such a setting to one build.** `pnpm install
--node-linker=hoisted` does produce a flat tree, but pnpm verifies the
dependency tree before running a script, so the next `pnpm run …` relinks it
back to the layout declared in `pnpm-workspace.yaml`. Anything that must hold
until a later script runs has to be declared in the file.

What this repo does instead: `nodeLinker: hoisted` ships **commented out** in
`pnpm-workspace.yaml`, and the Windows build uncomments it in place with a
`sed` matching `^# *nodeLinker: *hoisted`. That makes the comment's exact
wording a contract with buildtools — a failed match is silent, leaving a green
build with the wrong layout. Never reword such a line without grepping
buildtools for it.

`virtualStoreDirMaxLength` is the narrower alternative when the isolated linker
must be kept and only path length is the problem. Only put such a setting in
`pnpm-workspace.yaml` uncommented when every consumer of the repo genuinely
wants it.

---

## 6. Extra checks for a major bump

Read the release notes (`https://pnpm.io/blog/whats-different-in-pnpm-<major>`)
and check the repo against each breaking change. For 11 → 12 the ones that
actually touch this repo:

- **Unknown `pnpm-workspace.yaml` keys now hard-fail** when `packageManager` is
  pinned — and it always is here. A successful `pnpm install` is the proof; a
  typo that pnpm 11 silently ignored surfaces as an error.
- **`--resolution-only` was removed** (use `pnpm peers check`) and
  `--frozen-lockfile false` is gone (use `--no-frozen-lockfile`). Grep the
  workflows, `lefthook.yml` and `package.json` scripts for both.
- **Cycle-breaking was recanonicalised**, so a lockfile churn with no dependency
  change is expected and benign. Confirm the diff has no deletions before
  accepting it.
- **`engineStrict` got stricter** inside optional-dependency subtrees.
- Installs now run a supply-chain policy pass over the lockfile (~10s on this
  repo), so CI install steps get slower — not a failure.

Settings live in `pnpm-workspace.yaml`, not `.npmrc` and not the `pnpm` field of
`package.json` — see `.claude/rules/pnpm.md` before changing any of them.

---

## 7. Report

State the version moved from → to, list the files changed in each repo, and give
the verification commands that passed. Say explicitly for ui-kit and buildtools
which of three applies: changed, checked and already correct, or **not present
in this checkout** — never let a missing optional repo read as "nothing to do
there". If ui-kit was edited, remind the user it needs its own commit plus a
gitlink bump here.
