// (c) Copyright Ascensio System SIA 2009-2025
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

const fs = require("fs");
const path = require("path");
const { getAllFiles, getWorkSpaces, BASE_DIR } = require("../utils/files");

let zIndexIssues = {};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  const workspaces = getWorkSpaces();
  const searchPattern = /\.(js|jsx|ts|tsx|scss|css)$/;
  const files = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

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
    ];

    const excludePatterns = [
      ".test.",
      ".stories.",
      "main.css",
      "ErrorContainer.module.scss",
    ];

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !excludePatterns.some((pattern) => filePath.includes(pattern))
    );
  });

  console.log(
    `Found files by js(x)|ts(x)|scss|css filter = ${files.length}.`
  );

  const zIndexPattern = /z-index\s*:\s*(\d+)\s*(!important)?\s*;/g;
  const jsxZIndexPattern = /zIndex\s*:\s*(\d+)\s*[,}]/g;
  
  files.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      
      const cssMatches = Array.from(content.matchAll(zIndexPattern) || []);
      
      const jsxMatches = Array.from(content.matchAll(jsxZIndexPattern) || []);
      
      const allMatches = [...cssMatches, ...jsxMatches];
      
      if (allMatches.length > 0) {
        zIndexIssues[filePath] = allMatches.map(match => match[0]);
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error.message}`);
    }
  });
});

describe("Z-Index Tests", () => {
  test("UseZIndexVariablesTest: Verify that there are no inline z-index numeric values in the code and that z-index variables are used instead.", () => {
    const issues = Object.keys(zIndexIssues);

    let message =
      "Found inline z-index numeric values in the code. Please use z-index variables from the z-index system instead.\r\n\r\n";
    let i = 0;
    issues.forEach((issue) => {
      message += `${++i}. File: ${issue}\r\nZ-Index issues: ${zIndexIssues[issue].join(", ")}\r\n\r\n`;
    });

    expect(issues.length, message).toBe(0);
  });
});
