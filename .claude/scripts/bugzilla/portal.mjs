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

// Test-portal access for /bugs-audit: replay on a real DocSpace what the mocked
// e2e cannot. It only ever talks to the portal configured as testPortal (see
// README.md) - never a production portal.
//
//   node portal.mjs version                      # build versions of the portal
//   node portal.mjs api GET /files/@my           # any /api/2.0 call, JSON out
//   node portal.mjs api PUT /files/fileops/bulkdownload --data '{"folderIds":[1]}'
//   node portal.mjs cookie                       # auth cookie for a browser session
//
// The password is read from BZ_PORTAL_PASSWORD or the Keychain and is never
// printed. The session token is cached (mode 600) under
// ~/.cache/docspace-bugzilla/ until it expires.

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { TEST_PORTAL, getPortalPassword, parseArgs } from "./lib.mjs";

const CACHE_DIR = path.join(os.homedir(), ".cache", "docspace-bugzilla");
const TOKEN_FILE = path.join(CACHE_DIR, "portal-token.json");
const AUTH_COOKIE = "asc_auth_key";

const PASSWORD_HINT =
  "Store the password in the Keychain:\n" +
  `  security add-generic-password -s ${TEST_PORTAL.keychainService} -a ${TEST_PORTAL.user || "<user>"} -w '<password>'\n` +
  "(Windows / Linux: set BZ_PORTAL_PASSWORD instead.)";

function requirePortal() {
  if (!TEST_PORTAL.url || !TEST_PORTAL.user) {
    console.error(`No test portal. Add "testPortal": {"url", "user"} to config.local.json.\n${PASSWORD_HINT}`);
    process.exit(2);
  }
}

function cachedToken() {
  try {
    const t = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
    const fresh = t.url === TEST_PORTAL.url && t.user === TEST_PORTAL.user && Date.parse(t.expires) - Date.now() > 60_000;
    return fresh ? t.token : null;
  } catch {
    return null;
  }
}

async function login() {
  const password = getPortalPassword();
  if (!password) {
    console.error(`No password for ${TEST_PORTAL.user} on ${TEST_PORTAL.url}.\n${PASSWORD_HINT}`);
    process.exit(2);
  }
  const res = await fetch(`${TEST_PORTAL.url}/api/2.0/authentication`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ userName: TEST_PORTAL.user, password }),
  });
  const json = await res.json().catch(() => ({}));
  const token = json.response?.token;
  if (!res.ok || !token) {
    throw new Error(`login failed [${res.status}] ${json.error?.message || json.message || res.statusText}`);
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(
    TOKEN_FILE,
    JSON.stringify({ url: TEST_PORTAL.url, user: TEST_PORTAL.user, token, expires: json.response.expires }),
    { mode: 0o600 },
  );
  chmodSync(TOKEN_FILE, 0o600);
  return token;
}

async function token() {
  return cachedToken() || login();
}

async function api(method, apiPath, data) {
  const url = `${TEST_PORTAL.url}/api/2.0/${apiPath.replace(/^\/?(api\/2\.0\/)?/, "")}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: await token(),
      Accept: "application/json",
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 2000);
  }
  return { status: res.status, body };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [cmd, ...rest] = args._;
  if (!cmd || cmd === "help" || args.help) {
    console.log(readFileSync(new URL(import.meta.url), "utf8").match(/\/\/ Test-portal[\s\S]*?\n\n/)[0].replace(/^\/\/ ?/gm, ""));
    return;
  }
  requirePortal();

  if (cmd === "version") {
    const r = await api("GET", "settings/version/build");
    console.log(JSON.stringify({ portal: TEST_PORTAL.url, status: r.status, ...(r.body?.response ?? { body: r.body }) }, null, 2));
    if (r.status >= 400) process.exitCode = 1;
    return;
  }
  if (cmd === "api") {
    const [method, apiPath] = rest;
    if (!method || !apiPath) {
      console.error("usage: portal.mjs api <METHOD> <path> [--data '<json>' | --data-file <file>]");
      process.exit(2);
    }
    let data;
    if (args["data-file"]) data = JSON.parse(readFileSync(args["data-file"], "utf8"));
    else if (args.data && args.data !== true) data = JSON.parse(args.data);
    const r = await api(method.toUpperCase(), apiPath, data);
    console.log(JSON.stringify(r, null, 2));
    if (r.status >= 400) process.exitCode = 1;
    return;
  }
  if (cmd === "cookie") {
    // For a browser session: page.context().addCookies(<this>) before opening the portal.
    const host = new URL(TEST_PORTAL.url).hostname;
    console.log(JSON.stringify([{ name: AUTH_COOKIE, value: await token(), domain: host, path: "/", secure: TEST_PORTAL.url.startsWith("https") }]));
    return;
  }
  console.error(`Unknown command "${cmd}". Run without arguments for usage.`);
  process.exit(2);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
