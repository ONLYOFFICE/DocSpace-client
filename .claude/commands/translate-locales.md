# Translate / fix broken locale keys

Translate new or broken i18n keys across all supported languages in the DocSpace monorepo.

## Step 1 — find what's broken

Run the translation tests and capture the output:

```bash
cd common/tests && npx vitest run test/locales.test.js 2>&1
```

Parse the failures. Each failure identifies a `lng`, a `key` (format `Namespace:KeyName`), and a description of the problem (wrong/missing variables, unpaired brackets, wrong script, untranslated text, etc.).

If there are no test failures and the user asked to translate **specific keys**, skip to Step 2 with those keys.

## Step 2 — resolve workspace and file paths

Test failures report keys as `Namespace:KeyName`. Use the table below to find the correct locale and `.meta` directories.

| Namespace | Locale files | `.meta` files |
|-----------|-------------|---------------|
| `Common` | `public/locales/{lang}/Common.json` | `public/locales/.meta/Common/{Key}.json` |
| `ChangeLinkTypeDialog`, `CompletedForm`, `DeepLink`, `Editor` | `packages/doceditor/public/locales/{lang}/{Namespace}.json` | `packages/doceditor/public/locales/.meta/{Namespace}/{Key}.json` |
| `Confirm`, `Consent`, `Errors`, `Login`, `TenantList`, `Wizard` | `packages/login/public/locales/{lang}/{Namespace}.json` | `packages/login/public/locales/.meta/{Namespace}/{Key}.json` |
| `Management` | `packages/management/public/locales/{lang}/Management.json` | `packages/management/public/locales/.meta/Management/{Key}.json` |
| `Settings`, `Services`, `Payments` *(ui-kit)* | `libs/ui-kit/locales/{lang}/{Namespace}.json` | *(no `.meta` — use English value only)* |
| *everything else* | `packages/client/public/locales/{lang}/{Namespace}.json` | `packages/client/public/locales/.meta/{Namespace}/{Key}.json` |

English source is always at the same path with `{lang}` = `en`.

## Step 3 — collect English source + meta context

For each broken key:

### A. Read the English value from the `en` locale file.

### B. Read the `.meta` file (if it exists for the workspace).

Meta file structure:
```json
{
  "comment": {
    "text": "Plain-language description of what the string is, where it appears, and how it's used."
  },
  "usage": [{
    "context": "Surrounding code showing the actual t('Namespace:Key') call."
  }]
}
```

Extract:
- `comment.text` — use as translator context in every prompt
- `usage[*].context` — shows real usage; helps understand tone and surrounding UI

These two fields are the primary quality signal. A translation without context is how gemma4 26b produced truncated garbage.

## Step 4 — translate

For **every** language in the supported languages list below, translate **only** the broken/missing keys. Do not skip non-base languages — they must be translated too even though the test only enforces base languages.

For each language, before translating: grep the same namespace file in that language for similar keys to match existing terminology.

### Prompt structure

Frame each translation as:

> Translate into {language}.
> Context: {comment.text}
> Code usage: {usage[0].context}
> English: "{value}"
> Rules: {see below}

### Language-specific rules

**Script enforcement:**
- `sr-Cyrl-RS` — 100% Cyrillic. Never use Latin letters. "AI" → "АИ"
- `bg` — Bulgarian Cyrillic. "AI" → "ИИ"
- `uk-UA` — Ukrainian Cyrillic. "AI" → "ШІ"
- `ar-SA` — Arabic script, RTL. "AI" stays as "AI" (accepted loanword)
- `hy-AM` — Armenian script only. "AI" → "ԱԲ" (Արհեստական Բանականություն)
- `el-GR` — Greek script only
- `ko-KR` — Korean (Hangul) script only
- `lo-LA` — Lao script only
- `si` — Sinhala script only
- All other languages — standard orthography of the target language

**Product names — never translate:**
- `Ask AI` — keep exactly as "Ask AI" in all languages
- Folder name `Complete` — keep as "Complete" (it is a UI label, not a word to translate)

**Consistent terminology — before translating, grep the same namespace file for similar keys to match existing word choices** (e.g. the word used for "room", "form", "database", "integration" in that language).

**Placeholders and markup — preserve exactly:**
- `{{variableName}}` — variable names must be identical to English
- `<0>`, `<1>`, `<br />`, `<b>` — react-i18next Trans component tags; preserve count and order
- `«»` — Russian/Ukrainian guillemets; always open and close in the same string

**Style:**
- Match the grammatical register (formal/informal) of other strings in the same namespace for that language
- Do not add or remove meaning relative to the English source
- Do not truncate

## Step 5 — apply fixes

Use the Edit tool to replace only the affected key values in the JSON files. Do not touch other keys. Preserve JSON indentation and trailing commas consistent with the rest of the file.

## Step 6 — verify

Re-run the tests:

```bash
cd common/tests && npx vitest run test/locales.test.js 2>&1
```

If failures remain, fix them following the same process. Report the final result to the user.

## Supported languages

All languages present under each workspace's `locales/` directory must be translated — currently:
`ar-SA, az, bg, cs, de, el-GR, es, fi, fr, hy-AM, it, ja-JP, ko-KR, lo-LA, lv, nl, pl, pt, pt-BR, ro, ru, si, sk, sl, sq-AL, sr-Cyrl-RS, sr-Latn-RS, tr, uk-UA, vi, zh-CN`

The test suite (`NotTranslatedOnBaseLanguages`) only enforces:
`de, es, fr, hy-AM, it, ja-JP, pt-BR, ro, ru, sr-Cyrl-RS, sr-Latn-RS, zh-CN`

— but the remaining languages must be translated too. A clean test run does not mean all languages are covered.
