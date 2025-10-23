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
import * as fs from "fs";

const exec = promisify(execCallback);

const PATHS = {
  packageRoot: path.resolve(__dirname, ".."),
  webpackConfig: path.resolve(__dirname, "../webpack.sw.config.js"),
  outputDir: path.resolve(__dirname, "../../../public"),
  swTemplateOutput: path.resolve(__dirname, "../../../public/sw-template.js"),
  swFinal: path.resolve(__dirname, "../../../public/sw.js"),
  globDirectory: path.resolve(__dirname, "../../../public"),
} as const;

function handleBuildError(stage: string, error: unknown): never {
  console.error(`\nBuild failed at: ${stage}`);

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
  } else {
    console.error(error);
  }

  process.exit(1);
}

async function buildServiceWorker() {
  const buildStartTime = Date.now();

  console.log("\nBuilding Service Worker...\n");

  try {
    // Ensure output directory exists
    if (!fs.existsSync(PATHS.outputDir)) {
      fs.mkdirSync(PATHS.outputDir, { recursive: true });
    }

    // Build with Webpack
    const webpackCommand = `npx webpack --config ${path.basename(PATHS.webpackConfig)}`;
    const { stderr } = await exec(webpackCommand, {
      cwd: PATHS.packageRoot,
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" },
    });

    if (
      stderr &&
      !stderr.includes("npm warn") &&
      !stderr.includes("deprecated")
    ) {
      console.warn("Webpack warnings:", stderr);
    }

    if (!fs.existsSync(PATHS.swTemplateOutput)) {
      handleBuildError(
        "Webpack Build",
        new Error(
          `Output file not found at ${PATHS.swTemplateOutput}. Check webpack configuration.`,
        ),
      );
    }

    const webpackStats = fs.statSync(PATHS.swTemplateOutput);
    console.log(
      `Webpack output: ${(webpackStats.size / 1024).toFixed(2)} KB\n`,
    );

    // Inject precache manifest
    const manifestResult = await injectManifest({
      swSrc: PATHS.swTemplateOutput,
      swDest: PATHS.swFinal,
      globDirectory: PATHS.globDirectory,
      globPatterns: [
        "**/*.{js,css,html,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot,json}",
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      globIgnores: [
        "**/*.map",
        "**/manifest",
        "**/.htaccess",
        "**/service-worker.js",
        "**/sw.js",
        "**/sw-template.js",
        "**/index.html",
        "**/locales/.meta/**",
        "**/locales/!(en)/**",
        "**/images/phoneFlags/**",
        "**/images/emptyview/**",
        "**/images/thirdparties/**",
        "**/images/flags/**",
        "**/images/icons/96/**",
        "**/images/notifications/**",
        "**/images/*sdk-preset*",
        "**/images/errors/**",
        "**/images/browsers/**",
        "**/images/emptyFilter/**",
        "**/images/completedForm/**",
      ],
    });

    const { count, size, warnings } = manifestResult;

    if (warnings && warnings.length > 0) {
      console.warn("Workbox warnings:");
      warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    if (!fs.existsSync(PATHS.swFinal)) {
      handleBuildError(
        "Manifest Injection",
        new Error(`Final output not found at ${PATHS.swFinal}`),
      );
    }

    const finalStats = fs.statSync(PATHS.swFinal);
    const buildDuration = ((Date.now() - buildStartTime) / 1000).toFixed(2);

    console.log(`Service Worker: ${(finalStats.size / 1024).toFixed(2)} KB`);
    console.log(
      `Precached: ${count} files (${(size / 1024 / 1024).toFixed(2)} MB)`,
    );
    console.log(`Duration: ${buildDuration}s\n`);
  } catch (error) {
    handleBuildError("Build Process", error);
  }
}

buildServiceWorker()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nUnexpected error:", error);
    process.exit(1);
  });
