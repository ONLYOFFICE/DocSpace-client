# Translate / verify a specific locale key

Translate (or re-translate) a single i18n key across all supported languages.

Usage: `/translate-key Namespace:KeyName`  
Or to target specific languages: `/translate-key Namespace:KeyName de,fr,ru`

`$ARGUMENTS` contains the raw input — parse it as `<Namespace:Key> [lang1,lang2,...]`.

## Step 1 — parse arguments

Split `$ARGUMENTS` on whitespace:
- First token → `Namespace:KeyName` (e.g. `DeleteDialog:DeleteRoomsTitle`)
- Second token (optional) → comma-separated language codes to target (e.g. `de,fr,ru`). If absent, translate **all** supported languages.

## Step 2 — resolve workspace and file paths

Use the namespace to find the locale and `.meta` directories:

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

### A. Read the English value

Read the `en` locale file and extract the value for the key. If the key is missing from the English file, stop and tell the user — nothing to translate.

### B. Read the `.meta` file (if it exists for the workspace)

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

## Step 4 — check current state

For each target language, read the current locale file and check whether the key:
- Is **missing** — needs to be added
- Is **present and still in English** — needs translation
- Is **already translated** — show the value and ask the user whether to re-translate

Skip languages where the key is already translated unless the user explicitly requested them.

## Step 5 — translate

For each language that needs translation, before translating: grep the same namespace file for similar keys to match existing terminology.

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

**Consistent terminology — grep the same namespace file for similar keys to match existing word choices** (e.g. the word used for "room", "form", "database", "integration" in that language).

**Placeholders and markup — preserve exactly:**
- `{{variableName}}` — variable names must be identical to English
- `<0>`, `<1>`, `<br />`, `<b>` — react-i18next Trans component tags; preserve count and order
- `«»` — Russian/Ukrainian guillemets; always open and close in the same string

**Style:**
- Match the grammatical register (formal/informal) of other strings in the same namespace for that language
- Do not add or remove meaning relative to the English source
- Do not truncate

## Step 6 — apply fixes

For each language, use the Edit tool to:
- **Add** the key if it's missing (insert it in alphabetical order relative to surrounding keys, preserving JSON indentation)
- **Replace** the value if the key exists but is untranslated

Do not touch other keys. Preserve JSON indentation and trailing commas consistent with the rest of the file.

## Step 7 — verify

Run the translation tests filtered to the relevant test:

```bash
cd common/tests && npx vitest run test/locales.test.js 2>&1
```

Report which languages were updated, what the translations are, and the final test result.

## Supported languages

`ar-SA, az, bg, cs, de, el-GR, es, fi, fr, hy-AM, it, ja-JP, ko-KR, lo-LA, lv, nl, pl, pt, pt-BR, ro, ru, si, sk, sl, sq-AL, sr-Cyrl-RS, sr-Latn-RS, tr, uk-UA, vi, zh-CN`
