---
paths:
  - "public/locales/.constants/**"
  - "packages/shared/biome-plugins/**"
  - "libs/ui-kit/biome-plugins/**"
  - "scripts/generate-*.js"
  - "package.json"
  - "**/package.json"
---

# Checked-in generated artifacts

Some files in this repository are **derived** from another file but are still
committed. Nothing in lefthook or CI verifies that they are up to date, so a
stale copy ships silently and keeps working — it just stops covering whatever
was added to its source. Every one of them must be regenerated **in the same
commit** that changes its source.

The rule of thumb: if you edited a file listed in the "Source" column below,
run the command and `git add` every output before committing.

| Source you edited | Command to run | Committed output |
|---|---|---|
| `public/locales/.constants/*.json` (brands, consts, cultures) | `pnpm biome-plugins:generate` | `packages/shared/biome-plugins/no-constants-via-i18n.grit` **and** `libs/ui-kit/biome-plugins/no-constants-via-i18n.grit` |
| `packages/shared/biome-plugins/no-dynamic-i18n-key.grit` (hand-written) | copy it by hand | `libs/ui-kit/biome-plugins/no-dynamic-i18n-key.grit` — the two must stay byte-identical |
| any workspace `package.json` dependency | `pnpm install` | root `pnpm-lock.yaml` |
| any `libs/ui-kit/package.json` dependency | `pnpm install` inside `libs/ui-kit` | `libs/ui-kit/pnpm-lock.yaml` |
| `common/translation-app/*/package.json` | `pnpm run update-translation-app-lock` | `common/translation-app/{backend,frontend}/package-lock.json` |
| `licenser.*` settings in `frontend.code-workspace` | `python3 common/scripts/update-license-headers.py` | the AGPL header in every source file (see `.claude/rules/source-checks.md`) |
| any UI change with a visual snapshot | `pnpm test:e2e:docker:update-screenshots` | `packages/client/__tests__/screenshots/**` (Docker only — see `.claude/rules/e2e-tests.md`) |
| `libs/ui-kit` built `dist/` (any `pnpm run build` there) | `node scripts/generate-exports-map.mjs` runs automatically as part of `pnpm build` | `libs/ui-kit/package.json`'s `publishConfig.exports` (~900 generated entries, one per real module subpath — see `.claude/rules/pnpm.md`) |

## The two-repo trap

Two of those outputs live in `libs/ui-kit` (`biome-plugins/*.grit`,
`pnpm-lock.yaml`). `libs/ui-kit` is a **separately cloned repository**, not a
submodule of this one — it is gitignored here and `git status` in the client
never mentions it. The generator writes into `libs/ui-kit`'s working tree, but
the client repo has no way to commit those files: they belong to
`docspace-ui-kit-react`. The full sequence is:

```bash
pnpm biome-plugins:generate
git add packages/shared/biome-plugins/no-constants-via-i18n.grit   # client repo
git -C libs/ui-kit add biome-plugins/no-constants-via-i18n.grit     # ui-kit repo
git -C libs/ui-kit commit -m "Regenerate i18n constants biome plugin"
```

There is no client-side gitlink to bump afterwards — `libs/ui-kit`'s history
is entirely its own. If `libs/ui-kit` is not on the branch you want to commit
to, stop and ask rather than committing onto whatever is checked out there.

`libs/ui-kit/package.json`'s generated `publishConfig.exports` block
(see the table above) is a related but separate case: it is produced by
`pnpm run build:ui-kit-tarball` in the client repo, and that script restores
`libs/ui-kit/package.json` to its pre-build state automatically once packing
finishes (only when its working tree was clean beforehand) — so it does not
need manual cleanup the way the biome plugins do.

## Reviewing for staleness

A generated artifact that was not refreshed is invisible in a diff — the diff
just does not mention it. To check a branch, run the generator and look at
`git status`: a non-empty result means the branch is stale.

```bash
pnpm biome-plugins:generate && git status --short && git -C libs/ui-kit status --short
```

Do this read-only during review, then revert what you produced
(`git checkout --` on the outputs) so the working tree is left as you found it.
