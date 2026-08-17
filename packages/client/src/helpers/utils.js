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

import { authStore, settingsStore } from "@docspace/shared/store";
import { toCommunityHostname } from "@docspace/shared/utils/common";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";

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

export const getCategoryTypeByFolderType = (folderType, parentId) => {
  switch (folderType) {
    case FolderType.Rooms:
    case FolderType.RoomTemplates:
      return parentId > 0 ? CategoryType.SharedRoom : CategoryType.Shared;

    case FolderType.AIAgents:
      return parentId > 0 ? CategoryType.AIAgent : CategoryType.AIAgents;

    case FolderType.Forms:
      return parentId > 0 ? CategoryType.Form : CategoryType.Forms;

    case FolderType.Archive:
      return CategoryType.Archive;

    case FolderType.Favorites:
      return CategoryType.Favorite;

    case FolderType.Recent:
      return CategoryType.Recent;

    case FolderType.TRASH:
      return CategoryType.Trash;

    case FolderType.SHARE:
      return CategoryType.SharedWithMe;

    default:
      return CategoryType.Personal;
  }
};

/**
 * Resolves the category a room/folder must open under, keeping the Forms
 * section intact.
 *
 * Form filling rooms live in the VirtualRooms tree, so the server reports
 * `rootFolderType = Rooms (14)` for the room and everything inside it --
 * `FolderType.Forms (36)` only ever appears on the bare Forms section root.
 * Deriving the URL from `rootFolderType` alone therefore yields
 * `/rooms/shared/...`, and both the sidebar and the breadcrumb (which resolve
 * the active section from the pathname) then highlight Rooms instead of Forms.
 *
 * `roomType` is the reliable signal: it identifies a form room even when the
 * user enters it from another section (e.g. Files -> "Form data collection" ->
 * "Share in the room"), where the `/forms` route prefix is not set yet. The
 * pathname is the fallback for folders *inside* a form room, which carry no
 * room type of their own.
 *
 * @param {import("@docspace/shared/enums").FolderType|null} [folderType]
 * @param {number|string|null} [parentId]
 * @param {{
 *   roomType?: import("@docspace/shared/enums").RoomsType,
 *   pathname?: string,
 * }} [options]
 */
export const getCategoryTypeByFolderTypeInSection = (
  folderType,
  parentId,
  { roomType, pathname = window.location.pathname } = {},
) => {
  const categoryType = getCategoryTypeByFolderType(folderType, parentId);

  if (categoryType !== CategoryType.SharedRoom) return categoryType;

  const isFormRoom = roomType === RoomsType.FormRoom;
  const isFormsRoute = pathname.startsWith("/forms");

  return isFormRoom || isFormsRoute ? CategoryType.Form : categoryType;
};

export const getCategoryUrl = (categoryType, folderId) => {
  const cType = categoryType;

  switch (cType) {
    case CategoryType.AIAgents:
      return "/ai-agents/filter";

    case CategoryType.AIAgent:
      return `/ai-agents/${folderId}/filter`;

    case CategoryType.Recent:
      return "/recent/filter";

    case CategoryType.Personal:
      return "/rooms/personal/filter";

    case CategoryType.Shared:
      return "/rooms/shared/filter";

    case CategoryType.Forms:
      return "/forms/filter";

    case CategoryType.Form:
      return `/forms/${folderId}/filter`;

    case CategoryType.SharedRoom:
      return `/rooms/shared/${folderId}/filter`;

    case CategoryType.Chat:
      return `/ai-agents/${folderId}/chat`;

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

    case CategoryType.SharedWithMe:
      return "/shared-with-me/filter";

    default:
      throw new Error("Unknown category type");
  }
};

export const getUrlByDefaultFolderType = (folderType) => {
  const categoryType = getCategoryTypeByFolderType(folderType);
  return getCategoryUrl(categoryType);
};

export const isNewProductView = () =>
  localStorage.getItem("useDocSpace") !== "old";

export const getNewViewUrlByFolderType = (folderType) => {
  switch (folderType) {
    case FolderType.SHARE:
      return "/ai-files?section=shared-with-me";
    case FolderType.Recent:
      return "/ai-files?section=recent";
    case FolderType.Favorites:
      return "/ai-files?section=favorites";
    case FolderType.TRASH:
      return "/ai-files?section=trash";
    case FolderType.USER:
      return "/ai-files";
    case FolderType.Rooms:
    case FolderType.RoomTemplates:
      return "/ai-rooms?section=rooms";
    case FolderType.Archive:
      return "/ai-rooms?section=archive";
    case FolderType.AIAgents:
      return "/agents";
    default:
      return "/ai-files";
  }
};
