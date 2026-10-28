#!/usr/bin/env node
/**
 * Audit every dependency tree in the repo, not just the pnpm workspace.
 *
 * The repo carries several independent lockfiles (root pnpm workspace plus a
 * handful of npm sub-projects under common/). `pnpm audit` at the root only
 * ever sees the first one, so a clean root audit says nothing about the rest.
 *
 * ui-kit is out of scope: it ships as a prebuilt npm package from its own
 * repository and has no lockfile here. Audit it in `docspace-ui-kit-react`.
 *
 * Shared logic with docspace-ui-kit-react's .claude/scripts/audit-deps/,
 * which adds the runtime/dev split a published package needs; keep in step.
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

/** Lowest published version above `version` within the same major. */
function firstPublishedAbove(pkg, version) {
  try {
    const out = execFileSync("npm", ["view", `${pkg}@>${version} <${major(version) + 1}.0.0`, "version", "--json"], {
      encoding: "utf8",
      timeout: 30_000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const versions = [].concat(JSON.parse(out || "[]")).filter((v) => !v.includes("-"));
    return versions[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Smallest safe version. `patched_versions` (pnpm) states it outright; npm
 * only reports what is vulnerable, so read the upper bound of that range -
 * ">=10.0.0 <10.2.1" is fixed by 10.2.1, not by 10.0.0. An inclusive bound
 * ("<=16.4.0") is itself vulnerable, so the fix is the next release after it.
 */
function safeVersion(finding) {
  const patched = firstVersion(finding.patched);
  if (patched) return patched;
  const bounds = [...(finding.vulnerable ?? "").matchAll(/<(=?)\s*(\d+\.\d+\.\d+)/g)];
  if (bounds.length > 0) {
    const [, inclusive, bound] = bounds.at(-1);
    return inclusive ? firstPublishedAbove(finding.package, bound) : bound;
  }
  return firstVersion(finding.vulnerable);
}

/**
 * Manifests that declare `pkg` directly. For those the fix is a version bump
 * in the manifest, not an override - an override would hide the real pin.
 */
function directDeclarations(tree, pkg) {
  const manifests = [join(tree.dir, "package.json")];
  if (tree.manager === "pnpm" && existsSync(join(tree.dir, "packages"))) {
    for (const entry of readdirSync(join(tree.dir, "packages"))) {
      manifests.push(join(tree.dir, "packages", entry, "package.json"));
    }
  }
  const found = [];
  for (const file of manifests) {
    if (!existsSync(file)) continue;
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    for (const section of ["dependencies", "peerDependencies", "devDependencies", "optionalDependencies"]) {
      const spec = manifest[section]?.[pkg];
      if (spec) found.push(`${relative(ROOT, file)} ${section} (${spec.startsWith("catalog:") ? "pnpm-workspace.yaml catalog" : spec})`);
    }
  }
  return found;
}

/**
 * A finding whose advisory id is already written next to the overrides is a
 * documented decision (e.g. "deliberately left on 1.9.x"), not new work.
 */
function documentedIn(tree, finding) {
  const id = finding.url?.match(/GHSA-[\w-]+/)?.[0];
  if (!id) return null;
  const file = tree.manager === "pnpm" ? join(tree.dir, "pnpm-workspace.yaml") : join(tree.dir, "package.json");
  return existsSync(file) && readFileSync(file, "utf8").includes(id) ? relative(ROOT, file) : null;
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
  // Under 0.x every minor is breaking (katex 0.17 -> 0.18), so compare 0.minor
  const line = (v) => (major(v) === 0 ? v.split(".").slice(0, 2).join(".") : String(major(v)));
  const crossesMajor = versions.length > 0 && !versions.map(line).includes(line(fix));

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
      // A declaration needs a bump only while its range still admits a
      // vulnerable version: `^1.19.0` is fine for a fix in 1.15.1.
      const fixed = finding.fix?.version;
      finding.direct = directDeclarations(tree, finding.package).filter((d) => {
        const floor = firstVersion(d.slice(d.lastIndexOf("(")));
        return !fixed || !floor || (floor !== fixed && higher(floor, fixed) === fixed);
      });
      // Parents that pull a copy in themselves; a bump of ours leaves theirs.
      finding.via = [
        ...new Set((finding.paths ?? []).filter((p) => p.split(">").length > 2).map((p) => p.split(">").at(-2))),
      ];
      finding.documented = documentedIn(tree, finding);
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
        : `${r.findings.length} finding(s)`;
    console.log(`${pad(r.name, width)}  ${pad(r.manager, 5)}  ${status}`);
  }

  for (const r of results) {
    if (r.findings.length === 0) continue;
    console.log(`\n=== ${r.name} (${r.manager})`);
    for (const f of r.findings) {
      console.log(`\n  [${f.severity}] ${f.package} ${f.vulnerable ?? ""}`);
      if (f.title) console.log(`    ${f.title}`);
      if (f.url) console.log(`    ${f.url}`);
      if (f.installed?.length) console.log(`    installed: ${f.installed.join(", ")}`);
      if (f.affects?.length) console.log(`    reaches the tree through: ${f.affects.join(", ")}`);
      for (const p of (f.paths ?? []).slice(0, 3)) console.log(`    path: ${p}`);
      if ((f.paths ?? []).length > 3) console.log(`    ... ${f.paths.length - 3} more path(s)`);
      if (f.documented) {
        console.log(`    documented exception: the advisory id is already explained in ${f.documented}`);
        continue;
      }
      if (f.direct.length > 0) {
        console.log(`    direct dependency - bump it to >= ${f.fix?.version ?? "the patched version"} in:`);
        for (const d of f.direct) console.log(`      ${d}`);
      }
      if (f.via?.length) console.log(`    also pulled in by: ${f.via.slice(0, 4).join(", ")}`);
      if (f.direct.length > 0 && !f.via?.length) {
        if (f.fix?.note) console.log(`    note: ${f.fix.note}`);
        continue;
      }
      if (f.fix) console.log(`    fix: ${overrideLine(f.fix)}`);
      if (f.fix?.note) console.log(`    note: ${f.fix.note}`);
    }

    const merged = new Map();
    for (const f of r.findings) {
      if (!f.fix || f.documented || (f.direct.length > 0 && !f.via?.length)) continue;
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

const blocking = results.filter((r) => r.findings.some((f) => !f.documented));
process.exit(blocking.length > 0 ? 1 : 0);
