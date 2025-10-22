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

import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { injectManifest } from "workbox-build";
import * as path from "path";

const exec = promisify(execCallback);

async function buildServiceWorker() {
  try {
    console.log("Step 1: Building service worker with Webpack...");

    // Run webpack to bundle the service worker with Workbox modules
    const { stdout, stderr } = await exec(
      "npx webpack --config webpack.sw.config.js",
      { cwd: path.join(__dirname, "..") },
    );

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("npm warn")) console.error(stderr);

    console.log("Step 2: Injecting precache manifest with workbox-build...");

    // Inject the precache manifest into the bundled service worker
    const { count, size, warnings } = await injectManifest({
      swSrc: path.resolve(__dirname, "../public/sw-template.js"),
      swDest: path.resolve(__dirname, "../public/sw.js"),
      globDirectory: path.resolve(__dirname, "../public"),
      globPatterns: [
        "**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,json}",
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      globIgnores: [
        "**/*.map",
        "**/manifest",
        "**/.htaccess",
        "**/service-worker.js",
        "**/sw.js",
        "**/sw-template.js",
      ],
    });

    console.log(`Service worker built successfully!`);
    console.log(
      `Precached ${count} files, totaling ${(size / 1024 / 1024).toFixed(3)} MB.`,
    );

    if (warnings.length > 0) {
      console.warn("Warnings:");
      warnings.forEach((warning) => console.warn(`   ${warning}`));
    }

    console.log(`Final service worker: packages/shared/public/sw.js`);
  } catch (error) {
    console.error("Error building service worker:", error);
    process.exit(1);
  }
}

buildServiceWorker();
