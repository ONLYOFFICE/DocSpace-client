#!/usr/bin/env node
/**
 * Find locale keys that need a translator comment in .meta, and write the
 * comments back. The comment text itself is written by Claude (the
 * `translate-comments` skill) after reading the real call sites — this script
 * only selects keys and keeps the .meta format byte-compatible with the
 * translation-app writer.
 *
 * Usage (from the repo root):
 *   node .claude/scripts/i18n/locale-comments.mjs find
 *   node .claude/scripts/i18n/locale-comments.mjs find --key Common:Upgrade,Files:Rename
 *   node .claude/scripts/i18n/locale-comments.mjs find --model gemma
 *   node .claude/scripts/i18n/locale-comments.mjs find --all --json
 *   node .claude/scripts/i18n/locale-comments.mjs apply comments.json --model claude-opus-5-5
 *
 * find
 *   (default)         keys whose .meta or English value changed on this branch
 *                     (merge-base with the base branch .. working tree)
 *   --since <rev>     start of the branch range instead of the auto-detected base
 *   --all             every key in every .meta tree
 *   --key <list>      only these Namespace:Key entries (comma-separated)
 *   --model <substr>  select auto comments written by a matching model, for
 *                     re-review (e.g. --model gemma)
 *   --regenerate      also select keys in scope that already have an auto comment
 *   --ensure-meta     if a key in scope has no .meta file, or its .meta was made
 *                     for an older English value, run generate-metadata +
 *                     save-meta-keys-usage first (creates the file with an empty
 *                     comment / resets it), then select
 *   --json            machine-readable output
 *
 *   Without --model / --regenerate only keys with an empty comment are selected.
 *   A human comment (is_auto: false, non-empty) is selected only by --key.
 *
 * apply <file>
 *   <file> is JSON: { "Namespace:Key": "comment text", ... }
 *   --model <id>      required; stored as comment.model
 *
 * Exit code 1 from `find` when at least one key is selected.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Same roots as common/translation-app/backend/src/config/config.js
const ROOTS = [
  "public/locales",
  "packages/client/public/locales",
  "packages/doceditor/public/locales",
  "packages/login/public/locales",
  "packages/management/public/locales",
];

const MAX_COMMENT_LENGTH = 500;
const BACKEND = "common/translation-app/backend";

const args = process.argv.slice(2);
const command = args[0];
const has = (f) => args.includes(f);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i === -1 || i === args.length - 1 ? d : args[i + 1];
};

const sh = (c) =>
  execSync(c, { encoding: "utf8", maxBuffer: 5e8, stdio: ["ignore", "pipe", "ignore"] });
const shq = (c) => {
  try { return sh(c); } catch { return ""; }
};

/* ------------------------------------------------------------------ */
/* namespace -> root                                                   */
/* ------------------------------------------------------------------ */

const nsRoot = new Map();
for (const root of ROOTS) {
  const meta = join(root, ".meta");
  if (!existsSync(meta)) continue;
  for (const ns of readdirSync(meta, { withFileTypes: true })) {
    if (ns.isDirectory()) nsRoot.set(ns.name, root);
  }
  // A namespace with no .meta yet still resolves through its en file.
  const en = join(root, "en");
  if (existsSync(en)) {
    for (const f of readdirSync(en)) {
      if (f.endsWith(".json") && !nsRoot.has(f.slice(0, -5))) nsRoot.set(f.slice(0, -5), root);
    }
  }
}

const metaPath = (ns, key) => {
  const root = nsRoot.get(ns);
  return root ? join(root, ".meta", ns, `${key}.json`) : null;
};

const readJsonFile = (p) => JSON.parse(readFileSync(p, "utf8"));

const enValue = (ns, key) => {
  const root = nsRoot.get(ns);
  const p = root && join(root, "en", `${ns}.json`);
  if (!p || !existsSync(p)) return undefined;
  return readJsonFile(p)[key];
};

/* ------------------------------------------------------------------ */
/* find                                                                */
/* ------------------------------------------------------------------ */

