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
const {
  getAllFiles,
  getWorkSpaces,
  BASE_DIR,
} = require("../utils/files");
let asciiSymbolsFiles = [];
beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);
  const workspaces = getWorkSpaces();
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
    "common",
  ];
  // Allowed non-ASCII symbols (exceptions)
  const allowedSymbols = new Set(['↓', '↑', '←', '→', '⌘', '⌥', '©', "•", "—"]);
  const asciiSymbolsRegex = /[^\x00-\x7F]/g;
  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  const commentPrefixRegex = /^\s*(\/\/|\/?\*)/;

  const asciiFiles = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);
    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes("mockData.") &&
        !filePath.includes(".stories.") &&
        !filePath.endsWith(".json") &&
        !filePath.endsWith(".md")
    );
  });
  console.log(`Checking ASCII symbols in ${asciiFiles.length} files.`);
  asciiFiles.forEach((filePath) => {
    const fileText = fs.readFileSync(filePath, "utf8");

    if (!asciiSymbolsRegex.test(fileText)) {
      return;
    }

    asciiSymbolsRegex.lastIndex = 0;

    const lines = fileText.split('\n');
    const foundSymbols = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      if (commentPrefixRegex.test(line)) {
        continue;
      }

      asciiSymbolsRegex.lastIndex = 0;
      let match;

      while ((match = asciiSymbolsRegex.exec(line)) !== null) {
        if (!allowedSymbols.has(match[0])) {
          foundSymbols.push({
            symbol: match[0],
            line: lineIndex + 1,
            column: match.index + 1,
            context: line.trim()
          });
        }
      }
    }

    if (foundSymbols.length > 0) {
      asciiSymbolsFiles.push({
        path: filePath,
        symbols: foundSymbols
      });
    }
  });
  console.log(`Found files with non-ASCII symbols = ${asciiSymbolsFiles.length}.`);
});
describe("ASCII Symbols Tests", () => {
  it("ASCIISymbolsTest: Verify that there are no non-ASCII symbols in the source code files", () => {
    let message = `Next files contain non-ASCII symbols:\r\n\r\n`;
    if (asciiSymbolsFiles.length > 0) {
      let i = 1;
      message += asciiSymbolsFiles
        .map((file) => {
          const symbolsInfo = file.symbols
            .map((symbol) =>
              `     Symbol: '${symbol.symbol}' (U+${symbol.symbol.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}) at line ${symbol.line}, column ${symbol.column}\n     Context: ${symbol.context}`
            )
            .join('\n');

          return `${i++}. File: ${file.path}\n${symbolsInfo}\n`;
        })
        .join("\n");
      console.log(message);
    }
    expect(asciiSymbolsFiles.length, message).toBe(0);
  });
});