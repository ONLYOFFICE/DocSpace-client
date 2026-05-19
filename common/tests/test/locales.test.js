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
let i18nFiles = [];

const BASE_LANGUAGES = [
  "de",
  "fr",
  "it",
  "es",
  "ru",
  "ja-JP",
  "zh-CN",
  "ro",
  "pt-BR",
  "hy-AM",
  "sr-Cyrl-RS",
  "sr-Latn-RS",
];

const forbiddenElements = ["ONLYOFFICE", "DOCSPACE"];
const skipForbiddenKeys = [
  "OrganizationName",
  "ProductName",
  "ProductEditorsName",
  "OnlyofficeDesktopEditors",
];

// Brand/product keys and constants — injected at runtime, not in JSON locale files.
// Skip these in per-language completeness and forbidden-elements checks.
import { brandKeys } from "../../../packages/shared/constants/brands.ts";
import { constKeys } from "../../../packages/shared/constants/consts.ts";
const brandNameKeys = new Set([...brandKeys, ...constKeys]);

/**
 * Delete translation keys from JSON files when CLEAR_WRONG_VALUES=true.
 * Accepts entries already resolved to { filePath, key }.
 *
 * @param {Array<{filePath: string, key: string}>} entries
 * @param {string} label - Description for console output (e.g. "wrong variable keys")
 */
function clearWrongKeys(entries, label) {
  if (process.env.CLEAR_WRONG_VALUES !== "true" || entries.length === 0) return;

  const grouped = {};
  entries.forEach(({ filePath, key }) => {
    if (!grouped[filePath]) grouped[filePath] = [];
    grouped[filePath].push(key);
  });

  let total = 0;
  Object.entries(grouped).forEach(([fp, keys]) => {
    const content = JSON.parse(fs.readFileSync(fp, "utf8"));
    keys.forEach((k) => delete content[k]);
    fs.writeFileSync(fp, JSON.stringify(content, null, 2));
    total += keys.length;
  });

  console.log(`Cleared ${total} ${label}.`);
}

/**
 * Resolve wrongKeys array of { language, key } (where key = "namespace:actualKey")
 * into { filePath, key } entries suitable for clearWrongKeys().
 * Deduplicates by language:key.
 *
 * @param {Array<{language: string, key: string}>} wrongKeys
 * @returns {Array<{filePath: string, key: string}>}
 */
function resolveTranslationEntries(wrongKeys) {
  const seen = new Set();
  const entries = [];
  wrongKeys.forEach(({ language, key }) => {
    const id = `${language}:${key}`;
    if (seen.has(id)) return;
    seen.add(id);

    const colonIndex = key.indexOf(":");
    const namespace = key.substring(0, colonIndex);
    const actualKey = key.substring(colonIndex + 1);
    const translationFile = translationFiles.find(
      (f) => f.language === language && f.namespace === namespace,
    );
    if (!translationFile) return;
    entries.push({ filePath: translationFile.path, key: actualKey });
  });
  return entries;
}

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  workspaces = getWorkSpaces();

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
    "scripts",
    "storybook-helpers",
  ];

  const translations = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        filePath.endsWith(".json") &&
        filePath.includes(convertPathToOS("public/locales")) &&
        // Exclude .constants/ directory (brand names, cultures — not per-language translations)
        !filePath.includes(convertPathToOS("locales/.constants/")),
    );
  });

  console.log(`Found translations by *.json filter = ${translations.length}.`);

  for (const tPath of translations) {
    try {
      const fileContent = fs.readFileSync(tPath, "utf8");

      const hash = crypto.createHash("md5").update(fileContent).digest("hex");

      const jsonTranslation = JSON.parse(fileContent);

      const fileName = path.basename(tPath);
      const namespace = fileName.replace(".json", "");

      const translationFile = {
        path: tPath,
        fileName,
        namespace,
        translations: Object.entries(jsonTranslation).map(([key, value]) => ({
          key,
          value,
          namespace,
        })),
        md5hash: hash,
        language: path.dirname(tPath).split(path.sep).pop(),
      };

      translationFiles.push(translationFile);
    } catch (ex) {
      parseJsonErrors.push({ path: tPath, error: ex });
      console.log(
        `File path = ${tPath} failed to parse with error: ${ex.message}`,
      );
    }
  }

  console.log(`Found translationFiles = ${translationFiles.length}.`);

  const searchPattern = /\.(js|jsx|ts|tsx)$/;
  const javascripts = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes("mockData.") &&
        !filePath.includes(".stories."),
    );
  });

  i18nFiles = javascripts.filter(
    (filePath) =>
      filePath.endsWith("/i18n.js") || filePath.endsWith("/i18n.ts"),
  );

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`,
  );

  const pattern1 =
    "[.{\\s\\(]t\\??\\.?\\(\\s*[\"'`]([a-zA-Z0-9_.:\\s{}/-]+)[\"'`]\\s*[\\),]";
  const pattern2 = 'i18nKey="([a-zA-Z0-9_.:-]+)"';
  const pattern3 = 'tKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern4 = 'getTitle\\("([a-zA-Z0-9_.:-]+)"\\)';
  const pattern5 = 'getCommonTranslation\\(\\s*"([a-zA-Z0-9_.:-]+)"[\\s,)]';
  const pattern6 = 'titleKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern7 = 'translationKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern8 = 'labelKey:\\s"([a-zA-Z0-9_.:-]+)"';

  const regexp = new RegExp(
    `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})|(${pattern5})|(${pattern6})|(${pattern7})|(${pattern8})`,
    "gm",
  );

  const notTranslatedToastsRegex = new RegExp(
    "(?<=toastr.info\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.error\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.success\\([\"'`])(.*)(?=[\"'`])" +
      "|(?<=toastr.warning\\([\"'`])(.*)(?=[\"'`])",
    "gm",
  );

  const notTranslatedPropsRegex = new RegExp(
    "<[\\w\\n][^>]* (title|placeholder|label|text)={?[\"'](.*)[\"']}?",
    "gm",
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
      .map((m) => m[2] || m[4] || m[6] || m[8] || m[10] || m[12] || m[14] || m[16])
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
    `Found moduleJsTranslatedFiles = ${moduleJsTranslatedFiles.length}.`,
  );

  moduleWorkspaces.forEach((wsPath) => {
    const t = moduleTranslations.find((t) => t.modulePath === wsPath);
    const j = moduleJsTranslatedFiles.find((t) => t.modulePath === wsPath);

    if (!j && !t) return;

    moduleFolders.push({
      path: wsPath,
      isCommon: wsPath.includes("public/locales"),
      availableLanguages: t?.languages,
      appliedJsTranslationKeys: j?.translationKeys,
    });
  });

  console.log(`Found moduleFolders = ${moduleFolders.length}.`);

  commonTranslations = translationFiles
    .filter((file) =>
      file.path.startsWith(
        convertPathToOS(path.join(BASE_DIR, "public/locales")),
      ),
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
    (t) => t.language === "en",
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
            100 - ((lng.emptyKeysCount * 100) / expectedTotalKeysCount) * 10,
          ) / 10
        : Math.round(
            ((lng.totalKeysCount * 100) / expectedTotalKeysCount) * 10,
          ) / 10;

    message += `${++i}. Language '${
      lng.language
    }' translated by '${translated}%'\n`;
  });

  console.log(message);
});

