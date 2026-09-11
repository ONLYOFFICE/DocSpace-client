#!/usr/bin/env node
/*
 * Check every pnpm-workspace.yaml in the repo against the settings the
 * installed pnpm actually knows about.
 *
 * Reports three things:
 *   1. unknown keys   - a typo, or a setting removed by the new major. Since
 *                       pnpm 12 these hard-fail the install when
 *                       `packageManager` is pinned (it always is here), so
 *                       catching them before the bump is the point.
 *   2. stale keys     - settings superseded by a newer one, with the
 *                       replacement named.
 *   3. wrong case     - `node-linker` instead of `nodeLinker`. pnpm <=11
 *                       silently ignores these (the setting just never takes
 *                       effect); pnpm >=12 fails the install.
 *   4. stranded .npmrc - a pnpm setting left in .npmrc, which pnpm has read for
 *                       auth/registry only since v11, so it silently does
 *                       nothing.
 *   5. new settings   - settings that appeared since the baseline snapshot was
 *                       last refreshed, as adoption candidates.
 *
 * The settings list comes from the SchemaStore schema for pnpm-workspace.yaml,
 * which tracks pnpm releases and carries a description per setting. It is
 * snapshotted into settings-baseline.json so that (a) the "what is new" diff
 * has something to compare against and (b) the unknown-key check still works
 * offline.
 *
 * Usage:
 *   node .claude/scripts/pnpm/check-config.mjs              # check
 *   node .claude/scripts/pnpm/check-config.mjs --json       # machine readable
 *   node .claude/scripts/pnpm/check-config.mjs --offline    # baseline only
 *   node .claude/scripts/pnpm/check-config.mjs --update-baseline
 *
 * Exit codes: 0 clean (new settings are informational), 1 unknown or stale keys.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const BASELINE = join(HERE, "settings-baseline.json");
const SCHEMA_URL = "https://json.schemastore.org/pnpm-workspace.json";

const argv = new Set(process.argv.slice(2));
const JSON_OUT = argv.has("--json");
const OFFLINE = argv.has("--offline");
const UPDATE = argv.has("--update-baseline");

/** Every pnpm-workspace.yaml that belongs to this repo or its submodule. */
const CONFIGS = [
  "pnpm-workspace.yaml",
  join("libs", "ui-kit", "pnpm-workspace.yaml"),
];

/* ------------------------------------------------------------------ keys */

/**
 * Top-level keys of a YAML document.
 *
 * Deliberately not a YAML parse: no YAML library is resolvable from the repo
 * root under pnpm's isolated node_modules, and top-level keys are exactly what
 * pnpm validates. A top-level key is a line starting in column 0 with an
 * identifier followed by ':' - comments, nested mappings and list items are all
 * indented or start with '#'/'-'.
 */
function topLevelKeys(text) {
  const keys = [];
  for (const line of text.split("\n")) {
    const m = /^([A-Za-z_][A-Za-z0-9_-]*)\s*:/.exec(line);
    if (m) keys.push(m[1]);
  }
  return [...new Set(keys)];
}

/** camelCase -> the kebab-case spelling it is often mistyped as. */
function kebab(name) {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * Settings in .npmrc that pnpm no longer reads.
 *
 * Since pnpm 11 .npmrc is auth/registry only, so a leftover `node-linker=hoisted`
 * there is silently inert - the worst kind of failure, because the file still
 * looks correct. Auth and registry entries are legitimate and skipped.
 */
const NPMRC_AUTH_OK =
  /^(\/\/|@[^:]+:registry$|registry$|_auth|_password|_authToken|username$|email$|certfile$|keyfile$|noproxy$|cafile$|ca$|cert$|key$)/;

function scanNpmrc(text, known) {
  const stranded = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(";")) continue;
    const m = /^([^=\s]+)\s*=/.exec(t);
    if (!m) continue;
    const raw = m[1];
    if (NPMRC_AUTH_OK.test(raw)) continue;
    const camel = raw.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (known.has(camel)) stranded.push({ key: raw, camel });
  }
  return stranded;
}

