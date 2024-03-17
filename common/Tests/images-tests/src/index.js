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
const path = require("path");

const { modules, paths } = require("./constants");

const { getFilesByDir, getImagesByDir } = require("./utils");

const { findUselessImages } = require("./uselessImages");
const {
  findImagesWithDifferentMD5ButEqualName,
} = require("./differentMD5EqualName");
const {
  findImagesWithDifferentNameButEqualMD5,
} = require("./differentNameEqualMD5");
const { findImagesWithEqualMD5AndEqualName } = require("./equalMD5EqualName");
const { findWrongImagesImport } = require("./wrongImagesImport");
const { importImgToImageHelper } = require("./importImgToImageHelper");

const runAllTests = async () => {
  const actions = [];

  const images = {};

  modules.forEach((module) => {
    const callback = async () => {
      images[module] = await getImagesByDir(paths[module]);
    };

    actions.push(callback());
  });

  await Promise.all(actions);

  const allImgs = [];

  modules.forEach((module) => {
    allImgs.push(...images[module]);
  });

  const filesActions = [];

  const files = {};

  modules.forEach((module) => {
    const callback = async () => {
      files[module] = await getFilesByDir(paths[module]);
    };
    filesActions.push(callback());
  });

  await Promise.all(filesActions);

  const allFiles = [];

  modules.forEach((module) => {
    allFiles.push(...files[module]);
  });

  const resultDir = path.resolve(__dirname, "..", "result");

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  findUselessImages(allImgs, allFiles);
  findImagesWithDifferentMD5ButEqualName(allImgs);
  findImagesWithDifferentNameButEqualMD5(allImgs);
  findImagesWithEqualMD5AndEqualName(allImgs);
  findWrongImagesImport(allFiles);
};

runAllTests();

// Add images to img helper from path
// importImgToImageHelper(paths.public + "/images/flags");
