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
const crypto = require("crypto");

const BASE_DIR =
  process.env.BASE_DIR || path.resolve(__dirname, "../../../../");

let workspaces = [];
let translationFiles = [];
let javascriptFiles = [];
let parseJsonErrors = [];
let notTranslatedToasts = [];
let notTranslatedProps = [];
let moduleFolders = [];
let commonTranslations = [];

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

const convertPathToOS = (filePath) => {
  return path.sep == "/"
    ? filePath.replace("\\", "/")
    : filePath.replace("/", "\\");
};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  const moduleWorkspaces = [
    "packages/client",
    "packages/doceditor",
    "packages/login",
    "packages/shared",
    "packages/management",
  ];

  workspaces = moduleWorkspaces.map((ws) => path.resolve(BASE_DIR, ws));
  workspaces.push(path.resolve(BASE_DIR, "public/locales"));

  const translations = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (file) => file.endsWith(".json") && file.includes("public/locales")
    );
  });

  console.log(
    `Found translations by *.json filter = ${translations.length}. First path is '${translations[0]}'`
  );

  for (const tPath of translations) {
    try {
      const fileContent = fs.readFileSync(tPath, "utf8");

      const hash = crypto.createHash("md5").update(fileContent).digest("hex");

      const jsonTranslation = JSON.parse(fileContent);

      const translationFile = {
        path: tPath,
        translations: Object.entries(jsonTranslation).map(([key, value]) => ({
          key,
          value,
        })),
        md5hash: hash,
        language: path.dirname(tPath).split(path.sep).pop(),
      };

      translationFiles.push(translationFile);
    } catch (ex) {
      parseJsonErrors.push({ path: tPath, error: ex });
      console.log(
        `File path = ${tPath} failed to parse with error: ${ex.message}`
      );
    }
  }

  console.log(
    `Found translationFiles = ${translationFiles.length}. First path is '${translationFiles[0]?.path}'`
  );

  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  const javascripts = workspaces.flatMap((wsPath) => {
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
    `Found javascripts by *.js(x) filter = ${javascripts.length}. First path is '${javascripts[0]}'`
  );

  const pattern1 =
    "[.{\\s\\(]t\\??\\.?\\(\\s*[\"'`]([a-zA-Z0-9_.:\\s{}/-]+)[\"'`]\\s*[\\),]";
  const pattern2 = 'i18nKey="([a-zA-Z0-9_.:-]+)"';
  const pattern3 = 'tKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern4 = 'getTitle\\("([a-zA-Z0-9_.:-]+)"\\)';

  const regexp = new RegExp(
    `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})`,
    "gm"
  );

  const notTranslatedToastsRegex = new RegExp(
    "(?<=toastr.info\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.error\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.success\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.warn\\([\"'`])(.*)(?=[\"'`])",
    "gm"
  );

  const notTranslatedPropsRegex = new RegExp(
    "<[\\w\\n][^>]* (title|placeholder|label|text)={?[\"'](.*)[\"']}?",
    "gm"
  );

  javascripts.forEach((filePath) => {
    const jsFileText = fs.readFileSync(filePath, "utf8");

    const toastMatches = [...jsFileText.matchAll(notTranslatedToastsRegex)];

    if (toastMatches.length > 0) {
      toastMatches.forEach((toastMatch) => {
        const found = toastMatch[0];
        if (found && !notTranslatedToasts.some((t) => t.value === found)) {
          notTranslatedToasts.push({ path: filePath, value: found });
        }
      });
    }

    const propsMatches = [...jsFileText.matchAll(notTranslatedPropsRegex)];

    if (propsMatches.length > 0) {
      propsMatches.forEach((propsMatch) => {
        const found = propsMatch[0];
        if (found && !notTranslatedProps.some((t) => t.value === found)) {
          notTranslatedProps.push({ path: filePath, value: found });
        }
      });
    }

    const matches = [...jsFileText.matchAll(regexp)];

    const translationKeys = matches
      .map((m) => m[2] || m[4] || m[6] || m[8])
      .filter((m) => m != null);

    if (translationKeys.length === 0) return;

    const jsFile = {
      path: filePath,
      translationKeys: translationKeys,
    };

    javascriptFiles.push(jsFile);
  });

  console.log(
    `Found javascriptFiles = ${javascriptFiles.length}. First path is '${javascriptFiles[0]?.path}'`
  );

  const list = translationFiles.map((t) => ({
    modulePath: moduleWorkspaces.find((m) => t.path.includes(m)),
    language: {
      path: t.path,
      language: t.language,
      translations: t.translations,
    },
    lng: t.language,
  }));

  const moduleTranslations = list.reduce((acc, t) => {
    const group = acc.find((g) => g.modulePath === t.modulePath);
    if (group) {
      group.languages.push(t.language);
    } else {
      acc.push({
        modulePath: t.modulePath,
        languages: [t.language],
      });
    }
    return acc;
  }, []);

  console.log(
    `Found moduleTranslations = ${moduleTranslations.length}. First path is '${moduleTranslations[0]?.modulePath}'`
  );

  const moduleJsTranslatedFiles = javascriptFiles
    .map((t) => ({
      modulePath: moduleWorkspaces.find((m) => t.path.includes(m)),
      path: t.path,
      translationKeys: t.translationKeys,
    }))
    .reduce((acc, t) => {
      const group = acc.find((g) => g.modulePath === t.modulePath);
      if (group) {
        group.translationKeys.push(...t.translationKeys);
      } else {
        acc.push({
          modulePath: t.modulePath,
          translationKeys: t.translationKeys,
        });
      }
      return acc;
    }, []);

  console.log(
    `Found moduleJsTranslatedFiles = ${moduleJsTranslatedFiles.length}. First path is '${moduleJsTranslatedFiles[0]?.modulePath}'`
  );

  moduleWorkspaces.forEach((wsPath) => {
    const t = moduleTranslations.find((t) => t.modulePath === wsPath);
    const j = moduleJsTranslatedFiles.find((t) => t.modulePath === wsPath);

    if (!j && !t) return;

    moduleFolders.push({
      path: wsPath,
      availableLanguages: t?.languages,
      appliedJsTranslationKeys: j?.translationKeys,
    });
  });

  console.log(
    `Found ModuleFolders = ${moduleFolders.length}. First path is '${moduleFolders[0]?.path}'`
  );

  commonTranslations = translationFiles
    .filter((file) =>
      file.path.startsWith(
        convertPathToOS(path.join(BASE_DIR, "public/locales"))
      )
    )
    .map((t) => ({
      path: t.path,
      language: t.language,
      translations: t.translations,
    }));

  console.log(
    `Found CommonTranslations = ${commonTranslations.length}. First path is '${commonTranslations[0]?.path}'`
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
