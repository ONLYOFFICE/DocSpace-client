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
const crypto = require("crypto");
const {
  getAllFiles,
  getWorkSpaces,
  BASE_DIR,
  convertPathToOS,
} = require("../utils/files");
const { findImagesIntoFiles } = require("../utils/images");

const LOGO_REGEX = new RegExp(/\/logo\/(.)*\/(.)*.svg/);
const ICONS_REGEX = new RegExp(/\/(icons|thirdparties)\/(.)*/);

let allImgs = [];
let allFiles = [];

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
    "locales",
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

  files.forEach((filePath) => {
    const file = { path: filePath, fileName: path.basename(filePath) };
    allFiles.push(file);
  });

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

  images.forEach((filePath) => {
    const data = fs.readFileSync(filePath, "utf8");

    const buf = new Buffer.from(data);

    const md5Hash = crypto.createHash("md5").update(buf).digest("hex");

    const img = { path: filePath, fileName: path.basename(filePath), md5Hash };

    allImgs.push(img);
  });
});

describe("Image Tests", () => {
  test("UselessImagesTest: Verify that there are no unused image files in the codebase.", () => {
    const usedImages = findImagesIntoFiles(allFiles, allImgs);

    const uselessImages = allImgs.filter((img) => {
      if (img.fileName.includes("default_user_photo_size_48-48")) return false;

      if (usedImages.indexOf(img.fileName) === -1) {
        return true;
      }

      return false;
    });

    let message = "Found unused images in the code.\r\n\r\n";

    let i = 0;
    uselessImages.forEach((uImg) => {
      message += `${++i}. File: ${uImg.path}\r\n\r\n`;
    });

    expect(uselessImages.length, message).toBe(0);
  });

  test("ImagesWithDifferentMD5ButEqualNameTest: Verify that there are no image files with the same name but different content (as determined by their MD5 hash) in the codebase. ", () => {
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
      if (value.length > 1) {
        let skip = false;
        if (
          value[0].path.includes(convertPathToOS("/logo/")) ||
          value[0].path.includes(convertPathToOS("/icons/"))
        ) {
          skip = true;
          // value.forEach((v) => {
          //   const isMain =
          //     v.path.includes(convertPathToOS(`/logo/${key}`)) ||
          //     v.path.includes(convertPathToOS(`/icons/${key}`));
          //   const isSubPath =
          //     LOGO_REGEX.test(v.path) || ICONS_REGEX.test(v.path);
          //   skip = (isSubPath || isMain) && skip;
          // });
        }
        if (skip) return;
        message += `${++i}. ${key}:\r\n`;
        value.forEach((v) => (message += `${v.path}\r\n`));
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  test("ImagesWithDifferentNameButEqualMD5Test: hat there are no image files with different names but identical content (as determined by their MD5 hash) in the codebase.", () => {
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
      if (
        value[0].path.includes(convertPathToOS("/logo/")) ||
        value[0].path.includes("phoneFlags")
      )
        return;

      if (value.length > 1) {
        message += `${++i}. ${key}:\r\n`;
        value.forEach((v) => (message += `${v.path}\r\n`));
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  test("ImagesWithEqualMD5AndEqualNameTest: Verify that there are no duplicate image files in the codebase that have both the same name and the same content (as determined by their MD5 hash).", () => {
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
      if (value.length > 1) {
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
        value.forEach((v) => (message += `${v.path} \r\n`));
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  test("WrongImagesImportTest: Verify that image imports in the codebase follow the correct import paths and conventions.", () => {
    const wrongImportImages = [
      `"/static/images`,
      `"/images`,
      `"static/images`,
      `"images/`,
    ];

    let message = "Found wrong images import in the code.\r\n\r\n";
    let k = 0;
    allFiles.forEach((file) => {
      if (
        file.path.indexOf("browserDetector.js") > -1 ||
        file.path.indexOf("sw.js") > -1
      ) {
        return;
      }

      const data = fs.readFileSync(file.path, "utf8");

      wrongImportImages.forEach((i) => {
        const idx = data.indexOf(i);

        if (
          idx > 0 &&
          file.fileName.indexOf("webpack") === -1 &&
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
});
