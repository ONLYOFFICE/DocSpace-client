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
  scriptDir: __dirname,
  packageRoot: path.resolve(__dirname, ".."),
  swTemplate: path.resolve(__dirname, "../sw/template.ts"),
  swConfig: path.resolve(__dirname, "../sw/config.ts"),
  webpackConfig: path.resolve(__dirname, "../webpack.sw.config.js"),
  outputDir: path.resolve(__dirname, "../../../web/public"),
  swTemplateOutput: path.resolve(
    __dirname,
    "../../../web/public/sw-template.js",
  ),
  swFinal: path.resolve(__dirname, "../../../web/public/sw.js"),
  globDirectory: path.resolve(__dirname, "../../../web/public"),
} as const;

interface PathValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
}

function validatePaths(): PathValidationResult {
  const result: PathValidationResult = {
    valid: true,
    missing: [],
    errors: [],
  };

  const requiredFiles = [
    { path: PATHS.swTemplate, name: "Service Worker template" },
    { path: PATHS.swConfig, name: "Service Worker config" },
    { path: PATHS.webpackConfig, name: "Webpack config" },
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      result.valid = false;
      result.missing.push(file.name);
      result.errors.push(`Missing: ${file.name} at ${file.path}`);
    }
  }

  if (!fs.existsSync(PATHS.outputDir)) {
    try {
      fs.mkdirSync(PATHS.outputDir, { recursive: true });
    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to create output directory: ${error}`);
    }
  }

  return result;
}

function handleBuildError(stage: string, error: unknown): never {
  console.error(`\nBuild failed at: ${stage}`);

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
  } else {
    console.error(error);
  }

  console.error(`\nTroubleshooting:`);
  if (stage === "Validation") {
    console.error(`- Check that all source files exist`);
    console.error(`- Verify project structure`);
  } else if (stage === "Webpack Build") {
    console.error(`- Check webpack.sw.config.js`);
    console.error(`- Run: pnpm tsc --noEmit`);
  } else if (stage === "Manifest Injection") {
    console.error(`- Verify webpack output exists`);
    console.error(`- Check glob directory: ${PATHS.globDirectory}`);
  }

  process.exit(1);
}

async function buildServiceWorker() {
  const buildStartTime = Date.now();

  console.log("\nBuilding Service Worker...\n");

  try {
    const validation = validatePaths();

    if (!validation.valid) {
      console.error("Validation failed:");
      validation.errors.forEach((error) => console.error(`  ${error}`));
      handleBuildError("Validation", new Error("Missing required files"));
    }

    const webpackCommand = `npx webpack --config ${path.basename(PATHS.webpackConfig)}`;
    const { stdout, stderr } = await exec(webpackCommand, {
      cwd: PATHS.packageRoot,
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" },
    });

    if (stdout) console.log(stdout);
    if (
      stderr &&
      !stderr.includes("npm warn") &&
      !stderr.includes("deprecated")
    ) {
      console.warn("Webpack warnings:", stderr);
    }

    if (!fs.existsSync(PATHS.swTemplateOutput)) {
      handleBuildError("Webpack Build", new Error("Output file not found"));
    }

    const webpackStats = fs.statSync(PATHS.swTemplateOutput);
    console.log(`Webpack: ${(webpackStats.size / 1024).toFixed(2)} KB\n`);

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
        new Error("Final output not found"),
      );
    }

    const finalStats = fs.statSync(PATHS.swFinal);
    const buildDuration = ((Date.now() - buildStartTime) / 1000).toFixed(2);

    console.log(`Service Worker: ${(finalStats.size / 1024).toFixed(2)} KB`);
    console.log(
      `Precached: ${count} files (${(size / 1024 / 1024).toFixed(3)} MB)`,
    );
    console.log(`Duration: ${buildDuration}s\n`);
  } catch (error) {
    handleBuildError("Build Error", error);
  }
}

buildServiceWorker()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nUnexpected error:", error);
    process.exit(1);
  });
