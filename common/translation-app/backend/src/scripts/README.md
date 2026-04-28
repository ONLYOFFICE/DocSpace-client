# Translation Scripts

Scripts for managing DocSpace translation metadata, spell-checking, and AI-assisted comment generation.

All scripts are run from the `common/translation-app/backend` directory:

```bash
cd common/translation-app/backend
npm install  # first time only
```

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key (enables cloud LLM providers) | — |
| `OPENROUTER_MODEL` | Default model for all tasks | `google/gemini-2.5-flash` |
| `OPENROUTER_SPELLCHECK_MODEL` | Model for translation verification | `anthropic/claude-sonnet-4` |
| `OPENROUTER_COMMENT_MODEL` | Model for comment generation | `google/gemini-2.5-flash` |
| `SPELLCHECK_CONCURRENCY` | Parallel LLM calls for spell-check | `1` |
| `CLAUDE_CODE_MODEL` | Model alias for Claude Code CLI | `sonnet` |

---

## Scripts

### generate-metadata.js

Generates `.meta` JSON files for all translation keys. Creates the initial metadata structure with key paths, English content, and language entries.

```bash
node src/scripts/generate-metadata.js
```

Run this first when setting up metadata for the first time or after adding new translation keys.

---

### save-meta-keys-usage.js

Scans all source code (`.ts`, `.tsx`, `.js`, `.jsx`) to find where each translation key is used. Saves file paths, line numbers, and code context into `.meta` files.

```bash
node src/scripts/save-meta-keys-usage.js
```

Scans: `packages/client`, `packages/shared`, `packages/login`, `packages/doceditor`, `packages/management`, `packages/sdk`, `libs/ui-kit`.

---

### generate-auto-comments-metadata.js

Generates AI-powered descriptions for translation keys. Uses code usage context to explain what each UI string is, where it appears, and how translators should handle it.

```bash
# Generate comments for keys that don't have one yet
node src/scripts/generate-auto-comments-metadata.js

# Regenerate ALL comments (including existing ones)
node src/scripts/generate-auto-comments-metadata.js --regenerate

# Use a specific model
node src/scripts/generate-auto-comments-metadata.js --model=anthropic/claude-sonnet-4

# Use Claude Code CLI (free with subscription)
node src/scripts/generate-auto-comments-metadata.js --provider=claude-code

# Parallel processing
node src/scripts/generate-auto-comments-metadata.js --provider=claude-code --concurrency=5

# Combine options
node src/scripts/generate-auto-comments-metadata.js --regenerate --provider=claude-code --concurrency=5
```

**Providers:** Auto-detected from `.env`. If `OPENROUTER_API_KEY` is set, uses OpenRouter with `OPENROUTER_COMMENT_MODEL`. Otherwise falls back to local Ollama.

**Cost estimate (full regenerate, ~3500 keys):**

| Model | Cost | Time |
|-------|------|------|
| `google/gemini-2.5-flash` | ~$0.30 | ~2 hours |
| `anthropic/claude-sonnet-4` | ~$6 | ~3 hours |
| `--provider=claude-code` | $0 (subscription) | ~4 hours |

---

### verify-translations-spell-check.js

Verifies non-English translations against English source using deterministic checks and LLM analysis. Finds incorrect translations, missing content, wrong language/script, broken variables and tags.

```bash
# Full scan — all keys, all languages
node src/scripts/verify-translations-spell-check.js

# Specific languages only
node src/scripts/verify-translations-spell-check.js fr,de,ru

# Deterministic checks only (no LLM, instant)
node src/scripts/verify-translations-spell-check.js --no-llm

# Re-check only keys that already have issues in .meta
node src/scripts/verify-translations-spell-check.js --recheck

# Re-check specific issue types
node src/scripts/verify-translations-spell-check.js --recheck --recheck-types=incorrect_translation,wrong_script

# Choose provider
node src/scripts/verify-translations-spell-check.js --provider=openrouter
node src/scripts/verify-translations-spell-check.js --provider=claude-code
node src/scripts/verify-translations-spell-check.js --provider=ollama

# Parallel processing (overrides SPELLCHECK_CONCURRENCY from .env)
node src/scripts/verify-translations-spell-check.js --provider=claude-code --concurrency=5
```

