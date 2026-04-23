// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

/**
 * Translation Statistics Script — all packages
 *
 * Usage:
 *   node common/scripts/translation-stats.js [options]
 *
 * Options:
 *   --sort=lang|keys|pct|size   Sort languages table (default: lang)
 *   --desc                      Sort descending
 *   --lang=fr,ru,de             Show only specific languages
 *   --package=client,login      Show only specific packages
 *   --by-package                Show per-package breakdown instead of summary
 *   --json                      Output raw JSON
 *   --no-meta                   Skip metadata analysis (faster)
 */

const { readdir, readFile, stat } = require("fs/promises");
const path = require("path");

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT_DIR = path.resolve(__dirname, "../../");
const REFERENCE_LANG = "en";

// All packages that have public/locales (mirrors moduleWorkspaces in files.js)
const PACKAGES = [
  { name: "common", localesDir: path.join(ROOT_DIR, "public/locales") },
  { name: "client", localesDir: path.join(ROOT_DIR, "packages/client/public/locales") },
  { name: "doceditor", localesDir: path.join(ROOT_DIR, "packages/doceditor/public/locales") },
  { name: "login", localesDir: path.join(ROOT_DIR, "packages/login/public/locales") },
  { name: "management", localesDir: path.join(ROOT_DIR, "packages/management/public/locales") },
];

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const sortBy = getArg("sort") || "lang";
const sortDesc = hasFlag("desc");
const filterLangs = getArg("lang") ? getArg("lang").split(",").map((s) => s.trim()) : null;
const filterPkgs = getArg("package") ? getArg("package").split(",").map((s) => s.trim()) : null;
const byPackage = hasFlag("by-package");
const jsonOutput = hasFlag("json");
const skipMeta = hasFlag("no-meta");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function pct(n, total) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function bar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function colorize(text, color) {
  if (jsonOutput || !process.stdout.isTTY) return text;
  const codes = { red: 31, yellow: 33, green: 32, cyan: 36, blue: 34, bold: 1, dim: 2 };
  return `\x1b[${codes[color]}m${text}\x1b[0m`;
}

function pctColor(p) {
  if (p >= 95) return "green";
  if (p >= 75) return "yellow";
  return "red";
}

function padStart(str, len) { return String(str).padStart(len); }
function padEnd(str, len) { return String(str).padEnd(len); }

// ─── Core data loading ────────────────────────────────────────────────────────

/** Returns { namespace → { key → value } } for a given language in a localesDir */
async function loadLangData(localesDir, lang) {
  const langDir = path.join(localesDir, lang);
  let files;
  try {
    files = (await readdir(langDir)).filter((f) => f.endsWith(".json"));
  } catch {
    return {};
  }

  const result = {};
  await Promise.all(
    files.map(async (f) => {
      try {
        const raw = await readFile(path.join(langDir, f), "utf8");
        result[f.replace(".json", "")] = JSON.parse(raw);
      } catch {
        // skip malformed
      }
    })
  );
  return result;
}

/** Returns total file size in bytes for a language directory */
async function langDirSize(localesDir, lang) {
  const langDir = path.join(localesDir, lang);
  let files;
  try {
    files = (await readdir(langDir)).filter((f) => f.endsWith(".json"));
  } catch {
    return 0;
  }
  const sizes = await Promise.all(
    files.map(async (f) => {
      try {
        const s = await stat(path.join(langDir, f));
        return s.size;
      } catch {
        return 0;
      }
    })
  );
  return sizes.reduce((a, b) => a + b, 0);
}

