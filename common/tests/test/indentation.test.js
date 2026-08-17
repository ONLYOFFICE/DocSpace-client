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
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, beforeAll } from "vitest";

const fs = require("fs");
const path = require("path");

const { BASE_DIR } = require("../utils/files");

// Files that already mixed tabs and spaces before this check existed.
// Must only ever shrink.
const allowlist = require("./indentation-allowlist.json");

// Biome's formatter is disabled in this repository (packages/shared/biome.json
// sets formatter.enabled = false), so nothing else notices when a bulk codemod
// rewrites a line with a flat run of tabs inside an otherwise space-indented
// file. That happened across 17 files during the productName rename: the
// generated line carried four tabs regardless of the real nesting depth.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".nx",
  ".next",
  ".meta",
  "dist",
  "build",
  "coverage",
  "storybook-static",
  ".yarn",
]);

const SOURCE_RE = /\.(ts|tsx|js|jsx)$/;
const EXCLUDE_RE = /\.test\.|\.stories\.|\.d\.ts$/;

let mixedFiles = [];

/**
 * Line indices that fall inside a multi-line template literal. Leading
 * whitespace there is string content — embedded SVG markup and CSS keep their
 * own indentation — so it must not be read as the file's code style.
 *
 * @param {string} source
 * @returns {Set<number>} zero-based line indices to ignore
 */
const templateLiteralLines = (source) => {
  const inside = new Set();
  let open = false;

  source.split("\n").forEach((line, index) => {
    if (open) inside.add(index);
    let escaped = false;
    for (const char of line) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "`") open = !open;
    }
  });

  return inside;
};

const collect = (dir, out) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(full, out);
    } else if (SOURCE_RE.test(entry.name) && !EXCLUDE_RE.test(entry.name)) {
      out.push(full);
    }
  }
};

beforeAll(() => {
  const roots = ["packages", "libs/ui-kit", "common"]
    .map((rel) => path.resolve(BASE_DIR, rel))
    .filter((abs) => fs.existsSync(abs));

  const files = [];
  roots.forEach((root) => collect(root, files));
  console.log(`Checking indentation in ${files.length} files.`);

  const allowed = new Set(allowlist.mixedIndentation);

  files.forEach((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const lines = source.split("\n");
    const inTemplate = templateLiteralLines(source);

    const tabLines = [];
    let spaceLines = 0;
    lines.forEach((line, index) => {
      if (inTemplate.has(index)) return;
      if (/^\t/.test(line)) tabLines.push({ line: index + 1, text: line });
      else if (/^ {2,}\S/.test(line)) spaceLines += 1;
    });

    // A wholly tab-indented file is a style of its own and left alone; only a
    // file using both is ambiguous.
    if (!tabLines.length || !spaceLines) return;

    const relative = path.relative(BASE_DIR, filePath).split(path.sep).join("/");
    if (allowed.has(relative)) return;

    mixedFiles.push({
      path: relative,
      spaceLines,
      tabLines: tabLines.slice(0, 5),
      tabCount: tabLines.length,
    });
  });

  console.log(`Found files with mixed indentation = ${mixedFiles.length}.`);
});

describe("Indentation Tests", () => {
  it("MixedIndentationTest: Verify that no source file mixes tab and space indentation", () => {
    let message =
      "Next source files indent some lines with tabs and others with spaces.\r\n" +
      "Re-indent the tab lines to match the surrounding block:\r\n\r\n";

    mixedFiles.forEach((file, i) => {
      message += `${i + 1}. ${file.path} (${file.tabCount} tab-indented, ${file.spaceLines} space-indented)\r\n`;
      file.tabLines.forEach((l) => {
        message += `     :${l.line}  ${l.text.replace(/\t/g, "[TAB]").trim().slice(0, 90)}\r\n`;
      });
      message += "\r\n";
    });

    expect(mixedFiles.length, message).toBe(0);
  });
});
