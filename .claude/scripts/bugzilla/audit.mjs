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
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import {
  HOST,
  bugLink,
  bzGet,
  bzPut,
  decodeEntities,
  fmtDate,
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
const FOOTER_RE = /[\s—-]*Generated with Claude Code(?: \([^)]*\))?\s*$/;
const LANGS = ["ru", "en"];
const CYRILLIC = /[А-Яа-яЁё]/;
const DAY_MS = 86_400_000;

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
  return path.join(RUNS_DIR, `${stamp}${name}`);
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

const BUG_REF = /\bbug\s*#?\s*(\d{4,6})\b/gi;

function commitIndex(repos) {
  const index = new Map();
  for (const repo of repos) {
    if (!existsSync(path.join(repo, ".git"))) continue;
    let out = "";
    try {
      out = execFileSync(
        "git",
        ["log", "--all", "-i", "-E", "--grep=bug ?#? ?[0-9]{4,6}", "--date=short", "--format=%h%x09%ad%x09%s"],
        { cwd: repo, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 },
      );
    } catch (e) {
      console.error(`git log failed in ${repo}: ${e.message}`);
      continue;
    }
    const name = path.relative(path.resolve(ROOT, "../.."), repo).replace(/\\/g, "/");
    for (const line of out.split("\n")) {
      if (!line) continue;
      const [hash, date, subject = ""] = line.split("\t");
      for (const m of subject.matchAll(BUG_REF)) {
        const id = Number(m[1]);
        if (!index.has(id)) index.set(id, []);
        index.get(id).push({ repo: name, hash, date, subject });
      }
    }
  }
  return index;
}

