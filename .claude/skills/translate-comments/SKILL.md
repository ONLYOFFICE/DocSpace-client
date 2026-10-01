---
name: translate-comments
description: Write or refresh the translator comment (comment.text) in locale .meta files by reading the real call sites. Use before translating new keys, when .meta comments are empty, when an English value changed, when auto comments from a local model (gemma) look wrong, or when the user asks to add/update/regenerate key comments. Replaces the generate-auto-comments-metadata script.
argument-hint: "[Namespace:Key,...] [--all] [--model <substr>] [--regenerate] [--since <rev>]"
---

# Translator comments in `.meta`

Every key has `.meta/{Namespace}/{Key}.json` next to its locale files. Its
`comment.text` is the context `translate-locales` and `translate-key` put into
every translation prompt. When it is empty, translations are made blind; when
it is wrong, they are made confidently wrong — and nothing flags either case.

This skill replaces `generate-auto-comments-metadata.js`. That script asks a
local model (by default `gemma4:26b`) for a description from a 400-character
snippet of each call site; it cannot open the component, so it guesses the
surrounding UI (`"documentation for upgrading Docker"` for a trial-install
link). Here Claude reads the actual code, then writes the comment through a
helper that keeps the file format identical to translation-app's writer.

Script (run from the repo root): `.claude/scripts/i18n/locale-comments.mjs`

`$ARGUMENTS` is passed straight to `find`: a comma-separated `Namespace:Key`
list goes to `--key`, flags go through as they are.

## Step 1 — select keys (and create missing `.meta`)

Always pass `--ensure-meta`. A key with no `.meta` file, or with a `.meta`
made for an older English value, cannot take a comment — `generate-metadata`
would drop it on its next run (it recreates the file whenever the English
hash changes). `--ensure-meta` runs `generate-metadata` + `save-meta-keys-usage`
(no LLM, ~1 min, the same two the VSCode task **Translation App | update
metadata** runs) only when such a key is in scope; the files come out with an
empty comment and fresh `usage`, and are then selected.

```bash
node .claude/scripts/i18n/locale-comments.mjs find --ensure-meta                    # keys changed on this branch, empty comment
node .claude/scripts/i18n/locale-comments.mjs find --ensure-meta --key Common:Upgrade  # specific keys, even with a comment
node .claude/scripts/i18n/locale-comments.mjs find --ensure-meta --model gemma        # re-review gemma comments on the branch
node .claude/scripts/i18n/locale-comments.mjs find --ensure-meta --regenerate         # every auto comment on the branch
node .claude/scripts/i18n/locale-comments.mjs find --ensure-meta --all                # whole repo, empty comments
```

Add `--json` for the full record. Branch scope = keys whose `.meta` file or
English value differs from the merge-base with the base branch
(`branch.<name>.reviewBase` → `release/v4.0.0` → `master`), including
uncommitted work. Exit code 1 means something was selected. `apply` refuses
a key whose `.meta` is missing or outdated.

A **human** comment (`is_auto: false` with text) is never selected by scope
flags — only by an explicit `--key`. Do not rewrite one unless the user asked
for that key, or it is factually wrong about the current code; say which case
it was.

## Step 2 — read the real usage

For each selected key:

1. Open every `usage` location in the source file itself, not the `context`
   snippet — `line_number` is stale after edits, so grep for
   `"Namespace:Key"` (and the bare `"Key"` inside `t()` / `<Trans>` for the
   file's default namespace) if the line does not match.
2. Read enough of the component to know **where** the string renders (page,
   dialog, card, menu, toast) and **what** it is (button, link, heading,
   label, description, error, placeholder).
3. Resolve every `{{variable}}`: find what is passed for it (brand name,
   license name, count, file name, a URL, another translated sentence).
4. Resolve every `<1>…</1>` tag: what the `<Trans>` component turns it into
   (link, bold, colored span) and where it leads.
5. If the key is a fragment joined into another key (passed as a variable to
   a template like `{{note}} {{backup}}`), say which template it feeds.

No usage found anywhere → the key is probably dead; report it instead of
writing a comment.

## Step 3 — write the comments

One comment per key, 1–2 sentences, single line, English, ≤ 500 chars:

- Start with the element type and location: "Link label in the trial card of
  the Upgrade page…", "Toast shown after…", "Title of the … dialog".
- Then what it does or when it appears.
- Then what a translator would otherwise get wrong: part of speech ("verb,
  imperative" vs "noun"), that it is a short label, that it continues a
  sentence or a colon, which variables carry what, what the tag wraps,
  product names that stay untranslated, length limits of a narrow button.
- Do not start with "This key…" / "This string…", do not repeat the English
  verbatim, no filler, no quotes around the whole text.
- Describe the UI, not the implementation (no component or prop names unless
  they are the only way to say where it appears).

Compare against similar keys' comments in the same namespace so a family of
keys (all `Upgrade*Title`) reads consistently.

## Step 4 — apply

Write a JSON map to the scratchpad and apply it with **your exact model ID**:

```json
{
  "Common:UpgradeDockerInstructions": "Link label in the trial card of the Upgrade page, …"
}
```

```bash
node .claude/scripts/i18n/locale-comments.mjs apply <scratchpad>/comments.json --model <your-model-id>
```

It sets `comment = { text, is_auto: true, updated_at, model }` and the file's
`updated_at`, preserves the rest of the file and its line ending, and refuses
the whole batch on an empty, multi-line, quoted or overlong comment.

## Step 5 — check what the comment changes for translations

A comment is input to translation, so a new or corrected one can expose an
existing translation made without it. For every key whose meaning the comment
clarifies (part of speech, what a variable is, what the link does), compare
the comment with a few languages (`ru`, `de`, `ja-JP` at least). If a
translation contradicts it, re-translate that key with `translate-key`.
Report: keys commented, keys whose translations were checked, keys sent to
re-translation, keys skipped and why.

## Called from the translation skills

`translate-locales` and `translate-key` run
`find --key … --ensure-meta` as a mandatory step before translating and call
this skill for every key it reports as `[empty]` or `[outdated-meta]`. In that
case do Steps 2–4 for those keys only and return; Step 5 is not needed, since
the translations are written right after with the new comment.
