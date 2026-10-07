#!/usr/bin/env node
/**
 * Collect the raw material for an onboarding "what changed" page: everything
 * that happened to a feature area between the last release (merge-base with
 * a base ref, default master) and the current working tree.
 *
 * Deliberately dumb: gathers and prints, never judges. Deciding which changes
 * are substantial is the caller's job.
 *
 * Usage (from the repo root):
 *   node .claude/skills/onboard/collect-changes.mjs [flags] <pathspec>...
 *
 * Positional pathspecs scope the client-repo commit log and working-tree scan.
 *
 * Flags:
 *   --base <ref>          base ref to diff against (default: master)
 *   --locales <path,...>  en locale JSON files to key-diff (repeatable)
 *   --key-filter <regex>  only report locale keys whose path or value matches
 *                         (case-insensitive); useful for huge namespaces
 *   --shots <path,...>    screenshot baseline dirs (repeatable; default:
 *                         packages/client/__tests__/screenshots)
 *   --uikit <path,...>    pathspecs inside libs/ui-kit to scope its log
 *                         (repeatable; default: whole submodule)
 *   --deep <path,...>     print the full base->worktree diff of these
 *                         paths (capped per path) for close reading
 *
 * The BASE STATE (locales, screenshots, ui-kit gitlink, hotspots) is read
 * from the base ref's tip - what that release actually holds - while the
 * commit list walks merge-base..HEAD (the work new on this side). Pick the
 * base as the state users actually run (a release tag, origin/master), not
 * a staging branch that may already carry the next release's features.
 *
 * Output: markdown on stdout — base info, scoped commits, hotspots (most
 * churned files; READ THEIR DIFFS before judging what changed), uncommitted
 * changes, locale key delta (added/removed/changed), screenshot baseline
 * delta, deep diffs, and the ui-kit submodule range with its own log and
 * hotspots.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const LIST_CAP = 200;

const args = process.argv.slice(2);
const paths = [];
const localeFiles = [];
const uikitPaths = [];
const deepPaths = [];
let base = "master";
let keyFilter = null;
const shots = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--base") base = args[++i];
  else if (a === "--locales") localeFiles.push(...args[++i].split(","));
  else if (a === "--key-filter") keyFilter = new RegExp(args[++i], "i");
  else if (a === "--shots") shots.push(...args[++i].split(","));
  else if (a === "--uikit") uikitPaths.push(...args[++i].split(","));
  else if (a === "--deep") deepPaths.push(...args[++i].split(","));
  else if (a.startsWith("--")) fail(`Unknown flag: ${a}`);
  else paths.push(a);
}

if (paths.length === 0) fail("At least one pathspec is required.");

function fail(msg) {
  console.error(msg);
  process.exit(2);
}

function git(argv, opts = {}) {
  try {
    return execFileSync("git", argv, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      ...opts,
    }).trimEnd();
  } catch (e) {
    if (opts.allowFail) return null;
    fail(`git ${argv.join(" ")} failed:\n${e.stderr || e.message}`);
  }
}

function section(title) {
  console.log(`\n## ${title}\n`);
}

function capped(list, render) {
  list.slice(0, LIST_CAP).forEach((x) => console.log(render(x)));
  if (list.length > LIST_CAP)
    console.log(`... and ${list.length - LIST_CAP} more`);
}

// --- base info ---------------------------------------------------------

const mergeBase = git(["merge-base", base, "HEAD"]);
const baseTip = git(["rev-parse", base]);
const head = git(["rev-parse", "--short", "HEAD"]);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const mbDate = git(["show", "-s", "--format=%ad", "--date=short", mergeBase]);
const baseDate = git(["show", "-s", "--format=%ad", "--date=short", baseTip]);

console.log(`# Change digest: ${base} -> ${branch} (working tree)`);
console.log(`\n- base state: \`${base}\` tip = \`${baseTip.slice(0, 11)}\` (${baseDate}) — locales, screenshots, gitlink and hotspots compare against THIS`);
console.log(`- merge-base with HEAD: \`${mergeBase.slice(0, 11)}\` (${mbDate}) — the commit list walks from here`);
if (baseTip !== mergeBase)
  console.log(`- NOTE: the base tip is not the merge-base — the base line has its own commits; state diffs may include their reversals`);
console.log(`- head: \`${head}\` on \`${branch}\``);
console.log(`- scope: ${paths.join(", ")}`);

// --- commits ------------------------------------------------------------

section("Commits in range (no merges)");
const log = git([
  "log",
  "--no-merges",
  "--date=short",
  "--pretty=%h|%ad|%s",
  `${mergeBase}..HEAD`,
  "--",
  ...paths,
]);
if (log) {
  const lines = log.split("\n");
  console.log(`${lines.length} commits, newest first:\n`);
  capped(lines, (l) => {
    const [h, d, ...s] = l.split("|");
    return `- \`${h}\` ${d} ${s.join("|")}`;
  });
} else {
  console.log("(none)");
}

// --- hotspots -------------------------------------------------------------

function hotspots(numstatText, label) {
  section(`Hotspots: ${label}`);
  if (!numstatText) {
    console.log("(no changes)");
    return;
  }
  const rows = numstatText
    .split("\n")
    .map((l) => {
      const [add, del, ...p] = l.split("\t");
      return { churn: (+add || 0) + (+del || 0), add, del, path: p.join("\t") };
    })
    .filter((r) => r.churn > 0)
    .sort((a, b) => b.churn - a.churn)
    .slice(0, 20);
  console.log("Most-churned files vs the base tip. READ THESE DIFFS before deciding what changed - core-flow rewrites (a payment rail, a guard) rarely surface in commit subjects or locale keys.\n");
  rows.forEach((r) => console.log(`- ${r.path} (+${r.add} / -${r.del})`));
}

hotspots(
  git(["diff", "--numstat", baseTip, "--", ...paths], { allowFail: true }),
  "client scope",
);

// --- uncommitted --------------------------------------------------------

section("Uncommitted working-tree changes");
const status = git(["status", "--porcelain", "--", ...paths]);
console.log(status || "(none)");

// --- locale key delta ----------------------------------------------------

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

function parseJson(text, label) {
  if (text == null) return {};
  try {
    return JSON.parse(text);
  } catch {
    fail(`Cannot parse JSON: ${label}`);
  }
}

if (localeFiles.length) {
  section("Locale key delta (en)");
  for (const file of localeFiles) {
    const before = flatten(
      parseJson(git(["show", `${baseTip}:${file}`], { allowFail: true }), `${base}:${file}`),
    );
    const after = flatten(
      existsSync(file) ? parseJson(readFileSync(file, "utf8"), file) : {},
    );
    const match = (k, ...vals) =>
      !keyFilter || keyFilter.test(k) || vals.some((v) => keyFilter.test(v));

    const added = Object.keys(after).filter((k) => !(k in before) && match(k, after[k]));
    const removed = Object.keys(before).filter((k) => !(k in after) && match(k, before[k]));
    const changed = Object.keys(after).filter(
      (k) => k in before && before[k] !== after[k] && match(k, before[k], after[k]),
    );

    console.log(`### ${file}`);
    if (!added.length && !removed.length && !changed.length) {
      console.log(keyFilter ? "(no matching delta)" : "(no delta)");
      continue;
    }
    if (added.length) {
      console.log(`\nAdded (${added.length}):`);
      capped(added, (k) => `- ${k} = "${after[k]}"`);
    }
    if (removed.length) {
      console.log(`\nRemoved (${removed.length}):`);
      capped(removed, (k) => `- ${k} (was "${before[k]}")`);
    }
    if (changed.length) {
      console.log(`\nChanged (${changed.length}):`);
      capped(changed, (k) => `- ${k}: "${before[k]}" -> "${after[k]}"`);
    }
    console.log("");
  }
}

// --- screenshot baselines -------------------------------------------------

section("Screenshot baseline delta");
if (shots.length === 0) shots.push("packages/client/__tests__/screenshots");
const shotDiff = git(["diff", "--name-status", baseTip, "--", ...shots]);
if (shotDiff) {
  const rows = shotDiff.split("\n").map((l) => {
    const [st, ...p] = l.split("\t");
    return { st: st[0], path: p.join("\t") };
  });
  const byStatus = { A: "added", M: "modified", D: "deleted", R: "renamed" };
  for (const [st, label] of Object.entries(byStatus)) {
    const group = rows.filter((r) => r.st === st);
    if (!group.length) continue;
    console.log(`\n${label} (${group.length}):`);
    const strip = (p) => {
      const hit = shots.find((s) => p.startsWith(`${s}/`));
      return hit ? p.slice(hit.length + 1) : p;
    };
    capped(group, (r) => `- ${strip(r.path)}`);
  }
  console.log(
    "\nA modified baseline's before-image: `git show <base>:<path>`; added baselines have no before-image in git.",
  );
} else {
  console.log("(no baseline changes)");
}

// --- deep diffs -------------------------------------------------------------

if (deepPaths.length) {
  section("Deep diffs (base tip -> working tree)");
  const PER_PATH_CAP = 400;
  for (const p of deepPaths) {
    console.log(`### ${p}\n`);
    const d = git(["diff", baseTip, "--", p], { allowFail: true });
    if (!d) {
      console.log("(no diff)");
      continue;
    }
    const lines = d.split("\n");
    console.log("```diff");
    console.log(lines.slice(0, PER_PATH_CAP).join("\n"));
    if (lines.length > PER_PATH_CAP)
      console.log(`... ${lines.length - PER_PATH_CAP} more lines - narrow the path or read it with git directly`);
    console.log("```\n");
  }
}

// --- ui-kit submodule ------------------------------------------------------

section("ui-kit submodule (libs/ui-kit)");
const gitlink = git(["ls-tree", baseTip, "libs/ui-kit"], { allowFail: true });
if (!gitlink) {
  console.log(
    `Submodule does not exist at the base (${base}). The whole libs/ui-kit tree ` +
      "is new in this range - code in it likely MOVED here from packages/client, " +
      "so a client-side deletion may not be a behavior change.",
  );
} else {
  const oldSha = gitlink.split(/\s+/)[2];
  const newSha = git(["-C", "libs/ui-kit", "rev-parse", "HEAD"]);
  console.log(`- at base: \`${oldSha.slice(0, 11)}\`\n- now: \`${newSha.slice(0, 11)}\``);
  if (oldSha !== newSha) {
    const subLog = git(
      [
        "-C",
        "libs/ui-kit",
        "log",
        "--no-merges",
        "--date=short",
        "--pretty=%h|%ad|%s",
        `${oldSha}..${newSha}`,
        "--",
        ...(uikitPaths.length ? uikitPaths : ["."]),
      ],
      { allowFail: true },
    );
    if (subLog == null) {
      console.log(
        "(cannot walk the submodule range - the base commit may not be fetched in libs/ui-kit)",
      );
    } else if (subLog) {
      const lines = subLog.split("\n");
      console.log(`\n${lines.length} submodule commits in range:\n`);
      capped(lines, (l) => {
        const [h, d, ...s] = l.split("|");
        return `- \`${h}\` ${d} ${s.join("|")}`;
      });
    } else {
      console.log("(no submodule commits touch the given paths)");
    }
    hotspots(
      git(
        ["-C", "libs/ui-kit", "diff", "--numstat", oldSha, "--", ...(uikitPaths.length ? uikitPaths : ["."])],
        { allowFail: true },
      ),
      "ui-kit scope",
    );
  }
}
const subStatus = git(
  ["-C", "libs/ui-kit", "status", "--porcelain", "--", ...(uikitPaths.length ? uikitPaths : ["."])],
  { allowFail: true },
);
if (subStatus) {
  console.log("\nUncommitted in the submodule:");
  console.log(subStatus);
}