const resolveSince = () => {
  const explicit = val("--since", null);
  if (explicit) return sh(`git merge-base ${explicit} HEAD`).trim();
  const branch = sh("git rev-parse --abbrev-ref HEAD").trim();
  const configured = shq(`git config branch.${branch}.reviewBase`).trim();
  for (const base of [configured, "release/v4.0.0", "origin/master", "master"].filter(Boolean)) {
    const merged = shq(`git merge-base ${base} HEAD`).trim();
    if (merged) return merged;
  }
  throw new Error("cannot resolve a base revision — pass --since <rev>");
};

/** Namespace:Key entries touched on the branch, including uncommitted work. */
const branchKeys = () => {
  const since = resolveSince();
  const keys = new Set();
  const changed = [
    ...sh(`git diff --name-only ${since} -- ${ROOTS.join(" ")}`).split("\n"),
    ...sh(`git ls-files --others --exclude-standard -- ${ROOTS.join(" ")}`).split("\n"),
  ].filter(Boolean);

  for (const p of changed) {
    const meta = p.match(/\/\.meta\/([^/]+)\/([^/]+)\.json$/);
    if (meta) {
      keys.add(`${meta[1]}:${meta[2]}`);
      continue;
    }
    const en = p.match(/\/en\/([^/]+)\.json$/);
    if (!en || !existsSync(p)) continue;
    const ns = en[1];
    const now = readJsonFile(p);
    let before = {};
    try { before = JSON.parse(sh(`git show ${since}:${JSON.stringify(p)}`)); } catch { /* new file */ }
    for (const [key, value] of Object.entries(now)) {
      if (before[key] !== value) keys.add(`${ns}:${key}`);
    }
  }
  return [...keys];
};

const allKeys = () => {
  const keys = [];
  for (const root of ROOTS) {
    const en = join(root, "en");
    if (!existsSync(en)) continue;
    for (const f of readdirSync(en)) {
      if (!f.endsWith(".json")) continue;
      const ns = f.slice(0, -5);
      for (const key of Object.keys(readJsonFile(join(en, f)))) keys.push(`${ns}:${key}`);
    }
  }
  return keys;
};

/** Keys whose .meta is missing or describes an older English value. */
const outdatedMeta = (scope) =>
  scope.filter((id) => {
    const [ns, key] = id.split(":");
    const english = enValue(ns, key);
    if (typeof english !== "string") return false;
    const p = metaPath(ns, key);
    return !p || !existsSync(p) || readJsonFile(p).content !== english;
  });

/** Create / refresh .meta the same way the "update metadata" VSCode task does. */
const ensureMeta = (scope) => {
  const outdated = outdatedMeta(scope);
  if (!outdated.length) return;
  console.error(`${outdated.length} key(s) need .meta (${outdated.slice(0, 5).join(", ")}${outdated.length > 5 ? ", …" : ""}) — running generate-metadata + save-meta-keys-usage`);
  const run = (c) => execSync(c, { cwd: BACKEND, stdio: ["ignore", "ignore", "inherit"] });
  if (!existsSync(join(BACKEND, "node_modules"))) run("npm install --silent");
  run("npm run --silent generate-metadata");
  run("npm run --silent save-meta-keys-usage");
  // New namespaces get their .meta directory only now.
  for (const root of ROOTS) {
    const meta = join(root, ".meta");
    if (!existsSync(meta)) continue;
    for (const ns of readdirSync(meta, { withFileTypes: true })) {
      if (ns.isDirectory()) nsRoot.set(ns.name, root);
    }
  }
};

