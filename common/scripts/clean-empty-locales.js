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

const { readdir, readFile, rm, stat } = require("fs/promises");
const path = require("path");

const LOCALES_DIRS = [
  "../../packages/client/public/locales",
  "../../packages/login/public/locales",
  "../../packages/doceditor/public/locales",
  "../../packages/management/public/locales",
  "../../public/locales",
];

const SKIP_DIRS = new Set([".meta", ".constants"]);

async function scanDir(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanDir(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function isEmpty(filePath) {
  const content = (await readFile(filePath, "utf8")).trim();
  return content === "" || content === "{}";
}

async function run() {
  console.log("=== Cleaning empty locale files ===\n");

  let totalDeleted = 0;

  for (const relDir of LOCALES_DIRS) {
    const absDir = path.join(__dirname, relDir);
    const files = await scanDir(absDir);

    for (const file of files) {
      if (await isEmpty(file)) {
        await rm(file);
        console.log(`Deleted: ${path.relative(process.cwd(), file)}`);
        totalDeleted++;
      }
    }
  }

  console.log(`\nDone. Deleted ${totalDeleted} empty locale file(s).`);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
