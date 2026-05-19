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

/**
 * Clear all ai_spell_check_issues in .meta files across all projects.
 *
 * Usage:
 *   cd common/translation-app/backend && node src/scripts/clear-meta-issues.js
 */

const fs = require("fs");
const path = require("path");
const { appRootPath, projectLocalesMap } = require("../config/config");

const LOCALES_DIRS = Object.values(projectLocalesMap).map((rel) =>
  path.join(appRootPath, rel),
);

function walkJson(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJson(full));
    else if (entry.name.endsWith(".json")) results.push(full);
  }
  return results;
}

let clearedFiles = 0;
let clearedIssues = 0;

for (const localesDir of LOCALES_DIRS) {
  const metaDir = path.join(localesDir, ".meta");
  const files = walkJson(metaDir);

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    let changed = false;

    for (const [, lm] of Object.entries(data.languages || {})) {
      if (lm && Array.isArray(lm.ai_spell_check_issues) && lm.ai_spell_check_issues.length > 0) {
        clearedIssues += lm.ai_spell_check_issues.length;
        lm.ai_spell_check_issues = [];
        changed = true;
      }
    }

    if (changed) {
      data.updated_at = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
      clearedFiles++;
    }
  }
}

console.log(`Cleared ${clearedIssues} issues in ${clearedFiles} files.`);
