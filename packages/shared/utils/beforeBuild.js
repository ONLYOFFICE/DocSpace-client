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

const path = require("path");
const fs = require("fs");
const { readdir } = require("fs").promises;

let appSettings = null;

try {
  // @ts-expect-error path is correct
  const appSettingsPath = path.resolve(
    __dirname,
    "../../../../buildtools/config/appsettings.json",
  );
  appSettings = fs.existsSync(appSettingsPath)
    ? require("../../../../buildtools/config/appsettings.json")
    : null;
} catch (e) {
  console.log(e);
}
const beforeBuild = async (
  pathsToLocales,
  pathToFile,
  additionalPath,
  isSSR = false,
) => {
  async function getCultures() {
    const fileInDir = await readdir(pathsToLocales[0], {
      withFileTypes: true,
    });

    const cultures = fileInDir
      .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith("."))
      .map((d) => d.name);

    return cultures;
  }
  async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);

      if (dirent.isDirectory()) {
        if (dirent.name.startsWith(".")) continue;
        yield* getFiles(res);
      } else {
        yield { path: res, fileName: dirent.name };
      }
    }
  }

  const getLocalesFiles = async () => {
    const files = [];

    for await (const p of pathsToLocales) {
      for await (const f of getFiles(p)) {
        if (f) files.push(f);
      }
    }

    if (additionalPath) {
      for await (const f of getFiles(additionalPath?.path)) {
        if (f && additionalPath?.files?.indexOf(f?.fileName) > -1)
          files.push(f);
      }
    }

    return files.filter(
      (f) =>
        !f.path.endsWith(".DS_Store") &&
        !f.path.includes("locales/.meta") &&
        !f.path.includes("locales\\.meta"),
    );
  };

  const localesFiles = await getLocalesFiles();

  const cultures = appSettings ? appSettings.web.cultures : await getCultures();

  const collectionByLng = new Map();
  const truthLng = new Map();

  let importString = "\n";

  localesFiles.forEach((file) => {
    const splitPath = file.path.split(path.sep);

    const { length } = splitPath;

    const url = [
      splitPath[length - 3],
      splitPath[length - 2],
      splitPath[length - 1],
    ].join("/");

    const fileName = splitPath[length - 1].split(".")[0];

    const lng = splitPath[length - 2];

    let language = lng === "en-US" || lng === "en-GB" ? "en" : lng;

    if (cultures.includes(language) === -1) {
      return;
    }

    const splitted = lng.split("-");

    if (splitted.length === 2 && splitted[0] === splitted[1].toLowerCase()) {
      [language] = splitted;
    }

    truthLng.set(language, language.replaceAll("-", ""));

    language = language.replaceAll("-", "");

    const items = collectionByLng.get(language);

    if (items && items.length > 0) {
      items.push(fileName);
      collectionByLng.set(language, items);
    } else {
      collectionByLng.set(language, [fileName]);
    }

    const alias =
      additionalPath?.files?.indexOf(splitPath[length - 1].toString()) > -1
        ? additionalPath.alias
        : fileName.indexOf("Common") === -1
          ? "ASSETS_DIR"
          : "PUBLIC_DIR";

    importString = `${importString}
      import ${fileName}${language}Url from "${alias}/${url}${isSSR ? "" : "?url"}";\n`;
  });

  let content = `//THIS FILE IS AUTO GENERATED\n//DO NOT EDIT AND DELETE IT\n
    ${importString}`;

  let generalCollection = `\n export const translations = new Map([`;

  collectionByLng.forEach((collection, key) => {
    let collectionString = `\n const ${key} = new Map([`;

    collection.forEach((c, index) => {
      collectionString += `\n["${c}", ${c}${key}Url]`;

      if (index !== collection.length - 1) collectionString += `,`;
    });

    collectionString += `\n]);`;

    content += collectionString;
  });

  truthLng.forEach((col, key) => {
    generalCollection += `\n["${key}", ${col}],`;
  });

  generalCollection += `\n]);`;

  content += generalCollection;

  fs.writeFile(pathToFile, content, "utf8", function (err) {
    if (err) throw new Error(Error);

    console.log("The auto generated translations file has been created!");
  });
};

module.exports = beforeBuild;