/** Load .meta spell-check issues per language for a localesDir (if present) */
async function loadMetaIssues(localesDir) {
  // .meta lives inside the localesDir
  const metaDir = path.join(localesDir, ".meta");
  const result = {}; // lang → spellIssueCount

  let namespaceDirs;
  try {
    namespaceDirs = (await readdir(metaDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return result;
  }

  await Promise.all(
    namespaceDirs.map(async (ns) => {
      const nsDir = path.join(metaDir, ns);
      let metaFiles;
      try {
        metaFiles = (await readdir(nsDir)).filter((f) => f.endsWith(".json"));
      } catch {
        return;
      }
      await Promise.all(
        metaFiles.map(async (f) => {
          try {
            const raw = await readFile(path.join(nsDir, f), "utf8");
            const meta = JSON.parse(raw);
            for (const [lang, lm] of Object.entries(meta.languages || {})) {
              if (!lm) continue;
              if (Array.isArray(lm.ai_spell_check_issues) && lm.ai_spell_check_issues.length > 0) {
                result[lang] = (result[lang] || 0) + 1;
              }
            }
          } catch {
            // skip
          }
        })
      );
    })
  );

  return result;
}

// ─── Package analysis ─────────────────────────────────────────────────────────

async function analyzePackage(pkg) {
  const { name, localesDir } = pkg;

  // List language directories
  let allLangs;
  try {
    const entries = await readdir(localesDir, { withFileTypes: true });
    allLangs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name)
      .sort();
  } catch {
    return null; // package locales dir doesn't exist
  }

  // Load reference (English)
  const refData = await loadLangData(localesDir, REFERENCE_LANG);
  const namespaces = Object.keys(refData);

  // Total keys across all namespaces in English
  const totalKeys = namespaces.reduce((s, ns) => s + Object.keys(refData[ns] || {}).length, 0);

  // Load metadata if requested
  const metaIssues = skipMeta ? {} : await loadMetaIssues(localesDir);

  // Per-language stats
  const langStats = await Promise.all(
    allLangs.map(async (lang) => {
      const langData = await loadLangData(localesDir, lang);
      const fileSizeBytes = await langDirSize(localesDir, lang);

      let translatedKeys = 0;
      let sameAsEn = 0;
      let missingKeys = 0;

      for (const ns of namespaces) {
        const refNs = refData[ns] || {};
        const langNs = langData[ns] || {};
        for (const key of Object.keys(refNs)) {
          if (!(key in langNs)) {
            missingKeys++;
          } else {
            // Key is present = translated (matches translation system logic in ollama.js)
            translatedKeys++;
            if (lang !== REFERENCE_LANG && langNs[key] === refNs[key]) {
              sameAsEn++;
            }
          }
        }
      }

      return {
        lang,
        translatedKeys,
        sameAsEn,
        missingKeys,
        translatedPct: pct(translatedKeys, totalKeys),
        fileSizeBytes,
        spellIssues: metaIssues[lang] || 0,
      };
    })
  );

  return {
    name,
    localesDir,
    namespaces: namespaces.length,
    totalKeys,
    langs: allLangs,
    langStats,
  };
}

// ─── Table rendering ──────────────────────────────────────────────────────────

function renderTable(rows, totalKeys, { title, skipSpell = false } = {}) {
  const hasSpell = !skipSpell && !skipMeta && rows.some((r) => r.spellIssues > 0);

  const COL_LANG = 14;
  const COL_KEYS = 8;
  const COL_PCT = 6;
  const COL_BAR = 22;
  const COL_SAME = 6;
  const COL_MISS = 6;
  const COL_SIZE = 9;
  const COL_SPELL = 7;

  const totalWidth =
    COL_LANG + COL_KEYS + COL_PCT + COL_BAR + COL_SAME + COL_MISS + COL_SIZE +
    (hasSpell ? COL_SPELL + 2 : 0) + 12;

  if (title) {
    console.log(`\n  ${colorize(title, "blue")}`);
  }

  const headerCols = [
    colorize(padEnd("Language", COL_LANG), "bold"),
    colorize(padStart("Keys", COL_KEYS), "bold"),
    colorize(padStart("Pct", COL_PCT), "bold"),
    colorize(padEnd("", COL_BAR), "bold"),
    colorize(padStart("Same", COL_SAME), "bold"),
    colorize(padStart("Miss", COL_MISS), "bold"),
    colorize(padStart("Size", COL_SIZE), "bold"),
  ];
  if (hasSpell) headerCols.push(colorize(padStart("Issues", COL_SPELL), "bold"));

  const sep = colorize("─".repeat(totalWidth), "dim");
  console.log("  " + headerCols.join("  "));
  console.log("  " + sep);

  for (const r of rows) {
    const isRef = r.lang === REFERENCE_LANG;
    const langStr = isRef
      ? colorize(padEnd(r.lang + " ★", COL_LANG), "cyan")
      : padEnd(r.lang, COL_LANG);
    const keysStr = padStart(r.translatedKeys + "/" + totalKeys, COL_KEYS);
    const pctStr = colorize(padStart(r.translatedPct + "%", COL_PCT), pctColor(r.translatedPct));
    const barStr = colorize(bar(r.translatedPct), pctColor(r.translatedPct));
    const sameStr = isRef ? padStart("-", COL_SAME) : padStart(String(r.sameAsEn), COL_SAME);
    const missStr = r.missingKeys > 0
      ? colorize(padStart(String(r.missingKeys), COL_MISS), "red")
      : padStart("0", COL_MISS);
    const sizeStr = padStart(formatBytes(r.fileSizeBytes), COL_SIZE);

    const cols = [langStr, keysStr, pctStr, barStr, sameStr, missStr, sizeStr];
    if (hasSpell) {
      cols.push(
        r.spellIssues > 0
          ? colorize(padStart(String(r.spellIssues), COL_SPELL), "yellow")
          : padStart("0", COL_SPELL)
      );
    }

    console.log("  " + cols.join("  "));
  }

  console.log("  " + sep);
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

function sortRows(rows) {
  const fns = {
    lang: (a, b) => a.lang.localeCompare(b.lang),
    keys: (a, b) => a.translatedKeys - b.translatedKeys,
    pct: (a, b) => a.translatedPct - b.translatedPct,
    size: (a, b) => a.fileSizeBytes - b.fileSizeBytes,
  };
  const fn = fns[sortBy] || fns.lang;
  return [...rows].sort((a, b) => (sortDesc ? -fn(a, b) : fn(a, b)));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Filter packages
  let packages = filterPkgs
    ? PACKAGES.filter((p) => filterPkgs.includes(p.name))
    : PACKAGES;

  if (packages.length === 0) {
    console.error(`No matching packages: ${filterPkgs.join(", ")}`);
    console.error(`Available: ${PACKAGES.map((p) => p.name).join(", ")}`);
    process.exit(1);
  }

  // Analyze all packages
  const results = (await Promise.all(packages.map(analyzePackage))).filter(Boolean);

  if (results.length === 0) {
    console.error("No locales directories found.");
    process.exit(1);
  }

  // All languages union
  const allLangs = [...new Set(results.flatMap((r) => r.langs))].sort();
  const filteredLangs = filterLangs ? allLangs.filter((l) => filterLangs.includes(l)) : allLangs;

  const grandTotalKeys = results.reduce((s, r) => s + r.totalKeys, 0);
  const grandTotalSize = results.reduce(
    (s, r) => s + r.langStats.reduce((ss, ls) => ss + ls.fileSizeBytes, 0),
    0
  );
  const grandNamespaces = results.reduce((s, r) => s + r.namespaces, 0);

  // ─── JSON output ───────────────────────────────────────────────────────────
  if (jsonOutput) {
    // Aggregate per language across all packages
    const langAgg = {};
    for (const lang of filteredLangs) {
      langAgg[lang] = { lang, translatedKeys: 0, sameAsEn: 0, missingKeys: 0, fileSizeBytes: 0, spellIssues: 0 };
      for (const pkg of results) {
        const ls = pkg.langStats.find((s) => s.lang === lang);
        if (!ls) continue;
        langAgg[lang].translatedKeys += ls.translatedKeys;
        langAgg[lang].sameAsEn += ls.sameAsEn;
        langAgg[lang].missingKeys += ls.missingKeys;
        langAgg[lang].fileSizeBytes += ls.fileSizeBytes;
        langAgg[lang].spellIssues += ls.spellIssues;
      }
      langAgg[lang].translatedPct = pct(langAgg[lang].translatedKeys, grandTotalKeys);
    }

    console.log(JSON.stringify({
      summary: {
        packages: results.length,
        namespaces: grandNamespaces,
        languages: filteredLangs.length,
        totalKeys: grandTotalKeys,
        totalSize: formatBytes(grandTotalSize),
        totalSizeBytes: grandTotalSize,
      },
      packages: results.map((r) => ({
        name: r.name,
        namespaces: r.namespaces,
        totalKeys: r.totalKeys,
        languages: r.langStats,
      })),
      languages: Object.values(langAgg),
    }, null, 2));
    return;
  }

  // ─── Pretty output ─────────────────────────────────────────────────────────

  // Package summary table
  console.log("");
  console.log(colorize("  TRANSLATION STATISTICS", "bold"));
  console.log(colorize("  " + "─".repeat(70), "dim"));

  // Per-package overview
  const pkgColName = 12;
  const pkgColNs = 11;
  const pkgColKeys = 7;
  const pkgColLangs = 7;
  const pkgColSize = 10;
  console.log(
    "  " + [
      colorize(padEnd("Package", pkgColName), "bold"),
      colorize(padStart("Namespaces", pkgColNs), "bold"),
      colorize(padStart("Keys", pkgColKeys), "bold"),
      colorize(padStart("Langs", pkgColLangs), "bold"),
      colorize(padStart("Total size", pkgColSize), "bold"),
    ].join("  ")
  );
  console.log("  " + colorize("─".repeat(pkgColName + pkgColNs + pkgColKeys + pkgColLangs + pkgColSize + 8), "dim"));
  for (const r of results) {
    const pkgSize = r.langStats.reduce((s, ls) => s + ls.fileSizeBytes, 0);
    console.log(
      "  " + [
        colorize(padEnd(r.name, pkgColName), "cyan"),
        padStart(r.namespaces, pkgColNs),
        padStart(r.totalKeys, pkgColKeys),
        padStart(r.langs.length, pkgColLangs),
        padStart(formatBytes(pkgSize), pkgColSize),
      ].join("  ")
    );
  }
  console.log("  " + colorize("─".repeat(pkgColName + pkgColNs + pkgColKeys + pkgColLangs + pkgColSize + 8), "dim"));
  console.log(
    "  " + [
      colorize(padEnd("TOTAL", pkgColName), "bold"),
      padStart(grandNamespaces, pkgColNs),
      padStart(grandTotalKeys, pkgColKeys),
      padStart(filteredLangs.length, pkgColLangs),
      colorize(padStart(formatBytes(grandTotalSize), pkgColSize), "bold"),
    ].join("  ")
  );

  // ─── By-package mode ──────────────────────────────────────────────────────
  if (byPackage) {
    for (const pkg of results) {
      let rows = pkg.langStats.filter((r) => !filterLangs || filterLangs.includes(r.lang));
      rows = sortRows(rows);

      const avgPct = Math.round(rows.reduce((s, r) => s + r.translatedPct, 0) / rows.length);
      const full = rows.filter((r) => r.translatedPct === 100).length;

      renderTable(rows, pkg.totalKeys, {
        title: `Package: ${pkg.name}  (${pkg.namespaces} namespaces, ${pkg.totalKeys} keys, avg ${avgPct}%, ${full}/${rows.length} fully translated)`,
      });
    }

    printLegend(false);
    return;
  }

  // ─── Aggregate per language across all packages ────────────────────────────
  console.log("");

  const aggRows = filteredLangs.map((lang) => {
    const agg = { lang, translatedKeys: 0, sameAsEn: 0, missingKeys: 0, fileSizeBytes: 0, spellIssues: 0 };
    for (const pkg of results) {
      const ls = pkg.langStats.find((s) => s.lang === lang);
      if (!ls) continue;
      agg.translatedKeys += ls.translatedKeys;
      agg.sameAsEn += ls.sameAsEn;
      agg.missingKeys += ls.missingKeys;
      agg.fileSizeBytes += ls.fileSizeBytes;
      agg.spellIssues += ls.spellIssues;
    }
    agg.translatedPct = pct(agg.translatedKeys, grandTotalKeys);
    return agg;
  });

  const sortedAgg = sortRows(aggRows);

  const avgPct = Math.round(aggRows.reduce((s, r) => s + r.translatedPct, 0) / aggRows.length);
  const fullyTranslated = aggRows.filter((r) => r.translatedPct === 100).length;

  console.log(`  Reference language : ${colorize(REFERENCE_LANG, "cyan")}`);
  console.log(`  Fully translated   : ${colorize(String(fullyTranslated), "bold")} / ${filteredLangs.length}`);
  console.log(`  Average coverage   : ${colorize(String(avgPct) + "%", pctColor(avgPct))}`);

  renderTable(sortedAgg, grandTotalKeys, { title: "All packages — aggregated by language" });

  printLegend(true);
}

function printLegend(showByPackage) {
  console.log("");
  console.log(colorize("  Columns:", "dim"));
  console.log(colorize("    Keys   — keys present in the language file / total (matches translation system logic)", "dim"));
  console.log(colorize("    Pct    — translation coverage %", "dim"));
  console.log(colorize("    Same   — keys with identical value to English (possibly untranslated)", "dim"));
  console.log(colorize("    Miss   — keys missing from this language file", "dim"));
  console.log(colorize("    Size   — combined file size for this language across shown packages", "dim"));
  if (!skipMeta) {
    console.log(colorize("    Issues — keys with AI spell-check issues in metadata", "dim"));
  }
  console.log("");
  console.log(colorize("  Options:", "dim"));
  console.log(colorize("    --sort=lang|keys|pct|size   --desc", "dim"));
  console.log(colorize("    --lang=fr,ru,de", "dim"));
  console.log(colorize("    --package=common,client,login,doceditor,management", "dim"));
  if (showByPackage) {
    console.log(colorize("    --by-package                show per-package tables", "dim"));
  }
  console.log(colorize("    --json                      machine-readable output", "dim"));
  console.log(colorize("    --no-meta                   skip metadata (faster)", "dim"));
  console.log("");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
