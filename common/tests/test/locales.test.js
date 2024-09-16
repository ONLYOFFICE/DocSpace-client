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
const {
  getAllFiles,
  convertPathToOS,
  getWorkSpaces,
  BASE_DIR,
  moduleWorkspaces,
} = require("../utils/files");

let workspaces = [];
let translationFiles = [];
let javascriptFiles = [];
let parseJsonErrors = [];
let notTranslatedToasts = [];
let notTranslatedProps = [];
let moduleFolders = [];
let commonTranslations = [];

const forbiddenElements = ["ONLYOFFICE", "DOCSPACE"];
const skipForbiddenKeys = [
  "OrganizationName",
  "ProductName",
  "ProductEditorsName",
];

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  workspaces = getWorkSpaces();
  workspaces.push(path.resolve(BASE_DIR, "public/locales"));

  const translations = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (filePath) =>
        filePath &&
        filePath.endsWith(".json") &&
        filePath.includes(convertPathToOS("public/locales"))
    );
  });

  console.log(`Found translations by *.json filter = ${translations.length}.`);

  for (const tPath of translations) {
    try {
      const fileContent = fs.readFileSync(tPath, "utf8");

      const hash = crypto.createHash("md5").update(fileContent).digest("hex");

      const jsonTranslation = JSON.parse(fileContent);

      const translationFile = {
        path: tPath,
        fileName: path.basename(tPath),
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

  console.log(`Found translationFiles = ${translationFiles.length}.`);

  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  const javascripts = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories.")
    );
  });

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`
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

  console.log(`Found javascriptFiles = ${javascriptFiles.length}.`);

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

  console.log(`Found moduleTranslations = ${moduleTranslations.length}.`);

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
    `Found moduleJsTranslatedFiles = ${moduleJsTranslatedFiles.length}.`
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

  console.log(`Found moduleFolders = ${moduleFolders.length}.`);

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

  console.log(`Found commonTranslations = ${commonTranslations.length}.`);

  let message = `Next languages translated less than 100%:\n\n`;

  const groupedByLng = translationFiles.reduce((acc, t) => {
    if (!acc[t.language]) {
      acc[t.language] = [];
    }
    acc[t.language].push(...t.translations);
    return acc;
  }, {});

  const groupedByLngArray = Object.keys(groupedByLng).map((language) => {
    const allTranslated = groupedByLng[language];
    return {
      language: language,
      totalKeysCount: allTranslated.length,
      emptyKeysCount: allTranslated.filter((t) => !t.value).length,
    };
  });

  const expectedTotalKeysCount = groupedByLngArray.find(
    (t) => t.language === "en"
  ).totalKeysCount;

  let i = 0;
  let exists = false;

  groupedByLngArray.forEach((lng) => {
    if (
      lng.emptyKeysCount === 0 &&
      lng.totalKeysCount === expectedTotalKeysCount
    )
      return;

    exists = true;

    const translated =
      lng.totalKeysCount === expectedTotalKeysCount
        ? Math.round(
            100 - ((lng.emptyKeysCount * 100) / expectedTotalKeysCount) * 10
          ) / 10
        : Math.round(
            ((lng.totalKeysCount * 100) / expectedTotalKeysCount) * 10
          ) / 10;

    message += `${++i}. Language '${lng.language}' translated by '${translated}%'\n`;
  });

  console.log(message);
});

describe("Locales Tests", () => {
  test("ParseJsonTest: Verify that there are no errors in parsing JSON files", () => {
    const message = `File path = '${parseJsonErrors.map((e) => e.path).join(", ")}' failed to parse with error: '${parseJsonErrors.map((e) => e.error).join(", ")}'`;
    expect(parseJsonErrors.length, message).toBe(0);
  });

  test("SingleKeyFilesTest: Verify that there are no translation files in the project that contain only a single key for the English language.", () => {
    const singleKeyTranslationFiles = translationFiles.filter(
      (t) => t.language === "en" && t.translations.length === 1
    );

    const message = `Translations files with single key:\r\n${singleKeyTranslationFiles.map((d) => `\r\nKey='${d.translations[0].key}':\r\n${d.path}'`).join("\r\n")}`;

    expect(singleKeyTranslationFiles.length, message).toBe(0);
  });

  test("FullEnDublicatesTest: Verify that there are no duplicate key-value pairs in the English translation files.", () => {
    const fullEnDuplicates = translationFiles
      .filter((file) => file.language === "en")
      .flatMap((item) => item.translations)
      .reduce((acc, t) => {
        const key = `${t.key}-${t.value}`;
        if (!acc[key]) {
          acc[key] = { key: t.key, value: t.value, count: 0, keys: [] };
        }
        acc[key].count++;
        acc[key].keys.push(t);
        return acc;
      }, {});

    const duplicatesArray = Object.values(fullEnDuplicates)
      .filter((grp) => grp.count > 1)
      .sort((a, b) => b.count - a.count)
      .map((grp) => ({ key: grp.key, value: grp.value, count: grp.count }));

    const message = `\r\n${duplicatesArray.map((d) => JSON.stringify(d, null, 2)).join("\r\n")}`;

    expect(duplicatesArray.length, message).toBe(0);
  });

  test("NotFoundKeysTest: Verify that all translation keys used in the JavaScript files are present in the English translation files.", () => {
    const allEnKeys = translationFiles
      .filter((file) => file.language === "en")
      .flatMap((item) => item.translations)
      .map((item) => item.key);

    const allJsTranslationKeys = javascriptFiles
      .filter((f) => !f.path.includes("Banner.js")) // skip Banner.js (translations from firebase)
      .flatMap((j) => j.translationKeys)
      .map((k) => k.substring(k.indexOf(":") + 1))
      .filter((value, index, self) => self.indexOf(value) === index); // Distinct

    const notFoundJsKeys = allJsTranslationKeys.filter(
      (k) => !allEnKeys.includes(k)
    );

    let i = 0;
    const message = `Some i18n-keys do not exist in translations in 'en' language:\r\n\r\nKeys:\r\n\r\n${notFoundJsKeys.join(`\r\n${++i}`)}`;

    expect(notFoundJsKeys.length, message).toBe(0);
  });

  test("UselessTranslationKeysTest: Verify that all translation keys present in the English translation files are actually used in the JavaScript files.", () => {
    const allEnKeys = translationFiles
      .filter((file) => file.language === "en")
      .flatMap((item) => item.translations)
      .map((item) => item.key)
      .filter((k) => !k.startsWith("Culture_"))
      .sort();

    const allJsTranslationKeys = javascriptFiles
      .flatMap((j) => j.translationKeys)
      .map((k) => k.substring(k.indexOf(":") + 1))
      .filter((k) => !k.startsWith("Culture_"))
      .filter((value, index, self) => self.indexOf(value) === index) // Distinct
      .sort();

    const notFoundi18nKeys = allEnKeys.filter(
      (k) => !allJsTranslationKeys.includes(k)
    );

    const message = `Some i18n-keys are not found in js \r\n\r\nKeys:\r\n\r\n${notFoundi18nKeys.join("\r\n")}`;

    expect(notFoundi18nKeys.length, message).toBe(0);
  });

  test("NotTranslatedToastsTest: Verify that all toast messages in the application are properly translated.", () => {
    let message = `Next text not translated in toasts:\r\n\r\n`;

    let i = 0;

    const groupedToasts = notTranslatedToasts.reduce((acc, t) => {
      if (!acc[t.path]) {
        acc[t.path] = [];
      }
      acc[t.path].push(t);
      return acc;
    }, {});

    Object.keys(groupedToasts).forEach((key) => {
      const group = groupedToasts[key];
      message += `${++i}. Path='${key}'\r\n\r\n${group.map((v) => v.value).join("\r\n")}\r\n\r\n`;
    });

    expect(notTranslatedToasts.length, message).toBe(0);
  });

  test("NotTranslatedPropsTest: Verify that all specified properties (such as title, placeholder, label, and text) in all clients are properly translated.", () => {
    let message = `Next text not translated props (title, placeholder, label, text):\r\n\r\n`;

    let i = 0;

    const groupedProps = notTranslatedProps.reduce((acc, t) => {
      if (!acc[t.path]) {
        acc[t.path] = [];
      }
      acc[t.path].push(t);
      return acc;
    }, {});

    Object.keys(groupedProps).forEach((key) => {
      const group = groupedProps[key];
      message += `${++i}. Path='${key}'\r\n\r\n${group.map((v) => v.value).join("\r\n")}\r\n\r\n`;
    });

    expect(notTranslatedProps.length, message).toBe(0);
  });

  test("WrongTranslationVariablesTest: Verify that translation keys across different languages have consistent variables.", () => {
    const message = `Next keys have wrong or empty variables:\r\n\r\n`;
    const regVariables = new RegExp("\\{\\{([^\\{].?[^\\}]+)\\}\\}", "gm");

    const groupedByLng = translationFiles.reduce((acc, t) => {
      if (!acc[t.language]) {
        acc[t.language] = [];
      }
      acc[t.language].push(
        ...t.translations.map((k) => ({
          key: `${t.fileName}=>${k.key}`,
          value: k.value,
          variables: [...k.value.matchAll(regVariables)].map((m) =>
            m[1]?.trim().replace(", lowercase", "")
          ),
        }))
      );
      return acc;
    }, {});

    const enWithVariables = groupedByLng["en"].filter(
      (t) => t.variables.length > 0
    );

    const otherLanguagesWithVariables = Object.keys(groupedByLng)
      .filter((lang) => lang !== "en")
      .map((lang) => ({
        language: lang,
        translationsWithVariables: groupedByLng[lang],
      }));

    let i = 0;
    let errorsCount = 0;

    enWithVariables.forEach((enKeyWithVariables) => {
      otherLanguagesWithVariables.forEach((lng) => {
        const lngKey = lng.translationsWithVariables.find(
          (t) => t.key === enKeyWithVariables.Key
        );

        if (!lngKey) {
          // wrong
          // message += `${++i}. lng='${lng.Language}' key='${enKeyWithVariables.Key}' not found\r\n\r\n`;
          // errorsCount++;
          return;
        }

        if (enKeyWithVariables.variables.length !== lngKey.variables.length) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${lngKey.key}' has less variables than 'en' language have ` +
            `(en=${enKeyWithVariables.variables.length}|${lng.language}=${lngKey.variables.length})\r\n` +
            `'en': '${enKeyWithVariables.value}'\r\n'${lng.language}': '${lngKey.value}'\r\n\r\n`;
          errorsCount++;
        }

        if (
          !lngKey.variables.every((v) =>
            enKeyWithVariables.variables.includes(v)
          )
        ) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${lngKey.key}' has not equals variables of 'en' language have \r\n` +
            `'${enKeyWithVariables.value}' Variables=[${enKeyWithVariables.variables.join(",")}]\r\n` +
            `'${lngKey.value}' Variables=[${lngKey.variables.join(",")}]\r\n\r\n`;
          errorsCount++;
        }
      });
    });

    expect(errorsCount, message).toBe(0);
  });

  test("WrongTranslationTagsTest: Verify that HTML tags within translation strings are consistent across different languages.", () => {
    const message = `Next keys have wrong or empty translation's html tags:\r\n\r\n`;
    const regString = "<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>";
    const regTags = new RegExp(regString, "gm");

    const groupedByLng = translationFiles.reduce((acc, t) => {
      if (!acc[t.language]) {
        acc[t.language] = [];
      }
      acc[t.language].push(
        ...t.translations.map((k) => ({
          key: k.key,
          value: k.value,
          tags: [...k.value.matchAll(regTags)].map((m) =>
            m[0].trim().replace(" ", "")
          ),
        }))
      );
      return acc;
    }, {});

    const enWithTags = groupedByLng["en"].filter((t) => t.tags.length > 0);

    const otherLanguagesWithTags = Object.keys(groupedByLng)
      .filter((lang) => lang !== "en")
      .map((lang) => ({
        language: lang,
        translationsWithTags: groupedByLng[lang],
      }));

    let i = 0;
    let errorsCount = 0;

    enWithTags.forEach((enKeyWithTags) => {
      otherLanguagesWithTags.forEach((lng) => {
        const lngKey = lng.translationsWithTags.find(
          (t) => t.key === enKeyWithTags.key
        );

        if (!lngKey) {
          // wrong
          // message += `${++i}. lng='${lng.Language}' key='${enKeyWithTags.Key}' not found\r\n\r\n`;
          // errorsCount++;
          return;
        }

        if (enKeyWithTags.tags.length !== lngKey.tags.length) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${lngKey.key}' has less tags than 'en' language have ` +
            `(en=${enKeyWithTags.tags.length}|${lng.language}=${lngKey.tags.length})\r\n` +
            `'en': '${enKeyWithTags.value}'\r\n'${lng.language}': '${lngKey.value}'\r\n\r\n`;
          errorsCount++;
        }

        if (!lngKey.tags.every((v) => enKeyWithTags.tags.includes(v))) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${lngKey.key}' has not equals tags of 'en' language have \r\n` +
            `'${enKeyWithTags.value}' Tags=[${enKeyWithTags.tags.join(",")}]\r\n` +
            `'${lngKey.value}' Tags=[${lngKey.tags.join(",")}]\r\n\r\n`;
          errorsCount++;
        }
      });
    });

    expect(errorsCount, message).toBe(0);
  });

  test("ForbiddenValueElementsTest: Verify that certain forbidden values are not present in the translation strings across different languages.", () => {
    let message = `Next keys have forbidden values \`${forbiddenElements.join(",")}\`:\r\n\r\n`;

    let exists = false;
    let i = 0;

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;

      module.availableLanguages.forEach((lng) => {
        const translationItems = lng.translations.filter((f) =>
          forbiddenElements.some((elem) => f.value.toUpperCase().includes(elem))
        );

        if (!translationItems.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${translationItems.length}). Path '${lng.path}' ` +
          `\r\n\r\nKeys:\r\n\r\n`;

        const keys = translationItems.map((t) => t.key);

        message += keys.join("\r\n") + "\r\n\r\n";
      });
    });

    commonTranslations.forEach((lng) => {
      const translationItems = lng.translations
        .filter((elem) => !skipForbiddenKeys.includes(elem.key))
        .filter((f) =>
          forbiddenElements.some((elem) => f.value.toUpperCase().includes(elem))
        );

      if (!translationItems.length) return;

      exists = true;

      message +=
        `${++i}. Language '${lng.language}' (Count: ${translationItems.length}). Path '${lng.path}' ` +
        `\r\n\r\nKeys:\r\n\r\n`;

      const keys = translationItems.map((t) => t.key);

      message += keys.join("\r\n") + "\r\n\r\n";
    });

    expect(exists, message).toBe(false);
  });

  test("ForbiddenKeysElementsTest: Verify that translation keys do not contain any forbidden elements in their names.", () => {
    let message = `Next keys have forbidden elements in names \`${forbiddenElements.join(",")}\`:\r\n\r\n`;

    let exists = false;
    let i = 0;

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;

      module.availableLanguages.forEach((lng) => {
        const translationItems = lng.translations.filter((f) =>
          forbiddenElements.some((elem) => f.key.toUpperCase().includes(elem))
        );

        if (!translationItems.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${translationItems.length}). Path '${lng.path}' ` +
          `\r\n\r\nKeys:\r\n\r\n`;

        const keys = translationItems.map((t) => t.key);

        message += keys.join("\r\n") + "\r\n\r\n";
      });
    });

    commonTranslations.forEach((lng) => {
      const translationItems = lng.translations
        .filter((elem) => !skipForbiddenKeys.includes(elem.key))
        .filter((f) =>
          forbiddenElements.some((elem) => f.key.toUpperCase().includes(elem))
        );

      if (!translationItems.length) return;

      exists = true;

      message +=
        `${++i}. Language '${lng.language}' (Count: ${translationItems.length}). Path '${lng.path}' ` +
        `\r\n\r\nKeys:\r\n\r\n`;

      const keys = translationItems.map((t) => t.key);

      message += keys.join("\r\n") + "\r\n\r\n";
    });

    expect(exists, message).toBe(false);
  });

  test("EmptyValueKeysTest: Verify that there are no translation keys with empty values across different languages in the translation files.", () => {
    let message = `Next files have empty keys:\r\n\r\n`;

    let exists = false;
    let i = 0;

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;

      module.availableLanguages.forEach((lng) => {
        const emptyTranslationItems = lng.translations.filter((f) => !f.value);

        if (!emptyTranslationItems.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${emptyTranslationItems.length}). Path '${lng.path}' ` +
          `Empty keys:\r\n\r\n`;

        const emptyKeys = emptyTranslationItems.map((t) => t.key);

        message += emptyKeys.join("\r\n") + "\r\n\r\n";
      });
    });

    commonTranslations.forEach((lng) => {
      const emptyTranslationItems = lng.translations.filter((f) => !f.value);

      if (!emptyTranslationItems.length) return;

      exists = true;

      message +=
        `${++i}. Language '${lng.language}' (Count: ${emptyTranslationItems.length}). Path '${lng.path}' ` +
        `Empty keys:\r\n\r\n`;

      const emptyKeys = emptyTranslationItems.map((t) => t.key);

      message += emptyKeys.join("\r\n") + "\r\n\r\n";
    });

    expect(exists, message).toBe(false);
  });
});
