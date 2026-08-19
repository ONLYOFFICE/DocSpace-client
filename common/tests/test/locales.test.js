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

// Groups of English keys that already share one value inside a namespace.
// This baseline freezes pre-existing debt so the test only catches NEW
// collisions; it must only ever shrink. An entry is
// "Namespace: KeyA, KeyB" — the keys sorted alphabetically — so a third key
// joining an allowlisted pair changes the signature and fails the test.
const duplicateValuesAllowlist = new Set(
  JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "duplicate-en-values-allowlist.json"),
      "utf8",
    ),
  ),
);

// Two keys in one namespace holding the same English text mean the UI offers
// the same wording under two names and every translator pays for it twice.
const collectEnValueCollisions = (files) => {
  const byNamespace = new Map();

  files
    .filter((file) => file.language === "en" && file.namespace !== "BrandNames")
    .forEach((file) => {
      if (!byNamespace.has(file.namespace)) {
        byNamespace.set(file.namespace, new Map());
      }
      const values = byNamespace.get(file.namespace);

      file.translations.forEach(({ key, value }) => {
        // empty values are EmptyValueKeysTest's business, not a collision
        if (typeof value !== "string" || value.trim() === "") return;
        if (!values.has(value)) values.set(value, new Set());
        values.get(value).add(key);
      });
    });

  const collisions = [];

  byNamespace.forEach((values, namespace) => {
    values.forEach((keys, value) => {
      if (keys.size < 2) return;
      collisions.push({
        signature: `${namespace}: ${[...keys].sort().join(", ")}`,
        value,
      });
    });
  });

  return collisions.sort((a, b) => a.signature.localeCompare(b.signature));
};

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
const skipForbiddenKeys = [];

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
 * Trim leading/trailing whitespace from translation values when
 * TRIM_WRONG_VALUES=true. Accepts entries already resolved to { filePath, key }.
 *
 * @param {Array<{filePath: string, key: string}>} entries
 * @param {string} label - Description for console output (e.g. "whitespace values")
 */
