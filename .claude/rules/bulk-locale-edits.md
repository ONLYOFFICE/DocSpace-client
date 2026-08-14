---
paths:
  - "public/locales/**"
  - "packages/*/public/locales/**"
  - "common/scripts/**"
---

# Rewriting locale files in bulk

A script that edits many locale strings at once is the highest-risk operation in
this repository: it touches 32 languages you cannot all read, and the damage is
invisible until a user sees it. Everything below was learned from a rename that
replaced `{{productName}}` across ~1500 strings and broke ~200 of them.

## Always dry-run, then verify what survived

Write the script so the default run prints changes and writes nothing; require
an explicit `write` argument. Before accepting each replacement, assert that:

- the set of `{{placeholders}}` is identical before and after,
- the set of `<1>`/`<strong>` tags is identical,
- the value still parses as part of valid JSON,
- the needle matched **exactly once** in the file (guard against a second key
  holding the same text).

A replacement that fails any assertion must be skipped and reported, never
written. Run `cd common/tests && npx vitest run test/locales.test.js`
afterwards — the structural checks there exist because of these failures.

## Regex traps with non-ASCII text

- **`\w` is ASCII-only, even with the `u` flag.** `/\p{L}+(?:ый|ой)/u` works;
  `/\w+(?:ый|ой)/u` silently matches nothing in Cyrillic, Greek or Armenian. A
  scan that reports zero hits on non-Latin text is a bug until proven otherwise.
- **`\b` is ASCII-only too.** Use `(?<!\p{L})` / `(?!\p{L})` for word edges, or
  you will produce doubled prepositions like `«Интеграция на на»`.
- **Never put `\S*` or `.*` after a placeholder.** `{{productName}}\S*` consumes
  the rest of the sentence when no space follows — this destroyed whole `ja-JP`
  and `zh-CN` strings and ate the second half of German and Finnish compounds.
- Build flags explicitly. Reusing `spec.source` while dropping the `i` flag
  quietly reduced a 44-hit pattern to 7.

## Removing a placeholder leaves debris

`{{productName}}` rarely stands alone. When it goes, so must whatever was
attached to it:

| Base | Naive result | Correct |
|------|--------------|---------|
| `администраторы {{productName}}.` | `суперадминистраторы .` | `суперадминистраторы.` |
| `{{productName}} :ssa` (fi) | `työtilassa :ssa` | `työtilassa` |
| `ваш портал {{productName}}` | `ваш рабочего пространства` | `ваше рабочее пространство` |
| `for this {{aiAgent}}.` | `for this .` | keep a noun |

The colon in Finnish, the apostrophe in Turkish and the hyphen in Azerbaijani or
Armenian carry the case ending of the **name** they follow. Once an ordinary
noun sits there, the marker is wrong and the noun itself must be inflected.

## Grammar the substitution cannot infer

The replacement noun rarely shares the gender, number or case of what it
replaced. Every modifier agreeing with it has to move too:

- **Gender/number agreement** — `связанный … аккаунт` (m) becomes
  `связанную … учётную запись` (f). Adjectives, participles, possessives and
  past-tense verbs all agree in Slavic languages.
- **Case government** — the preposition decides the ending, and one key family
  can use up to four different prepositions in a single language. One pattern
  per language is too crude; use an ordered `[regex, replacement]` table.
- **Compounding** — German needs *Fugen-s*, Finnish attaches a single-word
  determiner with a plain hyphen but spaces it after a multi-word one
  (`Jäsenet-osio` vs `Docs Connect -palvelu`), Albanian needs its linking
  article.
- **Sentence-initial capitals** — a term landing at the start of a sentence must
  be capitalised, and Turkish/Azerbaijani capitalise `i` as `İ`.

When a term appears inside a description you cannot verify, prefer rebuilding
the clause from a sibling key whose wording is already confirmed correct.

## One term, two meanings

Check whether the placeholder means the *product* or the *tenant* before
replacing it. In this codebase `{{productName}}` was used for both, so the
strings had to be split by meaning: tenant-sense strings became "workspace"
wording, product-sense strings became `{{organizationName}} {{productName}}`.
A single blanket replacement is wrong for one of the two groups.

Also watch for a term that looks the same but belongs to a different feature —
"form space" is not the tenant, so `избранного рабочего пространства` was wrong
where `избранного пространства форм` was meant.

## Editing source files, not just JSON

A codemod that adds a `values={{ … }}` entry must reproduce the **surrounding
indentation**, not a fixed one. Emitting a flat four tabs into space-indented
files went unnoticed because the Biome formatter is disabled; `indentation.test.js`
now gates it. Recover the right indentation from the sibling property above the
inserted line, or from the same line in the base revision.

After the edit, confirm `git diff -w` is empty for files where only whitespace
should have changed.

## Machine translation hygiene

Output pasted from a model arrives with its wrapper: a ` ``` ` fence, the value
wrapped in quotes, sometimes a whole JSON object. `LlmArtefactsTest` catches
these, but check before committing — literal ` ``` ` reached the Czech UI once.
Also verify the translation covers every sentence of the English source; two
watermark descriptions silently lost their third sentence.

## Regenerate metadata, and know when not to

Run `npm run generate-metadata` in `common/translation-app/backend` after locale
edits. `.meta` files store the **English** snapshot plus its hash, so editing
only non-English locales produces no `.meta` change — an empty result there is
correct, not a failure.
