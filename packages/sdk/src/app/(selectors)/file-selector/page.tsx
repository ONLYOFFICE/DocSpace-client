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
import { configureFilterByFilterParam } from "@docspace/shared/selectors/Files/FilesSelector.utils";

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
    configureFilterByFilterParam(
      filter,
      baseConfig.filter,
      filesSettings?.extsWebEdited || [],
    );
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