/* ---------------------------------------------------------------- schema */

async function fetchSchema() {
  const res = await fetch(SCHEMA_URL);
  if (!res.ok) throw new Error(`${SCHEMA_URL} -> HTTP ${res.status}`);
  const schema = await res.json();
  const props = schema.properties;
  if (!props || Object.keys(props).length < 50)
    throw new Error("schema has no usable `properties` map");
  return props;
}

function loadBaseline() {
  if (!existsSync(BASELINE)) return null;
  return JSON.parse(readFileSync(BASELINE, "utf8"));
}

/**
 * Settings superseded by another one.
 *
 * The schema does not use the JSON-Schema `deprecated` keyword (verified: zero
 * occurrences), so supersession is only stated in prose, and always from the
 * *replacement* side - e.g. catalogPrune says "`cleanupUnusedCatalogs` is the
 * deprecated spelling of this setting". So scan every description for
 * backticked setting names sitting in a sentence about deprecation, and
 * attribute them to the setting whose description mentions them. A naive
 * "description mentions deprecat" test would wrongly flag the replacements
 * themselves.
 */
function findSuperseded(props) {
  const known = new Set(Object.keys(props));
  const superseded = new Map(); // stale -> replacement

  for (const [name, def] of Object.entries(props)) {
    const desc = def.description || "";
    if (!/deprecat/i.test(desc)) continue;

    // Sentences that actually talk about deprecation.
    for (const sentence of desc.split(/(?<=[.!?])\s+/)) {
      if (!/deprecat/i.test(sentence)) continue;
      for (const [, ref] of sentence.matchAll(/`([A-Za-z][A-Za-z0-9_-]*)`/g)) {
        // A setting never deprecates itself; only record real, other settings.
        if (ref !== name && known.has(ref) && !superseded.has(ref))
          superseded.set(ref, name);
      }
    }

    // "Deprecated. …" as the opening of a setting's own description.
    if (/^\s*deprecated[.:\s]/i.test(desc) && !superseded.has(name))
      superseded.set(name, null);
  }
  return superseded;
}

/* ----------------------------------------------------------------- main */

async function main() {
  let props = null;
  let source = "network";

  if (!OFFLINE) {
    try {
      props = await fetchSchema();
    } catch (err) {
      if (UPDATE) {
        console.error(`Cannot refresh baseline: ${err.message}`);
        process.exit(2);
      }
      console.error(`! schema fetch failed (${err.message}); using baseline`);
    }
  }

  const baseline = loadBaseline();
  if (!props) {
    if (!baseline) {
      console.error(
        "No schema and no baseline. Run once online with --update-baseline.",
      );
      process.exit(2);
    }
    props = baseline.properties;
    source = `baseline (captured for pnpm ${baseline.pnpmVersion})`;
  }

  if (UPDATE) {
    const pnpmVersion = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ).packageManager?.replace(/^pnpm@/, "");
    // Keep only what the checks need, so the committed snapshot stays readable
    // in a diff: the setting names and their descriptions.
    const slim = Object.fromEntries(
      Object.entries(props)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, { description: v.description || "" }]),
    );
    writeFileSync(
      BASELINE,
      `${JSON.stringify({ pnpmVersion, capturedAt: new Date().toISOString().slice(0, 10), source: SCHEMA_URL, properties: slim }, null, 2)}\n`,
    );
    console.log(
      `Baseline refreshed: ${Object.keys(props).length} settings for pnpm ${pnpmVersion}`,
    );
    return;
  }

  const known = new Set(Object.keys(props));
  const superseded = findSuperseded(props);

  // kebab spelling -> the camelCase setting pnpm actually reads.
  const byKebab = new Map();
  for (const name of known) {
    const k = kebab(name);
    if (k !== name) byKebab.set(k, name);
  }

  const findings = { unknown: [], stale: [], wrongCase: [], stranded: [], configs: [] };

  for (const rel of CONFIGS) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    const used = topLevelKeys(readFileSync(full, "utf8"));
    findings.configs.push({ file: rel, keys: used.length });

    for (const key of used) {
      if (known.has(key)) {
        if (superseded.has(key))
          findings.stale.push({
            file: rel,
            key,
            replacement: superseded.get(key),
          });
      } else if (byKebab.has(key)) {
        findings.wrongCase.push({ file: rel, key, camel: byKebab.get(key) });
      } else {
        findings.unknown.push({ file: rel, key });
      }
    }
  }

  for (const rel of [".npmrc", join("libs", "ui-kit", ".npmrc")]) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    for (const s of scanNpmrc(readFileSync(full, "utf8"), known))
      findings.stranded.push({ file: rel, ...s });
  }

  // New settings are only meaningful against a baseline from an older pnpm.
  const newSettings =
    baseline && source === "network"
      ? [...known]
          .filter((k) => !(k in baseline.properties))
          .map((k) => ({
            key: k,
            description: (props[k].description || "").split(/(?<=\.)\s/)[0],
          }))
      : [];

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        { source, baselineVersion: baseline?.pnpmVersion, ...findings, newSettings },
        null,
        2,
      ),
    );
  } else {
    report({ source, baseline, findings, newSettings });
  }

  const failed =
    findings.unknown.length +
    findings.stale.length +
    findings.wrongCase.length +
    findings.stranded.length;
  process.exit(failed ? 1 : 0);
}

