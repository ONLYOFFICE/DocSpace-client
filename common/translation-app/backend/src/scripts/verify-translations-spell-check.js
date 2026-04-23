#!/usr/bin/env node
/**
 * Verify Language Translations and Update Spell Check Issues Metadata
 *
 * This script scans the locales directories, compares non-English translations with English ones,
 * and updates the ai_spell_check_issues field in the metadata files with issues found by an LLM.
 *
 * Supports two providers:
 *   --provider=ollama      (default) Use local Ollama instance
 *   --provider=openrouter  Use OpenRouter API (requires OPENROUTER_API_KEY in .env)
 *
 * Usage:
 *   node verify-translations-spell-check.js [languages] [--provider=ollama|openrouter]
 *
 * Options:
 *   --no-llm                   Run only deterministic checks (no API calls, very fast)
 *
 * Examples:
 *   node verify-translations-spell-check.js fr,de
 *   node verify-translations-spell-check.js --provider=openrouter
 *   node verify-translations-spell-check.js fr,de --provider=openrouter
 *   node verify-translations-spell-check.js --no-llm
 */
const fs = require("fs-extra");
const { writeJsonWithConsistentEol } = require("../utils/fsUtils");
const path = require("path");
const glob = require("glob");
const {
  appRootPath,
  projectLocalesMap,
  ollamaConfig,
  openRouterConfig,
} = require("../config/config");
const { Ollama } = require("ollama");
const { verifyOllamaConnection } = require("../utils/ollamaUtils");
const { spellCheck: spellCheckPrompt } = require("../prompts/spell-check");

// ─── CLI args ─────────────────────────────────────────────────────────────────

const cliArgs = process.argv.slice(2);
const providerArg = cliArgs.find((a) => a.startsWith("--provider="));
const positionalArgs = cliArgs.filter((a) => !a.startsWith("--"));

const NO_LLM = cliArgs.includes("--no-llm");

// Auto-detect provider: use openrouter if key is set and no explicit --provider
const PROVIDER = NO_LLM
  ? "none"
  : providerArg
    ? providerArg.split("=")[1]
    : openRouterConfig.apiKey
      ? "openrouter"
      : "ollama";

const OLLAMA_MODEL = process.env.OLLAMA_SPELLCHECK_MODEL || "gemma4:latest";
const OPENROUTER_MODEL = process.env.OPENROUTER_SPELLCHECK_MODEL || openRouterConfig.model;
const MODEL = PROVIDER === "openrouter" ? OPENROUTER_MODEL : OLLAMA_MODEL;

const LANGUAGES_TO_CHECK = positionalArgs[0] ? positionalArgs[0].split(",") : null;
const CHECKPOINT_FILE = path.join(appRootPath, "verification-checkpoint.json");

/**
 * Convert an absolute metadata file path to a portable relative key.
 * "/any/path/to/public/locales/.meta/Common/About.json" → ".meta/Common/About.json"
 * "C:\\Users\\...\\public\\locales\\.meta\\Common\\About.json" → ".meta/Common/About.json"
 */
function toPortablePath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const metaIdx = normalized.lastIndexOf(".meta/");
  return metaIdx !== -1 ? normalized.slice(metaIdx) : path.basename(filePath);
}

// Checkpoint data
let checkpoint = {
  lastProject: null,
  lastMetadataFile: null,
  lastLanguage: null,
  tsvFilename: null,
  processedKeys: new Set(),
};

const languageMap = {
  en: "English",
  "en-GB": "English (United Kingdom)",
  "en-US": "English (United States)",
  fr: "French",
  de: "German",
  "de-CH": "German (Switzerland)",
  es: "Spanish",
  "es-MX": "Spanish (Mexico)",
  it: "Italian",
  pt: "Portuguese",
  "pt-BR": "Portuguese (Brazil)",
  ru: "Russian",
  zh: "Chinese",
  "zh-CN": "Chinese (Simplified)",
  ja: "Japanese",
  "ja-JP": "Japanese",
  ko: "Korean",
  "ko-KR": "Korean",
  ar: "Arabic",
  "ar-SA": "Arabic (Saudi Arabia)",
  tr: "Turkish",
  pl: "Polish",
  nl: "Dutch",
  cs: "Czech",
  sk: "Slovak",
  bg: "Bulgarian",
  az: "Azerbaijani",
  "el-GR": "Greek",
  fi: "Finnish",
  "hy-AM": "Armenian",
  "lo-LA": "Lao",
  lv: "Latvian",
  ro: "Romanian",
  si: "Sinhala",
  sl: "Slovenian",
  "sq-AL": "Albanian",
  "sr-Cyrl-RS": "Serbian (Cyrillic)",
  "sr-Latn-RS": "Serbian (Latin)",
  "uk-UA": "Ukrainian",
  vi: "Vietnamese",
};

/**
 * Load checkpoint from file
 * @returns {Object} Checkpoint data
 */
