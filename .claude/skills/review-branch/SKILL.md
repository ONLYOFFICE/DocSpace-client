---
name: review-branch
description: Review the current branch against its parent branch across client and the ui-kit submodule — resolves the base automatically, traces reachability, checks the hidden pre-push gate rules, and reports ranked findings
argument-hint: "[<baseBranch>] [--save] [--fetch]"
---

# Review a branch against its parent

Read-only code review of everything the current branch adds on top of its base,
in **both** the client repo and the `libs/ui-kit` submodule. Never edits, never
commits, never pushes — the output is findings.

Script (run from the repo root): `.claude/scripts/review/review-scope.mjs`

## Step 1 — resolve the scope

```bash
node .claude/scripts/review/review-scope.mjs $ARGUMENTS
```

The script prints, per repo: base branch + how it was resolved, merge-base,
commits, and the diffstat. Base resolution order:

1. `$ARGUMENTS` — an explicit branch name (`release/v4.0.0`)
2. `git config branch.<current>.reviewBase` — a base pinned for this branch
3. `reviewBase` in `.claude/scripts/review/config.local.json`
4. **auto-detect** — of every `release/*`, `hotfix/*`, `develop`, `master`,
   `main` ref (local and remote), the candidate whose fork point is closest to
   HEAD, i.e. leaves the fewest commits on our side. Ties go to the more
   specific pattern.

Useful flags: `--save` (pin the resolved base for this branch), `--fetch`
(refresh refs first — do this when the script warns the local base lags
origin), `--repo <path>`, `--diff`, `--max-diff-lines N`.

Sanity-check the auto-detected base against the runners-up the script prints.
If it picked something implausible, re-run with an explicit base rather than
reviewing the wrong range. **State the resolved base in your report** — the
whole review is relative to it.

## Step 2 — get the actual diff

```bash
git diff <base>...HEAD                            # client
git -C libs/ui-kit diff <base>...HEAD             # ui-kit
```

Three dots — our side only, not the base's own movement.

**The client diff is often only a gitlink bump.** A stat like

```
libs/ui-kit                   | 2 +-
public/locales/en/Common.json | 1 +
```

means the change under review lives in the submodule, and the two repos have
independent branches and independent bases. Reviewing only the client diff here
reviews nothing. Conversely, ui-kit code cannot be fixed in this repo — findings
there land in `docspace-ui-kit-react`.

## Step 3 — read the changed files whole, then trace reachability

Never judge a hunk from the diff alone. For each changed file: read it in full,
then find out how it is actually reached.

- Who renders / calls this? `grep -rn "<Symbol>" --include="*.ts" --include="*.tsx" packages libs/ui-kit`
- What inputs does it really get? Follow the producer — the code that builds the
  URL, the params, the props, the store value. A branch that looks unreachable
  in isolation is often always-taken in practice, and vice versa.
- Does a helper's predicate actually mean what its name says?
  (`includes("ai")` is not `=== AI_TOOLS`.)

This step is what separates a real finding from a guess. A condition ordering
bug, a dead branch, or a copy mismatch only becomes visible once you know the
real input shape. If you cannot establish reachability, say the finding is
unverified instead of asserting it.

## Step 4 — repo-specific checks the diff will not show you

Most of these are enforced by the blocking pre-push gate but invisible until the
push fails. Full detail in `.claude/rules/source-checks.md`.

| Check | How |
|---|---|
| **License header** | every new `.ts/.tsx/.js/.jsx` (and `.scss` by convention) starts with the AGPL header |
| **No hardcoded hex** | zero `#RRGGBB`/`#RGB` in source *or* comments — use tokens |
| **ASCII-only** | no typographic quotes, `…`, en-dash `–`, emoji, NBSP, Cyrillic in `.ts/.tsx/.js/.jsx` |
| **i18n** | user-facing strings via `t()`; brand/product names as `{{variables}}` through `getBrandName()`/`getConstName()`/`getCultureLabel()`, never hardcoded; `t()`'s first arg must be a string literal |
| **New locale keys** | present in **all** locales, not just `en` |
| **Images** | referenced by basename; no duplicate filenames |
| **Dependencies** | same version string in every workspace; actually imported |
| **English everywhere** | code, comments, docs, commit messages |
| **Generated artifacts** | nothing checks their freshness, and a stale one leaves no trace in the diff — run the generators and see whether anything moves (see `.claude/rules/generated-artifacts.md`), then revert what you produced |

Locale coverage, concretely:

```bash
ls public/locales | wc -l                                    # total locales
grep -rl '"<NewKey>"' public/locales/*/Common.json | wc -l    # locales that have it
```

An `en`-only key does **not** fail the pre-push gate (completeness suites are
skipped there) but does fail the manual-dispatch CI job. Report it as a
follow-up with `/translate-key Common:<NewKey>`, not as a blocker.

Also check key placement: locale files are kept alphabetical by convention. No
test enforces it — flag it as a nit, not a failure.

## Step 5 — verify mechanically

Run what is cheap and targeted; do not run the whole gate unless the diff
warrants it.

```bash
pnpm exec biome check <changed files>                    # client
cd libs/ui-kit && pnpm exec biome check <changed files>  # ui-kit
```

Add `pnpm tsc`, `pnpm test:client`, or the relevant vitest file when the change
touches types or logic with existing coverage. Report what you ran and what it
said — including "nothing was run" when nothing was.

If the changed code has no test and is unit-testable, say so and name the test
that would guard it. Payment, auth, and permission logic without a regression
test is worth calling out on its own.

## Step 6 — report

Ranked most severe first, in the language the user wrote in. For each finding:

- **Severity** — high (correctness/money/security/data loss), medium (behavior
  or UX wrong, design drift, brittle structure), low, nit.
- **Where** — a clickable `[file.tsx:42](path/file.tsx#L42)` link.
- **What breaks** — a concrete failing input, not a category. "`?amount=abc`
  passes the guard and charges the default $20" beats "input validation is
  weak".
- **The fix** — a short code block when it fits in a few lines.
- **Provenance** — mark a finding as pre-existing when the branch did not
  introduce it, and say why it is still in scope (it usually is when it shares
  the bug class the branch set out to fix).

Open with the scope (base branch per repo, size of the diff) and one honest
sentence on whether the change does what it claims. Close with which findings
are merge blockers and which are follow-ups.

Do not pad the list. A finding you could not verify against real call sites is
either labeled as unverified or left out.