const find = () => {
  const explicit = val("--key", null);
  const modelFilter = val("--model", null)?.toLowerCase();
  const regenerate = has("--regenerate");
  const scope = explicit
    ? explicit.split(",").map((s) => s.trim()).filter(Boolean)
    : has("--all") ? allKeys() : branchKeys();
  if (has("--ensure-meta")) ensureMeta(scope);

  const selected = [];
  const noMeta = [];

  for (const id of scope.sort()) {
    const [ns, key] = id.split(":");
    const english = enValue(ns, key);
    if (english === undefined) continue; // key removed — nothing to describe
    const p = metaPath(ns, key);
    if (!p || !existsSync(p)) {
      noMeta.push({ id, english });
      continue;
    }
    const meta = readJsonFile(p);
    const c = meta.comment || {};
    const text = c.text || "";
    let reason = null;
    if (meta.content !== english) reason = "outdated-meta";
    else if (explicit) reason = text ? "requested" : "empty";
    else if (!text) reason = "empty";
    else if (c.is_auto && modelFilter && (c.model || "").toLowerCase().includes(modelFilter)) reason = "model";
    else if (c.is_auto && regenerate) reason = "regenerate";
    if (!reason) continue;

    selected.push({
      id,
      reason,
      meta: p,
      english,
      comment: text ? { text, is_auto: !!c.is_auto, model: c.model ?? null } : null,
      usage: (meta.usage || []).map((u) => `${u.file_path.replace(/^\//, "")}:${u.line_number}`),
    });
  }

  if (has("--json")) {
    console.log(JSON.stringify({ selected, noMeta }, null, 2));
  } else {
    for (const s of selected) {
      console.log(`${s.id}  [${s.reason}]`);
      console.log(`  en:    ${JSON.stringify(s.english)}`);
      if (s.comment) console.log(`  now:   ${s.comment.text}${s.comment.is_auto ? ` (auto, ${s.comment.model})` : " (human)"}`);
      for (const u of s.usage) console.log(`  usage: ${u}`);
      if (!s.usage.length) console.log("  usage: none recorded");
    }
    if (noMeta.length) {
      console.log(`\n${noMeta.length} key(s) have no .meta file yet — rerun with --ensure-meta:`);
      for (const n of noMeta) console.log(`  ${n.id}`);
    }
    console.log(`\n${selected.length} key(s) selected, ${noMeta.length} without .meta, ${scope.length} in scope.`);
  }
  process.exit(selected.length ? 1 : 0);
};

/* ------------------------------------------------------------------ */
/* apply                                                               */
/* ------------------------------------------------------------------ */

const apply = () => {
  const file = args[1];
  const model = val("--model", null);
  if (!file || file.startsWith("--")) throw new Error("usage: apply <comments.json> --model <id>");
  if (!model) throw new Error("--model <id> is required (the exact model that wrote the comments)");

  const input = readJsonFile(file);
  const problems = [];
  const writes = [];

  for (const [id, raw] of Object.entries(input)) {
    const [ns, key] = id.split(":");
    const p = ns && key ? metaPath(ns, key) : null;
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!p || !existsSync(p)) { problems.push(`${id}: no .meta file — run find --ensure-meta`); continue; }
    if (readJsonFile(p).content !== enValue(ns, key)) { problems.push(`${id}: .meta is for an older English value — run find --ensure-meta`); continue; }
    if (!text) { problems.push(`${id}: empty comment`); continue; }
    if (/[\r\n]/.test(text)) { problems.push(`${id}: comment must be a single line`); continue; }
    if (text.length > MAX_COMMENT_LENGTH) { problems.push(`${id}: comment longer than ${MAX_COMMENT_LENGTH} chars`); continue; }
    if (/^["'`]|["'`]$/.test(text)) { problems.push(`${id}: comment is wrapped in quotes`); continue; }
    writes.push({ id, p, text });
  }

  if (problems.length) {
    console.error(problems.join("\n"));
    console.error("\nNothing written.");
    process.exit(1);
  }

  const now = new Date().toISOString();
  for (const { id, p, text } of writes) {
    const source = readFileSync(p, "utf8");
    const meta = JSON.parse(source);
    meta.comment = { text, is_auto: true, updated_at: now, model };
    meta.updated_at = now;
    // translation-app writes JSON.stringify(…, null, 2) with no trailing newline;
    // keep whatever ending the file already has so the diff stays minimal.
    const eol = source.endsWith("\n") ? "\n" : "";
    writeFileSync(p, JSON.stringify(meta, null, 2) + eol, "utf8");
    console.log(`✓ ${id}`);
  }
  console.log(`\n${writes.length} comment(s) written.`);
};

if (command === "find") find();
else if (command === "apply") apply();
else {
  console.error("usage: locale-comments.mjs find [...] | apply <file> --model <id>");
  process.exit(2);
}
