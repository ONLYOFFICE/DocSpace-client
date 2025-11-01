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

const REPORT_PATH = path.resolve(
  __dirname,
  "../../../playwright-report/login/test-results.json",
);
const PACKAGES_DIR = path.resolve(__dirname, "../..");

const extractRelativePath = (attachmentPath) => {
  const sdkIndex = attachmentPath.lastIndexOf("/login");
  return sdkIndex !== -1
    ? attachmentPath.substring(sdkIndex + 1)
    : attachmentPath;
};

const getImageAttachments = (attachments = []) => {
  return attachments.filter(
    (attachment) =>
      attachment.contentType?.startsWith("image/") && attachment.path,
  );
};

const extractFailedTests = (reportData) => {
  const failedTests = [];

  for (const suite of reportData.suites || []) {
    for (const spec of suite.specs || []) {
      if (spec.ok !== false) continue;

      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (result.status !== "failed") continue;

          const imageAttachments = getImageAttachments(result.attachments);

          if (imageAttachments.length > 0) {
            const name = spec.title || test.title || "Unknown test";
            const imagePath = extractRelativePath(imageAttachments[0].path);

            failedTests.push({ name, imagePath });
          }
        }
      }
    }
  }

  return failedTests;
};

const deleteFailedTestImages = (failedTests) => {
  let deleted = 0;
  let errors = 0;

  for (const { imagePath } of failedTests) {
    try {
      const fullImagePath = path.join(PACKAGES_DIR, imagePath);

      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
        deleted++;
      }
    } catch (error) {
      errors++;
      console.error(
        `Failed to delete ${path.basename(imagePath)}: ${error.message}`,
      );
    }
  }

  return { deleted, errors };
};

const cleanFailedTests = async () => {
  try {
    if (!fs.existsSync(REPORT_PATH)) {
      console.error(`Test report not found: ${REPORT_PATH}`);
      return false;
    }

    let reportData;

    try {
      const reportContent = fs.readFileSync(REPORT_PATH, "utf8");
      reportData = JSON.parse(reportContent);
    } catch (parseError) {
      console.error(`Failed to parse JSON report: ${parseError.message}`);
      return false;
    }

    const failedTests = extractFailedTests(reportData);

    if (failedTests.length === 0) {
      return true;
    }

    console.log(`\nFound ${failedTests.length} failed tests`);

    const { deleted, errors } = deleteFailedTestImages(failedTests);

    console.log(`\nSummary:`);
    console.log(`   • Images deleted: ${deleted}`);
    console.log(`   • Errors: ${errors}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    console.error(error.stack);
    return false;
  }
};

cleanFailedTests()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
