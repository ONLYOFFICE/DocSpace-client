// Copyright 2024 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getAllFiles, getWorkSpaces, BASE_DIR } = require("../utils/files");
const { findImagesIntoFiles } = require("../utils/images");

let allImgs = [];
let allFiles = [];

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  const workspaces = getWorkSpaces();
  workspaces.push(path.resolve(BASE_DIR, "public"));
  const filesPattern = /\.(js|jsx|ts|tsx|html|css|scss|saas|json)$/i;
  const files = workspaces.flatMap((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    return getAllFiles(clientDir).filter(
      (filePath) =>
        filePath &&
        filesPattern.test(filePath) &&
        !filePath.includes("locales/") &&
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

    return getAllFiles(clientDir).filter(
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

        oldImg.forEach((oi) => (skip = skip || oi.md5Hash === i.md5Hash));

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
        message += `${++i}. ${key}:\r\n`;
        value.forEach((v) => (message += `${v.path}\r\n`));
        message += "\r\n";
      }
    });

    expect(i, message).toBe(0);
  });

  test("WrongImagesImportTest: Verify that image imports in the codebase follow the correct import paths and conventions.", () => {
    let wrongImports = "";
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

      const data = fs.readFileSync(file.path, "utf8");

      wrongImportImages.forEach((i) => {
        const idx = data.indexOf(i);

        if (
          idx > 0 &&
          file.fileName.indexOf("webpack") === -1 &&
          file.path.indexOf("common\\utils\\index.ts") === -1 &&
          file.path.indexOf("context-menu\\sub-components\\sub-menu.js") ===
            -1 &&
          file.path.indexOf("drop-down-item\\index.js") === -1 &&
          file.path.indexOf("common\\utils\\index.ts") === -1 &&
          file.path.indexOf(".html") === -1 &&
          file.path.indexOf("storybook-static") === -1
        ) {
          message += `${++k}. ${file.path}\r\n`;
        }
      });
    });

    expect(k, message).toBe(0);
  });
});