async function searchOpen(key, product, components) {
  const all = [];
  const page = 500;
  for (let offset = 0; ; offset += page) {
    const res = await bzGet("bug", key, {
      product,
      component: components.length ? components : undefined,
      resolution: "---",
      include_fields: BUG_FIELDS.join(","),
      limit: page,
      offset,
      order: "bug_id",
    });
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

async function withDetail(key, bug) {
  const cm = await bzGet(`bug/${bug.id}/comment`, key);
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
    commentCount: Math.max(0, comments.length - 1),
  };
}

async function cmdExport(args, key) {
  const dir = newRunDir(args);
  mkdirSync(dir, { recursive: true });
  const product = args.product || DEFAULT_PRODUCT;
  const components = list(args.components);
  const suggestionSeverities = list(args["suggestion-severity"]);
  const suggestionSet = new Set(
    (suggestionSeverities.length ? suggestionSeverities : DEFAULT_SUGGESTION_SEVERITIES).map((s) =>
      s.toLowerCase(),
    ),
  );
  const repos = [...COMMIT_REPOS, ...list(args.repos).map((r) => path.resolve(r))];

  const now = Date.now();
  const commits = commitIndex(repos);
  const raw = await searchOpen(key, product, components);
  const bugs = raw.map((b) => ({
    ...b,
    summary: decodeEntities(b.summary),
    whiteboard: decodeEntities(b.whiteboard || ""),
    kind: suggestionSet.has(String(b.severity).toLowerCase()) ? "suggestion" : "bug",
    ageDays: Math.floor((now - Date.parse(b.creation_time)) / DAY_MS),
    idleDays: Math.floor((now - Date.parse(b.last_change_time)) / DAY_MS),
    commits: commits.get(b.id) || [],
    link: bugLink(b.id),
  }));

  writeJson(path.join(dir, "index.json"), {
    exportedAt: new Date(now).toISOString(),
    host: HOST,
    product,
    components,
    bugs,
  });

  let selected;
  if (args.ids) {
    const ids = new Set(list(args.ids).map(Number));
    selected = bugs.filter((b) => ids.has(b.id));
  } else if (args.sample) {
    selected = pickSample(bugs, Number(args.sample));
  } else if (args.batch) {
    const skip = new Set(
      args.skip && existsSync(args.skip) ? readJson(args.skip).map((d) => Number(d.id)) : [],
    );
    selected = bugs.filter((b) => !skip.has(b.id)).slice(0, Number(args.batch));
  } else {
    selected = bugs;
  }

  const detailed = await mapLimit(selected, 5, (b) => withDetail(key, b));
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
  console.log(`exported with detail: ${detailed.length} -> ${path.join(dir, "bugs.json")}`);
}

/* ------------------------------------------------------------------ plan */

const commentOf = (d) => d.comment ?? d.comment_ru ?? "";

function validateDecision(d, bug, fields, lang) {
  const errors = [];
  const resolutions = fields.resolution.filter((v) => v.active).map((v) => v.name);
  const comment = commentOf(d);
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
  if (d.kind === "suggestion" && d.verdict === "valid") {
    if (!COMPLEXITIES.includes(d.complexity)) errors.push(`complexity must be one of ${COMPLEXITIES.join("|")}`);
    if (!VALUES.includes(d.value)) errors.push(`value must be one of ${VALUES.join("|")}`);
    if (!d.rationale) errors.push("rationale is required for a suggestion");
  }
  return errors;
}

function commentCore(text) {
  return text.replace(FOOTER_RE, "").trim();
}

function withFooter(comment, model) {
  return `${commentCore(comment)}\n\n— ${COMMENT_FOOTER} (${model})`;
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
  for (const d of decisions) {
    const bug = byId.get(Number(d.id));
    const errors = validateDecision(d, bug, fields, lang);
    if (errors.length) {
      invalid.push({ id: d.id, errors });
      continue;
    }
    const base = {
      id: bug.id,
      summary: bug.summary,
      verdict: d.verdict,
      expectLastChange: bug.last_change_time,
      comment: withFooter(commentOf(d), model),
    };
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
      const priority = raisePriority(scale, bug.priority);
      const whiteboard = quickfixWhiteboard(bug.whiteboard, d);
      const set = {};
      if (priority !== bug.priority) set.priority = priority;
      if (whiteboard !== bug.whiteboard) set.whiteboard = whiteboard;
      actions.push({
        ...base,
        type: "quickfix",
        set,
        from: { priority: bug.priority, whiteboard: bug.whiteboard },
      });
    } else {
      actions.push({ ...base, type: "comment", set: {}, from: {} });
    }
  }

  writeJson(path.join(dir, "actions.json"), {
    createdAt: new Date().toISOString(),
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
    if (a.comment) console.log(`  comment:\n    ${a.comment.replace(/\n/g, "\n    ")}`);
    console.log();
  }
  const byType = (t) => actions.filter((a) => a.type === t).length;
  console.log(`actions: ${actions.length} (close ${byType("close")}, quickfix ${byType("quickfix")}, comment only ${byType("comment")})`);
  console.log(`needs a human: ${needsHuman.length}`);
  if (invalid.length) {
    console.log(`\ninvalid decisions: ${invalid.length}`);
    for (const i of invalid) console.log(`  #${i.id}: ${i.errors.join("; ")}`);
  }
}

/* ------------------------------------------------------------------ apply */

function fieldsApplied(a, live) {
  return Object.entries(a.set).every(([k, v]) => decodeEntities(live[k] ?? "") === String(v));
}

async function commentPosted(a, key) {
  const res = await bzGet(`bug/${a.id}/comment`, key);
  const comments = res.bugs?.[a.id]?.comments || [];
  const body = commentCore(a.comment);
  return comments.some((c) => commentCore(decodeEntities(c.text)) === body);
}

async function cmdApply(args, key) {
  const dir = requireDir(args);
  const plan = readJson(path.join(dir, "actions.json"));
  const only = new Set(list(args.only).map(Number));
  const actions = plan.actions.filter((a) => !only.size || only.has(a.id));
  const confirm = Boolean(args.confirm);
  const logFile = path.join(dir, "apply-log.json");
  const log = existsSync(logFile) ? readJson(logFile) : {};

  if (!confirm) console.log("DRY RUN (pass --confirm to write)\n");
  for (const a of actions) {
    const live = (await bzGet(`bug/${a.id}`, key, { include_fields: "id,status,resolution,priority,whiteboard,last_change_time" }))
      .bugs?.[0];
    const fieldsDone = live ? fieldsApplied(a, live) : false;
    const commentDone = live ? await commentPosted(a, key) : false;
    const body = fieldsDone ? {} : { ...a.set };
    if (!commentDone) body.comment = { body: a.comment };
    const message = JSON.stringify({ ...(fieldsDone ? {} : a.set), ...(commentDone ? {} : { comment: true }) });
    let result;
    if (!live) {
      result = { outcome: "error", message: "not found" };
    } else if (fieldsDone && commentDone) {
      result = { outcome: "skipped", message: "already applied" };
    } else if (live.last_change_time !== a.expectLastChange) {
      result = { outcome: "conflict", message: `changed at ${live.last_change_time} after export` };
    } else if (!confirm) {
      result = { outcome: "would-apply", message };
    } else {
      try {
        await bzPut(`bug/${a.id}`, key, body);
        result = { outcome: "applied", message };
      } catch (e) {
        result = { outcome: "error", message: e.message };
      }
    }
    console.log(`#${a.id}  ${a.type.padEnd(8)}  ${result.outcome.padEnd(11)}  ${result.message}`);
    if (confirm) log[a.id] = { type: a.type, verdict: a.verdict, at: new Date().toISOString(), ...result };
  }
  if (confirm) writeJson(logFile, log);

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
    .filter((d) => d.kind === "suggestion")
    .map((d) => ({ d, b: byId.get(Number(d.id)) }))
    .filter((x) => x.b);

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
  const entries = [
    ...applied
      .filter(([, r]) => r.type === "close" && r.outcome === "applied")
      .map(([id, r]) => ({ id, section: "Закрыто", text: row(id, r.verdict) })),
    ...applied
      .filter(([, r]) => r.type === "quickfix" && r.outcome === "applied")
      .map(([id, r]) => ({ id, section: "Поднят приоритет (quickfix)", text: row(id, r.message) })),
    ...applied
      .filter(([, r]) => r.type === "comment" && r.outcome === "applied")
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
  plan          check <run>/decisions.json, preview every change -> <run>/actions.json
  apply         re-read each bug and apply the plan; prints only, unless --confirm
  suggestions   suggestions document -> <run>/suggestions.md
  report        final report -> stdout and <run>/report.md

A run is a folder in .claude/scripts/bugzilla/runs/ (git-ignored). "export"
creates a new one; the other commands use the latest unless --dir is given.

Examples:
  audit.mjs fields
  audit.mjs export --components "Files,Rooms" --sample 20 --name pilot
  audit.mjs export --ids 83669,83750
  audit.mjs export --batch 20 --skip .claude/scripts/bugzilla/runs/<run>/decisions.json
  audit.mjs plan --model "Claude Opus 5.5"
  audit.mjs plan --model "Claude Opus 5.5" --lang en
  audit.mjs apply                                  # dry run
  audit.mjs apply --only 83669 --confirm           # one bug first
  audit.mjs apply --confirm
  audit.mjs suggestions
  audit.mjs report
  audit.mjs report --dir .claude/scripts/bugzilla/runs/<run>

Flags:
  export   --out <dir>  --name <label>  --product DocSpace  --components A,B
           --sample N | --ids 1,2 | --batch N --skip <decisions.json>
           --suggestion-severity enhancement  --repos <extra path,...>
           (commits are searched in client, ../server and the ../../ sibling repos
           onlyoffice-ai-chat, docspace-sdk-js, docspace-ui-kit-react, server,
           server-admin-panel - whichever exist)
  plan     --model "<model>" (required; signs every comment)
           --lang ru|en (language of the Bugzilla comments; asked in a terminal
           when omitted, required otherwise; every comment is checked)
           --dir <run>  --decisions <file>  --close-status RESOLVED
  apply    --dir <run>  --only 1,2  --confirm
  others   --dir <run>  (suggestions also --out <file.md>)

Setup: .claude/scripts/bugzilla/README.md (config.local.json + BZ_API_KEY).
decisions.json is written by the /bugs-audit skill; see its SKILL.md.`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const offline = { suggestions: cmdSuggestions, report: cmdReport };
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
