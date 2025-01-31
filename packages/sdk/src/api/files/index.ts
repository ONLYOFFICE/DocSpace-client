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
import { FolderType } from "@docspace/shared/enums";
import {
  filesSettingsHandler,
  folderHandler,
  foldersTreeHandler,
} from "@docspace/shared/__mocks__/e2e";

const IS_TEST = process.env.E2E_TEST;

export async function getFilesSettings(): Promise<TFilesSettings | undefined> {
  const [req] = createRequest([`/files/settings`], [["", ""]], "GET");

  const res = IS_TEST ? filesSettingsHandler() : await fetch(req);

  if (!res.ok) return;

  const filesSettings = await res.json();

  return filesSettings.response;
}

export async function getFoldersTree(): Promise<TFolder[]> {
  const [req] = createRequest(
    [`/files/@root?filterType=2&count=1`],
    [["", ""]],
    "GET",
  );

  const res = IS_TEST ? foldersTreeHandler() : await fetch(req);

  if (!res.ok) {
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
}

export async function getFolder(
  folderIdParam: string | number,
  filter: FilesFilter,
  signal?: AbortSignal,
  share?: string,
): Promise<TGetFolder> {
  let params = folderIdParam;
  let folderId = folderIdParam;

  if (folderId && typeof folderId === "string") {
    folderId = encodeURIComponent(folderId.replace(/\\\\/g, "\\"));
  }

  if (filter) {
    checkFilterInstance(filter, FilesFilter);

    params = `${folderId}?${filter.toApiUrlParams()}`;
  }

  const shareHeader: [string, string] = share
    ? ["Request-Token", share]
    : ["", ""];

  const [req] = createRequest(
    [`/files/${params}`],
    [shareHeader],
    "GET",
    undefined,
    undefined,
    [signal],
  );

  const res = IS_TEST ? folderHandler(headers()) : await fetch(req);

  if (!res.ok) {
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
}
