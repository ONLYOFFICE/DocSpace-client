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
  test("UselessImagesTest", () => {
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
});
