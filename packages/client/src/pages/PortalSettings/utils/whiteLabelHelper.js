// (c) Copyright Ascensio System SIA 2009-2024
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

import axios from "axios";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

export const generateLogo = (
  width,
  height,
  text,
  fontSize = 18,
  fontColor = "#000",
  alignCenter,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  const x = alignCenter ? width / 2 : 0;

  ctx.fillStyle = "transparent";
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = fontColor;
  ctx.textAlign = alignCenter ? "center" : "start";
  ctx.textBaseline = "middle";
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(text, x, height - fontSize / 2);

  return canvas.toDataURL();
};

export const getLogoOptions = (index, text) => {
  switch (index) {
    case 0:
      return { fontSize: 18, text: text, width: 211, height: 24 };
    case 1:
      return { fontSize: 32, text: text, width: 384, height: 42 };
    case 2:
      return {
        fontSize: 26,
        text: text.trim().charAt(0),
        width: 30,
        height: 30,
        alignCenter: true,
      };
    case 3:
      return { fontSize: 22, text: text, width: 154, height: 27 };
    case 4:
      return { fontSize: 22, text: text, width: 154, height: 27 };
    case 5:
      return {
        fontSize: 24,
        text: text.trim().charAt(0),
        width: 28,
        height: 28,
        alignCenter: true,
      };
    case 6:
      return { fontSize: 18, text: text, width: 211, height: 24 };
    default:
      return { fontSize: 18, text: text, width: 211, height: 24 };
  }
};

export const uploadLogo = async (file, type) => {
  try {
    const { width, height } = await getUploadedFileDimensions(file);
    let data = new FormData();
    data.append("file", file);
    data.append("width", width);
    data.append("height", height);
    data.append("logotype", type);

    return await axios.post(
      `${combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
      )}/logoUploader.ashx`,
      data,
    );
  } catch (error) {
    console.error(error);
  }
};

const getUploadedFileDimensions = (file) =>
  new Promise((resolve, reject) => {
    try {
      let img = new Image();

      img.onload = () => {
        const width = img.naturalWidth,
          height = img.naturalHeight;

        window.URL.revokeObjectURL(img.src);

        return resolve({ width, height });
      };

      img.src = window.URL.createObjectURL(file);
    } catch (exception) {
      return reject(exception);
    }
  });
