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

const { wrongImportImages } = require("./constants");

const pathToResultFile = path.join(
  __dirname,
  "..",
  "result",
  "WrongImagesImport"
);

const findWrongImagesImport = async (files) => {
  let wrongImports = "";

  files.forEach((file) => {
    const data = fs.readFileSync(file.path, "utf8");

    wrongImportImages.forEach((i) => {
      const idx = data.indexOf(i);

      //   console.log(file.path.indexOf("\\webpack"));

      if (
        idx > 0 &&
        file.fileName.indexOf("webpack") === -1 &&
        file.path.indexOf("common\\utils\\index.ts") === -1 &&
        file.path.indexOf("context-menu\\sub-components\\sub-menu.js") === -1 &&
        file.path.indexOf("drop-down-item\\index.js") === -1 &&
        file.path.indexOf("common\\utils\\index.ts") === -1 &&
        file.path.indexOf(".html") === -1 &&
        file.path.indexOf("storybook-static") === -1
      ) {
        wrongImports = wrongImports + `${file.path}\n`;
      }
    });
  });

  fs.writeFileSync(pathToResultFile, "");

  fs.appendFileSync(pathToResultFile, `${wrongImports}\n`);
};

module.exports = { findWrongImagesImport };
