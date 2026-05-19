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

import { match, P } from "ts-pattern";

import { TIconContainer, TApiErrorShape } from "@/types";
import { RoomsType, ThemeKeys } from "@docspace/shared/enums";
import {
  iconSize24,
  iconSize32,
  iconSize64,
  iconSize96,
} from "@docspace/shared/utils/image-helpers";

export const getIconBySize = (path: string, size: number = 32) => {
  const getOrDefault = (container: TIconContainer): string => {
    const iconPath = container.has(path)
      ? (container.get(path) ?? "")
      : (container.get("file.svg") ?? "");

    const publicIndex = iconPath.indexOf("/public");

    if (publicIndex !== -1) {
      return iconPath.substring(publicIndex).replace("/public", "/static");
    }

    return iconPath;
  };

  switch (+size) {
    case 24:
      return getOrDefault(iconSize24);
    case 32:
      return getOrDefault(iconSize32);
    case 64:
      return getOrDefault(iconSize64);
    case 96:
      return getOrDefault(iconSize96);
    default:
      return getOrDefault(iconSize32);
  }
};

export const getRoomsIcon = (
  roomType: RoomsType,
  isArchive: boolean,
  size: number = 32,
) => {
  let path = "";

  if (isArchive) {
    path = "archiveRoom.svg";
  } else {
    switch (roomType) {
      case RoomsType.CustomRoom:
        path = "customRoom.svg";
        break;
      case RoomsType.AIRoom:
        path = "aiRoom.svg";
        break;
      case RoomsType.EditingRoom:
        path = "editingRoom.svg";
        break;
      case RoomsType.PublicRoom:
        path = "publicRoom.svg";
        break;
      case RoomsType.VirtualDataRoom:
        path = "virtualRoom.svg";
        break;
      case RoomsType.FormRoom:
        path = "formRoom.svg";
        break;
      default:
        path = "customRoom.svg";
    }
  }

  return getIconBySize(path, size);
};

export const getThemeClass = (
  theme?: ThemeKeys,
  systemTheme?: ThemeKeys,
): "dark" | "light" => {
  const calculatedTheme = match<(ThemeKeys | undefined)[]>([theme, systemTheme])
    .returnType<ThemeKeys>()
    .with([ThemeKeys.DarkStr, P._], () => ThemeKeys.DarkStr)
    .with([ThemeKeys.BaseStr, P._], () => ThemeKeys.BaseStr)
    .with([ThemeKeys.SystemStr, ThemeKeys.BaseStr], () => ThemeKeys.BaseStr)
    .with([ThemeKeys.SystemStr, ThemeKeys.DarkStr], () => ThemeKeys.DarkStr)
    .with([undefined, ThemeKeys.DarkStr], () => ThemeKeys.DarkStr)
    .with([undefined, ThemeKeys.BaseStr], () => ThemeKeys.BaseStr)
    .otherwise(() => ThemeKeys.BaseStr);

  return calculatedTheme === ThemeKeys.DarkStr ? "dark" : "light";
};

export const getErrorMessage = (err: unknown) => {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as TApiErrorShape;
    const responseMessage = e.response?.data?.error?.message;
    if (typeof responseMessage === "string") return responseMessage;
    if (typeof responseMessage === "number") return String(responseMessage);
    if (typeof e.message === "string") return e.message;
  }
  return "";
};
