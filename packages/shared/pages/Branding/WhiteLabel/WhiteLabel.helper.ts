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

import axios from "axios";
import { globalColors } from "@docspace/ui-kit/providers/theme";
import {
  ILogoOptions,
  IUploadedDimensions,
  IUploadLogoResponse,
} from "./WhiteLabel.types";
import { WhiteLabelLogoType } from "../../../enums";

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

export const toDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(f);
    } catch (err) {
      reject(err);
    }
  });

export const hiddenEditorTypes = [
  WhiteLabelLogoType.SpreadsheetEditor,
  WhiteLabelLogoType.SpreadsheetEditorEmbed,
  WhiteLabelLogoType.PresentationEditor,
  WhiteLabelLogoType.PresentationEditorEmbed,
  WhiteLabelLogoType.PdfEditor,
  WhiteLabelLogoType.PdfEditorEmbed,
  WhiteLabelLogoType.DiagramEditor,
  WhiteLabelLogoType.DiagramEditorEmbed,
];
