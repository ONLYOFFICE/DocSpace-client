---
name: translate-stale
description: Find locale keys whose English was reworded while the translations were left at the old wording. Use when reviewing a branch that touched locale files, when checking whether a "sync translations across all locales" commit really synced them, or when the user asks whether a text change reached the other languages.
argument-hint: "[--since <rev>] [--author <substr>] [--all]"
---

# Stale translations after an English rewording

An edit that changes English words but not English *structure* passes every
check in the repo. `WrongTranslationVariablesTest` and `WrongTranslationTagsTest`
compare only the **count** of `{{variables}}` and `<1>tags</1>`; the completeness
tests only ask whether a key exists. So a commit can reword 100 English strings,
leave all 31 translations at the previous wording, and the pre-push gate stays
green.

The repo's only signal is the stale `content_en_sha1_hash` in
`.meta/{Namespace}/{Key}.json` — and that is a hint for the translation
pipeline, not a check. It is also **erased** the next time someone runs
`generate-metadata`, so it cannot be relied on after the fact.

Script (run from the repo root): `.claude/scripts/audit/stale-translations.mjs`

## Step 1 — run the audit

```bash
node .claude/scripts/audit/stale-translations.mjs                    # whole branch vs its base
node .claude/scripts/audit/stale-translations.mjs --author svetlana  # only that author's commits
node .claude/scripts/audit/stale-translations.mjs --since release/v4.0.0
node .claude/scripts/audit/stale-translations.mjs --all --json
```

Read-only. `--since` defaults to the merge-base with
`branch.<name>.reviewBase`, then `release/v4.0.0`, then `master`. Staleness is
always judged against `--until` (default `HEAD`), so a later commit that fixed
a translation correctly drops out of the report. Exit code 1 means there is at
least one substantive finding.

`--author` is what answers "check the commits that aren't mine" — resolve who
that is with `git log --format='%h %an %s' <base>..HEAD` first.

## Step 2 — read the buckets, do not report the raw number

The script splits every reworded key into three buckets, and **only the first
is worth a human's time**:

| Bucket | What it is | Action |
|---|---|---|
| substantive | the words changed | judge each one |
| case-only | `Private Key` -> `Private key` | none — most languages never used Title Case |
| punctuation-only | a comma moved | none |

Even inside *substantive*, most hits need no work. English-only polish looks
like this and leaves the translation perfectly valid:

- articles added — `Display file extension` -> `Display **the** file extension`
- register softened — `appear here and remain` -> `show up here and stick around`
- a synonym swapped — `Control whether` -> `Choose whether`

What genuinely needs re-translation is a change of **meaning or terminology**:

- `No results yet` -> `No **outputs** yet` — the term changed, translations still say "results"
- `Save the file copy in the original format **as well**` -> the qualifier is gone
- `Setting up notifications` -> `Notification settings` — gerund became a noun
- a clause added, dropped, or re-scoped

So: never hand the user "141 stale keys". Read the substantive list, keep the
ones where meaning moved, and report those.

## Step 3 — check the three side reports

The script also prints findings that are defects in the **English** itself, not
in the translations:

- **FINAL PERIOD** — English gained or lost a trailing `.` and the translations
  did not follow. Nothing tests this; it shows up as one tooltip ending in a
  period and its neighbour not.
- **HYPHEN USED AS A DASH** — ` - ` where the locale files use ` — `. Compare
  against the file's own habit before reporting: in `en/Common.json` the em dash
  outnumbers the hyphen roughly 15 to 1.
- **NEW ENGLISH KEYS WITH NO TRANSLATION** — overlaps with the
  `translate-progress` skill, which reports coverage properly; use that one if
  coverage is the actual question.

While reading the substantive list, also watch for English that the rewording
broke outright — the tool cannot judge this. A real example this check caught:
`The link is valid for <1>{{date}}</1>` became
`This link is valid for an <1>{{date}}</1> time`, and `{{date}}` holds a
duration, so it renders as "valid for an 7 days time".

## Step 4 — fix

To re-translate the keys that need it, hand them to the `translate-key` skill
one at a time, or `translate-locales` in bulk. Follow the usual locale rules
(`.claude/rules/i18n.md`, `.claude/rules/bulk-locale-edits.md`) — in particular,
**leave `.meta` alone**: the stale hash is what tells the translation pipeline
the source moved.

Verify with:

```bash
cd common/tests && npx vitest run test/locales.test.js
```

## Out of scope

`libs/ui-kit/locales/` is not scanned — it lives in the `docspace-ui-kit-react`
submodule and is loaded only by a Storybook story; ui-kit components resolve
their strings from the host app's namespaces at runtime.
