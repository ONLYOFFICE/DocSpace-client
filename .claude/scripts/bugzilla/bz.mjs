#!/usr/bin/env node
// On-demand Bugzilla bug tool (read-only fetch + attachment download).
//
// This file is committed and MUST stay free of personal/secret data. All
// per-user configuration lives outside version control:
//   - host, default assignee, keychain service, attachment dir:
//       .claude/scripts/bugzilla/config.local.json  (git-ignored; see config.example.json)
//       or env: BZ_HOST, BZ_ASSIGNED, BZ_KEYCHAIN_SERVICE, BZ_ATTACH_DIR
//   - API key (secret): env BZ_API_KEY, or macOS Keychain under the configured
//       service (default "bugzilla-onlyoffice"):
//       security add-generic-password -s <service> -a "$USER" -w '<key>'
//
// Usage:
//   node bz.mjs                              # open bugs assigned to the default user
//   node bz.mjs --assigned foo@bar.com
//   node bz.mjs --product "DocSpace" --component "Files"
//   node bz.mjs --status NEW,CONFIRMED,REOPENED,ASSIGNED
//   node bz.mjs --changed-since 2026-07-01
//   node bz.mjs --url "<buglist.cgi saved-search URL>"
//   node bz.mjs --show 123,456 [--dump-attachments]   # full detail per bug
//   node bz.mjs --limit 50 --json

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  try {
    return JSON.parse(readFileSync(path.join(HERE, "config.local.json"), "utf8"));
  } catch {
    return {};
  }
}

const cfg = loadConfig();
const HOST = (process.env.BZ_HOST || cfg.host || "").replace(/\/$/, "");
const DEFAULT_ASSIGNED = process.env.BZ_ASSIGNED || cfg.assigned || "";
const KEYCHAIN_SERVICE =
  process.env.BZ_KEYCHAIN_SERVICE || cfg.keychainService || "bugzilla";
const ATTACH_DIR =
  process.env.BZ_ATTACH_DIR ||
  cfg.attachDir ||
  path.join(os.homedir(), ".cache", "docspace-bugzilla", "attachments");

const SETUP_HINT =
  "Not configured. Copy config.example.json -> config.local.json (git-ignored) " +
  "and set host + assigned, then add your key to Keychain:\n" +
  `  security add-generic-password -s ${KEYCHAIN_SERVICE} -a "$USER" -w '<key>'`;

function getApiKey() {
  if (process.env.BZ_API_KEY) return process.env.BZ_API_KEY.trim();
  try {
    return execFileSync(
      "security",
      ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"],
      { encoding: "utf8" },
    ).trim();
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    }
  }
  return out;
}

// Turn a buglist.cgi / query.cgi saved-search URL into REST search params.
function paramsFromSavedSearch(url) {
  const u = new URL(url);
  const p = new URLSearchParams();
  for (const [k, v] of u.searchParams.entries()) {
    if (["list_id", "query_format", "known_name"].includes(k)) continue;
    p.append(k, v);
  }
  return p;
}

function buildSearch(args) {
  const p = args.url ? paramsFromSavedSearch(args.url) : new URLSearchParams();

  if (!args.url) {
    const assigned = args.assigned || DEFAULT_ASSIGNED;
    if (assigned) p.set("assigned_to", assigned);
    // resolution=--- means "unresolved / still open"
    p.set("resolution", args.resolution || "---");
    if (args.product) p.set("product", args.product);
    if (args.component) p.set("component", args.component);
    if (args.status) {
      for (const s of String(args.status).split(",")) p.append("bug_status", s.trim());
    }
    if (args.severity) {
      for (const s of String(args.severity).split(",")) p.append("bug_severity", s.trim());
    }
    if (args["changed-since"]) p.set("last_change_time", args["changed-since"]);
  }

  p.set(
    "include_fields",
    "id,summary,product,component,status,resolution,severity,priority,last_change_time",
  );
  p.set("limit", String(args.limit || 100));
  return p;
}

function fmtDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