function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, "utf8");
      const loaded = JSON.parse(data);
      console.log(`📍 Loaded checkpoint from file`);
      console.log(`   Last project: ${loaded.lastProject || "none"}`);
      console.log(`   Last file: ${loaded.lastMetadataFile || "none"}`);
      console.log(`   Last language: ${loaded.lastLanguage || "none"}`);
      console.log(`   Processed keys: ${loaded.processedKeys?.length || 0}`);
      return {
        lastProject: loaded.lastProject,
        lastMetadataFile: loaded.lastMetadataFile,
        lastLanguage: loaded.lastLanguage,
        tsvFilename: loaded.tsvFilename,
        processedKeys: new Set(loaded.processedKeys || []),
      };
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load checkpoint: ${error.message}`);
  }
  return {
    lastProject: null,
    lastMetadataFile: null,
    lastLanguage: null,
    tsvFilename: null,
    processedKeys: new Set(),
  };
}

/**
 * Save checkpoint to file
 */
function saveCheckpoint() {
  try {
    const data = {
      lastProject: checkpoint.lastProject,
      lastMetadataFile: checkpoint.lastMetadataFile,
      lastLanguage: checkpoint.lastLanguage,
      tsvFilename: checkpoint.tsvFilename,
      processedKeys: Array.from(checkpoint.processedKeys),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`❌ Failed to save checkpoint: ${error.message}`);
  }
}

/**
 * Clear checkpoint file
 */
function clearCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
      console.log(`🗑️  Cleared checkpoint file`);
    }
  } catch (error) {
    console.error(`❌ Failed to clear checkpoint: ${error.message}`);
  }
}

// ─── Provider: generate completion ────────────────────────────────────────────

/**
 * Generate a streaming completion via Ollama
 * @param {string} prompt
 * @returns {Promise<string>} The response text
 */
/**
 * Detects when a model enters a repetition loop.
 * Maintains a sliding window; when the same phrase repeats 3+ times, returns true.
 */
class RepetitionDetector {
  constructor({ maxRepeats = 3, windowSize = 3000 } = {}) {
    this.maxRepeats = maxRepeats;
    this.windowSize = windowSize;
    this.buffer = "";
  }
  feed(text) {
    this.buffer += text;
    if (this.buffer.length > this.windowSize) {
      this.buffer = this.buffer.slice(-this.windowSize);
    }
    const buf = this.buffer;
    if (buf.length < 100) return false;
    for (const patLen of [150, 80, 40, 20]) {
      if (buf.length < patLen * 2) continue;
      const pattern = buf.slice(-patLen);
      let count = 0;
      let pos = 0;
      while ((pos = buf.indexOf(pattern, pos)) !== -1) {
        count++;
        pos += patLen;
      }
      if (count >= this.maxRepeats) return true;
    }
    return false;
  }
}

async function generateOllama(prompt) {
  const ollamaClient = new Ollama({ host: ollamaConfig.apiUrl });
  const loopDetector = new RepetitionDetector();
  let activeTimeout = null;
  const resetInactivityTimer = (stream) => {
    clearTimeout(activeTimeout);
    activeTimeout = setTimeout(() => {
      stream.abort();
    }, ollamaConfig.inactivityTimeout);
  };

  let fullResponse = "";
  let thinkingStarted = false;
  let responseStarted = false;

  const stream = await ollamaClient.generate({
    model: MODEL,
    prompt: prompt,
    stream: true,
    think: true,
    options: {
      temperature: 0.1,
      num_predict: 8192,
    },
  });

  activeTimeout = setTimeout(() => {
    stream.abort();
  }, ollamaConfig.firstTokenTimeout);

  try {
    for await (const chunk of stream) {
      const thinkingToken = chunk.thinking ?? "";
      if (thinkingToken) {
        if (!thinkingStarted) {
          process.stdout.write("  [think] ");
          thinkingStarted = true;
        }
        process.stdout.write(thinkingToken);
        resetInactivityTimer(stream);
      }

      const token = chunk.response ?? "";
      if (token) {
        if (!responseStarted) {
          if (thinkingStarted) process.stdout.write("\n");
          process.stdout.write("  [response] ");
          responseStarted = true;
        }
        fullResponse += token;
        process.stdout.write(token);
        resetInactivityTimer(stream);

        if (loopDetector.feed(token)) {
          console.warn("\n  [ABORT] Repetition loop detected — stopping generation");
          stream.abort();
          break;
        }
      }
    }
    if (thinkingStarted || responseStarted) process.stdout.write("\n");
  } finally {
    clearTimeout(activeTimeout);
  }

  return fullResponse;
}

/**
 * Generate a streaming completion via OpenRouter (OpenAI-compatible API)
 * @param {string} prompt
 * @returns {Promise<string>} The response text
 */
async function generateOpenRouter(prompt) {
  const controller = new AbortController();
  const loopDetector = new RepetitionDetector();
  let activeTimeout = null;
  const resetInactivityTimer = () => {
    clearTimeout(activeTimeout);
    activeTimeout = setTimeout(() => {
      controller.abort();
    }, openRouterConfig.inactivityTimeout);
  };

  // First-token timeout
  activeTimeout = setTimeout(() => {
    controller.abort();
  }, openRouterConfig.firstTokenTimeout);

  const response = await fetch(`${openRouterConfig.apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 8192,
      stream: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${body}`);
  }

  let fullResponse = "";
  let responseStarted = false;

  // Parse SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          // Handle reasoning tokens (some OpenRouter models support this)
          const reasoning = delta.reasoning || delta.reasoning_content || "";
          if (reasoning) {
            if (!responseStarted) {
              process.stdout.write("  [think] ");
            }
            process.stdout.write(reasoning);
            resetInactivityTimer();
          }

          const content = delta.content || "";
          if (content) {
            if (!responseStarted) {
              process.stdout.write("  [response] ");
              responseStarted = true;
            }
            fullResponse += content;
            process.stdout.write(content);
            resetInactivityTimer();

            if (loopDetector.feed(content)) {
              console.warn("\n  [ABORT] Repetition loop detected — stopping generation");
              controller.abort();
              break;
            }
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
    if (responseStarted) process.stdout.write("\n");
  } finally {
    clearTimeout(activeTimeout);
  }

  return fullResponse;
}

/**
 * Generate completion using the active provider
 * @param {string} prompt
 * @returns {Promise<string>} The response text
 */
async function generateCompletion(prompt) {
  if (PROVIDER === "openrouter") {
    return generateOpenRouter(prompt);
  }
  return generateOllama(prompt);
}

/**
 * Verify provider connectivity
 * @returns {Promise<boolean>}
 */
async function verifyProviderConnection() {
  if (PROVIDER === "openrouter") {
    if (!openRouterConfig.apiKey) {
      console.error("OPENROUTER_API_KEY is not set in .env");
      return false;
    }
    try {
      const response = await fetch(`${openRouterConfig.apiUrl}/models`, {
        headers: { Authorization: `Bearer ${openRouterConfig.apiKey}` },
      });
      if (!response.ok) {
        console.error(`OpenRouter connection failed: ${response.status} ${response.statusText}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`OpenRouter connection error: ${error.message}`);
      return false;
    }
  }
  return verifyOllamaConnection();
}

// ─── Key context from metadata ────────────────────────────────────────────────

/**
 * Extract context (comment + usage examples) from a metadata object.
 * Mirrors readKeyContext() from ollama.js routes.
 * @param {Object} metadata - Parsed .meta JSON
 * @returns {Object|null} { comment, usages } or null if no context available
 */
