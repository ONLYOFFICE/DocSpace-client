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

import { describe, it, expect, beforeAll } from "vitest";
const fs = require("fs");
const path = require("path");
const { getAllFiles, getWorkSpaces, BASE_DIR } = require("../utils/files");

// A selector on the class or style attribute - `[class*="buttonsContainer"]`,
// `[style*="display: none"]` - makes the browser restyle every element that
// has a class whenever anything below the rule changes: the feature it keeps
// for such a selector is the attribute name, and every element has one.
// Behind a `:has()` in the section header it cost a scrolled list most of its
// style time. Give the element a class of its own and match that; see
// .claude/rules/css-selectors.md.
//
// The baseline holds the files that still do it, with how many lines each. It
// must only ever shrink: a file with more lines fails, and one with fewer fails
// until its count is lowered (or the entry removed at 0).
const allowlist = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "css-selectors-allowlist.json"),
    "utf8",
  ),
);

// Directories that hold no first-party source, matched by whole path segment,
// as in tabindex.test.js.
const excludedSegments = new Set([
  ".nx",
  ".github",
  ".vscode",
  ".git",
  "dist",
  ".next",
  "storybook-static",
]);
const isExcluded = (relPath) =>
  relPath.split("/").some((segment) => excludedSegments.has(segment));
const stylePattern = /\.(scss|css)$/;
// Any operator: `*=`, `^=`, `$=`, `~=`, `|=` or a plain `=`.
const slowSelector = /\[\s*(?:class|style)\s*[~|^$*]?=/;
const toRelPath = (filePath) =>
  path.relative(BASE_DIR, filePath).split(path.sep).join("/");

// Comments blanked with their newlines kept, so line numbers still hold: a
// comment may name the selector it warns against. `//` after a colon is a URL.
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

let offenders = new Map();

beforeAll(() => {
  const files = getWorkSpaces().flatMap((wsPath) =>
    getAllFiles(wsPath, ["node_modules"]).filter(
      (filePath) =>
        filePath &&
        !isExcluded(toRelPath(filePath)) &&
        stylePattern.test(filePath),
    ),
  );

  files.forEach((filePath) => {
    const lines = stripComments(fs.readFileSync(filePath, "utf8"))
      .split("\n")
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .filter(({ line }) => slowSelector.test(line));
    if (!lines.length) return;
    offenders.set(toRelPath(filePath), lines);
  });
  console.log(`Stylesheets matching on class or style = ${offenders.size}.`);
});

describe("CSS selector Tests", () => {
  it("SlowCssSelectors: no stylesheet matches on the class or style attribute beyond the baseline", () => {
    const fresh = [...offenders].filter(
      ([relPath, lines]) => lines.length > (allowlist[relPath] ?? 0),
    );
    const message =
      `These stylesheets match on the class or style attribute, which ` +
      `restyles every element with a class on each change below the rule. ` +
      `Give the element a class of its own and match that ` +
      `(.claude/rules/css-selectors.md).\r\n\r\n` +
      fresh
        .map(
          ([relPath, lines], i) =>
            `${i + 1}. ${relPath} (${lines.length}, ${allowlist[relPath] ?? 0} allowed)\n` +
            lines
              .map(({ line, number }) => `     ${number}: ${line}`)
              .join("\n"),
        )
        .join("\n");

    expect(fresh.length, message).toBe(0);
  });

  it("StaleCssSelectorsAllowlist: the baseline only counts lines that are still there", () => {
    const stale = Object.entries(allowlist).filter(
      ([relPath, allowed]) => (offenders.get(relPath)?.length ?? 0) < allowed,
    );
    const message =
      `These entries in css-selectors-allowlist.json allow more lines than ` +
      `the file still has - lower the count, or remove the entry at 0:\r\n\r\n` +
      stale
        .map(
          ([relPath, allowed], i) =>
            `${i + 1}. ${relPath}: ${offenders.get(relPath)?.length ?? 0} of ${allowed}`,
        )
        .join("\n");

    expect(stale.length, message).toBe(0);
  });

  it("SlowCssSelectorsPattern: the pattern tells the class attribute from others", () => {
    const matches = (line) => slowSelector.test(stripComments(line));
    expect(matches('.a [class*="x"] {}')).toBe(true);
    expect(matches('.a:has([style*="display: none"]) {}')).toBe(true);
    expect(matches(".a [ class = 'x' ] {}")).toBe(true);
    expect(matches('.a [data-class*="x"] {}')).toBe(false);
    expect(matches(".a [data-row-focus] {}")).toBe(false);
    expect(matches('// never [class*="x"]')).toBe(false);
    expect(matches('/* nor [style*="x"] */ .a {}')).toBe(false);
  });
});
