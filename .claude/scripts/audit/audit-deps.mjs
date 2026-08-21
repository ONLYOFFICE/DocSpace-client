#!/usr/bin/env node
/**
 * Audit every dependency tree in the repo, not just the pnpm workspace.
 *
 * The repo carries several independent lockfiles (root pnpm workspace, the
 * ui-kit submodule's standalone lock, and a handful of npm sub-projects under
 * common/). `pnpm audit` at the root only ever sees the first one, so a clean
 * root audit says nothing about the rest.
 *
 * Read-only: runs audits, reads lockfiles, prints findings and the override
 * line that would fix each one. Never installs, never edits a file.
 *
 * Usage (from the repo root):
 *   node .claude/scripts/audit/audit-deps.mjs
 *   node .claude/scripts/audit/audit-deps.mjs --level high
 *   node .claude/scripts/audit/audit-deps.mjs --tree tests
 *   node .claude/scripts/audit/audit-deps.mjs --json
 *
 * Flags:
 *   --level <info|low|moderate|high|critical>  minimum severity (default moderate)
 *   --tree <substring>                         only trees whose name matches
 *   --strict                                   informational trees affect the exit code
 *   --json                                     machine-readable output
 *
 * Exit code: 0 clean, 1 findings at or above --level, 2 script error.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const SEVERITIES = ["info", "low", "moderate", "high", "critical"];
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next"]);
const AUDIT_TIMEOUT_MS = 180_000;

/* ------------------------------------------------------------------ args */

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(name);

const level = flag("--level", "moderate");
if (!SEVERITIES.includes(level)) {
  console.error(`Unknown --level "${level}". Use one of: ${SEVERITIES.join(", ")}`);
  process.exit(2);
}
const minSeverity = SEVERITIES.indexOf(level);
const treeFilter = flag("--tree");
const asJson = has("--json");
const strict = has("--strict");

/* ---------------------------------------------------------------- trees */

/** Walk the repo and collect every lockfile outside node_modules. */
function discoverTrees(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      discoverTrees(full, out);
    } else if (entry === "pnpm-lock.yaml" || entry === "package-lock.json") {
      const treeDir = dirname(full);
      out.push({
        name: relative(ROOT, treeDir) || "root",
        dir: treeDir,
        manager: entry === "pnpm-lock.yaml" ? "pnpm" : "npm",
        lockfile: full,
        // The submodule's standalone lock is never what gets installed here:
        // at the root it resolves as a workspace member under the root
        // overrides. Findings are real, but they belong to the ui-kit repo.
        informational: relative(ROOT, treeDir).startsWith("libs/ui-kit"),
      });
    }
  }
  return out;
}

/* --------------------------------------------------------------- audits */

