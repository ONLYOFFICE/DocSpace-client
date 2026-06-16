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

import { FolderType, RoomSearchArea } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { CategoryType } from "@docspace/shared/constants";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_DOCUMENTS,
  FILTER_RECENT,
  FILTER_SHARE,
  FILTER_FAVORITES,
  FILTER_TRASH,
} from "@docspace/shared/utils/filterConstants";

import { getCategoryUrl } from "./utils";

export type FolderRootType = (typeof FolderType)[keyof typeof FolderType];

export type TTreeFolder = {
  id: number;
  title: string;
  rootFolderType: FolderRootType;
  newItems?: number;
};

/** Tree-folder ids the sidebar needs for navigation and active-item matching. */
export type FolderIds = {
  roomsFolderId?: number | null;
  archiveFolderId?: number | null;
  myFolderId?: number | null;
  recentFolderId?: number | null;
  favoritesFolderId?: number | null;
  recycleBinFolderId?: number | null;
  sharedWithMeFolderId?: number | null;
  aiAgentsFolderId?: number | null;
};

/**
 * Build a full filter URL for a tree folder, mirroring the legacy
 * ArticleBodyContent.getLinkData so navigation lands on the correct folder
 * (with the `folder=<id>` query param) instead of the default personal view.
 *
 * My Documents sub-sections (Recent/Favorites/Trash) also carry `parentId` so
 * navigation stays scoped to My Documents, the same way the SDK embed does.
 */
export const buildFolderUrl = (
  folderId: number,
  rootFolderType: FolderRootType,
  userId?: string,
  myFolderId?: number | null,
): string => {
  const fileParams = (
    categoryType: (typeof CategoryType)[keyof typeof CategoryType],
    filterKey: string,
  ) => {
    const filter = FilesFilter.getDefault({ categoryType });
    filter.folder = String(folderId);
    if (userId) {
      const stored = getUserFilter(`${filterKey}=${userId}`);
      if (stored?.sortBy) filter.sortBy = stored.sortBy;
      if (stored?.sortOrder) filter.sortOrder = stored.sortOrder;
    }
    return filter.toUrlParams();
  };

  // withLocalStorage=false so the URL always carries searchArea (a stored
  // shared filter could otherwise drop it and load the wrong room list).
  const roomParams = (searchArea: RoomSearchArea) => {
    const filter = RoomsFilter.getDefault(userId, searchArea);
    filter.searchArea = searchArea;
    return filter.toUrlParams(userId, false);
  };

  const parentSuffix = myFolderId != null ? `&parentId=${myFolderId}` : "";

  let path = "";
  let params = "";

  switch (rootFolderType) {
    case FolderType.Recent:
      path = getCategoryUrl(CategoryType.Recent);
      params = fileParams(CategoryType.Recent, FILTER_RECENT) + parentSuffix;
      break;
    case FolderType.USER:
      path = getCategoryUrl(CategoryType.Personal);
      params = fileParams(CategoryType.Personal, FILTER_DOCUMENTS);
      break;
    case FolderType.SHARE:
      path = getCategoryUrl(CategoryType.SharedWithMe);
      params = fileParams(CategoryType.SharedWithMe, FILTER_SHARE);
      break;
    case FolderType.Favorites:
      path = getCategoryUrl(CategoryType.Favorite);
      params = fileParams(CategoryType.Favorite, FILTER_FAVORITES) + parentSuffix;
      break;
    case FolderType.TRASH:
      path = getCategoryUrl(CategoryType.Trash);
      params = fileParams(CategoryType.Trash, FILTER_TRASH) + parentSuffix;
      break;
    case FolderType.Archive:
      path = getCategoryUrl(CategoryType.Archive);
      params = roomParams(RoomSearchArea.Archive);
      break;
    case FolderType.AIAgents:
      path = getCategoryUrl(CategoryType.AIAgents);
      params = roomParams(RoomSearchArea.AIAgents);
      break;
    default:
      path = getCategoryUrl(CategoryType.Shared);
      params = roomParams(RoomSearchArea.Active);
      break;
  }

  if (params.at(-1) === "&") params = params.slice(0, -1);
  return `${path}?${params}`;
};

/**
 * Map the current location to the active NavMenu item id (a folder id).
 *
 * Templates share the `/rooms/shared` path with the Rooms list and are told
 * apart only by `searchArea=Templates` in the query string, so the active-id
 * check needs the search part too (defaults to the live `location.search`).
 */
export const getClientActiveId = (
  pathname: string,
  ids: FolderIds,
  search: string = typeof window !== "undefined" ? window.location.search : "",
): string | undefined => {
  const match = (folderId?: number | null) =>
    folderId != null ? String(folderId) : undefined;

  const isTemplates = new URLSearchParams(search).get("searchArea") ===
    RoomSearchArea.Templates;

  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/forms")) {
    if (pathname.includes("/recent")) return "forms-recent";
    if (pathname.includes("/favorite")) return "forms-favorites";
    if (pathname.includes("/trash")) return "forms-trash";
    return "forms";
  }
  if (pathname.includes("/ai-agents")) return match(ids.aiAgentsFolderId);
  if (pathname.includes("/rooms/recent")) return "rooms-recent";
  if (pathname.includes("/rooms/favorite")) return "rooms-favorites";
  if (pathname.includes("/recent")) return match(ids.recentFolderId);
  if (pathname.includes("/rooms/templates")) return "rooms-templates";
  if (pathname.includes("/rooms/shared") && isTemplates) return "rooms-templates";
  if (pathname.includes("/rooms/shared")) return match(ids.roomsFolderId);
  if (pathname.includes("/rooms/archived")) return match(ids.archiveFolderId);
  if (pathname.includes("/rooms/personal")) return match(ids.myFolderId);
  if (pathname.includes("/files/trash")) return match(ids.recycleBinFolderId);
  if (pathname.includes("/files/favorite")) return match(ids.favoritesFolderId);
  if (pathname.includes("/shared-with-me"))
    return match(ids.sharedWithMeFolderId);
  return undefined;
};
