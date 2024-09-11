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

const BASE_DIR =
  process.env.BASE_DIR || path.resolve(__dirname, "../../../../");

let workspaces = [];
let translationFiles = [];
let javascriptFiles = [];

const getAllFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      return getAllFiles(filePath);
    } else {
      return filePath;
    }
  });
};

beforeAll(() => {
  const moduleWorkspaces = [
    "packages/client",
    "packages/doceditor",
    "packages/login",
    "packages/shared",
    "packages/management",
  ];

  workspaces = moduleWorkspaces.map((ws) => path.resolve(BASE_DIR, ws));
  workspaces.push(path.resolve(BASE_DIR, "public/locales"));

  translationFiles = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (file) => file.endsWith(".json") && file.includes("public/locales")
    );
  });

  console.log(`Base path = ${BASE_DIR}`);
  console.log(
    `Found translationFiles by *.json filter = ${translationFiles.length}. First path is '${translationFiles[0]}'`
  );

  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  javascriptFiles = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (file) =>
        searchPattern.test(file) &&
        !file.includes("dist/") &&
        !file.includes(".next/") &&
        !file.includes("storybook-static/") &&
        !file.includes("node_modules/")
    );
  });

  console.log(
    `Found javascriptFiles by *.js(x) filter = ${javascriptFiles.length}. First path is '${javascriptFiles[0]}'`
  );
});

describe("Locales Tests", () => {
  test("LanguageTranslatedPercentTest", () => {
    // Add test logic here
  });

  test("ParseJsonTest", () => {
    // Add test logic here
  });

  test("SingleKeyFilesTest", () => {
    // Add test logic here
  });

  test("FullEnDublicatesTest", () => {
    // Add test logic here
  });

  test("EnDublicatesByContentTest", () => {
    // Add test logic here
  });

  test("NotFoundKeysTest", () => {
    // Add test logic here
  });

  test("DublicatesFilesByMD5HashTest", () => {
    // Add test logic here
  });

  test("UselessTranslationKeysTest", () => {
    // Add test logic here
  });

  test("NotTranslatedToastsTest", () => {
    // Add test logic here
  });

  test("NotTranslatedPropsTest", () => {
    // Add test logic here
  });

  test("WrongTranslationVariablesTest", () => {
    // Add test logic here
  });

  test("WrongTranslationTagsTest", () => {
    // Add test logic here
  });

  test("ForbiddenValueElementsTest", () => {
    // Add test logic here
  });

  test("ForbiddenKeysElementsTest", () => {
    // Add test logic here
  });

  test("EmptyValueKeysTest", () => {
    // Add test logic here
  });

  test("NotTranslatedKeysTest", () => {
    // Add test logic here
  });

  test("NotTranslatedCommonKeysTest", () => {
    // Add test logic here
  });

  test("NotAllLanguageTranslatedTest", () => {
    // Add test logic here
  });
});
