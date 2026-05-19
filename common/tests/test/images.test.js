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
const { getAllFiles, getWorkSpaces, BASE_DIR, convertPathToOS } = require("../utils/files");
const { findImagesIntoFiles } = require("../utils/images");

const LOGO_REGEX = new RegExp(/\/logo\/(.)*\/(.)*.svg/);
const ICONS_REGEX = new RegExp(/\/(icons|thirdparties)\/(.)*/);

let allImgs = [];
let allFiles = [];
let fileContentsCache = new Map();

/**
 * Analyzes a group of images to find duplication rule violations.
 * A 1:1 mirror between the 'ui-kit' and the rest of the 'project' is allowed.
 * Violations occur if there are multiple duplicates within the same space (ui-kit or project).
 * 
 * @param {Array} val - Array of image objects with path and md5Hash
 * @returns {Array} - List of files that violate the duplication rules
 */
const getDuplicateViolations = (val) => {
  const uiKit = val.filter((i) => i.path.includes(convertPathToOS("/libs/ui-kit/")));
  const project = val.filter((i) => !i.path.includes(convertPathToOS("/libs/ui-kit/")));

  // 1:1 mirror is allowed
  if (uiKit.length <= 1 && project.length <= 1) return [];

  const offending = [];
  if (uiKit.length > 1) offending.push(...uiKit);
  if (project.length > 1) offending.push(...project);

  return offending;
};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

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
    "locales"
  ];

  const workspaces = getWorkSpaces();
  workspaces.push(path.resolve(BASE_DIR, "public"));
  const filesPattern = /\.(js|jsx|ts|tsx|html|css|scss|saas|json)$/i;
  const files = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        filesPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories.")
    );
  });

  console.log(`Found files by filter = ${files.length}.`);

  console.time('Reading files');
  files.forEach((filePath) => {
    const file = { path: filePath, fileName: path.basename(filePath) };
    allFiles.push(file);
    
    try {
      const content = fs.readFileSync(filePath, "utf8");
      fileContentsCache.set(filePath, content);
    } catch (err) {
      console.warn(`Failed to read file: ${filePath}`);
    }
  });
  console.timeEnd('Reading files');

  const imagesPattern = /\.(gif|jpe|jpeg|tiff?|png|webp|bmp|svg)$/i;

  const images = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir, excludeDirs).filter(
      (filePath) =>
        filePath &&
        imagesPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories.")
    );
  });

  console.log(`Found images = ${images.length}.`);
  console.time('Processing images');
  
  images.forEach((filePath) => {
    try {
      const data = fs.readFileSync(filePath);
      const md5Hash = crypto.createHash("md5").update(data).digest("hex");
      const img = { path: filePath, fileName: path.basename(filePath), md5Hash };
      allImgs.push(img);
    } catch (err) {
      console.warn(`Failed to read image: ${filePath}`);
    }
  });
  
  console.timeEnd('Processing images');
  console.log(`Total files: ${allFiles.length}, Total images: ${allImgs.length}`);
});

