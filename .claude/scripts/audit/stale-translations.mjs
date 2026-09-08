#!/usr/bin/env node
/**
 * Find locale keys whose English value was reworded while one or more
 * translations were left at the old wording.
 *
 * Nothing in the test suite catches this. WrongTranslationVariablesTest and
 * WrongTranslationTagsTest compare only the COUNT of {{variables}} and <1>tags</1>,
 * so an edit that changes words but not structure passes every gate. The only
 * signal the repo has is the stale `content_en_sha1_hash` in .meta, and that is
 * a hint for the translation pipeline, not a check — and it is erased the next
 * time `generate-metadata` runs.
 *
 * Usage (from the repo root):
 *   node .claude/scripts/audit/stale-translations.mjs
 *   node .claude/scripts/audit/stale-translations.mjs --since release/v4.0.0
 *   node .claude/scripts/audit/stale-translations.mjs --author svetlana
 *   node .claude/scripts/audit/stale-translations.mjs --all --json
 *
 *   --since <rev>     start of the range (default: merge-base with the base branch)
 *   --until <rev>     end of the range and the state staleness is judged against
 *                     (default: HEAD)
 *   --author <substr> only count keys reworded by commits from a matching author
 *   --all             also list cosmetic changes (case-only, punctuation-only)
 *   --json            machine-readable output
 *
 * Exit code 1 when there is at least one substantive finding.
 */

import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i === -1 || i === args.length - 1 ? d : args[i + 1];
};

const showAll = has("--all");
const asJson = has("--json");
const authorFilter = val("--author", null);
const until = val("--until", "HEAD");

// stderr is silenced on purpose: missing blobs and parentless commits are
// normal here, and git writes "fatal: ..." for them. Leaking that corrupts
// --json output for anyone redirecting with 2>&1.
const sh = (c) =>
  execSync(c, { encoding: "utf8", maxBuffer: 5e8, stdio: ["ignore", "pipe", "ignore"] });
const shq = (c) => {
  try { return sh(c); } catch { return ""; }
};

/** Resolve the start of the range the same way the review tooling does. */
const resolveSince = () => {
  const explicit = val("--since", null);
  if (explicit) return sh(`git merge-base ${explicit} ${until}`).trim();

  const branch = sh("git rev-parse --abbrev-ref HEAD").trim();
  const configured = shq(`git config branch.${branch}.reviewBase`).trim();
  const candidates = [configured, "release/v4.0.0", "origin/master", "master"].filter(Boolean);
  for (const base of candidates) {
    const merged = shq(`git merge-base ${base} ${until}`).trim();
    if (merged) return merged;
  }
  throw new Error("cannot resolve a base revision — pass --since <rev>");
};

const since = resolveSince();

/* ------------------------------------------------------------------ */
/* reading blobs (cached — an uncached version is far too slow to use) */
/* ------------------------------------------------------------------ */

const blobs = new Map();
const readJson = (rev, path) => {
  const id = `${rev}:${path}`;
  if (blobs.has(id)) return blobs.get(id);
  let parsed = null;
  try { parsed = JSON.parse(sh(`git show ${rev}:${JSON.stringify(path)}`)); } catch { /* absent */ }
  blobs.set(id, parsed);
  return parsed;
};

const isEnLocale = (p) => /(^|\/)locales\/en\/[^/]+\.json$/.test(p);
const rootOf = (p) => p.replace(/\/en\/[^/]+\.json$/, "");
const nsOf = (p) => p.match(/\/([^/]+)\.json$/)[1];

const langsCache = new Map();
const languagesIn = (root) => {
  if (langsCache.has(root)) return langsCache.get(root);
  const list = shq(`git ls-tree --name-only ${until} ${JSON.stringify(root)}/`)
    .split("\n").filter(Boolean)
    .map((p) => p.split("/").pop())
    .filter((l) => l && l !== "en" && !l.startsWith("."));
  langsCache.set(root, list);
  return list;
};

