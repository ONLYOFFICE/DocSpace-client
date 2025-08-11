/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { headers } from "next/headers";

import { createRequest } from "@docspace/shared/utils/next-ssr-helper";
import {
  TFilesSettings,
  type TFolder,
  type TGetFolder,
} from "@docspace/shared/api/files/types";
import {
  checkFilterInstance,
  decodeDisplayName,
  getFolderClassNameByType,
  sortInDisplayOrder,
} from "@docspace/shared/utils/common";
import FilesFilter from "@docspace/shared/api/files/filter";
import { TValidateShareRoom } from "@docspace/shared/api/rooms/types";
import { FolderType } from "@docspace/shared/enums";
import { SHARE_KEY_HEADER } from "@/utils/constants";
import {
  filesSettingsHandler,
  folderHandler,
  foldersTreeHandler,
} from "@docspace/shared/__mocks__/e2e";
import { logger } from "@/../logger.mjs";

const IS_TEST = process.env.E2E_TEST;

export async function getFilesSettings(): Promise<TFilesSettings | undefined> {
  logger.debug("Start GET /files/settings");

  try {
    const [req] = await createRequest([`/files/settings`], [["", ""]], "GET");

    const res = IS_TEST ? filesSettingsHandler() : await fetch(req);

    if (!res.ok) {
      logger.error(`GET /files/settings failed: ${res.status}`);
      return;
    }

    const filesSettings = await res.json();

    return filesSettings.response;
  } catch (error) {
    logger.error(`Error in getFilesSettings: ${error}`);
  }
}

export async function getFoldersTree(): Promise<TFolder[]> {
  logger.debug("Start GET /files/@root?filterType=2&count=1");

  try {
    const [req] = await createRequest(
      [`/files/@root?filterType=2&count=1`],
      [["", ""]],
      "GET",
    );

    const res = IS_TEST
      ? foldersTreeHandler()
      : await fetch(req, { next: { revalidate: 300 } });

    if (!res.ok) {
      logger.error(
        `GET /files/@root?filterType=2&count=1 failed: ${res.status}`,
      );
      throw new Error("Failed to get folders tree");
    }

    const resJson = await res.json();
    const folders = resJson.response as TGetFolder[];

    const sortedFolders = sortInDisplayOrder(folders);

    return sortedFolders.map((data, index) => {
      const { new: newItems, pathParts, current } = data;

      const {
        parentId,
        title,
        id,
        rootFolderType,
        security,
        foldersCount,
        filesCount,
      } = current;

      const type = +rootFolderType;

      const name = getFolderClassNameByType(type);

      return {
        ...current,
        id,
        key: `0-${index}`,
        parentId,
        title,
        rootFolderType: type,
        folderClassName: name,
        folders: null,
        pathParts,
        foldersCount,
        filesCount,
        newItems,
        security,
        new: newItems,
      } as TFolder;
    });
  } catch (error) {
    logger.error(`Error in getFoldersTree: ${error}`);
    throw error;
  }
}

export async function getFolder(
  folderIdParam: string | number,
  filter: FilesFilter,
  signal?: AbortSignal,
  share?: string,
): Promise<TGetFolder> {
  logger.debug(`Start GET /files/params`);

  try {
    const hdrs = await headers();

    const shareKey = hdrs.get(SHARE_KEY_HEADER);

    let params = folderIdParam;
    let folderId = folderIdParam;

    if (folderId && typeof folderId === "string") {
      folderId = encodeURIComponent(folderId.replace(/\\\\/g, "\\"));
    }

    if (filter) {
      checkFilterInstance(filter, FilesFilter);

      params = `${folderId}?${filter.toApiUrlParams()}`;
    }

    const shareHeader: [string, string] =
      share || shareKey
        ? ["Request-Token", shareKey || shareKey || ""]
        : ["", ""];

    logger.debug(`Start GET /files/${params}`);

    const [req] = await createRequest(
      [`/files/${params}`],
      [shareHeader],
      "GET",
      undefined,
      undefined,
      [signal],
    );

    const res = IS_TEST
      ? folderHandler(await headers())
      : await fetch(req, { next: { revalidate: 300 } });

    if (!res.ok) {
      logger.error(`GET /files/${params} failed: ${res.status}`);
      throw new Error("Failed to get folder");
    }

    const resJson = await res.json();
    const folder = resJson.response as TGetFolder;

    folder.files = decodeDisplayName(folder.files);
    folder.folders = decodeDisplayName(folder.folders);

    folder.current.isArchive =
      !!folder.current.roomType &&
      folder.current.rootFolderType === FolderType.Archive;

    return folder;
  } catch (error) {
    logger.error(`Error in getFolder: ${error}`);
    throw error;
  }
}

export async function validateShareFolder(share: string) {
  logger.debug(`Start GET /files/share/${share}`);

  try {
    const shareHeader: [string, string] = share
      ? ["Request-Token", share]
      : ["", ""];

    const [req] = await createRequest(
      [`/files/share/${share}`],
      [shareHeader],
      "GET",
    );

    const res = await fetch(req, { next: { revalidate: 300 } });

    if (!res.ok) {
      logger.error(`GET /files/share/${share} failed: ${res.status}`);
      throw new Error("Failed to validate share folder");
    }

    const resJson = await res.json();
    const shareKey = resJson.response as TValidateShareRoom;

    return shareKey;
  } catch (error) {
    logger.error(`Error in validateShareFolder: ${error}`);
    throw error;
  }
}