function runAudit(tree) {
  const cmd = tree.manager === "pnpm" ? "pnpm" : "npm";
  try {
    // Both exit non-zero when they find something, so failures are expected.
    return execFileSync(cmd, ["audit", "--json"], {
      cwd: tree.dir,
      encoding: "utf8",
      timeout: AUDIT_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    if (err.stdout) return err.stdout;
    throw new Error(`${cmd} audit failed in ${tree.name}: ${err.shortMessage || err.message}`);
  }
}

/** pnpm speaks the npm v6 advisory shape, npm speaks auditReportVersion 2. */
function parseFindings(raw, tree) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Could not parse ${tree.manager} audit output for ${tree.name}`);
  }

  const findings = [];

  for (const advisory of Object.values(data.advisories ?? {})) {
    findings.push({
      package: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      url: advisory.url,
      vulnerable: advisory.vulnerable_versions,
      patched: advisory.patched_versions,
      paths: (advisory.findings ?? []).flatMap((f) => f.paths ?? []),
    });
  }

  for (const [name, vuln] of Object.entries(data.vulnerabilities ?? {})) {
    // `via` holds advisory objects for the vulnerable package itself and bare
    // names for packages that are only affected through a dependency.
    const advisories = (vuln.via ?? []).filter((v) => typeof v === "object");
    if (advisories.length === 0) continue;
    for (const advisory of advisories) {
      findings.push({
        package: name,
        severity: advisory.severity ?? vuln.severity,
        title: advisory.title,
        url: advisory.url,
        vulnerable: advisory.range ?? vuln.range,
        patched: null,
        paths: vuln.nodes ?? [],
        affects: vuln.effects ?? [],
      });
    }
  }

  return findings.filter((f) => SEVERITIES.indexOf(f.severity) >= minSeverity);
}

/* ------------------------------------------------------- lockfile lookup */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every version of `pkg` the tree actually resolves - the majors matter. */
function installedVersions(tree, pkg) {
  const text = readFileSync(tree.lockfile, "utf8");
  const versions = new Set();

  if (tree.manager === "pnpm") {
    const re = new RegExp(`^ {2}${escapeRe(pkg)}@(\\d[^:(\\s]*)\\s*:`, "gm");
    for (const m of text.matchAll(re)) versions.add(m[1]);
  } else {
    let lock;
    try {
      lock = JSON.parse(text);
    } catch {
      return [];
    }
    for (const [path, entry] of Object.entries(lock.packages ?? {})) {
      if (entry?.version && basename(path) === pkg.split("/").pop() && path.endsWith(`node_modules/${pkg}`)) {
        versions.add(entry.version);
      }
    }
  }

  return [...versions].sort();
}

const major = (v) => Number.parseInt(v, 10);

/** First concrete version in a range string: ">=3.3.18" -> "3.3.18". */
const firstVersion = (range) => (range ?? "").match(/\d+\.\d+\.\d+/)?.[0] ?? null;

/**
 * Smallest safe version. `patched_versions` (pnpm) states it outright; npm
 * only reports what is vulnerable, so read the upper bound of that range -
 * ">=10.0.0 <10.2.1" is fixed by 10.2.1, not by 10.0.0.
 */
function safeVersion(finding) {
  const patched = firstVersion(finding.patched);
  if (patched) return patched;
  const bounds = [...(finding.vulnerable ?? "").matchAll(/<=?\s*(\d+\.\d+\.\d+)/g)];
  if (bounds.length > 0) return bounds.at(-1)[1];
  return firstVersion(finding.vulnerable);
}

/** Semver-ish compare, enough to pick the highest required fix. */
function higher(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0) ? a : b;
  }
  return a;
}

/**
 * The override line to add - and the trap it avoids.
 *
 * A selector (`pkg@^3`) only narrows *which* dependents get rewritten; the
 * replacement range is resolved on its own, so an unbounded `">=3.3.18"`
 * happily resolves to a later major (nanoid 6 is ESM-only and breaks postcss).
 * Bounding the replacement to the major that is actually installed is always
 * safe, so that is what gets suggested.
 */
function suggestOverride(pkg, finding, versions) {
  const fix = safeVersion(finding);
  if (!fix) return null;

  const majors = [...new Set(versions.map(major))].filter((m) => !Number.isNaN(m));
  const fixMajor = major(fix);
  const crossesMajor = majors.length > 0 && !majors.includes(fixMajor);

  if (crossesMajor) {
    return {
      selector: `"${pkg}"`,
      version: fix,
      bounded: false,
      note: `the fix crosses a major (installed ${versions.join(", ")} -> ${fix}); check the consumers before forcing it`,
    };
  }

  return {
    selector: `"${pkg}@^${fixMajor}"`,
    version: fix,
    bounded: true,
    note:
      majors.length > 1
        ? `versions ${versions.join(", ")} coexist - the selector AND the replacement must stay inside ${fixMajor}.x`
        : null,
  };
}

const overrideLine = (fix) => `${fix.selector}: ${fix.bounded ? `"^${fix.version}"` : `">=${fix.version}"`}`;

const overrideTarget = (tree) =>
  tree.manager === "pnpm"
    ? `${tree.name === "root" ? "" : `${tree.name}/`}pnpm-workspace.yaml -> overrides:`
    : `${tree.name}/package.json -> "overrides"`;

/* --------------------------------------------------------------- output */

const trees = discoverTrees(ROOT).filter((t) => !treeFilter || t.name.includes(treeFilter));
if (trees.length === 0) {
  console.error(treeFilter ? `No dependency tree matches "${treeFilter}".` : "No lockfile found.");
  process.exit(2);
}

const results = [];
for (const tree of trees) {
  if (!asJson) process.stderr.write(`auditing ${tree.name} (${tree.manager})...\n`);
  try {
    const findings = parseFindings(runAudit(tree), tree);
    for (const finding of findings) {
      finding.installed = installedVersions(tree, finding.package);
      finding.fix = suggestOverride(finding.package, finding, finding.installed);
    }
    results.push({ ...tree, findings });
  } catch (err) {
    results.push({ ...tree, error: err.message, findings: [] });
  }
}

if (asJson) {
  console.log(JSON.stringify({ level, trees: results }, null, 2));
} else {
  const pad = (s, n) => String(s).padEnd(n);
  const width = Math.max(...results.map((r) => r.name.length), 12);

  console.log(`\nDependency trees (severity >= ${level})\n`);
  console.log(`${pad("tree", width)}  ${pad("mgr", 5)}  status`);
  console.log("-".repeat(width + 30));
  for (const r of results) {
    const status = r.error
      ? `error: ${r.error}`
      : r.findings.length === 0
        ? "clean"
        : `${r.findings.length} finding(s)${r.informational ? " (informational)" : ""}`;
    console.log(`${pad(r.name, width)}  ${pad(r.manager, 5)}  ${status}`);
  }

  for (const r of results) {
    if (r.findings.length === 0) continue;
    console.log(`\n=== ${r.name} (${r.manager})${r.informational ? " - informational" : ""}`);
    if (r.informational) {
      console.log("    Standalone lockfile of the submodule; the root install overrides it.");
      console.log("    Fix these in the ui-kit repo, not here.");
    }
    for (const f of r.findings) {
      console.log(`\n  [${f.severity}] ${f.package} ${f.vulnerable ?? ""}`);
      if (f.title) console.log(`    ${f.title}`);
      if (f.url) console.log(`    ${f.url}`);
      if (f.installed?.length) console.log(`    installed: ${f.installed.join(", ")}`);
      if (f.affects?.length) console.log(`    reaches the tree through: ${f.affects.join(", ")}`);
      for (const p of (f.paths ?? []).slice(0, 3)) console.log(`    path: ${p}`);
      if ((f.paths ?? []).length > 3) console.log(`    ... ${f.paths.length - 3} more path(s)`);
      if (f.fix) console.log(`    fix: ${overrideLine(f.fix)}`);
      if (f.fix?.note) console.log(`    note: ${f.fix.note}`);
    }

    const merged = new Map();
    for (const f of r.findings) {
      if (!f.fix) continue;
      const prev = merged.get(f.fix.selector);
      merged.set(f.fix.selector, prev ? { ...f.fix, version: higher(prev.version, f.fix.version) } : f.fix);
    }
    if (merged.size > 0) {
      console.log(`\n  overrides to add in ${overrideTarget(r)}`);
      for (const fix of merged.values()) console.log(`    ${overrideLine(fix)}`);
    }
  }
  console.log("");
}

const blocking = results.filter((r) => (strict || !r.informational) && r.findings.length > 0);
process.exit(blocking.length > 0 ? 1 : 0);
