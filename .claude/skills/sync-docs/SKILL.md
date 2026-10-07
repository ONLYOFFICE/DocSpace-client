---
name: sync-docs
description: Compare the written knowledge about an area — .claude/rules and Storybook docs/stories prose — against the actual code, find which side went stale, and report the findings; fixes are applied only after the user approves them. Invoked without a named area it always starts by asking which rule to check — a menu of the rule files, never a scope picked on its own. Use when documentation and behavior are suspected to disagree, or after a behavior change shipped.
argument-hint: "<area or rule name>"
---

# Docs sync

Three places describe the same behavior and age independently: the code,
the `.claude/rules/*.md` files, and Storybook prose. The Storybook lives
in `docspace-ui-kit-react`, a separate repository consumed here only as
a prebuilt tarball — its prose is any `.mdx` page the glob in that
repo's `.storybook/main.ts` picks up (including the unattached pages
under its `docs/`), plus story descriptions in `*.stories.tsx`. Pages
parked as `*.bak` next to a component (the billing pages are, while
hidden from Storybook) still make claims and are still checked.
`packages/shared` keeps a `storybook` script but has no `.storybook`
config, so it contributes stories only if that changes. This skill
finds where the three disagree, reports the findings, and — only after
the user approves — fixes the stale side in the right repository. Never
edit anything before the report is shown and answered.

## 0. Locate the ui-kit clone

```bash
node .claude/scripts/ui-kit/locate.mjs --status [--uikit-src <path>]
```

It prints the clone's path (`--uikit-src`, then `DOCSPACE_UI_KIT_SRC`,
then its gitignored `config.local.json`, then
`../../docspace-ui-kit-react` next to this repo), both branches with
their release lines, whether the clone is clean, and a `status:` line —
or exits 1 when no clone is found. Two outcomes need the user, both
asked with the interactive option dialog, never in prose:

- **exit 1** — ask where the `docspace-ui-kit-react` clone is: "enter
  the path" first, "check the rule against the code only, no
  Storybook" second; offer to remember the answer with
  `node .claude/scripts/ui-kit/locate.mjs --save <path>`. Without the
  clone, Storybook claims are simply not collected; say so in the
  report.
- **`status: MISMATCH`** — the clone is on another release line than
  the client, so its Storybook prose describes another release. Ask:
  "use the clone as it is", "switch the clone to <client line>",
  "point to another clone". Switch only on that explicit choice and
  only when the status says the clone is clean; a dirty clone is never
  checked out from under the user.

The report's first line names the clone's path and branch, so the
reader knows which Storybook it was checked against.

The typical failure mode: a docs page keeps claiming an action is
role-restricted long after the code opened it to everyone.

## 1. Collect the claims

- When neither the argument nor the request names a specific area or
  rule file ("compare the rules with storybook" names none), **the
  scope question is mandatory**: ask it with the interactive option
  dialog before opening a single file. Discovering that only one area
  looks relevant is research, not an answer — the dialog still runs,
  with that area as the first option marked "(Recommended)" and the
  reason stated in its description. A rule without a Storybook
  counterpart is still checkable against the code, so it stays in the
  menu. Options are real rule files from `.claude/rules/` — the dialog
  holds four, so offer the most recently changed ones and let the
  built-in "Other" cover the rest. Never start a full sweep of every
  rule unless the user explicitly asks for it.
- Resolve the area from the argument: the matching rule file(s) in
  `.claude/rules/`, and the area's Storybook files inside the ui-kit
  clone.
- Extract every checkable claim each document makes: "X is payer-only",
  "route Y redirects to Z", "component hides A when B". Skip pure
  style/convention notes — only behavior claims are checkable.

## 2. Verify each claim against the code

The code is the default source of truth. Exceptions are explicit: a
rule may name an external source that wins (e.g. `access-matrix.md`
defers to the product spreadsheet) — a mismatch there is a finding to
report, never to auto-resolve.

For each claim: find the deciding code (the getter, the guard, the
handler) and classify:

- **docs stale** — the code moved on, the document did not;
- **rule stale** — same, for the rule file;
- **both stale** — the code changed after both were written;
- **code suspect** — the documents agree with each other and disagree
  with the code; the code may be the bug. Report it, do not "fix" the
  documents to match a possible bug.

## 3. Report first

The report is an itemized list, never paragraphs of prose. Every item
follows the same three-line skeleton, each line opening with a bold
label that names its source — the reader must never have to guess
which side is speaking or which side is wrong:

1. **"Storybook claims:" / "The rule claims:"** — the stale claim,
   quoted, then where it is written as clickable `[file:line](path#LN)`
   links. The label names the document kind; "claims" + the Fix line
   below make it unambiguous that this side is the wrong one.
   **"The code actually:"** — what really happens, with clickable
   file:line links. The code line states the truth.
   **"Fix in Storybook:" / "Fix in the rule:"** — the exact replacement
   wording, quoted, when it fits in a line or two; for a bigger rewrite,
   a one-phrase description of it (the full text is shown at the apply
   step, not in the report). Every item has a Fix line — a finding whose
   fix is only implied cannot be approved.

When the findings share a verdict, state it once above the list;
otherwise the verdict goes into the item. Claims that verified are one
counter line ("N claims checked, M verified"), never listed
individually. When everything verifies, that one line is the whole
report — stop there.

Then ask which fixes to apply — all, or per finding — and edit nothing
until the user answers.

## 4. Fix what was approved, in the place it belongs

- `.claude/rules/*.md` — edit here, in this repo.
- `.mdx` / `*.stories.tsx` — edit in the ui-kit clone and say the
  commit belongs to the `docspace-ui-kit-react` repository, on its own
  branch, not to this one; nothing here records it beyond a later
  tarball bump.
- Rules that defer to an external source of truth — report the
  mismatch to the user; the source is not ours to edit.
- **code suspect** findings go to the user as potential bugs, with the
  deciding code cited — never silently patched; where to route them (a
  review skill, a bug ticket) is the user's call.
