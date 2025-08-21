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

const findImagesIntoFiles = (fileList, imageList) => {
  const imgCollection = [];
  const usedImages = [];

  imageList.forEach((i) => {
    if (
      i.path.indexOf("flags") > -1 ||
      i.path.indexOf("thirdparties") > -1 ||
      i.path.indexOf("notifications") > -1 ||
      i.path.indexOf("errors") > -1 ||
      i.path.indexOf("folder") > -1
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

module.exports = { findImagesIntoFiles };
