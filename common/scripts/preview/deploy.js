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
