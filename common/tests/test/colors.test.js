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
  ];

  const excludePatterns = [
    "themes",
    ".test.",
    ".stories.",
    path.normalize("packages/shared/utils/encoder.ts"),
    path.normalize(
      "packages/shared/components/error-container/ErrorContainer.tsx"
    ),
    path.normalize("packages/shared/styles/variables/_colors.scss"),
    path.normalize("packages/client/src/components/SmartBanner/main.css"),
  ];

  const javascripts = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        jsPattern.test(filePath) &&
        !excludePatterns.some((pattern) => filePath.includes(pattern))
    );
  });

  const scssFiles = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        scssPattern.test(filePath) &&
        !excludePatterns.some((pattern) => filePath.includes(pattern))
    );
  });

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`
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
  test("NotGlogalColorTest: Verify that there are no inline color definitions in the code and that global color variables are used instead.", () => {
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
