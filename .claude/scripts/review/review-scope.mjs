#!/usr/bin/env node
/**
 * Resolve the review scope for the current branch: which base branch to diff
 * against, in the root repo and in every submodule that carries its own branch.
 *
 * Read-only except for `--save`, which records the resolved base in git config.
 *
 * Usage (from the repo root):
 *   node .claude/scripts/review/review-scope.mjs
 *   node .claude/scripts/review/review-scope.mjs release/v4.0.0
 *   node .claude/scripts/review/review-scope.mjs --diff
 *   node .claude/scripts/review/review-scope.mjs --repo . --diff --max-diff-lines 4000
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG = {
  // Branch-name patterns that may act as a base, most specific first. The
  // order also breaks ties when two candidates fork at the same commit.
  basePatterns: ["release/*", "hotfix/*", "develop", "master", "main"],
  // Submodules to review alongside the root repo. "auto" = every submodule
  // that is checked out on a branch of its own.
  submodules: "auto",
  // A candidate this many commits behind HEAD's fork point is treated as an
  // ancestor of a better candidate rather than the fork itself.
  maxCommitsAhead: 500,
  maxDiffLines: 3000,
};

function loadConfig() {
  let cfg = { ...DEFAULT_CONFIG };
  for (const name of ["config.json", "config.local.json"]) {
    const path = join(SCRIPT_DIR, name);
    if (!existsSync(path)) continue;
    try {
      cfg = { ...cfg, ...JSON.parse(readFileSync(path, "utf8")) };
    } catch (e) {
      console.error(`[review-scope] ignoring bad ${name}: ${e.message}`);
    }
  }
  return cfg;
}

function git(repo, args, { allowFail = false } = {}) {
  try {
    return execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    }).trim();
  } catch (e) {
    if (allowFail) return "";
    throw new Error(`git ${args.join(" ")} failed in ${repo}: ${e.message}`);
  }
}

const matches = (name, pattern) =>
  pattern.endsWith("/*")
    ? name.startsWith(pattern.slice(0, -1))
    : name === pattern;

function patternRank(name, patterns) {
  const i = patterns.findIndex((p) => matches(name, p));
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/** Every local + remote ref that looks like a base branch. */
function candidates(repo, patterns, current) {
  const refs = git(repo, [
    "for-each-ref",
    "--format=%(refname:short)",
    "refs/heads",
    "refs/remotes",
  ])
    .split("\n")
    .filter(Boolean)
    .filter((r) => !r.endsWith("/HEAD"));

  const seen = new Map();
  for (const ref of refs) {
    // Collapse origin/develop and develop onto one candidate.
    const bare = ref.replace(/^origin\//, "");
    if (bare === current) continue;
    if (patternRank(bare, patterns) === Number.MAX_SAFE_INTEGER) continue;
    // Prefer the local ref when both exist; it is what the user works with.
    if (!seen.has(bare) || !ref.startsWith("origin/")) seen.set(bare, ref);
  }
  return [...seen.entries()].map(([bare, ref]) => ({ bare, ref }));
}

/**
 * The parent branch is the candidate whose fork point is closest to HEAD —
 * i.e. the one that leaves the fewest commits on our side. Ties go to the
 * more specific pattern (release/* before develop before master).
 */
function detectBase(repo, current, cfg) {
  const scored = [];
  for (const { bare, ref } of candidates(repo, cfg.basePatterns, current)) {
    const mergeBase = git(repo, ["merge-base", ref, "HEAD"], {
      allowFail: true,
    });
    if (!mergeBase) continue;
    const ahead = Number(
      git(repo, ["rev-list", "--count", `${mergeBase}..HEAD`]),
    );
    if (!Number.isFinite(ahead) || ahead > cfg.maxCommitsAhead) continue;
    scored.push({
      bare,
      ref,
      mergeBase,
      ahead,
      rank: patternRank(bare, cfg.basePatterns),
    });
  }
  scored.sort((a, b) => a.ahead - b.ahead || a.rank - b.rank);
  return scored;
}

function resolveBase(repo, current, cfg, explicit) {
  if (explicit) return { base: explicit, source: "argument", ranked: [] };

  const perBranch = git(repo, ["config", `branch.${current}.reviewBase`], {
    allowFail: true,
  });
  if (perBranch)
    return {
      base: perBranch,
      source: `git config branch.${current}.reviewBase`,
      ranked: [],
    };

  if (cfg.reviewBase)
    return { base: cfg.reviewBase, source: "config file", ranked: [] };

  const ranked = detectBase(repo, current, cfg);
  if (!ranked.length) return { base: null, source: "none", ranked };
  return { base: ranked[0].ref, source: "auto-detected", ranked };
}

/** Submodules checked out on a branch of their own. */
function submodulePaths(repo, cfg) {
  if (Array.isArray(cfg.submodules)) return cfg.submodules;
  const out = git(repo, ["submodule", "--quiet", "foreach", "echo $sm_path"], {
    allowFail: true,
  });
  return out.split("\n").filter(Boolean);
}

function reportRepo(repo, label, explicit, cfg, opts) {
  const head = git(repo, ["rev-parse", "--abbrev-ref", "HEAD"]);
  console.log(`\n${"=".repeat(70)}`);
  console.log(`REPO ${label}   branch: ${head}`);
  console.log("=".repeat(70));

  if (head === "HEAD") {
    console.log("Detached HEAD — nothing to review here (submodule pinned).");
    return null;
  }

  const { base, source, ranked } = resolveBase(repo, head, cfg, explicit);
  if (!base) {
    console.log("No base branch found. Pass one explicitly.");
    return null;
  }

  if (ranked.length > 1) {
    const alts = ranked
      .slice(1, 4)
      .map((c) => `${c.ref} (+${c.ahead})`)
      .join(", ");
    console.log(`Base: ${base}  [${source}]   runners-up: ${alts}`);
  } else {
    console.log(`Base: ${base}  [${source}]`);
  }

  const mergeBase = git(repo, ["merge-base", base, "HEAD"]);
  console.log(`Merge-base: ${mergeBase}`);

  // Warn when the local base ref lags its remote — the diff would show
  // unrelated commits as "ours".
  if (!base.startsWith("origin/")) {
    const remote = git(repo, ["rev-parse", "--verify", `origin/${base}`], {
      allowFail: true,
    });
    if (remote) {
      const behind = Number(
        git(repo, ["rev-list", "--count", `${base}..origin/${base}`], {
          allowFail: true,
        }) || "0",
      );
      if (behind > 0)
        console.log(
          `WARNING: local ${base} is ${behind} commit(s) behind origin/${base} — consider --fetch.`,
        );
    }
  }

  const range = `${base}...HEAD`;

  console.log(`\n--- commits (${range}) ---`);
  console.log(git(repo, ["log", "--oneline", "--no-decorate", `${base}..HEAD`]));

  console.log(`\n--- stat ---`);
  const stat = git(repo, ["diff", "--stat", range]);
  console.log(stat || "(no changes)");

  if (opts.save) {
    git(repo, ["config", `branch.${head}.reviewBase`, base]);
    console.log(`\nSaved: branch.${head}.reviewBase = ${base}`);
  }

  if (opts.diff) {
    const diff = git(repo, ["diff", range]);
    const lines = diff ? diff.split("\n").length : 0;
    if (lines > opts.maxDiffLines) {
      console.log(
        `\n--- diff omitted: ${lines} lines > ${opts.maxDiffLines} ---`,
      );
      console.log("Request it per path:");
      console.log(`  git -C ${repo} diff ${range} -- <path>`);
    } else if (diff) {
      console.log(`\n--- diff (${range}) ---`);
      console.log(diff);
    }
  }

  return { repo, label, head, base, range, mergeBase };
}

const VALUE_FLAGS = new Set(["--repo", "--max-diff-lines"]);
const BOOL_FLAGS = new Set(["--diff", "--save", "--fetch"]);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (VALUE_FLAGS.has(arg)) {
      flags[arg] = argv[i + 1] ?? null;
      i += 1;
    } else if (BOOL_FLAGS.has(arg)) {
      flags[arg] = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`unknown flag ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

function main() {
  const cfg = loadConfig();
  const { flags, positional } = parseArgs(process.argv.slice(2));

  const opts = {
    diff: flags["--diff"] === true,
    save: flags["--save"] === true,
    fetch: flags["--fetch"] === true,
    maxDiffLines: Number(flags["--max-diff-lines"]) || cfg.maxDiffLines,
  };
  const only = flags["--repo"] ?? null;
  const explicit = positional[0] ?? null;

  const root = git(process.cwd(), ["rev-parse", "--show-toplevel"]);

  const repos = [{ path: root, label: "." }];
  if (!only || only !== ".") {
    for (const sub of submodulePaths(root, cfg)) {
      const abs = resolve(root, sub);
      if (existsSync(abs)) repos.push({ path: abs, label: sub });
    }
  }
  const selected = only ? repos.filter((r) => r.label === only) : repos;

  if (opts.fetch) {
    for (const r of selected) {
      console.error(`[review-scope] fetching ${r.label}...`);
      git(r.path, ["fetch", "--all", "--quiet"], { allowFail: true });
    }
  }

  const results = [];
  for (const r of selected) {
    const res = reportRepo(r.path, r.label, explicit, cfg, opts);
    if (res) results.push(res);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("SCOPE SUMMARY");
  for (const r of results) console.log(`  ${r.label}: ${r.base}...HEAD`);
  if (!results.length) console.log("  (nothing to review)");
}

try {
  main();
} catch (e) {
  console.error(`[review-scope] ${e.message}`);
  process.exit(1);
}
