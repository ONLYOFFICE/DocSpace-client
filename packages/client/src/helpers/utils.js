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

import { authStore, settingsStore } from "@docspace/shared/store";
import { toCommunityHostname } from "@docspace/shared/utils/common";
import { FolderType } from "@docspace/shared/enums";
import { CategoryType } from "./constants";

import {
  PEOPLE_ROUTE_WITH_FILTER,
  GROUPS_ROUTE_WITH_FILTER,
  GUESTS_ROUTE_WITH_FILTER,
} from "./contacts";

export const setDocumentTitle = (subTitle = "") => {
  const { isAuthenticated, product: currentModule } = authStore;
  const { logoText } = settingsStore;

  let title;
  if (subTitle) {
    if (isAuthenticated && currentModule) {
      title = `${subTitle} - ${currentModule.title}`;
    } else {
      title = `${subTitle} - ${logoText}`;
    }
  } else if (currentModule && logoText) {
    title = `${currentModule.title} - ${logoText}`;
  } else {
    title = logoText;
  }

  document.title = title;
};

export const checkIfModuleOld = (link) => {
  if (
    !link ||
    link.includes("files") ||
    link.includes("people") ||
    link.includes("settings")
  ) {
    return false;
  }
  return true;
};

export const getLink = (link) => {
  if (!link) return;

  if (!checkIfModuleOld(link)) {
    return link;
  }

  if (link.includes("mail") || link.includes("calendar")) {
    link = link.replace("products", "addons");
  } else {
    link = link.replace("products", "Products");
    link = link.replace("crm", "CRM");
    link = link.replace("projects", "Projects");
  }

  const { protocol, hostname } = window.location;

  const communityHostname = toCommunityHostname(hostname);

  return `${protocol}//${communityHostname}${link}?desktop_view=true`;
};

export const onItemClick = (e) => {
  if (!e) return;
  e.preventDefault();

  const link = e.currentTarget.dataset.link;

  if (checkIfModuleOld(link)) {
    return window.open(link, "_blank");
  }

  // router.navigate(link);
};

export const getCategoryType = (location) => {
  let categoryType = CategoryType.Shared;
  const { pathname } = location;

  if (pathname.startsWith("/rooms")) {
    if (pathname.indexOf("personal") > -1) {
      categoryType = CategoryType.Personal;
    } else if (pathname.indexOf("shared") > -1) {
      const regexp = /(rooms)\/shared\/([\d])/;

      categoryType = !regexp.test(location.pathname)
        ? CategoryType.Shared
        : CategoryType.SharedRoom;
    } else if (pathname.indexOf("share") > -1) {
      categoryType = CategoryType.PublicRoom;
    } else if (pathname.indexOf("archive") > -1) {
      categoryType = CategoryType.Archive;
    }
  } else if (pathname.startsWith("/files/favorite")) {
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

export const getCategoryTypeByFolderType = (folderType, parentId) => {
  switch (folderType) {
    case FolderType.Rooms:
    case FolderType.RoomTemplates:
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

export const getCategoryUrl = (categoryType, folderId = null) => {
  const cType = categoryType;

  switch (cType) {
    case CategoryType.Recent:
      return "/recent/filter";

    case CategoryType.Personal:
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

    case CategoryType.Groups:
      return GROUPS_ROUTE_WITH_FILTER;

    case CategoryType.Guests:
      return GUESTS_ROUTE_WITH_FILTER;

    case CategoryType.Settings:
      return "/settings/personal";

    default:
      throw new Error("Unknown category type");
  }
};

export const removeEmojiCharacters = (value) => {
  const regexpEmoji = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;
  const replaceEmojiCharacters = value.replaceAll(regexpEmoji, "");

  return replaceEmojiCharacters.replace(/\u200D/g, "");
};
