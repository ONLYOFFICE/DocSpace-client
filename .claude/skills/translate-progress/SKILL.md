---
name: translate-progress
description: Show how many locale keys are still missing across all workspaces and languages. Use when the user asks about translation progress, coverage, or which keys are untranslated.
---

# Translation progress check

Show how many locale keys are still missing across all workspaces and languages.

## Step 1 — get the coverage report

```bash
node common/scripts/translation-stats.js --no-meta
```

The `Miss` column is the number of keys that exist for `en` but are absent for that language. `Pct` is coverage. A language is done only when `Miss` = 0.

Add `--no-meta` unless the user also wants the spell-check / metadata sections (they are slower to compute).

## Step 2 — list the actual missing keys

```bash
node common/scripts/translation-stats.js --no-meta --missing
```

Output is grouped by language and package:

```
  tr — common (26 keys)
    Common:ArbiterAttachFile
    ...

  lo-LA — client (264 keys)
    no locale file: AiSuggestions.json
    AiSuggestions:AiRoomAddToTheKnowledgeBase
    ...
```

Narrow the scope when the user asked about specific languages or packages:

```bash
node common/scripts/translation-stats.js --no-meta --missing --lang=tr,ko-KR --package=common
```

For machine-readable output use `--json` and read `languages[].missingByPackage` (a `{ package: ["Namespace:Key", …] }` map) or `packages[].languages[].missingKeyIds`.

## Step 3 — cross-check with the tests

```bash
cd common/tests && npm run test:only-missing-keys
```

Runs `NotTranslatedOnAllLanguages` (keys absent or empty in any language) and `MissingLocaleFilesTest` (namespace file absent for a language). These two must agree with Step 2; a disagreement means one of the two tools has a bug worth reporting.

Note: `NotTranslatedOnBaseLanguages` only checks `de, es, fr, hy-AM, it, ja-JP, pt-BR, ro, ru, sr-Cyrl-RS, sr-Latn-RS, zh-CN`. A green result there says nothing about the other 19 languages.

## Step 4 — report

Summarize per namespace and language, e.g.:

```
Common  (26 keys missing in 19 languages)

Language        Status
──────────────────────────────
ar-SA           ✗ missing 26
bg              ✗ missing 26
de              ✓ done
...

Done: 12 / 31   Pending: 19
```

Call out separately:
- languages where a whole namespace file is missing (they need the file created, not just keys added)
- the `Same` column from Step 1 — keys whose value is byte-identical to English, i.e. likely copied rather than translated

If every language reports `Miss` = 0, print: **All translations complete.**

## Out of scope

`libs/ui-kit/locales/` is not measured by `translation-stats.js` and not covered by the locales tests — the ui-kit is a git submodule and its gaps must be fixed in the `docspace-ui-kit-react` repository. To check it manually, compare `libs/ui-kit/locales/en/*.json` against the other language folders.
