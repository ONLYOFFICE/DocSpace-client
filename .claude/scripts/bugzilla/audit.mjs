#!/usr/bin/env node
/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Backlog audit: export open bugs with signals, turn reviewed decisions into a
// dry-run action plan, apply it (the only Bugzilla writer in this repo), and
// render the suggestions document and the final report.
//
// Run with no arguments for usage and examples. Each run lives in
// runs/<date-time>[-name]/ next to this script (git-ignored); every command
// after export picks the latest run unless --dir is given. Without --confirm,
// apply only prints what it would change.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import {
  BACKEND_TEAM,
  FRONT_TEAM,
  HOST,
  TEST_PORTAL,
  bugLink,
  bzGet,
  bzPut,
  decodeEntities,
  fmtDate,
  isBackend,
  isFront,
  parseArgs,
  requireAuth,
} from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const RUNS_DIR = path.join(HERE, "runs");
const COMMIT_REPOS = [
  ROOT,
  "../server",
  "../../onlyoffice-ai-chat",
  "../../docspace-sdk-js",
  "../../docspace-ui-kit-react",
  "../../server",
  "../../server-admin-panel",
].map((r) => path.resolve(ROOT, r));
const DEFAULT_PRODUCT = "DocSpace";
const DEFAULT_SUGGESTION_SEVERITIES = ["enhancement"];
const BUG_FIELDS = [
  "id",
  "summary",
  "product",
  "component",
  "status",
  "resolution",
  "severity",
  "priority",
  "whiteboard",
  "keywords",
  "version",
  "creator",
  "assigned_to",
  "creation_time",
  "last_change_time",
];
const VERDICTS = ["fixed", "obsolete", "quickfix", "valid", "needs-info"];
const CONFIDENCES = ["high", "medium", "low"];
const VALUES = ["high", "medium", "low"];
const COMPLEXITIES = ["S", "M", "L", "XL"];
const SIDES = ["client", "server", "editors", "ai-chat", "ui-kit", "other"];
const SIDE_TITLES = {
  client: "Клиент (DocSpace client)",
  server: "Сервер (DocSpace server)",
  editors: "Редакторы (Docs)",
  "ai-chat": "AI-агент (ai-chat)",
  "ui-kit": "ui-kit",
  other: "Прочее (сборка, инфраструктура)",
};
const SERVER_COMPONENTS = new Set(["API", "Server", "AI"]);
const QUICKFIX_TAG = "[quickfix]";
const COMMENT_FOOTER = "Generated with Claude Code";
// The model name may carry its own parentheses ("Claude Opus 5.5 (1M)").
const FOOTER_RE = /[\s—-]*Generated with Claude Code(?: \(.*\))?\s*$/;
const LANGS = ["ru", "en"];
// The resolutions the audit may set; DUPLICATE and the like need extra fields.
const CLOSE_RESOLUTIONS = ["FIXED", "WORKSFORME", "WONTFIX"];
const WATCHED_FIELDS = ["status", "resolution", "priority", "whiteboard", "assigned_to"];
const CLOSING_RE = /^\s*(Закрываю|Закрыто|Closing|Closed)(?!\p{L})/iu;
const CYRILLIC = /[А-Яа-яЁё]/;
const DAY_MS = 86_400_000;
// A remote branch that counts as the main line for an e2e commit a close links to.
const MAIN_LINE_RE = /^origin\/(master|develop|release\/.+|hotfix\/.+)$/;

// Who may be assigned a bug, by the side its fix belongs to.
const TEAMS = {
  client: { name: "frontTeam", members: FRONT_TEAM, has: isFront },
  server: { name: "backendTeam", members: BACKEND_TEAM, has: isBackend },
};

const git = (args, cwd = ROOT) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

// The e2e commit a client close rests on: it must exist here, carry the spec,
// and say "Bug <ID>" (the server-side git action then comments on the bug with
// it) without "Fix Bug <ID>", which is the fix convention, not a test.
function e2eCommitErrors(id, e2e) {
  if (!e2e?.spec || !e2e?.commit) return ["e2e needs spec and commit"];
  let full;
  let subject;
  try {
    full = git(["rev-parse", "--verify", `${e2e.commit}^{commit}`]);
    subject = git(["log", "-1", "--format=%s", full]);
  } catch {
    return [`e2e commit ${e2e.commit} not found in this repo`];
  }
  const errors = [];
  try {
    git(["cat-file", "-e", `${full}:${e2e.spec}`]);
  } catch {
    errors.push(`e2e spec ${e2e.spec} is not in commit ${e2e.commit}`);
  }
  if (!new RegExp(`\\bBug\\s+${id}\\b`, "i").test(subject)) errors.push(`e2e commit subject must mention "Bug ${id}"`);
  if (/^\s*fix\s+bug\b/i.test(subject)) errors.push('e2e commit subject must not start with "Fix Bug" (that is the fix convention)');
  return errors;
}

function e2eFullHash(commit) {
  return git(["rev-parse", "--verify", `${commit}^{commit}`]);
}

function onMainLine(hash) {
  try {
    return git(["branch", "-r", "--contains", hash])
      .split("\n")
      .map((s) => s.trim())
      .some((b) => MAIN_LINE_RE.test(b));
  } catch {
    return false;
  }
}

// git@host:Org/Repo.git or https://host/Org/Repo(.git) -> https://host/Org/Repo/commit/<hash>
function commitUrl(hash) {
  const remote = git(["remote", "get-url", "origin"]);
  const m = remote.match(/^https?:\/\/(?:[^@/]+@)?([^/]+)\/(.+?)(?:\.git)?$/) || remote.match(/^(?:[\w.-]+@)?([\w.-]+):(.+?)(?:\.git)?$/);
  if (!m) throw new Error(`cannot build a commit link from remote ${remote}`);
  return `https://${m[1]}/${m[2]}/commit/${hash}`;
}

const list = (v) =>
  v === undefined || v === true
    ? []
    : String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");

function newRunDir(args) {
  if (args.out && args.out !== true) return path.resolve(args.out);
  const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const name = args.name && args.name !== true ? `-${String(args.name).replace(/[^\w.-]+/g, "_")}` : "";
  const base = path.join(RUNS_DIR, `${stamp}${name}`);
  let dir = base;
  for (let n = 2; existsSync(dir); n += 1) dir = `${base}-${n}`;
  return dir;
}

// Where the fix belongs, as decided in review; the component is only the fallback.
function sideOf(decision, bug) {
  if (decision?.side) return decision.side;
  return SERVER_COMPONENTS.has(bug?.component) ? "server" : "client";
}

