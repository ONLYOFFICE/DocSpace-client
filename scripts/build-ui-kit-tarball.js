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

// Rebuilds libs/ui-kit and packs it into a tarball at the repo root so it can
// be consumed as a `file:` dependency instead of a pnpm workspace package.
//
// libs/ui-kit is a plain, independent clone of docspace-ui-kit-react -- not a
// git submodule of this repo -- so it is not created by `git clone` here and
// is gitignored. Run this manually after pulling a new ui-kit commit and
// re-run `pnpm install` in the client repo afterwards to pick up the new
// tarball.

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const uiKitDir = path.join(repoRoot, "libs", "ui-kit");
const tarballName = "onlyoffice-apps-ui-kit.tar.gz";
const tarballPath = path.join(repoRoot, tarballName);

if (!fs.existsSync(path.join(uiKitDir, "package.json"))) {
  console.error(
    `libs/ui-kit not found (expected ${uiKitDir}). ` +
      "Clone it there first, e.g.:\n" +
      "  git clone git@git.onlyoffice.com:ONLYOFFICE/docspace-ui-kit-react.git libs/ui-kit",
  );
  process.exit(1);
}

// `pnpm build` runs generate-exports-map.mjs, which rewrites package.json in
// place with ~900 generated export entries -- needed inside the packed
// tarball, but not something to leave sitting in libs/ui-kit's working tree
// afterwards. Only restore it automatically when it was clean going in;
// otherwise leave it for the developer to sort out rather than discarding
// unrelated in-progress edits.
const packageJsonWasClean =
  execFileSync("git", ["status", "--porcelain", "--", "package.json"], {
    cwd: uiKitDir,
    encoding: "utf8",
  }).trim() === "";

const restorePackageJson = () => {
  if (!packageJsonWasClean) {
    console.warn(
      "libs/ui-kit/package.json had uncommitted changes before the build " +
        "and was left as-is -- it now also carries the generated exports " +
        "map. Review before committing.",
    );
    return;
  }

  execFileSync("git", ["checkout", "--", "package.json"], { cwd: uiKitDir });
};

try {
  console.log("Installing libs/ui-kit dependencies...");
  execFileSync("pnpm", ["install"], { cwd: uiKitDir, stdio: "inherit" });

  console.log("Building libs/ui-kit...");
  execFileSync("pnpm", ["run", "build"], { cwd: uiKitDir, stdio: "inherit" });

  console.log("Packing libs/ui-kit...");
  const packOutput = execFileSync(
    "pnpm",
    ["pack", "--pack-destination", repoRoot],
    { cwd: uiKitDir, encoding: "utf8" },
  ).trim();
  const packedPath = packOutput.split("\n").pop().trim();

  fs.renameSync(packedPath, tarballPath);
} finally {
  restorePackageJson();
}

console.log(`Wrote ${path.relative(repoRoot, tarballPath)}`);
console.log("Run `pnpm install` in the client repo to pick up the new tarball.");