/* ------------------------------------------------------------------ */
/* which keys were reworded in the range                               */
/* ------------------------------------------------------------------ */

const commits = sh(`git log --format=%H%x09%an ${since}..${until}`)
  .split("\n").filter(Boolean)
  .map((l) => { const [hash, author] = l.split("\t"); return { hash, author }; })
  .filter((c) => !authorFilter || c.author.toLowerCase().includes(authorFilter.toLowerCase()));

/** file -> Set(key) reworded by the selected commits */
const reworded = new Map();
const added = new Map();
const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
for (const { hash } of commits) {
  // A root commit has no parent to diff against; compare with the empty tree
  // so its keys still count.
  const parent = shq(`git rev-parse --verify --quiet ${hash}^`).trim() || EMPTY_TREE;
  const touched = shq(`git diff --name-only ${parent} ${hash}`).split("\n").filter(isEnLocale);
  for (const file of touched) {
    const before = readJson(parent, file) ?? {};
    const after = readJson(hash, file) ?? {};
    for (const key of Object.keys(after)) {
      if (key in before) {
        if (before[key] !== after[key]) {
          if (!reworded.has(file)) reworded.set(file, new Set());
          reworded.get(file).add(key);
        }
      } else {
        if (!added.has(file)) added.set(file, new Set());
        added.get(file).add(key);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* classify and collect                                                */
/* ------------------------------------------------------------------ */

const normalise = (s) =>
  s.toLowerCase().replace(/[.,;:!?'"«»()\-–—]/g, "").replace(/\s+/g, " ").trim();
// Sentence terminators are script-specific: CJK ends with a full-width stop and
// Armenian with a colon (the files use ASCII ":"). Treating only ".!?" as an
// ending reported ja-JP, zh-CN and hy-AM as drifting on every single key.
const endsSentence = (s, lang) =>
  lang === "hy-AM" ? /[.!?:\u0589]$/u.test(s) : /[.!?\u3002\uFF01\uFF1F]$/u.test(s);

// Whether a sentence takes a terminator at all is a property of the script, not
// of the English source: these end a statement their own way regardless of what
// English does, so comparing them produces noise. Same exemption list the repo
// already uses for MissingSpaceAfterSentenceTest.
const OWN_PUNCTUATION = new Set(["zh-CN", "ja-JP", "ko-KR", "lo-LA", "si", "ar-SA"]);

const findings = { substantive: [], case: [], punct: [] };
const periodDrift = [];
const dashRegressions = [];
const untranslatedNew = [];

for (const [file, keys] of reworded) {
  const root = rootOf(file);
  const ns = nsOf(file);
  const before = readJson(since, file) ?? {};
  const after = readJson(until, file) ?? {};
  const languages = languagesIn(root);

  for (const key of keys) {
    // The range may have reverted or superseded the edit; judge against `until`.
    if (!(key in before) || !(key in after) || before[key] === after[key]) continue;

    const stale = [];
    const periodOff = [];
    for (const lang of languages) {
      const path = `${root}/${lang}/${ns}.json`;
      const wasFile = readJson(since, path);
      const nowFile = readJson(until, path);
      if (!nowFile || !(key in nowFile)) continue; // absent there — a coverage gap, not this check
      if (wasFile && key in wasFile && wasFile[key] === nowFile[key]) stale.push(lang);
      if (
        !OWN_PUNCTUATION.has(lang) &&
        endsSentence(nowFile[key], lang) !== endsSentence(after[key], "en")
      ) periodOff.push(lang);
    }

    if (endsSentence(before[key], "en") !== endsSentence(after[key], "en") && periodOff.length) {
      periodDrift.push({
        id: `${ns}:${key}`,
        direction: endsSentence(after[key], "en") ? "gained a final period" : "lost a final period",
        languages: periodOff,
        total: languages.length,
      });
    }

    if (/\s-\s/.test(after[key]) && !/\s-\s/.test(before[key])) {
      dashRegressions.push({ id: `${ns}:${key}`, value: after[key] });
    }

    if (!stale.length) continue;
    const record = {
      id: `${ns}:${key}`,
      file,
      from: before[key],
      to: after[key],
      stale: stale.length,
      total: languages.length,
      languages: stale,
    };
    if (before[key].toLowerCase() === after[key].toLowerCase()) findings.case.push(record);
    else if (normalise(before[key]) === normalise(after[key])) findings.punct.push(record);
    else findings.substantive.push(record);
  }
}

for (const [file, keys] of added) {
  const root = rootOf(file);
  const ns = nsOf(file);
  const after = readJson(until, file) ?? {};
  const languages = languagesIn(root);
  for (const key of keys) {
    if (!(key in after)) continue;
    const missing = languages.filter((lang) => {
      const f = readJson(until, `${root}/${lang}/${ns}.json`);
      return !f || !(key in f);
    });
    if (missing.length) {
      untranslatedNew.push({ id: `${ns}:${key}`, value: after[key], missing: missing.length, total: languages.length, languages: missing });
    }
  }
}

const bySize = (a, b) => b.stale - a.stale;
findings.substantive.sort(bySize);
findings.case.sort(bySize);
findings.punct.sort(bySize);

/* ------------------------------------------------------------------ */
/* report                                                              */
/* ------------------------------------------------------------------ */

if (asJson) {
  console.log(JSON.stringify({
    since, until, author: authorFilter,
    commits: commits.length,
    findings, periodDrift, dashRegressions, untranslatedNew,
  }, null, 2));
  process.exit(findings.substantive.length ? 1 : 0);
}

const short = (s) => (s.length > 150 ? `${s.slice(0, 147)}...` : s);

console.log(`range   ${since.slice(0, 11)}..${until}`);
console.log(`commits ${commits.length}${authorFilter ? ` (author ~ "${authorFilter}")` : ""}`);
console.log(
  `reworded English keys: ${findings.substantive.length + findings.case.length + findings.punct.length} with at least one stale translation ` +
  `(${findings.substantive.length} substantive, ${findings.case.length} case-only, ${findings.punct.length} punctuation-only)`,
);

const dump = (title, list) => {
  if (!list.length) return;
  console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
  for (const r of list) {
    console.log(`\n${r.id}   stale in ${r.stale}/${r.total}`);
    console.log(`  - ${JSON.stringify(short(r.from))}`);
    console.log(`  + ${JSON.stringify(short(r.to))}`);
    if (r.stale <= 6) console.log(`  ${r.languages.join(", ")}`);
  }
};

dump("REWORDED IN ENGLISH, TRANSLATIONS UNCHANGED", findings.substantive);
if (showAll) {
  dump("CASE-ONLY (usually needs no translation change)", findings.case);
  dump("PUNCTUATION-ONLY (usually needs no translation change)", findings.punct);
}

if (periodDrift.length) {
  console.log(`\n${"=".repeat(72)}\nFINAL PERIOD: English changed, translations did not\n${"=".repeat(72)}`);
  for (const r of periodDrift.sort((a, b) => b.languages.length - a.languages.length)) {
    console.log(`  ${r.id.padEnd(46)} ${r.direction} — differs in ${r.languages.length}/${r.total}`);
  }
}

if (dashRegressions.length) {
  console.log(`\n${"=".repeat(72)}\nHYPHEN USED AS A DASH (the locale files use an em dash)\n${"=".repeat(72)}`);
  for (const r of dashRegressions) console.log(`  ${r.id}\n    ${JSON.stringify(short(r.value))}`);
}

if (untranslatedNew.length) {
  console.log(`\n${"=".repeat(72)}\nNEW ENGLISH KEYS WITH NO TRANSLATION\n${"=".repeat(72)}`);
  for (const r of untranslatedNew.sort((a, b) => b.missing - a.missing)) {
    console.log(`  ${r.id.padEnd(46)} missing in ${r.missing}/${r.total}`);
  }
}

if (!findings.substantive.length) console.log("\nNo substantive English rewording left a translation behind.");
process.exit(findings.substantive.length ? 1 : 0);
