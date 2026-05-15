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

const path = require("path");
const fs = require("fs");

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const publishPath = path.resolve(repoRoot, "..", "publish", "web", "apps");
const packagesPath = path.resolve(repoRoot, "packages");

const apps = ["login", "doceditor", "management", "sdk"];

// Clean publish directory
if (fs.existsSync(publishPath)) {
  fs.rmSync(publishPath, { recursive: true });
}
fs.mkdirSync(publishPath, { recursive: true });

// Merge standalone outputs from all 4 apps
for (const app of apps) {
  const appDir = path.join(packagesPath, app);
  const standalonePath = path.join(appDir, ".next", "standalone");
  const staticPath = path.join(appDir, ".next", "static");

  // Copy standalone output (merges node_modules, packages/, libs/)
  console.log(`Merging standalone output from ${app}...`);
  fs.cpSync(standalonePath, publishPath, { recursive: true });

  // Copy static assets to the correct location
  const staticDest = path.join(
    publishPath,
    "packages",
    app,
    ".next",
    "static",
  );
  console.log(`Copying static assets for ${app}...`);
  fs.mkdirSync(staticDest, { recursive: true });
  fs.cpSync(staticPath, staticDest, { recursive: true });
}

// Fix absolute symlinks.
// pnpm standalone builds create absolute symlinks (e.g.
// node_modules/next -> /abs/build/path/.pnpm/next@.../node_modules/next).
// After copying to a different location these break. Convert them to relative.
const standaloneRoots = apps.map((app) =>
  path.resolve(packagesPath, app, ".next", "standalone"),
);

let fixedSymlinks = 0;

function fixAbsoluteSymlinks(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      const target = fs.readlinkSync(fullPath);
      if (path.isAbsolute(target)) {
        for (const root of standaloneRoots) {
          if (target.startsWith(root + "/")) {
            const relativeToRoot = path.relative(root, target);
            const targetInOutput = path.join(publishPath, relativeToRoot);
            const relativeLink = path.relative(
              path.dirname(fullPath),
              targetInOutput,
            );
            fs.unlinkSync(fullPath);
            fs.symlinkSync(relativeLink, fullPath);
            fixedSymlinks++;
            break;
          }
        }
      }
    } else if (entry.isDirectory()) {
      fixAbsoluteSymlinks(fullPath);
    }
  }
}

console.log("Fixing absolute symlinks...");
fixAbsoluteSymlinks(publishPath);
console.log(`Fixed ${fixedSymlinks} absolute symlinks.`);

// Copy the server entry points
fs.copyFileSync(
  path.join(__dirname, "server.prod.js"),
  path.join(publishPath, "server.js"),
);
fs.copyFileSync(
  path.join(__dirname, "server.js"),
  path.join(publishPath, "server.combined.js"),
);
fs.copyFileSync(
  path.join(__dirname, "app-worker.js"),
  path.join(publishPath, "app-worker.js"),
);

console.log("Preview deploy completed successfully.");
console.log(`Output: ${publishPath}`);