function extractKeyContext(metadata) {
  if (!metadata) return null;

  const comment = metadata.comment?.text || null;
  const usages = (metadata.usage || [])
    .slice(0, 3) // limit to 3 usage examples to keep prompt concise
    .map((u) => u.context?.trim())
    .filter(Boolean);

  if (!comment && usages.length === 0) return null;
  return { comment, usages };
}

/**
 * Build a context block string for inclusion in the verification prompt.
 * @param {Object|null} keyContext - from extractKeyContext()
 * @returns {string} Context block or empty string
 */
function formatContextBlock(keyContext) {
  if (!keyContext) return "";

  const parts = [];
  if (keyContext.comment) {
    parts.push(`**Context:** ${keyContext.comment}`);
  }
  if (keyContext.usages && keyContext.usages.length > 0) {
    parts.push(`**Usage in code:**\n${keyContext.usages.map((u) => `- \`${u}\``).join("\n")}`);
  }
  return parts.join("\n");
}

// ─── Deterministic checks (no LLM) ───────────────────────────────────────────

// Forbidden literal values in translations (should use {{productName}} etc.)
// Mirrors ForbiddenValueElementsTest from locales.test.js
const FORBIDDEN_ELEMENTS = ["ONLYOFFICE", "DOCSPACE"];
const SKIP_FORBIDDEN_KEYS = new Set([
  "OrganizationName", "ProductName", "ProductEditorsName",
]);

// Languages that use non-Latin primary scripts
const NON_LATIN_LANGUAGES = new Set([
  "ar-SA", "ja-JP", "zh-CN", "ko-KR", "hy-AM", "el-GR",
  "lo-LA", "si", "uk-UA", "ru", "bg", "sr-Cyrl-RS",
]);

/**
 * Extract all {{variable}} tokens from a string
 * @param {string} text
 * @returns {string[]} Sorted array of variable names
 */
function extractVariables(text) {
  const matches = text.match(/\{\{[^}]+\}\}/g) || [];
  return matches.sort();
}

/**
 * Extract all React Trans tags (<0>, </0>, <1>, etc.) and HTML tags from a string
 * @param {string} text
 * @returns {string[]} Sorted array of tags
 */
function extractTags(text) {
  const matches = text.match(/<\/?[a-zA-Z][^>]*\/?>/g) || [];
  return matches.sort();
}

/**
 * Extract all HTML entities (&nbsp;, &amp;, etc.) from a string
 * @param {string} text
 * @returns {string[]} Sorted array of entities
 */
function extractHtmlEntities(text) {
  const matches = text.match(/&[a-zA-Z]+;/g) || [];
  return matches.sort();
}

/**
 * Check if a string contains at least one non-ASCII/non-punctuation character
 * (i.e., at least one character from a non-Latin script)
 * @param {string} text
 * @returns {boolean}
 */
function hasNonLatinChars(text) {
  // Strip variables, tags, numbers, punctuation, spaces — check if anything non-ASCII remains
  const stripped = text
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&[a-zA-Z]+;/g, "")
    .replace(/[0-9\s\p{P}\p{S}]/gu, "");
  // Check for characters outside basic Latin
  return /[^\u0000-\u007F]/.test(stripped);
}

/**
 * Run all deterministic checks on a single translation pair.
 * Returns issues in the same format as LLM issues: { type, description, suggestion }
 *
 * @param {string} englishContent - English source text
 * @param {string} translatedContent - Translated text
 * @param {string} language - Language code
 * @param {string} keyName - The bare key name (without namespace prefix)
 * @returns {Array<Object>} Array of detected issues
 */
function runDeterministicChecks(englishContent, translatedContent, language, keyName = "") {
  const issues = [];

  // 1. Empty / whitespace-only translation
  if (!translatedContent || !translatedContent.trim()) {
    issues.push({
      type: "empty_translation",
      description: "Translation is empty or contains only whitespace",
      suggestion: "",
    });
    return issues; // no point checking further
  }

  // 2. Missing {{variables}}
  const enVars = extractVariables(englishContent);
  const trVars = extractVariables(translatedContent);
  if (enVars.length > 0 || trVars.length > 0) {
    const missingVars = enVars.filter((v) => !trVars.includes(v));
    const extraVars = trVars.filter((v) => !enVars.includes(v));
    if (missingVars.length > 0) {
      issues.push({
        type: "missing_variable",
        description: `Missing variable(s): ${missingVars.join(", ")}`,
        suggestion: "",
      });
    }
    if (extraVars.length > 0) {
      issues.push({
        type: "extra_variable",
        description: `Extra variable(s) not in English: ${extraVars.join(", ")}`,
        suggestion: "",
      });
    }
  }

  // 3. Missing/extra React & HTML tags
  //    Normalize tags (collapse internal whitespace) for comparison,
  //    but flag malformed tags with extra spaces separately.
  const normalizeTag = (t) => t.replace(/\s+/g, " ").replace(/\s>/g, ">").replace(/\s\/>/g, "/>");
  const enTags = extractTags(englishContent).map(normalizeTag);
  const trTagsRaw = extractTags(translatedContent);
  const trTags = trTagsRaw.map(normalizeTag);

  if (enTags.length > 0 || trTags.length > 0) {
    const missingTags = enTags.filter((t) => !trTags.includes(t));
    const extraTags = trTags.filter((t) => !enTags.includes(t));
    if (missingTags.length > 0) {
      issues.push({
        type: "missing_tag",
        description: `Missing tag(s): ${missingTags.join(", ")}`,
        suggestion: "",
      });
    }
    if (extraTags.length > 0) {
      issues.push({
        type: "extra_tag",
        description: `Extra tag(s) not in English: ${extraTags.join(", ")}`,
        suggestion: "",
      });
    }
  }

  // 3b. Malformed tags — tags with internal whitespace (e.g., "<strong >" instead of "<strong>")
  const malformedTags = trTagsRaw.filter((t) => /\s+\/?>/.test(t) || /<\s+/.test(t));
  if (malformedTags.length > 0) {
    issues.push({
      type: "malformed_tag",
      description: `Tag(s) with extra whitespace: ${malformedTags.join(", ")}`,
      suggestion: malformedTags.map(normalizeTag).join(", "),
    });
  }

  // 4. HTML entity mismatch
  const enEntities = extractHtmlEntities(englishContent);
  const trEntities = extractHtmlEntities(translatedContent);
  if (enEntities.join(",") !== trEntities.join(",")) {
    const missing = enEntities.filter((e) => !trEntities.includes(e));
    const extra = trEntities.filter((e) => !enEntities.includes(e));
    const parts = [];
    if (missing.length) parts.push(`missing: ${missing.join(", ")}`);
    if (extra.length) parts.push(`extra: ${extra.join(", ")}`);
    if (parts.length > 0) {
      issues.push({
        type: "html_entity_mismatch",
        description: `HTML entity mismatch — ${parts.join("; ")}`,
        suggestion: "",
      });
    }
  }

  // 5. Suspicious length ratio (only for strings > 10 chars to avoid false positives on short labels)
  //    CJK languages use fewer characters per concept, so use looser thresholds.
  const CJK_LANGUAGES = new Set(["ja-JP", "zh-CN", "ko-KR"]);
  const isCJK = CJK_LANGUAGES.has(language);
  const minRatio = isCJK ? 0.05 : 0.15;
  const maxRatio = isCJK ? 8 : 5;

  if (englishContent.length > 10) {
    const ratio = translatedContent.length / englishContent.length;
    if (ratio > maxRatio) {
      issues.push({
        type: "suspicious_length",
        description: `Translation is ${ratio.toFixed(1)}x longer than English (${translatedContent.length} vs ${englishContent.length} chars) — possibly duplicated text`,
        suggestion: "",
      });
    } else if (ratio < minRatio) {
      issues.push({
        type: "suspicious_length",
        description: `Translation is ${ratio.toFixed(2)}x the length of English (${translatedContent.length} vs ${englishContent.length} chars) — possibly truncated`,
        suggestion: "",
      });
    }
  }

  // 6. Non-Latin script check — translation contains only ASCII for languages that should use other scripts
  //    Skip if translation is identical to English (intentional: brand names, product names, etc.)
  //    Require English text > 15 chars (after stripping markup) to avoid flagging short
  //    terms, abbreviations, and proper nouns (e.g. "PDFs", "E-mail", "OAuth 2.0").
  if (NON_LATIN_LANGUAGES.has(language) && englishContent !== translatedContent) {
    const enTextOnly = englishContent
      .replace(/\{\{[^}]+\}\}/g, "")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/&[a-zA-Z]+;/g, "")
      .trim();

    if (enTextOnly.length > 15 && !hasNonLatinChars(translatedContent)) {
      issues.push({
        type: "wrong_script",
        description: `Translation for ${language} contains only Latin/ASCII characters — likely untranslated`,
        suggestion: "",
      });
    }
  }

  // 7. Trailing punctuation consistency
  //    Only check structural punctuation (:) for all languages.
  //    Period/exclamation checks only for Latin-script languages — many other
  //    scripts (Arabic, CJK, etc.) have different sentence-ending conventions.
  const LATIN_SCRIPT_LANGUAGES = new Set([
    "de", "de-CH", "fr", "es", "es-MX", "it", "pt", "pt-BR",
    "pl", "nl", "cs", "sk", "ro", "lv", "sl", "fi", "tr",
    "sq-AL", "sr-Latn-RS", "az", "vi",
  ]);

  const enTrimmed = englishContent.trim();
  const trTrimmed = translatedContent.trim();
  if (enTrimmed.length > 20) {
    const enEndChar = enTrimmed.slice(-1);
    const trEndChar = trTrimmed.slice(-1);

    // Colon check for all languages (structural, not stylistic)
    if (enEndChar === ":" && trEndChar !== ":" && trEndChar !== "：") {
      issues.push({
        type: "punctuation_mismatch",
        description: `English ends with ":" but translation ends with "${trEndChar}"`,
        suggestion: "",
      });
    }

    // Period/exclamation check only for Latin-script languages
    if (LATIN_SCRIPT_LANGUAGES.has(language) && ".!".includes(enEndChar) && trEndChar !== enEndChar) {
      const equivalentEnds = {
        ".": ["."],
        "!": ["!", "！"],
      };
      const allowed = equivalentEnds[enEndChar] || [enEndChar];
      if (!allowed.includes(trEndChar)) {
        issues.push({
          type: "punctuation_mismatch",
          description: `English ends with "${enEndChar}" but translation ends with "${trEndChar}"`,
          suggestion: "",
        });
      }
    }
  }

  // 8. Unpaired brackets/quotes
  const bracketPairs = [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
    ["\u00AB", "\u00BB"], // « »
  ];
  for (const [open, close] of bracketPairs) {
    // Skip {{variable}} braces — they are checked separately
    if (open === "{") continue;
    const openCount = (translatedContent.match(new RegExp(`\\${open}`, "g")) || []).length;
    const closeCount = (translatedContent.match(new RegExp(`\\${close}`, "g")) || []).length;
    if (openCount !== closeCount) {
      issues.push({
        type: "unpaired_bracket",
        description: `Unpaired "${open}${close}" in translation: ${openCount} open vs ${closeCount} close`,
        suggestion: "",
      });
    }
  }

  // 8b. Smart-quote pairing: „ (U+201E), " (U+201C), " (U+201D) — total count must be even
  //     Languages like de, cs, bg use „..." (U+201E + U+201C), en uses "..." (U+201C + U+201D)
  const smartQuoteTotal =
    (translatedContent.match(/\u201C/g) || []).length +
    (translatedContent.match(/\u201D/g) || []).length +
    (translatedContent.match(/\u201E/g) || []).length;
  if (smartQuoteTotal > 0 && smartQuoteTotal % 2 !== 0) {
    issues.push({
      type: "unpaired_bracket",
      description: `Odd number of smart quotes (\u201C\u201D\u201E): ${smartQuoteTotal} total (should be even)`,
      suggestion: "",
    });
  }

  // 9. Forbidden literal values (ONLYOFFICE, DOCSPACE) — should use {{productName}} etc.
  //    Mirrors ForbiddenValueElementsTest from locales.test.js
  if (!SKIP_FORBIDDEN_KEYS.has(keyName)) {
    const upperTranslation = translatedContent.toUpperCase();
    const found = FORBIDDEN_ELEMENTS.filter((el) => upperTranslation.includes(el));
    if (found.length > 0) {
      issues.push({
        type: "forbidden_value",
        description: `Translation contains hardcoded brand name(s): ${found.join(", ")} — should use a template variable like {{productName}}`,
        suggestion: "",
      });
    }
  }

  return issues;
}

/**
 * Check for orphan keys — keys present in a language file but missing from English.
 * These are stale translations that should be removed.
 * Mirrors NotFoundEnKey test from locales.test.js.
 *
 * @param {Object} enData - { namespace → { key → value } } for English
 * @param {Object} langData - { namespace → { key → value } } for the target language
 * @returns {Array<Object>} Array of { namespace, key } orphan entries
 */
function findOrphanKeys(enData, langData) {
  const orphans = [];
  for (const ns of Object.keys(langData)) {
    const enNs = enData[ns] || {};
    const langNs = langData[ns] || {};
    for (const key of Object.keys(langNs)) {
      if (!(key in enNs)) {
        orphans.push({ namespace: ns, key });
      }
    }
  }
  return orphans;
}

// ─── Verification logic (LLM) ────────────────────────────────────────────────

/**
 * Extracts and parses JSON from LLM response text
 * @param {string} responseText - Raw response text
 * @returns {Array|null} Parsed array or null on failure
 */
function parseIssuesFromResponse(responseText) {
  let jsonText = responseText.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith("```")) {
    const firstNewline = jsonText.indexOf("\n");
    if (firstNewline !== -1) {
      jsonText = jsonText.substring(firstNewline + 1);
    }
    const lastBackticks = jsonText.lastIndexOf("```");
    if (lastBackticks !== -1) {
      jsonText = jsonText.substring(0, lastBackticks);
    }
    jsonText = jsonText.trim();
  }

  // Check if response is truncated or corrupted
  if (jsonText.includes(">]>]>]>]") || jsonText.length > 10000) {
    return null;
  }

  // Fix improperly escaped brackets in strings
  jsonText = jsonText.replace(/\\\[/g, "[").replace(/\\\]/g, "]");

  const issues = JSON.parse(jsonText);
  return Array.isArray(issues) ? issues : null;
}