**Features:**
- Checkpoint/resume — automatically saves progress and resumes after interruption
- Parallel processing — set `SPELLCHECK_CONCURRENCY=5` in `.env` for ~5x speedup
- Speed tracking — shows avg time per call and ETA
- Fatal error detection — stops immediately on quota/auth errors (no wasted retries)
- TSV output — issues are written incrementally to `spell-check-issues.tsv`

**Issue types detected:**

| Type | Source | Description |
|------|--------|-------------|
| `incorrect_translation` | LLM | Wrong or opposite meaning |
| `missing_content` | LLM | Important words missing |
| `wrong_language` | LLM | Text in wrong language |
| `missing_variable` | Deterministic | `{{variable}}` missing from translation |
| `extra_variable` | Deterministic | Extra `{{variable}}` not in English |
| `missing_tag` | Deterministic | React/HTML tag missing |
| `malformed_tag` | Deterministic | Tag with extra whitespace |
| `punctuation_mismatch` | Deterministic | Different ending punctuation |
| `wrong_script` | Deterministic | Wrong alphabet (e.g. Latin in Cyrillic locale) |

**Cost estimate (full scan, ~3500 keys x 31 languages):**

| Model | Cost | Time (concurrency=5) |
|-------|------|------|
| `anthropic/claude-sonnet-4` | ~$30 | ~10 hours |
| `google/gemini-2.5-flash` | ~$0.50 | ~8 hours |
| `--provider=claude-code` | $0 (subscription) | ~12 hours |

---

### apply-spell-check-fixes.js

Applies suggestions from spell-check results to translation JSON files. Validates each suggestion before applying (checks variables, tags, length).

```bash
# Dry run — see what would change
node src/scripts/apply-spell-check-fixes.js --dry-run

# Apply all fixable issue types
node src/scripts/apply-spell-check-fixes.js

# Apply specific issue types only
node src/scripts/apply-spell-check-fixes.js --types=incorrect_translation,missing_content

# Filter by language or project
node src/scripts/apply-spell-check-fixes.js --languages=fr,de
node src/scripts/apply-spell-check-fixes.js --projects=Common

# Include lower-priority fixes
node src/scripts/apply-spell-check-fixes.js --include-p1   # + wrong_language
node src/scripts/apply-spell-check-fixes.js --include-p2   # + incorrect_translation, missing_content
node src/scripts/apply-spell-check-fixes.js --all           # all types
```

**Safety:** Validates suggestions against English source — rejects fixes that would break variables, tags, or lose most of the content.

---

### clear-meta-issues.js

Resets all `ai_spell_check_issues` in `.meta` files to empty arrays. Use before a clean re-run of spell-check.

```bash
node src/scripts/clear-meta-issues.js
```

---

## Typical Workflow

```bash
# 1. Generate/update metadata
npm run generate-metadata
npm run save-meta-keys-usage
npm run generate-auto-comments-metadata

# 2. Run spell-check
node src/scripts/verify-translations-spell-check.js --provider=claude-code

# 3. Review results
cat ../../spell-check-issues.tsv | head -20

# 4. Apply fixes (dry run first)
node src/scripts/apply-spell-check-fixes.js --dry-run
node src/scripts/apply-spell-check-fixes.js

# 5. Run translation tests
cd ../../.. && cd common/tests && npx vitest run locales.test.js
```

## Data Files

| Path | Description |
|------|-------------|
| `public/locales/.meta/` | Per-key metadata (comments, usage, spell-check issues) |
| `public/locales/.constants/` | Brand names, constants, cultures (not per-language) |
| `spell-check-issues.tsv` | Incremental log of all found issues |
| `verification-checkpoint.json` | Resume state for interrupted spell-check runs |
