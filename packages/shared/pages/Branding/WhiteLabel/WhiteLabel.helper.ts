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

import axios from "axios";
import { globalColors } from "../../../themes";
import {
  ILogoOptions,
  IUploadedDimensions,
  IUploadLogoResponse,
} from "./WhiteLabel.types";

export const generateLogo = (
  width: number,
  height: number,
  text: string,
  fontSize: number = 18,
  fontColor: string = globalColors.darkBlack,
  alignCenter: boolean = false,
  isEditor: boolean = false,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  const x = alignCenter ? width / 2 : isEditor ? 10 : 0;
  const y = (height - fontSize) / 2;

  if (ctx) {
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = fontColor;
    ctx.textAlign = alignCenter ? "center" : "start";
    ctx.textBaseline = "top";
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, x, y);
  }

  return canvas.toDataURL();
};

export const getLogoOptions = (
  index: number,
  text: string,
  width: number,
  height: number,
): ILogoOptions => {
  const fontSize = height - 16;

  switch (index) {
    case 0:
      return {
        fontSize,
        text,
        width,
        height,
      };
    case 1:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: true,
      };
    case 2:
      return {
        fontSize,
        text: Array.from(text)[0],
        width,
        height,
        alignCenter: true,
      };
    case 3:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 4:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 5:
      return {
        fontSize,
        text: Array.from(text)[0],
        width,
        height,
        alignCenter: true,
      };
    case 6:
      return {
        fontSize,
        text,
        width,
        height,
      };
    case 7:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 8:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 9:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 10:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 11:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 12:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 13:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 14:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    case 15:
      return {
        fontSize,
        text,
        width,
        height,
        alignCenter: false,
        isEditor: true,
      };
    default:
      return { fontSize: 32, text, width: 422, height: 48 };
  }
};

const getUploadedFileDimensions = (file: File): Promise<IUploadedDimensions> =>
  new Promise((resolve, reject) => {
    try {
      const img = new Image();

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL(img.src);

        return resolve({ width, height });
      };

      img.src = window.URL.createObjectURL(file);
    } catch (exception) {
      reject(exception);
    }
  });

export const uploadLogo = async (
  file: File | null,
  type: string,
): Promise<{ data: IUploadLogoResponse } | undefined> => {
  try {
    if (!file) throw new Error("Empty file");
    const { width, height } = await getUploadedFileDimensions(file);
    const data = new FormData();
    data.append("file", file);
    data.append("width", width.toString());
    data.append("height", height.toString());
    data.append("logotype", type);

    return await axios.post(
      `${window.location.origin}/logoUploader.ashx`,
      data,
    );
  } catch (error) {
    console.error(error);
  }
};
