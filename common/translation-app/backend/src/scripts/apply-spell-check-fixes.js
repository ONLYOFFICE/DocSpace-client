#!/usr/bin/env node
/**
 * Apply Spell Check Fixes (P0: tags & variables)
 *
 * Reads .meta files, finds P0 structural issues (missing/extra/malformed tags
 * and variables) that have suggestions, validates the suggestion actually fixes
 * the structural problem, and applies it to the translation JSON files.
 *
 * Usage:
 *   node apply-spell-check-fixes.js [options]
 *
 * Options:
 *   --dry-run           Show what would be changed without modifying files
 *   --types=TYPE,...     Filter by issue types (default: all P0 types)
 *   --languages=LANG,...  Filter by language codes
 *   --projects=PROJ,...   Filter by project names
 *   --include-p1        Also include wrong_language issues
 *   --include-p2        Also include incorrect_translation and missing_content
 *   --all               Include all issue types (P0 + P1 + P2 + P3)
 *
 * Examples:
 *   node apply-spell-check-fixes.js --dry-run
 *   node apply-spell-check-fixes.js --types=missing_tag,malformed_tag
 *   node apply-spell-check-fixes.js --languages=fr,de --dry-run
 *   node apply-spell-check-fixes.js --projects=Common
 *   node apply-spell-check-fixes.js --include-p1 --dry-run
 *   node apply-spell-check-fixes.js --all
 */
const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const { appRootPath, projectLocalesMap } = require("../config/config");
const { writeJsonWithConsistentEol } = require("../utils/fsUtils");

// ─── CLI args ─────────────────────────────────────────────────────────────────

const cliArgs = process.argv.slice(2);
const DRY_RUN = cliArgs.includes("--dry-run");
const INCLUDE_P1 = cliArgs.includes("--include-p1");
const INCLUDE_P2 = cliArgs.includes("--include-p2");
const INCLUDE_ALL = cliArgs.includes("--all");

const typesArg = cliArgs.find((a) => a.startsWith("--types="));
const langsArg = cliArgs.find((a) => a.startsWith("--languages="));
const projArg = cliArgs.find((a) => a.startsWith("--projects="));

// ─── Issue type classification ────────────────────────────────────────────────

const P0_TYPES = [
  "missing_variable",
  "extra_variable",
  "missing_tag",
  "extra_tag",
  "malformed_tag",
];

const P1_TYPES = ["wrong_language"];

const P2_TYPES = ["incorrect_translation", "missing_content"];

const P3_TYPES = ["punctuation_mismatch", "wrong_script", "suspicious_length"];

function getActiveTypes() {
  if (typesArg) {
    return new Set(typesArg.split("=")[1].split(","));
  }

  const types = new Set(P0_TYPES);

  if (INCLUDE_P1 || INCLUDE_ALL) {
    P1_TYPES.forEach((t) => types.add(t));
  }
  if (INCLUDE_P2 || INCLUDE_ALL) {
    P2_TYPES.forEach((t) => types.add(t));
  }
  if (INCLUDE_ALL) {
    P3_TYPES.forEach((t) => types.add(t));
  }

  return types;
}

const ACTIVE_TYPES = getActiveTypes();
const FILTER_LANGUAGES = langsArg
  ? new Set(langsArg.split("=")[1].split(","))
  : null;
const FILTER_PROJECTS = projArg
  ? new Set(projArg.split("=")[1].split(","))
  : null;

// ─── Deterministic validation (reused from verify script) ─────────────────────

function extractVariables(text) {
  const matches = text.match(/\{\{[^}]+\}\}/g) || [];
  return matches.sort();
}

function extractTags(text) {
  const matches = text.match(/<\/?[a-zA-Z][^>]*\/?>/g) || [];
  return matches.sort();
}

const normalizeTag = (t) =>
  t
    .replace(/\s+/g, " ")
    .replace(/\s>/g, ">")
    .replace(/\s\/>/g, "/>");

/**
 * For malformed_tag issues, the deterministic checker stores only the corrected
 * tag(s) as suggestion (e.g. "<br/>"), NOT the full corrected string.
 * This function applies the fix by replacing malformed tags in-place.
 *
 * @param {string} currentValue - Current translation string
 * @returns {string} Fixed translation with normalized tags
 */
function fixMalformedTagsInPlace(currentValue) {
  // Find tags with extra internal whitespace and normalize them
  return currentValue.replace(/<\/?[a-zA-Z][^>]*\/?>/g, (tag) => {
    if (/\s+\/?>/.test(tag) || /<\s+/.test(tag)) {
      return normalizeTag(tag);
    }
    return tag;
  });
}