function report({ source, baseline, findings, newSettings }) {
  console.log(`pnpm settings source: ${source}`);
  for (const c of findings.configs)
    console.log(`  scanned ${c.file} (${c.keys} top-level keys)`);
  console.log();

  if (findings.unknown.length) {
    console.log("UNKNOWN SETTINGS — pnpm >=12 fails the install on these:");
    for (const f of findings.unknown) console.log(`  ✗ ${f.file}: ${f.key}`);
    console.log();
  }

  if (findings.wrongCase.length) {
    console.log(
      "WRONG SPELLING — pnpm-workspace.yaml uses camelCase; pnpm <=11 ignores\n" +
        "these silently, pnpm >=12 fails the install:",
    );
    for (const f of findings.wrongCase)
      console.log(`  ✗ ${f.file}: ${f.key} → ${f.camel}`);
    console.log();
  }

  if (findings.stale.length) {
    console.log("SUPERSEDED SETTINGS:");
    for (const f of findings.stale)
      console.log(
        `  ! ${f.file}: ${f.key}${f.replacement ? ` → use ${f.replacement}` : " (deprecated, no direct replacement)"}`,
      );
    console.log();
  }

  if (findings.stranded.length) {
    console.log(
      "STRANDED IN .npmrc — read for auth/registry only since pnpm 11, so these\n" +
        "do nothing. Move them to pnpm-workspace.yaml:",
    );
    for (const f of findings.stranded)
      console.log(`  ✗ ${f.file}: ${f.key} → ${f.camel} in pnpm-workspace.yaml`);
    console.log();
  }

  if (newSettings.length) {
    console.log(
      `NEW SINCE BASELINE (pnpm ${baseline.pnpmVersion}) — ${newSettings.length} setting(s), review for adoption:`,
    );
    for (const s of newSettings) console.log(`  + ${s.key} — ${s.description}`);
    console.log(
      "\n  Adopt only what this repo needs, then refresh the baseline:\n" +
        "  node .claude/scripts/pnpm/check-config.mjs --update-baseline",
    );
    console.log();
  }

  const problems =
    findings.unknown.length +
    findings.stale.length +
    findings.wrongCase.length +
    findings.stranded.length;
  if (!problems)
    console.log("✓ all configured settings are valid, current and in the right file");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
