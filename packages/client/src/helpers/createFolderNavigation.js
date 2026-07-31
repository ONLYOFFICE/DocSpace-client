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

import FilesFilter from "@docspace/shared/api/files/filter";

import { RoomsType, SearchArea } from "@docspace/shared/enums";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_ARCHIVE_DOCUMENTS,
  FILTER_ROOM_DOCUMENTS,
} from "@docspace/shared/utils/filterConstants";

import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl, getCategoryTypeByFolderType } from "./utils";

export const createFolderNavigation = async (
  item,
  categoryType,
  userId,
  roomType,
  currentTitle,
) => {
  if (!item) return { url: "", state: {} };

  const {
    isRoom,
    rootFolderType,
    id,
    roomType: itemRoomType,
    title,
    shared,
    external,
    navigationPath,
    lifetime,
    security,
  } = item;

  const isAiRoom = itemRoomType === RoomsType.AIRoom;

  const aiAgentStartCategory = security.UseChat
    ? CategoryType.Chat
    : CategoryType.AIAgent;

  const isFormsContext = window.location.pathname.startsWith("/forms");
  const baseCategory = getCategoryTypeByFolderType(rootFolderType, id);

  let path;
  if (isAiRoom) {
    path = getCategoryUrl(aiAgentStartCategory, id);
  } else if (isFormsContext && baseCategory === CategoryType.SharedRoom) {
    path = getCategoryUrl(CategoryType.Form, id);
  } else {
    path = getCategoryUrl(baseCategory, id);
  }
  const filter = FilesFilter.getDefault();
  const filterObj = FilesFilter.getFilter(window.location);

  if (isAiRoom) {
    if (!security.UseChat) filter.searchArea = SearchArea.ResultStorage;
  } else if (isRoom) {
    if (userId) {
      const key =
        categoryType === CategoryType.Archive
          ? `${FILTER_ARCHIVE_DOCUMENTS}=${userId}`
          : `${FILTER_ROOM_DOCUMENTS}=${userId}`;

      const filterObject = getUserFilter(key);

      if (filterObject?.sortBy) filter.sortBy = filterObject.sortBy;
      if (filterObject?.sortOrder) filter.sortOrder = filterObject.sortOrder;
    }
  } else if (filterObj) {
    // For the document section at all levels there is one sorting
    filter.sortBy = filterObj.sortBy;
    filter.sortOrder = filterObj.sortOrder;
  }

  filter.folder = id;

  const isShared = shared || navigationPath?.findIndex((r) => r.shared) > -1;

  const isExternal =
    external || navigationPath?.findIndex((r) => r.external) > -1;

  const state = {
    title,
    isRoot: false,
    rootFolderType,
    isRoom,
    rootRoomTitle: roomType ? currentTitle : "",
    isPublicRoomType: itemRoomType === RoomsType.PublicRoom || false,
    isAiRoomType: isAiRoom,
    isShared,
    isExternal,
    canCreate: security?.canCreate,
    isLifetimeEnabled: itemRoomType === RoomsType.VirtualDataRoom && !!lifetime,
  };
  const url = `${path}?${filter.toUrlParams()}`;

  return { url, state };
};
