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

// Shared Bugzilla config + REST helpers for bz.mjs and audit.mjs.
// Must stay free of personal/secret data; see README.md for the local config.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
export const HOST = (process.env.BZ_HOST || cfg.host || "").replace(/\/$/, "");
export const DEFAULT_ASSIGNED = process.env.BZ_ASSIGNED || cfg.assigned || "";
export const KEYCHAIN_SERVICE =
  process.env.BZ_KEYCHAIN_SERVICE || cfg.keychainService || "bugzilla";
// The people who fix the client (frontend) and the server (backend). Personal
// data: only in config.local.json ("frontTeam" / "backendTeam": [...]) or
// BZ_FRONT_TEAM / BZ_BACKEND_TEAM (comma-separated).
const team = (env, list) =>
  new Set(
    (env ? env.split(",") : list || [])
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean),
  );
const norm = (email) => String(email || "").trim().toLowerCase();
export const FRONT_TEAM = team(process.env.BZ_FRONT_TEAM, cfg.frontTeam);
export const BACKEND_TEAM = team(process.env.BZ_BACKEND_TEAM, cfg.backendTeam);
export const isFront = (email) => FRONT_TEAM.has(norm(email));
export const isBackend = (email) => BACKEND_TEAM.has(norm(email));

// A DocSpace test portal to replay what the mocked e2e cannot. url + user come
// from config.local.json ("testPortal": {"url", "user", "keychainService"}) or
// BZ_PORTAL_URL / BZ_PORTAL_USER; the password, like the API key, never sits in
// a file: BZ_PORTAL_PASSWORD, or the macOS Keychain under keychainService.
const portalCfg = cfg.testPortal || {};
export const TEST_PORTAL = {
  url: (process.env.BZ_PORTAL_URL || portalCfg.url || "").replace(/\/$/, ""),
  user: process.env.BZ_PORTAL_USER || portalCfg.user || "",
  keychainService: portalCfg.keychainService || "docspace-test-portal",
};

export function getPortalPassword() {
  if (process.env.BZ_PORTAL_PASSWORD) return process.env.BZ_PORTAL_PASSWORD;
  try {
    return execFileSync(
      "security",
      ["find-generic-password", "-s", TEST_PORTAL.keychainService, "-a", TEST_PORTAL.user, "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).replace(/\n$/, "");
  } catch {
    return null;
  }
}
export const ATTACH_DIR =
  process.env.BZ_ATTACH_DIR ||
  cfg.attachDir ||
  path.join(os.homedir(), ".cache", "docspace-bugzilla", "attachments");

export const SETUP_HINT =
  "Not configured. Copy config.example.json -> config.local.json (git-ignored) " +
  "and set host + assigned, then add your key to Keychain:\n" +
  `  security add-generic-password -s ${KEYCHAIN_SERVICE} -a "$USER" -w '<key>'\n` +
  "(Windows / Linux: set the BZ_API_KEY environment variable instead.)";

export function getApiKey() {
  if (process.env.BZ_API_KEY) return process.env.BZ_API_KEY.trim();
  try {
    return execFileSync(
      "security",
      ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return null;
  }
}

// Exits with the setup hint when the host or the key is missing.
export function requireAuth() {
  if (!HOST) {
    console.error(SETUP_HINT);
    process.exit(2);
  }
  const key = getApiKey();
  if (!key) {
    console.error(`No API key for Keychain service "${KEYCHAIN_SERVICE}".\n${SETUP_HINT}`);
    process.exit(2);
  }
  return key;
}

export function parseArgs(argv) {
  const out = { _: [] };
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
    } else {
      out._.push(a);
    }
  }
  return out;
}

export function fmtDate(iso) {
  if (!iso) return "";
  return String(iso).slice(0, 10);
}

export function decodeEntities(s) {
  return String(s ?? "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function bugLink(id) {
  return `${HOST}/show_bug.cgi?id=${id}`;
}

// This instance ignores the X-BUGZILLA-API-KEY header; only the query param works.
async function bzRequest(method, pathname, key, query, body) {
  const p = new URLSearchParams();
  p.set("api_key", key);
  for (const [k, v] of Object.entries(query)) {
    if (Array.isArray(v)) for (const x of v) p.append(k, x);
    else if (v !== undefined && v !== null) p.set(k, String(v));
  }
  const res = await fetch(`${HOST}/rest/${pathname}?${p.toString()}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const err = new Error(`[${res.status}] ${json.message || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export function bzGet(pathname, key, extra = {}) {
  return bzRequest("GET", pathname, key, extra);
}

export function bzPut(pathname, key, body) {
  return bzRequest("PUT", pathname, key, {}, body);
}