describe("Locales Tests", () => {
  it("ParseJsonTest: Verify that there are no errors in parsing JSON files", () => {
    const message = `File path = '${parseJsonErrors
      .map((e) => e.path)
      .join(", ")}' failed to parse with error: '${parseJsonErrors
      .map((e) => e.error)
      .join(", ")}'`;
    expect(parseJsonErrors.length, message).toBe(0);
  });

  it("SingleKeyFilesTest: Verify that there are no translation files in the project that contain only a single key for the English language.", () => {
    const singleKeyTranslationFiles = translationFiles.filter(
      (t) => t.language === "en" && t.translations.length === 1,
    );

    const message = `Translations files with single key:\r\n${singleKeyTranslationFiles
      .map((d) => `\r\nKey='${d.translations[0].key}':\r\n${d.path}'`)
      .join("\r\n")}`;

    expect(singleKeyTranslationFiles.length, message).toBe(0);
  });

  it("FullEnDublicatesTest: Verify that there are no duplicate key-value pairs in the English translation files.", () => {
    const fullEnDuplicates = translationFiles
      .filter((file) => file.language === "en" && file.namespace !== "BrandNames")
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

    const message = `\r\n${duplicatesArray
      .map((d) => JSON.stringify(d, null, 2))
      .join("\r\n")}`;

    expect(duplicatesArray.length, message).toBe(0);
  });

  it("NotFoundKeysTest: Verify that all translation keys used in the JavaScript files are present in the English translation files.", () => {
    const allEnKeys = translationFiles
      .filter((file) => file.language === "en")
      .flatMap((item) => item.translations)
      .map((item) => item.key);

    const jsKeyToFiles = {};
    javascriptFiles
      .filter((f) => !f.path.includes("Banner.js")) // skip Banner.js (translations from firebase)
      .forEach((j) => {
        j.translationKeys.forEach((k) => {
          const stripped = k.substring(k.indexOf(":") + 1);
          if (!jsKeyToFiles[stripped]) {
            jsKeyToFiles[stripped] = [];
          }
          if (!jsKeyToFiles[stripped].includes(j.path)) {
            jsKeyToFiles[stripped].push(j.path);
          }
        });
      });

    const allJsTranslationKeys = Object.keys(jsKeyToFiles);

    const notFoundJsKeys = allJsTranslationKeys.filter(
      (k) => !allEnKeys.includes(k) && !brandNameKeys.has(k),
    );

    let message =
      "Some i18n-keys do not exist in translations in 'en' language:\r\n\r\nKeys:\r\n\r\n";
    notFoundJsKeys.forEach((key, index) => {
      message += `${index + 1}. Key: "${key}"\r\n`;
      message += `   Files:\r\n`;
      jsKeyToFiles[key].forEach((filePath) => {
        message += `   - ${filePath}\r\n`;
      });
      message += "\r\n";
    });

    expect(notFoundJsKeys.length, message).toBe(0);
  });

  it("UselessTranslationKeysTest: Verify that all translation keys present in the English translation files are actually used in the JavaScript files.", () => {
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
      (k) => !allJsTranslationKeys.includes(k),
    );

    const message = `Some i18n-keys are not found in js \r\n\r\nKeys:\r\n\r\n${notFoundi18nKeys.join(
      "\r\n",
    )}`;

    expect(notFoundi18nKeys.length, message).toBe(0);
  });

  it("NotTranslatedToastsTest: Verify that all toast messages in the application are properly translated.", () => {
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
      message += `${++i}. Path='${key}'\r\n\r\n${group
        .map((v) => v.value)
        .join("\r\n")}\r\n\r\n`;
    });

    expect(notTranslatedToasts.length, message).toBe(0);
  });

  it("NotTranslatedPropsTest: Verify that all specified properties (such as title, placeholder, label, and text) in all clients are properly translated.", () => {
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
      message += `${++i}. Path='${key}'\r\n\r\n${group
        .map((v) => v.value)
        .join("\r\n")}\r\n\r\n`;
    });

    expect(notTranslatedProps.length, message).toBe(0);
  });

  it("WrongTranslationVariablesTest: Verify that translation keys across different languages have consistent variables.", () => {
    let message = `Next keys have wrong or empty variables:\r\n\r\n`;
    const regVariables = new RegExp("\\{\\{([^\\{].?[^\\}]+)\\}\\}", "gm");

    const groupedByLng = translationFiles.reduce((acc, t) => {
      if (!acc[t.language]) {
        acc[t.language] = [];
      }
      acc[t.language].push(
        ...t.translations.map((k) => ({
          key: `${t.namespace}:${k.key}`,
          value: k.value,
          variables: [...k.value.matchAll(regVariables)].map((m) =>
            m[1]?.trim().replace(", lowercase", ""),
          ),
        })),
      );
      return acc;
    }, {});

    const enWithVariables = groupedByLng["en"].filter(
      (t) => t.variables.length > 0,
    );

    const otherLanguagesWithVariables = Object.keys(groupedByLng)
      .filter((lang) => lang !== "en")
      .map((lang) => ({
        language: lang,
        translationsWithVariables: groupedByLng[lang],
      }));

    let i = 0;
    let errorsCount = 0;
    const wrongVariableKeys = [];

    enWithVariables.forEach((enKeyWithVariables) => {
      otherLanguagesWithVariables.forEach((lng) => {
        const lngKey = lng.translationsWithVariables.find(
          (t) => t.key === enKeyWithVariables.key,
        );

        if (!lngKey || !lngKey.value) {
          return;
        }

        if (enKeyWithVariables.variables.length !== lngKey.variables.length) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${
              lngKey.key
            }' has less variables than 'en' language have ` +
            `(en=${enKeyWithVariables.variables.length}|${lng.language}=${lngKey.variables.length})\r\n` +
            `'en': '${enKeyWithVariables.value}'\r\n'${lng.language}': '${lngKey.value}'\r\n\r\n`;
          errorsCount++;
          wrongVariableKeys.push({ language: lng.language, key: lngKey.key });
        }

        if (
          !lngKey.variables.every((v) =>
            enKeyWithVariables.variables.includes(v),
          )
        ) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${
              lngKey.key
            }' has not equals variables of 'en' language have \r\n` +
            `'${
              enKeyWithVariables.value
            }' Variables=[${enKeyWithVariables.variables.join(",")}]\r\n` +
            `'${lngKey.value}' Variables=[${lngKey.variables.join(
              ",",
            )}]\r\n\r\n`;
          errorsCount++;
          wrongVariableKeys.push({ language: lng.language, key: lngKey.key });
        }
      });
    });

    // Reverse check: translations that have variables when English does NOT
    const enWithoutVarsKeys = new Set(
      groupedByLng["en"]
        .filter((t) => t.variables.length === 0)
        .map((t) => t.key),
    );

    otherLanguagesWithVariables.forEach((lng) => {
      lng.translationsWithVariables.forEach((lngKey) => {
        if (!enWithoutVarsKeys.has(lngKey.key)) return;
        if (lngKey.variables.length === 0) return;

        message +=
          `${++i}. lng='${lng.language}' key='${lngKey.key}' has variables but 'en' has none ` +
          `(en=0|${lng.language}=${lngKey.variables.length})\r\n` +
          `'${lng.language}': '${lngKey.value}' Variables=[${lngKey.variables.join(",")}]\r\n\r\n`;
        errorsCount++;
        wrongVariableKeys.push({ language: lng.language, key: lngKey.key });
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(wrongVariableKeys),
      "wrong variable translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("WrongTranslationTagsTest: Verify that HTML tags within translation strings are consistent across different languages.", () => {
    let message = `Next keys have wrong or empty translation's html tags:\r\n\r\n`;
    const regString = "<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>";
    const regTags = new RegExp(regString, "gm");

    const groupedByLng = translationFiles.reduce((acc, t) => {
      if (!acc[t.language]) {
        acc[t.language] = [];
      }
      acc[t.language].push(
        ...t.translations.map((k) => ({
          key: `${t.namespace}:${k.key}`,
          value: k.value,
          tags: [...k.value.matchAll(regTags)].map((m) =>
            m[0].trim().replace(" ", ""),
          ),
        })),
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
    const wrongTagKeys = [];

    enWithTags.forEach((enKeyWithTags) => {
      otherLanguagesWithTags.forEach((lng) => {
        const lngKey = lng.translationsWithTags.find(
          (t) => t.key === enKeyWithTags.key,
        );

        if (!lngKey || !lngKey.value) {
          return;
        }

        if (enKeyWithTags.tags.length !== lngKey.tags.length) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${
              lngKey.key
            }' has less tags than 'en' language have ` +
            `(en=${enKeyWithTags.tags.length}|${lng.language}=${lngKey.tags.length})\r\n` +
            `'en': '${enKeyWithTags.value}'\r\n'${lng.language}': '${lngKey.value}'\r\n\r\n`;
          errorsCount++;
          wrongTagKeys.push({ language: lng.language, key: lngKey.key });
        }

        if (!lngKey.tags.every((v) => enKeyWithTags.tags.includes(v))) {
          // wrong
          message +=
            `${++i}. lng='${lng.language}' key='${
              lngKey.key
            }' has not equals tags of 'en' language have \r\n` +
            `'${enKeyWithTags.value}' Tags=[${enKeyWithTags.tags.join(
              ",",
            )}]\r\n` +
            `'${lngKey.value}' Tags=[${lngKey.tags.join(",")}]\r\n\r\n`;
          errorsCount++;
          wrongTagKeys.push({ language: lng.language, key: lngKey.key });
        }
      });
    });

    // Reverse check: translations that have tags when English does NOT
    const enWithoutTagsKeys = new Set(
      groupedByLng["en"]
        .filter((t) => t.tags.length === 0)
        .map((t) => t.key),
    );

    otherLanguagesWithTags.forEach((lng) => {
      lng.translationsWithTags.forEach((lngKey) => {
        if (!enWithoutTagsKeys.has(lngKey.key)) return;
        if (lngKey.tags.length === 0) return;

        message +=
          `${++i}. lng='${lng.language}' key='${lngKey.key}' has tags but 'en' has none ` +
          `(en=0|${lng.language}=${lngKey.tags.length})\r\n` +
          `'${lng.language}': '${lngKey.value}' Tags=[${lngKey.tags.join(",")}]\r\n\r\n`;
        errorsCount++;
        wrongTagKeys.push({ language: lng.language, key: lngKey.key });
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(wrongTagKeys),
      "wrong tag translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("WrongScriptTest: Verify that sr-Cyrl-RS translations are written in Cyrillic script.", () => {
    // Serbian Cyrillic (Вуковица) alphabet:
    // А Б В Г Д Ђ Е Ж З И Ј К Л Љ М Н Њ О П Р С Т Ћ У Ф Х Ц Ч Џ Ш (and lowercase)
    //
    // Algorithm:
    // 1. Strip {{variables}} and <html/react tags> — these are always Latin and that is correct.
    // 2. If at least one Cyrillic letter (U+0400–U+04FF) remains → the translation is OK.
    //    English brand names, OS names, technical terms are allowed alongside Cyrillic text.
    // 3. If NO Cyrillic at all → check whether the stripped value equals the same key's value
    //    in any other language.  If it matches → the value is intentionally unchanged
    //    (product name, social-provider name, OS name, etc.) → OK.
    // 4. No Cyrillic AND no match in other languages → wrong-script translation → flag it.

    // Build cross-language lookup once: "namespace|key" → { language: rawValue }
    const crossLangMap = new Map();
    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        const mapKey = `${file.namespace}|${t.key}`;
        if (!crossLangMap.has(mapKey)) crossLangMap.set(mapKey, {});
        crossLangMap.get(mapKey)[file.language] = t.value;
      });
    });

    function stripMarkup(text) {
      return text
        .replace(/\{\{[^}]+\}\}/g, "") // {{variables}}
        .replace(/<[^>]*>/g, "");       // <html> / <0> react trans tags
    }

    function hasCyrillic(text) {
      return /[\u0400-\u04FF]/.test(stripMarkup(text));
    }

    function matchesEnglish(namespace, key, value) {
      const langs = crossLangMap.get(`${namespace}|${key}`) || {};
      const enVal = langs["en"];
      if (!enVal) return false;
      const stripped = stripMarkup(value).trim();
      if (!stripped) return true; // nothing left after stripping — skip
      // Only English match is considered "intentional" (brand names, tech terms).
      // Matching other languages (e.g. Slovenian) is NOT intentional —
      // it means the model output Latin Serbian instead of Cyrillic.
      return stripMarkup(enVal).trim() === stripped;
    }

    let message =
      "Next keys in sr-Cyrl-RS contain no Cyrillic letters (wrong script):\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const wrongKeys = [];

    const cyrillicFiles = translationFiles.filter(
      (f) => f.language === "sr-Cyrl-RS",
    );

    cyrillicFiles.forEach((cyrillicFile) => {
      cyrillicFile.translations.forEach((translation) => {
        if (!translation.value) return;
        if (hasCyrillic(translation.value)) return; // ✓ has Cyrillic
        if (matchesEnglish(cyrillicFile.namespace, translation.key, translation.value)) return; // ✓ intentional (same as EN = brand/tech term)

        message +=
          `${++i}. path='${cyrillicFile.path}' key='${translation.key}'\r\n` +
          `  Value: '${translation.value.substring(0, 150)}'\r\n\r\n`;
        errorsCount++;
        wrongKeys.push({ path: cyrillicFile.path, key: translation.key });
      });
    });

    clearWrongKeys(
      wrongKeys.map(({ path: p, key: k }) => ({ filePath: p, key: k })),
      "wrong-script keys from sr-Cyrl-RS",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("ForbiddenValueElementsTest: Verify that certain forbidden values are not present in the translation strings across different languages.", () => {
    let message = `Next keys have forbidden values \`${forbiddenElements.join(
      ",",
    )}\`:\r\n\r\n`;

    let exists = false;
    let i = 0;
    const forbiddenEntries = [];

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages || module.isCommon) return;

      module.availableLanguages.forEach((lng) => {
        const translationItems = lng.translations
          .filter((elem) => !skipForbiddenKeys.includes(elem.key))
          .filter((f) => {
            // Strip {{variables}} before checking — variable names may contain brand words
            const stripped = f.value.replace(/\{\{[^}]+\}\}/g, "").toUpperCase();
            return forbiddenElements.some((elem) => stripped.includes(elem));
          });

        if (!translationItems.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${
            translationItems.length
          }). Path '${lng.path}' ` + `\r\n\r\nKeys:\r\n\r\n`;

        const keys = translationItems.map((t) => t.key);

        message += keys.join("\r\n") + "\r\n\r\n";

        translationItems.forEach((t) => {
          forbiddenEntries.push({ filePath: lng.path, key: t.key });
        });
      });
    });

    clearWrongKeys(forbiddenEntries, "forbidden value keys");

    expect(exists, message).toBe(false);
  });

  it("ForbiddenKeysElementsTest: Verify that translation keys do not contain any forbidden elements in their names.", () => {
    let message = `Next keys have forbidden elements in names \`${forbiddenElements.join(
      ",",
    )}\`:\r\n\r\n`;

    let exists = false;
    let i = 0;

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;

      module.availableLanguages.forEach((lng) => {
        const translationItems = lng.translations
          .filter((elem) => !skipForbiddenKeys.includes(elem.key))
          .filter((f) =>
            forbiddenElements.some((elem) =>
              f.key.toUpperCase().includes(elem),
            ),
          );

        if (!translationItems.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${
            translationItems.length
          }). Path '${lng.path}' ` + `\r\n\r\nKeys:\r\n\r\n`;

        const keys = translationItems.map((t) => t.key);

        message += keys.join("\r\n") + "\r\n\r\n";
      });
    });

    commonTranslations.forEach((lng) => {
      const translationItems = lng.translations
        .filter((elem) => !skipForbiddenKeys.includes(elem.key))
        .filter((f) =>
          forbiddenElements.some((elem) => f.key.toUpperCase().includes(elem)),
        );

      if (!translationItems.length) return;

      exists = true;

      message +=
        `${++i}. Language '${lng.language}' (Count: ${
          translationItems.length
        }). Path '${lng.path}' ` + `\r\n\r\nKeys:\r\n\r\n`;

      const keys = translationItems.map((t) => t.key);

      message += keys.join("\r\n") + "\r\n\r\n";
    });

    expect(exists, message).toBe(false);
  });

  it("EmptyValueKeysTest: Verify that there are no translation keys with empty values across different languages in the translation files.", () => {
    let message = `Next files have empty keys:\r\n\r\n`;

    let exists = false;
    let i = 0;
    const emptyEntries = [];

    const collectEmptyKeys = (lng) => {
      const emptyTranslationItems = lng.translations.filter((f) => !f.value);

      if (!emptyTranslationItems.length) return;

      exists = true;

      message +=
        `${++i}. Language '${lng.language}' (Count: ${
          emptyTranslationItems.length
        }). Path '${lng.path}' ` + `Empty keys:\r\n\r\n`;

      const emptyKeys = emptyTranslationItems.map((t) => t.key);

      message += emptyKeys.join("\r\n") + "\r\n\r\n";

      emptyTranslationItems.forEach((t) => {
        emptyEntries.push({ filePath: lng.path, key: t.key });
      });
    };

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;
      module.availableLanguages.forEach(collectEmptyKeys);
    });

    commonTranslations.forEach(collectEmptyKeys);

    clearWrongKeys(emptyEntries, "empty translation keys");

    expect(exists, message).toBe(false);
  });

  it("NotFoundEnKey: No English key variants: Verify that there are no translation keys in languages other than English that are not present in the English translation files.", () => {
    let message = `Next keys are not found in 'en' language:\r\n\r\n`;

    let exists = false;
    let i = 0;

    const allEnTranslations = translationFiles.filter(
      (file) => file.language === "en",
    );
    const allEnKeys = allEnTranslations
      .flatMap((item) => item.translations)
      .map((item) => item.namespace + ":" + item.key)
      .filter((k) => !k.startsWith("Culture_"))
      .sort();

    const movedKeys = [];

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;

      module.availableLanguages.forEach((lng) => {
        if (lng.language === "en") return;

        const notFoundKeys = lng.translations.filter(
          (f) => f.key && !allEnKeys.includes(f.namespace + ":" + f.key),
        );

        if (!notFoundKeys.length) return;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${
            notFoundKeys.length
          }). Path '${lng.path}' ` + `Keys:\r\n\r\n`;

        message +=
          notFoundKeys.map((f) => f.namespace + ":" + f.key).join("\r\n") +
          "\r\n\r\n";

        // Add keys to movedKeys array with language information
        movedKeys.push(
          ...notFoundKeys.map((key) => ({
            ...key,
            language: lng.language,
            path: lng.path,
          })),
        );
      });
    });

    // Find keys from movedKeys in other namespaces and suggest correct namespace
    if (movedKeys.length > 0) {
      message += `\n\nAnalyzing ${movedKeys.length} missing translation keys for namespace corrections...\r\n\r\n`;

      // Group English translation files by namespace
      const enNamespaces = {};
      allEnTranslations.forEach((file) => {
        enNamespaces[file.namespace] = file.translations.map((t) => ({
          key: t.key,
          path: file.path,
        }));
      });

      // Analysis results
      const foundInOtherNamespace = [];
      const notFoundAnywhere = [];

      // Check each moved key
      movedKeys.forEach((movedKey) => {
        const keyToFind = movedKey.key;
        let found = false;

        // Check if key exists in any other namespace
        for (const [namespace, keys] of Object.entries(enNamespaces)) {
          if (namespace === movedKey.namespace) continue;

          const foundKey = keys.find((t) => t.key === keyToFind);
          if (foundKey) {
            foundInOtherNamespace.push({
              ...movedKey,
              correctNamespace: namespace,
              correctPath: path.dirname(path.dirname(foundKey.path)),
              correctFileName: path.basename(foundKey.path),
            });
            found = true;
            break;
          }
        }

        // If not found in any namespace, suggest one based on key pattern
        if (!found) {
          notFoundAnywhere.push({
            ...movedKey,
          });
        }
      });

      // Output analysis results
      if (foundInOtherNamespace.length > 0) {
        message += `\n${foundInOtherNamespace.length} keys found in other namespaces:\r\n\r\n`;
        foundInOtherNamespace.forEach((key) => {
          message += `  - Key: '${key.key}' in language '${key.language}'\r\n`;
          message += `    Current namespace: '${key.namespace}', should be in: '${key.correctNamespace}'\r\n`;
        });

        if (process.env.FIX_MOVED_KEYS === "true") {
          // Move keys from wrong namespaces to correctNamespace
          foundInOtherNamespace.forEach((t) => {
            const oldPath = t.path;
            const newPath = path.join(
              t.correctPath,
              t.language,
              t.correctFileName,
            );

            const oldFile = fs.readFileSync(oldPath, "utf8");
            const newFile = JSON.parse(fs.readFileSync(newPath, "utf8"));

            const oldKeys = JSON.parse(oldFile);
            if (!newFile[t.key] || newFile[t.key] !== oldKeys[t.key]) {
              const newKeys = { ...newFile, [t.key]: oldKeys[t.key] };
              fs.writeFileSync(newPath, JSON.stringify(newKeys, null, 2));
            }

            delete oldKeys[t.key];
            fs.writeFileSync(oldPath, JSON.stringify(oldKeys, null, 2));
          });
        }
      }

      if (notFoundAnywhere.length > 0) {
        message += `\n${notFoundAnywhere.length} keys not found in any English namespace:\r\n\r\n`;
        notFoundAnywhere.forEach((key) => {
          message += `  - Key: '${key.key}' in language '${key.language}'\r\n`;
          message += `    Current namespace: '${key.namespace}' - need to remove\r\n`;
        });

        if (process.env.FIX_MOVED_KEYS === "true") {
          // Remove keys from translation files
          notFoundAnywhere.forEach((t) => {
            const oldPath = t.path;
            const oldFile = fs.readFileSync(oldPath, "utf8");
            const oldKeys = JSON.parse(oldFile);
            delete oldKeys[t.key];
            fs.writeFileSync(oldPath, JSON.stringify(oldKeys, null, 2));
          });
        }
      }
    }
    expect(exists, message).toBe(false);
  });

  const skipBaseLanguagesTest = process.env.SKIP_BASE_LANGUAGES_TEST === "true";
  (skipBaseLanguagesTest ? it.skip : it)(
    `NotTranslatedOnBaseLanguages: Verify that all translation keys in the base languages (${BASE_LANGUAGES.join(
      ",",
    )}) are properly translated.`,
    () => {
      let message = `Next keys are not translated in base languages (${BASE_LANGUAGES.join(
        ",",
      )}):\r\n\r\n`;

      let exists = false;
      let i = 0;

      const enKeys = translationFiles.filter((file) => file.language === "en");

      const allEnKeys = enKeys
        .flatMap((item) =>
          item.translations
            .filter((t) => !brandNameKeys.has(t.key))
            .map((t) => {
              return `${item.namespace}:${t.key}`;
            }),
        )
        .sort();

      const allBaseLanguages = [];

      for (const lng of BASE_LANGUAGES) {
        const lngKeys = translationFiles.filter(
          (file) => file.language === lng,
        );

        const keys = lngKeys
          .flatMap((item) =>
            item.translations
              .filter((f) => f.value !== "")
              .map((t) => {
                return `${item.namespace}:${t.key}`;
              }),
          )
          .sort();

        allBaseLanguages.push({ language: lng, keys: keys });
      }

      for (const lng of allBaseLanguages) {
        const notFoundKeys = allEnKeys.filter((k) => !lng.keys.includes(k));

        if (!notFoundKeys.length) continue;

        exists = true;

        message +=
          `${++i}. Language '${lng.language}' (Count: ${
            notFoundKeys.length
          }). ` + `Keys:\r\n\r\n`;

        message += notFoundKeys.join("\r\n") + "\r\n\r\n";
      }

      expect(exists, message).toBe(false);
    },
  );

  it("IncorrectNamespaceUsageTest: Verify that translation keys are used with their correct namespace", () => {
    let message = "The following keys are using incorrect namespaces:\r\n\r\n";
    let incorrectUsages = [];

    // Create a map of all available keys in each namespace
    const namespaceKeys = {};
    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        const namespace = path.basename(file.fileName, ".json");
        namespaceKeys[namespace] = new Set(file.translations.map((t) => t.key));
      });

    // Check each JavaScript file for translation key usage
    javascriptFiles.forEach((jsFile) => {
      jsFile.translationKeys.forEach((key) => {
        const [namespace, translationKey] = key.split(":");

        // Skip if the key doesn't follow namespace:key format
        if (!translationKey) return;

        // Brand name keys are injected at runtime, not in JSON files
        if (brandNameKeys.has(translationKey)) return;

        // Check if the key exists in the specified namespace
        const namespaceKeySet = namespaceKeys[namespace];
        if (namespaceKeySet && !namespaceKeySet.has(translationKey)) {
          // Check if the key exists in other namespaces
          const foundInNamespaces = Object.entries(namespaceKeys)
            .filter(
              ([ns, keys]) => ns !== namespace && keys.has(translationKey),
            )
            .map(([ns]) => ns);

          if (foundInNamespaces.length > 0) {
            incorrectUsages.push({
              file: jsFile.path,
              key: key,
              correctNamespaces: foundInNamespaces,
            });
          }
        }
      });
    });

    if (incorrectUsages.length > 0) {
      let i = 1;
      message += incorrectUsages
        .map(
          (usage) =>
            `${i++}. File: ${usage.file}\n   Key: ${
              usage.key
            }\n   Correct namespace(s): ${usage.correctNamespaces.join(", ")}\n`,
        )
        .join("\n");

      console.log(message);
    }

    expect(incorrectUsages.length, message).toBe(0);
  });

  it("MissingNamespacesTest: i18n namespace files should exist in public/locales", () => {
    let exists = false;
    let message = "";
    let i = 0;

    // // Find all i18n configuration files
    // const i18nFiles = workspaces.flatMap((wsPath) => {
    //   const clientDir = path.resolve(BASE_DIR, wsPath);

    //   return getAllFiles(clientDir, [
    //     ".nx",
    //     "e2e",
    //     ".yarn",
    //     ".github",
    //     ".vscode",
    //     ".git",
    //     "__mocks__",
    //     "dist",
    //     "test",
    //     "tests",
    //     ".next",
    //     "campaigns",
    //     "storybook-static",
    //     "node_modules",
    //     ".meta",
    //   ]).filter(
    //     (filePath) =>
    //       filePath &&
    //       (filePath.endsWith("/i18n.js") || filePath.endsWith("/i18n.ts"))
    //   );
    // });

    const missingNamespaces = [];

    i18nFiles.forEach((i18nFile) => {
      try {
        const content = fs.readFileSync(i18nFile, "utf8");

        // Extract namespaces from ns array using regex
        const nsMatch = content.match(/ns:\s*\[([\s\S]*?)\]/);
        if (!nsMatch) return;

        // Parse the namespace array
        const nsArrayContent = nsMatch[1];
        const namespaces = nsArrayContent
          .split(",")
          .map((ns) => ns.trim().replace(/['"]/g, ""))
          .filter((ns) => ns && ns !== "");

        // Find the corresponding public/locales directory for this i18n file
        const packagePath = i18nFile.replace(/\/src\/.*$/, "");
        const packageLocalesPath = path.join(
          packagePath,
          "public",
          "locales",
          "en",
        );

        // Also check the shared root locales directory
        const rootLocalesPath = path.join(BASE_DIR, "public", "locales", "en");

        // Check each namespace
        namespaces.forEach((namespace) => {
          const packageNamespaceFile = path.join(
            packageLocalesPath,
            `${namespace}.json`,
          );
          const rootNamespaceFile = path.join(
            rootLocalesPath,
            `${namespace}.json`,
          );

          // Check if namespace file exists in either package-specific or root locales directory
          const existsInPackage = fs.existsSync(packageNamespaceFile);
          const existsInRoot = fs.existsSync(rootNamespaceFile);

          if (!existsInPackage && !existsInRoot) {
            // Determine which directory to suggest based on what exists
            let suggestedPath, suggestedDir;
            if (fs.existsSync(packageLocalesPath)) {
              suggestedPath = path.relative(BASE_DIR, packageNamespaceFile);
              suggestedDir = path.relative(BASE_DIR, packageLocalesPath);
            } else {
              suggestedPath = path.relative(BASE_DIR, rootNamespaceFile);
              suggestedDir = path.relative(BASE_DIR, rootLocalesPath);
            }

            missingNamespaces.push({
              i18nFile: path.relative(BASE_DIR, i18nFile),
              namespace,
              expectedPath: suggestedPath,
              localesDir: suggestedDir,
            });
          }
        });
      } catch (error) {
        console.warn(`Failed to parse i18n file ${i18nFile}: ${error.message}`);
      }
    });

    if (missingNamespaces.length > 0) {
      exists = true;
      message = `Found ${missingNamespaces.length} missing namespace files referenced in i18n configurations:\n\n`;

      missingNamespaces.forEach((missing) => {
        message += `${++i}. i18n file: ${missing.i18nFile}\n`;
        message += `   Missing namespace: "${missing.namespace}"\n`;
        message += `   Expected file: ${missing.expectedPath}\n`;
        message += `   Locales directory: ${missing.localesDir}\n\n`;
      });

      message +=
        "These namespaces are referenced in i18n configuration but their corresponding JSON files don't exist.\n";
      message +=
        "This will cause 404 errors when the application tries to load these translation files.\n\n";
      message += "To fix this issue:\n";
      message +=
        "1. Create the missing JSON files with appropriate translations, OR\n";
      message +=
        "2. Remove the unused namespace references from the i18n configuration files\n";
    }

    expect(exists, message).toBe(false);
  });

  it("MissingTranslationVariablesTest: Verify that all required variables are passed when using translation keys with variables", () => {
    let message =
      "The following translation keys are missing required variables:\r\n\r\n";
    let missingVariables = [];

    // Get all English translations with variables
    const regVariables = new RegExp("\\{\\{([^\\{].?[^\\}]+)\\}\\}", "gm");

    const enTranslationsWithVariables = translationFiles
      .filter((file) => file.language === "en")
      .flatMap((file) =>
        file.translations
          .map((t) => {
            const variables = [...t.value.matchAll(regVariables)].map((m) =>
              m[1]?.trim().replace(", lowercase", ""),
            );
            return {
              key: `${file.namespace}:${t.key}`,
              namespace: file.namespace,
              translationKey: t.key,
              value: t.value,
              variables,
            };
          })
          .filter((t) => t.variables.length > 0),
      );

    // Create a map for quick lookup
    const variablesMap = new Map();
    enTranslationsWithVariables.forEach((t) => {
      variablesMap.set(t.key, t.variables);
    });

    // Pattern to find t() calls with variables object
    // We need to manually parse to handle nested braces in template literals
    const findTCallsWithVariables = (text) => {
      const results = [];
      const tCallPattern = /t\??\(["'`]([a-zA-Z0-9_.:/-]+)["'`]\s*,\s*\{/g;

      let match;
      while ((match = tCallPattern.exec(text)) !== null) {
        const key = match[1];
        const startPos = match.index + match[0].length - 1; // Position of opening {

        // Find matching closing brace by counting nested braces
        let braceCount = 1;
        let endPos = startPos + 1;
        let inString = false;
        let stringChar = null;
        let inTemplate = false;

        while (endPos < text.length && braceCount > 0) {
          const char = text[endPos];
          const prevChar = text[endPos - 1];

          // Handle string literals
          if (
            (char === '"' || char === "'" || char === "`") &&
            prevChar !== "\\"
          ) {
            if (!inString) {
              inString = true;
              stringChar = char;
              inTemplate = char === "`";
            } else if (char === stringChar) {
              inString = false;
              stringChar = null;
              inTemplate = false;
            }
          }

          // Count braces only outside strings, but include template literal braces
          if (!inString || inTemplate) {
            if (char === "{") {
              braceCount++;
            } else if (char === "}") {
              braceCount--;
            }
          }

          endPos++;
        }

        if (braceCount === 0) {
          const variablesString = text.substring(startPos + 1, endPos - 1);
          results.push({
            key,
            variablesString,
            fullMatch: text.substring(match.index, endPos),
          });
        }
      }

      return results;
    };

    javascriptFiles.forEach((jsFile) => {
      const jsFileText = fs.readFileSync(jsFile.path, "utf8");
      const matches = findTCallsWithVariables(jsFileText);

      matches.forEach((match) => {
        const fullKey = match.key;
        const variablesString = match.variablesString;

        // Parse the key (it might have namespace or not)
        const keyParts = fullKey.split(":");
        const hasNamespace = keyParts.length > 1;
        const translationKey = hasNamespace ? keyParts[1] : keyParts[0];

        // Try to find the key in our map
        let expectedVariables = variablesMap.get(fullKey);

        if (!expectedVariables && hasNamespace) {
          // If namespace is specified, ONLY look in that namespace
          // Don't fall back to searching in other namespaces
          return; // Key not found in the specified namespace with variables
        }

        if (!expectedVariables && !hasNamespace) {
          // If no namespace specified, try to find by key only in any namespace
          for (const [mapKey, vars] of variablesMap.entries()) {
            if (mapKey.endsWith(`:${translationKey}`)) {
              expectedVariables = vars;
              break;
            }
          }
        }

        if (!expectedVariables) return; // Key not found in translations with variables

        // Extract variable names from the object
        // Handle both full syntax (key: value) and shorthand syntax (key)
        const passedVariables = [];

        // Split by comma to get individual properties
        const properties = variablesString.split(",").map((p) => p.trim());

        for (const prop of properties) {
          if (!prop) continue;

          // Check if it contains a colon (full syntax: key: value)
          if (prop.includes(":")) {
            const keyMatch = prop.match(/^(\w+)\s*:/);
            if (keyMatch) {
              passedVariables.push(keyMatch[1]);
            }
          } else {
            // Shorthand syntax: just the key name
            const keyMatch = prop.match(/^(\w+)/);
            if (keyMatch) {
              passedVariables.push(keyMatch[1]);
            }
          }
        }

        // Check if all expected variables are passed
        const missingVars = expectedVariables.filter(
          (v) => !passedVariables.includes(v),
        );

        if (missingVars.length > 0) {
          missingVariables.push({
            file: jsFile.path,
            key: fullKey,
            expectedVariables,
            passedVariables,
            missingVars,
            line: match.fullMatch,
          });
        }
      });
    });

    // Also check for t() calls WITHOUT variables object where variables are expected
    const tCallWithoutVariablesPattern =
      /t\??\(["'`]([a-zA-Z0-9_.:/-]+)["'`]\s*\)/g;

    javascriptFiles.forEach((jsFile) => {
      const jsFileText = fs.readFileSync(jsFile.path, "utf8");
      const matches = [...jsFileText.matchAll(tCallWithoutVariablesPattern)];

      matches.forEach((match) => {
        const fullKey = match[1];

        // Parse the key (it might have namespace or not)
        const keyParts = fullKey.split(":");
        const hasNamespace = keyParts.length > 1;
        const translationKey = hasNamespace ? keyParts[1] : keyParts[0];

        // Try to find the key in our map
        let expectedVariables = variablesMap.get(fullKey);

        if (!expectedVariables && hasNamespace) {
          // If namespace is specified, ONLY look in that namespace
          // Don't fall back to searching in other namespaces
          return; // Key not found in the specified namespace with variables
        }

        if (!expectedVariables && !hasNamespace) {
          // If no namespace specified, try to find by key only in any namespace
          for (const [mapKey, vars] of variablesMap.entries()) {
            if (mapKey.endsWith(`:${translationKey}`)) {
              expectedVariables = vars;
              break;
            }
          }
        }

        if (expectedVariables && expectedVariables.length > 0) {
          missingVariables.push({
            file: jsFile.path,
            key: fullKey,
            expectedVariables,
            passedVariables: [],
            missingVars: expectedVariables,
            line: match[0],
          });
        }
      });
    });

    if (missingVariables.length > 0) {
      let i = 1;
      message += missingVariables
        .map(
          (item) =>
            `${i++}. File: ${path.relative(BASE_DIR, item.file)}\n` +
            `   Key: ${item.key}\n` +
            `   Expected variables: [${item.expectedVariables.join(", ")}]\n` +
            `   Passed variables: [${item.passedVariables.join(", ")}]\n` +
            `   Missing variables: [${item.missingVars.join(", ")}]\n` +
            `   Code: ${item.line}\n`,
        )
        .join("\n");
    }

    expect(missingVariables.length, message).toBe(0);
  });

  it("DeletedNamespacesTest: Verify that all namespaces referenced in useTranslation/withTranslation calls exist as translation files", () => {
    // Collect all available English namespaces from translation files
    const availableNamespaces = new Set(
      translationFiles
        .filter((file) => file.language === "en")
        .map((file) => file.namespace),
    );

    // Patterns for source files: useTranslation and withTranslation
    const sourceArrayPatterns = [
      /useTranslation\(\s*\[([\s\S]*?)\]/g,
      /withTranslation\(\s*\[([\s\S]*?)\]/g,
    ];
    const sourceSinglePatterns = [
      /useTranslation\(\s*["'`]([a-zA-Z0-9_-]+)["'`]/g,
      /withTranslation\(\s*["'`]([a-zA-Z0-9_-]+)["'`]/g,
    ];

    const extractNamespacesFromArray = (arrayContent) => {
      // Remove single-line comments before parsing
      const cleaned = arrayContent.replace(/\/\/.*$/gm, "");
      return cleaned
        .split(",")
        .map((ns) => ns.trim().replace(/["'`]/g, ""))
        .filter(
          (ns) => ns && ns !== "" && !ns.includes("(") && !ns.includes("{"),
        );
    };

    const deletedNamespaces = [];

    // Scan all JS/TS source files (reuse the ones already collected in beforeAll)
    const allSourceFiles = workspaces.flatMap((wsPath) => {
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
        "scripts",
        "storybook-helpers",
        ".storybook",
      ];
      return getAllFiles(clientDir, excludeDirs).filter(
        (filePath) =>
          filePath &&
          /\.(js|jsx|ts|tsx)$/.test(filePath) &&
          !filePath.includes(".test.") &&
          !filePath.includes(".stories."),
      );
    });

    const checkNamespaces = (content, filePath, patterns) => {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const namespaces = extractNamespacesFromArray(match[1]);
          namespaces.forEach((ns) => {
            if (!availableNamespaces.has(ns)) {
              deletedNamespaces.push({ file: filePath, namespace: ns });
            }
          });
        }
      }
    };

    // Scan source files for useTranslation/withTranslation
    allSourceFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, "utf8");

      checkNamespaces(content, filePath, sourceArrayPatterns);

      // Check useTranslation("Namespace") and withTranslation("Namespace")
      for (const pattern of sourceSinglePatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const ns = match[1];
          if (!availableNamespaces.has(ns)) {
            deletedNamespaces.push({ file: filePath, namespace: ns });
          }
        }
      }
    });

    // Deduplicate by file+namespace
    const uniqueEntries = deletedNamespaces.filter(
      (entry, index, self) =>
        self.findIndex(
          (e) => e.file === entry.file && e.namespace === entry.namespace,
        ) === index,
    );

    let message = `Found ${uniqueEntries.length} references to deleted/non-existent i18n namespaces:\r\n\r\n`;

    if (uniqueEntries.length > 0) {
      // Group by namespace for clearer output
      const grouped = uniqueEntries.reduce((acc, entry) => {
        if (!acc[entry.namespace]) {
          acc[entry.namespace] = [];
        }
        acc[entry.namespace].push(entry.file);
        return acc;
      }, {});

      let i = 0;
      Object.entries(grouped).forEach(([namespace, files]) => {
        message += `${++i}. Namespace "${namespace}" does not exist but is referenced in:\r\n`;
        files.forEach((file) => {
          message += `   - ${path.relative(BASE_DIR, file)}\r\n`;
        });
        message += "\r\n";
      });

      message +=
        "Either create the missing namespace translation files or remove the namespace references from the code.\r\n";
    }

    expect(uniqueEntries.length, message).toBe(0);
  });

  it("MalformedTagsTest: Verify that HTML/React tags in translations have no extra internal whitespace.", () => {
    // Tags like "<strong >" or "< /strong>" will break rendering.
    // The WrongTranslationTagsTest normalizes whitespace before comparing,
    // so malformed tags slip through undetected. This test catches them directly.
    // Exception: if the English source itself contains the same malformed tag, it's intentional.
    const tagRegex = /<\/?[a-zA-Z][^>]*\/?>/g;
    const malformedTagRegex = /\s+\/?>|<\s+/;

    // Build set of malformed tags that exist in EN sources — these are intentional
    const enMalformedByKey = {};
    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          if (!t.value) return;
          const tags = t.value.match(tagRegex) || [];
          const malformed = tags.filter((tag) => malformedTagRegex.test(tag));
          if (malformed.length > 0) {
            enMalformedByKey[`${file.namespace}:${t.key}`] = new Set(malformed);
          }
        });
      });

    let message = "Next keys have malformed HTML/React tags (extra whitespace inside tag):\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const malformedKeys = [];

    translationFiles.forEach((file) => {
      if (file.language === "en") return;

      file.translations.forEach((t) => {
        if (!t.value) return;

        const fullKey = `${file.namespace}:${t.key}`;
        const enAllowed = enMalformedByKey[fullKey];

        const tags = t.value.match(tagRegex) || [];
        // Filter out tags that also appear malformed in the EN source
        const malformed = tags.filter(
          (tag) => malformedTagRegex.test(tag) && !(enAllowed && enAllowed.has(tag)),
        );

        if (malformed.length > 0) {
          message +=
            `${++i}. lng='${file.language}' key='${fullKey}'\r\n` +
            `  Malformed tag(s): ${malformed.join(", ")}\r\n` +
            `  Value: '${t.value.substring(0, 200)}'\r\n\r\n`;
          errorsCount++;
          malformedKeys.push({ language: file.language, key: fullKey });
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(malformedKeys),
      "malformed tag translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("HtmlEntityConsistencyTest: Verify that HTML entities (&nbsp;, &amp;, etc.) are consistent between English and other languages.", () => {
    const entityRegex = /&[a-zA-Z]+;/g;

    let message = "Next keys have mismatched HTML entities between English and translation:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const entityMismatchKeys = [];

    const groupedByLng = translationFiles.reduce((acc, t) => {
      if (!acc[t.language]) acc[t.language] = [];
      acc[t.language].push(
        ...t.translations.map((k) => ({
          key: `${t.namespace}:${k.key}`,
          value: k.value,
          language: t.language,
          entities: (k.value.match(entityRegex) || []).sort(),
        })),
      );
      return acc;
    }, {});

    const enWithEntities = (groupedByLng["en"] || []).filter(
      (t) => t.entities.length > 0,
    );

    const otherLanguages = Object.keys(groupedByLng)
      .filter((lang) => lang !== "en")
      .map((lang) => ({
        language: lang,
        translations: groupedByLng[lang],
      }));

    enWithEntities.forEach((enKey) => {
      otherLanguages.forEach((lng) => {
        const lngKey = lng.translations.find((t) => t.key === enKey.key);
        if (!lngKey || !lngKey.value) return;

        const enStr = enKey.entities.join(",");
        const lngStr = lngKey.entities.join(",");

        if (enStr !== lngStr) {
          const missing = enKey.entities.filter((e) => !lngKey.entities.includes(e));
          const extra = lngKey.entities.filter((e) => !enKey.entities.includes(e));
          const parts = [];
          if (missing.length) parts.push(`missing: ${missing.join(", ")}`);
          if (extra.length) parts.push(`extra: ${extra.join(", ")}`);

          message +=
            `${++i}. lng='${lng.language}' key='${lngKey.key}' — ${parts.join("; ")}\r\n` +
            `  'en': '${enKey.value}'\r\n  '${lng.language}': '${lngKey.value}'\r\n\r\n`;
          errorsCount++;
          entityMismatchKeys.push({ language: lng.language, key: lngKey.key });
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(entityMismatchKeys),
      "entity mismatch translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("UnpairedBracketsTest: Verify that translations have balanced brackets and quotes.", () => {
    // Simple pairs: count(open) must equal count(close)
    const simplePairs = [
      ["(", ")"],
      ["[", "]"],
      ["\u00AB", "\u00BB"], // « »
    ];

    // Smart-quote groups: different languages use different combinations:
    //   „..." (de, cs, bg, pl, ro, sk, sl, sr, hr) — U+201E opens, U+201C closes
    //   "..." (en, fr, es, it, etc.) — U+201C opens, U+201D closes
    //   „..." (de alt) — U+201E opens, U+201D closes
    // Since U+201C can be either opener or closer depending on language,
    // we simply check that the total count of all curly-quote chars is even
    // (every open must have a matching close).
    const quoteGroups = [
      {
        name: "\u201C\u201D\u201E",
        chars: ["\u201C", "\u201D", "\u201E"], // " " „
      },
    ];

    let message = "Next keys have unpaired brackets/quotes in translations:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const unpairedKeys = [];

    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (!t.value) return;

        // Simple pairs
        for (const [open, close] of simplePairs) {
          const openRe = new RegExp(`\\${open}`, "g");
          const closeRe = new RegExp(`\\${close}`, "g");
          const openCount = (t.value.match(openRe) || []).length;
          const closeCount = (t.value.match(closeRe) || []).length;

          if (openCount !== closeCount) {
            message +=
              `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}'\r\n` +
              `  Unpaired "${open}${close}": ${openCount} open vs ${closeCount} close\r\n` +
              `  Value: '${t.value.substring(0, 200)}'\r\n\r\n`;
            errorsCount++;
            unpairedKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
          }
        }

        // Smart-quote groups — total count must be even (paired)
        for (const group of quoteGroups) {
          let total = 0;
          for (const ch of group.chars) {
            total += (t.value.match(new RegExp(ch, "g")) || []).length;
          }
          if (total > 0 && total % 2 !== 0) {
            message +=
              `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}'\r\n` +
              `  Odd number of smart quotes (${group.name}): ${total} total (should be even)\r\n` +
              `  Value: '${t.value.substring(0, 200)}'\r\n\r\n`;
            errorsCount++;
            unpairedKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
          }
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(unpairedKeys),
      "unpaired bracket translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("WrongScriptNonLatinTest: Verify that non-Latin language translations contain appropriate script characters.", () => {
    // Extends WrongScriptTest (sr-Cyrl-RS only) to all languages with non-Latin scripts.
    // If a translation is pure ASCII/Latin for a language that requires a different script,
    // and the value differs from English, it's likely untranslated or in the wrong language.
    const nonLatinLanguages = {
      "ar-SA": /[\u0600-\u06FF]/,     // Arabic
      "ja-JP": /[\u3040-\u30FF\u4E00-\u9FFF]/,  // Hiragana, Katakana, CJK
      "zh-CN": /[\u4E00-\u9FFF]/,     // CJK Unified
      "ko-KR": /[\uAC00-\uD7AF\u1100-\u11FF]/, // Hangul
      "hy-AM": /[\u0530-\u058F]/,     // Armenian
      "el-GR": /[\u0370-\u03FF]/,     // Greek
      "lo-LA": /[\u0E80-\u0EFF]/,     // Lao
      "si":    /[\u0D80-\u0DFF]/,     // Sinhala
      "uk-UA": /[\u0400-\u04FF]/,     // Cyrillic
      "ru":    /[\u0400-\u04FF]/,     // Cyrillic
      "bg":    /[\u0400-\u04FF]/,     // Cyrillic
      // sr-Cyrl-RS is covered by the dedicated WrongScriptTest
    };

    function stripMarkup(text) {
      return text
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/&[a-zA-Z]+;/g, "");
    }

    // Build cross-language lookup: "namespace|key" → { language: rawValue }
    const crossLangMap = new Map();
    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        const mapKey = `${file.namespace}|${t.key}`;
        if (!crossLangMap.has(mapKey)) crossLangMap.set(mapKey, {});
        crossLangMap.get(mapKey)[file.language] = t.value;
      });
    });

    function matchesEnglish(namespace, key, value) {
      const langs = crossLangMap.get(`${namespace}|${key}`) || {};
      const enVal = langs["en"];
      if (!enVal) return false;
      return value === enVal;
    }

    function matchesOtherLatinLanguage(namespace, key, value) {
      const langs = crossLangMap.get(`${namespace}|${key}`) || {};
      const stripped = stripMarkup(value).trim();
      if (!stripped) return true;
      // Check if any Latin-script language has the same value (intentional like brand names)
      const latinLangs = ["en", "de", "fr", "es", "it", "pt", "pt-BR", "nl", "pl", "cs", "sk",
        "ro", "lv", "sl", "fi", "tr", "sq-AL", "sr-Latn-RS", "az", "vi"];
      return latinLangs.some((lang) => {
        const otherVal = langs[lang];
        return otherVal && stripMarkup(otherVal).trim() === stripped;
      });
    }

    let message = "Next keys in non-Latin languages contain no expected script characters (wrong script):\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const wrongScriptKeys = [];

    for (const [langCode, scriptRegex] of Object.entries(nonLatinLanguages)) {
      const langFiles = translationFiles.filter((f) => f.language === langCode);

      langFiles.forEach((file) => {
        file.translations.forEach((t) => {
          if (!t.value) return;

          const stripped = stripMarkup(t.value).trim();
          // Skip short values (brand names, abbreviations, etc.)
          if (stripped.length <= 15) return;

          // Has expected script characters — OK
          if (scriptRegex.test(stripped)) return;

          // Value is identical to English — intentional (brand name, product name, etc.)
          if (matchesEnglish(file.namespace, t.key, t.value)) return;

          // Value matches a Latin-script language — intentional
          if (matchesOtherLatinLanguage(file.namespace, t.key, t.value)) return;

          message +=
            `${++i}. lng='${langCode}' key='${file.namespace}:${t.key}'\r\n` +
            `  Value: '${t.value.substring(0, 150)}'\r\n\r\n`;
          errorsCount++;
          wrongScriptKeys.push({ language: langCode, key: `${file.namespace}:${t.key}` });
        });
      });
    }

    clearWrongKeys(
      resolveTranslationEntries(wrongScriptKeys),
      "wrong-script keys in non-Latin languages",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("ForeignScriptContaminationTest: Verify that translations do not contain characters from unrelated scripts.", () => {
    // Each language has a set of ALLOWED Unicode script ranges.
    // Any character outside ASCII + allowed ranges (after stripping markup) is contamination.
    // For example, Bengali characters in lo-LA, or Khmer characters in lo-LA.
    // This catches cases where the LLM outputs text in the completely wrong writing system.

    const scriptRanges = {
      "ar-SA":       [[0x0600, 0x06FF], [0x0750, 0x077F], [0xFB50, 0xFDFF], [0xFE70, 0xFEFF]], // Arabic
      "ja-JP":       [[0x3000, 0x303F], [0x3040, 0x309F], [0x30A0, 0x30FF], [0x4E00, 0x9FFF], [0x3400, 0x4DBF], [0xFF00, 0xFFEF]], // CJK Symbols, Hiragana, Katakana, CJK, Fullwidth
      "zh-CN":       [[0x3000, 0x303F], [0x4E00, 0x9FFF], [0x3400, 0x4DBF], [0xFF00, 0xFFEF]], // CJK Symbols, CJK, Fullwidth
      "ko-KR":       [[0x3000, 0x303F], [0xAC00, 0xD7AF], [0x1100, 0x11FF], [0x3130, 0x318F], [0xFF00, 0xFFEF]], // CJK Symbols, Hangul, Fullwidth
      "hy-AM":       [[0x0530, 0x058F], [0xFB00, 0xFB17]], // Armenian
      "el-GR":       [[0x0370, 0x03FF], [0x1F00, 0x1FFF]], // Greek
      "lo-LA":       [[0x0E80, 0x0EFF]], // Lao
      "si":          [[0x0D80, 0x0DFF]], // Sinhala
      "uk-UA":       [[0x0400, 0x04FF]], // Cyrillic
      "ru":          [[0x0400, 0x04FF]], // Cyrillic
      "bg":          [[0x0400, 0x04FF]], // Cyrillic
      "sr-Cyrl-RS":  [[0x0400, 0x04FF]], // Cyrillic
    };

    // Common ranges allowed for ALL languages (Latin for markup/brands, general punctuation, etc.)
    const commonAllowed = [
      [0x0000, 0x007F],   // Basic Latin (ASCII)
      [0x0080, 0x00FF],   // Latin-1 Supplement (accented chars in brand names)
      [0x0100, 0x024F],   // Latin Extended-A/B
      [0x0300, 0x036F],   // Combining Diacritical Marks
      [0x2000, 0x206F],   // General Punctuation
      [0x2070, 0x209F],   // Superscripts/Subscripts
      [0x20A0, 0x20CF],   // Currency Symbols
      [0x2100, 0x214F],   // Letterlike Symbols
      [0x2190, 0x21FF],   // Arrows
      [0x2200, 0x22FF],   // Mathematical
      [0x25A0, 0x25FF],   // Geometric Shapes
      [0x2600, 0x26FF],   // Misc Symbols
      [0x2700, 0x27BF],   // Dingbats
      [0xFE00, 0xFE0F],   // Variation Selectors
      [0xFEFF, 0xFEFF],   // BOM
      [0x200B, 0x200F],   // Zero-width chars
      [0x00AB, 0x00BB],   // « »
    ];

    function isAllowed(cp, langRanges) {
      for (const [lo, hi] of commonAllowed) {
        if (cp >= lo && cp <= hi) return true;
      }
      for (const [lo, hi] of langRanges) {
        if (cp >= lo && cp <= hi) return true;
      }
      return false;
    }

    function stripMarkup(text) {
      return text
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&[a-zA-Z]+;/g, "");
    }

    let message = "Next keys contain characters from foreign/unrelated scripts:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const foreignKeys = [];

    for (const [langCode, ranges] of Object.entries(scriptRanges)) {
      const langFiles = translationFiles.filter((f) => f.language === langCode);

      langFiles.forEach((file) => {
        file.translations.forEach((t) => {
          if (!t.value) return;
          // Skip Culture_ keys — they intentionally contain native script names
          if (t.key.startsWith("Culture_")) return;

          const stripped = stripMarkup(t.value);
          const foreignChars = [];

          for (const ch of stripped) {
            const cp = ch.codePointAt(0);
            if (cp > 0x7F && !isAllowed(cp, ranges)) {
              foreignChars.push({ char: ch, code: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}` });
            }
          }

          if (foreignChars.length > 0) {
            const uniqueScripts = [...new Set(foreignChars.map((f) => f.code))].slice(0, 5);
            message +=
              `${++i}. lng='${langCode}' key='${file.namespace}:${t.key}'\r\n` +
              `  Foreign chars: ${uniqueScripts.join(", ")}\r\n` +
              `  Value: '${t.value.substring(0, 150)}'\r\n\r\n`;
            errorsCount++;
            foreignKeys.push({ language: langCode, key: `${file.namespace}:${t.key}` });
          }
        });
      });
    }

    clearWrongKeys(
      resolveTranslationEntries(foreignKeys),
      "foreign-script contaminated keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("CapitalizationConsistencyTest: Verify that single-word translation keys have consistent capitalization with the English source.", () => {
    // If the English value is a single word (or short label) starting with an uppercase letter,
    // then translations in Latin-script languages should also start with uppercase.
    // This catches issues like EN "Payer" → FR "payeur" (should be "Payeur").
    //
    // We only check Latin-script languages where capitalization rules are similar to English.
    // We skip keys where the EN value is all-caps (abbreviations like "PDF", "API").

    const latinLanguages = [
      "de", "fr", "es", "it", "pt", "pt-BR", "nl", "pl", "cs", "sk",
      "ro", "lv", "sl", "fi", "tr", "sq-AL", "sr-Latn-RS", "az", "vi",
    ];

    // Group translations by namespace:key across languages
    const keyMap = new Map(); // "namespace|key" → { en: value, lang: { code: value } }
    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        const mapKey = `${file.namespace}|${t.key}`;
        if (!keyMap.has(mapKey)) keyMap.set(mapKey, {});
        keyMap.get(mapKey)[file.language] = t.value;
      });
    });

    let message = "Next keys have capitalization inconsistency with English source:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const wrongCapKeys = [];

    keyMap.forEach((values, mapKey) => {
      const enVal = values["en"];
      if (!enVal) return;

      // Only check single-word labels without variables or tags — these are UI terms/nouns
      // that should keep capitalization consistent (e.g. "Payer", "Owner", "Settings").
      // Multi-word phrases have language-specific capitalization rules and are skipped.
      const hasMarkup = /\{\{|<[^>]/.test(enVal);
      if (hasMarkup) return;

      const stripped = enVal.trim();
      const words = stripped.split(/\s+/);
      if (words.length !== 1) return;

      const word = words[0];
      // Skip if all-caps (abbreviation like "PDF", "API")
      if (word === word.toUpperCase() && word.length > 1) return;
      // Must start with uppercase Latin letter
      if (!/^[A-Z]/.test(word)) return;
      // Skip very short words (1-2 chars) — too ambiguous
      if (word.length <= 2) return;

      for (const lang of latinLanguages) {
        const lVal = values[lang];
        if (!lVal) continue;

        const lStripped = lVal.trim();
        if (!lStripped) continue;
        // Skip if translation is identical to EN (intentional — brand/term)
        if (lStripped === stripped) continue;

        const firstChar = lStripped[0];
        // If EN starts uppercase and translation starts lowercase — flag it
        if (firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase()) {
          const [ns, key] = mapKey.split("|");
          message +=
            `${++i}. lng='${lang}' key='${ns}:${key}'\r\n` +
            `  EN: '${enVal}' → ${lang}: '${lVal.substring(0, 80)}'\r\n\r\n`;
          errorsCount++;
          wrongCapKeys.push({ language: lang, key: `${ns}:${key}` });
        }
      }
    });

    clearWrongKeys(
      resolveTranslationEntries(wrongCapKeys),
      "capitalization-inconsistent translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("UntranslatedKeysTest: Verify that non-English translations are not identical copies of the English source for long strings.", () => {
    // If a translation value is identical to English and the text content (after stripping
    // markup/variables) is longer than 40 characters, it's almost certainly untranslated.
    // Short strings may legitimately match English (brand names, technical terms, abbreviations).
    // Culture_ keys are excluded — they contain language names that may match across languages.

    const stripMarkup = (text) =>
      text.replace(/\{\{[^}]+\}\}/g, "").replace(/<[^>]+>/g, "").replace(/&[a-zA-Z]+;/g, "").trim();

    // Build EN reference: namespace → { key → value }
    const enByNsKey = {};
    translationFiles
      .filter((f) => f.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          enByNsKey[`${file.namespace}|${t.key}`] = t.value;
        });
      });

    let message = "Next keys appear to be untranslated (identical to English source):\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const untranslatedKeys = [];

    translationFiles.forEach((file) => {
      if (file.language === "en") return;

      file.translations.forEach((t) => {
        if (!t.value) return;
        if (t.key.startsWith("Culture_")) return;

        const enVal = enByNsKey[`${file.namespace}|${t.key}`];
        if (!enVal || t.value !== enVal) return;

        const cleanLen = stripMarkup(enVal).length;
        if (cleanLen <= 40) return; // short strings may be intentional

        message +=
          `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}'\r\n` +
          `  Value (${enVal.length} chars): '${enVal.substring(0, 120)}${enVal.length > 120 ? "..." : ""}'\r\n\r\n`;
        errorsCount++;
        untranslatedKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(untranslatedKeys),
      "untranslated (EN-identical) keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("SuspiciouslyShortTranslationTest: Verify that translations are not dramatically shorter than their English source.", () => {
    // Catches cases like ClickButtonBelow being replaced with just "<br/>"
    // when the English source is a full sentence.
    const stripMarkup = (text) =>
      text.replace(/\{\{[^}]+\}\}/g, "").replace(/<[^>]+>/g, "").replace(/&[a-zA-Z]+;/g, "").trim();

    const enByNsKey = {};
    translationFiles
      .filter((f) => f.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          enByNsKey[`${file.namespace}|${t.key}`] = t.value;
        });
      });

    let message = "Next keys have suspiciously short translations compared to English:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const shortKeys = [];

    translationFiles.forEach((file) => {
      if (file.language === "en") return;

      file.translations.forEach((t) => {
        if (!t.value) return;

        const enVal = enByNsKey[`${file.namespace}|${t.key}`];
        if (!enVal) return;

        const enClean = stripMarkup(enVal);
        const trClean = stripMarkup(t.value);

        // Only check strings where English text content is substantial (>30 chars)
        if (enClean.length <= 30) return;

        // CJK languages use fewer characters per concept — use a looser threshold
        const cjkLanguages = new Set(["zh-CN", "ja-JP", "ko-KR"]);
        const minRatio = cjkLanguages.has(file.language) ? 0.08 : 0.15;

        // Flag if translation text content is suspiciously short relative to English
        if (trClean.length > 0 && trClean.length < enClean.length * minRatio) {
          message +=
            `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}' ` +
            `(en=${enClean.length} chars, ${file.language}=${trClean.length} chars)\r\n` +
            `'en': '${enVal.substring(0, 100)}${enVal.length > 100 ? "..." : ""}'\r\n` +
            `'${file.language}': '${t.value}'\r\n\r\n`;
          errorsCount++;
          shortKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(shortKeys),
      "suspiciously short translation keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("InvalidVariableNamesTest: Verify that {{variables}} contain only valid identifier characters.", () => {
    // Catches cases like {{azerbaijani text in braces}} or {{variable}}
    // where non-identifier characters ended up inside double braces.
    const regVariables = /\{\{([^}]+)\}\}/g;
    // Valid variable: word chars, dots, spaces around commas (for i18next format)
    const validVariablePattern = /^[\w]+(?:\s*,\s*[\w]+)*$/;

    let message = "Next keys have invalid variable names inside {{}}:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const invalidKeys = [];

    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (!t.value) return;

        const matches = [...t.value.matchAll(regVariables)];
        for (const match of matches) {
          const varContent = match[1].trim();
          if (!validVariablePattern.test(varContent)) {
            message +=
              `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}' ` +
              `invalid variable: '{{${varContent}}}'\r\n` +
              `  value: '${t.value.substring(0, 120)}${t.value.length > 120 ? "..." : ""}'\r\n\r\n`;
            errorsCount++;
            invalidKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
            break; // one error per key is enough
          }
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(invalidKeys),
      "invalid variable name keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("TripleBracesTest: Verify that translations do not contain triple curly braces {{{ which break variable interpolation.", () => {
    const tripleBracePattern = /\{\{\{/;

    let message = "Next keys contain triple curly braces {{{ which break variable interpolation:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const brokenKeys = [];

    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (!t.value) return;
        if (tripleBracePattern.test(t.value)) {
          message +=
            `${++i}. lng='${file.language}' key='${file.namespace}:${t.key}'\r\n` +
            `  value: '${t.value.substring(0, 120)}${t.value.length > 120 ? "..." : ""}'\r\n\r\n`;
          errorsCount++;
          brokenKeys.push({ language: file.language, key: `${file.namespace}:${t.key}` });
        }
      });
    });

    clearWrongKeys(
      resolveTranslationEntries(brokenKeys),
      "triple brace keys",
    );

    expect(errorsCount, message).toBe(0);
  });

  it("ConstantsViaI18nTest: Verify that brand names, constants, and culture labels are not accessed via i18n t() calls.", () => {
    // Brand names (getBrandName), constants (getConstName), and culture labels
    // (getCultureLabel) must be imported directly — NOT via t("Common:ProductName").
    // This prevents race conditions, removes i18n dependency for static data,
    // and keeps a single source of truth in public/locales/.constants/.

    // Exact match for brand/const keys, prefix match for Culture_*.
    // Keys may appear with or without the "Common:" namespace (e.g.
    // `t("ProductName")` is valid i18next shorthand when Common is the default ns).
    const forbiddenExact = new Set();
    brandNameKeys.forEach((k) => {
      forbiddenExact.add(k);
      forbiddenExact.add(`Common:${k}`);
    });

    let message =
      "The following files use brand/constant/culture keys via t() instead of direct imports:\r\n\r\n" +
      "Use getBrandName(), getConstName(), or getCultureLabel() instead of t().\r\n\r\n";
    let errorsCount = 0;
    let i = 0;

    javascriptFiles.forEach((jsFile) => {
      const violations = jsFile.translationKeys.filter(
        (key) =>
          forbiddenExact.has(key) ||
          key.startsWith("Common:Culture_") ||
          key.startsWith("Culture_"),
      );

      if (violations.length === 0) return;

      violations.forEach((key) => {
        message +=
          `${++i}. File: ${jsFile.path}\r\n` +
          `   Key: "${key}"\r\n\r\n`;
        errorsCount++;
      });
    });

    expect(errorsCount, message).toBe(0);
  });

  it("DuplicateKeysAcrossNamespacesTest: Verify that the same translation key does not appear in multiple namespaces.", () => {
    // Duplicate keys across namespaces cause confusion: it's unclear which
    // translation is actually used, and changes to one copy may not propagate
    // to the other. Each key should exist in exactly one namespace.

    const keyLocations = {};

    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          if (!keyLocations[t.key]) {
            keyLocations[t.key] = [];
          }
          keyLocations[t.key].push(file.namespace);
        });
      });

    const duplicates = Object.entries(keyLocations)
      .filter(([, namespaces]) => namespaces.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    let message =
      "The following translation keys exist in multiple namespaces.\r\n" +
      "Each key should live in exactly one namespace to avoid confusion.\r\n\r\n";

    duplicates.forEach(([key, namespaces]) => {
      message += `  ${key}: ${namespaces.join(", ")}\r\n`;
    });

    expect(duplicates.length, message).toBe(0);
  });
});

