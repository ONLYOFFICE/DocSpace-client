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

// Per-app child process wrapper for the preview server.
// Starts a single Next.js app in its own isolated process.
// Usage: node app-worker.js <app-directory>

const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node app-worker.js <app-directory>");
  process.exit(1);
}

const resolvedDir = path.resolve(dir);
process.chdir(resolvedDir);
process.env.NODE_ENV = "production";

// Read config from required-server-files.json (baked at build time).
// Patch trustHostHeader so Next.js accepts requests where Host doesn't
// match hostname:port (we're behind a reverse proxy).
const configPath = path.join(resolvedDir, ".next", "required-server-files.json");
const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
if (data.config && data.config.experimental) {
  data.config.experimental.trustHostHeader = true;
}
const nextConfig = data.config;

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

// Resolve `next` from the app's own node_modules (handles pnpm symlinks).
const appRequire = createRequire(path.join(resolvedDir, "package.json"));
appRequire("next");
const { startServer } = appRequire("next/dist/server/lib/start-server");

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
if (
  Number.isNaN(keepAliveTimeout) ||
  !Number.isFinite(keepAliveTimeout) ||
  keepAliveTimeout < 0
) {
  keepAliveTimeout = undefined;
}

startServer({
  dir: resolvedDir,
  isDev: false,
  config: nextConfig,
  hostname,
  port: currentPort,
  allowRetry: false,
  keepAliveTimeout,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
