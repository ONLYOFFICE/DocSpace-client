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

import api from "@docspace/shared/api";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { CategoryType, MEDIA_VIEW_URL } from "@docspace/shared/constants";
import config from "PACKAGE_FILE";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import type { default as FilesStore } from "../FilesStore";

const { FilesFilter } = api;

// getItemUrl reads only categoryType and the public-room store off `this`.
// Passed explicitly so URL building is a pure function of its args + deps; the
// FilesStore facade forwards live references, preserving MobX reactivity.
export type GetItemUrlDeps = {
  categoryType: FilesStore["categoryType"];
  publicRoomStore: FilesStore["publicRoomStore"];
};

export const getItemUrl = (
  id: number | string | undefined,
  isFolder: boolean | undefined,
  needConvert: boolean | undefined,
  canOpenPlayer: boolean | undefined,
  deps: GetItemUrlDeps,
  shareKey?: string,
  isAiRoom?: boolean,
) => {
  const proxyURL = window.ClientConfig?.proxy?.url || window.location.origin;

  const url = getCategoryUrl(
    isAiRoom ? CategoryType.Chat : deps.categoryType,
    id,
  );

  if (canOpenPlayer) {
    if (deps.publicRoomStore.isPublicRoom) {
      const key = deps.publicRoomStore.publicRoomKey;
      const filterObj = FilesFilter.getFilter(window.location);

      return `${combineUrl(
        proxyURL,
        config.homepage,
        "/rooms/share",
        MEDIA_VIEW_URL,
        id,
      )}?key=${key}&${filterObj.toUrlParams()}`;
    }

    return combineUrl(proxyURL, config.homepage, MEDIA_VIEW_URL, id);
  }

  if (isFolder) {
    const folderUrl = isFolder
      ? combineUrl(proxyURL, config.homepage, `${url}?folder=${id}`)
      : null;

    return folderUrl;
  }

  const newUrl = combineUrl(
    proxyURL,
    config.homepage,
    `/doceditor?fileId=${id}${needConvert ? "&action=view" : ""}${shareKey ? `&share=${shareKey}` : ""}`,
  );

  return newUrl;
};