function decodeEntities(s) {
  return String(s ?? "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function truncate(s, n) {
  s = decodeEntities(s);
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function printTable(bugs) {
  if (bugs.length === 0) {
    console.log("No bugs matched the query.");
    return;
  }
  const rows = bugs.map((b) => ({
    id: String(b.id),
    sev: truncate(b.severity || "", 8),
    where: truncate(`${b.product}/${b.component}`, 28),
    status: truncate(b.status || "", 11),
    summary: truncate(b.summary || "", 70),
    changed: fmtDate(b.last_change_time),
  }));
  const w = (k, h) => Math.max(h.length, ...rows.map((r) => r[k].length));
  const cols = [
    ["id", "ID"],
    ["sev", "SEV"],
    ["where", "PRODUCT/COMPONENT"],
    ["status", "STATUS"],
    ["summary", "SUMMARY"],
    ["changed", "CHANGED"],
  ].map(([k, h]) => ({ k, h, w: w(k, h) }));

  const line = (vals) => cols.map((c, i) => vals[i].padEnd(c.w)).join("  ");
  console.log(line(cols.map((c) => c.h)));
  console.log(cols.map((c) => "-".repeat(c.w)).join("  "));
  for (const r of rows) console.log(line(cols.map((c) => r[c.k])));
  console.log(`\n${bugs.length} bug(s). Link: ${HOST}/show_bug.cgi?id=<ID>`);
}

async function bzGet(pathname, key, extra = {}) {
  const p = new URLSearchParams({ api_key: key, ...extra });
  // This instance ignores the X-BUGZILLA-API-KEY header; only the query param works.
  const res = await fetch(`${HOST}/rest/${pathname}?${p.toString()}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    throw new Error(`[${res.status}] ${body.message || res.statusText}`);
  }
  return body;
}

// Download non-obsolete attachment binaries for a bug into ATTACH_DIR/<id>/.
async function dumpAttachments(id, key) {
  const a = await bzGet(`bug/${id}/attachment`, key); // no include_fields -> includes base64 data
  const list = (a.bugs?.[id] || []).filter((x) => !x.is_obsolete);
  if (list.length === 0) return [];
  const dir = path.join(ATTACH_DIR, String(id));
  mkdirSync(dir, { recursive: true });
  const saved = [];
  for (const at of list) {
    if (!at.data) continue;
    const safe = String(at.file_name || `att-${at.id}`).replace(/[^\w.\-]+/g, "_");
    const file = path.join(dir, `${at.id}-${safe}`);
    writeFileSync(file, Buffer.from(at.data, "base64"));
    saved.push({ file, content_type: at.content_type });
  }
  return saved;
}

// Full detail for one or more bug ids: fields + description (comment #0) +
// attachment list + latest comment. With `dump`, also downloads attachment
// binaries locally so an agent can open screenshots / HAR files.
async function showBugs(ids, key, dump = false) {
  for (const id of ids) {
    let b;
    let comments = [];
    let att = [];
    try {
      b = (await bzGet(`bug/${id}`, key)).bugs?.[0];
      const cm = await bzGet(`bug/${id}/comment`, key);
      comments = cm.bugs?.[id]?.comments || [];
      const a = await bzGet(`bug/${id}/attachment`, key, {
        include_fields: "id,file_name,content_type,size,is_obsolete",
      });
      att = a.bugs?.[id] || [];
    } catch (e) {
      console.log(`#${id}: ${e.message}\n`);
      continue;
    }
    if (!b) {
      console.log(`#${id}: not found\n`);
      continue;
    }

    console.log("=".repeat(80));
    console.log(
      `#${b.id}  [${b.severity}/${b.priority}]  ${b.status}${b.resolution ? `/${b.resolution}` : ""}  ${b.product}/${b.component}`,
    );
    console.log(decodeEntities(b.summary));
    console.log(
      `reporter: ${b.creator}  |  assignee: ${b.assigned_to}  |  created: ${fmtDate(b.creation_time)}  |  changed: ${fmtDate(b.last_change_time)}`,
    );
    const env = [b.version, b.platform, b.op_sys].filter((x) => x && x !== "---");
    if (env.length) console.log(`env: ${env.join(" / ")}`);
    if (b.keywords?.length) console.log(`keywords: ${b.keywords.join(", ")}`);
    console.log(`link: ${HOST}/show_bug.cgi?id=${b.id}`);

    console.log("\n--- description ---");
    console.log(decodeEntities(comments[0]?.text || "(empty)").trim());

    if (att.length) {
      console.log("\n--- attachments ---");
      for (const a of att) {
        console.log(
          `  [${a.id}] ${a.file_name} (${a.content_type}, ${a.size ?? "?"}b)${a.is_obsolete ? " [obsolete]" : ""}`,
        );
      }
      if (dump) {
        try {
          const saved = await dumpAttachments(id, key);
          if (saved.length) {
            console.log("\n  downloaded (open these locally):");
            for (const s of saved) console.log(`    ${s.file}  [${s.content_type}]`);
          }
        } catch (e) {
          console.log(`  (attachment download failed: ${e.message})`);
        }
      }
    }
    if (comments.length > 1) {
      const last = comments[comments.length - 1];
      console.log(`\n--- ${comments.length - 1} more comment(s); latest ---`);
      console.log(
        `(${last.creator}, ${fmtDate(last.time)}) ${decodeEntities(last.text).trim().slice(0, 800)}`,
      );
    }
    console.log();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!HOST) {
    console.error(SETUP_HINT);
    process.exit(2);
  }
  const key = getApiKey();
  if (!key) {
    console.error(`No API key for Keychain service "${KEYCHAIN_SERVICE}".\n${SETUP_HINT}`);
    process.exit(2);
  }

  if (args.show || args.detail) {
    const ids = String(args.show || args.detail)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await showBugs(ids, key, Boolean(args["dump-attachments"] || args.dump));
    return;
  }

  const params = buildSearch(args);
  params.set("api_key", key);
  const url = `${HOST}/rest/bug?${params.toString()}`;
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.error) {
    console.error(`Bugzilla error [${res.status}]: ${body.message || res.statusText}`);
    process.exit(1);
  }

  const bugs = body.bugs || [];
  if (args.json) {
    console.log(JSON.stringify(bugs, null, 2));
  } else {
    printTable(bugs);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