/**
 * Verifies a translation against the English version with retry mechanism
 * @param {string} keyPath - The key path
 * @param {string} englishContent - The English content
 * @param {string} translatedContent - The translated content
 * @param {string} language - The language code
 * @param {Object} progress - Progress tracking object with current, total, keyIndex, totalKeys
 * @param {Object|null} keyContext - Context from metadata (comment + usages)
 * @returns {Promise<Array>} Array of identified issues
 */
async function verifyTranslation(
  keyPath,
  englishContent,
  translatedContent,
  language,
  progress = null,
  keyContext = null,
) {
  // Skip if content is empty
  if (!englishContent || !translatedContent) {
    console.log(
      `Skipping verification for ${keyPath} in ${language}: insufficient data`,
    );
    return [];
  }

  const languageName = languageMap[language] || language;
  const contextBlock = formatContextBlock(keyContext);

  const prompt = spellCheckPrompt({
    englishContent,
    translatedContent,
    languageName,
    contextBlock,
  });

  // Retry configuration
  const maxRetries = 3;
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      const keyProgressStr =
        progress && progress.keyIndex && progress.totalKeys
          ? `[${progress.keyIndex}/${progress.totalKeys}] `
          : "";
      const langProgressStr = progress
        ? ` [${progress.current}/${progress.total}]`
        : "";
      const retryStr =
        retries > 0 ? ` (attempt ${retries + 1}/${maxRetries})` : "";
      console.log(
        `${keyProgressStr}Verifying translation for ${keyPath} in ${language}${langProgressStr}${retryStr}`,
      );

      const fullResponse = await generateCompletion(prompt);

      // Parse the response
      if (fullResponse) {
        try {
          const issues = parseIssuesFromResponse(fullResponse);
          if (issues === null) {
            console.warn(
              `Unexpected response format for ${keyPath} in ${language}`,
            );
            return [];
          }
          if (issues.length === 0) {
            console.log(`  ✓ OK`);
          } else {
            console.log(`  ✗ ${issues.length} issue(s): ${issues.map((i) => i.type).join(", ")}`);
          }
          return issues;
        } catch (parseError) {
          console.warn(
            `Failed to parse response as JSON for ${keyPath} in ${language}: ${parseError.message}`,
          );
          console.warn(`Response was: ${fullResponse.substring(0, 500)}...`);
          return [];
        }
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      lastError = error;
      retries++;

      console.error(
        `Error calling ${PROVIDER} (attempt ${retries}/${maxRetries}):`,
        error.message,
      );

      if (
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.name === "AbortError" ||
        error.message.includes("socket hang up") ||
        error.message.includes("timeout") ||
        error.message.includes("aborted")
      ) {
        console.log(
          `Network error detected. Waiting before retry... ${error.message}`,
        );
        if (PROVIDER === "ollama") {
          console.log(`ollama api url: '${ollamaConfig.apiUrl}' model: '${MODEL}'`);
        } else {
          console.log(`openrouter api url: '${openRouterConfig.apiUrl}' model: '${MODEL}'`);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
      } else if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(
    `Failed to verify translation for ${keyPath} in ${language} after ${maxRetries} attempts:`,
    lastError ? lastError.message : "Unknown error",
  );
  return [];
}

/**
 * Gets all available languages from the locales directory
 * @param {string} projectPath - Path to the project locales directory
 * @returns {Array<string>} Array of language codes
 */
async function getAvailableLanguages(projectPath) {
  const items = await fs.readdir(projectPath);

  return items.filter((item) => {
    const itemPath = path.join(projectPath, item);
    return fs.statSync(itemPath).isDirectory() && item !== ".meta";
  });
}

/**
 * Gets translation content from the in-memory cache
 * @param {Object} translations - The translations cache
 * @param {string} namespace - Namespace of the translation
 * @param {string} key - Key of the translation
 * @param {string} language - Language code
 * @returns {string|null} Translation content or null if not found
 */
function getTranslationContent(translations, namespace, key, language) {
  try {
    return translations[language]?.[namespace]?.[key] || null;
  } catch (error) {
    console.error(
      `Error reading translation for ${key} in ${language} from cache: ${error.message}`,
    );
    return null;
  }
}

/**
 * Loads all translation files for a project into memory
 * @param {string} projectPath - Path to the project locales directory
 * @param {Array<string>} languages - Array of languages to load
 * @returns {Promise<Object>} A map of translations: { [lang]: { [ns]: { [key]: val } } }
 */
async function loadAllTranslations(projectPath, languages) {
  const translations = {};
  const allLangs = ["en", ...languages]; // Also load English

  for (const lang of allLangs) {
    translations[lang] = {};
    const langPath = path.join(projectPath, lang);
    if (!(await fs.pathExists(langPath))) continue;

    const nsFiles = await fs.readdir(langPath);
    for (const nsFile of nsFiles) {
      if (path.extname(nsFile) === ".json") {
        const namespace = path.basename(nsFile, ".json");
        const filePath = path.join(langPath, nsFile);
        try {
          translations[lang][namespace] = await fs.readJson(filePath);
        } catch (error) {
          console.error(
            `Error reading JSON file ${filePath}: ${error.message}`,
          );
        }
      }
    }
  }
  return translations;
}

/**
 * Verifies translations and updates metadata for a project
 * @param {string} projectName - Project name
 * @param {string} tsvFilename - TSV filename for incremental writing
 * @param {Object} counters - Object to track totalIssuesFound
 * @returns {Promise<Object>} Statistics
 */
async function verifyTranslationsSpellCheck(project, tsvFilename, counters) {
  const resuming =
    checkpoint.lastProject === project && checkpoint.lastMetadataFile !== null;
  console.log(`Verifying translations for project: ${project}`);

  const stats = {
    totalProjects: 1,
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedIssues: 0,
    skippedKeys: 0,
    errors: [],
    languages: {},
    startTime: new Date(),
  };

  try {
    const localesPath = projectLocalesMap[project];
    if (!localesPath) {
      throw new Error(`No locales path defined for project: ${project}`);
    }

    const projectPath = path.join(appRootPath, localesPath);
    console.log(`Project path: ${projectPath}`);

    const allLanguages = await getAvailableLanguages(projectPath);
    console.log(
      `Found ${allLanguages.length} languages: ${allLanguages.join(", ")}`,
    );

    const languages = LANGUAGES_TO_CHECK
      ? allLanguages.filter((lang) => LANGUAGES_TO_CHECK.includes(lang))
      : allLanguages.filter((lang) => lang !== "en");

    console.log(
      `Will check ${languages.length} languages: ${languages.join(", ")}`,
    );

    languages.forEach((lang) => {
      stats.languages[lang] = { processed: 0, updated: 0, issues: 0 };
    });

    // Pre-load all translation files
    console.log("Loading all translation files into memory...");
    const translations = await loadAllTranslations(projectPath, languages);
    console.log("Translation files loaded.");

    // Phase 0: Orphan key detection — keys in translations that don't exist in English
    const enData = translations["en"] || {};
    for (const language of languages) {
      const langData = translations[language] || {};
      const orphans = findOrphanKeys(enData, langData);
      if (orphans.length > 0) {
        console.log(
          `  [orphan] ${language}: ${orphans.length} key(s) not found in English`,
        );
        for (const { namespace, key: orphanKey } of orphans) {
          const orphanKeyPath = `${namespace}:${orphanKey}`;
          const issue = {
            type: "orphan_key",
            description: `Key "${orphanKey}" exists in ${language}/${namespace}.json but not in English — stale translation`,
            suggestion: "Remove this key from the translation file",
          };
          appendIssueToTSV(
            tsvFilename,
            project,
            `${projectPath}/.meta/${namespace}/${orphanKey}.json`,
            orphanKeyPath,
            language,
            "",
            translations[language]?.[namespace]?.[orphanKey] || "",
            issue,
          );
          counters.totalIssuesFound++;
          stats.updatedIssues++;
          if (!stats.languages[language]) {
            stats.languages[language] = { processed: 0, updated: 0, issues: 0 };
          }
          stats.languages[language].updated++;
          stats.languages[language].issues++;
        }
      }
    }

    const metaPattern = path
      .join(projectPath, ".meta", "**", "*.json")
      .replace(/\\/g, "/");
    const metadataFiles = glob.sync(metaPattern);
    console.log(`Found ${metadataFiles.length} metadata files`);

    // Skip files until we reach checkpoint if resuming.
    // Use basename for comparison — checkpoint may be from a different OS/machine
    // with different absolute paths. basename (e.g. "Guest.json") is stable.
    let skipUntilKey = resuming && checkpoint.lastMetadataFile
      ? toPortablePath(checkpoint.lastMetadataFile)
      : null;

    // When resuming, also skip languages already done for the checkpoint key
    let resumeAtLanguage = resuming ? checkpoint.lastLanguage : null;

    let skippedKeys = 0;

    for (const metadataFile of metadataFiles) {
      // Skip files until checkpoint
      if (skipUntilKey) {
        const currentKey = toPortablePath(metadataFile);
        if (currentKey !== skipUntilKey) {
          skippedKeys++;
          continue;
        }
        console.log(` Resuming from file: ${currentKey} (skipped ${skippedKeys} already-processed keys)`);
        stats.totalKeys = skippedKeys; // so progress counter continues from where we left off
        skipUntilKey = null; // Found checkpoint, process from here
      }

      try {
        const metaPathParts = metadataFile.split(path.sep);
        const key = path.basename(metadataFile, ".json");
        const namespace = metaPathParts[metaPathParts.length - 2];
        const keyPath = `${namespace}:${key}`;

        const metadata = await fs.readJson(metadataFile);

        // Extract context from metadata (comment + usage examples)
        const keyContext = extractKeyContext(metadata);

        const englishContent = getTranslationContent(
          translations,
          namespace,
          key,
          "en",
        );
        if (!englishContent) {
          console.log(`Skipping ${keyPath}: English content not found`);
          stats.skippedKeys++;
          continue;
        }

        stats.totalKeys++;
        stats.totalFiles++;

        let metadataUpdated = false;

        // On the first key after resume, skip languages already processed
        let skipLangsUntil = null;
        if (resumeAtLanguage) {
          skipLangsUntil = resumeAtLanguage;
          resumeAtLanguage = null; // only for the first key
        }

        for (let langIndex = 0; langIndex < languages.length; langIndex++) {
          const language = languages[langIndex];

          // Skip already-processed languages for resumed key
          if (skipLangsUntil) {
            if (language !== skipLangsUntil) continue;
            skipLangsUntil = null; // found it, process from here
          }

          // Save checkpoint when starting new language
          if (checkpoint.lastLanguage !== language) {
            checkpoint.lastProject = project;
            checkpoint.lastMetadataFile = toPortablePath(metadataFile);
            checkpoint.lastLanguage = language;
            saveCheckpoint();
          }

          try {
            const translatedContent = getTranslationContent(
              translations,
              namespace,
              key,
              language,
            );
            if (!translatedContent) {
              continue;
            }

            const progress = {
              current: langIndex + 1,
              total: languages.length,
              keyIndex: stats.totalKeys,
              totalKeys: metadataFiles.length,
            };

            // Phase 1: deterministic checks (instant, no LLM)
            const deterministicIssues = runDeterministicChecks(
              englishContent,
              translatedContent,
              language,
              key,
            );

            if (deterministicIssues.length > 0) {
              console.log(
                `  [static] ${deterministicIssues.length} issue(s): ${deterministicIssues.map((i) => i.type).join(", ")}`,
              );
            }

            // Phase 2: LLM verification (skip if --no-llm or deterministic found critical structural issues)
            const hasStructuralIssue = deterministicIssues.some((i) =>
              ["empty_translation", "wrong_script"].includes(i.type),
            );

            let llmIssues = [];
            if (!NO_LLM && !hasStructuralIssue) {
              llmIssues = await verifyTranslation(
                keyPath,
                englishContent,
                translatedContent,
                language,
                progress,
                keyContext,
              );
            }

            // Merge: deterministic issues that overlap with LLM types are deduplicated
            const llmTypes = new Set(llmIssues.map((i) => i.type));
            const uniqueDeterministic = deterministicIssues.filter(
              (i) => !llmTypes.has(i.type),
            );
            const issues = [...uniqueDeterministic, ...llmIssues];

            if (!metadata.languages) metadata.languages = {};
            if (!metadata.languages[language]) {
              metadata.languages[language] = {
                ai_translated: false,
                ai_model: null,
                ai_spell_check_issues: [],
                approved_at: null,
              };
            }

            metadata.languages[language].ai_spell_check_issues = issues;
            metadataUpdated = true;

            stats.processedKeys++;
            stats.languages[language].processed++;

            if (issues.length > 0) {
              stats.updatedIssues++;
              stats.languages[language].updated++;
              stats.languages[language].issues += issues.length;
              console.log(
                `Found ${issues.length} issues for ${keyPath} in ${language}`,
              );

              // Save issues to CSV immediately
              for (const issue of issues) {
                appendIssueToTSV(
                  tsvFilename,
                  project,
                  metadataFile,
                  keyPath,
                  language,
                  englishContent,
                  translatedContent,
                  issue,
                );
                counters.totalIssuesFound++;
              }
            }
          } catch (langError) {
            console.error(
              `Error processing ${keyPath} for ${language}: ${langError.message}`,
            );
            stats.errors.push({
              file: metadataFile,
              key: keyPath,
              language,
              error: langError.message,
            });
            // Save checkpoint on error
            saveCheckpoint();
          }
        }

        if (metadataUpdated) {
          metadata.updated_at = new Date().toISOString();
          await writeJsonWithConsistentEol(metadataFile, metadata);
        }
      } catch (fileError) {
        console.error(
          `Error processing metadata file ${metadataFile}: ${fileError.message}`,
        );
        stats.errors.push({ file: metadataFile, error: fileError.message });
        // Save checkpoint on error
        saveCheckpoint();
      }
    }

    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000;

    return stats;
  } catch (error) {
    console.error(
      `Error verifying translations for project ${project}: ${error.message}`,
    );
    stats.errors.push({ project: project, error: error.message });
    stats.endTime = new Date();
    stats.duration = (stats.endTime - stats.startTime) / 1000;
    return stats;
  }
}

/**
 * Escape TSV field by replacing tabs and newlines
 * @param {any} field - Field to escape
 * @returns {string} Escaped field
 */
function escapeTsvField(field) {
  if (field == null) return "";
  const str = String(field);
  // Replace tabs with spaces and newlines with spaces
  return str.replace(/\t/g, " ").replace(/\n/g, " ").replace(/\r/g, "");
}

/**
 * Appends issue to TSV file
 * @param {string} tsvFilename - TSV filename
 * @param {string} project - Project name
 * @param {string} metadataFile - Metadata file path
 * @param {string} keyPath - Translation key path
 * @param {string} language - Language code
 * @param {string} englishContent - English content
 * @param {string} translatedContent - Translated content
 * @param {Object} issue - Issue object
 */
function appendIssueToTSV( // sync — no async needed
  tsvFilename,
  project,
  metadataFile,
  keyPath,
  language,
  englishContent,
  translatedContent,
  issue,
) {
  const tsvPath = path.join(appRootPath, tsvFilename);
  // Store relative path in TSV so the file is portable across machines
  const relativeMetaFile = metadataFile.replace(/\\/g, "/");
  const metaIdx = relativeMetaFile.lastIndexOf(".meta/");
  const portableMetaPath = metaIdx !== -1
    ? relativeMetaFile.slice(metaIdx)
    : path.basename(metadataFile);
  const row = [
    project,
    portableMetaPath,
    keyPath,
    language,
    escapeTsvField(englishContent),
    escapeTsvField(translatedContent),
    issue.type || "",
    escapeTsvField(issue.description || ""),
    escapeTsvField(issue.suggestion || ""),
  ].join("\t");

  fs.appendFileSync(tsvPath, row + "\n", "utf8");

  // Update checkpoint (will be saved when language changes)
  checkpoint.lastProject = project;
  checkpoint.lastMetadataFile = toPortablePath(metadataFile);
  checkpoint.lastLanguage = language;
  checkpoint.processedKeys.add(
    `${project}:${toPortablePath(metadataFile)}:${keyPath}:${language}`,
  );
}

/**
 * Verifies translations for all projects
 * @returns {Promise<Object>} Overall statistics
 */
async function verifyAllTranslationsSpellCheck() {
  console.log("Starting translation verification process...");

  // Load checkpoint
  checkpoint = loadCheckpoint();
  const resuming = checkpoint.lastProject !== null;

  console.log("PROVIDER: ", PROVIDER);
  console.log("MODEL: ", MODEL);
  console.log("LANGUAGES_TO_CHECK: ", LANGUAGES_TO_CHECK);
  console.log("CHECKPOINT_FILE: ", CHECKPOINT_FILE);
  console.log("RESUMING: ", resuming ? "yes" : "no");

  if (!NO_LLM) {
    const providerReady = await verifyProviderConnection();
    if (!providerReady) {
      console.error(`${PROVIDER} is not available. Aborting verification process.`);
      process.exit(1);
    }
  }

  // Single TSV file — always append. Created with header if missing.
  const tsvFilename = "spell-check-issues.tsv";
  checkpoint.tsvFilename = tsvFilename;
  const tsvPath = path.join(appRootPath, tsvFilename);

  if (!fs.existsSync(tsvPath)) {
    const tsvHeader =
      "Project\tMetadata File\tKey\tLanguage\tEnglish Content\tTranslated Content\tIssue Type\tDescription\tSuggestion\n";
    fs.writeFileSync(tsvPath, tsvHeader, "utf8");
    console.log(` Created TSV file: ${tsvPath}`);
  } else {
    console.log(` Appending to existing TSV file: ${tsvPath}`);
  }
  console.log("Issues will be saved incrementally as they are found.\n");

  const counters = { totalIssuesFound: 0 };

  const overallStats = {
    projects: {},
    totalProjects: 0,
    totalNamespaces: 0,
    totalFiles: 0,
    totalKeys: 0,
    processedKeys: 0,
    updatedIssues: 0,
    skippedKeys: 0,
    errors: [],
    languages: {},
    startTime: new Date(),
  };

  const projects = Object.keys(projectLocalesMap);
  overallStats.totalProjects = projects.length;

  // Skip to the checkpoint project if resuming
  let skipUntilProject = resuming ? checkpoint.lastProject : null;
  let foundCheckpoint = !resuming;

  for (const project of projects) {
    // Skip projects until we reach the checkpoint
    if (skipUntilProject && project !== skipUntilProject) {
      console.log(` Skipping project: ${project} (already processed)`);
      continue;
    }
    if (skipUntilProject && project === skipUntilProject) {
      foundCheckpoint = true;
      skipUntilProject = null; // clear so subsequent projects are not skipped
      console.log(` Resuming from project: ${project}`);
    }

    try {
      console.log(` Processing project: ${project}`);
      const projectStats = await verifyTranslationsSpellCheck(
        project,
        tsvFilename,
        counters,
      );

      overallStats.projects[project] = projectStats;
      overallStats.totalNamespaces += projectStats.totalNamespaces || 0;
      overallStats.totalFiles += projectStats.totalFiles || 0;
      overallStats.totalKeys += projectStats.totalKeys || 0;
      overallStats.processedKeys += projectStats.processedKeys || 0;
      overallStats.updatedIssues += projectStats.updatedIssues || 0;
      overallStats.skippedKeys += projectStats.skippedKeys || 0;

      Object.entries(projectStats.languages || {}).forEach(
        ([lang, langStats]) => {
          if (!overallStats.languages[lang]) {
            overallStats.languages[lang] = {
              processed: 0,
              updated: 0,
              issues: 0,
            };
          }
          overallStats.languages[lang].processed += langStats.processed || 0;
          overallStats.languages[lang].updated += langStats.updated || 0;
          overallStats.languages[lang].issues += langStats.issues || 0;
        },
      );

      overallStats.errors = overallStats.errors.concat(
        projectStats.errors || [],
      );
    } catch (error) {
      console.error(`Error processing project ${project}: ${error.message}`);
      overallStats.errors.push({ project, error: error.message });
    }
  }

  overallStats.endTime = new Date();
  overallStats.duration =
    (overallStats.endTime - overallStats.startTime) / 1000; // in seconds

  // Report final TSV status
  if (counters.totalIssuesFound > 0) {
    console.log(` Total issues saved to TSV: ${counters.totalIssuesFound}`);
  } else {
    console.log("\nNo new issues found in this run.");
  }
  console.log(` TSV file: ${tsvPath}`);

  // Clear checkpoint on successful completion
  clearCheckpoint();

  return overallStats;
}

// Run the script if executed directly
verifyAllTranslationsSpellCheck()
  .then((stats) => {
    console.log("\n=== Verification Complete ===");
    console.log(`Total issues found: ${stats.updatedIssues}`);
    if (checkpoint.tsvFilename) {
      console.log(
        `Results saved to: ${path.join(appRootPath, checkpoint.tsvFilename)}`,
      );
    }
    console.log("\nThank you for using the translation verification tool!");

    console.log("\n=== Translation Verification Complete ===\n");

    // Print summary statistics
    console.log("Summary:");
    console.log(`- Total projects: ${stats.totalProjects}`);
    console.log(`- Total files: ${stats.totalFiles}`);
    console.log(`- Total keys: ${stats.totalKeys}`);
    console.log(`- Processed keys: ${stats.processedKeys}`);
    console.log(`- Updated with issues: ${stats.updatedIssues}`);
    console.log(`- Skipped keys: ${stats.skippedKeys}`);
    console.log(`- Errors: ${stats.errors.length}`);
    console.log(`- Duration: ${stats.duration.toFixed(2)} seconds`);

    // Print language statistics
    console.log("\nLanguage Statistics:");
    Object.entries(stats.languages).forEach(([lang, langStats]) => {
      console.log(
        `- ${lang}: Processed ${langStats.processed}, Updated ${langStats.updated}, Total Issues ${langStats.issues}`,
      );
    });

    // Print errors if any
    if (stats.errors.length > 0) {
      console.log("\nErrors:");
      stats.errors.slice(0, 10).forEach((error, index) => {
        console.log(
          `${index + 1}. ${error.file || error.project}: ${error.error}`,
        );
      });

      if (stats.errors.length > 10) {
        console.log(`... and ${stats.errors.length - 10} more errors`);
      }
    }

    console.log("\nDone!");
  })
  .catch((error) => {
    console.error("\n=== Error During Verification ===");
    console.error(error);
    console.log(
      "\n Checkpoint saved. You can resume by running the script again.",
    );
    saveCheckpoint();
    process.exit(1);
  });

