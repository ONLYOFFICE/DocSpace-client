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

const fs = require("fs");
const path = require("path");

const extractFailedTestImages = (reportData, packageName) => {
  const imagePaths = [];

  for (const suite of reportData.suites || []) {
    for (const spec of suite.specs || []) {
      if (spec.ok !== false) continue;

      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status !== "failed" || !result.attachments) continue;

          for (const attachment of result.attachments) {
            if (
              attachment.contentType?.startsWith("image/") &&
              attachment.path
            ) {
              const packageIndex = attachment.path.lastIndexOf(
                `/${packageName}`,
              );
              if (packageIndex !== -1) {
                imagePaths.push(attachment.path.substring(packageIndex + 1));
              }
            }
          }
        }
      }
    }
  }

  return imagePaths;
};

const deleteFailedTestImages = (imagePaths, packagesDir) => {
  let deleted = 0;
  let errors = 0;

  for (const imagePath of imagePaths) {
    try {
      const fullImagePath = path.join(packagesDir, imagePath);
      fs.unlinkSync(fullImagePath);
      deleted++;
    } catch (error) {
      if (error.code !== "ENOENT") {
        errors++;
        console.error(
          `Failed to delete ${path.basename(imagePath)}: ${error.message}`,
        );
      }
    }
  }

  return { deleted, errors };
};

const cleanFailedTests = (reportPath, packagesDir, packageName) => {
  try {
    if (!fs.existsSync(reportPath)) {
      console.error(`Test report not found: ${reportPath}`);
      return false;
    }

    const reportContent = fs.readFileSync(reportPath, "utf8");
    const reportData = JSON.parse(reportContent);

    const imagePaths = extractFailedTestImages(reportData, packageName);

    if (imagePaths.length === 0) {
      return true;
    }

    console.log(`Found ${imagePaths.length} failed test images`);

    const { deleted, errors } = deleteFailedTestImages(imagePaths, packagesDir);

    console.log(`Images deleted: ${deleted}`);
    if (errors > 0) {
      console.log(`Errors: ${errors}`);
    }
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

module.exports = { cleanFailedTests };