describe("Image Tests", () => {
  it("UselessImagesTest: Verify that there are no unused image files in the codebase.", () => {
    const usedImages = findImagesIntoFiles(allFiles, allImgs, fileContentsCache);
    const usedImagesSet = new Set(usedImages);

    const uselessImages = allImgs.filter((img) => {
      if (img.fileName.includes("default_user_photo_size_48-48") || img.fileName.includes("default_user_photo_size_360-360")) return false;

      return !usedImagesSet.has(img.fileName);
    });

    let message = "Found unused images in the code.\r\n\r\n";

    let i = 0;
    uselessImages.forEach((uImg) => {
      message += `${++i}. File: ${uImg.path}\r\n\r\n`;
    });

    expect(uselessImages.length, message).toBe(0);
  });

  it("ImagesWithDifferentMD5ButEqualNameTest: Verify that there are no image files with the same name but different content (as determined by their MD5 hash) in the codebase. ", () => {
    const uniqueImg = new Map();

    allImgs.forEach((i) => {
      const oldImg = uniqueImg.get(i.fileName);

      if (oldImg) {
        let skip = false;

        oldImg.forEach((oi) => {
          skip = skip || oi.md5Hash === i.md5Hash;
        });

        if (!skip) {
          const newImg = [...oldImg, i];

          uniqueImg.set(i.fileName, newImg);
        }
      } else {
        uniqueImg.set(i.fileName, [i]);
      }
    });

    let message = "Found images with different MD5 but equal name.\r\n\r\n";

    let i = 0;

    uniqueImg.forEach((value, key) => {
      const offending = getDuplicateViolations(value);
      if (offending.length > 0) {
        let skip = false;
        if (
          value[0].path.includes(convertPathToOS("/logo/")) ||
          value[0].path.includes(convertPathToOS("/icons/"))
        ) {
          skip = true;
        }
        if (skip) return;
        message += `${++i}. ${key}:\r\n`;
        offending.forEach(
          (v) =>
            (message += `${v.path}\r\n`)
        );
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  it("ImagesWithDifferentNameButEqualMD5Test: hat there are no image files with different names but identical content (as determined by their MD5 hash) in the codebase.", () => {
    const uniqueImg = new Map();

    allImgs.forEach((i) => {
      const oldImg = uniqueImg.get(i.md5Hash);

      if (oldImg) {
        let skip = false;

        oldImg.forEach((oi) => (skip = skip || oi.fileName === i.fileName));

        if (!skip) {
          const newImg = [...oldImg, i];

          uniqueImg.set(i.md5Hash, newImg);
        }
      } else {
        uniqueImg.set(i.md5Hash, [i]);
      }
    });

    let message = "Found images with different name but equal MD5.\r\n\r\n";
    let i = 0;
    uniqueImg.forEach((value, key) => {
      const offending = getDuplicateViolations(value);
      if (offending.length === 0) return;

      if (
        value[0].path.includes(convertPathToOS("/logo/")) ||
        value[0].path.includes("phoneFlags")
      )
        return;

      message += `${++i}. ${key}:\r\n`;
      offending.forEach((v) => (message += `${v.path}\r\n`));
      message += "\r\n";
    });

    expect(i, message).toBe(0);
  });

  it("ImagesWithEqualMD5AndEqualNameTest: Verify that there are no duplicate image files in the codebase that have both the same name and the same content (as determined by their MD5 hash).", () => {
    const uniqueImg = new Map();

    allImgs.forEach((i) => {
      const oldImg = uniqueImg.get(i.fileName);

      if (oldImg) {
        let skip = false;

        oldImg.forEach(
          (oi) =>
            (skip =
              skip || oi.md5Hash !== i.md5Hash || oi.fileName != i.fileName)
        );

        if (!skip) {
          const newImg = [...oldImg, i];

          uniqueImg.set(i.fileName, newImg);
        }
      } else {
        uniqueImg.set(i.fileName, [i]);
      }
    });

    let message = "Found images with equal MD5 and equal name.\r\n\r\n";
    let i = 0;
    uniqueImg.forEach((value, key) => {
      const offending = getDuplicateViolations(value);
      if (offending.length > 0) {
        let skipLogo = false;
        if (value[0].path.includes(convertPathToOS("/logo/"))) {
          skipLogo = true;
          value.forEach((v) => {
            const isMainLogo = v.path.includes(convertPathToOS(`/logo/${key}`));
            const isSubPath = LOGO_REGEX.test(v.path);
            skipLogo = (isSubPath || isMainLogo) && skipLogo;
          });
        }
        if (skipLogo) return;

        message += `${++i}. ${key}:\r\n`;
        offending.forEach((v) => (message += `${v.path} \r\n`));
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  it("WrongImagesImportTest: Verify that image imports in the codebase follow the correct import paths and conventions.", () => {
    const wrongImportImages = [
      `"/static/images`,
      `"/images`,
      `"static/images`,
      `"images/`,
    ];

    let message = "Found wrong images import in the code.\r\n\r\n";
    let k = 0;
    allFiles.forEach((file) => {
      if (file.path.indexOf("browserDetector.js") > -1) {
        return;
      }

      const data = fileContentsCache.get(file.path);
      if (!data) return;

      wrongImportImages.forEach((i) => {
        const idx = data.indexOf(i);

        if (
          idx > 0 &&
          file.fileName.indexOf("webpack") === -1 &&
          file.fileName.indexOf("vite.config") === -1 &&
          data[idx - 1] !== "(" &&
          file.path.indexOf(".html") === -1 &&
          file.path.indexOf("storybook-static") === -1
        ) {
          message += `${++k}. ${file.path} \r\n`;
        }
      });
    });

    expect(k, message).toBe(0);
  });

    it("ClientAndUiKitImagesNameConsistencyTest: Verify that identical images (by MD5 hash) have the same name in Client and UI-Kit.", () => {
    const uiKitImgs = allImgs.filter((i) => i.path.includes(convertPathToOS("/libs/ui-kit/")));
    const clientImgs = allImgs.filter((i) => !i.path.includes(convertPathToOS("/libs/ui-kit/")));

    const uiKitMd5Map = new Map();
    uiKitImgs.forEach((i) => {
      if (!uiKitMd5Map.has(i.md5Hash)) uiKitMd5Map.set(i.md5Hash, []);
      uiKitMd5Map.get(i.md5Hash).push(i);
    });

    let message = "Found identical images (by MD5) with different names in Client vs UI-Kit.\r\n\r\n";
    let k = 0;

    clientImgs.forEach((pImg) => {
      const uiMatches = uiKitMd5Map.get(pImg.md5Hash);
      if (uiMatches) {
        uiMatches.forEach((uiImg) => {
          if (uiImg.fileName !== pImg.fileName) {
            if (
              uiImg.path.includes(convertPathToOS("/logo/")) ||
              pImg.path.includes(convertPathToOS("/logo/")) ||
              uiImg.path.includes("phoneFlags") ||
              pImg.path.includes("phoneFlags")
            ) return;

            message += `${++k}. MD5: ${pImg.md5Hash}\r\n`;
            message += `  UI-Kit: ${uiImg.fileName} (${uiImg.path})\r\n`;
            message += `  Client: ${pImg.fileName} (${pImg.path})\r\n\r\n`;
          }
        });
      }
    });

    expect(k, message).toBe(0);
  });

  it("ClientAndUiKitImagesPathConsistencyTest: Verify that identical images (name + md5) are stored in identical directory structures in Client and UI-Kit.", () => {
    const uiKitImgs = allImgs.filter((i) => i.path.includes(convertPathToOS("/libs/ui-kit/")));
    const clientImgs = allImgs.filter((i) => !i.path.includes(convertPathToOS("/libs/ui-kit/")));

    const getRelativePath = (fullPath, isUiKit) => {
      const marker = isUiKit ? convertPathToOS("/libs/ui-kit/assets/") : convertPathToOS("/public/images/");
      const index = fullPath.indexOf(marker);
      if (index === -1) return null;
      return fullPath.substring(index + marker.length);
    };

    let message = "Found identical images with different relative paths in Client vs UI-Kit.\r\n\r\n";
    let k = 0;

    clientImgs.forEach((pImg) => {
      const pRel = getRelativePath(pImg.path, false);
      if (!pRel) return;

      const identicalInUiKit = uiKitImgs.filter((ui) => ui.md5Hash === pImg.md5Hash && ui.fileName === pImg.fileName);
      
      identicalInUiKit.forEach((uiImg) => {
        const uiRel = getRelativePath(uiImg.path, true);
        if (uiRel && uiRel !== pRel) {
          message += `${++k}. ${pImg.fileName}:\r\n`;
          message += `  UI-Kit Rel: ${uiRel} (${uiImg.path})\r\n`;
          message += `  Client Rel: ${pRel} (${pImg.path})\r\n\r\n`;
        }
      });
    });

    expect(k, message).toBe(0);
  });

  it("ClientAndUiKitImagesContentConsistencyTest: Verify that images in identical directory structures are identical by MD5 hash in Client and UI-Kit.", () => {
    const uiKitImgs = allImgs.filter((i) => i.path.includes(convertPathToOS("/libs/ui-kit/")));
    const clientImgs = allImgs.filter((i) => !i.path.includes(convertPathToOS("/libs/ui-kit/")));

    const getRelativePath = (fullPath, isUiKit) => {
      const marker = isUiKit ? convertPathToOS("/libs/ui-kit/assets/") : convertPathToOS("/public/images/");
      const index = fullPath.indexOf(marker);
      if (index === -1) return null;
      return fullPath.substring(index + marker.length);
    };

    const uiKitPathMap = new Map();
    uiKitImgs.forEach((i) => {
      const rel = getRelativePath(i.path, true);
      if (rel) uiKitPathMap.set(rel, i);
    });

    let message = "Found images in identical paths that have different content in Client vs UI-Kit.\r\n\r\n";
    let k = 0;

    clientImgs.forEach((pImg) => {
      const pRel = getRelativePath(pImg.path, false);
      if (!pRel) return;

      const uiMatch = uiKitPathMap.get(pRel);
      if (uiMatch && uiMatch.md5Hash !== pImg.md5Hash) {
        message += `${++k}. ${pRel}:\r\n`;
        message += `  UI-Kit MD5: ${uiMatch.md5Hash} (${uiMatch.path})\r\n`;
        message += `  Client MD5: ${pImg.md5Hash} (${pImg.path})\r\n\r\n`;
      }
    });

    expect(k, message).toBe(0);
  });
});
