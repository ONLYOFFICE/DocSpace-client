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
import isNil from "lodash/isNil";

import type { StaticImageData } from "../types";
import type { TFile, TFileLink, TFolder } from "../api/files/types";
import type {
  ContextMenuModel,
  SeparatorType,
} from "@docspace/ui-kit/components/context-menu";
import type { TRoom } from "../api/rooms/types";

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const includesMethod = <T extends object, MethodName extends string>(
  obj: T,
  method: MethodName,
): obj is T & Record<MethodName, (...args: unknown[]) => unknown> => {
  return method in obj && typeof obj[method as keyof object] === "function";
};

export const isSeparator = (arg: ContextMenuModel): arg is SeparatorType => {
  return arg?.isSeparator !== undefined && arg.isSeparator;
};

export const isNullOrUndefined = (arg: unknown): arg is null | undefined => {
  return arg === undefined || arg === null;
};

export const isFolderOrRoom = (item: unknown): item is TFolder | TRoom => {
  return (
    typeof item === "object" &&
    item !== null &&
    "parentId" in item &&
    !isNullOrUndefined(item.parentId)
  );
};

export const isNextImage = (item: unknown): item is StaticImageData => {
  return typeof item === "object" && item !== null && "src" in item;
};

export const isRoom = (item: unknown): item is TRoom => {
  return (
    typeof item === "object" &&
    item !== null &&
    (("isRoom" in item && item.isRoom === true) ||
      ("roomType" in item && !isNil(item.roomType)))
  );
};

export const isFolder = (item: unknown): item is TFolder => {
  return (
    typeof item === "object" &&
    item !== null &&
    (("isFolder" in item && item.isFolder === true) ||
      ("filesCount" in item && !isNil(item.filesCount)) ||
      ("foldersCount" in item && !isNil(item.foldersCount))) &&
    !isRoom(item)
  );
};

export const isFile = (item: unknown): item is TFile => {
  return (
    typeof item === "object" &&
    item !== null &&
    (("isFile" in item && item.isFile === true) ||
      ("fileType" in item && !isNil(item.fileType)) ||
      ("fileExst" in item && !isNil(item.fileExst)))
  );
};

export const isSharedLink = (item: unknown): item is TFileLink => {
  return (
    typeof item === "object" &&
    item !== null &&
    "sharedTo" in item &&
    typeof item.sharedTo === "object" &&
    item.sharedTo !== null &&
    "shareLink" in item.sharedTo &&
    "linkType" in item.sharedTo &&
    !isNil(item.sharedTo.linkType)
  );
};
