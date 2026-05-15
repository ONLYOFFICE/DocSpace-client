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

let hexColorIssues = {};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  const workspaces = getWorkSpaces();

  const jsPattern = /\.(js|jsx|ts|tsx)$/;
  const scssPattern = /\.(scss|sass|css)$/;

  const excludeDirs = [
    ".nx",
    "e2e",
    ".yarn",
    ".github",
    ".vscode",
    ".git",
    "__mocks__",
    "dist",
    "test",
    "tests",
    ".next",
    "campaigns",
    "storybook-static",
    "node_modules",
    ".meta",
    "coverage",
    "vitest",
    "storybook-helpers",
  ];

  const excludePatterns = [
    "themes",
    ".test.",
    ".stories.",
    path.normalize("libs/ui-kit/utils/encoder/index.ts"),
    path.normalize("libs/ui-kit/components/error-container/ErrorContainer.tsx"),
    path.normalize("libs/ui-kit/styles/variables/_colors.scss"),
    path.normalize("packages/client/src/components/SmartBanner/main.css"),
    path.normalize("packages/sdk/src/styles/customization-theme.scss"),
  ];

  const javascripts = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        jsPattern.test(filePath) &&
        !excludePatterns.some((pattern) => filePath.includes(pattern)),
    );
  });

  const scssFiles = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        scssPattern.test(filePath) &&
        !excludePatterns.some((pattern) => filePath.includes(pattern)),
    );
  });

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`,
  );
  console.log(`Found styles by scss|sass|css filter = ${scssFiles.length}.`);

  const hexColorPattern = /#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;

  javascripts.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");

    const matches = content.match(hexColorPattern) || [];
    if (matches.length > 0) {
      hexColorIssues[filePath] = matches;
    }
  });

  scssFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");

    const matches = content.match(hexColorPattern) || [];
    if (matches.length > 0) {
      hexColorIssues[filePath] = matches;
    }
  });
});

describe("Color Tests", () => {
  it("NotGlogalColorTest: Verify that there are no inline color definitions in the code and that global color variables are used instead.", () => {
    const issues = Object.keys(hexColorIssues);

    let message =
      "Found inline colors in the code. Please use global colors instead.\r\n\r\n";
    let i = 0;
    issues.forEach((issue) => {
      message += `${++i}. File: ${issue}\r\nColors: ${
        hexColorIssues[issue]
      }\r\n\r\n`;
    });

    expect(issues.length, message).toBe(0);
  });
});

