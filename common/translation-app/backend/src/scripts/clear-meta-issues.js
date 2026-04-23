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
