// (c) Copyright Ascensio System SIA 2010-2024
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
const { readdir } = require("fs").promises;
const { resolve } = require("path");
const crypto = require("crypto");

const {
  imagesPattern,
  filesPattern,
  excludeFilesPattern,
  excludePath,
} = require("./constants");

const validatePath = (dirname) => {
  return (
    dirname.indexOf("tests") === -1 &&
    dirname.indexOf("node_modules") === -1 &&
    dirname.indexOf("dist") === -1
  );
};

const validateImage = (fileName) => {
  return imagesPattern.test(fileName);
};

const validateFile = (fileName) => {
  return filesPattern.test(fileName) && !excludeFilesPattern.test(fileName);
};

async function* getImages(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      yield* getImages(res);
    } else {
      const isValidPath = validatePath(res);

      const isImg = validateImage(dirent.name);

      if (isImg && isValidPath) {
        const data = fs.readFileSync(res);

        const buf = new Buffer.from(data);

        const md5Hash = crypto.createHash("md5").update(buf).digest("hex");

        const img = { path: res, fileName: dirent.name, md5Hash };

        yield img;
      }

      yield null;
    }
  }
}

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      const isValidPath = validatePath(res);

      const isFile = validateFile(dirent.name);

      if (isFile && isValidPath) {
        yield { path: res, fileName: dirent.name };
      }

      yield null;
    }
  }
}

const getImagesByDir = async (dir) => {
  const images = [];

  for await (const f of getImages(dir)) {
    if (f) images.push(f);
  }

  return images;
};

const getFilesByDir = async (dir) => {
  const files = [];

  for await (const f of getFiles(dir)) {
    if (f) files.push(f);
  }

  return files;
};

const generateImgImport = (imgPathName, imgName, imgPath, isAssetsDir) => {
  const prefix = isAssetsDir ? "ASSETS_DIR/" : "PUBLIC_DIR/";

  const dir = prefix + imgPath + "/" + imgPathName + "?url";

  const importString = `import ${imgName} from "${dir}";`;

  return importString;
};

const changeImgPath = (imgPath) => {
  const splitPath = imgPath.split("\\");

  const newSplitPath = [];

  splitPath.forEach((p, index) => {
    if (excludePath.includes(p) || index === splitPath.length - 1) {
      return null;
    }

    newSplitPath.push(p);
  });

  return { imgPath: newSplitPath.join("/"), size: newSplitPath[2] };
};

const changeImgName = (imgName, size) => {
  const splitImgName = imgName.split(".");

  const newImgName = [];

  splitImgName.forEach((img) => {
    const temp = img.replace(img[0], img[0].toUpperCase());

    newImgName.push(temp);
  });

  //   newImgName.push(size);

  newImgName.push("Url");

  return newImgName.join("");
};

const generateImgCollection = (key, itemCollection) => {
  let string = `export const flagsIcons = new Map([`;

  itemCollection.forEach((c, index) => {
    string += `["${c.imgName}", ${c.varName}]`;

    if (index !== itemCollection.length - 1) string += `,`;
  });

  string += `]);`;

  return string;
};

const compareImages = (img) => {
  const uniqueImg = new Map();

  img.forEach((i) => {
    const oldImg = uniqueImg.get(i.md5Hash);

    if (oldImg) {
      const newImg = [...oldImg, i.path];

      uniqueImg.set(i.md5Hash, newImg);
    } else {
      uniqueImg.set(i.md5Hash, [i.path]);
    }
  });

  return uniqueImg;
};

const findImagesIntoFiles = (fileList, imageList) => {
  const imgCollection = [];
  const usedImages = [];

  imageList.forEach((i) => {
    if (
      i.path.indexOf("flags") > -1 ||
      i.path.indexOf("thirdparties") > -1 ||
      i.path.indexOf("notifications") > -1
    )
      return usedImages.push(i.fileName);

    imgCollection.push(i.fileName);
  });

  fileList.forEach(({ path: filePath }) => {
    const data = fs.readFileSync(filePath, "utf8");

    imgCollection.forEach((i) => {
      const contentImg = `/${i}`;

      const idx = data.indexOf(contentImg);
      const idx2 = data.indexOf(`${i}`);

      if (idx > -1 || idx2 > -1) {
        usedImages.push(i);
      }
    });
  });

  return usedImages.filter(
    (i, index) => usedImages.findIndex((usedImg) => usedImg === i) === index
  );
};

module.exports = {
  getFilesByDir,
  getImagesByDir,
  getFiles,
  getImages,
  validateFile,
  validateImage,
  validatePath,
  generateImgImport,
  changeImgName,
  changeImgPath,
  generateImgCollection,
  compareImages,
  findImagesIntoFiles,
};