function requireDir(args) {
  if (args.dir && args.dir !== true) return path.resolve(args.dir);
  const runs = existsSync(RUNS_DIR)
    ? readdirSync(RUNS_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort()
    : [];
  if (!runs.length) {
    console.error(`No runs in ${RUNS_DIR}; run "export" first or pass --dir <directory>`);
    process.exit(2);
  }
  const dir = path.join(RUNS_DIR, runs[runs.length - 1]);
  console.error(`run: ${dir}`);
  return dir;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function fieldValues(key, name) {
  const res = await bzGet(`field/bug/${name}`, key);
  const values = res.fields?.[0]?.values || [];
  return values
    .filter((v) => v.name)
    .sort((a, b) => (a.sort_key ?? 0) - (b.sort_key ?? 0))
    .map((v) => ({ name: v.name, isOpen: v.is_open, active: v.is_active !== false }));
}

async function loadFields(key) {
  const [severity, priority, resolution, status] = await Promise.all([
    fieldValues(key, "bug_severity"),
    fieldValues(key, "priority"),
    fieldValues(key, "resolution"),
    fieldValues(key, "bug_status"),
  ]);
  return { severity, priority, resolution, status };
}

function priorityScale(fields) {
  return fields.priority.filter((v) => v.active && v.name !== "---").map((v) => v.name);
}

function raisePriority(scale, current) {
  const i = scale.indexOf(current);
  if (i === -1) return scale[Math.max(0, Math.floor((scale.length - 1) / 2) - 1)];
  return scale[Math.max(0, i - 1)];
}

/* ------------------------------------------------------------------ fields */

async function cmdFields(args, key) {
  const product = args.product || DEFAULT_PRODUCT;
  const fields = await loadFields(key);
  const prod = await bzGet("product", key, { names: product, include_fields: "name,components" });
  const components = (prod.products?.[0]?.components || [])
    .filter((c) => c.is_active !== false)
    .map((c) => c.name)
    .sort();

  if (args.json) {
    console.log(JSON.stringify({ ...fields, product, components }, null, 2));
    return;
  }
  const names = (vals) => vals.filter((v) => v.active).map((v) => v.name).join(", ");
  console.log(`severity:   ${names(fields.severity)}`);
  console.log(`priority:   ${names(fields.priority)}  (raise = one step to the left)`);
  console.log(`status:     ${fields.status.map((v) => `${v.name}${v.isOpen ? "" : "*"}`).join(", ")}  (* closed)`);
  console.log(`resolution: ${names(fields.resolution)}`);
  console.log(`\n${product} components (${components.length}):\n  ${components.join("\n  ")}`);
}

/* ------------------------------------------------------------------ export */

// "Fix Bug 71360, 71316 - …", "Bugs 71558, 71591" and "fix bug 84685, 84686
// and 84688": every id of the chain after "bug" belongs to the commit, not just
// the first one.
const BUG_REF = /\bbugs?\s*#?\s*(\d{4,6}(?:\s*(?:,|&|\/|\band\b)\s*#?\s*\d{4,6})*)\b/gi;
const REVERT_CHAIN = /^(?:\s*revert\b\s*"?)+/i;

// Revert "Revert …" puts the fix back: only an odd number of reverts undoes it.
function isRevert(subject) {
  const chain = subject.match(REVERT_CHAIN)?.[0] || "";
  return (chain.match(/revert/gi) || []).length % 2 === 1;
}

// git log lists newest first, so a stable sort by date keeps same-day order.
function lastIsRevert(commits) {
  if (!commits.some((c) => c.revert)) return false;
  return [...commits].sort((a, b) => b.date.localeCompare(a.date))[0].revert;
}

function commitIndex(repos) {
  const index = new Map();
  for (const repo of repos) {
    if (!existsSync(path.join(repo, ".git"))) continue;
    let out = "";
    try {
      out = execFileSync(
        "git",
        ["log", "--all", "-i", "-E", "--grep=bugs? ?#? ?[0-9]{4,6}", "--date=short", "--format=%h%x09%ad%x09%ae%x09%s"],
        { cwd: repo, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 },
      );
    } catch (e) {
      console.error(`git log failed in ${repo}: ${e.message}`);
      continue;
    }
    const name = path.relative(path.resolve(ROOT, "../.."), repo).replace(/\\/g, "/");
    for (const line of out.split("\n")) {
      if (!line) continue;
      const [hash, date, author = "", subject = ""] = line.split("\t");
      const revert = isRevert(subject);
      const ids = new Set([...subject.matchAll(BUG_REF)].flatMap((m) => m[1].match(/\d{4,6}/g).map(Number)));
      for (const id of ids) {
        if (!index.has(id)) index.set(id, []);
        index.get(id).push({ repo: name, hash, date, author, front: isFront(author), backend: isBackend(author), subject, revert });
      }
    }
  }
  return index;
}

async function searchOpen(key, product, components) {
  const all = [];
  const page = 500;
  for (let offset = 0; ; offset += page) {
    const res = await withRetry(() => bzGet("bug", key, {
      product,
      component: components.length ? components : undefined,
      resolution: "---",
      include_fields: BUG_FIELDS.join(","),
      limit: page,
      offset,
      order: "bug_id",
    }));
    const bugs = res.bugs || [];
    all.push(...bugs);
    if (bugs.length < page) break;
  }
  return all;
}

function pickSample(bugs, n) {
  const chosen = new Map();
  const take = (arr, count) => {
    for (const b of arr) {
      if (chosen.size >= n || count <= 0) break;
      if (chosen.has(b.id)) continue;
      chosen.set(b.id, b);
      count -= 1;
    }
  };
  const byIdle = [...bugs].sort((a, b) => b.idleDays - a.idleDays);
  const third = Math.max(1, Math.round(n / 3));
  take(byIdle.filter((b) => b.commits.length), third);
  take(byIdle.filter((b) => b.kind === "suggestion"), third);
  take(byIdle, n);
  return [...chosen.values()];
}

// Only a network failure or a 5xx is worth repeating; a 4xx answer stays the same.
async function withRetry(fn, attempts = 3) {
  for (let i = 1; ; i += 1) {
    try {
      return await fn();
    } catch (e) {
      if (i >= attempts || (e.status && e.status < 500)) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

function positiveInt(args, name) {
  if (args[name] === undefined) return undefined;
  // A bare flag parses as true, and Number(true) would pass as 1.
  const n = args[name] === true ? Number.NaN : Number(args[name]);
  if (!Number.isInteger(n) || n < 1) {
    console.error(`--${name} must be a positive integer, got "${args[name]}"`);
    process.exit(2);
  }
  return n;
}

async function withDetail(key, bug) {
  const cm = await withRetry(() => bzGet(`bug/${bug.id}/comment`, key));
  const comments = cm.bugs?.[bug.id]?.comments || [];
  const text = (c) => decodeEntities(c?.text || "").trim();
  return {
    ...bug,
    description: text(comments[0]),
    lastComments: comments.slice(1).slice(-3).map((c) => ({
      author: c.creator,
      date: fmtDate(c.time),
      text: text(c).slice(0, 2000),
    })),
    seenComments: comments.length,
    // Who on each team already touched the bug: a hint for side and for whom
    // to assign, never a verdict by itself.
    front: touchedBy(isFront, bug, comments),
    backend: touchedBy(isBackend, bug, comments),
  };
}

function touchedBy(inTeam, bug, comments) {
  return {
    assignee: inTeam(bug.assigned_to),
    creator: inTeam(bug.creator),
    commenters: [...new Set(comments.map((c) => c.creator).filter(inTeam))],
    commitAuthors: [...new Set(bug.commits.map((c) => c.author).filter(inTeam))],
  };
}

const FILES_ONLY_MARK = "files-only.json";

// A bug counts as reviewed - and is left out of --sample/--batch - while its
// last comment is an audit comment (auditedIds), or when its run was marked
// files-only. A reply after the audit comment, a conflict, an error or a
// rejected decision returns it to the pool. --skip adds decisions files;
// --include-reviewed turns all of it off.
function reviewedIds(args, currentDir) {
  const files = list(args.skip).map((f) => path.resolve(f));
  const missing = files.filter((f) => !existsSync(f));
  if (missing.length) {
    console.error(`--skip file(s) not found:\n  ${missing.join("\n  ")}`);
    process.exit(2);
  }
  const ids = new Set(files.flatMap((f) => readJson(f).map((d) => Number(d.id))));
  if (args["include-reviewed"] || !existsSync(RUNS_DIR)) return ids;
  for (const e of readdirSync(RUNS_DIR, { withFileTypes: true })) {
    const run = path.join(RUNS_DIR, e.name);
    if (!e.isDirectory() || run === currentDir) continue;
    const decisions = path.join(run, "decisions.json");
    if (existsSync(path.join(run, FILES_ONLY_MARK)) && existsSync(decisions)) {
      for (const d of readJson(decisions)) ids.add(Number(d.id));
    }
  }
  return ids;
}

// Bugzilla, not the local runs/, is what every checkout shares: a bug whose
// last comment is an audit comment is reviewed whoever ran the audit, and a
// reply after it (an answer to needs-info, say) brings the bug back.
async function auditedIds(key, product) {
  const res = await withRetry(() => bzGet("bug", key, {
    product,
    resolution: "---",
    f1: "longdesc",
    o1: "substring",
    v1: `${COMMENT_FOOTER} (`,
    include_fields: "id",
  }));
  const ids = (res.bugs || []).map((b) => b.id);
  const lastIsAudit = await mapLimit(ids, 5, async (id) => {
    const cm = await withRetry(() => bzGet(`bug/${id}/comment`, key));
    const comments = cm.bugs?.[id]?.comments || [];
    return FOOTER_RE.test(decodeEntities(comments.at(-1)?.text || ""));
  });
  return ids.filter((_, i) => lastIsAudit[i]);
}

// The user declined to write this run to Bugzilla: its bugs still count as
// reviewed, so the next batch moves on instead of picking them again.
function cmdFilesOnly(args) {
  const dir = requireDir(args);
  if (!existsSync(path.join(dir, "decisions.json"))) {
    console.error(`no decisions.json in ${dir}`);
    process.exit(2);
  }
  writeJson(path.join(dir, FILES_ONLY_MARK), { markedAt: new Date().toISOString() });
  console.log(`marked files-only: ${dir}`);
}

// Nothing is written until every bug is fetched: a half-made run folder would
// become the "latest run" for every later command.
async function cmdExport(args, key) {
  const modes = ["ids", "sample", "batch"].filter((m) => args[m] !== undefined);
  if (modes.length > 1) {
    console.error(`pick one of --ids, --sample, --batch; got ${modes.map((m) => `--${m}`).join(", ")}`);
    process.exit(2);
  }
  const dir = newRunDir(args);
  const reviewed = reviewedIds(args, dir);
  // --team front|backend: only the bugs assigned to someone on that team.
  const TEAM_FLAG = { front: TEAMS.client, backend: TEAMS.server };
  const team = args.team === undefined ? null : TEAM_FLAG[args.team];
  if (args.team !== undefined && !team) {
    console.error(`--team must be one of ${Object.keys(TEAM_FLAG).join("|")}`);
    process.exit(2);
  }
  if (team && !team.members.size) {
    console.error(`--team ${args.team} needs "${team.name}" in config.local.json`);
    process.exit(2);
  }
  const sample = positiveInt(args, "sample");
  const batch = positiveInt(args, "batch");
  const product = args.product || DEFAULT_PRODUCT;
  const components = list(args.components);
  const suggestionSeverities = list(args["suggestion-severity"]);
  const suggestionSet = new Set(
    (suggestionSeverities.length ? suggestionSeverities : DEFAULT_SUGGESTION_SEVERITIES).map((s) =>
      s.toLowerCase(),
    ),
  );
  const repos = [...COMMIT_REPOS, ...list(args.repos).map((r) => path.resolve(r))];
  for (const t of Object.values(TEAMS)) {
    if (!t.members.size) console.error(`warning: no "${t.name}" in config.local.json - its signals stay empty and assign_to to it cannot be used`);
  }

  const now = Date.now();
  const commits = commitIndex(repos);
  const raw = await searchOpen(key, product, components);
  if (!args.ids && !args["include-reviewed"]) for (const id of await auditedIds(key, product)) reviewed.add(id);
  const bugs = (team ? raw.filter((b) => team.has(b.assigned_to)) : raw).map((b) => ({
    ...b,
    summary: decodeEntities(b.summary),
    whiteboard: decodeEntities(b.whiteboard || ""),
    kind: suggestionSet.has(String(b.severity).toLowerCase()) ? "suggestion" : "bug",
    ageDays: Math.floor((now - Date.parse(b.creation_time)) / DAY_MS),
    idleDays: Math.floor((now - Date.parse(b.last_change_time)) / DAY_MS),
    commits: commits.get(b.id) || [],
    fixReverted: lastIsRevert(commits.get(b.id) || []),
    link: bugLink(b.id),
  }));

  const unreviewed = bugs.filter((b) => !reviewed.has(b.id));

  let selected;
  if (args.ids) {
    const ids = new Set(list(args.ids).map(Number));
    selected = bugs.filter((b) => ids.has(b.id));
  } else if (sample) {
    selected = pickSample(unreviewed, sample);
  } else if (batch) {
    selected = unreviewed.slice(0, batch);
  } else {
    selected = unreviewed;
  }

  const detailed = await mapLimit(selected, 5, (b) => withDetail(key, b));
  mkdirSync(dir, { recursive: true });
  writeJson(path.join(dir, "index.json"), {
    exportedAt: new Date(now).toISOString(),
    host: HOST,
    product,
    components,
    bugs,
  });
  writeJson(path.join(dir, "bugs.json"), {
    exportedAt: new Date(now).toISOString(),
    host: HOST,
    product,
    components,
    total: bugs.length,
    bugs: detailed,
  });

  const count = (arr, pred) => arr.filter(pred).length;
  console.log(`open in scope: ${bugs.length}  (bugs ${count(bugs, (b) => b.kind === "bug")}, suggestions ${count(bugs, (b) => b.kind === "suggestion")})`);
  console.log(`with "Bug <ID>" commits: ${count(bugs, (b) => b.commits.length)}`);
  console.log(`idle > 365 days: ${count(bugs, (b) => b.idleDays > 365)}`);
  if (!args.ids) console.log(`left out as reviewed in earlier runs: ${count(bugs, (b) => reviewed.has(b.id))}`);
  console.log(`exported with detail: ${detailed.length} -> ${path.join(dir, "bugs.json")}`);
  console.log(`run: ${dir}`);
}

/* ------------------------------------------------------------------ split / merge */

// Parallel review: a component group goes to one part, so an agent stays in one
// repo; a group bigger than one part's share is cut into chunks of that share,
// or a narrow run (one component) would leave a single agent. Largest first,
// each onto the lightest part.
function cmdSplit(args) {
  const dir = requireDir(args);
  const parts = Number(args.parts);
  if (!Number.isInteger(parts) || parts < 2 || parts > 10) {
    console.error("--parts must be an integer from 2 to 10");
    process.exit(2);
  }
  // A new layout would not match decisions already written for the old one.
  const files = readdirSync(dir);
  const decided = files.filter((f) => /^decisions\.part-\d+\.json$/.test(f));
  if (decided.length) {
    console.error(`agents already wrote ${decided.join(", ")}; merge them, or delete them to split again`);
    process.exit(2);
  }
  for (const f of files.filter((f) => /^part-\d+\.json$/.test(f))) unlinkSync(path.join(dir, f));
  const exported = readJson(path.join(dir, "bugs.json"));
  const byComponent = new Map();
  for (const b of exported.bugs) {
    const key = `${sideOf(null, b)}/${b.component}`;
    if (!byComponent.has(key)) byComponent.set(key, []);
    byComponent.get(key).push(b);
  }
  const share = Math.ceil(exported.bugs.length / parts);
  const groups = new Map();
  for (const [key, bugs] of byComponent) {
    if (bugs.length <= share) {
      groups.set(key, bugs);
      continue;
    }
    for (let i = 0; i < bugs.length; i += share) groups.set(`${key}#${i / share + 1}`, bugs.slice(i, i + share));
  }
  const bins = Array.from({ length: Math.min(parts, groups.size) }, () => ({ groups: [], bugs: [] }));
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  for (const [key, bugs] of ordered) {
    const bin = bins.reduce((min, x) => (x.bugs.length < min.bugs.length ? x : min));
    bin.groups.push(key);
    bin.bugs.push(...bugs);
  }
  bins.forEach((bin, i) => {
    const part = i + 1;
    writeJson(path.join(dir, `part-${part}.json`), {
      part,
      groups: bin.groups,
      output: path.join(dir, `decisions.part-${part}.json`),
      bugs: bin.bugs,
    });
    console.log(`part-${part}.json  ${String(bin.bugs.length).padStart(3)} bugs  ${bin.groups.join(", ")}`);
  });
  if (bins.length < parts) console.log(`only ${bins.length} part(s): there are ${groups.size} component group(s)`);
}

function cmdMerge(args) {
  const dir = requireDir(args);
  const exported = readJson(path.join(dir, "bugs.json"));
  const files = readdirSync(dir)
    .filter((f) => /^decisions\.part-\d+\.json$/.test(f))
    .sort();
  if (!files.length) {
    console.error(`no decisions.part-*.json in ${dir}`);
    process.exit(2);
  }
  const seen = new Map();
  const duplicates = [];
  for (const f of files) {
    for (const d of readJson(path.join(dir, f))) {
      const id = Number(d.id);
      if (seen.has(id)) duplicates.push(`#${id} (${seen.get(id)} and ${f})`);
      else seen.set(id, f);
    }
  }
  if (duplicates.length) {
    console.error(`the same bug is decided twice:\n  ${duplicates.join("\n  ")}`);
    process.exit(1);
  }
  const merged = files.flatMap((f) => readJson(path.join(dir, f)));
  const expected = new Set(exported.bugs.map((b) => b.id));
  const missing = [...expected].filter((id) => !seen.has(id));
  const extra = [...seen.keys()].filter((id) => !expected.has(id));
  writeJson(path.join(dir, "decisions.json"), merged);
  console.log(`merged ${merged.length} decision(s) from ${files.length} file(s) -> ${path.join(dir, "decisions.json")}`);
  if (missing.length) {
    console.log(`not reviewed by any part: ${missing.map((id) => `#${id}`).join(", ")}`);
    console.log("review them, write decisions.part-0.json and run merge again");
  }
  if (extra.length) console.log(`not in bugs.json (plan will reject): ${extra.map((id) => `#${id}`).join(", ")}`);
}

/* ------------------------------------------------------------------ plan */

const commentOf = (d) => d.comment ?? "";

function validateDecision(d, bug, fields, lang) {
  const errors = [];
  const active = new Set(fields.resolution.filter((v) => v.active).map((v) => v.name));
  const resolutions = CLOSE_RESOLUTIONS.filter((r) => active.has(r));
  const comment = commentOf(d);
  const closes = (d.verdict === "fixed" || d.verdict === "obsolete") && d.confidence === "high";
  if (comment && !closes && CLOSING_RE.test(comment)) {
    errors.push("comment announces closing, but the bug stays open: rephrase it as a proposal");
  }
  if (!bug) errors.push("not in bugs.json");
  if (!VERDICTS.includes(d.verdict)) errors.push(`verdict must be one of ${VERDICTS.join("|")}`);
  if (!CONFIDENCES.includes(d.confidence)) errors.push(`confidence must be one of ${CONFIDENCES.join("|")}`);
  if (!d.evidence) errors.push("evidence is required");
  if (!comment) errors.push("comment is required: every reviewed bug gets a comment");
  else if (lang === "ru" && !CYRILLIC.test(comment)) errors.push("comment must be in Russian (--lang ru)");
  else if (lang === "en" && CYRILLIC.test(comment)) errors.push("comment must be in English (--lang en)");
  if (d.side && !SIDES.includes(d.side)) errors.push(`side must be one of ${SIDES.join("|")}`);
  if ((d.verdict === "fixed" || d.verdict === "obsolete") && !resolutions.includes(d.resolution)) {
    errors.push(`resolution must be one of ${resolutions.join("|")}`);
  }
  if (d.verdict === "quickfix" && (!d.estimate || !d.area)) errors.push("quickfix needs estimate and area");
  // "Fixed" is closed only once the scenario was replayed and no longer
  // reproduces: an e2e on mocks (client), or, where mocks cannot show it, the
  // test portal. Neither possible -> below high, comment only.
  if (closes && d.verdict === "fixed" && !d.e2e && !d.portal) {
    errors.push("closing as fixed needs a replay: e2e {spec, commit} or portal {version, steps, result}; without one lower confidence to medium");
  }
  if (d.e2e && bug) errors.push(...e2eCommitErrors(bug.id, d.e2e));
  if (d.portal) {
    if (!TEST_PORTAL.url) errors.push('portal check needs "testPortal" in config.local.json');
    for (const f of ["version", "steps", "result"]) if (!d.portal[f]) errors.push(`portal needs ${f}`);
  }
  if (d.assign_to !== undefined) {
    const t = TEAMS[sideOf(d, bug)];
    if (!t) errors.push(`assign_to is only for side ${Object.keys(TEAMS).join("|")}`);
    else if (!t.members.size) errors.push(`assign_to needs "${t.name}" in config.local.json`);
    else if (!t.has(d.assign_to)) errors.push(`assign_to ${d.assign_to} is not in ${t.name}`);
    if (d.confidence !== "high") errors.push("assign_to needs confidence high");
    if (closes) errors.push("assign_to makes no sense on a bug being closed");
  }
  if (bug?.kind === "suggestion" && d.verdict === "valid") {
    if (!COMPLEXITIES.includes(d.complexity)) errors.push(`complexity must be one of ${COMPLEXITIES.join("|")}`);
    if (!VALUES.includes(d.value)) errors.push(`value must be one of ${VALUES.join("|")}`);
    if (!d.rationale) errors.push("rationale is required for a suggestion");
  }
  return errors;
}

function commentCore(text) {
  return text.replace(FOOTER_RE, "").trim();
}

// A replay on the portal backs a close ("does not reproduce") as well as a
// bug that is still there, so only a fixed verdict says it did not reproduce.
const PORTAL_LINE = {
  ru: (v, fixed) => (fixed ? `Не воспроизводится на тестовом портале, версия ${v}.` : `Версия тестового портала: ${v}.`),
  en: (v, fixed) => (fixed ? `Does not reproduce on the test portal, version ${v}.` : `Test portal version: ${v}.`),
};

function withFooter(comment, model, { e2eLink, portalVersion, fixed, lang } = {}) {
  const extra = [
    portalVersion ? PORTAL_LINE[lang](portalVersion, fixed) : "",
    e2eLink ? `E2E: ${e2eLink}` : "",
  ].filter(Boolean);
  const tail = extra.length ? `\n\n${extra.join("\n")}` : "";
  return `${commentCore(comment)}${tail}\n\n— ${COMMENT_FOOTER} (${model})`;
}

function quickfixWhiteboard(current, d) {
  if (current.includes(QUICKFIX_TAG)) return current;
  const tag = `${QUICKFIX_TAG} ~${d.estimate}, ${d.area}`;
  return current ? `${current} ${tag}` : tag;
}

// --lang wins; in a terminal the user is asked; without one (an agent run) the
// flag is required so the language is never picked silently.
async function resolveLang(args) {
  let lang = args.lang && args.lang !== true ? String(args.lang).toLowerCase() : "";
  if (!lang && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question("Bugzilla comment language - 1) ru  2) en  [1]: ");
    rl.close();
    const a = answer.trim().toLowerCase();
    lang = a === "2" || a === "en" ? "en" : a === "" || a === "1" || a === "ru" ? "ru" : a;
  }
  if (!lang) {
    console.error("--lang ru|en is required when not running in a terminal");
    process.exit(2);
  }
  if (!LANGS.includes(lang)) {
    console.error(`--lang must be one of ${LANGS.join("|")}`);
    process.exit(2);
  }
  return lang;
}

async function cmdPlan(args, key) {
  const model = args.model && args.model !== true ? String(args.model).trim() : "";
  if (!model) {
    console.error('--model is required: the model that reviewed the bugs, e.g. --model "Claude Opus 5.5"');
    process.exit(2);
  }
  const lang = await resolveLang(args);
  const dir = requireDir(args);
  const exported = readJson(path.join(dir, "bugs.json"));
  const decisions = readJson(args.decisions || path.join(dir, "decisions.json"));
  const fields = await loadFields(key);
  const scale = priorityScale(fields);
  const closeStatus = args["close-status"] || "RESOLVED";
  if (!fields.status.some((s) => s.name === closeStatus)) {
    console.error(`status ${closeStatus} does not exist on this instance`);
    process.exit(2);
  }
  const byId = new Map(exported.bugs.map((b) => [b.id, b]));

  const actions = [];
  const needsHuman = [];
  const invalid = [];
  // Which of two decisions is meant is not for the plan to guess: both are rejected.
  const times = new Map();
  for (const d of decisions) times.set(Number(d.id), (times.get(Number(d.id)) || 0) + 1);
  for (const [id, n] of times) {
    if (n > 1) invalid.push({ id, errors: [`decided ${n} times in decisions.json; keep one`] });
  }
  for (const d of decisions) {
    if (times.get(Number(d.id)) > 1) continue;
    const bug = byId.get(Number(d.id));
    const errors = validateDecision(d, bug, fields, lang);
    if (errors.length) {
      invalid.push({ id: d.id, errors });
      continue;
    }
    const e2eCommit = d.e2e ? e2eFullHash(d.e2e.commit) : undefined;
    const base = {
      id: bug.id,
      summary: bug.summary,
      verdict: d.verdict,
      watch: Object.fromEntries(WATCHED_FIELDS.map((f) => [f, bug[f] ?? ""])),
      seenComments: bug.seenComments,
      comment: withFooter(commentOf(d), model, {
        e2eLink: e2eCommit && commitUrl(e2eCommit),
        portalVersion: d.portal?.version,
        fixed: d.verdict === "fixed",
        lang,
      }),
      ...(e2eCommit ? { e2eCommit, e2eSpec: d.e2e.spec } : {}),
      ...(d.portal ? { portal: d.portal } : {}),
    };
    // Reassigning within the side's team rides on any action that keeps the bug open.
    const assign =
      d.assign_to && d.assign_to.toLowerCase() !== String(bug.assigned_to).toLowerCase()
        ? { set: { assigned_to: d.assign_to }, from: { assigned_to: bug.assigned_to } }
        : null;
    const closing = d.verdict === "fixed" || d.verdict === "obsolete";
    const confident = d.confidence === "high";
    if (((closing || d.verdict === "quickfix") && !confident) || d.verdict === "needs-info") {
      needsHuman.push({ id: bug.id, summary: bug.summary, verdict: d.verdict, confidence: d.confidence, evidence: d.evidence });
    }
    if (closing && confident) {
      actions.push({
        ...base,
        type: "close",
        set: { status: closeStatus, resolution: d.resolution },
        from: { status: bug.status, resolution: bug.resolution || "" },
      });
    } else if (d.verdict === "quickfix" && confident) {
      const tagged = bug.whiteboard.includes(QUICKFIX_TAG);
      const priority = tagged ? bug.priority : raisePriority(scale, bug.priority);
      const whiteboard = quickfixWhiteboard(bug.whiteboard, d);
      const set = {};
      if (priority !== bug.priority) set.priority = priority;
      if (whiteboard !== bug.whiteboard) set.whiteboard = whiteboard;
      actions.push({
        ...base,
        type: "quickfix",
        set: { ...set, ...assign?.set },
        from: { priority: bug.priority, whiteboard: bug.whiteboard, ...assign?.from },
      });
    } else if (assign) {
      actions.push({ ...base, type: "reassign", ...assign });
    } else {
      actions.push({ ...base, type: "comment", set: {}, from: {} });
    }
  }

  writeJson(path.join(dir, "actions.json"), {
    createdAt: new Date().toISOString(),
    exportedAt: exported.exportedAt,
    model,
    lang,
    host: HOST,
    actions,
    needsHuman,
    invalid,
  });

  console.log(`DRY RUN — nothing is written to Bugzilla. Plan: ${path.join(dir, "actions.json")}\n`);
  for (const a of actions) {
    console.log(`#${a.id}  ${a.summary}\n  ${bugLink(a.id)}`);
    for (const [k, v] of Object.entries(a.set)) console.log(`  ${k}: "${a.from[k] ?? ""}" -> "${v}"`);
    if (a.e2eCommit) {
      console.log(`  e2e: ${a.e2eSpec} @ ${a.e2eCommit.slice(0, 10)}${onMainLine(a.e2eCommit) ? "" : "  (not on a remote main line yet: push before apply)"}`);
    }
    if (a.portal) console.log(`  portal ${a.portal.version}: ${a.portal.steps} -> ${a.portal.result}`);
    if (a.comment) console.log(`  comment:\n    ${a.comment.replace(/\n/g, "\n    ")}`);
    console.log();
  }
  const byType = (t) => actions.filter((a) => a.type === t).length;
  console.log(
    `actions: ${actions.length} (close ${byType("close")}, quickfix ${byType("quickfix")}, ` +
      `reassign ${byType("reassign")}, comment only ${byType("comment")})`,
  );
  console.log(`needs a human: ${needsHuman.length}`);
  if (invalid.length) {
    console.log(`\ninvalid decisions: ${invalid.length}`);
    for (const i of invalid) console.log(`  #${i.id}: ${i.errors.join("; ")}`);
  }
}

/* ------------------------------------------------------------------ apply */

function fieldsApplied(a, live) {
  const norm = (k, v) => (k === "assigned_to" ? String(v).toLowerCase() : String(v));
  return Object.entries(a.set).every(([k, v]) => norm(k, decodeEntities(live[k] ?? "")) === norm(k, v));
}

// The git action comments on the bug when the "Bug <ID>" e2e commit is pushed:
// that comment is part of the plan, not news that overturns it.
function isOwnE2eNote(a, c) {
  return Boolean(a.e2eCommit) && decodeEntities(c.text).includes(a.e2eCommit.slice(0, 7));
}

// Only what can overturn the decision is a conflict: a watched field changed
// after the export, or someone other than the audit commented since. A new CC
// or keyword is not. New comments are the ones past the count seen at export,
// so local and server clocks never meet.
function conflictOf(a, live, comments) {
  const changed = WATCHED_FIELDS.filter((f) => decodeEntities(live[f] ?? "") !== decodeEntities(a.watch[f] ?? ""));
  if (changed.length) return `${changed.join(", ")} changed after export`;
  const foreign = comments
    .slice(a.seenComments)
    .find((c) => !FOOTER_RE.test(decodeEntities(c.text)) && !isOwnE2eNote(a, c));
  return foreign ? `new comment by ${foreign.creator} at ${foreign.time}` : null;
}

async function applyOne(a, key, confirm) {
  let live;
  let comments;
  try {
    live = (
      await bzGet(`bug/${a.id}`, key, { include_fields: ["id", "last_change_time", ...WATCHED_FIELDS].join(",") })
    ).bugs?.[0];
    comments = live ? (await bzGet(`bug/${a.id}/comment`, key)).bugs?.[a.id]?.comments || [] : [];
  } catch (e) {
    return { outcome: "error", message: `read failed: ${e.message}` };
  }
  if (!live) return { outcome: "error", message: "not found" };

  const wanted = commentCore(a.comment);
  const commentDone = comments.some((c) => commentCore(decodeEntities(c.text)) === wanted);
  const fieldsDone = fieldsApplied(a, live);
  if (fieldsDone && commentDone) return { outcome: "skipped", message: "already applied" };
  const conflict = conflictOf(a, live, comments);
  if (conflict) return { outcome: "conflict", message: conflict };
  // The comment links the e2e commit, so it must already be reachable for everyone.
  if (a.e2eCommit && !onMainLine(a.e2eCommit)) {
    return { outcome: "error", message: `e2e commit ${a.e2eCommit.slice(0, 10)} is not on a remote main line; push it first` };
  }
  const body = fieldsDone ? {} : { ...a.set };
  if (!commentDone) body.comment = { body: a.comment };
  const message = JSON.stringify({ ...(fieldsDone ? {} : a.set), ...(commentDone ? {} : { comment: true }) });
  if (!confirm) return { outcome: "would-apply", message };
  try {
    await bzPut(`bug/${a.id}`, key, body);
    return { outcome: "applied", message };
  } catch (e) {
    return { outcome: "error", message: e.message };
  }
}

async function cmdApply(args, key) {
  const dir = requireDir(args);
  const plan = readJson(path.join(dir, "actions.json"));
  if (plan.host && plan.host !== HOST) {
    console.error(`plan was made for ${plan.host}, but the configured host is ${HOST}; refusing to write`);
    process.exit(2);
  }
  if (!plan.model || plan.actions.some((a) => !a.comment || !a.watch || !Number.isInteger(a.seenComments))) {
    console.error("actions.json was made by an older audit.mjs; run plan again");
    process.exit(2);
  }
  const only = new Set(list(args.only).map(Number));
  const unknown = [...only].filter((id) => !plan.actions.some((a) => a.id === id));
  if (unknown.length) console.error(`not in the plan, ignored: ${unknown.map((id) => `#${id}`).join(", ")}`);
  const actions = plan.actions.filter((a) => !only.size || only.has(a.id));
  const confirm = Boolean(args.confirm);
  const logFile = path.join(dir, "apply-log.json");
  const log = existsSync(logFile) ? readJson(logFile) : {};

  if (!confirm) console.log("DRY RUN (pass --confirm to write)\n");
  for (const a of actions) {
    // Written once is final: a later conflict or read error must not erase the
    // record the report is built from.
    if (log[a.id]?.outcome === "applied") {
      console.log(`#${a.id}  ${a.type.padEnd(8)}  ${"applied".padEnd(11)}  already in apply-log.json (${log[a.id].at})`);
      continue;
    }
    const result = await applyOne(a, key, confirm);
    console.log(`#${a.id}  ${a.type.padEnd(8)}  ${result.outcome.padEnd(11)}  ${result.message}`);
    if (!confirm) continue;
    log[a.id] = { type: a.type, verdict: a.verdict, at: new Date().toISOString(), ...result };
    writeJson(logFile, log);
  }

  const tally = {};
  for (const r of Object.values(log)) tally[r.outcome] = (tally[r.outcome] || 0) + 1;
  if (confirm) console.log(`\nlog: ${logFile}  ${JSON.stringify(tally)}`);
}

/* ------------------------------------------------------------------ suggestions */

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const VALUE_TITLES = { high: "Высокая целесообразность", medium: "Средняя целесообразность", low: "Низкая целесообразность" };

function cmdSuggestions(args) {
  const dir = requireDir(args);
  const exported = readJson(path.join(dir, "bugs.json"));
  const decisions = readJson(args.decisions || path.join(dir, "decisions.json"));
  const byId = new Map(exported.bugs.map((b) => [b.id, b]));
  const out = path.resolve(args.out && args.out !== true ? args.out : path.join(dir, "suggestions.md"));

  const items = decisions
    .map((d) => ({ d, b: byId.get(Number(d.id)) }))
    .filter((x) => x.b?.kind === "suggestion");

  const lines = [
    `# Разбор предложений ${exported.product}`,
    "",
    `Выгрузка: ${fmtDate(exported.exportedAt)}. Компоненты: ${exported.components.length ? exported.components.join(", ") : "все"}. ` +
      `Разобрано предложений: ${items.length}.`,
    "",
    "Сложность: S — до дня, M — несколько дней, L — около спринта, XL — больше спринта или нужен бэкенд/дизайн.",
    "",
    "Разделы — по месту, где предложение реализуется (не по компоненту Bugzilla).",
    "",
  ];
  for (const side of SIDES) {
    const sideItems = items.filter((x) => sideOf(x.d, x.b) === side);
    if (!sideItems.length) continue;
    const open = sideItems.filter((x) => x.d.verdict === "valid");
    const closing = sideItems.filter((x) => x.d.verdict === "fixed" || x.d.verdict === "obsolete");
    const other = sideItems.filter((x) => !open.includes(x) && !closing.includes(x));

    lines.push(`## ${SIDE_TITLES[side]} (${sideItems.length})`, "");
    for (const value of VALUES) {
      const group = open
        .filter((x) => x.d.value === value)
        .sort((a, b) => COMPLEXITIES.indexOf(a.d.complexity) - COMPLEXITIES.indexOf(b.d.complexity));
      if (!group.length) continue;
      lines.push(`### ${VALUE_TITLES[value]} (${group.length})`, "");
      lines.push("| Баг | Заголовок | Компонент | Сложность | Обоснование | Где в коде |", "|---|---|---|---|---|---|");
      for (const { d, b } of group) {
        lines.push(`| [#${b.id}](${b.link}) | ${cell(b.summary)} | ${cell(b.component)} | ${d.complexity} | ${cell(d.rationale)} | ${cell(d.evidence)} |`);
      }
      lines.push("");
    }
    if (closing.length) {
      lines.push(`### Закрываются как неактуальные или уже реализованные (${closing.length})`, "");
      lines.push("| Баг | Заголовок | Вердикт | Основание |", "|---|---|---|---|");
      for (const { d, b } of closing) {
        lines.push(`| [#${b.id}](${b.link}) | ${cell(b.summary)} | ${d.verdict} (${d.confidence}) | ${cell(d.evidence)} |`);
      }
      lines.push("");
    }
    if (other.length) {
      lines.push(`### Требуют уточнения (${other.length})`, "");
      lines.push("| Баг | Заголовок | Вердикт | Комментарий |", "|---|---|---|---|");
      for (const { d, b } of other) {
        lines.push(`| [#${b.id}](${b.link}) | ${cell(b.summary)} | ${d.verdict} | ${cell(d.rationale || d.evidence)} |`);
      }
      lines.push("");
    }
  }
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`suggestions: ${items.length} -> ${out}`);
}

/* ------------------------------------------------------------------ report */

function cmdReport(args) {
  const dir = requireDir(args);
  const read = (name) => (existsSync(path.join(dir, name)) ? readJson(path.join(dir, name)) : null);
  const exported = read("bugs.json");
  const decisions = read("decisions.json") || [];
  const plan = read("actions.json");
  const log = read("apply-log.json") || {};
  const byId = new Map((exported?.bugs || []).map((b) => [b.id, b]));
  const decById = new Map(decisions.map((d) => [Number(d.id), d]));
  const sideById = (id) => sideOf(decById.get(Number(id)), byId.get(Number(id)));
  const row = (id, extra) => `- [#${id}](${bugLink(id)}) ${byId.get(Number(id))?.summary ?? ""}${extra ? ` — ${extra}` : ""}`;
  const verdictLine = (ds) => {
    const count = (v) => ds.filter((d) => d.verdict === v).length;
    return (
      `исправлено ${count("fixed")}, неактуально ${count("obsolete")}, быстрый фикс ${count("quickfix")}, ` +
      `актуально ${count("valid")}, нужна информация ${count("needs-info")}`
    );
  };

  const applied = Object.entries(log);
  // "skipped" means the change was already in place: it is done all the same.
  const done = (r) => r.outcome === "applied" || r.outcome === "skipped";
  const entries = [
    ...applied
      .filter(([, r]) => r.type === "close" && done(r))
      .map(([id, r]) => ({ id, section: "Закрыто", text: row(id, r.verdict) })),
    ...applied
      .filter(([, r]) => r.type === "quickfix" && done(r))
      .map(([id, r]) => ({ id, section: "Поднят приоритет (quickfix)", text: row(id, r.message) })),
    ...applied
      .filter(([, r]) => r.type === "reassign" && done(r))
      .map(([id, r]) => ({ id, section: "Переназначено", text: row(id, r.message) })),
    ...applied
      .filter(([, r]) => r.type === "comment" && done(r))
      .map(([id, r]) => ({ id, section: "Оставлен комментарий с разбором (поля не менялись)", text: row(id, r.verdict) })),
    ...applied
      .filter(([, r]) => r.outcome === "conflict" || r.outcome === "error")
      .map(([id, r]) => ({ id, section: "Конфликты и ошибки", text: row(id, `${r.outcome}: ${r.message}`) })),
  ];
  if (plan) {
    for (const a of plan.actions.filter((x) => !log[x.id])) {
      entries.push({ id: a.id, section: "В плане, но не применено", text: row(a.id, a.type) });
    }
    for (const h of plan.needsHuman) {
      entries.push({ id: h.id, section: "Нужен человек", text: row(h.id, `${h.verdict} (${h.confidence}): ${h.evidence}`) });
    }
    for (const i of plan.invalid) {
      entries.push({ id: i.id, section: "Невалидные решения", text: row(i.id, i.errors.join("; ")) });
    }
  }
  const sectionOrder = [
    "Закрыто",
    "Поднят приоритет (quickfix)",
    "Переназначено",
    "Оставлен комментарий с разбором (поля не менялись)",
    "Конфликты и ошибки",
    "В плане, но не применено",
    "Нужен человек",
    "Невалидные решения",
  ];

  const lines = ["## Отчёт по аудиту бэклога", ""];
  if (exported) {
    lines.push(`Открытых в охвате: ${exported.total}; разобрано: ${decisions.length} из ${exported.bugs.length} выгруженных.`, "");
  }
  if (plan?.model) {
    lines.push(`Разбор: ${plan.model} (Claude Code), язык комментариев: ${plan.lang ?? "ru"}.`, "");
  }
  lines.push(`Вердикты: ${verdictLine(decisions)}.`, "");
  lines.push("Разделы — по месту, где чинить (не по компоненту Bugzilla).", "");

  for (const side of SIDES) {
    const sideDecisions = decisions.filter((d) => sideById(d.id) === side);
    const sideEntries = entries.filter((e) => sideById(e.id) === side);
    if (!sideDecisions.length && !sideEntries.length) continue;
    lines.push(`### ${SIDE_TITLES[side]} — ${sideDecisions.length}`, "");
    if (sideDecisions.length) lines.push(`Вердикты: ${verdictLine(sideDecisions)}.`, "");
    for (const title of sectionOrder) {
      const group = sideEntries.filter((e) => e.section === title);
      if (group.length) lines.push(`#### ${title} (${group.length})`, "", ...group.map((e) => e.text), "");
    }
  }
  const suggestions = path.join(dir, "suggestions.md");
  if (existsSync(suggestions)) lines.push(`Документ с предложениями: ${suggestions}`);
  const text = lines.join("\n");
  writeFileSync(path.join(dir, "report.md"), `${text}\n`, "utf8");
  console.log(text);
  console.error(`\nreport: ${path.join(dir, "report.md")}`);
}

/* ------------------------------------------------------------------ main */

const USAGE = `Bugzilla backlog audit (run from the repo root)

  node .claude/scripts/bugzilla/audit.mjs <command> [flags]

Commands (only "apply --confirm" writes to Bugzilla):
  fields        field values of this instance and the product components
  export        open bugs with signals -> <run>/index.json, <run>/bugs.json
  split         divide <run>/bugs.json into part-<k>.json for parallel review (--parts N)
  merge         join decisions.part-<k>.json into <run>/decisions.json, check coverage
  files-only    mark a run not written to Bugzilla as reviewed, so batches move on
  plan          check <run>/decisions.json, preview every change -> <run>/actions.json
  apply         re-read each bug and apply the plan; prints only, unless --confirm
  suggestions   suggestions document -> <run>/suggestions.md
  report        final report -> stdout and <run>/report.md

A run is a folder in .claude/scripts/bugzilla/runs/ (git-ignored). "export"
creates a new one; the other commands use the latest unless --dir is given.

Examples:
  audit.mjs fields
  audit.mjs export --components "Files,Rooms" --sample 20 --name pilot
  audit.mjs export --ids <id>,<id>
  audit.mjs export --batch 20                      # next 20 not reviewed in any earlier run
  audit.mjs split --parts 3                        # parallel review: one part per agent
  audit.mjs merge                                  # after the agents wrote their parts
  audit.mjs plan --model "Claude Opus 5.5"
  audit.mjs plan --model "Claude Opus 5.5" --lang en
  audit.mjs apply                                  # dry run
  audit.mjs apply --only <id> --confirm            # one bug first
  audit.mjs apply --confirm
  audit.mjs suggestions
  audit.mjs report
  audit.mjs report --dir .claude/scripts/bugzilla/runs/<run>

Flags:
  export   --out <dir>  --name <label>  --product DocSpace  --components A,B
           --sample N | --ids 1,2 | --batch N
           (one of the three; --sample/--batch leave out bugs whose last comment
           is an audit comment and the bugs of a run marked files-only;
           --skip <decisions.json,...> adds more, --include-reviewed turns that off)
           --team front|backend  (only bugs assigned to that team from config.local.json)
           --suggestion-severity enhancement  --repos <extra path,...>
           (commits are searched in client, ../server and the ../../ sibling repos
           onlyoffice-ai-chat, docspace-sdk-js, docspace-ui-kit-react, server,
           server-admin-panel - whichever exist)
  plan     --model "<model>" (required; signs every comment)
           --lang ru|en (language of the Bugzilla comments; asked in a terminal
           when omitted, required otherwise; every comment is checked)
           --dir <run>  --decisions <file>  --close-status RESOLVED
  apply    --dir <run>  --only 1,2  --confirm
  split    --dir <run>  --parts 2..10  (replaces part-<k>.json; refuses once
           decisions.part-<k>.json exist)
  others   --dir <run>  (suggestions also --out <file.md>)

Decision extras checked by plan:
  e2e {spec, commit}   a replay on mocks; the commit must hold the spec and say
                       "Bug <ID>" (not "Fix Bug"); the comment links it and
                       apply waits until it is pushed to origin
                       master/develop/release/*/hotfix/*
  portal {version, steps, result}
                       a replay on the test portal (portal.mjs) when mocks
                       cannot show it; the comment names the version
                       (closing as fixed with confidence high needs e2e or portal)
  assign_to <email>    reassign an open bug (confidence high, not closing) to
                       its side's team in config.local.json: client -> frontTeam,
                       server -> backendTeam

Setup: .claude/scripts/bugzilla/README.md (config.local.json + BZ_API_KEY).
decisions.json is written by the /bugs-audit skill; see its SKILL.md.`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const offline = {
    split: cmdSplit,
    merge: cmdMerge,
    "files-only": cmdFilesOnly,
    suggestions: cmdSuggestions,
    report: cmdReport,
  };
  const online = { fields: cmdFields, export: cmdExport, plan: cmdPlan, apply: cmdApply };

  if (!cmd || cmd === "help" || args.help) {
    console.log(USAGE);
    return;
  }
  if (offline[cmd]) return offline[cmd](args);
  if (online[cmd]) return online[cmd](args, requireAuth());
  console.error(`Unknown command "${cmd}".\n\n${USAGE}`);
  process.exit(2);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
