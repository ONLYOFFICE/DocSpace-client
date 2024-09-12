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
const path = require("path");
const fs = require("fs");

const BASE_DIR =
  process.env.BASE_DIR || path.resolve(__dirname, "../../../../");

const moduleWorkspaces = [
  "packages/client",
  "packages/doceditor",
  "packages/login",
  "packages/shared",
  "packages/management",
];

const getWorkSpaces = () => {
  const workspaces = moduleWorkspaces.map((ws) => path.resolve(BASE_DIR, ws));

  return workspaces;
};

const getAllFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      if (
        filePath.includes("dist/") ||
        filePath.includes("tests/") ||
        filePath.includes(".next/") ||
        filePath.includes("storybook-static/") ||
        filePath.includes("node_modules/")
      ) {
        return null;
      }

      return getAllFiles(filePath);
    } else {
      return filePath;
    }
  });
};

const convertPathToOS = (filePath) => {
  return path.sep == "/"
    ? filePath.replace("\\", "/")
    : filePath.replace("/", "\\");
};

module.exports = {
  BASE_DIR,
  moduleWorkspaces,
  getWorkSpaces,
  getAllFiles,
  convertPathToOS,
};
