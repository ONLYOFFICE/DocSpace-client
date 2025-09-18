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

/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-var-requires */

const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

// Configuration

// const localesDir = "../../packages/client/public/locales"; // Directory with locales
const localesDir = "../../public/locales"; // Directory with locales
const targetFiles = ["Common.json"]; // Files to process in each locale
const keysToDelete = ["key1", "key2", "key3"]; // Keys to delete from translation files
const LOCALE_DIRNAME = path.join(__dirname, localesDir);

const run = () => {
  console.log(`
=== Starting translation deletion process ===`);
  console.log(`Target directory: ${LOCALE_DIRNAME}`);
  console.log(`Files to process: ${targetFiles.join(", ")}`);
  console.log(`Keys to delete: ${keysToDelete.join(", ")}`);

  readdir(LOCALE_DIRNAME, {
    withFileTypes: true,
  })
    .then((res) => {
      console.log(`Found ${res.length} locales to process\n`);

      res.forEach(async (value) => {
        const lng = value.name;

        console.log(`\n=== Processing locale: ${lng} ===`);

        // Process each target file in the locale
        for (const fileName of targetFiles) {
          const filePath = path.join(LOCALE_DIRNAME, lng, fileName);

          console.log(`Processing file: ${filePath}`);

          try {
            // Read and parse the file
            const fileContent = await readFile(filePath, "utf8");
            const fileJson = JSON.parse(fileContent);

            console.log(`Successfully loaded file: ${fileName}`);

            let deletedCount = 0;
            let skippedCount = 0;

            // Delete each key
            keysToDelete.forEach((key) => {
              if (!fileJson[key]) {
                console.log(`  - Key not found: "${key}"`);
                skippedCount++;
                return;
              }

              console.log(
                `  - Deleting key: "${key}" = ${JSON.stringify(
                  fileJson[key]
                ).substring(0, 40)}${
                  JSON.stringify(fileJson[key]).length > 40 ? "..." : ""
                }`
              );
              delete fileJson[key];
              deletedCount++;
            });

            console.log(`\nSummary for ${lng}/${fileName}:`);
            console.log(`  - Keys deleted: ${deletedCount}`);
            console.log(`  - Keys skipped: ${skippedCount}`);

            if (deletedCount > 0) {
              console.log(`Writing updated file...`);
              await writeFile(filePath, JSON.stringify(fileJson, null, 2));
              console.log(`File successfully updated: ${fileName}`);
            } else {
              console.log(`No changes made to file: ${fileName}`);
            }
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
          }
        }
      });

      console.log(
        `\n=== Translation deletion process initiated for all locales ===`
      );
      console.log(
        `Note: Actual file writing may still be in progress due to async operations`
      );
    })
    .catch((error) => {
      console.error(`Error reading locale directories:`, error);
    });
};

run();
