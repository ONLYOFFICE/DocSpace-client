// (c) Copyright Ascensio System SIA 2009-2026
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
