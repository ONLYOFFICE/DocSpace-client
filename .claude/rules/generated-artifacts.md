---
paths:
  - "public/locales/.constants/**"
  - "packages/shared/biome-plugins/**"
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
| `public/locales/.constants/*.json` (brands, consts, cultures) | `pnpm biome-plugins:generate` | `packages/shared/biome-plugins/no-constants-via-i18n.grit` |
| any workspace `package.json` dependency | `pnpm install` | root `pnpm-lock.yaml` |
| `common/translation-app/*/package.json` | `pnpm run update-translation-app-lock` | `common/translation-app/{backend,frontend}/package-lock.json` |
| `licenser.*` settings in `frontend.code-workspace` | `python3 common/scripts/update-license-headers.py` | the AGPL header in every source file (see `.claude/rules/source-checks.md`) |
| any UI change with a visual snapshot | `pnpm test:e2e:docker:update-screenshots` | `packages/client/__tests__/screenshots/**` (Docker only — see `.claude/rules/e2e-tests.md`) |

## ui-kit is out of scope

ui-kit keeps its own copies of the biome plugins and its own lockfile, but they
are generated and committed **in the `docspace-ui-kit-react` repository**, not
here. This repo consumes ui-kit only as a prebuilt tarball
(`onlyoffice-apps-ui-kit.tgz`), so nothing on this side writes into it and
nothing here needs to be regenerated when ui-kit changes — swapping the tarball
and re-running `pnpm install` is the whole client-side update.

The same applies to ui-kit's generated `publishConfig.exports` block (~900
entries, one per real module subpath — see `.claude/rules/pnpm.md`): it is
produced by ui-kit's own `pnpm build` before packing, inside that repository.

## Reviewing for staleness

A generated artifact that was not refreshed is invisible in a diff — the diff
just does not mention it. To check a branch, run the generator and look at
`git status`: a non-empty result means the branch is stale.

```bash
pnpm biome-plugins:generate && git status --short
```

Do this read-only during review, then revert what you produced
(`git checkout --` on the outputs) so the working tree is left as you found it.
