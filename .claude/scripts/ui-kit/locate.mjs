#!/usr/bin/env node
/**
 * Locate the docspace-ui-kit-react clone that client-side skills read.
 *
 * ui-kit is a separate repository consumed here as a prebuilt tarball; its
 * sources, git history and Storybook prose exist only in a clone somewhere on
 * disk. Resolution order:
 *   1. --uikit-src <path> (CLI) / `explicit` (API)
 *   2. $DOCSPACE_UI_KIT_SRC
 *   3. `uiKitSrc` in config.local.json next to this script (gitignored)
 *   4. ../../docspace-ui-kit-react, relative to the repository root
 * A candidate counts only when its package.json names the ui-kit package -
 * @onlyoffice/apps-ui-kit, or @docspace/ui-kit on branches from before the
 * rename (master, release/v3.8.0), so an old branch reports a line mismatch
 * instead of "not a clone".
 *
 * The path alone is not enough: a clone on the wrong branch answers with
 * confidence and is wrong. `--status` therefore also compares the release
 * line of the clone with the client's. A branch's line is itself when it is
 * a release/hotfix/develop/master/main branch, otherwise the line whose fork
 * point is closest to HEAD (a feature branch cut from release/v4.0.0 is on
 * the release/v4.0.0 line). Skills ask the user when the two lines differ.
 *
 * CLI (from the repo root):
 *   node .claude/scripts/ui-kit/locate.mjs                # prints the path; exit 1 when not found
 *   node .claude/scripts/ui-kit/locate.mjs --status       # path, branches, lines, dirty state, match/MISMATCH
 *   node .claude/scripts/ui-kit/locate.mjs --save <path>  # validate and remember it in config.local.json
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "../../..");
const CONFIG = resolve(SCRIPT_DIR, "config.local.json");
const PACKAGES = new Set(["@onlyoffice/apps-ui-kit", "@docspace/ui-kit"]);
const PACKAGE = "@onlyoffice/apps-ui-kit";

export const DEFAULT_PATH = "../../docspace-ui-kit-react";
export const ENV = "DOCSPACE_UI_KIT_SRC";

function isUiKit(dir) {
  const pkg = resolve(dir, "package.json");
  if (!existsSync(pkg)) return false;
  try {
    return PACKAGES.has(JSON.parse(readFileSync(pkg, "utf8")).name);
  } catch {
    return false;
  }
}

function readConfig() {
  if (!existsSync(CONFIG)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG, "utf8"));
  } catch {
    return {};
  }
}

/** Returns `{ path, source }` on success, `{ error, tried }` otherwise. */
export function locateUiKit({ explicit } = {}) {
  const candidates = [
    [explicit, "--uikit-src"],
    [process.env[ENV], `$${ENV}`],
    [readConfig().uiKitSrc, "config.local.json"],
    [DEFAULT_PATH, "default"],
  ].filter(([p]) => p);
  const tried = [];
  for (const [p, source] of candidates) {
    const abs = isAbsolute(p) ? p : resolve(REPO_ROOT, p);
    if (isUiKit(abs)) return { path: abs, source };
    // An explicit path that is wrong is an error, never a silent fallback.
    if (source === "--uikit-src")
      return { error: `Not a ui-kit clone (no package.json naming ${PACKAGE}): ${abs}`, tried: [abs] };
    tried.push(`${abs} (${source})`);
  }
  return {
    error:
      `ui-kit clone not found. Tried:\n  ${tried.join("\n  ")}\n` +
      `Pass --uikit-src <path>, set ${ENV}, or remember it once: ` +
      "node .claude/scripts/ui-kit/locate.mjs --save <path>",
    tried,
  };
}

const LINE_PATTERNS = [/^release\/.+/, /^hotfix\/.+/, /^develop$/, /^master$/, /^main$/];

function gitIn(repo, args) {
  try {
    return execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** `{ branch, line }` for the checked-out branch of `repo`; see the header. */
export function branchLine(repo) {
  const branch = gitIn(repo, ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (!branch) return { branch: null, line: null };
  const strip = (ref) => ref.replace(/^origin\//, "");
  if (LINE_PATTERNS.some((re) => re.test(branch))) return { branch, line: branch };
  const refs = (gitIn(repo, ["for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin"]) || "")
    .split("\n")
    .filter((ref) => ref && ref !== "origin/HEAD" && LINE_PATTERNS.some((re) => re.test(strip(ref))));
  let best = null;
  for (const ref of refs) {
    const ahead = Number(gitIn(repo, ["rev-list", "--count", `${ref}..HEAD`]));
    if (!Number.isFinite(ahead)) continue;
    if (!best || ahead < best.ahead) best = { line: strip(ref), ahead };
  }
  return { branch, line: best ? best.line : null };
}

/** `locateUiKit` plus the branch comparison: `{ path, source, client, uikit, dirty, match }`. */
export function uiKitStatus({ explicit } = {}) {
  const found = locateUiKit({ explicit });
  if (found.error) return found;
  const client = branchLine(REPO_ROOT);
  const uikit = branchLine(found.path);
  const dirty = Boolean(gitIn(found.path, ["status", "--porcelain"]));
  const match = Boolean(client.line && uikit.line && client.line === uikit.line);
  return { ...found, client, uikit, dirty, match };
}

/** The human lines a skill shows and greps; `status: match` or `status: MISMATCH ...`. */
export function statusLines(st) {
  return [
    `path: ${st.path} (${st.source})`,
    `ui-kit branch: ${st.uikit.branch} (line ${st.uikit.line ?? "unknown"}, ${st.dirty ? "has uncommitted changes" : "clean"})`,
    `client branch: ${st.client.branch} (line ${st.client.line ?? "unknown"})`,
    st.match
      ? "status: match"
      : `status: MISMATCH - the clone is on the ${st.uikit.line ?? "unknown"} line, the client on ${st.client.line ?? "unknown"}`,
  ];
}

function isCli() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isCli()) {
  const args = process.argv.slice(2);
  const save = args.indexOf("--save");
  if (save !== -1) {
    const p = args[save + 1];
    if (!p) {
      console.error("--save needs a path");
      process.exit(2);
    }
    const abs = isAbsolute(p) ? p : resolve(process.cwd(), p);
    if (!isUiKit(abs)) {
      console.error(`Not a ui-kit clone (no package.json naming ${PACKAGE}): ${abs}`);
      process.exit(1);
    }
    writeFileSync(CONFIG, `${JSON.stringify({ ...readConfig(), uiKitSrc: abs }, null, 2)}\n`);
    console.log(`Saved ${abs} to ${CONFIG}`);
    process.exit(0);
  }
  const src = args.indexOf("--uikit-src");
  const explicit = src !== -1 ? args[src + 1] : undefined;
  if (args.includes("--status")) {
    const st = uiKitStatus({ explicit });
    if (st.error) {
      console.error(st.error);
      process.exit(1);
    }
    console.log(statusLines(st).join("\n"));
    process.exit(0);
  }
  const found = locateUiKit({ explicit });
  if (found.error) {
    console.error(found.error);
    process.exit(1);
  }
  console.log(found.path);
}
