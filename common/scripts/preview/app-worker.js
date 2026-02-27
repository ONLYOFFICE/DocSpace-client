// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
