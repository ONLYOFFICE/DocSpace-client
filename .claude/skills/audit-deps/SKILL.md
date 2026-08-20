---
name: audit-deps
description: Find and fix vulnerable dependencies across every lockfile in the repo (root pnpm workspace, the ui-kit submodule, the npm sub-projects under common/) — audits all trees, picks the right override, refreshes the lockfiles, verifies the result
argument-hint: "[--level <moderate|high|critical>] [--tree <substring>] [--strict]"
---

# Audit and fix vulnerable dependencies

`pnpm audit` at the repo root sees **one** of seven dependency trees. A clean
root audit says nothing about `common/tests`, the translation app, or the
ui-kit submodule — each carries its own lockfile and its own overrides.

Script (run from the repo root): `.claude/scripts/audit/audit-deps.mjs`

## Step 1 — audit every tree

```bash
node .claude/scripts/audit/audit-deps.mjs                 # all trees, severity >= moderate
node .claude/scripts/audit/audit-deps.mjs --level high
node .claude/scripts/audit/audit-deps.mjs --tree tests    # one tree
node .claude/scripts/audit/audit-deps.mjs --json
```

Read-only. For each finding it prints the advisory, the versions the lockfile
actually resolves, the paths that pull it in, and the override line that fixes
it — plus a consolidated override block per tree. Exit code 1 means findings at
or above `--level`.

The trees it covers:

| Tree | Manager | Overrides live in |
|---|---|---|
| root workspace (`packages/*`, `libs/*`) | pnpm | `pnpm-workspace.yaml` -> `overrides:` |
| `libs/ui-kit` (standalone lock) | pnpm | the **ui-kit repo**, not here |
| `common/tests` | npm | `common/tests/package.json` -> `overrides` |
| `common/translation-app/{frontend,backend}` | npm | that project's `package.json` |
| `common/oauth-sdk-stand`, `common/screenshot-comparison-app` | npm | that project's `package.json` |

`libs/ui-kit` is reported as **informational** and does not fail the exit code
(use `--strict` to include it). Its standalone lockfile is never what gets
installed here — at the root the submodule resolves as a workspace member under
the root overrides. Findings there are real but belong to
`docspace-ui-kit-react`; report them as a follow-up for that repo.

## Step 2 — pick the fix

In order of preference:

1. **Bump the direct dependency** when the vulnerable package is one we declare
   ourselves — a real upgrade beats an override.
2. **Add an override** when the vulnerable package is transitive and its parent
   still pins the bad range. This is the common case: e.g. `postcss@8.5.26`
   pins `nanoid ^3.3.17` even in its newest release, so no upgrade path exists.
3. **Do nothing, and say so** when the advisory does not apply — for instance a
   build-only devDependency whose vulnerable code path never ships. Write down
   the reasoning; do not silently skip a finding.

Never run `npm audit fix --force` / `pnpm audit --fix` unattended — they happily
cross majors in the manifest.

## Step 3 — the override trap (read before writing the line)

A pnpm override key can carry a selector — `"nanoid@^3"` — but the selector only
narrows **which dependents** get rewritten. The replacement range is resolved on
its own, against the whole registry:

```yaml
"nanoid@^3": ">=3.3.18"   # WRONG: resolves to nanoid 6.x -> ESM-only -> breaks postcss (CJS)
"nanoid@^3": "^3.3.18"    # right: patched, still 3.x
```

So: **bound the replacement to the major that is actually installed.** Check
which majors coexist before writing the line — the script prints this as
`installed: 3.3.17, 5.1.16, 6.0.1`, or check by hand:

```bash
grep -n "^  <pkg>@" pnpm-lock.yaml          # pnpm tree
npm --prefix <dir> ls <pkg>                 # npm tree
```

The repo has plenty of unbounded `pkg: ">=x.y.z"` entries that work because only
one major of that package exists anywhere. That is a property of today's tree,
not a safe default — prefer the bounded form for anything new.

If the fix genuinely requires crossing a major, say so explicitly and check the
consumers first; the script flags this case rather than suggesting a line.

## Step 4 — apply and refresh the lockfile

pnpm tree (root):

```bash
# edit pnpm-workspace.yaml -> overrides:, with a comment saying why
pnpm install --lockfile-only     # resolve first, inspect the result
pnpm install                     # then materialise node_modules
```

npm tree:

```bash
# edit <dir>/package.json -> "overrides"
npm --prefix <dir> install --package-lock-only
npm --prefix <dir> install
```

Both lockfiles are committed — a fix that only lives in a manifest is not a fix.

If pnpm refuses the new version because of the release-age policy, the version
is younger than the configured `minimumReleaseAge`. Either wait, or add a
**version-pinned** entry to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`
with a comment — never disable the policy wholesale.

## Step 5 — verify, do not assume

1. Re-run the script — the tree must be clean at the chosen level.
2. Confirm the resolution is what you intended, not just "some newer version":

   ```bash
   for d in node_modules/.pnpm/<consumer>@*; do
     echo "$d -> $(readlink $d/node_modules/<pkg>)"
   done
   ```

   This is what catches a wrong-major override — the audit is happy either way.
3. Smoke-test the consumer that pulled the package in. A CSS/build dep means
   running the thing that uses it (`pnpm madge --circular ./packages/shared/utils`,
   a vitest run in the affected project), not just re-reading the lockfile.
4. Orphaned `node_modules/.pnpm/<pkg>@<old>` directories with nothing linking to
   them are harmless leftovers, not a failed fix.

## Step 6 — report

State per tree: what was vulnerable, what the fix was, what you verified and
how. Call out explicitly:

- findings left unfixed and why;
- findings that belong to the ui-kit repo;
- any override that could not be bounded to a single major.

The override comment in the manifest is part of the deliverable: say which
parent still pins the bad range, so the next person knows when the override can
be dropped. Everything committed — comments included — is English.

The pre-push gate does not run any audit, so nothing here is enforced
automatically; a dependency fix still has to survive `pnpm run tsc`,
`pnpm run lint` and the test suites like any other change.
