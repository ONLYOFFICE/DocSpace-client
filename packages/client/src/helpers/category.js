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
import { CategoryType } from "./constants";
import { FolderType } from "@docspace/shared/enums";
import { PEOPLE_ROUTE_WITH_FILTER } from "./contacts/constants";

export const getCategoryType = (location) => {
  let categoryType = CategoryType.Shared;
  const { pathname } = location;

  if (pathname.startsWith("/rooms")) {
    if (pathname.indexOf("personal") > -1) {
      categoryType = CategoryType.Personal;
    } else if (pathname.indexOf("shared") > -1) {
      const regexp = /(rooms)\/([\d])\/(shared)/;

      categoryType = !regexp.test(location)
        ? CategoryType.Shared
        : CategoryType.SharedRoom;
    } else if (pathname.indexOf("share") > -1) {
      categoryType = CategoryType.PublicRoom;
    } else if (pathname.indexOf("archive") > -1) {
      categoryType = CategoryType.Archive;
    }
  } else if (pathname.startsWith("/favorite")) {
    categoryType = CategoryType.Favorite;
  } else if (pathname.startsWith("/recent")) {
    categoryType = CategoryType.Recent;
  } else if (pathname.startsWith("/files/trash")) {
    categoryType = CategoryType.Trash;
  } else if (pathname.startsWith("/settings")) {
    categoryType = CategoryType.Settings;
  } else if (pathname.startsWith("/accounts")) {
    categoryType = CategoryType.Accounts;
  }

  return categoryType;
};

export const getCategoryUrl = (categoryType, folderId = null) => {
  const cType = categoryType;

  switch (cType) {
    case CategoryType.Personal:
    case CategoryType.Recent:
      return "/rooms/personal/filter";

    case CategoryType.Shared:
      return "/rooms/shared/filter";

    case CategoryType.SharedRoom:
      return `/rooms/shared/${folderId}/filter`;

    case CategoryType.Archive:
      return "/rooms/archived/filter";

    case CategoryType.ArchivedRoom:
      return `/rooms/archived/${folderId}/filter`;

    case CategoryType.Favorite:
      return "/files/favorite/filter";

    case CategoryType.Trash:
      return "/files/trash/filter";

    case CategoryType.PublicRoom:
      return "/rooms/share";

    case CategoryType.Accounts:
      return PEOPLE_ROUTE_WITH_FILTER;

    case CategoryType.Settings:
      return "/settings/personal";

    default:
      throw new Error("Unknown category type");
  }
};

export const getCategoryTypeByFolderType = (folderType, parentId) => {
  switch (folderType) {
    case FolderType.Rooms:
      return parentId > 0 ? CategoryType.SharedRoom : CategoryType.Shared;

    case FolderType.Archive:
      return CategoryType.Archive;

    case FolderType.Favorites:
      return CategoryType.Favorite;

    case FolderType.Recent:
      return CategoryType.Recent;

    case FolderType.TRASH:
      return CategoryType.Trash;

    default:
      return CategoryType.Personal;
  }
};