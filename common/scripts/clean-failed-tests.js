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
