// Copyright 2024 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const fs = require("fs");
const path = require("path");
const { getAllFiles, getWorkSpaces, BASE_DIR } = require("../utils/files");

let hexColorIssues = {};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  const workspaces = getWorkSpaces();
  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  const javascripts = workspaces.flatMap((wsPath) => {
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
    ];

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !filePath.includes("themes") &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories.") &&
        !filePath.includes("packages/shared/utils/encoder.ts") &&
        !filePath.includes(
          "packages/shared/components/error-container/ErrorContainer.tsx"
        )
    );
  });

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`
  );

  const hexColorPattern = /#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;

  javascripts.forEach((filePath) => {
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
      message += `${++i}. File: ${issue}\r\nColors: ${hexColorIssues[issue]}\r\n\r\n`;
    });

    expect(issues.length, message).toBe(0);
  });
});
