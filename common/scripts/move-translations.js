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

const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const srdDir = "../../packages/client/public/locales";
const dstDir = "../../public/locales";

const keys = ["CopyItem"];
const SRC_LOCALE_FILENAME = "Files.json";
const DST_LOCALE_FILENAME = "Common.json";
const SRC_LOCALE_DIRNAME = path.join(__dirname, srdDir);
const DST_LOCALE_DIRNAME = path.join(__dirname, dstDir);

const run = () => {
  console.log(`
=== Starting translation movement process ===`);
  console.log(`Source directory: ${SRC_LOCALE_DIRNAME}`);
  console.log(`Target directory: ${DST_LOCALE_DIRNAME}`);
  console.log(`Keys to move: ${keys.join(", ")}`);

  readdir(DST_LOCALE_DIRNAME, {
    withFileTypes: true,
  })
    .then((res) => {
      console.log(`Found ${res.length} locales to process
`);

      res.forEach(async (value) => {
        const lng = value.name;

        console.log(`
=== Processing locale: ${lng} ===`);

        const srcFilePath = path.join(
          SRC_LOCALE_DIRNAME,
          lng,
          SRC_LOCALE_FILENAME
        );

        const dstFilePath = path.join(
          DST_LOCALE_DIRNAME,
          lng,
          DST_LOCALE_FILENAME
        );

        console.log(`Reading from: ${srcFilePath}`);
        console.log(`Writing to: ${dstFilePath}`);

        try {
          const srcFileJson = JSON.parse(await readFile(srcFilePath, "utf8"));
          const dstFileJson = JSON.parse(await readFile(dstFilePath, "utf8"));

          console.log(`Successfully loaded files`);

          let movedCount = 0;
          let skippedCount = 0;

          keys.forEach((key) => {
            if (!srcFileJson[key]) {
              console.log(`  - Key not found in source: "${key}"`);
              skippedCount++;
              return;
            }

            console.log(
              `  - Moving key: "${key}" = ${JSON.stringify(srcFileJson[key]).substring(0, 40)}${JSON.stringify(srcFileJson[key]).length > 40 ? "..." : ""}`
            );
            dstFileJson[key] = srcFileJson[key];
            delete srcFileJson[key];
            movedCount++;
          });

          console.log(`
Summary for ${lng}:`);
          console.log(`  - Keys moved: ${movedCount}`);
          console.log(`  - Keys skipped: ${skippedCount}`);

          console.log(`Writing updated files...`);
          await writeFile(dstFilePath, JSON.stringify(dstFileJson, null, 2));
          await writeFile(srcFilePath, JSON.stringify(srcFileJson, null, 2));
          console.log(`Files successfully updated for ${lng}`);
        } catch (error) {
          console.error(`Error processing locale ${lng}:`, error);
        }
      });

      console.log(`
=== Translation movement process initiated for all locales ===`);
      console.log(
        `Note: Actual file writing may still be in progress due to async operations`
      );
    })
    .catch((error) => {
      console.error(`Error reading locale directories:`, error);
    });
};

run();