function trimWrongValues(entries, label) {
  if (process.env.TRIM_WRONG_VALUES !== "true" || entries.length === 0) return;

  const grouped = {};
  entries.forEach(({ filePath, key }) => {
    if (!grouped[filePath]) grouped[filePath] = [];
    grouped[filePath].push(key);
  });

  let total = 0;
  Object.entries(grouped).forEach(([fp, keys]) => {
    const content = JSON.parse(fs.readFileSync(fp, "utf8"));
    keys.forEach((k) => {
      if (typeof content[k] === "string" && content[k] !== content[k].trim()) {
        content[k] = content[k].trim();
        total += 1;
      }
    });
    fs.writeFileSync(fp, `${JSON.stringify(content, null, 2)}\n`);
  });

  console.log(`Trimmed ${total} ${label}.`);
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
      filePath.endsWith(convertPathToOS("/i18n.js")) ||
      filePath.endsWith(convertPathToOS("/i18n.ts")),
  );

  console.log(
    `Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`,
  );

  // `t(`, `t?.(`, and the TS non-null-assertion forms `t!(` / `i18n!.t!(`
  // that appear in converted .ts stores.
  const pattern1 =
    "[.{\\s\\(]t[!?]?\\.?\\(\\s*[\"'`]([a-zA-Z0-9_.:\\s{}/-]+)[\"'`]\\s*[\\),]";
  const pattern2 = 'i18nKey="([a-zA-Z0-9_.:-]+)"';
  const pattern3 = 'tKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern4 = 'getTitle\\("([a-zA-Z0-9_.:-]+)"\\)';
  const pattern5 = 'getCommonTranslation\\(\\s*"([a-zA-Z0-9_.:-]+)"[\\s,)]';
  const pattern6 = 'titleKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern7 = 'translationKey:\\s"([a-zA-Z0-9_.:-]+)"';
  const pattern8 = 'labelKey:\\s"([a-zA-Z0-9_.:-]+)"';
  // aiT — alias for the i18n `t` from the @onlyoffice/ai-chat bundle
  // (e.g. `const { t: aiT } = useI18n()`).
  const pattern9 =
    "aiT\\(\\s*[\"'`]([a-zA-Z0-9_.:\\s{}/-]+)[\"'`]\\s*[\\),]";

  const regexp = new RegExp(
    `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})|(${pattern5})|(${pattern6})|(${pattern7})|(${pattern8})|(${pattern9})`,
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
      .map(
        (m) =>
          m[2] ||
          m[4] ||
          m[6] ||
          m[8] ||
          m[10] ||
          m[12] ||
          m[14] ||
          m[16] ||
          m[18],
      )
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
      isCommon: wsPath.includes(path.join("public", "locales")),
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

  it("DuplicateEnValuesTest: Verify that no two English keys inside one namespace carry the same value.", () => {
    const collisions = collectEnValueCollisions(translationFiles);
    const offenders = collisions.filter(
      (collision) => !duplicateValuesAllowlist.has(collision.signature),
    );

    const message =
      `These English keys hold the same value inside one namespace, so the ` +
      `same wording ships under two names and every language pays to ` +
      `translate it twice. It usually means a renamed key was kept next to ` +
      `its replacement.\r\n` +
      `Keep one key, point its callers at it and delete the rest. Only when ` +
      `both keys must stay (different UI concepts that happen to read the ` +
      `same) add the signature to duplicate-en-values-allowlist.json — the ` +
      `baseline must only shrink.\r\n\r\n` +
      `${offenders
        .map((c, i) => `${i + 1}. ${c.signature}\r\n     = "${c.value}"`)
        .join("\r\n")}`;

    expect(offenders.length, message).toBe(0);
  });

  it("StaleDuplicateEnValuesAllowlist: the duplicate-value baseline only lists collisions that still exist.", () => {
    const current = new Set(
      collectEnValueCollisions(translationFiles).map((c) => c.signature),
    );
    const stale = [...duplicateValuesAllowlist].filter(
      (signature) => !current.has(signature),
    );

    const message =
      `These entries in duplicate-en-values-allowlist.json no longer ` +
      `collide — the keys were merged, deleted or reworded, or another key ` +
      `joined the group and changed its signature. Delete them from the ` +
      `baseline (it must only shrink).\r\n\r\n` +
      `${stale.map((signature, i) => `${i + 1}. ${signature}`).join("\r\n")}`;

    expect(stale.length, message).toBe(0);
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

    const checkLanguages = (languages) => {
      languages.forEach((lng) => {
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
    };

    moduleFolders.forEach((module) => {
      if (!module.availableLanguages) return;
      checkLanguages(module.availableLanguages);
    });

    checkLanguages(commonTranslations);

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

  it("TrailingWhitespaceTest: Verify that translation values have no leading or trailing whitespace that the English source does not have.", () => {
    // Some English values intentionally end with a space because an inline
    // element (link, button) is concatenated after them (e.g. SDKDescription:
    // "...refer to the "). Those translations legitimately keep the whitespace.
    // So we only flag a translation when its English counterpart is itself
    // free of surrounding whitespace — i.e. the whitespace was added by mistake.
    const enValues = new Map();
    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          enValues.set(`${file.namespace}:${t.key}`, t.value);
        });
      });

    let message =
      "Next translation values have leading/trailing whitespace absent from the English source:\r\n\r\n";
    let i = 0;
    const whitespaceEntries = [];

    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (typeof t.value !== "string" || !t.value.length) return;
        if (t.value === t.value.trim()) return;

        const enValue = enValues.get(`${file.namespace}:${t.key}`);
        // No English counterpart, or English itself has surrounding
        // whitespace (intentional concatenation) — skip.
        if (enValue === undefined || enValue !== enValue.trim()) return;

        message += `${++i}. Language '${file.language}' key '${file.namespace}:${t.key}' (Path '${file.path}')\r\n  Value: '${t.value}'\r\n\r\n`;
        whitespaceEntries.push({ filePath: file.path, key: t.key });
      });
    });

    trimWrongValues(whitespaceEntries, "whitespace translation values");

    expect(whitespaceEntries.length, message).toBe(0);
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

  /**
   * Group the English translation files by their `public/locales` root, and list
   * every language folder that sits next to `en` in that root.
   *
   * Language folders are read from disk instead of being derived from
   * `translationFiles` so that a namespace file which is missing entirely for a
   * language is still detected.
   *
   * Note: `libs/ui-kit/locales` is intentionally out of scope — it lives in the
   * docspace-ui-kit-react submodule and cannot be fixed from this repository.
   *
   * @returns {Array<{localesDir: string, languages: string[], namespaces: object[]}>}
   */
  const getLocaleRoots = () => {
    const roots = new Map();

    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        const localesDir = path.dirname(path.dirname(file.path));

        if (!roots.has(localesDir)) {
          const languages = fs
            .readdirSync(localesDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
            .map((entry) => entry.name)
            .filter((language) => language !== "en")
            .sort();

          roots.set(localesDir, { localesDir, languages, namespaces: [] });
        }

        roots.get(localesDir).namespaces.push(file);
      });

    return [...roots.values()];
  };

  // Both this and NotTranslatedOnAllLanguages report pending translation work
  // rather than a code defect, so they are skipped on pre-push (see
  // `test:lefthook`) — the same way NotTranslatedOnBaseLanguages is.
  const skipAllLanguagesTest = process.env.SKIP_ALL_LANGUAGES_TEST === "true";

  (skipAllLanguagesTest ? it.skip : it)("MissingLocaleFilesTest: Verify that every namespace file present for 'en' also exists for all other languages.", () => {
    const missingFiles = [];

    getLocaleRoots().forEach(({ localesDir, languages, namespaces }) => {
      languages.forEach((lng) => {
        namespaces.forEach((file) => {
          const expectedPath = path.join(localesDir, lng, file.fileName);

          if (fs.existsSync(expectedPath)) return;

          missingFiles.push({
            language: lng,
            namespace: file.namespace,
            keysCount: file.translations.length,
            expectedPath,
          });
        });
      });
    });

    let message =
      `Next namespace files exist for 'en' but are missing for other languages:\r\n\r\n`;

    missingFiles.forEach((f, index) => {
      message +=
        `${index + 1}. Language '${f.language}', namespace '${f.namespace}' ` +
        `(Count: ${f.keysCount}). Expected path '${f.expectedPath}'\r\n`;
    });

    expect(missingFiles.length === 0, message).toBe(true);
  });

  // Unlike NotTranslatedOnBaseLanguages, this covers every language folder, not
  // only BASE_LANGUAGES.
  (skipAllLanguagesTest ? it.skip : it)(
    "NotTranslatedOnAllLanguages: Verify that all English translation keys are present in every supported language, not only in the base ones.",
    () => {
      let message = `Next keys are not translated in all supported languages:\r\n\r\n`;

      let exists = false;
      let i = 0;

      getLocaleRoots().forEach(({ localesDir, languages, namespaces }) => {
        // namespace → keys expected from the English source
        const expectedKeys = namespaces.map((file) => ({
          namespace: file.namespace,
          keys: file.translations
            .filter((t) => !brandNameKeys.has(t.key))
            .map((t) => t.key),
        }));

        languages.forEach((lng) => {
          const notFoundKeys = [];

          expectedKeys.forEach(({ namespace, keys }) => {
            const lngFile = translationFiles.find(
              (file) =>
                file.language === lng &&
                file.namespace === namespace &&
                path.dirname(path.dirname(file.path)) === localesDir,
            );

            const translatedKeys = new Set(
              (lngFile?.translations ?? [])
                .filter((t) => t.value !== "")
                .map((t) => t.key),
            );

            keys.forEach((key) => {
              if (translatedKeys.has(key)) return;
              notFoundKeys.push(`${namespace}:${key}`);
            });
          });

          if (!notFoundKeys.length) return;

          exists = true;

          message +=
            `${++i}. Language '${lng}' (Count: ${notFoundKeys.length}). ` +
            `Path '${path.join(localesDir, lng)}' Keys:\r\n\r\n`;

          message += notFoundKeys.sort().join("\r\n") + "\r\n\r\n";
        });
      });

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
        const packagePath = i18nFile.replace(/[\\/]src[\\/].*$/, "");
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

  it("NativeLetterPresenceTest: Verify that every translation contains at least one letter from the language's alphabet.", () => {
    // Each language's "alphabet" — a regex that must match at least once in the stripped
    // translation value. After removing {{variables}} and <HTML/React tags> the remaining
    // text must contain at least one native letter.  This catches values that consist
    // entirely of digits, punctuation, or technical symbols with no human-readable text
    // in the target language (e.g. a Russian value of "100% done" with no Cyrillic).
    //
    // Non-Latin-script languages: the regex covers their Unicode block.
    // Latin-script languages: any [a-zA-Z] letter suffices; the test still catches
    // purely-numeric or symbol-only values such as a translation that strips to "42".

    const LANG_ALPHABET = {
      // Non-Latin scripts
      "ar-SA":      /[؀-ۿ]/,
      "el-GR":      /[Ͱ-Ͽ]/,
      "hy-AM":      /[԰-֏]/,
      "ja-JP":      /[぀-ヿ一-鿿]/,
      "ko-KR":      /[가-힯ᄀ-ᇿ]/,
      "lo-LA":      /[຀-໿]/,
      "si":         /[඀-෿]/,
      "zh-CN":      /[一-鿿]/,
      // Cyrillic
      "bg":         /[Ѐ-ӿ]/,
      "ru":         /[Ѐ-ӿ]/,
      "sr-Cyrl-RS": /[Ѐ-ӿ]/,
      "uk-UA":      /[Ѐ-ӿ]/,
      // Latin-script — any Latin letter
      "az":         /[a-zA-Z]/,
      "cs":         /[a-zA-Z]/,
      "de":         /[a-zA-Z]/,
      "es":         /[a-zA-Z]/,
      "fi":         /[a-zA-Z]/,
      "fr":         /[a-zA-Z]/,
      "it":         /[a-zA-Z]/,
      "lv":         /[a-zA-Z]/,
      "nl":         /[a-zA-Z]/,
      "pl":         /[a-zA-Z]/,
      "pt":         /[a-zA-Z]/,
      "pt-BR":      /[a-zA-Z]/,
      "ro":         /[a-zA-Z]/,
      "sk":         /[a-zA-Z]/,
      "sl":         /[a-zA-Z]/,
      "sq-AL":      /[a-zA-Z]/,
      "sr-Latn-RS": /[a-zA-Z]/,
      "tr":         /[a-zA-Z]/,
      "vi":         /[a-zA-Z]/,
    };

    // Minimum stripped-text length to bother checking.
    // Values shorter than this are likely abbreviations, numbers, or symbols.
    const MIN_STRIPPED_LEN = 8;

    function stripMarkup(text) {
      return text
        .replace(/\{\{[^}]+\}\}/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/&[a-zA-Z]+;/g, "");
    }

    // Build EN reference for "equals English" exemption (brand names, tech terms).
    const enByNsKey = {};
    translationFiles
      .filter((f) => f.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          enByNsKey[`${file.namespace}|${t.key}`] = t.value;
        });
      });

    let message =
      "Next translation values contain no letters from the language's alphabet:\r\n\r\n";
    let errorsCount = 0;
    let i = 0;
    const wrongKeys = [];

    for (const [lang, alphabetRegex] of Object.entries(LANG_ALPHABET)) {
      const langFiles = translationFiles.filter((f) => f.language === lang);

      langFiles.forEach((file) => {
        file.translations.forEach((t) => {
          if (!t.value) return;

          const stripped = stripMarkup(t.value).trim();

          // Skip short values — numbers, abbreviations, symbols
          if (stripped.length < MIN_STRIPPED_LEN) return;

          // Skip if identical to English (case-insensitive) — brand names, product names, technical terms
          const enVal = enByNsKey[`${file.namespace}|${t.key}`];
          if (enVal && t.value.toLowerCase() === enVal.toLowerCase()) return;

          // At least one native letter must be present
          if (alphabetRegex.test(stripped)) return;

          message +=
            `${++i}. lng='${lang}' key='${file.namespace}:${t.key}'\r\n` +
            `  Value: '${t.value.substring(0, 150)}'\r\n\r\n`;
          errorsCount++;
          wrongKeys.push({ language: lang, key: `${file.namespace}:${t.key}` });
        });
      });
    }

    clearWrongKeys(
      resolveTranslationEntries(wrongKeys),
      "no-native-letter translation keys",
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

    // Latin-script languages need no native ranges beyond commonAllowed,
    // except a few extras: Vietnamese diacritics and Azerbaijani schwa.
    // Anything else (e.g. Cyrillic inside a German string) is contamination.
    const latinExtraRanges = [
      [0x0250, 0x02AF], // IPA Extensions (Azerbaijani schwa, U+0259)
      [0x02B0, 0x02FF], // Spacing Modifier Letters
      [0x1E00, 0x1EFF], // Latin Extended Additional (Vietnamese)
    ];
    const latinLanguages = [
      "en",
      "az",
      "cs",
      "de",
      "es",
      "fi",
      "fr",
      "it",
      "lv",
      "nl",
      "pl",
      "pt",
      "pt-BR",
      "ro",
      "sk",
      "sl",
      "sq-AL",
      "sr-Latn-RS",
      "tr",
      "vi",
    ];
    for (const lang of latinLanguages) {
      scriptRanges[lang] = latinExtraRanges;
    }

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

  it("UnicodeEscapedValuesTest: Verify that translation files use readable Unicode characters instead of \\uXXXX escape sequences.", () => {
    // JSON files must store non-ASCII characters directly in UTF-8, not as \uXXXX
    // escape sequences. Escaped forms are invisible in code review, harder to spot
    // translation errors in, and typically produced by json.dumps() without
    // ensure_ascii=False or similar tooling mistakes.
    const unicodeEscapePattern = /\\u[0-9a-fA-F]{4}/;

    let message =
      "Next translation files contain \\uXXXX escape sequences instead of readable Unicode characters.\r\n" +
      "Re-save the file in UTF-8 with unescaped characters (e.g. ensure_ascii=False in Python).\r\n\r\n";
    let errorsCount = 0;
    let i = 0;

    translationFiles.forEach((file) => {
      const rawContent = fs.readFileSync(file.path, "utf8");

      if (!unicodeEscapePattern.test(rawContent)) return;

      const escapedLines = rawContent
        .split("\n")
        .map((line, idx) => ({ line, lineNo: idx + 1 }))
        .filter(({ line }) => unicodeEscapePattern.test(line))
        .slice(0, 3)
        .map(
          ({ line, lineNo }) =>
            `    line ${lineNo}: ${line.trim().substring(0, 80)}`,
        )
        .join("\r\n");

      message += `${++i}. ${file.language}/${file.fileName}\r\n${escapedLines}\r\n\r\n`;
      errorsCount++;
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

  it("CommonNamespacePrefixTest: Verify that keys from the Common namespace are referenced with the 'Common:' prefix when the default namespace is not Common.", () => {
    // Common is a shared namespace. Unlike a component-specific namespace, it is
    // almost never the *default* namespace where a key is used: stores and helpers
    // receive `t` from a caller whose default namespace is something else (e.g.
    // "Files"), and most components declare their own namespace first in
    // useTranslation([...]). i18next has no fallbackNS here, so an unprefixed
    // `t("Open")` is looked up ONLY in that default namespace, never in Common.
    // When it isn't found, i18next renders the raw key — which is exactly how the
    // French context menu ended up showing "Open" instead of "Ouvrir".
    //
    // Every Common key is unique to Common (see DuplicateKeysAcrossNamespacesTest),
    // so an unprefixed usage of a Common key is safe ONLY when the file's default
    // namespace is itself Common. In every other case the key MUST be written as
    // "Common:<Key>". The fix is always the same: add the "Common:" prefix.

    const commonKeys = new Set(
      translationFiles
        .filter((file) => file.language === "en" && file.namespace === "Common")
        .flatMap((file) => file.translations.map((t) => t.key)),
    );

    // App-level defaultNS per package, read from the i18n config files. Some apps
    // (e.g. sdk) set `defaultNS: "Common"`, which makes unprefixed Common keys
    // resolve correctly everywhere in that package — those must not be flagged.
    const packageDefaultNs = {};
    i18nFiles.forEach((i18nPath) => {
      const content = fs.readFileSync(i18nPath, "utf8");
      const nsMatch = content.match(
        /defaultNS:\s*["'`]([A-Za-z0-9_]+)["'`]/,
      );
      const pkgMatch = i18nPath.match(
        new RegExp(`(.*\\${path.sep}packages\\${path.sep}[^\\${path.sep}]+)\\${path.sep}`),
      );
      if (pkgMatch) packageDefaultNs[pkgMatch[1]] = nsMatch ? nsMatch[1] : null;
    });

    const getPackageDefaultNs = (filePath) => {
      const pkg = Object.keys(packageDefaultNs).find((p) =>
        filePath.startsWith(p + path.sep),
      );
      return pkg ? packageDefaultNs[pkg] : null;
    };

    // Determine a file's effective default translation namespace:
    //  - useCommonTranslation / getCommonTranslation -> Common (ui-kit helpers)
    //  - first namespace in useTranslation([...]) / withTranslation([...])
    //  - otherwise the package's app-level defaultNS (e.g. "Common" in sdk)
    //  - null when `t` is received externally (stores, helpers) in a package whose
    //    defaultNS is not Common — prefix is then mandatory.
    const getDefaultNamespace = (text, filePath) => {
      if (/useCommonTranslation|getCommonTranslation/.test(text)) return "Common";
      const useMatch = text.match(
        /useTranslation\(\s*\[?\s*["'`]([A-Za-z0-9_]+)["'`]/,
      );
      if (useMatch) return useMatch[1];
      const withMatch = text.match(
        /withTranslation\(\s*\[?\s*["'`]([A-Za-z0-9_]+)["'`]/,
      );
      if (withMatch) return withMatch[1];
      return getPackageDefaultNs(filePath);
    };

    // Extract translation keys used in a single file. Re-parsed here (instead of
    // reusing jsFile.translationKeys) because that shared array is mutated per
    // module in beforeAll and would attribute every module key to its first file.
    // i18nKey is handled separately because <Trans i18nKey="X" ns="Common"> resolves
    // X against the explicit ns prop — no "Common:" prefix is needed there.
    const keyRegexps = [
      /[.{\s(]t\??\.?\(\s*["'`]([a-zA-Z0-9_.:\s{}/-]+)["'`]\s*[),]/gm,
      /tKey:\s"([a-zA-Z0-9_.:-]+)"/gm,
      /getTitle\("([a-zA-Z0-9_.:-]+)"\)/gm,
      /getCommonTranslation\(\s*"([a-zA-Z0-9_.:-]+)"[\s,)]/gm,
      /titleKey:\s"([a-zA-Z0-9_.:-]+)"/gm,
      /translationKey:\s"([a-zA-Z0-9_.:-]+)"/gm,
      /labelKey:\s"([a-zA-Z0-9_.:-]+)"/gm,
    ];

    // Does the JSX opening tag containing the match at `index` carry an explicit
    // `ns="..."` attribute? If so, the key is resolved against that namespace and
    // a "Common:" prefix is not the relevant fix.
    const hasExplicitNs = (text, index) => {
      const tagStart = text.lastIndexOf("<", index);
      const tagEnd = text.indexOf(">", index);
      if (tagStart === -1 || tagEnd === -1) return false;
      return /\bns=["'`][A-Za-z0-9_]+["'`]/.test(text.slice(tagStart, tagEnd));
    };

    const extractKeys = (text) => {
      const keys = new Set();
      keyRegexps.forEach((re) => {
        for (const m of text.matchAll(re)) {
          if (m[1]) keys.add(m[1]);
        }
      });
      // i18nKey="X" — skip occurrences whose tag sets an explicit ns prop.
      for (const m of text.matchAll(/i18nKey="([a-zA-Z0-9_.:-]+)"/gm)) {
        if (m[1] && !hasExplicitNs(text, m.index)) keys.add(m[1]);
      }
      return keys;
    };

    const violations = [];

    javascriptFiles.forEach((jsFile) => {
      // ui-kit is a separate submodule with its own Common-bound translation hook.
      if (jsFile.path.includes(convertPathToOS("libs/ui-kit"))) return;

      const text = fs.readFileSync(jsFile.path, "utf8");

      // When the file's default namespace is Common, unprefixed Common keys
      // resolve correctly — no prefix required.
      if (getDefaultNamespace(text, jsFile.path) === "Common") return;

      const offendingKeys = [...extractKeys(text)]
        .filter((key) => !key.includes(":")) // unprefixed usages only
        .filter((key) => commonKeys.has(key)) // that belong to Common
        .sort();

      if (offendingKeys.length === 0) return;

      violations.push({ path: jsFile.path, keys: offendingKeys });
    });

    let message =
      "The following Common-namespace keys are used without the 'Common:' prefix.\r\n" +
      "They will NOT resolve (i18next renders the raw key) unless the file's default\r\n" +
      "namespace is Common. Prefix each key with 'Common:' (e.g. t(\"Common:Open\")):\r\n\r\n";

    let i = 0;
    violations.forEach((v) => {
      message += `${++i}. File: ${v.path}\r\n   Keys: ${v.keys
        .map((k) => `"${k}"`)
        .join(", ")}\r\n\r\n`;
    });

    expect(violations.length, message).toBe(0);
  });

  it("UiKitCommonResolverPrefixTest: Verify that keys resolved through ui-kit's Common-default helpers carry an explicit namespace prefix.", () => {
    // CommonNamespacePrefixTest skips libs/ui-kit (the submodule has its own
    // Common-bound translation helpers). This test guards that blind spot.
    //
    // ui-kit resolves translations in two Common-defaulting ways:
    //   1. getCommonTranslation(key) / useCommonTranslation() — look an unprefixed
    //      key up ONLY in the Common namespace.
    //   2. helpers shaped `const translate = t ?? getCommonTranslation` — `translate`
    //      is EITHER getCommonTranslation (Common) OR a `t` the caller passed, whose
    //      default namespace can be anything (e.g. a Files-bound `t`).
    //
    // An unprefixed key is therefore unsafe whenever:
    //   (A) it is resolved in Common but the key lives in another namespace — e.g.
    //       translate("RoomFilesLifetime") (Files). It is NEVER found and the raw key
    //       is rendered.
    //   (B) it flows through the `t ?? getCommonTranslation` fallback at all — even a
    //       Common key like "Days" breaks once a non-Common `t` is supplied.
    // The fix is always the same: prefix the key with its namespace
    // ("Files:RoomFilesLifetime", "Common:Days").

    // key -> Set(namespaces) across the English locale files.
    const keyNamespaces = new Map();
    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          if (!keyNamespaces.has(t.key)) keyNamespaces.set(t.key, new Set());
          keyNamespaces.get(t.key).add(file.namespace);
        });
      });
    const isKnownKey = (k) => keyNamespaces.has(k);
    const isCommonKey = (k) =>
      keyNamespaces.has(k) && keyNamespaces.get(k).has("Common");

    const uiKitFiles = getAllFiles(path.join(BASE_DIR, "libs", "ui-kit"), [
      "node_modules",
      convertPathToOS(".next"),
      convertPathToOS("/dist"),
      convertPathToOS(path.join("ui-kit", "locales")),
    ]).filter(
      (filePath) =>
        filePath &&
        /\.(ts|tsx)$/.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories."),
    );

    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const violations = [];

    uiKitFiles.forEach((filePath) => {
      const text = fs.readFileSync(filePath, "utf8");

      // (A) Direct getCommonTranslation("Key"): resolves in Common only, so a bare
      //     key that is defined in some OTHER namespace is always broken.
      for (const m of text.matchAll(
        /getCommonTranslation\(\s*["'`]([a-zA-Z0-9_.:-]+)["'`]/g,
      )) {
        const key = m[1];
        if (key.includes(":")) continue;
        if (isKnownKey(key) && !isCommonKey(key)) {
          violations.push({
            path: filePath,
            key,
            why: `resolved in Common but defined in [${[
              ...keyNamespaces.get(key),
            ].join(", ")}]`,
          });
        }
      }

      // (B) `const <alias> = ... ?? getCommonTranslation`: every key passed to
      //     <alias> must be prefixed, because <alias> may be an external `t`.
      //     [^;\n]* keeps the match on the assignment line so the alias name is the
      //     variable, not an enclosing multi-line function declaration.
      const aliases = new Set();
      for (const m of text.matchAll(
        /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*\?\?\s*getCommonTranslation\b/g,
      )) {
        aliases.add(m[1]);
      }
      aliases.forEach((alias) => {
        const callRe = new RegExp(
          `\\b${escapeRe(alias)}\\(\\s*["'\`]([a-zA-Z0-9_.:-]+)["'\`]`,
          "g",
        );
        for (const m of text.matchAll(callRe)) {
          const key = m[1];
          if (key.includes(":")) continue;
          if (isKnownKey(key)) {
            violations.push({
              path: filePath,
              key,
              why: `passed to \`${alias}\` (t ?? getCommonTranslation) without a namespace prefix`,
            });
          }
        }
      });
    });

    let message =
      "The following keys are resolved through ui-kit Common-default helpers without\r\n" +
      "a namespace prefix. They render as raw keys (always, for non-Common keys; or\r\n" +
      "whenever a non-Common `t` is supplied to a `t ?? getCommonTranslation` helper).\r\n" +
      'Prefix each with its namespace (e.g. "Files:RoomFilesLifetime", "Common:Days"):\r\n\r\n';
    violations.forEach((v, i) => {
      message += `${i + 1}. ${v.path}\r\n   "${v.key}" — ${v.why}\r\n\r\n`;
    });

    expect(violations.length, message).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Structural integrity of translated values.
  //
  // These checks exist because a bulk term rename ({{productName}} -> a plain
  // noun) silently damaged values in ways no earlier test noticed: paragraph
  // breaks were dropped, the space that had preceded a placeholder was left
  // stranded before the punctuation, and machine-translation output reached the
  // JSON with its markdown wrapper still attached.
  // ---------------------------------------------------------------------------

  /**
   * Map "namespace:key" -> English value, for checks that compare against the source.
   */
  const buildEnValues = () => {
    const enValues = new Map();
    translationFiles
      .filter((file) => file.language === "en")
      .forEach((file) => {
        file.translations.forEach((t) => {
          if (typeof t.value === "string") {
            enValues.set(`${file.namespace}:${t.key}`, t.value);
          }
        });
      });
    return enValues;
  };

  /**
   * Neutralise spans that legitimately contain the punctuation we look for:
   * {{variables}}, URLs, ellipses and file extensions (".zip", ".xlsx").
   *
   * Each is replaced by a lowercase letter pair rather than removed. Removing
   * them would manufacture the very defects we look for ("a .xlsx." collapsing
   * to "a ."), and an upper-case stand-in would suppress real ones, because the
   * sentence checks treat a capital before a period as an abbreviation.
   */
  const NEUTRAL = "zz";
  const neutralise = (value) =>
    value
      .replace(/\{\{[^}]+\}\}/g, NEUTRAL)
      .replace(/https?:\/\/\S+/g, NEUTRAL)
      .replace(/\.{2,}/g, NEUTRAL)
      // a file extension, including one that opens the string (".DOCX file")
      .replace(/(^|[^\S\n])\.[a-z0-9]{2,5}(?![a-z0-9])/gi, `$1${NEUTRAL}`);

  it("NewlineConsistencyTest: Verify that translations keep the same number of line breaks as the English source.", () => {
    // A \n in a value is deliberate paragraph structure: the UI renders each
    // segment on its own line. A translation that loses it collapses two
    // paragraphs into one block; one that gains it splits a sentence in half.
    const enValues = buildEnValues();
    const mismatches = [];

    translationFiles.forEach((file) => {
      if (file.language === "en") return;
      file.translations.forEach((t) => {
        if (typeof t.value !== "string") return;
        const enValue = enValues.get(`${file.namespace}:${t.key}`);
        if (typeof enValue !== "string") return;

        const expected = (enValue.match(/\n/g) || []).length;
        const actual = (t.value.match(/\n/g) || []).length;
        if (expected === actual) return;

        mismatches.push({
          language: file.language,
          key: `${file.namespace}:${t.key}`,
          path: file.path,
          expected,
          actual,
        });
      });
    });

    let message =
      "Next translations have a different number of line breaks than the English source.\r\n" +
      "Place the break at the same sentence boundary as English, or remove the extra one:\r\n\r\n";
    mismatches.forEach((m, i) => {
      message += `${i + 1}. Language '${m.language}' key '${m.key}' — English has ${m.expected}, translation has ${m.actual} (Path '${m.path}')\r\n`;
    });

    expect(mismatches.length, message).toBe(0);
  });

  it("LlmArtefactsTest: Verify that translation values carry no machine-translation wrappers.", () => {
    // Values pasted straight out of a model keep their markdown fence, their
    // surrounding JSON quotes, or a refusal sentence. All of them reach the UI
    // verbatim: users saw literal ``` in the Czech interface.
    const artefacts = [
      { name: "markdown code fence", re: /```/ },
      { name: "value wrapped in quotes", re: /^"[\s\S]*"$/ },
      { name: "raw JSON object or array", re: /^\s*[[{]\s*"/ },
      { name: "model refusal or preamble", re: /\bAs an (?:AI|artificial intelligence)\b|\bI'm sorry, (?:but )?I\b|\bI (?:cannot|can't) (?:assist|help|provide)\b/i },
    ];

    const found = [];
    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (typeof t.value !== "string" || !t.value.length) return;
        const hit = artefacts.find((a) => a.re.test(t.value));
        if (!hit) return;
        found.push({
          language: file.language,
          key: `${file.namespace}:${t.key}`,
          path: file.path,
          why: hit.name,
          value: t.value,
        });
      });
    });

    let message =
      "Next translation values contain machine-translation wrappers that render verbatim:\r\n\r\n";
    found.forEach((f, i) => {
      message += `${i + 1}. Language '${f.language}' key '${f.key}' — ${f.why} (Path '${f.path}')\r\n  Value: ${JSON.stringify(f.value.slice(0, 160))}\r\n\r\n`;
    });

    expect(found.length, message).toBe(0);
  });

  it("DoubleSpaceTest: Verify that translations contain no repeated spaces.", () => {
    // Removing a {{placeholder}} without removing the space beside it leaves a
    // double space, which the UI collapses inconsistently across components.
    const found = [];

    translationFiles.forEach((file) => {
      file.translations.forEach((t) => {
        if (typeof t.value !== "string" || !t.value.length) return;
        // "  |  " is the deliberate separator in the tariff strings
        if (t.value.includes("  |  ")) return;
        const matches = t.value.match(/\S {2,}\S/g);
        if (!matches) return;
        found.push({
          language: file.language,
          key: `${file.namespace}:${t.key}`,
          path: file.path,
          fragments: matches,
        });
      });
    });

    let message = "Next translation values contain repeated spaces:\r\n\r\n";
    found.forEach((f, i) => {
      message += `${i + 1}. Language '${f.language}' key '${f.key}' (Path '${f.path}')\r\n  Around: ${JSON.stringify(f.fragments.join(" / "))}\r\n\r\n`;
    });

    expect(found.length, message).toBe(0);
  });

  it("SpaceBeforePunctuationTest: Verify that translations add no space before punctuation absent from the English source.", () => {
    // A stranded space before a period is the tell-tale of a placeholder that
    // was deleted while the space in front of it stayed: "superadmins ." Where
    // English has the same spacing (".DOCX file"), the translation may keep it.
    // French legitimately spaces ':', ';', '!' and '?'.
    const enValues = buildEnValues();
    const found = [];

    translationFiles.forEach((file) => {
      const pattern =
        file.language === "fr" ? /[^\S\n]+[.,)]/g : /[^\S\n]+[.,:;!?)]/g;

      file.translations.forEach((t) => {
        if (typeof t.value !== "string" || !t.value.length) return;
        const id = `${file.language} ${file.namespace}:${t.key}`;
        const actual = (neutralise(t.value).match(pattern) || []).length;
        if (!actual) return;

        const enValue = enValues.get(`${file.namespace}:${t.key}`);
        const expected =
          file.language === "en" || typeof enValue !== "string"
            ? 0
            : (neutralise(enValue).match(pattern) || []).length;
        if (actual <= expected) return;

        found.push({ id, path: file.path, value: t.value });
      });
    });

    let message =
      "Next translations put a space before punctuation where English does not.\r\n" +
      "This usually means a placeholder was removed but the space beside it was kept:\r\n\r\n";
    found.forEach((f, i) => {
      message += `${i + 1}. ${f.id} (Path '${f.path}')\r\n  Value: ${JSON.stringify(f.value.slice(0, 160))}\r\n\r\n`;
    });

    expect(found.length, message).toBe(0);
  });

  it("MissingSpaceAfterSentenceTest: Verify that translations do not glue a sentence to the next one.", () => {
    // The mirror image of the check above: the space vanished together with the
    // placeholder, leaving "urovnya.Oni mogut". Scripts that do not separate
    // sentences with a space are excluded.
    const noSpaceScripts = new Set([
      "zh-CN",
      "ja-JP",
      "ko-KR",
      "lo-LA",
      "si",
      "ar-SA",
    ]);
    const enValues = buildEnValues();
    // A terminator followed straight by a capital. An upper-case letter or digit
    // in front of it means an abbreviation or a version number, not a sentence —
    // and the class has to be Unicode-aware, or Cyrillic "В.{{version}}" reads
    // as a sentence break while Latin "V.{{version}}" does not.
    // A capital that is itself followed by a period is an abbreviation, not a
    // new sentence ("z.B. UsersQuotaLimit").
    const glued = /(?<![\p{Lu}0-9])[.!?](\p{Lu})(?!\.)/gu;

    // Tags that render a break already separate the sentences, and so does a
    // closing tag butted against the next opening one — those become a space.
    // Purely inline markup is dropped, so `</1>Text` still reads as glued.
    const strip = (value) =>
      neutralise(value)
        .replace(/<br\s*\/?>|<\/?(?:p|div|li)\b[^>]*>/gi, " ")
        .replace(/<\/[^>]+><[^/][^>]*>/g, " ")
        .replace(/<[^>]+>/g, "");
    const found = [];

    translationFiles.forEach((file) => {
      if (noSpaceScripts.has(file.language)) return;

      file.translations.forEach((t) => {
        if (typeof t.value !== "string" || !t.value.length) return;
        const id = `${file.language} ${file.namespace}:${t.key}`;
        const actual = (strip(t.value).match(glued) || []).length;
        if (!actual) return;

        const enValue = enValues.get(`${file.namespace}:${t.key}`);
        const expected =
          file.language === "en" || typeof enValue !== "string"
            ? 0
            : (strip(enValue).match(glued) || []).length;
        if (actual <= expected) return;

        found.push({ id, path: file.path, value: t.value });
      });
    });

    let message =
      "Next translations run one sentence straight into the next with no space:\r\n\r\n";
    found.forEach((f, i) => {
      message += `${i + 1}. ${f.id} (Path '${f.path}')\r\n  Value: ${JSON.stringify(f.value.slice(0, 160))}\r\n\r\n`;
    });

    expect(found.length, message).toBe(0);
  });

  it("FinnishCaseSuffixTest: Verify that Finnish colon case endings follow an abbreviation, not an ordinary word.", () => {
    // Finnish attaches a case ending to a NAME or abbreviation with a colon
    // ("LDAP:n", "AI:lla"). Once a bulk rename puts an ordinary noun there the
    // convention no longer applies: "{{productName}} :ssa" became
    // "tyotilassa :ssa", marking the inessive twice.
    const endings =
      "een|ssa|ssä|sta|stä|lle|lla|llä|hen|iin|ksi|ttä|na|nä|n";
    // A word that is lowercase from its very start is an ordinary noun, not an
    // abbreviation or a name — the lookbehind keeps "Edition:n" out of scope.
    const dangling = new RegExp(
      `(?<!\\p{L})\\p{Ll}{4,}\\s*:(?:${endings})(?!\\p{L})`,
      "gu",
    );
    const found = [];

    translationFiles
      .filter((file) => file.language === "fi")
      .forEach((file) => {
        file.translations.forEach((t) => {
          if (typeof t.value !== "string" || !t.value.length) return;
          const matches = t.value.match(dangling);
          if (!matches) return;
          found.push({
            key: `${file.namespace}:${t.key}`,
            path: file.path,
            fragments: matches,
          });
        });
      });

    let message =
      "Next Finnish translations attach a colon case ending to an ordinary word.\r\n" +
      "Inflect the word itself instead (\"tyotila :een\" -> \"tyotilaan\"):\r\n\r\n";
    found.forEach((f, i) => {
      message += `${i + 1}. Key '${f.key}' (Path '${f.path}')\r\n  Around: ${JSON.stringify(f.fragments.join(" "))}\r\n\r\n`;
    });

    expect(found.length, message).toBe(0);
  });
});