/**
 * Check if a suggestion fixes the structural (P0) issues that exist in the
 * current translation relative to the English source.
 *
 * Returns { valid: true } if the suggestion has no remaining P0 issues,
 * or { valid: false, remaining: [...] } with descriptions of what's still broken.
 */
function validateSuggestion(englishContent, suggestion) {
  const remaining = [];

  // Check variables
  const enVars = extractVariables(englishContent);
  const sugVars = extractVariables(suggestion);

  const missingVars = enVars.filter((v) => !sugVars.includes(v));
  const extraVars = sugVars.filter((v) => !enVars.includes(v));

  if (missingVars.length > 0) {
    remaining.push(`Still missing variable(s): ${missingVars.join(", ")}`);
  }
  if (extraVars.length > 0) {
    remaining.push(`Still has extra variable(s): ${extraVars.join(", ")}`);
  }

  // Check tags
  const enTags = extractTags(englishContent).map(normalizeTag);
  const sugTagsRaw = extractTags(suggestion);
  const sugTags = sugTagsRaw.map(normalizeTag);

  const missingTags = enTags.filter((t) => !sugTags.includes(t));
  const extraTags = sugTags.filter((t) => !enTags.includes(t));

  if (missingTags.length > 0) {
    remaining.push(`Still missing tag(s): ${missingTags.join(", ")}`);
  }
  if (extraTags.length > 0) {
    remaining.push(`Still has extra tag(s): ${extraTags.join(", ")}`);
  }

  // Check malformed tags
  const malformedTags = sugTagsRaw.filter(
    (t) => /\s+\/?>/.test(t) || /<\s+/.test(t),
  );
  if (malformedTags.length > 0) {
    remaining.push(
      `Still has malformed tag(s): ${malformedTags.join(", ")}`,
    );
  }

  return remaining.length === 0
    ? { valid: true }
    : { valid: false, remaining };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Apply Spell Check Fixes ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "APPLY"}`);
  console.log(`Active issue types: ${[...ACTIVE_TYPES].join(", ")}`);
  if (FILTER_LANGUAGES) {
    console.log(`Filter languages: ${[...FILTER_LANGUAGES].join(", ")}`);
  }
  if (FILTER_PROJECTS) {
    console.log(`Filter projects: ${[...FILTER_PROJECTS].join(", ")}`);
  }
  console.log();

  const stats = {
    scannedMeta: 0,
    fixesCollected: 0,
    fixesApplied: 0,
    fixesSkippedNoSuggestion: 0,
    fixesSkippedSameValue: 0,
    fixesSkippedValidationFailed: 0,
    fixesSkippedKeyMissing: 0,
    translationFilesUpdated: 0,
    metaFilesUpdated: 0,
    errors: 0,
  };

  // Phase 1: Collect all fixes grouped by translation file path
  // Structure: { [translationFilePath]: { [key]: { suggestion, metaFile, lang, issues } } }
  const fixesByFile = {};
  // Track which .meta files need updating and what to clear
  // Structure: { [metaFilePath]: { [lang]: issueTypesToRemove[] } }
  const metaUpdates = {};
  // Log of all fixes for the report
  const fixLog = [];

  const projects = FILTER_PROJECTS
    ? Object.entries(projectLocalesMap).filter(([name]) =>
        FILTER_PROJECTS.has(name),
      )
    : Object.entries(projectLocalesMap);

  for (const [project, localesRelPath] of projects) {
    const projectPath = path.join(appRootPath, localesRelPath);
    const metaPattern = path
      .join(projectPath, ".meta", "**", "*.json")
      .replace(/\\/g, "/");
    const metaFiles = glob.sync(metaPattern);

    console.log(`[${project}] Scanning ${metaFiles.length} meta files...`);

    for (const metaFile of metaFiles) {
      stats.scannedMeta++;
      let metadata;

      try {
        metadata = await fs.readJson(metaFile);
      } catch (err) {
        console.error(`  Error reading ${metaFile}: ${err.message}`);
        stats.errors++;
        continue;
      }

      const key = metadata.key_path;
      if (!key) continue;

      const metaPathParts = metaFile.split(path.sep);
      const namespace = metaPathParts[metaPathParts.length - 2];

      if (!metadata.languages) continue;

      // Get English content for validation
      const enTranslationFile = path.join(
        projectPath,
        "en",
        `${namespace}.json`,
      );
      let enTranslations = null;

      for (const [lang, langData] of Object.entries(metadata.languages)) {
        if (lang === "en") continue;
        if (FILTER_LANGUAGES && !FILTER_LANGUAGES.has(lang)) continue;

        const issues = langData.ai_spell_check_issues || [];
        if (issues.length === 0) continue;

        // Find issues matching our active types that have suggestions
        const matchingIssues = issues.filter(
          (i) => ACTIVE_TYPES.has(i.type) && i.suggestion && i.suggestion.trim(),
        );

        if (matchingIssues.length === 0) {
          // Count issues without suggestions
          const noSuggestion = issues.filter(
            (i) => ACTIVE_TYPES.has(i.type) && (!i.suggestion || !i.suggestion.trim()),
          );
          stats.fixesSkippedNoSuggestion += noSuggestion.length;
          continue;
        }

        // For wrong_language: skip keys that should stay in their native/English form
        const hasWrongLang = matchingIssues.some(
          (i) => i.type === "wrong_language",
        );

        if (hasWrongLang) {
          // Skip Culture_* keys — language display names must stay in native language
          if (key.startsWith("Culture_")) {
            stats.fixesSkippedValidationFailed++;
            continue;
          }

          // Lazy-load English translations to compare
          if (enTranslations === null) {
            try {
              enTranslations = await fs.readJson(enTranslationFile);
            } catch {
              enTranslations = {};
            }
          }

          // Read current translation to check if it's identical to English
          const translationFile = path.join(
            projectPath,
            lang,
            `${namespace}.json`,
          );
          let currentTranslations;
          try {
            currentTranslations = await fs.readJson(translationFile);
          } catch {
            currentTranslations = {};
          }

          const englishVal = enTranslations[key];
          const currentVal = currentTranslations[key];

          // Skip if current value equals English — intentionally untranslated
          if (englishVal && currentVal && englishVal === currentVal) {
            stats.fixesSkippedValidationFailed++;
            continue;
          }
        }

        // Determine the suggestion to apply
        let suggestion = matchingIssues[0].suggestion;

        // Special handling for malformed_tag: the deterministic checker stores
        // only the corrected tag(s) as suggestion, NOT the full string.
        // For these, we apply a programmatic in-place fix instead.
        const onlyMalformedTag = matchingIssues.every(
          (i) => i.type === "malformed_tag",
        );
        // Mark for in-place fix (will be resolved in Phase 2 using current value)
        const useMalformedTagFix = onlyMalformedTag;

        if (!useMalformedTagFix) {
          // For non-malformed-tag issues, validate the suggestion

          // Safety: reject suggestions that are dramatically shorter than the
          // English source (likely a fragment/tag, not a full replacement)
          if (enTranslations === null) {
            try {
              enTranslations = await fs.readJson(enTranslationFile);
            } catch {
              enTranslations = {};
            }
          }

          const englishContent = enTranslations[key];

          if (englishContent && suggestion.length < englishContent.length * 0.3
              && englishContent.length > 20) {
            stats.fixesSkippedValidationFailed++;
            continue;
          }

          // For P0 types, validate the suggestion fixes structural issues
          const hasP0Issues = matchingIssues.some((i) =>
            P0_TYPES.includes(i.type),
          );

          if (hasP0Issues && englishContent) {
            const validation = validateSuggestion(englishContent, suggestion);
            if (!validation.valid) {
              stats.fixesSkippedValidationFailed++;
              continue;
            }
          }
        }

        // Build the translation file path
        const translationFile = path.join(
          projectPath,
          lang,
          `${namespace}.json`,
        );

        // Collect the fix
        if (!fixesByFile[translationFile]) {
          fixesByFile[translationFile] = {};
        }

        fixesByFile[translationFile][key] = useMalformedTagFix
          ? { __malformedTagFix: true }
          : suggestion;

        // Track .meta update
        if (!metaUpdates[metaFile]) {
          metaUpdates[metaFile] = {};
        }
        if (!metaUpdates[metaFile][lang]) {
          metaUpdates[metaFile][lang] = new Set();
        }
        for (const issue of matchingIssues) {
          metaUpdates[metaFile][lang].add(issue.type);
        }

        stats.fixesCollected++;

        const logSuggestion = useMalformedTagFix
          ? "[in-place tag normalization]"
          : suggestion.length > 80
            ? suggestion.substring(0, 77) + "..."
            : suggestion;

        fixLog.push({
          project,
          namespace,
          key,
          lang,
          types: matchingIssues.map((i) => i.type).join(", "),
          suggestion: logSuggestion,
        });
      }
    }
  }

  console.log(`\nPhase 1 complete: ${stats.fixesCollected} fixes collected.`);
  console.log(
    `  Skipped (no suggestion): ${stats.fixesSkippedNoSuggestion}`,
  );
  console.log(
    `  Skipped (validation failed): ${stats.fixesSkippedValidationFailed}`,
  );

  if (stats.fixesCollected === 0) {
    console.log("\nNo fixes to apply. Exiting.");
    return;
  }

  // Phase 2: Apply fixes to translation files
  console.log(`\nPhase 2: Applying fixes to translation files...`);

  for (const [translationFile, fixes] of Object.entries(fixesByFile)) {
    if (!(await fs.pathExists(translationFile))) {
      console.warn(`  File not found: ${translationFile}`);
      stats.errors++;
      continue;
    }

    let translations;
    try {
      translations = await fs.readJson(translationFile);
    } catch (err) {
      console.error(
        `  Error reading ${translationFile}: ${err.message}`,
      );
      stats.errors++;
      continue;
    }

    let fileModified = false;
    const keyCount = Object.keys(fixes).length;

    for (const [key, fixValue] of Object.entries(fixes)) {
      if (translations[key] === undefined) {
        stats.fixesSkippedKeyMissing++;
        continue;
      }

      let newValue;
      if (fixValue && fixValue.__malformedTagFix) {
        // In-place malformed tag normalization
        newValue = fixMalformedTagsInPlace(translations[key]);
      } else {
        newValue = fixValue;
      }

      if (translations[key] === newValue) {
        stats.fixesSkippedSameValue++;
        continue;
      }

      if (!DRY_RUN) {
        translations[key] = newValue;
      }

      stats.fixesApplied++;
      fileModified = true;
    }

    if (fileModified && !DRY_RUN) {
      try {
        await writeJsonWithConsistentEol(translationFile, translations);
        stats.translationFilesUpdated++;
      } catch (err) {
        console.error(
          `  Error writing ${translationFile}: ${err.message}`,
        );
        stats.errors++;
      }
    } else if (fileModified) {
      stats.translationFilesUpdated++;
    }

    // Progress output every 100 files
    if (stats.translationFilesUpdated % 100 === 0 && stats.translationFilesUpdated > 0) {
      console.log(
        `  Progress: ${stats.translationFilesUpdated} files, ${stats.fixesApplied} fixes applied...`,
      );
    }
  }

  // Phase 3: Update .meta files (remove applied fix issues)
  console.log(`\nPhase 3: Updating .meta files...`);

  for (const [metaFile, langUpdates] of Object.entries(metaUpdates)) {
    if (DRY_RUN) {
      stats.metaFilesUpdated++;
      continue;
    }

    try {
      const metadata = await fs.readJson(metaFile);
      let modified = false;

      for (const [lang, typesToRemove] of Object.entries(langUpdates)) {
        if (!metadata.languages?.[lang]) continue;

        const issues =
          metadata.languages[lang].ai_spell_check_issues || [];
        const remaining = issues.filter((i) => !typesToRemove.has(i.type));

        if (remaining.length !== issues.length) {
          metadata.languages[lang].ai_spell_check_issues = remaining;
          modified = true;
        }
      }

      if (modified) {
        metadata.updated_at = new Date().toISOString();
        await writeJsonWithConsistentEol(metaFile, metadata);
        stats.metaFilesUpdated++;
      }
    } catch (err) {
      console.error(`  Error updating ${metaFile}: ${err.message}`);
      stats.errors++;
    }
  }

  // ─── Report ───────────────────────────────────────────────────────────────

  console.log("\n=== Results ===");
  console.log(`Scanned .meta files: ${stats.scannedMeta}`);
  console.log(`Fixes collected: ${stats.fixesCollected}`);
  console.log(`Fixes applied: ${stats.fixesApplied}`);
  console.log(`Translation files updated: ${stats.translationFilesUpdated}`);
  console.log(`.meta files updated: ${stats.metaFilesUpdated}`);
  console.log(`Skipped (no suggestion): ${stats.fixesSkippedNoSuggestion}`);
  console.log(`Skipped (same value): ${stats.fixesSkippedSameValue}`);
  console.log(
    `Skipped (validation failed): ${stats.fixesSkippedValidationFailed}`,
  );
  console.log(`Skipped (key missing): ${stats.fixesSkippedKeyMissing}`);
  console.log(`Errors: ${stats.errors}`);

  if (DRY_RUN) {
    console.log("\n[DRY RUN - no files were modified]");
  }

  // Write detailed fix log
  const logFile = path.join(
    appRootPath,
    "..",
    `spell-check-fixes-log-${new Date().toISOString().replace(/[:.]/g, "-")}.tsv`,
  );

  const tsvHeader =
    "Project\tNamespace\tKey\tLanguage\tIssue Types\tSuggestion";
  const tsvLines = fixLog.map(
    (f) =>
      `${f.project}\t${f.namespace}\t${f.key}\t${f.lang}\t${f.types}\t${f.suggestion}`,
  );

  await fs.writeFile(logFile, [tsvHeader, ...tsvLines].join("\n"), "utf8");
  console.log(`\nDetailed log written to: ${logFile}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
