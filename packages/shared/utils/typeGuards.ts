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
import isNil from "lodash/isNil";

import type { StaticImageData } from "../types";
import type { TFile, TFileLink, TFolder } from "../api/files/types";
import type {
  ContextMenuModel,
  SeparatorType,
} from "../components/context-menu";
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

export const isFolder = (item: unknown): item is TFolder => {
  return (
    typeof item === "object" &&
    item !== null &&
    "isFolder" in item &&
    item.isFolder === true
  );
};

export const isRoom = (item: unknown): item is TRoom => {
  return (
    typeof item === "object" &&
    item !== null &&
    (("isRoom" in item && item.isRoom === true) ||
      ("roomType" in item && !isNil(item.roomType)))
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
