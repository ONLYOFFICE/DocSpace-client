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
import type {
  TFile,
  TFilesSettings,
  TFolder,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TGetRooms, TRoom } from "@docspace/shared/api/rooms/types";
import { getFilterParams } from "@docspace/ui-kit/selectors/Files/FilesSelector.utils";

import { getFilesSettings, getFolder, getFoldersTree } from "@/api/files";
import { getRooms } from "@/api/rooms";
import { getSettings } from "@/api/settings";
import { PAGE_COUNT } from "@/utils/constants";

import FilesSelectorClient from "./page.client";
import { logger } from "../../../../logger.mjs";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  logger.info("File-selector page");

  const baseConfig = Object.fromEntries(
    Object.entries(await searchParams).map(([k, v]) => {
      if (v === "true") return [k, true];
      if (v === "false") return [k, false];
      if (k === "filter") return [k, Number.isNaN(+v) ? v : +v];

      return [k, v];
    }),
  );

  const folderId = +(baseConfig.id ?? 0) || null;

  const [foldersTree, filesSettings, portalSettings] = await Promise.all([
    getFoldersTree(),
    getFilesSettings(),
    getSettings(),
  ]);

  const roomsID = foldersTree.find(
    (i) => i.rootFolderType === FolderType.Rooms,
  )?.id;

  const isRoomView = folderId === roomsID || !folderId;

  const filter = isRoomView
    ? { ...RoomsFilter.getDefault(), searchArea: RoomSearchArea.Active }
    : FilesFilter.getDefault();

  filter.page = 0;
  filter.pageCount = PAGE_COUNT;

  if (filter instanceof FilesFilter && baseConfig.filter) {
    const filterParams = getFilterParams(
      baseConfig.filter,
      filesSettings?.extsWebEdited || [],
    );
    if (filterParams.filterType !== undefined) filter.filterType = filterParams.filterType as typeof filter.filterType;
    if (filterParams.extension !== undefined) filter.extension = filterParams.extension;
    if (filterParams.applyFilterOption !== undefined) filter.applyFilterOption = filterParams.applyFilterOption as unknown as typeof filter.applyFilterOption;
  }

  const itemsList = isRoomView
    ? await getRooms(filter as RoomsFilter)
    : await getFolder(folderId!, filter as FilesFilter);

  const {
    folders = [],
    files = [],
    current,
    pathParts,
    total,
  } = itemsList as TGetFolder | TGetRooms;

  const roomsFolderId = (foldersTree as TFolder[]).find(
    (x) => x.rootFolderType === FolderType.Rooms,
  )?.id;

  const items = [...folders, ...files];

  const breadCrumbs = pathParts.map((part, index) => ({
    id: part.id,
    label: part.title,
    roomType: part?.roomType,
    isRoom: !folderId
      ? part.id === roomsID
      : Boolean(index === 0 && part?.roomType !== undefined) ||
        roomsFolderId === part.id,
  }));

  const { id: currentFolderId, rootFolderType } = current;

  const clientProps = {
    baseConfig,
    breadCrumbs,
    currentFolderId,
    filesSettings: filesSettings as TFilesSettings,
    foldersTree: foldersTree as TFolder[],
    hasNextPage: total > PAGE_COUNT,
    items: items as (TFile | TFolder)[] | TRoom[],
    roomsFolderId,
    rootFolderType,
    searchValue: "search" in filter ? filter.search : filter.filterValue,
    selectedItemId: current.id,
    selectedItemType: (isRoomView ? "rooms" : "files") as "files" | "rooms",
    total,
    logoText:
      portalSettings && typeof portalSettings !== "string"
        ? portalSettings.logoText
        : "",
    socketUrl:
      portalSettings && typeof portalSettings !== "string"
        ? portalSettings.socketUrl
        : "",
  };

  return <FilesSelectorClient {...clientProps} />;
}
