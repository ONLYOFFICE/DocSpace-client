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

// A positive tabIndex jumps its element ahead of every tabIndex 0 element on
// the page, whatever the DOM order: a form or a dialog with a few of them
// set sends Tab to its footer before its fields. ui-kit's focus trap keeps
// that order inside dialogs, as the browser does, so the values themselves
// must go - set none, and let the DOM order be the Tab order.
//
// The baseline freezes the pages that still set them. It must only ever
// shrink: when a file is fixed or deleted, remove it from the JSON (the
// stale-baseline test enforces this).
const allowlist = new Set(
  JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "tabindex-allowlist.json"), "utf8"),
  ),
);

// Directories that hold no first-party source, matched by whole path
// segment. The shared walker excludes any path that merely contains one of
// its names, which took every directory named like "common" or "test" out of
// the scan; it is given only node_modules, too large to walk.
const excludedSegments = new Set([
  ".nx",
  "e2e",
  ".github",
  ".vscode",
  ".git",
  "__mocks__",
  "__tests__",
  "dist",
  "test",
  "tests",
  ".next",
  "storybook-static",
]);
const isExcluded = (relPath) =>
  relPath.split("/").some((segment) => excludedSegments.has(segment));
const sourcePattern = /\.(js|jsx|ts|tsx)$/;
// `tabIndex={2}`, `tabIndex: 2`, `tabindex="2"` - any value above zero.
const positiveTabIndex = /tab[iI]ndex\s*(?:=\s*\{?\s*["']?|:\s*["']?)0*[1-9]/;
const commentPrefix = /^\s*(\/\/|\/?\*)/;
const toRelPath = (filePath) =>
  path.relative(BASE_DIR, filePath).split(path.sep).join("/");

let offenders = new Map();
let scanned = new Set();

beforeAll(() => {
  const files = getWorkSpaces().flatMap((wsPath) =>
    getAllFiles(wsPath, ["node_modules"]).filter(
      (filePath) =>
        filePath &&
        !isExcluded(toRelPath(filePath)) &&
        sourcePattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories."),
    ),
  );

  scanned = new Set(files.map(toRelPath));

  files.forEach((filePath) => {
    const lines = fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(
        ({ line }) => !commentPrefix.test(line) && positiveTabIndex.test(line),
      );
    if (!lines.length) return;
    offenders.set(toRelPath(filePath), lines);
  });
  console.log(`Files setting a positive tabIndex = ${offenders.size}.`);
});

describe("Positive tabIndex Tests", () => {
  it("PositiveTabIndex: no new source file sets a tabIndex above zero", () => {
    const fresh = [...offenders].filter(([relPath]) => !allowlist.has(relPath));
    const message =
      `These files set a positive tabIndex. Drop it and let the DOM order ` +
      `be the Tab order; move the element in the markup if it comes in the ` +
      `wrong place.\r\n\r\n` +
      fresh
        .map(
          ([relPath, lines], i) =>
            `${i + 1}. ${relPath}\n` +
            lines
              .map(({ line, number }) => `     ${number}: ${line.trim()}`)
              .join("\n"),
        )
        .join("\n");

    expect(fresh.length, message).toBe(0);
  });

  // A directory whose name merely contains an excluded one is still source:
  // the settings pages under categories/common went unscanned once.
  it("PositiveTabIndexScanCoverage: directories named like an excluded one are scanned", () => {
    expect(
      scanned.has(
        "packages/client/src/pages/PortalSettings/categories/common/appearance.js",
      ),
    ).toBe(true);
  });

  it("StalePositiveTabIndexAllowlist: the baseline only lists files that still set one", () => {
    const stale = [...allowlist].filter((relPath) => !offenders.has(relPath));
    const message =
      `These entries in tabindex-allowlist.json no longer set a positive ` +
      `tabIndex (or were deleted) - remove them from the list:\r\n\r\n` +
      stale.map((relPath, i) => `${i + 1}. ${relPath}`).join("\n");

    expect(stale.length, message).toBe(0);
  });
});
